"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Clock,
  Camera,
  Shield,
  Lock,
  Eye,
  Bell,
  Palette,
  Smartphone,
  Download,
  AlertTriangle,
  Trash2,
  LogOut,
  KeyRound,
  Fingerprint,
  Monitor,
  CheckCircle2,
  Flame,
  Crown,
  Trophy,
  Gift,
  Coins,
  Users,
  Target,
  TrendingUp,
  History,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Type,
  Zap,
  Languages,
  Wallet,
  HardDrive,
  Laptop,
  Tablet,
  Chrome,
  Apple,
  Github,
  Facebook,
  MessageCircle,
  RefreshCw,
  FileText,
  UserX,
  Power,
  Save,
  Copy,
  ExternalLink,
  Info,
  Award,
  Star,
  Hexagon,
} from "lucide-react";

import {
  PageContainer,
  PageHeader,
  SectionHeader,
  Grid,
  GlassCard,
  LootButton,
  IconBadge,
  AnimatedCounter,
  ProgressRing,
  StatCard,
  StatusBadge,
  WidgetCard,
  EmptyState,
  ErrorState,
  SkeletonRow,
} from "@/components/lootloom";
import { useNavigationStore, useUserStore, useWalletStore, useUIStore } from "@/stores";
import { cardReveal, staggerContainer, hoverLift, floating } from "@/lib/animations";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ============================================================
   Types & utilities
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

function getInitials(name: string): string {
  if (!name) return "LL";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function showToast(title: string, description?: string) {
  toast({ title, description });
}

/* ============================================================
   Reusable helpers
   ============================================================ */

/** SettingRow — a labelled row with trailing control element. */
function SettingRow({
  icon,
  label,
  description,
  children,
  accent = "electric",
  locked = false,
}: {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  children?: React.ReactNode;
  accent?: Accent;
  locked?: boolean;
}) {
  const accentText: Record<Accent, string> = {
    electric: "text-electric",
    cyan: "text-cyan-brand",
    purple: "text-purple-brand",
    gold: "text-gold",
    emerald: "text-emerald-brand",
    rose: "text-rose-brand",
    navy: "text-navy",
  };
  return (
    <div className="flex items-center justify-between gap-3 py-3.5 border-b border-border/60 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <span className={cn("shrink-0 mt-0.5", accentText[accent])}>{icon}</span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{label}</p>
            {locked && (
              <Lock size={11} className="text-muted-foreground/60 shrink-0" />
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
          )}
        </div>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

/** ToggleCard — a compact glass card with a Switch. */
function ToggleCard({
  icon,
  label,
  description,
  checked,
  onChange,
  accent = "electric",
  locked = false,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accent?: Accent;
  locked?: boolean;
}) {
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/10 text-electric ring-electric/20",
    cyan: "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
    purple: "bg-purple/10 text-purple-brand ring-purple-brand/20",
    gold: "bg-gold/15 text-gold ring-gold/25",
    emerald: "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
    rose: "bg-rose-brand/10 text-rose-brand ring-rose-brand/20",
    navy: "bg-navy/10 text-navy ring-navy/20",
  };
  return (
    <motion.div
      variants={cardReveal}
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl glass-1 ring-1 ring-border transition-all",
        locked && "opacity-70"
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-xl ring-1 size-9 shrink-0",
          accentBg[accent]
        )}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {locked && <Lock size={11} className="text-muted-foreground/60" />}
        </div>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={locked}
        aria-label={label}
      />
    </motion.div>
  );
}

/** ConfirmDialog — warning-style dialog used in the Danger Zone. */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  icon,
  variant = "danger",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  icon?: React.ReactNode;
  variant?: "danger" | "warning";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className={cn(
              "size-12 rounded-2xl flex items-center justify-center ring-1 mb-2",
              variant === "danger"
                ? "bg-rose-brand/10 text-rose-brand ring-rose-brand/20"
                : "bg-gold/15 text-gold ring-gold/25"
            )}
          >
            {icon ?? <AlertTriangle size={24} />}
          </div>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <LootButton
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </LootButton>
          <LootButton
            variant={variant === "danger" ? "destructive" : "gold"}
            size="sm"
            leftIcon={variant === "danger" ? <Trash2 size={14} /> : <AlertTriangle size={14} />}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </LootButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** BadgeCard — a single badge in the collection grid. */
type Rarity = "common" | "rare" | "epic" | "legendary" | "special" | "vip";

const rarityStyles: Record<
  Rarity,
  { ring: string; text: string; bg: string; label: string }
> = {
  common: {
    ring: "ring-muted-foreground/20",
    text: "text-muted-foreground",
    bg: "bg-muted/40",
    label: "Common",
  },
  rare: {
    ring: "ring-electric/30",
    text: "text-electric",
    bg: "bg-electric/10",
    label: "Rare",
  },
  epic: {
    ring: "ring-purple-brand/30",
    text: "text-purple-brand",
    bg: "bg-purple/10",
    label: "Epic",
  },
  legendary: {
    ring: "ring-gold/40",
    text: "text-gold",
    bg: "bg-gold/15",
    label: "Legendary",
  },
  special: {
    ring: "ring-emerald-brand/30",
    text: "text-emerald-brand",
    bg: "bg-emerald-brand/10",
    label: "Special Event",
  },
  vip: {
    ring: "ring-rose-brand/30",
    text: "text-rose-brand",
    bg: "bg-rose-brand/10",
    label: "VIP",
  },
};

function BadgeCard({
  name,
  description,
  rarity,
  progress,
  unlocked,
  locked,
  icon,
}: {
  name: string;
  description: string;
  rarity: Rarity;
  progress?: number;
  unlocked: boolean;
  locked?: boolean;
  icon: React.ReactNode;
}) {
  const r = rarityStyles[rarity];
  return (
    <motion.div
      variants={cardReveal}
      whileHover={locked ? undefined : hoverLift.whileHover}
      className={cn(
        "relative rounded-2xl p-4 glass-1 ring-1 transition-all flex flex-col items-center text-center gap-2",
        r.ring,
        locked && "opacity-60"
      )}
    >
      {locked && (
        <div className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
          <Lock size={10} /> Locked
        </div>
      )}
      <div className="relative">
        <div
          className={cn(
            "size-14 rounded-2xl flex items-center justify-center ring-1",
            r.bg,
            r.ring,
            r.text
          )}
        >
          {icon}
        </div>
        {unlocked && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.2 }}
            className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-brand text-white flex items-center justify-center ring-2 ring-background"
          >
            <CheckCircle2 size={12} />
          </motion.span>
        )}
      </div>
      <p className="text-xs font-semibold text-foreground truncate w-full">{name}</p>
      <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 min-h-[28px]">
        {description}
      </p>
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
          r.bg,
          r.text,
          r.ring
        )}
      >
        {r.label}
      </span>
      {!unlocked && progress !== undefined && (
        <div className="w-full mt-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("h-full rounded-full", r.bg)}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

/** DeviceCard — single device entry. */
function DeviceCard({
  icon,
  name,
  type,
  location,
  lastActive,
  current,
  trusted,
  locked,
}: {
  icon: React.ReactNode;
  name: string;
  type: string;
  location: string;
  lastActive: string;
  current?: boolean;
  trusted?: boolean;
  locked?: boolean;
}) {
  return (
    <motion.div
      variants={cardReveal}
      className={cn(
        "rounded-2xl p-4 ring-1 flex items-center gap-3 transition-all",
        current
          ? "glass-2 ring-electric/40 shadow-[0_8px_24px_-12px_oklch(0.62_0.22_255/0.35)]"
          : "glass-1 ring-border"
      )}
    >
      <div
        className={cn(
          "size-11 rounded-xl flex items-center justify-center ring-1 shrink-0",
          current
            ? "bg-electric/10 text-electric ring-electric/20"
            : "bg-muted/40 text-muted-foreground ring-border"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          {current && (
            <StatusBadge variant="success" dot pulse>
              Current
            </StatusBadge>
          )}
          {trusted && (
            <StatusBadge variant="info" dot>
              Trusted
            </StatusBadge>
          )}
          {locked && (
            <StatusBadge variant="default">
              <Lock size={10} /> Pending
            </StatusBadge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
          {type} · {location} · {lastActive}
        </p>
      </div>
      {!current && !locked && (
        <LootButton
          variant="ghost"
          size="sm"
          className="text-rose-brand hover:bg-rose-brand/10"
          leftIcon={<LogOut size={13} />}
          onClick={() => showToast("Device session", "Future: this device will be signed out.")}
        >
          Sign out
        </LootButton>
      )}
      {locked && <Lock size={14} className="text-muted-foreground/60" />}
    </motion.div>
  );
}

/** ConnectedAccountCard — third-party OAuth account row. */
function ConnectedAccountCard({
  icon,
  name,
  description,
  accent,
  connected,
  locked = false,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  accent: Accent;
  connected: boolean;
  locked?: boolean;
}) {
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/10 text-electric ring-electric/20",
    cyan: "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
    purple: "bg-purple/10 text-purple-brand ring-purple-brand/20",
    gold: "bg-gold/15 text-gold ring-gold/25",
    emerald: "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
    rose: "bg-rose-brand/10 text-rose-brand ring-rose-brand/20",
    navy: "bg-navy/10 text-navy ring-navy/20",
  };
  return (
    <motion.div
      variants={cardReveal}
      className={cn(
        "rounded-2xl p-4 glass-1 ring-1 ring-border flex items-center gap-3 transition-all",
        locked && "opacity-70"
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center size-10 rounded-xl ring-1 shrink-0",
          accentBg[accent]
        )}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          {locked && <Lock size={11} className="text-muted-foreground/60" />}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{description}</p>
      </div>
      {connected ? (
        <div className="flex items-center gap-2">
          <StatusBadge variant="success" dot>
            Connected
          </StatusBadge>
          <LootButton
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-rose-brand"
            onClick={() => showToast("Disconnect", `Future: disconnect ${name}.`)}
          >
            Disconnect
          </LootButton>
        </div>
      ) : (
        <LootButton
          variant={locked ? "outline" : "glass"}
          size="sm"
          disabled={locked}
          leftIcon={locked ? <Lock size={13} /> : <Plus size={13} />}
          onClick={() =>
            locked
              ? showToast("Coming soon", `${name} connection is not yet available.`)
              : showToast("Connect", `Future: connect your ${name} account.`)
          }
        >
          {locked ? "Soon" : "Connect"}
        </LootButton>
      )}
    </motion.div>
  );
}

/* ============================================================
   1. Profile Overview
   ============================================================ */

function ProfileOverview() {
  const { fullName, username, email, memberSince, level, xp, xpToNext, rank, dailyStreak } =
    useUserStore();
  const { availableCoins, lifetimeEarned } = useWalletStore();
  const initials = getInitials(fullName);
  const xpProgress = Math.min(100, Math.round((xp / xpToNext) * 100));

  return (
    <motion.div variants={cardReveal}>
      <GlassCard level={3} sheen className="overflow-hidden">
        {/* Cover banner */}
        <div className="relative h-28 sm:h-36 bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand)_45%,var(--purple-brand))]">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_30%,oklch(1_0_0/0.35),transparent_45%)]" />
          <motion.div
            variants={floating}
            animate="animate"
            className="absolute top-6 right-8 hidden sm:block"
          >
            <Hexagon className="text-white/30" size={64} strokeWidth={1.2} />
          </motion.div>
          <motion.div
            variants={floating}
            animate="animate"
            transition={{ delay: 1 }}
            className="absolute bottom-4 right-32 hidden md:block"
          >
            <Sparkles className="text-white/40" size={28} />
          </motion.div>
        </div>

        {/* Profile content */}
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative shrink-0"
            >
              <div className="size-24 sm:size-28 rounded-2xl ring-4 ring-background bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold shadow-[0_18px_40px_-18px_oklch(0.62_0.22_255/0.55)]">
                {initials}
              </div>
              <button
                type="button"
                aria-label="Change profile photo"
                onClick={() => showToast("Change photo", "Future: upload a new profile picture.")}
                className="absolute -bottom-1 -right-1 size-8 rounded-xl bg-background ring-1 ring-border flex items-center justify-center text-electric hover:bg-accent transition-colors"
              >
                <Camera size={14} />
              </button>
            </motion.div>

            {/* Identity */}
            <div className="flex-1 min-w-0 sm:mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                  {fullName}
                </h2>
                <StatusBadge variant="success" dot pulse>
                  Active
                </StatusBadge>
                <StatusBadge variant="info" dot>
                  <Shield size={11} /> Verified
                </StatusBadge>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <User size={12} /> {username}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail size={12} /> {email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone size={12} /> +91 ··· ··· 4280
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} /> Member since {memberSince}
                </span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 sm:mb-2">
              <LootButton
                variant="glass"
                size="sm"
                leftIcon={<Copy size={13} />}
                onClick={() => showToast("Profile link", "Future: copy your public profile URL.")}
              >
                Share
              </LootButton>
              <LootButton
                variant="electric"
                size="sm"
                leftIcon={<Edit size={13} />}
                onClick={() => showToast("Edit profile", "Open personal information section.")}
              >
                Edit
              </LootButton>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Level + XP ring */}
            <GlassCard level={1} className="p-4 flex items-center gap-3">
              <ProgressRing
                value={xpProgress}
                size={64}
                strokeWidth={6}
                gradient="purple"
                showLabel={false}
              />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                  Level
                </p>
                <p className="text-2xl font-bold text-foreground leading-none">
                  {level}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
                </p>
              </div>
            </GlassCard>

            {/* Coins */}
            <GlassCard level={1} className="p-4 flex items-center gap-3">
              <IconBadge name="Coins" accent="gold" size="sm" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                  Coins
                </p>
                <AnimatedCounter
                  value={availableCoins}
                  className="text-2xl font-bold text-foreground leading-none"
                />
                <p className="text-[11px] text-emerald-brand mt-0.5">
                  +{lifetimeEarned.toLocaleString()} earned
                </p>
              </div>
            </GlassCard>

            {/* Rank */}
            <GlassCard level={1} className="p-4 flex items-center gap-3">
              <IconBadge name="Crown" accent="electric" size="sm" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                  Global Rank
                </p>
                <p className="text-2xl font-bold text-foreground leading-none">
                  #{rank}
                </p>
                <p className="text-[11px] text-emerald-brand mt-0.5">
                  <TrendingUp size={10} className="inline" /> 8 this week
                </p>
              </div>
            </GlassCard>

            {/* Streak */}
            <GlassCard level={1} className="p-4 flex items-center gap-3">
              <IconBadge name="Flame" accent="rose" size="sm" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                  Daily Streak
                </p>
                <p className="text-2xl font-bold text-foreground leading-none">
                  {dailyStreak} days
                </p>
                <p className="text-[11px] text-gold mt-0.5">
                  <Flame size={10} className="inline" /> Keep it up!
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* A small local Edit icon (lucide's Pencil alias) */
function Edit({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

/* Plus icon local alias to avoid import collision when needed */
function Plus({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/* ============================================================
   2. Personal Information
   ============================================================ */

function PersonalInformation() {
  const { fullName, username, email, setUser } = useUserStore();
  const [form, setForm] = useState({
    fullName,
    username,
    email,
    phone: "+91 98765 43280",
    dob: "1998-04-12",
    country: "India",
    language: "English",
    timezone: "Asia/Kolkata (UTC+05:30)",
    bio: "Earning coins and climbing the leaderboard one mission at a time.",
    displayName: fullName,
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((s) => ({ ...s, [key]: value }));

  return (
    <WidgetCard
      title="Personal Information"
      description="Update your profile details — changes are display-only in this preview"
      icon={<User size={16} />}
      level={2}
      index={1}
      footer={
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <Info size={12} /> Saving is disabled in this preview
          </p>
          <LootButton
            variant="electric"
            size="sm"
            leftIcon={<Save size={14} />}
            onClick={() => {
              setUser({ fullName: form.fullName, username: form.username, email: form.email });
              showToast("Profile saved", "Your changes have been applied locally (preview).");
            }}
          >
            Save Changes
          </LootButton>
        </div>
      }
    >
      {/* Profile photo */}
      <div className="flex items-center gap-4 p-4 rounded-2xl glass-1 ring-1 ring-border mb-5">
        <div className="size-16 rounded-2xl bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] flex items-center justify-center text-white text-xl font-bold">
          {getInitials(form.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Profile Photo</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            PNG, JPG up to 4MB. Future: uploads to cloud storage.
          </p>
        </div>
        <LootButton
          variant="outline"
          size="sm"
          leftIcon={<Camera size={13} />}
          onClick={() => showToast("Photo upload", "Future: upload from device or URL.")}
        >
          Change
        </LootButton>
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name" icon={<User size={14} />}>
          <Input
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="h-11 rounded-xl glass-2 ring-1 ring-border px-3 text-sm focus:ring-electric/40"
          />
        </Field>
        <Field label="Display Name" icon={<Sparkles size={14} />}>
          <Input
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            className="h-11 rounded-xl glass-2 ring-1 ring-border px-3 text-sm focus:ring-electric/40"
          />
        </Field>
        <Field label="Username" icon={<AtSign />}>
          <Input
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            className="h-11 rounded-xl glass-2 ring-1 ring-border px-3 text-sm focus:ring-electric/40"
          />
        </Field>
        <Field label="Email Address" icon={<Mail size={14} />}>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="h-11 rounded-xl glass-2 ring-1 ring-border px-3 text-sm focus:ring-electric/40"
          />
        </Field>
        <Field label="Phone Number" icon={<Phone size={14} />}>
          <Input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="h-11 rounded-xl glass-2 ring-1 ring-border px-3 text-sm focus:ring-electric/40"
          />
        </Field>
        <Field label="Date of Birth" icon={<Calendar size={14} />}>
          <Input
            type="date"
            value={form.dob}
            onChange={(e) => update("dob", e.target.value)}
            className="h-11 rounded-xl glass-2 ring-1 ring-border px-3 text-sm focus:ring-electric/40"
          />
        </Field>
        <Field label="Country" icon={<MapPin size={14} />}>
          <Input
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className="h-11 rounded-xl glass-2 ring-1 ring-border px-3 text-sm focus:ring-electric/40"
          />
        </Field>
        <Field label="Language" icon={<Languages size={14} />}>
          <Input
            value={form.language}
            onChange={(e) => update("language", e.target.value)}
            className="h-11 rounded-xl glass-2 ring-1 ring-border px-3 text-sm focus:ring-electric/40"
          />
        </Field>
        <Field label="Timezone" icon={<Clock size={14} />}>
          <Input
            value={form.timezone}
            onChange={(e) => update("timezone", e.target.value)}
            className="h-11 rounded-xl glass-2 ring-1 ring-border px-3 text-sm focus:ring-electric/40"
          />
        </Field>
        <Field label="Website" icon={<Globe size={14} />}>
          <Input
            placeholder="https://your-profile.lootloom.app"
            className="h-11 rounded-xl glass-2 ring-1 ring-border px-3 text-sm focus:ring-electric/40"
          />
        </Field>
      </div>

      {/* Bio */}
      <div className="mt-4">
        <Field label="Bio" icon={<Type size={14} />}>
          <textarea
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={3}
            maxLength={200}
            className="w-full rounded-xl glass-2 ring-1 ring-border px-3 py-2 text-sm focus:ring-electric/40 outline-none resize-none"
          />
          <p className="text-[11px] text-muted-foreground mt-1 text-right">
            {form.bio.length} / 200
          </p>
        </Field>
      </div>

      {/* Social links */}
      <div className="mt-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
          Social Links (placeholders)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Twitter / X", value: "@lootloom_member" },
            { label: "Discord", value: "member#0420" },
            { label: "GitHub", value: "lootloom-member" },
            { label: "Telegram", value: "@member" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 rounded-xl glass-1 ring-1 ring-border px-3 py-2"
            >
              <ExternalLink size={13} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase text-muted-foreground">{s.label}</p>
                <Input
                  defaultValue={s.value}
                  className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
                />
              </div>
              <Lock size={11} className="text-muted-foreground/50 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold inline-flex items-center gap-1.5">
        {icon && <span className="text-electric">{icon}</span>}
        {label}
      </span>
      {children}
    </label>
  );
}

function AtSign() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  );
}

/* ============================================================
   3. Account Security
   ============================================================ */

function AccountSecurity() {
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const securityScore = 72;

  return (
    <WidgetCard
      title="Account Security"
      description="Protect your account with multi-layer verification"
      icon={<Shield size={16} />}
      level={2}
      index={2}
      action={
        <StatusBadge variant="success" dot pulse>
          Secured
        </StatusBadge>
      }
    >
      {/* Security score banner */}
      <div className="flex items-center gap-5 p-4 rounded-2xl glass-1 ring-1 ring-border mb-4">
        <ProgressRing
          value={securityScore}
          size={86}
          strokeWidth={8}
          gradient="emerald"
          label={`${securityScore}%`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Security Score</p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            Good protection. Enable 2FA & verify your phone to reach 100%.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <LootButton
              variant="emerald"
              size="sm"
              leftIcon={<Shield size={13} />}
              onClick={() => showToast("Security audit", "Future: run a full security audit.")}
            >
              Improve
            </LootButton>
          </div>
        </div>
      </div>

      {/* Status rows */}
      <div className="rounded-2xl glass-1 ring-1 ring-border p-4 divide-y divide-border/60">
        <SettingRow
          icon={<KeyRound size={15} />}
          label="Password"
          description="Last changed 3 months ago"
          accent="emerald"
        >
          <StatusBadge variant="success" dot>
            Strong
          </StatusBadge>
          <LootButton
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => showToast("Change password", "Future: open password change flow.")}
          >
            Change
          </LootButton>
        </SettingRow>

        <SettingRow
          icon={<Mail size={15} />}
          label="Email Verification"
          description="member@lootloom.app verified"
          accent="emerald"
        >
          <StatusBadge variant="success" dot>
            Verified
          </StatusBadge>
        </SettingRow>

        <SettingRow
          icon={<Phone size={15} />}
          label="Phone Verification"
          description="+91 ··· ··· 4280 — verify to boost security"
          accent="gold"
        >
          <StatusBadge variant="warning" dot>
            Pending
          </StatusBadge>
          <LootButton
            variant="glass"
            size="sm"
            className="ml-2"
            onClick={() => showToast("Verify phone", "Future: send OTP to your phone.")}
          >
            Verify
          </LootButton>
        </SettingRow>

        <SettingRow
          icon={<Smartphone size={15} />}
          label="Two-Factor Authentication"
          description="Add an extra layer of protection"
          accent="electric"
        >
          <Switch checked={twoFA} onCheckedChange={setTwoFA} aria-label="2FA" />
        </SettingRow>

        <SettingRow
          icon={<Fingerprint size={15} />}
          label="Biometric Login"
          description="Use fingerprint or face unlock"
          accent="purple"
          locked
        >
          <Switch checked={biometric} onCheckedChange={setBiometric} disabled aria-label="Biometric" />
        </SettingRow>

        <SettingRow
          icon={<Monitor size={15} />}
          label="Trusted Devices"
          description="3 devices recognised"
          accent="cyan"
          locked
        >
          <LootButton variant="ghost" size="sm" onClick={() => showToast("Trusted devices", "Future: manage trusted device list.")}>
            Manage
          </LootButton>
        </SettingRow>

        <SettingRow
          icon={<History size={15} />}
          label="Login History"
          description="Recent sign-in activity"
          accent="navy"
        >
          <SkeletonRow count={1} />
        </SettingRow>

        <SettingRow
          icon={<KeyRound size={15} />}
          label="Recovery Codes"
          description="Generate backup codes for account recovery"
          accent="rose"
          locked
        >
          <LootButton
            variant="outline"
            size="sm"
            leftIcon={<Lock size={12} />}
            onClick={() => showToast("Recovery codes", "Future: generate single-use recovery codes.")}
          >
            Generate
          </LootButton>
        </SettingRow>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   4. Privacy Center
   ============================================================ */

function PrivacyCenter() {
  const [toggles, setToggles] = useState({
    profile: true,
    activity: true,
    leaderboard: true,
    referral: true,
    dataSharing: false,
    publicProfile: false,
    search: true,
  });

  const set = (k: keyof typeof toggles) => (v: boolean) => {
    setToggles((s) => ({ ...s, [k]: v }));
    showToast("Privacy updated", "Future: this preference will be saved to your account.");
  };

  return (
    <WidgetCard
      title="Privacy Center"
      description="Control who can see your activity and information"
      icon={<Eye size={16} />}
      level={2}
      index={3}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ToggleCard
          icon={<User size={16} />}
          label="Profile Visibility"
          description="Show your profile to other members"
          checked={toggles.profile}
          onChange={set("profile")}
          accent="electric"
        />
        <ToggleCard
          icon={<History size={16} />}
          label="Activity Visibility"
          description="Share recent activity publicly"
          checked={toggles.activity}
          onChange={set("activity")}
          accent="cyan"
        />
        <ToggleCard
          icon={<Crown size={16} />}
          label="Leaderboard Visibility"
          description="Appear in global leaderboards"
          checked={toggles.leaderboard}
          onChange={set("leaderboard")}
          accent="gold"
        />
        <ToggleCard
          icon={<Users size={16} />}
          label="Referral Visibility"
          description="Show your referral code publicly"
          checked={toggles.referral}
          onChange={set("referral")}
          accent="emerald"
        />
        <ToggleCard
          icon={<HardDrive size={16} />}
          label="Data Sharing"
          description="Allow anonymous analytics sharing"
          checked={toggles.dataSharing}
          onChange={set("dataSharing")}
          accent="purple"
          locked
        />
        <ToggleCard
          icon={<Globe size={16} />}
          label="Public Profile"
          description="Enable a public profile URL"
          checked={toggles.publicProfile}
          onChange={set("publicProfile")}
          accent="rose"
          locked
        />
        <ToggleCard
          icon={<Search />}
          label="Search Visibility"
          description="Allow members to find you by username"
          checked={toggles.search}
          onChange={set("search")}
          accent="navy"
        />
      </div>
    </WidgetCard>
  );
}

function Search() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* ============================================================
   5. Appearance Settings
   ============================================================ */

function AppearanceSettings() {
  const { theme, setTheme, sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const [toggles, setToggles] = useState({
    animations: true,
    reducedMotion: false,
    compact: false,
    highContrast: false,
    accessibilityTheme: false,
  });

  const accentSwatches: { name: string; className: string }[] = [
    { name: "Electric", className: "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))]" },
    { name: "Purple", className: "bg-[linear-gradient(120deg,var(--purple-brand),oklch(0.7_0.2_320))]" },
    { name: "Gold", className: "bg-[linear-gradient(120deg,var(--gold),oklch(0.75_0.18_60))]" },
    { name: "Emerald", className: "bg-[linear-gradient(120deg,var(--emerald-brand),oklch(0.75_0.16_180))]" },
    { name: "Rose", className: "bg-[linear-gradient(120deg,var(--rose-brand),oklch(0.7_0.18_30))]" },
    { name: "Navy", className: "bg-[linear-gradient(120deg,var(--navy),oklch(0.4_0.06_260))]" },
  ];
  const [accent, setAccent] = useState("Electric");

  return (
    <WidgetCard
      title="Appearance Settings"
      description="Personalize how LootLoom looks and feels"
      icon={<Palette size={16} />}
      level={2}
      index={4}
    >
      {/* Theme toggle */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl glass-1 ring-1 ring-border mb-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 rounded-xl glass-2 ring-1 ring-border">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                theme === "light" ? "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sun size={13} /> Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                theme === "dark" ? "bg-[linear-gradient(120deg,var(--purple-brand),oklch(0.7_0.2_320))] text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Moon size={13} /> Dark
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">Theme</p>
          <p className="text-[11px] text-muted-foreground">Currently {theme === "light" ? "Light" : "Dark"}</p>
        </div>
      </div>

      {/* Accent color */}
      <div className="p-4 rounded-2xl glass-1 ring-1 ring-border mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Accent Color</p>
            <p className="text-[11px] text-muted-foreground">Choose your signature gradient</p>
          </div>
          <StatusBadge variant="default">{accent}</StatusBadge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {accentSwatches.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => {
                setAccent(s.name);
                showToast("Accent color", `Future: apply ${s.name} accent across the app.`);
              }}
              aria-label={s.name}
              className={cn(
                "size-9 rounded-xl ring-1 ring-border transition-all hover:scale-110",
                s.className,
                accent === s.name && "ring-2 ring-offset-2 ring-offset-background ring-electric"
              )}
            />
          ))}
        </div>
      </div>

      {/* Sidebar mode */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl glass-1 ring-1 ring-border mb-4">
        <div className="flex items-start gap-3">
          <span className="text-electric mt-0.5"><Monitor size={15} /></span>
          <div>
            <p className="text-sm font-semibold text-foreground">Sidebar Mode</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {sidebarCollapsed ? "Collapsed (icons only)" : "Expanded (full labels)"}
            </p>
          </div>
        </div>
        <div className="inline-flex p-1 rounded-xl glass-2 ring-1 ring-border">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              !sidebarCollapsed ? "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Expanded
          </button>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              sidebarCollapsed ? "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Collapsed
          </button>
        </div>
      </div>

      {/* Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <SelectField label="Glass Intensity" icon={<Sparkles size={14} />} defaultValue="High" options={["Low", "Medium", "High", "Ultra"]} />
        <SelectField label="Font Size" icon={<Type size={14} />} defaultValue="Medium" options={["Small", "Medium", "Large", "Extra Large"]} />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ToggleCard
          icon={<Zap size={16} />}
          label="Animations"
          description="Enable motion and transition effects"
          checked={toggles.animations}
          onChange={(v) => setToggles((s) => ({ ...s, animations: v }))}
          accent="electric"
        />
        <ToggleCard
          icon={<Eye size={16} />}
          label="Reduced Motion"
          description="Minimize non-essential animations"
          checked={toggles.reducedMotion}
          onChange={(v) => setToggles((s) => ({ ...s, reducedMotion: v }))}
          accent="cyan"
        />
        <ToggleCard
          icon={<Monitor size={16} />}
          label="Compact Mode"
          description="Reduce spacing for denser layouts"
          checked={toggles.compact}
          onChange={(v) => setToggles((s) => ({ ...s, compact: v }))}
          accent="purple"
        />
        <ToggleCard
          icon={<Type size={16} />}
          label="High Contrast"
          description="Improve readability with stronger contrast"
          checked={toggles.highContrast}
          onChange={(v) => setToggles((s) => ({ ...s, highContrast: v }))}
          accent="gold"
          locked
        />
        <ToggleCard
          icon={<Accessibility />}
          label="Accessibility Theme"
          description="Optimized for visual impairments"
          checked={toggles.accessibilityTheme}
          onChange={(v) => setToggles((s) => ({ ...s, accessibilityTheme: v }))}
          accent="emerald"
          locked
        />
      </div>
    </WidgetCard>
  );
}

function Accessibility() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="4" r="1" />
      <path d="m9 20 3-6 3 6" />
      <path d="m6 8 6 2 6-2" />
      <path d="M12 10v4" />
    </svg>
  );
}

function SelectField({
  label,
  icon,
  defaultValue,
  options,
}: {
  label: string;
  icon?: React.ReactNode;
  defaultValue: string;
  options: string[];
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="rounded-2xl glass-1 ring-1 ring-border p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold inline-flex items-center gap-1.5 mb-2">
        {icon && <span className="text-electric">{icon}</span>}
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => {
              setValue(o);
              showToast(label, `Future: apply ${o} ${label.toLowerCase()}.`);
            }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
              value === o
                ? "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] text-white"
                : "glass-2 ring-1 ring-border text-muted-foreground hover:text-foreground"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   6. Notification Preferences
   ============================================================ */

function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    reward: true,
    wallet: true,
    redeem: true,
    referral: true,
    achievement: true,
    security: true,
    support: true,
    announcements: true,
    email: true,
    push: false,
    sms: false,
  });

  const toggle = (k: string) => (v: boolean) => {
    setPrefs((s) => ({ ...s, [k]: v }));
    showToast("Notification preference", "Future: preferences will sync to your devices.");
  };

  const channels: { key: string; label: string; description: string; icon: React.ReactNode; accent: Accent; locked?: boolean }[] = [
    { key: "reward", label: "Reward Notifications", description: "When you earn coins", icon: <Gift size={16} />, accent: "gold" },
    { key: "wallet", label: "Wallet Notifications", description: "Balance updates & transactions", icon: <Coins size={16} />, accent: "electric" },
    { key: "redeem", label: "Redeem Notifications", description: "Redeem status changes", icon: <ShoppingBagIcon />, accent: "purple" },
    { key: "referral", label: "Referral Notifications", description: "Friend joins and rewards", icon: <Users size={16} />, accent: "emerald" },
    { key: "achievement", label: "Achievement Notifications", description: "Badges & milestones", icon: <Trophy size={16} />, accent: "cyan" },
    { key: "security", label: "Security Alerts", description: "Sign-ins & account changes", icon: <Shield size={16} />, accent: "rose" },
    { key: "support", label: "Support Updates", description: "Ticket replies & resolutions", icon: <LifeBuoy size={16} />, accent: "navy" },
    { key: "announcements", label: "Announcements", description: "Platform news & updates", icon: <Sparkles size={16} />, accent: "electric" },
    { key: "email", label: "Email Channel", description: "Receive notifications by email", icon: <Mail size={16} />, accent: "cyan" },
    { key: "push", label: "Push Channel", description: "Browser & app push notifications", icon: <Bell size={16} />, accent: "purple", locked: true },
    { key: "sms", label: "SMS Channel", description: "Critical alerts by SMS", icon: <Phone size={16} />, accent: "gold", locked: true },
  ];

  return (
    <WidgetCard
      title="Notification Preferences"
      description="Choose what you want to be notified about"
      icon={<Bell size={16} />}
      level={2}
      index={5}
      action={
        <LootButton
          variant="ghost"
          size="sm"
          onClick={() => {
            setPrefs(Object.fromEntries(Object.keys(prefs).map((k) => [k, true])));
            showToast("All enabled", "Every notification channel turned on.");
          }}
        >
          Enable all
        </LootButton>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {channels.map((c) => (
          <ToggleCard
            key={c.key}
            icon={c.icon}
            label={c.label}
            description={c.description}
            checked={prefs[c.key]}
            onChange={toggle(c.key)}
            accent={c.accent}
            locked={c.locked}
          />
        ))}
      </div>
    </WidgetCard>
  );
}

function ShoppingBagIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function LifeBuoy({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="m4.93 4.93 4.24 4.24" />
      <path d="m14.83 9.17 4.24-4.24" />
      <path d="m14.83 14.83 4.24 4.24" />
      <path d="m9.17 14.83-4.24 4.24" />
    </svg>
  );
}

/* ============================================================
   7. Connected Accounts
   ============================================================ */

function ConnectedAccounts() {
  const accounts: {
    name: string;
    description: string;
    icon: React.ReactNode;
    accent: Accent;
    connected: boolean;
    locked?: boolean;
  }[] = [
    {
      name: "Google",
      description: "Sign in with Google account",
      icon: <Chrome size={18} />,
      accent: "electric",
      connected: true,
    },
    {
      name: "Apple",
      description: "Sign in with Apple ID",
      icon: <Apple size={18} />,
      accent: "navy",
      connected: false,
      locked: true,
    },
    {
      name: "Facebook",
      description: "Connect Facebook for social sharing",
      icon: <Facebook size={18} />,
      accent: "cyan",
      connected: false,
    },
    {
      name: "GitHub",
      description: "Link GitHub for developer perks",
      icon: <Github size={18} />,
      accent: "navy",
      connected: false,
    },
    {
      name: "Discord",
      description: "Join our Discord community",
      icon: <MessageCircle size={18} />,
      accent: "purple",
      connected: true,
    },
    {
      name: "Telegram",
      description: "Connect Telegram for alerts",
      icon: <SendIcon />,
      accent: "cyan",
      connected: false,
      locked: true,
    },
    {
      name: "Twitter / X",
      description: "Share rewards to Twitter",
      icon: <XIcon />,
      accent: "navy",
      connected: false,
      locked: true,
    },
  ];

  return (
    <WidgetCard
      title="Connected Accounts"
      description="Link third-party accounts (placeholders — OAuth not implemented)"
      icon={<Globe size={16} />}
      level={2}
      index={6}
      action={
        <StatusBadge variant="default">
          <Lock size={11} /> OAuth placeholder
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {accounts.map((a) => (
          <ConnectedAccountCard key={a.name} {...a} />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 inline-flex items-center gap-1.5">
        <Info size={12} />
        OAuth integration is on the roadmap — no third-party credentials are stored.
      </p>
    </WidgetCard>
  );
}

function SendIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ============================================================
   8. Account Statistics
   ============================================================ */

function AccountStatistics() {
  const { level, rank, dailyStreak, xp } = useUserStore();
  const { availableCoins, lifetimeEarned, lifetimeRedeemed, todayEarnings } = useWalletStore();

  const stats = [
    {
      label: "Lifetime Earnings",
      value: lifetimeEarned,
      icon: "TrendingUp",
      accent: "emerald" as Accent,
      trend: { value: 12, positive: true },
    },
    {
      label: "Lifetime Redeems",
      value: lifetimeRedeemed,
      icon: "Gift",
      accent: "purple" as Accent,
      trend: { value: 6, positive: true },
    },
    {
      label: "Referral Count",
      value: 24,
      icon: "Users",
      accent: "cyan" as Accent,
      trend: { value: 18, positive: true },
    },
    {
      label: "Achievements",
      value: 14,
      icon: "Trophy",
      accent: "gold" as Accent,
      trend: { value: 3, positive: true },
    },
    {
      label: "Missions Completed",
      value: 87,
      icon: "Target",
      accent: "electric" as Accent,
      trend: { value: 9, positive: true },
    },
    {
      label: "Leaderboard Rank",
      value: rank,
      prefix: "#",
      icon: "Crown",
      accent: "rose" as Accent,
      trend: { value: 8, positive: true },
    },
    {
      label: "Daily Streak",
      value: dailyStreak,
      suffix: "d",
      icon: "Flame",
      accent: "rose" as Accent,
    },
    {
      label: "Current Level",
      value: level,
      icon: "Sparkles",
      accent: "navy" as Accent,
    },
  ];

  return (
    <WidgetCard
      title="Account Statistics"
      description="Lifetime performance across the platform"
      icon={<TrendingUp size={16} />}
      level={2}
      index={7}
    >
      <Grid cols={4}>
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            prefix={s.prefix}
            suffix={s.suffix}
            icon={s.icon}
            accent={s.accent}
            trend={s.trend}
            index={i}
          />
        ))}
      </Grid>

      {/* Wallet summary */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <GlassCard level={1} className="p-4 flex items-center gap-3">
          <IconBadge name="Wallet" accent="electric" size="sm" />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              Available Coins
            </p>
            <AnimatedCounter
              value={availableCoins}
              className="text-xl font-bold text-foreground"
            />
          </div>
        </GlassCard>
        <GlassCard level={1} className="p-4 flex items-center gap-3">
          <IconBadge name="Clock" accent="gold" size="sm" />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              Today&apos;s Earnings
            </p>
            <AnimatedCounter
              value={todayEarnings}
              className="text-xl font-bold text-foreground"
            />
          </div>
        </GlassCard>
        <GlassCard level={1} className="p-4 flex items-center gap-3">
          <IconBadge name="Zap" accent="purple" size="sm" />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              Total XP
            </p>
            <AnimatedCounter
              value={xp}
              className="text-xl font-bold text-foreground"
            />
          </div>
        </GlassCard>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   9. Badge Collection
   ============================================================ */

const BADGES: {
  name: string;
  description: string;
  rarity: Rarity;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  locked?: boolean;
}[] = [
  { name: "First Steps", description: "Complete your first mission", rarity: "common", icon: <Target size={22} />, unlocked: true },
  { name: "Coin Collector", description: "Earn 1,000 coins", rarity: "rare", icon: <Coins size={22} />, unlocked: true },
  { name: "Streak Keeper", description: "Maintain a 7-day streak", rarity: "rare", icon: <Flame size={22} />, unlocked: true },
  { name: "Social Star", description: "Refer 5 friends", rarity: "epic", icon: <Users size={22} />, unlocked: true, progress: 60 },
  { name: "Mission Master", description: "Complete 50 missions", rarity: "epic", icon: <Award size={22} />, unlocked: false, progress: 74 },
  { name: "Reward Connoisseur", description: "Redeem 10 rewards", rarity: "epic", icon: <Gift size={22} />, unlocked: false, progress: 40 },
  { name: "Legendary Earner", description: "Earn 50,000 lifetime coins", rarity: "legendary", icon: <Crown size={22} />, unlocked: false, progress: 92 },
  { name: "Summer Sprint", description: "Participate in the summer event", rarity: "special", icon: <Star size={22} />, unlocked: true },
  { name: "VIP Member", description: "Unlock exclusive VIP perks", rarity: "vip", icon: <Sparkles size={22} />, unlocked: false, locked: true },
  { name: "Anniversary Badge", description: "Celebrate 1 year on LootLoom", rarity: "special", icon: <Hexagon size={22} />, unlocked: false, progress: 35 },
];

function BadgeCollection() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? BADGES : BADGES.slice(0, 8);
  const unlockedCount = BADGES.filter((b) => b.unlocked).length;

  return (
    <WidgetCard
      title="Badge Collection"
      description={`${unlockedCount} of ${BADGES.length} badges unlocked`}
      icon={<Award size={16} />}
      level={2}
      index={8}
      action={
        <LootButton
          variant="glass"
          size="sm"
          rightIcon={<ChevronRight size={13} />}
          onClick={() => useNavigationStore.getState().navigate("achievements")}
        >
          View all
        </LootButton>
      }
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        {visible.map((b) => (
          <BadgeCard key={b.name} {...b} />
        ))}
      </motion.div>

      {BADGES.length > 8 && (
        <div className="mt-4 flex justify-center">
          <LootButton variant="ghost" size="sm" onClick={() => setShowAll((s) => !s)}>
            {showAll ? "Show less" : `Show all ${BADGES.length}`}
          </LootButton>
        </div>
      )}
    </WidgetCard>
  );
}

/* ============================================================
   10. Activity Summary
   ============================================================ */

function ActivitySummary() {
  const navigate = useNavigationStore((s) => s.navigate);
  const items = [
    { type: "login", label: "Recent Login", description: "Signed in from Chrome · Mumbai, India", time: "2 hours ago", icon: <LogInIcon />, accent: "emerald" as Accent },
    { type: "wallet", label: "Recent Wallet Activity", description: "Earned 145 coins today", time: "5 hours ago", icon: <Wallet size={16} />, accent: "electric" as Accent },
    { type: "reward", label: "Recent Reward", description: "Redeem request submitted for ₹100 UPI", time: "Yesterday", icon: <Gift size={16} />, accent: "purple" as Accent },
    { type: "notification", label: "Recent Notification", description: "Daily bonus is ready to claim", time: "Today", icon: <Bell size={16} />, accent: "gold" as Accent },
    { type: "redeem", label: "Recent Redeem", description: "Gift card redeem processed", time: "2 days ago", icon: <ShoppingBagIcon />, accent: "rose" as Accent },
  ];

  return (
    <WidgetCard
      title="Activity Summary"
      description="Recent account events (placeholders for future backend data)"
      icon={<History size={16} />}
      level={2}
      index={9}
      action={
        <LootButton
          variant="ghost"
          size="sm"
          rightIcon={<ChevronRight size={13} />}
          onClick={() => navigate("history")}
        >
          Full history
        </LootButton>
      }
    >
      <div className="relative pl-6">
        {/* Timeline line */}
        <div className="absolute left-2 top-2 bottom-2 w-px bg-[linear-gradient(180deg,var(--electric),var(--purple-brand))]" />
        <div className="space-y-3">
          {items.map((it, i) => (
            <motion.div
              key={it.type}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              <span className="absolute -left-[18px] top-3 size-3 rounded-full bg-background ring-2 ring-electric flex items-center justify-center">
                <span className="size-1.5 rounded-full bg-electric" />
              </span>
              <GlassCard level={1} className="p-3.5 flex items-start gap-3">
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl ring-1 size-9 shrink-0",
                    it.accent === "emerald" && "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
                    it.accent === "electric" && "bg-electric/10 text-electric ring-electric/20",
                    it.accent === "purple" && "bg-purple/10 text-purple-brand ring-purple-brand/20",
                    it.accent === "gold" && "bg-gold/15 text-gold ring-gold/25",
                    it.accent === "rose" && "bg-rose-brand/10 text-rose-brand ring-rose-brand/20"
                  )}
                >
                  {it.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{it.label}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{it.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{it.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          {/* Future device activity — skeleton */}
          <motion.div variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
            <span className="absolute -left-[18px] top-3 size-3 rounded-full bg-background ring-2 ring-muted-foreground/30 flex items-center justify-center">
              <Lock size={8} className="text-muted-foreground/60" />
            </span>
            <GlassCard level={1} className="p-3.5 opacity-70">
              <SkeletonRow count={1} />
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </WidgetCard>
  );
}

function LogInIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

/* ============================================================
   11. Device Management
   ============================================================ */

function DeviceManagement() {
  return (
    <WidgetCard
      title="Device Management"
      description="Manage devices signed into your account"
      icon={<Smartphone size={16} />}
      level={2}
      index={10}
      action={
        <LootButton
          variant="ghost"
          size="sm"
          leftIcon={<LogOut size={13} />}
          onClick={() => showToast("Logout all", "Future: sign out from every device.")}
        >
          Logout all
        </LootButton>
      }
    >
      <div className="space-y-3">
        <DeviceCard
          icon={<Monitor size={18} />}
          name="Windows · Chrome"
          type="Desktop"
          location="Mumbai, India"
          lastActive="Active now"
          current
          trusted
        />
        <DeviceCard
          icon={<Smartphone size={18} />}
          name="iPhone 14 · Safari"
          type="Mobile"
          location="Mumbai, India"
          lastActive="2 hours ago"
          trusted
        />
        <DeviceCard
          icon={<Laptop size={18} />}
          name="MacBook Pro · Chrome"
          type="Laptop"
          location="Pune, India"
          lastActive="Yesterday"
        />
        <DeviceCard
          icon={<Tablet size={18} />}
          name="iPad Air · Safari"
          type="Tablet"
          location="Goa, India"
          lastActive="3 days ago"
          locked
        />

        {/* Trusted / session placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <GlassCard level={1} className="p-4 ring-1 ring-border opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={15} className="text-emerald-brand" />
              <p className="text-sm font-semibold text-foreground">Trusted Devices</p>
              <Lock size={11} className="text-muted-foreground/60 ml-auto" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Future: pin trusted devices so they skip 2FA prompts.
            </p>
          </GlassCard>
          <GlassCard level={1} className="p-4 ring-1 ring-border opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Power size={15} className="text-gold" />
              <p className="text-sm font-semibold text-foreground">Session Management</p>
              <Lock size={11} className="text-muted-foreground/60 ml-auto" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Future: view active sessions and revoke individually.
            </p>
          </GlassCard>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   12. Download Data
   ============================================================ */

function DownloadData() {
  const items: {
    title: string;
    description: string;
    icon: React.ReactNode;
    accent: Accent;
    format: string;
  }[] = [
    { title: "Export Profile", description: "Your personal info & preferences", icon: <User size={16} />, accent: "electric", format: "JSON · CSV" },
    { title: "Export Wallet", description: "Coin balances & wallet history", icon: <Wallet size={16} />, accent: "gold", format: "CSV · PDF" },
    { title: "Export History", description: "Activity log & sign-in events", icon: <History size={16} />, accent: "purple", format: "JSON" },
    { title: "Export Rewards", description: "Redeem requests & statuses", icon: <Gift size={16} />, accent: "rose", format: "CSV" },
    { title: "GDPR Export", description: "Full data export (right to access)", icon: <Shield size={16} />, accent: "emerald", format: "ZIP archive" },
  ];

  return (
    <WidgetCard
      title="Download Your Data"
      description="Export a copy of your account data (placeholders — not implemented)"
      icon={<Download size={16} />}
      level={2}
      index={11}
      action={
        <StatusBadge variant="default">
          <Lock size={11} /> Placeholder
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {items.map((it) => (
          <motion.div
            key={it.title}
            variants={cardReveal}
            className="flex items-center gap-3 p-4 rounded-2xl glass-1 ring-1 ring-border"
          >
            <span
              className={cn(
                "inline-flex items-center justify-center size-10 rounded-xl ring-1 shrink-0",
                it.accent === "electric" && "bg-electric/10 text-electric ring-electric/20",
                it.accent === "gold" && "bg-gold/15 text-gold ring-gold/25",
                it.accent === "purple" && "bg-purple/10 text-purple-brand ring-purple-brand/20",
                it.accent === "rose" && "bg-rose-brand/10 text-rose-brand ring-rose-brand/20",
                it.accent === "emerald" && "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20"
              )}
            >
              {it.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{it.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{it.description}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5 inline-flex items-center gap-1">
                <FileText size={10} /> {it.format}
              </p>
            </div>
            <LootButton
              variant="outline"
              size="sm"
              leftIcon={<Download size={13} />}
              disabled
              onClick={() => showToast("Export", `Future: generate ${it.title} export.`)}
            >
              Export
            </LootButton>
          </motion.div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 inline-flex items-center gap-1.5">
        <Info size={12} />
        Data exports are queued and emailed to your verified address.
      </p>
    </WidgetCard>
  );
}

/* ============================================================
   13. Danger Zone
   ============================================================ */

function DangerZone() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [dialog, setDialog] = useState<null | "password" | "logout" | "delete" | "recovery" | "deactivate">(null);

  const actions: {
    key: typeof dialog;
    title: string;
    description: string;
    icon: React.ReactNode;
    confirmLabel: string;
    variant: "danger" | "warning";
    onConfirm: () => void;
  }[] = [
    {
      key: "password",
      title: "Change Password",
      description: "Future: rotate your account password immediately.",
      icon: <KeyRound size={16} />,
      confirmLabel: "Continue",
      variant: "warning",
      onConfirm: () => showToast("Change password", "Future: open password change flow."),
    },
    {
      key: "logout",
      title: "Logout All Devices",
      description: "Sign out of every active session across all devices.",
      icon: <LogOut size={16} />,
      confirmLabel: "Logout everywhere",
      variant: "danger",
      onConfirm: () => showToast("Logout all", "Future: every session will be revoked."),
    },
    {
      key: "recovery",
      title: "Account Recovery",
      description: "Future: start a recovery flow using backup codes or email.",
      icon: <RefreshCw size={16} />,
      confirmLabel: "Start recovery",
      variant: "warning",
      onConfirm: () => showToast("Account recovery", "Future: launch the recovery wizard."),
    },
    {
      key: "deactivate",
      title: "Deactivate Account",
      description: "Temporarily disable your account. You can reactivate later.",
      icon: <Power size={16} />,
      confirmLabel: "Deactivate",
      variant: "danger",
      onConfirm: () => showToast("Deactivate", "Future: your account will be deactivated."),
    },
    {
      key: "delete",
      title: "Delete Account",
      description: "Permanently erase your account and all associated data.",
      icon: <Trash2 size={16} />,
      confirmLabel: "Delete forever",
      variant: "danger",
      onConfirm: () => {
        showToast("Account deletion", "Future: confirm via email to complete deletion.");
        navigate("home");
      },
    },
  ];

  const dialogMeta: Record<
    NonNullable<typeof dialog>,
    { title: string; description: string; confirmLabel: string; variant: "danger" | "warning"; icon: React.ReactNode; onConfirm: () => void }
  > = {
    password: {
      title: "Change your password?",
      description: "You'll be asked to enter your current password and choose a new one. This won't sign you out of trusted devices.",
      confirmLabel: "Continue",
      variant: "warning",
      icon: <KeyRound size={24} />,
      onConfirm: () => showToast("Change password", "Future: open password change flow."),
    },
    logout: {
      title: "Logout of all devices?",
      description: "This will immediately end every active session, including this one. You'll need to sign in again.",
      confirmLabel: "Logout everywhere",
      variant: "danger",
      icon: <LogOut size={24} />,
      onConfirm: () => showToast("Logout all", "Future: every session will be revoked."),
    },
    recovery: {
      title: "Start account recovery?",
      description: "We'll guide you through verifying your identity using backup codes or your verified email address.",
      confirmLabel: "Start recovery",
      variant: "warning",
      icon: <RefreshCw size={24} />,
      onConfirm: () => showToast("Account recovery", "Future: launch the recovery wizard."),
    },
    deactivate: {
      title: "Deactivate your account?",
      description: "Your profile will be hidden and you'll stop earning coins. You can reactivate by signing in again within 90 days.",
      confirmLabel: "Deactivate",
      variant: "danger",
      icon: <Power size={24} />,
      onConfirm: () => showToast("Deactivate", "Future: your account will be deactivated."),
    },
    delete: {
      title: "Permanently delete your account?",
      description: "This action cannot be undone. All coins, rewards, badges, and history will be erased. A confirmation email will be sent to complete the deletion.",
      confirmLabel: "Delete forever",
      variant: "danger",
      icon: <Trash2 size={24} />,
      onConfirm: () => {
        showToast("Account deletion", "Future: confirm via email to complete deletion.");
        navigate("home");
      },
    },
  };

  return (
    <>
      <WidgetCard
        title="Danger Zone"
        description="Irreversible and sensitive actions — proceed with caution"
        icon={<AlertTriangle size={16} />}
        level={2}
        index={12}
        glow="none"
        bodyClassName="rounded-2xl ring-1 ring-rose-brand/20 bg-rose-brand/[0.03]"
      >
        <div className="space-y-3">
          {actions.map((a) => (
            <motion.div
              key={a.key}
              variants={cardReveal}
              className="flex items-center gap-3 p-4 rounded-2xl bg-rose-brand/[0.04] ring-1 ring-rose-brand/20"
            >
              <span className="inline-flex items-center justify-center size-10 rounded-xl bg-rose-brand/10 text-rose-brand ring-1 ring-rose-brand/20 shrink-0">
                {a.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{a.description}</p>
              </div>
              <LootButton
                variant={a.variant === "danger" ? "destructive" : "outline"}
                size="sm"
                leftIcon={a.variant === "danger" ? <AlertTriangle size={13} /> : <ChevronRight size={13} />}
                onClick={() => setDialog(a.key)}
              >
                {a.variant === "danger" ? "Danger" : "Open"}
              </LootButton>
            </motion.div>
          ))}
        </div>
      </WidgetCard>

      <AnimatePresence>
        {dialog && (
          <ConfirmDialog
            open={!!dialog}
            onOpenChange={(v) => !v && setDialog(null)}
            title={dialogMeta[dialog].title}
            description={dialogMeta[dialog].description}
            confirmLabel={dialogMeta[dialog].confirmLabel}
            icon={dialogMeta[dialog].icon}
            variant={dialogMeta[dialog].variant}
            onConfirm={dialogMeta[dialog].onConfirm}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================
   Empty / Error states
   ============================================================ */

function NoBadgesEmpty() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <EmptyState
      icon="Award"
      title="No badges yet"
      description="Start earning coins and completing missions to unlock your first badge."
      action={
        <LootButton variant="electric" size="sm" onClick={() => navigate("earn")}>
          Start Earning
        </LootButton>
      }
    />
  );
}

function ProfileUnavailableError() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <ErrorState
      icon="UserX"
      title="Profile unavailable"
      description="We couldn't load your profile right now. Please try again later."
      variant="warning"
      action={
        <LootButton variant="electric" size="sm" onClick={() => navigate("dashboard")}>
          Back to Dashboard
        </LootButton>
      }
    />
  );
}

/* ============================================================
   Main ProfileView
   ============================================================ */

export function ProfileView() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <PageContainer>
      <PageHeader
        title="Profile & Account"
        description="Manage your account, security and preferences"
        actions={
          <>
            <LootButton
              variant="glass"
              size="sm"
              leftIcon={<Shield size={14} />}
              onClick={() => navigate("settings")}
            >
              Settings
            </LootButton>
            <LootButton
              variant="electric"
              size="sm"
              leftIcon={<Edit size={14} />}
              onClick={() => {
                const el = document.getElementById("personal-information");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                else showToast("Edit profile", "Scroll to personal information to edit.");
              }}
            >
              Edit Profile
            </LootButton>
          </>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 1. Profile Overview */}
        <ProfileOverview />

        {/* Quick nav chips */}
        <QuickNavRow />

        {/* 2. Personal Information */}
        <div id="personal-information" className="scroll-mt-6">
          <PersonalInformation />
        </div>

        {/* 3. Account Security */}
        <AccountSecurity />

        {/* 4. Privacy Center */}
        <PrivacyCenter />

        {/* 5. Appearance Settings */}
        <AppearanceSettings />

        {/* 6. Notification Preferences */}
        <NotificationPreferences />

        {/* 7. Connected Accounts */}
        <ConnectedAccounts />

        {/* 8. Account Statistics */}
        <AccountStatistics />

        {/* 9. Badge Collection */}
        <BadgeCollection />

        {/* 10. Activity Summary */}
        <ActivitySummary />

        {/* 11. Device Management */}
        <DeviceManagement />

        {/* 12. Download Data */}
        <DownloadData />

        {/* 13. Danger Zone */}
        <DangerZone />

        {/* States preview — collapsible demo of Empty / Error */}
        <WidgetCard
          title="States Preview"
          description="Empty & error components defined in this view"
          icon={<Info size={16} />}
          level={2}
          index={13}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard level={1} className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                NoBadgesEmpty
              </p>
              <NoBadgesEmpty />
            </GlassCard>
            <GlassCard level={1} className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                ProfileUnavailableError
              </p>
              <ProfileUnavailableError />
            </GlassCard>
          </div>
        </WidgetCard>
      </motion.div>
    </PageContainer>
  );
}

/* Quick navigation chips row */
function QuickNavRow() {
  const navigate = useNavigationStore((s) => s.navigate);
  const chips: { label: string; icon: React.ReactNode; target: "settings" | "wallet" | "rewards" | "achievements" | "support" }[] = [
    { label: "Settings", icon: <Settings size={13} />, target: "settings" },
    { label: "Wallet", icon: <Wallet size={13} />, target: "wallet" },
    { label: "Rewards", icon: <Gift size={13} />, target: "rewards" },
    { label: "Achievements", icon: <Trophy size={13} />, target: "achievements" },
    { label: "Support", icon: <LifeBuoy size={13} />, target: "support" },
  ];
  return (
    <motion.div variants={cardReveal} className="flex items-center gap-2 flex-wrap">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={() => navigate(c.target)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-1 ring-1 ring-border text-xs font-semibold text-foreground hover:ring-electric/30 hover:text-electric transition-all"
        >
          {c.icon}
          {c.label}
          <ChevronRight size={11} className="text-muted-foreground" />
        </button>
      ))}
    </motion.div>
  );
}

function Settings({ size = 13, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
