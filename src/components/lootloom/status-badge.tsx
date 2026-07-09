"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "error" | "info" | "gold" | "electric" | "purple" | "cyan";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
  pulse?: boolean;
}

const variantClass: Record<Variant, string> = {
  default: "bg-muted text-muted-foreground ring-border",
  success: "bg-emerald-brand/12 text-emerald-brand ring-emerald-brand/20",
  warning: "bg-gold/15 text-gold ring-gold/25",
  error: "bg-rose-brand/12 text-rose-brand ring-rose-brand/20",
  info: "bg-electric/12 text-electric ring-electric/20",
  gold: "bg-gold/15 text-gold ring-gold/25",
  electric: "bg-electric/12 text-electric ring-electric/20",
  purple: "bg-purple/12 text-purple-brand ring-purple-brand/20",
  cyan: "bg-cyan/12 text-cyan-brand ring-cyan-brand/20",
};

const dotClass: Record<Variant, string> = {
  default: "bg-muted-foreground",
  success: "bg-emerald-brand",
  warning: "bg-gold",
  error: "bg-rose-brand",
  info: "bg-electric",
  gold: "bg-gold",
  electric: "bg-electric",
  purple: "bg-purple-brand",
  cyan: "bg-cyan-brand",
};

/**
 * StatusBadge — pill with optional pulsing dot.
 */
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant = "default", dot = false, pulse = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
          variantClass[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <span className="relative inline-flex">
            <span className={cn("inline-flex size-1.5 rounded-full", dotClass[variant])} />
            {pulse && (
              <span
                className={cn(
                  "absolute inline-flex size-1.5 rounded-full opacity-75 animate-ping",
                  dotClass[variant]
                )}
              />
            )}
          </span>
        )}
        {children}
      </span>
    );
  }
);
StatusBadge.displayName = "StatusBadge";
