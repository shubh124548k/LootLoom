"use client";

/**
 * LootLoom — PagesView
 * Renders all secondary authenticated app views based on `useNavigationStore().current`.
 * Each view is wrapped in <PageContainer> + <PageHeader> with premium glass styling.
 */

import { useMemo, useState, type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import {
  GlassCard,
  LootButton,
  IconBadge,
  AnimatedCounter,
  ProgressRing,
  StatCard,
  StatusBadge,
  WidgetCard,
  PageContainer,
  PageHeader,
  SectionHeader,
  Grid,
  EmptyState,
  SkeletonRow,
} from "@/components/lootloom";
import {
  useNavigationStore,
  useNotificationStore,
  useActivityStore,
  useUserStore,
  useWalletStore,
} from "@/stores";
import { cardReveal, staggerContainer, hoverLift, floating } from "@/lib/animations";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AchievementItem,
  LeaderboardUser,
  MissionItem,
  ViewId,
} from "@/types";

/* ============================================================
   Shared helpers
   ============================================================ */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
        active
          ? "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand)_60%,var(--purple-brand))] text-white shadow-[0_8px_20px_-8px_oklch(0.62_0.22_255/0.55)]"
          : "glass-1 text-muted-foreground hover:text-foreground ring-1 ring-border"
      )}
    >
      {children}
    </button>
  );
}

/* ============================================================
   Placeholder data
   ============================================================ */

const ACHIEVEMENTS: AchievementItem[] = [
  { id: "a1", name: "First Steps", description: "Complete your first mission", icon: "Footprints", progress: 1, total: 1, rarity: "common", unlocked: true },
  { id: "a2", name: "Coin Collector", description: "Earn 1,000 coins total", icon: "Coins", progress: 1000, total: 1000, rarity: "common", unlocked: true },
  { id: "a3", name: "Streak Keeper", description: "Maintain a 7-day streak", icon: "Flame", progress: 7, total: 7, rarity: "rare", unlocked: true },
  { id: "a4", name: "Social Butterfly", description: "Invite 5 friends", icon: "Users", progress: 3, total: 5, rarity: "rare", unlocked: false },
  { id: "a5", name: "Mission Master", description: "Complete 50 missions", icon: "Target", progress: 38, total: 50, rarity: "epic", unlocked: false },
  { id: "a6", name: "Big Spender", description: "Redeem ₹1,000 worth", icon: "ShoppingBag", progress: 850, total: 1000, rarity: "epic", unlocked: false },
  { id: "a7", name: "Leaderboard Legend", description: "Reach top 10 globally", icon: "Crown", progress: 142, total: 10, rarity: "legendary", unlocked: false },
  { id: "a8", name: "Daily Devotee", description: "Claim daily bonus 30 days", icon: "CalendarCheck", progress: 12, total: 30, rarity: "rare", unlocked: false },
  { id: "a9", name: "Ad Hunter", description: "Watch 100 rewarded ads", icon: "PlayCircle", progress: 100, total: 100, rarity: "epic", unlocked: true },
  { id: "a10", name: "Vault Vault", description: "Hold 50,000 coins at once", icon: "Vault", progress: 12840, total: 50000, rarity: "legendary", unlocked: false },
];

const LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: "Aarav Mehta", xp: 84200, coins: 124000, level: 47, isCurrentUser: false },
  { rank: 2, name: "Priya Sharma", xp: 78600, coins: 118500, level: 45, isCurrentUser: false },
  { rank: 3, name: "Rohan Verma", xp: 72100, coins: 109800, level: 43, isCurrentUser: false },
  { rank: 4, name: "Ananya Iyer", xp: 68400, coins: 98200, level: 41, isCurrentUser: false },
  { rank: 5, name: "Karthik Nair", xp: 61900, coins: 91300, level: 40, isCurrentUser: false },
  { rank: 6, name: "Diya Kapoor", xp: 58200, coins: 84600, level: 38, isCurrentUser: false },
  { rank: 7, name: "Vikram Singh", xp: 53800, coins: 78900, level: 37, isCurrentUser: false },
  { rank: 8, name: "Meera Reddy", xp: 49100, coins: 72400, level: 35, isCurrentUser: false },
  { rank: 9, name: "Arjun Pillai", xp: 44600, coins: 67100, level: 34, isCurrentUser: false },
  { rank: 10, name: "Saanvi Gupta", xp: 40200, coins: 61800, level: 32, isCurrentUser: false },
  { rank: 11, name: "LootLoom Member", xp: 2840, coins: 12840, level: 7, isCurrentUser: true },
  { rank: 12, name: "Riya Joshi", xp: 2640, coins: 11900, level: 7, isCurrentUser: false },
  { rank: 13, name: "Aditya Rao", xp: 2480, coins: 11200, level: 6, isCurrentUser: false },
  { rank: 14, name: "Ishita Bose", xp: 2320, coins: 10400, level: 6, isCurrentUser: false },
  { rank: 15, name: "Kabir Khanna", xp: 2180, coins: 9800, level: 6, isCurrentUser: false },
];

const DAILY_BONUS_DAYS = [
  { day: "Mon", reward: 25, claimed: true, isToday: false },
  { day: "Tue", reward: 35, claimed: true, isToday: false },
  { day: "Wed", reward: 45, claimed: true, isToday: false },
  { day: "Thu", reward: 50, claimed: true, isToday: false },
  { day: "Fri", reward: 60, claimed: true, isToday: false },
  { day: "Sat", reward: 80, claimed: false, isToday: true },
  { day: "Sun", reward: 120, claimed: false, isToday: false },
];

const MISSIONS: MissionItem[] = [
  { id: "m1", name: "Daily Explorer", description: "Watch 5 rewarded ads", reward: 120, progress: 3, total: 5, difficulty: "easy", estimatedTime: "10 min", category: "daily", status: "in-progress" },
  { id: "m2", name: "Coin Sprint", description: "Earn 200 coins from ads", reward: 80, progress: 145, total: 200, difficulty: "easy", estimatedTime: "15 min", category: "daily", status: "in-progress" },
  { id: "m3", name: "Survey Pro", description: "Complete 3 surveys", reward: 250, progress: 1, total: 3, difficulty: "medium", estimatedTime: "20 min", category: "daily", status: "in-progress" },
  { id: "m4", name: "Social Sharer", description: "Share LootLoom on social media", reward: 100, progress: 0, total: 1, difficulty: "easy", estimatedTime: "5 min", category: "daily", status: "available" },
  { id: "m5", name: "Weekly Champion", description: "Reach 1,000 coins this week", reward: 500, progress: 980, total: 1000, difficulty: "hard", estimatedTime: "Ongoing", category: "weekly", status: "in-progress" },
  { id: "m6", name: "Referral Hero", description: "Invite 3 friends this week", reward: 600, progress: 1, total: 3, difficulty: "hard", estimatedTime: "Ongoing", category: "weekly", status: "in-progress" },
  { id: "m7", name: "Streak Master", description: "Maintain a 14-day streak", reward: 1000, progress: 12, total: 14, difficulty: "expert", estimatedTime: "Ongoing", category: "weekly", status: "in-progress" },
  { id: "m8", name: "Monthly Mogul", description: "Earn 5,000 coins this month", reward: 2500, progress: 4280, total: 5000, difficulty: "expert", estimatedTime: "Ongoing", category: "monthly", status: "in-progress" },
  { id: "m9", name: "Legend in Making", description: "Reach Level 15", reward: 3000, progress: 7, total: 15, difficulty: "expert", estimatedTime: "Ongoing", category: "monthly", status: "in-progress" },
];

const REFERRAL_TIERS = [
  { count: 1, reward: 200, label: "First Friend", icon: "UserPlus" },
  { count: 5, reward: 1200, label: "Squad Builder", icon: "Users" },
  { count: 10, reward: 3000, label: "Network Grower", icon: "Network" },
  { count: 25, reward: 10000, label: "LootLoom Ambassador", icon: "Crown" },
];

const FAQS = [
  { q: "How do I earn coins on LootLoom?", a: "You can earn coins by watching rewarded ads, completing missions, claiming daily bonuses, participating in surveys, and referring friends. Each action rewards a specific amount of coins that you can later redeem for real rewards." },
  { q: "What is the minimum redeem amount?", a: "The minimum redeem amount is ₹100 (1,000 coins). Once you reach this threshold, you can submit a redeem request through the Rewards section and choose from UPI, gift cards, or other supported methods." },
  { q: "How long does redeem processing take?", a: "Most UPI redemptions are processed within 24-48 hours. Gift cards are typically delivered within 1 hour via email. Larger redemptions above ₹1,000 may require additional verification and can take up to 5 business days." },
  { q: "Why is my daily streak reset?", a: "Your daily streak resets if you miss claiming your daily bonus for more than 24 hours. To maintain your streak, make sure to log in and claim your bonus every day. Streak milestones unlock bonus rewards." },
  { q: "Can I transfer coins to another account?", a: "No, coins are non-transferable between accounts. This policy protects against fraud and ensures fair play. Each account's earnings are tied to that account's verified identity." },
  { q: "How do referral rewards work?", a: "When someone signs up using your referral code, you earn 200 coins once they complete their first mission. You also earn 10% of their lifetime earnings, up to a cap. Rewards are credited within 24 hours of qualification." },
  { q: "Is my account information secure?", a: "Yes. We use bank-grade encryption for all data, support two-factor authentication, and never share your information with third parties. You can review our privacy policy for full details on data handling." },
  { q: "What happens if I violate the terms?", a: "Accounts found violating our terms (auto-clickers, fake referrals, multiple accounts) may be suspended or permanently banned, with all earned coins forfeited. Always play fair to keep your account in good standing." },
];

const NOTIF_TYPE_META: Record<
  string,
  { accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy"; icon: string }
> = {
  reward: { accent: "gold", icon: "Gift" },
  wallet: { accent: "electric", icon: "Wallet" },
  system: { accent: "cyan", icon: "Settings" },
  security: { accent: "rose", icon: "ShieldCheck" },
  social: { accent: "purple", icon: "Users" },
  announcement: { accent: "emerald", icon: "Megaphone" },
};

/* ============================================================
   Notifications
   ============================================================ */

function NotificationsPage() {
  const { items, markAllRead, markRead } = useNotificationStore();
  const [filter, setFilter] = useState<"all" | "unread" | "reward" | "system" | "security">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => !n.read);
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="Stay updated on rewards, security, and platform activity."
        actions={
          <LootButton
            variant="glass"
            size="sm"
            leftIcon={<Icons.CheckCheck size={15} />}
            onClick={markAllRead}
          >
            Mark all read
          </LootButton>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1"
      >
        {(["all", "unread", "reward", "system", "security"] as const).map((f) => (
          <motion.div key={f} variants={cardReveal}>
            <FilterTab active={filter === f} onClick={() => setFilter(f)}>
              {f === "all" && "All"}
              {f === "unread" && "Unread"}
              {f === "reward" && "Rewards"}
              {f === "system" && "System"}
              {f === "security" && "Security"}
            </FilterTab>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <GlassCard level={2} className="p-0">
          <EmptyState
            icon="BellOff"
            title="No notifications"
            description="When you have notifications, they'll appear here."
          />
        </GlassCard>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filtered.map((n) => {
            const meta = NOTIF_TYPE_META[n.type] ?? NOTIF_TYPE_META.system;
            return (
              <motion.div key={n.id} variants={cardReveal} {...hoverLift}>
                <GlassCard
                  level={2}
                  hover
                  sheen
                  onClick={() => !n.read && markRead(n.id)}
                  className={cn(
                    "p-4 flex items-start gap-4 cursor-pointer ring-1",
                    n.read ? "ring-border" : "ring-electric/30"
                  )}
                >
                  <IconBadge name={meta.icon} accent={meta.accent} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">{n.title}</h3>
                      {!n.read && (
                        <span className="size-2 rounded-full bg-electric shrink-0 ring-4 ring-electric/15" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-1.5">{n.body}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{n.time}</span>
                      <StatusBadge
                        variant={
                          n.type === "reward"
                            ? "gold"
                            : n.type === "security"
                            ? "error"
                            : n.type === "social"
                            ? "purple"
                            : n.type === "wallet"
                            ? "electric"
                            : "info"
                        }
                      >
                        {n.type}
                      </StatusBadge>
                    </div>
                  </div>
                  {!n.read && (
                    <Icons.ChevronRight className="text-muted-foreground shrink-0 mt-1" size={16} />
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </PageContainer>
  );
}

/* ============================================================
   Achievements
   ============================================================ */

const RARITY_META: Record<
  AchievementItem["rarity"],
  { accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose"; ring: "electric" | "cyan" | "purple" | "gold" | "emerald"; label: string; glow: string }
> = {
  common: { accent: "cyan", ring: "cyan", label: "Common", glow: "ring-cyan-brand/25" },
  rare: { accent: "electric", ring: "electric", label: "Rare", glow: "ring-electric/30" },
  epic: { accent: "purple", ring: "purple", label: "Epic", glow: "ring-purple-brand/30" },
  legendary: { accent: "gold", ring: "gold", label: "Legendary", glow: "ring-gold/30" },
};

function AchievementCard({ item, index }: { item: AchievementItem; index: number }) {
  const meta = RARITY_META[item.rarity];
  const pct = Math.min(100, (item.progress / item.total) * 100);
  const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon] ?? Icons.Award;

  return (
    <motion.div variants={cardReveal} custom={index}>
      <GlassCard
        level={2}
        hover
        sheen
        className={cn(
          "p-5 h-full flex flex-col items-center text-center ring-1",
          item.unlocked ? meta.glow : "ring-border opacity-80"
        )}
      >
        <div className="relative mb-4">
          <ProgressRing
            value={pct}
            size={88}
            strokeWidth={6}
            gradient={meta.ring}
            showLabel={false}
          />
          <div
            className={cn(
              "absolute inset-0 m-auto size-14 rounded-2xl flex items-center justify-center ring-1",
              item.unlocked
                ? "glass-3 " + meta.glow
                : "glass-1 ring-border"
            )}
          >
            {item.unlocked ? (
              <LucideIcon className={cn("text-foreground")} size={22} />
            ) : (
              <Icons.Lock className="text-muted-foreground" size={20} />
            )}
          </div>
        </div>
        <h3 className="font-semibold text-sm text-foreground mb-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{item.description}</p>
        <div className="flex items-center gap-2 mt-auto">
          <StatusBadge
            variant={
              item.rarity === "common"
                ? "cyan"
                : item.rarity === "rare"
                ? "electric"
                : item.rarity === "epic"
                ? "purple"
                : "gold"
            }
            dot
          >
            {meta.label}
          </StatusBadge>
          {item.unlocked ? (
            <StatusBadge variant="success" dot pulse>
              Unlocked
            </StatusBadge>
          ) : (
            <span className="text-xs text-muted-foreground tabular-nums">
              {item.progress.toLocaleString("en-IN")}/{item.total.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function AchievementsPage() {
  const user = useUserStore();
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const completion = Math.round((unlocked / ACHIEVEMENTS.length) * 100);
  const xpPct = Math.round((user.xp / user.xpToNext) * 100);

  const milestones = [
    { level: 5, label: "Apprentice", reached: true },
    { level: 7, label: "Explorer", reached: true },
    { level: 10, label: "Achiever", reached: false },
    { level: 15, label: "Veteran", reached: false },
    { level: 25, label: "Legend", reached: false },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Achievements"
        description="Track your milestones, unlock badges, and rise through the ranks."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
      >
        <motion.div variants={cardReveal}>
          <GlassCard level={3} sheen className="p-6 flex items-center gap-5">
            <ProgressRing value={xpPct} size={92} strokeWidth={8} gradient="electric" label={`L${user.level}`} />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Current Level</p>
              <p className="text-2xl font-bold text-foreground">Level {user.level}</p>
              <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                {user.xp.toLocaleString("en-IN")} / {user.xpToNext.toLocaleString("en-IN")} XP
              </p>
            </div>
          </GlassCard>
        </motion.div>
        <motion.div variants={cardReveal} custom={1}>
          <GlassCard level={3} sheen className="p-6 flex items-center gap-5">
            <ProgressRing value={completion} size={92} strokeWidth={8} gradient="gold" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Completion</p>
              <p className="text-2xl font-bold text-foreground">{unlocked}/{ACHIEVEMENTS.length}</p>
              <p className="text-xs text-muted-foreground mt-1">{completion}% achievements unlocked</p>
            </div>
          </GlassCard>
        </motion.div>
        <motion.div variants={cardReveal} custom={2}>
          <GlassCard level={3} sheen className="p-6 flex items-center gap-5">
            <ProgressRing value={72} size={92} strokeWidth={8} gradient="purple" label="72%" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Mastery</p>
              <p className="text-2xl font-bold text-foreground">Expert</p>
              <p className="text-xs text-muted-foreground mt-1">Overall platform mastery</p>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      <SectionHeader
        title="Achievement Badges"
        description="Collect rare, epic, and legendary badges"
        icon={<Icons.Award size={18} />}
        className="mb-4"
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8"
      >
        {ACHIEVEMENTS.map((a, i) => (
          <AchievementCard key={a.id} item={a} index={i} />
        ))}
      </motion.div>

      <SectionHeader
        title="Milestones"
        description="Your progression timeline"
        icon={<Icons.Flag size={18} />}
        className="mb-4"
      />
      <GlassCard level={2} className="p-6">
        <div className="relative pl-8">
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-electric via-purple-brand to-gold/40" />
          {milestones.map((m, i) => (
            <motion.div
              key={m.level}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative pb-6 last:pb-0"
            >
              <div
                className={cn(
                  "absolute -left-[1.4rem] top-1 size-3.5 rounded-full ring-4 ring-background",
                  m.reached ? "bg-gradient-to-br from-electric to-purple-brand" : "bg-muted-foreground/30"
                )}
              />
              <div className="flex items-center gap-3">
                <h4 className={cn("font-semibold text-sm", m.reached ? "text-foreground" : "text-muted-foreground")}>
                  Level {m.level} — {m.label}
                </h4>
                {m.reached && (
                  <StatusBadge variant="success" dot>
                    Reached
                  </StatusBadge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {m.reached ? "You've reached this milestone." : `Reach level ${m.level} to unlock.`}
              </p>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </PageContainer>
  );
}

/* ============================================================
   Leaderboard
   ============================================================ */

function LeaderboardPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "all">("weekly");
  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);
  const podiumOrder = [top3[1], top3[0], top3[2]]; // silver, gold, bronze

  const podiumMeta = [
    { accent: "cyan" as const, ring: "cyan" as const, icon: "Medal", label: "Silver", glow: "ring-cyan-brand/30" },
    { accent: "gold" as const, ring: "gold" as const, icon: "Crown", label: "Gold", glow: "ring-gold/40" },
    { accent: "purple" as const, ring: "purple" as const, icon: "Award", label: "Bronze", glow: "ring-purple-brand/30" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Leaderboard"
        description="Compete with players worldwide and climb the ranks."
        actions={
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex gap-1.5"
          >
            {(["daily", "weekly", "monthly", "all"] as const).map((p) => (
              <motion.div key={p} variants={cardReveal}>
                <FilterTab active={period === p} onClick={() => setPeriod(p)}>
                  {p === "daily" && "Daily"}
                  {p === "weekly" && "Weekly"}
                  {p === "monthly" && "Monthly"}
                  {p === "all" && "All-time"}
                </FilterTab>
              </motion.div>
            ))}
          </motion.div>
        }
      />

      {/* Podium */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      >
        {podiumOrder.map((u, i) => {
          const meta = podiumMeta[i];
          const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[meta.icon];
          const isFirst = i === 1;
          return (
            <motion.div
              key={u.rank}
              variants={cardReveal}
              custom={i}
              className={isFirst ? "sm:-mt-4" : ""}
            >
              <motion.div
                variants={isFirst ? floating : undefined}
                className="h-full"
              >
                <GlassCard
                  level={3}
                  sheen
                  reflect
                  className={cn(
                    "p-6 text-center ring-1 h-full",
                    meta.glow,
                    isFirst ? "shadow-[var(--shadow-lg)]" : ""
                  )}
                >
                  <div className="flex justify-center mb-3">
                    <div className={cn("size-12 rounded-2xl flex items-center justify-center ring-1", meta.glow, "glass-3")}>
                      <LucideIcon className={cn(isFirst ? "text-gold" : i === 0 ? "text-cyan-brand" : "text-purple-brand")} size={24} />
                    </div>
                  </div>
                  <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] text-white font-bold text-lg mb-3">
                    {getInitials(u.name)}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm truncate">{u.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">Level {u.level}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="glass-1 rounded-lg py-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">XP</p>
                      <p className="text-sm font-bold text-foreground tabular-nums">{u.xp.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="glass-1 rounded-lg py-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Coins</p>
                      <p className="text-sm font-bold text-foreground tabular-nums">{u.coins.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <StatusBadge variant={isFirst ? "gold" : i === 0 ? "cyan" : "purple"} className="mt-3">
                    {meta.label} · #{u.rank}
                  </StatusBadge>
                </GlassCard>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Full ranking table */}
      <GlassCard level={2} className="p-2 sm:p-4">
        <SectionHeader
          title="Full Rankings"
          description={`${LEADERBOARD.length} players ranked`}
          icon={<Icons.ListOrdered size={18} />}
          className="px-2 mb-2"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Level</TableHead>
              <TableHead className="text-right hidden sm:table-cell">XP</TableHead>
              <TableHead className="text-right">Coins</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rest.map((u, i) => (
              <motion.tr
                key={u.rank}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "border-b transition-colors",
                  u.isCurrentUser
                    ? "bg-electric/5 hover:bg-electric/10 ring-1 ring-inset ring-electric/20"
                    : "hover:bg-muted/40"
                )}
              >
                <TableCell className="font-bold tabular-nums text-foreground">#{u.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {getInitials(u.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{u.name}</p>
                      {u.isCurrentUser && (
                        <StatusBadge variant="electric" className="mt-0.5">
                          You
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{u.level}</TableCell>
                <TableCell className="text-right tabular-nums hidden sm:table-cell">{u.xp.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right font-semibold text-gold tabular-nums">{u.coins.toLocaleString("en-IN")}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </PageContainer>
  );
}

/* ============================================================
   Daily Bonus
   ============================================================ */

function DailyBonusPage() {
  const todayIndex = DAILY_BONUS_DAYS.findIndex((d) => d.isToday);
  const [claimed, setClaimed] = useState<boolean[]>(DAILY_BONUS_DAYS.map((d) => d.claimed));
  const user = useUserStore();

  const handleClaim = (idx: number) => {
    setClaimed((prev) => prev.map((c, i) => (i === idx ? true : c)));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Daily Bonus"
        description="Log in every day to claim escalating rewards and build your streak."
      />

      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={cardReveal}>
          <GlassCard level={3} sheen className="p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="size-16 rounded-2xl bg-[linear-gradient(135deg,var(--gold),oklch(0.75_0.18_60))] flex items-center justify-center shadow-[0_8px_24px_-6px_oklch(0.8_0.16_85/0.5)]"
              >
                <Icons.Flame className="text-white" size={32} />
              </motion.div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Current Streak</p>
                <p className="text-3xl font-bold text-foreground">
                  {user.dailyStreak} <span className="text-base text-muted-foreground">days</span>
                </p>
                <p className="text-xs text-emerald-brand font-medium mt-0.5">Keep it up!</p>
              </div>
            </div>
            <div className="flex-1 sm:text-right">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Next Milestone</p>
              <p className="text-sm font-semibold text-foreground">Reach 14 days for a bonus 500 coins</p>
              <div className="w-full sm:w-48 h-2 rounded-full bg-muted overflow-hidden mt-2 sm:ml-auto">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(user.dailyStreak / 14) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-[linear-gradient(90deg,var(--gold),var(--electric))]"
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      <SectionHeader
        title="7-Day Reward Cycle"
        description="Claim each day to unlock the next reward"
        icon={<Icons.CalendarDays size={18} />}
        className="mb-4"
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8"
      >
        {DAILY_BONUS_DAYS.map((d, i) => {
          const isClaimed = claimed[i];
          const isToday = d.isToday;
          const isFuture = i > todayIndex;
          return (
            <motion.div key={d.day} variants={cardReveal} custom={i}>
              <GlassCard
                level={isToday ? 3 : 2}
                sheen={isToday}
                className={cn(
                  "p-4 text-center ring-1 h-full flex flex-col",
                  isToday ? "ring-electric/40 shadow-[0_8px_24px_-8px_oklch(0.62_0.22_255/0.45)]" : "ring-border",
                  isFuture && "opacity-60"
                )}
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{d.day}</p>
                <div
                  className={cn(
                    "mx-auto size-10 rounded-xl flex items-center justify-center mb-3",
                    isClaimed
                      ? "bg-emerald-brand/10 ring-1 ring-emerald-brand/20"
                      : isToday
                      ? "bg-electric/10 ring-1 ring-electric/20"
                      : "bg-muted/50"
                  )}
                >
                  {isClaimed ? (
                    <Icons.Check className="text-emerald-brand" size={20} />
                  ) : isFuture ? (
                    <Icons.Lock className="text-muted-foreground" size={16} />
                  ) : (
                    <Icons.Coins className="text-gold" size={20} />
                  )}
                </div>
                <p className="text-lg font-bold text-foreground tabular-nums">{d.reward}</p>
                <p className="text-[10px] text-muted-foreground mb-3">coins</p>
                {isToday && !isClaimed && (
                  <LootButton size="sm" variant="electric" fullWidth onClick={() => handleClaim(i)} className="mt-auto">
                    Claim
                  </LootButton>
                )}
                {isToday && isClaimed && (
                  <StatusBadge variant="success" className="mt-auto">
                    Claimed
                  </StatusBadge>
                )}
                {isClaimed && !isToday && (
                  <StatusBadge variant="default" className="mt-auto">
                    Done
                  </StatusBadge>
                )}
                {isFuture && (
                  <span className="text-[10px] text-muted-foreground mt-auto">Locked</span>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetCard
          title="Tomorrow's Reward"
          description="Don't break your streak"
          icon={<Icons.Sparkles size={18} />}
        >
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-[linear-gradient(135deg,var(--purple-brand),var(--electric))] flex items-center justify-center">
              <Icons.Coins className="text-white" size={26} />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">120 <span className="text-sm text-muted-foreground">coins</span></p>
              <p className="text-xs text-muted-foreground">Sunday bonus reward · +50% boost</p>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard
          title="Streak Milestones"
          description="Bonus rewards along the way"
          icon={<Icons.Target size={18} />}
        >
          <div className="space-y-2.5">
            {[
              { days: 7, reward: 200, reached: true },
              { days: 14, reward: 500, reached: false },
              { days: 30, reward: 1500, reached: false },
            ].map((m) => (
              <div key={m.days} className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-9 rounded-xl flex items-center justify-center ring-1 shrink-0",
                    m.reached
                      ? "bg-emerald-brand/10 ring-emerald-brand/20 text-emerald-brand"
                      : "glass-1 ring-border text-muted-foreground"
                  )}
                >
                  {m.reached ? <Icons.Check size={16} /> : <Icons.Flame size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{m.days}-day streak</p>
                  <p className="text-xs text-muted-foreground">{m.reached ? "Achieved" : "In progress"}</p>
                </div>
                <span className="text-sm font-bold text-gold tabular-nums">+{m.reward}</span>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>

      <WidgetCard
        title="Monthly Preview"
        description="This month's claimed bonuses"
        icon={<Icons.CalendarRange size={18} />}
        className="mt-4"
      >
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 28 }).map((_, i) => {
            const claimedDay = i < 12;
            const today = i === 12;
            return (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold",
                  claimedDay
                    ? "bg-emerald-brand/15 text-emerald-brand ring-1 ring-emerald-brand/20"
                    : today
                    ? "bg-electric/15 text-electric ring-1 ring-electric/30"
                    : "bg-muted/40 text-muted-foreground/50"
                )}
              >
                {claimedDay ? <Icons.Check size={12} /> : i + 1}
              </div>
            );
          })}
        </div>
      </WidgetCard>
    </PageContainer>
  );
}

/* ============================================================
   Missions
   ============================================================ */

const DIFFICULTY_META: Record<
  MissionItem["difficulty"],
  { variant: "success" | "info" | "warning" | "error"; color: string }
> = {
  easy: { variant: "success", color: "text-emerald-brand" },
  medium: { variant: "info", color: "text-electric" },
  hard: { variant: "warning", color: "text-gold" },
  expert: { variant: "error", color: "text-rose-brand" },
};

function MissionCard({ mission, index }: { mission: MissionItem; index: number }) {
  const meta = DIFFICULTY_META[mission.difficulty];
  const pct = Math.min(100, (mission.progress / mission.total) * 100);
  const isCompleted = mission.status === "completed";

  return (
    <motion.div variants={cardReveal} custom={index}>
      <GlassCard level={2} hover sheen className="p-5 h-full flex flex-col ring-1 ring-border">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <IconBadge name="Target" accent="electric" size="sm" />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">{mission.name}</h3>
              <p className="text-xs text-muted-foreground">{mission.estimatedTime}</p>
            </div>
          </div>
          <StatusBadge variant={meta.variant}>{mission.difficulty}</StatusBadge>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{mission.description}</p>

        <div className="flex items-center gap-4 mb-4">
          <ProgressRing
            value={pct}
            size={56}
            strokeWidth={5}
            gradient={isCompleted ? "emerald" : "electric"}
            showLabel={false}
          />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Progress</p>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {mission.progress.toLocaleString("en-IN")} / {mission.total.toLocaleString("en-IN")}
            </p>
            <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className={cn(
                  "h-full",
                  isCompleted
                    ? "bg-emerald-brand"
                    : "bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand))]"
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <Icons.Coins className="text-gold" size={16} />
            <span className="font-bold text-foreground tabular-nums">{mission.reward}</span>
            <span className="text-xs text-muted-foreground">coins</span>
          </div>
          {isCompleted ? (
            <StatusBadge variant="success" dot pulse>
              Completed
            </StatusBadge>
          ) : mission.status === "in-progress" ? (
            <LootButton size="sm" variant="electric">
              Continue
            </LootButton>
          ) : mission.status === "locked" ? (
            <LootButton size="sm" variant="ghost" disabled leftIcon={<Icons.Lock size={14} />}>
              Locked
            </LootButton>
          ) : (
            <LootButton size="sm" variant="outline">
              Start
            </LootButton>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function MissionsPage() {
  const [tab, setTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const filtered = MISSIONS.filter((m) => m.category === tab);

  return (
    <PageContainer>
      <PageHeader
        title="Missions"
        description="Complete missions to earn bonus coins and level up faster."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-6">
        <TabsList className="glass-1 h-auto p-1">
          <TabsTrigger value="daily" className="px-4 data-[state=active]:bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] data-[state=active]:text-white">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="px-4 data-[state=active]:bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] data-[state=active]:text-white">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="px-4 data-[state=active]:bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] data-[state=active]:text-white">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((m, i) => (
            <MissionCard key={m.id} mission={m} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </PageContainer>
  );
}

/* ============================================================
   Referral
   ============================================================ */

function ReferralPage() {
  const user = useUserStore();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigationStore((s) => s.navigate);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(user.referralCode);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Referral"
        description="Invite friends, earn rewards. Build your network and grow together."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <StatCard index={0} label="Friends Invited" value={12} icon="Users" accent="electric" trend={{ value: 8, positive: true }} />
        <StatCard index={1} label="Pending Rewards" value={320} suffix=" coins" icon="Clock" accent="gold" />
        <StatCard index={2} label="Total Earnings" value={2400} suffix=" coins" icon="Coins" accent="emerald" trend={{ value: 22, positive: true }} />
        <StatCard index={3} label="This Month" value={800} suffix=" coins" icon="TrendingUp" accent="purple" trend={{ value: 14, positive: true }} />
      </motion.div>

      <WidgetCard
        title="Your Referral Code"
        description="Share this code with friends"
        icon={<Icons.Ticket size={18} />}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 relative">
            <div className="glass-3 rounded-2xl p-5 ring-1 ring-electric/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--electric)/5,var(--purple-brand)/5)]" />
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1 relative">Referral Code</p>
              <p className="text-3xl font-bold text-foreground tracking-wider font-mono relative">{user.referralCode}</p>
              <p className="text-xs text-muted-foreground mt-1 relative">
                Friends get 100 coins on signup · You get 200 coins when they complete their first mission
              </p>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2">
            <LootButton
              variant="electric"
              size="lg"
              fullWidth
              leftIcon={copied ? <Icons.CheckCheck size={18} /> : <Icons.Copy size={18} />}
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy Code"}
            </LootButton>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/60">
          <span className="text-xs text-muted-foreground font-semibold mr-1">Share via:</span>
          {[
            { icon: "Share2", label: "Share" },
            { icon: "MessageCircle", label: "WhatsApp" },
            { icon: "Send", label: "Telegram" },
            { icon: "Mail", label: "Email" },
            { icon: "Twitter", label: "Twitter" },
          ].map((s) => {
            const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[s.icon];
            return (
              <LootButton key={s.label} variant="glass" size="sm" leftIcon={<LucideIcon size={14} />}>
                {s.label}
              </LootButton>
            );
          })}
        </div>
      </WidgetCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <WidgetCard
          title="How It Works"
          description="3 simple steps"
          icon={<Icons.HelpCircle size={18} />}
        >
          <div className="space-y-4">
            {[
              { step: 1, title: "Share your code", desc: "Send your unique referral code to friends", icon: "Share2" },
              { step: 2, title: "They sign up", desc: "Friend registers using your code", icon: "UserPlus" },
              { step: 3, title: "You both earn", desc: "Get 200 coins when they complete their first mission", icon: "Coins" },
            ].map((s, i) => {
              const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[s.icon];
              return (
                <motion.div
                  key={s.step}
                  variants={cardReveal}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <div className="size-9 rounded-xl bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <LucideIcon className="text-electric" size={15} />
                      <h4 className="font-semibold text-sm text-foreground">{s.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </WidgetCard>

        <WidgetCard
          title="Reward Tiers"
          description="Earn more as you invite more"
          icon={<Icons.Trophy size={18} />}
        >
          <div className="space-y-2.5">
            {REFERRAL_TIERS.map((t, i) => {
              const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[t.icon];
              const reached = 12 >= t.count;
              return (
                <motion.div
                  key={t.count}
                  variants={cardReveal}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl ring-1",
                    reached ? "bg-emerald-brand/5 ring-emerald-brand/20" : "glass-1 ring-border"
                  )}
                >
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 ring-1",
                      reached
                        ? "bg-emerald-brand/10 ring-emerald-brand/20 text-emerald-brand"
                        : "glass-1 ring-border text-muted-foreground"
                    )}
                  >
                    <LucideIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground">Invite {t.count} friends</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold tabular-nums text-sm">+{t.reward.toLocaleString("en-IN")}</p>
                    {reached && (
                      <StatusBadge variant="success" className="mt-0.5">
                        <Icons.Check size={10} className="mr-0.5" /> Done
                      </StatusBadge>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </WidgetCard>
      </div>

      <WidgetCard
        title="Referral History"
        description="Your invited friends and reward status"
        icon={<Icons.History size={18} />}
        action={
          <LootButton variant="ghost" size="sm" onClick={() => navigate("transactions")}>
            View All
          </LootButton>
        }
      >
        <SkeletonRow count={5} />
      </WidgetCard>
    </PageContainer>
  );
}

/* ============================================================
   Transactions
   ============================================================ */

function TransactionsPage() {
  const wallet = useWalletStore();

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        description="View and track all your coin transactions and redemption history."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      >
        <StatCard index={0} label="Total In" value={wallet.lifetimeEarned} suffix=" coins" icon="ArrowDownLeft" accent="emerald" trend={{ value: 12, positive: true }} />
        <StatCard index={1} label="Total Out" value={wallet.lifetimeRedeemed} suffix=" coins" icon="ArrowUpRight" accent="rose" trend={{ value: 4, positive: false }} />
        <StatCard index={2} label="Pending" value={wallet.pendingCoins} suffix=" coins" icon="Clock" accent="gold" />
      </motion.div>

      <GlassCard level={2} className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="Search transactions…" className="pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <LootButton variant="glass" size="md" leftIcon={<Icons.Filter size={15} />}>
              Type
            </LootButton>
            <LootButton variant="glass" size="md" leftIcon={<Icons.CheckCircle2 size={15} />}>
              Status
            </LootButton>
            <LootButton variant="glass" size="md" leftIcon={<Icons.Calendar size={15} />}>
              Date Range
            </LootButton>
            <LootButton variant="outline" size="md" leftIcon={<Icons.Download size={15} />}>
              Export
            </LootButton>
          </div>
        </div>
      </GlassCard>

      <GlassCard level={2} className="p-2 sm:p-4">
        <SectionHeader
          title="Transaction History"
          description="Loading transactions…"
          icon={<Icons.Receipt size={18} />}
          className="px-2 mb-3"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="p-0">
                <div className="py-2">
                  <SkeletonRow count={8} />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </GlassCard>
    </PageContainer>
  );
}

/* ============================================================
   History (Activity Timeline)
   ============================================================ */

const ACTIVITY_TYPE_META: Record<
  string,
  { accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy"; icon: string }
> = {
  earned: { accent: "emerald", icon: "PlayCircle" },
  redeemed: { accent: "rose", icon: "ShoppingBag" },
  mission: { accent: "electric", icon: "Target" },
  referral: { accent: "purple", icon: "Users" },
  bonus: { accent: "gold", icon: "CalendarCheck" },
  system: { accent: "cyan", icon: "Settings" },
};

function HistoryPage() {
  const { items } = useActivityStore();
  const [filter, setFilter] = useState<"all" | "earned" | "redeemed" | "mission" | "referral">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((a) => a.type === filter);
  }, [items, filter]);

  return (
    <PageContainer>
      <PageHeader
        title="Activity History"
        description="A complete timeline of everything you've done on LootLoom."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1"
      >
        {(["all", "earned", "redeemed", "mission", "referral"] as const).map((f) => (
          <motion.div key={f} variants={cardReveal}>
            <FilterTab active={filter === f} onClick={() => setFilter(f)}>
              {f === "all" && "All"}
              {f === "earned" && "Earned"}
              {f === "redeemed" && "Redeemed"}
              {f === "mission" && "Missions"}
              {f === "referral" && "Referrals"}
            </FilterTab>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <GlassCard level={2} className="p-0">
          <EmptyState
            icon="History"
            title="No activity yet"
            description="Once you start earning coins, your activity will appear here."
          />
        </GlassCard>
      ) : (
        <GlassCard level={2} className="p-6">
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-electric via-purple-brand to-cyan-brand/30" />
            {filtered.map((a, i) => {
              const meta = ACTIVITY_TYPE_META[a.type] ?? ACTIVITY_TYPE_META.system;
              const isPositive = (a.amount ?? 0) > 0;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="relative pb-6 last:pb-0"
                >
                  <div className="absolute -left-[1.65rem] top-1 size-4 rounded-full bg-background ring-2 ring-electric/40 flex items-center justify-center">
                    <div className="size-1.5 rounded-full bg-gradient-to-br from-electric to-purple-brand" />
                  </div>
                  <div className="flex items-start gap-3">
                    <IconBadge name={meta.icon} accent={meta.accent} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-sm text-foreground">{a.title}</h4>
                        {a.amount !== undefined && (
                          <span
                            className={cn(
                              "font-bold text-sm tabular-nums",
                              isPositive ? "text-emerald-brand" : "text-rose-brand"
                            )}
                          >
                            {isPositive ? "+" : ""}{a.amount.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </PageContainer>
  );
}

/* ============================================================
   Support
   ============================================================ */

function SupportPage() {
  const quickActions = [
    { icon: "TicketPlus", label: "Create Ticket", desc: "Submit a new support request", accent: "electric" as const, action: "Create" },
    { icon: "Search", label: "Track Ticket", desc: "Check status of your tickets", accent: "cyan" as const, action: "Track" },
    { icon: "BookOpen", label: "Help Center", desc: "Browse guides and tutorials", accent: "purple" as const, action: "Open" },
    { icon: "Mail", label: "Contact Us", desc: "Email our support team", accent: "gold" as const, action: "Email" },
    { icon: "MessageCircleQuestion", label: "FAQ", desc: "Frequently asked questions", accent: "emerald" as const, action: "View" },
    { icon: "Headset", label: "Live Chat", desc: "Coming soon", accent: "rose" as const, action: "Locked", locked: true },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Support Center"
        description="We're here to help. Find answers, submit tickets, or reach out directly."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {quickActions.map((q, i) => {
          const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[q.icon];
          return (
            <motion.div key={q.label} variants={cardReveal} custom={i} {...hoverLift}>
              <GlassCard level={2} hover sheen className={cn("p-5 h-full flex flex-col ring-1", q.locked ? "ring-border opacity-70" : "ring-border")}>
                <div className="flex items-start justify-between mb-3">
                  <IconBadge name={q.icon} accent={q.accent} />
                  {q.locked && (
                    <StatusBadge variant="default">
                      <Icons.Lock size={10} className="mr-1" /> Soon
                    </StatusBadge>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{q.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{q.desc}</p>
                <LootButton
                  size="sm"
                  variant={q.locked ? "ghost" : "outline"}
                  fullWidth
                  disabled={q.locked}
                  rightIcon={q.locked ? <Icons.Lock size={13} /> : <Icons.ArrowRight size={14} />}
                  className="mt-auto"
                >
                  {q.action}
                </LootButton>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <WidgetCard
          title="FAQ"
          description="Quick answers to common questions"
          icon={<Icons.HelpCircle size={18} />}
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-sm font-medium text-foreground text-left hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </WidgetCard>

        <WidgetCard
          title="Contact Form"
          description="Send us a message"
          icon={<Icons.Mail size={18} />}
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Name</label>
              <Input placeholder="Your name" disabled />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Email</label>
              <Input type="email" placeholder="you@example.com" disabled />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Subject</label>
              <Input placeholder="Brief subject" disabled />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Message</label>
              <Textarea placeholder="Describe your issue…" rows={4} disabled />
            </div>
            <LootButton variant="electric" fullWidth disabled leftIcon={<Icons.Send size={15} />}>
              Submit (Coming Soon)
            </LootButton>
          </div>
        </WidgetCard>
      </div>

      <WidgetCard
        title="Recent Tickets"
        description="Your submitted support requests"
        icon={<Icons.Ticket size={18} />}
      >
        <SkeletonRow count={4} />
      </WidgetCard>
    </PageContainer>
  );
}

/* ============================================================
   Settings
   ============================================================ */

function SettingsRow({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border/60 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 rounded-xl glass-1 ring-1 ring-border flex items-center justify-center text-electric shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{desc}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const user = useUserStore();
  const [notifs, setNotifs] = useState({
    rewards: true,
    security: true,
    social: false,
    announcements: true,
    weekly: true,
  });
  const [prefs, setPrefs] = useState({
    soundEffects: true,
    animations: true,
    autoClaim: false,
  });

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Manage your account, security, and preferences." />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="glass-1 h-auto p-1 mb-6 flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <GlassCard level={2} className="p-6">
            <SectionHeader title="Profile Information" description="Your account details" icon={<Icons.User size={18} />} className="mb-4" />
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="flex flex-col items-center gap-3">
                <div className="size-24 rounded-3xl bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] text-white text-2xl font-bold flex items-center justify-center shadow-[var(--shadow-glow)]">
                  {getInitials(user.fullName)}
                </div>
                <LootButton variant="glass" size="sm" leftIcon={<Icons.Camera size={14} />} disabled>
                  Change
                </LootButton>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Full Name</label>
                  <Input value={user.fullName} readOnly />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Username</label>
                  <Input value={user.username} readOnly />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Email</label>
                  <Input value={user.email} readOnly />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Member Since</label>
                  <Input value={user.memberSince} readOnly />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Bio</label>
                  <Textarea value="Earning coins and climbing the leaderboard on LootLoom." readOnly rows={2} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <LootButton variant="glass" size="md">Cancel</LootButton>
              <LootButton variant="electric" size="md" leftIcon={<Icons.Save size={15} />} disabled>
                Save Changes
              </LootButton>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-4">
            <GlassCard level={2} className="p-6">
              <SectionHeader title="Password" description="Update your account password" icon={<Icons.KeyRound size={18} />} className="mb-4" />
              <div className="space-y-3 max-w-md">
                <Input type="password" placeholder="Current password" disabled />
                <Input type="password" placeholder="New password" disabled />
                <Input type="password" placeholder="Confirm new password" disabled />
                <LootButton variant="electric" size="md" leftIcon={<Icons.ShieldCheck size={15} />} disabled>
                  Update Password
                </LootButton>
              </div>
            </GlassCard>
            <GlassCard level={2} className="p-6">
              <SectionHeader title="Two-Factor Authentication" description="Add an extra layer of security" icon={<Icons.Smartphone size={18} />} className="mb-2" />
              <SettingsRow icon={<Icons.Smartphone size={16} />} title="Authenticator App" desc="Use Google Authenticator or similar">
                <LootButton variant="outline" size="sm" disabled>
                  Enable
                </LootButton>
              </SettingsRow>
              <SettingsRow icon={<Icons.MessageSquare size={16} />} title="SMS Verification" desc="Receive codes via SMS">
                <LootButton variant="outline" size="sm" disabled>
                  Enable
                </LootButton>
              </SettingsRow>
            </GlassCard>
            <GlassCard level={2} className="p-6">
              <SectionHeader title="Active Sessions" description="Devices currently signed in" icon={<Icons.MonitorSmartphone size={18} />} className="mb-2" />
              <SettingsRow icon={<Icons.Monitor size={16} />} title="Chrome on Windows" desc="Mumbai, IN · Current session">
                <StatusBadge variant="success" dot pulse>
                  Active
                </StatusBadge>
              </SettingsRow>
              <SettingsRow icon={<Icons.Smartphone size={16} />} title="Safari on iPhone" desc="Mumbai, IN · 2 hours ago">
                <LootButton variant="ghost" size="sm" className="text-rose-brand">
                  Revoke
                </LootButton>
              </SettingsRow>
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <GlassCard level={2} className="p-6">
            <SectionHeader title="Notification Preferences" description="Choose what you want to be notified about" icon={<Icons.Bell size={18} />} className="mb-2" />
            <SettingsRow icon={<Icons.Gift size={16} />} title="Rewards & Bonuses" desc="Daily bonuses, mission rewards, redemptions">
              <Switch checked={notifs.rewards} onCheckedChange={(v) => setNotifs((p) => ({ ...p, rewards: v }))} />
            </SettingsRow>
            <SettingsRow icon={<Icons.ShieldCheck size={16} />} title="Security Alerts" desc="New sign-ins, password changes">
              <Switch checked={notifs.security} onCheckedChange={(v) => setNotifs((p) => ({ ...p, security: v }))} />
            </SettingsRow>
            <SettingsRow icon={<Icons.Users size={16} />} title="Social Activity" desc="Friend referrals, mentions">
              <Switch checked={notifs.social} onCheckedChange={(v) => setNotifs((p) => ({ ...p, social: v }))} />
            </SettingsRow>
            <SettingsRow icon={<Icons.Megaphone size={16} />} title="Announcements" desc="Platform news and updates">
              <Switch checked={notifs.announcements} onCheckedChange={(v) => setNotifs((p) => ({ ...p, announcements: v }))} />
            </SettingsRow>
            <SettingsRow icon={<Icons.CalendarCheck size={16} />} title="Weekly Summary" desc="Your weekly earnings recap">
              <Switch checked={notifs.weekly} onCheckedChange={(v) => setNotifs((p) => ({ ...p, weekly: v }))} />
            </SettingsRow>
          </GlassCard>
        </TabsContent>

        <TabsContent value="preferences">
          <GlassCard level={2} className="p-6">
            <SectionHeader title="Preferences" description="Customize your experience" icon={<Icons.SlidersHorizontal size={18} />} className="mb-2" />
            <SettingsRow icon={<Icons.Coins size={16} />} title="Display Currency" desc="How coin values are shown">
              <LootButton variant="glass" size="sm" rightIcon={<Icons.ChevronDown size={14} />}>
                Coins (₹1 = 10)
              </LootButton>
            </SettingsRow>
            <SettingsRow icon={<Icons.Languages size={16} />} title="Language" desc="Interface language">
              <LootButton variant="glass" size="sm" rightIcon={<Icons.ChevronDown size={14} />}>
                English (IN)
              </LootButton>
            </SettingsRow>
            <SettingsRow icon={<Icons.Palette size={16} />} title="Theme" desc="Light or dark mode">
              <LootButton variant="glass" size="sm" rightIcon={<Icons.ChevronDown size={14} />}>
                Light
              </LootButton>
            </SettingsRow>
            <SettingsRow icon={<Icons.Volume2 size={16} />} title="Sound Effects" desc="Play sounds on actions">
              <Switch checked={prefs.soundEffects} onCheckedChange={(v) => setPrefs((p) => ({ ...p, soundEffects: v }))} />
            </SettingsRow>
            <SettingsRow icon={<Icons.Sparkles size={16} />} title="Animations" desc="Enable motion and transitions">
              <Switch checked={prefs.animations} onCheckedChange={(v) => setPrefs((p) => ({ ...p, animations: v }))} />
            </SettingsRow>
            <SettingsRow icon={<Icons.CalendarCheck size={16} />} title="Auto-claim Daily Bonus" desc="Claim automatically when you log in">
              <Switch checked={prefs.autoClaim} onCheckedChange={(v) => setPrefs((p) => ({ ...p, autoClaim: v }))} />
            </SettingsRow>
          </GlassCard>
        </TabsContent>

        <TabsContent value="privacy">
          <GlassCard level={2} className="p-6">
            <SectionHeader title="Privacy" description="Control your data and visibility" icon={<Icons.Lock size={18} />} className="mb-2" />
            <SettingsRow icon={<Icons.Eye size={16} />} title="Public Profile" desc="Show your profile to other users">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow icon={<Icons.BarChart3 size={16} />} title="Leaderboard Visibility" desc="Appear in global rankings">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow icon={<Icons.Cookie size={16} />} title="Analytics Cookies" desc="Help us improve LootLoom">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow icon={<Icons.Download size={16} />} title="Download My Data" desc="Export all your account data">
              <LootButton variant="outline" size="sm" disabled>
                Request
              </LootButton>
            </SettingsRow>
            <SettingsRow icon={<Icons.Trash2 size={16} />} title="Delete Account" desc="Permanently delete your account">
              <LootButton variant="destructive" size="sm" disabled>
                Delete
              </LootButton>
            </SettingsRow>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

/* ============================================================
   Profile
   ============================================================ */

function ProfilePage() {
  const user = useUserStore();
  const wallet = useWalletStore();
  const navigate = useNavigationStore((s) => s.navigate);
  const { items } = useActivityStore();
  const xpPct = Math.round((user.xp / user.xpToNext) * 100);
  const recentBadges = ACHIEVEMENTS.filter((a) => a.unlocked).slice(0, 4);

  return (
    <PageContainer>
      <PageHeader
        title="Profile"
        description="Your LootLoom identity, all in one place."
        actions={
          <LootButton variant="electric" size="sm" leftIcon={<Icons.Pencil size={14} />} onClick={() => navigate("settings")}>
            Edit Profile
          </LootButton>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Profile Card */}
        <motion.div variants={cardReveal} className="lg:col-span-1">
          <GlassCard level={3} sheen reflect className="p-6 h-full ring-1 ring-electric/15">
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-4"
              >
                <div className="absolute inset-0 blur-2xl bg-electric/20 rounded-full" />
                <div className="relative size-28 rounded-3xl bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand)_55%,var(--purple-brand))] text-white text-3xl font-bold flex items-center justify-center shadow-[var(--shadow-glow)]">
                  {getInitials(user.fullName)}
                </div>
                <div className="absolute -bottom-1 -right-1 size-8 rounded-2xl glass-3 ring-1 ring-border flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">L{user.level}</span>
                </div>
              </motion.div>
              <h2 className="text-xl font-bold text-foreground">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.username}</p>
              <p className="text-xs text-muted-foreground/80 mt-1">{user.email}</p>

              <div className="w-full flex items-center justify-center gap-2 my-4">
                <StatusBadge variant="electric" dot pulse>
                  Online
                </StatusBadge>
                <StatusBadge variant="gold">Premium</StatusBadge>
              </div>

              <div className="w-full flex items-center gap-4 mb-5">
                <ProgressRing value={xpPct} size={64} strokeWidth={6} gradient="electric" showLabel={false} />
                <div className="flex-1 text-left">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Level Progress</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {user.xp.toLocaleString("en-IN")} / {user.xpToNext.toLocaleString("en-IN")} XP
                  </p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${xpPct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand))]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mb-4">
                <div className="glass-1 rounded-xl p-3 text-center ring-1 ring-border">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icons.Coins className="text-gold" size={14} />
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Coins</p>
                  </div>
                  <AnimatedCounter value={wallet.availableCoins} className="text-lg font-bold text-foreground" />
                </div>
                <div className="glass-1 rounded-xl p-3 text-center ring-1 ring-border">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icons.Trophy className="text-purple-brand" size={14} />
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Rank</p>
                  </div>
                  <p className="text-lg font-bold text-foreground tabular-nums">#{user.rank}</p>
                </div>
                <div className="glass-1 rounded-xl p-3 text-center ring-1 ring-border">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icons.Flame className="text-rose-brand" size={14} />
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Streak</p>
                  </div>
                  <p className="text-lg font-bold text-foreground tabular-nums">{user.dailyStreak}d</p>
                </div>
                <div className="glass-1 rounded-xl p-3 text-center ring-1 ring-border">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icons.CalendarDays className="text-emerald-brand" size={14} />
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Member</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">{user.memberSince}</p>
                </div>
              </div>

              <div className="w-full glass-1 rounded-xl p-3 ring-1 ring-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icons.Ticket className="text-electric" size={15} />
                  <span className="text-xs text-muted-foreground">Referral Code</span>
                </div>
                <span className="font-mono font-bold text-sm text-foreground">{user.referralCode}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Right column */}
        <motion.div variants={cardReveal} custom={1} className="lg:col-span-2 space-y-4">
          <Grid cols={3}>
            <StatCard index={0} label="Total Earned" value={wallet.lifetimeEarned} suffix="" icon="TrendingUp" accent="emerald" />
            <StatCard index={1} label="Total Redeemed" value={wallet.lifetimeRedeemed} suffix="" icon="ShoppingBag" accent="rose" />
            <StatCard index={2} label="Last Login" value={0} icon="Clock" accent="cyan" />
          </Grid>

          <WidgetCard
            title="Badge Collection"
            description={`${ACHIEVEMENTS.filter((a) => a.unlocked).length} of ${ACHIEVEMENTS.length} unlocked`}
            icon={<Icons.Award size={18} />}
            action={
              <LootButton variant="ghost" size="sm" onClick={() => navigate("achievements")}>
                View All
              </LootButton>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentBadges.map((b) => {
                const meta = RARITY_META[b.rarity];
                const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[b.icon] ?? Icons.Award;
                return (
                  <div
                    key={b.id}
                    className={cn(
                      "glass-1 rounded-xl p-4 flex flex-col items-center text-center ring-1",
                      meta.glow
                    )}
                  >
                    <div className="size-10 rounded-xl glass-3 ring-1 ring-border flex items-center justify-center mb-2">
                      <LucideIcon className="text-foreground" size={18} />
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate w-full">{b.name}</p>
                    <StatusBadge
                      variant={
                        b.rarity === "common" ? "cyan" : b.rarity === "rare" ? "electric" : b.rarity === "epic" ? "purple" : "gold"
                      }
                      className="mt-1"
                    >
                      {meta.label}
                    </StatusBadge>
                  </div>
                );
              })}
            </div>
          </WidgetCard>

          <WidgetCard
            title="Recent Activity"
            description="Your latest actions"
            icon={<Icons.Activity size={18} />}
            action={
              <LootButton variant="ghost" size="sm" onClick={() => navigate("history")}>
                View All
              </LootButton>
            }
          >
            <div className="space-y-2.5">
              {items.slice(0, 4).map((a) => {
                const meta = ACTIVITY_TYPE_META[a.type] ?? ACTIVITY_TYPE_META.system;
                const isPositive = (a.amount ?? 0) > 0;
                return (
                  <div key={a.id} className="flex items-center gap-3">
                    <IconBadge name={meta.icon} accent={meta.accent} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.time}</p>
                    </div>
                    {a.amount !== undefined && (
                      <span
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          isPositive ? "text-emerald-brand" : "text-rose-brand"
                        )}
                      >
                        {isPositive ? "+" : ""}{a.amount.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </WidgetCard>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}

/* ============================================================
   Main router
   ============================================================ */

const PAGES: Record<string, () => ReactElement> = {
  notifications: NotificationsPage,
  achievements: AchievementsPage,
  leaderboard: LeaderboardPage,
  "daily-bonus": DailyBonusPage,
  missions: MissionsPage,
  referral: ReferralPage,
  transactions: TransactionsPage,
  history: HistoryPage,
  support: SupportPage,
  settings: SettingsPage,
  profile: ProfilePage,
};

export function PagesView() {
  const current = useNavigationStore((s) => s.current) as ViewId;
  const Page = PAGES[current];

  return (
    <AnimatePresence mode="wait">
      {Page ? (
        <Page key={current} />
      ) : (
        <PageContainer key="unknown">
          <EmptyState
            icon="Compass"
            title="Page not found"
            description="This page is not available yet."
          />
        </PageContainer>
      )}
    </AnimatePresence>
  );
}
