export type Classification = "Acceptable" | "ALARP" | "Unacceptable";

export function computeRpn(s: number, o: number, d: number): number {
  return s * o * d;
}

export function classifyRpn(
  rpn: number,
  settings: { alarpFrom: number; unacceptableFrom: number }
): Classification {
  if (rpn >= settings.unacceptableFrom) return "Unacceptable";
  if (rpn >= settings.alarpFrom) return "ALARP";
  return "Acceptable";
}

export function classificationColor(c: Classification): string {
  if (c === "Unacceptable") return "#fb7185";
  if (c === "ALARP") return "#f59e0b";
  return "#34d399";
}
