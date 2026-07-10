"use client";

/**
 * LootLoom — SystemView
 * Renders full-screen system and error pages based on `useNavigationStore().current`.
 * Pages: ceo-restricted, session-expired, unauthorized, maintenance,
 *        error-403, error-404, error-500, offline, update-required, auth-loading.
 *
 * Each (except ceo-restricted) is composed from a shared <SystemScreen> component
 * rendered inside a premium centered GlassCard.
 */

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import {
  GlassCard,
  LootButton,
  Logo,
  PageContainer,
  RestrictedAccess,
} from "@/components/lootloom";
import { useNavigationStore } from "@/stores";
import { cn } from "@/lib/utils";

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

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

const ACCENT_BAR: Record<Accent, string> = {
  electric: "bg-[linear-gradient(90deg,var(--rose-brand),var(--purple-brand),var(--electric))]",
  cyan: "bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand),var(--emerald-brand))]",
  purple: "bg-[linear-gradient(90deg,var(--electric),var(--purple-brand),var(--rose-brand))]",
  gold: "bg-[linear-gradient(90deg,var(--gold),var(--electric),var(--purple-brand))]",
  emerald: "bg-[linear-gradient(90deg,var(--emerald-brand),var(--cyan-brand),var(--electric))]",
  rose: "bg-[linear-gradient(90deg,var(--rose-brand),var(--purple-brand),var(--electric))]",
  navy: "bg-[linear-gradient(90deg,var(--navy),var(--electric),var(--purple-brand))]",
};

/* ============================================================
   SystemScreen — reusable premium full-screen shell
   ============================================================ */

interface SystemScreenProps {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
  accent?: Accent;
  footer?: ReactNode;
  /** optional extra content under description (e.g. progress bar) */
  extra?: ReactNode;
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
}: SystemScreenProps) {
  return (
    <PageContainer className="min-h-screen flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98, transition: { duration: 0.22 } }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl"
      >
        <GlassCard level={3} sheen reflect className="overflow-hidden ring-1 ring-border/60 shadow-[var(--shadow-xl)]">
          {/* Top accent bar */}
          <div className={cn("h-1.5 w-full", ACCENT_BAR[accent])} />

          <div className="p-8 sm:p-10 flex flex-col items-center text-center">
            {/* Icon with glow */}
            <div className="relative mb-6">
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

            {subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 mb-4",
                  ACCENT_BG[accent],
                  ACCENT_TEXT[accent],
                  ACCENT_RING[accent]
                )}
              >
                {subtitle}
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.45 }}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
            >
              {title}
            </motion.h1>

            {description && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.45 }}
                className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mt-3"
              >
                {description}
              </motion.p>
            )}

            {extra && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.45 }}
                className="w-full max-w-sm mt-6"
              >
                {extra}
              </motion.div>
            )}

            {actions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46, duration: 0.45 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
              >
                {actions}
              </motion.div>
            )}

            {footer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
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
   Individual system screens
   ============================================================ */

function SessionExpiredScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemScreen
      accent="rose"
      icon={<Icons.Clock size={40} strokeWidth={2.2} />}
      subtitle="Session Timeout"
      title="Session Expired"
      description="Your session has expired for security reasons. Please sign in again to continue."
      actions={
        <>
          <LootButton
            variant="electric"
            size="lg"
            leftIcon={<Icons.LogIn size={18} />}
            onClick={() => navigate("login")}
          >
            Sign In Again
          </LootButton>
          <LootButton
            variant="glass"
            size="lg"
            leftIcon={<Icons.Home size={18} />}
            onClick={() => navigate("home")}
          >
            Return Home
          </LootButton>
        </>
      }
      footer={
        <>
          <Icons.ShieldCheck size={13} className="text-emerald-brand" />
          <span>Session secured • Access logged</span>
        </>
      }
    />
  );
}

function UnauthorizedScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const goBack = useNavigationStore((s) => s.goBack);
  const canGoBack = useNavigationStore((s) => s.canGoBack());
  return (
    <SystemScreen
      accent="rose"
      icon={<Icons.ShieldAlert size={40} strokeWidth={2.2} />}
      subtitle="Permission Denied"
      title="Access Denied"
      description="You don't have permission to access this area. If you believe this is a mistake, please contact support."
      actions={
        <>
          <LootButton
            variant="electric"
            size="lg"
            leftIcon={<Icons.Home size={18} />}
            onClick={() => navigate("home")}
          >
            Return Home
          </LootButton>
          <LootButton
            variant="glass"
            size="lg"
            leftIcon={<Icons.ArrowLeft size={18} />}
            onClick={() => (canGoBack ? goBack() : navigate("home"))}
          >
            Go Back
          </LootButton>
        </>
      }
      footer={
        <>
          <Icons.LockKeyhole size={13} className="text-rose-brand" />
          <span>Protected resource • Insufficient permissions</span>
        </>
      }
    />
  );
}

function MaintenanceScreen() {
  return (
    <SystemScreen
      accent="gold"
      icon={
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ display: "inline-flex" }}
        >
          <Icons.Wrench size={40} strokeWidth={2.2} />
        </motion.span>
      }
      subtitle="Scheduled Downtime"
      title="Under Maintenance"
      description="We're making LootLoom even better. We'll be back shortly with new features and improvements."
      extra={
        <div className="w-full">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Estimated progress</span>
            <span className="font-semibold text-foreground">68%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "68%" }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="h-full bg-[linear-gradient(90deg,var(--gold),var(--electric))]"
            />
          </div>
        </div>
      }
      actions={
        <>
          <LootButton
            variant="glass"
            size="lg"
            leftIcon={<Icons.Twitter size={18} />}
          >
            Status Updates
          </LootButton>
          <LootButton
            variant="outline"
            size="lg"
            leftIcon={<Icons.Globe size={18} />}
          >
            Status Page
          </LootButton>
        </>
      }
      footer={
        <>
          <Icons.Hammer size={13} className="text-gold" />
          <span>Estimated completion: 30 minutes</span>
        </>
      }
    />
  );
}

function Error403Screen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const goBack = useNavigationStore((s) => s.goBack);
  const canGoBack = useNavigationStore((s) => s.canGoBack());
  return (
    <SystemScreen
      accent="rose"
      icon={<Icons.Lock size={40} strokeWidth={2.2} />}
      subtitle="HTTP 403"
      title={
        <span className="text-gradient-electric font-extrabold tracking-tight" style={{ fontSize: "4rem", lineHeight: 1 }}>
          403
        </span>
      }
      description="You don't have access to this resource. The server understood the request but refuses to authorize it."
      actions={
        <>
          <LootButton
            variant="electric"
            size="lg"
            leftIcon={<Icons.Home size={18} />}
            onClick={() => navigate("home")}
          >
            Return Home
          </LootButton>
          <LootButton
            variant="glass"
            size="lg"
            leftIcon={<Icons.ArrowLeft size={18} />}
            onClick={() => (canGoBack ? goBack() : navigate("home"))}
          >
            Go Back
          </LootButton>
        </>
      }
      footer={
        <>
          <Icons.Ban size={13} className="text-rose-brand" />
          <span>Forbidden • Access restricted</span>
        </>
      }
    />
  );
}

function Error404Screen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemScreen
      accent="purple"
      icon={<Icons.Compass size={40} strokeWidth={2.2} />}
      subtitle="HTTP 404"
      title={
        <span className="text-gradient-electric font-extrabold tracking-tight" style={{ fontSize: "4rem", lineHeight: 1 }}>
          404
        </span>
      }
      description="The page you're looking for doesn't exist or has been moved. Let's get you back on track."
      actions={
        <>
          <LootButton
            variant="electric"
            size="lg"
            leftIcon={<Icons.Home size={18} />}
            onClick={() => navigate("home")}
          >
            Return Home
          </LootButton>
          <LootButton
            variant="glass"
            size="lg"
            leftIcon={<Icons.LayoutDashboard size={18} />}
            onClick={() => navigate("dashboard")}
          >
            Dashboard
          </LootButton>
        </>
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

function Error500Screen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <SystemScreen
      accent="rose"
      icon={<Icons.ServerCrash size={40} strokeWidth={2.2} />}
      subtitle="HTTP 500"
      title={
        <span className="text-gradient-electric font-extrabold tracking-tight" style={{ fontSize: "4rem", lineHeight: 1 }}>
          500
        </span>
      }
      description="Something went wrong on our end. We're already on it — our team has been notified. Please try again in a moment."
      actions={
        <>
          <LootButton
            variant="electric"
            size="lg"
            leftIcon={<Icons.RefreshCw size={18} />}
            onClick={() => typeof window !== "undefined" && window.location.reload()}
          >
            Retry
          </LootButton>
          <LootButton
            variant="glass"
            size="lg"
            leftIcon={<Icons.Home size={18} />}
            onClick={() => navigate("home")}
          >
            Return Home
          </LootButton>
        </>
      }
      footer={
        <>
          <Icons.LifeBuoy size={13} className="text-rose-brand" />
          <span>Incident reported • Team notified</span>
        </>
      }
    />
  );
}

function OfflineScreen() {
  return (
    <SystemScreen
      accent="gold"
      icon={<Icons.WifiOff size={40} strokeWidth={2.2} />}
      subtitle="No Connection"
      title="You're Offline"
      description="Check your internet connection and try again. Some features may be unavailable while offline."
      actions={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.RefreshCw size={18} />}
          onClick={() => typeof window !== "undefined" && window.location.reload()}
        >
          Retry Connection
        </LootButton>
      }
      footer={
        <>
          <Icons.Wifi size={13} className="text-gold" />
          <span>Waiting for network…</span>
        </>
      }
    />
  );
}

function UpdateRequiredScreen() {
  return (
    <SystemScreen
      accent="emerald"
      icon={
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          style={{ display: "inline-flex" }}
        >
          <Icons.RefreshCw size={40} strokeWidth={2.2} />
        </motion.span>
      }
      subtitle="New Version Available"
      title="Update Required"
      description="A new version of LootLoom is available. Please update to continue enjoying the latest features and improvements."
      actions={
        <LootButton
          variant="electric"
          size="lg"
          leftIcon={<Icons.DownloadCloud size={18} />}
          onClick={() => typeof window !== "undefined" && window.location.reload()}
        >
          Update Now
        </LootButton>
      }
      footer={
        <>
          <Icons.Sparkles size={13} className="text-emerald-brand" />
          <span>Version 2.4.0 • Fresh from the loom</span>
        </>
      }
    />
  );
}

function AuthLoadingScreen() {
  const navigate = useNavigationStore((s) => s.navigate);

  useEffect(() => {
    const t = setTimeout(() => navigate("dashboard"), 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <PageContainer className="min-h-screen flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <GlassCard level={3} sheen reflect className="overflow-hidden ring-1 ring-border/60 shadow-[var(--shadow-xl)]">
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand),var(--purple-brand))]" />

          <div className="p-10 flex flex-col items-center text-center">
            {/* Animated Logo */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-8"
            >
              <Logo size="lg" animated />
            </motion.div>

            {/* Spinner rings */}
            <div className="relative size-16 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[3px] border-electric/15"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-electric"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-[2px] border-transparent border-r-cyan-brand"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="size-2.5 rounded-full bg-gradient-to-br from-electric to-purple-brand"
                />
              </div>
            </div>

            <motion.p
              animate={{ y: [0, -3, 0], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-base font-semibold text-foreground"
            >
              Securing your session…
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xs text-muted-foreground mt-2"
            >
              Verifying credentials · Encrypting connection
            </motion.p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mt-6">
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
        </GlassCard>
      </motion.div>
    </PageContainer>
  );
}

/* ============================================================
   SystemView — main router
   ============================================================ */

const SYSTEM_SCREENS: Record<string, () => ReactNode> = {
  "session-expired": SessionExpiredScreen,
  unauthorized: UnauthorizedScreen,
  maintenance: MaintenanceScreen,
  "error-403": Error403Screen,
  "error-404": Error404Screen,
  "error-500": Error500Screen,
  offline: OfflineScreen,
  "update-required": UpdateRequiredScreen,
  "auth-loading": AuthLoadingScreen,
};

export function SystemView() {
  const current = useNavigationStore((s) => s.current);

  // ceo-restricted renders the dedicated RestrictedAccess component
  if (current === "ceo-restricted") {
    return <RestrictedAccess />;
  }

  const Screen = SYSTEM_SCREENS[current];

  // Defensive: if no screen matches, fall through to 404
  if (!Screen) {
    return <Error404Screen />;
  }

  return (
    <AnimatePresence mode="wait">
      <Screen key={current} />
    </AnimatePresence>
  );
}
