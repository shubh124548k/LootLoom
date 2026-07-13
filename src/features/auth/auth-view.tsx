"use client";

/**
 * LootLoom — AuthView
 * Renders ALL authentication screens based on `useNavigationStore().current`.
 *
 * Screens handled:
 *   login, auth-loading, session-expired, unauthorized
 *
 * Layout: split on lg+ — LEFT = AuthPreview with floating glass widgets
 * (decorative marketing visuals, NO real user data), RIGHT = auth form in
 * GlassCard. Mobile: single column with form only.
 *
 * Auth wiring:
 *   - Google: signIn("google", { callbackUrl: window.location.origin + "/" })
 *   - Sign-out (session-expired): useAuthStore.logout() + navigate("login")
 *
 * BackgroundEngine is global and intentionally NOT rendered here.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  LockKeyhole,
  ShieldAlert,
  Sparkles,
  Bell,
  AlertCircle,
} from "lucide-react";
import {
  GlassCard,
  LootButton,
  Logo,
  IconBadge,
  StatusBadge,
  AnimatedCounter,
} from "@/components/lootloom";
import {
  FormButton,
  GoogleButton,
} from "@/components/auth";
import { useNavigationStore, useAuthStore } from "@/stores";
import { signIn } from "next-auth/react";
import {
  pageTransition,
  slideUp,
  floating,
  staggerContainer,
  modalPop,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   ServerErrorBanner — form-level red glass card
   ============================================================ */
function ServerErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -4, height: 0 }}
      className="rounded-xl glass-2 ring-1 ring-rose-brand/30 bg-rose-brand/10 p-3 flex items-start gap-2.5"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle size={16} className="text-rose-brand shrink-0 mt-0.5" />
      <p className="text-xs text-rose-brand font-medium leading-relaxed">
        {message}
      </p>
    </motion.div>
  );
}

/* ============================================================
   AuthHeader — title + subtitle + optional icon badge
   ============================================================ */
function AuthHeader({
  icon,
  title,
  subtitle,
  badge,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {icon && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.05 }}
          className="inline-flex"
        >
          {icon}
        </motion.div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {badge}
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   AuthPreview — animated LEFT side of split layout
   Floating glass widgets showing app preview (DECORATIVE marketing
   visuals — NO real user data, all counters at 0 / neutral placeholders).
   ============================================================ */
function AuthPreview() {
  const widgets = [
    {
      // Balance card — top
      id: "balance",
      className: "w-[260px] top-[6%] left-[8%]",
      delay: 0,
      content: (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBadge name="Wallet" accent="electric" size="sm" />
              <span className="text-xs font-semibold text-muted-foreground">
                Available Balance
              </span>
            </div>
            <StatusBadge variant="success" dot pulse>
              Live
            </StatusBadge>
          </div>
          <div className="mt-3 flex items-end gap-1.5">
            <AnimatedCounter
              value={0}
              className="text-3xl font-bold tracking-tight text-foreground"
            />
            <span className="text-xs font-semibold text-muted-foreground mb-1">
              coins
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
            <ArrowRight size={11} className="rotate-[-45deg]" />
            Earn as you go
          </div>
        </>
      ),
    },
    {
      // Daily bonus card — middle left
      id: "daily",
      className: "w-[210px] top-[42%] left-[2%]",
      delay: 0.6,
      content: (
        <>
          <div className="flex items-center gap-2">
            <IconBadge name="CalendarCheck" accent="gold" size="sm" />
            <span className="text-xs font-semibold text-foreground">Daily Bonus</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            <AnimatedCounter value={0} /> coins
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-gold/15 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "0%" }}
              transition={{ duration: 1.2, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-gold to-amber-300"
            />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Claim every day
          </p>
        </>
      ),
    },
    {
      // Rewards card — middle right
      id: "rewards",
      className: "w-[200px] top-[10%] right-[4%]",
      delay: 0.3,
      content: (
        <>
          <div className="flex items-center gap-2">
            <IconBadge name="Gift" accent="purple" size="sm" />
            <span className="text-xs font-semibold text-foreground">Rewards</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {["UPI Cashout", "Daily Bonus", "Streak Rewards"].map((r) => (
              <div
                key={r}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="text-muted-foreground">{r}</span>
                <span className="font-semibold text-purple-brand">•••</span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      // Streak card — bottom right
      id: "streak",
      className: "w-[170px] bottom-[8%] right-[6%]",
      delay: 0.9,
      content: (
        <div className="flex flex-col items-center text-center">
          <IconBadge name="Flame" accent="rose" size="lg" />
          <div className="mt-2 text-2xl font-bold text-foreground">
            <AnimatedCounter value={0} /> days
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">
            Active Streak
          </p>
        </div>
      ),
    },
    {
      // Notification toast — bottom left
      id: "notif",
      className: "w-[230px] bottom-[10%] left-[6%]",
      delay: 1.2,
      content: (
        <>
          <div className="flex items-start gap-2">
            <span className="relative inline-flex">
              <span className="inline-flex size-2 rounded-full bg-emerald-brand" />
              <span className="absolute inline-flex size-2 rounded-full opacity-75 animate-ping bg-emerald-brand" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground">
                Stay on track
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                Mission updates appear here
              </p>
            </div>
            <Bell size={12} className="text-electric" />
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="relative h-full w-full perspective-1000 hidden lg:block">
      {/* Subtle gradient backdrop inside preview */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 mesh-bg opacity-60" />
        <div className="absolute -top-20 -left-20 size-72 rounded-full bg-electric/15 blur-3xl aurora-drift" />
        <div className="absolute -bottom-24 -right-16 size-80 rounded-full bg-purple-brand/15 blur-3xl aurora-drift-alt" />
      </div>

      {/* Headline overlay */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 px-8 w-full max-w-md"
      >
        <StatusBadge variant="electric" dot pulse className="mb-4">
          Premium Rewards Platform
        </StatusBadge>
        <h2 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
          Your rewards journey
          <br />
          <span className="text-gradient-electric">starts here.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Earn coins, complete missions, redeem real rewards — all in one
          beautifully crafted experience.
        </p>
      </motion.div>

      {/* Floating widgets */}
      {widgets.map((w) => (
        <motion.div
          key={w.id}
          variants={floating}
          initial="initial"
          animate="animate"
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: w.delay,
          }}
          className={cn("absolute z-20", w.className)}
        >
          <GlassCard level={3} sheen className="p-4 shadow-[var(--shadow-lg)]">
            {w.content}
          </GlassCard>
        </motion.div>
      ))}

      {/* Sparkles accent */}
      <motion.div
        variants={floating}
        animate="animate"
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-[35%] left-[42%] z-10"
      >
        <Sparkles size={20} className="text-gold/70" />
      </motion.div>
    </div>
  );
}

/* ============================================================
   AuthShell — common wrapper for all auth screens
   ============================================================ */
function AuthShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      {/* Top-left floating Logo */}
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

      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
      >
        {/* LEFT: preview (desktop only) */}
        <div className="hidden lg:block h-[640px] relative">
          <AuthPreview />
        </div>
        {/* RIGHT: form */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
        >
          <GlassCard level={3} sheen className="p-6 sm:p-8 shadow-[var(--shadow-xl)]">
            {children}
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   SCREEN: Login
   ============================================================ */
function LoginScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Clean OAuth callback params from URL and check for errors on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    const callbackUrl = params.get("callbackUrl");
    if (oauthError) {
      setServerError("Google sign-in encountered an error. Please try again.");
    }
    if (callbackUrl || oauthError || params.has("code")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setServerError(null);
    try {
      await signIn("google", { callbackUrl: window.location.origin + "/" });
    } catch {
      setServerError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell>
      <motion.div
        variants={slideUp}
        className="space-y-5"
      >
        <AuthHeader
          title="Welcome to LootLoom"
          subtitle="Sign in with Google to get started."
        />

        <AnimatePresence>
          {serverError && <ServerErrorBanner message={serverError} />}
        </AnimatePresence>

        <GoogleButton
          onClick={handleGoogleSignIn}
          loading={googleLoading}
          fullWidth
        />
      </motion.div>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN: Auth Loading
   ============================================================ */
function AuthLoadingScreen() {
  const navigate = useNavigationStore((s) => s.navigate);

  useEffect(() => {
    const t = window.setTimeout(() => navigate("dashboard"), 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  // Floating particles
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 4,
        color:
          i % 3 === 0
            ? "bg-electric/30"
            : i % 3 === 1
            ? "bg-cyan-brand/30"
            : "bg-purple-brand/30",
      })),
    []
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Floating particles */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={cn("absolute rounded-full", p.color)}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        variants={modalPop}
        initial="initial"
        animate="animate"
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Animated logo with rotating ring */}
        <div className="relative size-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-electric border-r-cyan-brand"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-[2px] border-transparent border-b-purple-brand border-l-gold/60"
          />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <Logo size="lg" withText={false} animated={false} />
          </motion.div>
        </div>

        <div className="text-center space-y-1.5">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Securing your session…
          </h2>
          <p className="text-sm text-muted-foreground">
            Verifying credentials and loading your dashboard
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-2 rounded-full bg-electric"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   SCREEN: Session Expired
   ============================================================ */
function SessionExpiredScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const logout = useAuthStore((s) => s.logout);

  return (
    <AuthShell>
      <motion.div variants={slideUp} className="space-y-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
          className="mx-auto inline-flex"
        >
          <div className="size-20 rounded-3xl bg-gold/15 ring-1 ring-gold/30 flex items-center justify-center text-gold shadow-[var(--shadow-glow)]">
            <LockKeyhole size={40} strokeWidth={2} />
          </div>
        </motion.div>

        <div className="space-y-2">
          <StatusBadge variant="warning" dot pulse className="mx-auto">
            Session Expired
          </StatusBadge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Your session has expired
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            For your security, you&apos;ve been signed out after a period of
            inactivity. Please sign in again to continue.
          </p>
        </div>

        <div className="space-y-3">
          <FormButton
            variant="electric"
            size="lg"
            onClick={() => {
              logout();
              navigate("login");
            }}
            leftIcon={<ArrowRight size={16} />}
          >
            Sign In Again
          </FormButton>
          <button
            type="button"
            onClick={() => navigate("home")}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Return to home
          </button>
        </div>
      </motion.div>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN: Unauthorized
   ============================================================ */
function UnauthorizedScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <AuthShell>
      <motion.div variants={slideUp} className="space-y-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: 20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
          className="mx-auto inline-flex"
        >
          <div className="size-20 rounded-3xl bg-rose-brand/12 ring-1 ring-rose-brand/25 flex items-center justify-center text-rose-brand">
            <ShieldAlert size={42} strokeWidth={2} />
          </div>
        </motion.div>

        <div className="space-y-2">
          <StatusBadge variant="error" dot className="mx-auto">
            403 — Access Denied
          </StatusBadge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            You don&apos;t have permission to access this page. If you believe this
            is a mistake, contact support or return home.
          </p>
        </div>

        <div className="space-y-3">
          <FormButton
            variant="electric"
            size="lg"
            onClick={() => navigate("home")}
            leftIcon={<ArrowLeft size={16} />}
          >
            Return Home
          </FormButton>
          <button
            type="button"
            onClick={() => navigate("login")}
            className="text-xs font-semibold text-electric hover:text-electric/80 transition-colors"
          >
            Try signing in
          </button>
        </div>
      </motion.div>
    </AuthShell>
  );
}

/* ============================================================
   AuthView — main router component
   ============================================================ */
export function AuthView() {
  const current = useNavigationStore((s) => s.current);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={current} className="w-full">
        {current === "login" && <LoginScreen />}
        {current === "auth-loading" && <AuthLoadingScreen />}
        {current === "session-expired" && <SessionExpiredScreen />}
        {current === "unauthorized" && <UnauthorizedScreen />}
      </motion.div>
    </AnimatePresence>
  );
}
