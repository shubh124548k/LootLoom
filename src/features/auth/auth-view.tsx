"use client";

/**
 * LootLoom — AuthView
 * Renders ALL authentication screens based on `useNavigationStore().current`.
 *
 * Screens handled (10):
 *   login, register, forgot-password, reset-password,
 *   verify-email, verify-success, verify-failed,
 *   auth-loading, session-expired, unauthorized
 *
 * Layout: split on lg+ — LEFT = AuthPreview with floating glass widgets
 * (decorative marketing visuals, NO real user data), RIGHT = auth form in
 * GlassCard. Mobile: single column with form only.
 *
 * Auth wiring:
 *   - Login: signIn("credentials", { email, password, redirect: false })
 *   - Google: signIn("google", { callbackUrl: window.location.origin })
 *   - Register: CSRF token + POST to /api/auth/callback/credentials
 *   - Sign-out (session-expired): useAuthStore.logout() + navigate("login")
 *   - Verify-success: useAuthStore.login() + navigate("dashboard")
 *
 * Validation states supported on every form:
 *   Empty / Loading / Success / Error / Invalid Input / Server Error
 *
 * BackgroundEngine is global and intentionally NOT rendered here.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
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
  Phone,
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
  FormInput,
  PasswordInput,
  FormButton,
  GoogleButton,
  OtpInput,
  PremiumCheckbox,
} from "@/components/auth";
import { useNavigationStore, useAuthStore } from "@/stores";
import { signIn } from "next-auth/react";
import type { ViewId } from "@/types";
import {
  pageTransition,
  slideUp,
  floating,
  staggerContainer,
  modalPop,
  successCheck,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Validation helpers
   ============================================================ */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRe = /^[a-zA-Z0-9_]{3,20}$/;

const required = (v: string, label: string) =>
  v.trim().length === 0 ? `${label} is required` : null;
const validateEmail = (v: string) => {
  if (!v.trim()) return "Email is required";
  return emailRe.test(v.trim()) ? null : "Enter a valid email address";
};
const validatePassword = (v: string) => {
  if (!v) return "Password is required";
  return v.length >= 8 ? null : "Use at least 8 characters";
};
const validateUsername = (v: string) => {
  if (!v.trim()) return "Username is required";
  if (v.trim().length < 3) return "Username must be 3+ characters";
  return usernameRe.test(v.trim())
    ? null
    : "Letters, numbers, underscores only";
};
const validatePhone = (v: string) => {
  if (!v.trim()) return null; // optional
  const digits = v.replace(/\D/g, "");
  return digits.length >= 10 ? null : "Enter a valid phone number";
};

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
            {["UPI cashout", "Gift cards", "Vouchers"].map((r) => (
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
   Hook: simulate API call (used by non-backend-wired screens)
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
   SCREEN: Login
   ============================================================ */
function LoginScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onEmailChange = (v: string) => {
    setEmail(v);
    if (errors.email) setErrors((e) => ({ ...e, email: null }));
    if (serverError) setServerError(null);
  };
  const onPasswordChange = (v: string) => {
    setPassword(v);
    if (errors.password) setErrors((e) => ({ ...e, password: null }));
    if (serverError) setServerError(null);
  };

  const validate = () => {
    const next: typeof errors = {};
    next.email = validateEmail(email);
    next.password = required(password, "Password");
    setErrors(next);
    return !next.email && !next.password;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError(null);
    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setServerError(
          "Invalid email or password. If you don't have an account, please register first."
        );
        setLoading(false);
      } else if (result?.ok) {
        const sessionResp = await fetch("/api/auth/session");
        const session = await sessionResp.json();
        if (session?.user) {
          setAuthenticated(true);
          navigate("dashboard");
        } else {
          setServerError("Login failed. Please try again.");
          setLoading(false);
        }
      } else {
        setServerError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setServerError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setServerError(null);
    try {
      // Full-page redirect — NextAuth handles the rest
      await signIn("google", {
        callbackUrl: window.location.origin,
        redirect: true,
      });
    } catch {
      setServerError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const busy = loading || googleLoading;

  return (
    <AuthShell>
      <motion.form
        variants={slideUp}
        onSubmit={handleSignIn}
        className="space-y-5"
        noValidate
      >
        <AuthHeader
          icon={<IconBadge name="KeyRound" accent="electric" size="lg" />}
          title="Welcome back"
          subtitle="Sign in to your LootLoom account."
        />

        <AnimatePresence>
          {serverError && <ServerErrorBanner message={serverError} />}
        </AnimatePresence>

        {/* Google Sign-In */}
        <GoogleButton
          onClick={handleGoogleSignIn}
          loading={googleLoading}
          fullWidth
        />

        <Divider />

        <FormInput
          id="login-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={onEmailChange}
          icon={<AtSign size={16} />}
          error={errors.email ?? null}
          autoComplete="email"
          disabled={busy}
        />

        <PasswordInput
          id="login-password"
          label="Password"
          value={password}
          onChange={onPasswordChange}
          error={errors.password ?? null}
          autoComplete="current-password"
          disabled={busy}
        />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <PremiumCheckbox
            id="remember"
            checked={remember}
            onChange={setRemember}
            label={
              <span className="text-xs font-medium text-foreground/80">
                Remember me
              </span>
            }
          />
          <button
            type="button"
            onClick={() => navigate("forgot-password")}
            className="text-xs font-semibold text-electric hover:text-electric/80 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <FormButton
          type="submit"
          variant="electric"
          size="lg"
          loading={loading}
          disabled={busy}
          rightIcon={<ArrowRight size={16} />}
        >
          {loading ? "Signing in…" : "Sign In"}
        </FormButton>

        <AuthFooter
          text="New to LootLoom?"
          actionText="Create Account"
          onAction={() => navigate("register")}
        />
      </motion.form>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN: Register
   ============================================================ */
function RegisterScreen() {
  const navigate = useNavigationStore((s) => s.navigate);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
  });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string | null;
    username?: string | null;
    email?: string | null;
    password?: string | null;
    confirm?: string | null;
    phone?: string | null;
    terms?: string | null;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update =
    (field: keyof typeof form) =>
    (v: string) => {
      setForm((s) => ({ ...s, [field]: v }));
      if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
      if (serverError) setServerError(null);
      // Confirm-match should re-validate when either field changes
      if (field === "password" && errors.confirm) {
        setErrors((e) => ({
          ...e,
          confirm:
            v && form.confirm && form.confirm !== v
              ? "Passwords do not match"
              : null,
        }));
      }
      if (field === "confirm" && errors.confirm) {
        setErrors((e) => ({
          ...e,
          confirm: v !== form.password ? "Passwords do not match" : null,
        }));
      }
    };

  const onTermsChange = (v: boolean) => {
    setTerms(v);
    if (errors.terms) setErrors((e) => ({ ...e, terms: null }));
  };

  const validate = () => {
    const next: typeof errors = {};
    next.fullName = required(form.fullName, "Full name");
    next.username = validateUsername(form.username);
    next.email = validateEmail(form.email);
    next.password = validatePassword(form.password);
    next.confirm = !form.confirm
      ? "Please confirm your password"
      : form.confirm !== form.password
      ? "Passwords do not match"
      : null;
    next.phone = validatePhone(form.phone);
    next.terms = !terms ? "You must accept the Terms to continue" : null;
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError(null);
    try {
      // Get CSRF token
      const csrfResp = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfResp.json();

      // POST to credentials callback — backend authorize() handles registration
      const formData = new URLSearchParams();
      formData.append("name", form.fullName.trim());
      formData.append("username", form.username.trim().toLowerCase());
      formData.append("email", form.email.trim().toLowerCase());
      formData.append("password", form.password);
      if (form.phone.trim()) formData.append("phone", form.phone.trim());
      formData.append("csrfToken", csrfToken);
      formData.append("callbackUrl", window.location.origin);
      formData.append("json", "true");

      const resp = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (resp.ok) {
        const sessionResp = await fetch("/api/auth/session");
        const session = await sessionResp.json();
        if (session?.user) {
          setAuthenticated(true);
          navigate("dashboard");
        } else {
          setServerError(
            "Registration failed — session not created. Please try again."
          );
          setLoading(false);
        }
      } else {
        const errText = await resp.text().catch(() => "");
        setServerError(
          errText || "Registration failed. Please try a different email or username."
        );
        setLoading(false);
      }
    } catch {
      setServerError("Network error. Please try again.");
      setLoading(false);
    }
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

        <AnimatePresence>
          {serverError && <ServerErrorBanner message={serverError} />}
        </AnimatePresence>

        <FormInput
          id="fullName"
          label="Full Name"
          placeholder="Aarav Sharma"
          value={form.fullName}
          onChange={update("fullName")}
          icon={<User size={16} />}
          error={errors.fullName ?? null}
          autoComplete="name"
          disabled={loading}
        />

        <FormInput
          id="username"
          label="Username"
          placeholder="aarav_s"
          value={form.username}
          onChange={update("username")}
          icon={<AtSign size={16} />}
          error={errors.username ?? null}
          autoComplete="username"
          maxLength={20}
          disabled={loading}
        />

        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update("email")}
          icon={<Mail size={16} />}
          error={errors.email ?? null}
          autoComplete="email"
          disabled={loading}
        />

        <PasswordInput
          id="register-password"
          label="Password"
          value={form.password}
          onChange={update("password")}
          error={errors.password ?? null}
          showStrength
          autoComplete="new-password"
          disabled={loading}
        />

        <PasswordInput
          id="register-confirm"
          label="Confirm Password"
          value={form.confirm}
          onChange={update("confirm")}
          error={errors.confirm ?? null}
          autoComplete="new-password"
          disabled={loading}
        />

        <FormInput
          id="phone"
          label="Phone Number (optional)"
          type="tel"
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={update("phone")}
          icon={<Phone size={16} />}
          error={errors.phone ?? null}
          autoComplete="tel"
          inputMode="tel"
          maxLength={20}
          disabled={loading}
        />

        <PremiumCheckbox
          id="terms"
          checked={terms}
          onChange={onTermsChange}
          label={
            <span className="text-xs text-muted-foreground leading-relaxed">
              I agree to the{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("terms");
                }}
                className="font-semibold text-electric hover:text-electric/80 transition-colors"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("privacy");
                }}
                className="font-semibold text-electric hover:text-electric/80 transition-colors"
              >
                Privacy Policy
              </button>
            </span>
          }
          error={errors.terms ?? null}
        />

        <FormButton
          type="submit"
          variant="electric"
          size="lg"
          loading={loading}
          disabled={loading}
          rightIcon={<ArrowRight size={16} />}
        >
          {loading ? "Creating account…" : "Create Account"}
        </FormButton>

        <div className="rounded-xl glass-2 ring-1 ring-border p-4 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your account and wallet will be created automatically.
            Start earning coins by completing missions.
          </p>
        </div>

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
          subtitle={sent ? undefined : "Enter your email and we'll send you a reset link."}
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

              <FormButton
                variant="electric"
                size="lg"
                onClick={() => navigate("reset-password")}
                rightIcon={<ArrowRight size={16} />}
              >
                Continue to Reset
              </FormButton>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              className="space-y-5"
              noValidate
            >
              <FormInput
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
                disabled={loading}
              />
              <FormButton
                type="submit"
                variant="electric"
                size="lg"
                loading={loading}
                disabled={loading}
                leftIcon={<Mail size={16} />}
              >
                {loading ? "Sending reset link…" : "Send Reset Link"}
              </FormButton>
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
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    password?: string | null;
    confirm?: string | null;
  }>({});

  const onPasswordChange = (v: string) => {
    setPassword(v);
    if (errors.password) setErrors((e) => ({ ...e, password: null }));
    if (errors.confirm && confirm && confirm !== v) {
      setErrors((e) => ({ ...e, confirm: "Passwords do not match" }));
    } else if (errors.confirm && confirm === v) {
      setErrors((e) => ({ ...e, confirm: null }));
    }
    if (serverError) setServerError(null);
  };

  const onConfirmChange = (v: string) => {
    setConfirm(v);
    if (errors.confirm) {
      setErrors((e) => ({
        ...e,
        confirm: v !== password ? "Passwords do not match" : null,
      }));
    }
    if (serverError) setServerError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    next.password = validatePassword(password);
    next.confirm = !confirm
      ? "Please confirm your password"
      : confirm !== password
      ? "Passwords do not match"
      : null;
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    run(() => navigate("login"));
  };

  return (
    <AuthShell>
      <motion.form
        variants={slideUp}
        onSubmit={submit}
        className="space-y-5"
        noValidate
      >
        <AuthHeader
          icon={<IconBadge name="LockKeyhole" accent="emerald" size="lg" />}
          title="Reset password"
          subtitle="Choose a strong new password for your account."
        />

        <AnimatePresence>
          {serverError && <ServerErrorBanner message={serverError} />}
        </AnimatePresence>

        <PasswordInput
          id="newPassword"
          label="New Password"
          value={password}
          onChange={onPasswordChange}
          error={errors.password ?? null}
          showStrength
          autoComplete="new-password"
          disabled={loading}
        />

        <PasswordInput
          id="confirmReset"
          label="Confirm Password"
          value={confirm}
          onChange={onConfirmChange}
          error={errors.confirm ?? null}
          autoComplete="new-password"
          disabled={loading}
        />

        <FormButton
          type="submit"
          variant="electric"
          size="lg"
          loading={loading}
          disabled={loading}
          leftIcon={<KeyRound size={16} />}
        >
          {loading ? "Resetting…" : "Reset Password"}
        </FormButton>

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
    if (code.some((c) => !c)) {
      setError("Enter the 6-digit code");
      return;
    }
    setError(null);
    run(() => {
      // Demo: deterministic success path. Backend wiring will validate the OTP.
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
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-foreground">your email</span>.
              Enter it below.
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

          <FormButton
            type="submit"
            variant="electric"
            size="lg"
            loading={loading}
            disabled={loading}
            rightIcon={<ArrowRight size={16} />}
          >
            {loading ? "Verifying…" : "Verify"}
          </FormButton>
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

        <FormButton
          variant="electric"
          size="lg"
          onClick={() => {
            login();
            navigate("dashboard");
          }}
          rightIcon={<ArrowRight size={16} />}
        >
          Continue to Dashboard
        </FormButton>
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
          <FormButton
            variant="electric"
            size="lg"
            onClick={() => navigate("verify-email")}
            leftIcon={<RefreshCw size={16} />}
          >
            Try Again
          </FormButton>
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
