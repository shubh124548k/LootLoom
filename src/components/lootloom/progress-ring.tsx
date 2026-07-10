"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  gradient?: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
  trackOpacity?: number;
}

const gradientStops: Record<string, [string, string]> = {
  electric: ["oklch(0.62 0.22 255)", "oklch(0.72 0.15 200)"],
  cyan: ["oklch(0.72 0.15 200)", "oklch(0.8 0.16 180)"],
  purple: ["oklch(0.6 0.22 295)", "oklch(0.7 0.2 320)"],
  gold: ["oklch(0.8 0.16 85)", "oklch(0.75 0.18 60)"],
  emerald: ["oklch(0.7 0.17 160)", "oklch(0.75 0.16 180)"],
  rose: ["oklch(0.68 0.2 15)", "oklch(0.72 0.18 350)"],
  navy: ["oklch(0.4 0.06 260)", "oklch(0.62 0.22 255)"],
};

/**
 * ProgressRing — circular progress with gradient stroke + animated fill.
 */
export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  className,
  showLabel = true,
  label,
  gradient = "electric",
  trackOpacity = 0.12,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const id = `ring-${gradient}-${size}`;
  const stops = gradientStops[gradient] ?? gradientStops.electric;
  const [from, to] = stops;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`oklch(0.62 0.22 255 / ${trackOpacity})`}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {label ?? `${Math.round(value)}%`}
          </span>
        </div>
      )}
    </div>
  );
}
