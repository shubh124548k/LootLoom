"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
  animated?: boolean;
}

/**
 * LootLoom Logo — animated hexagon coin mark with gradient.
 */
export function Logo({ size = "md", withText = true, className, animated = true }: LogoProps) {
  const sizeMap = {
    sm: { box: "size-7", text: "text-base", icon: 16 },
    md: { box: "size-9", text: "text-lg", icon: 20 },
    lg: { box: "size-12", text: "text-2xl", icon: 26 },
  };
  const s = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <motion.div
        whileHover={animated ? { rotate: 8, scale: 1.05 } : undefined}
        transition={{ type: "spring", stiffness: 320, damping: 16 }}
        className={cn(
          "relative rounded-xl flex items-center justify-center shadow-[var(--shadow-glow)]",
          "bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand)_55%,var(--purple-brand))]",
          s.box
        )}
      >
        <svg viewBox="0 0 24 24" width={s.icon} height={s.icon} fill="none" aria-hidden="true">
          <path
            d="M12 2.5 20 7v10l-8 4.5L4 17V7l8-4.5Z"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d="M8.5 9.2 12 7.1l3.5 2.1v4.2L12 15.5l-3.5-2.1V9.2Z"
            fill="white"
            opacity="0.95"
          />
        </svg>
        {animated && (
          <motion.span
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-white"
          />
        )}
      </motion.div>
      {withText && (
        <span className={cn("font-bold tracking-tight text-foreground", s.text)}>
          Loot<span className="text-gradient-electric">Loom</span>
        </span>
      )}
    </div>
  );
}
