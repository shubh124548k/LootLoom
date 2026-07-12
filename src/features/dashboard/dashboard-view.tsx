"use client";

import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  CalendarCheck,
  Check,
  Clock,
  Coins,
  Gift,
  History,
  IndianRupee,
  LifeBuoy,
  PlayCircle,
  RefreshCw,
  Settings,
  ShoppingBag,
  Target,
  Ticket,
  TrendingUp,
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
  StatCard,
  WidgetCard,
} from "@/components/lootloom";
import {
  cardReveal,
  floating,
  floatingSmall,
  staggerContainer,
} from "@/lib/animations";
import {
  useActivityStore,
  useNavigationStore,
  useNotificationStore,
  useUserStore,
  useWalletStore,
} from "@/stores";
import { useDashboardData } from "@/hooks/use-dashboard-data";
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

/** Coin → INR conversion (placeholder, backend-ready). 1 coin ≈ ₹0.10 */
const COIN_TO_INR = 0.1;

/** Reward denomination tiers (₹). Backend-ready: replace with API list. */
const REWARD_TIERS: Array<{ value: number; coins: number }> = [
  { value: 10, coins: 100 },
  { value: 20, coins: 200 },
  { value: 30, coins: 300 },
  { value: 40, coins: 400 },
  { value: 50, coins: 500 },
  { value: 100, coins: 1000 },
  { value: 200, coins: 2000 },
  { value: 500, coins: 5000 },
  { value: 1000, coins: 10000 },
];

/* ============================================================
   Section 1 — Welcome Hero
   ============================================================ */

function WelcomeHero() {
  const { fullName } = useUserStore();
  const { availableCoins, pendingCoins, todayEarnings } = useWalletStore();
  const navigate = useNavigationStore((s) => s.navigate);
  const unread = useNotificationStore((s) => s.unreadCount);
  const greeting = useGreeting();

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
          {/* Left: identity + greeting + balance */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ scale: 1.04, rotate: 2 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="relative size-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-[var(--shadow-glow)] bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand)_55%,var(--purple-brand))]"
              >
                {getInitials(fullName || "LootLoom")}
                <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-brand ring-2 ring-background flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </span>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground font-medium">{greeting},</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                  {fullName || "LootLoom Member"}
                </h2>
              </div>
            </div>

            {/* Coin balance */}
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

          {/* Right: notification bell + CTAs */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => navigate("notifications")}
              aria-label="View notifications"
              className="relative w-full rounded-xl glass-2 p-3 ring-1 ring-border flex items-center gap-3 hover:ring-electric/40 transition-all"
            >
              <span className="relative inline-flex">
                <Bell size={18} className="text-electric" />
                {unread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-electric text-white text-[10px] font-bold flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </span>
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold text-foreground">Notifications</p>
                <p className="text-[11px] text-muted-foreground">
                  {unread > 0 ? `${unread} unread` : "All caught up"}
                </p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </button>
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
   Section 2 — Quick Statistics (Wallet Overview Stats)
   ============================================================ */

function QuickStatistics({ adsWatchedToday }: { adsWatchedToday: number }) {
  const { availableCoins, todayEarnings } = useWalletStore();
  const cashValue = Math.round(availableCoins * COIN_TO_INR);

  const stats = [
    { label: "Current Coins", value: availableCoins, icon: "Coins", accent: "gold" as const },
    { label: "Cash Value", value: cashValue, prefix: "₹", icon: "IndianRupee", accent: "emerald" as const },
    { label: "Today's Earnings", value: todayEarnings, icon: "TrendingUp", accent: "cyan" as const },
    { label: "Ads Watched Today", value: adsWatchedToday, icon: "PlayCircle", accent: "purple" as const },
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
  { label: "Watch Ads", desc: "Earn coins", icon: PlayCircle, accent: "electric", view: "earn" },
  { label: "Wallet", desc: "Coins & history", icon: Wallet, accent: "cyan", view: "wallet" },
  { label: "Redeem", desc: "Gift cards · UPI", icon: Gift, accent: "purple", view: "redeem" },
  { label: "History", desc: "Activity log", icon: History, accent: "gold", view: "history" },
  { label: "Settings", desc: "Account settings", icon: Settings, accent: "emerald", view: "settings" },
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
                <IconBadge name={a.icon.name} accent={a.accent} size="md" />
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

function WalletPreview({
  adsWatchedToday,
  chart,
}: {
  adsWatchedToday: number;
  chart: Array<{ day: string; value: number }>;
}) {
  const { availableCoins, todayEarnings } = useWalletStore();
  const navigate = useNavigationStore((s) => s.navigate);
  const cashValue = Math.round(availableCoins * COIN_TO_INR);

  const stats = [
    { label: "Current Coins", value: availableCoins, icon: Coins, accent: "text-gold" },
    { label: "Cash Value", value: cashValue, prefix: "₹", icon: IndianRupee, accent: "text-emerald-brand" },
    { label: "Today's Earnings", value: todayEarnings, icon: TrendingUp, accent: "text-cyan-brand" },
    { label: "Ads Watched", value: adsWatchedToday, icon: PlayCircle, accent: "text-purple-brand" },
  ];

  return (
    <WidgetCard
      title="Wallet Overview"
      description="Balance, earnings & weekly trend"
      icon={<Wallet size={16} />}
      index={1}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("wallet")} rightIcon={<ArrowRight size={14} />}>
          View Wallet
        </LootButton>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl glass-2 p-3 ring-1 ring-border">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <Icon size={14} className={s.accent} />
                </div>
                <AnimatedCounter
                  value={s.value}
                  prefix={s.prefix}
                  className="text-xl font-bold text-foreground mt-1"
                />
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-foreground">Weekly Earnings</p>
            <span className="text-[11px] text-muted-foreground">Last 7 days</span>
          </div>
          <div className="h-28 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="walletArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="oklch(0.62 0.22 255)"
                  strokeWidth={2}
                  fill="url(#walletArea)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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

  return (
    <WidgetCard
      title="Available Rewards"
      description="Redeem coins for cash & gift cards"
      icon={<Gift size={16} />}
      index={2}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("redeem")} rightIcon={<ArrowRight size={14} />}>
          View all
        </LootButton>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1 lootloom-scroll">
        {REWARD_TIERS.map((r, i) => (
          <motion.div
            key={r.value}
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
              onClick={() => navigate("redeem")}
              className="p-4 h-full cursor-pointer flex flex-col items-center text-center gap-2"
            >
              <div className="size-9 rounded-xl flex items-center justify-center bg-emerald-brand/10 text-emerald-brand ring-1 ring-emerald-brand/20">
                <IndianRupee size={16} />
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">₹{r.value.toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <Coins size={11} className="text-gold" /> {r.coins.toLocaleString("en-IN")} coins
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 6 — Recent Activity Timeline
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
        index={3}
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
      index={3}
      className="xl:col-span-2"
      action={
        <LootButton variant="ghost" size="sm" onClick={() => navigate("history")} rightIcon={<ArrowRight size={14} />}>
          View history
        </LootButton>
      }
    >
      <div className="relative pl-4 max-h-96 overflow-y-auto pr-1 lootloom-scroll">
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
              <motion.li key={item.id} variants={cardReveal} className="relative">
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
   Section 7 — Notification Preview
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
      index={4}
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
   Section 8 — Support Center Preview
   ============================================================ */

function SupportCenter() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <WidgetCard
      title="Need Help?"
      description="We're here to help"
      icon={<LifeBuoy size={16} />}
      index={5}
      className="xl:col-span-2"
      action={
        <LootButton variant="electric" size="sm" onClick={() => navigate("support")} leftIcon={<Ticket size={14} />}>
          New Ticket
        </LootButton>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div variants={cardReveal} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard hover level={2} onClick={() => navigate("support")} className="p-4 cursor-pointer h-full flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <IconBadge name="Ticket" accent="electric" size="sm" />
              <ArrowUpRight size={14} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Create Ticket</p>
              <p className="text-[11px] text-muted-foreground">Reach out to our support team</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={cardReveal} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard hover level={2} onClick={() => navigate("support")} className="p-4 cursor-pointer h-full flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <IconBadge name="Clock" accent="cyan" size="sm" />
              <ArrowUpRight size={14} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">View Tickets</p>
              <p className="text-[11px] text-muted-foreground">Track your active conversations</p>
            </div>
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
  const { data, loading, refetch } = useDashboardData();
  const { setWallet } = useWalletStore();
  const { setItems: setActivities } = useActivityStore();

  // Sync dashboard API data into stores so all sub-components show real values
  useEffect(() => {
    if (data) {
      setWallet({
        availableCoins: data.wallet.coinBalance,
        lifetimeEarned: data.wallet.totalEarned,
        lifetimeRedeemed: data.wallet.totalSpent,
        todayEarnings: data.stats.todayEarnings,
        weeklyEarnings: data.stats.weeklyEarnings,
        monthlyEarnings: data.stats.monthlyEarnings,
      });
      // Map transactions → activity items for the timeline
      setActivities(
        data.recentTransactions.map((t) => ({
          id: t.id,
          type: t.type.toLowerCase().includes("redeem") ? "redeemed" : "earned",
          title: t.description || "Transaction",
          description: t.description || "",
          amount: t.amount,
          time: new Date(t.createdAt).toLocaleString(),
        }))
      );
    }
  }, [data, setWallet, setActivities]);

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

  // Placeholder-ready values from the dashboard API
  const adsWatchedToday = data?.stats.todayAdsWatched ?? 0;
  const weeklyChart = data?.chart ?? [];

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
              leftIcon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
              onClick={refetch}
            >
              Refresh
            </LootButton>
          </>
        }
      />

      {loading && !data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl glass-2 shimmer" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5"
        >
          <WelcomeHero />
          <QuickStatistics adsWatchedToday={adsWatchedToday} />
          <QuickActions />
          <WalletPreview adsWatchedToday={adsWatchedToday} chart={weeklyChart} />
          <RewardCenterPreview />
          <RecentActivityTimeline />
          <NotificationPreview />
          <SupportCenter />
        </motion.div>
      )}
    </PageContainer>
  );
}
