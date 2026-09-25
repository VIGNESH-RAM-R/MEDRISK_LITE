// Static labels/headers for the FMEA Report PDF (both the jsPDF web builder in
// pdfBuilders.ts and the HTML/native builder in pdfTemplates.ts), translated
// per Phase 3. The manual/Quickstart Guide's own text lives in
// manualContent.ts; this file only covers the FMEA report's chrome. User data
// (failure mode text, mitigation text, classification/status values already
// covered by i18n keys elsewhere) is rendered as entered, not translated here.

export type Lang = "en" | "hi" | "ta";

export type ExecSummaryArgs = {
  count: number;
  avgRpn: number;
  topMode: string;
  topComponent: string;
  topRpn: number;
  topClass: string;
  compScore: number;
  completeClauses: number;
  totalClauses: number;
};

export const PDF_STRINGS: Record<
  Lang,
  {
    reportTitle: string;
    reportSubtitle: string;
    reportIdLabel: string;
    generatedLabel: string;
    statFailureModes: string;
    statAvgRpn: string;
    statHighestRpn: string;
    statCompliance: string;
    objectivesTitle: string;
    objectivesBody: (componentCount: number) => string;
    fullTableTitle: string;
    colIndex: string;
    colComponent: string;
    colFailureMode: string;
    colEffect: string;
    colCause: string;
    colS: string;
    colO: string;
    colD: string;
    colRpn: string;
    colClassification: string;
    mitigationNotesTitle: string;
    complianceSummaryTitle: string;
    colClause: string;
    colTitle: string;
    colStatus: string;
    signOffTitle: string;
    signOffLine: string;
    footerReport: string;
    manualTitle: string;
    manualSubtitle: string;
    manualGenerated: string;
    manualWhatItDoes: string;
    manualTypicalWorkflow: string;
    manualWorkflowIntro: string;
    manualFaqTitle: string;
    manualSupportTitle: string;
    manualSupportBody: string;
    manualFooter: string;
    figurePlaceholder: string;
    figureCaption: (caption: string) => string;

    // --- Added for the expanded (6-8 page) FMEA report ---
    deviceName: string;
    coverVersionLabel: string;
    coverVersion: string;
    coverOrgLabel: string;
    coverDeviceLabel: string;
    runningHeader: string;
    pageOf: (page: number, total: number) => string;

    execSummaryTitle: string;
    execSummaryNarrative: (p: ExecSummaryArgs) => string;
    execSummaryPostureAttention: string;
    execSummaryPostureGood: string;

    deviceScopeTitle: string;
    deviceScopeIntro: string;
    componentsListTitle: string;
    standardsListTitle: string;
    standardsIntro: string;
    standardsList: string[];

    riskDistributionTitle: string;
    riskDistributionIntro: string;
    colBand: string;
    colCount: string;
    colShare: string;

    auditTrailTitle: string;
    auditTrailIntro: string;
    auditTrailEmpty: string;
    colWhen: string;
    colActivity: string;
    colUser: string;

    signOffReviewerLine: string;
    signOffApproverLine: string;
  }
> = {
  en: {
    reportTitle: "MedRisk Lite — FMEA Risk Assessment Report",
    reportSubtitle: "Portable Ultrasound Probe · Failure Mode and Effects Analysis",
    reportIdLabel: "Report ID",
    generatedLabel: "Generated",
    statFailureModes: "Failure Modes Documented",
    statAvgRpn: "Average RPN",
    statHighestRpn: "Highest Risk RPN",
    statCompliance: "ISO 14971 Compliance",
    objectivesTitle: "Objectives & Scope",
    objectivesBody: (n) =>
      `This report documents the Failure Mode and Effects Analysis (FMEA) for the portable ultrasound probe across ${n} components, aligned to ISO 14971:2019, IEC 60601-1, IEC 62366-1 and ISO 13485:2016. It records Severity, Occurrence and Detectability scoring, the resulting Risk Priority Number (RPN), and each failure mode's ALARP classification and mitigation.`,
    fullTableTitle: "Full FMEA Table",
    colIndex: "#",
    colComponent: "Component",
    colFailureMode: "Failure Mode",
    colEffect: "Effect",
    colCause: "Cause",
    colS: "S",
    colO: "O",
    colD: "D",
    colRpn: "RPN",
    colClassification: "Classification",
    mitigationNotesTitle: "Mitigation Notes",
    complianceSummaryTitle: "ISO 14971:2019 Compliance Summary",
    colClause: "Clause",
    colTitle: "Title",
    colStatus: "Status",
    signOffTitle: "Sign-off",
    signOffLine: "Prepared by: ____________________    Reviewed by: ____________________    Date: ____________________",
    footerReport: "MedRisk Lite — FMEA Tool for Portable Ultrasound Probes · Generated automatically from live workspace data",
    manualTitle: "MedRisk Lite — Quickstart Guide",
    manualSubtitle: "FMEA risk assessment for the portable ultrasound probe",
    manualGenerated: "Generated",
    manualWhatItDoes: "What MedRisk Lite Does",
    manualTypicalWorkflow: "Typical Workflow",
    manualWorkflowIntro:
      "A first-time walkthrough of the whole loop — from a blank idea to an updated report — not just a list of features. To assess a new failure mode from scratch:",
    manualFaqTitle: "FAQ & Troubleshooting",
    manualSupportTitle: "Support",
    manualSupportBody: "For questions or feedback, contact vigneshramprabha2006@gmail.com.",
    manualFooter: "MedRisk Lite — Quickstart Guide",
    figurePlaceholder: "Figure placeholder",
    figureCaption: (caption) => `Fig: ${caption}`,

    deviceName: "Portable Ultrasound Probe",
    coverVersionLabel: "Version",
    coverVersion: "1.0",
    coverOrgLabel: "Organization / Workspace",
    coverDeviceLabel: "Device",
    runningHeader: "FMEA Risk Assessment Report",
    pageOf: (page, total) => `Page ${page} of ${total}`,

    execSummaryTitle: "Executive Summary",
    execSummaryNarrative: (p) =>
      `This assessment documents ${p.count} failure modes for the portable ultrasound probe, with an average Risk Priority Number (RPN) of ${p.avgRpn}. The highest-priority item currently on record is "${p.topMode}" (${p.topComponent}), scoring RPN ${p.topRpn} and classified ${p.topClass}. Overall ISO 14971:2019 compliance stands at ${p.compScore}%, with ${p.completeClauses} of ${p.totalClauses} clauses marked complete.`,
    execSummaryPostureAttention:
      "The device's current risk posture requires continued mitigation focus: one or more failure modes remain classified Unacceptable and should be prioritized before this file is considered submission-ready.",
    execSummaryPostureGood:
      "No failure modes are currently classified Unacceptable, and the device's overall risk posture is consistent with an as-low-as-reasonably-practicable (ALARP) profile.",

    deviceScopeTitle: "Device & Scope",
    deviceScopeIntro:
      "The Portable Ultrasound Probe is a handheld point-of-care diagnostic imaging device. This assessment evaluates failure modes across the device's full component set — from signal generation and image processing through to the physical housing, cabling and companion software — spanning intended use, cleaning/disinfection, and normal handling conditions.",
    componentsListTitle: "Components Covered",
    standardsListTitle: "Referenced Standards",
    standardsIntro: "This FMEA is aligned to the following standards:",
    standardsList: [
      "ISO 14971:2019 — Application of risk management to medical devices",
      "IEC 60601-1 — Basic safety and essential performance of medical electrical equipment",
      "IEC 62366-1 — Application of usability engineering to medical devices",
    ],

    riskDistributionTitle: "Risk Distribution Summary",
    riskDistributionIntro:
      "Every documented failure mode is banded into one of three ALARP classifications based on its Risk Priority Number (RPN):",
    colBand: "Classification",
    colCount: "Count",
    colShare: "Share",

    auditTrailTitle: "Audit Trail Summary",
    auditTrailIntro:
      "The most recent workspace activity, included here as a record of ongoing risk-management activity rather than a one-time static snapshot:",
    auditTrailEmpty: "No recorded activity yet.",
    colWhen: "Date",
    colActivity: "Activity",
    colUser: "User",

    signOffReviewerLine: "Reviewed by: ____________________________        Date: ______________",
    signOffApproverLine: "Approved by: ____________________________        Date: ______________",
  },
  hi: {
    reportTitle: "MedRisk Lite — FMEA जोखिम आकलन रिपोर्ट",
    reportSubtitle: "पोर्टेबल अल्ट्रासाउंड प्रोब · फेल्योर मोड एंड इफेक्ट्स एनालिसिस",
    reportIdLabel: "रिपोर्ट आईडी",
    generatedLabel: "जनरेट किया गया",
    statFailureModes: "दर्ज किए गए फेल्योर मोड",
    statAvgRpn: "औसत RPN",
    statHighestRpn: "सर्वाधिक जोखिम RPN",
    statCompliance: "ISO 14971 कंप्लायंस",
    objectivesTitle: "उद्देश्य और दायरा",
    objectivesBody: (n) =>
      `यह रिपोर्ट ${n} कंपोनेंट में पोर्टेबल अल्ट्रासाउंड प्रोब के लिए फेल्योर मोड एंड इफेक्ट्स एनालिसिस (FMEA) का दस्तावेज़ीकरण करती है, जो ISO 14971:2019, IEC 60601-1, IEC 62366-1 और ISO 13485:2016 के अनुरूप है। यह सेवेरिटी, ऑकरेंस और डिटेक्टेबिलिटी स्कोरिंग, परिणामी रिस्क प्रायोरिटी नंबर (RPN), और हर फेल्योर मोड के ALARP वर्गीकरण और मिटिगेशन को दर्ज करती है।`,
    fullTableTitle: "पूरी FMEA तालिका",
    colIndex: "#",
    colComponent: "कंपोनेंट",
    colFailureMode: "फेल्योर मोड",
    colEffect: "प्रभाव",
    colCause: "कारण",
    colS: "S",
    colO: "O",
    colD: "D",
    colRpn: "RPN",
    colClassification: "वर्गीकरण",
    mitigationNotesTitle: "मिटिगेशन नोट्स",
    complianceSummaryTitle: "ISO 14971:2019 कंप्लायंस सारांश",
    colClause: "क्लॉज़",
    colTitle: "शीर्षक",
    colStatus: "स्थिति",
    signOffTitle: "साइन-ऑफ",
    signOffLine: "तैयार किया गया: ____________________    समीक्षा की गई: ____________________    दिनांक: ____________________",
    footerReport: "MedRisk Lite — पोर्टेबल अल्ट्रासाउंड प्रोब के लिए FMEA टूल · लाइव वर्कस्पेस डेटा से स्वचालित रूप से जनरेट किया गया",
    manualTitle: "MedRisk Lite — क्विकस्टार्ट गाइड",
    manualSubtitle: "पोर्टेबल अल्ट्रासाउंड प्रोब के लिए FMEA जोखिम आकलन",
    manualGenerated: "जनरेट किया गया",
    manualWhatItDoes: "MedRisk Lite क्या करता है",
    manualTypicalWorkflow: "विशिष्ट वर्कफ़्लो",
    manualWorkflowIntro:
      "पूरे लूप का पहला वॉकथ्रू — एक खाली विचार से एक अपडेट की गई रिपोर्ट तक — सिर्फ फीचर्स की सूची नहीं। शुरू से एक नए फेल्योर मोड का आकलन करने के लिए:",
    manualFaqTitle: "सामान्य प्रश्न और समस्या निवारण",
    manualSupportTitle: "सहायता",
    manualSupportBody: "सवालों या फ़ीडबैक के लिए, vigneshramprabha2006@gmail.com पर संपर्क करें।",
    manualFooter: "MedRisk Lite — क्विकस्टार्ट गाइड",
    figurePlaceholder: "चित्र प्लेसहोल्डर",
    figureCaption: (caption) => `चित्र: ${caption}`,

    deviceName: "पोर्टेबल अल्ट्रासाउंड प्रोब",
    coverVersionLabel: "वर्शन",
    coverVersion: "1.0",
    coverOrgLabel: "संगठन / वर्कस्पेस",
    coverDeviceLabel: "डिवाइस",
    runningHeader: "FMEA जोखिम आकलन रिपोर्ट",
    pageOf: (page, total) => `पृष्ठ ${page} / ${total}`,

    execSummaryTitle: "कार्यकारी सारांश",
    execSummaryNarrative: (p) =>
      `यह आकलन पोर्टेबल अल्ट्रासाउंड प्रोब के लिए ${p.count} फेल्योर मोड दर्ज करता है, जिसका औसत रिस्क प्रायोरिटी नंबर (RPN) ${p.avgRpn} है। वर्तमान में सबसे उच्च-प्राथमिकता वाला आइटम "${p.topMode}" (${p.topComponent}) है, जिसका RPN ${p.topRpn} है और जिसे ${p.topClass} के रूप में वर्गीकृत किया गया है। कुल ISO 14971:2019 कंप्लायंस ${p.compScore}% है, जिसमें ${p.totalClauses} में से ${p.completeClauses} क्लॉज़ पूर्ण चिह्नित हैं।`,
    execSummaryPostureAttention:
      "डिवाइस की वर्तमान जोखिम स्थिति को निरंतर मिटिगेशन ध्यान देने की आवश्यकता है: एक या अधिक फेल्योर मोड अभी भी Unacceptable के रूप में वर्गीकृत हैं और इस फ़ाइल को सबमिशन-रेडी मानने से पहले उन्हें प्राथमिकता दी जानी चाहिए।",
    execSummaryPostureGood:
      "वर्तमान में कोई भी फेल्योर मोड Unacceptable के रूप में वर्गीकृत नहीं है, और डिवाइस की समग्र जोखिम स्थिति ALARP (as-low-as-reasonably-practicable) प्रोफ़ाइल के अनुरूप है।",

    deviceScopeTitle: "डिवाइस और दायरा",
    deviceScopeIntro:
      "पोर्टेबल अल्ट्रासाउंड प्रोब एक हैंडहेल्ड पॉइंट-ऑफ़-केयर डायग्नोस्टिक इमेजिंग डिवाइस है। यह आकलन डिवाइस के पूरे कंपोनेंट सेट में फेल्योर मोड का मूल्यांकन करता है — सिग्नल जनरेशन और इमेज प्रोसेसिंग से लेकर फिज़िकल हाउज़िंग, केबलिंग और कम्पैनियन सॉफ़्टवेयर तक — जिसमें इच्छित उपयोग, सफाई/कीटाणुशोधन, और सामान्य हैंडलिंग स्थितियां शामिल हैं।",
    componentsListTitle: "शामिल कंपोनेंट",
    standardsListTitle: "संदर्भित मानक",
    standardsIntro: "यह FMEA निम्नलिखित मानकों के अनुरूप है:",
    standardsList: [
      "ISO 14971:2019 — मेडिकल डिवाइसेज़ पर रिस्क मैनेजमेंट का अनुप्रयोग",
      "IEC 60601-1 — मेडिकल इलेक्ट्रिकल उपकरणों की बुनियादी सुरक्षा और आवश्यक प्रदर्शन",
      "IEC 62366-1 — मेडिकल डिवाइसेज़ पर यूज़ेबिलिटी इंजीनियरिंग का अनुप्रयोग",
    ],

    riskDistributionTitle: "जोखिम वितरण सारांश",
    riskDistributionIntro:
      "हर दर्ज किया गया फेल्योर मोड उसके रिस्क प्रायोरिटी नंबर (RPN) के आधार पर तीन ALARP वर्गीकरणों में से एक में बांटा गया है:",
    colBand: "वर्गीकरण",
    colCount: "संख्या",
    colShare: "हिस्सा",

    auditTrailTitle: "ऑडिट ट्रेल सारांश",
    auditTrailIntro:
      "हाल की वर्कस्पेस गतिविधि, जिसे यहां एक स्थिर स्नैपशॉट के बजाय चल रही रिस्क-मैनेजमेंट गतिविधि के रिकॉर्ड के रूप में शामिल किया गया है:",
    auditTrailEmpty: "अभी तक कोई गतिविधि दर्ज नहीं हुई।",
    colWhen: "दिनांक",
    colActivity: "गतिविधि",
    colUser: "उपयोगकर्ता",

    signOffReviewerLine: "समीक्षा की गई: ____________________________        दिनांक: ______________",
    signOffApproverLine: "स्वीकृत: ____________________________        दिनांक: ______________",
  },
  ta: {
    reportTitle: "MedRisk Lite — FMEA ரிஸ்க் மதிப்பீட்டு அறிக்கை",
    reportSubtitle: "பீடபிள் அல்ட்ராசவுண்ட் புரோப் · Failure Mode and Effects Analysis",
    reportIdLabel: "அறிக்கை ஐடி",
    generatedLabel: "உருவாக்கப்பட்டது",
    statFailureModes: "பதிவு செய்யப்பட்ட தோல்வி வகைகள்",
    statAvgRpn: "சராசரி RPN",
    statHighestRpn: "அதிக ரிஸ்க் RPN",
    statCompliance: "ISO 14971 இணக்கம்",
    objectivesTitle: "நோக்கங்கள் மற்றும் நோக்கம்",
    objectivesBody: (n) =>
      `இந்த அறிக்கை ${n} கூறுகளில் பீடபிள் அல்ட்ராசவுண்ட் புரோப்பிற்கான Failure Mode and Effects Analysis (FMEA) ஆவணப்படுத்துகிறது, ISO 14971:2019, IEC 60601-1, IEC 62366-1 மற்றும் ISO 13485:2016 உடன் இணைந்தது. இது தீவிரம், நிகழ்வு மற்றும் கண்டறியும் தன்மை மதிப்பீடு, விளைந்த Risk Priority Number (RPN), மற்றும் ஒவ்வொரு தோல்வி வகையின் ALARP வகைப்பாடு மற்றும் தணிப்பு நடவடிக்கையையும் பதிவு செய்கிறது.`,
    fullTableTitle: "முழு FMEA அட்டவணை",
    colIndex: "#",
    colComponent: "கூறு",
    colFailureMode: "தோல்வி வகை",
    colEffect: "விளைவு",
    colCause: "காரணம்",
    colS: "S",
    colO: "O",
    colD: "D",
    colRpn: "RPN",
    colClassification: "வகைப்பாடு",
    mitigationNotesTitle: "தணிப்பு நடவடிக்கை குறிப்புகள்",
    complianceSummaryTitle: "ISO 14971:2019 இணக்க சுருக்கம்",
    colClause: "விதி",
    colTitle: "தலைப்பு",
    colStatus: "நிலை",
    signOffTitle: "கையொப்பம்",
    signOffLine: "தயாரித்தவர்: ____________________    மதிப்பாய்வு செய்தவர்: ____________________    தேதி: ____________________",
    footerReport: "MedRisk Lite — பீடபிள் அல்ட்ராசவுண்ட் புரோப்பிற்கான FMEA கருவி · லைவ் பணியிடத் தரவிலிருந்து தானாக உருவாக்கப்பட்டது",
    manualTitle: "MedRisk Lite — க்விக்ஸ்டார்ட் வழிகாட்டி",
    manualSubtitle: "பீடபிள் அல்ட்ராசவுண்ட் புரோப்பிற்கான FMEA ரிஸ்க் மதிப்பீடு",
    manualGenerated: "உருவாக்கப்பட்டது",
    manualWhatItDoes: "MedRisk Lite என்ன செய்கிறது",
    manualTypicalWorkflow: "வழக்கமான பணிப்பாய்வு",
    manualWorkflowIntro:
      "முழு சுழற்சியின் முதல்-முறை வழிகாட்டி — ஒரு வெற்று யோசனையிலிருந்து புதுப்பிக்கப்பட்ட அறிக்கை வரை — வெறும் அம்சங்களின் பட்டியல் அல்ல. புதிதாக ஒரு புதிய தோல்வி வகையை மதிப்பிட:",
    manualFaqTitle: "அடிக்கடி கேட்கப்படும் கேள்விகள் மற்றும் சிக்கல் தீர்வு",
    manualSupportTitle: "ஆதரவு",
    manualSupportBody: "கேள்விகள் அல்லது கருத்துகளுக்கு, vigneshramprabha2006@gmail.com ஐத் தொடர்பு கொள்ளவும்.",
    manualFooter: "MedRisk Lite — க்விக்ஸ்டார்ட் வழிகாட்டி",
    figurePlaceholder: "படம் இடப்பிடி",
    figureCaption: (caption) => `படம்: ${caption}`,

    deviceName: "பீடபிள் அல்ட்ராசவுண்ட் புரோப்",
    coverVersionLabel: "பதிப்பு",
    coverVersion: "1.0",
    coverOrgLabel: "நிறுவனம் / பணியிடம்",
    coverDeviceLabel: "சாதனம்",
    runningHeader: "FMEA ரிஸ்க் மதிப்பீட்டு அறிக்கை",
    pageOf: (page, total) => `பக்கம் ${page} / ${total}`,

    execSummaryTitle: "நிர்வாக சுருக்கம்",
    execSummaryNarrative: (p) =>
      `இந்த மதிப்பீடு பீடபிள் அல்ட்ராசவுண்ட் புரோப்பிற்கான ${p.count} தோல்வி வகைகளை ஆவணப்படுத்துகிறது, சராசரி Risk Priority Number (RPN) ${p.avgRpn}. தற்போது மிக உயர் முன்னுரிமை உள்ள உருப்படி "${p.topMode}" (${p.topComponent}), RPN ${p.topRpn} உடன், ${p.topClass} என வகைப்படுத்தப்பட்டுள்ளது. மொத்த ISO 14971:2019 இணக்கம் ${p.compScore}% ஆக உள்ளது, ${p.totalClauses} இல் ${p.completeClauses} விதிகள் முழுமையானதாக குறிக்கப்பட்டுள்ளன.`,
    execSummaryPostureAttention:
      "சாதனத்தின் தற்போதைய ரிஸ்க் நிலைக்கு தொடர்ந்த தணிப்பு கவனம் தேவை: ஒன்று அல்லது அதற்கு மேற்பட்ட தோல்வி வகைகள் இன்னும் Unacceptable எனக் குறிக்கப்பட்டுள்ளன, இந்த கோப்பு சமர்ப்பிக்கத் தயார் எனக் கருதப்படுவதற்கு முன் அவை முன்னுரிமை பெற வேண்டும்.",
    execSummaryPostureGood:
      "தற்போது எந்த தோல்வி வகையும் Unacceptable எனக் குறிக்கப்படவில்லை, சாதனத்தின் ஒட்டுமொத்த ரிஸ்க் நிலை ALARP (as-low-as-reasonably-practicable) சுயவிவரத்திற்கு இணங்குகிறது.",

    deviceScopeTitle: "சாதனம் மற்றும் நோக்கம்",
    deviceScopeIntro:
      "பீடபிள் அல்ட்ராசவுண்ட் புரோப் ஒரு கைவைத்து இயக்கக்கூடிய point-of-care டயக்னாஸ்டிக் இமேஜிங் சாதனம் ஆகும். இந்த மதிப்பீடு சாதனத்தின் முழு கூறுகள் தொகுப்பிலும் தோல்வி வகைகளை மதிப்பிடுகிறது — சிக்னல் உருவாக்கம் மற்றும் இமேஜ் செயலாக்கத்திலிருந்து பிசிகல் ஹவுசிங், கேபிளிங் மற்றும் துணை மென்பொருள் வரை — நோக்கம் கொண்ட பயன்பாடு, சுத்தம்/கிருமி நீக்கம், மற்றும் சாதாரண கையாளுதல் நிலைமைகளை உள்ளடக்கியது.",
    componentsListTitle: "உள்ளடக்கப்பட்ட கூறுகள்",
    standardsListTitle: "குறிப்பிடப்பட்ட தரநிலைகள்",
    standardsIntro: "இந்த FMEA பின்வரும் தரநிலைகளுடன் இணைந்துள்ளது:",
    standardsList: [
      "ISO 14971:2019 — மருத்துவ சாதனங்களுக்கான ரிஸ்க் மேலாண்மையின் பயன்பாடு",
      "IEC 60601-1 — மருத்துவ மின் உபகரணங்களின் அடிப்படை பாதுகாப்பு மற்றும் அத்தியாவசிய செயல்திறன்",
      "IEC 62366-1 — மருத்துவ சாதனங்களுக்கான usability engineering பயன்பாடு",
    ],

    riskDistributionTitle: "ரிஸ்க் விநியோக சுருக்கம்",
    riskDistributionIntro:
      "ஒவ்வொரு பதிவு செய்யப்பட்ட தோல்வி வகையும் அதன் Risk Priority Number (RPN) அடிப்படையில் மூன்று ALARP வகைப்பாடுகளில் ஒன்றாக பிரிக்கப்பட்டுள்ளது:",
    colBand: "வகைப்பாடு",
    colCount: "எண்ணிக்கை",
    colShare: "பங்கு",

    auditTrailTitle: "தணிக்கை பதிவு சுருக்கம்",
    auditTrailIntro:
      "சமீபத்திய பணியிட செயல்பாடு, ஒரு நிலையான ஸ்னாப்ஷாட்டாக அல்லாமல் தொடர்ந்து நடைபெறும் ரிஸ்க்-மேலாண்மை செயல்பாட்டின் பதிவாக இங்கே சேர்க்கப்பட்டுள்ளது:",
    auditTrailEmpty: "இதுவரை எந்த செயல்பாடும் பதிவு செய்யப்படவில்லை.",
    colWhen: "தேதி",
    colActivity: "செயல்பாடு",
    colUser: "பயனர்",

    signOffReviewerLine: "மதிப்பாய்வு செய்தவர்: ____________________________        தேதி: ______________",
    signOffApproverLine: "அங்கீகரித்தவர்: ____________________________        தேதி: ______________",
  },
};
