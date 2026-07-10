"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Users,
  CalendarCheck,
  ShieldCheck,
  CreditCard,
  Settings,
  Download,
  Filter,
  Search,
  ArrowLeftRight,
  Sparkles,
  Lock,
  History,
  Target,
  Lightbulb,
  Flame,
  CheckCircle2,
  Smartphone,
  KeyRound,
  Bell,
  Eye,
  Globe,
  Banknote,
  Bitcoin,
  Wallet2,
  ChevronRight,
  Plus,
  Zap,
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
  Tooltip,
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
  SkeletonRow,
} from "@/components/lootloom";
import { useNavigationStore, useWalletStore, useUserStore } from "@/stores";
import { cardReveal, staggerContainer, hoverLift, floating } from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Shared helpers
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

/** Small segmented tab control used inside widgets. */
function SegmentedTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex p-1 rounded-xl glass-1 ring-1 ring-border gap-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
            value === t.id ? "text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === t.id && (
            <motion.span
              layoutId={`seg-${tabs.map((x) => x.id).join("")}`}
              className="absolute inset-0 rounded-lg bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/** A small glass tile used inside the overview hero. */
function MiniStatTile({
  label,
  value,
  prefix,
  suffix,
  icon,
  accent,
  trend,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  accent: Accent;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <GlassCard level={1} hover sheen className="p-4 flex items-center gap-3">
      <IconBadge name={icon} accent={accent} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium truncate">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            className="text-lg font-bold text-foreground"
          />
          {trend && (
            <span
              className={cn(
                "inline-flex items-center text-[10px] font-semibold",
                trend.positive ? "text-emerald-brand" : "text-rose-brand"
              )}
            >
              {trend.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {trend.positive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================================================
   Placeholder chart data
   ============================================================ */

const DAILY_DATA = [
  { label: "Mon", earned: 120, redeemed: 40 },
  { label: "Tue", earned: 180, redeemed: 20 },
  { label: "Wed", earned: 95, redeemed: 60 },
  { label: "Thu", earned: 220, redeemed: 30 },
  { label: "Fri", earned: 145, redeemed: 80 },
  { label: "Sat", earned: 260, redeemed: 50 },
  { label: "Sun", earned: 200, redeemed: 90 },
];

const WEEKLY_DATA = [
  { label: "W1", earned: 680, redeemed: 220 },
  { label: "W2", earned: 920, redeemed: 180 },
  { label: "W3", earned: 760, redeemed: 320 },
  { label: "W4", earned: 1180, redeemed: 240 },
  { label: "W5", earned: 980, redeemed: 200 },
  { label: "W6", earned: 1320, redeemed: 280 },
];

const MONTHLY_DATA = [
  { label: "Jan", earned: 2840, redeemed: 980 },
  { label: "Feb", earned: 3120, redeemed: 1240 },
  { label: "Mar", earned: 2680, redeemed: 820 },
  { label: "Apr", earned: 3920, redeemed: 1480 },
  { label: "May", earned: 4280, redeemed: 1320 },
  { label: "Jun", earned: 3640, redeemed: 1160 },
];

const YEARLY_DATA = [
  { label: "Q1", earned: 18640, redeemed: 6240 },
  { label: "Q2", earned: 22840, redeemed: 7180 },
  { label: "Q3", earned: 19420, redeemed: 8260 },
  { label: "Q4", earned: 25480, redeemed: 9120 },
];

const DISTRIBUTION = [
  { name: "Earned", value: 58, color: "oklch(0.62 0.22 255)" },
  { name: "Redeemed", value: 27, color: "oklch(0.6 0.22 295)" },
  { name: "Bonus", value: 15, color: "oklch(0.8 0.16 85)" },
];

const MILESTONES = [
  { id: "m1", threshold: 5000, reward: "Bronze Tier", unlocked: true, accent: "gold" as Accent },
  { id: "m2", threshold: 10000, reward: "Silver Tier + ₹100 Bonus", unlocked: true, accent: "cyan" as Accent },
  { id: "m3", threshold: 20000, reward: "Gold Tier + Exclusive Rewards", unlocked: false, accent: "purple" as Accent },
  { id: "m4", threshold: 50000, reward: "Platinum Tier + Priority Support", unlocked: false, accent: "emerald" as Accent },
];

/* ============================================================
   1. Wallet Overview Hero
   ============================================================ */

function WalletOverview() {
  const {
    availableCoins,
    pendingCoins,
    lifetimeEarned,
    lifetimeRedeemed,
  } = useWalletStore();
  const { level, xp, xpToNext } = useUserStore();
  const estimatedValue = availableCoins / 100; // 100 coins = ₹1 placeholder

  return (
    <motion.div variants={cardReveal} initial="hidden" animate="visible" custom={0}>
      <GlassCard level={2} sheen glow="electric" className="relative overflow-hidden p-6 lg:p-8">
        {/* Animated gradient accents + floating coins */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-electric/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 size-72 rounded-full bg-purple-brand/20 blur-3xl" />
          <div className="absolute top-1/2 right-1/3 size-40 rounded-full bg-cyan-brand/15 blur-3xl" />
          {[
            { icon: Coins, x: "12%", y: "18%", d: 0, s: 22, c: "text-electric/30" },
            { icon: Coins, x: "82%", y: "70%", d: 1.2, s: 28, c: "text-purple-brand/25" },
            { icon: Coins, x: "70%", y: "20%", d: 2.1, s: 18, c: "text-cyan-brand/30" },
            { icon: Coins, x: "28%", y: "78%", d: 0.8, s: 16, c: "text-gold/30" },
          ].map((c, i) => (
            <motion.div
              key={i}
              variants={floating}
              initial="initial"
              animate="animate"
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: c.d }}
              className={cn("absolute", c.c)}
              style={{ left: c.x, top: c.y }}
            >
              <c.icon size={c.s} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Balance column */}
          <div className="lg:col-span-2 flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <IconBadge name="Wallet" accent="electric" size="lg" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Current Coin Balance
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">LootLoom Wallet</p>
                </div>
              </div>
              <StatusBadge variant="success" dot pulse>
                Wallet Active
              </StatusBadge>
            </div>

            <div>
              <div className="flex items-end gap-3 flex-wrap">
                <AnimatedCounter
                  value={availableCoins}
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand)_55%,var(--purple-brand))] bg-clip-text text-transparent"
                />
                <span className="inline-flex items-center gap-1 mb-2 text-sm font-semibold text-gold">
                  <Coins size={16} />
                  coins
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Estimated Reward Value:{" "}
                <span className="font-bold text-foreground">
                  ₹<AnimatedCounter value={estimatedValue} decimals={2} />
                </span>{" "}
                <span className="text-[11px] text-muted-foreground/70">(100 coins = ₹1)</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <LootButton variant="electric" size="sm" leftIcon={<Zap size={14} />}>
                Quick Earn
              </LootButton>
              <LootButton variant="glass" size="sm" leftIcon={<ArrowLeftRight size={14} />}>
                Convert
              </LootButton>
              <LootButton variant="ghost" size="sm" leftIcon={<History size={14} />}>
                Activity
              </LootButton>
            </div>
          </div>

          {/* Membership / XP column */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl glass-1 ring-1 ring-border p-5">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Membership Level
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="text-2xl font-bold bg-[linear-gradient(120deg,var(--purple-brand),var(--electric))] bg-clip-text text-transparent">
                  Level {level}
                </span>
                <StatusBadge variant="purple">Gold Member</StatusBadge>
              </div>
            </div>
            <ProgressRing
              value={(xp / xpToNext) * 100}
              size={132}
              strokeWidth={12}
              gradient="purple"
              label={`${Math.round((xp / xpToNext) * 100)}%`}
            />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{xp.toLocaleString()}</span> /{" "}
                {xpToNext.toLocaleString()} XP to next level
              </p>
            </div>
          </div>
        </div>

        {/* Mini stat tiles */}
        <div className="relative z-10 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStatTile
            label="Pending Coins"
            value={pendingCoins}
            icon="Clock"
            accent="gold"
            trend={{ value: 4, positive: true }}
          />
          <MiniStatTile
            label="Lifetime Earned"
            value={lifetimeEarned}
            icon="TrendingUp"
            accent="emerald"
            trend={{ value: 12, positive: true }}
          />
          <MiniStatTile
            label="Lifetime Redeemed"
            value={lifetimeRedeemed}
            icon="Gift"
            accent="purple"
            trend={{ value: 6, positive: true }}
          />
          <MiniStatTile
            label="Reward Value"
            value={estimatedValue}
            prefix="₹"
            decimals={2}
            icon="Banknote"
            accent="cyan"
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   2. Quick Wallet Actions
   ============================================================ */

function QuickWalletActions() {
  const navigate = useNavigationStore((s) => s.navigate);

  const actions: {
    title: string;
    description: string;
    icon: string;
    accent: Accent;
    onClick: () => void;
    locked?: boolean;
  }[] = [
    {
      title: "Earn Coins",
      description: "Complete missions & surveys",
      icon: "Coins",
      accent: "electric",
      onClick: () => navigate("earn"),
    },
    {
      title: "Redeem Rewards",
      description: "Convert coins to rewards",
      icon: "Gift",
      accent: "purple",
      onClick: () => navigate("redeem"),
    },
    {
      title: "Transaction History",
      description: "View all transactions",
      icon: "History",
      accent: "cyan",
      onClick: () => navigate("history"),
    },
    {
      title: "Referral Rewards",
      description: "Invite friends, earn coins",
      icon: "Users",
      accent: "emerald",
      onClick: () => navigate("referral"),
    },
    {
      title: "Daily Bonus",
      description: "Claim your daily reward",
      icon: "CalendarCheck",
      accent: "gold",
      onClick: () => navigate("daily-bonus"),
    },
    {
      title: "Support",
      description: "Get help with your wallet",
      icon: "LifeBuoy",
      accent: "navy",
      onClick: () => navigate("support"),
    },
    {
      title: "Withdraw",
      description: "Coming soon — stay tuned",
      icon: "Lock",
      accent: "rose",
      onClick: () => {},
      locked: true,
    },
  ];

  return (
    <WidgetCard
      title="Quick Wallet Actions"
      description="Jump to the most common wallet tasks"
      icon={<Sparkles size={16} />}
      level={2}
      index={1}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {actions.map((a, i) => (
          <motion.button
            key={a.title}
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            custom={i}
            onClick={a.onClick}
            disabled={a.locked}
            {...hoverLift}
            className={cn(
              "group text-left rounded-2xl p-4 glass-1 ring-1 ring-border hover:ring-electric/30 transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              a.locked && "opacity-60 cursor-not-allowed hover:ring-border"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <IconBadge name={a.icon} accent={a.accent} />
              {a.locked ? (
                <Lock size={14} className="text-muted-foreground" />
              ) : (
                <ChevronRight
                  size={16}
                  className="text-muted-foreground group-hover:text-electric group-hover:translate-x-0.5 transition-all"
                />
              )}
            </div>
            <p className="text-sm font-semibold text-foreground mb-0.5">{a.title}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{a.description}</p>
          </motion.button>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   3. Wallet Statistics
   ============================================================ */

function WalletStatistics() {
  const { todayEarnings, weeklyEarnings, monthlyEarnings } = useWalletStore();
  const [period, setPeriod] = useState<"today" | "weekly" | "monthly">("weekly");

  const data =
    period === "today"
      ? DAILY_DATA
      : period === "weekly"
      ? WEEKLY_DATA
      : MONTHLY_DATA;

  return (
    <WidgetCard
      title="Wallet Statistics"
      description="Your earning performance over time"
      icon={<TrendingUp size={16} />}
      level={2}
      index={2}
      action={
        <SegmentedTabs
          tabs={[
            { id: "today", label: "Today" },
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
          ]}
          value={period}
          onChange={(v) => setPeriod(v as typeof period)}
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="redeemGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.6 0.22 295)" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="oklch(0.7 0.2 320)" stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "oklch(0.62 0.22 255 / 0.06)" }}
                contentStyle={{
                  background: "oklch(1 0 0 / 0.92)",
                  border: "1px solid oklch(0.92 0.01 250)",
                  borderRadius: 12,
                  fontSize: 12,
                  backdropFilter: "blur(8px)",
                }}
                labelStyle={{ color: "oklch(0.21 0.04 256)", fontWeight: 600 }}
              />
              <Bar dataKey="earned" fill="url(#earnGrad)" radius={[6, 6, 0, 0]} name="Earned" />
              <Bar dataKey="redeemed" fill="url(#redeemGrad)" radius={[6, 6, 0, 0]} name="Redeemed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stat cards + progress rings */}
        <div className="flex flex-col gap-3">
          <StatCard
            label="Today's Earnings"
            value={todayEarnings}
            icon="CalendarCheck"
            accent="cyan"
            trend={{ value: 8, positive: true }}
            index={0}
          />
          <StatCard
            label="Weekly Earnings"
            value={weeklyEarnings}
            icon="TrendingUp"
            accent="electric"
            trend={{ value: 12, positive: true }}
            index={1}
          />
          <StatCard
            label="Monthly Earnings"
            value={monthlyEarnings}
            icon="Calendar"
            accent="purple"
            trend={{ value: 4, positive: true }}
            index={2}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassCard level={1} className="p-4 flex items-center gap-4">
          <ProgressRing value={85} size={84} strokeWidth={8} gradient="emerald" />
          <div>
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-gold" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Current Streak
              </p>
            </div>
            <p className="text-2xl font-bold text-foreground mt-0.5">12 days</p>
            <p className="text-[11px] text-muted-foreground">Best streak: 24 days</p>
          </div>
        </GlassCard>
        <GlassCard level={1} className="p-4 flex items-center gap-4">
          <ProgressRing value={94} size={84} strokeWidth={8} gradient="cyan" />
          <div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-brand" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Reward Success Rate
              </p>
            </div>
            <p className="text-2xl font-bold text-foreground mt-0.5">94%</p>
            <p className="text-[11px] text-muted-foreground">Last 30 days</p>
          </div>
        </GlassCard>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   4. Recent Transactions (skeleton — no fake data)
   ============================================================ */

function RecentTransactions() {
  const navigate = useNavigationStore((s) => s.navigate);

  const columns = ["Transaction ID", "Date", "Type", "Amount", "Status", "Description"];

  return (
    <WidgetCard
      title="Recent Transactions"
      description="Transaction history will appear here once connected to backend"
      icon={<ArrowLeftRight size={16} />}
      level={2}
      index={3}
      action={
        <div className="flex items-center gap-1.5">
          <LootButton variant="ghost" size="sm" leftIcon={<Filter size={14} />}>
            <span className="hidden sm:inline">Filter</span>
          </LootButton>
          <LootButton variant="ghost" size="sm" leftIcon={<Search size={14} />}>
            <span className="hidden sm:inline">Search</span>
          </LootButton>
          <LootButton variant="ghost" size="sm" leftIcon={<Download size={14} />}>
            <span className="hidden sm:inline">Export</span>
          </LootButton>
        </div>
      }
      footer={
        <LootButton
          variant="glass"
          size="sm"
          fullWidth
          rightIcon={<ChevronRight size={14} />}
          onClick={() => navigate("history")}
        >
          View all transactions
        </LootButton>
      }
    >
      {/* Column header row */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
        {columns.map((c, i) => (
          <div
            key={c}
            className={cn(
              i === 0 && "col-span-2",
              i === 1 && "col-span-2",
              i === 2 && "col-span-1",
              i === 3 && "col-span-2 text-right",
              i === 4 && "col-span-2",
              i === 5 && "col-span-3"
            )}
          >
            {c}
          </div>
        ))}
      </div>

      {/* Skeleton rows */}
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-3 items-center px-3 py-3 rounded-xl glass-1 ring-1 ring-border/60"
          >
            <div className="col-span-2 md:col-span-2 flex items-center gap-2.5">
              <div className="size-9 rounded-lg shimmer shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-2.5 w-16 rounded shimmer" />
              </div>
            </div>
            <div className="hidden md:block col-span-2 h-2.5 w-20 rounded shimmer" />
            <div className="hidden md:block col-span-1 h-5 w-12 rounded-md shimmer" />
            <div className="col-span-3 md:col-span-2 h-3 w-14 rounded shimmer justify-self-end" />
            <div className="hidden md:block col-span-2 h-5 w-16 rounded-full shimmer" />
            <div className="hidden md:block col-span-3 space-y-1.5">
              <div className="h-2.5 w-3/4 rounded shimmer" />
              <div className="h-2 w-1/2 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   5. Wallet Timeline (skeleton events)
   ============================================================ */

function WalletTimeline() {
  const events = [
    { icon: "ArrowDownLeft", accent: "emerald" as Accent, label: "Coin Credit" },
    { icon: "Gift", accent: "purple" as Accent, label: "Reward Redemption" },
    { icon: "ArrowUpRight", accent: "rose" as Accent, label: "Wallet Adjustment" },
    { icon: "Users", accent: "cyan" as Accent, label: "Referral Bonus" },
  ];

  return (
    <WidgetCard
      title="Wallet Timeline"
      description="Recent wallet activity stream (placeholder)"
      icon={<History size={16} />}
      level={2}
      index={4}
    >
      <div className="relative pl-2">
        {/* Vertical line */}
        <div className="absolute left-7 top-2 bottom-2 w-px bg-gradient-to-b from-electric/40 via-purple-brand/30 to-transparent" />

        <div className="space-y-3">
          {events.map((e, i) => (
            <motion.div
              key={i}
              variants={cardReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              custom={i}
              className="relative flex items-start gap-4"
            >
              <div className="relative z-10 shrink-0">
                <div className="size-10 rounded-xl glass-1 ring-1 ring-border flex items-center justify-center">
                  <IconBadge name={e.icon} accent={e.accent} size="sm" animate={false} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="rounded-xl p-4 glass-1 ring-1 ring-border/60 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{e.label}</span>
                      <StatusBadge variant="default" dot>
                        Pending
                      </StatusBadge>
                    </div>
                    <span className="text-[11px] text-muted-foreground">just now</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-2/3 rounded shimmer" />
                    <div className="h-2 w-1/2 rounded shimmer" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   6. Coin Analytics
   ============================================================ */

function CoinAnalytics() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const data =
    period === "daily"
      ? DAILY_DATA
      : period === "weekly"
      ? WEEKLY_DATA
      : period === "monthly"
      ? MONTHLY_DATA
      : YEARLY_DATA;

  return (
    <WidgetCard
      title="Coin Analytics"
      description="Deep-dive into your coin flow"
      icon={<TrendingUp size={16} />}
      level={2}
      index={5}
      action={
        <SegmentedTabs
          tabs={[
            { id: "daily", label: "Daily" },
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly" },
          ]}
          value={period}
          onChange={(v) => setPeriod(v as typeof period)}
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="areaEarn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaRedeem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.6 0.22 295)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.6 0.22 295)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(1 0 0 / 0.92)",
                  border: "1px solid oklch(0.92 0.01 250)",
                  borderRadius: 12,
                  fontSize: 12,
                  backdropFilter: "blur(8px)",
                }}
                labelStyle={{ color: "oklch(0.21 0.04 256)", fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="earned"
                stroke="oklch(0.62 0.22 255)"
                strokeWidth={2.5}
                fill="url(#areaEarn)"
                name="Earned"
              />
              <Area
                type="monotone"
                dataKey="redeemed"
                stroke="oklch(0.6 0.22 295)"
                strokeWidth={2.5}
                fill="url(#areaRedeem)"
                name="Redeemed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold self-start">
            Activity Distribution
          </p>
          <div className="relative">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                >
                  {DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(1 0 0 / 0.92)",
                    border: "1px solid oklch(0.92 0.01 250)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-foreground">100%</span>
              <span className="text-[10px] text-muted-foreground">Distribution</span>
            </div>
          </div>
          <div className="w-full space-y-1.5">
            {DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: d.color }}
                  />
                  {d.name}
                </span>
                <span className="font-semibold text-foreground tabular-nums">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   7. Reward Progress
   ============================================================ */

function RewardProgress() {
  const { availableCoins } = useWalletStore();
  const goal = 20000;
  const progress = Math.min(100, (availableCoins / goal) * 100);
  const remaining = Math.max(0, goal - availableCoins);

  return (
    <WidgetCard
      title="Reward Progress"
      description="Track your journey to the next reward tier"
      icon={<Target size={16} />}
      level={2}
      index={6}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Big progress ring */}
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl glass-1 ring-1 ring-border p-5">
          <ProgressRing
            value={progress}
            size={160}
            strokeWidth={14}
            gradient="electric"
            label={`${Math.round(progress)}%`}
          />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Next Reward Tier</p>
            <p className="text-sm font-bold text-foreground">
              <AnimatedCounter value={availableCoins} /> / {goal.toLocaleString()} coins
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              <AnimatedCounter value={remaining} /> coins to Gold Tier
            </p>
          </div>
        </div>

        {/* Milestones */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Milestone Rewards
          </p>
          {MILESTONES.map((m, i) => {
            const pct = Math.min(100, (availableCoins / m.threshold) * 100);
            return (
              <motion.div
                key={m.id}
                variants={cardReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20px" }}
                custom={i}
                className="flex items-center gap-3 p-3 rounded-xl glass-1 ring-1 ring-border/60"
              >
                <div className="relative shrink-0">
                  <ProgressRing
                    value={pct}
                    size={56}
                    strokeWidth={6}
                    gradient={
                      m.accent === "gold"
                        ? "gold"
                        : m.accent === "cyan"
                        ? "cyan"
                        : m.accent === "purple"
                        ? "purple"
                        : "emerald"
                    }
                    showLabel={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {m.unlocked ? (
                      <CheckCircle2 size={20} className="text-emerald-brand" />
                    ) : (
                      <Lock size={16} className="text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{m.reward}</p>
                    <span className="text-xs font-bold text-muted-foreground tabular-nums shrink-0">
                      {m.threshold.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand))]"
                    />
                  </div>
                </div>
                {m.unlocked && (
                  <StatusBadge variant="success" className="shrink-0">
                    Unlocked
                  </StatusBadge>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   8. Wallet Insights
   ============================================================ */

function WalletInsights() {
  const navigate = useNavigationStore((s) => s.navigate);

  const insights: {
    title: string;
    tip: string;
    icon: string;
    accent: Accent;
    cta?: { label: string; view: Parameters<typeof navigate>[0] };
  }[] = [
    {
      title: "Boost Your Earnings",
      tip: "Complete 3 daily missions to earn an extra 150 coins today.",
      icon: "TrendingUp",
      accent: "electric",
      cta: { label: "Start Earning", view: "earn" },
    },
    {
      title: "Recommended Reward",
      tip: "You're close to redeeming a ₹100 UPI cashout — only 1,160 coins away.",
      icon: "Gift",
      accent: "purple",
      cta: { label: "Browse Rewards", view: "rewards" },
    },
    {
      title: "Saving Tip",
      tip: "Save 5,000 coins to unlock Gold tier benefits and exclusive offers.",
      icon: "PiggyBank",
      accent: "gold",
    },
    {
      title: "Streak Reminder",
      tip: "You're on a 12-day streak. Claim today's bonus to keep it alive!",
      icon: "Flame",
      accent: "rose",
      cta: { label: "Claim Bonus", view: "daily-bonus" },
    },
  ];

  return (
    <WidgetCard
      title="Wallet Insights"
      description="Personalized recommendations & tips"
      icon={<Lightbulb size={16} />}
      level={2}
      index={7}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((ins, i) => (
          <motion.div
            key={ins.title}
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            custom={i}
            className="rounded-xl p-4 glass-1 ring-1 ring-border/60 hover:ring-electric/30 transition-all"
          >
            <div className="flex items-start gap-3">
              <IconBadge name={ins.icon} accent={ins.accent} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">{ins.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{ins.tip}</p>
                {ins.cta && (
                  <button
                    onClick={() => navigate(ins.cta!.view)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-electric hover:text-cyan-brand transition-colors"
                  >
                    {ins.cta.label}
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   9. Referral Earnings
   ============================================================ */

function ReferralEarnings() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <WidgetCard
      title="Referral Earnings"
      description="Earn coins by inviting friends"
      icon={<Users size={16} />}
      level={2}
      index={8}
      action={
        <LootButton
          variant="cyan"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => navigate("referral")}
        >
          Invite Friends
        </LootButton>
      }
    >
      <div className="grid grid-cols-3 gap-3 mb-4">
        <GlassCard level={1} className="p-4 text-center">
          <AnimatedCounter
            value={24}
            className="text-2xl font-bold text-foreground"
          />
          <p className="text-[11px] text-muted-foreground mt-0.5">Friends Invited</p>
        </GlassCard>
        <GlassCard level={1} className="p-4 text-center">
          <AnimatedCounter
            value={4}
            className="text-2xl font-bold text-gold"
          />
          <p className="text-[11px] text-muted-foreground mt-0.5">Pending Rewards</p>
        </GlassCard>
        <GlassCard level={1} className="p-4 text-center">
          <AnimatedCounter
            value={3200}
            className="text-2xl font-bold text-emerald-brand"
          />
          <p className="text-[11px] text-muted-foreground mt-0.5">Coins Earned</p>
        </GlassCard>
      </div>

      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
        Referral History
      </p>
      <SkeletonRow count={3} />
    </WidgetCard>
  );
}

/* ============================================================
   10. Wallet Security
   ============================================================ */

function WalletSecurity() {
  const securityItems: {
    label: string;
    status: string;
    badge: "success" | "warning" | "default" | "info";
    icon: string;
    accent: Accent;
    locked?: boolean;
  }[] = [
    {
      label: "Account Verification",
      status: "Verified",
      badge: "success",
      icon: "ShieldCheck",
      accent: "emerald",
    },
    {
      label: "Identity Verification",
      status: "Coming soon",
      badge: "default",
      icon: "UserCheck",
      accent: "cyan",
      locked: true,
    },
    {
      label: "Two-Factor Auth",
      status: "Coming soon",
      badge: "default",
      icon: "Lock",
      accent: "purple",
      locked: true,
    },
    {
      label: "Trusted Devices",
      status: "1 Active",
      badge: "info",
      icon: "Smartphone",
      accent: "electric",
    },
    {
      label: "Session Status",
      status: "Active",
      badge: "success",
      icon: "Activity",
      accent: "emerald",
    },
    {
      label: "Password Status",
      status: "Strong",
      badge: "success",
      icon: "KeyRound",
      accent: "gold",
    },
  ];

  return (
    <WidgetCard
      title="Wallet Security"
      description="Protect your wallet & account"
      icon={<ShieldCheck size={16} />}
      level={2}
      index={9}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {securityItems.map((s, i) => (
          <motion.div
            key={s.label}
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            custom={i}
            className={cn(
              "rounded-xl p-4 glass-1 ring-1 ring-border/60",
              s.locked && "opacity-70"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <IconBadge name={s.icon} accent={s.accent} size="sm" />
              {s.locked ? (
                <Lock size={13} className="text-muted-foreground" />
              ) : (
                <CheckCircle2 size={13} className="text-emerald-brand" />
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <div className="mt-1.5">
              <StatusBadge variant={s.badge} dot pulse={s.badge === "success"}>
                {s.status}
              </StatusBadge>
            </div>
          </motion.div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   11. Payment Information
   ============================================================ */

function PaymentInformation() {
  const methods = [
    { name: "UPI", icon: "Smartphone", accent: "electric" as Accent },
    { name: "Bank Account", icon: "Building2", accent: "purple" as Accent },
    { name: "PayPal", icon: "Wallet2", accent: "cyan" as Accent },
    { name: "Crypto", icon: "Bitcoin", accent: "gold" as Accent },
    { name: "Gift Cards", icon: "Gift", accent: "emerald" as Accent },
  ];

  return (
    <WidgetCard
      title="Payment Information"
      description="Connect payment methods for redemptions"
      icon={<CreditCard size={16} />}
      level={2}
      index={10}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {methods.map((m, i) => (
          <motion.div
            key={m.name}
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            custom={i}
            className="relative rounded-xl p-4 glass-1 ring-1 ring-border/60 opacity-80"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="size-12 rounded-xl glass-2 ring-1 ring-border flex items-center justify-center">
                <IconBadge name={m.icon} accent={m.accent} animate={false} />
              </div>
              <StatusBadge variant="warning" dot>
                Coming soon
              </StatusBadge>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={13} className="text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{m.name}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Payment integration coming soon.
            </p>
            <div className="mt-3 h-9 rounded-lg shimmer opacity-50" />
          </motion.div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   12. Wallet Settings
   ============================================================ */

function WalletSettings() {
  const [notifications, setNotifications] = useState({
    earnings: true,
    redemptions: true,
    security: true,
    marketing: false,
  });

  const toggles: { key: keyof typeof notifications; label: string; description: string }[] = [
    { key: "earnings", label: "Earning Alerts", description: "Notify me when coins are credited" },
    { key: "redemptions", label: "Redemption Updates", description: "Status of my reward redemptions" },
    { key: "security", label: "Security Alerts", description: "Sign-in & account activity alerts" },
    { key: "marketing", label: "Promotions", description: "Offers & new reward announcements" },
  ];

  return (
    <WidgetCard
      title="Wallet Settings"
      description="Manage wallet preferences"
      icon={<Settings size={16} />}
      level={2}
      index={11}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Currency selector (placeholder) */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Preferred Currency
          </p>
          <GlassCard level={1} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBadge name="Globe" accent="cyan" size="sm" />
              <div>
                <p className="text-sm font-semibold text-foreground">Indian Rupee (₹)</p>
                <p className="text-[11px] text-muted-foreground">Display currency</p>
              </div>
            </div>
            <StatusBadge variant="default">Locked</StatusBadge>
          </GlassCard>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Currency conversion is a future feature. Wallet currently displays in LootLoom coins.
          </p>

          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold pt-2">
            Privacy
          </p>
          <GlassCard level={1} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBadge name="Eye" accent="purple" size="sm" />
              <div>
                <p className="text-sm font-semibold text-foreground">Wallet Visibility</p>
                <p className="text-[11px] text-muted-foreground">Hide balance from public</p>
              </div>
            </div>
            <StatusBadge variant="info" dot>
              Private
            </StatusBadge>
          </GlassCard>
        </div>

        {/* Notification toggles */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Notification Preferences
          </p>
          {toggles.map((t) => (
            <GlassCard key={t.key} level={1} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <IconBadge name="Bell" accent={notifications[t.key] ? "electric" : "navy"} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t.description}</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={notifications[t.key]}
                aria-label={t.label}
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, [t.key]: !prev[t.key] }))
                }
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                  notifications[t.key] ? "bg-electric" : "bg-muted"
                )}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "inline-block size-5 rounded-full bg-white shadow-sm",
                    notifications[t.key] ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </GlassCard>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Main WalletView
   ============================================================ */

export function WalletView() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <PageContainer>
      <PageHeader
        title="Wallet"
        description="Your coin balance & transactions"
        actions={
          <>
            <LootButton
              variant="electric"
              size="md"
              leftIcon={<Zap size={15} />}
              onClick={() => navigate("earn")}
            >
              Earn More
            </LootButton>
            <LootButton
              variant="glass"
              size="md"
              leftIcon={<Gift size={15} />}
              onClick={() => navigate("redeem")}
            >
              Redeem
            </LootButton>
          </>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-5 lg:space-y-6"
      >
        {/* 1. Wallet Overview Hero */}
        <WalletOverview />

        {/* 2. Quick Wallet Actions */}
        <QuickWalletActions />

        {/* 3. Wallet Statistics */}
        <WalletStatistics />

        {/* 4 + 5: Recent Transactions + Timeline */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
          <RecentTransactions />
          <WalletTimeline />
        </div>

        {/* 6. Coin Analytics */}
        <CoinAnalytics />

        {/* 7. Reward Progress */}
        <RewardProgress />

        {/* 8 + 9: Insights + Referral */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
          <WalletInsights />
          <ReferralEarnings />
        </div>

        {/* 10. Wallet Security */}
        <WalletSecurity />

        {/* 11. Payment Information */}
        <PaymentInformation />

        {/* 12. Wallet Settings */}
        <WalletSettings />
      </motion.div>
    </PageContainer>
  );
}
