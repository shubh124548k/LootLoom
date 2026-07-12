"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

/* ===================== Loading States ===================== */

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6" role="status" aria-live="polite">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="relative size-14"
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-full border-4 border-electric/15" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-electric" />
      </motion.div>
      <p className="text-sm text-muted-foreground font-medium animate-pulse">{label}…</p>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function GlassLoader({ label = "Loading" }: { label?: string }) {
  return (
    <GlassCard level={2} className="p-8 flex flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="relative size-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-full border-[3px] border-electric/15" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-electric" />
      </motion.div>
      <p className="text-xs text-muted-foreground font-medium">{label}…</p>
      <span className="sr-only">{label}</span>
    </GlassCard>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <GlassCard level={2} className={cn("p-5 space-y-3", className)}>
      <div className="h-10 w-10 rounded-xl shimmer" />
      <div className="h-6 w-2/3 rounded-md shimmer" />
      <div className="h-3 w-1/2 rounded-md shimmer" />
    </GlassCard>
  );
}

export function SkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <GlassCard key={i} level={1} className="p-4 flex items-center gap-4">
          <div className="size-10 rounded-xl shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded shimmer" />
            <div className="h-2.5 w-1/2 rounded shimmer" />
          </div>
          <div className="h-6 w-16 rounded-md shimmer" />
        </GlassCard>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-28 rounded-2xl shimmer" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SkeletonCard className="lg:col-span-2 h-64" />
        <SkeletonCard className="h-64" />
      </div>
    </div>
  );
}

/* ===================== Empty States ===================== */

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon = "Inbox", title, description, action, className }: EmptyStateProps) {
  const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] ?? Icons.Inbox;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="status"
      className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 blur-2xl bg-electric/20 rounded-full" aria-hidden="true" />
        <div className="relative size-16 rounded-2xl glass-2 flex items-center justify-center ring-1 ring-electric/15" aria-hidden="true">
          <LucideIcon className="text-electric" size={28} />
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

/* ===================== Error States ===================== */

interface ErrorStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "error" | "warning" | "info";
  className?: string;
}

export function ErrorState({
  icon = "AlertTriangle",
  title,
  description,
  action,
  variant = "error",
  className,
}: ErrorStateProps) {
  const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] ?? Icons.AlertTriangle;
  const color =
    variant === "error"
      ? "text-rose-brand bg-rose-brand/10 ring-rose-brand/20"
      : variant === "warning"
      ? "text-gold bg-gold/10 ring-gold/20"
      : "text-electric bg-electric/10 ring-electric/20";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}
    >
      <div className={cn("size-16 rounded-2xl flex items-center justify-center ring-1 mb-4", color)} aria-hidden="true">
        <LucideIcon size={28} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
