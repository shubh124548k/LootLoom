"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Wallet,
  Gift,
  ShoppingBag,
  Users,
  Trophy,
  Crown,
  ShieldCheck,
  LifeBuoy,
  Megaphone,
  Settings2,
  Lock,
  Check,
  CheckCheck,
  Archive,
  Trash2,
  Pin,
  Filter,
  Search,
  Mail,
  Smartphone,
  MessageSquare,
  Sparkles,
  CalendarCheck,
  Target,
  Send,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Clock,
  ChevronRight,
  Zap,
  PanelLeftOpen,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  KeyRound,
  MailCheck,
  Smartphone as PhoneIcon,
  AlertCircle,
  BellRing,
  CalendarClock,
  PartyPopper,
  BadgeCheck,
  RefreshCw,
  XCircle,
  CircleCheck,
  Hourglass,
  Bot,
  Radio,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
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
} from "@/components/lootloom";
import { useNavigationStore, useNotificationStore } from "@/stores";
import {
  cardReveal,
  staggerContainer,
  hoverLift,
  floating,
  notificationIn,
} from "@/lib/animations";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ============================================================
   Types & Maps
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
type Priority = "High" | "Medium" | "Low";
type CategoryId =
  | "all"
  | "wallet"
  | "rewards"
  | "redeem"
  | "referral"
  | "achievements"
  | "leaderboard"
  | "security"
  | "support"
  | "announcements"
  | "system"
  | "ads"
  | "promotions";

interface CategoryDef {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  accent: Accent;
  count: number;
  locked?: boolean;
  glow?: "electric" | "cyan" | "purple";
}

/** Maps a store notification type → category id for filtering. */
function typeToCategory(type: string): CategoryId {
  switch (type) {
    case "wallet":
      return "wallet";
    case "reward":
      return "rewards";
    case "social":
      return "referral";
    case "security":
      return "security";
    case "system":
      return "system";
    case "announcement":
      return "announcements";
    default:
      return "system";
  }
}

/** Deterministic priority for a notification id (placeholder). */
function priorityFor(id: string): Priority {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const idx = hash % 3;
  return idx === 0 ? "High" : idx === 1 ? "Medium" : "Low";
}

const PRIORITY_VARIANT: Record<Priority, "error" | "warning" | "default"> = {
  High: "error",
  Medium: "warning",
  Low: "default",
};

/** Lucide icon for a notification by store type (property access pattern). */
const TYPE_ICONS: Record<string, LucideIcon> = {
  wallet: Wallet,
  reward: Gift,
  social: Users,
  security: ShieldCheck,
  system: Settings2,
  announcement: Megaphone,
  default: Bell,
};

function accentFor(type: string): Accent {
  switch (type) {
    case "wallet":
      return "gold";
    case "reward":
      return "electric";
    case "social":
      return "purple";
    case "security":
      return "rose";
    case "system":
      return "navy";
    case "announcement":
      return "cyan";
    default:
      return "electric";
  }
}

/* ============================================================
   Category & Section Static Data
   ============================================================ */

const CATEGORIES: CategoryDef[] = [
  { id: "all", label: "All", icon: Bell, accent: "electric", count: 5, glow: "electric" },
  { id: "wallet", label: "Wallet", icon: Wallet, accent: "gold", count: 12 },
  { id: "rewards", label: "Rewards", icon: Gift, accent: "electric", count: 18 },
  { id: "redeem", label: "Redeem", icon: ShoppingBag, accent: "purple", count: 7 },
  { id: "referral", label: "Referral", icon: Users, accent: "purple", count: 4 },
  { id: "achievements", label: "Achievements", icon: Trophy, accent: "cyan", count: 9 },
  { id: "leaderboard", label: "Leaderboard", icon: Crown, accent: "gold", count: 3 },
  { id: "security", label: "Security", icon: ShieldCheck, accent: "rose", count: 6 },
  { id: "support", label: "Support", icon: LifeBuoy, accent: "emerald", count: 5 },
  { id: "announcements", label: "Announcements", icon: Megaphone, accent: "cyan", count: 8 },
  { id: "system", label: "System", icon: Settings2, accent: "navy", count: 11 },
  { id: "ads", label: "Advertisements", icon: Radio, accent: "gold", count: 0, locked: true },
  { id: "promotions", label: "Promotions", icon: Sparkles, accent: "purple", count: 0, locked: true },
];

/* ============================================================
   Skeleton / placeholder row data
   ============================================================ */

interface PlaceholderRow {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: LucideIcon;
  accent: Accent;
  badge?: { label: string; variant: "success" | "warning" | "error" | "info" | "default" };
  priority?: Priority;
  skeleton?: boolean;
}

const WALLET_PLACEHOLDERS: PlaceholderRow[] = [
  { id: "w1", title: "Coin Credit", desc: "+50 coins credited from daily bonus", time: "2m ago", icon: ArrowDownLeft, accent: "emerald", badge: { label: "Credited", variant: "success" }, priority: "Medium" },
  { id: "w2", title: "Coin Debit", desc: "−1,000 coins debited for redeem request", time: "1h ago", icon: ArrowUpRight, accent: "rose", badge: { label: "Debited", variant: "error" }, priority: "High" },
  { id: "w3", title: "Wallet Adjustment", desc: "System adjustment of +12 coins", time: "3h ago", icon: RefreshCw, accent: "cyan", badge: { label: "Adjusted", variant: "info" }, priority: "Low" },
  { id: "w4", title: "Balance Updated", desc: "Wallet balance synced after transaction", time: "5h ago", icon: Wallet, accent: "gold", badge: { label: "Synced", variant: "success" }, priority: "Low" },
  { id: "w5", title: "Expiration Reminder", desc: "320 coins expire in 7 days", time: "1d ago", icon: CalendarClock, accent: "purple", badge: { label: "Future", variant: "warning" }, priority: "Medium", skeleton: true },
];

const REWARD_PLACEHOLDERS: PlaceholderRow[] = [
  { id: "r1", title: "Reward Earned", desc: "You earned 120 coins from a mission", time: "5m ago", icon: Gift, accent: "electric", badge: { label: "Earned", variant: "success" }, priority: "Medium" },
  { id: "r2", title: "Mission Completed", desc: "'Watch 5 ads' mission completed", time: "20m ago", icon: Target, accent: "purple", badge: { label: "Completed", variant: "success" }, priority: "Medium" },
  { id: "r3", title: "Achievement Unlocked", desc: "Unlocked 'Streak Master' achievement", time: "1h ago", icon: Trophy, accent: "gold", badge: { label: "Unlocked", variant: "info" }, priority: "Low" },
  { id: "r4", title: "Daily Bonus Claimed", desc: "Daily login bonus of 50 coins claimed", time: "3h ago", icon: CalendarCheck, accent: "cyan", badge: { label: "Claimed", variant: "success" }, priority: "Low" },
  { id: "r5", title: "Referral Reward", desc: "Friend joined! +200 coins earned", time: "6h ago", icon: Users, accent: "purple", badge: { label: "Referral", variant: "info" }, priority: "Medium" },
  { id: "r6", title: "Special Reward", desc: "Festival bonus reward waiting", time: "1d ago", icon: PartyPopper, accent: "gold", badge: { label: "Future", variant: "warning" }, priority: "High", skeleton: true },
];

const REDEEM_PLACEHOLDERS: PlaceholderRow[] = [
  { id: "rd1", title: "Redeem Submitted", desc: "Redeem request #RD-2048 submitted", time: "10m ago", icon: Send, accent: "electric", badge: { label: "Submitted", variant: "info" }, priority: "High" },
  { id: "rd2", title: "Pending Review", desc: "Your request is under review", time: "45m ago", icon: Hourglass, accent: "gold", badge: { label: "Pending", variant: "warning" }, priority: "Medium" },
  { id: "rd3", title: "Approved", desc: "Request #RD-2048 approved", time: "2h ago", icon: BadgeCheck, accent: "emerald", badge: { label: "Approved", variant: "success" }, priority: "High" },
  { id: "rd4", title: "Rejected", desc: "Request #RD-2031 rejected", time: "5h ago", icon: XCircle, accent: "rose", badge: { label: "Rejected", variant: "error" }, priority: "High" },
  { id: "rd5", title: "Completed", desc: "₹100 UPI sent successfully", time: "1d ago", icon: CircleCheck, accent: "emerald", badge: { label: "Completed", variant: "success" }, priority: "Low" },
  { id: "rd6", title: "Administrator Notes", desc: "Admin note pending for next redeem", time: "Future", icon: Bot, accent: "purple", badge: { label: "Future", variant: "default" }, priority: "Low", skeleton: true },
];

const SECURITY_PLACEHOLDERS: PlaceholderRow[] = [
  { id: "s1", title: "Login Alert", desc: "New sign-in from Mumbai, India", time: "3h ago", icon: ShieldCheck, accent: "emerald", badge: { label: "Info", variant: "info" }, priority: "Medium" },
  { id: "s2", title: "Password Updated", desc: "Your password was updated successfully", time: "8h ago", icon: KeyRound, accent: "electric", badge: { label: "Updated", variant: "success" }, priority: "Low" },
  { id: "s3", title: "Email Verified", desc: "Your email was verified", time: "1d ago", icon: MailCheck, accent: "emerald", badge: { label: "Verified", variant: "success" }, priority: "Low" },
  { id: "s4", title: "Session Expired", desc: "Previous session expired for security", time: "2d ago", icon: Clock, accent: "gold", badge: { label: "Expired", variant: "warning" }, priority: "Medium" },
  { id: "s5", title: "New Device", desc: "Recognize new device sign-in", time: "Future", icon: PhoneIcon, accent: "purple", badge: { label: "Future", variant: "default" }, priority: "Medium", skeleton: true },
  { id: "s6", title: "2FA Alerts", desc: "Two-factor authentication alerts", time: "Future", icon: Lock, accent: "rose", badge: { label: "Future", variant: "default" }, priority: "High", skeleton: true },
  { id: "s7", title: "Account Lock", desc: "Suspicious activity auto-lock", time: "Future", icon: AlertCircle, accent: "rose", badge: { label: "Future", variant: "default" }, priority: "High", skeleton: true },
];

const SUPPORT_PLACEHOLDERS: PlaceholderRow[] = [
  { id: "sp1", title: "Ticket Created", desc: "Support ticket #TK-9012 created", time: "30m ago", icon: LifeBuoy, accent: "emerald", badge: { label: "Created", variant: "info" }, priority: "Medium" },
  { id: "sp2", title: "Support Reply", desc: "Agent replied to your ticket", time: "2h ago", icon: MessageSquare, accent: "cyan", badge: { label: "Reply", variant: "info" }, priority: "Medium" },
  { id: "sp3", title: "Ticket Closed", desc: "Ticket #TK-8901 marked as resolved", time: "1d ago", icon: CircleCheck, accent: "emerald", badge: { label: "Closed", variant: "success" }, priority: "Low" },
  { id: "sp4", title: "Live Chat", desc: "Real-time live chat with agent", time: "Future", icon: MessageSquare, accent: "purple", badge: { label: "Future", variant: "default" }, priority: "Medium", skeleton: true },
];

interface AnnouncementDef {
  id: string;
  title: string;
  tag: string;
  accent: Accent;
  gradient: string;
  pinned?: boolean;
  bodySkeleton?: boolean;
}

const ANNOUNCEMENTS: AnnouncementDef[] = [
  { id: "a1", title: "Platform Updates", tag: "Update", accent: "electric", gradient: "from-electric/30 via-cyan-brand/20 to-transparent" },
  { id: "a2", title: "Maintenance Notice", tag: "Schedule", accent: "gold", gradient: "from-gold/30 via-amber-200/10 to-transparent" },
  { id: "a3", title: "Reward Campaigns", tag: "Campaign", accent: "purple", gradient: "from-purple-brand/30 via-fuchsia-200/10 to-transparent", pinned: true },
  { id: "a4", title: "Seasonal Events", tag: "Event", accent: "cyan", gradient: "from-cyan-brand/30 via-sky-200/10 to-transparent" },
  { id: "a5", title: "Version Updates", tag: "Release", accent: "emerald", gradient: "from-emerald-brand/30 via-teal-200/10 to-transparent" },
  { id: "a6", title: "CEO Broadcast", tag: "Broadcast", accent: "rose", gradient: "from-rose-brand/30 via-pink-200/10 to-transparent", bodySkeleton: true },
  { id: "a7", title: "System Messages", tag: "System", accent: "navy", gradient: "from-navy/30 via-slate-200/10 to-transparent", bodySkeleton: true },
];

/* ============================================================
   Analytics placeholder data
   ============================================================ */

const DAILY_NOTIFS = [
  { label: "Mon", count: 12 },
  { label: "Tue", count: 18 },
  { label: "Wed", count: 9 },
  { label: "Thu", count: 22 },
  { label: "Fri", count: 15 },
  { label: "Sat", count: 26 },
  { label: "Sun", count: 20 },
];

const WEEKLY_NOTIFS = [
  { label: "W1", count: 68 },
  { label: "W2", count: 92 },
  { label: "W3", count: 76 },
  { label: "W4", count: 118 },
  { label: "W5", count: 98 },
  { label: "W6", count: 132 },
];

const CATEGORY_DIST = [
  { name: "Wallet", value: 22, color: "oklch(0.8 0.16 85)" },
  { name: "Rewards", value: 30, color: "oklch(0.62 0.22 255)" },
  { name: "Security", value: 12, color: "oklch(0.65 0.21 17)" },
  { name: "Social", value: 14, color: "oklch(0.6 0.22 295)" },
  { name: "System", value: 22, color: "oklch(0.45 0.18 260)" },
];

/* ============================================================
   Reusable: NotificationCard
   ============================================================ */

interface NotificationCardProps {
  item: {
    id: string;
    title: string;
    body: string;
    time: string;
    type: string;
    read: boolean;
    icon?: string;
  };
  categoryLabel: string;
  onClick?: () => void;
  onMarkRead?: () => void;
  index?: number;
}

function NotificationCard({
  item,
  categoryLabel,
  onClick,
  onMarkRead,
  index = 0,
}: NotificationCardProps) {
  const Icon = TYPE_ICONS[item.type] ?? TYPE_ICONS.default;
  const accent = accentFor(item.type);
  const priority = priorityFor(item.id);
  const accentText: Record<Accent, string> = {
    electric: "text-electric",
    cyan: "text-cyan-brand",
    purple: "text-purple-brand",
    gold: "text-gold",
    emerald: "text-emerald-brand",
    rose: "text-rose-brand",
    navy: "text-navy",
  };
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/10 ring-electric/20",
    cyan: "bg-cyan-brand/10 ring-cyan-brand/20",
    purple: "bg-purple-brand/10 ring-purple-brand/20",
    gold: "bg-gold/12 ring-gold/25",
    emerald: "bg-emerald-brand/10 ring-emerald-brand/20",
    rose: "bg-rose-brand/10 ring-rose-brand/20",
    navy: "bg-navy/10 ring-navy/20",
  };

  return (
    <motion.div
      layout
      variants={notificationIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay: index * 0.04 }}
      {...hoverLift}
      className={cn(
        "relative rounded-2xl p-4 transition-colors cursor-pointer group",
        "glass-2 ring-1 ring-border",
        !item.read && "ring-electric/40 shadow-[0_8px_30px_-12px_oklch(0.62_0.22_255/0.35)]"
      )}
      onClick={onClick}
    >
      {/* Unread accent bar */}
      {!item.read && (
        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-[linear-gradient(180deg,var(--electric),var(--cyan-brand))]" />
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "inline-flex items-center justify-center size-10 rounded-xl ring-1 shrink-0",
            accentBg[accent],
            accentText[accent]
          )}
        >
          <Icon size={20} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {!item.read && (
                  <span className="size-1.5 rounded-full bg-electric shrink-0 animate-pulse" />
                )}
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {item.title}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {item.body}
              </p>
            </div>
            <StatusBadge
              variant={item.read ? "default" : "electric"}
              dot={!item.read}
              pulse={!item.read}
              className="shrink-0"
            >
              {item.read ? "Read" : "Unread"}
            </StatusBadge>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusBadge variant={PRIORITY_VARIANT[priority]}>
              {priority}
            </StatusBadge>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium rounded-full px-2 py-0.5 bg-muted/60">
              <Tag12 />
              {categoryLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock size={11} /> {item.time}
            </span>
          </div>

          {/* Action icon buttons (placeholders) */}
          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconBtn icon={Archive} label="Archive" />
            <IconBtn icon={Pin} label="Pin" />
            {!item.read && (
              <IconBtn icon={CheckCheck} label="Mark read" onClick={onMarkRead} />
            )}
            <IconBtn icon={Trash2} label="Delete" danger />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Tag12() {
  return <span className="size-2 rounded-sm bg-current opacity-50" />;
}

function IconBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "inline-flex items-center justify-center size-7 rounded-lg ring-1 ring-border bg-background/60 hover:bg-accent transition-colors",
        danger ? "text-rose-brand hover:bg-rose-brand/10" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon size={13} />
    </button>
  );
}

/* ============================================================
   Reusable: NotificationFilterBar (Search & Filters)
   ============================================================ */

interface FilterState {
  category: CategoryId;
  priority: "all" | Priority;
  readStatus: "all" | "read" | "unread";
  date: "all" | "today" | "week" | "month";
  sort: "newest" | "oldest" | "priority";
  query: string;
}

const DEFAULT_FILTERS: FilterState = {
  category: "all",
  priority: "all",
  readStatus: "all",
  date: "all",
  sort: "newest",
  query: "",
};

function NotificationFilterBar({
  filters,
  setFilters,
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
}) {
  return (
    <GlassCard level={2} sheen className="p-4 lg:p-5">
      <div className="flex flex-col gap-3">
        {/* Search + sort */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              placeholder="Search notifications…"
              className="w-full h-9 rounded-lg pl-9 pr-3 bg-background/60 ring-1 ring-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric/40"
            />
          </div>
          <Select
            value={filters.sort}
            onValueChange={(v) => setFilters({ ...filters, sort: v as FilterState["sort"] })}
          >
            <SelectTrigger className="w-full sm:w-44 bg-background/60">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="priority">By priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Filter size={12} /> Filters
          </span>

          {/* Category */}
          <Select
            value={filters.category}
            onValueChange={(v) => setFilters({ ...filters, category: v as CategoryId })}
          >
            <SelectTrigger size="sm" className="w-36 bg-background/60">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id} disabled={c.locked}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select
            value={filters.priority}
            onValueChange={(v) => setFilters({ ...filters, priority: v as FilterState["priority"] })}
          >
            <SelectTrigger size="sm" className="w-32 bg-background/60">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Read status */}
          <Select
            value={filters.readStatus}
            onValueChange={(v) => setFilters({ ...filters, readStatus: v as FilterState["readStatus"] })}
          >
            <SelectTrigger size="sm" className="w-32 bg-background/60">
              <SelectValue placeholder="Read Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
            </SelectContent>
          </Select>

          {/* Date */}
          <Select
            value={filters.date}
            onValueChange={(v) => setFilters({ ...filters, date: v as FilterState["date"] })}
          >
            <SelectTrigger size="sm" className="w-32 bg-background/60">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <LootButton
            variant="ghost"
            size="sm"
            leftIcon={<Download size={13} />}
            className="ml-auto"
          >
            Export
          </LootButton>
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================================================
   Reusable: NotificationDetailDialog
   ============================================================ */

interface DetailDialogState {
  open: boolean;
  item: {
    id: string;
    title: string;
    body: string;
    time: string;
    type: string;
    read: boolean;
    icon?: string;
  } | null;
}

function NotificationDetailDialog({
  state,
  onClose,
}: {
  state: DetailDialogState;
  onClose: () => void;
}) {
  const item = state.item;
  if (!item) return null;
  const accent = accentFor(item.type);
  const priority = priorityFor(item.id);
  const categoryLabel =
    CATEGORIES.find((c) => c.id === typeToCategory(item.type))?.label ?? "Notification";
  const iconName: Record<string, string> = {
    wallet: "Wallet",
    reward: "Gift",
    social: "Users",
    security: "ShieldCheck",
    system: "Settings2",
    announcement: "Megaphone",
  };

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg glass-3 border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <IconBadge name={iconName[item.type] ?? "Bell"} accent={accent} />
            <div className="min-w-0">
              <DialogTitle className="truncate">{item.title}</DialogTitle>
              <DialogDescription className="truncate">
                {categoryLabel} • {item.time}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-foreground/90 leading-relaxed">{item.body}</p>

          <div className="grid grid-cols-2 gap-3">
            <DetailField label="Category" value={categoryLabel} />
            <DetailField
              label="Status"
              value={item.read ? "Read" : "Unread"}
              accent={item.read ? "default" : "electric"}
            />
            <DetailField label="Priority" value={priority} />
            <DetailField label="Date & Time" value={item.time} />
          </div>

          {/* Future action */}
          <div className="rounded-xl ring-1 ring-border bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock size={12} />
              <span className="font-semibold">Action</span>
              <span className="opacity-60">— coming soon</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Inline actions (claim, dismiss, open link) will be available in a future release.
            </p>
          </div>

          {/* Future attachment */}
          <div className="rounded-xl ring-1 ring-border bg-muted/40 p-3 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-purple-brand/10 text-purple-brand flex items-center justify-center ring-1 ring-purple-brand/20">
              <Paperclip size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Attachment</p>
              <p className="text-[11px] text-muted-foreground truncate">
                receipt-2048.pdf — future attachment preview
              </p>
            </div>
            <Lock size={14} className="text-muted-foreground ml-auto" />
          </div>

          {/* Future administrator message */}
          <div className="rounded-xl ring-1 ring-border bg-electric/5 p-3">
            <div className="flex items-center gap-2 text-xs text-electric">
              <Bot size={14} />
              <span className="font-semibold">Administrator Message</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Future admin replies will appear here for redeem, support, and account actions.
            </p>
          </div>
        </div>

        <DialogFooter>
          <LootButton variant="outline" size="sm" onClick={onClose}>
            Close
          </LootButton>
          <LootButton variant="electric" size="sm" leftIcon={<ExternalLink size={13} />}>
            Open in hub
          </LootButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailField({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "default" | "electric";
}) {
  return (
    <div className="rounded-lg ring-1 ring-border bg-background/40 p-2.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-semibold mt-0.5",
          accent === "electric" ? "text-electric" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   Reusable: AnnouncementCard
   ============================================================ */

function AnnouncementCard({ def, index = 0 }: { def: AnnouncementDef; index?: number }) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -4 }}
      className="rounded-2xl overflow-hidden ring-1 ring-border glass-2"
    >
      {/* Gradient banner */}
      <div className={cn("relative h-20 bg-gradient-to-r", def.gradient)}>
        <div className="absolute inset-0 backdrop-blur-[1px]" />
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <IconBadge name="Megaphone" accent={def.accent} size="sm" />
            <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
              {def.tag}
            </span>
          </div>
          {def.pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold">
              <Pin size={11} /> PINNED
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">{def.title}</h4>
          <ChevronRight size={14} className="text-muted-foreground shrink-0" />
        </div>

        {def.bodySkeleton ? (
          <div className="space-y-2 mt-3">
            <div className="h-2.5 w-3/4 rounded shimmer" />
            <div className="h-2.5 w-1/2 rounded shimmer" />
          </div>
        ) : (
          <div className="space-y-2 mt-3">
            <div className="h-2.5 w-full rounded shimmer" />
            <div className="h-2.5 w-5/6 rounded shimmer" />
            <div className="h-2.5 w-2/3 rounded shimmer" />
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
          <span className="text-[11px] text-muted-foreground">Tap to read more</span>
          <LootButton variant="ghost" size="sm" leftIcon={<Sparkles size={12} />}>
            Details
          </LootButton>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Reusable: PlaceholderRowCard
   ============================================================ */

function PlaceholderRowCard({
  row,
  index = 0,
}: {
  row: PlaceholderRow;
  index?: number;
}) {
  const Icon = row.icon;
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/10 ring-electric/20 text-electric",
    cyan: "bg-cyan-brand/10 ring-cyan-brand/20 text-cyan-brand",
    purple: "bg-purple-brand/10 ring-purple-brand/20 text-purple-brand",
    gold: "bg-gold/12 ring-gold/25 text-gold",
    emerald: "bg-emerald-brand/10 ring-emerald-brand/20 text-emerald-brand",
    rose: "bg-rose-brand/10 ring-rose-brand/20 text-rose-brand",
    navy: "bg-navy/10 ring-navy/20 text-navy",
  };

  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-xl p-3 ring-1 transition-colors flex items-center gap-3",
        row.skeleton
          ? "glass-1 ring-border/70 border border-dashed border-border/70"
          : "glass-1 ring-border"
      )}
    >
      <div className={cn("size-9 rounded-lg ring-1 flex items-center justify-center shrink-0", accentBg[row.accent])}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{row.title}</p>
          {row.skeleton && <Lock size={11} className="text-muted-foreground shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">{row.desc}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {row.badge && (
          <StatusBadge variant={row.badge.variant}>{row.badge.label}</StatusBadge>
        )}
        <span className="text-[10px] text-muted-foreground">{row.time}</span>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Reusable: PreferenceToggle
   ============================================================ */

function PreferenceToggle({
  icon,
  label,
  description,
  defaultChecked = true,
  locked = false,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  defaultChecked?: boolean;
  locked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const Icon = icon;
  return (
    <div
      className={cn(
        "rounded-xl p-3 ring-1 flex items-center gap-3 transition-colors",
        checked ? "glass-2 ring-electric/30" : "glass-1 ring-border"
      )}
    >
      <div
        className={cn(
          "size-9 rounded-lg flex items-center justify-center ring-1 shrink-0",
          checked
            ? "bg-electric/10 text-electric ring-electric/20"
            : "bg-muted text-muted-foreground ring-border"
        )}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground truncate">{label}</p>
          {locked && <Lock size={11} className="text-muted-foreground" />}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        disabled={locked}
        aria-label={label}
      />
    </div>
  );
}

/* ============================================================
   Reusable: AnalyticsTabs
   ============================================================ */

function AnalyticsTabs() {
  const [tab, setTab] = useState<"daily" | "weekly" | "category" | "rate">("daily");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "daily", label: "Daily", icon: BarChart3 },
          { id: "weekly", label: "Weekly", icon: Activity },
          { id: "category", label: "Categories", icon: PieChartIcon },
          { id: "rate", label: "Read Rate", icon: TrendingUp },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ring-1",
              tab === t.id
                ? "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] text-white ring-transparent"
                : "glass-1 text-muted-foreground ring-border hover:text-foreground"
            )}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="h-64 w-full">
        {tab === "daily" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DAILY_NOTIFS} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.4 0.04 260 / 0.15)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.04 260)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.04 260)" }} />
              <RTooltip
                cursor={{ fill: "oklch(0.62 0.22 255 / 0.06)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="oklch(0.62 0.22 255)" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === "weekly" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEKLY_NOTIFS} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="wkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.4 0.04 260 / 0.15)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.04 260)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.04 260)" }} />
              <RTooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="oklch(0.62 0.22 255)"
                strokeWidth={2.5}
                fill="url(#wkGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {tab === "category" && (
          <div className="h-full grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DIST}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                >
                  {CATEGORY_DIST.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {CATEGORY_DIST.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
                  <span className="text-xs font-semibold text-foreground">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rate" && (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <ProgressRing value={72} size={140} gradient="electric" label="Read Rate" />
            <div className="grid grid-cols-3 gap-3 w-full max-w-md">
              <div className="text-center rounded-lg ring-1 ring-border bg-background/40 p-2">
                <p className="text-lg font-bold text-electric">72%</p>
                <p className="text-[10px] text-muted-foreground">Read</p>
              </div>
              <div className="text-center rounded-lg ring-1 ring-border bg-background/40 p-2">
                <p className="text-lg font-bold text-gold">18%</p>
                <p className="text-[10px] text-muted-foreground">Unread</p>
              </div>
              <div className="text-center rounded-lg ring-1 ring-border bg-background/40 p-2">
                <p className="text-lg font-bold text-purple-brand">10%</p>
                <p className="text-[10px] text-muted-foreground">Archived</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Future Engagement analytics — coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Empty / Error states
   ============================================================ */

function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon="Inbox"
      title="No notifications here"
      description="Notifications matching your filters will appear here. Adjust filters or check back later."
      action={
        <LootButton variant="outline" size="sm" leftIcon={<Bell size={13} />}>
          Refresh feed
        </LootButton>
      }
    />
  );
}

function NotificationUnavailableError() {
  return (
    <ErrorState
      icon="AlertTriangle"
      title="Notifications unavailable"
      description="We couldn't load live notifications right now. Please retry or continue browsing cached items."
      variant="warning"
      action={
        <LootButton variant="electric" size="sm" leftIcon={<RefreshCw size={13} />}>
          Retry
        </LootButton>
      }
    />
  );
}

/* ============================================================
   Section 1 — Notification Overview (8 StatCards)
   ============================================================ */

function NotificationOverview({ unread }: { unread: number }) {
  const stats: React.ComponentProps<typeof StatCard>[] = [
    { label: "Unread Notifications", value: unread, icon: "Bell", accent: "electric", trend: { value: 8, positive: true } },
    { label: "Read Notifications", value: 24, icon: "CheckCheck", accent: "emerald", trend: { value: 4, positive: true } },
    { label: "System Announcements", value: 8, icon: "Megaphone", accent: "cyan" },
    { label: "Reward Updates", value: 18, icon: "Gift", accent: "purple" },
    { label: "Redeem Updates", value: 7, icon: "ShoppingBag", accent: "gold" },
    { label: "Wallet Updates", value: 12, icon: "Wallet", accent: "gold" },
    { label: "Security Alerts", value: 6, icon: "ShieldCheck", accent: "rose" },
    { label: "Support Replies", value: 5, icon: "LifeBuoy", accent: "emerald" },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Grid cols={4}>
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </Grid>
    </motion.div>
  );
}

/* ============================================================
   Section 2 — Notification Categories (12 cards)
   ============================================================ */

function NotificationCategories({
  active,
  onSelect,
}: {
  active: CategoryId;
  onSelect: (id: CategoryId) => void;
}) {
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/10 ring-electric/20 text-electric",
    cyan: "bg-cyan-brand/10 ring-cyan-brand/20 text-cyan-brand",
    purple: "bg-purple-brand/10 ring-purple-brand/20 text-purple-brand",
    gold: "bg-gold/12 ring-gold/25 text-gold",
    emerald: "bg-emerald-brand/10 ring-emerald-brand/20 text-emerald-brand",
    rose: "bg-rose-brand/10 ring-rose-brand/20 text-rose-brand",
    navy: "bg-navy/10 ring-navy/20 text-navy",
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Grid cols={4}>
        {CATEGORIES.map((c, i) => {
          const isActive = active === c.id;
          return (
            <motion.div key={c.id} variants={cardReveal} custom={i} className="h-full">
              <button
                type="button"
                disabled={c.locked}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "relative w-full h-full text-left rounded-2xl p-4 ring-1 transition-all overflow-hidden",
                  isActive
                    ? "glass-3 ring-electric/50 shadow-[0_8px_30px_-12px_oklch(0.62_0.22_255/0.4)]"
                    : "glass-2 ring-border hover:ring-electric/30",
                  c.locked && "opacity-60 cursor-not-allowed"
                )}
              >
                {/* Soft glow on hover */}
                <div
                  className={cn(
                    "pointer-events-none absolute -top-10 -right-10 size-28 rounded-full blur-3xl opacity-0 transition-opacity",
                    c.glow === "electric" && "bg-electric/20",
                    c.glow === "cyan" && "bg-cyan-brand/20",
                    c.glow === "purple" && "bg-purple-brand/20",
                    "group-hover:opacity-100 hover:opacity-100"
                  )}
                />
                <div className="relative flex items-center justify-between">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center size-10 rounded-xl ring-1 shrink-0",
                      accentBg[c.accent]
                    )}
                  >
                    <c.icon size={20} strokeWidth={2} />
                  </div>
                  {isActive && (
                    <span className="size-2 rounded-full bg-electric animate-pulse" />
                  )}
                  {c.locked && (
                    <span className="inline-flex items-center justify-center size-6 rounded-md bg-muted text-muted-foreground">
                      <Lock size={11} />
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {c.locked ? "Locked" : `${c.count} ${c.count === 1 ? "item" : "items"}`}
                  </p>
                </div>
              </button>
            </motion.div>
          );
        })}
      </Grid>
    </motion.div>
  );
}

/* ============================================================
   Section 3 — Notification Feed (filtered store items)
   ============================================================ */

function NotificationFeed({
  items,
  filters,
  onOpen,
  onMarkRead,
}: {
  items: ReturnType<typeof useNotificationStore.getState>["items"];
  filters: FilterState;
  onOpen: (item: ReturnType<typeof useNotificationStore.getState>["items"][number]) => void;
  onMarkRead: (id: string) => void;
}) {
  // Apply filter pipeline
  const filtered = useMemo(() => {
    let list = [...items];
    // Category
    if (filters.category !== "all") {
      list = list.filter((n) => typeToCategory(n.type) === filters.category);
    }
    // Read status
    if (filters.readStatus !== "all") {
      list = list.filter((n) =>
        filters.readStatus === "read" ? n.read : !n.read
      );
    }
    // Priority
    if (filters.priority !== "all") {
      list = list.filter((n) => priorityFor(n.id) === filters.priority);
    }
    // Query
    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }
    // Sort
    if (filters.sort === "oldest") {
      list = list.slice().reverse();
    } else if (filters.sort === "priority") {
      const order: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
      list = list.sort((a, b) => order[priorityFor(a.id)] - order[priorityFor(b.id)]);
    }
    return list;
  }, [items, filters]);

  return (
    <WidgetCard
      title="Notification Feed"
      description="Live items from your notification store"
      icon={<Bell size={16} />}
      action={
        <StatusBadge variant="electric" dot pulse>
          {filtered.length} shown
        </StatusBadge>
      }
      level={2}
      glow="electric"
    >
      {filtered.length === 0 ? (
        <NoNotificationsEmpty />
      ) : (
        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 custom-scroll">
          <AnimatePresence mode="popLayout">
            {filtered.map((n, i) => (
              <NotificationCard
                key={n.id}
                item={n}
                categoryLabel={
                  CATEGORIES.find((c) => c.id === typeToCategory(n.type))?.label ?? "Notification"
                }
                onClick={() => onOpen(n)}
                onMarkRead={() => onMarkRead(n.id)}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </WidgetCard>
  );
}

/* ============================================================
   Section 4 — Announcement Center
   ============================================================ */

function AnnouncementCenter() {
  return (
    <WidgetCard
      title="Announcement Center"
      description="Platform-wide broadcasts and campaign notices"
      icon={<Megaphone size={16} />}
      action={
        <LootButton variant="ghost" size="sm" leftIcon={<BellRing size={13} />}>
          Subscribe
        </LootButton>
      }
      level={2}
    >
      <Grid cols={3}>
        {ANNOUNCEMENTS.map((a, i) => (
          <AnnouncementCard key={a.id} def={a} index={i} />
        ))}
      </Grid>
    </WidgetCard>
  );
}

/* ============================================================
   Section 5 — Wallet Notification Preview
   ============================================================ */

function WalletNotificationPreview() {
  return (
    <WidgetCard
      title="Wallet Notifications"
      description="Coin credit, debit and balance updates"
      icon={<Wallet size={16} />}
      level={2}
    >
      <div className="space-y-2">
        {WALLET_PLACEHOLDERS.map((r, i) => (
          <PlaceholderRowCard key={r.id} row={r} index={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 6 — Reward Notifications
   ============================================================ */

function RewardNotifications() {
  return (
    <WidgetCard
      title="Reward Notifications"
      description="Earned rewards, missions, achievements & bonuses"
      icon={<Gift size={16} />}
      level={2}
    >
      <div className="space-y-2">
        {REWARD_PLACEHOLDERS.map((r, i) => (
          <PlaceholderRowCard key={r.id} row={r} index={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 7 — Redeem Notifications
   ============================================================ */

function RedeemNotifications() {
  return (
    <WidgetCard
      title="Redeem Notifications"
      description="Lifecycle updates for every redeem request"
      icon={<ShoppingBag size={16} />}
      level={2}
    >
      <div className="space-y-2">
        {REDEEM_PLACEHOLDERS.map((r, i) => (
          <PlaceholderRowCard key={r.id} row={r} index={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 8 — Security Notifications
   ============================================================ */

function SecurityNotifications() {
  return (
    <WidgetCard
      title="Security Notifications"
      description="Login alerts, verification & account safety"
      icon={<ShieldCheck size={16} />}
      level={2}
    >
      <div className="space-y-2">
        {SECURITY_PLACEHOLDERS.map((r, i) => (
          <PlaceholderRowCard key={r.id} row={r} index={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 9 — Support Notifications
   ============================================================ */

function SupportNotifications() {
  return (
    <WidgetCard
      title="Support Notifications"
      description="Ticket lifecycle and support agent replies"
      icon={<LifeBuoy size={16} />}
      level={2}
    >
      <div className="space-y-2">
        {SUPPORT_PLACEHOLDERS.map((r, i) => (
          <PlaceholderRowCard key={r.id} row={r} index={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 10 — Notification Timeline
   ============================================================ */

interface TimelineEntry {
  id: string;
  title: string;
  body: string;
  time: string;
  type: string;
  read: boolean;
  icon?: string;
}

function NotificationTimeline({
  storeItems,
}: {
  storeItems: ReturnType<typeof useNotificationStore.getState>["items"];
}) {
  // Combine store items with a couple of placeholders to enrich timeline
  const placeholderTimeline: TimelineEntry[] = [
    {
      id: "t-p1",
      title: "Redeem Approved",
      body: "Your redeem #RD-2048 was approved.",
      time: "4h ago",
      type: "system",
      read: true,
    },
    {
      id: "t-p2",
      title: "Achievement Unlocked",
      body: "'First Mission' achievement unlocked.",
      time: "8h ago",
      type: "reward",
      read: true,
    },
  ];
  const combined: TimelineEntry[] = [...storeItems, ...placeholderTimeline];

  return (
    <WidgetCard
      title="Notification Timeline"
      description="Chronological stream of all notifications"
      icon={<Activity size={16} />}
      level={2}
      glow="cyan"
    >
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2 top-2 bottom-2 w-px bg-[linear-gradient(180deg,var(--electric),var(--cyan-brand)_50%,transparent)]" />

        <div className="space-y-4">
          {combined.map((n, i) => {
            const Icon = TYPE_ICONS[n.type] ?? TYPE_ICONS.default;
            const accent = accentFor(n.type);
            const accentBg: Record<Accent, string> = {
              electric: "bg-electric/10 ring-electric/20 text-electric",
              cyan: "bg-cyan-brand/10 ring-cyan-brand/20 text-cyan-brand",
              purple: "bg-purple-brand/10 ring-purple-brand/20 text-purple-brand",
              gold: "bg-gold/12 ring-gold/25 text-gold",
              emerald: "bg-emerald-brand/10 ring-emerald-brand/20 text-emerald-brand",
              rose: "bg-rose-brand/10 ring-rose-brand/20 text-rose-brand",
              navy: "bg-navy/10 ring-navy/20 text-navy",
            };
            return (
              <motion.div
                key={n.id}
                variants={cardReveal}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20px" }}
                className="relative"
              >
                {/* Node */}
                <motion.div
                  variants={floating}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                  className={cn(
                    "absolute -left-[18px] top-2 size-5 rounded-full ring-2 ring-background flex items-center justify-center",
                    accentBg[accent]
                  )}
                >
                  <Icon size={10} />
                </motion.div>

                <motion.div
                  {...hoverLift}
                  className={cn(
                    "rounded-xl p-3 ring-1 ml-2 glass-1",
                    n.read ? "ring-border" : "ring-electric/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 12 — Notification Preferences
   ============================================================ */

function NotificationPreferences() {
  return (
    <WidgetCard
      title="Notification Preferences"
      description="Choose which notifications you receive"
      icon={<Settings2 size={16} />}
      action={
        <LootButton variant="outline" size="sm" leftIcon={<Check size={13} />}>
          Save
        </LootButton>
      }
      level={2}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PreferenceToggle icon={Gift} label="Reward Notifications" description="Rewards earned, missions, bonuses" />
        <PreferenceToggle icon={Wallet} label="Wallet Notifications" description="Coin credit, debit, balance updates" />
        <PreferenceToggle icon={ShoppingBag} label="Redeem Notifications" description="Redeem status lifecycle" defaultChecked={false} />
        <PreferenceToggle icon={Users} label="Referral Notifications" description="Referral sign-ups and rewards" />
        <PreferenceToggle icon={Crown} label="Leaderboard Notifications" description="Rank changes and milestones" defaultChecked={false} />
        <PreferenceToggle icon={Trophy} label="Achievement Notifications" description="Achievement unlocks and progress" />
        <PreferenceToggle icon={ShieldCheck} label="Security Notifications" description="Login, device and account alerts" />
        <PreferenceToggle icon={LifeBuoy} label="Support Notifications" description="Ticket updates and replies" />
        <PreferenceToggle icon={Megaphone} label="System Announcements" description="Platform updates and broadcasts" />
        <PreferenceToggle icon={Mail} label="Email Notifications" description="Future: email delivery" locked />
        <PreferenceToggle icon={Smartphone} label="Push Notifications" description="Future: push delivery" locked />
        <PreferenceToggle icon={MessageSquare} label="SMS Notifications" description="Future: SMS delivery" locked />
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 14 — Notification Analytics
   ============================================================ */

function NotificationAnalytics() {
  return (
    <WidgetCard
      title="Notification Analytics"
      description="Engagement insights and delivery breakdowns"
      icon={<BarChart3 size={16} />}
      level={2}
      glow="purple"
    >
      <AnalyticsTabs />
    </WidgetCard>
  );
}

/* ============================================================
   Main View
   ============================================================ */

export function NotificationsView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { items, unreadCount, markAllRead, markRead } = useNotificationStore();

  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [detail, setDetail] = useState<DetailDialogState>({ open: false, item: null });
  const [showPreferences, setShowPreferences] = useState(false);

  // When a category is selected, sync the filter.category too
  const handleCategorySelect = (id: CategoryId) => {
    setActiveCategory(id);
    setFilters({ ...filters, category: id });
  };

  const openDetail = (item: (typeof items)[number]) => {
    setDetail({ open: true, item });
    if (!item.read) markRead(item.id);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="Your communication hub — stay in sync with everything happening on LootLoom."
        actions={
          <>
            <LootButton
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck size={14} />}
              onClick={markAllRead}
            >
              Mark all read
            </LootButton>
            <LootButton
              variant="glass"
              size="icon"
              aria-label="Notification settings"
              onClick={() => setShowPreferences((v) => !v)}
            >
              <Settings2 size={16} />
            </LootButton>
          </>
        }
      />

      {/* Quick navigation pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center gap-2 mb-6"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mr-1">
          Jump to:
        </span>
        {[
          { id: "wallet", label: "Wallet", icon: Wallet },
          { id: "rewards", label: "Rewards", icon: Gift },
          { id: "redeem", label: "Redeem", icon: ShoppingBag },
          { id: "referral", label: "Referral", icon: Users },
          { id: "achievements", label: "Achievements", icon: Trophy },
          { id: "leaderboard", label: "Leaderboard", icon: Crown },
          { id: "support", label: "Support", icon: LifeBuoy },
        ].map((q) => (
          <button
            key={q.id}
            onClick={() => navigate(q.id as Parameters<typeof navigate>[0])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ring-border glass-1 hover:ring-electric/30 hover:text-electric transition-colors"
          >
            <q.icon size={12} />
            {q.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6 lg:space-y-8"
      >
        {/* Section 1 */}
        <section>
          <SectionHeader
            title="Notification Overview"
            description="At-a-glance metrics across all notification categories"
            icon={<Sparkles size={16} />}
          />
          <NotificationOverview unread={unreadCount} />
        </section>

        {/* Section 2 */}
        <section>
          <SectionHeader
            title="Notification Categories"
            description="Filter your feed by category — first one is active by default"
            icon={<PanelLeftOpen size={16} />}
          />
          <NotificationCategories active={activeCategory} onSelect={handleCategorySelect} />
        </section>

        {/* Section 13 — Search & Filters */}
        <section>
          <SectionHeader
            title="Search & Filters"
            description="Narrow down the feed with category, priority, status & date filters"
            icon={<Filter size={16} />}
          />
          <NotificationFilterBar filters={filters} setFilters={setFilters} />
        </section>

        {/* Sections 3 + 10 (feed + timeline) */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <NotificationFeed
              items={items}
              filters={filters}
              onOpen={openDetail}
              onMarkRead={markRead}
            />
          </div>
          <div className="xl:col-span-1">
            <NotificationTimeline storeItems={items} />
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <AnnouncementCenter />
        </section>

        {/* Sections 5–9 (category previews) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WalletNotificationPreview />
          <RewardNotifications />
          <RedeemNotifications />
          <SecurityNotifications />
          <SupportNotifications />
          <NotificationAnalytics />
        </section>

        {/* Section 12 — Preferences (collapsible) */}
        <AnimatePresence>
          {showPreferences && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <NotificationPreferences />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer quicklinks */}
        <section>
          <GlassCard level={1} className="p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <IconBadge name="BellRing" accent="electric" size="md" />
              <div>
                <p className="text-sm font-semibold text-foreground">Need more help?</p>
                <p className="text-xs text-muted-foreground">
                  Open a support ticket or browse the help center for assistance.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LootButton variant="outline" size="sm" leftIcon={<LifeBuoy size={13} />} onClick={() => navigate("support")}>
                Contact Support
              </LootButton>
              <LootButton variant="electric" size="sm" leftIcon={<Zap size={13} />} onClick={() => navigate("rewards")}>
                Browse Rewards
              </LootButton>
            </div>
          </GlassCard>
        </section>
      </motion.div>

      {/* Section 11 — Detail Dialog */}
      <NotificationDetailDialog state={detail} onClose={() => setDetail({ open: false, item: null })} />
    </PageContainer>
  );
}
