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
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  CalendarCheck,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  Flame,
  Gift,
  Hash,
  Info,
  Lightbulb,
  Lock,
  Medal,
  PartyPopper,
  PlayCircle,
  Rocket,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
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
  SectionHeader,
  SkeletonRow,
  StatusBadge,
  WidgetCard,
} from "@/components/lootloom";
import {
  cardReveal,
  floating,
  floatingSmall,
  staggerContainer,
} from "@/lib/animations";
import { useNavigationStore, useUserStore, useWalletStore } from "@/stores";
import { cn } from "@/lib/utils";

/* ============================================================
   Types
   ============================================================ */
type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
type Availability = "available" | "limited" | "soon";
type Difficulty = 1 | 2 | 3;

interface ActivityDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: Accent;
  reward: number;
  rewardSuffix?: string;
  estimatedTime: string;
  difficulty: Difficulty;
  availability: Availability;
  status: string;
  future?: boolean;
  view?: Parameters<ReturnType<typeof useNavigationStore.getState>["navigate"]>[0];
}

interface MissionDef {
  id: string;
  name: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  difficultyLabel: "Easy" | "Medium" | "Hard" | "Expert";
  difficultyAccent: Accent;
  estimatedTime: string;
  status: "available" | "in-progress" | "completed";
}

interface DailyDay {
  index: number;
  label: string;
  reward: number;
  state: "claimed" | "today" | "locked";
}

interface OfferProvider {
  id: string;
  name: string;
  description: string;
  rewardRange: string;
  completionRate: number;
  status: "active" | "low-inventory" | "coming-soon";
  accent: Accent;
}

interface EventDef {
  id: string;
  title: string;
  tag: string;
  timer: string;
  reward: string;
  accent: Accent;
  gradient: string;
  status: "live" | "soon";
}

interface AchievementDef {
  id: string;
  name: string;
  icon: string;
  progress: number;
  total: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
}

interface TipDef {
  id: string;
  title: string;
  body: string;
  icon: string;
  accent: Accent;
}

/* ============================================================
   Placeholder data
   ============================================================ */
const ACTIVITIES: ActivityDef[] = [
  {
    id: "ads",
    title: "Rewarded Ads",
    description: "Watch short video ads and earn coins instantly.",
    icon: "PlayCircle",
    accent: "electric",
    reward: 25,
    rewardSuffix: "/ad",
    estimatedTime: "30s each",
    difficulty: 1,
    availability: "available",
    status: "15 left today",
    view: "earn",
  },
  {
    id: "offerwall",
    title: "Offerwall",
    description: "Complete offers from trusted providers for big rewards.",
    icon: "Hash",
    accent: "cyan",
    reward: 500,
    rewardSuffix: "+",
    estimatedTime: "5–30 min",
    difficulty: 2,
    availability: "available",
    status: "12 offers live",
    view: "earn",
  },
  {
    id: "daily-bonus",
    title: "Daily Bonus",
    description: "Claim your daily login reward and grow your streak.",
    icon: "CalendarCheck",
    accent: "gold",
    reward: 50,
    rewardSuffix: "/day",
    estimatedTime: "10 sec",
    difficulty: 1,
    availability: "available",
    status: "Ready to claim",
    view: "daily-bonus",
  },
  {
    id: "daily-missions",
    title: "Daily Missions",
    description: "Quick missions that reset every 24 hours.",
    icon: "Target",
    accent: "electric",
    reward: 360,
    estimatedTime: "20–40 min",
    difficulty: 2,
    availability: "available",
    status: "3 missions",
    view: "missions",
  },
  {
    id: "weekly-missions",
    title: "Weekly Missions",
    description: "Bigger missions with bigger payouts every week.",
    icon: "Trophy",
    accent: "purple",
    reward: 1500,
    estimatedTime: "1–3 hrs",
    difficulty: 2,
    availability: "available",
    status: "3 missions",
    view: "missions",
  },
  {
    id: "monthly-missions",
    title: "Monthly Missions",
    description: "Long-haul challenges for expert earners.",
    icon: "Medal",
    accent: "rose",
    reward: 6000,
    estimatedTime: "5–10 hrs",
    difficulty: 3,
    availability: "available",
    status: "3 missions",
    view: "missions",
  },
  {
    id: "achievements",
    title: "Achievement Rewards",
    description: "Unlock milestones and earn permanent badges.",
    icon: "Star",
    accent: "gold",
    reward: 2500,
    estimatedTime: "Progress-based",
    difficulty: 2,
    availability: "available",
    status: "4 ready to claim",
    view: "achievements",
  },
  {
    id: "referral",
    title: "Referral Rewards",
    description: "Invite friends and earn when they join & earn.",
    icon: "Users",
    accent: "emerald",
    reward: 200,
    rewardSuffix: "/friend",
    estimatedTime: "Instant",
    difficulty: 1,
    availability: "available",
    status: "5 friends joined",
    view: "referral",
  },
  {
    id: "seasonal",
    title: "Seasonal Events",
    description: "Limited-time seasonal campaigns with mega rewards.",
    icon: "PartyPopper",
    accent: "purple",
    reward: 3000,
    estimatedTime: "Season-long",
    difficulty: 2,
    availability: "soon",
    status: "Placeholder",
    future: true,
  },
  {
    id: "promotions",
    title: "Special Promotions",
    description: "Brand-sponsored promotions with bonus coins.",
    icon: "Gift",
    accent: "cyan",
    reward: 1000,
    estimatedTime: "Varies",
    difficulty: 1,
    availability: "soon",
    status: "Placeholder",
    future: true,
  },
  {
    id: "lucky-spin",
    title: "Lucky Spin",
    description: "Spin the daily wheel for a chance at huge rewards.",
    icon: "Sparkles",
    accent: "gold",
    reward: 5000,
    estimatedTime: "1 spin / day",
    difficulty: 1,
    availability: "soon",
    status: "Coming Soon",
    future: true,
  },
  {
    id: "scratch-card",
    title: "Scratch Card",
    description: "Scratch and reveal hidden coin rewards.",
    icon: "Ticket",
    accent: "rose",
    reward: 2000,
    estimatedTime: "1 card / day",
    difficulty: 1,
    availability: "soon",
    status: "Coming Soon",
    future: true,
  },
  {
    id: "quiz",
    title: "Quiz Rewards",
    description: "Answer trivia correctly to earn coins and XP.",
    icon: "Lightbulb",
    accent: "electric",
    reward: 150,
    rewardSuffix: "/quiz",
    estimatedTime: "2–5 min",
    difficulty: 2,
    availability: "soon",
    status: "Coming Soon",
    future: true,
  },
  {
    id: "survey",
    title: "Survey Rewards",
    description: "Share your opinion and get rewarded for it.",
    icon: "Info",
    accent: "navy",
    reward: 800,
    rewardSuffix: "+",
    estimatedTime: "10–20 min",
    difficulty: 3,
    availability: "soon",
    status: "Coming Soon",
    future: true,
  },
];

const OFFER_PROVIDERS: OfferProvider[] = [
  {
    id: "p-a",
    name: "Provider A",
    description: "App installs, sign-ups, and trial subscriptions.",
    rewardRange: "120 – 2,400 coins",
    completionRate: 68,
    status: "active",
    accent: "electric",
  },
  {
    id: "p-b",
    name: "Provider B",
    description: "Survey panels and product feedback studies.",
    rewardRange: "80 – 1,200 coins",
    completionRate: 42,
    status: "low-inventory",
    accent: "cyan",
  },
  {
    id: "p-c",
    name: "Provider C",
    description: "Game milestones and in-game level achievements.",
    rewardRange: "300 – 5,000 coins",
    completionRate: 75,
    status: "active",
    accent: "purple",
  },
  {
    id: "p-d",
    name: "Provider D",
    description: "Video ad bundles and short brand experiences.",
    rewardRange: "50 – 600 coins",
    completionRate: 0,
    status: "coming-soon",
    accent: "gold",
  },
];

const OFFER_CATEGORIES = [
  "All Offers",
  "App Installs",
  "Surveys",
  "Games",
  "Trials",
  "Videos",
  "Sign-ups",
];

const DAILY_BONUS_DAYS: DailyDay[] = [
  { index: 0, label: "Mon", reward: 20, state: "claimed" },
  { index: 1, label: "Tue", reward: 30, state: "claimed" },
  { index: 2, label: "Wed", reward: 40, state: "claimed" },
  { index: 3, label: "Thu", reward: 50, state: "today" },
  { index: 4, label: "Fri", reward: 75, state: "locked" },
  { index: 5, label: "Sat", reward: 100, state: "locked" },
  { index: 6, label: "Sun", reward: 250, state: "locked" },
];

const DAILY_MISSIONS: MissionDef[] = [
  {
    id: "dm-1",
    name: "Daily Explorer",
    description: "Visit 3 different sections of LootLoom today.",
    reward: 60,
    progress: 2,
    total: 3,
    difficultyLabel: "Easy",
    difficultyAccent: "emerald",
    estimatedTime: "~2 min",
    status: "in-progress",
  },
  {
    id: "dm-2",
    name: "Ad Watcher",
    description: "Watch 5 rewarded ads to completion.",
    reward: 125,
    progress: 5,
    total: 5,
    difficultyLabel: "Easy",
    difficultyAccent: "emerald",
    estimatedTime: "~3 min",
    status: "completed",
  },
  {
    id: "dm-3",
    name: "Mission Starter",
    description: "Complete 1 offer from the offerwall.",
    reward: 175,
    progress: 0,
    total: 1,
    difficultyLabel: "Medium",
    difficultyAccent: "gold",
    estimatedTime: "~8 min",
    status: "available",
  },
];

const WEEKLY_MISSIONS: MissionDef[] = [
  {
    id: "wm-1",
    name: "Weekly Hustler",
    description: "Earn at least 700 coins this week.",
    reward: 450,
    progress: 480,
    total: 700,
    difficultyLabel: "Medium",
    difficultyAccent: "gold",
    estimatedTime: "~1 hr",
    status: "in-progress",
  },
  {
    id: "wm-2",
    name: "Streak Keeper",
    description: "Log in for 5 consecutive days this week.",
    reward: 600,
    progress: 5,
    total: 5,
    difficultyLabel: "Easy",
    difficultyAccent: "emerald",
    estimatedTime: "5 days",
    status: "completed",
  },
  {
    id: "wm-3",
    name: "Offer Champion",
    description: "Complete 3 high-value offers (1,000+ coins each).",
    reward: 1200,
    progress: 1,
    total: 3,
    difficultyLabel: "Hard",
    difficultyAccent: "rose",
    estimatedTime: "~2 hrs",
    status: "in-progress",
  },
];

const MONTHLY_MISSIONS: MissionDef[] = [
  {
    id: "mm-1",
    name: "Monthly Mastermind",
    description: "Accumulate 12,000 coins in any single month.",
    reward: 4000,
    progress: 6800,
    total: 12000,
    difficultyLabel: "Expert",
    difficultyAccent: "purple",
    estimatedTime: "~3 weeks",
    status: "in-progress",
  },
  {
    id: "mm-2",
    name: "Referral Legend",
    description: "Refer 10 new active members this month.",
    reward: 2500,
    progress: 5,
    total: 10,
    difficultyLabel: "Hard",
    difficultyAccent: "rose",
    estimatedTime: "~3 weeks",
    status: "in-progress",
  },
  {
    id: "mm-3",
    name: "Ad Marathon",
    description: "Watch 250 rewarded ads in one month.",
    reward: 3500,
    progress: 0,
    total: 250,
    difficultyLabel: "Expert",
    difficultyAccent: "purple",
    estimatedTime: "~2 hrs / week",
    status: "available",
  },
];

const ACHIEVEMENTS: AchievementDef[] = [
  { id: "a1", name: "First Coins", icon: "Coins", progress: 1, total: 1, rarity: "common", unlocked: true },
  { id: "a2", name: "Ad Apprentice", icon: "PlayCircle", progress: 48, total: 50, rarity: "rare", unlocked: false },
  { id: "a3", name: "Mission Master", icon: "Target", progress: 120, total: 200, rarity: "epic", unlocked: false },
  { id: "a4", name: "Streak Keeper", icon: "Flame", progress: 12, total: 30, rarity: "rare", unlocked: false },
  { id: "a5", name: "Social Star", icon: "Users", progress: 5, total: 5, rarity: "epic", unlocked: true },
  { id: "a6", name: "Loot Legend", icon: "Trophy", progress: 2840, total: 10000, rarity: "legendary", unlocked: false },
];

const EVENTS: EventDef[] = [
  {
    id: "e1",
    title: "Weekend Coin Boost",
    tag: "Weekend Boost",
    timer: "Ends in 1d 14h",
    reward: "+25% on all ads",
    accent: "electric",
    gradient: "from-electric/25 via-cyan-brand/15 to-transparent",
    status: "live",
  },
  {
    id: "e2",
    title: "Diwali Festival Rewards",
    tag: "Festival Event",
    timer: "5 days left",
    reward: "Up to 5,000 coins",
    accent: "gold",
    gradient: "from-gold/30 via-rose-brand/15 to-transparent",
    status: "live",
  },
  {
    id: "e3",
    title: "Bonus Campaign: New Users",
    tag: "Bonus Campaign",
    timer: "Limited slots",
    reward: "2x first-week earnings",
    accent: "emerald",
    gradient: "from-emerald-brand/25 via-cyan-brand/10 to-transparent",
    status: "live",
  },
  {
    id: "e4",
    title: "Holiday Rewards Hunt",
    tag: "Holiday Rewards",
    timer: "Starts in 6 days",
    reward: "Mystery prizes",
    accent: "purple",
    gradient: "from-purple-brand/25 via-electric/10 to-transparent",
    status: "soon",
  },
  {
    id: "e5",
    title: "LootLoom Tournament",
    tag: "Future Tournament",
    timer: "Coming Soon",
    reward: "10,000 coin pool",
    accent: "rose",
    gradient: "from-rose-brand/25 via-purple-brand/10 to-transparent",
    status: "soon",
  },
  {
    id: "e6",
    title: "7-Day Challenge",
    tag: "Future Challenge",
    timer: "Coming Soon",
    reward: "Badge + 3,000 coins",
    accent: "cyan",
    gradient: "from-cyan-brand/25 via-electric/10 to-transparent",
    status: "soon",
  },
];

const ANALYTICS_DAILY = [
  { label: "Mon", value: 120 },
  { label: "Tue", value: 180 },
  { label: "Wed", value: 90 },
  { label: "Thu", value: 240 },
  { label: "Fri", value: 145 },
  { label: "Sat", value: 320 },
  { label: "Sun", value: 145 },
];

const ANALYTICS_WEEKLY = [
  { label: "W1", value: 980 },
  { label: "W2", value: 1240 },
  { label: "W3", value: 870 },
  { label: "W4", value: 1580 },
  { label: "W5", value: 1320 },
  { label: "W6", value: 980 },
];

const ANALYTICS_DISTRIBUTION = [
  { name: "Ads", value: 320, color: "oklch(0.62 0.22 255)" },
  { name: "Offerwall", value: 480, color: "oklch(0.72 0.15 200)" },
  { name: "Missions", value: 560, color: "oklch(0.6 0.22 295)" },
  { name: "Bonus", value: 150, color: "oklch(0.8 0.16 85)" },
  { name: "Referral", value: 200, color: "oklch(0.7 0.17 160)" },
];

const TIPS: TipDef[] = [
  {
    id: "t1",
    title: "Stack your rewards",
    body: "Complete daily missions and watch ads in the same session to build momentum faster.",
    icon: "Zap",
    accent: "electric",
  },
  {
    id: "t2",
    title: "Never break your streak",
    body: "A 30-day streak unlocks a permanent +10% earnings bonus. Claim your daily bonus every day.",
    icon: "Flame",
    accent: "rose",
  },
  {
    id: "t3",
    title: "Pick high-value offers",
    body: "Filter the offerwall by reward size. Surveys pay more but take longer — balance both.",
    icon: "Target",
    accent: "purple",
  },
  {
    id: "t4",
    title: "Refer power earners",
    body: "Friends who reach Level 5 give you 500 bonus coins. Share your code with active users.",
    icon: "Users",
    accent: "emerald",
  },
];

const RARITY_ACCENT: Record<AchievementDef["rarity"], Accent> = {
  common: "navy",
  rare: "cyan",
  epic: "purple",
  legendary: "gold",
};

const RARITY_RING: Record<AchievementDef["rarity"], "electric" | "cyan" | "purple" | "gold" | "emerald"> = {
  common: "electric",
  rare: "cyan",
  epic: "purple",
  legendary: "gold",
};

/* ============================================================
   Helper components
   ============================================================ */
function DifficultyBars({ level, accent }: { level: Difficulty; accent: Accent }) {
  const colorMap: Record<Accent, string> = {
    electric: "bg-electric",
    cyan: "bg-cyan-brand",
    purple: "bg-purple-brand",
    gold: "bg-gold",
    emerald: "bg-emerald-brand",
    rose: "bg-rose-brand",
    navy: "bg-navy",
  };
  return (
    <div className="flex items-end gap-1" aria-label={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "w-1.5 rounded-sm transition-all",
            i <= level ? colorMap[accent] : "bg-muted-foreground/20"
          )}
          style={{ height: `${4 + i * 3}px` }}
        />
      ))}
    </div>
  );
}

function AvailabilityBadge({ availability }: { availability: Availability }) {
  if (availability === "available") {
    return (
      <StatusBadge variant="success" dot pulse>
        Available
      </StatusBadge>
    );
  }
  if (availability === "limited") {
    return (
      <StatusBadge variant="warning" dot>
        Limited
      </StatusBadge>
    );
  }
  return (
    <StatusBadge variant="default" dot>
      Soon
    </StatusBadge>
  );
}

interface ActivityCardProps {
  activity: ActivityDef;
  index: number;
  onNavigate: (view: NonNullable<ActivityDef["view"]>) => void;
}

function ActivityCard({ activity, index, onNavigate }: ActivityCardProps) {
  const {
    title,
    description,
    icon: iconName,
    accent,
    reward,
    rewardSuffix,
    estimatedTime,
    difficulty,
    availability,
    status,
    future,
    view,
  } = activity;

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
        level={2}
        hover={!future}
        sheen
        glow={future ? "none" : accent === "electric" ? "electric" : accent === "cyan" ? "cyan" : "purple"}
        className="p-5 h-full flex flex-col gap-4 relative overflow-hidden"
        onClick={() => !future && view && onNavigate(view)}
      >
        {/* Top row: icon + availability */}
        <div className="flex items-start justify-between gap-3">
          <IconBadge name={iconName} accent={accent} size="lg" />
          <div className="flex flex-col items-end gap-1.5">
            <AvailabilityBadge availability={availability} />
            {future && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                <Lock size={10} /> Coming Soon
              </span>
            )}
          </div>
        </div>

        {/* Title + description */}
        <div className="space-y-1 min-h-[3.5rem]">
          <h3 className="font-semibold text-foreground text-sm sm:text-base leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>

        {/* Reward badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-gold/12 ring-1 ring-gold/25 px-2.5 py-1.5">
            <Coins size={14} className="text-gold" />
            <span className="text-sm font-bold text-gold tabular-nums">
              {reward.toLocaleString("en-IN")}
              {rewardSuffix ?? ""}
            </span>
          </div>
        </div>

        {/* Meta: time + difficulty + status */}
        <div className="mt-auto pt-3 border-t border-border/60 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium text-foreground/70">
              <Clock size={11} /> Time
            </div>
            <span className="block truncate">{estimatedTime}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium text-foreground/70">
              <Activity size={11} /> Difficulty
            </div>
            <DifficultyBars level={difficulty} accent={accent} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium text-foreground/70">
              <Sparkles size={11} /> Status
            </div>
            <span className="block truncate">{status}</span>
          </div>
        </div>

        {/* Bottom action */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            {future ? "Coming soon" : "Tap to start"}
          </span>
          {!future ? (
            <ChevronRight size={16} className="text-electric" />
          ) : (
            <Lock size={14} className="text-muted-foreground/60" />
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface MissionCardProps {
  mission: MissionDef;
  index: number;
  period: "daily" | "weekly" | "monthly";
}

function MissionCard({ mission, index, period }: MissionCardProps) {
  const percent = Math.min(100, Math.round((mission.progress / mission.total) * 100));
  const isCompleted = mission.status === "completed";
  const ringGradient =
    isCompleted
      ? "emerald"
      : mission.difficultyAccent === "purple"
      ? "purple"
      : mission.difficultyAccent === "rose"
      ? "electric"
      : mission.difficultyAccent === "gold"
      ? "gold"
      : "cyan";

  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-30px" }}>
      <GlassCard hover sheen level={2} className="p-5 flex flex-col gap-4 h-full">
        <div className="flex items-start gap-4">
          <ProgressRing
            value={percent}
            size={72}
            strokeWidth={8}
            gradient={ringGradient as "electric" | "cyan" | "purple" | "gold" | "emerald"}
            label={`${percent}%`}
            showLabel
          />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm text-foreground leading-tight">{mission.name}</h4>
              <StatusBadge
                variant={isCompleted ? "success" : mission.status === "in-progress" ? "info" : "default"}
                dot
              >
                {isCompleted ? "Done" : mission.status === "in-progress" ? "Active" : "Open"}
              </StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{mission.description}</p>
            <div className="flex items-center gap-2 pt-1">
              <span
                className={cn(
                  "text-[10px] font-semibold rounded-md px-2 py-0.5 ring-1",
                  mission.difficultyAccent === "emerald" && "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
                  mission.difficultyAccent === "gold" && "bg-gold/15 text-gold ring-gold/25",
                  mission.difficultyAccent === "rose" && "bg-rose-brand/10 text-rose-brand ring-rose-brand/20",
                  mission.difficultyAccent === "purple" && "bg-purple/12 text-purple-brand ring-purple-brand/20"
                )}
              >
                {mission.difficultyLabel}
              </span>
              <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                <Clock size={10} /> {mission.estimatedTime}
              </span>
            </div>
          </div>
        </div>

        {/* Progress + reward */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {mission.progress.toLocaleString("en-IN")} / {mission.total.toLocaleString("en-IN")} {period === "daily" ? "actions" : "completed"}
            </span>
            <span className="inline-flex items-center gap-1 text-gold font-semibold">
              <Coins size={12} /> +{mission.reward.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${percent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
              className={cn(
                "h-full rounded-full",
                isCompleted
                  ? "bg-[linear-gradient(90deg,var(--emerald-brand),var(--cyan-brand))]"
                  : "bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand))]"
              )}
            />
          </div>
        </div>

        {/* Action */}
        <LootButton
          variant={isCompleted ? "glass" : "electric"}
          size="sm"
          fullWidth
          disabled={isCompleted}
          leftIcon={isCompleted ? <Sparkles size={14} /> : <Rocket size={14} />}
        >
          {isCompleted ? "Completed" : "Start Mission"}
        </LootButton>
      </GlassCard>
    </motion.div>
  );
}

function DailyDayTile({ day, index }: { day: DailyDay; index: number }) {
  const isToday = day.state === "today";
  const isClaimed = day.state === "claimed";
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn(
        "relative rounded-xl p-3 flex flex-col items-center gap-1.5 ring-1 transition-all",
        isToday && "bg-electric/12 ring-electric/35 shadow-[var(--shadow-glow)]",
        isClaimed && "bg-emerald-brand/10 ring-emerald-brand/25",
        !isToday && !isClaimed && "glass-1 ring-border opacity-70"
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{day.label}</span>
      <div className="size-7 rounded-full bg-gold/15 flex items-center justify-center">
        <Coins size={14} className="text-gold" />
      </div>
      <span className="text-xs font-bold text-foreground tabular-nums">{day.reward}</span>
      <div className="absolute -top-1.5 -right-1.5">
        {isClaimed && (
          <span className="size-5 rounded-full bg-emerald-brand text-white flex items-center justify-center ring-2 ring-background">
            <TrendingUp size={10} />
          </span>
        )}
        {isToday && (
          <span className="size-5 rounded-full bg-electric text-white flex items-center justify-center ring-2 ring-background animate-pulse">
            <Flame size={10} />
          </span>
        )}
        {!isToday && !isClaimed && (
          <span className="size-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center ring-2 ring-background">
            <Lock size={9} />
          </span>
        )}
      </div>
    </motion.div>
  );
}

function OfferProviderCard({ provider, index }: { provider: OfferProvider; index: number }) {
  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <GlassCard hover sheen level={2} className="p-4 flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <IconBadge name="Hash" accent={provider.accent} size="md" />
            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate">{provider.name}</h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{provider.description}</p>
            </div>
          </div>
          {provider.status === "active" && <StatusBadge variant="success" dot pulse>Active</StatusBadge>}
          {provider.status === "low-inventory" && <StatusBadge variant="warning" dot>Low</StatusBadge>}
          {provider.status === "coming-soon" && <StatusBadge variant="default" dot>Soon</StatusBadge>}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-gold/12 ring-1 ring-gold/25 px-2.5 py-1">
            <Coins size={12} className="text-gold" />
            <span className="font-bold text-gold">{provider.rewardRange}</span>
          </div>
          <span className="text-muted-foreground">Completion {provider.completionRate}%</span>
        </div>

        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${provider.completionRate}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            className={cn(
              "h-full rounded-full",
              provider.completionRate >= 60 ? "bg-emerald-brand" : provider.completionRate >= 30 ? "bg-gold" : "bg-electric"
            )}
          />
        </div>

        <LootButton
          variant={provider.status === "coming-soon" ? "glass" : "outline"}
          size="sm"
          fullWidth
          disabled={provider.status === "coming-soon"}
          rightIcon={provider.status === "coming-soon" ? <Lock size={12} /> : <ChevronRight size={14} />}
        >
          {provider.status === "coming-soon" ? "Coming Soon" : "Browse Offers"}
        </LootButton>
      </GlassCard>
    </motion.div>
  );
}

function EventCard({ event, index }: { event: EventDef; index: number }) {
  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <GlassCard hover sheen level={2} className={cn("relative overflow-hidden h-full flex flex-col")}>
        {/* Gradient banner */}
        <div className={cn("absolute inset-x-0 top-0 h-24 bg-gradient-to-br", event.gradient)} />
        <div className="relative p-5 flex flex-col gap-3 h-full">
          <div className="flex items-start justify-between gap-2">
            <StatusBadge variant={event.status === "live" ? "success" : "default"} dot pulse={event.status === "live"}>
              {event.tag}
            </StatusBadge>
            <IconBadge
              name="PartyPopper"
              accent={event.accent}
              size="sm"
            />
          </div>
          <div className="space-y-1 mt-2">
            <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
            <p className="text-xs text-muted-foreground">{event.reward}</p>
          </div>
          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Clock size={11} /> {event.timer}
            </span>
            <LootButton
              size="sm"
              variant={event.status === "live" ? "electric" : "glass"}
              disabled={event.status !== "live"}
              rightIcon={event.status === "live" ? <ChevronRight size={14} /> : <Lock size={12} />}
            >
              {event.status === "live" ? "Join Now" : "Notify Me"}
            </LootButton>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function AchievementBadgeCard({ achievement, index }: { achievement: AchievementDef; index: number }) {
  const percent = Math.min(100, Math.round((achievement.progress / achievement.total) * 100));
  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <GlassCard
        hover
        sheen
        level={2}
        className={cn(
          "p-4 flex flex-col items-center gap-2 text-center h-full",
          !achievement.unlocked && "opacity-90"
        )}
      >
        <ProgressRing
          value={percent}
          size={72}
          strokeWidth={6}
          gradient={RARITY_RING[achievement.rarity]}
          label={achievement.unlocked ? "✓" : `${percent}%`}
        />
        <IconBadge name={achievement.icon} accent={RARITY_ACCENT[achievement.rarity]} size="sm" />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-foreground">{achievement.name}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{achievement.rarity}</p>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {achievement.unlocked ? "Unlocked" : `${achievement.progress.toLocaleString("en-IN")} / ${achievement.total.toLocaleString("en-IN")}`}
        </span>
      </GlassCard>
    </motion.div>
  );
}

function TipCard({ tip, index }: { tip: TipDef; index: number }) {
  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <GlassCard hover sheen level={2} className="p-4 flex gap-3 h-full">
        <div className="shrink-0">
          <IconBadge name={tip.icon} accent={tip.accent} size="md" />
        </div>
        <div className="space-y-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground">{tip.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{tip.body}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Empty / Error state components (defined in file as required)
   ============================================================ */
function NoActivitiesEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="Target"
      title="No earning activities available"
      description="We couldn't find any activities right now. They refresh every few minutes — try again shortly."
      action={
        <LootButton variant="electric" size="sm" leftIcon={<Sparkles size={14} />} onClick={onRetry}>
          Refresh Activities
        </LootButton>
      }
    />
  );
}

function EarnUnavailableError({ onRetry }: { onRetry?: () => void }) {
  return (
    <GlassCard level={2} className="p-6">
      <EmptyState
        icon="AlertTriangle"
        title="Earn Center temporarily unavailable"
        description="The earn service is taking a break. Your progress is safe — please retry in a moment."
        action={
          <LootButton variant="electric" size="sm" leftIcon={<Zap size={14} />} onClick={onRetry}>
            Retry Now
          </LootButton>
        }
      />
    </GlassCard>
  );
}

/* ============================================================
   Small reusable chart tooltip
   ============================================================ */
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg glass-3 ring-1 ring-border px-3 py-2 text-xs shadow-md">
      {label && <p className="font-semibold text-foreground mb-0.5">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: p.color ?? "var(--electric)" }} />
          <span className="font-semibold text-foreground tabular-nums">{p.value.toLocaleString("en-IN")}</span>
          <span>coins</span>
        </p>
      ))}
    </div>
  );
}

/* ============================================================
   Main view
   ============================================================ */
export function EarnView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { todayEarnings, availableCoins } = useWalletStore();
  const { level, xp, xpToNext, dailyStreak, referralCode } = useUserStore();

  const [analyticsPeriod, setAnalyticsPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [showEmptyDemo, setShowEmptyDemo] = useState(false);

  const levelProgress = Math.min(100, Math.round((xp / xpToNext) * 100));
  const todayProgress = Math.min(100, Math.round((todayEarnings / 500) * 100));
  const availableActivities = useMemo(
    () => ACTIVITIES.filter((a) => a.availability !== "soon").length,
    []
  );

  const analyticsData =
    analyticsPeriod === "daily" ? ANALYTICS_DAILY : analyticsPeriod === "weekly" ? ANALYTICS_WEEKLY : ANALYTICS_DAILY;

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Earn Coins"
        description="Complete activities to earn rewards"
        actions={
          <>
            <LootButton
              variant="ghost"
              size="sm"
              leftIcon={<Info size={14} />}
              onClick={() => navigate("rewards")}
            >
              How it works
            </LootButton>
            <LootButton
              variant="electric"
              size="sm"
              leftIcon={<Coins size={14} />}
              onClick={() => navigate("wallet")}
            >
              View Wallet
            </LootButton>
          </>
        }
      />

      {/* ============ 1. Earn Overview Hero ============ */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <GlassCard level={1} sheen glow="electric" className="relative overflow-hidden p-6 lg:p-8">
          {/* Decorative floating blobs */}
          <motion.div
            variants={floating}
            animate="animate"
            className="absolute -top-16 -right-16 size-64 rounded-full bg-electric/20 blur-3xl pointer-events-none"
          />
          <motion.div
            variants={floatingSmall}
            animate="animate"
            className="absolute -bottom-20 -left-10 size-56 rounded-full bg-purple-brand/15 blur-3xl pointer-events-none"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: headline earnings */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge variant="gold" dot pulse>
                  Earn Center Live
                </StatusBadge>
                <StatusBadge variant="info" dot>
                  {availableActivities} activities available
                </StatusBadge>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Today&apos;s Earnings
                </p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <AnimatedCounter
                    value={todayEarnings}
                    prefix=""
                    suffix=" coins"
                    className="text-4xl sm:text-5xl font-bold text-foreground"
                  />
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-brand">
                    <TrendingUp size={14} /> +18% vs avg
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Available balance:{" "}
                  <span className="font-semibold text-foreground">
                    {availableCoins.toLocaleString("en-IN")} coins
                  </span>
                </p>
              </div>

              {/* Mini stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat
                  icon={<Flame size={14} />}
                  label="Current Streak"
                  value={`${dailyStreak} days`}
                  accent="rose"
                />
                <MiniStat
                  icon={<Star size={14} />}
                  label="Current Level"
                  value={`Level ${level}`}
                  accent="gold"
                />
                <MiniStat
                  icon={<Zap size={14} />}
                  label="Current XP"
                  value={xp.toLocaleString("en-IN")}
                  accent="electric"
                />
                <MiniStat
                  icon={<Sparkles size={14} />}
                  label="Reward Multiplier"
                  value="×1.0"
                  accent="cyan"
                  locked
                  lockLabel="VIP"
                />
              </div>
            </div>

            {/* Right: progress ring + VIP card */}
            <div className="flex flex-col gap-4 items-center justify-center">
              <ProgressRing
                value={todayProgress}
                size={140}
                strokeWidth={12}
                gradient="electric"
                label={`${todayProgress}%`}
              />
              <div className="text-center space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Daily Goal Progress
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {todayEarnings} / 500 coins today
                </p>
              </div>

              <GlassCard level={3} className="w-full p-3 flex items-center gap-3 opacity-80">
                <div className="size-9 rounded-lg bg-gold/15 ring-1 ring-gold/25 flex items-center justify-center shrink-0">
                  <Lock size={16} className="text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">Future VIP Bonus</p>
                  <p className="text-[10px] text-muted-foreground">Unlock at Level 10 — +25% earnings</p>
                </div>
              </GlassCard>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ============ 2. Earning Activities Grid ============ */}
      <section className="mb-8">
        <SectionHeader
          title="Earning Activities"
          description="Pick any activity to start earning coins"
          icon={<Sparkles size={18} />}
          action={
            <LootButton variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />}>
              View all
            </LootButton>
          }
        />
        <Grid cols="auto">
          {ACTIVITIES.map((activity, i) => (
            <ActivityCard key={activity.id} activity={activity} index={i} onNavigate={navigate} />
          ))}
        </Grid>
      </section>

      {/* ============ 3. Rewarded Ads Section ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Rewarded Ads"
          description="Watch short video ads to earn coins instantly"
          icon={<PlayCircle size={18} />}
          action={<StatusBadge variant="success" dot pulse>15 ads available</StatusBadge>}
          glow="electric"
          index={0}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: stats */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <MiniStatBox icon="PlayCircle" accent="electric" label="Available Ads" value="15" sub="of 25 daily" />
                <MiniStatBox icon="Coins" accent="gold" label="Estimated Coins" value="375" sub="if all watched" />
                <MiniStatBox icon="Clock" accent="cyan" label="Daily Limit" value="25" sub="ads / day" />
                <MiniStatBox icon="Zap" accent="purple" label="Reward / Ad" value="25" sub="coins each" />
              </div>

              <GlassCard level={3} className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Today&apos;s Ad Progress</span>
                  <span className="text-muted-foreground">10 / 25 watched</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "40%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand))]"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Earned <span className="text-emerald-brand font-semibold">+250 coins</span> from ads today.
                </p>
              </GlassCard>
            </div>

            {/* Middle: Reward preview */}
            <GlassCard level={3} className="p-4 flex flex-col items-center justify-center text-center gap-3">
              <motion.div variants={floatingSmall} animate="animate" className="size-16 rounded-2xl bg-gold/15 ring-1 ring-gold/25 flex items-center justify-center">
                <Coins size={28} className="text-gold" />
              </motion.div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Reward Preview</p>
                <p className="text-2xl font-bold text-foreground">
                  +<AnimatedCounter value={25} /> <span className="text-base font-semibold">coins</span>
                </p>
                <p className="text-[11px] text-muted-foreground">per completed ad watch</p>
              </div>
              <StatusBadge variant="warning" dot pulse>
                Loading preview…
              </StatusBadge>
            </GlassCard>

            {/* Right: CTA */}
            <GlassCard level={3} className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <div className="size-12 rounded-xl bg-electric/10 ring-1 ring-electric/20 flex items-center justify-center">
                <Lock size={20} className="text-electric" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Start Watching Ads</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Rewarded ad playback is a placeholder. Real ad SDK integration coming soon.
                </p>
              </div>
              <LootButton
                variant="electric"
                size="md"
                fullWidth
                disabled
                leftIcon={<PlayCircle size={16} />}
              >
                Start Watching
              </LootButton>
              <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                <Lock size={10} /> Verification step will appear post-watch
              </p>
            </GlassCard>
          </div>
        </WidgetCard>
      </section>

      {/* ============ 4. Offerwall Section ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Offerwall"
          description="Complete offers from trusted providers for the biggest rewards"
          icon={<Hash size={18} />}
          action={<StatusBadge variant="info" dot>3 providers live</StatusBadge>}
          glow="cyan"
          index={0}
        >
          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {OFFER_CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold ring-1 transition-all",
                  i === 0
                    ? "bg-electric/12 text-electric ring-electric/25"
                    : "glass-1 text-muted-foreground ring-border hover:text-foreground hover:ring-electric/30"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <Grid cols={4}>
            {OFFER_PROVIDERS.map((p, i) => (
              <OfferProviderCard key={p.id} provider={p} index={i} />
            ))}
          </Grid>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <Info size={12} /> Offers are placeholders. Real offerwall integration coming soon.
            </p>
            <LootButton variant="outline" size="sm" leftIcon={<Rocket size={14} />} disabled>
              Launch Offerwall
            </LootButton>
          </div>
        </WidgetCard>
      </section>

      {/* ============ 5. Daily Bonus Section ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Daily Bonus"
          description="Claim your daily login reward and grow your streak"
          icon={<CalendarCheck size={18} />}
          action={<StatusBadge variant="warning" dot pulse>Ready to claim</StatusBadge>}
          glow="purple"
          index={0}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 7-day calendar */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {DAILY_BONUS_DAYS.map((d, i) => (
                  <DailyDayTile key={d.index} day={d} index={i} />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <MiniStatBox icon="Flame" accent="rose" label="Current Streak" value={`${dailyStreak}`} sub="days" />
                <MiniStatBox icon="Coins" accent="gold" label="Today's Reward" value="50" sub="coins" />
                <MiniStatBox icon="Gift" accent="cyan" label="Tomorrow" value="75" sub="coins" />
              </div>
            </div>

            {/* Claim card */}
            <GlassCard level={3} className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <motion.div variants={floatingSmall} animate="animate" className="size-16 rounded-2xl bg-gold/15 ring-1 ring-gold/25 flex items-center justify-center">
                <Gift size={28} className="text-gold" />
              </motion.div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Day 4 Reward</p>
                <p className="text-3xl font-bold text-foreground">
                  +<AnimatedCounter value={50} /> <span className="text-base font-semibold">coins</span>
                </p>
                <p className="text-[11px] text-muted-foreground">Claim before midnight to keep your streak</p>
              </div>
              <LootButton
                variant="gold"
                size="md"
                fullWidth
                disabled
                leftIcon={<Lock size={14} />}
              >
                Claim Bonus (Placeholder)
              </LootButton>
              <p className="text-[10px] text-muted-foreground">Streak bonus resets if you miss a day</p>
            </GlassCard>
          </div>
        </WidgetCard>
      </section>

      {/* ============ 6. Daily Missions ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Daily Missions"
          description="Quick missions that reset every 24 hours"
          icon={<Target size={18} />}
          action={
            <LootButton variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />} onClick={() => navigate("missions")}>
              All missions
            </LootButton>
          }
          index={0}
        >
          <Grid cols={3}>
            {DAILY_MISSIONS.map((m, i) => (
              <MissionCard key={m.id} mission={m} index={i} period="daily" />
            ))}
          </Grid>
        </WidgetCard>
      </section>

      {/* ============ 7. Weekly Missions ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Weekly Missions"
          description="Bigger missions with bigger payouts — reset every Monday"
          icon={<Trophy size={18} />}
          action={<StatusBadge variant="purple" dot>Resets in 3d 4h</StatusBadge>}
          index={0}
        >
          <Grid cols={3}>
            {WEEKLY_MISSIONS.map((m, i) => (
              <MissionCard key={m.id} mission={m} index={i} period="weekly" />
            ))}
          </Grid>
        </WidgetCard>
      </section>

      {/* ============ 8. Monthly Missions ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Monthly Missions"
          description="Long-haul challenges with the largest rewards"
          icon={<Medal size={18} />}
          action={<StatusBadge variant="gold" dot>Expert tier</StatusBadge>}
          index={0}
        >
          <Grid cols={3}>
            {MONTHLY_MISSIONS.map((m, i) => (
              <MissionCard key={m.id} mission={m} index={i} period="monthly" />
            ))}
          </Grid>
        </WidgetCard>
      </section>

      {/* ============ 9. Achievement Rewards Section ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Achievement Rewards"
          description="Unlock milestones and earn permanent badges"
          icon={<Star size={18} />}
          action={
            <LootButton variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />} onClick={() => navigate("achievements")}>
              View all
            </LootButton>
          }
          glow="purple"
          index={0}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: level + XP */}
            <GlassCard level={3} className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <ProgressRing
                value={levelProgress}
                size={120}
                strokeWidth={10}
                gradient="gold"
                label={`Lv ${level}`}
              />
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Level Progress</p>
                <p className="text-sm font-semibold text-foreground">
                  {xp.toLocaleString("en-IN")} / {xpToNext.toLocaleString("en-IN")} XP
                </p>
                <p className="text-[11px] text-muted-foreground">{levelProgress}% to Level {level + 1}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full mt-1">
                <MiniStatBox icon="Star" accent="gold" label="Level" value={`${level}`} sub="current" />
                <MiniStatBox icon="Trophy" accent="purple" label="Unlocked" value="2" sub="of 6" />
              </div>
            </GlassCard>

            {/* Right: badges grid */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Badges</p>
                <span className="text-xs text-muted-foreground">
                  Completion:{" "}
                  <span className="font-semibold text-foreground">
                    {Math.round((ACHIEVEMENTS.filter((a) => a.unlocked).length / ACHIEVEMENTS.length) * 100)}%
                  </span>
                </span>
              </div>
              <Grid cols={3}>
                {ACHIEVEMENTS.map((a, i) => (
                  <AchievementBadgeCard key={a.id} achievement={a} index={i} />
                ))}
              </Grid>
            </div>
          </div>
        </WidgetCard>
      </section>

      {/* ============ 10. Referral Rewards Section ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Referral Rewards"
          description="Invite friends and earn when they join and earn"
          icon={<Users size={18} />}
          action={
            <LootButton variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />} onClick={() => navigate("referral")}>
              Open referral
            </LootButton>
          }
          glow="cyan"
          index={0}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Referral code box */}
            <GlassCard level={3} className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <IconBadge name="Ticket" accent="emerald" size="lg" />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Referral Code</p>
                <div className="inline-flex items-center gap-2 rounded-xl glass-2 ring-1 ring-border px-4 py-2.5">
                  <Hash size={16} className="text-emerald-brand" />
                  <span className="text-lg font-bold text-foreground tracking-wider">{referralCode}</span>
                  <button
                    className="size-7 rounded-md hover:bg-accent flex items-center justify-center transition-colors"
                    aria-label="Copy referral code"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard.writeText(referralCode).catch(() => {});
                      }
                    }}
                  >
                    <Copy size={13} className="text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">Earn 200 coins per friend who joins</p>
              </div>
              <LootButton
                variant="emerald"
                size="md"
                fullWidth
                disabled
                leftIcon={<Lock size={14} />}
              >
                Share Code (Placeholder)
              </LootButton>
            </GlassCard>

            {/* Referral stats */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MiniStatBox icon="Users" accent="emerald" label="Friends Joined" value="5" sub="all-time" />
              <MiniStatBox icon="Clock" accent="gold" label="Pending Rewards" value="320" sub="coins" />
              <MiniStatBox icon="Coins" accent="electric" label="Total Earned" value="1,240" sub="coins" />
              <GlassCard level={3} className="col-span-2 sm:col-span-3 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Next Referral Milestone</span>
                  <span className="text-muted-foreground">5 / 10 friends</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "50%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--emerald-brand),var(--cyan-brand))]"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Refer <span className="text-emerald-brand font-semibold">5 more friends</span> to unlock +500 bonus coins.
                </p>
              </GlassCard>
            </div>
          </div>
        </WidgetCard>
      </section>

      {/* ============ 11. Event Center ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Event Center"
          description="Limited-time events, festivals, and special campaigns"
          icon={<PartyPopper size={18} />}
          action={<StatusBadge variant="success" dot pulse>3 live events</StatusBadge>}
          glow="purple"
          index={0}
        >
          <Grid cols={3}>
            {EVENTS.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </Grid>
        </WidgetCard>
      </section>

      {/* ============ 12. Reward History Preview ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Reward History"
          description="Recent completed earning activities"
          icon={<Clock size={18} />}
          action={
            <LootButton variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />} onClick={() => navigate("history")}>
              View history
            </LootButton>
          }
          index={0}
        >
          <div className="space-y-3">
            <SkeletonRow count={4} />
            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                <Info size={12} /> Full history table loads once you complete an activity.
              </p>
              <LootButton variant="outline" size="sm" onClick={() => navigate("history")} rightIcon={<ChevronRight size={14} />}>
                Open history
              </LootButton>
            </div>
          </div>
        </WidgetCard>
      </section>

      {/* ============ 13. Earn Analytics ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Earn Analytics"
          description="Track your earnings performance over time"
          icon={<TrendingUp size={18} />}
          action={
            <div className="inline-flex rounded-lg glass-2 ring-1 ring-border p-0.5">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setAnalyticsPeriod(p)}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all capitalize",
                    analyticsPeriod === p
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          }
          index={0}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Bar chart - daily/weekly earnings */}
            <GlassCard level={3} className="p-4 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {analyticsPeriod === "daily" ? "Daily Earnings" : analyticsPeriod === "weekly" ? "Weekly Earnings" : "Monthly Earnings"}
                </p>
                <span className="text-xs text-muted-foreground">in coins</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="earnBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.62 0.22 255)" />
                        <stop offset="100%" stopColor="oklch(0.72 0.15 200)" />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      width={40}
                    />
                    <Tooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
                    <Bar dataKey="value" fill="url(#earnBar)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Pie chart - distribution by source */}
            <GlassCard level={3} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Activity Distribution</p>
                <span className="text-xs text-muted-foreground">by source</span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ANALYTICS_DISTRIBUTION}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={36}
                      outerRadius={64}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {ANALYTICS_DISTRIBUTION.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {ANALYTICS_DISTRIBUTION.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                    <span className="size-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="text-foreground font-semibold tabular-nums ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Area chart - weekly trend */}
            <GlassCard level={3} className="p-4 lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Weekly Trend Comparison
                </p>
                <span className="text-xs text-muted-foreground">last 6 weeks</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ANALYTICS_WEEKLY} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="earnArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.62 0.22 255 / 0.45)" />
                        <stop offset="100%" stopColor="oklch(0.62 0.22 255 / 0)" />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      width={40}
                    />
                    <Tooltip cursor={{ stroke: "var(--electric)", strokeWidth: 1 }} content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="oklch(0.62 0.22 255)"
                      strokeWidth={2.5}
                      fill="url(#earnArea)"
                      dot={{ r: 3, fill: "oklch(0.62 0.22 255)", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </WidgetCard>
      </section>

      {/* ============ 14. Tips & Recommendations ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Tips & Recommendations"
          description="Optimize your earning strategy"
          icon={<Lightbulb size={18} />}
          index={0}
        >
          <Grid cols={4}>
            {TIPS.map((t, i) => (
              <TipCard key={t.id} tip={t} index={i} />
            ))}
          </Grid>
        </WidgetCard>
      </section>

      {/* ============ 15. Empty / Error state demo ============ */}
      <section className="mb-4">
        <WidgetCard
          title="States Preview"
          description="Reusable empty and error states ready for production use"
          icon={<Info size={18} />}
          action={
            <LootButton
              variant="ghost"
              size="sm"
              onClick={() => setShowEmptyDemo((v) => !v)}
              rightIcon={<ChevronRight size={14} className={cn("transition-transform", showEmptyDemo && "rotate-90")} />}
            >
              {showEmptyDemo ? "Hide" : "Show"} states
            </LootButton>
          }
          index={0}
        >
          {showEmptyDemo ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <NoActivitiesEmpty onRetry={() => {}} />
              <EarnUnavailableError onRetry={() => {}} />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              Both <code className="text-foreground font-mono">NoActivitiesEmpty</code> and{" "}
              <code className="text-foreground font-mono">EarnUnavailableError</code> are defined in this file and ready to use.
            </p>
          )}
        </WidgetCard>
      </section>
    </PageContainer>
  );
}

/* ============================================================
   Small in-file primitives
   ============================================================ */
function MiniStat({
  icon,
  label,
  value,
  accent,
  locked,
  lockLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: Accent;
  locked?: boolean;
  lockLabel?: string;
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
    <GlassCard level={3} className="p-3 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide", accentText[accent])}>
          {icon}
          {label}
        </span>
        {locked && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-muted-foreground/70">
            <Lock size={9} /> {lockLabel}
          </span>
        )}
      </div>
      <span className="text-sm font-bold text-foreground tabular-nums">{value}</span>
    </GlassCard>
  );
}

function MiniStatBox({
  icon,
  accent,
  label,
  value,
  sub,
}: {
  icon: string;
  accent: Accent;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <GlassCard level={3} className="p-3 flex items-center gap-3">
      <IconBadge name={icon} accent={accent} size="md" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium truncate">{label}</p>
        <p className="text-base font-bold text-foreground tabular-nums leading-tight">
          {value} <span className="text-[10px] font-medium text-muted-foreground">{sub}</span>
        </p>
      </div>
    </GlassCard>
  );
}
