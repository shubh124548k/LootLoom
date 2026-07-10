"use client";

/**
 * LootLoom — AuthView
 * Renders ALL authentication screens based on `useNavigationStore().current`.
 *
 * Screens handled:
 *   login, register, forgot-password, reset-password,
 *   verify-email, verify-success, verify-failed,
 *   auth-loading, session-expired, unauthorized
 *
 * Split layout on lg+: LEFT = animated application preview (floating glass widgets),
 * RIGHT = auth form in GlassCard. Mobile: single column.
 *
 * BackgroundEngine is global and intentionally NOT rendered here.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AtSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  KeyRound,
  LockKeyhole,
  ShieldAlert,
  Sparkles,
  Bell,
  RefreshCw,
} from "lucide-react";
import {
  GlassCard,
  LootButton,
  Logo,
  IconBadge,
  StatusBadge,
  GlassLoader,
} from "@/components/lootloom";
import { AnimatedCounter } from "@/components/lootloom";
import { useNavigationStore, useAuthStore } from "@/stores";
import { signIn, signOut } from "next-auth/react";
import type { ViewId } from "@/types";
import {
  pageTransition,
  fade,
  slideUp,
  scaleIn,
  floating,
  hoverLift,
  staggerContainer,
  modalPop,
  successCheck,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Premium input base class (shared by all auth inputs)
   ============================================================ */
const INPUT_CLASS =
  "h-12 rounded-xl glass-2 ring-1 ring-border px-4 text-sm focus:ring-electric/40 focus:ring-2 outline-none transition-all w-full";

/* ============================================================
   AuthInput — premium labeled input with leading icon
   ============================================================ */
interface AuthInputProps {
  id: string;
  label: string;
  type?: "text" | "email" | "tel" | "password";
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  error?: string | null;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
  rightSlot?: React.ReactNode;
  disabled?: boolean;
}

function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  error = null,
  autoComplete,
  inputMode,
  maxLength,
  rightSlot,
  disabled = false,
}: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-foreground/70 tracking-wide"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            INPUT_CLASS,
            icon && "pl-11",
            rightSlot && "pr-12",
            error && "ring-rose-brand/50 focus:ring-rose-brand/40",
            disabled && "opacity-60 pointer-events-none"
          )}
        />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-medium text-rose-brand flex items-center gap-1"
          >
            <XCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   PasswordInput — password with eye toggle + optional meter
   ============================================================ */
interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  showStrength?: boolean;
  autoComplete?: string;
}

function PasswordInput({
  id,
  label,
  placeholder = "••••••••",
  value,
  onChange,
  error = null,
  showStrength = false,
  autoComplete,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <AuthInput
        id={id}
        label={label}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        icon={<Lock size={16} />}
        error={error}
        autoComplete={autoComplete}
        rightSlot={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={show ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      {showStrength && <PasswordStrengthMeter password={value} />}
    </div>
  );
}

/* ============================================================
   PasswordStrengthMeter — weak / medium / strong
   ============================================================ */
function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, color, percent } = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-transparent", percent: 0 };
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    const final = Math.min(s, 3);
    const map = [
      { label: "Too short", color: "bg-rose-brand", percent: 20 },
      { label: "Weak", color: "bg-rose-brand", percent: 35 },
      { label: "Medium", color: "bg-gold", percent: 65 },
      { label: "Strong", color: "bg-emerald-brand", percent: 100 },
    ];
    return { score: final, ...map[final] };
  }, [password]);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2"
    >
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <span
        className={cn(
          "text-[10px] font-semibold w-14 text-right",
          score === 0 && "text-muted-foreground",
          score === 1 && "text-rose-brand",
          score === 2 && "text-gold",
          score === 3 && "text-emerald-brand"
        )}
      >
        {label}
      </span>
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
  subtitle?: string;
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
      <div className="flex items-center gap-2">
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
   Divider — "or continue with"
   ============================================================ */
function Divider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

/* ============================================================
   SocialPlaceholders — Google / GitHub / Facebook (disabled look)
   ============================================================ */
function SocialPlaceholders() {
  const socials = [
    { name: "Google", glyph: "G", color: "text-rose-brand", ring: "hover:ring-rose-brand/30" },
    { name: "GitHub", glyph: "", icon: "GH", color: "text-foreground", ring: "hover:ring-electric/30" },
    { name: "Facebook", glyph: "f", color: "text-electric", ring: "hover:ring-electric/30" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {socials.map((s) => (
        <motion.button
          key={s.name}
          type="button"
          disabled
          whileHover={{ y: -2 }}
          className={cn(
            "h-11 rounded-xl glass-2 ring-1 ring-border flex items-center justify-center gap-2",
            "text-sm font-semibold text-muted-foreground cursor-not-allowed",
            "opacity-70 grayscale"
          )}
          aria-label={`Continue with ${s.name} (coming soon)`}
          title={`${s.name} — coming soon`}
        >
          <span className={cn("text-base font-bold", s.color)}>
            {s.glyph || (
              <span className="text-xs tracking-tighter font-mono">{s.icon}</span>
            )}
          </span>
          <span className="hidden sm:inline text-xs">{s.name}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ============================================================
   TermsCheckbox + RememberMe — premium checkbox
   ============================================================ */
interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  error?: string | null;
}

function PremiumCheckbox({ id, checked, onChange, label, error }: CheckboxProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="flex items-start gap-2.5 cursor-pointer group select-none"
      >
        <button
          type="button"
          role="checkbox"
          id={id}
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "mt-0.5 size-5 rounded-md ring-1 flex items-center justify-center transition-all shrink-0",
            checked
              ? "bg-electric ring-electric text-white"
              : "bg-transparent ring-border text-transparent group-hover:ring-electric/40"
          )}
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 16 }}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
        <span className="text-xs text-muted-foreground leading-relaxed">
          {label}
        </span>
      </label>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs font-medium text-rose-brand flex items-center gap-1 pl-7"
          >
            <XCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   AuthFooter — switch link line
   ============================================================ */
function AuthFooter({
  text,
  actionText,
  onAction,
}: {
  text: string;
  actionText: string;
  onAction: () => void;
}) {
  return (
    <motion.div
      variants={slideUp}
      className="text-center text-sm text-muted-foreground"
    >
      {text}{" "}
      <button
        type="button"
        onClick={onAction}
        className="font-semibold text-electric hover:text-electric/80 transition-colors inline-flex items-center gap-1 group"
      >
        {actionText}
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </motion.div>
  );
}

/* ============================================================
   OtpInput — 6-box verification code
   ============================================================ */
function OtpInput({
  value,
  onChange,
  hasError = false,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  hasError?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[idx] = char;
    onChange(next);
    if (char && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    onChange(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div
      className="flex justify-between gap-2"
      onPaste={handlePaste}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          variants={scaleIn}
          custom={i}
          className={cn(
            "size-12 sm:size-14 rounded-xl glass-2 ring-1 text-center text-lg font-bold",
            "focus:ring-electric/40 focus:ring-2 outline-none transition-all",
            "tabular-nums",
            hasError ? "ring-rose-brand/50" : "ring-border",
            value[i] && !hasError && "ring-electric/40 text-electric"
          )}
          aria-label={`Verification code digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

/* ============================================================
   AuthPreview — animated LEFT side of split layout
   Floating glass widgets showing app preview (NOT screenshots)
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
              value={12840}
              className="text-3xl font-bold tracking-tight text-foreground"
            />
            <span className="text-xs font-semibold text-muted-foreground mb-1">
              coins
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-brand font-semibold">
            <ArrowRight size={11} className="rotate-[-45deg]" />
            +145 today
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
            <AnimatedCounter value={50} /> coins
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-gold/15 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 1.2, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-gold to-amber-300"
            />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Day 12 streak
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
            {[
              { name: "₹100 UPI", coins: 1000 },
              { name: "Amazon ₹50", coins: 800 },
            ].map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="text-muted-foreground">{r.name}</span>
                <span className="font-semibold text-purple-brand">
                  {r.coins.toLocaleString("en-IN")} ¢
                </span>
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
            <AnimatedCounter value={12} /> days
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
                Mission Completed
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                You earned 120 coins
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
          <GlassCard
            level={3}
            sheen
            className="p-4 shadow-[var(--shadow-lg)]"
          >
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
   Shell — common wrapper for all auth screens
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
   Hook: simulate API call
   ============================================================ */
function useSimulatedApi() {
  const [loading, setLoading] = useState(false);
  const run = (cb: () => void, ms = 1200) => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      cb();
    }, ms);
  };
  return { loading, run };
}

/* ============================================================
   Validation helpers
   ============================================================ */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateEmail = (v: string) => (emailRe.test(v) ? null : "Enter a valid email address");

/* ============================================================
   SCREEN: Login
   ============================================================ */
function LoginScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("google", { callbackUrl: "/", redirect: false });
      if (result?.error) {
        setError("Google sign-in failed. Please try again.");
        setLoading(false);
      } else if (result?.ok) {
        // AuthDataSync will populate stores; navigate to dashboard
        setAuthenticated(true);
        navigate("dashboard");
      }
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <motion.div
        variants={slideUp}
        className="space-y-5"
        noValidate
      >
        <AuthHeader
          icon={<IconBadge name="KeyRound" accent="electric" size="lg" />}
          title="Welcome back"
          subtitle="Sign in with Google to continue earning rewards."
        />

        {error && (
          <div className="rounded-xl bg-rose-brand/10 ring-1 ring-rose-brand/20 p-3 text-xs text-rose-brand font-medium">
            {error}
          </div>
        )}

        {/* Google Sign-In — the only authentication method */}
        <LootButton
          type="button"
          variant="electric"
          size="lg"
          fullWidth
          loading={loading}
          onClick={handleGoogleSignIn}
          leftIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335"/>
            </svg>
          }
        >
          {loading ? "Connecting…" : "Continue with Google"}
        </LootButton>

        <div className="rounded-xl glass-2 ring-1 ring-border p-4 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            LootLoom uses Google Sign-In for secure authentication.
            Your Google account is used to create your LootLoom profile and wallet automatically.
          </p>
        </div>

        <AuthFooter
          text="New to LootLoom?"
          actionText="Get Started"
          onAction={() => navigate("register")}
        />
      </motion.div>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN: Register
   ============================================================ */
function RegisterScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { loading, run } = useSimulatedApi();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string | null;
    user?: string | null;
    email?: string | null;
    pw?: string | null;
    confirm?: string | null;
    terms?: string | null;
  }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!fullName.trim()) next.name = "Full name is required";
    if (!username.trim()) next.user = "Username is required";
    else if (username.length < 3) next.user = "Min 3 characters";
    if (!email.trim()) next.email = "Email is required";
    else next.email = validateEmail(email);
    if (!password) next.pw = "Password is required";
    else if (password.length < 8) next.pw = "Use 8+ characters";
    if (confirm !== password) next.confirm = "Passwords do not match";
    if (!terms) next.terms = "Please accept the terms to continue";
    setErrors(next);
    if (Object.keys(next).filter((k) => next[k as keyof typeof next]).length) return;

    run(() => navigate("verify-email"));
  };

  return (
    <AuthShell>
      <motion.form
        variants={slideUp}
        onSubmit={submit}
        className="space-y-4"
        noValidate
      >
        <AuthHeader
          icon={<IconBadge name="UserPlus" accent="purple" size="lg" />}
          title="Create your account"
          subtitle="Join thousands earning rewards every day."
          badge={
            <StatusBadge variant="purple" dot>
              Free
            </StatusBadge>
          }
        />

        <AuthInput
          id="fullName"
          label="Full Name"
          placeholder="Aarav Sharma"
          value={fullName}
          onChange={(v) => {
            setFullName(v);
            if (errors.name) setErrors((e) => ({ ...e, name: null }));
          }}
          icon={<User size={16} />}
          error={errors.name}
          autoComplete="name"
        />

        <AuthInput
          id="username"
          label="Username"
          placeholder="aarav_s"
          value={username}
          onChange={(v) => {
            setUsername(v);
            if (errors.user) setErrors((e) => ({ ...e, user: null }));
          }}
          icon={<AtSign size={16} />}
          error={errors.user}
          autoComplete="username"
        />

        <AuthInput
          id="email"
          label="Email"
          type="email"
          placeholder="you@lootloom.app"
          value={email}
          onChange={(v) => {
            setEmail(v);
            if (errors.email) setErrors((e) => ({ ...e, email: null }));
          }}
          icon={<Mail size={16} />}
          error={errors.email}
          autoComplete="email"
        />

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (errors.pw) setErrors((e) => ({ ...e, pw: null }));
          }}
          error={errors.pw}
          showStrength
          autoComplete="new-password"
        />

        <PasswordInput
          id="confirm"
          label="Confirm Password"
          value={confirm}
          onChange={(v) => {
            setConfirm(v);
            if (errors.confirm) setErrors((e) => ({ ...e, confirm: null }));
          }}
          error={errors.confirm}
          autoComplete="new-password"
        />

        <PremiumCheckbox
          id="terms"
          checked={terms}
          onChange={(v) => {
            setTerms(v);
            if (errors.terms) setErrors((e) => ({ ...e, terms: null }));
          }}
          label={
            <>
              I agree to the{" "}
              <button
                type="button"
                className="font-semibold text-electric hover:underline"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="font-semibold text-electric hover:underline"
              >
                Privacy Policy
              </button>
            </>
          }
          error={errors.terms}
        />

        <LootButton
          type="submit"
          variant="electric"
          size="lg"
          fullWidth
          loading={loading}
          rightIcon={<ArrowRight size={16} />}
        >
          {loading ? "Creating account…" : "Create Account"}
        </LootButton>

        <Divider />

        <SocialPlaceholders />

        <AuthFooter
          text="Already have an account?"
          actionText="Sign In"
          onAction={() => navigate("login")}
        />
      </motion.form>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN: Forgot Password
   ============================================================ */
function ForgotPasswordScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { loading, run } = useSimulatedApi();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError("Email is required");
    const ve = validateEmail(email);
    if (ve) return setError(ve);
    setError(null);
    run(() => setSent(true));
  };

  return (
    <AuthShell>
      <motion.div variants={slideUp} className="space-y-5">
        <AuthHeader
          icon={<IconBadge name="MailQuestion" accent="gold" size="lg" />}
          title="Forgot password?"
          subtitle={
            sent
              ? undefined
              : "Enter your email and we'll send you a reset link."
          }
        />

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              variants={modalPop}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-5"
            >
              <GlassCard level={2} className="p-5 space-y-3">
                <motion.div
                  variants={successCheck}
                  initial="initial"
                  animate="animate"
                  className="size-12 rounded-2xl bg-emerald-brand/15 ring-1 ring-emerald-brand/25 flex items-center justify-center text-emerald-brand"
                >
                  <CheckCircle2 size={26} />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-foreground">Check your inbox</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    If an account exists for{" "}
                    <span className="font-semibold text-foreground">{email}</span>,
                    a reset link has been sent. The link expires in 30 minutes.
                  </p>
                </div>
              </GlassCard>

              <LootButton
                variant="electric"
                size="lg"
                fullWidth
                onClick={() => navigate("reset-password")}
                rightIcon={<ArrowRight size={16} />}
              >
                Continue to Reset
              </LootButton>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              className="space-y-5"
              noValidate
            >
              <AuthInput
                id="forgotEmail"
                label="Email"
                type="email"
                placeholder="you@lootloom.app"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  if (error) setError(null);
                }}
                icon={<Mail size={16} />}
                error={error}
                autoComplete="email"
              />
              <LootButton
                type="submit"
                variant="electric"
                size="lg"
                fullWidth
                loading={loading}
                leftIcon={<Mail size={16} />}
              >
                {loading ? "Sending reset link…" : "Send Reset Link"}
              </LootButton>
            </motion.form>
          )}
        </AnimatePresence>

        <AuthFooter
          text="Remembered your password?"
          actionText="Back to Sign In"
          onAction={() => navigate("login")}
        />
      </motion.div>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN: Reset Password
   ============================================================ */
function ResetPasswordScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { loading, run } = useSimulatedApi();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ pw?: string | null; confirm?: string | null }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!password) next.pw = "Password is required";
    else if (password.length < 8) next.pw = "Use 8+ characters";
    if (confirm !== password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    run(() => navigate("login"));
  };

  return (
    <AuthShell>
      <motion.form variants={slideUp} onSubmit={submit} className="space-y-5" noValidate>
        <AuthHeader
          icon={<IconBadge name="LockKeyhole" accent="emerald" size="lg" />}
          title="Reset password"
          subtitle="Choose a strong new password for your account."
        />

        <PasswordInput
          id="newPassword"
          label="New Password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (errors.pw) setErrors((e) => ({ ...e, pw: null }));
          }}
          error={errors.pw}
          showStrength
          autoComplete="new-password"
        />

        <PasswordInput
          id="confirmReset"
          label="Confirm Password"
          value={confirm}
          onChange={(v) => {
            setConfirm(v);
            if (errors.confirm) setErrors((e) => ({ ...e, confirm: null }));
          }}
          error={errors.confirm}
          autoComplete="new-password"
        />

        <LootButton
          type="submit"
          variant="electric"
          size="lg"
          fullWidth
          loading={loading}
          leftIcon={<KeyRound size={16} />}
        >
          {loading ? "Resetting…" : "Reset Password"}
        </LootButton>

        <AuthFooter
          text="Back to"
          actionText="Sign In"
          onAction={() => navigate("login")}
        />
      </motion.form>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN: Verify Email (OTP)
   ============================================================ */
function VerifyEmailScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { loading, run } = useSimulatedApi();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.some((c) => !c)) return setError("Enter the 6-digit code");
    setError(null);
    run(() => {
      // Simulated: 50% path — but deterministic for demo: success
      navigate("verify-success");
    });
  };

  const handleResend = () => {
    setResendIn(30);
    setCode(["", "", "", "", "", ""]);
    setError(null);
  };

  const filled = code.filter(Boolean).length;
  const progress = (filled / 6) * 100;

  return (
    <AuthShell>
      <motion.div variants={slideUp} className="space-y-5">
        <AuthHeader
          icon={<IconBadge name="ShieldCheck" accent="electric" size="lg" />}
          title="Verify your email"
          subtitle={
            <>
              We sent a 6-digit code to <span className="font-semibold text-foreground">your email</span>. Enter it below.
            </>
          }
          badge={
            <StatusBadge variant="info" dot pulse>
              Code expires in 9:58
            </StatusBadge>
          }
        />

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>Verification progress</span>
            <span className="tabular-nums">{filled}/6</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand),var(--purple-brand))]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <OtpInput value={code} onChange={setCode} hasError={!!error} />
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs font-medium text-rose-brand flex items-center gap-1"
              >
                <XCircle size={12} />
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <LootButton
            type="submit"
            variant="electric"
            size="lg"
            fullWidth
            loading={loading}
            rightIcon={<ArrowRight size={16} />}
          >
            {loading ? "Verifying…" : "Verify"}
          </LootButton>
        </form>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => navigate("register")}
            className="font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft size={12} />
            Change email
          </button>
          <button
            type="button"
            disabled={resendIn > 0}
            onClick={handleResend}
            className={cn(
              "font-semibold inline-flex items-center gap-1 transition-colors",
              resendIn > 0
                ? "text-muted-foreground/60 cursor-not-allowed"
                : "text-electric hover:text-electric/80"
            )}
          >
            <RefreshCw size={12} />
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </motion.div>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN: Verify Success
   ============================================================ */
function VerifySuccessScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const login = useAuthStore((s) => s.login);

  return (
    <AuthShell>
      <motion.div variants={slideUp} className="space-y-6 text-center">
        <motion.div
          variants={successCheck}
          initial="initial"
          animate="animate"
          className="mx-auto inline-flex"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-emerald-brand/30 blur-xl"
            />
            <div className="relative size-20 rounded-3xl bg-gradient-to-br from-emerald-brand to-cyan-brand flex items-center justify-center text-white shadow-[var(--shadow-glow)]">
              <CheckCircle2 size={42} strokeWidth={2.2} />
            </div>
          </div>
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Email Verified!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your account is now active. Welcome to LootLoom — your rewards
            journey begins now.
          </p>
        </div>

        <StatusBadge variant="success" dot pulse className="mx-auto">
          Account Activated
        </StatusBadge>

        <LootButton
          variant="electric"
          size="lg"
          fullWidth
          onClick={() => {
            login();
            navigate("dashboard");
          }}
          rightIcon={<ArrowRight size={16} />}
        >
          Continue to Dashboard
        </LootButton>
      </motion.div>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN: Verify Failed
   ============================================================ */
function VerifyFailedScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <AuthShell>
      <motion.div variants={slideUp} className="space-y-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: 20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.1 }}
          className="mx-auto inline-flex"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.15, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-rose-brand/30 blur-xl"
            />
            <div className="relative size-20 rounded-3xl bg-gradient-to-br from-rose-brand to-rose-400 flex items-center justify-center text-white shadow-[0_0_40px_-8px_rgb(244_63_94/0.5)]">
              <XCircle size={42} strokeWidth={2.2} />
            </div>
          </div>
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Verification Failed
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            The code you entered is invalid or has expired. Please try again or
            request a new code.
          </p>
        </div>

        <StatusBadge variant="error" dot className="mx-auto">
          Invalid Code
        </StatusBadge>

        <div className="space-y-3">
          <LootButton
            variant="electric"
            size="lg"
            fullWidth
            onClick={() => navigate("verify-email")}
            leftIcon={<RefreshCw size={16} />}
          >
            Try Again
          </LootButton>
          <button
            type="button"
            onClick={() => navigate("verify-email")}
            className="text-xs font-semibold text-electric hover:text-electric/80 transition-colors inline-flex items-center gap-1 mx-auto"
          >
            <RefreshCw size={12} />
            Resend code
          </button>
        </div>
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
            For your security, you've been signed out after a period of
            inactivity. Please sign in again to continue.
          </p>
        </div>

        <div className="space-y-3">
          <LootButton
            variant="electric"
            size="lg"
            fullWidth
            onClick={() => {
              logout();
              navigate("login");
            }}
            leftIcon={<ArrowRight size={16} />}
          >
            Sign In Again
          </LootButton>
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
            You don't have permission to access this page. If you believe this
            is a mistake, contact support or return home.
          </p>
        </div>

        <div className="space-y-3">
          <LootButton
            variant="electric"
            size="lg"
            fullWidth
            onClick={() => navigate("home")}
            leftIcon={<ArrowLeft size={16} />}
          >
            Return Home
          </LootButton>
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
        {current === "register" && <RegisterScreen />}
        {current === "forgot-password" && <ForgotPasswordScreen />}
        {current === "reset-password" && <ResetPasswordScreen />}
        {current === "verify-email" && <VerifyEmailScreen />}
        {current === "verify-success" && <VerifySuccessScreen />}
        {current === "verify-failed" && <VerifyFailedScreen />}
        {current === "auth-loading" && <AuthLoadingScreen />}
        {current === "session-expired" && <SessionExpiredScreen />}
        {current === "unauthorized" && <UnauthorizedScreen />}
      </motion.div>
    </AnimatePresence>
  );
}
