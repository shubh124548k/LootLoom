"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Lock,
  Megaphone,
  Search,
  Server,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  AnimatedCounter,
  EmptyState,
  ErrorState,
  GlassCard,
  Grid,
  IconBadge,
  LootButton,
  PageContainer,
  PageHeader,
  SectionHeader,
  SkeletonRow,
  StatusBadge,
  WidgetCard,
} from "@/components/lootloom";
import { cardReveal, floating, floatingSmall, hoverLift, staggerContainer } from "@/lib/animations";
import { useNavigationStore } from "@/stores";
import type { ViewId } from "@/types";
import { cn } from "@/lib/utils";

/* ============================================================
   CEO Dashboard — Mission Control Center
   Premium White · Glassmorphism · Executive Navy + Electric
   All data is placeholder. No backend, no DB, no analytics queries.
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
type HealthState = "operational" | "degraded" | "maintenance";
type AlertSeverity = "critical" | "warning" | "info" | "success";

/* ------------------------------------------------------------
   Placeholder datasets
   ------------------------------------------------------------ */

const OVERVIEW_STATS: Array<{
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  accent: Accent;
  trend?: { value: number; positive: boolean };
  future?: boolean;
}> = [
  { label: "Total Registered Users", value: 1284502, icon: "Users", accent: "electric", trend: { value: 8.4, positive: true } },
  { label: "Online Users", value: 38214, icon: "Activity", accent: "emerald", trend: { value: 3.1, positive: true } },
  { label: "Active Sessions", value: 51209, icon: "Zap", accent: "cyan", trend: { value: 2.2, positive: true } },
  { label: "Today's New Users", value: 2841, icon: "UserPlus", accent: "purple", trend: { value: 12.7, positive: true } },
  { label: "Future Active Devices", value: 96120, icon: "Smartphone", accent: "gold", trend: { value: 5.5, positive: true }, future: true },
  { label: "Future DAU", value: 184230, icon: "BarChart3", accent: "electric", trend: { value: 4.8, positive: true }, future: true },
  { label: "Future MAU", value: 942118, icon: "TrendingUp", accent: "navy", trend: { value: 6.2, positive: true }, future: true },
];

const PLATFORM_HEALTH: Array<{
  name: string;
  icon: string;
  accent: Accent;
  status: HealthState;
  response: string;
  latency: string;
  uptime: string;
  future?: boolean;
}> = [
  { name: "Authentication", icon: "ShieldCheck", accent: "emerald", status: "operational", response: "42ms", latency: "42ms", uptime: "99.99%" },
  { name: "Wallet Service", icon: "Wallet", accent: "electric", status: "operational", response: "58ms", latency: "58ms", uptime: "99.98%" },
  { name: "Rewards Engine", icon: "Gift", accent: "gold", status: "operational", response: "71ms", latency: "71ms", uptime: "99.95%" },
  { name: "Redeem Pipeline", icon: "ShoppingBag", accent: "purple", status: "degraded", response: "312ms", latency: "312ms", uptime: "99.42%" },
  { name: "Notifications", icon: "Bell", accent: "cyan", status: "operational", response: "39ms", latency: "39ms", uptime: "99.97%" },
  { name: "Support Desk", icon: "LifeBuoy", accent: "rose", status: "operational", response: "94ms", latency: "94ms", uptime: "99.88%" },
  { name: "Database", icon: "Database", accent: "navy", status: "operational", response: "18ms", latency: "18ms", uptime: "99.99%", future: true },
  { name: "Advertisement", icon: "Megaphone", accent: "gold", status: "maintenance", response: "—", latency: "—", uptime: "98.40%", future: true },
  { name: "Public API", icon: "Server", accent: "electric", status: "operational", response: "67ms", latency: "67ms", uptime: "99.96%", future: true },
];

const QUICK_ACTIONS: Array<{
  label: string;
  description: string;
  icon: string;
  accent: Accent;
  view?: ViewId;
  future?: boolean;
}> = [
  { label: "User Management", description: "Manage accounts & roles", icon: "Users", accent: "electric", view: "ceo-users" },
  { label: "Redeem Requests", description: "Approve pending redemptions", icon: "ShoppingBag", accent: "purple", future: true },
  { label: "Wallet Management", description: "Audit balances & ledger", icon: "Wallet", accent: "gold", future: true },
  { label: "Broadcast Center", description: "Push platform announcements", icon: "Megaphone", accent: "cyan", future: true },
  { label: "Support Center", description: "Triage tickets & chats", icon: "LifeBuoy", accent: "emerald", view: "support" },
  { label: "Reports", description: "Generate executive reports", icon: "ScrollText", accent: "navy", future: true },
  { label: "Analytics", description: "Deep-dive platform metrics", icon: "BarChart3", accent: "electric", future: true },
  { label: "Security", description: "Threats & access control", icon: "Shield", accent: "rose", future: true },
  { label: "Audit Logs", description: "Trace administrator actions", icon: "ScrollText", accent: "purple", future: true },
  { label: "Platform Settings", description: "Global configuration", icon: "Settings", accent: "cyan", view: "settings" },
  { label: "Advertisement Center", description: "Campaigns & inventory", icon: "Megaphone", accent: "gold", future: true },
  { label: "Notifications", description: "Manage delivery channels", icon: "Bell", accent: "emerald", future: true },
];

const LIVE_ACTIVITY: Array<{
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  accent: Accent;
  badge: string;
  badgeVariant: "info" | "success" | "warning" | "error" | "purple" | "gold" | "cyan";
  future?: boolean;
}> = [
  { id: "a1", title: "New User Registered", description: "user_29481 joined from Mumbai, IN", time: "12s ago", icon: "UserPlus", accent: "electric", badge: "User", badgeVariant: "info" },
  { id: "a2", title: "Future Wallet Updated", description: "Wallet balance adjusted by +1,250 coins", time: "48s ago", icon: "Wallet", accent: "gold", badge: "Wallet", badgeVariant: "gold", future: true },
  { id: "a3", title: "Future Reward Completed", description: "Offerwall payout #8421 finalized", time: "1m ago", icon: "Gift", accent: "purple", badge: "Reward", badgeVariant: "purple", future: true },
  { id: "a4", title: "Future Redeem Submitted", description: "$10 Amazon gift card redeem requested", time: "2m ago", icon: "ShoppingBag", accent: "cyan", badge: "Redeem", badgeVariant: "cyan", future: true },
  { id: "a5", title: "Future Support Ticket", description: "Priority ticket #1182 opened", time: "3m ago", icon: "LifeBuoy", accent: "rose", badge: "Ticket", badgeVariant: "error", future: true },
  { id: "a6", title: "Future Security Event", description: "Suspicious login blocked from VPN", time: "5m ago", icon: "Shield", accent: "rose", badge: "Security", badgeVariant: "warning", future: true },
  { id: "a7", title: "Future Broadcast", description: "Weekly digest pushed to 942K users", time: "12m ago", icon: "Megaphone", accent: "emerald", badge: "Broadcast", badgeVariant: "success", future: true },
  { id: "a8", title: "Future System Update", description: "API gateway rolled to v2.4.1", time: "28m ago", icon: "Server", accent: "navy", badge: "System", badgeVariant: "info", future: true },
];

const SYSTEM_ALERTS: Array<{
  id: string;
  title: string;
  description: string;
  time: string;
  severity: AlertSeverity;
  icon: string;
  future?: boolean;
}> = [
  { id: "s1", title: "Security Alert", description: "Multiple failed CEO login attempts detected from unknown device.", time: "4m ago", severity: "critical", icon: "Shield" },
  { id: "s2", title: "Maintenance Notice", description: "Advertisement service scheduled downtime tonight 02:00–02:30 IST.", time: "1h ago", severity: "warning", icon: "Server" },
  { id: "s3", title: "Future Fraud Detection", description: "Anomalous redeem pattern flagged for review on 3 accounts.", time: "2h ago", severity: "critical", icon: "AlertTriangle", future: true },
  { id: "s4", title: "Future API Warning", description: "Public API p95 latency trending upward over last 30 minutes.", time: "3h ago", severity: "warning", icon: "Cpu", future: true },
  { id: "s5", title: "Future Database Alert", description: "Replication lag detected on read-replica-02.", time: "4h ago", severity: "critical", icon: "Database", future: true },
  { id: "s6", title: "Future Advertisement Alert", description: "Campaign budget 92% consumed — review cap settings.", time: "6h ago", severity: "success", icon: "Megaphone", future: true },
];

const RECENT_MODULES = [
  { key: "users", title: "Recent Users", description: "Latest registrations", icon: "Users", accent: "electric" as Accent },
  { key: "redeems", title: "Pending Redeems", description: "Awaiting approval", icon: "ShoppingBag", accent: "purple" as Accent },
  { key: "wallet", title: "Recent Wallet Activity", description: "Ledger movements", icon: "Wallet", accent: "gold" as Accent },
  { key: "notifications", title: "Recent Notifications", description: "Delivery queue", icon: "Bell", accent: "cyan" as Accent },
  { key: "tickets", title: "Recent Support Tickets", description: "Open escalations", icon: "LifeBuoy", accent: "rose" as Accent },
  { key: "reports", title: "Recent Reports", description: "Generated exports", icon: "ScrollText", accent: "navy" as Accent },
];

const SYSTEM_SUMMARY: Array<{
  label: string;
  value: string;
  icon: string;
  accent: Accent;
  hint?: string;
  future?: boolean;
}> = [
  { label: "Platform Version", value: "v2.4.1", icon: "Sparkles", accent: "electric", hint: "Stable channel" },
  { label: "Environment", value: "Production", icon: "Server", accent: "emerald", hint: "Live cluster" },
  { label: "Server Status", value: "Healthy", icon: "HardDrive", accent: "emerald", hint: "All nodes online" },
  { label: "Build Version", value: "build #4821", icon: "Cpu", accent: "purple", hint: "Main · a1f9c2", future: true },
  { label: "Deployment", value: "Rolling", icon: "Server", accent: "cyan", hint: "Auto-scaling ON", future: true },
  { label: "Monitoring", value: "Active", icon: "Activity", accent: "electric", hint: "24/7 telemetry", future: true },
  { label: "Backup Status", value: "Latest 02:00", icon: "Database", accent: "gold", hint: "Encrypted · S3", future: true },
];

const SEARCH_CATEGORIES = [
  { label: "Users", icon: "Users", active: true },
  { label: "Tickets", icon: "LifeBuoy", active: false },
  { label: "Redeems", icon: "ShoppingBag", active: false },
  { label: "Wallets", icon: "Wallet", active: false },
  { label: "Reports", icon: "ScrollText", active: false },
];

const NOTIFICATION_PANEL = [
  { type: "System Alerts", icon: "Server", accent: "rose" as Accent, priority: "Critical", count: 3 },
  { type: "Support Updates", icon: "LifeBuoy", accent: "emerald" as Accent, priority: "High", count: 8 },
  { type: "Redeem Requests", icon: "ShoppingBag", accent: "purple" as Accent, priority: "Medium", count: 14 },
  { type: "Wallet Alerts", icon: "Wallet", accent: "gold" as Accent, priority: "High", count: 5 },
  { type: "Security Events", icon: "Shield", accent: "rose" as Accent, priority: "Critical", count: 2 },
  { type: "Future Monitoring", icon: "Activity", accent: "cyan" as Accent, priority: "Low", count: 0 },
];

/* Chart datasets ------------------------------------------------ */

const CHART = {
  electric: "oklch(0.62 0.22 255)",
  cyan: "oklch(0.72 0.15 200)",
  purple: "oklch(0.6 0.22 295)",
  gold: "oklch(0.8 0.16 85)",
  emerald: "oklch(0.7 0.17 160)",
  rose: "oklch(0.65 0.2 20)",
  navy: "oklch(0.27 0.05 260)",
};

const userGrowthData = [
  { x: "Mon", v: 1240 },
  { x: "Tue", v: 1580 },
  { x: "Wed", v: 1420 },
  { x: "Thu", v: 1980 },
  { x: "Fri", v: 2240 },
  { x: "Sat", v: 2680 },
  { x: "Sun", v: 2841 },
];

const platformActivityData = [
  { x: "Auth", v: 4200 },
  { x: "Wallet", v: 3100 },
  { x: "Rewards", v: 5400 },
  { x: "Redeem", v: 1800 },
  { x: "Notify", v: 6200 },
  { x: "Support", v: 940 },
];

const coinDistributionData = [
  { name: "Earned", value: 48, color: CHART.electric },
  { name: "Redeemed", value: 27, color: CHART.purple },
  { name: "Bonus", value: 14, color: CHART.gold },
  { name: "Referral", value: 11, color: CHART.cyan },
];

const walletActivityData = [
  { x: "00", v: 280 },
  { x: "04", v: 180 },
  { x: "08", v: 540 },
  { x: "12", v: 920 },
  { x: "16", v: 1240 },
  { x: "20", v: 880 },
  { x: "23", v: 460 },
];

const redeemOverviewData = [
  { x: "Amazon", v: 320 },
  { x: "PayPal", v: 280 },
  { x: "Google Play", v: 210 },
  { x: "Steam", v: 180 },
  { x: "Visa", v: 140 },
];

const referralGrowthData = [
  { x: "W1", v: 240 },
  { x: "W2", v: 380 },
  { x: "W3", v: 520 },
  { x: "W4", v: 690 },
  { x: "W5", v: 880 },
  { x: "W6", v: 1120 },
];

const notificationActivityData = [
  { x: "Push", v: 4200 },
  { x: "Email", v: 3100 },
  { x: "In-App", v: 5400 },
  { x: "SMS", v: 1200 },
  { x: "Webhook", v: 800 },
];

const revenuePlaceholder = [
  { label: "Today", value: "$12,480" },
  { label: "Week", value: "$84,210" },
  { label: "Month", value: "$318,940" },
  { label: "Quarter", value: "$1.02M" },
];

/* ------------------------------------------------------------
   Reusable helpers
   ------------------------------------------------------------ */

interface ExecutiveStatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  accent: Accent;
  trend?: { value: number; positive: boolean };
  index?: number;
  future?: boolean;
  isStatus?: boolean;
  statusLabel?: string;
  statusVariant?: "success" | "warning" | "error" | "info";
}

function ExecutiveStatCard({
  label,
  value,
  prefix,
  suffix,
  icon,
  accent,
  trend,
  index = 0,
  future = false,
  isStatus = false,
  statusLabel,
  statusVariant = "success",
}: ExecutiveStatCardProps) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="h-full"
    >
      <GlassCard
        hover
        sheen
        level={2}
        className="p-5 h-full flex flex-col gap-3 shadow-[var(--shadow-md)] relative overflow-hidden"
      >
        {future && (
          <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 px-1.5 py-0.5 rounded-md bg-muted/50">
            Future
          </span>
        )}
        <div className="flex items-start justify-between">
          <IconBadge name={icon} accent={accent} size="md" />
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5",
                trend.positive ? "bg-emerald-brand/10 text-emerald-brand" : "bg-rose-brand/10 text-rose-brand"
              )}
            >
              {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.positive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          {isStatus ? (
            <div className="flex items-center gap-2 pt-1">
              <StatusBadge variant={statusVariant} dot pulse>
                {statusLabel}
              </StatusBadge>
            </div>
          ) : (
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              className="text-2xl font-bold text-foreground"
            />
          )}
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface HealthTileProps {
  name: string;
  icon: string;
  accent: Accent;
  status: HealthState;
  response: string;
  latency: string;
  uptime: string;
  index?: number;
  future?: boolean;
}

function HealthTile({
  name,
  icon,
  accent,
  status,
  response,
  latency,
  uptime,
  index = 0,
  future = false,
}: HealthTileProps) {
  const statusConfig: Record<
    HealthState,
    { label: string; dot: string; badge: "success" | "warning" | "info"; ring: string }
  > = {
    operational: {
      label: "Operational",
      dot: "bg-emerald-brand",
      badge: "success",
      ring: "ring-emerald-brand/20",
    },
    degraded: {
      label: "Degraded",
      dot: "bg-gold",
      badge: "warning",
      ring: "ring-gold/25",
    },
    maintenance: {
      label: "Maintenance",
      dot: "bg-electric",
      badge: "info",
      ring: "ring-electric/20",
    },
  };
  const cfg = statusConfig[status];

  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="h-full"
    >
      <GlassCard
        hover
        sheen
        level={2}
        className={cn("p-4 h-full flex flex-col gap-3 ring-1", cfg.ring, "shadow-[var(--shadow-sm)]")}
      >
        <div className="flex items-center justify-between">
          <IconBadge name={icon} accent={accent} size="sm" />
          {future && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
              Future
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", cfg.dot)} />
            <StatusBadge variant={cfg.badge}>{cfg.label}</StatusBadge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 pt-1 border-t border-border/60">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Resp</p>
            <p className="text-xs font-semibold text-foreground tabular-nums">{response}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Latency</p>
            <p className="text-xs font-semibold text-foreground tabular-nums">{latency}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Uptime</p>
            <p className="text-xs font-semibold text-emerald-brand tabular-nums">{uptime}</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface AlertCardProps {
  title: string;
  description: string;
  time: string;
  severity: AlertSeverity;
  icon: string;
  index?: number;
  future?: boolean;
}

function AlertCard({ title, description, time, severity, icon, index = 0, future = false }: AlertCardProps) {
  const sevConfig: Record<
    AlertSeverity,
    { accent: Accent; bg: string; ring: string; label: string; badge: "error" | "warning" | "info" | "success" }
  > = {
    critical: {
      accent: "rose",
      bg: "bg-rose-brand/8",
      ring: "ring-rose-brand/25",
      label: "Critical",
      badge: "error",
    },
    warning: {
      accent: "gold",
      bg: "bg-gold/10",
      ring: "ring-gold/25",
      label: "Warning",
      badge: "warning",
    },
    info: {
      accent: "electric",
      bg: "bg-electric/8",
      ring: "ring-electric/20",
      label: "Info",
      badge: "info",
    },
    success: {
      accent: "emerald",
      bg: "bg-emerald-brand/8",
      ring: "ring-emerald-brand/20",
      label: "Resolved",
      badge: "success",
    },
  };
  const cfg = sevConfig[severity];

  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <GlassCard
        level={2}
        sheen
        className={cn("p-4 flex items-start gap-3 ring-1", cfg.bg, cfg.ring)}
      >
        <div className="shrink-0">
          <IconBadge name={icon} accent={cfg.accent} size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
            <StatusBadge variant={cfg.badge}>{cfg.label}</StatusBadge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground/80">{time}</span>
            {future && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Future
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface AnalyticsCardProps {
  title: string;
  description: string;
  iconName: string;
  accent: Accent;
  index?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function AnalyticsCard({ title, description, iconName, accent, index = 0, children, action }: AnalyticsCardProps) {
  const accentBorder: Record<Accent, string> = {
    electric: "hover:ring-electric/30",
    cyan: "hover:ring-cyan-brand/30",
    purple: "hover:ring-purple-brand/30",
    gold: "hover:ring-gold/30",
    emerald: "hover:ring-emerald-brand/30",
    rose: "hover:ring-rose-brand/30",
    navy: "hover:ring-navy/30",
  };
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="h-full"
    >
      <GlassCard
        hover
        sheen
        level={2}
        className={cn("p-4 h-full flex flex-col gap-3 ring-1 ring-border transition-all", accentBorder[accent])}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0">
              <IconBadge name={iconName} accent={accent} size="sm" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{description}</p>
            </div>
          </div>
          {action}
        </div>
        <div className="flex-1 min-h-0">{children}</div>
      </GlassCard>
    </motion.div>
  );
}

interface ActivityTimelineItemProps {
  title: string;
  description: string;
  time: string;
  icon: string;
  accent: Accent;
  badge: string;
  badgeVariant: "info" | "success" | "warning" | "error" | "purple" | "gold" | "cyan";
  index?: number;
  isLast?: boolean;
  future?: boolean;
}

function ActivityTimelineItem({
  title,
  description,
  time,
  icon,
  accent,
  badge,
  badgeVariant,
  index = 0,
  isLast = false,
  future = false,
}: ActivityTimelineItemProps) {
  const dotAccent: Record<Accent, string> = {
    electric: "bg-electric",
    cyan: "bg-cyan-brand",
    purple: "bg-purple-brand",
    gold: "bg-gold",
    emerald: "bg-emerald-brand",
    rose: "bg-rose-brand",
    navy: "bg-navy",
  };
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className="relative pl-10"
    >
      {/* Timeline rail */}
      {!isLast && (
        <span className="absolute left-[18px] top-7 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
      )}
      {/* Node */}
      <span
        className={cn(
          "absolute left-3 top-1.5 size-3.5 rounded-full ring-4 ring-background",
          dotAccent[accent]
        )}
      />
      <GlassCard level={1} className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <IconBadge name={icon} accent={accent} size="sm" />
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          </div>
          <StatusBadge variant={badgeVariant}>{badge}</StatusBadge>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/80">{time}</span>
          {future && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
              Future
            </span>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface CeoProfileCardProps {
  name: string;
  role: string;
  permissionLevel: string;
  session: string;
  lastLogin: string;
  device: string;
  ip: string;
  securityStatus: string;
}

function CeoProfileCard({
  name,
  role,
  permissionLevel,
  session,
  lastLogin,
  device,
  ip,
  securityStatus,
}: CeoProfileCardProps) {
  return (
    <motion.div variants={cardReveal} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <GlassCard level={1} sheen glow="electric" className="p-6 relative overflow-hidden shadow-[var(--shadow-lg)]">
        <motion.div
          variants={floating}
          animate="animate"
          className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-[radial-gradient(circle,var(--electric),transparent_70%)] opacity-20 blur-2xl"
        />
        <motion.div
          variants={floatingSmall}
          animate="animate"
          className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-[radial-gradient(circle,var(--purple-brand),transparent_70%)] opacity-15 blur-2xl"
        />

        <div className="relative flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center lg:items-start gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="relative size-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-[var(--shadow-glow)] bg-[linear-gradient(135deg,var(--navy),var(--electric)_60%,var(--purple-brand))]"
            >
              CEO
              <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-emerald-brand ring-2 ring-background flex items-center justify-center">
                <ShieldCheck size={12} className="text-white" strokeWidth={2.5} />
              </span>
            </motion.div>
            <StatusBadge variant="electric" dot pulse>
              <Lock size={10} className="mr-1" /> Secured
            </StatusBadge>
          </div>

          {/* Identity + meta */}
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Administrator
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{name}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge variant="purple">{role}</StatusBadge>
                <StatusBadge variant="gold">{permissionLevel}</StatusBadge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Current Session", value: session, icon: "Zap" },
                { label: "Last Login", value: lastLogin, icon: "Activity" },
                { label: "Future Device", value: device, icon: "Smartphone", future: true },
                { label: "Future IP Address", value: ip, icon: "Server", future: true },
                { label: "Security Status", value: securityStatus, icon: "ShieldCheck" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl glass-2 p-3 ring-1 ring-border/60 relative"
                >
                  {m.future && (
                    <span className="absolute top-1.5 right-1.5 text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">
                      Fut
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 mb-1">
                    <IconBadge name={m.icon} accent="navy" size="sm" />
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {m.label}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ------------------------------------------------------------
   Empty / Error states specific to CEO dashboard
   ------------------------------------------------------------ */

function NoAlertsEmpty() {
  return (
    <EmptyState
      icon="ShieldCheck"
      title="All systems quiet"
      description="No active alerts. Platform is operating within nominal parameters."
    />
  );
}

function NoActivityEmpty() {
  return (
    <EmptyState
      icon="Activity"
      title="No live activity yet"
      description="Live platform events will appear here in real time as they occur."
    />
  );
}

function AnalyticsUnavailableError() {
  return (
    <ErrorState
      icon="BarChart3"
      title="Analytics unavailable"
      description="The analytics pipeline is temporarily unreachable. Please retry in a moment."
      variant="warning"
    />
  );
}

/* ------------------------------------------------------------
   Section 5 — CEO Analytics (charts)
   ------------------------------------------------------------ */

const CHART_PERIODS = ["Daily", "Weekly", "Monthly"] as const;
type ChartPeriod = (typeof CHART_PERIODS)[number];

function CeoAnalytics() {
  const [period, setPeriod] = useState<ChartPeriod>("Daily");
  const [hasError, setHasError] = useState(false);

  const periodData = useMemo(() => {
    // Placeholder: scale datasets by period multiplier (no backend, just illustrative)
    const factor = period === "Daily" ? 1 : period === "Weekly" ? 7 : 30;
    return {
      userGrowth: userGrowthData.map((d) => ({ x: d.x, v: d.v * factor })),
      platformActivity: platformActivityData.map((d) => ({ x: d.x, v: d.v * factor })),
      walletActivity: walletActivityData.map((d) => ({ x: d.x, v: d.v * factor })),
      redeemOverview: redeemOverviewData.map((d) => ({ x: d.x, v: d.v * factor })),
      referralGrowth: referralGrowthData.map((d) => ({ x: d.x, v: d.v * factor })),
      notificationActivity: notificationActivityData.map((d) => ({ x: d.x, v: d.v * factor })),
    };
  }, [period]);

  return (
    <WidgetCard
      title="CEO Analytics"
      description="Executive platform metrics & growth"
      icon={<BarChart3 size={16} />}
      index={0}
      action={
        <div className="inline-flex items-center rounded-lg glass-2 ring-1 ring-border p-0.5">
          {CHART_PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                period === p
                  ? "bg-[linear-gradient(120deg,var(--electric),var(--purple-brand))] text-white shadow-[var(--shadow-sm)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      }
    >
      {hasError ? (
        <AnalyticsUnavailableError />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {/* User Growth — AreaChart */}
          <AnalyticsCard
            title="User Growth"
            description={`${period} registrations`}
            iconName="BarChart3"
            accent="electric"
            index={0}
            action={
              <StatusBadge variant="success" dot>
                +12.7%
              </StatusBadge>
            }
          >
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={periodData.userGrowth} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ceoUserGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.electric} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={CHART.electric} stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.62 0.22 255 / 0.2)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                    labelStyle={{ color: "oklch(0.27 0.05 260)", fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={CHART.electric}
                    strokeWidth={2.5}
                    fill="url(#ceoUserGrowth)"
                    dot={false}
                    activeDot={{ r: 4, fill: CHART.electric }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Platform Activity — BarChart */}
          <AnalyticsCard
            title="Platform Activity"
            description={`${period} calls by service`}
            iconName="Activity"
            accent="purple"
            index={1}
          >
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodData.platformActivity} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.6 0.22 295 / 0.2)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                    cursor={{ fill: "oklch(0.6 0.22 295 / 0.08)" }}
                  />
                  <Bar dataKey="v" fill={CHART.purple} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Coin Distribution — PieChart */}
          <AnalyticsCard
            title="Coin Distribution"
            description="Lifetime allocation"
            iconName="Gift"
            accent="gold"
            index={2}
          >
            <div className="h-40 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coinDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={62}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {coinDistributionData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.8 0.16 85 / 0.3)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {coinDistributionData.map((c) => (
                <span
                  key={c.name}
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                >
                  <span className="size-2 rounded-full" style={{ background: c.color }} />
                  {c.name} {c.value}%
                </span>
              ))}
            </div>
          </AnalyticsCard>

          {/* Wallet Activity — AreaChart */}
          <AnalyticsCard
            title="Wallet Activity"
            description={`${period} ledger movements`}
            iconName="Wallet"
            accent="cyan"
            index={3}
          >
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={periodData.walletActivity} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ceoWallet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.cyan} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={CHART.cyan} stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.72 0.15 200 / 0.2)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={CHART.cyan}
                    strokeWidth={2.5}
                    fill="url(#ceoWallet)"
                    dot={false}
                    activeDot={{ r: 4, fill: CHART.cyan }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Redeem Overview — BarChart */}
          <AnalyticsCard
            title="Redeem Overview"
            description={`${period} redemptions`}
            iconName="ShoppingBag"
            accent="rose"
            index={4}
          >
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodData.redeemOverview} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 9, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.65 0.2 20 / 0.2)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                    cursor={{ fill: "oklch(0.65 0.2 20 / 0.08)" }}
                  />
                  <Bar dataKey="v" fill={CHART.rose} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Referral Growth — LineChart */}
          <AnalyticsCard
            title="Referral Growth"
            description={`${period} referred users`}
            iconName="Users"
            accent="emerald"
            index={5}
          >
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={periodData.referralGrowth} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.7 0.17 160 / 0.25)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={CHART.emerald}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: CHART.emerald }}
                    activeDot={{ r: 5, fill: CHART.emerald }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Notification Activity — BarChart */}
          <AnalyticsCard
            title="Notification Activity"
            description={`${period} deliveries`}
            iconName="Bell"
            accent="electric"
            index={6}
          >
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodData.notificationActivity} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 9, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.62 0.22 255 / 0.2)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                    cursor={{ fill: "oklch(0.62 0.22 255 / 0.08)" }}
                  />
                  <Bar dataKey="v" fill={CHART.electric} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Future Revenue — placeholder */}
          <AnalyticsCard
            title="Future Revenue"
            description="Gross platform revenue"
            iconName="BarChart3"
            accent="gold"
            index={7}
            action={
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Future
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-3 h-full content-center">
              {revenuePlaceholder.map((r) => (
                <div key={r.label} className="rounded-xl glass-2 p-3 ring-1 ring-border/60">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.label}</p>
                  <p className="text-lg font-bold text-gradient-navy bg-clip-text">{r.value}</p>
                </div>
              ))}
            </div>
          </AnalyticsCard>
        </motion.div>
      )}
    </WidgetCard>
  );
}

/* ------------------------------------------------------------
   Section 3 — Quick Actions grid
   ------------------------------------------------------------ */

function QuickActions() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <WidgetCard
      title="Quick Actions"
      description="Jump into executive operations"
      icon={<Zap size={16} />}
      index={1}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        {QUICK_ACTIONS.map((action, i) => (
          <motion.button
            key={action.label}
            variants={cardReveal}
            custom={i}
            onClick={() => {
              if (action.view) navigate(action.view);
            }}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
            {...(action.view ? hoverLift : {})}
          >
            <GlassCard
              hover={Boolean(action.view)}
              sheen
              level={2}
              glow="electric"
              className={cn(
                "p-4 h-full flex flex-col gap-3 ring-1 ring-border/60 shadow-[var(--shadow-sm)]",
                !action.view && "opacity-90"
              )}
            >
              <div className="flex items-start justify-between">
                <IconBadge name={action.icon} accent={action.accent} size="md" />
                {action.future && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Future
                  </span>
                )}
                {action.view && (
                  <ArrowRight size={14} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {action.description}
                </p>
              </div>
            </GlassCard>
          </motion.button>
        ))}
      </motion.div>
    </WidgetCard>
  );
}

/* ------------------------------------------------------------
   Section 10 — Global administrator search
   ------------------------------------------------------------ */

function AdminSearch() {
  const [activeCat, setActiveCat] = useState("Users");
  return (
    <WidgetCard
      title="Global Administrator Search"
      description="Search across users, tickets, redeems, wallets & reports"
      icon={<Search size={16} />}
      index={2}
    >
      <div className="space-y-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder={`Search ${activeCat.toLowerCase()} by ID, name, email…`}
            className="w-full h-11 pl-10 pr-4 rounded-xl glass-2 ring-1 ring-border text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-electric/40 transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground/60 px-1.5 py-0.5 rounded-md bg-muted/50">
            ⌘K
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SEARCH_CATEGORIES.map((c) => {
            const active = activeCat === c.label;
            return (
              <button
                key={c.label}
                onClick={() => setActiveCat(c.label)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ring-1 transition-all",
                  active
                    ? "bg-[linear-gradient(120deg,var(--electric),var(--purple-brand))] text-white ring-transparent shadow-[var(--shadow-sm)]"
                    : "glass-2 text-muted-foreground ring-border hover:text-foreground hover:ring-electric/30"
                )}
              >
                <Search size={11} />
                {c.label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground/80 italic">
          Search is non-functional in this preview — backend wiring is queued for a future milestone.
        </p>
      </div>
    </WidgetCard>
  );
}

/* ------------------------------------------------------------
   Section 11 — Administrator notification panel
   ------------------------------------------------------------ */

function NotificationPanel() {
  const priorityVariant: Record<string, "error" | "warning" | "info" | "default"> = {
    Critical: "error",
    High: "warning",
    Medium: "info",
    Low: "default",
  };
  return (
    <WidgetCard
      title="Administrator Notifications"
      description="Priority queue by category"
      icon={<Bell size={16} />}
      index={3}
    >
      <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar pr-1">
        {NOTIFICATION_PANEL.map((n, i) => (
          <motion.div
            key={n.type}
            variants={cardReveal}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
          >
            <GlassCard level={1} className="p-3.5 flex items-center gap-3 ring-1 ring-border/60">
              <IconBadge name={n.icon} accent={n.accent} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{n.type}</p>
                  <StatusBadge variant={priorityVariant[n.priority]} dot={n.priority === "Critical"} pulse={n.priority === "Critical"}>
                    {n.priority}
                  </StatusBadge>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{n.count} pending</span>
                  {n.type.includes("Future") && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                      Future
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ------------------------------------------------------------
   Main view
   ------------------------------------------------------------ */

export function CeoDashboardView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [now] = useState(() => new Date());
  const dateString = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <PageContainer>
      <PageHeader
        title="Mission Control"
        description="Executive overview & platform health"
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-xl glass-2 ring-1 ring-border">
              <Activity size={14} className="text-emerald-brand" />
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {dateString} · {timeString}
              </span>
            </div>
            <LootButton
              variant="electric"
              size="md"
              leftIcon={<Megaphone size={16} />}
              onClick={() => navigate("settings")}
            >
              Broadcast
            </LootButton>
          </div>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6 lg:space-y-8"
      >
        {/* ============ Section 1 — CEO Overview ============ */}
        <section aria-label="CEO Overview">
          <Grid cols={4}>
            {OVERVIEW_STATS.map((s, i) => (
              <ExecutiveStatCard
                key={s.label}
                label={s.label}
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                icon={s.icon}
                accent={s.accent}
                trend={s.trend}
                index={i}
                future={s.future}
              />
            ))}
            {/* Current Platform Status — special stat card */}
            <ExecutiveStatCard
              label="Current Platform Status"
              value={0}
              icon="ShieldCheck"
              accent="emerald"
              index={OVERVIEW_STATS.length}
              isStatus
              statusLabel="All Systems Operational"
              statusVariant="success"
            />
          </Grid>
        </section>

        {/* ============ Section 2 — Platform Health ============ */}
        <section aria-label="Platform Health">
          <WidgetCard
            title="Platform Health"
            description="Real-time service status & uptime"
            icon={<Activity size={16} />}
            index={0}
            action={
              <StatusBadge variant="success" dot pulse>
                Live
              </StatusBadge>
            }
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {PLATFORM_HEALTH.map((h, i) => (
                <HealthTile
                  key={h.name}
                  name={h.name}
                  icon={h.icon}
                  accent={h.accent}
                  status={h.status}
                  response={h.response}
                  latency={h.latency}
                  uptime={h.uptime}
                  index={i}
                  future={h.future}
                />
              ))}
            </motion.div>
          </WidgetCard>
        </section>

        {/* ============ Section 3 — Quick Actions ============ */}
        <section aria-label="Quick Actions">
          <QuickActions />
        </section>

        {/* ============ Section 4 — Live Activity ============ */}
        <section aria-label="Live Activity">
          <WidgetCard
            title="Live Activity"
            description="Real-time platform event timeline"
            icon={<Activity size={16} />}
            index={0}
            action={
              <LootButton variant="ghost" size="sm" leftIcon={<Zap size={14} />}>
                Streaming
              </LootButton>
            }
          >
            <div className="max-h-[28rem] overflow-y-auto no-scrollbar pr-1 space-y-3">
              {LIVE_ACTIVITY.length === 0 ? (
                <NoActivityEmpty />
              ) : (
                LIVE_ACTIVITY.map((a, i) => (
                  <ActivityTimelineItem
                    key={a.id}
                    title={a.title}
                    description={a.description}
                    time={a.time}
                    icon={a.icon}
                    accent={a.accent}
                    badge={a.badge}
                    badgeVariant={a.badgeVariant}
                    index={i}
                    isLast={i === LIVE_ACTIVITY.length - 1}
                    future={a.future}
                  />
                ))
              )}
            </div>
          </WidgetCard>
        </section>

        {/* ============ Section 5 — CEO Analytics ============ */}
        <section aria-label="CEO Analytics">
          <CeoAnalytics />
        </section>

        {/* ============ Section 6 — System Alerts ============ */}
        <section aria-label="System Alerts">
          <WidgetCard
            title="System Alerts"
            description="Critical events & operational notices"
            icon={<AlertTriangle size={16} />}
            index={0}
            action={
              <StatusBadge variant="warning" dot pulse>
                {SYSTEM_ALERTS.filter((a) => a.severity === "critical").length} critical
              </StatusBadge>
            }
          >
            {SYSTEM_ALERTS.length === 0 ? (
              <NoAlertsEmpty />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {SYSTEM_ALERTS.map((a, i) => (
                  <AlertCard
                    key={a.id}
                    title={a.title}
                    description={a.description}
                    time={a.time}
                    severity={a.severity}
                    icon={a.icon}
                    index={i}
                    future={a.future}
                  />
                ))}
              </motion.div>
            )}
          </WidgetCard>
        </section>

        {/* ============ Section 7 — Recent Modules ============ */}
        <section aria-label="Recent Modules">
          <Grid cols={3}>
            {RECENT_MODULES.map((m, i) => (
              <WidgetCard
                key={m.key}
                title={m.title}
                description={m.description}
                icon={<IconBadge name={m.icon} accent={m.accent} size="sm" />}
                index={i}
              >
                <SkeletonRow count={3} />
              </WidgetCard>
            ))}
          </Grid>
        </section>

        {/* ============ Section 8 — CEO Profile ============ */}
        <section aria-label="CEO Profile">
          <SectionHeader
            title="Administrator Profile"
            description="Active session & security context"
            icon={<ShieldCheck size={16} />}
          />
          <CeoProfileCard
            name="Alexandra Pierce"
            role="Chief Executive"
            permissionLevel="Tier 0 · Root"
            session="02:14:08"
            lastLogin="Today, 09:42 IST"
            device="macOS · Safari 17"
            ip="10.4.22.118 (VPN)"
            securityStatus="MFA Verified"
          />
        </section>

        {/* ============ Section 9 — System Summary ============ */}
        <section aria-label="System Summary">
          <WidgetCard
            title="System Summary"
            description="Build, environment & operational metadata"
            icon={<Server size={16} />}
            index={0}
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {SYSTEM_SUMMARY.map((s, i) => (
                <motion.div key={s.label} variants={cardReveal} custom={i}>
                  <GlassCard level={2} className="p-4 ring-1 ring-border/60 h-full relative">
                    {s.future && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        Future
                      </span>
                    )}
                    <IconBadge name={s.icon} accent={s.accent} size="sm" />
                    <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="text-sm font-bold text-foreground truncate">{s.value}</p>
                    {s.hint && (
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">{s.hint}</p>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </WidgetCard>
        </section>

        {/* ============ Section 10 & 11 — Search + Notification Panel ============ */}
        <section aria-label="Search & Notifications" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminSearch />
          <NotificationPanel />
        </section>
      </motion.div>
    </PageContainer>
  );
}
