"use client";

/**
 * LootLoom — CeoAuthView
 * Private CEO Platform login experience.
 *
 * Layout:
 *   - Desktop split: left = brand / security illustration panel
 *                    right = login form + security features
 *   - Mobile: stacked single column (illustration first, form below)
 */
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import {
  GlassCard,
  LootButton,
  Logo,
  IconBadge,
  StatusBadge,
} from "@/components/lootloom";
import { useNavigationStore, useAuthStore } from "@/stores";
import { pageTransition, scaleIn, staggerContainer, cardReveal } from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Constants
   ============================================================ */

const INPUT_CLASS =
  "h-12 rounded-xl glass-2 ring-1 ring-border px-4 text-sm focus:ring-electric/40 focus:ring-2 outline-none transition-all w-full";

/** Basic email format validation. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Security features available to CEO personnel.
 */
interface FutureSecurityItem {
  icon: string;
  label: string;
  description: string;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
}

const FUTURE_SECURITY: FutureSecurityItem[] = [
  {
    icon: "Smartphone",
    label: "Two-Factor Authentication",
    description: "TOTP-based 2FA via authenticator app",
    accent: "electric",
  },
  {
    icon: "KeyRound",
    label: "OTP Verification",
    description: "One-time passcode on every login",
    accent: "cyan",
  },
  {
    icon: "Fingerprint",
    label: "Session Verification",
    description: "Step-up verification for sensitive actions",
    accent: "purple",
  },
  {
    icon: "Monitor",
    label: "Device Verification",
    description: "Trusted device allow-listing",
    accent: "gold",
  },
  {
    icon: "RefreshCw",
    label: "Recovery Codes",
    description: "Single-use backup codes for account recovery",
    accent: "emerald",
  },
  {
    icon: "History",
    label: "Login History",
    description: "Audit trail of every CEO login event",
    accent: "navy",
  },
];

const SECURITY_BADGES = [
  { icon: ShieldCheck, label: "Encrypted at rest" },
  { icon: Lock, label: "TLS 1.3 transport" },
  { icon: Sparkles, label: "Zero-trust design" },
];

/* ============================================================
   Sub-components
   ============================================================ */

function BrandPanel() {
  return (
    <GlassCard
      level={1}
      className="relative h-full overflow-hidden p-8 lg:p-12 flex flex-col justify-between"
    >
      {/* Glow accents */}
      <div className="pointer-events-none absolute -top-32 -left-24 size-72 rounded-full bg-electric/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-72 rounded-full bg-purple/20 blur-3xl" />

      <div className="relative z-10 flex items-center justify-between">
        <Logo size="lg" />
        <StatusBadge variant="electric" dot pulse>
          CEO Platform
        </StatusBadge>
      </div>

      <div className="relative z-10 max-w-md space-y-5">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground"
        >
          LootLoom <span className="text-gradient-electric">CEO Platform</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-sm lg:text-base text-muted-foreground leading-relaxed"
        >
          A private operations console for managing users, redeems, support and
          platform analytics. Access is restricted to authorized personnel only.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="flex flex-wrap gap-2 pt-2"
        >
          {SECURITY_BADGES.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-1.5 rounded-full glass-2 ring-1 ring-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <b.icon size={13} className="text-electric" />
              {b.label}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground/70">
        <span>© LootLoom · CEO Console</span>
        <span>v1.0 · Restricted Access</span>
      </div>
    </GlassCard>
  );
}

function LoginField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  rightSlot,
  error,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(INPUT_CLASS, "pl-10", rightSlot ? "pr-11" : "")}
        />
        {rightSlot}
      </div>
      {error && (
        <p className="text-xs text-rose-brand flex items-center gap-1.5">
          <AlertTriangle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

function FutureSecurityList() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Security Features
        </h3>
        <StatusBadge variant="electric" dot>Active</StatusBadge>
      </div>
      <p className="text-xs text-muted-foreground">
        Security layers protecting the CEO console.
      </p>
      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2.5"
      >
        {FUTURE_SECURITY.map((item) => (
          <motion.li key={item.label} variants={cardReveal} custom={0}>
            <GlassCard
              level={2}
              className="p-3.5 flex items-center gap-3"
            >
              <IconBadge name={item.icon} accent={item.accent} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
            </GlassCard>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

/* ============================================================
   Main view
   ============================================================ */

export function CeoAuthView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const setAuth = useAuthStore.setState;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});

  function validate(): boolean {
    const errs: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) {
      errs.identifier = "Email or username is required";
    } else if (identifier.includes("@") && !EMAIL_RE.test(identifier)) {
      errs.identifier = "Enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });

      if (result?.ok) {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const userRole = (session?.user as any)?.role;

        if (userRole === "CEO" || userRole === "ADMIN") {
          setAuth({
            role: "ceo",
            isAuthenticated: true,
            status: "authenticated",
          });
          navigate("ceo-dashboard");
        } else {
          setError("Access denied. CEO account required.");
        }
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen w-full flex items-stretch justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
        {/* Left: brand + security illustration (hidden on small screens, shown on top for mobile) */}
        <div className="hidden lg:block min-h-[640px]">
          <BrandPanel />
        </div>

        {/* Mobile brand strip */}
        <div className="lg:hidden">
          <BrandPanel />
        </div>

        {/* Right: login form + future security */}
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-5"
        >
          <GlassCard level={2} sheen className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  CEO Sign-In
                </h1>
                <p className="text-xs text-muted-foreground">
                  Authorized personnel only
                </p>
              </div>
              <IconBadge name="ShieldCheck" accent="electric" size="md" />
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-rose-brand/10 ring-1 ring-rose-brand/20 px-4 py-3 text-xs text-rose-brand flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <LoginField
                id="identifier"
                label="Email or Username"
                type="text"
                value={identifier}
                onChange={setIdentifier}
                placeholder="ceo@lootloom.com"
                autoComplete="username"
                icon={<Mail size={16} />}
                error={fieldErrors.identifier}
              />

              <LoginField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete="current-password"
                icon={<Lock size={16} />}
                error={fieldErrors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <LootButton
                type="submit"
                variant="electric"
                size="lg"
                fullWidth
                loading={loading}
                leftIcon={!loading ? <Lock size={16} /> : undefined}
              >
                {loading ? "Authenticating…" : "Sign In to CEO Console"}
              </LootButton>
            </form>

            <div className="mt-5 pt-5 border-t border-border">
              <button
                type="button"
                onClick={() => navigate("home")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={13} />
                Back to home
              </button>
            </div>
          </GlassCard>

          <GlassCard level={1} className="p-5 sm:p-6">
            <FutureSecurityList />
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
