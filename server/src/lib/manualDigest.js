// Condensed, server-side digest of the user manual (see app/src/lib/manualContent.ts,
// the source for the exported PDF Quickstart Guide) — kept short so it can be
// included in every AI Assistant system prompt without bloating token usage.
// Not required to stay byte-for-byte in sync with manualContent.ts; it only needs
// to cover the same ground so Roger can answer "how do I..." questions accurately.

const MANUAL_DIGEST = `
MedRisk Lite is an FMEA (Failure Mode and Effects Analysis) risk-assessment tool for a portable ultrasound probe, built around ISO 14971:2019 and cross-referencing IEC 60601-1, IEC 62366-1 and ISO 13485:2016.

App screens and what each is for:
- Dashboard: at-a-glance summary — total failure modes, average RPN, highest RPN, live compliance %, ALARP risk breakdown donut chart, top 5 highest-risk failure modes, recent activity feed.
- Device Library: shows the active device (portable ultrasound probe) and its tracked components with descriptions.
- FMEA Workspace: where failure modes are added and scored. Tap a component on the probe diagram to filter. "+ Add Failure Mode" opens a form for mode/effect/cause/standard/mitigation and Severity/Occurrence/Detectability (S/O/D) scores, 1-10 each. RPN = S x O x D, recalculated instantly. "+ Suggest Failure Modes" offers AI-generated candidate failure modes per component.
- Risk Register: master sortable/searchable/filterable table of every failure mode.
- Analytics: RPN bar chart, per-component risk heatmap, saved risk snapshots for before/after comparison, and the full timestamped audit trail.
- Compliance: tracks each ISO 14971:2019 clause as Complete/Partial/Pending, with a live compliance score and evidence file attachments per clause.
- AI Assistant (this chat, "Roger"): answers questions about FMEA, the standards, and the live data.
- Report Generator: exports a full FMEA PDF report, or this manual as a PDF.
- Settings: RPN scoring thresholds (ALARP from / Unacceptable from), AI Assistant scope, data export/import/reset, account/sign-out.

Key terms:
- RPN (Risk Priority Number) = Severity x Occurrence x Detectability, range 1-1000. Higher = more urgent.
- Severity (S): how bad the consequence would be, 1 (negligible) to 10 (catastrophic).
- Occurrence (O): how often the failure is likely to happen, 1 (rare) to 10 (frequent).
- Detectability (D): how likely the failure is to be caught before harm — 1 means almost always caught, 10 means very hard to detect (counter-intuitive direction, worth pointing out if asked).
- ALARP = As Low As Reasonably Practicable, the risk band between the Acceptable and Unacceptable thresholds (both configurable in Settings).
- Compliance score: Complete = 100%, Partial = 50%, Pending = 0%, averaged across every ISO 14971:2019 clause.

Common how-to answers:
- Change RPN thresholds: Settings -> RPN Scoring Configuration -> set "ALARP from" / "Unacceptable from" -> Save Settings.
- Export/import/reset data: Settings -> Data Management -> Export JSON / Import JSON / Reset Demo Data (reset cannot be undone).
- Add a failure mode: FMEA Workspace -> "+ Add Failure Mode".
- Attach compliance evidence: Compliance tab -> "+ Attach evidence" on a clause.
- Save a risk snapshot: Analytics -> "+ Save Snapshot".
`.trim();

module.exports = { MANUAL_DIGEST };
