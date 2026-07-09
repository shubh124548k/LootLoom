"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "./glass-card";
import { IconBadge } from "./icon-badge";
import { AnimatedCounter } from "./animated-counter";
import { cardReveal } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { StatConfig } from "@/types";

interface StatCardProps extends StatConfig {
  index?: number;
  className?: string;
}

/**
 * StatCard — premium glass stat card with animated counter, trend, icon.
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      prefix,
      suffix,
      decimals = 0,
      icon = "Sparkles",
      accent = "electric",
      trend,
      index = 0,
      className,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        variants={cardReveal}
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        className={cn("h-full", className)}
      >
        <GlassCard
          hover
          sheen
          level={2}
          className="p-5 h-full flex flex-col gap-3 shadow-[var(--shadow-md)]"
        >
          <div className="flex items-start justify-between">
            <IconBadge name={icon} accent={accent} />
            {trend && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5",
                  trend.positive
                    ? "bg-emerald-brand/10 text-emerald-brand"
                    : "bg-rose-brand/10 text-rose-brand"
                )}
              >
                {trend.positive ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {trend.positive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className="space-y-1">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              className="text-2xl font-bold text-foreground"
            />
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
          </div>
        </GlassCard>
      </motion.div>
    );
  }
);
StatCard.displayName = "StatCard";
