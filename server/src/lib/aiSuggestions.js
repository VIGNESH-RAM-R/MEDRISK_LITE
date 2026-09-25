// Curated candidate failure modes per component, for the "Suggest Failure Modes"
// panel in the FMEA Workspace — mirrors the reference app's AI_SUGGESTIONS map.

const AI_SUGGESTIONS = {
  TA: [
    "Crystal array micro-fracture under repeated impact loading",
    "Cross-talk between adjacent array elements",
  ],
  AL: ["Air-gap formation between lens and array causing coupling loss"],
  CB: ["Cable jacket abrasion exposing internal shielding"],
  CN: ["Connector housing thread wear from repeated docking cycles"],
  HS: ["UV / sunlight-induced housing polymer embrittlement (outdoor rural camps)"],
  PW: ["Deep-discharge cycling causing accelerated battery capacity loss"],
  EL: ["EMI-induced beamforming noise near other hospital equipment"],
  UI: ["Touch-screen unresponsive in high-humidity field conditions"],
  SH: ["Sheath adhesive residue affecting acoustic coupling after removal"],
};

module.exports = { AI_SUGGESTIONS };
