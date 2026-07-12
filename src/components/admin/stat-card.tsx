"use client";

/**
 * AdminStatCard — single backend-ready KPI card for the CEO dashboard.
 * Renders the value via AnimatedCounter. No fake numbers — pass real backend values.
 */
import { motion } from "framer-motion";
import { GlassCard } from "@/components/lootloom/glass-card";
import { IconBadge } from "@/components/lootloom/icon-badge";
import { AnimatedCounter } from "@/components/lootloom/animated-counter";
import { cn } from "@/lib/utils";
import { cardReveal } from "@/lib/animations";

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

interface AdminStatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: string;
  accent?: Accent;
  /** Optional helper line under the value (e.g. unit, scope). */
  hint?: string;
  index?: number;
  className?: string;
}

export function AdminStatCard({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
  icon,
  accent = "electric",
  hint,
  index = 0,
  className,
}: AdminStatCardProps) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      animate="visible"
      className={cn("h-full", className)}
    >
      <GlassCard
        level={2}
        sheen
        className="p-5 h-full flex flex-col gap-3 relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <IconBadge name={icon} accent={accent} size="md" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
            />
          </p>
          <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
          {hint && (
            <p className="text-[11px] text-muted-foreground/70 truncate">{hint}</p>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
