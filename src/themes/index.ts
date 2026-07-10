/**
 * LootLoom — Theme Tokens (JS)
 * Mirrors the CSS custom properties defined in globals.css.
 * Used by chart libraries and JS-driven styling that cannot use CSS vars directly.
 */
export const theme = {
  light: {
    background: "#fdfdfd",
    foreground: "#1a2138",
    electric: "#3b6ff6",
    cyan: "#22c5e6",
    purple: "#9b3bf0",
    navy: "#2a3a66",
    gold: "#e0a82e",
    emerald: "#1fb878",
    rose: "#f0486a",
  },
  dark: {
    background: "#1a1f33",
    foreground: "#f4f6fb",
    electric: "#5b8cff",
    cyan: "#3dd4f0",
    purple: "#b064ff",
    navy: "#0f1424",
    gold: "#f0c14b",
    emerald: "#34d399",
    rose: "#fb6f8a",
  },
} as const;

/** Chart color palette (matches --chart-1..5). */
export const chartPalette = [
  "#3b6ff6", // electric
  "#22c5e6", // cyan
  "#9b3bf0", // purple
  "#e0a82e", // gold
  "#1fb878", // emerald
] as const;

/** Accent gradient stops for charts. */
export const chartGradients = {
  electric: ["#3b6ff6", "#22c5e6"],
  cyan: ["#22c5e6", "#3dd4f0"],
  purple: ["#9b3bf0", "#b064ff"],
  gold: ["#e0a82e", "#f0c14b"],
  emerald: ["#1fb878", "#34d399"],
} as const;
