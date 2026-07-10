"use client";

/**
 * LootLoom — System Experience Layer
 * ------------------------------------------------------------------
 * Renders every system state the app may encounter as premium,
 * glassmorphic, animated full-screen experiences. These never feel
 * like generic browser error pages — they inherit the Premium White
 * theme, glassmorphism, and the global Animation Engine.
 *
 * Serves ViewIds: splash, app-loading, session-expired, unauthorized,
 *   maintenance, error-403, error-404, error-500, offline,
 *   update-required, auth-loading, coming-soon, feature-not-available,
 *   service-unavailable
 *
 * The BackgroundEngine is rendered globally by <AppRouter/> — this
 * view only composes centered glass panels on top of it.
 *
 * Reusable primitives exported for the rest of the app:
 *   - SystemLayout          (illustration + glass panel + actions)
 *   - SystemScreen          (generic shell: icon/title/desc/actions)
 *   - StatusBadgeSystem     (success/info/warning/danger/...)
 *   - IllustrationPlaceholder (security/offline/maintenance/...)
 *   - LinearProgress        (shimmer progress bar)
 *   - CircularProgress      (dual-ring spinner)
 *   - EmptyApplicationState (variant-driven empty states)
 */

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import {
  GlassCard,
  LootButton,
  Logo,
  PageContainer,
  ProgressRing,
} from "@/components/lootloom";
import { useNavigationStore } from "@/stores";
import type { ViewId } from "@/types";
import {
  pageTransition,
  fade,
  slideUp,
  scaleIn,
  floating,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Accent tokens — single source of truth for color maps
   ============================================================ */

type Accent =
  | "electric"
  | "cyan"
  | "purple"
  | "gold"
  | "emerald"
  | "rose"
  | "navy";

const ACCENT_RING: Record<Accent, string> = {
  electric: "ring-electric/25",
  cyan: "ring-cyan-brand/25",
  purple: "ring-purple-brand/25",
  gold: "ring-gold/30",
  emerald: "ring-emerald-brand/25",
  rose: "ring-rose-brand/25",
  navy: "ring-navy/25",
};

const ACCENT_BG: Record<Accent, string> = {
  electric: "bg-electric/10",
  cyan: "bg-cyan/10",
  purple: "bg-purple/10",
  gold: "bg-gold/15",
  emerald: "bg-emerald-brand/10",
  rose: "bg-rose-brand/10",
  navy: "bg-navy/10",
};

const ACCENT_TEXT: Record<Accent, string> = {
  electric: "text-electric",
  cyan: "text-cyan-brand",
  purple: "text-purple-brand",
  gold: "text-gold",
  emerald: "text-emerald-brand",
  rose: "text-rose-brand",
  navy: "text-navy",
};

const ACCENT_DOT: Record<Accent, string> = {
  electric: "bg-electric",
  cyan: "bg-cyan-brand",
  purple: "bg-purple-brand",
  gold: "bg-gold",
  emerald: "bg-emerald-brand",
  rose: "bg-rose-brand",
  navy: "bg-navy",
};

const ACCENT_BAR: Record<Accent, string> = {
  electric: "bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand),var(--purple-brand))]",
  cyan: "bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand),var(--emerald-brand))]",
  purple: "bg-[linear-gradient(90deg,var(--electric),var(--purple-brand),var(--rose-brand))]",
  gold: "bg-[linear-gradient(90deg,var(--gold),var(--electric),var(--purple-brand))]",
  emerald: "bg-[linear-gradient(90deg,var(--emerald-brand),var(--cyan-brand),var(--electric))]",
  rose: "bg-[linear-gradient(90deg,var(--rose-brand),var(--purple-brand),var(--electric))]",
  navy: "bg-[linear-gradient(90deg,var(--navy),var(--electric),var(--purple-brand))]",
};

/* ============================================================
   StatusBadgeSystem — premium pill for system states
   ============================================================ */

type SystemStatusKind =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "maintenance"
  | "loading"
  | "offline"
  | "beta";

const STATUS_BADGE_STYLES: Record<
  SystemStatusKind,
  { wrap: string; dot: string; icon: keyof typeof Icons }
> = {
  success: {
    wrap: "bg-emerald-brand/12 text-emerald-brand ring-emerald-brand/20",
    dot: "bg-emerald-brand",
    icon: "CheckCircle2",
  },
  info: {
    wrap: "bg-electric/12 text-electric ring-electric/20",
    dot: "bg-electric",
    icon: "Info",
  },
  warning: {
    wrap: "bg-gold/15 text-gold ring-gold/25",
    dot: "bg-gold",
    icon: "AlertTriangle",
  },
  danger: {
    wrap: "bg-rose-brand/12 text-rose-brand ring-rose-brand/20",
    dot: "bg-rose-brand",
    icon: "XCircle",
  },
  maintenance: {
    wrap: "bg-purple/12 text-purple-brand ring-purple-brand/20",
    dot: "bg-purple-brand",
    icon: "Wrench",
  },
  loading: {
    wrap: "bg-cyan/12 text-cyan-brand ring-cyan-brand/20",
    dot: "bg-cyan-brand",
    icon: "Loader2",
  },
  offline: {
    wrap: "bg-navy/12 text-navy ring-navy/20",
    dot: "bg-navy",
    icon: "WifiOff",
  },
  beta: {
    wrap: "bg-gold/15 text-gold ring-gold/25",
    dot: "bg-gold",
    icon: "Rocket",
  },
};

interface StatusBadgeSystemProps {
  kind: SystemStatusKind;
  label?: string;
  pulse?: boolean;
  className?: string;
}

export function StatusBadgeSystem({
  kind,
  label,
  pulse = false,
  className,
}: StatusBadgeSystemProps) {
  const cfg = STATUS_BADGE_STYLES[kind];
  const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[cfg.icon];
  const isSpinning = kind === "loading";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        cfg.wrap,
        className
      )}
    >
      <span className="relative inline-flex">
        <span className={cn("inline-flex size-1.5 rounded-full", cfg.dot)} />
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex size-1.5 rounded-full opacity-75 animate-ping",
              cfg.dot
            )}
          />
        )}
      </span>
      <motion.span
        animate={isSpinning ? { rotate: 360 } : undefined}
        transition={isSpinning ? { duration: 1.2, repeat: Infinity, ease: "linear" } : undefined}
        className="inline-flex"
      >
        <LucideIcon size={12} strokeWidth={2.4} />
      </motion.span>
      {label && <span>{label}</span>}
    </span>
  );
}

/* ============================================================
   IllustrationPlaceholder — animated icon compositions
   Each variant is a small composed scene built from lucide icons.
   ============================================================ */

type IllustrationVariant =
  | "security"
  | "offline"
  | "maintenance"
  | "error"
  | "success"
  | "loading"
  | "empty"
  | "update"
  | "future-ai";

interface IllustrationPlaceholderProps {
  variant: IllustrationVariant;
  size?: "sm" | "md" | "lg";
  accent?: Accent;
}

const ILLUSTRATION_ACCENT: Record<IllustrationVariant, Accent> = {
  security: "rose",
  offline: "navy",
  maintenance: "gold",
  error: "rose",
  success: "emerald",
  loading: "electric",
  empty: "electric",
  update: "emerald",
  "future-ai": "purple",
};

const ILLUSTRATION_SIZES: Record<
  NonNullable<IllustrationPlaceholderProps["size"]>,
  { box: string; icon: number; spark: number }
> = {
  sm: { box: "size-16", icon: 28, spark: 12 },
  md: { box: "size-24", icon: 40, spark: 16 },
  lg: { box: "size-32", icon: 52, spark: 20 },
};

export function IllustrationPlaceholder({
  variant,
  size = "md",
  accent,
}: IllustrationPlaceholderProps) {
  const a = accent ?? ILLUSTRATION_ACCENT[variant];
  const s = ILLUSTRATION_SIZES[size];

  // Primary icon per variant
  const PrimaryIcon =
    variant === "security"
      ? Icons.ShieldAlert
      : variant === "offline"
      ? Icons.WifiOff
      : variant === "maintenance"
      ? Icons.Wrench
      : variant === "error"
      ? Icons.ServerCrash
      : variant === "success"
      ? Icons.CheckCircle2
      : variant === "loading"
      ? Icons.Loader2
      : variant === "empty"
      ? Icons.Inbox
      : variant === "update"
      ? Icons.RefreshCw
      : Icons.Sparkles;

  // Orbiting spark icon per variant
  const SparkIcon =
    variant === "security"
      ? Icons.Lock
      : variant === "offline"
      ? Icons.CloudOff
      : variant === "maintenance"
      ? Icons.Hammer
      : variant === "error"
      ? Icons.AlertTriangle
      : variant === "success"
      ? Icons.Sparkle
      : variant === "loading"
      ? Icons.Zap
      : variant === "empty"
      ? Icons.Search
      : variant === "update"
      ? Icons.Download
      : Icons.BrainCircuit;

  const isRotating = variant === "maintenance" || variant === "update" || variant === "loading";
  const isFloating = variant === "success" || variant === "future-ai" || variant === "empty";

  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className="relative inline-flex items-center justify-center"
    >
      {/* Glow */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className={cn("absolute inset-0 blur-2xl rounded-full", ACCENT_BG[a])}
      />

      {/* Orbiting spark (only on md+) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 size-7 rounded-full glass-2 ring-1 flex items-center justify-center",
            ACCENT_RING[a]
          )}
        >
          <SparkIcon size={s.spark} className={cn(ACCENT_TEXT[a])} />
        </div>
      </motion.div>

      {/* Primary composition */}
      <motion.div
        variants={isFloating ? floating : undefined}
        animate={isFloating ? "animate" : undefined}
        className={cn(
          "relative rounded-3xl glass-3 ring-1 flex items-center justify-center shadow-[var(--shadow-lg)]",
          s.box,
          ACCENT_RING[a]
        )}
      >
        <motion.span
          animate={isRotating ? { rotate: 360 } : undefined}
          transition={
            isRotating
              ? {
                  duration:
                    variant === "loading"
                      ? 1.2
                      : variant === "update"
                      ? 2.4
                      : 4,
                  repeat: Infinity,
                  ease: "linear",
                }
              : undefined
          }
          className="inline-flex"
        >
          <PrimaryIcon
            size={s.icon}
            strokeWidth={2.2}
            className={cn(ACCENT_TEXT[a])}
          />
        </motion.span>

        {/* Subtle inner pulse dot */}
        <motion.span
          animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute -top-1 -right-1 size-2 rounded-full",
            ACCENT_DOT[a]
          )}
        />
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   LinearProgress — shimmer progress bar
   ============================================================ */

interface LinearProgressProps {
  value: number; // 0..100
  label?: string;
  sublabel?: string;
  accent?: Accent;
  showValue?: boolean;
  className?: string;
}

export function LinearProgress({
  value,
  label,
  sublabel,
  accent = "electric",
  showValue = true,
  className,
}: LinearProgressProps) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-medium">{label}</span>
          {showValue && (
            <span className="font-semibold text-foreground tabular-nums">
              {Math.round(v)}%
            </span>
          )}
        </div>
      )}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className={cn("relative h-full rounded-full", ACCENT_BAR[accent])}
        >
          {/* Shimmer sweep */}
          <motion.span
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-y-0 left-0 w-1/3 bg-white/40 blur-sm"
          />
        </motion.div>
      </div>
      {sublabel && (
        <p className="mt-2 text-[11px] text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}

/* ============================================================
   CircularProgress — dual-ring spinner with shimmer core
   ============================================================ */

interface CircularProgressProps {
  size?: number;
  accent?: Accent;
  label?: ReactNode;
  className?: string;
}

export function CircularProgress({
  size = 72,
  accent = "electric",
  label,
  className,
}: CircularProgressProps) {
  const ringColor =
    accent === "electric"
      ? "border-t-electric"
      : accent === "cyan"
      ? "border-t-cyan-brand"
      : accent === "purple"
      ? "border-t-purple-brand"
      : accent === "gold"
      ? "border-t-gold"
      : accent === "emerald"
      ? "border-t-emerald-brand"
      : accent === "rose"
      ? "border-t-rose-brand"
      : "border-t-navy";
  const innerRing =
    accent === "electric"
      ? "border-r-cyan-brand"
      : accent === "cyan"
      ? "border-r-emerald-brand"
      : accent === "purple"
      ? "border-r-rose-brand"
      : accent === "gold"
      ? "border-r-electric"
      : accent === "emerald"
      ? "border-r-cyan-brand"
      : accent === "rose"
      ? "border-r-purple-brand"
      : "border-r-electric";
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        className={cn("absolute inset-0 rounded-full border-[3px] border-electric/15", ringColor)}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
        className={cn(
          "absolute rounded-full border-[2px] border-transparent",
          innerRing
        )}
        style={{ inset: size * 0.12 }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "size-2.5 rounded-full bg-gradient-to-br from-electric to-purple-brand",
          ACCENT_DOT[accent] !== "bg-electric" && ACCENT_DOT[accent]
        )}
      />
      {label && (
        <span className="absolute text-[10px] font-semibold text-muted-foreground bottom-0 translate-y-full pt-1 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}

/* ============================================================
   SystemLayout — premium centered shell: illustration + panel + actions
   ============================================================ */

interface SystemLayoutProps {
  illustration: ReactNode;
  statusIcon?: ReactNode;
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  extra?: ReactNode; // progress bars, info cards, etc.
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  tertiaryAction?: ReactNode;
  footer?: ReactNode;
  accent?: Accent;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const MAX_W: Record<NonNullable<SystemLayoutProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-2xl",
};

function SystemLayout({
  illustration,
  statusIcon,
  badge,
  title,
  description,
  extra,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  footer,
  accent = "electric",
  maxWidth = "lg",
}: SystemLayoutProps) {
  return (
    <PageContainer className="min-h-screen flex items-center justify-center py-12">
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn("w-full", MAX_W[maxWidth])}
      >
        <GlassCard
          level={3}
          sheen
          reflect
          className="overflow-hidden ring-1 ring-border/60 shadow-[var(--shadow-xl)]"
        >
          {/* Top accent bar */}
          <div className={cn("h-1.5 w-full", ACCENT_BAR[accent])} />

          <div className="p-7 sm:p-10 flex flex-col items-center text-center">
            {/* Status icon row (small badges above illustration) */}
            {statusIcon && (
              <motion.div
                variants={fade}
                initial="initial"
                animate="animate"
                className="mb-5"
              >
                {statusIcon}
              </motion.div>
            )}

            {/* Illustration */}
            <motion.div
              variants={slideUp}
              initial="initial"
              animate="animate"
              className="mb-6"
            >
              {illustration}
            </motion.div>

            {/* Optional badge pill */}
            {badge && (
              <motion.div
                variants={fade}
                initial="initial"
                animate="animate"
                className="mb-4"
              >
                {badge}
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              variants={slideUp}
              initial="initial"
              animate="animate"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
            >
              {title}
            </motion.h1>

            {/* Description */}
            {description && (
              <motion.p
                variants={fade}
                initial="initial"
                animate="animate"
                className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mt-3"
              >
                {description}
              </motion.p>
            )}

            {/* Extra: progress, info cards, search, etc. */}
            {extra && (
              <motion.div
                variants={fade}
                initial="initial"
                animate="animate"
                className="w-full max-w-sm mt-6"
              >
                {extra}
              </motion.div>
            )}

            {/* Actions */}
            {(primaryAction || secondaryAction || tertiaryAction) && (
              <motion.div
                variants={fade}
                initial="initial"
                animate="animate"
                className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full"
              >
                {primaryAction}
                {secondaryAction}
                {tertiaryAction}
              </motion.div>
            )}

            {/* Footer */}
            {footer && (
              <motion.div
                variants={fade}
                initial="initial"
                animate="animate"
                className="mt-8 pt-6 border-t border-border/60 w-full flex items-center justify-center gap-2 text-xs text-muted-foreground"
              >
                {footer}
              </motion.div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </PageContainer>
  );
}

/* ============================================================
   SystemScreen — generic convenience wrapper around SystemLayout
   Built for rapid composition: pass an icon, get a full page.
   ============================================================ */

interface SystemScreenProps {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
  accent?: Accent;
  footer?: ReactNode;
  extra?: ReactNode;
  statusIcon?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

function SystemScreen({
  icon,
  title,
  subtitle,
  description,
  actions,
  accent = "electric",
  footer,
  extra,
  statusIcon,
  maxWidth = "lg",
}: SystemScreenProps) {
  return (
    <SystemLayout
      accent={accent}
      maxWidth={maxWidth}
      statusIcon={statusIcon}
      illustration={
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className={cn("absolute inset-0 blur-2xl rounded-full", ACCENT_BG[accent])}
          />
          <div
            className={cn(
              "relative size-24 rounded-3xl glass-3 ring-1 flex items-center justify-center shadow-[var(--shadow-lg)]",
              ACCENT_RING[accent]
            )}
          >
            <span className={cn(ACCENT_TEXT[accent])}>{icon}</span>
          </div>
        </div>
      }
      badge={
        subtitle ? (
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
              ACCENT_BG[accent],
              ACCENT_TEXT[accent],
              ACCENT_RING[accent]
            )}
          >
            {subtitle}
          </span>
        ) : undefined
      }
      title={title}
      description={description}
      extra={extra}
      primaryAction={actions}
      footer={footer}
    />
  );
}

/* ============================================================
   Helper: gradient big-number title (for 403/404/500)
   ============================================================ */

function BigNumber({ children }: { children: string }) {
  return (
    <motion.span
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className="text-gradient-electric font-extrabold tracking-tight"
      style={{ fontSize: "4.5rem", lineHeight: 1 }}
    >
      {children}
    </motion.span>
  );
}

/* ============================================================
   InfoMiniCard — small glass tile for placeholder info
   ============================================================ */

function InfoMiniCard({
  icon,
  label,
  value,
  accent = "electric",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: Accent;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl glass-2 ring-1 px-3 py-2 text-left",
        ACCENT_RING[accent]
      )}
    >
      <span className={cn("shrink-0", ACCENT_TEXT[accent])}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-xs font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function reloadPage() {
  if (typeof window !== "undefined") window.location.reload();
}

/* ============================================================
   Page components
   ============================================================ */

/* ----------------------------- Splash ----------------------------- */

function SplashScreen() {
  const navigate = useNavigationStore((s) => s.navigate);

  useEffect(() => {
    const t = setTimeout(() => navigate("dashboard"), 2500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <PageContainer className="min-h-screen flex items-center justify-center py-12">
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-md flex flex-col items-center text-center"
      >
        {/* Animated logo */}
        <motion.div
          variants={floating}
          initial={false}
          animate="animate"
          className="mb-8"
        >
          <Logo size="lg" animated />
        </motion.div>

        {/* Rotating ring loader */}
        <div className="relative size-16 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-electric/15"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-electric"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2.5 rounded-full border-[2px] border-transparent border-r-cyan-brand"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="size-2.5 rounded-full bg-gradient-to-br from-electric to-purple-brand"
            />
          </div>
        </div>

        <motion.p
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="text-base font-semibold text-foreground"
        >
          Initializing LootLoom…
        </motion.p>
        <motion.p
          variants={fade}
          initial="initial"
          animate="animate"
          className="text-xs text-muted-foreground mt-2"
        >
          Preparing your rewards · Loading modules
        </motion.p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mt-7">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
              className="size-1.5 rounded-full bg-electric"
            />
          ))}
        </div>

        {/* Version footer */}
        <motion.div
          variants={fade}
          initial="initial"
          animate="animate"
          className="mt-10 flex items-center gap-2 text-[11px] text-muted-foreground"
        >
          <Icons.Sparkles size={11} className="text-electric" />
          <span>LootLoom · v2.4.0 · Premium Edition</span>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}

/* --------------------------- App Loading -------------------------- */

function AppLoadingScreen() {
  const navigate = useNavigationStore((s) => s.navigate);

  useEffect(() => {
    const t = setTimeout(() => navigate("dashboard"), 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <SystemLayout
      accent="electric"
      maxWidth="md"
      illustration={
        <div className="flex flex-col items-center gap-5">
          <motion.div variants={floating} initial={false} animate="animate">
            <Logo size="lg" animated />
          </motion.div>
          {/* Dual spinner rings */}
          <div className="relative size-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[3px] border-electric/15"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-electric"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border-[2px] border-transparent border-r-cyan-brand"
            />
            {/* Shimmer core */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Icons.Sparkles size={14} className="text-purple-brand" />
            </motion.div>
          </div>
        </div>
      }
      statusIcon={
        <StatusBadgeSystem kind="loading" label="Loading Workspace" pulse />
      }
      title="Preparing your workspace…"
      description="Loading your rewards, missions, and personalized content. This will only take a moment."
      extra={
        <div className="space-y-3 w-full">
          {/* Shimmer placeholder rows */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.18,
              }}
              className="h-3 rounded-md shimmer"
              style={{ width: `${[80, 60, 45][i]}%`, marginInline: "auto" }}
            />
          ))}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
                className="size-1.5 rounded-full bg-electric"
              />
            ))}
          </div>
        </div>
      }
      footer={
        <>
          <Icons.Loader2 size={13} className="text-electric" />
          <span>Modules · Wallet · Rewards · Profile</span>
        </>
      }
    />
  );
}

/* ------------------------------ Offline --------------------------- */

function OfflineScreen() {
  return (
    <SystemLayout
      accent="navy"
      maxWidth="lg"
      illustration={<IllustrationPlaceholder variant="offline" size="lg" />}
      statusIcon={<StatusBadgeSystem kind="offline" label="No Connection" pulse />}
      title="You're Offline"
      description="It looks like you've lost your internet connection. Some features may be unavailable while offline. Your cached data is still accessible below."
      extra={
        <div className="space-y-3 w-full">
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <InfoMiniCard
              icon={<Icons.Database size={14} />}
              label="Cached"
              value="Wallet · Profile"
              accent="navy"
            />
            <InfoMiniCard
              icon={<Icons.Wifi size={14} />}
              label="Status"
              value="Disconnected"
              accent="rose"
            />
          </div>
          <div className="rounded-xl glass-2 ring-1 ring-border/60 p-3 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <Icons.CloudOff size={13} className="text-navy" />
              <span className="text-xs font-semibold text-foreground">
                Sync Status
              </span>
              <StatusBadgeSystem kind="offline" label="Pending" className="ml-auto" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Cached activity will sync automatically once your connection is restored.
              Auto-retry is scheduled every 30 seconds.
            </p>
          </div>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.RefreshCw size={18} />}
          onClick={reloadPage}
        >
          Retry Connection
        </LootButton>
      }
      secondaryAction={
        <LootButton variant="glass" size="lg" leftIcon={<Icons.Home size={18} />}>
          View Cached
        </LootButton>
      }
      footer={
        <>
          <Icons.WifiOff size={13} className="text-navy" />
          <span>Auto-retry enabled · Last sync 2m ago</span>
        </>
      }
    />
  );
}

/* -------------------------- Session Expired ----------------------- */

function SessionExpiredScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemLayout
      accent="rose"
      maxWidth="lg"
      illustration={<IllustrationPlaceholder variant="security" size="lg" />}
      statusIcon={<StatusBadgeSystem kind="danger" label="Session Timeout" pulse />}
      title="Session Expired"
      description="Your session has expired for security reasons. Please sign in again to continue where you left off. Your data is safe and waiting for you."
      extra={
        <div className="rounded-xl glass-2 ring-1 ring-rose-brand/15 p-3 text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <Icons.ShieldCheck size={13} className="text-emerald-brand" />
            <span className="text-xs font-semibold text-foreground">
              Security Information
            </span>
          </div>
          <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
            <li className="flex items-center gap-1.5">
              <Icons.Check size={10} className="text-emerald-brand" />
              Session token expired automatically
            </li>
            <li className="flex items-center gap-1.5">
              <Icons.Check size={10} className="text-emerald-brand" />
              No sensitive data was exposed
            </li>
            <li className="flex items-center gap-1.5">
              <Icons.Check size={10} className="text-emerald-brand" />
              Your activity was logged for audit
            </li>
          </ul>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.LogIn size={18} />}
          onClick={() => navigate("login")}
        >
          Sign In Again
        </LootButton>
      }
      secondaryAction={
        <LootButton
          variant="glass"
          size="lg"
          leftIcon={<Icons.Home size={18} />}
          onClick={() => navigate("home")}
        >
          Return Home
        </LootButton>
      }
      footer={
        <>
          <Icons.Lock size={13} className="text-rose-brand" />
          <span>Protected by LootLoom Security · Auto sign-out after 24h</span>
        </>
      }
    />
  );
}

/* ---------------------------- Unauthorized ------------------------ */

function UnauthorizedScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemLayout
      accent="rose"
      maxWidth="lg"
      illustration={<IllustrationPlaceholder variant="security" size="lg" />}
      statusIcon={<StatusBadgeSystem kind="danger" label="Permission Required" pulse />}
      title="Access Restricted"
      description="You don't have permission to access this area. If you believe this is a mistake, please contact our support team and we'll help resolve it."
      extra={
        <div className="rounded-xl glass-2 ring-1 ring-rose-brand/15 p-3 text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <Icons.ShieldAlert size={13} className="text-rose-brand" />
            <span className="text-xs font-semibold text-foreground">
              Security Information
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            This resource requires elevated permissions. Your access level
            doesn't meet the minimum requirement. All access attempts are
            monitored and logged for security.
          </p>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.Home size={18} />}
          onClick={() => navigate("home")}
        >
          Go Back
        </LootButton>
      }
      secondaryAction={
        <LootButton
          variant="glass"
          size="lg"
          leftIcon={<Icons.LogIn size={18} />}
          onClick={() => navigate("login")}
        >
          Login
        </LootButton>
      }
      tertiaryAction={
        <LootButton
          variant="outline"
          size="lg"
          leftIcon={<Icons.LifeBuoy size={18} />}
          onClick={() => navigate("support")}
        >
          Support
        </LootButton>
      }
      footer={
        <>
          <Icons.LockKeyhole size={13} className="text-rose-brand" />
          <span>Protected resource · Insufficient permissions</span>
        </>
      }
    />
  );
}

/* --------------------------- Maintenance -------------------------- */

function MaintenanceScreen() {
  return (
    <SystemLayout
      accent="gold"
      maxWidth="lg"
      illustration={<IllustrationPlaceholder variant="maintenance" size="lg" />}
      statusIcon={
        <StatusBadgeSystem kind="maintenance" label="Scheduled Downtime" pulse />
      }
      title="Under Maintenance"
      description="We're making LootLoom even better. Our team is deploying new features and improvements. We'll be back shortly — thank you for your patience."
      extra={
        <div className="space-y-4 w-full">
          <LinearProgress
            value={68}
            label="Maintenance Progress"
            sublabel="Estimated completion: ~30 minutes remaining"
            accent="gold"
          />
          <div className="rounded-xl glass-2 ring-1 ring-gold/20 p-3 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Sparkles size={13} className="text-gold" />
              <span className="text-xs font-semibold text-foreground">
                What's being updated
              </span>
            </div>
            <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
              <li className="flex items-center gap-1.5">
                <Icons.Check size={10} className="text-emerald-brand" />
                Database optimization
              </li>
              <li className="flex items-center gap-1.5">
                <Icons.Loader2 size={10} className="text-gold animate-spin" />
                Rewards catalog refresh
              </li>
              <li className="flex items-center gap-1.5">
                <Icons.Clock size={10} className="text-muted-foreground" />
                Security patches (queued)
              </li>
            </ul>
          </div>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.Bell size={18} />}
        >
          Notify Me
        </LootButton>
      }
      secondaryAction={
        <LootButton variant="glass" size="lg" leftIcon={<Icons.Clock size={18} />}>
          Return Later
        </LootButton>
      }
      footer={
        <>
          <Icons.Hammer size={13} className="text-gold" />
          <span>Platform status: Operational · v2.4.1 deployment</span>
        </>
      }
    />
  );
}

/* ----------------------------- Error 403 -------------------------- */

function Error403Screen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemLayout
      accent="rose"
      maxWidth="lg"
      illustration={
        <div className="flex flex-col items-center gap-3">
          <BigNumber>403</BigNumber>
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 blur-2xl rounded-full bg-rose-brand/10"
            />
            <div className="relative size-16 rounded-2xl glass-3 ring-1 ring-rose-brand/25 flex items-center justify-center shadow-[var(--shadow-lg)]">
              <Icons.Lock size={30} strokeWidth={2.2} className="text-rose-brand" />
            </div>
          </div>
        </div>
      }
      statusIcon={<StatusBadgeSystem kind="danger" label="HTTP 403 · Forbidden" />}
      title="Access Denied"
      description="You don't have access to this resource. The server understood the request but refuses to authorize it. If you need access, please request it from your administrator."
      extra={
        <div className="rounded-xl glass-2 ring-1 ring-rose-brand/15 p-3 text-left w-full">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Reason
            </span>
            <StatusBadgeSystem kind="danger" label="Forbidden" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Insufficient role privileges for the requested resource. Your
            current role does not satisfy the required permission scope.
          </p>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.LayoutDashboard size={18} />}
          onClick={() => navigate("dashboard")}
        >
          Return Dashboard
        </LootButton>
      }
      secondaryAction={
        <LootButton
          variant="glass"
          size="lg"
          leftIcon={<Icons.LifeBuoy size={18} />}
          onClick={() => navigate("support")}
        >
          Contact Support
        </LootButton>
      }
      tertiaryAction={
        <LootButton variant="outline" size="lg" leftIcon={<Icons.UserPlus size={18} />}>
          Request Access
        </LootButton>
      }
      footer={
        <>
          <Icons.Ban size={13} className="text-rose-brand" />
          <span>Forbidden · Access restricted</span>
        </>
      }
    />
  );
}

/* ----------------------------- Error 404 -------------------------- */

function Error404Screen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemLayout
      accent="purple"
      maxWidth="lg"
      illustration={
        <div className="flex flex-col items-center gap-3">
          <BigNumber>404</BigNumber>
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 blur-2xl rounded-full bg-purple/10"
            />
            <motion.div
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative size-16 rounded-2xl glass-3 ring-1 ring-purple-brand/25 flex items-center justify-center shadow-[var(--shadow-lg)]"
            >
              <Icons.Compass size={30} strokeWidth={2.2} className="text-purple-brand" />
            </motion.div>
          </div>
        </div>
      }
      statusIcon={<StatusBadgeSystem kind="warning" label="HTTP 404 · Not Found" />}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved. Let's get you back on track — try one of the popular destinations below."
      extra={
        <div className="space-y-3 w-full">
          {/* Search placeholder */}
          <div className="relative">
            <Icons.Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search LootLoom…"
              className="w-full h-10 rounded-xl glass-2 ring-1 ring-border/60 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric/40"
            />
          </div>
          {/* Popular pages shortcuts */}
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 text-left">
              Popular Pages
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              {[
                { label: "Dashboard", icon: Icons.LayoutDashboard, view: "dashboard" as const },
                { label: "Rewards", icon: Icons.Gift, view: "home" as const },
                { label: "Wallet", icon: Icons.Wallet, view: "home" as const },
                { label: "Support", icon: Icons.LifeBuoy, view: "support" as const },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => navigate(p.view)}
                  className="flex items-center gap-2 rounded-xl glass-2 ring-1 ring-border/60 px-3 py-2 text-xs font-medium text-foreground hover:ring-electric/40 hover:bg-electric/5 transition-all"
                >
                  <p.icon size={13} className="text-electric" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.Home size={18} />}
          onClick={() => navigate("home")}
        >
          Return Home
        </LootButton>
      }
      secondaryAction={
        <LootButton
          variant="glass"
          size="lg"
          leftIcon={<Icons.LayoutDashboard size={18} />}
          onClick={() => navigate("dashboard")}
        >
          Dashboard
        </LootButton>
      }
      tertiaryAction={
        <LootButton
          variant="outline"
          size="lg"
          leftIcon={<Icons.LifeBuoy size={18} />}
          onClick={() => navigate("support")}
        >
          Support
        </LootButton>
      }
      footer={
        <>
          <Icons.Search size={13} className="text-purple-brand" />
          <span>Lost in the loom? We'll guide you back.</span>
        </>
      }
    />
  );
}

/* ----------------------------- Error 500 -------------------------- */

function Error500Screen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemLayout
      accent="rose"
      maxWidth="lg"
      illustration={
        <div className="flex flex-col items-center gap-3">
          <BigNumber>500</BigNumber>
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 blur-2xl rounded-full bg-rose-brand/10"
            />
            <div className="relative size-16 rounded-2xl glass-3 ring-1 ring-rose-brand/25 flex items-center justify-center shadow-[var(--shadow-lg)]">
              <Icons.ServerCrash size={30} strokeWidth={2.2} className="text-rose-brand" />
            </div>
          </div>
        </div>
      }
      statusIcon={<StatusBadgeSystem kind="danger" label="HTTP 500 · Server Error" pulse />}
      title="Temporary Issue"
      description="Something went wrong on our end. We're already on it — our engineering team has been notified automatically. Please try again in a moment."
      extra={
        <div className="rounded-xl glass-2 ring-1 ring-rose-brand/15 p-3 text-left w-full">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Error ID
            </span>
            <code className="text-[11px] font-mono text-rose-brand bg-rose-brand/8 px-1.5 py-0.5 rounded">
              LL-500-8F3A92C1
            </code>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Reference this ID when contacting support to help us diagnose the
            issue faster. The error has been logged with full context.
          </p>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.RefreshCw size={18} />}
          onClick={reloadPage}
        >
          Retry
        </LootButton>
      }
      secondaryAction={
        <LootButton
          variant="glass"
          size="lg"
          leftIcon={<Icons.LayoutDashboard size={18} />}
          onClick={() => navigate("dashboard")}
        >
          Return Dashboard
        </LootButton>
      }
      tertiaryAction={
        <LootButton
          variant="outline"
          size="lg"
          leftIcon={<Icons.LifeBuoy size={18} />}
          onClick={() => navigate("support")}
        >
          Support
        </LootButton>
      }
      footer={
        <>
          <Icons.LifeBuoy size={13} className="text-rose-brand" />
          <span>Incident reported · Team notified · Auto-recovery enabled</span>
        </>
      }
    />
  );
}

/* ------------------------- Update Required ------------------------ */

function UpdateRequiredScreen() {
  return (
    <SystemLayout
      accent="emerald"
      maxWidth="lg"
      illustration={<IllustrationPlaceholder variant="update" size="lg" />}
      statusIcon={
        <StatusBadgeSystem kind="success" label="New Version Available" pulse />
      }
      title="New Version Available"
      description="A new version of LootLoom is available with performance improvements, new rewards, and security patches. Please update to continue enjoying the latest features."
      extra={
        <div className="space-y-3 w-full">
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <InfoMiniCard
              icon={<Icons.Package size={14} />}
              label="Current"
              value="v2.3.8"
              accent="navy"
            />
            <InfoMiniCard
              icon={<Icons.Sparkles size={14} />}
              label="Latest"
              value="v2.4.0"
              accent="emerald"
            />
          </div>
          <div className="rounded-xl glass-2 ring-1 ring-emerald-brand/15 p-3 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Gift size={13} className="text-emerald-brand" />
              <span className="text-xs font-semibold text-foreground">
                What's New
              </span>
            </div>
            <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
              <li className="flex items-center gap-1.5">
                <Icons.Sparkle size={10} className="text-emerald-brand" />
                New daily mission types with bonus rewards
              </li>
              <li className="flex items-center gap-1.5">
                <Icons.Sparkle size={10} className="text-emerald-brand" />
                Faster reward redemption — instant UPI payouts
              </li>
              <li className="flex items-center gap-1.5">
                <Icons.Sparkle size={10} className="text-emerald-brand" />
                Improved leaderboard with weekly resets
              </li>
            </ul>
          </div>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.DownloadCloud size={18} />}
          onClick={reloadPage}
        >
          Download & Update
        </LootButton>
      }
      secondaryAction={
        <LootButton variant="glass" size="lg" leftIcon={<Icons.Clock size={18} />}>
          Skip for Now
        </LootButton>
      }
      footer={
        <>
          <Icons.RefreshCw size={13} className="text-emerald-brand" />
          <span>Auto-update available · v2.4.0 · 4.2 MB</span>
        </>
      }
    />
  );
}

/* --------------------------- Auth Loading ------------------------- */

function AuthLoadingScreen() {
  const navigate = useNavigationStore((s) => s.navigate);

  useEffect(() => {
    const t = setTimeout(() => navigate("dashboard"), 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <SystemLayout
      accent="electric"
      maxWidth="md"
      illustration={
        <motion.div variants={floating} initial={false} animate="animate">
          <Logo size="lg" animated />
        </motion.div>
      }
      statusIcon={<StatusBadgeSystem kind="loading" label="Authenticating" pulse />}
      title={
        <motion.span
          animate={{ y: [0, -3, 0], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block"
        >
          Securing your session…
        </motion.span>
      }
      description="Verifying credentials · Encrypting connection · Loading your profile"
      extra={
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Dual spinner rings */}
          <CircularProgress size={72} accent="electric" />
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
                className="size-1.5 rounded-full bg-electric"
              />
            ))}
          </div>
        </div>
      }
      footer={
        <>
          <Icons.ShieldCheck size={13} className="text-emerald-brand" />
          <span>End-to-end encrypted · Session secured</span>
        </>
      }
    />
  );
}

/* ------------------------ Service Unavailable --------------------- */

function ServiceUnavailableScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemLayout
      accent="rose"
      maxWidth="lg"
      illustration={<IllustrationPlaceholder variant="error" size="lg" />}
      statusIcon={<StatusBadgeSystem kind="danger" label="Service Outage" pulse />}
      title="Temporary Outage"
      description="One of our services is temporarily unavailable. Our team is already working on it — please try again shortly or check the status page for live updates."
      extra={
        <div className="rounded-xl glass-2 ring-1 ring-rose-brand/15 p-3 text-left w-full">
          <div className="flex items-center gap-2 mb-2">
            <Icons.Activity size={13} className="text-rose-brand" />
            <span className="text-xs font-semibold text-foreground">
              Live Monitoring
            </span>
            <StatusBadgeSystem kind="danger" label="Degraded" className="ml-auto" pulse />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: "API", val: "92%", color: "text-emerald-brand" },
              { label: "Wallet", val: "78%", color: "text-gold" },
              { label: "Rewards", val: "45%", color: "text-rose-brand" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg bg-muted/40 p-2 text-center"
              >
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
                <p className={cn("text-xs font-bold tabular-nums", s.color)}>
                  {s.val}
                </p>
              </div>
            ))}
          </div>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.RefreshCw size={18} />}
          onClick={reloadPage}
        >
          Retry
        </LootButton>
      }
      secondaryAction={
        <LootButton
          variant="glass"
          size="lg"
          leftIcon={<Icons.Activity size={18} />}
          onClick={() => navigate("status-page")}
        >
          Status Page
        </LootButton>
      }
      tertiaryAction={
        <LootButton
          variant="outline"
          size="lg"
          leftIcon={<Icons.LifeBuoy size={18} />}
          onClick={() => navigate("support")}
        >
          Support
        </LootButton>
      }
      footer={
        <>
          <Icons.ServerCrash size={13} className="text-rose-brand" />
          <span>Auto-monitoring enabled · ETA 5–10 minutes</span>
        </>
      }
    />
  );
}

/* ---------------------------- Coming Soon ------------------------- */

function ComingSoonScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemLayout
      accent="purple"
      maxWidth="lg"
      illustration={
        <motion.div
          variants={floating}
          initial={false}
          animate="animate"
          className="relative"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 blur-2xl rounded-full bg-purple/10"
          />
          <div className="relative size-24 rounded-3xl glass-3 ring-1 ring-purple-brand/25 flex items-center justify-center shadow-[var(--shadow-lg)]">
            <motion.span
              animate={{ y: [0, -4, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <Icons.Rocket size={40} strokeWidth={2.2} className="text-purple-brand" />
            </motion.span>
          </div>
        </motion.div>
      }
      statusIcon={<StatusBadgeSystem kind="beta" label="In Development" pulse />}
      title="Coming Soon"
      description="We're crafting something special for you. This feature is in active development and will be available soon. Stay tuned for the grand reveal."
      extra={
        <div className="space-y-4 w-full">
          <div className="flex flex-col items-center gap-2">
            <ProgressRing value={62} size={108} gradient="purple" label="62%" />
            <p className="text-[11px] text-muted-foreground">
              Development progress · ETA Q2 2025
            </p>
          </div>
          <div className="rounded-xl glass-2 ring-1 ring-purple-brand/15 p-3 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Sparkles size={13} className="text-purple-brand" />
              <span className="text-xs font-semibold text-foreground">
                Feature Preview
              </span>
            </div>
            <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
              <li className="flex items-center gap-1.5">
                <Icons.Check size={10} className="text-emerald-brand" />
                AI-powered reward recommendations
              </li>
              <li className="flex items-center gap-1.5">
                <Icons.Check size={10} className="text-emerald-brand" />
                Smart mission personalization
              </li>
              <li className="flex items-center gap-1.5">
                <Icons.Clock size={10} className="text-gold" />
                Predictive earnings insights
              </li>
            </ul>
          </div>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.Bell size={18} />}
        >
          Notify Me at Launch
        </LootButton>
      }
      secondaryAction={
        <LootButton
          variant="glass"
          size="lg"
          leftIcon={<Icons.LayoutDashboard size={18} />}
          onClick={() => navigate("dashboard")}
        >
          Return Dashboard
        </LootButton>
      }
      footer={
        <>
          <Icons.Rocket size={13} className="text-purple-brand" />
          <span>Estimated release · Q2 2025 · Beta access coming soon</span>
        </>
      }
    />
  );
}

/* ----------------------- Feature Not Available -------------------- */

function FeatureNotAvailableScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemLayout
      accent="gold"
      maxWidth="lg"
      illustration={<IllustrationPlaceholder variant="empty" size="lg" accent="gold" />}
      statusIcon={<StatusBadgeSystem kind="warning" label="Not Available" />}
      title="Feature Not Available"
      description="This feature isn't available in your region or current plan yet. We're rolling it out gradually — check back soon or explore other features in the meantime."
      extra={
        <div className="rounded-xl glass-2 ring-1 ring-gold/20 p-3 text-left w-full">
          <div className="flex items-center gap-2 mb-2">
            <Icons.Map size={13} className="text-gold" />
            <span className="text-xs font-semibold text-foreground">
              Roadmap
            </span>
          </div>
          <div className="space-y-2">
            {[
              { phase: "Phase 1", label: "North America", status: "Live", color: "text-emerald-brand" },
              { phase: "Phase 2", label: "Europe & UK", status: "Live", color: "text-emerald-brand" },
              { phase: "Phase 3", label: "Asia Pacific", status: "Soon", color: "text-gold" },
              { phase: "Phase 4", label: "Global rollout", status: "Planned", color: "text-muted-foreground" },
            ].map((r) => (
              <div
                key={r.phase}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="flex items-center gap-1.5">
                  <Icons.CircleDot size={9} className={r.color} />
                  <span className="text-muted-foreground">{r.phase}</span>
                  <span className="text-foreground font-medium">{r.label}</span>
                </span>
                <span className={cn("font-semibold", r.color)}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      }
      primaryAction={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.LayoutDashboard size={18} />}
          onClick={() => navigate("dashboard")}
        >
          Return Dashboard
        </LootButton>
      }
      secondaryAction={
        <LootButton
          variant="glass"
          size="lg"
          leftIcon={<Icons.Compass size={18} />}
          onClick={() => navigate("home")}
        >
          Explore Features
        </LootButton>
      }
      footer={
        <>
          <Icons.PackageOpen size={13} className="text-gold" />
          <span>Phased rollout · Your region is on the roadmap</span>
        </>
      }
    />
  );
}

/* ============================================================
   EmptyApplicationState — reusable empty states for app sections
   ============================================================ */

type EmptyVariant =
  | "no-data"
  | "no-rewards"
  | "no-transactions"
  | "no-notifications"
  | "no-achievements"
  | "no-referrals"
  | "no-wallet"
  | "no-tickets"
  | "no-search-results";

interface EmptyVariantConfig {
  icon: keyof typeof Icons;
  accent: Accent;
  title: string;
  description: string;
  primaryLabel?: string;
  primaryIcon?: keyof typeof Icons;
  primaryView?: ViewId;
  secondaryLabel?: string;
  secondaryIcon?: keyof typeof Icons;
  secondaryView?: ViewId;
}

const EMPTY_VARIANTS: Record<EmptyVariant, EmptyVariantConfig> = {
  "no-data": {
    icon: "Database",
    accent: "electric",
    title: "No Data Yet",
    description: "Your data will appear here once it's available. Get started by exploring the platform.",
    primaryLabel: "Refresh",
    primaryIcon: "RefreshCw",
  },
  "no-rewards": {
    icon: "Gift",
    accent: "purple",
    title: "No Rewards Available",
    description: "There are no rewards to display right now. Check back later or explore earning opportunities.",
    primaryLabel: "Earn Coins",
    primaryIcon: "Coins",
    primaryView: "earn",
    secondaryLabel: "Browse Catalog",
    secondaryIcon: "Compass",
    secondaryView: "rewards",
  },
  "no-transactions": {
    icon: "Receipt",
    accent: "cyan",
    title: "No Transactions Yet",
    description: "Your transaction history will appear here once you start earning and redeeming rewards.",
    primaryLabel: "Start Earning",
    primaryIcon: "Coins",
    primaryView: "earn",
  },
  "no-notifications": {
    icon: "BellOff",
    accent: "gold",
    title: "All Caught Up",
    description: "You have no unread notifications. We'll let you know when something interesting happens.",
    primaryLabel: "Dashboard",
    primaryIcon: "LayoutDashboard",
    primaryView: "dashboard",
  },
  "no-achievements": {
    icon: "Trophy",
    accent: "gold",
    title: "No Achievements Yet",
    description: "Complete missions and challenges to unlock achievements. Your collection will grow as you progress.",
    primaryLabel: "View Missions",
    primaryIcon: "Target",
    primaryView: "missions",
  },
  "no-referrals": {
    icon: "Users",
    accent: "emerald",
    title: "No Referrals Yet",
    description: "Invite friends to LootLoom and earn bonus coins for every successful referral.",
    primaryLabel: "Share Invite",
    primaryIcon: "Share2",
    primaryView: "referral",
  },
  "no-wallet": {
    icon: "Wallet",
    accent: "electric",
    title: "Wallet Empty",
    description: "Your wallet balance is zero. Start earning coins by completing missions, watching ads, or referring friends.",
    primaryLabel: "Earn Coins",
    primaryIcon: "Coins",
    primaryView: "earn",
    secondaryLabel: "View Rewards",
    secondaryIcon: "Gift",
    secondaryView: "rewards",
  },
  "no-tickets": {
    icon: "Ticket",
    accent: "purple",
    title: "No Support Tickets",
    description: "You haven't created any support tickets yet. Our team is here to help if you need assistance.",
    primaryLabel: "Contact Support",
    primaryIcon: "LifeBuoy",
    primaryView: "support",
  },
  "no-search-results": {
    icon: "SearchX",
    accent: "navy",
    title: "No Results Found",
    description: "We couldn't find anything matching your search. Try different keywords or clear your filters.",
    primaryLabel: "Clear Filters",
    primaryIcon: "FilterX",
  },
};

interface EmptyApplicationStateProps {
  variant: EmptyVariant;
  /** Override the default title */
  title?: string;
  /** Override the default description */
  description?: string;
  /** Hide the default actions */
  hideActions?: boolean;
  /** Custom primary action (overrides default) */
  primaryAction?: ReactNode;
  /** Custom secondary action (overrides default) */
  secondaryAction?: ReactNode;
  /** Compact rendering (smaller icon, less padding) */
  compact?: boolean;
  className?: string;
}

export function EmptyApplicationState({
  variant,
  title,
  description,
  hideActions = false,
  primaryAction,
  secondaryAction,
  compact = false,
  className,
}: EmptyApplicationStateProps) {
  const navigate = useNavigationStore((s) => s.navigate);
  const cfg = EMPTY_VARIANTS[variant];

  const PrimaryIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[
    cfg.primaryIcon ?? "Sparkles"
  ];
  const SecondaryIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[
    cfg.secondaryIcon ?? "ArrowRight"
  ];
  const VariantIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[
    cfg.icon
  ];

  const a = cfg.accent;
  const padding = compact ? "py-8 px-4" : "py-12 px-6";
  const iconBox = compact ? "size-14" : "size-16";

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        padding,
        className
      )}
    >
      {/* Illustration */}
      <motion.div variants={scaleIn} initial="initial" animate="animate" className="relative mb-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          className={cn("absolute inset-0 blur-2xl rounded-full", ACCENT_BG[a])}
        />
        <motion.div
          variants={floating}
          initial={false}
          animate="animate"
          className={cn(
            "relative rounded-2xl glass-2 ring-1 flex items-center justify-center",
            iconBox,
            ACCENT_RING[a]
          )}
        >
          <VariantIcon size={compact ? 22 : 28} className={cn(ACCENT_TEXT[a])} strokeWidth={2.1} />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h3
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="text-base sm:text-lg font-semibold text-foreground mb-1.5"
      >
        {title ?? cfg.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        variants={fade}
        initial="initial"
        animate="animate"
        className="text-sm text-muted-foreground max-w-sm leading-relaxed"
      >
        {description ?? cfg.description}
      </motion.p>

      {/* Actions */}
      {!hideActions && (primaryAction || secondaryAction || cfg.primaryLabel) && (
        <motion.div
          variants={fade}
          initial="initial"
          animate="animate"
          className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
        >
          {primaryAction ??
            (cfg.primaryLabel && (
              <LootButton
                variant="electric"
                size={compact ? "sm" : "md"}
                leftIcon={cfg.primaryIcon ? <PrimaryIcon size={16} /> : undefined}
                onClick={() => cfg.primaryView && navigate(cfg.primaryView)}
              >
                {cfg.primaryLabel}
              </LootButton>
            ))}
          {secondaryAction ??
            (cfg.secondaryLabel && (
              <LootButton
                variant="glass"
                size={compact ? "sm" : "md"}
                leftIcon={cfg.secondaryIcon ? <SecondaryIcon size={16} /> : undefined}
                onClick={() => cfg.secondaryView && navigate(cfg.secondaryView)}
              >
                {cfg.secondaryLabel}
              </LootButton>
            ))}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ============================================================
   SystemView — main router (named export)
   ============================================================ */

const SYSTEM_SCREENS: Partial<Record<string, () => ReactNode>> = {
  splash: SplashScreen,
  "app-loading": AppLoadingScreen,
  "session-expired": SessionExpiredScreen,
  unauthorized: UnauthorizedScreen,
  maintenance: MaintenanceScreen,
  "error-403": Error403Screen,
  "error-404": Error404Screen,
  "error-500": Error500Screen,
  offline: OfflineScreen,
  "update-required": UpdateRequiredScreen,
  "auth-loading": AuthLoadingScreen,
  "service-unavailable": ServiceUnavailableScreen,
  "coming-soon": ComingSoonScreen,
  "feature-not-available": FeatureNotAvailableScreen,
};

export function SystemView() {
  const current = useNavigationStore((s) => s.current);
  const Screen = SYSTEM_SCREENS[current];

  // Defensive: unknown system view falls through to 404
  if (!Screen) {
    return (
      <AnimatePresence mode="wait">
        <Error404Screen key="fallback-404" />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Screen key={current} />
    </AnimatePresence>
  );
}
