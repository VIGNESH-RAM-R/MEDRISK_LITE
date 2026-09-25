import { useColorScheme } from "nativewind";

export type ThemeColors = {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  ink1: string;
  ink2: string;
  ink3: string;
  ink4: string;
  tabActive: string;
  tabInactive: string;
  // Brand palette (see MEDRISK_LITE theme overhaul): `accent` is the primary
  // brand color used for solid fills (buttons, active icon tiles) and pairs
  // with `onAccent` for legible text/icons on top of it. `accentText` is a
  // theme-safe variant of the same hue meant to be used directly AS text/
  // border color on a surface (in dark mode this is a lightened tint of
  // `accent`, since the deep brand hex itself doesn't have enough contrast
  // as small text on a near-black background). `accent2` is the secondary
  // brand color, `highlight` is reserved for alert/destructive UI (not the
  // ISO 14971 risk-classification colors, which stay semantic red/amber/
  // green regardless of theme).
  accent: string;
  accentSoft: string;
  accentText: string;
  onAccent: string;
  accent2: string;
  onAccent2: string;
  highlight: string;
  highlightSoft: string;
  highlightText: string;
  onHighlight: string;
};

// Light theme v2: a 6-color pastel set (soft teal/mint for brand+active,
// pale yellow/green for backgrounds+surfaces, peach/tan for secondary/
// highlight). None of the 6 given hexes are dark enough for white text on
// top, so — unlike the previous (darker) light palette — `onAccent`/
// `onAccent2`/`onHighlight` here are a dark ink, and `tabActive`/
// `accentText` are a deepened derivative of the teal (not one of the 6
// literal swatches) specifically so pill borders/active-tab text stay
// legible against these very light surfaces; see SettingsScreen.tsx's
// pill selectors, which pair that fill with literal white text rather
// than `onAccent` for this reason.
const light: ThemeColors = {
  bg: "#FEF8DD",
  surface: "#E1F8DC",
  surface2: "#FFE7C7",
  border: "#C6DAC2",
  ink1: "rgba(28,59,46,.88)",
  ink2: "rgba(28,59,46,.64)",
  ink3: "rgba(28,59,46,.48)",
  ink4: "rgba(28,59,46,.32)",
  tabActive: "#1F6B6D",
  tabInactive: "rgba(28,59,46,.46)",
  accent: "#ACDDDE",
  accentSoft: "rgba(172,221,222,.40)",
  accentText: "#1F6B6D",
  onAccent: "#1C3B2E",
  accent2: "#CAF1DE",
  onAccent2: "#1C3B2E",
  highlight: "#F7D8B4",
  highlightSoft: "rgba(247,216,180,.45)",
  highlightText: "#A8672E",
  onHighlight: "#1C3B2E",
};

const dark: ThemeColors = {
  bg: "#2C2C2C",
  surface: "#3C3C3C",
  surface2: "#323232",
  border: "rgba(255,255,255,.10)",
  ink1: "rgba(238,241,248,.92)",
  ink2: "rgba(238,241,248,.65)",
  ink3: "rgba(238,241,248,.48)",
  ink4: "rgba(238,241,248,.32)",
  tabActive: "#6FD3EC",
  tabInactive: "#798D97",
  accent: "#23708A",
  accentSoft: "rgba(35,112,138,.20)",
  accentText: "#6FD3EC",
  onAccent: "#ffffff",
  accent2: "#175673",
  onAccent2: "#ffffff",
  highlight: "#E37C78",
  highlightSoft: "rgba(227,124,120,.18)",
  highlightText: "#E37C78",
  onHighlight: "#3a0e0c",
};

export const palette = { light, dark };

export function useTheme() {
  const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  return {
    scheme,
    isDark: scheme === "dark",
    colors: palette[scheme],
    toggleTheme: toggleColorScheme,
    setTheme: (mode: "light" | "dark") => setColorScheme(mode),
  };
}
