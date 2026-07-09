"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

const accentMap: Record<Accent, { bg: string; text: string; ring: string }> = {
  electric: { bg: "bg-electric/10", text: "text-electric", ring: "ring-electric/20" },
  cyan: { bg: "bg-cyan/10", text: "text-cyan-brand", ring: "ring-cyan-brand/20" },
  purple: { bg: "bg-purple/10", text: "text-purple-brand", ring: "ring-purple-brand/20" },
  gold: { bg: "bg-gold/15", text: "text-gold", ring: "ring-gold/25" },
  emerald: { bg: "bg-emerald-brand/10", text: "text-emerald-brand", ring: "ring-emerald-brand/20" },
  rose: { bg: "bg-rose-brand/10", text: "text-rose-brand", ring: "ring-rose-brand/20" },
  navy: { bg: "bg-navy/10", text: "text-navy", ring: "ring-navy/20" },
};

interface IconBadgeProps {
  name: string;
  accent?: Accent;
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: { box: "size-8", icon: 16 },
  md: { box: "size-10", icon: 20 },
  lg: { box: "size-12", icon: 24 },
};

/**
 * IconBadge — consistent icon container with accent + soft bg.
 */
export const IconBadge = forwardRef<HTMLDivElement, IconBadgeProps>(
  ({ name, accent = "electric", size = "md", className, animate = true }, ref) => {
    const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Sparkles;
    const a = accentMap[accent];
    const s = sizeMap[size];
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl ring-1 shrink-0",
          a.bg,
          a.text,
          a.ring,
          s.box,
          className
        )}
      >
        <motion.span
          whileHover={animate ? { scale: 1.12, rotate: 4 } : undefined}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
        >
          <LucideIcon size={s.icon} strokeWidth={2} />
        </motion.span>
      </div>
    );
  }
);
IconBadge.displayName = "IconBadge";
