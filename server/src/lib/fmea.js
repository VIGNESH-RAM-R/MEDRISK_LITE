function computeRpn(s, o, d) {
  return s * o * d;
}

function classifyRpn(rpn, settings) {
  const { alarpFrom, unacceptableFrom } = settings;
  if (rpn >= unacceptableFrom) return "Unacceptable";
  if (rpn >= alarpFrom) return "ALARP";
  return "Acceptable";
}

module.exports = { computeRpn, classifyRpn };
