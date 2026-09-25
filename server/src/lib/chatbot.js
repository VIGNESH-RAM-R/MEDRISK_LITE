const { computeRpn, classifyRpn } = require("./fmea");
const { COMPONENTS } = require("./seedData");
const { MANUAL_DIGEST } = require("./manualDigest");

const CONTACT_INFO = { email: "vigneshramprabha2006@gmail.com", phone: "" };

function fmtComponent(id) {
  const c = COMPONENTS.find((c) => c.id === id);
  return c ? c.name : id;
}

function computeChatStats(failureModes, compliance, settings) {
  const withRpn = failureModes.map((fm) => ({
    ...fm,
    rpn: computeRpn(fm.s, fm.o, fm.d),
    classification: classifyRpn(computeRpn(fm.s, fm.o, fm.d), settings),
  }));
  const sorted = [...withRpn].sort((a, b) => b.rpn - a.rpn);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const avgRpn = withRpn.length
    ? Math.round(withRpn.reduce((sum, f) => sum + f.rpn, 0) / withRpn.length)
    : 0;

  const complianceScore = compliance.length
    ? Math.round(
        (compliance.reduce((sum, c) => {
          if (c.status === "complete") return sum + 1;
          if (c.status === "partial") return sum + 0.5;
          return sum;
        }, 0) /
          compliance.length) *
          100
      )
    : 0;

  const bands = { Acceptable: [], ALARP: [], Unacceptable: [] };
  withRpn.forEach((f) => bands[f.classification].push(f));

  const complianceRows = compliance
    .map((c) => `${c.clause} — ${c.title} (mapped to ${c.mapped}): ${c.status}`)
    .join("\n");

  const byComponent = {};
  for (const fm of withRpn) {
    if (!byComponent[fm.componentId]) byComponent[fm.componentId] = [];
    byComponent[fm.componentId].push(fm);
  }

  const byComponentAvg = COMPONENTS.map((c) => {
    const items = byComponent[c.id] || [];
    const avg = items.length ? Math.round(items.reduce((a, f) => a + f.rpn, 0) / items.length) : 0;
    return { c, items, avg };
  });

  return { withRpn, sorted, highest, lowest, avgRpn, complianceScore, complianceRows, bands, byComponent, byComponentAvg };
}

// Component keyword lookup used both for direct questions ("tell me about the
// cable") and to route to a per-component failure-mode summary.
const COMPONENT_KEYWORDS = [
  ["transducer", "TA"], ["piezoelectric", "TA"], ["crystal array", "TA"],
  ["acoustic lens", "AL"], ["matching layer", "AL"], ["lens", "AL"],
  ["strain relief", "CB"], ["cable", "CB"],
  ["connector", "CN"],
  ["housing", "HS"], ["mechanical seal", "HS"], ["water ingress", "HS"],
  ["battery", "PW"], ["power supply", "PW"],
  ["circuit board", "EL"], ["pcb", "EL"], ["solder", "EL"],
  ["companion app", "UI"], ["user interface", "UI"], ["caliper", "UI"], ["touchscreen", "UI"], ["calibration drift", "UI"],
  ["sheath", "SH"], ["disinfectant", "SH"], ["sterilization", "SH"], ["sterilisation", "SH"],
];

const DOMAIN_HINTS = [
  /fmea/i, /rpn/i, /alarp/i, /severity|occurrence|detect/i,
  /iso ?1497|iec ?606|iec ?6236|iso ?1348/i, /compliance|clause/i, /failure mode/i, /risk/i,
  /probe|transducer|ultrasound/i, /roger|assistant/i,
  /tab|dashboard|workspace|register|report|setting/i,
  new RegExp(COMPONENTS.map((c) => c.name.split("/")[0]).join("|"), "i"),
];
function isOnTopic(text) {
  return DOMAIN_HINTS.some((re) => re.test(text));
}

function buildSystemPrompt(stats, languageName) {
  const rows = stats.withRpn
    .map(
      (f) =>
        `#${f.id} [${fmtComponent(f.componentId)}] ${f.mode} - S${f.s} O${f.o} D${f.d} RPN${f.rpn} (${f.classification})`
    )
    .join("\n");
  const languageInstruction =
    languageName && languageName !== "English"
      ? `\n\nLANGUAGE: the user's app is currently set to ${languageName}. Reply in ${languageName}, ` +
        "including when you decline an off-topic question. Keep FMEA/ISO term abbreviations (RPN, ALARP, S/O/D, " +
        "ISO 14971, IEC 60601-1, etc.) in their original form even when writing in another language, since they " +
        "are formal identifiers, not prose."
      : "";
  return (
    "You are Roger, the AI Assistant built into MedRisk Lite, a web-based FMEA risk-assessment tool for medical devices. " +
    "Introduce yourself as Roger if asked your name." +
    languageInstruction +
    "\n\n" +
    "SCOPE — this is a hard rule, not a preference: you may ONLY answer questions about (1) FMEA concepts " +
    "(RPN, ALARP, Severity/Occurrence/Detectability, etc.), (2) ISO 14971 and the related standards referenced " +
    "in this app (IEC 60601-1, IEC 62366-1, ISO 13485), (3) the user's own live risk data shown below, and " +
    "(4) how to use MedRisk Lite itself, per the manual digest below. For anything outside that scope — general " +
    "knowledge, other software, current events, math/coding unrelated to this app, or any other off-topic " +
    "request — do NOT attempt an answer. Instead, politely decline in one short sentence" +
    (languageName && languageName !== "English" ? ` (written in ${languageName}, same as every other reply)` : "") +
    " and redirect the user to what you can help with (FMEA/ISO 14971 concepts, their risk data, or using the " +
    "app). Do this even if you know the answer to the off-topic question.\n\n" +
    "MedRisk Lite user manual (condensed):\n" +
    MANUAL_DIGEST +
    "\n\nLive FMEA data set currently loaded for a portable ultrasound probe:\n" +
    rows +
    `\n\nLive ISO 14971:2019 compliance data — overall score ${stats.complianceScore}% ` +
    "(Complete=100%, Partial=50%, Pending=0%, averaged across clauses), per clause:\n" +
    stats.complianceRows +
    "\n\nUse this live data when the user asks about their highest/lowest risk item, compliance score or " +
    "status, a specific clause, or any specific failure mode — this data is always in scope. Keep answers " +
    "concise unless more detail is requested."
  );
}

function localFallbackReply(text, ctx) {
  const raw = (text || "").trim();
  const t = raw.toLowerCase();
  const { stats, chatScope } = ctx;

  if (t.length < 40) {
    if (/^(hi|hello|hey|yo|hola|hiya|greetings)[\s!.,]*$/.test(t) || /^good\s?(morning|afternoon|evening)\b/.test(t)) {
      return "Hello! I'm Roger, the MedRisk Lite assistant. Ask me about FMEA concepts, the ultrasound probe risk data, any tab in the app, or troubleshooting.";
    }
    if (/^(thanks|thank you|thx|ty)[\s!.,]*$/.test(t)) {
      return "You're welcome! Let me know if there's anything else about the risk data or the app you'd like help with.";
    }
    if (/^(bye|goodbye|see ya|see you|later)[\s!.,]*$/.test(t)) {
      return "Goodbye! Your data is saved automatically, so you can pick up right where you left off.";
    }
    if (/^(who are you|what are you)\??$/.test(t)) {
      return "I'm Roger, the built-in assistant for MedRisk Lite, a free FMEA risk-assessment tool for the portable ultrasound probe. I answer from the live risk data — no API key or cost required.";
    }
    if (/^(what.?s your name|your name)\??$/.test(t)) {
      return "I'm Roger — the assistant built into MedRisk Lite.";
    }
    if (/^(help|what can you do|how can you help)\??$/.test(t)) {
      return "I can answer questions about FMEA, RPN, ALARP, the standards behind this tool, the live risk data (highest risk, compliance score, per-component breakdowns), how to use each tab, and troubleshooting. Just ask.";
    }
    if (/^(are you (a )?real ai|are you human|are you gpt|are you claude)\??$/.test(t)) {
      return "Without an API key connected, I'm Roger — a lightweight rule-based assistant that answers from a built-in knowledge base about this app and FMEA, not a full language model. An administrator can connect a real AI key on the server to unlock a full AI for open-ended questions.";
    }
  }

  if (/contact (number|info|details)|phone number|call (support|you)|reach (support|you|someone)/.test(t)) {
    return (
      "You can reach support at " +
      CONTACT_INFO.email +
      (CONTACT_INFO.phone ? ", or by phone at " + CONTACT_INFO.phone + "." : ". A phone line isn't set up yet — email is the fastest way to reach out.")
    );
  }
  if (/who (built|made|created|developed) this/.test(t)) {
    return "MedRisk Lite was built as an independent FMEA risk-assessment tool. For questions, reach out at " + CONTACT_INFO.email + ".";
  }
  if (/report a bug|found a bug|something.?s broken/.test(t)) {
    return "Sorry about that! Please email " + CONTACT_INFO.email + " with what you were doing when it happened — screenshots help a lot.";
  }
  if (/feature request|suggest a feature|can you add/.test(t)) {
    return "Feature ideas are always welcome — send them to " + CONTACT_INFO.email + ".";
  }

  if (/highest.?risk|riskiest|worst failure|top risk/.test(t)) {
    const top = stats.highest;
    if (!top) return "There are no failure modes recorded yet.";
    return `The highest-risk failure mode right now is "${top.mode}" on the ${fmtComponent(top.componentId)}, at RPN ${top.rpn} (${top.classification}). Severity ${top.s}, Occurrence ${top.o}, Detectability ${top.d}. Suggested mitigation: ${top.mitigation}`;
  }
  if (/lowest.?risk|safest|least risk/.test(t)) {
    const low = stats.lowest;
    if (!low) return "There are no failure modes recorded yet.";
    return `The lowest-risk failure mode is "${low.mode}" on the ${fmtComponent(low.componentId)}, at RPN ${low.rpn} (${low.classification}).`;
  }
  if (/unacceptable/.test(t) && /how many|count|list|which/.test(t)) {
    const list = stats.bands.Unacceptable.map((f) => f.mode).join("; ") || "none currently";
    return `There are ${stats.bands.Unacceptable.length} Unacceptable failure mode(s): ${list}.`;
  }
  if (/alarp/.test(t) && /how many|count|list|which/.test(t)) {
    const list = stats.bands.ALARP.map((f) => f.mode).join("; ") || "none currently";
    return `There are ${stats.bands.ALARP.length} failure mode(s) in the ALARP band: ${list}.`;
  }
  if (/acceptable/.test(t) && /how many|count|list|which/.test(t) && !/unacceptable/.test(t)) {
    const list = stats.bands.Acceptable.map((f) => f.mode).join("; ") || "none currently";
    return `There are ${stats.bands.Acceptable.length} Acceptable failure mode(s): ${list}.`;
  }
  if (/compliance score|how compliant/.test(t)) {
    return `The current ISO 14971:2019 compliance score is ${stats.complianceScore}%, based on the Complete, Partial or Pending status of each clause in the Compliance tab.`;
  }
  if (/average rpn|mean rpn/.test(t)) {
    return `The average RPN across all ${stats.withRpn.length} documented failure modes is ${stats.avgRpn}.`;
  }
  if (/most failure modes|which component.*most/.test(t)) {
    const top = [...stats.byComponentAvg].sort((a, b) => b.items.length - a.items.length)[0];
    return `${top.c.name} has the most documented failure modes, with ${top.items.length}.`;
  }
  if (/riskiest component|highest.?average.?rpn|which component.*risk/.test(t)) {
    const top = [...stats.byComponentAvg].sort((a, b) => b.avg - a.avg)[0];
    return `${top.c.name} has the highest average RPN, at ${top.avg} across ${top.items.length} failure mode(s).`;
  }
  if (/how many components|number of components|list.*components/.test(t)) {
    return `There are ${COMPONENTS.length} components tracked: ${COMPONENTS.map((c) => c.name).join(", ")}.`;
  }
  if (/how many failure modes|total failure modes/.test(t)) {
    return `There are ${stats.withRpn.length} documented failure modes in the current data set.`;
  }

  for (const [kw, cid] of COMPONENT_KEYWORDS) {
    if (t.includes(kw)) {
      const items = stats.byComponent[cid] || [];
      if (items.length) {
        const list = items.map((f) => `${f.mode} (RPN ${f.rpn}, ${f.classification})`).join("; ");
        return `${fmtComponent(cid)} has ${items.length} documented failure mode(s): ${list}.`;
      }
      return `No failure modes are currently recorded for ${fmtComponent(cid)}.`;
    }
  }

  const kb = [
    [/what is fmea|fmea stand/, "FMEA stands for Failure Mode and Effects Analysis, a structured method for identifying how a product could fail, how serious each failure would be, how likely it is, and how easily it would be caught before causing harm."],
    [/rpn/, "RPN (Risk Priority Number) equals Severity times Occurrence times Detectability. A higher RPN means higher priority for risk mitigation."],
    [/alarp/, "ALARP stands for As Low As Reasonably Practicable. It is the middle risk band between Acceptable and Unacceptable, where mitigation should be considered even though it is not mandatory."],
    [/severity/, "Severity (S) rates how serious the consequence of a failure would be, from 1 (negligible) to 10 (catastrophic)."],
    [/occurrence/, "Occurrence (O) rates how often a failure is likely to happen, from 1 (rare) to 10 (very frequent)."],
    [/detect/, "Detectability (D) rates how likely a failure is to be caught before it causes harm — 1 means almost certain to detect, 10 means cannot detect."],
    [/14971/, "ISO 14971:2019 is the core international standard for medical device risk management. It defines the risk analysis, evaluation, control, and review process this tool is built around."],
    [/60601/, "IEC 60601-1 covers electrical and mechanical safety for medical electrical equipment. It informs several failure modes in this data set, such as housing seal and connector faults."],
    [/62366/, "IEC 62366-1 covers usability engineering for medical devices, including human-factor failure modes like incorrect mode selection or display misreading."],
    [/13485/, "ISO 13485:2016 is the quality management standard for medical devices. It shapes how documentation and risk records should be structured and kept."],
    [/heatmap/, "The Analytics tab includes a component-level risk heatmap, colored by average RPN, useful for spotting the riskiest areas of the device at a glance."],
    [/dashboard/, "The Dashboard tab shows a summary: total failure modes, average RPN, the highest-risk item, the live compliance score, an ALARP breakdown chart, and recent activity."],
    [/device library|library tab/, "The Device Library tab shows the portable ultrasound probe as the active device, plus other device types marked as coming soon."],
    [/workspace/, "The FMEA Workspace tab is where you edit the data: tap a part on the probe diagram to filter its failure modes, then adjust Severity, Occurrence and Detectability. RPN and ALARP update instantly."],
    [/register/, "The Risk Register tab is the master table of every failure mode. Tap a column header to sort, use the pills to filter by ALARP band, or search by keyword."],
    [/analytics/, "The Analytics tab shows an RPN bar chart, a component risk heatmap, saved risk snapshots, and the full timestamped audit trail of every change made to the data."],
    [/compliance/, "The Compliance tab tracks each ISO 14971:2019 clause as Complete, Partial or Pending. The score ring updates live as you change a status."],
    [/settings/, "The Settings tab holds the RPN scoring thresholds for ALARP and Unacceptable, and options to export, import, or reset your data."],
    [/add.*failure mode|new failure mode/, "New failure modes can be added directly on the FMEA Workspace tab, or from a curated suggestion for the selected component."],
    [/export|import|backup/, "In Settings, Export JSON downloads a full backup of your data, Import JSON restores from a backup file, and Reset Demo Data reverts to the original seeded data set."],
    [/threshold|scoring config/, "In Settings you can change the RPN value at which a failure mode becomes ALARP, and the value at which it becomes Unacceptable."],
    [/api key/, "An administrator can connect a real AI API key on the server to unlock full open-ended AI chat. Without one, I answer from a built-in knowledge base and your live FMEA data only."],
    [/novelt|unique|different from|stand out/, "Compared to a manual spreadsheet, this tool automates RPN and ALARP classification, adds a clickable probe diagram, a live compliance tracker, a timestamped audit trail, curated failure-mode suggestions, and this embedded assistant."],
    [/advantage|benefit/, "Key advantages: no installation required, automated and consistent scoring, full traceability through the audit trail, alignment with ISO 14971, IEC 60601-1, IEC 62366-1 and ISO 13485, and one-click regulatory-style PDF reports and manuals."],
    [/^(report|pdf)$/, "Use the Report Generator tab to export a full FMEA report as a PDF, including the failure mode table, RPN chart, and mitigation notes. There is also a separate App User Manual PDF you can generate from the same tab."],

    [/mic.*(not|won.?t|doesn.?t).*work|voice.*not.*(work|support)/, "Voice input uses your browser's built-in speech recognition, which only works on the web build in Chrome or Edge on desktop."],
    [/microphone.*(denied|permission|blocked)/, "If the microphone was blocked, check your browser's site permissions and allow microphone access for this page, then try again."],
    [/no api key|chat.*not.*(work|respond)|ai.*not.*respond/, "Without an API key, I still work using a built-in knowledge base — I just can't do fully open-ended chat. Ask an administrator to set GROQ_API_KEY on the server to unlock full AI conversation."],
    [/wrong rpn|rpn.*(wrong|incorrect)/, "RPN is always Severity × Occurrence × Detectability, recalculated instantly whenever a score changes in the FMEA Workspace. If a number looks wrong, check the three individual S/O/D values for that failure mode."],
    [/forgot password|reset password/, "Use \"Forgot password\" on the sign-in screen if you signed up with email, or continue with Google, which needs no password at all."],
    [/session expired|logged out unexpectedly/, "If you were logged out unexpectedly, your session likely expired — just sign in again; your data is safe in the database."],
    [/(slow|laggy|performance)/, "Performance issues are usually caused by a slow network connection rather than the app itself — try reloading."],

    [/how (do i|to) (navigate|switch|move between) tabs/, "Use the sidebar on the left — tap any of the 9 tiles to jump straight to that section."],
    [/how (do i|to) edit s ?o ?d|how (do i|to) change (severity|occurrence|detectability)/, "Open FMEA Workspace, find the failure mode, and use the S, O, and D controls on its card — RPN and ALARP update instantly."],
    [/how (do i|to) filter (the )?risk register/, "In Risk Register, use the pill buttons (All / Acceptable / ALARP / Unacceptable) to filter by risk band."],
    [/how (do i|to) sort/, "Tap any column header in the Risk Register table to sort by that column — tap again to reverse the order."],
    [/how (do i|to) search/, "Use the search box at the top of the Risk Register to filter by failure mode text or component name."],
    [/how (do i|to) export|how (do i|to) (backup|back up)/, "Go to Settings and tap \"Export JSON\" to download a full backup of your data."],
    [/how (do i|to) import/, "In Settings, tap \"Import JSON\" and choose a previously exported backup file to restore your data."],
    [/how (do i|to) reset (the )?(demo )?data/, "In Settings, tap \"Reset Demo Data\" to revert everything back to the original seeded ultrasound probe data set."],
    [/how (do i|to) change (the )?(rpn )?thresholds/, "In Settings, under RPN Scoring Configuration, set the RPN value where ALARP and Unacceptable begin, then save."],
    [/how (do i|to) (view|check) (the )?compliance score/, "Open the Compliance tab — the ring chart at the top shows your live score, updating instantly as you change clause statuses."],
    [/how (do i|to) attach a photo/, "In the AI Assistant tab, tap the attach icon and choose an image file — it'll be sent along with your next message."],
    [/how (do i|to) clear (the )?chat/, "Tap \"Clear conversation\" in the AI Assistant sidebar to start fresh."],
    [/how does login work/, "Tap \"Continue with Google\" to sign in with your Google account, or use email/password — both give you full access to your risk data."],
    [/how (do i|to) log ?out/, "Go to Settings > Account and tap Sign Out."],
  ];
  for (let i = 0; i < kb.length; i++) {
    if (kb[i][0].test(t)) return kb[i][1];
  }

  if (chatScope === "refuse" && !isOnTopic(t)) {
    return "I can't help with that here — I'm focused on MedRisk Lite and FMEA/ISO 14971 topics.";
  }

  return "I do not have an exact answer for that, but I can help with: FMEA concepts (RPN, ALARP, Severity, Occurrence, Detectability), the ISO 14971, IEC 60601-1, IEC 62366-1 and ISO 13485 standards, live data questions (highest-risk item, compliance score, average RPN, failure modes for a specific component), and how to use each tab. Try rephrasing.";
}

module.exports = { computeChatStats, localFallbackReply, buildSystemPrompt, isOnTopic, CONTACT_INFO };
