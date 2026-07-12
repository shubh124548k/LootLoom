"use client";

/**
 * LootLoom — PagesView
 * Dispatcher for secondary authenticated views.
 * Handles ONLY: settings (and profile as fallback).
 * daily-bonus & missions have been removed from navigation.
 */

import {
  useState,
  useEffect,
  type FormEvent,
  type ReactElement,
} from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Lock,
  KeyRound,
  Bell,
  Eye,
  Save,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  Wallet,
  Sparkles,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  Grid,
  GlassCard,
  LootButton,
  IconBadge,
  StatusBadge,
  AnimatedCounter,
  EmptyState,
  SkeletonCard,
} from "@/components/lootloom";
import {
  useNavigationStore,
  useUserStore,
  useWalletStore,
} from "@/stores";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { ViewId } from "@/types";

/* ============================================================
   Shared helpers
   ============================================================ */

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function ProfileAvatar({
  avatar,
  fullName,
  size = "lg",
}: {
  avatar: string | null;
  fullName: string;
  size?: "md" | "lg" | "xl";
}) {
  const sizeClass = {
    md: "size-14 text-lg",
    lg: "size-20 text-2xl",
    xl: "size-24 sm:size-28 text-3xl",
  }[size];

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={fullName || "User avatar"}
        className={cn(
          "rounded-2xl object-cover ring-2 ring-electric/30 shadow-[0_8px_24px_-8px_oklch(0.62_0.22_255/0.4)]",
          sizeClass
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center font-bold text-white ring-2 ring-electric/30 shadow-[0_8px_24px_-8px_oklch(0.62_0.22_255/0.4)]",
        "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand)_60%,var(--purple-brand))]",
        sizeClass
      )}
    >
      {getInitials(fullName)}
    </div>
  );
}

/* ============================================================
   Field display row (read-only) for Profile Section
   ============================================================ */

function FieldRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="size-8 rounded-lg glass-1 flex items-center justify-center text-electric shrink-0 ring-1 ring-border">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">
          {label}
        </p>
        <p className="text-sm text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

/* ============================================================
   Username availability check — frontend only (no API call)
   Simulates loading/success/error states.
   ============================================================ */

type UsernameState = "idle" | "checking" | "available" | "taken" | "invalid";

const RESERVED_USERNAMES = new Set([
  "admin",
  "support",
  "lootloom",
  "ceo",
  "root",
  "moderator",
  "staff",
  "official",
]);

function useUsernameCheck(username: string): UsernameState {
  const trimmed = username.trim().toLowerCase();
  const valid = trimmed.length >= 3 && /^[a-z0-9_]+$/.test(trimmed);

  // Only the async result (available/taken) needs state.
  // idle / invalid / checking are all derived synchronously.
  const [result, setResult] = useState<{ username: string; state: UsernameState }>({
    username: "",
    state: "idle",
  });

  useEffect(() => {
    if (!valid) return; // nothing to resolve; derived state handles idle/invalid
    if (result.username === trimmed) return; // already resolved for this username

    const t = window.setTimeout(() => {
      setResult({
        username: trimmed,
        state: RESERVED_USERNAMES.has(trimmed) ? "taken" : "available",
      });
    }, 600);
    return () => window.clearTimeout(t);
  }, [trimmed, valid, result.username]);

  if (!trimmed) return "idle";
  if (!valid) return "invalid";
  if (result.username === trimmed) return result.state;
  return "checking";
}

function UsernameCheckBadge({ state }: { state: UsernameState }) {
  if (state === "idle") return null;

  const config: Record<
    Exclude<UsernameState, "idle">,
    { icon: React.ReactNode; text: string; className: string }
  > = {
    checking: {
      icon: <Sparkles size={12} className="animate-spin" />,
      text: "Checking…",
      className: "text-muted-foreground bg-muted/40 ring-border",
    },
    available: {
      icon: <CheckCircle2 size={12} />,
      text: "Available",
      className: "text-emerald-brand bg-emerald-brand/10 ring-emerald-brand/20",
    },
    taken: {
      icon: <XCircle size={12} />,
      text: "Already taken",
      className: "text-rose-brand bg-rose-brand/10 ring-rose-brand/20",
    },
    invalid: {
      icon: <AlertCircle size={12} />,
      text: "Min 3 chars, letters/numbers/_",
      className: "text-gold bg-gold/10 ring-gold/20",
    },
  };

  const c = config[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        c.className
      )}
    >
      {c.icon}
      {c.text}
    </span>
  );
}

/* ============================================================
   Edit Profile Form
   ============================================================ */

function EditProfileForm() {
  const { fullName, email } = useUserStore();
  const [formFullName, setFormFullName] = useState(fullName || "");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const usernameState = useUsernameCheck(username);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    // No actual submission — simulate a saving state, then reset.
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
    }, 1200);
  };

  const handleCancel = () => {
    setFormFullName(fullName || "");
    setUsername("");
    setBio("");
    setPhone("");
  };

  const usernameValid = usernameState === "available";
  const canSave =
    formFullName.trim().length >= 2 &&
    (username.length === 0 || usernameValid) &&
    !saving;

  return (
    <GlassCard level={2} sheen className="p-5 sm:p-6">
      <SectionHeader
        title="Edit Profile"
        description="Update your personal information"
        icon={<Pencil size={18} />}
      />

      <form onSubmit={handleSave} className="space-y-4 mt-2">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="edit-fullname"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Full Name
          </label>
          <Input
            id="edit-fullname"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
            placeholder="Your full name"
            maxLength={80}
            disabled={saving}
          />
        </div>

        {/* Username + availability check */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="edit-username"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Username
            </label>
            <UsernameCheckBadge state={usernameState} />
          </div>
          <Input
            id="edit-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="choose a unique username"
            maxLength={24}
            disabled={saving}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <p className="text-[11px] text-muted-foreground/80">
            Letters, numbers and underscores. Min 3 characters.
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label
            htmlFor="edit-bio"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Bio
          </label>
          <Textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself…"
            rows={3}
            maxLength={200}
            disabled={saving}
          />
          <p className="text-[11px] text-muted-foreground/80 text-right">
            {bio.length}/200
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="edit-phone"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Phone Number
          </label>
          <Input
            id="edit-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 90000 00000"
            maxLength={20}
            disabled={saving}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <LootButton
            type="button"
            variant="ghost"
            size="md"
            onClick={handleCancel}
            disabled={saving}
            leftIcon={<X size={15} />}
          >
            Cancel
          </LootButton>
          <LootButton
            type="submit"
            variant="electric"
            size="md"
            loading={saving}
            leftIcon={!saving ? <Save size={15} /> : undefined}
            disabled={!canSave}
          >
            {saving ? "Saving…" : "Save Changes"}
          </LootButton>
        </div>

        {/* Email is read-only — show note */}
        <p className="text-[11px] text-muted-foreground/80 pt-1">
          Email ({email || "—"}) cannot be changed here. Contact support to
          update your email.
        </p>
      </form>
    </GlassCard>
  );
}

/* ============================================================
   Change Password Form
   ============================================================ */

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const passwordsMatch = next.length > 0 && next === confirm;
  const canSubmit =
    current.length >= 1 && next.length >= 8 && passwordsMatch && !saving;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    // No actual submission — simulate saving state, then reset.
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setCurrent("");
      setNext("");
      setConfirm("");
    }, 1200);
  };

  return (
    <GlassCard level={2} sheen className="p-5 sm:p-6">
      <SectionHeader
        title="Change Password"
        description="Keep your account secure"
        icon={<KeyRound size={18} />}
      />

      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <label
            htmlFor="pw-current"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Current Password
          </label>
          <Input
            id="pw-current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="••••••••"
            disabled={saving}
            autoComplete="current-password"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="pw-new"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            New Password
          </label>
          <Input
            id="pw-new"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="At least 8 characters"
            disabled={saving}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="pw-confirm"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Confirm New Password
          </label>
          <Input
            id="pw-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter new password"
            disabled={saving}
            autoComplete="new-password"
          />
          {confirm.length > 0 && !passwordsMatch && (
            <p className="text-[11px] text-rose-brand inline-flex items-center gap-1">
              <AlertCircle size={11} /> Passwords do not match
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <LootButton
            type="submit"
            variant="electric"
            size="md"
            loading={saving}
            leftIcon={!saving ? <Shield size={15} /> : undefined}
            disabled={!canSubmit}
          >
            {saving ? "Updating…" : "Update Password"}
          </LootButton>
        </div>
      </form>
    </GlassCard>
  );
}

/* ============================================================
   Coming Soon Card — future-ready security features
   ============================================================ */

function ComingSoonCard({
  icon,
  title,
  description,
  index,
}: {
  icon: string;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div variants={cardReveal} custom={index}>
      <GlassCard
        level={1}
        className="p-5 opacity-70 ring-1 ring-border/60 h-full"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <IconBadge name={icon} accent="navy" size="md" />
          <StatusBadge variant="default">Coming soon</StatusBadge>
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Privacy Toggle Row
   ============================================================ */

function PrivacyToggle({
  icon,
  label,
  description,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="size-8 rounded-lg glass-1 flex items-center justify-center text-electric shrink-0 ring-1 ring-border">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}

/* ============================================================
   Settings View
   ============================================================ */

function SettingsView() {
  const { fullName, email, avatar, memberSince } = useUserStore();
  const navigate = useNavigationStore((s) => s.navigate);

  // Username / phone / bio are not currently in the user store.
  // Shown as placeholder until backend populates them.
  const username = "—";
  const phone = "—";
  const bio = "—";

  // Privacy toggles — local state, placeholder-ready for backend.
  const [accountVisibility, setAccountVisibility] = useState(true);
  const [dataPreferences, setDataPreferences] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState(true);
  const [privacyControls, setPrivacyControls] = useState(false);

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your account preferences"
        actions={
          <LootButton
            variant="outline"
            size="md"
            leftIcon={<UserIcon size={15} />}
            onClick={() => navigate("profile")}
          >
            <span className="hidden sm:inline">View Profile</span>
            <span className="sm:hidden">Profile</span>
          </LootButton>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-5 lg:space-y-6"
      >
        {/* Profile Section — read-only display */}
        <motion.div variants={cardReveal} custom={0}>
          <GlassCard level={2} sheen glow="electric" className="p-5 sm:p-6">
            <SectionHeader
              title="Profile"
              description="Your account information"
              icon={<UserIcon size={18} />}
            />

            <div className="flex flex-col sm:flex-row sm:items-start gap-5 mt-2">
              <ProfileAvatar avatar={avatar} fullName={fullName} size="lg" />

              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <FieldRow
                  icon={<UserIcon size={15} />}
                  label="Full Name"
                  value={fullName || "—"}
                />
                <FieldRow
                  icon={<UserIcon size={15} />}
                  label="Username"
                  value={username}
                />
                <FieldRow
                  icon={<Mail size={15} />}
                  label="Email"
                  value={email || "—"}
                />
                <FieldRow
                  icon={<Phone size={15} />}
                  label="Phone Number"
                  value={phone}
                />
                <FieldRow
                  icon={<Calendar size={15} />}
                  label="Member Since"
                  value={formatDate(memberSince)}
                />
                <FieldRow
                  icon={<CheckCircle2 size={15} />}
                  label="Bio"
                  value={bio}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Edit Profile form */}
        <motion.div variants={cardReveal} custom={1}>
          <EditProfileForm />
        </motion.div>

        {/* Security Section */}
        <motion.div variants={cardReveal} custom={2}>
          <div className="space-y-4">
            <SectionHeader
              title="Security"
              description="Protect your account"
              icon={<Shield size={18} />}
            />
            <ChangePasswordForm />

            {/* Future-ready security cards (disabled / coming soon) */}
            <Grid cols={3}>
              <ComingSoonCard
                icon="MailCheck"
                title="Email Verification"
                description="Verify your email address for added security."
                index={3}
              />
              <ComingSoonCard
                icon="Smartphone"
                title="Phone Verification"
                description="Link and verify your phone number."
                index={4}
              />
              <ComingSoonCard
                icon="Lock"
                title="Two-Factor Authentication"
                description="Add an extra layer of protection with 2FA."
                index={5}
              />
              <ComingSoonCard
                icon="Monitor"
                title="Active Sessions"
                description="View and manage devices signed in to your account."
                index={6}
              />
              <ComingSoonCard
                icon="History"
                title="Login History"
                description="Review recent login activity on your account."
                index={7}
              />
            </Grid>
          </div>
        </motion.div>

        {/* Privacy Section */}
        <motion.div variants={cardReveal} custom={8}>
          <GlassCard level={2} sheen className="p-5 sm:p-6">
            <SectionHeader
              title="Privacy"
              description="Control your data and visibility"
              icon={<Eye size={18} />}
            />
            <div className="mt-2">
              <PrivacyToggle
                icon={<UserIcon size={15} />}
                label="Account Visibility"
                description="Allow other users to view your profile."
                checked={accountVisibility}
                onToggle={setAccountVisibility}
              />
              <PrivacyToggle
                icon={<Eye size={15} />}
                label="Data Preferences"
                description="Allow us to use your data to personalize experience."
                checked={dataPreferences}
                onToggle={setDataPreferences}
              />
              <PrivacyToggle
                icon={<Bell size={15} />}
                label="Notification Preferences"
                description="Receive notifications about your account activity."
                checked={notificationPrefs}
                onToggle={setNotificationPrefs}
              />
              <PrivacyToggle
                icon={<Lock size={15} />}
                label="Privacy Controls"
                description="Require additional verification for sensitive actions."
                checked={privacyControls}
                onToggle={setPrivacyControls}
              />
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}

/* ============================================================
   Profile Page (fallback when routed via PagesView)
   ============================================================ */

function ProfilePage() {
  const { fullName, email, avatar, memberSince } = useUserStore();
  const { availableCoins, lifetimeEarned, lifetimeRedeemed } = useWalletStore();
  const navigate = useNavigationStore((s) => s.navigate);
  const [loading] = useState(false);

  const hasProfile = Boolean(fullName || email);
  const username = "—";

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Profile" description="Your account overview" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SkeletonCard className="lg:col-span-3 h-40" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Profile"
        description="Your account overview"
        actions={
          <LootButton
            variant="electric"
            size="md"
            leftIcon={<Pencil size={15} />}
            onClick={() => navigate("settings")}
          >
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </LootButton>
        }
      />

      {!hasProfile ? (
        <GlassCard level={2} sheen className="py-12">
          <EmptyState
            icon="User"
            title="No profile data"
            description="Your profile details will appear here once your account is loaded."
          />
        </GlassCard>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-5 lg:space-y-6"
        >
          {/* Profile Card */}
          <motion.div variants={cardReveal} custom={0}>
            <GlassCard level={2} sheen glow="electric" className="p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <ProfileAvatar avatar={avatar} fullName={fullName} size="xl" />
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                      {fullName || "LootLoom Member"}
                    </h2>
                    <StatusBadge variant="success" dot pulse>
                      Active
                    </StatusBadge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                      <UserIcon size={14} className="text-electric shrink-0" />
                      <span className="truncate">{username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                      <Mail size={14} className="text-electric shrink-0" />
                      <span className="truncate">{email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                      <Calendar size={14} className="text-electric shrink-0" />
                      <span className="truncate">
                        Member since {formatDate(memberSince)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                      <CheckCircle2 size={14} className="text-emerald-brand shrink-0" />
                      <span className="truncate">Account verified</span>
                    </div>
                  </div>
                </div>
                <div className="sm:shrink-0">
                  <LootButton
                    variant="electric"
                    size="md"
                    leftIcon={<Pencil size={15} />}
                    onClick={() => navigate("settings")}
                  >
                    Edit Profile
                  </LootButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <SectionHeader
              title="Quick Stats"
              description="Your wallet at a glance"
              icon={<Wallet size={18} />}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {[
                {
                  label: "Current Coins",
                  value: availableCoins,
                  icon: "Coins",
                  accent: "gold" as const,
                },
                {
                  label: "Total Earned",
                  value: lifetimeEarned,
                  icon: "TrendingUp",
                  accent: "emerald" as const,
                },
                {
                  label: "Total Spent",
                  value: lifetimeRedeemed,
                  icon: "TrendingDown",
                  accent: "purple" as const,
                },
              ].map((stat, i) => (
                <motion.div key={stat.label} variants={cardReveal} custom={i + 1}>
                  <GlassCard level={2} sheen hover className="p-5 h-full">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <IconBadge name={stat.icon} accent={stat.accent} size="md" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      {stat.label}
                    </p>
                    <AnimatedCounter
                      value={stat.value}
                      className="text-2xl sm:text-3xl font-bold text-foreground"
                    />
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </PageContainer>
  );
}

/* ============================================================
   Dispatcher
   ============================================================ */

const PAGES: Partial<Record<string, () => ReactElement>> = {
  settings: SettingsView,
  profile: ProfilePage,
};

export function PagesView() {
  const current = useNavigationStore((s) => s.current) as ViewId;
  const Page = PAGES[current];

  if (!Page) {
    return (
      <PageContainer>
        <PageHeader title="Page not found" description="This page is not available." />
        <GlassCard level={2} sheen className="py-12">
          <EmptyState
            icon="Compass"
            title="Page not found"
            description="This page is not available yet."
          />
        </GlassCard>
      </PageContainer>
    );
  }

  return <Page />;
}
