// Component/view metadata that doesn't change with language (id, color, tile
// abbreviation) lives here as plain static data. The translatable text (name,
// desc, label, sub) is looked up on demand via a translate function so every
// screen re-renders it in the current language — see componentName/
// translatedComponents/translatedViews below. The "tile" 2-letter monograms
// and standard codes (ISO 14971 etc.) are intentionally left untranslated:
// they're short visual/formal identifiers, not prose.

export type Component = {
  id: string;
  name: string;
  desc: string;
  color: string;
};

export type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export const COMPONENT_META: { id: string; color: string }[] = [
  { id: "TA", color: "#22d3ee" },
  { id: "AL", color: "#8b5cf6" },
  { id: "CB", color: "#f59e0b" },
  { id: "CN", color: "#16a34a" },
  { id: "HS", color: "#e11d48" },
  { id: "PW", color: "#0ea5e9" },
  { id: "EL", color: "#a855f7" },
  { id: "UI", color: "#f97316" },
  { id: "SH", color: "#14b8a6" },
];

export function componentName(id: string, t: TranslateFn): string {
  return t(`components.${id}.name`, { defaultValue: id });
}

export function componentDesc(id: string, t: TranslateFn): string {
  return t(`components.${id}.desc`, { defaultValue: "" });
}

export function componentColor(id: string): string {
  return COMPONENT_META.find((c) => c.id === id)?.color ?? "#94a3b8";
}

export function translatedComponents(t: TranslateFn): Component[] {
  return COMPONENT_META.map((c) => ({ ...c, name: componentName(c.id, t), desc: componentDesc(c.id, t) }));
}

export type ViewId =
  | "dashboard"
  | "library"
  | "workspace"
  | "register"
  | "analytics"
  | "compliance"
  | "assistant"
  | "report"
  | "settings";

// `icon` names are Ionicons glyphs (from @expo/vector-icons, bundled with
// Expo) rendered in the sidebar tile in place of the old 2-letter monogram.
const VIEW_META: { id: ViewId; color: string; tile: string; icon: string }[] = [
  { id: "dashboard", color: "#0891b2", tile: "DB", icon: "grid-outline" },
  { id: "library", color: "#059669", tile: "DL", icon: "hardware-chip-outline" },
  { id: "workspace", color: "#e11d48", tile: "FW", icon: "construct-outline" },
  { id: "register", color: "#7c3aed", tile: "RR", icon: "list-outline" },
  { id: "analytics", color: "#2563eb", tile: "AN", icon: "bar-chart-outline" },
  { id: "compliance", color: "#db2777", tile: "CO", icon: "shield-checkmark-outline" },
  { id: "assistant", color: "#9333ea", tile: "AI", icon: "sparkles-outline" },
  { id: "report", color: "#d97706", tile: "RG", icon: "document-text-outline" },
  { id: "settings", color: "#475569", tile: "ST", icon: "settings-outline" },
];

export function translatedViews(
  t: TranslateFn
): { id: ViewId; label: string; sub: string; color: string; tile: string; icon: string }[] {
  return VIEW_META.map((v) => ({
    ...v,
    label: t(`nav.${v.id}.label`, { defaultValue: v.id }),
    sub: t(`nav.${v.id}.sub`, { defaultValue: "" }),
  }));
}
