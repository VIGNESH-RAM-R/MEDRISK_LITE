import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { AuditLogEntry, ComplianceClause, FailureMode, WorkspaceInfo } from "./api";
import { buildManualContent, type ManualBlock, type ManualSection } from "./manualContent";
import { PDF_STRINGS, type Lang } from "./pdfStrings";
import { registerPdfFont } from "./pdfFonts";
import { buildReportContent, type ReportContent } from "./reportContent";

// Real, on-device PDF generation for the web build (expo-print's web target
// is just a `window.print()` stub — it can't render arbitrary HTML to a
// file — so the report/manual PDFs are built directly with jsPDF here,
// mirroring the reference app's own jsPDF-based generator).
//
// Phase 3 (multi-language): both builders below accept a `lang` and render
// entirely in that language — headers, section titles and labels via
// PDF_STRINGS/manualContent, component names and classification/status
// labels via the app's own i18n instance. For Hindi/Tamil, registerPdfFont()
// embeds a real Unicode font (see pdfFonts.ts for the one known rendering
// caveat: jsPDF has no OpenType shaping engine).

// Report document palette — deep teal accent (matches the app's rebrand;
// see theme.ts's `accentText`/dark `accent`) plus print-legible, darkened
// variants of the app's own Acceptable/ALARP/Unacceptable badge hues (the
// app's actual badge colors are pastel and would give weak contrast as
// solid table-cell text at print size).
const INK = [22, 27, 40] as const;
const SUB = [107, 114, 128] as const;
const BODY = [51, 58, 74] as const;
const RPT_ACCENT = [31, 107, 109] as const;
const LINE = [225, 229, 224] as const;
const ROW_ALT = [246, 249, 246] as const;
const BAND: Record<"Acceptable" | "ALARP" | "Unacceptable", { fill: readonly [number, number, number]; text: readonly [number, number, number] }> = {
  Acceptable: { fill: [220, 247, 235], text: [21, 128, 61] },
  ALARP: { fill: [254, 243, 220], text: [180, 83, 9] },
  Unacceptable: { fill: [253, 226, 226], text: [190, 18, 60] },
};

function headingBar(doc: jsPDF, margin: number, y: number, w: number, text: string, font: string) {
  doc.setFillColor(...RPT_ACCENT);
  doc.rect(margin, y - 14, 3, 20, "F");
  doc.setFont(font, "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text(text, margin + 12, y);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.75);
  doc.line(margin, y + 8, margin + w, y + 8);
}

function subheading(doc: jsPDF, margin: number, y: number, text: string, font: string) {
  doc.setFont(font, "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...RPT_ACCENT);
  doc.text(text, margin, y);
}

function bodyParagraph(doc: jsPDF, margin: number, y: number, w: number, text: string, font: string): number {
  doc.setFont(font, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BODY);
  const lines = doc.splitTextToSize(text, w) as string[];
  doc.text(lines, margin, y);
  return y + lines.length * 13.5;
}

// Applies the running header (device name + report title, small text) and
// "Page X of Y" footer to every page after the cover. Called once at the
// very end, after all pages/orientations exist, since jsPDF's per-page
// width/height must be read after doc.setPage(i) for mixed orientations.
function applyHeaderFooter(doc: jsPDF, font: string, content: ReportContent) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFont(font, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...SUB);
    doc.text(`${content.deviceName} — ${content.S.runningHeader}`, 32, 20);
    doc.setFont(font, "normal");
    doc.text(content.reportId, w - 32, 20, { align: "right" });
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(32, 27, w - 32, 27);

    doc.setFontSize(8);
    doc.setTextColor(...SUB);
    doc.text(content.S.pageOf(i, pageCount), w / 2, h - 20, { align: "center" });
  }
}

export function buildReportPdf({
  workspace,
  failureModes,
  compliance,
  auditLog,
  lang = "en",
}: {
  workspace: WorkspaceInfo;
  failureModes: FailureMode[];
  compliance: ComplianceClause[];
  auditLog: AuditLogEntry[];
  lang?: Lang;
}): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const font = registerPdfFont(doc, lang);
  const S = PDF_STRINGS[lang];
  const content = buildReportContent({ workspace, failureModes, compliance, auditLog, lang });
  const margin = 48;

  // ---- Page 1: Cover -------------------------------------------------
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...RPT_ACCENT);
  doc.rect(0, 0, pageW, 130, "F");
  doc.setFont(font, "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("MedRisk Lite", margin, 70);
  doc.setFont(font, "normal");
  doc.setFontSize(11);
  doc.text(S.footerReport.split("·")[0].replace(/^MedRisk Lite\s*—\s*/, ""), margin, 92);

  doc.setFont(font, "bold");
  doc.setFontSize(26);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(S.reportTitle.replace(/^MedRisk Lite\s*—\s*/, ""), pageW - margin * 2) as string[];
  doc.text(titleLines, margin, 190);

  doc.setFont(font, "normal");
  doc.setFontSize(12.5);
  doc.setTextColor(...SUB);
  doc.text(S.reportSubtitle, margin, 190 + titleLines.length * 26 + 14);

  const metaY = 190 + titleLines.length * 26 + 56;
  const metaRows: [string, string][] = [
    [S.coverDeviceLabel, content.deviceName],
    [S.coverOrgLabel, content.orgName],
    [S.coverVersionLabel, S.coverVersion],
    [S.reportIdLabel, content.reportId],
    [
      S.generatedLabel,
      content.generatedDate.toLocaleDateString(lang === "en" ? undefined : lang, { year: "numeric", month: "long", day: "numeric" }),
    ],
  ];
  let my = metaY;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.75);
  doc.line(margin, my - 20, pageW - margin, my - 20);
  metaRows.forEach(([label, value]) => {
    doc.setFont(font, "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...SUB);
    doc.text(label.toUpperCase(), margin, my);
    doc.setFont(font, "normal");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(value, margin + 170, my);
    my += 24;
  });
  doc.line(margin, my - 4, pageW - margin, my - 4);

  doc.setFont(font, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SUB);
  doc.text(S.footerReport, pageW / 2, pageH - 40, { align: "center", maxWidth: pageW - margin * 2 });

  // ---- Page 2: Executive Summary --------------------------------------
  doc.addPage("a4", "portrait");
  let y = 70;
  const maxW = pageW - margin * 2;
  headingBar(doc, margin, y, maxW, S.execSummaryTitle, font);
  y += 34;

  const stats: [string, string][] = [
    [String(content.stats.count), S.statFailureModes],
    [String(content.stats.avgRpn), S.statAvgRpn],
    [content.stats.top ? String(content.stats.top.rpn) : "—", S.statHighestRpn],
    [`${content.stats.compScore}%`, S.statCompliance],
  ];
  const statW = maxW / 4;
  stats.forEach(([value, label], i) => {
    const x = margin + i * statW;
    doc.setFont(font, "bold");
    doc.setFontSize(20);
    doc.setTextColor(...RPT_ACCENT);
    doc.text(value, x, y);
    doc.setFont(font, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...SUB);
    doc.text(doc.splitTextToSize(label, statW - 10) as string[], x, y + 14);
  });
  y += 56;

  y = bodyParagraph(doc, margin, y, maxW, content.execSummary, font) + 16;

  // Posture callout box
  doc.setFont(font, "normal");
  doc.setFontSize(10);
  const postureLines = doc.splitTextToSize(content.postureText, maxW - 32) as string[];
  const boxH = postureLines.length * 14 + 24;
  const isAttention = content.postureText === S.execSummaryPostureAttention;
  const band = isAttention ? BAND.Unacceptable : BAND.Acceptable;
  doc.setFillColor(...band.fill);
  doc.roundedRect(margin, y, maxW, boxH, 6, 6, "F");
  doc.setTextColor(...band.text);
  doc.setFont(font, "bold");
  doc.text(postureLines, margin + 16, y + 20);

  // ---- Page 3: Device & Scope ------------------------------------------
  doc.addPage("a4", "portrait");
  y = 70;
  headingBar(doc, margin, y, maxW, S.deviceScopeTitle, font);
  y += 34;
  y = bodyParagraph(doc, margin, y, maxW, S.deviceScopeIntro, font) + 22;

  subheading(doc, margin, y, S.componentsListTitle, font);
  y += 18;
  const colW = maxW / 2 - 10;
  content.components.forEach((c, i) => {
    const col = i % 2;
    const x = margin + col * (colW + 20);
    if (col === 0 && i > 0) y += 0; // row advance handled below
    doc.setFont(font, "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(`${i + 1}. ${c.name}`, x, y);
    doc.setFont(font, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...SUB);
    const descLines = doc.splitTextToSize(c.desc, colW) as string[];
    doc.text(descLines, x, y + 12);
    if (col === 1) y += Math.max(24, descLines.length * 11 + 14);
  });
  if (content.components.length % 2 === 1) y += 24;
  y += 12;

  subheading(doc, margin, y, S.standardsListTitle, font);
  y += 16;
  y = bodyParagraph(doc, margin, y, maxW, S.standardsIntro, font) + 6;
  S.standardsList.forEach((s) => {
    doc.setFont(font, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...RPT_ACCENT);
    doc.text("•", margin, y);
    doc.setTextColor(...BODY);
    const lines = doc.splitTextToSize(s, maxW - 16) as string[];
    doc.text(lines, margin + 14, y);
    y += lines.length * 13 + 4;
  });

  // ---- Full FMEA Table (landscape, own page(s)) -------------------------
  doc.addPage("a4", "landscape");
  const lw = doc.internal.pageSize.getWidth();
  const lMargin = 32;
  doc.setFont(font, "bold");
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  doc.text(S.fullTableTitle, lMargin, 48);

  autoTable(doc, {
    rowPageBreak: "avoid",
    startY: 60,
    margin: { left: lMargin, right: lMargin, top: 34, bottom: 34 },
    styles: { fontSize: 7.5, cellPadding: 4, overflow: "linebreak", font, fontStyle: "normal", lineColor: LINE as unknown as [number, number, number], lineWidth: 0.5 },
    headStyles: { fillColor: RPT_ACCENT as unknown as [number, number, number], textColor: 255, font, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: ROW_ALT as unknown as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 78 },
      2: { cellWidth: 118 },
      3: { cellWidth: 108 },
      4: { cellWidth: 102 },
      5: { cellWidth: 16, halign: "center" },
      6: { cellWidth: 16, halign: "center" },
      7: { cellWidth: 16, halign: "center" },
      8: { cellWidth: 30, halign: "center" },
      9: { cellWidth: 86, halign: "center" },
      10: { cellWidth: 122 },
    },
    head: [[
      S.colIndex, S.colComponent, S.colFailureMode, S.colEffect, S.colCause,
      S.colS, S.colO, S.colD, S.colRpn, S.colClassification, "Mitigation",
    ]],
    body: content.tableRows.map((r) => [
      String(r.index), r.component, r.mode, r.effect, r.cause,
      String(r.s), String(r.o), String(r.d), String(r.rpn), r.classificationLabel, r.mitigation,
    ]),
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 9) {
        const row = content.tableRows[data.row.index];
        const b = BAND[row.classification];
        data.cell.styles.fillColor = b.fill as unknown as [number, number, number];
        data.cell.styles.textColor = b.text as unknown as [number, number, number];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 8) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // ---- Risk Distribution Summary (portrait) -----------------------------
  doc.addPage("a4", "portrait");
  y = 70;
  headingBar(doc, margin, y, maxW, S.riskDistributionTitle, font);
  y += 34;
  y = bodyParagraph(doc, margin, y, maxW, S.riskDistributionIntro, font) + 20;

  // Simple horizontal bar visualization
  const barMaxW = maxW - 160;
  const maxCount = Math.max(1, ...content.distribution.map((d) => d.count));
  content.distribution.forEach((d) => {
    const b = BAND[d.key];
    doc.setFont(font, "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(d.label, margin, y + 10);
    const barW = Math.max(3, (d.count / maxCount) * barMaxW);
    doc.setFillColor(...b.text);
    doc.roundedRect(margin + 130, y, barW, 16, 3, 3, "F");
    doc.setFont(font, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...SUB);
    doc.text(`${d.count} (${d.pct}%)`, margin + 130 + barW + 8, y + 12);
    y += 30;
  });
  y += 14;

  autoTable(doc, {
    rowPageBreak: "avoid",
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9.5, cellPadding: 6, font, fontStyle: "normal" },
    headStyles: { fillColor: RPT_ACCENT as unknown as [number, number, number], textColor: 255, font, fontStyle: "bold" },
    alternateRowStyles: { fillColor: ROW_ALT as unknown as [number, number, number] },
    columnStyles: { 0: { cellWidth: maxW * 0.5 }, 1: { cellWidth: maxW * 0.25, halign: "center" }, 2: { cellWidth: maxW * 0.25, halign: "center" } },
    head: [[S.colBand, S.colCount, S.colShare]],
    body: content.distribution.map((d) => [d.label, String(d.count), `${d.pct}%`]),
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const key = content.distribution[data.row.index].key;
        const b = BAND[key];
        data.cell.styles.fillColor = b.fill as unknown as [number, number, number];
        data.cell.styles.textColor = b.text as unknown as [number, number, number];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // ---- Compliance Status --------------------------------------------------
  doc.addPage("a4", "portrait");
  y = 70;
  headingBar(doc, margin, y, maxW, S.complianceSummaryTitle, font);
  y += 34;

  autoTable(doc, {
    rowPageBreak: "avoid",
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak", font, fontStyle: "normal" },
    headStyles: { fillColor: RPT_ACCENT as unknown as [number, number, number], textColor: 255, font, fontStyle: "bold" },
    alternateRowStyles: { fillColor: ROW_ALT as unknown as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: maxW - 70 - 90 - 110 },
      2: { cellWidth: 90, halign: "center" },
      3: { cellWidth: 110 },
    },
    head: [[S.colClause, S.colTitle, S.colStatus, "Evidence"]],
    body: content.complianceRows.map((c) => [
      c.clause,
      c.title,
      c.statusLabel,
      c.evidenceCount ? c.evidenceNames.join(", ") : "—",
    ]),
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        const row = content.complianceRows[data.row.index];
        const key = row.status === "complete" ? "Acceptable" : row.status === "partial" ? "ALARP" : "Unacceptable";
        const b = BAND[key as keyof typeof BAND];
        data.cell.styles.fillColor = b.fill as unknown as [number, number, number];
        data.cell.styles.textColor = b.text as unknown as [number, number, number];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // ---- Audit Trail Summary --------------------------------------------------
  // @ts-expect-error lastAutoTable is attached by the autotable plugin at runtime
  y = (doc.lastAutoTable?.finalY ?? y) + 40;
  if (y > pageH - 160) {
    doc.addPage("a4", "portrait");
    y = 70;
  }
  headingBar(doc, margin, y, maxW, S.auditTrailTitle, font);
  y += 34;
  y = bodyParagraph(doc, margin, y, maxW, S.auditTrailIntro, font) + 12;

  if (content.auditRows.length) {
    autoTable(doc, {
      rowPageBreak: "avoid",
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8.5, cellPadding: 5, overflow: "linebreak", font, fontStyle: "normal" },
      headStyles: { fillColor: RPT_ACCENT as unknown as [number, number, number], textColor: 255, font, fontStyle: "bold" },
      alternateRowStyles: { fillColor: ROW_ALT as unknown as [number, number, number] },
      columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: maxW - 110 - 110 }, 2: { cellWidth: 110 } },
      head: [[S.colWhen, S.colActivity, S.colUser]],
      body: content.auditRows.map((a) => [a.when, a.text, a.user]),
    });
    // @ts-expect-error lastAutoTable is attached by the autotable plugin at runtime
    y = (doc.lastAutoTable?.finalY ?? y) + 40;
  } else {
    doc.setFont(font, "normal");
    doc.setFontSize(10);
    doc.setTextColor(...SUB);
    doc.text(S.auditTrailEmpty, margin, y);
    y += 40;
  }

  // ---- Sign-off ---------------------------------------------------------
  if (y > pageH - 160) {
    doc.addPage("a4", "portrait");
    y = 70;
  }
  headingBar(doc, margin, y, maxW, S.signOffTitle, font);
  y += 44;
  [S.signOffReviewerLine, S.signOffApproverLine].forEach((line) => {
    doc.setFont(font, "normal");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(line, margin, y);
    y += 44;
  });

  applyHeaderFooter(doc, font, content);
  return doc;
}

// The manual/Quickstart Guide's Cursor below reuses the same INK/SUB/BODY/
// LINE constants and RPT_ACCENT (as its bullet/term-strip accent) declared
// above for buildReportPdf, so both PDFs share one palette.
const ACCENT = RPT_ACCENT;

// A small paginating cursor so the (now much longer) manual can flow across
// as many pages as it needs, breaking cleanly between blocks rather than
// mid-line. Every write* method checks remaining space first and calls
// doc.addPage() when a block wouldn't fit.
class Cursor {
  doc: jsPDF;
  margin: number;
  maxW: number;
  pageH: number;
  y: number;
  page = 1;
  font: string;
  strings: (typeof PDF_STRINGS)["en"];

  constructor(doc: jsPDF, margin: number, font: string, strings: (typeof PDF_STRINGS)["en"]) {
    this.doc = doc;
    this.margin = margin;
    this.maxW = doc.internal.pageSize.getWidth() - margin * 2;
    this.pageH = doc.internal.pageSize.getHeight();
    this.y = margin + 10;
    this.font = font;
    this.strings = strings;
  }

  ensure(height: number) {
    if (this.y + height > this.pageH - this.margin - 16) {
      this.doc.addPage();
      this.page += 1;
      this.y = this.margin + 10;
    }
  }

  sectionTitle(text: string) {
    this.ensure(30);
    this.doc.setDrawColor(...LINE);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, this.y - 6, this.margin + this.maxW, this.y - 6);
    this.doc.setFont(this.font, "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(...INK);
    this.doc.text(text, this.margin, this.y + 10);
    this.y += 24;
  }

  purpose(text: string) {
    this.doc.setFont(this.font, "italic");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...SUB);
    const lines = this.doc.splitTextToSize(text, this.maxW) as string[];
    this.ensure(lines.length * 12.5 + 6);
    this.doc.text(lines, this.margin, this.y);
    this.y += lines.length * 12.5 + 10;
  }

  paragraph(text: string) {
    this.doc.setFont(this.font, "normal");
    this.doc.setFontSize(10);
    this.doc.setTextColor(...BODY);
    const lines = this.doc.splitTextToSize(text, this.maxW) as string[];
    this.ensure(lines.length * 13 + 4);
    this.doc.text(lines, this.margin, this.y);
    this.y += lines.length * 13 + 8;
  }

  bullets(items: string[], numbered?: boolean) {
    const markerW = numbered ? 16 : 12;
    items.forEach((item, i) => {
      this.doc.setFont(this.font, "normal");
      this.doc.setFontSize(10);
      const lines = this.doc.splitTextToSize(item, this.maxW - markerW) as string[];
      const h = lines.length * 13;
      this.ensure(h + 2);
      this.doc.setFont(this.font, "bold");
      this.doc.setTextColor(...ACCENT);
      this.doc.text(numbered ? `${i + 1}.` : "•", this.margin, this.y);
      this.doc.setFont(this.font, "normal");
      this.doc.setTextColor(...BODY);
      this.doc.text(lines, this.margin + markerW, this.y);
      this.y += h + 5;
    });
    this.y += 4;
  }

  term(term: string, definition: string) {
    const text = `${term} — ${definition}`;
    this.doc.setFont(this.font, "normal");
    this.doc.setFontSize(9.5);
    const pad = 8;
    const lines = this.doc.splitTextToSize(text, this.maxW - pad * 2 - 6) as string[];
    const boxH = lines.length * 12 + pad * 2;
    this.ensure(boxH + 8);
    this.doc.setFillColor(246, 247, 251);
    this.doc.roundedRect(this.margin, this.y, this.maxW, boxH, 4, 4, "F");
    this.doc.setFillColor(...ACCENT);
    this.doc.rect(this.margin, this.y, 3, boxH, "F");
    this.doc.setTextColor(...BODY);
    this.doc.text(lines, this.margin + pad + 6, this.y + pad + 8);
    this.y += boxH + 10;
  }

  figure(caption: string) {
    const h = 60;
    this.ensure(h + 8);
    this.doc.setDrawColor(199, 203, 214);
    this.doc.setLineWidth(1);
    this.doc.setLineDashPattern([3, 2], 0);
    this.doc.roundedRect(this.margin, this.y, this.maxW, h, 6, 6);
    this.doc.setLineDashPattern([], 0);
    this.doc.setFont(this.font, "bold");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...SUB);
    this.doc.text(this.strings.figurePlaceholder.toUpperCase(), this.margin + this.maxW / 2, this.y + h / 2 - 4, { align: "center" });
    this.doc.setFont(this.font, "normal");
    this.doc.setFontSize(9);
    this.doc.text(this.strings.figureCaption(caption), this.margin + this.maxW / 2, this.y + h / 2 + 12, { align: "center" });
    this.y += h + 12;
  }

  blocks(blocks: ManualBlock[]) {
    for (const b of blocks) {
      if (b.type === "paragraph") this.paragraph(b.text);
      else if (b.type === "bullets") this.bullets(b.items, b.numbered);
      else if (b.type === "term") this.term(b.term, b.definition);
      else if (b.type === "figure") this.figure(b.caption);
    }
  }

  section(s: ManualSection) {
    this.sectionTitle(s.title);
    this.purpose(s.purpose);
    this.blocks(s.blocks);
  }
}

export function buildManualPdf({
  workspace,
  compliance,
  lang = "en",
}: {
  workspace: WorkspaceInfo;
  compliance: ComplianceClause[];
  lang?: Lang;
}): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const font = registerPdfFont(doc, lang);
  const S = PDF_STRINGS[lang];
  const margin = 48;
  const content = buildManualContent(lang, { components: workspace.components, compliance });

  doc.setFont(font, "bold");
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(S.manualTitle, margin, 56);
  doc.setFont(font, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...SUB);
  doc.text(S.manualSubtitle, margin, 74);
  doc.text(`${S.manualGenerated} ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`, margin, 88);

  const cursor = new Cursor(doc, margin, font, S);
  cursor.y = 112;

  cursor.sectionTitle(S.manualWhatItDoes);
  cursor.paragraph(content.intro);

  cursor.sectionTitle(content.gettingStarted.title);
  cursor.purpose(content.gettingStarted.purpose);
  cursor.blocks(content.gettingStarted.blocks);

  content.sections.forEach((s) => cursor.section(s));

  cursor.sectionTitle(S.manualTypicalWorkflow);
  cursor.paragraph(S.manualWorkflowIntro);
  cursor.bullets(content.workflow, true);

  cursor.sectionTitle(S.manualFaqTitle);
  content.faq.forEach((f) => {
    cursor.doc.setFont(font, "bold");
    cursor.doc.setFontSize(10);
    const qLines = cursor.doc.splitTextToSize(f.q, cursor.maxW) as string[];
    cursor.doc.setFont(font, "normal");
    cursor.doc.setFontSize(9.5);
    const aLines = cursor.doc.splitTextToSize(f.a, cursor.maxW) as string[];
    const totalH = qLines.length * 13 + aLines.length * 12 + 10;
    cursor.ensure(totalH);
    cursor.doc.setFont(font, "bold");
    cursor.doc.setFontSize(10);
    cursor.doc.setTextColor(...INK);
    cursor.doc.text(qLines, cursor.margin, cursor.y);
    cursor.y += qLines.length * 13 + 2;
    cursor.doc.setFont(font, "normal");
    cursor.doc.setFontSize(9.5);
    cursor.doc.setTextColor(...SUB);
    cursor.doc.text(aLines, cursor.margin, cursor.y);
    cursor.y += aLines.length * 12 + 12;
  });

  cursor.doc.setFont(font, "bold");
  cursor.doc.setFontSize(9);
  cursor.doc.setTextColor(...INK);
  cursor.ensure(20);
  cursor.doc.text(`${S.manualSupportTitle}: vigneshramprabha2006@gmail.com`, cursor.margin, cursor.y + 10);

  // Footer page numbers on every page.
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont(font, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SUB);
    doc.text(
      `${S.manualFooter} · ${i}/${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 24,
      { align: "center" }
    );
  }

  return doc;
}
