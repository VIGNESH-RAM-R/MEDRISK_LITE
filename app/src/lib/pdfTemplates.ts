import type { AuditLogEntry, ComplianceClause, FailureMode, WorkspaceInfo } from "./api";
import { buildManualContent, type ManualBlock, type ManualSection } from "./manualContent";
import { PDF_STRINGS, type Lang } from "./pdfStrings";
import { buildReportContent, type ReportContent } from "./reportContent";

// Same print-legible, darkened Acceptable/ALARP/Unacceptable palette as the
// jsPDF path (pdfBuilders.ts's BAND constant) — kept in sync by hand since
// one is jsPDF RGB tuples and the other is CSS hex, but the values match.
const RPT_ACCENT = "#1F6B6D";
const BAND: Record<"Acceptable" | "ALARP" | "Unacceptable", { fill: string; text: string }> = {
  Acceptable: { fill: "#DCF7EB", text: "#15803D" },
  ALARP: { fill: "#FEF3DC", text: "#B45309" },
  Unacceptable: { fill: "#FDE2E2", text: "#BE123C" },
};
const BAND_COLOR: Record<string, string> = {
  Acceptable: BAND.Acceptable.text,
  ALARP: BAND.ALARP.text,
  Unacceptable: BAND.Unacceptable.text,
};

// CSS for the FMEA Report specifically (cover, running section header,
// tables with alternating rows + classification bands, sign-off). Page
// breaks use `page-break-before` on each major section wrapper, and table
// rows use `page-break-inside: avoid` so a row is never split across pages
// — both are long-supported, reliable print-CSS features (unlike CSS Paged
// Media margin-box content, which has patchy support in the WebView-based
// renderer expo-print uses on native, so this file deliberately avoids it).
const REPORT_STYLE = `
  <style>
    .report-page { page-break-before: always; }
    .report-cover { page-break-before: avoid; }
    .cover-band { background: ${RPT_ACCENT}; color: #fff; margin: -32px -32px 28px; padding: 40px 32px 28px; }
    .cover-band .brand { font-size: 20px; font-weight: 800; margin: 0 0 4px; }
    .cover-band .kicker { font-size: 11.5px; opacity: 0.9; }
    .cover-title { font-size: 25px; font-weight: 800; margin: 4px 0 6px; line-height: 1.25; }
    .cover-sub { font-size: 13px; color: #6b7280; margin-bottom: 22px; }
    .cover-meta { border-top: 1px solid #e1e8dc; border-bottom: 1px solid #e1e8dc; padding: 14px 0; }
    .cover-meta-row { display: flex; padding: 5px 0; font-size: 12px; }
    .cover-meta-row .k { width: 190px; color: #6b7280; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; font-size: 9.5px; }
    .cover-meta-row .v { color: #161b28; font-size: 12.5px; }
    .report-header { display: flex; justify-content: space-between; border-bottom: 1px solid #e1e8dc; padding-bottom: 6px; margin-bottom: 18px; font-size: 8.5px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; }
    h2.section-h { font-size: 17px; margin: 0 0 14px; padding-left: 12px; border-left: 4px solid ${RPT_ACCENT}; border-top: none; padding-top: 2px; }
    h3.sub-h { font-size: 12.5px; color: ${RPT_ACCENT}; margin: 18px 0 8px; }
    .stat-row .v { color: ${RPT_ACCENT}; }
    .posture-box { border-radius: 8px; padding: 14px 18px; font-size: 11.5px; font-weight: 700; margin-top: 14px; }
    .components-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin: 6px 0 4px; }
    .component-item .name { font-size: 10.5px; font-weight: 700; }
    .component-item .desc { font-size: 9.5px; color: #6b7280; margin-top: 1px; }
    .standards-list { list-style: none; padding: 0; margin: 6px 0; }
    .standards-list li { font-size: 11px; padding: 4px 0 4px 16px; position: relative; }
    .standards-list li::before { content: "•"; position: absolute; left: 0; color: ${RPT_ACCENT}; font-weight: 800; }
    table.report-table tr { page-break-inside: avoid; }
    table.report-table tbody tr:nth-child(even) { background: #F6F9F6; }
    table.report-table th { background: ${RPT_ACCENT}; color: #fff; }
    .class-badge { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 9px; font-weight: 800; }
    .dist-bars { margin: 10px 0 20px; }
    .dist-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 10.5px; }
    .dist-bar-label { width: 110px; font-weight: 700; }
    .dist-bar-track { flex: 1; background: #eef3ec; border-radius: 4px; height: 14px; overflow: hidden; }
    .dist-bar-fill { height: 100%; border-radius: 4px; }
    .dist-bar-count { width: 90px; color: #6b7280; text-align: right; }
    .sign-line { font-size: 12px; margin: 26px 0; }
    .sign-line .blank { display: inline-block; border-bottom: 1px solid #161b28; min-width: 220px; margin: 0 6px; }
  </style>
`;

const BASE_STYLE = `
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #161b28; margin: 0; padding: 32px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 24px 0 8px; padding-top: 12px; border-top: 2px solid #161b28; }
    .sub { color: #6b7280; font-size: 12px; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 6px; }
    th { text-align: left; background: #f2f4f9; padding: 6px 8px; border-bottom: 2px solid #dcdfe6; }
    td { padding: 6px 8px; border-bottom: 1px solid #ecedf3; vertical-align: top; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9.5px; font-weight: 700; color: #fff; }
    .cover { text-align: center; padding: 60px 0 40px; }
    .cover .tile { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg,#22d3ee,#8b5cf6); margin: 0 auto 16px; }
    .meta { display: flex; gap: 24px; justify-content: center; font-size: 11px; color: #6b7280; margin-top: 10px; }
    .stat-row { display: flex; gap: 16px; margin: 16px 0 24px; }
    .stat { flex: 1; border: 1px solid #ecedf3; border-radius: 10px; padding: 10px 14px; }
    .stat .v { font-size: 20px; font-weight: 800; }
    .stat .l { font-size: 10.5px; color: #6b7280; }
    ul { margin: 4px 0; padding-left: 18px; font-size: 11.5px; }
    li { margin-bottom: 4px; }
    .footer { margin-top: 32px; font-size: 9.5px; color: #9aa1b0; text-align: center; }
    h3 { font-size: 13px; margin: 16px 0 4px; }
    p.body { font-size: 11.5px; line-height: 1.5; margin: 6px 0; }
    p.purpose { font-size: 11.5px; line-height: 1.5; margin: 4px 0 10px; color: #3f4657; font-style: italic; }
    .term { background: #f6f7fb; border-left: 3px solid #8b5cf6; border-radius: 6px; padding: 8px 12px; margin: 8px 0; font-size: 11px; }
    .term b { color: #161b28; }
    .figure { border: 1.5px dashed #c7cbd6; border-radius: 8px; padding: 22px 12px; text-align: center; margin: 10px 0; color: #9aa1b0; font-size: 10.5px; background: #fafafe; page-break-inside: avoid; }
    .figure .ph { font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-size: 9px; margin-bottom: 4px; }
    .section-block { page-break-inside: avoid; }
    .workflow ol { font-size: 11.5px; line-height: 1.6; padding-left: 20px; }
    .faq-item { margin: 10px 0; }
    .faq-q { font-weight: 700; font-size: 11.5px; }
    .faq-a { font-size: 11px; color: #3f4657; margin-top: 2px; }
  </style>
`;

function renderBlocks(blocks: ManualBlock[], S: (typeof PDF_STRINGS)["en"]): string {
  return blocks
    .map((b) => {
      if (b.type === "paragraph") return `<p class="body">${escapeHtml(b.text)}</p>`;
      if (b.type === "bullets") {
        const tag = b.numbered ? "ol" : "ul";
        return `<${tag}>${b.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</${tag}>`;
      }
      if (b.type === "term") {
        return `<div class="term"><b>${escapeHtml(b.term)}</b> — ${escapeHtml(b.definition)}</div>`;
      }
      if (b.type === "figure") {
        return `<div class="figure"><div class="ph">${escapeHtml(S.figurePlaceholder)}</div>${escapeHtml(S.figureCaption(b.caption))}</div>`;
      }
      return "";
    })
    .join("");
}

function renderSection(section: ManualSection, S: (typeof PDF_STRINGS)["en"]): string {
  return `<div class="section-block">
    <h2>${escapeHtml(section.title)}</h2>
    <p class="purpose">${escapeHtml(section.purpose)}</p>
    ${renderBlocks(section.blocks, S)}
  </div>`;
}

// Small identifying strip (device name + report title, left; report ID,
// right) repeated at the top of each major section. Standard document flow
// — not CSS Paged Media / position:fixed — so it's guaranteed to render
// consistently across the WebView-based print pipelines expo-print uses on
// iOS/Android, at the cost of only appearing once at the top of a section
// rather than on every single physical page if that section internally
// overflows onto more than one printed page (only the FMEA table is long
// enough to do this in practice).
function runningHeader(content: ReportContent): string {
  return `<div class="report-header"><span>${escapeHtml(content.deviceName)} — ${escapeHtml(content.S.runningHeader)}</span><span>${escapeHtml(content.reportId)}</span></div>`;
}

export function buildReportHtml({
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
}) {
  const content = buildReportContent({ workspace, failureModes, compliance, auditLog, lang });
  const { S } = content;

  const tableRows = content.tableRows
    .map(
      (r) => `
      <tr>
        <td>#${r.index}</td>
        <td>${escapeHtml(r.component)}</td>
        <td>${escapeHtml(r.mode)}</td>
        <td>${escapeHtml(r.effect)}</td>
        <td>${escapeHtml(r.cause)}</td>
        <td style="text-align:center">${r.s}</td><td style="text-align:center">${r.o}</td><td style="text-align:center">${r.d}</td>
        <td style="text-align:center"><b>${r.rpn}</b></td>
        <td style="text-align:center"><span class="class-badge" style="background:${BAND[r.classification].fill};color:${BAND[r.classification].text}">${escapeHtml(r.classificationLabel)}</span></td>
        <td>${escapeHtml(r.mitigation)}</td>
      </tr>`
    )
    .join("");

  const componentItems = content.components
    .map(
      (c, i) => `<div class="component-item"><div class="name">${i + 1}. ${escapeHtml(c.name)}</div><div class="desc">${escapeHtml(c.desc)}</div></div>`
    )
    .join("");

  const standardsItems = S.standardsList.map((s) => `<li>${escapeHtml(s)}</li>`).join("");

  const maxDist = Math.max(1, ...content.distribution.map((d) => d.count));
  const distBars = content.distribution
    .map(
      (d) => `<div class="dist-bar-row">
        <div class="dist-bar-label">${escapeHtml(d.label)}</div>
        <div class="dist-bar-track"><div class="dist-bar-fill" style="width:${Math.max(2, (d.count / maxDist) * 100)}%;background:${BAND[d.key].text}"></div></div>
        <div class="dist-bar-count">${d.count} (${d.pct}%)</div>
      </div>`
    )
    .join("");
  const distRows = content.distribution
    .map(
      (d) => `<tr>
        <td><span class="class-badge" style="background:${BAND[d.key].fill};color:${BAND[d.key].text}">${escapeHtml(d.label)}</span></td>
        <td style="text-align:center">${d.count}</td>
        <td style="text-align:center">${d.pct}%</td>
      </tr>`
    )
    .join("");

  const complianceRows = content.complianceRows
    .map((c) => {
      const key = c.status === "complete" ? "Acceptable" : c.status === "partial" ? "ALARP" : "Unacceptable";
      const b = BAND[key];
      return `<tr>
        <td>${escapeHtml(c.clause)}</td>
        <td>${escapeHtml(c.title)}</td>
        <td style="text-align:center"><span class="class-badge" style="background:${b.fill};color:${b.text}">${escapeHtml(c.statusLabel)}</span></td>
        <td>${c.evidenceCount ? escapeHtml(c.evidenceNames.join(", ")) : "—"}</td>
      </tr>`;
    })
    .join("");

  const auditRows = content.auditRows
    .map((a) => `<tr><td>${escapeHtml(a.when)}</td><td>${escapeHtml(a.text)}</td><td>${escapeHtml(a.user)}</td></tr>`)
    .join("");

  const isAttention = content.postureText === S.execSummaryPostureAttention;
  const postureBand = isAttention ? BAND.Unacceptable : BAND.Acceptable;

  const generatedDateStr = content.generatedDate.toLocaleDateString(lang === "en" ? undefined : lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html><html><head><meta charset="utf-8">${BASE_STYLE}${REPORT_STYLE}</head><body>
    <div class="report-cover">
      <div class="cover-band">
        <div class="brand">MedRisk Lite</div>
        <div class="kicker">${escapeHtml(S.footerReport.split("·")[0].replace(/^MedRisk Lite\s*—\s*/, ""))}</div>
      </div>
      <div class="cover-title">${escapeHtml(S.reportTitle.replace(/^MedRisk Lite\s*—\s*/, ""))}</div>
      <div class="cover-sub">${escapeHtml(S.reportSubtitle)}</div>
      <div class="cover-meta">
        <div class="cover-meta-row"><div class="k">${escapeHtml(S.coverDeviceLabel)}</div><div class="v">${escapeHtml(content.deviceName)}</div></div>
        <div class="cover-meta-row"><div class="k">${escapeHtml(S.coverOrgLabel)}</div><div class="v">${escapeHtml(content.orgName)}</div></div>
        <div class="cover-meta-row"><div class="k">${escapeHtml(S.coverVersionLabel)}</div><div class="v">${escapeHtml(S.coverVersion)}</div></div>
        <div class="cover-meta-row"><div class="k">${escapeHtml(S.reportIdLabel)}</div><div class="v">${escapeHtml(content.reportId)}</div></div>
        <div class="cover-meta-row"><div class="k">${escapeHtml(S.generatedLabel)}</div><div class="v">${generatedDateStr}</div></div>
      </div>
      <div class="footer">${escapeHtml(S.footerReport)}</div>
    </div>

    <div class="report-page">
      ${runningHeader(content)}
      <h2 class="section-h">${escapeHtml(S.execSummaryTitle)}</h2>
      <div class="stat-row">
        <div class="stat"><div class="v">${content.stats.count}</div><div class="l">${escapeHtml(S.statFailureModes)}</div></div>
        <div class="stat"><div class="v">${content.stats.avgRpn}</div><div class="l">${escapeHtml(S.statAvgRpn)}</div></div>
        <div class="stat"><div class="v">${content.stats.top ? content.stats.top.rpn : "—"}</div><div class="l">${escapeHtml(S.statHighestRpn)}</div></div>
        <div class="stat"><div class="v">${content.stats.compScore}%</div><div class="l">${escapeHtml(S.statCompliance)}</div></div>
      </div>
      <p class="body">${escapeHtml(content.execSummary)}</p>
      <div class="posture-box" style="background:${postureBand.fill};color:${postureBand.text}">${escapeHtml(content.postureText)}</div>
    </div>

    <div class="report-page">
      ${runningHeader(content)}
      <h2 class="section-h">${escapeHtml(S.deviceScopeTitle)}</h2>
      <p class="body">${escapeHtml(S.deviceScopeIntro)}</p>
      <h3 class="sub-h">${escapeHtml(S.componentsListTitle)}</h3>
      <div class="components-grid">${componentItems}</div>
      <h3 class="sub-h">${escapeHtml(S.standardsListTitle)}</h3>
      <p class="body">${escapeHtml(S.standardsIntro)}</p>
      <ul class="standards-list">${standardsItems}</ul>
    </div>

    <div class="report-page">
      ${runningHeader(content)}
      <h2 class="section-h">${escapeHtml(S.fullTableTitle)}</h2>
      <table class="report-table">
        <thead><tr>
          <th>${escapeHtml(S.colIndex)}</th><th>${escapeHtml(S.colComponent)}</th><th>${escapeHtml(S.colFailureMode)}</th><th>${escapeHtml(S.colEffect)}</th><th>${escapeHtml(S.colCause)}</th>
          <th>${escapeHtml(S.colS)}</th><th>${escapeHtml(S.colO)}</th><th>${escapeHtml(S.colD)}</th><th>${escapeHtml(S.colRpn)}</th><th>${escapeHtml(S.colClassification)}</th><th>Mitigation</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>

    <div class="report-page">
      ${runningHeader(content)}
      <h2 class="section-h">${escapeHtml(S.riskDistributionTitle)}</h2>
      <p class="body">${escapeHtml(S.riskDistributionIntro)}</p>
      <div class="dist-bars">${distBars}</div>
      <table class="report-table">
        <thead><tr><th>${escapeHtml(S.colBand)}</th><th style="text-align:center">${escapeHtml(S.colCount)}</th><th style="text-align:center">${escapeHtml(S.colShare)}</th></tr></thead>
        <tbody>${distRows}</tbody>
      </table>
    </div>

    <div class="report-page">
      ${runningHeader(content)}
      <h2 class="section-h">${escapeHtml(S.complianceSummaryTitle)}</h2>
      <table class="report-table">
        <thead><tr><th>${escapeHtml(S.colClause)}</th><th>${escapeHtml(S.colTitle)}</th><th style="text-align:center">${escapeHtml(S.colStatus)}</th><th>Evidence</th></tr></thead>
        <tbody>${complianceRows}</tbody>
      </table>
    </div>

    <div class="report-page">
      ${runningHeader(content)}
      <h2 class="section-h">${escapeHtml(S.auditTrailTitle)}</h2>
      <p class="body">${escapeHtml(S.auditTrailIntro)}</p>
      ${
        content.auditRows.length
          ? `<table class="report-table"><thead><tr><th>${escapeHtml(S.colWhen)}</th><th>${escapeHtml(S.colActivity)}</th><th>${escapeHtml(S.colUser)}</th></tr></thead><tbody>${auditRows}</tbody></table>`
          : `<p class="body">${escapeHtml(S.auditTrailEmpty)}</p>`
      }

      <h2 class="section-h" style="margin-top:32px">${escapeHtml(S.signOffTitle)}</h2>
      <div class="sign-line">${escapeHtml(S.signOffReviewerLine).replace(/_{4,}/g, '<span class="blank"></span>')}</div>
      <div class="sign-line">${escapeHtml(S.signOffApproverLine).replace(/_{4,}/g, '<span class="blank"></span>')}</div>
    </div>
  </body></html>`;
}

export function buildManualHtml({
  workspace,
  compliance,
  lang = "en",
}: {
  workspace: WorkspaceInfo;
  compliance: ComplianceClause[];
  lang?: Lang;
}) {
  const S = PDF_STRINGS[lang];
  const content = buildManualContent(lang, { components: workspace.components, compliance });

  const gettingStartedHtml = `<div class="section-block">
    <h2>${escapeHtml(content.gettingStarted.title)}</h2>
    <p class="purpose">${escapeHtml(content.gettingStarted.purpose)}</p>
    ${renderBlocks(content.gettingStarted.blocks, S)}
  </div>`;

  const sectionsHtml = content.sections.map((s) => renderSection(s, S)).join("");

  const workflowHtml = `<div class="section-block workflow">
    <h2>${escapeHtml(S.manualTypicalWorkflow)}</h2>
    <p class="purpose">${escapeHtml(S.manualWorkflowIntro)}</p>
    <ol>${content.workflow.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
  </div>`;

  const faqHtml = `<div class="section-block">
    <h2>${escapeHtml(S.manualFaqTitle)}</h2>
    ${content.faq
      .map(
        (f) => `<div class="faq-item"><div class="faq-q">${escapeHtml(f.q)}</div><div class="faq-a">${escapeHtml(f.a)}</div></div>`
      )
      .join("")}
  </div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">${BASE_STYLE}</head><body>
    <div class="cover">
      <div class="tile"></div>
      <h1>${escapeHtml(S.manualTitle)}</h1>
      <div class="sub">${escapeHtml(S.manualSubtitle)}</div>
      <div class="meta"><span>${escapeHtml(S.manualGenerated)} ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span></div>
    </div>

    <h2>${escapeHtml(S.manualWhatItDoes)}</h2>
    <p class="body">${escapeHtml(content.intro)}</p>

    ${gettingStartedHtml}
    ${sectionsHtml}
    ${workflowHtml}
    ${faqHtml}

    <h2>${escapeHtml(S.manualSupportTitle)}</h2>
    <p style="font-size:11.5px;">${escapeHtml(S.manualSupportBody)}</p>
    <div class="footer">${escapeHtml(S.manualFooter)}</div>
  </body></html>`;
}

function escapeHtml(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
