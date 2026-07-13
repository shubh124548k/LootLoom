"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { hoverLift } from "@/lib/animations";

type GlassLevel = 1 | 2 | 3 | 4 | "nav";

const levelClass: Record<GlassLevel, string> = {
  1: "glass-1",
  2: "glass-2",
  3: "glass-3",
  4: "glass-4",
  nav: "glass-nav",
};

interface GlassCardProps extends HTMLMotionProps<"div"> {
  level?: GlassLevel;
  hover?: boolean;
  sheen?: boolean;
  reflect?: boolean;
  glow?: "none" | "electric" | "cyan" | "purple" | "rose" | "navy" | "emerald" | "gold";
}

/**
 * GlassCard — the foundational glass surface used everywhere.
 * Inherits tokens, supports hover lift, sheen, reflection sweep, glow.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      level = 2,
      hover = false,
      sheen = false,
      reflect = false,
      glow = "none",
      children,
      ...props
    },
    ref
  ) => {
    const glowClass =
      glow === "electric"
        ? "hover:shadow-[var(--shadow-glow)]"
        : glow === "cyan"
        ? "hover:shadow-[var(--shadow-glow-cyan)]"
        : glow === "purple"
        ? "hover:shadow-[var(--shadow-glow-purple)]"
        : "";

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl relative",
          levelClass[level],
          sheen && "card-sheen",
          reflect && "glass-reflect",
          hover && "cursor-pointer",
          glowClass,
          className
        )}
        {...(hover ? hoverLift : {})}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
