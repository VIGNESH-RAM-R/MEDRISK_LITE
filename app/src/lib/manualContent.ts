import type { Component } from "./constants";

// Structured content for the "Quickstart Guide" / user manual PDF. Both PDF
// renderers (pdfBuilders.ts for web/jsPDF, pdfTemplates.ts for native/HTML)
// walk this same block list, so the two never drift apart, and both pull
// component/clause names from the live workspace instead of hardcoding them.
//
// Phase 3 (multi-language): the manual is fully translated into English,
// Hindi and Tamil via three parallel builder functions below (buildManualContentEn/
// Hi/Ta) that share the same structure, dispatched by buildManualContent(lang, ...).
// Component names/descriptions are passed in already translated (see
// translatedComponents() in constants.ts) so this file only owns the manual's
// own prose. Standard codes (ISO 14971:2019, IEC 60601-1, etc.) are left
// untranslated in every language, as they are formal identifiers, not prose.

export type ManualBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[]; numbered?: boolean }
  | { type: "term"; term: string; definition: string }
  | { type: "figure"; caption: string };

export type ManualSection = {
  title: string;
  purpose: string;
  blocks: ManualBlock[];
};

export type ManualContent = {
  intro: string;
  gettingStarted: ManualSection;
  sections: ManualSection[];
  workflow: string[];
  faq: { q: string; a: string }[];
};

type ComplianceLike = { clause: string; title: string; mapped: string; status: string };

type BuilderArgs = { components: Component[]; compliance: ComplianceLike[] };

export type ManualLang = "en" | "hi" | "ta";

function buildManualContentEn({ components, compliance }: BuilderArgs): ManualContent {
  const intro =
    "MedRisk Lite is a Failure Mode and Effects Analysis (FMEA) tool for teams developing or evaluating " +
    "medical devices — in this build, a portable ultrasound probe intended for point-of-care use in " +
    "low-resource settings. It follows the risk-management process defined in ISO 14971:2019, the core " +
    "international standard for medical device risk management, and cross-references IEC 60601-1 " +
    "(electrical and mechanical safety), IEC 62366-1 (usability engineering) and ISO 13485:2016 (quality " +
    "management) where relevant. This guide is for anyone using MedRisk Lite day to day — a device " +
    "engineer documenting failure modes, a quality or regulatory reviewer checking compliance status, or " +
    "a mentor or evaluator getting a walkthrough of the tool itself. No FMEA background is assumed: every " +
    "term is defined in plain language the first time it comes up.";

  const gettingStarted: ManualSection = {
    title: "Getting Started",
    purpose:
      "Before anything else: how to get an account, what happens the very first time you sign in, and " +
      "what that one-time pop-up is asking you for.",
    blocks: [
      {
        type: "paragraph",
        text:
          "Account creation: on the sign-in screen, click \"Continue with Google\" to sign in with an " +
          "existing Google account, or use the email and password fields below it — click \"No account? " +
          "Create one\" first if you're signing up rather than signing in.",
      },
      {
        type: "paragraph",
        text:
          "First login: once you've signed in (and, for email sign-up, entered the verification code sent " +
          "to your inbox), you land directly on the Dashboard — there's no separate setup screen standing " +
          "between you and the app.",
      },
      {
        type: "paragraph",
        text:
          "The quick-setup form: the very first time you sign in, a short \"Quick setup\" pop-up appears " +
          "asking for the company or product you're evaluating this for, any errors you've run into, and " +
          "the main question you want the tool to answer today. All three fields are optional. Submitting " +
          "helps whoever's reviewing this tool understand how it's actually being used; skipping is fine " +
          "too. Either way, it won't ask again.",
      },
      { type: "figure", caption: "Sign-in screen" },
      { type: "figure", caption: "Quick-setup pop-up" },
    ],
  };

  const sections: ManualSection[] = [
    {
      title: "Sign In & Setup",
      purpose:
        "This is the entry point to the app and where your account is tied to your own private workspace " +
        "— the container that holds all of your failure modes, compliance status and history, kept " +
        "separate from any other user's data. You come here once to get in, and again any time you sign " +
        "out.",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "Open the app. You'll see a two-panel sign-in screen: a form on the left, a live preview of the risk dashboard on the right.",
            "To sign in with Google, click \"Continue with Google\" and complete Google's prompt — you're returned to the app automatically.",
            "To use email and password instead, fill in both fields and click \"Sign In\".",
            "No account yet? Click \"No account? Create one\", enter an email and password, and click \"Create Account\".",
            "Enter the verification code sent to your email and click \"Verify Email\" to finish creating the account.",
            "On first sign-in only, answer or skip the Quick Setup pop-up (see Getting Started above).",
            "You land directly on the Dashboard — no extra loading or setup step.",
          ],
        },
        { type: "figure", caption: "Sign-in screen" },
      ],
    },
    {
      title: "Dashboard",
      purpose:
        "Your at-a-glance risk summary, and the place to start every session. It answers \"how risky is " +
        "this device right now, overall?\" without requiring you to read every individual failure mode — " +
        "and it's the place to come back to after making changes elsewhere, to confirm they moved the " +
        "numbers the way you expected.",
      blocks: [
        {
          type: "paragraph",
          text:
            "The four stat cards across the top show how many failure modes are documented, the average " +
            "RPN across all of them, the single highest RPN currently on record, and your live ISO 14971 " +
            "compliance percentage.",
        },
        {
          type: "term",
          term: "RPN (Risk Priority Number)",
          definition:
            "a single score used to prioritize risk. It's calculated as Severity × Occurrence × " +
            "Detectability — three numbers you assign to each failure mode (see FMEA Workspace below) — " +
            "so it always ranges from 1 (three 1s) to 1000 (three 10s). A higher RPN means a failure mode " +
            "needs attention sooner.",
        },
        {
          type: "paragraph",
          text:
            "The ALARP Risk Breakdown donut chart groups every failure mode into one of three risk bands " +
            "based on its RPN.",
        },
        {
          type: "term",
          term: "ALARP",
          definition:
            "short for As Low As Reasonably Practicable — the middle risk band, between Acceptable and " +
            "Unacceptable. A failure mode lands here when its RPN is above your Acceptable threshold but " +
            "below your Unacceptable one (both configurable in Settings); mitigation should be considered " +
            "even though it isn't mandatory.",
        },
        {
          type: "paragraph",
          text:
            "Top 5 Highest-Risk Failure Modes lists the five worst-scoring failure modes by RPN, with " +
            "component and band, so you can jump straight to what needs attention without scrolling the " +
            "full Risk Register.",
        },
        {
          type: "paragraph",
          text:
            "Recent Activity shows the latest changes in your workspace — score edits, compliance status " +
            "changes, new failure modes — each with who made it and when, so you or a reviewer can see " +
            "what's changed without digging through every screen.",
        },
        { type: "figure", caption: "Dashboard overview" },
        { type: "figure", caption: "ALARP Risk Breakdown chart" },
      ],
    },
    {
      title: "Device Library",
      purpose:
        "Shows which device this workspace's data is actually about, and its component breakdown, before " +
        "you dive into scoring. Useful as an orientation step for a new team member or reviewer who needs " +
        "to know what's being assessed before looking at the numbers.",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "The highlighted card at the top shows the active device — for this build, the Portable Ultrasound Probe — with its component count and total documented failure modes.",
            `Below it is a grid of every tracked component, each with a one-line description of what it does and why it matters to risk. The current components are: ${components
              .map((c) => c.name)
              .join(", ")}. This is the same list you'll choose from in FMEA Workspace.`,
            "Click \"Open FMEA Workspace →\" to jump straight from here into scoring.",
            "Further down, additional device types appear marked \"Coming Soon\" — not yet available to assess in this build, but a preview of where the tool is headed.",
          ],
        },
        { type: "figure", caption: "Device Library — component grid" },
      ],
    },
    {
      title: "FMEA Workspace",
      purpose:
        "Where the actual risk analysis happens — where you document a specific way a component can " +
        "fail, how bad it would be, how likely it is, and how hard it would be to catch — and where the " +
        "tool turns that into a prioritized, ISO 14971-aligned risk score. Most of your time in the app " +
        "will be spent here.",
      blocks: [
        {
          type: "paragraph",
          text:
            "Filter by component: the interactive probe diagram on the left is a simplified drawing of " +
            "the device with a colored dot on each labelled component. Tap a dot to filter the failure-" +
            "mode list down to just that component; tap \"Clear filter\" to see everything again. The " +
            "sheath toggle nearby shows whether a protective sheath is currently modeled as applied, and " +
            "can be switched to reflect the scenario you're assessing.",
        },
        {
          type: "paragraph",
          text:
            "Add a new failure mode: click \"+ Add Failure Mode\" to open a form. Choose the component it " +
            "applies to, then fill in a short Failure mode description (the specific way the part fails), " +
            "the Effect (what happens as a result), the Cause (why it happens), the Standard it's being " +
            "assessed against (defaults to ISO 14971), and a Mitigation (what design change, process, or " +
            "check reduces this risk).",
        },
        {
          type: "paragraph",
          text:
            "AI assistance while filling this in: two optional buttons speed up documentation without " +
            "replacing your judgment. \"Draft mitigation with AI\" writes a candidate mitigation from the " +
            "mode/effect/cause you've entered so far — it pre-fills the field but stays fully editable, and " +
            "is never saved until you click Save yourself. \"Suggest scores with AI\" proposes Severity, " +
            "Occurrence and Detectability values with a one-line rationale for each, shown next to the " +
            "steppers so you (and a reviewer) can see the reasoning, not just the numbers — the steppers " +
            "stay editable afterward. Both need at least a failure mode description typed in first, and " +
            "both fall back to a clear inline error if the AI service isn't available, without losing any " +
            "of your other entries.",
        },
        {
          type: "term",
          term: "Severity (S)",
          definition:
            "how bad the consequence would be if this failure happened, from 1 (negligible, no real " +
            "impact) to 10 (catastrophic harm to the patient or operator). Score this against the worst " +
            "reasonably expected outcome, not the best case.",
        },
        {
          type: "term",
          term: "Occurrence (O)",
          definition:
            "how often this failure is expected to happen in real use, from 1 (rare — very unlikely over " +
            "the device's life) to 10 (frequent — expected in normal use).",
        },
        {
          type: "term",
          term: "Detectability (D)",
          definition:
            "how likely the failure is to be caught before it causes harm. This one runs the opposite " +
            "direction from what you might expect: 1 means it's almost always caught (e.g. an automatic " +
            "self-test catches it every time), 10 means it's very hard or impossible to detect before " +
            "harm occurs.",
        },
        {
          type: "paragraph",
          text:
            "Click \"Save\". The tool immediately calculates RPN = S × O × D and assigns an ALARP band " +
            "(Acceptable, ALARP, or Unacceptable) based on your configured thresholds (see Settings). Both " +
            "appear on the failure mode's card right away — there's no separate save-and-refresh step. To " +
            "change an existing failure mode's score later, open its card and adjust S, O or D directly — " +
            "RPN and its band recalculate the moment you change a value.",
        },
        {
          type: "paragraph",
          text:
            "Suggested failure modes: the \"✨ Suggest Failure Modes (AI)\" panel generates 2-3 candidate " +
            "failure modes for the selected component on demand, each with a short rationale, checked " +
            "against what's already documented for that component so it doesn't repeat itself. If no AI " +
            "key is configured on the server, it falls back automatically to a small built-in curated list " +
            "instead, clearly labeled as such. Click \"+ Add to FMEA Workspace\" on a suggestion to add it " +
            "as a draft entry (scored 5/5/5 by default, with effect, cause and mitigation marked \"Pending " +
            "team review\") — review and correct it before treating it as final.",
        },
        { type: "figure", caption: "FMEA Workspace — probe diagram and filters" },
        { type: "figure", caption: "Add Failure Mode form" },
        { type: "figure", caption: "Failure mode card with S-O-D scores" },
      ],
    },
    {
      title: "Risk Register",
      purpose:
        "The master table of every failure mode in the workspace, in one sortable, searchable, filterable " +
        "list — where you go when you need to find something specific or review the whole risk picture as " +
        "a flat list rather than browsing by component.",
      blocks: [
        {
          type: "bullets",
          items: [
            "Type into the search box to filter by any text in the failure mode description or component name.",
            "Use the All / Acceptable / ALARP / Unacceptable pills to show only failure modes in a particular risk band.",
            "Click any column header (#, Component, S, O, D, RPN) to sort by that column; click again to reverse the order.",
            "Each row shows Severity, Occurrence, Detectability, calculated RPN, and ALARP classification, so you can compare failure modes side by side without opening each one.",
          ],
        },
        { type: "figure", caption: "Risk Register — sorted by RPN" },
      ],
    },
    {
      title: "Analytics",
      purpose:
        "Where you step back from individual failure modes and look at patterns — which components are " +
        "riskiest overall, how RPN is distributed, and how the picture has changed over time. Use this " +
        "when preparing a risk-management summary or reporting progress to a reviewer.",
      blocks: [
        {
          type: "paragraph",
          text:
            "The RPN by Failure Mode bar chart shows every documented failure mode's RPN, colour-coded by " +
            "ALARP band, so you can see the overall risk distribution at a glance.",
        },
        {
          type: "paragraph",
          text:
            "The Risk Heatmap lists each component with its average RPN and failure-mode count, colour-" +
            "intensity-coded — the more intense a row, the riskier that component is on average, making it " +
            "easy to spot which part of the device needs the most attention.",
        },
        {
          type: "paragraph",
          text:
            "Risk Snapshots let you capture a baseline. Click \"+ Save Snapshot\", give it a name (e.g. " +
            "\"Pre-mitigation baseline\"), and it stores the current average RPN, risk-band counts, and " +
            "compliance score at that moment. Later, after making changes, click \"Compare\" on a saved " +
            "snapshot to see exactly how each of those numbers has moved — useful for demonstrating that " +
            "mitigations actually reduced risk.",
        },
        {
          type: "paragraph",
          text:
            "The Risk History & Audit Trail at the bottom is the complete, timestamped log of every change " +
            "made in the workspace, in one place.",
        },
        { type: "figure", caption: "Analytics — RPN chart and heatmap" },
        { type: "figure", caption: "Risk Snapshots comparison" },
      ],
    },
    {
      title: "Compliance",
      purpose:
        "Tracks how complete your risk-management file is against the actual clauses of ISO 14971:2019, " +
        "clause by clause, so you always know what's done, what's partial, and what's still outstanding — " +
        "this is the screen a regulatory reviewer or auditor would look at first.",
      blocks: [
        {
          type: "paragraph",
          text:
            "The ring at the top is your live compliance score — the percentage of clauses marked " +
            "Complete, recalculating instantly any time a clause's status changes.",
        },
        {
          type: "term",
          term: "Clause status",
          definition:
            "each clause has one of three statuses: Complete (fully addressed), Partial (in progress or " +
            "partially addressed), or Pending (not yet started). Complete counts fully toward your " +
            "compliance score, Partial counts as half, Pending counts as zero.",
        },
        {
          type: "bullets",
          items: compliance.map((c) => `${c.clause} — ${c.title}: mapped to ${c.mapped} (currently ${c.status}).`),
        },
        {
          type: "paragraph",
          text:
            "Click \"Mark as [next status]\" on any clause to cycle its status forward. Click \"+ Attach " +
            "evidence\" to upload a supporting file (image, PDF, or text document) for that clause — " +
            "useful for keeping the actual sign-off document, test report, or review record linked " +
            "directly to the clause it satisfies. Attached files appear as clickable links under the " +
            "clause; remove one with the ✕ next to it.",
        },
        { type: "figure", caption: "Compliance — score ring and clause tracker" },
      ],
    },
    {
      title: "AI Assistant",
      purpose:
        "A built-in assistant, Roger, that answers questions about FMEA concepts, the standards behind " +
        "this tool, and your live risk data in plain language — useful when you want a quick answer " +
        "without hunting through the other screens, or when explaining the tool to someone new.",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "Type a question into the message box and press Send (or Enter) — Roger answers using a free, built-in knowledge base plus your live FMEA data, including things like your current highest-risk failure mode or compliance score.",
            "When a real AI key is connected on the server, Roger answers in full open-ended conversation instead, grounded in the same live data and in this manual, and stays strictly scoped to FMEA/ISO 14971/your data/this app — it politely declines and redirects anything outside that, rather than answering off-topic questions.",
            "Use a Quick Prompt on the left for common questions — clicking one sends it immediately.",
            "Click the attach icon to add a file to your message. Text-based files (.txt, .csv, .json, .md) are read and included as context for Roger's answer; photos can be attached too, but interpreting what's actually in an image needs a connected AI key (see Settings) — without one, Roger can only acknowledge that a photo was attached.",
            "On the web build, click the microphone icon to dictate your question instead of typing.",
            "Click \"Clear conversation\" to start a fresh chat at any time.",
          ],
        },
        { type: "figure", caption: "AI Assistant — chat with Roger" },
      ],
    },
    {
      title: "Report Generator",
      purpose:
        "Turns your live workspace data into two shareable PDF documents — a formal risk-assessment " +
        "report for a risk-management file, and this walkthrough guide itself — without needing to " +
        "manually assemble anything.",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "Click \"Generate PDF Report\" to produce a structured FMEA report: cover page, summary statistics, the complete failure-mode table with S/O/D/RPN/classification, mitigation notes, and an ISO 14971:2019 compliance summary — built fresh from whatever is in your workspace right now.",
            "Click \"Generate User Manual (PDF)\" to produce this Quickstart Guide as a downloadable PDF — useful as a leave-behind document for a mentor, reviewer, or new team member.",
            "Both PDFs are generated in whichever language is currently selected in Settings, including their headers and section titles.",
            "Both downloads save directly to your browser's default downloads location.",
          ],
        },
        { type: "figure", caption: "Report Generator screen" },
      ],
    },
    {
      title: "Settings",
      purpose:
        "Where you configure how the tool scores and classifies risk, manage the AI Assistant's " +
        "behavior, choose your display language, back up or reset your data, and manage your account — " +
        "a screen you'll visit occasionally rather than daily.",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "Appearance — toggle between light and dark theme.",
            "Language — switch the app's display language between English, Hindi (हिंदी) and Tamil (தமிழ்); the change applies immediately across every screen, and is remembered the next time you open the app.",
            "RPN Scoring Configuration — set the RPN value at which a failure mode becomes ALARP, and the value at which it becomes Unacceptable. These two thresholds are what every ALARP badge and the Dashboard's risk breakdown are calculated against, so changing them re-classifies every failure mode immediately.",
            "AI Assistant — pick which model Roger would use if a real AI key is connected (no effect until an administrator connects one on the server), and set Roger's Scope: Redirect lets Roger gently steer off-topic questions back to FMEA/the app; Refuse has Roger decline them outright.",
            "Click \"Save Settings\" to apply threshold, AI, and scope changes.",
            "Data Management — \"Export JSON\" downloads a full backup of your failure modes and compliance data; \"Import JSON\" restores from a previously exported backup file; \"Reset Demo Data\" reverts everything to the original seeded data set (cannot be undone — you'll be asked to confirm first).",
            "Account — shows who you're signed in as, with a \"Sign Out\" button.",
          ],
        },
        { type: "figure", caption: "Settings — scoring thresholds and data management" },
      ],
    },
  ];

  const workflow = [
    "Open FMEA Workspace and tap the component on the probe diagram — or pick it in the \"+ Add Failure Mode\" form — that you want to assess.",
    "Click \"+ Add Failure Mode\" and describe the failure mode, its effect, its cause, and a mitigation.",
    "Score Severity, Occurrence and Detectability using the definitions above, and click Save — RPN and its ALARP band appear immediately.",
    "Open Risk Register to confirm the new entry sorts where you'd expect relative to your other risks.",
    "If it lands in ALARP or Unacceptable, go to Compliance and check whether the relevant clause (e.g. Risk Control) needs updating to reflect the new mitigation, and attach any supporting evidence.",
    "Open Analytics and save a snapshot before making further changes, so you have a baseline to compare against later.",
    "Ask AI Assistant \"What is the highest-risk failure mode right now?\" to sanity-check it, or ask about anything unclear.",
    "Check the Dashboard to see the new failure mode reflected in your overall risk summary and compliance score.",
    "When ready, use Report Generator to produce an updated PDF report for your risk-management file.",
  ];

  const faq: { q: string; a: string }[] = [
    {
      q: "What does ALARP mean for my risk?",
      a: "It means the failure mode's RPN falls between your Acceptable and Unacceptable thresholds (set in Settings) — it isn't automatically rejected, but you should document why further mitigation isn't reasonably practicable, or make changes to bring it down.",
    },
    {
      q: "How do I change scoring thresholds?",
      a: "Go to Settings → RPN Scoring Configuration, adjust \"ALARP from\" and \"Unacceptable from\", then click Save Settings. Every failure mode's classification updates immediately.",
    },
    {
      q: "My RPN looks wrong — what should I check?",
      a: "RPN is always Severity × Occurrence × Detectability. Open the failure mode in FMEA Workspace and check the three individual scores — correcting one recalculates RPN instantly.",
    },
    {
      q: "How is my compliance score calculated?",
      a: "Each clause counts Complete = 100%, Partial = 50%, Pending = 0%, averaged across every clause. See Compliance for the live number and to update individual clause statuses.",
    },
    {
      q: "Can I undo a Reset Demo Data?",
      a: "No — it permanently replaces your failure modes, compliance data, and snapshots with the original seeded data set. Export a backup first (Settings → Export JSON) if you want to keep your current data.",
    },
    {
      q: "Does the AI Assistant need an internet connection or a paid key?",
      a: "No — Roger's built-in knowledge base and access to your live data work with no key and no cost. A connected AI key (set up by an administrator) only adds fully open-ended conversation and image interpretation on top of that.",
    },
    {
      q: "Can I use the app in Hindi or Tamil?",
      a: "Yes — go to Settings → Language and pick English, हिंदी or தமிழ். The whole app, including this manual and the FMEA report PDF, switches immediately.",
    },
    {
      q: "Where do exported PDFs and JSON backups go?",
      a: "They download to your browser's default downloads folder, same as any other file you download from a website.",
    },
  ];

  return { intro, gettingStarted, sections, workflow, faq };
}

function buildManualContentHi({ components, compliance }: BuilderArgs): ManualContent {
  const intro =
    "MedRisk Lite चिकित्सा उपकरण विकसित या मूल्यांकन करने वाली टीमों के लिए एक फेल्योर मोड एंड इफेक्ट्स एनालिसिस (FMEA) टूल है — इस बिल्ड में, " +
    "कम-संसाधन सेटिंग्स में पॉइंट-ऑफ-केयर उपयोग के लिए बनाई गई एक पोर्टेबल अल्ट्रासाउंड प्रोब। यह ISO 14971:2019 में परिभाषित जोखिम-प्रबंधन " +
    "प्रक्रिया का पालन करता है, जो चिकित्सा उपकरण जोखिम प्रबंधन के लिए मुख्य अंतरराष्ट्रीय मानक है, और जहां प्रासंगिक हो वहां IEC 60601-1 " +
    "(विद्युत और यांत्रिक सुरक्षा), IEC 62366-1 (यूज़ेबिलिटी इंजीनियरिंग) और ISO 13485:2016 (गुणवत्ता प्रबंधन) का संदर्भ देता है। यह गाइड " +
    "MedRisk Lite का रोज़ उपयोग करने वाले किसी भी व्यक्ति के लिए है — एक डिवाइस इंजीनियर जो फेल्योर मोड दर्ज कर रहा है, एक गुणवत्ता या " +
    "रेगुलेटरी रिव्यूअर जो कंप्लायंस स्थिति की जांच कर रहा है, या एक मेंटर या मूल्यांकनकर्ता जो टूल का वॉकथ्रू ले रहा है। किसी FMEA " +
    "पृष्ठभूमि की आवश्यकता नहीं है: हर शब्द को पहली बार आने पर सरल भाषा में परिभाषित किया गया है।";

  const gettingStarted: ManualSection = {
    title: "शुरुआत करना",
    purpose:
      "सबसे पहले: अकाउंट कैसे प्राप्त करें, पहली बार साइन इन करने पर क्या होता है, और वह एक बार का पॉप-अप आपसे क्या पूछ रहा है।",
    blocks: [
      {
        type: "paragraph",
        text:
          "अकाउंट बनाना: साइन-इन स्क्रीन पर, मौजूदा Google अकाउंट से साइन इन करने के लिए \"Continue with Google\" पर क्लिक करें, " +
          "या इसके नीचे ईमेल और पासवर्ड फ़ील्ड का उपयोग करें — यदि आप साइन इन करने के बजाय साइन अप कर रहे हैं तो पहले " +
          "\"No account? Create one\" पर क्लिक करें।",
      },
      {
        type: "paragraph",
        text:
          "पहला लॉगिन: एक बार साइन इन करने के बाद (और, ईमेल साइन-अप के लिए, आपके इनबॉक्स में भेजा गया सत्यापन कोड दर्ज करने के बाद), " +
          "आप सीधे डैशबोर्ड पर पहुंचते हैं — आपके और ऐप के बीच कोई अलग सेटअप स्क्रीन नहीं है।",
      },
      {
        type: "paragraph",
        text:
          "क्विक-सेटअप फॉर्म: जब आप पहली बार साइन इन करते हैं, तो एक छोटा \"Quick setup\" पॉप-अप दिखाई देता है जो आपसे उस कंपनी " +
          "या उत्पाद के बारे में पूछता है जिसके लिए आप इसका मूल्यांकन कर रहे हैं, कोई भी त्रुटियां जिनका आपने सामना किया है, और " +
          "आज आप इस टूल से जिस मुख्य सवाल का जवाब चाहते हैं। तीनों फ़ील्ड वैकल्पिक हैं। इसे सबमिट करना इस टूल की समीक्षा करने " +
          "वाले को यह समझने में मदद करता है कि इसका वास्तव में उपयोग कैसे किया जा रहा है; छोड़ना भी ठीक है। किसी भी तरह, यह " +
          "फिर से नहीं पूछेगा।",
      },
      { type: "figure", caption: "साइन-इन स्क्रीन" },
      { type: "figure", caption: "क्विक-सेटअप पॉप-अप" },
    ],
  };

  const sections: ManualSection[] = [
    {
      title: "साइन इन और सेटअप",
      purpose:
        "यह ऐप का प्रवेश बिंदु है और जहां आपका अकाउंट आपके अपने निजी वर्कस्पेस से जुड़ा होता है — वह कंटेनर जो आपके सभी फेल्योर मोड, " +
        "कंप्लायंस स्थिति और इतिहास को रखता है, किसी अन्य उपयोगकर्ता के डेटा से अलग। आप यहां एक बार अंदर आने के लिए आते हैं, और " +
        "फिर जब भी साइन आउट करते हैं।",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "ऐप खोलें। आपको एक दो-पैनल साइन-इन स्क्रीन दिखाई देगी: बाईं ओर एक फॉर्म, दाईं ओर रिस्क डैशबोर्ड का लाइव प्रीव्यू।",
            "Google से साइन इन करने के लिए, \"Continue with Google\" पर क्लिक करें और Google के प्रॉम्प्ट को पूरा करें — आप स्वचालित रूप से ऐप पर वापस आ जाते हैं।",
            "इसके बजाय ईमेल और पासवर्ड का उपयोग करने के लिए, दोनों फ़ील्ड भरें और \"Sign In\" पर क्लिक करें।",
            "अभी तक कोई अकाउंट नहीं है? \"No account? Create one\" पर क्लिक करें, एक ईमेल और पासवर्ड दर्ज करें, और \"Create Account\" पर क्लिक करें।",
            "अकाउंट बनाना पूरा करने के लिए अपने ईमेल पर भेजा गया सत्यापन कोड दर्ज करें और \"Verify Email\" पर क्लिक करें।",
            "केवल पहली बार साइन-इन पर, क्विक सेटअप पॉप-अप का जवाब दें या छोड़ें (ऊपर शुरुआत करना देखें)।",
            "आप सीधे डैशबोर्ड पर पहुंचते हैं — कोई अतिरिक्त लोडिंग या सेटअप चरण नहीं।",
          ],
        },
        { type: "figure", caption: "साइन-इन स्क्रीन" },
      ],
    },
    {
      title: "डैशबोर्ड",
      purpose:
        "आपका एक-नज़र में जोखिम सारांश, और हर सत्र शुरू करने की जगह। यह हर व्यक्तिगत फेल्योर मोड को पढ़े बिना \"यह डिवाइस अभी, " +
        "कुल मिलाकर कितना जोखिम भरा है?\" का जवाब देता है — और यह वह जगह है जहां कहीं और बदलाव करने के बाद वापस आना है, यह " +
        "पुष्टि करने के लिए कि उन्होंने संख्याओं को अपेक्षा के अनुसार बदला है।",
      blocks: [
        {
          type: "paragraph",
          text:
            "शीर्ष पर चार स्टेट कार्ड दिखाते हैं कि कितने फेल्योर मोड दर्ज किए गए हैं, उन सभी में औसत RPN, वर्तमान में रिकॉर्ड पर " +
            "एकल उच्चतम RPN, और आपका लाइव ISO 14971 कंप्लायंस प्रतिशत।",
        },
        {
          type: "term",
          term: "RPN (Risk Priority Number)",
          definition:
            "जोखिम को प्राथमिकता देने के लिए उपयोग किया जाने वाला एक ही स्कोर। इसकी गणना सेवेरिटी × ऑकरेंस × डिटेक्टेबिलिटी के रूप " +
            "में की जाती है — तीन संख्याएं जो आप हर फेल्योर मोड को देते हैं (नीचे FMEA वर्कस्पेस देखें) — इसलिए यह हमेशा 1 (तीन 1) " +
            "से 1000 (तीन 10) तक होता है। उच्च RPN का मतलब है कि फेल्योर मोड को जल्दी ध्यान देने की आवश्यकता है।",
        },
        {
          type: "paragraph",
          text: "ALARP जोखिम विश्लेषण डोनट चार्ट हर फेल्योर मोड को उसके RPN के आधार पर तीन जोखिम बैंड में से एक में समूहित करता है।",
        },
        {
          type: "term",
          term: "ALARP",
          definition:
            "As Low As Reasonably Practicable का संक्षिप्त रूप — स्वीकार्य और अस्वीकार्य के बीच का मध्य जोखिम बैंड। एक फेल्योर " +
            "मोड यहां आता है जब उसका RPN आपकी स्वीकार्य सीमा से ऊपर लेकिन अस्वीकार्य सीमा से नीचे होता है (दोनों सेटिंग्स में " +
            "कॉन्फ़िगर करने योग्य); अनिवार्य न होने पर भी मिटिगेशन पर विचार किया जाना चाहिए।",
        },
        {
          type: "paragraph",
          text:
            "शीर्ष 5 सर्वाधिक जोखिम वाले फेल्योर मोड RPN के अनुसार पांच सबसे खराब स्कोरिंग फेल्योर मोड को कंपोनेंट और बैंड के " +
            "साथ सूचीबद्ध करता है, ताकि आप पूरे रिस्क रजिस्टर को स्क्रॉल किए बिना सीधे जिस चीज़ पर ध्यान देने की आवश्यकता है " +
            "वहां जा सकें।",
        },
        {
          type: "paragraph",
          text:
            "हाल की गतिविधि आपके वर्कस्पेस में नवीनतम बदलाव दिखाती है — स्कोर संपादन, कंप्लायंस स्थिति परिवर्तन, नए फेल्योर मोड " +
            "— हर एक के साथ यह कि इसे किसने और कब बनाया, ताकि आप या कोई रिव्यूअर हर स्क्रीन खोदे बिना देख सकें कि क्या बदला है।",
        },
        { type: "figure", caption: "डैशबोर्ड अवलोकन" },
        { type: "figure", caption: "ALARP जोखिम विश्लेषण चार्ट" },
      ],
    },
    {
      title: "डिवाइस लाइब्रेरी",
      purpose:
        "स्कोरिंग में गोता लगाने से पहले दिखाता है कि इस वर्कस्पेस का डेटा वास्तव में किस डिवाइस के बारे में है, और उसका कंपोनेंट " +
        "विवरण। एक नए टीम सदस्य या रिव्यूअर के लिए ओरिएंटेशन चरण के रूप में उपयोगी जिन्हें संख्याओं को देखने से पहले यह जानने की " +
        "आवश्यकता है कि क्या मूल्यांकन किया जा रहा है।",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "शीर्ष पर हाइलाइट किया गया कार्ड सक्रिय डिवाइस दिखाता है — इस बिल्ड के लिए, पोर्टेबल अल्ट्रासाउंड प्रोब — इसकी कंपोनेंट संख्या और कुल दर्ज फेल्योर मोड के साथ।",
            `इसके नीचे हर ट्रैक किए गए कंपोनेंट का एक ग्रिड है, हर एक के साथ यह क्या करता है और जोखिम के लिए यह क्यों मायने रखता है इसका एक-पंक्ति विवरण। वर्तमान कंपोनेंट हैं: ${components
              .map((c) => c.name)
              .join(", ")}। यह वही सूची है जिससे आप FMEA वर्कस्पेस में चुनेंगे।`,
            "यहां से सीधे स्कोरिंग में जाने के लिए \"FMEA वर्कस्पेस खोलें →\" पर क्लिक करें।",
            "आगे नीचे, अतिरिक्त डिवाइस प्रकार \"जल्द आ रहा है\" के रूप में चिह्नित दिखाई देते हैं — इस बिल्ड में अभी मूल्यांकन के लिए उपलब्ध नहीं, लेकिन इस बात का पूर्वावलोकन कि टूल कहां जा रहा है।",
          ],
        },
        { type: "figure", caption: "डिवाइस लाइब्रेरी — कंपोनेंट ग्रिड" },
      ],
    },
    {
      title: "FMEA वर्कस्पेस",
      purpose:
        "जहां वास्तविक जोखिम विश्लेषण होता है — जहां आप एक कंपोनेंट के फेल होने के एक विशिष्ट तरीके को दर्ज करते हैं, यह कितना बुरा " +
        "होगा, यह कितना संभावित है, और इसे पकड़ना कितना कठिन होगा — और जहां टूल इसे एक प्राथमिकता वाले, ISO 14971-संरेखित जोखिम " +
        "स्कोर में बदल देता है। ऐप में आपका अधिकांश समय यहीं व्यतीत होगा।",
      blocks: [
        {
          type: "paragraph",
          text:
            "कंपोनेंट के अनुसार फ़िल्टर करें: बाईं ओर इंटरैक्टिव प्रोब डायग्राम डिवाइस का एक सरलीकृत चित्रण है जिसमें हर लेबल किए " +
            "गए कंपोनेंट पर एक रंगीन डॉट है। केवल उस कंपोनेंट तक फेल्योर-मोड सूची को फ़िल्टर करने के लिए किसी डॉट को टैप करें; " +
            "फिर से सब कुछ देखने के लिए \"Clear filter\" टैप करें। पास का शीथ टॉगल दिखाता है कि क्या एक सुरक्षात्मक शीथ वर्तमान " +
            "में लागू के रूप में मॉडल किया गया है, और आप जिस परिदृश्य का आकलन कर रहे हैं उसे प्रतिबिंबित करने के लिए स्विच किया " +
            "जा सकता है।",
        },
        {
          type: "paragraph",
          text:
            "एक नया फेल्योर मोड जोड़ें: एक फॉर्म खोलने के लिए \"+ Add Failure Mode\" पर क्लिक करें। वह कंपोनेंट चुनें जिस पर यह " +
            "लागू होता है, फिर एक संक्षिप्त फेल्योर मोड विवरण (भाग के फेल होने का विशिष्ट तरीका), प्रभाव (परिणामस्वरूप क्या " +
            "होता है), कारण (यह क्यों होता है), मानक जिसके खिलाफ इसका आकलन किया जा रहा है (डिफ़ॉल्ट रूप से ISO 14971), और एक " +
            "मिटिगेशन (कौन सा डिज़ाइन परिवर्तन, प्रक्रिया, या जांच इस जोखिम को कम करती है) भरें।",
        },
        {
          type: "paragraph",
          text:
            "इसे भरते समय AI सहायता: दो वैकल्पिक बटन आपके निर्णय को बदले बिना दस्तावेज़ीकरण को तेज़ करते हैं। \"AI से मिटिगेशन " +
            "ड्राफ्ट करें\" अब तक दर्ज किए गए मोड/प्रभाव/कारण से एक संभावित मिटिगेशन लिखता है — यह फ़ील्ड को पहले से भरता है लेकिन " +
            "पूरी तरह से संपादन योग्य रहता है, और तब तक कभी सेव नहीं होता जब तक आप खुद Save पर क्लिक नहीं करते। \"AI से स्कोर " +
            "सुझाएं\" प्रत्येक के लिए एक-पंक्ति के तर्क के साथ सेवेरिटी, ऑकरेंस और डिटेक्टेबिलिटी मान प्रस्तावित करता है, स्टेपर्स " +
            "के बगल में दिखाया जाता है ताकि आप (और एक रिव्यूअर) केवल संख्याएं नहीं बल्कि तर्क देख सकें — स्टेपर्स बाद में संपादन " +
            "योग्य रहते हैं। दोनों को पहले कम से कम एक फेल्योर मोड विवरण टाइप करने की आवश्यकता है, और यदि AI सेवा उपलब्ध नहीं है " +
            "तो दोनों आपकी अन्य प्रविष्टियों को खोए बिना एक स्पष्ट इनलाइन त्रुटि पर वापस आ जाते हैं।",
        },
        {
          type: "term",
          term: "सेवेरिटी (S)",
          definition:
            "यदि यह फेल्योर होता है तो परिणाम कितना बुरा होगा, 1 (नगण्य, कोई वास्तविक प्रभाव नहीं) से 10 (रोगी या ऑपरेटर को " +
            "विनाशकारी नुकसान) तक। सबसे अच्छे मामले के बजाय सबसे खराब उचित रूप से अपेक्षित परिणाम के खिलाफ इसे स्कोर करें।",
        },
        {
          type: "term",
          term: "ऑकरेंस (O)",
          definition:
            "वास्तविक उपयोग में यह फेल्योर कितनी बार होने की उम्मीद है, 1 (दुर्लभ — डिवाइस के जीवनकाल में बहुत असंभावित) से 10 " +
            "(बार-बार — सामान्य उपयोग में अपेक्षित) तक।",
        },
        {
          type: "term",
          term: "डिटेक्टेबिलिटी (D)",
          definition:
            "नुकसान पहुंचाने से पहले फेल्योर के पकड़े जाने की कितनी संभावना है। यह आपकी अपेक्षा के विपरीत दिशा में चलता है: 1 का " +
            "मतलब है कि यह लगभग हमेशा पकड़ा जाता है (जैसे एक स्वचालित सेल्फ-टेस्ट इसे हर बार पकड़ लेता है), 10 का मतलब है कि " +
            "नुकसान होने से पहले इसे पता लगाना बहुत कठिन या असंभव है।",
        },
        {
          type: "paragraph",
          text:
            "\"Save\" पर क्लिक करें। टूल तुरंत RPN = S × O × D की गणना करता है और आपके कॉन्फ़िगर किए गए सीमाओं (सेटिंग्स देखें) " +
            "के आधार पर एक ALARP बैंड (स्वीकार्य, ALARP, या अस्वीकार्य) असाइन करता है। दोनों तुरंत फेल्योर मोड के कार्ड पर " +
            "दिखाई देते हैं — कोई अलग सेव-और-रिफ्रेश चरण नहीं है। बाद में किसी मौजूदा फेल्योर मोड के स्कोर को बदलने के लिए, " +
            "उसका कार्ड खोलें और सीधे S, O या D समायोजित करें — जैसे ही आप कोई मान बदलते हैं RPN और उसका बैंड फिर से गणना " +
            "करते हैं।",
        },
        {
          type: "paragraph",
          text:
            "सुझाए गए फेल्योर मोड: \"✨ फेल्योर मोड सुझाएं (AI)\" पैनल मांग पर चयनित कंपोनेंट के लिए 2-3 संभावित फेल्योर मोड " +
            "जनरेट करता है, हर एक के साथ एक संक्षिप्त तर्क, उस कंपोनेंट के लिए पहले से दर्ज किए गए के खिलाफ जांचा गया ताकि यह " +
            "खुद को दोहराए नहीं। यदि सर्वर पर कोई AI कुंजी कॉन्फ़िगर नहीं है, तो यह स्वचालित रूप से एक छोटी बिल्ट-इन क्यूरेटेड " +
            "सूची पर वापस आ जाता है, जिसे स्पष्ट रूप से इस रूप में लेबल किया गया है। किसी सुझाव को ड्राफ्ट प्रविष्टि के रूप में " +
            "जोड़ने के लिए \"+ FMEA वर्कस्पेस में जोड़ें\" पर क्लिक करें (डिफ़ॉल्ट रूप से 5/5/5 स्कोर किया गया, प्रभाव, कारण और " +
            "मिटिगेशन \"टीम समीक्षा लंबित\" के रूप में चिह्नित) — इसे अंतिम मानने से पहले इसकी समीक्षा करें और इसे सुधारें।",
        },
        { type: "figure", caption: "FMEA वर्कस्पेस — प्रोब डायग्राम और फ़िल्टर" },
        { type: "figure", caption: "फेल्योर मोड जोड़ें फॉर्म" },
        { type: "figure", caption: "S-O-D स्कोर के साथ फेल्योर मोड कार्ड" },
      ],
    },
    {
      title: "रिस्क रजिस्टर",
      purpose:
        "वर्कस्पेस में हर फेल्योर मोड की मास्टर तालिका, एक सॉर्ट करने योग्य, खोजने योग्य, फ़िल्टर करने योग्य सूची में — जहां आप " +
        "कुछ विशिष्ट खोजने या कंपोनेंट के अनुसार ब्राउज़ करने के बजाय एक फ्लैट सूची के रूप में पूरी जोखिम तस्वीर की समीक्षा करने " +
        "की आवश्यकता होने पर जाते हैं।",
      blocks: [
        {
          type: "bullets",
          items: [
            "फेल्योर मोड विवरण या कंपोनेंट नाम में किसी भी टेक्स्ट के अनुसार फ़िल्टर करने के लिए खोज बॉक्स में टाइप करें।",
            "किसी विशेष जोखिम बैंड में केवल फेल्योर मोड दिखाने के लिए सभी / स्वीकार्य / ALARP / अस्वीकार्य पिल्स का उपयोग करें।",
            "उस कॉलम के अनुसार सॉर्ट करने के लिए किसी भी कॉलम हेडर (#, कंपोनेंट, S, O, D, RPN) पर क्लिक करें; क्रम उलटने के लिए फिर से क्लिक करें।",
            "हर पंक्ति सेवेरिटी, ऑकरेंस, डिटेक्टेबिलिटी, गणना किया गया RPN, और ALARP वर्गीकरण दिखाती है, ताकि आप हर एक को खोले बिना फेल्योर मोड की तुलना साथ-साथ कर सकें।",
          ],
        },
        { type: "figure", caption: "रिस्क रजिस्टर — RPN के अनुसार सॉर्ट किया गया" },
      ],
    },
    {
      title: "एनालिटिक्स",
      purpose:
        "जहां आप व्यक्तिगत फेल्योर मोड से पीछे हटकर पैटर्न देखते हैं — कौन से कंपोनेंट कुल मिलाकर सबसे जोखिम भरे हैं, RPN कैसे " +
        "वितरित है, और समय के साथ तस्वीर कैसे बदली है। जोखिम-प्रबंधन सारांश तैयार करते समय या किसी रिव्यूअर को प्रगति की रिपोर्ट " +
        "करते समय इसका उपयोग करें।",
      blocks: [
        {
          type: "paragraph",
          text:
            "फेल्योर मोड के अनुसार RPN बार चार्ट हर दर्ज फेल्योर मोड के RPN को दिखाता है, ALARP बैंड के अनुसार रंग-कोडित, ताकि " +
            "आप एक नज़र में समग्र जोखिम वितरण देख सकें।",
        },
        {
          type: "paragraph",
          text:
            "रिस्क हीटमैप हर कंपोनेंट को उसके औसत RPN और फेल्योर-मोड गणना के साथ सूचीबद्ध करता है, रंग-तीव्रता-कोडित — पंक्ति " +
            "जितनी अधिक तीव्र होगी, वह कंपोनेंट औसतन उतना ही अधिक जोखिम भरा होगा, जिससे यह देखना आसान हो जाता है कि डिवाइस के " +
            "किस हिस्से को सबसे अधिक ध्यान देने की आवश्यकता है।",
        },
        {
          type: "paragraph",
          text:
            "रिस्क स्नैपशॉट आपको एक बेसलाइन कैप्चर करने देते हैं। \"+ स्नैपशॉट सेव करें\" पर क्लिक करें, इसे एक नाम दें (जैसे " +
            "\"मिटिगेशन-पूर्व बेसलाइन\"), और यह उस समय के वर्तमान औसत RPN, जोखिम-बैंड गणना, और कंप्लायंस स्कोर को संग्रहीत करता " +
            "है। बाद में, बदलाव करने के बाद, यह देखने के लिए कि उन नंबरों में से हर एक कैसे बदला है, एक सहेजे गए स्नैपशॉट पर " +
            "\"तुलना करें\" पर क्लिक करें — यह दिखाने के लिए उपयोगी कि मिटिगेशन ने वास्तव में जोखिम कम किया।",
        },
        {
          type: "paragraph",
          text: "नीचे रिस्क हिस्ट्री और ऑडिट ट्रेल वर्कस्पेस में किए गए हर बदलाव का पूरा, टाइमस्टैम्प किया गया लॉग है, एक ही जगह पर।",
        },
        { type: "figure", caption: "एनालिटिक्स — RPN चार्ट और हीटमैप" },
        { type: "figure", caption: "रिस्क स्नैपशॉट तुलना" },
      ],
    },
    {
      title: "कंप्लायंस",
      purpose:
        "ट्रैक करता है कि आपकी जोखिम-प्रबंधन फ़ाइल ISO 14971:2019 के वास्तविक क्लॉज़ के खिलाफ, क्लॉज़ दर क्लॉज़, कितनी पूर्ण है, " +
        "ताकि आप हमेशा जानें कि क्या हो चुका है, क्या आंशिक है, और अभी भी क्या लंबित है — यह वह स्क्रीन है जिसे एक रेगुलेटरी " +
        "रिव्यूअर या ऑडिटर सबसे पहले देखेगा।",
      blocks: [
        {
          type: "paragraph",
          text:
            "शीर्ष पर रिंग आपका लाइव कंप्लायंस स्कोर है — पूर्ण के रूप में चिह्नित क्लॉज़ का प्रतिशत, जब भी किसी क्लॉज़ की " +
            "स्थिति बदलती है तो तुरंत फिर से गणना करता है।",
        },
        {
          type: "term",
          term: "क्लॉज़ स्थिति",
          definition:
            "हर क्लॉज़ की तीन स्थितियों में से एक होती है: पूर्ण (पूरी तरह से संबोधित), आंशिक (प्रगति पर या आंशिक रूप से " +
            "संबोधित), या लंबित (अभी तक शुरू नहीं हुआ)। पूर्ण आपके कंप्लायंस स्कोर की ओर पूरी तरह से गिना जाता है, आंशिक आधे " +
            "के रूप में गिना जाता है, लंबित शून्य के रूप में गिना जाता है।",
        },
        {
          type: "bullets",
          items: compliance.map((c) => `${c.clause} — ${c.title}: ${c.mapped} से मैप किया गया (वर्तमान में ${c.status}).`),
        },
        {
          type: "paragraph",
          text:
            "किसी क्लॉज़ की स्थिति को आगे बढ़ाने के लिए उस पर \"Mark as [अगली स्थिति]\" पर क्लिक करें। उस क्लॉज़ के लिए एक " +
            "सहायक फ़ाइल (इमेज, PDF, या टेक्स्ट दस्तावेज़) अपलोड करने के लिए \"+ Attach evidence\" पर क्लिक करें — वास्तविक " +
            "साइन-ऑफ दस्तावेज़, टेस्ट रिपोर्ट, या रिव्यू रिकॉर्ड को सीधे उस क्लॉज़ से जोड़े रखने के लिए उपयोगी जिसे यह संतुष्ट " +
            "करता है। संलग्न फ़ाइलें क्लॉज़ के नीचे क्लिक करने योग्य लिंक के रूप में दिखाई देती हैं; इसके बगल में ✕ के साथ एक " +
            "को हटाएं।",
        },
        { type: "figure", caption: "कंप्लायंस — स्कोर रिंग और क्लॉज़ ट्रैकर" },
      ],
    },
    {
      title: "AI सहायक",
      purpose:
        "एक बिल्ट-इन सहायक, Roger, जो सरल भाषा में FMEA अवधारणाओं, इस टूल के पीछे के मानकों, और आपके लाइव जोखिम डेटा के बारे " +
        "में सवालों का जवाब देता है — जब आप अन्य स्क्रीन खोजे बिना त्वरित उत्तर चाहते हैं, या किसी नए व्यक्ति को टूल समझाते " +
        "समय उपयोगी।",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "मैसेज बॉक्स में एक सवाल टाइप करें और Send (या Enter) दबाएं — Roger एक मुफ़्त, बिल्ट-इन नॉलेज बेस और आपके लाइव FMEA डेटा का उपयोग करके जवाब देता है, जिसमें आपका वर्तमान सर्वाधिक जोखिम वाला फेल्योर मोड या कंप्लायंस स्कोर जैसी चीज़ें शामिल हैं।",
            "जब सर्वर पर एक वास्तविक AI कुंजी जुड़ी होती है, तो Roger इसके बजाय पूर्ण खुली-समाप्त बातचीत में जवाब देता है, उसी लाइव डेटा और इस मैनुअल में आधारित, और सख्ती से FMEA/ISO 14971/आपके डेटा/इस ऐप तक सीमित रहता है — यह ऑफ-टॉपिक सवालों का जवाब देने के बजाय उन्हें विनम्रता से मना करता है और रीडायरेक्ट करता है।",
            "सामान्य सवालों के लिए बाईं ओर एक क्विक प्रॉम्प्ट का उपयोग करें — किसी एक पर क्लिक करने से यह तुरंत भेज दिया जाता है।",
            "अपने मैसेज में एक फ़ाइल जोड़ने के लिए अटैच आइकन पर क्लिक करें। टेक्स्ट-आधारित फ़ाइलें (.txt, .csv, .json, .md) पढ़ी जाती हैं और Roger के उत्तर के लिए संदर्भ के रूप में शामिल की जाती हैं; फ़ोटो भी संलग्न की जा सकती हैं, लेकिन किसी इमेज में वास्तव में क्या है यह समझने के लिए एक जुड़ी हुई AI कुंजी की आवश्यकता है (सेटिंग्स देखें) — बिना किसी के, Roger केवल यह स्वीकार कर सकता है कि एक फ़ोटो संलग्न की गई थी।",
            "वेब बिल्ड पर, टाइप करने के बजाय अपना सवाल बोलने के लिए माइक्रोफ़ोन आइकन पर क्लिक करें।",
            "किसी भी समय एक नई चैट शुरू करने के लिए \"बातचीत साफ़ करें\" पर क्लिक करें।",
          ],
        },
        { type: "figure", caption: "AI सहायक — Roger के साथ चैट" },
      ],
    },
    {
      title: "रिपोर्ट जनरेटर",
      purpose:
        "आपके लाइव वर्कस्पेस डेटा को दो शेयर करने योग्य PDF दस्तावेज़ों में बदल देता है — एक जोखिम-प्रबंधन फ़ाइल के लिए एक " +
        "औपचारिक जोखिम-आकलन रिपोर्ट, और यह वॉकथ्रू गाइड खुद — बिना कुछ भी मैन्युअल रूप से इकट्ठा करने की आवश्यकता के।",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "एक संरचित FMEA रिपोर्ट तैयार करने के लिए \"PDF रिपोर्ट जनरेट करें\" पर क्लिक करें: कवर पेज, सारांश आंकड़े, S/O/D/RPN/वर्गीकरण के साथ पूरी फेल्योर-मोड तालिका, मिटिगेशन नोट्स, और एक ISO 14971:2019 कंप्लायंस सारांश — अभी आपके वर्कस्पेस में जो कुछ भी है उससे ताज़ा बनाया गया।",
            "इस क्विकस्टार्ट गाइड को डाउनलोड करने योग्य PDF के रूप में तैयार करने के लिए \"उपयोगकर्ता मैनुअल जनरेट करें (PDF)\" पर क्लिक करें — किसी मेंटर, रिव्यूअर, या नए टीम सदस्य के लिए छोड़ने वाले दस्तावेज़ के रूप में उपयोगी।",
            "दोनों PDF वर्तमान में सेटिंग्स में चयनित भाषा में जनरेट किए जाते हैं, उनके हेडर और सेक्शन शीर्षकों सहित।",
            "दोनों डाउनलोड सीधे आपके ब्राउज़र के डिफ़ॉल्ट डाउनलोड स्थान में सेव होते हैं।",
          ],
        },
        { type: "figure", caption: "रिपोर्ट जनरेटर स्क्रीन" },
      ],
    },
    {
      title: "सेटिंग्स",
      purpose:
        "जहां आप कॉन्फ़िगर करते हैं कि टूल जोखिम को कैसे स्कोर और वर्गीकृत करता है, AI सहायक के व्यवहार का प्रबंधन करते हैं, अपनी " +
        "प्रदर्शन भाषा चुनते हैं, अपने डेटा का बैकअप लेते हैं या रीसेट करते हैं, और अपने अकाउंट का प्रबंधन करते हैं — एक स्क्रीन " +
        "जिस पर आप रोज़ के बजाय कभी-कभार जाएंगे।",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "दिखावट — लाइट और डार्क थीम के बीच टॉगल करें।",
            "भाषा — ऐप की प्रदर्शन भाषा को अंग्रेज़ी, हिंदी और தமிழ் के बीच बदलें; परिवर्तन तुरंत हर स्क्रीन पर लागू होता है, और अगली बार जब आप ऐप खोलते हैं तो याद रखा जाता है।",
            "RPN स्कोरिंग कॉन्फ़िगरेशन — वह RPN मान सेट करें जिस पर एक फेल्योर मोड ALARP बन जाता है, और वह मान जिस पर यह अस्वीकार्य बन जाता है। ये दो सीमाएं वही हैं जिनके खिलाफ हर ALARP बैज और डैशबोर्ड का जोखिम विश्लेषण गणना किया जाता है, इसलिए इन्हें बदलने से हर फेल्योर मोड तुरंत फिर से वर्गीकृत हो जाता है।",
            "AI सहायक — यदि एक वास्तविक AI कुंजी जुड़ी है तो Roger किस मॉडल का उपयोग करेगा यह चुनें (जब तक कोई एडमिनिस्ट्रेटर सर्वर पर एक नहीं जोड़ता तब तक कोई प्रभाव नहीं), और Roger का दायरा सेट करें: रीडायरेक्ट Roger को ऑफ-टॉपिक सवालों को धीरे से FMEA/ऐप पर वापस लाने देता है; मना करें Roger को उन्हें सीधे अस्वीकार करने देता है।",
            "सीमा, AI, और दायरा परिवर्तन लागू करने के लिए \"सेटिंग्स सेव करें\" पर क्लिक करें।",
            "डेटा प्रबंधन — \"JSON एक्सपोर्ट करें\" आपके फेल्योर मोड और कंप्लायंस डेटा का पूरा बैकअप डाउनलोड करता है; \"JSON इम्पोर्ट करें\" पहले एक्सपोर्ट की गई बैकअप फ़ाइल से पुनर्स्थापित करता है; \"डेमो डेटा रीसेट करें\" सब कुछ मूल सीड किए गए डेटासेट में वापस बदल देता है (पूर्ववत नहीं किया जा सकता — पहले आपसे पुष्टि करने के लिए कहा जाएगा)।",
            "अकाउंट — दिखाता है कि आप किस रूप में साइन इन हैं, एक \"साइन आउट करें\" बटन के साथ।",
          ],
        },
        { type: "figure", caption: "सेटिंग्स — स्कोरिंग सीमाएं और डेटा प्रबंधन" },
      ],
    },
  ];

  const workflow = [
    "FMEA वर्कस्पेस खोलें और प्रोब डायग्राम पर उस कंपोनेंट को टैप करें — या \"+ Add Failure Mode\" फॉर्म में इसे चुनें — जिसका आप आकलन करना चाहते हैं।",
    "\"+ Add Failure Mode\" पर क्लिक करें और फेल्योर मोड, उसके प्रभाव, उसके कारण, और एक मिटिगेशन का वर्णन करें।",
    "ऊपर दी गई परिभाषाओं का उपयोग करके सेवेरिटी, ऑकरेंस और डिटेक्टेबिलिटी को स्कोर करें, और Save पर क्लिक करें — RPN और उसका ALARP बैंड तुरंत दिखाई देता है।",
    "यह पुष्टि करने के लिए रिस्क रजिस्टर खोलें कि नई प्रविष्टि आपकी अन्य जोखिमों के सापेक्ष जहां आप अपेक्षा करेंगे वहां सॉर्ट होती है।",
    "यदि यह ALARP या अस्वीकार्य में आता है, तो कंप्लायंस पर जाएं और जांचें कि क्या संबंधित क्लॉज़ (जैसे रिस्क कंट्रोल) को नए मिटिगेशन को दर्शाने के लिए अपडेट करने की आवश्यकता है, और कोई भी सहायक साक्ष्य संलग्न करें।",
    "आगे बदलाव करने से पहले एनालिटिक्स खोलें और एक स्नैपशॉट सेव करें, ताकि बाद में तुलना करने के लिए आपके पास एक बेसलाइन हो।",
    "इसे सैनिटी-चेक करने के लिए AI सहायक से \"अभी सबसे अधिक जोखिम वाला फेल्योर मोड कौन सा है?\" पूछें, या किसी भी अस्पष्ट चीज़ के बारे में पूछें।",
    "अपने समग्र जोखिम सारांश और कंप्लायंस स्कोर में परिलक्षित नए फेल्योर मोड को देखने के लिए डैशबोर्ड जांचें।",
    "तैयार होने पर, अपनी जोखिम-प्रबंधन फ़ाइल के लिए एक अपडेट किया गया PDF रिपोर्ट तैयार करने के लिए रिपोर्ट जनरेटर का उपयोग करें।",
  ];

  const faq: { q: string; a: string }[] = [
    {
      q: "मेरे जोखिम के लिए ALARP का क्या मतलब है?",
      a: "इसका मतलब है कि फेल्योर मोड का RPN आपकी स्वीकार्य और अस्वीकार्य सीमाओं (सेटिंग्स में सेट) के बीच आता है — यह स्वचालित रूप से अस्वीकृत नहीं है, लेकिन आपको यह दस्तावेज़ करना चाहिए कि आगे मिटिगेशन उचित रूप से व्यावहारिक क्यों नहीं है, या इसे नीचे लाने के लिए बदलाव करें।",
    },
    {
      q: "मैं स्कोरिंग सीमाएं कैसे बदलूं?",
      a: "सेटिंग्स → RPN स्कोरिंग कॉन्फ़िगरेशन पर जाएं, \"ALARP शुरू होने का मान\" और \"अस्वीकार्य शुरू होने का मान\" समायोजित करें, फिर सेटिंग्स सेव करें पर क्लिक करें। हर फेल्योर मोड का वर्गीकरण तुरंत अपडेट होता है।",
    },
    {
      q: "मेरा RPN गलत लग रहा है — मुझे क्या जांचना चाहिए?",
      a: "RPN हमेशा सेवेरिटी × ऑकरेंस × डिटेक्टेबिलिटी होता है। FMEA वर्कस्पेस में फेल्योर मोड खोलें और तीन व्यक्तिगत स्कोर जांचें — एक को सही करने से RPN तुरंत फिर से गणना करता है।",
    },
    {
      q: "मेरे कंप्लायंस स्कोर की गणना कैसे की जाती है?",
      a: "हर क्लॉज़ पूर्ण = 100%, आंशिक = 50%, लंबित = 0% गिनता है, हर क्लॉज़ में औसत। लाइव नंबर देखने और व्यक्तिगत क्लॉज़ स्थितियों को अपडेट करने के लिए कंप्लायंस देखें।",
    },
    {
      q: "क्या मैं डेमो डेटा रीसेट को पूर्ववत कर सकता हूं?",
      a: "नहीं — यह स्थायी रूप से आपके फेल्योर मोड, कंप्लायंस डेटा, और स्नैपशॉट को मूल सीड किए गए डेटासेट से बदल देता है। यदि आप अपना वर्तमान डेटा रखना चाहते हैं तो पहले एक बैकअप एक्सपोर्ट करें (सेटिंग्स → JSON एक्सपोर्ट करें)।",
    },
    {
      q: "क्या AI सहायक को इंटरनेट कनेक्शन या भुगतान की गई कुंजी की आवश्यकता है?",
      a: "नहीं — Roger का बिल्ट-इन नॉलेज बेस और आपके लाइव डेटा तक पहुंच बिना किसी कुंजी और बिना किसी लागत के काम करती है। एक जुड़ी हुई AI कुंजी (एक एडमिनिस्ट्रेटर द्वारा सेटअप) इसके ऊपर केवल पूरी तरह से खुली-समाप्त बातचीत और इमेज व्याख्या जोड़ती है।",
    },
    {
      q: "क्या मैं ऐप को हिंदी या तमिल में उपयोग कर सकता हूं?",
      a: "हां — सेटिंग्स → भाषा पर जाएं और English, हिंदी या தமிழ் चुनें। पूरा ऐप, इस मैनुअल और FMEA रिपोर्ट PDF सहित, तुरंत बदल जाता है।",
    },
    {
      q: "एक्सपोर्ट किए गए PDF और JSON बैकअप कहां जाते हैं?",
      a: "वे आपके ब्राउज़र के डिफ़ॉल्ट डाउनलोड फ़ोल्डर में डाउनलोड होते हैं, ठीक उसी तरह जैसे आप किसी वेबसाइट से कोई अन्य फ़ाइल डाउनलोड करते हैं।",
    },
  ];

  return { intro, gettingStarted, sections, workflow, faq };
}

function buildManualContentTa({ components, compliance }: BuilderArgs): ManualContent {
  const intro =
    "MedRisk Lite என்பது மருத்துவ உபகரணங்களை உருவாக்கும் அல்லது மதிப்பீடு செய்யும் குழுக்களுக்கான ஒரு Failure Mode and Effects " +
    "Analysis (FMEA) கருவி — இந்த பதிப்பில், குறைந்த வளங்கள் கொண்ட சூழல்களில் பாயிண்ட்-ஆஃப்-கேர் பயன்பாட்டிற்காக வடிவமைக்கப்பட்ட " +
    "ஒரு பீடபிள் அல்ட்ராசவுண்ட் புரோப். இது ISO 14971:2019 இல் வரையறுக்கப்பட்ட ரிஸ்க்-மேலாண்மை செயல்முறையைப் பின்பற்றுகிறது, இது " +
    "மருத்துவ உபகரண ரிஸ்க் மேலாண்மைக்கான முதன்மை சர்வதேச தரநிலை, மற்றும் தொடர்புடையவற்றில் IEC 60601-1 (மின் மற்றும் இயந்திர " +
    "பாதுகாப்பு), IEC 62366-1 (பயன்பாட்டு பொறியியல்) மற்றும் ISO 13485:2016 (தர மேலாண்மை) ஆகியவற்றைக் குறிப்பிடுகிறது. இந்த " +
    "வழிகாட்டி MedRisk Lite-ஐ தினமும் பயன்படுத்தும் எவருக்கும் — தோல்வி வகைகளை பதிவு செய்யும் ஒரு டிவைஸ் இன்ஜினியர், இணக்க " +
    "நிலையை சரிபார்க்கும் ஒரு தர அல்லது ஒழுங்குமுறை மதிப்பாய்வாளர், அல்லது கருவியின் வழிகாட்டியைப் பெறும் ஒரு வழிகாட்டி அல்லது " +
    "மதிப்பீட்டாளர் — ஆகியோருக்கானது. FMEA பின்னணி தேவையில்லை: ஒவ்வொரு சொல்லும் அது முதலில் வரும்போது எளிய மொழியில் " +
    "வரையறுக்கப்படுகிறது.";

  const gettingStarted: ManualSection = {
    title: "தொடங்குதல்",
    purpose:
      "எல்லாவற்றிற்கும் முன்: ஒரு கணக்கை எவ்வாறு பெறுவது, நீங்கள் முதல் முறையாக உள்நுழையும் போது என்ன நடக்கும், மற்றும் அந்த " +
      "ஒருமுறை பாப்-அப் உங்களிடம் என்ன கேட்கிறது.",
    blocks: [
      {
        type: "paragraph",
        text:
          "கணக்கு உருவாக்கம்: உள்நுழைவு திரையில், ஏற்கனவே உள்ள Google கணக்குடன் உள்நுழைய \"Continue with Google\" ஐ " +
          "கிளிக் செய்யவும், அல்லது அதற்குக் கீழே உள்ள மின்னஞ்சல் மற்றும் கடவுச்சொல் புலங்களைப் பயன்படுத்தவும் — " +
          "உள்நுழைவதற்குப் பதிலாக பதிவு செய்கிறீர்கள் என்றால் முதலில் \"No account? Create one\" ஐ கிளிக் செய்யவும்.",
      },
      {
        type: "paragraph",
        text:
          "முதல் உள்நுழைவு: நீங்கள் உள்நுழைந்தவுடன் (மற்றும், மின்னஞ்சல் பதிவிற்கு, உங்கள் இன்பாக்ஸுக்கு அனுப்பப்பட்ட " +
          "சரிபார்ப்புக் குறியீட்டை உள்ளிட்டவுடன்), நீங்கள் நேரடியாக டாஷ்போர்டில் வந்திறங்குகிறீர்கள் — உங்களுக்கும் " +
          "ஆப்பிற்கும் இடையே தனி அமைவு திரை எதுவும் இல்லை.",
      },
      {
        type: "paragraph",
        text:
          "விரைவு-அமைவு படிவம்: நீங்கள் முதல் முறையாக உள்நுழையும்போது, நீங்கள் இதை எதற்காக மதிப்பீடு செய்கிறீர்கள் என்ற " +
          "நிறுவனம் அல்லது தயாரிப்பு, நீங்கள் எதிர்கொண்ட ஏதேனும் பிழைகள், மற்றும் இன்று இந்த கருவி எந்த முக்கிய கேள்விக்கு " +
          "பதிலளிக்க வேண்டும் என்று நீங்கள் விரும்புகிறீர்கள் என்பதைக் கேட்கும் ஒரு சிறிய \"Quick setup\" பாப்-அப் " +
          "தோன்றும். மூன்று புலங்களும் விருப்பமானவை. சமர்ப்பிப்பது இந்த கருவியை மதிப்பாய்வு செய்பவர் அது எவ்வாறு " +
          "பயன்படுத்தப்படுகிறது என்பதைப் புரிந்துகொள்ள உதவுகிறது; தவிர்ப்பதும் சரியே. எப்படியிருந்தாலும், இது மீண்டும் " +
          "கேட்காது.",
      },
      { type: "figure", caption: "உள்நுழைவு திரை" },
      { type: "figure", caption: "விரைவு-அமைவு பாப்-அப்" },
    ],
  };

  const sections: ManualSection[] = [
    {
      title: "உள்நுழைவு மற்றும் அமைவு",
      purpose:
        "இது ஆப்பின் நுழைவு புள்ளி மற்றும் உங்கள் கணக்கு உங்கள் சொந்த தனிப்பட்ட பணியிடத்துடன் இணைக்கப்பட்டுள்ள இடம் — " +
        "உங்கள் அனைத்து தோல்வி வகைகள், இணக்க நிலை மற்றும் வரலாற்றையும் வைத்திருக்கும் கொள்கலன், மற்ற எந்தவொரு பயனரின் " +
        "தரவிலிருந்தும் தனியாக வைக்கப்பட்டுள்ளது. நீங்கள் உள்நுழைய ஒரு முறை இங்கு வருகிறீர்கள், மற்றும் நீங்கள் " +
        "வெளியேறும் ஒவ்வொரு முறையும் மீண்டும்.",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "ஆப்பைத் திறக்கவும். நீங்கள் இரண்டு-பேனல் உள்நுழைவு திரையைக் காண்பீர்கள்: இடதுபுறம் ஒரு படிவம், வலதுபுறம் ரிஸ்க் டாஷ்போர்டின் லைவ் மாதிரி.",
            "Google உடன் உள்நுழைய, \"Continue with Google\" ஐ கிளிக் செய்து Google-இன் ப்ராம்ப்டை முடிக்கவும் — நீங்கள் தானாகவே ஆப்பிற்குத் திரும்புவீர்கள்.",
            "அதற்குப் பதிலாக மின்னஞ்சல் மற்றும் கடவுச்சொல்லைப் பயன்படுத்த, இரண்டு புலங்களையும் நிரப்பி \"Sign In\" ஐ கிளிக் செய்யவும்.",
            "இன்னும் கணக்கு இல்லையா? \"No account? Create one\" ஐ கிளிக் செய்து, ஒரு மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிட்டு, \"Create Account\" ஐ கிளிக் செய்யவும்.",
            "கணக்கை உருவாக்குவதை முடிக்க உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிட்டு \"Verify Email\" ஐ கிளிக் செய்யவும்.",
            "முதல் உள்நுழைவின் போது மட்டும், விரைவு அமைவு பாப்-அப்பிற்கு பதிலளிக்கவும் அல்லது தவிர்க்கவும் (மேலே தொடங்குதல் பார்க்கவும்).",
            "நீங்கள் நேரடியாக டாஷ்போர்டில் வந்திறங்குகிறீர்கள் — கூடுதல் ஏற்றுதல் அல்லது அமைவு படி இல்லை.",
          ],
        },
        { type: "figure", caption: "உள்நுழைவு திரை" },
      ],
    },
    {
      title: "டாஷ்போர்டு",
      purpose:
        "உங்கள் ஒரே பார்வையில் ரிஸ்க் சுருக்கம், மற்றும் ஒவ்வொரு அமர்வையும் தொடங்கும் இடம். ஒவ்வொரு தனிப்பட்ட தோல்வி " +
        "வகையையும் படிக்க வேண்டிய அவசியமின்றி \"இந்த டிவைஸ் இப்போது, ​​ஒட்டுமொத்தமாக எவ்வளவு ரிஸ்க் நிறைந்தது?\" என்பதற்கு " +
        "இது பதிலளிக்கிறது — மேலும் வேறு இடங்களில் மாற்றங்களைச் செய்த பிறகு, அவை எண்களை நீங்கள் எதிர்பார்த்த வகையில் " +
        "நகர்த்தியதை உறுதிப்படுத்த இங்கு திரும்பி வர வேண்டிய இடம் இது.",
      blocks: [
        {
          type: "paragraph",
          text:
            "மேலே உள்ள நான்கு புள்ளிவிவர அட்டைகள் எத்தனை தோல்வி வகைகள் பதிவு செய்யப்பட்டுள்ளன, அவை அனைத்திலும் சராசரி RPN, " +
            "தற்போது பதிவில் உள்ள ஒற்றை அதிக RPN, மற்றும் உங்கள் லைவ் ISO 14971 இணக்க சதவீதத்தைக் காட்டுகின்றன.",
        },
        {
          type: "term",
          term: "RPN (Risk Priority Number)",
          definition:
            "ரிஸ்க்கிற்கு முன்னுரிமை அளிக்கப் பயன்படுத்தப்படும் ஒரே மதிப்பெண். இது தீவிரம் × நிகழ்வு × கண்டறியும் தன்மை " +
            "என கணக்கிடப்படுகிறது — நீங்கள் ஒவ்வொரு தோல்வி வகைக்கும் ஒதுக்கும் மூன்று எண்கள் (கீழே FMEA பணியிடம் " +
            "பார்க்கவும்) — எனவே இது எப்போதும் 1 (மூன்று 1கள்) முதல் 1000 (மூன்று 10கள்) வரை இருக்கும். அதிக RPN என்பது " +
            "ஒரு தோல்வி வகைக்கு விரைவில் கவனம் தேவை என்பதைக் குறிக்கிறது.",
        },
        {
          type: "paragraph",
          text: "ALARP ரிஸ்க் பகுப்பாய்வு டோனட் விளக்கப்படம் ஒவ்வொரு தோல்வி வகையையும் அதன் RPN அடிப்படையில் மூன்று ரிஸ்க் பட்டைகளில் ஒன்றாக குழுவாக்குகிறது.",
        },
        {
          type: "term",
          term: "ALARP",
          definition:
            "As Low As Reasonably Practicable என்பதன் சுருக்கம் — ஏற்கத்தக்கது மற்றும் ஏற்க முடியாதது இடையே உள்ள நடு " +
            "ரிஸ்க் பட்டை. ஒரு தோல்வி வகையின் RPN உங்கள் ஏற்கத்தக்க வரம்பிற்கு மேலும், ஏற்க முடியாத வரம்பிற்குக் " +
            "கீழும் இருக்கும்போது இது இங்கு வரும் (இரண்டும் அமைப்புகளில் கட்டமைக்கக்கூடியது); கட்டாயமில்லாவிட்டாலும் " +
            "தணிப்பு நடவடிக்கையைக் கருத்தில் கொள்ள வேண்டும்.",
        },
        {
          type: "paragraph",
          text:
            "மிக அதிக ரிஸ்க் உள்ள முதல் 5 தோல்வி வகைகள் RPN அடிப்படையில் ஐந்து மிக மோசமான மதிப்பெண் கொண்ட தோல்வி " +
            "வகைகளை, கூறு மற்றும் பட்டையுடன் பட்டியலிடுகிறது, இதனால் முழு ரிஸ்க் பதிவேட்டையும் ஸ்க்ரோல் செய்யாமல் " +
            "கவனம் தேவைப்படுவதற்கு நேரடியாக செல்ல முடியும்.",
        },
        {
          type: "paragraph",
          text:
            "சமீபத்திய செயல்பாடு உங்கள் பணியிடத்தில் சமீபத்திய மாற்றங்களைக் காட்டுகிறது — மதிப்பெண் திருத்தங்கள், " +
            "இணக்க நிலை மாற்றங்கள், புதிய தோல்வி வகைகள் — ஒவ்வொன்றும் யார் மற்றும் எப்போது செய்தார்கள் என்பதுடன், " +
            "இதனால் நீங்கள் அல்லது ஒரு மதிப்பாய்வாளர் ஒவ்வொரு திரையையும் தோண்டாமல் என்ன மாறியது என்பதைக் காணலாம்.",
        },
        { type: "figure", caption: "டாஷ்போர்டு மேலோட்டம்" },
        { type: "figure", caption: "ALARP ரிஸ்க் பகுப்பாய்வு விளக்கப்படம்" },
      ],
    },
    {
      title: "டிவைஸ் லைப்ரரி",
      purpose:
        "மதிப்பீட்டில் இறங்குவதற்கு முன், இந்த பணியிடத்தின் தரவு உண்மையில் எந்த டிவைஸைப் பற்றியது என்பதையும், அதன் கூறு " +
        "விவரத்தையும் காட்டுகிறது. எண்களைப் பார்ப்பதற்கு முன் என்ன மதிப்பிடப்படுகிறது என்பதை அறிய வேண்டிய ஒரு புதிய " +
        "குழு உறுப்பினர் அல்லது மதிப்பாய்வாளருக்கு ஒரு நோக்குநிலை படியாக பயனுள்ளது.",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "மேலே உள்ள சிறப்பம்சம் கார்டு செயலில் உள்ள டிவைஸைக் காட்டுகிறது — இந்த பதிப்பிற்கு, பீடபிள் அல்ட்ராசவுண்ட் புரோப் — அதன் கூறு எண்ணிக்கை மற்றும் மொத்த பதிவு செய்யப்பட்ட தோல்வி வகைகளுடன்.",
            `அதற்குக் கீழே கண்காணிக்கப்படும் ஒவ்வொரு கூறின் ஒரு கட்டமைப்பு உள்ளது, ஒவ்வொன்றும் அது என்ன செய்கிறது மற்றும் ரிஸ்க்கிற்கு ஏன் முக்கியமானது என்பதற்கான ஒரு-வரி விளக்கத்துடன். தற்போதைய கூறுகள்: ${components
              .map((c) => c.name)
              .join(", ")}. இது FMEA பணியிடத்தில் நீங்கள் தேர்ந்தெடுக்கும் அதே பட்டியல்.`,
            "இங்கிருந்து நேரடியாக மதிப்பீட்டிற்குச் செல்ல \"FMEA பணியிடத்தைத் திற →\" ஐ கிளிக் செய்யவும்.",
            "மேலும் கீழே, கூடுதல் டிவைஸ் வகைகள் \"விரைவில் வருகிறது\" என குறிக்கப்பட்டு தோன்றும் — இந்த பதிப்பில் இன்னும் மதிப்பீட்டிற்கு கிடைக்கவில்லை, ஆனால் கருவி எங்கு செல்கிறது என்பதற்கான முன்னோட்டம்.",
          ],
        },
        { type: "figure", caption: "டிவைஸ் லைப்ரரி — கூறு கட்டமைப்பு" },
      ],
    },
    {
      title: "FMEA பணியிடம்",
      purpose:
        "உண்மையான ரிஸ்க் பகுப்பாய்வு நடக்கும் இடம் — ஒரு கூறு தோல்வியடையும் ஒரு குறிப்பிட்ட வழியை நீங்கள் பதிவு செய்யும் " +
        "இடம், அது எவ்வளவு மோசமாக இருக்கும், அது எவ்வளவு சாத்தியம், மற்றும் அதைப் பிடிப்பது எவ்வளவு கடினமாக இருக்கும் — " +
        "மற்றும் கருவி அதை ஒரு முன்னுரிமைப்படுத்தப்பட்ட, ISO 14971-இணைந்த ரிஸ்க் மதிப்பெண்ணாக மாற்றும் இடம். ஆப்பில் " +
        "உங்கள் நேரத்தில் பெரும்பகுதி இங்கே செலவிடப்படும்.",
      blocks: [
        {
          type: "paragraph",
          text:
            "கூறு வாரியாக வடிகட்டவும்: இடதுபுறம் உள்ள ஊடாடும் புரோப் வரைபடம் டிவைஸின் எளிமைப்படுத்தப்பட்ட வரைபடம், " +
            "ஒவ்வொரு லேபிள் செய்யப்பட்ட கூறிலும் ஒரு வண்ண புள்ளியுடன். தோல்வி-வகை பட்டியலை அந்த கூறு மட்டும் " +
            "வடிகட்ட ஒரு புள்ளியைத் தட்டவும்; மீண்டும் எல்லாவற்றையும் பார்க்க \"Clear filter\" ஐ தட்டவும். அருகிலுள்ள " +
            "உறை நிலைமாற்றி ஒரு பாதுகாப்பு உறை தற்போது பொருத்தப்பட்டதாக மாதிரியாக்கப்பட்டுள்ளதா என்பதைக் காட்டுகிறது, " +
            "மேலும் நீங்கள் மதிப்பிடும் சூழ்நிலையை பிரதிபலிக்க மாற்றப்படலாம்.",
        },
        {
          type: "paragraph",
          text:
            "ஒரு புதிய தோல்வி வகையைச் சேர்க்கவும்: ஒரு படிவத்தைத் திறக்க \"+ Add Failure Mode\" ஐ கிளிக் செய்யவும். " +
            "அது பொருந்தும் கூறைத் தேர்ந்தெடுக்கவும், பின்னர் ஒரு சுருக்கமான தோல்வி வகை விளக்கம் (பகுதி தோல்வியடையும் " +
            "குறிப்பிட்ட வழி), விளைவு (இதன் விளைவாக என்ன நிகழ்கிறது), காரணம் (ஏன் இது நிகழ்கிறது), மதிப்பிடப்படும் " +
            "தரநிலை (இயல்பாக ISO 14971), மற்றும் ஒரு தணிப்பு நடவடிக்கை (எந்த வடிவமைப்பு மாற்றம், செயல்முறை, அல்லது " +
            "சரிபார்ப்பு இந்த ரிஸ்க்கைக் குறைக்கிறது) ஆகியவற்றை நிரப்பவும்.",
        },
        {
          type: "paragraph",
          text:
            "இதை நிரப்பும் போது AI உதவி: இரண்டு விருப்ப பொத்தான்கள் உங்கள் தீர்ப்பை மாற்றாமல் ஆவணப்படுத்துதலை " +
            "விரைவுபடுத்துகின்றன. \"AI மூலம் தணிப்பு நடவடிக்கையை வரைவு செய்\" இதுவரை நீங்கள் உள்ளிட்ட " +
            "வகை/விளைவு/காரணத்திலிருந்து ஒரு வேட்பாளர் தணிப்பு நடவடிக்கையை எழுதுகிறது — இது புலத்தை முன்கூட்டியே " +
            "நிரப்புகிறது ஆனால் முழுமையாக திருத்தக்கூடியதாக இருக்கும், மேலும் நீங்களே Save ஐ கிளிக் செய்யும் வரை " +
            "ஒருபோதும் சேமிக்கப்படாது. \"AI மூலம் மதிப்பெண்களை பரிந்துரை\" ஒவ்வொன்றிற்கும் ஒரு-வரி காரணத்துடன் " +
            "தீவிரம், நிகழ்வு மற்றும் கண்டறியும் தன்மை மதிப்புகளை முன்மொழிகிறது, ஸ்டெப்பர்களுக்கு அடுத்ததாக " +
            "காட்டப்படுகிறது, இதனால் நீங்கள் (மற்றும் ஒரு மதிப்பாய்வாளர்) எண்களை மட்டும் அல்ல, காரணத்தையும் " +
            "காணலாம் — ஸ்டெப்பர்கள் பின்னர் திருத்தக்கூடியதாக இருக்கும். இரண்டிற்கும் முதலில் குறைந்தபட்சம் ஒரு " +
            "தோல்வி வகை விளக்கம் தட்டச்சு செய்யப்பட வேண்டும், மேலும் AI சேவை கிடைக்கவில்லை என்றால் இரண்டும் உங்கள் " +
            "மற்ற உள்ளீடுகளை இழக்காமல் ஒரு தெளிவான இன்லைன் பிழைக்குத் திரும்பும்.",
        },
        {
          type: "term",
          term: "தீவிரம் (S)",
          definition:
            "இந்த தோல்வி நிகழ்ந்தால் விளைவு எவ்வளவு மோசமாக இருக்கும், 1 (சொற்பமானது, உண்மையான தாக்கம் இல்லை) முதல் " +
            "10 (நோயாளிக்கு அல்லது இயக்குபவருக்கு பேரழிவு தரும் தீங்கு) வரை. சிறந்த சூழ்நிலைக்குப் பதிலாக மோசமான " +
            "நியாயமான எதிர்பார்க்கப்படும் விளைவுக்கு எதிராக இதை மதிப்பிடவும்.",
        },
        {
          type: "term",
          term: "நிகழ்வு (O)",
          definition:
            "உண்மையான பயன்பாட்டில் இந்த தோல்வி எவ்வளவு அடிக்கடி நிகழும் என எதிர்பார்க்கப்படுகிறது, 1 (அரிதானது — " +
            "டிவைஸின் வாழ்நாளில் மிகவும் சாத்தியமற்றது) முதல் 10 (அடிக்கடி — சாதாரண பயன்பாட்டில் எதிர்பார்க்கப்படுவது) வரை.",
        },
        {
          type: "term",
          term: "கண்டறியும் தன்மை (D)",
          definition:
            "தீங்கு ஏற்படுவதற்கு முன் தோல்வி பிடிபடுவதற்கான சாத்தியக்கூறு எவ்வளவு. இது நீங்கள் எதிர்பார்ப்பதற்கு " +
            "எதிர் திசையில் இயங்குகிறது: 1 என்றால் இது கிட்டத்தட்ட எப்போதும் பிடிபடும் (எ.கா. ஒரு தானியங்கு " +
            "சுய-சோதனை ஒவ்வொரு முறையும் அதைப் பிடிக்கும்), 10 என்றால் தீங்கு ஏற்படுவதற்கு முன் கண்டறிவது மிகவும் " +
            "கடினமாக அல்லது சாத்தியமற்றதாக இருக்கும்.",
        },
        {
          type: "paragraph",
          text:
            "\"Save\" ஐ கிளிக் செய்யவும். கருவி உடனடியாக RPN = S × O × D ஐக் கணக்கிட்டு, உங்கள் கட்டமைக்கப்பட்ட " +
            "வரம்புகளின் அடிப்படையில் (அமைப்புகள் பார்க்கவும்) ஒரு ALARP பட்டையை (ஏற்கத்தக்கது, ALARP, அல்லது " +
            "ஏற்க முடியாதது) ஒதுக்குகிறது. இரண்டும் உடனடியாக தோல்வி வகையின் கார்டில் தோன்றும் — தனி " +
            "சேமி-மற்றும்-புதுப்பி படி இல்லை. பின்னர் ஒரு தற்போதுள்ள தோல்வி வகையின் மதிப்பெண்ணை மாற்ற, அதன் " +
            "கார்டைத் திறந்து நேரடியாக S, O அல்லது D ஐ சரிசெய்யவும் — நீங்கள் ஒரு மதிப்பை மாற்றும் தருணத்தில் " +
            "RPN மற்றும் அதன் பட்டை மீண்டும் கணக்கிடப்படும்.",
        },
        {
          type: "paragraph",
          text:
            "பரிந்துரைக்கப்பட்ட தோல்வி வகைகள்: \"✨ தோல்வி வகைகளை பரிந்துரை (AI)\" பேனல் தேவைக்கேற்ப தேர்ந்தெடுக்கப்பட்ட " +
            "கூறிற்கான 2-3 வேட்பாளர் தோல்வி வகைகளை உருவாக்குகிறது, ஒவ்வொன்றும் ஒரு சுருக்கமான காரணத்துடன், அது " +
            "தன்னைத்தானே திரும்பச் சொல்லாதபடி அந்த கூறுக்கு ஏற்கனவே பதிவு செய்யப்பட்டதுடன் சரிபார்க்கப்படுகிறது. " +
            "சேவையகத்தில் AI விசை கட்டமைக்கப்படவில்லை என்றால், இது தானாகவே ஒரு சிறிய உள்ளமைக்கப்பட்ட தேர்ந்தெடுக்கப்பட்ட " +
            "பட்டியலுக்குத் திரும்பும், அவ்வாறு தெளிவாக லேபிள் செய்யப்பட்டுள்ளது. ஒரு பரிந்துரையை வரைவு பதிவாக " +
            "சேர்க்க \"+ FMEA பணியிடத்தில் சேர்\" ஐ கிளிக் செய்யவும் (இயல்பாக 5/5/5 மதிப்பெண், விளைவு, காரணம் மற்றும் " +
            "தணிப்பு நடவடிக்கை \"குழு மதிப்பாய்வு நிலுவையில்\" என குறிக்கப்பட்டுள்ளது) — இறுதியானதாகக் கருதும் முன் " +
            "இதை மதிப்பாய்வு செய்து சரிசெய்யவும்.",
        },
        { type: "figure", caption: "FMEA பணியிடம் — புரோப் வரைபடம் மற்றும் வடிகட்டிகள்" },
        { type: "figure", caption: "தோல்வி வகையைச் சேர் படிவம்" },
        { type: "figure", caption: "S-O-D மதிப்பெண்களுடன் தோல்வி வகை கார்டு" },
      ],
    },
    {
      title: "ரிஸ்க் பதிவேடு",
      purpose:
        "பணியிடத்தில் உள்ள ஒவ்வொரு தோல்வி வகையின் முதன்மைப் பட்டியல், ஒரு வரிசைப்படுத்தக்கூடிய, தேடக்கூடிய, " +
        "வடிகட்டக்கூடிய பட்டியலில் — கூறு வாரியாக உலாவுவதற்குப் பதிலாக ஒரு சமதள பட்டியலாக முழு ரிஸ்க் " +
        "படத்தையும் மதிப்பாய்வு செய்ய வேண்டியிருக்கும்போது அல்லது ஏதேனும் ஒன்றைக் கண்டறிய வேண்டியிருக்கும்போது " +
        "நீங்கள் செல்லும் இடம்.",
      blocks: [
        {
          type: "bullets",
          items: [
            "தோல்வி வகை விளக்கம் அல்லது கூறு பெயரில் உள்ள எந்த உரையின் அடிப்படையிலும் வடிகட்ட தேடல் பெட்டியில் தட்டச்சு செய்யவும்.",
            "ஒரு குறிப்பிட்ட ரிஸ்க் பட்டையில் மட்டும் தோல்வி வகைகளைக் காட்ட அனைத்தும் / ஏற்கத்தக்கது / ALARP / ஏற்க முடியாதது பில்களைப் பயன்படுத்தவும்.",
            "அந்த நெடுவரிசையின் அடிப்படையில் வரிசைப்படுத்த எந்த நெடுவரிசை தலைப்பையும் (#, கூறு, S, O, D, RPN) கிளிக் செய்யவும்; வரிசையை மாற்ற மீண்டும் கிளிக் செய்யவும்.",
            "ஒவ்வொரு வரிசையும் தீவிரம், நிகழ்வு, கண்டறியும் தன்மை, கணக்கிடப்பட்ட RPN, மற்றும் ALARP வகைப்பாட்டைக் காட்டுகிறது, இதனால் ஒவ்வொன்றையும் திறக்காமல் தோல்வி வகைகளை பக்கத்திற்குப் பக்கம் ஒப்பிடலாம்.",
          ],
        },
        { type: "figure", caption: "ரிஸ்க் பதிவேடு — RPN வாரியாக வரிசைப்படுத்தப்பட்டது" },
      ],
    },
    {
      title: "அனலிட்டிக்ஸ்",
      purpose:
        "தனிப்பட்ட தோல்வி வகைகளிலிருந்து பின்வாங்கி வடிவங்களைப் பார்க்கும் இடம் — எந்த கூறுகள் ஒட்டுமொத்தமாக " +
        "மிக ரிஸ்க் நிறைந்தவை, RPN எவ்வாறு பரவியுள்ளது, மற்றும் காலப்போக்கில் படம் எவ்வாறு மாறியுள்ளது. ஒரு " +
        "ரிஸ்க்-மேலாண்மை சுருக்கத்தைத் தயாரிக்கும் போது அல்லது ஒரு மதிப்பாய்வாளருக்கு முன்னேற்றத்தைப் " +
        "புகாரளிக்கும் போது இதைப் பயன்படுத்தவும்.",
      blocks: [
        {
          type: "paragraph",
          text:
            "தோல்வி வகை வாரியாக RPN பார் விளக்கப்படம் ஒவ்வொரு பதிவு செய்யப்பட்ட தோல்வி வகையின் RPN ஐக் காட்டுகிறது, " +
            "ALARP பட்டையால் வண்ண-குறியிடப்பட்டு, இதனால் ஒரு பார்வையில் ஒட்டுமொத்த ரிஸ்க் பரவலைக் காணலாம்.",
        },
        {
          type: "paragraph",
          text:
            "ரிஸ்க் ஹீட்மேப் ஒவ்வொரு கூறையும் அதன் சராசரி RPN மற்றும் தோல்வி-வகை எண்ணிக்கையுடன் பட்டியலிடுகிறது, " +
            "வண்ண-தீவிரம்-குறியிடப்பட்டு — ஒரு வரிசை எவ்வளவு தீவிரமாக இருக்கிறதோ, அந்த கூறு சராசரியாக " +
            "எவ்வளவு ரிஸ்க் நிறைந்ததாக இருக்கிறது, இது டிவைஸின் எந்த பகுதிக்கு அதிக கவனம் தேவை என்பதைக் " +
            "கண்டறிவதை எளிதாக்குகிறது.",
        },
        {
          type: "paragraph",
          text:
            "ரிஸ்க் ஸ்னாப்ஷாட்கள் உங்களை ஒரு அடிப்படை நிலையைப் பிடிக்க அனுமதிக்கின்றன. \"+ ஸ்னாப்ஷாட் சேமி\" ஐ " +
            "கிளிக் செய்யவும், அதற்கு ஒரு பெயரைக் கொடுங்கள் (எ.கா. \"தணிப்பு-முந்தைய அடிப்படை\"), அது அந்த " +
            "தருணத்தில் தற்போதைய சராசரி RPN, ரிஸ்க்-பட்டை எண்ணிக்கைகள், மற்றும் இணக்க மதிப்பெண்ணைச் " +
            "சேமிக்கிறது. பின்னர், மாற்றங்களைச் செய்த பிறகு, அந்த எண்களில் ஒவ்வொன்றும் எவ்வாறு நகர்ந்துள்ளது " +
            "என்பதைப் பார்க்க ஒரு சேமிக்கப்பட்ட ஸ்னாப்ஷாட்டில் \"ஒப்பிடு\" ஐ கிளிக் செய்யவும் — தணிப்பு " +
            "நடவடிக்கைகள் உண்மையில் ரிஸ்க்கைக் குறைத்தன என்பதைக் காட்ட பயனுள்ளது.",
        },
        {
          type: "paragraph",
          text: "கீழே உள்ள ரிஸ்க் வரலாறு மற்றும் தணிக்கை பதிவு பணியிடத்தில் செய்யப்பட்ட ஒவ்வொரு மாற்றத்தின் முழுமையான, நேர முத்திரையிடப்பட்ட பதிவு, ஒரே இடத்தில்.",
        },
        { type: "figure", caption: "அனலிட்டிக்ஸ் — RPN விளக்கப்படம் மற்றும் ஹீட்மேப்" },
        { type: "figure", caption: "ரிஸ்க் ஸ்னாப்ஷாட் ஒப்பீடு" },
      ],
    },
    {
      title: "இணக்கம்",
      purpose:
        "உங்கள் ரிஸ்க்-மேலாண்மை கோப்பு ISO 14971:2019 இன் உண்மையான விதிகளுக்கு எதிராக, விதி வாரியாக, எவ்வளவு " +
        "முழுமையானது என்பதைக் கண்காணிக்கிறது, இதனால் என்ன முடிந்தது, என்ன பகுதியளவு, மற்றும் இன்னும் என்ன " +
        "நிலுவையில் உள்ளது என்பதை நீங்கள் எப்போதும் அறிவீர்கள் — இது ஒரு ஒழுங்குமுறை மதிப்பாய்வாளர் அல்லது " +
        "தணிக்கையாளர் முதலில் பார்க்கும் திரை.",
      blocks: [
        {
          type: "paragraph",
          text: "மேலே உள்ள வளையம் உங்கள் லைவ் இணக்க மதிப்பெண் — முழுமையானது என குறிக்கப்பட்ட விதிகளின் சதவீதம், ஒரு விதியின் நிலை மாறும்போதெல்லாம் உடனடியாக மீண்டும் கணக்கிடப்படும்.",
        },
        {
          type: "term",
          term: "விதி நிலை",
          definition:
            "ஒவ்வொரு விதிக்கும் மூன்று நிலைகளில் ஒன்று உள்ளது: முழுமையானது (முழுமையாக நிவர்த்தி செய்யப்பட்டது), " +
            "பகுதியளவு (முன்னேற்றத்தில் அல்லது பகுதியளவு நிவர்த்தி செய்யப்பட்டது), அல்லது நிலுவையில் (இன்னும் " +
            "தொடங்கப்படவில்லை). முழுமையானது உங்கள் இணக்க மதிப்பெண்ணை நோக்கி முழுமையாக கணக்கிடப்படும், " +
            "பகுதியளவு பாதியாக கணக்கிடப்படும், நிலுவையில் பூஜ்ஜியமாக கணக்கிடப்படும்.",
        },
        {
          type: "bullets",
          items: compliance.map((c) => `${c.clause} — ${c.title}: ${c.mapped} உடன் இணைக்கப்பட்டது (தற்போது ${c.status}).`),
        },
        {
          type: "paragraph",
          text:
            "எந்தவொரு விதியின் நிலையையும் முன்னோக்கி சுழற்ற அதில் \"Mark as [அடுத்த நிலை]\" ஐ கிளிக் செய்யவும். " +
            "அந்த விதிக்கான ஒரு ஆதரவு கோப்பை (படம், PDF, அல்லது உரை ஆவணம்) பதிவேற்ற \"+ Attach evidence\" ஐ " +
            "கிளிக் செய்யவும் — உண்மையான கையொப்ப ஆவணம், சோதனை அறிக்கை, அல்லது மதிப்பாய்வு பதிவை அது " +
            "திருப்திப்படுத்தும் விதியுடன் நேரடியாக இணைத்து வைக்க பயனுள்ளது. இணைக்கப்பட்ட கோப்புகள் விதிக்கு " +
            "கீழே கிளிக் செய்யக்கூடிய இணைப்புகளாகத் தோன்றும்; அதற்கு அடுத்த ✕ மூலம் ஒன்றை அகற்றவும்.",
        },
        { type: "figure", caption: "இணக்கம் — மதிப்பெண் வளையம் மற்றும் விதி கண்காணிப்பு" },
      ],
    },
    {
      title: "AI உதவியாளர்",
      purpose:
        "FMEA கருத்துக்கள், இந்த கருவியின் பின்னணியில் உள்ள தரநிலைகள், மற்றும் உங்கள் லைவ் ரிஸ்க் தரவு குறித்த " +
        "கேள்விகளுக்கு எளிய மொழியில் பதிலளிக்கும் ஒரு உள்ளமைக்கப்பட்ட உதவியாளர், Roger — மற்ற திரைகளைத் தேடாமல் " +
        "ஒரு விரைவான பதிலை நீங்கள் விரும்பும்போது, ​​அல்லது கருவியை ஒரு புதியவருக்கு விளக்கும்போது பயனுள்ளது.",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "மெசேஜ் பெட்டியில் ஒரு கேள்வியைத் தட்டச்சு செய்து Send (அல்லது Enter) ஐ அழுத்தவும் — Roger ஒரு இலவச, உள்ளமைக்கப்பட்ட அறிவுத் தளம் மற்றும் உங்கள் லைவ் FMEA தரவைப் பயன்படுத்தி பதிலளிக்கிறார், உங்கள் தற்போதைய மிக அதிக ரிஸ்க் உள்ள தோல்வி வகை அல்லது இணக்க மதிப்பெண் போன்றவை உட்பட.",
            "சேவையகத்தில் ஒரு உண்மையான AI விசை இணைக்கப்படும்போது, Roger அதற்குப் பதிலாக முழு திறந்த-முடிவு உரையாடலில் பதிலளிக்கிறார், அதே லைவ் தரவு மற்றும் இந்த கையேட்டில் அடிப்படையாகக் கொண்டு, மேலும் FMEA/ISO 14971/உங்கள் தரவு/இந்த ஆப் என்பதற்குள் கண்டிப்பாக வரம்பிடப்பட்டுள்ளார் — அதற்கு வெளியே உள்ள எதற்கும் பதிலளிப்பதற்குப் பதிலாக அவர் அதை மரியாதையுடன் மறுத்து திசைதிருப்புகிறார்.",
            "பொதுவான கேள்விகளுக்கு இடதுபுறம் ஒரு விரைவு பரிந்துரையைப் பயன்படுத்தவும் — ஒன்றைக் கிளிக் செய்வது அதை உடனடியாக அனுப்பும்.",
            "உங்கள் மெசேஜுடன் ஒரு கோப்பைச் சேர்க்க இணைப்பு ஐகானைக் கிளிக் செய்யவும். உரை அடிப்படையிலான கோப்புகள் (.txt, .csv, .json, .md) படிக்கப்பட்டு Roger-இன் பதிலுக்கான சூழலாக சேர்க்கப்படுகின்றன; புகைப்படங்களும் இணைக்கப்படலாம், ஆனால் ஒரு படத்தில் உண்மையில் என்ன இருக்கிறது என்பதை விளக்குவதற்கு இணைக்கப்பட்ட AI விசை தேவை (அமைப்புகள் பார்க்கவும்) — இல்லாமல், Roger ஒரு புகைப்படம் இணைக்கப்பட்டது என்பதை மட்டுமே ஒப்புக்கொள்ள முடியும்.",
            "வெப் பதிப்பில், தட்டச்சு செய்வதற்குப் பதிலாக உங்கள் கேள்வியை சொல்ல மைக்ரோஃபோன் ஐகானைக் கிளிக் செய்யவும்.",
            "எந்த நேரத்திலும் ஒரு புதிய அரட்டையைத் தொடங்க \"உரையாடலை அழி\" ஐ கிளிக் செய்யவும்.",
          ],
        },
        { type: "figure", caption: "AI உதவியாளர் — Roger உடன் அரட்டை" },
      ],
    },
    {
      title: "அறிக்கை உருவாக்கி",
      purpose:
        "உங்கள் லைவ் பணியிட தரவை இரண்டு பகிரக்கூடிய PDF ஆவணங்களாக மாற்றுகிறது — ஒரு ரிஸ்க்-மேலாண்மை கோப்பிற்கான " +
        "முறையான ரிஸ்க்-மதிப்பீடு அறிக்கை, மற்றும் இந்த வழிகாட்டி வழிகாட்டி — எதையும் கைமுறையாக ஒன்றிணைக்க " +
        "வேண்டிய அவசியமின்றி.",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "ஒரு கட்டமைக்கப்பட்ட FMEA அறிக்கையை உருவாக்க \"PDF அறிக்கையை உருவாக்கு\" ஐ கிளிக் செய்யவும்: அட்டைப் பக்கம், சுருக்க புள்ளிவிவரங்கள், S/O/D/RPN/வகைப்பாட்டுடன் முழுமையான தோல்வி-வகை அட்டவணை, தணிப்பு குறிப்புகள், மற்றும் ஒரு ISO 14971:2019 இணக்க சுருக்கம் — இப்போது உங்கள் பணியிடத்தில் உள்ளதிலிருந்து புதிதாக உருவாக்கப்பட்டது.",
            "இந்த க்விக்ஸ்டார்ட் வழிகாட்டியை பதிவிறக்கக்கூடிய PDF ஆக உருவாக்க \"பயனர் கையேட்டை உருவாக்கு (PDF)\" ஐ கிளிக் செய்யவும் — ஒரு வழிகாட்டி, மதிப்பாய்வாளர், அல்லது புதிய குழு உறுப்பினருக்கான விட்டுச்செல்லும் ஆவணமாக பயனுள்ளது.",
            "இரண்டு PDF-களும் அமைப்புகளில் தற்போது தேர்ந்தெடுக்கப்பட்ட மொழியில் உருவாக்கப்படுகின்றன, அவற்றின் தலைப்புகள் மற்றும் பிரிவு தலைப்புகள் உட்பட.",
            "இரண்டு பதிவிறக்கங்களும் உங்கள் உலாவியின் இயல்புநிலை பதிவிறக்க இருப்பிடத்தில் நேரடியாக சேமிக்கப்படும்.",
          ],
        },
        { type: "figure", caption: "அறிக்கை உருவாக்கி திரை" },
      ],
    },
    {
      title: "அமைப்புகள்",
      purpose:
        "கருவி ரிஸ்க்கை எவ்வாறு மதிப்பிடுகிறது மற்றும் வகைப்படுத்துகிறது என்பதை நீங்கள் கட்டமைக்கும் இடம், AI " +
        "உதவியாளரின் நடத்தையை நிர்வகிக்கவும், உங்கள் காட்சி மொழியைத் தேர்ந்தெடுக்கவும், உங்கள் தரவை காப்புப்பிரதி " +
        "எடுக்கவும் அல்லது மீட்டமைக்கவும், மற்றும் உங்கள் கணக்கை நிர்வகிக்கவும் — தினமும் அல்ல, எப்போதாவது " +
        "நீங்கள் பார்வையிடும் ஒரு திரை.",
      blocks: [
        {
          type: "bullets",
          numbered: true,
          items: [
            "தோற்றம் — லைட் மற்றும் டார்க் தீம் இடையே மாறவும்.",
            "மொழி — ஆப்பின் காட்சி மொழியை English, हिंदी மற்றும் தமிழ் இடையே மாற்றவும்; மாற்றம் உடனடியாக ஒவ்வொரு திரையிலும் பொருந்தும், மேலும் அடுத்த முறை நீங்கள் ஆப்பைத் திறக்கும் போது நினைவில் வைக்கப்படும்.",
            "RPN மதிப்பீட்டு கட்டமைப்பு — ஒரு தோல்வி வகை ALARP ஆக மாறும் RPN மதிப்பையும், அது ஏற்க முடியாததாக மாறும் மதிப்பையும் அமைக்கவும். இந்த இரண்டு வரம்புகளும்தான் ஒவ்வொரு ALARP பேட்ஜும் டாஷ்போர்டின் ரிஸ்க் பகுப்பாய்வும் கணக்கிடப்படும் அடிப்படை, எனவே இவற்றை மாற்றுவது ஒவ்வொரு தோல்வி வகையையும் உடனடியாக மீண்டும் வகைப்படுத்தும்.",
            "AI உதவியாளர் — ஒரு உண்மையான AI விசை இணைக்கப்பட்டிருந்தால் Roger எந்த மாடலைப் பயன்படுத்துவார் என்பதைத் தேர்ந்தெடுக்கவும் (ஒரு நிர்வாகி சேவையகத்தில் ஒன்றை இணைக்கும் வரை விளைவு இல்லை), மற்றும் Roger-இன் நோக்கத்தை அமைக்கவும்: திசைதிருப்பு Roger-ஐ ஆஃப்-டாபிக் கேள்விகளை FMEA/ஆப்பிற்கு மென்மையாகத் திருப்ப அனுமதிக்கிறது; மறு Roger-ஐ அவற்றை நேரடியாக மறுக்க அனுமதிக்கிறது.",
            "வரம்பு, AI, மற்றும் நோக்க மாற்றங்களைப் பயன்படுத்த \"அமைப்புகளை சேமி\" ஐ கிளிக் செய்யவும்.",
            "தரவு மேலாண்மை — \"JSON ஏற்றுமதி செய்\" உங்கள் தோல்வி வகைகள் மற்றும் இணக்க தரவின் முழு காப்புப்பிரதியைப் பதிவிறக்குகிறது; \"JSON இறக்குமதி செய்\" முன்பு ஏற்றுமதி செய்யப்பட்ட காப்புப்பிரதி கோப்பிலிருந்து மீட்டமைக்கிறது; \"டெமோ தரவை மீட்டமை\" எல்லாவற்றையும் அசல் சீட் செய்யப்பட்ட தரவுத் தொகுப்புக்கு மாற்றுகிறது (மீட்டமைக்க முடியாது — முதலில் உறுதிப்படுத்த கேட்கப்படும்).",
            "கணக்கு — நீங்கள் யாராக உள்நுழைந்துள்ளீர்கள் என்பதைக் காட்டுகிறது, ஒரு \"வெளியேறு\" பொத்தானுடன்.",
          ],
        },
        { type: "figure", caption: "அமைப்புகள் — மதிப்பீட்டு வரம்புகள் மற்றும் தரவு மேலாண்மை" },
      ],
    },
  ];

  const workflow = [
    "FMEA பணியிடத்தைத் திறந்து புரோப் வரைபடத்தில் நீங்கள் மதிப்பிட விரும்பும் கூறைத் தட்டவும் — அல்லது \"+ Add Failure Mode\" படிவத்தில் அதைத் தேர்ந்தெடுக்கவும்.",
    "\"+ Add Failure Mode\" ஐ கிளிக் செய்து தோல்வி வகை, அதன் விளைவு, அதன் காரணம், மற்றும் ஒரு தணிப்பு நடவடிக்கையை விவரிக்கவும்.",
    "மேலே உள்ள வரையறைகளைப் பயன்படுத்தி தீவிரம், நிகழ்வு மற்றும் கண்டறியும் தன்மையை மதிப்பிட்டு, Save ஐ கிளிக் செய்யவும் — RPN மற்றும் அதன் ALARP பட்டை உடனடியாகத் தோன்றும்.",
    "புதிய பதிவு உங்கள் மற்ற ரிஸ்க்குகளுடன் ஒப்பிடுகையில் நீங்கள் எதிர்பார்க்கும் இடத்தில் வரிசைப்படுத்துகிறதா என்பதை உறுதிப்படுத்த ரிஸ்க் பதிவேட்டைத் திறக்கவும்.",
    "இது ALARP அல்லது ஏற்க முடியாததில் வந்தால், சம்பந்தப்பட்ட விதி (எ.கா. ரிஸ்க் கட்டுப்பாடு) புதிய தணிப்பு நடவடிக்கையை பிரதிபலிக்க புதுப்பிக்கப்பட வேண்டுமா என்பதை இணக்கத்திற்குச் சென்று சரிபார்த்து, ஏதேனும் ஆதரவு ஆதாரத்தை இணைக்கவும்.",
    "மேலும் மாற்றங்களைச் செய்வதற்கு முன் அனலிட்டிக்ஸைத் திறந்து ஒரு ஸ்னாப்ஷாட்டைச் சேமிக்கவும், இதனால் பின்னர் ஒப்பிடுவதற்கு உங்களிடம் ஒரு அடிப்படை நிலை இருக்கும்.",
    "இதை சேனிட்டி-செக் செய்ய AI உதவியாளரிடம் \"இப்போது மிக அதிக ரிஸ்க் உள்ள தோல்வி வகை எது?\" எனக் கேளுங்கள், அல்லது தெளிவற்ற எதைப் பற்றியும் கேளுங்கள்.",
    "உங்கள் ஒட்டுமொத்த ரிஸ்க் சுருக்கம் மற்றும் இணக்க மதிப்பெண்ணில் பிரதிபலிக்கும் புதிய தோல்வி வகையைப் பார்க்க டாஷ்போர்டைச் சரிபார்க்கவும்.",
    "தயாரானதும், உங்கள் ரிஸ்க்-மேலாண்மை கோப்பிற்கான புதுப்பிக்கப்பட்ட PDF அறிக்கையை உருவாக்க அறிக்கை உருவாக்கியைப் பயன்படுத்தவும்.",
  ];

  const faq: { q: string; a: string }[] = [
    {
      q: "எனது ரிஸ்க்கிற்கு ALARP என்றால் என்ன அர்த்தம்?",
      a: "தோல்வி வகையின் RPN உங்கள் ஏற்கத்தக்க மற்றும் ஏற்க முடியாத வரம்புகளுக்கு இடையே (அமைப்புகளில் அமைக்கப்பட்டுள்ளது) வருகிறது என்று அர்த்தம் — இது தானாகவே நிராகரிக்கப்படவில்லை, ஆனால் மேலும் தணிப்பு நடவடிக்கை ஏன் நியாயமான முறையில் நடைமுறைப்படுத்த முடியாதது என்பதை நீங்கள் ஆவணப்படுத்த வேண்டும், அல்லது அதைக் குறைக்க மாற்றங்களைச் செய்ய வேண்டும்.",
    },
    {
      q: "மதிப்பீட்டு வரம்புகளை நான் எவ்வாறு மாற்றுவது?",
      a: "அமைப்புகள் → RPN மதிப்பீட்டு கட்டமைப்புக்குச் சென்று, \"ALARP தொடங்கும் மதிப்பு\" மற்றும் \"ஏற்க முடியாதது தொடங்கும் மதிப்பு\" ஆகியவற்றைச் சரிசெய்து, பின்னர் அமைப்புகளை சேமி ஐ கிளிக் செய்யவும். ஒவ்வொரு தோல்வி வகையின் வகைப்பாடும் உடனடியாக புதுப்பிக்கப்படும்.",
    },
    {
      q: "எனது RPN தவறாகத் தெரிகிறது — நான் என்ன சரிபார்க்க வேண்டும்?",
      a: "RPN எப்போதும் தீவிரம் × நிகழ்வு × கண்டறியும் தன்மை. FMEA பணியிடத்தில் தோல்வி வகையைத் திறந்து மூன்று தனிப்பட்ட மதிப்பெண்களைச் சரிபார்க்கவும் — ஒன்றைச் சரிசெய்வது RPN ஐ உடனடியாக மீண்டும் கணக்கிடுகிறது.",
    },
    {
      q: "எனது இணக்க மதிப்பெண் எவ்வாறு கணக்கிடப்படுகிறது?",
      a: "ஒவ்வொரு விதியும் முழுமையானது = 100%, பகுதியளவு = 50%, நிலுவையில் = 0% எனக் கணக்கிடுகிறது, ஒவ்வொரு விதியிலும் சராசரியிடப்படுகிறது. லைவ் எண்ணைப் பார்க்கவும், தனிப்பட்ட விதி நிலைகளைப் புதுப்பிக்கவும் இணக்கத்தைப் பார்க்கவும்.",
    },
    {
      q: "டெமோ தரவு மீட்டமைப்பை என்னால் செயல்தவிர்க்க முடியுமா?",
      a: "இல்லை — இது உங்கள் தோல்வி வகைகள், இணக்க தரவு, மற்றும் ஸ்னாப்ஷாட்களை அசல் சீட் செய்யப்பட்ட தரவுத் தொகுப்புடன் நிரந்தரமாக மாற்றுகிறது. உங்கள் தற்போதைய தரவை வைத்திருக்க விரும்பினால் முதலில் ஒரு காப்புப்பிரதியை ஏற்றுமதி செய்யவும் (அமைப்புகள் → JSON ஏற்றுமதி செய்).",
    },
    {
      q: "AI உதவியாளருக்கு இணைய இணைப்பு அல்லது பணம் செலுத்திய விசை தேவையா?",
      a: "இல்லை — Roger-இன் உள்ளமைக்கப்பட்ட அறிவுத் தளமும் உங்கள் லைவ் தரவுக்கான அணுகலும் விசை இல்லாமல் மற்றும் செலவு இல்லாமல் வேலை செய்கின்றன. ஒரு இணைக்கப்பட்ட AI விசை (ஒரு நிர்வாகியால் அமைக்கப்பட்டது) அதற்கு மேல் முழுமையான திறந்த-முடிவு உரையாடல் மற்றும் பட விளக்கத்தை மட்டுமே சேர்க்கிறது.",
    },
    {
      q: "ஆப்பை நான் இந்தி அல்லது தமிழில் பயன்படுத்தலாமா?",
      a: "ஆம் — அமைப்புகள் → மொழிக்குச் சென்று English, हिंदी அல்லது தமிழைத் தேர்ந்தெடுக்கவும். இந்த கையேடு மற்றும் FMEA அறிக்கை PDF உட்பட முழு ஆப்பும் உடனடியாக மாறும்.",
    },
    {
      q: "ஏற்றுமதி செய்யப்பட்ட PDFகளும் JSON காப்புப்பிரதிகளும் எங்கு செல்கின்றன?",
      a: "நீங்கள் ஒரு இணையதளத்திலிருந்து பதிவிறக்கும் எந்த கோப்பையும் போலவே, அவை உங்கள் உலாவியின் இயல்புநிலை பதிவிறக்க கோப்புறையில் பதிவிறக்கப்படும்.",
    },
  ];

  return { intro, gettingStarted, sections, workflow, faq };
}

export function buildManualContent(lang: ManualLang, args: BuilderArgs): ManualContent {
  if (lang === "hi") return buildManualContentHi(args);
  if (lang === "ta") return buildManualContentTa(args);
  return buildManualContentEn(args);
}
