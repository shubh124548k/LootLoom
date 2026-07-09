"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  Calendar,
  CalendarCheck,
  Check,
  Clock,
  Coins,
  Copy,
  Crown,
  Flame,
  Gift,
  Headphones,
  KeyRound,
  LifeBuoy,
  Lock,
  Medal,
  MessageCircle,
  MonitorSmartphone,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Ticket,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import {
  AnimatedCounter,
  EmptyState,
  GlassCard,
  Grid,
  IconBadge,
  LootButton,
  PageContainer,
  PageHeader,
  ProgressRing,
  SkeletonRow,
  StatCard,
  StatusBadge,
  WidgetCard,
} from "@/components/lootloom";
import {
  cardReveal,
  floating,
  floatingSmall,
  hoverLift,
  staggerContainer,
} from "@/lib/animations";
import {
  useActivityStore,
  useNavigationStore,
  useNotificationStore,
  useUserStore,
  useWalletStore,
} from "@/stores";
import type { ViewId } from "@/types";

/* ============================================================
   Helpers
   ============================================================ */

function useGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "LL";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/* ============================================================
   Section 1 — Welcome Hero
   ============================================================ */

function WelcomeHero() {
  const { fullName, level, xp, xpToNext, rank, dailyStreak } = useUserStore();
  const { availableCoins, pendingCoins, todayEarnings } = useWalletStore();
  const navigate = useNavigationStore((s) => s.navigate);
  const greeting = useGreeting();
  const xpPercent = Math.min(100, Math.round((xp / xpToNext) * 100));

  const weeklyData = [
    { day: "M", value: 120 },
    { day: "T", value: 180 },
    { day: "W", value: 95 },
    { day: "T", value: 220 },
    { day: "F", value: 145 },
    { day: "S", value: 280 },
    { day: "S", value: 165 },
  ];

  return (
    <motion.div
      variants={cardReveal}
      custom={0}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="lg:col-span-2 xl:col-span-4"
    >
      <GlassCard
        level={1}
        sheen
        glow="electric"
        className="relative overflow-hidden p-6 lg:p-8 shadow-[var(--shadow-lg)]"
      >
        {/* Animated gradient accents */}
        <motion.div
          variants={floating}
          animate="animate"
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,var(--electric),transparent_70%)] opacity-25 blur-2xl"
        />
        <motion.div
          variants={floatingSmall}
          animate="animate"
          className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-[radial-gradient(circle,var(--purple-brand),transparent_70%)] opacity-20 blur-2xl"
        />
        <motion.div
          variants={floating}
          animate="animate"
          className="pointer-events-none absolute top-1/3 right-1/3 size-40 rounded-full bg-[radial-gradient(circle,var(--cyan-brand),transparent_70%)] opacity-20 blur-2xl"
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: identity + greeting */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ scale: 1.04, rotate: 2 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="relative size-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-[var(--shadow-glow)] bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand)_55%,var(--purple-brand))]"
              >
                {getInitials(fullName)}
                <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-brand ring-2 ring-background flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </span>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground font-medium">{greeting},</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                  {fullName}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge variant="electric" dot pulse>
                    <Crown size={11} className="mr-1" /> Level {level}
                  </StatusBadge>
                  <StatusBadge variant="gold">
                    <Flame size={11} className="mr-1" /> {dailyStreak} day streak
                  </StatusBadge>
                  <StatusBadge variant="purple">
                    <Trophy size={11} className="mr-1" /> Rank #{rank}
                  </StatusBadge>
                </div>
              </div>
            </div>

            {/* Coin balance + wallet mini */}
            <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Available Balance
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <AnimatedCounter
                    value={availableCoins}
                    className="text-4xl sm:text-5xl font-bold tracking-tight text-gradient-electric bg-clip-text"
                  />
                  <Coins className="size-7 text-gold mb-1" />
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-brand" /> Pending{" "}
                    <strong className="text-foreground">{pendingCoins.toLocaleString()}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp size={12} className="text-emerald-brand" /> +{todayEarnings} today
                  </span>
                </div>
              </div>
            </div>

            {/* XP progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground inline-flex items-center gap-1.5">
                  <Sparkles size={12} className="text-electric" /> Level {level} Progress
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
                </span>
              </div>
              <div className="relative h-2.5 rounded-full bg-muted overflow-hidden ring-1 ring-border">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${xpPercent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                  className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand),var(--purple-brand))] shadow-[0_0_12px_var(--electric)]"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {(xpToNext - xp).toLocaleString()} XP to reach Level {level + 1}
              </p>
            </div>
          </div>

          {/* Right: mini chart + CTA */}
          <div className="space-y-4">
            <div className="rounded-xl glass-2 p-4 ring-1 ring-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">This Week</span>
                <StatusBadge variant="success">+18%</StatusBadge>
              </div>
              <div className="h-24 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barCategoryGap={6}>
                    <defs>
                      <linearGradient id="welcomeBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.62 0.22 255)" />
                        <stop offset="100%" stopColor="oklch(0.72 0.15 200)" />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "currentColor" }}
                      className="text-muted-foreground"
                    />
                    <Bar dataKey="value" fill="url(#welcomeBar)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <LootButton variant="electric" size="sm" onClick={() => navigate("earn")} rightIcon={<ArrowRight size={14} />}>
                Start Earning
              </LootButton>
              <LootButton variant="glass" size="sm" onClick={() => navigate("wallet")} rightIcon={<ArrowRight size={14} />}>
                My Wallet
              </LootButton>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Section 2 — Quick Statistics
   ============================================================ */

function QuickStatistics() {
  const { availableCoins, pendingCoins, todayEarnings, lifetimeRedeemed } = useWalletStore();
  const { level, dailyStreak, xp, xpToNext } = useUserStore();
  const unread = useNotificationStore((s) => s.unreadCount);

  const stats = [
    { label: "Current Coins", value: availableCoins, icon: "Coins", accent: "gold" as const, trend: { value: 12, positive: true } },
    { label: "Today's Earnings", value: todayEarnings, icon: "TrendingUp", accent: "emerald" as const, trend: { value: 8, positive: true } },
    { label: "Pending Rewards", value: pendingCoins, icon: "Clock", accent: "cyan" as const, trend: { value: 4, positive: false } },
    { label: "Completed Redeems", value: 32, icon: "ShoppingBag", accent: "purple" as const, trend: { value: 16, positive: true } },
    { label: "Referral Count", value: 18, icon: "Users", accent: "electric" as const, trend: { value: 22, positive: true } },
    { label: "Achievement Progress", value: Math.round((xp / xpToNext) * 100), suffix: "%", icon: "Award", accent: "navy" as const, trend: { value: 5, positive: true } },
    { label: "Unread Notifications", value: unread, icon: "Bell", accent: "rose" as const, trend: { value: 2, positive: false } },
    { label: "Current Level", value: level, icon: "Crown", accent: "gold" as const, trend: { value: 1, positive: true } },
  ];

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="lg:col-span-2 xl:col-span-4"
    >
      <Grid cols={4} className="[&>*]:[animation:none]">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </Grid>
    </motion.section>
  );
}

/* ============================================================
   Section 3 — Quick Actions
   ============================================================ */

const QUICK_ACTIONS: Array<{
  label: string;
  desc: string;
  icon: typeof Zap;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
  view: ViewId;
}> = [
  { label: "Start Earning", desc: "Ads · Surveys", icon: Zap, accent: "electric", view: "earn" },
  { label: "Wallet", desc: "Coins & history", icon: Wallet, accent: "cyan", view: "wallet" },
  { label: "Redeem Rewards", desc: "Gift cards · UPI", icon: Gift, accent: "purple", view: "redeem" },
  { label: "Referral", desc: "Invite & earn", icon: Users, accent: "emerald", view: "referral" },
  { label: "Daily Bonus", desc: "Claim streak", icon: CalendarCheck, accent: "gold", view: "daily-bonus" },
  { label: "Missions", desc: "Active challenges", icon: Target, accent: "rose", view: "missions" },
  { label: "Leaderboard", desc: "Top earners", icon: Trophy, accent: "gold", view: "leaderboard" },
  { label: "Support", desc: "Help center", icon: LifeBuoy, accent: "cyan", view: "support" },
  { label: "Profile", desc: "Account settings", icon: ShieldCheck, accent: "navy", view: "profile" },
];

function QuickActions() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="lg:col-span-2 xl:col-span-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold text-foreground inline-flex items-center gap-2">
          <Zap size={16} className="text-electric" /> Quick Actions
        </h2>
        <span className="text-xs text-muted-foreground">Tap to jump in</span>
      </div>
      <Grid cols="auto">
        {QUICK_ACTIONS.map((a, i) => (
          <motion.div key={a.label} variants={cardReveal} custom={i}>
            <GlassCard
              hover
              sheen
              level={2}
              onClick={() => navigate(a.view)}
              className="p-4 h-full flex flex-col gap-3 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <IconBadge
                  name={a.icon.name}
                  accent={a.accent}
                  size="md"
                />
                <ArrowUpRight size={14} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{a.label}</p>
                <p className="text-[11px] text-muted-foreground">{a.desc}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </Grid>
    </motion.section>
  );
}

/* ============================================================
   Section 4 — Wallet Preview
   ============================================================ */

function WalletPreview() {
  const { availableCoins, pendingCoins, lifetimeEarned } = useWalletStore();
  const navigate = useNavigationStore((s) => s.navigate);

  const data = [
    { t: "1", v: 8400 },
    { t: "2", v: 9100 },
    { t: "3", v: 8800 },
    { t: "4", v: 10200 },
    { t: "5", v: 11400 },
    { t: "6", v: 12100 },
    { t: "7", v: availableCoins },
  ];

  return (
    <WidgetCard
      title="Wallet Preview"
      description="Balance & recent activity"
      icon={<Wallet size={16} />}
      index={0}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("wallet")} rightIcon={<ArrowRight size={14} />}>
          View Wallet
        </LootButton>
      }
      footer={
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Lifetime earned{" "}
            <strong className="text-foreground">{lifetimeEarned.toLocaleString()}</strong>
          </div>
          <LootButton variant="electric" size="sm" onClick={() => navigate("redeem")}>
            Redeem
          </LootButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl glass-2 p-3 ring-1 ring-border">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Available</p>
            <AnimatedCounter
              value={availableCoins}
              className="text-2xl font-bold text-gradient-electric bg-clip-text"
            />
          </div>
          <div className="rounded-xl glass-2 p-3 ring-1 ring-border">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Pending</p>
            <AnimatedCounter
              value={pendingCoins}
              className="text-2xl font-bold text-gold"
            />
          </div>
        </div>

        <div className="h-28 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="walletArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="oklch(0.62 0.22 255)"
                strokeWidth={2}
                fill="url(#walletArea)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Recent Transactions</p>
          <SkeletonRow count={3} />
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 5 — Reward Center Preview
   ============================================================ */

function RewardCenterPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  const rewards = [
    { name: "Rewarded Ads", amount: "5–25", icon: PlayCircle, accent: "electric" as const },
    { name: "Offerwall", amount: "50–500", icon: ShoppingBag, accent: "purple" as const },
    { name: "Daily Bonus", amount: "50", icon: CalendarCheck, accent: "gold" as const },
    { name: "Special Events", amount: "200+", icon: Star, accent: "rose" as const },
  ];
  return (
    <WidgetCard
      title="Reward Center"
      description="Ways to earn coins"
      icon={<Gift size={16} />}
      index={1}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("rewards")} rightIcon={<ArrowRight size={14} />}>
          Explore
        </LootButton>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {rewards.map((r, i) => (
          <motion.div
            key={r.name}
            variants={cardReveal}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <GlassCard
              hover
              sheen
              level={2}
              onClick={() => navigate("rewards")}
              className="p-4 h-full cursor-pointer"
            >
              <IconBadge name={r.icon.name} accent={r.accent} size="sm" />
              <p className="mt-3 text-sm font-semibold text-foreground">{r.name}</p>
              <p className="text-[11px] text-muted-foreground">
                Earn <strong className="text-foreground">{r.amount}</strong> coins
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 6 — Mission Center
   ============================================================ */

function MissionCenter() {
  const navigate = useNavigationStore((s) => s.navigate);
  const missions = [
    { name: "Daily Explorer", reward: 120, progress: 65, difficulty: "Easy" as const, time: "5 min", accent: "emerald" as const },
    { name: "Ad Master", reward: 250, progress: 40, difficulty: "Medium" as const, time: "12 min", accent: "electric" as const },
    { name: "Survey Pro", reward: 400, progress: 85, difficulty: "Hard" as const, time: "20 min", accent: "purple" as const },
  ];
  return (
    <WidgetCard
      title="Mission Center"
      description="Today's active missions"
      icon={<Target size={16} />}
      index={2}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("missions")} rightIcon={<ArrowRight size={14} />}>
          View all
        </LootButton>
      }
    >
      <div className="space-y-3">
        {missions.map((m, i) => (
          <motion.div
            key={m.name}
            variants={cardReveal}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <GlassCard level={2} className="p-4 flex items-center gap-4">
              <ProgressRing value={m.progress} size={56} strokeWidth={6} gradient={m.accent} label={`${m.progress}%`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                  <StatusBadge
                    variant={
                      m.difficulty === "Easy" ? "success" : m.difficulty === "Medium" ? "warning" : "error"
                    }
                  >
                    {m.difficulty}
                  </StatusBadge>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Coins size={11} className="text-gold" /> {m.reward}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {m.time}
                  </span>
                </div>
              </div>
              <LootButton size="sm" variant="outline" onClick={() => navigate("missions")}>
                Continue
              </LootButton>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 7 — Daily Bonus
   ============================================================ */

function DailyBonus() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { dailyStreak } = useUserStore();
  const days = [
    { day: "Mon", reward: 10, claimed: true },
    { day: "Tue", reward: 20, claimed: true },
    { day: "Wed", reward: 30, claimed: true },
    { day: "Thu", reward: 40, claimed: true },
    { day: "Fri", reward: 50, claimed: false, today: true },
    { day: "Sat", reward: 75, claimed: false },
    { day: "Sun", reward: 120, claimed: false },
  ];
  const tomorrow = days.find((d) => !d.claimed && !d.today) ?? days[days.length - 1]!;

  return (
    <WidgetCard
      title="Daily Bonus"
      description="Login streak rewards"
      icon={<Flame size={16} />}
      index={3}
      className="xl:col-span-2"
      action={
        <StatusBadge variant="gold" dot pulse>
          {dailyStreak} day streak
        </StatusBadge>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d, i) => (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`relative rounded-xl p-2 text-center ring-1 transition-all ${
                d.today
                  ? "bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] text-white ring-transparent shadow-[var(--shadow-glow)]"
                  : d.claimed
                  ? "glass-1 ring-emerald-brand/30 text-foreground"
                  : "glass-2 ring-border text-foreground"
              }`}
            >
              <p className="text-[10px] font-medium opacity-80">{d.day}</p>
              <div className="my-1 flex items-center justify-center">
                {d.claimed ? (
                  <Check size={14} className="text-emerald-brand" />
                ) : (
                  <Coins size={14} className={d.today ? "text-white" : "text-gold"} />
                )}
              </div>
              <p className="text-[10px] font-bold tabular-nums">{d.reward}</p>
              {d.today && (
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-brand ring-2 ring-background" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl glass-2 p-3 ring-1 ring-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBadge name="Gift" accent="gold" size="sm" />
            <div>
              <p className="text-xs text-muted-foreground">Tomorrow's reward</p>
              <p className="text-sm font-bold text-foreground inline-flex items-center gap-1">
                <Coins size={13} className="text-gold" /> {tomorrow.reward} coins
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Streak progress</p>
            <div className="mt-1 h-1.5 w-24 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(dailyStreak / 30) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--gold),oklch(0.75_0.18_60))]"
              />
            </div>
          </div>
        </div>

        <LootButton variant="gold" fullWidth onClick={() => navigate("daily-bonus")} leftIcon={<CalendarCheck size={16} />}>
          Claim Today's Bonus
        </LootButton>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 8 — Achievement Center
   ============================================================ */

function AchievementCenter() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { xp, xpToNext } = useUserStore();
  const achievements = [
    { name: "First Earn", icon: "Sparkles", progress: 100, rarity: "common" as const, accent: "electric" as const },
    { name: "Streak Keeper", icon: "Flame", progress: 80, rarity: "rare" as const, accent: "gold" as const },
    { name: "Coin Collector", icon: "Coins", progress: 65, rarity: "rare" as const, accent: "gold" as const },
    { name: "Mission Master", icon: "Target", progress: 45, rarity: "epic" as const, accent: "purple" as const },
    { name: "Social Star", icon: "Users", progress: 30, rarity: "epic" as const, accent: "cyan" as const },
    { name: "Legendary", icon: "Crown", progress: 12, rarity: "legendary" as const, accent: "rose" as const },
  ];
  const rarityVariant: Record<string, "default" | "info" | "purple" | "gold" | "error"> = {
    common: "default",
    rare: "info",
    epic: "purple",
    legendary: "error",
  };

  return (
    <WidgetCard
      title="Achievement Center"
      description="Unlock badges & rewards"
      icon={<Award size={16} />}
      index={4}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("achievements")} rightIcon={<ArrowRight size={14} />}>
          View all
        </LootButton>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {achievements.map((a, i) => (
          <motion.div
            key={a.name}
            variants={cardReveal}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <GlassCard level={2} className="p-3 flex flex-col items-center text-center gap-2 h-full">
              <div className="relative">
                <ProgressRing value={a.progress} size={62} strokeWidth={6} gradient={a.accent === "gold" ? "gold" : a.accent === "purple" ? "purple" : a.accent === "cyan" ? "cyan" : a.accent === "rose" ? "electric" : "electric"} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <IconBadge name={a.icon} accent={a.accent} size="sm" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{a.name}</p>
                <div className="mt-1">
                  <StatusBadge variant={rarityVariant[a.rarity]}>{a.rarity}</StatusBadge>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 rounded-xl glass-2 p-3 ring-1 ring-border">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-foreground inline-flex items-center gap-1.5">
            <Sparkles size={12} className="text-electric" /> XP Progress
          </span>
          <span className="text-muted-foreground tabular-nums">
            {xp.toLocaleString()} / {xpToNext.toLocaleString()}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(xp / xpToNext) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.3 }}
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand))]"
          />
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 9 — Leaderboard Preview
   ============================================================ */

function LeaderboardPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { fullName, rank, level } = useUserStore();

  const podium = [
    { rank: 1, name: "AaravMehta", xp: 18420, accent: "gold" as const, size: "lg" as const },
    { rank: 2, name: "PriyaK", xp: 16880, accent: "cyan" as const, size: "md" as const },
    { rank: 3, name: "Rohan99", xp: 15240, accent: "purple" as const, size: "sm" as const },
  ];

  const medalClass: Record<string, string> = {
    gold: "from-gold to-[oklch(0.75_0.18_60)]",
    cyan: "from-cyan-brand to-[oklch(0.78_0.16_180)]",
    purple: "from-purple-brand to-[oklch(0.7_0.2_320)]",
  };
  const sizeClass: Record<string, string> = {
    lg: "size-14 -mt-6 order-2",
    md: "size-12 -mt-3 order-1",
    sm: "size-10 mt-2 order-3",
  };

  return (
    <WidgetCard
      title="Leaderboard"
      description="Top earners this week"
      icon={<Trophy size={16} />}
      index={5}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("leaderboard")} rightIcon={<ArrowRight size={14} />}>
          View all
        </LootButton>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 items-end">
          {podium.map((p, i) => (
            <motion.div
              key={p.rank}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div
                className={`${sizeClass[p.size]} rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${medalClass[p.accent]} shadow-[var(--shadow-glow)] ring-4 ring-background`}
              >
                {p.rank === 1 ? <Crown size={22} /> : p.rank}
              </div>
              <GlassCard level={2} className="mt-2 p-3 w-full text-center">
                <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {p.xp.toLocaleString()} XP
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Current user highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <GlassCard
            level={1}
            glow="electric"
            className="p-3 flex items-center gap-3 ring-1 ring-electric/30"
          >
            <div className="size-10 rounded-xl flex items-center justify-center text-white font-bold bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))]">
              #{rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{fullName} (You)</p>
              <p className="text-[11px] text-muted-foreground">Level {level} · climbing fast</p>
            </div>
            <LootButton size="sm" variant="outline" onClick={() => navigate("leaderboard")}>
              Climb
            </LootButton>
          </GlassCard>
        </motion.div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 10 — Referral Center Preview
   ============================================================ */

function ReferralCenter() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { referralCode } = useUserStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralCode);
      }
    } catch {
      /* no-op */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const friends = 18;
  const friendsGoal = 25;
  const earnings = 3600;

  const data = [
    { name: "Invited", value: friends, color: "oklch(0.62 0.22 255)" },
    { name: "Remaining", value: friendsGoal - friends, color: "oklch(0.7 0.02 240)" },
  ];

  return (
    <WidgetCard
      title="Referral Center"
      description="Invite friends, earn coins"
      icon={<Users size={16} />}
      index={6}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("referral")} rightIcon={<ArrowRight size={14} />}>
          Share
        </LootButton>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl p-4 ring-1 ring-electric/20 bg-[linear-gradient(135deg,var(--electric)/10,var(--purple-brand)/10)]">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Your referral code</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <code className="text-lg font-bold tracking-[0.2em] text-gradient-electric bg-clip-text">
              {referralCode}
            </code>
            <LootButton
              size="sm"
              variant={copied ? "emerald" : "outline"}
              onClick={handleCopy}
              leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
            >
              {copied ? "Copied" : "Copy"}
            </LootButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl glass-2 p-3 ring-1 ring-border flex items-center gap-3">
            <div className="size-12 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    innerRadius={14}
                    outerRadius={22}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={1}
                  >
                    {data.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Friends invited</p>
              <p className="text-lg font-bold text-foreground">
                {friends}
                <span className="text-xs text-muted-foreground">/{friendsGoal}</span>
              </p>
            </div>
          </div>
          <div className="rounded-xl glass-2 p-3 ring-1 ring-border">
            <p className="text-[11px] text-muted-foreground">Referral earnings</p>
            <p className="text-lg font-bold text-gold inline-flex items-center gap-1">
              <Coins size={14} /> {earnings.toLocaleString()}
            </p>
          </div>
        </div>

        <LootButton variant="purple" fullWidth onClick={() => navigate("referral")} leftIcon={<Users size={16} />}>
          Invite More Friends
        </LootButton>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 11 — Recent Activity Timeline
   ============================================================ */

function RecentActivityTimeline() {
  const navigate = useNavigationStore((s) => s.navigate);
  const items = useActivityStore((s) => s.items);

  const typeIcon: Record<string, { icon: typeof Coins; accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy" }> = {
    earned: { icon: PlayCircle, accent: "electric" },
    mission: { icon: Target, accent: "purple" },
    bonus: { icon: CalendarCheck, accent: "gold" },
    referral: { icon: Users, accent: "emerald" },
    redeemed: { icon: ShoppingBag, accent: "rose" },
    system: { icon: Bell, accent: "navy" },
  };

  if (items.length === 0) {
    return (
      <WidgetCard
        title="Recent Activity"
        description="Your latest actions"
        icon={<Clock size={16} />}
        index={7}
        className="xl:col-span-2"
        action={
          <LootButton variant="ghost" size="sm" onClick={() => navigate("history")}>
            View history
          </LootButton>
        }
      >
        <EmptyState
          icon="Inbox"
          title="No activity yet"
          description="Start earning to see your activity timeline here."
        />
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Recent Activity"
      description="Your latest actions"
      icon={<Clock size={16} />}
      index={7}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("history")} rightIcon={<ArrowRight size={14} />}>
          View history
        </LootButton>
      }
    >
      <div className="relative pl-4">
        {/* Gradient timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[2px] rounded-full bg-[linear-gradient(180deg,var(--electric),var(--cyan-brand),var(--purple-brand))]" />

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-3"
        >
          {items.map((item) => {
            const cfg = typeIcon[item.type] ?? typeIcon.system!;
            const Icon = cfg.icon;
            const positive = (item.amount ?? 0) >= 0;
            return (
              <motion.li
                key={item.id}
                variants={cardReveal}
                className="relative"
              >
                <span
                  className={`absolute -left-4 top-3 size-3.5 rounded-full ring-2 ring-background bg-gradient-to-br ${
                    cfg.accent === "electric"
                      ? "from-electric to-cyan-brand"
                      : cfg.accent === "purple"
                      ? "from-purple-brand to-[oklch(0.7_0.2_320)]"
                      : cfg.accent === "gold"
                      ? "from-gold to-[oklch(0.75_0.18_60)]"
                      : cfg.accent === "emerald"
                      ? "from-emerald-brand to-[oklch(0.75_0.16_180)]"
                      : cfg.accent === "rose"
                      ? "from-rose-brand to-[oklch(0.65_0.22_15)]"
                      : "from-navy to-[oklch(0.4_0.04_250)]"
                  }`}
                />
                <GlassCard level={2} className="p-3 flex items-center gap-3">
                  <IconBadge name={Icon.name} accent={cfg.accent} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                  {item.amount !== undefined && (
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        positive ? "text-emerald-brand" : "text-rose-brand"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {item.amount.toLocaleString()}
                    </span>
                  )}
                </GlassCard>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 12 — Notification Preview
   ============================================================ */

function NotificationPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  const items = useNotificationStore((s) => s.items);
  const unread = items.filter((n) => !n.read).slice(0, 3);

  const typeAccent: Record<string, "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy"> = {
    reward: "gold",
    wallet: "cyan",
    system: "navy",
    security: "rose",
    social: "emerald",
    announcement: "electric",
  };

  return (
    <WidgetCard
      title="Notifications"
      description="Latest unread alerts"
      icon={<Bell size={16} />}
      index={8}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("notifications")} rightIcon={<ArrowRight size={14} />}>
          View all
        </LootButton>
      }
    >
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 lootloom-scroll">
        {unread.length === 0 ? (
          <EmptyState
            icon="Bell"
            title="You're all caught up"
            description="No unread notifications right now."
          />
        ) : (
          unread.map((n, i) => {
            const accent = typeAccent[n.type] ?? "electric";
            return (
              <motion.div
                key={n.id}
                variants={cardReveal}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <GlassCard
                  hover
                  level={2}
                  onClick={() => navigate("notifications")}
                  className="p-3 flex items-start gap-3 cursor-pointer"
                >
                  <IconBadge name={n.icon ?? "Bell"} accent={accent} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{n.body}</p>
                  </div>
                  <span className="mt-1 size-2 rounded-full bg-electric shrink-0 animate-pulse" />
                </GlassCard>
              </motion.div>
            );
          })
        )}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 13 — Security Status
   ============================================================ */

function SecurityStatus() {
  const navigate = useNavigationStore((s) => s.navigate);
  const items = [
    { label: "Account Status", value: "Active", variant: "success" as const, icon: ShieldCheck, desc: "Verified member" },
    { label: "Email Verification", value: "Pending", variant: "warning" as const, icon: MessageCircle, desc: "Verify to unlock features" },
    { label: "Password Strength", value: "Strong", variant: "success" as const, icon: KeyRound, desc: "Last changed 12 days ago" },
    { label: "Session Security", value: "Protected", variant: "info" as const, icon: Lock, desc: "2 active sessions" },
    { label: "Device Verification", value: "Coming soon", variant: "default" as const, icon: MonitorSmartphone, desc: "Trusted device list" },
  ];

  return (
    <WidgetCard
      title="Security Status"
      description="Account protection overview"
      icon={<ShieldCheck size={16} />}
      index={9}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("profile")} rightIcon={<ArrowRight size={14} />}>
          Manage
        </LootButton>
      }
    >
      <div className="space-y-2.5">
        {items.map((it, i) => (
          <motion.div
            key={it.label}
            variants={cardReveal}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <GlassCard level={2} className="p-3 flex items-center gap-3">
              <div className="size-9 rounded-lg flex items-center justify-center bg-emerald-brand/10 text-emerald-brand ring-1 ring-emerald-brand/20">
                <it.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{it.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{it.desc}</p>
              </div>
              <StatusBadge variant={it.variant} dot={it.variant !== "default"}>
                {it.value}
              </StatusBadge>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 14 — Support Center Preview
   ============================================================ */

function SupportCenter() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <WidgetCard
      title="Support Center"
      description="We're here to help"
      icon={<LifeBuoy size={16} />}
      index={10}
      className="xl:col-span-2"
      action={
        <LootButton variant="electric" size="sm" onClick={() => navigate("support")} leftIcon={<Ticket size={14} />}>
          New Ticket
        </LootButton>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div variants={cardReveal} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard hover level={2} onClick={() => navigate("support")} className="p-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <IconBadge name="Ticket" accent="electric" size="sm" />
              <StatusBadge variant="info">1 open</StatusBadge>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">Open Ticket</p>
            <p className="text-[11px] text-muted-foreground">Track your active conversations</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={cardReveal} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard hover level={2} onClick={() => navigate("support")} className="p-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <IconBadge name="Clock" accent="cyan" size="sm" />
              <StatusBadge variant="success">Resolved</StatusBadge>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">Recent Ticket</p>
            <p className="text-[11px] text-muted-foreground">"How to redeem UPI?" · 2d ago</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={cardReveal} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard hover level={2} onClick={() => navigate("support")} className="p-4 cursor-pointer">
            <IconBadge name="LifeBuoy" accent="purple" size="sm" />
            <p className="mt-3 text-sm font-semibold text-foreground">Help Center</p>
            <p className="text-[11px] text-muted-foreground">Guides, FAQs & tutorials</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={cardReveal} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard hover level={2} onClick={() => navigate("support")} className="p-4 cursor-pointer">
            <IconBadge name="MessageCircle" accent="emerald" size="sm" />
            <p className="mt-3 text-sm font-semibold text-foreground">FAQ</p>
            <p className="text-[11px] text-muted-foreground">Quick answers to common questions</p>
          </GlassCard>
        </motion.div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Dashboard View
   ============================================================ */

export function DashboardView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Your account overview & activity"
        actions={
          <>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground rounded-full glass-2 px-3 py-1.5 ring-1 ring-border">
              <Calendar size={13} /> {today}
            </span>
            <LootButton
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={() => navigate("dashboard")}
            >
              Refresh
            </LootButton>
          </>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5"
      >
        <WelcomeHero />
        <QuickStatistics />
        <QuickActions />
        <WalletPreview />
        <RewardCenterPreview />
        <MissionCenter />
        <DailyBonus />
        <AchievementCenter />
        <LeaderboardPreview />
        <ReferralCenter />
        <RecentActivityTimeline />
        <NotificationPreview />
        <SecurityStatus />
        <SupportCenter />
      </motion.div>
    </PageContainer>
  );
}
