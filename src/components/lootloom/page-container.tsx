"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { pageTransition } from "@/lib/animations";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

/**
 * PageContainer — top-level wrapper for every view.
 * Provides consistent responsive spacing + page transition animation.
 */
export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ children, className, animate = true }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={animate ? pageTransition : undefined}
        initial={animate ? "initial" : false}
        animate={animate ? "animate" : undefined}
        exit={animate ? "exit" : undefined}
        className={cn(
          "w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8",
          "focus:outline-none",
          className
        )}
        tabIndex={-1}
      >
        {children}
      </motion.div>
    );
  }
);
PageContainer.displayName = "PageContainer";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  accent?: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6", className)}
    >
      <div className="space-y-1.5 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </motion.div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, icon, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3 mb-4", className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <span className="text-electric shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">{title}</h2>
          {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | "auto" | "dashboard" | "analytics" | "ceo" | "wallet" | "reward";
  className?: string;
}

const gridCols: Record<NonNullable<GridProps["cols"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  dashboard: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  analytics: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
  ceo: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  wallet: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  reward: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function Grid({ children, cols = "auto", className }: GridProps) {
  return <div className={cn("grid gap-4 lg:gap-5", gridCols[cols], className)}>{children}</div>;
}
