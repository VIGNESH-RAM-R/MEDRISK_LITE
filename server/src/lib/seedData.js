// Default dataset for a newly-created workspace — mirrors Knowledge Base §5 verbatim.

const COMPONENTS = [
  { id: "TA", name: "Transducer/Piezoelectric Array", desc: "Converts electrical signal to ultrasound and back.", color: "#22d3ee" },
  { id: "AL", name: "Acoustic Lens & Matching Layer", desc: "Focuses the beam and couples energy into tissue.", color: "#8b5cf6" },
  { id: "CB", name: "Cable & Strain Relief", desc: "Carries signal/power between probe head and console.", color: "#f59e0b" },
  { id: "CN", name: "Connector Assembly", desc: "Mates the probe cable to the console port.", color: "#16a34a" },
  { id: "HS", name: "Housing & Mechanical Seal", desc: "Protects internals and maintains ingress protection.", color: "#e11d48" },
  { id: "PW", name: "Power Supply/Battery", desc: "Powers the probe electronics.", color: "#0ea5e9" },
  { id: "EL", name: "Internal Electronics/PCB", desc: "Signal processing and beamforming circuitry.", color: "#a855f7" },
  { id: "UI", name: "User Interface/Companion App", desc: "On-screen controls, presets, and display.", color: "#f97316" },
  { id: "SH", name: "Protective Sheath/Sterilization Interface", desc: "Single-use barrier for infection control.", color: "#14b8a6" },
];

const FAILURE_MODES = [
  { componentId: "TA", mode: "Piezoelectric crystal delamination", effect: "Loss or distortion of ultrasound image; diagnostic misread risk.", cause: "Repeated thermal/mechanical stress cycles; manufacturing bond defect.", standard: "IEC 60601-1", s: 7, o: 3, d: 5, mitigation: "Periodic image-quality QA checks; vendor-specified drop/stress limits; replace probe if artifact pattern detected." },
  { componentId: "AL", mode: "Acoustic lens crack/surface wear", effect: "Image artifact, reduced sensitivity, potential biocompatibility breach.", cause: "Abrasive cleaning agents; repeated probe-cover friction; aging.", standard: "ISO 14971", s: 6, o: 4, d: 3, mitigation: "Visual inspection before each use; approved cleaning agents only; scheduled lens replacement interval." },
  { componentId: "AL", mode: "Matching-layer bond failure", effect: "Reduced acoustic coupling efficiency, image degradation.", cause: "Adhesive degradation from disinfectant exposure over time.", standard: "ISO 14971", s: 6, o: 2, d: 6, mitigation: "Disinfectant compatibility testing; bond integrity check during preventive maintenance." },
  { componentId: "CB", mode: "Internal cable wire fracture near strain relief", effect: "Intermittent or total signal loss during scan.", cause: "Repetitive bending fatigue at the strain-relief boundary.", standard: "IEC 60601-1", s: 6, o: 5, d: 4, mitigation: "Cable strain-relief redesign to spec; user training on cable handling; continuity check on PM schedule." },
  { componentId: "CN", mode: "Connector pin corrosion/oxidation", effect: "Signal noise or intermittent connection at console.", cause: "Humidity/fluid ingress in low-resource field environments.", standard: "IEC 60601-1", s: 4, o: 4, d: 4, mitigation: "Sealed connector design; field-cleaning protocol; pre-use connector inspection." },
  { componentId: "HS", mode: "Housing crack or seal breach", effect: "Fluid ingress leading to electrical hazard or internal damage.", cause: "Drop impact; seal material fatigue.", standard: "IEC 60601-1", s: 9, o: 2, d: 5, mitigation: "Impact-resistant housing material; ingress test per IEC 60601-1; immediate quarantine on visible crack." },
  { componentId: "HS", mode: "Accidental drop/mechanical shock damage", effect: "Internal component misalignment or fracture.", cause: "Handling in high-traffic point-of-care settings; lack of drop protection.", standard: "IEC 60601-1", s: 5, o: 5, d: 3, mitigation: "Protective carry case; user training; post-drop functional check protocol." },
  { componentId: "PW", mode: "Battery swelling or overheating", effect: "Fire/burn hazard; unexpected shutdown mid-exam.", cause: "Overcharge cycling; cell aging beyond rated life.", standard: "IEC 60601-1", s: 8, o: 2, d: 4, mitigation: "Battery management system with thermal cutoff; scheduled replacement; visual swelling check." },
  { componentId: "EL", mode: "PCB/solder joint failure", effect: "Partial or total loss of device function.", cause: "Thermal cycling fatigue; vibration during transport.", standard: "IEC 60601-1", s: 6, o: 3, d: 5, mitigation: "Conformal coating; vibration-tested transport case; incoming QA on solder joints." },
  { componentId: "UI", mode: "Incorrect exam-mode/preset selection", effect: "Suboptimal image settings for the clinical context; misdiagnosis risk.", cause: "Ambiguous UI labeling; insufficient operator training.", standard: "IEC 62366-1", s: 6, o: 4, d: 5, mitigation: "Usability testing on preset menu; on-screen confirmation for high-risk presets; operator training checklist." },
  { componentId: "UI", mode: "On-screen caliper/measurement calibration drift", effect: "Inaccurate clinical measurements (e.g. gestational age, organ size).", cause: "Software rounding drift; uncalibrated display scaling after update.", standard: "IEC 62366-1", s: 7, o: 3, d: 6, mitigation: "Calibration verification after every software update; periodic phantom-based measurement audit." },
  { componentId: "UI", mode: "Software freeze/lockup mid-scan", effect: "Exam interruption; potential loss of unsaved images.", cause: "Memory leak in companion app; unhandled exception on edge-case input.", standard: "IEC 62366-1", s: 4, o: 4, d: 3, mitigation: "Watchdog auto-restart; crash logging; regression test suite before release." },
  { componentId: "SH", mode: "Protective sheath/probe-cover breach", effect: "Cross-contamination risk between patients.", cause: "Sheath material puncture; incorrect application technique.", standard: "ISO 14971", s: 8, o: 3, d: 4, mitigation: "Pre-use sheath integrity check; operator training; single-use enforcement." },
  { componentId: "SH", mode: "Disinfectant chemical incompatibility", effect: "Material degradation of sheath or probe surface.", cause: "Use of a non-approved disinfectant in resource-constrained settings.", standard: "ISO 14971", s: 5, o: 4, d: 5, mitigation: "Publish approved disinfectant list; compatibility testing; labeling on the device itself." },
  { componentId: "UI", mode: "Display brightness/contrast degradation", effect: "Reduced diagnostic image visibility, especially in bright field conditions.", cause: "Screen aging; lack of ambient-light calibration.", standard: "ISO 14971", s: 3, o: 5, d: 3, mitigation: "Brightness self-test on startup; anti-glare screen protector; scheduled display QA." },
];

const COMPLIANCE_CLAUSES = [
  { clause: "Cl.4", title: "Risk Management Process", mapped: "ISO 14971:2019", status: "complete" },
  { clause: "Cl.5", title: "Risk Analysis", mapped: "ISO 14971:2019", status: "complete" },
  { clause: "Cl.6", title: "Risk Evaluation", mapped: "ISO 14971:2019", status: "complete" },
  { clause: "Cl.7", title: "Risk Control", mapped: "ISO 14971:2019", status: "partial" },
  { clause: "Cl.8", title: "Overall Residual Risk Evaluation", mapped: "ISO 14971:2019", status: "partial" },
  { clause: "Cl.9", title: "Risk Management Review", mapped: "ISO 14971:2019", status: "pending" },
  { clause: "Cl.10", title: "Production & Post-Production Information", mapped: "ISO 14971:2019", status: "pending" },
];

module.exports = { COMPONENTS, FAILURE_MODES, COMPLIANCE_CLAUSES };
