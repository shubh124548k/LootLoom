/**
 * LootLoom — Design Tokens (JS mirror of CSS variables)
 * Used by animation configs, charts, and JS-driven styling.
 */

export const tokens = {
  colors: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    electric: "var(--electric)",
    cyan: "var(--cyan-brand)",
    purple: "var(--purple-brand)",
    navy: "var(--navy)",
    gold: "var(--gold)",
    emerald: "var(--emerald-brand)",
    rose: "var(--rose-brand)",
    glass: "var(--glass)",
    glassStrong: "var(--glass-strong)",
    glassBorder: "var(--glass-border)",
  },
  gradients: {
    electric: "linear-gradient(120deg, var(--electric), var(--cyan-brand) 55%, var(--purple-brand))",
    electricSoft: "linear-gradient(120deg, oklch(0.62 0.22 255 / 0.12), oklch(0.72 0.15 200 / 0.12) 55%, oklch(0.6 0.22 295 / 0.12))",
    navy: "linear-gradient(120deg, var(--navy), oklch(0.4 0.06 260))",
    gold: "linear-gradient(120deg, var(--gold), oklch(0.72 0.18 70))",
    aurora:
      "linear-gradient(120deg, oklch(0.85 0.12 250 / 0.55), oklch(0.85 0.13 200 / 0.45) 40%, oklch(0.85 0.14 295 / 0.4) 80%)",
  },
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    "2xl": "var(--radius-2xl)",
    "3xl": "var(--radius-3xl)",
  },
  shadows: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    xl: "var(--shadow-xl)",
    glow: "var(--shadow-glow)",
    glowCyan: "var(--shadow-glow-cyan)",
    glowPurple: "var(--shadow-glow-purple)",
  },
  blur: {
    sm: "blur(8px)",
    md: "blur(16px)",
    lg: "blur(24px)",
    xl: "blur(32px)",
  },
  duration: {
    fast: 0.18,
    normal: 0.32,
    slow: 0.5,
    slower: 0.8,
  },
  easing: {
    standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
    emphasized: [0.2, 0, 0, 1] as [number, number, number, number],
    spring: { type: "spring" as const, stiffness: 260, damping: 24 },
    bounce: { type: "spring" as const, stiffness: 320, damping: 18 },
  },
  z: {
    background: 0,
    content: 10,
    sidebar: 30,
    header: 40,
    drawer: 50,
    overlay: 60,
    modal: 70,
    toast: 80,
    tooltip: 90,
  },
} as const;

export type DesignTokens = typeof tokens;
