/**
 * LootLoom — Framer Motion Animation Presets
 * Reusable, GPU-accelerated animation variants.
 */
import type { Variants, Transition } from "framer-motion";

const EASE = [0.4, 0, 0.2, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const transitions = {
  fast: { duration: 0.18, ease: EASE } satisfies Transition,
  normal: { duration: 0.32, ease: EASE } satisfies Transition,
  slow: { duration: 0.5, ease: EASE } satisfies Transition,
  slower: { duration: 0.8, ease: EASE_OUT } satisfies Transition,
  spring: { type: "spring", stiffness: 260, damping: 24 } satisfies Transition,
  bounce: { type: "spring", stiffness: 320, damping: 18 } satisfies Transition,
  gentle: { type: "spring", stiffness: 180, damping: 22 } satisfies Transition,
} as const;

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(4px)",
    transition: { duration: 0.28, ease: EASE },
  },
};

export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.24 } },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.24 } },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.24 } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

export const floating: Variants = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
};

export const floatingSmall: Variants = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
  },
};

export const hoverLift = {
  whileHover: { y: -6, transition: { duration: 0.25, ease: EASE_OUT } },
  whileTap: { y: -2, scale: 0.99, transition: { duration: 0.12 } },
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.55,
      ease: EASE_OUT,
    },
  }),
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

export const drawerLeft: Variants = {
  initial: { x: "-100%" },
  animate: { x: 0, transition: { type: "spring", stiffness: 280, damping: 30 } },
  exit: { x: "-100%", transition: { duration: 0.32, ease: EASE } },
};

export const modalPop: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
};

export const overlayFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const notificationIn: Variants = {
  initial: { opacity: 0, x: 40, scale: 0.9 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: 60, transition: { duration: 0.22 } },
};

export const sidebarItem: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.34, ease: EASE_OUT },
  }),
};

export const sidebarExpand: Variants = {
  collapsed: { width: 84, transition: { duration: 0.4, ease: EASE_IN_OUT } },
  expanded: { width: 264, transition: { duration: 0.4, ease: EASE_IN_OUT } },
};

export const successCheck: Variants = {
  initial: { scale: 0, rotate: -30 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 320, damping: 16, delay: 0.15 },
  },
};

export const progressFill: Variants = {
  initial: { width: "0%" },
  animate: (value: number) => ({
    width: `${value}%`,
    transition: { duration: 1.1, ease: EASE_OUT, delay: 0.2 },
  }),
};

export const loadingSpin: Variants = {
  animate: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: "linear" } },
};

export const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      "0 0 0 0 oklch(0.62 0.22 255 / 0.0)",
      "0 0 28px 4px oklch(0.62 0.22 255 / 0.28)",
      "0 0 0 0 oklch(0.62 0.22 255 / 0.0)",
    ],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

export const auroraDrift: Variants = {
  animate: {
    x: [0, 30, -20, 0],
    y: [0, -25, 15, 0],
    scale: [1, 1.08, 0.96, 1],
    transition: { duration: 24, repeat: Infinity, ease: "easeInOut" },
  },
};

export const auroraDriftAlt: Variants = {
  animate: {
    x: [0, -25, 20, 0],
    y: [0, 20, -15, 0],
    scale: [1, 0.95, 1.06, 1],
    transition: { duration: 30, repeat: Infinity, ease: "easeInOut" },
  },
};

export const twinkle: Variants = {
  animate: {
    opacity: [0.25, 0.9, 0.25],
    scale: [0.9, 1.1, 0.9],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};
