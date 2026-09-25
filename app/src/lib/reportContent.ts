import type { AuditLogEntry, ComplianceClause, FailureMode, WorkspaceInfo } from "./api";
import { componentName } from "./constants";
import { classifyRpn } from "./fmea";
import { PDF_STRINGS, type Lang } from "./pdfStrings";
import i18n from "../i18n";

// Single source of truth for the FMEA Report PDF's *content* (all computed
// stats, narrative text and row data), consumed by both the jsPDF web
// builder (pdfBuilders.ts) and the HTML/native builder (pdfTemplates.ts) so
// the two stay in sync — only the rendering/layout code differs between them.

export type ReportContent = ReturnType<typeof buildReportContent>;

export function buildReportContent({
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
  const S = PDF_STRINGS[lang];
  const t = i18n.getFixedT(lang);

  const settings = { alarpFrom: workspace.alarpFrom, unacceptableFrom: workspace.unacceptableFrom };
  const avgRpn = failureModes.length
    ? Math.round(failureModes.reduce((a, f) => a + f.rpn, 0) / failureModes.length)
    : 0;
  const sortedByRpn = [...failureModes].sort((a, b) => b.rpn - a.rpn);
  const top = sortedByRpn[0] ?? null;

  const completeClauses = compliance.filter((c) => c.status === "complete").length;
  const partialClauses = compliance.filter((c) => c.status === "partial").length;
  const compScore = compliance.length
    ? Math.round(((completeClauses + partialClauses * 0.5) / compliance.length) * 100)
    : 0;

  const bands = { Acceptable: 0, ALARP: 0, Unacceptable: 0 };
  for (const fm of failureModes) bands[classifyRpn(fm.rpn, settings)]++;
  const total = failureModes.length || 1;
  const distribution = (["Acceptable", "ALARP", "Unacceptable"] as const).map((key) => ({
    key,
    label: t(`classification.${key}`),
    count: bands[key],
    pct: Math.round((bands[key] / total) * 100),
  }));

  const hasUnacceptable = bands.Unacceptable > 0;
  const postureText = hasUnacceptable || compScore < 70 ? S.execSummaryPostureAttention : S.execSummaryPostureGood;

  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
  const generatedDate = new Date();

  const components = workspace.components.map((c) => ({
    id: c.id,
    name: componentName(c.id, t),
    desc: t(`components.${c.id}.desc`, { defaultValue: "" }),
  }));

  const tableRows = failureModes.map((f, i) => ({
    index: i + 1,
    component: componentName(f.componentId, t),
    mode: f.mode,
    effect: f.effect,
    cause: f.cause,
    s: f.s,
    o: f.o,
    d: f.d,
    rpn: f.rpn,
    classification: f.classification,
    classificationLabel: t(`classification.${f.classification}`),
    mitigation: f.mitigation,
  }));

  const complianceRows = compliance.map((c) => ({
    clause: c.clause,
    title: c.title,
    status: c.status,
    statusLabel: t(`complianceStatus.${c.status}`),
    evidenceCount: c.evidence.length,
    evidenceNames: c.evidence.map((e) => e.fileName),
  }));

  const auditRows = auditLog.slice(0, 15).map((a) => ({
    when: new Date(a.createdAt).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    text: a.text,
    user: a.user?.name || a.user?.email || "—",
  }));

  const execSummary = S.execSummaryNarrative({
    count: failureModes.length,
    avgRpn,
    topMode: top?.mode ?? "—",
    topComponent: top ? componentName(top.componentId, t) : "—",
    topRpn: top?.rpn ?? 0,
    topClass: top ? t(`classification.${top.classification}`) : "—",
    compScore,
    completeClauses,
    totalClauses: compliance.length,
  });

  return {
    S,
    t,
    lang,
    reportId,
    generatedDate,
    orgName: workspace.name || "—",
    deviceName: S.deviceName,
    stats: { count: failureModes.length, avgRpn, top, compScore },
    execSummary,
    postureText,
    distribution,
    components,
    tableRows,
    complianceRows,
    auditRows,
  };
}
