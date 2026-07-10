"use client";

/**
 * LootLoom — CeoAuthView
 * The completely private CEO Platform security gateway + login.
 *
 * Flow steps (local UI state only — NO backend auth, NO JWT, NO DB):
 *   "gateway"  → Security gateway hero (locked entry panel)
 *   "login"    → CEO login form (CEO ID + Password + Remember Device)
 *   "timeline" → Multi-step authentication timeline → Enter CEO Dashboard
 *
 * Layout: Desktop split (left = animated security illustration + panels + session
 * architecture, right = login form / timeline). Tablet adaptive. Mobile stacked.
 *
 * BackgroundEngine is global (rendered by AppRouter) — not duplicated here.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  Smartphone,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Wifi,
  Cpu,
  Clock,
  MapPin,
  Monitor,
  ShieldAlert,
  Server,
  Globe,
  Activity,
  History,
  UserCog,
  Crown,
  Timer,
  RefreshCw,
  Network,
  LockKeyhole,
  ScanFace,
  Building2,
  AlertCircle,
  Ban,
  HardDrive,
  BadgeCheck,
  ShieldHalf,
  ShieldX,
  TriangleAlert,
  KeySquare,
  Cctv,
  Radar,
  Globe2,
  Users,
  Gift,
  Bell,
} from "lucide-react";
import {
  GlassCard,
  LootButton,
  Logo,
  IconBadge,
  StatusBadge,
  ProgressRing,
} from "@/components/lootloom";
import { useNavigationStore, useAuthStore } from "@/stores";
import {
  pageTransition,
  fade,
  slideUp,
  scaleIn,
  floating,
  modalPop,
  pulseGlow,
  staggerContainer,
} from "@/lib/animations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/* ============================================================
   Shared input styling
   ============================================================ */
const INPUT_CLASS =
  "h-12 rounded-xl glass-2 ring-1 ring-border px-4 text-sm focus:ring-navy/40 focus:ring-2 outline-none transition-all w-full";

/* ============================================================
   Types
   ============================================================ */
type AuthStep = "gateway" | "login" | "timeline";

type Accent =
  | "navy"
  | "electric"
  | "cyan"
  | "purple"
  | "gold"
  | "emerald"
  | "rose";

interface SecurityPanelDef {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: Accent;
  status: "active" | "locked" | "future";
  statusLabel: string;
}

interface SessionFieldDef {
  label: string;
  value: string;
  icon: React.ReactNode;
  future?: boolean;
}

interface WarningDef {
  id: string;
  title: string;
  message: string;
  severity: "high" | "critical" | "medium";
  icon: React.ReactNode;
}

/* ============================================================
   SECURITY COMPONENTS — reusable, defined in-file
   ============================================================ */

/** SecurityCard — glass card with accent rail + icon + status badge */
function SecurityCard({
  title,
  description,
  icon,
  accent = "navy",
  status,
  statusLabel,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  accent?: Accent;
  status?: "active" | "locked" | "future";
  statusLabel?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const accentText: Record<Accent, string> = {
    navy: "text-navy",
    electric: "text-electric",
    cyan: "text-cyan-brand",
    purple: "text-purple-brand",
    gold: "text-gold",
    emerald: "text-emerald-brand",
    rose: "text-rose-brand",
  };
  const accentBg: Record<Accent, string> = {
    navy: "bg-navy/10",
    electric: "bg-electric/10",
    cyan: "bg-cyan/10",
    purple: "bg-purple/10",
    gold: "bg-gold/15",
    emerald: "bg-emerald-brand/10",
    rose: "bg-rose-brand/10",
  };
  const accentRail: Record<Accent, string> = {
    navy: "bg-navy",
    electric: "bg-electric",
    cyan: "bg-cyan-brand",
    purple: "bg-purple-brand",
    gold: "bg-gold",
    emerald: "bg-emerald-brand",
    rose: "bg-rose-brand",
  };

  return (
    <GlassCard
      level={2}
      hover
      sheen
      className={cn("p-4 sm:p-5 relative overflow-hidden h-full", className)}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", accentRail[accent])} />
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center ring-1 ring-border shrink-0",
            accentBg[accent],
            accentText[accent]
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
            {status && statusLabel && (
              <StatusBadge
                variant={
                  status === "active" ? "success" : status === "future" ? "default" : "error"
                }
                dot
                pulse={status === "active"}
                className="shrink-0"
              >
                {statusLabel}
              </StatusBadge>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </GlassCard>
  );
}

/** VerificationCard — single step verification tile (used by timeline) */
function VerificationCard({
  index,
  title,
  subtitle,
  icon,
  state,
}: {
  index: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  state: "completed" | "active" | "pending" | "future";
}) {
  const stateConfig = {
    completed: {
      ring: "ring-emerald-brand/40 bg-emerald-brand/10 text-emerald-brand",
      icon: <Check size={14} strokeWidth={3} />,
      label: "Verified",
      labelClass: "bg-emerald-brand/12 text-emerald-brand ring-emerald-brand/20",
      body: "opacity-100",
    },
    active: {
      ring: "ring-navy/50 bg-navy/10 text-navy",
      icon: icon,
      label: "In Progress",
      labelClass: "bg-navy/12 text-navy ring-navy/20",
      body: "opacity-100",
    },
    pending: {
      ring: "ring-electric/40 bg-electric/10 text-electric",
      icon: icon,
      label: "Pending",
      labelClass: "bg-electric/12 text-electric ring-electric/20",
      body: "opacity-80",
    },
    future: {
      ring: "ring-border bg-muted/40 text-muted-foreground",
      icon: icon,
      label: "Locked",
      labelClass: "bg-muted text-muted-foreground ring-border",
      body: "opacity-55",
    },
  }[state];

  return (
    <motion.div
      variants={slideUp}
      className={cn(
        "relative rounded-xl glass-2 ring-1 p-3 sm:p-3.5 flex items-center gap-3",
        stateConfig.ring
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="size-9 rounded-lg bg-background/60 ring-1 ring-border flex items-center justify-center shrink-0">
          {stateConfig.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
              {String(index).padStart(2, "0")}
            </span>
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          </div>
          <p className={cn("text-[11px] text-muted-foreground truncate", stateConfig.body)}>
            {subtitle}
          </p>
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
          stateConfig.labelClass
        )}
      >
        {stateConfig.label}
      </span>
    </motion.div>
  );
}

/** AuthenticationTimeline — vertical timeline of the auth flow */
function AuthenticationTimeline({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: { title: string; subtitle: string; icon: React.ReactNode; future?: boolean }[];
}) {
  return (
    <div className="relative">
      {/* Vertical connector */}
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-electric/40 via-navy/30 to-transparent" />
      <motion.ol
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2.5"
      >
        {steps.map((s, i) => {
          const state: "completed" | "active" | "pending" | "future" = s.future
            ? "future"
            : i < currentStep
            ? "completed"
            : i === currentStep
            ? "active"
            : "pending";
          return (
            <li key={i} className="relative">
              <VerificationCard
                index={i + 1}
                title={s.title}
                subtitle={s.subtitle}
                icon={s.icon}
                state={state}
              />
            </li>
          );
        })}
      </motion.ol>
    </div>
  );
}

/** SecurityBadge — small pill with shield/check icon */
function SecurityBadge({
  label,
  icon,
  tone = "navy",
}: {
  label: string;
  icon?: React.ReactNode;
  tone?: Accent;
}) {
  const tones: Record<Accent, string> = {
    navy: "bg-navy/8 text-navy ring-navy/20",
    electric: "bg-electric/8 text-electric ring-electric/20",
    cyan: "bg-cyan/8 text-cyan-brand ring-cyan-brand/20",
    purple: "bg-purple/8 text-purple-brand ring-purple-brand/20",
    gold: "bg-gold/12 text-gold ring-gold/25",
    emerald: "bg-emerald-brand/8 text-emerald-brand ring-emerald-brand/20",
    rose: "bg-rose-brand/8 text-rose-brand ring-rose-brand/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1",
        tones[tone]
      )}
    >
      {icon ?? <ShieldCheck size={11} />}
      {label}
    </span>
  );
}

/** TrustBadge — large trust certification tile */
function TrustBadge({
  title,
  subtitle,
  icon,
  level = "Verified",
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  level?: string;
}) {
  return (
    <div className="rounded-xl glass-2 ring-1 ring-border p-3 flex items-center gap-3">
      <div className="size-10 rounded-lg bg-gradient-to-br from-navy/15 to-electric/10 ring-1 ring-border flex items-center justify-center text-navy">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground truncate">{title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-brand/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-brand ring-1 ring-emerald-brand/20 shrink-0">
        <BadgeCheck size={11} />
        {level}
      </span>
    </div>
  );
}

/** EncryptedSessionBadge — animated encryption indicator */
function EncryptedSessionBadge() {
  return (
    <motion.div
      variants={pulseGlow}
      animate="animate"
      className="inline-flex items-center gap-2 rounded-full glass-2 ring-1 ring-navy/25 px-3 py-1.5"
    >
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="size-1.5 rounded-full bg-emerald-brand"
      />
      <span className="text-[10px] font-bold tracking-wider text-navy uppercase">
        AES-256 Encrypted
      </span>
      <Lock size={11} className="text-navy" />
    </motion.div>
  );
}

/** SecurityBanner — top alert banner */
function SecurityBanner({
  tone = "navy",
  icon,
  title,
  message,
}: {
  tone?: Accent;
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  const toneBg: Record<Accent, string> = {
    navy: "bg-navy/8 ring-navy/20 text-navy",
    electric: "bg-electric/8 ring-electric/20 text-electric",
    cyan: "bg-cyan/8 ring-cyan-brand/20 text-cyan-brand",
    purple: "bg-purple/8 ring-purple-brand/20 text-purple-brand",
    gold: "bg-gold/12 ring-gold/25 text-gold",
    emerald: "bg-emerald-brand/8 ring-emerald-brand/20 text-emerald-brand",
    rose: "bg-rose-brand/8 ring-rose-brand/20 text-rose-brand",
  };
  return (
    <div
      className={cn(
        "rounded-xl ring-1 p-3 sm:p-3.5 flex items-start gap-3",
        toneBg[tone]
      )}
    >
      <div className="size-8 rounded-lg bg-background/60 ring-1 ring-border flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

/** RiskIndicator — animated risk score with ProgressRing */
function RiskIndicator({
  value,
  label = "Risk Score",
  size = 100,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const level =
    value < 25 ? "Low" : value < 55 ? "Moderate" : value < 80 ? "Elevated" : "Critical";
  const ringGradient: "emerald" | "gold" | "purple" =
    value < 25 ? "emerald" : value < 55 ? "gold" : "purple";
  return (
    <div className="flex flex-col items-center text-center">
      <ProgressRing value={value} size={size} strokeWidth={9} gradient={ringGradient} />
      <span className="mt-2 text-xs font-semibold text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground">{level} Risk</span>
    </div>
  );
}

/** AdministratorAvatar — premium avatar with crown + lock */
function AdministratorAvatar({ size = 64 }: { size?: number }) {
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      {/* Pulsing halo */}
      <motion.span
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-2xl bg-navy/25 blur-xl"
      />
      {/* Avatar body */}
      <div className="relative size-full rounded-2xl bg-[linear-gradient(135deg,var(--navy),oklch(0.4_0.06_260)_55%,var(--electric))] ring-1 ring-navy/30 flex items-center justify-center shadow-[var(--shadow-lg)]">
        <Crown className="text-amber-300" size={size * 0.36} strokeWidth={2.2} />
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1.5 -right-1.5 size-6 rounded-full bg-background ring-1 ring-border flex items-center justify-center shadow-sm"
        >
          <Lock size={11} className="text-navy" />
        </motion.div>
      </div>
    </div>
  );
}

/** PermissionCard — single permission scope tile */
function PermissionCard({
  label,
  icon,
  scope,
  granted,
}: {
  label: string;
  icon: React.ReactNode;
  scope: string;
  granted: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl ring-1 p-3 flex items-center gap-3 transition-colors",
        granted
          ? "ring-emerald-brand/25 bg-emerald-brand/5"
          : "ring-border bg-muted/30 opacity-70"
      )}
    >
      <div
        className={cn(
          "size-8 rounded-lg flex items-center justify-center shrink-0",
          granted ? "bg-emerald-brand/10 text-emerald-brand" : "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate font-mono">{scope}</p>
      </div>
      <span
        className={cn(
          "shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
          granted
            ? "bg-emerald-brand/12 text-emerald-brand ring-emerald-brand/20"
            : "bg-muted text-muted-foreground ring-border"
        )}
      >
        {granted ? <Check size={10} /> : <X size={10} />}
        {granted ? "Granted" : "Locked"}
      </span>
    </div>
  );
}

/* ============================================================
   AuthTimeline (legacy alias kept for spec naming parity)
   ============================================================ */
function AuthTimeline({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: { title: string; subtitle: string; icon: React.ReactNode; future?: boolean }[];
}) {
  return <AuthenticationTimeline currentStep={currentStep} steps={steps} />;
}

/* ============================================================
   SecurityWarningDialog — reusable warning dialog
   ============================================================ */
const SECURITY_WARNINGS: WarningDef[] = [
  {
    id: "unauthorized",
    title: "Unauthorized Access",
    message:
      "Your account does not have permission to enter the CEO administration platform. This access attempt has been logged and reported to the platform security team.",
    severity: "high",
    icon: <ShieldX className="text-rose-brand" size={22} />,
  },
  {
    id: "invalid-credentials",
    title: "Invalid Credentials",
    message:
      "The CEO ID or password you entered is incorrect. Please verify your credentials and try again. Repeated failures may temporarily lock this device.",
    severity: "high",
    icon: <KeyRound className="text-gold" size={22} />,
  },
  {
    id: "otp-failed",
    title: "Future OTP Failed",
    message:
      "The one-time passcode you entered could not be verified. Future OTP verification is not yet enabled on this platform. Please contact the platform owner.",
    severity: "medium",
    icon: <Smartphone className="text-electric" size={22} />,
  },
  {
    id: "device-rejected",
    title: "Future Device Rejected",
    message:
      "This device has not been added to the trusted devices list. Future device verification is not yet enabled. The session has been terminated as a precaution.",
    severity: "high",
    icon: <Monitor className="text-purple-brand" size={22} />,
  },
  {
    id: "session-expired",
    title: "Future Session Expired",
    message:
      "Your administrator session has expired due to inactivity. Future session validation is not yet enabled. Please re-authenticate to continue.",
    severity: "medium",
    icon: <Clock className="text-cyan-brand" size={22} />,
  },
  {
    id: "account-locked",
    title: "Future Account Locked",
    message:
      "This administrator account has been temporarily locked after multiple failed verification attempts. Future lockout protection is not yet enabled.",
    severity: "critical",
    icon: <Ban className="text-rose-brand" size={22} />,
  },
  {
    id: "too-many-attempts",
    title: "Future Too Many Attempts",
    message:
      "Too many authentication attempts have been detected from this device. Future rate limiting is not yet enforced. Please wait before trying again.",
    severity: "high",
    icon: <TriangleAlert className="text-gold" size={22} />,
  },
  {
    id: "maintenance",
    title: "Future Maintenance",
    message:
      "The CEO administration platform is undergoing scheduled maintenance. Future maintenance windows are not yet configured. Please try again later.",
    severity: "medium",
    icon: <AlertCircle className="text-electric" size={22} />,
  },
];

function SecurityWarningDialog({
  open,
  onOpenChange,
  warningId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  warningId: string;
}) {
  const warning = useMemo(
    () => SECURITY_WARNINGS.find((w) => w.id === warningId) ?? SECURITY_WARNINGS[0],
    [warningId]
  );

  const severityConfig = {
    high: {
      tone: "rose" as const,
      label: "High Severity",
      labelClass: "bg-rose-brand/12 text-rose-brand ring-rose-brand/20",
    },
    critical: {
      tone: "rose" as const,
      label: "Critical Severity",
      labelClass: "bg-rose-brand/15 text-rose-brand ring-rose-brand/30",
    },
    medium: {
      tone: "gold" as const,
      label: "Medium Severity",
      labelClass: "bg-gold/15 text-gold ring-gold/25",
    },
  }[warning.severity];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <motion.div variants={modalPop} initial="initial" animate="animate" exit="exit">
          <GlassCard level={3} sheen reflect className="overflow-hidden">
            {/* Severity bar */}
            <div
              className={cn(
                "h-1.5 w-full",
                severityConfig.tone === "rose"
                  ? "bg-[linear-gradient(90deg,var(--rose-brand),var(--purple-brand))]"
                  : "bg-[linear-gradient(90deg,var(--gold),var(--electric))]"
              )}
            />
            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <motion.div
                  variants={pulseGlow}
                  animate="animate"
                  className="size-14 rounded-2xl glass-2 ring-1 ring-border flex items-center justify-center shrink-0"
                >
                  {warning.icon}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                      severityConfig.labelClass
                    )}
                  >
                    <AlertTriangle size={10} />
                    {severityConfig.label}
                  </span>
                  <DialogTitle className="mt-2 text-lg font-bold text-foreground">
                    {warning.title}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {warning.message}
                  </DialogDescription>
                </div>
              </div>

              {/* Incident metadata */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: "Incident ID", value: "INC-" + warning.id.slice(0, 4).toUpperCase() + "-7K2" },
                  { label: "Timestamp", value: new Date().toISOString().slice(11, 19) + " UTC" },
                  { label: "Status", value: "Logged" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg bg-muted/30 ring-1 ring-border px-2.5 py-1.5"
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {m.label}
                    </p>
                    <p className="text-[11px] font-mono font-semibold text-foreground truncate">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>

              <DialogFooter className="mt-6 sm:justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Cctv size={11} className="text-rose-brand" />
                  Recorded to security audit log
                </div>
                <div className="flex gap-2">
                  <LootButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                    Dismiss
                  </LootButton>
                  <LootButton
                    variant="destructive"
                    size="sm"
                    leftIcon={<ShieldAlert size={14} />}
                    onClick={() => onOpenChange(false)}
                  >
                    Acknowledge
                  </LootButton>
                </div>
              </DialogFooter>
            </div>
          </GlassCard>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Animated security illustration (left panel centerpiece)
   ============================================================ */
function SecurityIllustration() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Background aura */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-6 rounded-full bg-[radial-gradient(circle,var(--navy)/0.18,transparent_70%)] blur-2xl"
      />

      {/* Concentric rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 20 + i * 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed"
          style={{
            margin: `${i * 24}px`,
            borderColor: i === 0 ? "oklch(0.27 0.05 260 / 0.25)" : i === 1 ? "oklch(0.62 0.22 255 / 0.2)" : "oklch(0.72 0.15 200 / 0.18)",
          }}
        />
      ))}

      {/* Orbiting badges — outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        {[
          { icon: <ShieldCheck size={14} />, color: "text-emerald-brand", bg: "bg-emerald-brand/10", pos: "top-0 left-1/2 -translate-x-1/2" },
          { icon: <KeyRound size={14} />, color: "text-gold", bg: "bg-gold/15", pos: "right-0 top-1/2 -translate-y-1/2" },
          { icon: <Fingerprint size={14} />, color: "text-electric", bg: "bg-electric/10", pos: "bottom-0 left-1/2 -translate-x-1/2" },
          { icon: <Lock size={14} />, color: "text-navy", bg: "bg-navy/10", pos: "left-0 top-1/2 -translate-y-1/2" },
        ].map((b, i) => (
          <div
            key={i}
            className={cn(
              "absolute size-9 rounded-xl ring-1 ring-border flex items-center justify-center glass-2",
              b.bg,
              b.color,
              b.pos
            )}
          >
            <motion.span
              animate={{ rotate: -360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            >
              {b.icon}
            </motion.span>
          </div>
        ))}
      </motion.div>

      {/* Center shield */}
      <motion.div
        variants={floating}
        initial="initial"
        animate="animate"
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: [0, -6, 6, -3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="relative size-32 sm:size-36 rounded-3xl glass-3 ring-1 ring-navy/30 flex items-center justify-center shadow-[var(--shadow-xl)]"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,var(--electric)/0.18,transparent_60%)]"
          />
          <Lock
            className="relative text-navy"
            size={56}
            strokeWidth={1.8}
          />
          {/* Shield orbiting the lock */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <ShieldCheck
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-electric"
              size={18}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating mini badges */}
      <motion.div
        variants={floating}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.6 }}
        className="absolute top-[8%] right-[6%] glass-2 ring-1 ring-border rounded-xl px-2.5 py-1.5 flex items-center gap-1.5"
      >
        <Wifi size={11} className="text-emerald-brand" />
        <span className="text-[10px] font-semibold text-foreground">Secure</span>
      </motion.div>
      <motion.div
        variants={floating}
        initial="initial"
        animate="animate"
        transition={{ delay: 1.2 }}
        className="absolute bottom-[12%] left-[4%] glass-2 ring-1 ring-border rounded-xl px-2.5 py-1.5 flex items-center gap-1.5"
      >
        <Cpu size={11} className="text-electric" />
        <span className="text-[10px] font-semibold text-foreground">256-bit</span>
      </motion.div>
    </div>
  );
}

/* ============================================================
   STEP 1 — CEO Security Gateway Hero
   ============================================================ */
function GatewayHero({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={slideUp} className="flex justify-center">
        <SecurityBadge
          label="Restricted Administration Zone"
          icon={<ShieldHalf size={11} />}
          tone="navy"
        />
      </motion.div>

      <motion.div variants={slideUp} className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-bold text-foreground">
          <Lock className="text-navy" size={26} />
          CEO Dashboard
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          This administration platform is reserved exclusively for authorized Chief
          Executive Officers and approved platform administrators. Your current account
          does not have sufficient permissions to continue.
        </p>
        <p className="text-xs text-muted-foreground/80 italic">
          If you believe this is an error, please contact the platform owner.
        </p>
      </motion.div>

      <motion.div variants={slideUp} className="flex justify-center">
        <EncryptedSessionBadge />
      </motion.div>

      <motion.div variants={slideUp} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <LootButton
          variant="glass"
          size="lg"
          fullWidth
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("dashboard")}
        >
          Return Dashboard
        </LootButton>
        <LootButton
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<ShieldAlert size={16} />}
          onClick={() => navigate("support")}
        >
          Contact Support
        </LootButton>
        <LootButton
          variant="electric"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight size={16} />}
          onClick={onContinue}
        >
          Administrator Login
        </LootButton>
      </motion.div>

      <motion.div
        variants={slideUp}
        className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-center gap-2"
      >
        <SecurityBadge label="SOC 2 Aligned" tone="emerald" icon={<Check size={10} />} />
        <SecurityBadge label="ISO 27001" tone="navy" icon={<Check size={10} />} />
        <SecurityBadge label="Audit Logged" tone="purple" icon={<History size={10} />} />
        <SecurityBadge label="Zero-Trust" tone="cyan" icon={<Network size={10} />} />
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   STEP 2 — CEO Login Form
   ============================================================ */
function CeoLoginForm({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const navigate = useNavigationStore((s) => s.navigate);
  const [ceoId, setCeoId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const futureAuthMethods = [
    { label: "2FA", icon: <Smartphone size={14} /> },
    { label: "Security Key", icon: <KeySquare size={14} /> },
    { label: "Passkey", icon: <ScanFace size={14} /> },
    { label: "Trusted Device", icon: <HardDrive size={14} /> },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <motion.div variants={slideUp} className="flex justify-center">
        <SecurityBadge
          label="Administrator Credentials"
          icon={<UserCog size={11} />}
          tone="navy"
        />
      </motion.div>

      <motion.div variants={slideUp} className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Secure Administrator Login
        </h2>
        <p className="text-xs text-muted-foreground">
          Enter your CEO administration credentials to continue.
        </p>
      </motion.div>

      {/* CEO ID input */}
      <motion.div variants={slideUp} className="space-y-1.5">
        <label
          htmlFor="ceo-id"
          className="text-xs font-semibold text-foreground/70 tracking-wide"
        >
          CEO Administrator ID
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy">
            <UserCog size={16} />
          </span>
          <input
            id="ceo-id"
            name="ceo-id"
            type="text"
            placeholder="CEO-XXXX-XXXX"
            value={ceoId}
            onChange={(e) => setCeoId(e.target.value)}
            autoComplete="off"
            className={cn(INPUT_CLASS, "pl-11 font-mono tracking-wider")}
          />
        </div>
      </motion.div>

      {/* Password input with eye toggle */}
      <motion.div variants={slideUp} className="space-y-1.5">
        <label
          htmlFor="ceo-pw"
          className="text-xs font-semibold text-foreground/70 tracking-wide"
        >
          Administrator Password
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy">
            <LockKeyhole size={16} />
          </span>
          <input
            id="ceo-pw"
            name="ceo-pw"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            className={cn(INPUT_CLASS, "pl-11 pr-12")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </motion.div>

      {/* Remember device checkbox */}
      <motion.div variants={slideUp} className="flex items-center gap-2.5">
        <Checkbox
          id="remember-device"
          checked={remember}
          onCheckedChange={(v) => setRemember(v === true)}
        />
        <label
          htmlFor="remember-device"
          className="text-xs text-muted-foreground select-none cursor-pointer"
        >
          Remember this device for future sessions{" "}
          <span className="text-[10px] text-muted-foreground/70">(placeholder)</span>
        </label>
      </motion.div>

      {/* Action buttons */}
      <motion.div variants={slideUp} className="space-y-2.5">
        <LootButton
          variant="electric"
          size="lg"
          fullWidth
          leftIcon={<ShieldCheck size={16} />}
          onClick={onContinue}
        >
          Secure Login
        </LootButton>
        <div className="grid grid-cols-2 gap-2.5">
          <LootButton
            variant="ghost"
            size="md"
            fullWidth
            leftIcon={<X size={14} />}
            onClick={() => navigate("dashboard")}
          >
            Cancel
          </LootButton>
          <LootButton
            variant="outline"
            size="md"
            fullWidth
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate("dashboard")}
          >
            Return User Dashboard
          </LootButton>
        </div>
      </motion.div>

      {/* Future auth methods (disabled) */}
      <motion.div
        variants={slideUp}
        className="pt-4 border-t border-border/60 space-y-2"
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Future Authentication Methods
        </p>
        <div className="grid grid-cols-4 gap-2">
          {futureAuthMethods.map((m) => (
            <button
              key={m.label}
              disabled
              className="rounded-xl ring-1 ring-border bg-muted/30 px-2 py-2.5 flex flex-col items-center gap-1.5 opacity-50 cursor-not-allowed"
            >
              <span className="text-muted-foreground">{m.icon}</span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {m.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/70 text-center">
          These methods are placeholders — not yet implemented.
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   STEP 3 — Multi-Step Authentication Timeline
   ============================================================ */
function AuthTimelineStep({
  currentStep,
  onAdvance,
  onBack,
}: {
  currentStep: number;
  onAdvance: () => void;
  onBack: () => void;
}) {
  const navigate = useNavigationStore((s) => s.navigate);
  const setRole = useAuthStore((s) => s.setRole);

  const steps = [
    { title: "CEO Identity", subtitle: "Administrator ID verified", icon: <UserCog size={14} /> },
    { title: "Password", subtitle: "Credentials accepted", icon: <LockKeyhole size={14} /> },
    { title: "Future OTP", subtitle: "One-time passcode (placeholder)", icon: <Smartphone size={14} />, future: true },
    { title: "Future Device Verification", subtitle: "Trusted device check (placeholder)", icon: <Monitor size={14} />, future: true },
    { title: "Future Trusted Device", subtitle: "Device attestation (placeholder)", icon: <HardDrive size={14} />, future: true },
    { title: "Future Session Validation", subtitle: "Session integrity (placeholder)", icon: <Activity size={14} />, future: true },
    { title: "Future Risk Analysis", subtitle: "Behavioral scoring (placeholder)", icon: <Radar size={14} />, future: true },
    { title: "CEO Dashboard", subtitle: "Enter administration platform", icon: <Crown size={14} /> },
  ];

  // Active non-future steps: 0 (identity), 1 (password), then 2-6 are future, 7 is dashboard.
  // We treat "current step" as the index up to which steps are completed.
  // The dashboard step becomes "active" when currentStep reaches 7 (the final step).
  const isFinal = currentStep >= 2;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <motion.div variants={slideUp} className="flex justify-center">
        <SecurityBadge
          label="Authentication In Progress"
          icon={<Activity size={11} />}
          tone="electric"
        />
      </motion.div>

      <motion.div variants={slideUp} className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Multi-Step Verification
        </h2>
        <p className="text-xs text-muted-foreground">
          Step {Math.min(currentStep + 1, steps.length)} of {steps.length} —{" "}
          {steps[Math.min(currentStep, steps.length - 1)].title}
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={slideUp} className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
          <span>Progress</span>
          <span className="tabular-nums text-navy">
            {Math.round((Math.min(currentStep, steps.length) / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(Math.min(currentStep, steps.length) / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--navy),var(--electric))]"
          />
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={slideUp}>
        <AuthenticationTimeline currentStep={currentStep} steps={steps} />
      </motion.div>

      {/* Action area */}
      <motion.div variants={slideUp} className="pt-2 space-y-2.5">
        <AnimatePresence mode="wait">
          {isFinal ? (
            <motion.div
              key="enter"
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <LootButton
                variant="electric"
                size="lg"
                fullWidth
                leftIcon={<Crown size={16} />}
                rightIcon={<ArrowRight size={16} />}
                onClick={() => { setRole("ceo"); navigate("ceo-dashboard"); }}
              >
                Enter CEO Dashboard
              </LootButton>
            </motion.div>
          ) : (
            <motion.div
              key="continue"
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <LootButton
                variant="electric"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight size={16} />}
                onClick={onAdvance}
              >
                Continue Verification
              </LootButton>
            </motion.div>
          )}
        </AnimatePresence>

        <LootButton
          variant="ghost"
          size="md"
          fullWidth
          leftIcon={<ArrowLeft size={14} />}
          onClick={onBack}
        >
          Back to Login
        </LootButton>
      </motion.div>

      <motion.p
        variants={slideUp}
        className="text-[10px] text-muted-foreground/70 text-center pt-2"
      >
        Future verification steps are placeholders — clicking Continue advances the
        UI but does not perform real authentication.
      </motion.p>
    </motion.div>
  );
}

/* ============================================================
   Static data — security panels + session fields
   ============================================================ */
const SECURITY_PANELS: SecurityPanelDef[] = [
  {
    id: "encryption",
    title: "Encryption Status",
    description: "AES-256-GCM end-to-end encryption active on this session.",
    icon: <Lock size={18} />,
    accent: "emerald",
    status: "active",
    statusLabel: "Active",
  },
  {
    id: "connection",
    title: "Secure Connection",
    description: "TLS 1.3 with certificate pinning enforced.",
    icon: <Globe2 size={18} />,
    accent: "cyan",
    status: "active",
    statusLabel: "Active",
  },
  {
    id: "session",
    title: "Session Protection",
    description: "Real-time session integrity monitoring enabled.",
    icon: <ShieldCheck size={18} />,
    accent: "navy",
    status: "active",
    statusLabel: "Active",
  },
  {
    id: "fingerprint",
    title: "Future Device Fingerprint",
    description: "Hardware attestation will bind session to this device.",
    icon: <Fingerprint size={18} />,
    accent: "purple",
    status: "future",
    statusLabel: "Future",
  },
  {
    id: "login-history",
    title: "Future Login History",
    description: "Chronological administrator access audit trail.",
    icon: <History size={18} />,
    accent: "gold",
    status: "future",
    statusLabel: "Future",
  },
  {
    id: "trusted-devices",
    title: "Future Trusted Devices",
    description: "Registered devices permitted to access CEO platform.",
    icon: <HardDrive size={18} />,
    accent: "electric",
    status: "future",
    statusLabel: "Future",
  },
  {
    id: "security-alerts",
    title: "Future Security Alerts",
    description: "Anomalies flagged by behavioral risk engine.",
    icon: <Bell size={18} />,
    accent: "rose",
    status: "future",
    statusLabel: "Future",
  },
];

const SESSION_FIELDS: SessionFieldDef[] = [
  { label: "Administrator Identity", value: "Platform Owner (Verified)", icon: <UserCog size={13} /> },
  { label: "Session Started", value: "—", icon: <Clock size={13} /> },
  { label: "Last Activity", value: "Awaiting authentication", icon: <Activity size={13} /> },
  { label: "Session Timeout", value: "15 minutes (planned)", icon: <Timer size={13} /> },
  { label: "Future Device", value: "Not registered", icon: <Monitor size={13} />, future: true },
  { label: "Future Location", value: "Not resolved", icon: <MapPin size={13} />, future: true },
  { label: "Future IP Address", value: "Not logged", icon: <Globe size={13} />, future: true },
  { label: "Future Browser", value: "Not fingerprinted", icon: <Server size={13} />, future: true },
  { label: "Future Recovery", value: "Not configured", icon: <RefreshCw size={13} />, future: true },
];

const PERMISSIONS = [
  { label: "View All Users", icon: <Users size={14} />, scope: "ceo:users:read", granted: true },
  { label: "Manage Rewards", icon: <Gift size={14} />, scope: "ceo:rewards:write", granted: true },
  { label: "Audit Transactions", icon: <Activity size={14} />, scope: "ceo:audit:read", granted: true },
  { label: "Broadcast Notices", icon: <Bell size={14} />, scope: "ceo:notices:write", granted: false },
  { label: "Modify Platform Config", icon: <Building2 size={14} />, scope: "ceo:config:write", granted: false },
  { label: "Delete User Accounts", icon: <Ban size={14} />, scope: "ceo:users:delete", granted: false },
];

/* ============================================================
   LEFT panel — illustration + security panels + session
   ============================================================ */
function LeftPanel({
  onSimulateWarning,
}: {
  onSimulateWarning: () => void;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Illustration */}
      <motion.div variants={slideUp}>
        <GlassCard level={2} sheen className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <SecurityBadge
              label="Security Gateway"
              icon={<ShieldHalf size={11} />}
              tone="navy"
            />
            <SecurityBadge label="Private" icon={<Lock size={10} />} tone="rose" />
          </div>
          <SecurityIllustration />
        </GlassCard>
      </motion.div>

      {/* Security banner */}
      <motion.div variants={slideUp}>
        <SecurityBanner
          tone="navy"
          icon={<ShieldCheck size={16} className="text-navy" />}
          title="Zero-Trust Architecture"
          message="Every administrator action requires explicit verification. Sessions are isolated, encrypted, and audit-logged."
        />
      </motion.div>

      {/* Security panels grid */}
      <motion.div variants={slideUp}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck size={15} className="text-navy" />
            Security Panels
          </h3>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {SECURITY_PANELS.filter((p) => p.status === "active").length} active /{" "}
            {SECURITY_PANELS.length} total
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECURITY_PANELS.map((p) => (
            <SecurityCard
              key={p.id}
              title={p.title}
              description={p.description}
              icon={p.icon}
              accent={p.accent}
              status={p.status}
              statusLabel={p.statusLabel}
            />
          ))}
          {/* Risk score panel — uses ProgressRing */}
          <SecurityCard
            title="Future Risk Score"
            description="Behavioral risk analysis score for this session."
            icon={<Radar size={18} />}
            accent="rose"
            status="future"
            statusLabel="Future"
            className="sm:col-span-2"
          >
            <div className="flex items-center justify-center py-2">
              <RiskIndicator value={18} label="Future Risk Score" size={96} />
            </div>
          </SecurityCard>
        </div>
      </motion.div>

      {/* Trust badges */}
      <motion.div variants={slideUp} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <TrustBadge
          title="Platform Owner"
          subtitle="Verified administrator entity"
          icon={<Crown size={18} className="text-amber-500" />}
          level="Verified"
        />
        <TrustBadge
          title="Audit Trail"
          subtitle="Immutable session log"
          icon={<History size={18} />}
          level="Active"
        />
      </motion.div>

      {/* Simulate warning button */}
      <motion.div variants={slideUp}>
        <GlassCard level={2} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-rose-brand/10 text-rose-brand ring-1 ring-rose-brand/20 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Security Warning Simulator
              </p>
              <p className="text-xs text-muted-foreground">
                Preview the unauthorized access warning dialog.
              </p>
            </div>
          </div>
          <LootButton
            variant="destructive"
            size="sm"
            leftIcon={<ShieldAlert size={14} />}
            onClick={onSimulateWarning}
          >
            Simulate Warning
          </LootButton>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   CEO Session Placeholder panel (left side, below panels)
   ============================================================ */
function CeoSessionPlaceholder() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {/* Administrator identity + avatar */}
      <motion.div variants={slideUp}>
        <GlassCard level={2} sheen className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <AdministratorAvatar size={64} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Administrator Identity
                </h3>
                <StatusBadge variant="info" dot pulse>
                  Verified
                </StatusBadge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chief Executive Officer · Platform Owner
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
                Session ID: CEO-SESSION-PENDING
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Session fields grid */}
      <motion.div variants={slideUp}>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Activity size={15} className="text-electric" />
          Session Architecture (Placeholder)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SESSION_FIELDS.map((f) => (
            <div
              key={f.label}
              className={cn(
                "rounded-xl ring-1 p-3 flex items-center gap-3",
                f.future
                  ? "ring-dashed ring-border bg-muted/20 opacity-70"
                  : "ring-border glass-2"
              )}
            >
              <div className="size-8 rounded-lg bg-background/60 ring-1 ring-border flex items-center justify-center text-muted-foreground shrink-0">
                {f.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </p>
                <p className="text-xs font-mono text-foreground truncate">{f.value}</p>
              </div>
              {f.future && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 shrink-0">
                  Future
                </span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Permissions */}
      <motion.div variants={slideUp}>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <KeySquare size={15} className="text-purple-brand" />
          Administrator Permissions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PERMISSIONS.map((p) => (
            <PermissionCard
              key={p.scope}
              label={p.label}
              icon={p.icon}
              scope={p.scope}
              granted={p.granted}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   Main CeoAuthView
   ============================================================ */
export function CeoAuthView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const setRole = useAuthStore((s) => s.setRole);
  const [step, setStep] = useState<AuthStep>("gateway");
  const [timelineStep, setTimelineStep] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);

  // Scroll to top whenever step changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const handleGatewayContinue = () => {
    setStep("login");
  };

  const handleLoginContinue = () => {
    setStep("timeline");
    setTimelineStep(0);
  };

  const handleTimelineAdvance = () => {
    setTimelineStep((s) => Math.min(s + 1, 7));
  };

  const handleTimelineBack = () => {
    setStep("login");
  };

  const handleSimulateWarning = () => {
    setWarningOpen(true);
  };

  const stepHeader = useMemo(() => {
    if (step === "gateway") {
      return { title: "CEO Security Gateway", sub: "Authorized administration access only" };
    }
    if (step === "login") {
      return { title: "Administrator Login", sub: "Step 1 of 3 — Credentials" };
    }
    return { title: "Multi-Step Verification", sub: "Step 2 of 3 — Authentication timeline" };
  }, [step]);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative min-h-screen w-full flex flex-col"
    >
      {/* Top-left floating Logo → home */}
      <motion.button
        onClick={() => navigate("home")}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="absolute top-5 left-5 sm:top-6 sm:left-6 z-50 inline-flex items-center gap-2 rounded-full glass-2 ring-1 ring-border px-3 py-1.5"
        aria-label="Back to home"
      >
        <Logo size="sm" />
      </motion.button>

      {/* Top-right floating security badges */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="absolute top-5 right-5 sm:top-6 sm:right-6 z-50 hidden sm:flex items-center gap-2"
      >
        <EncryptedSessionBadge />
        <button
          onClick={() => navigate("support")}
          className="inline-flex items-center gap-1.5 rounded-full glass-2 ring-1 ring-border px-3 py-1.5 text-[10px] font-semibold text-foreground hover:bg-accent transition-colors"
        >
          <ShieldAlert size={11} className="text-rose-brand" />
          Security Help
        </button>
      </motion.div>

      {/* Main content — centered workspace */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-16 lg:py-12">
        <div className="w-full max-w-7xl grid lg:grid-cols-[1.05fr_minmax(420px,520px)] gap-6 lg:gap-10 items-start">
          {/* LEFT — illustration + security panels + session placeholder */}
          <div className="hidden lg:block space-y-6">
            <LeftPanel onSimulateWarning={handleSimulateWarning} />
            <CeoSessionPlaceholder />
          </div>

          {/* RIGHT — step content (animated swap) */}
          <div className="lg:sticky lg:top-12">
            <GlassCard
              level={3}
              sheen
              reflect
              className="p-6 sm:p-8 shadow-[var(--shadow-xl)] relative overflow-hidden"
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(90deg,var(--navy),var(--electric),var(--cyan-brand))]" />

              {/* Step header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy">
                    {stepHeader.sub}
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
                    {stepHeader.title}
                  </h2>
                </div>
                {/* Mini step indicator */}
                <div className="flex items-center gap-1.5">
                  {(["gateway", "login", "timeline"] as AuthStep[]).map((s, i) => (
                    <div
                      key={s}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        step === s
                          ? "w-6 bg-gradient-to-r from-navy to-electric"
                          : "w-1.5 bg-muted"
                      )}
                      aria-label={`Step ${i + 1}: ${s}`}
                    />
                  ))}
                </div>
              </div>

              {/* Animated step swap */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={fade}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {step === "gateway" && <GatewayHero onContinue={handleGatewayContinue} />}
                  {step === "login" && <CeoLoginForm onContinue={handleLoginContinue} />}
                  {step === "timeline" && (
                    <AuthTimelineStep
                      currentStep={timelineStep}
                      onAdvance={handleTimelineAdvance}
                      onBack={handleTimelineBack}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </GlassCard>

            {/* Mobile-only: stacked security panels below the form */}
            <div className="lg:hidden mt-6 space-y-5">
              <LeftPanel onSimulateWarning={handleSimulateWarning} />
              <CeoSessionPlaceholder />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom security footer */}
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="border-t border-border/60 mt-auto"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Cctv size={12} className="text-rose-brand" />
            All access attempts are recorded. Unauthorized access is prohibited.
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <SecurityBadge label="SOC 2" tone="emerald" icon={<Check size={10} />} />
            <SecurityBadge label="ISO 27001" tone="navy" icon={<Check size={10} />} />
            <SecurityBadge label="Audit Logged" tone="purple" icon={<History size={10} />} />
            <SecurityBadge label="Zero-Trust" tone="cyan" icon={<Network size={10} />} />
          </div>
        </div>
      </motion.footer>

      {/* Security warning dialog */}
      <SecurityWarningDialog
        open={warningOpen}
        onOpenChange={setWarningOpen}
        warningId="unauthorized"
      />
    </motion.div>
  );
}
