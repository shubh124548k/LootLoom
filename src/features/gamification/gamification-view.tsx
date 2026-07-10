"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Trophy,
  Crown,
  Star,
  Medal,
  Flame,
  Target,
  Users,
  Gift,
  Zap,
  Award,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Lock,
  Sparkles,
  Rocket,
  Coins,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Heart,
  Diamond,
  PartyPopper,
  Clock,
  ArrowUpRight,
  Info,
  UserPlus,
  QrCode,
  Contact,
  Mail,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  Hash,
  Globe,
  Wifi,
  Wallet,
  Snowflake,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
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
  EmptyState,
  ErrorState,
  SkeletonRow,
} from "@/components/lootloom";
import { useNavigationStore, useUserStore, useWalletStore } from "@/stores";
import {
  cardReveal,
  staggerContainer,
  hoverLift,
  floating,
  floatingSmall,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Types & Helpers
   ============================================================ */

type Accent =
  | "electric"
  | "cyan"
  | "purple"
  | "gold"
  | "emerald"
  | "rose"
  | "navy";

type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "limited"
  | "seasonal"
  | "founder"
  | "vip";

type Difficulty = "beginner" | "intermediate" | "advanced" | "expert" | "legendary";
type AchievementCategory =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert"
  | "Legendary"
  | "Seasonal"
  | "Special Event"
  | "VIP";

interface AchievementItem {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: AchievementCategory;
  difficulty: Difficulty;
  xpReward: number;
  coinReward: number;
  progress: number; // 0-100
  unlocked: boolean;
  claimed: boolean;
  accent: Accent;
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  rarity: Rarity;
  unlocked: boolean;
  date?: string;
}

interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  type: "Daily" | "Weekly" | "Monthly" | "Special" | "Community" | "Tournament";
  progress: number;
  xpReward: number;
  coinReward: number;
  icon: LucideIcon;
  accent: Accent;
  locked?: boolean;
  endsIn: string;
}

interface MilestoneItem {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
  icon: LucideIcon;
  accent: Accent;
  reward: string;
}

interface LeaderboardUser {
  id: string;
  rank: number;
  username: string;
  level: number;
  xp: number;
  coins: number;
  achievements: number;
  country?: string;
  trend: "up" | "down" | "same";
}

interface FriendItem {
  id: string;
  name: string;
  level: number;
  xp: number;
  weeklyProgress: number;
  rank: number;
  online: boolean;
}

interface ActivityFeedItem {
  id: string;
  type: "achievement" | "referral" | "levelup" | "badge" | "leaderboard" | "challenge" | "event";
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  accent: Accent;
}

interface RewardShowcaseItem {
  id: string;
  name: string;
  type: "Upcoming" | "Locked" | "Recommended" | "Achievement" | "Referral";
  description: string;
  cost: number;
  icon: LucideIcon;
  accent: Accent;
  locked?: boolean;
}

const accentMap: Record<Accent, { bg: string; text: string; ring: string; from: string; to: string }> = {
  electric: { bg: "bg-electric/10", text: "text-electric", ring: "ring-electric/20", from: "from-electric/20", to: "to-cyan-brand/10" },
  cyan: { bg: "bg-cyan/10", text: "text-cyan-brand", ring: "ring-cyan-brand/20", from: "from-cyan/20", to: "to-electric/10" },
  purple: { bg: "bg-purple/10", text: "text-purple-brand", ring: "ring-purple-brand/20", from: "from-purple/20", to: "to-electric/10" },
  gold: { bg: "bg-gold/15", text: "text-gold", ring: "ring-gold/25", from: "from-gold/20", to: "to-yellow-200/10" },
  emerald: { bg: "bg-emerald-brand/10", text: "text-emerald-brand", ring: "ring-emerald-brand/20", from: "from-emerald-brand/20", to: "to-cyan/10" },
  rose: { bg: "bg-rose-brand/10", text: "text-rose-brand", ring: "ring-rose-brand/20", from: "from-rose-brand/20", to: "to-purple/10" },
  navy: { bg: "bg-navy/10", text: "text-navy", ring: "ring-navy/20", from: "from-navy/20", to: "to-electric/10" },
};

const rarityStyles: Record<Rarity, { label: string; ring: string; text: string; bg: string; glow: string }> = {
  common: { label: "Common", ring: "ring-slate-300", text: "text-slate-600", bg: "bg-slate-100", glow: "" },
  uncommon: { label: "Uncommon", ring: "ring-emerald-300", text: "text-emerald-700", bg: "bg-emerald-100", glow: "" },
  rare: { label: "Rare", ring: "ring-cyan-brand/40", text: "text-cyan-700", bg: "bg-cyan-100", glow: "shadow-[0_0_22px_-4px_oklch(0.72_0.15_200/0.4)]" },
  epic: { label: "Epic", ring: "ring-purple-brand/40", text: "text-purple-700", bg: "bg-purple-100", glow: "shadow-[0_0_22px_-4px_oklch(0.6_0.22_295/0.45)]" },
  legendary: { label: "Legendary", ring: "ring-gold/50", text: "text-gold", bg: "bg-gold/15", glow: "shadow-[0_0_24px_-2px_oklch(0.8_0.16_85/0.55)]" },
  limited: { label: "Limited", ring: "ring-rose-brand/40", text: "text-rose-700", bg: "bg-rose-100", glow: "shadow-[0_0_22px_-4px_oklch(0.62_0.24_15/0.5)]" },
  seasonal: { label: "Seasonal", ring: "ring-emerald-brand/40", text: "text-emerald-700", bg: "bg-emerald-100", glow: "" },
  founder: { label: "Founder", ring: "ring-electric/40", text: "text-electric", bg: "bg-electric/10", glow: "shadow-[0_0_24px_-2px_oklch(0.62_0.22_255/0.5)]" },
  vip: { label: "VIP", ring: "ring-gold/60", text: "text-gold", bg: "bg-gradient-to-br from-gold/20 to-purple-brand/10", glow: "shadow-[0_0_28px_-2px_oklch(0.8_0.16_85/0.6)]" },
};

const difficultyStyles: Record<Difficulty, { label: string; variant: "default" | "info" | "cyan" | "purple" | "gold" }> = {
  beginner: { label: "Beginner", variant: "default" },
  intermediate: { label: "Intermediate", variant: "info" },
  advanced: { label: "Advanced", variant: "cyan" },
  expert: { label: "Expert", variant: "purple" },
  legendary: { label: "Legendary", variant: "gold" },
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* no-op */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return { copied, copy };
}

/* ============================================================
   Placeholder Data
   ============================================================ */

const ACHIEVEMENTS: AchievementItem[] = [
  { id: "a1", name: "First Steps", description: "Complete your first earning activity", icon: Target, category: "Beginner", difficulty: "beginner", xpReward: 50, coinReward: 20, progress: 100, unlocked: true, claimed: true, accent: "electric" },
  { id: "a2", name: "Streak Keeper", description: "Maintain a 7-day daily streak", icon: Flame, category: "Beginner", difficulty: "intermediate", xpReward: 120, coinReward: 80, progress: 100, unlocked: true, claimed: false, accent: "rose" },
  { id: "a3", name: "Coin Collector", description: "Earn 10,000 lifetime coins", icon: Coins, category: "Intermediate", difficulty: "intermediate", xpReward: 250, coinReward: 150, progress: 78, unlocked: false, claimed: false, accent: "gold" },
  { id: "a4", name: "Social Butterfly", description: "Invite 10 friends to LootLoom", icon: Users, category: "Intermediate", difficulty: "advanced", xpReward: 300, coinReward: 200, progress: 60, unlocked: false, claimed: false, accent: "cyan" },
  { id: "a5", name: "Mission Master", description: "Complete 50 missions", icon: Target, category: "Advanced", difficulty: "advanced", xpReward: 500, coinReward: 350, progress: 42, unlocked: false, claimed: false, accent: "purple" },
  { id: "a6", name: "Legendary Earner", description: "Reach Level 25", icon: Crown, category: "Legendary", difficulty: "legendary", xpReward: 1500, coinReward: 1000, progress: 28, unlocked: false, claimed: false, accent: "gold" },
  { id: "a7", name: "Leaderboard Legend", description: "Reach top 10 globally", icon: Trophy, category: "Expert", difficulty: "expert", xpReward: 800, coinReward: 600, progress: 35, unlocked: false, claimed: false, accent: "emerald" },
  { id: "a8", name: "Winter Champion", description: "Complete Winter 2025 season pass", icon: Snowflake, category: "Seasonal", difficulty: "advanced", xpReward: 600, coinReward: 400, progress: 15, unlocked: false, claimed: false, accent: "cyan" },
  { id: "a9", name: "Anniversary Star", description: "Celebrate LootLoom 1st anniversary", icon: Sparkles, category: "Special Event", difficulty: "intermediate", xpReward: 400, coinReward: 250, progress: 0, unlocked: false, claimed: false, accent: "purple" },
  { id: "a10", name: "VIP Elite", description: "Unlock VIP tier with premium perks", icon: Diamond, category: "VIP", difficulty: "legendary", xpReward: 2500, coinReward: 2000, progress: 0, unlocked: false, claimed: false, accent: "gold" },
];

const ACHIEVEMENT_CATEGORIES: (AchievementCategory | "All")[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
  "Legendary",
  "Seasonal",
  "Special Event",
  "VIP",
];

const BADGES: BadgeItem[] = [
  { id: "b1", name: "Welcome Aboard", description: "Joined LootLoom", icon: Rocket, rarity: "common", unlocked: true, date: "Jan 2024" },
  { id: "b2", name: "First Earn", description: "Earned first 100 coins", icon: Coins, rarity: "common", unlocked: true, date: "Jan 2024" },
  { id: "b3", name: "Streak Rookie", description: "3-day streak", icon: Flame, rarity: "uncommon", unlocked: true, date: "Feb 2024" },
  { id: "b4", name: "Social Star", description: "Invited 5 friends", icon: Users, rarity: "rare", unlocked: true, date: "Mar 2024" },
  { id: "b5", name: "Mission Pro", description: "Completed 25 missions", icon: Target, rarity: "rare", unlocked: true, date: "Apr 2024" },
  { id: "b6", name: "Coin Hoarder", description: "Earned 5,000 coins", icon: Coins, rarity: "epic", unlocked: true, date: "May 2024" },
  { id: "b7", name: "Streak Master", description: "30-day streak", icon: Flame, rarity: "epic", unlocked: false },
  { id: "b8", name: "Champion", description: "Top 50 globally", icon: Trophy, rarity: "legendary", unlocked: false },
  { id: "b9", name: "Winter Hero", description: "Completed Winter season", icon: Snowflake, rarity: "seasonal", unlocked: false },
  { id: "b10", name: "Founder", description: "Early LootLoom adopter", icon: Crown, rarity: "founder", unlocked: true, date: "Jan 2024" },
  { id: "b11", name: "Lucky Seven", description: "7-day streak special", icon: Sparkles, rarity: "limited", unlocked: false },
  { id: "b12", name: "VIP Member", description: "VIP tier unlocked", icon: Diamond, rarity: "vip", unlocked: false },
];

const LEVEL_MILESTONES = [
  { level: 5, label: "Bronze Tier", reward: "100 coins + Bronze badge", icon: Medal, reached: true, accent: "rose" as Accent },
  { level: 10, label: "Silver Tier", reward: "500 coins + Silver badge + 5% earn boost", icon: Medal, reached: false, accent: "cyan" as Accent },
  { level: 15, label: "Gold Tier", reward: "1,500 coins + Gold badge + 10% boost", icon: Crown, reached: false, accent: "gold" as Accent },
  { level: 25, label: "Platinum Tier", reward: "5,000 coins + Premium rewards", icon: Crown, reached: false, accent: "purple" as Accent },
  { level: 50, label: "Diamond Prestige", reward: "20,000 coins + VIP status + Exclusive perks", icon: Diamond, reached: false, accent: "electric" as Accent },
];

const LEADERBOARD_USERS: LeaderboardUser[] = [
  { id: "u1", rank: 1, username: "AuroraQueen", level: 47, xp: 184200, coins: 284500, achievements: 28, country: "🇮🇳", trend: "same" },
  { id: "u2", rank: 2, username: "NightFalcon", level: 45, xp: 178400, coins: 256800, achievements: 26, country: "🇺🇸", trend: "up" },
  { id: "u3", rank: 3, username: "PixelStorm", level: 43, xp: 162800, coins: 235400, achievements: 25, country: "🇯🇵", trend: "down" },
  { id: "u4", rank: 4, username: "ThunderBolt", level: 41, xp: 154200, coins: 218900, achievements: 24, country: "🇧🇷", trend: "up" },
  { id: "u5", rank: 5, username: "CosmicByte", level: 39, xp: 142800, coins: 198200, achievements: 23, country: "🇩🇪", trend: "same" },
  { id: "u6", rank: 6, username: "NeonRider", level: 38, xp: 136400, coins: 184700, achievements: 22, country: "🇬🇧", trend: "up" },
  { id: "u7", rank: 7, username: "SolarFlare", level: 37, xp: 128900, coins: 172300, achievements: 21, country: "🇨🇦", trend: "down" },
  { id: "u8", rank: 8, username: "QuantumLeap", level: 36, xp: 121400, coins: 162800, achievements: 20, country: "🇦🇺", trend: "up" },
  { id: "u9", rank: 9, username: "PhoenixRise", level: 35, xp: 115800, coins: 154200, achievements: 19, country: "🇫🇷", trend: "same" },
  { id: "u10", rank: 10, username: "VelocityX", level: 34, xp: 108900, coins: 145800, achievements: 18, country: "🇮🇳", trend: "up" },
  { id: "u11", rank: 11, username: "MysticWolf", level: 33, xp: 102400, coins: 138200, achievements: 17, country: "🇪🇸", trend: "down" },
  { id: "u12", rank: 12, username: "CrimsonEdge", level: 32, xp: 96800, coins: 128900, achievements: 17, country: "🇮🇹", trend: "up" },
  { id: "u13", rank: 13, username: "ShadowByte", level: 31, xp: 91400, coins: 121400, achievements: 16, country: "🇰🇷", trend: "same" },
  { id: "u14", rank: 14, username: "EmberFox", level: 30, xp: 86800, coins: 114200, achievements: 15, country: "🇲🇽", trend: "up" },
  { id: "u15", rank: 15, username: "FrostKing", level: 29, xp: 82400, coins: 108900, achievements: 15, country: "🇸🇪", trend: "down" },
];

const REFERRAL_TOP: LeaderboardUser[] = [
  { id: "r1", rank: 1, username: "NetworkKing", level: 42, xp: 168400, coins: 245800, achievements: 24, country: "🇮🇳", trend: "same" },
  { id: "r2", rank: 2, username: "ConnectorPro", level: 39, xp: 152800, coins: 218400, achievements: 22, country: "🇺🇸", trend: "up" },
  { id: "r3", rank: 3, username: "SocialGenius", level: 37, xp: 142200, coins: 198700, achievements: 21, country: "🇧🇷", trend: "down" },
];

const FRIENDS: FriendItem[] = [
  { id: "f1", name: "Maya Sharma", level: 14, xp: 6800, weeklyProgress: 78, rank: 348, online: true },
  { id: "f2", name: "Arjun Mehta", level: 11, xp: 4200, weeklyProgress: 52, rank: 612, online: false },
  { id: "f3", name: "Sara Khan", level: 18, xp: 9400, weeklyProgress: 92, rank: 245, online: true },
  { id: "f4", name: "Leo Costa", level: 9, xp: 2800, weeklyProgress: 34, rank: 824, online: false },
  { id: "f5", name: "Priya Verma", level: 22, xp: 12800, weeklyProgress: 64, rank: 187, online: true },
];

const CHALLENGES: ChallengeItem[] = [
  { id: "c1", title: "Daily Grind", description: "Complete 3 earning activities today", type: "Daily", progress: 67, xpReward: 80, coinReward: 50, icon: Target, accent: "electric", endsIn: "8h 24m" },
  { id: "c2", title: "Weekly Warrior", description: "Earn 1,000 coins this week", type: "Weekly", progress: 42, xpReward: 250, coinReward: 180, icon: Zap, accent: "cyan", endsIn: "3d 12h" },
  { id: "c3", title: "Monthly Master", description: "Reach Level 8 by month end", type: "Monthly", progress: 88, xpReward: 600, coinReward: 400, icon: Crown, accent: "purple", endsIn: "12d 6h" },
  { id: "c4", title: "Festival Frenzy", description: "Earn 5,000 coins during festival", type: "Special", progress: 18, xpReward: 1200, coinReward: 800, icon: PartyPopper, accent: "gold", endsIn: "5d 18h" },
  { id: "c5", title: "Community Quest", description: "Help community earn 1M coins together", type: "Community", progress: 73, xpReward: 400, coinReward: 300, icon: Users, accent: "emerald", endsIn: "9d 2h" },
  { id: "c6", title: "Grand Tournament", description: "Compete for top 3 globally", type: "Tournament", progress: 0, xpReward: 5000, coinReward: 3000, icon: Trophy, accent: "rose", locked: true, endsIn: "Coming soon" },
];

const MILESTONES: MilestoneItem[] = [
  { id: "m1", label: "100 Coins Earned", target: 100, current: 100, unit: "coins", icon: Coins, accent: "electric", reward: "Bronze Badge" },
  { id: "m2", label: "500 Coins Earned", target: 500, current: 500, unit: "coins", icon: Coins, accent: "cyan", reward: "Silver Badge" },
  { id: "m3", label: "1,000 Coins Earned", target: 1000, current: 1000, unit: "coins", icon: Coins, accent: "purple", reward: "Gold Badge + 50 bonus coins" },
  { id: "m4", label: "5,000 Coins Earned", target: 5000, current: 5000, unit: "coins", icon: Coins, accent: "gold", reward: "Platinum Badge + 200 bonus" },
  { id: "m5", label: "10,000 Coins Earned", target: 10000, current: 8240, unit: "coins", icon: Coins, accent: "emerald", reward: "Diamond Badge + 500 bonus" },
  { id: "m6", label: "First Referral", target: 1, current: 1, unit: "referrals", icon: Users, accent: "rose", reward: "200 coins + Social Badge" },
  { id: "m7", label: "10 Referrals", target: 10, current: 6, unit: "referrals", icon: Users, accent: "navy", reward: "1,000 coins + Referral Master Badge" },
  { id: "m8", label: "30-Day Streak", target: 30, current: 12, unit: "days", icon: Flame, accent: "rose", reward: "Streak Master Badge + 500 coins" },
];

const ACTIVITY_FEED: ActivityFeedItem[] = [
  { id: "af1", type: "achievement", title: "Achievement Unlocked", description: "You unlocked 'Streak Keeper' — 120 XP earned", time: "12 min ago", icon: Award, accent: "gold" },
  { id: "af2", type: "referral", title: "Referral Joined", description: "Maya Sharma joined using your code — +200 coins", time: "1 hour ago", icon: Users, accent: "cyan" },
  { id: "af3", type: "levelup", title: "Level Up!", description: "You reached Level 7 — new rewards unlocked", time: "3 hours ago", icon: Zap, accent: "electric" },
  { id: "af4", type: "badge", title: "Badge Earned", description: "You earned the 'Mission Pro' Rare badge", time: "5 hours ago", icon: Medal, accent: "purple" },
  { id: "af5", type: "leaderboard", title: "Leaderboard Promotion", description: "You climbed 18 spots in the global ranking", time: "Yesterday", icon: TrendingUp, accent: "emerald" },
  { id: "af6", type: "challenge", title: "Challenge Completed", description: "Daily Grind challenge done — 50 coins added", time: "Yesterday", icon: Target, accent: "rose" },
  { id: "af7", type: "event", title: "Event Reward Pending", description: "Winter Festival reward will unlock in 5 days", time: "2 days ago", icon: Calendar, accent: "navy" },
];

const REWARD_SHOWCASE: RewardShowcaseItem[] = [
  { id: "rs1", name: "₹100 UPI Cash", type: "Recommended", description: "Instant UPI redemption to your wallet", cost: 1000, icon: Coins, accent: "electric" },
  { id: "rs2", name: "Premium Avatar Pack", type: "Upcoming", description: "Exclusive animated avatars for Level 10+", cost: 2500, icon: Sparkles, accent: "purple" },
  { id: "rs3", name: "VIP Status (30 days)", type: "Locked", description: "Unlock when you reach Level 25", cost: 10000, icon: Crown, accent: "gold", locked: true },
  { id: "rs4", name: "Legendary Badge Pack", type: "Achievement", description: "Reward for completing 50 missions", cost: 0, icon: Award, accent: "rose" },
  { id: "rs5", name: "Bonus Referral Coins", type: "Referral", description: "Earn 200 coins per successful referral", cost: 0, icon: Users, accent: "cyan" },
];

// chart datasets (placeholder)
const XP_GROWTH_DATA = [
  { label: "W1", xp: 400 },
  { label: "W2", xp: 980 },
  { label: "W3", xp: 1820 },
  { label: "W4", xp: 2840 },
  { label: "W5", xp: 3920 },
  { label: "W6", xp: 5280 },
  { label: "W7", xp: 7140 },
  { label: "W8", xp: 9320 },
];

const REFERRAL_GROWTH_DATA = [
  { label: "Jan", referrals: 0 },
  { label: "Feb", referrals: 2 },
  { label: "Mar", referrals: 5 },
  { label: "Apr", referrals: 9 },
  { label: "May", referrals: 12 },
  { label: "Jun", referrals: 18 },
  { label: "Jul", referrals: 24 },
];

const LEVEL_PROGRESS_DATA = [
  { label: "L1", value: 100 },
  { label: "L2", value: 100 },
  { label: "L3", value: 100 },
  { label: "L4", value: 100 },
  { label: "L5", value: 100 },
  { label: "L6", value: 100 },
  { label: "L7", value: 71 },
  { label: "L8", value: 0 },
];

const LEADERBOARD_HISTORY_DATA = [
  { label: "W1", rank: 580 },
  { label: "W2", rank: 520 },
  { label: "W3", rank: 460 },
  { label: "W4", rank: 380 },
  { label: "W5", rank: 290 },
  { label: "W6", rank: 210 },
  { label: "W7", rank: 165 },
  { label: "W8", rank: 142 },
];

const ACHIEVEMENT_DISTRIBUTION = [
  { name: "Beginner", value: 2, color: "oklch(0.7 0.17 160)" },
  { name: "Intermediate", value: 3, color: "oklch(0.72 0.15 200)" },
  { name: "Advanced", value: 2, color: "oklch(0.6 0.22 295)" },
  { name: "Expert", value: 1, color: "oklch(0.8 0.16 85)" },
  { name: "Legendary", value: 1, color: "oklch(0.62 0.24 15)" },
];

const DAILY_STREAK_DAYS = [
  { day: "Mon", dayNum: 22, status: "claimed", reward: 20 },
  { day: "Tue", dayNum: 23, status: "claimed", reward: 30 },
  { day: "Wed", dayNum: 24, status: "claimed", reward: 40 },
  { day: "Thu", dayNum: 25, status: "claimed", reward: 50 },
  { day: "Fri", dayNum: 26, status: "claimed", reward: 60 },
  { day: "Sat", dayNum: 27, status: "today", reward: 100 },
  { day: "Sun", dayNum: 28, status: "locked", reward: 150 },
];

// Monthly calendar grid — current week marker
const MONTH_GRID: { date: number; state: "claimed" | "today" | "missed" | "future" }[] = [
  { date: 1, state: "claimed" }, { date: 2, state: "claimed" }, { date: 3, state: "missed" },
  { date: 4, state: "claimed" }, { date: 5, state: "claimed" }, { date: 6, state: "claimed" }, { date: 7, state: "claimed" },
  { date: 8, state: "claimed" }, { date: 9, state: "claimed" }, { date: 10, state: "missed" },
  { date: 11, state: "claimed" }, { date: 12, state: "claimed" }, { date: 13, state: "claimed" }, { date: 14, state: "claimed" },
  { date: 15, state: "claimed" }, { date: 16, state: "claimed" }, { date: 17, state: "claimed" },
  { date: 18, state: "claimed" }, { date: 19, state: "claimed" }, { date: 20, state: "claimed" }, { date: 21, state: "claimed" },
  { date: 22, state: "claimed" }, { date: 23, state: "claimed" }, { date: 24, state: "claimed" },
  { date: 25, state: "claimed" }, { date: 26, state: "claimed" }, { date: 27, state: "today" }, { date: 28, state: "future" },
];

const LEADERBOARD_TABS = ["Global", "Friends", "Weekly", "Monthly", "Lifetime", "Country", "Region"] as const;
type LeaderboardTab = (typeof LEADERBOARD_TABS)[number];

/* ============================================================
   Reusable Helper Components
   ============================================================ */

interface AchievementCardProps {
  achievement: AchievementItem;
  index?: number;
}

interface User {
  level: number;
  xp: number;
  xpToNext: number;
  rank: number;
  dailyStreak: number;
  referralCode: string;
  username: string;
}

function AchievementCard({ achievement, index = 0 }: AchievementCardProps) {
  const a = accentMap[achievement.accent];
  const Icon = achievement.icon;
  const diff = difficultyStyles[achievement.difficulty];
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={hoverLift.whileHover}
      className={cn(
        "h-full rounded-2xl p-5 ring-1 ring-border relative overflow-hidden",
        "bg-gradient-to-br", a.from, a.to,
        achievement.unlocked && "shadow-[0_8px_28px_-12px_oklch(0.62_0.22_255/0.35)]"
      )}
    >
      {/* sheen */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
      <div className="relative flex items-start justify-between gap-3 mb-3">
        <div className={cn("size-12 rounded-xl ring-1 flex items-center justify-center", a.bg, a.text, a.ring)}>
          <Icon size={24} />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge variant={diff.variant}>{diff.label}</StatusBadge>
          {achievement.unlocked ? (
            achievement.claimed ? (
              <StatusBadge variant="success" dot>Claimed</StatusBadge>
            ) : (
              <StatusBadge variant="gold" dot pulse>Claim +{achievement.coinReward}</StatusBadge>
            )
          ) : (
            <StatusBadge variant="default" dot>Locked</StatusBadge>
          )}
        </div>
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{achievement.name}</h4>
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 min-h-[2rem]">{achievement.description}</p>
      <div className="flex items-center gap-4">
        <ProgressRing
          value={achievement.progress}
          size={56}
          strokeWidth={6}
          gradient={achievement.accent === "navy" ? "electric" : (achievement.accent as "electric" | "cyan" | "purple" | "gold" | "emerald")}
          showLabel
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Zap size={12} className="text-electric" />
            <span className="font-semibold text-foreground">+{achievement.xpReward}</span>
            <span className="text-muted-foreground">XP</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Coins size={12} className="text-gold" />
            <span className="font-semibold text-foreground">+{achievement.coinReward}</span>
            <span className="text-muted-foreground">coins</span>
          </div>
          {!achievement.unlocked && (
            <p className="text-[10px] text-muted-foreground pt-0.5">{achievement.progress}% complete</p>
          )}
        </div>
      </div>
      {achievement.unlocked && !achievement.claimed && (
        <LootButton size="sm" variant="gold" fullWidth className="mt-4" leftIcon={<Gift size={14} />}>
          Claim Reward
        </LootButton>
      )}
      {achievement.unlocked && achievement.claimed && (
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-emerald-brand font-semibold py-1.5 rounded-lg bg-emerald-brand/10 ring-1 ring-emerald-brand/20">
          <Check size={14} /> Reward Claimed
        </div>
      )}
      {!achievement.unlocked && (
        <LootButton size="sm" variant="glass" fullWidth className="mt-4" disabled leftIcon={<Lock size={14} />}>
          Locked
        </LootButton>
      )}
    </motion.div>
  );
}

interface BadgeCardProps {
  badge: BadgeItem;
  index?: number;
}

function BadgeCard({ badge, index = 0 }: BadgeCardProps) {
  const r = rarityStyles[badge.rarity];
  const Icon = badge.icon;
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={hoverLift.whileHover}
      className={cn(
        "relative rounded-2xl p-4 ring-1 text-center overflow-hidden bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-sm",
        r.ring,
        r.glow,
        !badge.unlocked && "opacity-60"
      )}
    >
      {badge.unlocked && (
        <div className="absolute inset-0 pointer-events-none shimmer-bg opacity-60" />
      )}
      <div className="relative flex flex-col items-center gap-2">
        <div className={cn("size-14 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-background", r.bg, r.text, r.ring)}>
          {badge.unlocked ? <Icon size={26} /> : <Lock size={22} className="text-muted-foreground" />}
        </div>
        <h4 className="text-xs font-semibold text-foreground leading-tight">{badge.name}</h4>
        <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2 min-h-[1.5rem]">{badge.description}</p>
        <StatusBadge variant={badge.unlocked ? "success" : "default"} className="text-[10px]">
          {r.label}
        </StatusBadge>
        {badge.unlocked && badge.date && (
          <p className="text-[10px] text-muted-foreground">{badge.date}</p>
        )}
      </div>
    </motion.div>
  );
}

interface ChallengeCardProps {
  challenge: ChallengeItem;
  index?: number;
}

function ChallengeCard({ challenge, index = 0 }: ChallengeCardProps) {
  const a = accentMap[challenge.accent];
  const Icon = challenge.icon;
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={hoverLift.whileHover}
      className={cn(
        "h-full rounded-2xl p-5 ring-1 ring-border relative overflow-hidden bg-gradient-to-br",
        a.from, a.to
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={cn("size-11 rounded-xl ring-1 flex items-center justify-center", a.bg, a.text, a.ring)}>
          <Icon size={22} />
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge variant={challenge.accent === "gold" ? "gold" : challenge.accent === "rose" ? "error" : "info"}>
            {challenge.type}
          </StatusBadge>
          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
            <Clock size={10} /> {challenge.endsIn}
          </span>
        </div>
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{challenge.title}</h4>
      <p className="text-xs text-muted-foreground mb-4 min-h-[2rem]">{challenge.description}</p>
      <div className="flex items-center gap-4">
        <ProgressRing
          value={challenge.progress}
          size={56}
          strokeWidth={6}
          gradient={challenge.accent === "navy" ? "electric" : (challenge.accent as "electric" | "cyan" | "purple" | "gold" | "emerald")}
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Zap size={12} className="text-electric" />
            <span className="font-semibold text-foreground">+{challenge.xpReward}</span>
            <span className="text-muted-foreground">XP</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Coins size={12} className="text-gold" />
            <span className="font-semibold text-foreground">+{challenge.coinReward}</span>
            <span className="text-muted-foreground">coins</span>
          </div>
        </div>
      </div>
      <LootButton
        size="sm"
        variant={challenge.locked ? "glass" : "electric"}
        fullWidth
        className="mt-4"
        disabled={challenge.locked || challenge.progress >= 100}
        leftIcon={challenge.locked ? <Lock size={14} /> : challenge.progress >= 100 ? <Check size={14} /> : <Target size={14} />}
      >
        {challenge.locked ? "Locked" : challenge.progress >= 100 ? "Completed" : "Join Challenge"}
      </LootButton>
    </motion.div>
  );
}

interface MilestoneCardProps {
  milestone: MilestoneItem;
  index?: number;
}

function MilestoneCard({ milestone, index = 0 }: MilestoneCardProps) {
  const a = accentMap[milestone.accent];
  const Icon = milestone.icon;
  const reached = milestone.current >= milestone.target;
  const pct = Math.min(100, (milestone.current / milestone.target) * 100);
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className={cn(
        "relative pl-12 pb-6",
        index !== MILESTONES.length - 1 && "before:absolute before:left-[18px] before:top-9 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-border before:to-transparent"
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 size-9 rounded-xl ring-1 flex items-center justify-center",
        reached ? cn(a.bg, a.text, a.ring) : "bg-muted text-muted-foreground ring-border"
      )}>
        {reached ? <Check size={18} /> : <Icon size={18} />}
      </div>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{milestone.label}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Reward: {milestone.reward}</p>
        </div>
        <StatusBadge variant={reached ? "success" : pct > 0 ? "gold" : "default"} dot={reached} pulse={reached}>
          {reached ? "Reached" : `${Math.round(pct)}%`}
        </StatusBadge>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden ring-1 ring-border">
          <motion.div
            className={cn("h-full rounded-full bg-gradient-to-r", a.from, a.to)}
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums whitespace-nowrap">
          {milestone.current.toLocaleString()}/{milestone.target.toLocaleString()} {milestone.unit}
        </span>
      </div>
    </motion.div>
  );
}

interface LeaderboardRowProps {
  user: LeaderboardUser;
  isCurrentUser?: boolean;
  index?: number;
  showProfileButton?: boolean;
}

function LeaderboardRow({ user, isCurrentUser = false, index = 0, showProfileButton = true }: LeaderboardRowProps) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl ring-1 transition-all",
        isCurrentUser
          ? "bg-gradient-to-r from-electric/10 to-cyan-brand/5 ring-electric/30 shadow-[0_0_22px_-6px_oklch(0.62_0.22_255/0.4)]"
          : "glass-1 ring-border hover:ring-electric/20"
      )}
    >
      <div className={cn(
        "size-9 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm tabular-nums",
        user.rank === 1 ? "bg-gold/20 text-gold ring-1 ring-gold/40" :
        user.rank === 2 ? "bg-slate-200 text-slate-700 ring-1 ring-slate-300" :
        user.rank === 3 ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300" :
        "bg-muted text-muted-foreground"
      )}>
        {user.rank}
      </div>
      <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-electric to-purple-brand text-white text-xs font-bold flex items-center justify-center ring-1 ring-white/40">
        {getInitials(user.username)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{user.username}</p>
          {isCurrentUser && <StatusBadge variant="electric" dot pulse>You</StatusBadge>}
          {user.country && <span className="text-sm">{user.country}</span>}
        </div>
        <p className="text-xs text-muted-foreground">Level {user.level} • {user.achievements} achievements</p>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-xs">
        <div className="text-right">
          <p className="font-semibold text-foreground tabular-nums">{user.coins.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">coins</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-foreground tabular-nums">{user.xp.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">xp</p>
        </div>
      </div>
      <div className={cn(
        "size-7 rounded-md flex items-center justify-center shrink-0",
        user.trend === "up" ? "bg-emerald-brand/10 text-emerald-brand" :
        user.trend === "down" ? "bg-rose-brand/10 text-rose-brand" :
        "bg-muted text-muted-foreground"
      )}>
        {user.trend === "up" ? <ArrowUpRight size={14} /> : user.trend === "down" ? <ArrowUpRight size={14} className="rotate-90" /> : <Hash size={14} />}
      </div>
      {showProfileButton && (
        <LootButton size="sm" variant="glass" className="hidden lg:inline-flex" rightIcon={<ChevronRight size={14} />}>
          Profile
        </LootButton>
      )}
    </motion.div>
  );
}

interface LeaderboardPodiumProps {
  top3: LeaderboardUser[];
  currentUserId?: string;
}

function LeaderboardPodium({ top3, currentUserId }: LeaderboardPodiumProps) {
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumStyles = [
    { ring: "ring-slate-300", bg: "from-slate-200 to-slate-100", text: "text-slate-700", height: "h-28", label: "2nd", icon: Medal, accent: "from-slate-300 to-slate-200" },
    { ring: "ring-gold/50", bg: "from-gold/30 to-gold/10", text: "text-gold", height: "h-36", label: "1st", icon: Crown, accent: "from-gold to-yellow-300" },
    { ring: "ring-amber-400/50", bg: "from-amber-200/40 to-amber-100/20", text: "text-amber-800", height: "h-24", label: "3rd", icon: Medal, accent: "from-amber-400 to-amber-200" },
  ];
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end">
      {order.map((user, i) => {
        if (!user) return <div key={i} />;
        const style = podiumStyles[i];
        const Icon = style.icon;
        return (
          <motion.div
            key={user.id}
            variants={cardReveal}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            className={cn("flex flex-col items-center", i === 1 && "-mt-4 sm:-mt-6")}
          >
            <div className="relative mb-2">
              <motion.div
                variants={i === 1 ? floating : floatingSmall}
                animate="animate"
                className={cn(
                  "size-16 sm:size-20 rounded-full ring-2 flex items-center justify-center text-lg sm:text-2xl font-bold text-white bg-gradient-to-br",
                  style.accent,
                  style.ring
                )}
              >
                {getInitials(user.username)}
              </motion.div>
              {i === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="size-8 rounded-full bg-gold/15 ring-1 ring-gold/40 flex items-center justify-center">
                    <Crown size={16} className="text-gold" />
                  </div>
                </div>
              )}
              <div className={cn("absolute -bottom-1 left-1/2 -translate-x-1/2 size-6 rounded-full flex items-center justify-center ring-1", style.bg, style.text, style.ring)}>
                <Icon size={14} />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-full">{user.username}</p>
            <p className="text-[10px] text-muted-foreground mb-2">Level {user.level} • {user.country}</p>
            <div className={cn("w-full rounded-t-xl ring-1 ring-border bg-gradient-to-t flex flex-col items-center justify-end p-2 pb-0", style.bg)}>
              <p className={cn("text-base sm:text-lg font-bold tabular-nums", style.text)}>{user.coins.toLocaleString()}</p>
              <p className="text-[9px] text-muted-foreground">coins</p>
              <div className={cn("w-full rounded-t-md mt-2", style.height, "bg-gradient-to-t", style.accent, "opacity-20")} />
              <div className={cn("text-[10px] font-bold py-1", style.text)}>{style.label}</div>
            </div>
            {currentUserId === user.id && <StatusBadge variant="electric" dot pulse className="mt-2">You</StatusBadge>}
          </motion.div>
        );
      })}
    </div>
  );
}

interface ReferralCardProps {
  title: string;
  count: number;
  total: number;
  icon: LucideIcon;
  accent: Accent;
  description: string;
}

function ReferralCard({ title, count, total, icon: Icon, accent, description }: ReferralCardProps) {
  const a = accentMap[accent];
  const pct = total > 0 ? Math.min(100, (count / total) * 100) : 0;
  return (
    <GlassCard level={2} className="p-4 ring-1 ring-border" hover>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("size-10 rounded-xl ring-1 flex items-center justify-center", a.bg, a.text, a.ring)}>
          <Icon size={20} />
        </div>
        <ProgressRing value={pct} size={42} strokeWidth={5} gradient={accent === "navy" ? "electric" : (accent as "electric" | "cyan" | "purple" | "gold" | "emerald")} showLabel={false} />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      <p className="text-lg font-bold text-foreground tabular-nums">
        {count.toLocaleString()}
        <span className="text-xs text-muted-foreground font-normal"> / {total.toLocaleString()}</span>
      </p>
    </GlassCard>
  );
}

interface ProgressWidgetProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: Accent;
  detail: string;
  index?: number;
}

function ProgressWidget({ label, value, icon: Icon, accent, detail, index = 0 }: ProgressWidgetProps) {
  const a = accentMap[accent];
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={hoverLift.whileHover}
      className={cn("rounded-2xl p-4 ring-1 ring-border bg-gradient-to-br", a.from, a.to)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={cn("size-9 rounded-lg ring-1 flex items-center justify-center", a.bg, a.text, a.ring)}>
          <Icon size={18} />
        </div>
        <ProgressRing value={value} size={48} strokeWidth={6} gradient={accent === "navy" ? "electric" : (accent as "electric" | "cyan" | "purple" | "gold" | "emerald")} showLabel={false} />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      <p className="text-xs text-muted-foreground mb-1">{detail}</p>
      <p className="text-xl font-bold text-foreground tabular-nums">{Math.round(value)}%</p>
    </motion.div>
  );
}

/* ============================================================
   Empty / Error State Components
   ============================================================ */

function NoAchievementsEmpty() {
  return (
    <EmptyState
      icon="Award"
      title="No achievements yet"
      description="Start earning coins to unlock your first achievement. Complete missions, invite friends, and climb the ranks to expand your collection."
      action={
        <LootButton variant="electric" size="sm" leftIcon={<Rocket size={14} />}>
          Start Earning
        </LootButton>
      }
    />
  );
}

function NoReferralsEmpty() {
  return (
    <EmptyState
      icon="Users"
      title="No referrals yet"
      description="Share your referral code with friends. Both of you earn coins when they sign up and start earning on LootLoom."
      action={
        <LootButton variant="cyan" size="sm" leftIcon={<Share2 size={14} />}>
          Share Your Code
        </LootButton>
      }
    />
  );
}

function LeaderboardUnavailableError() {
  return (
    <ErrorState
      icon="Wifi"
      title="Leaderboard temporarily unavailable"
      description="We couldn't sync the global rankings right now. Your stats are still being tracked locally and will sync when the connection is restored."
      variant="warning"
      action={
        <LootButton variant="electric" size="sm" leftIcon={<RefreshCw size={14} />}>
          Retry Now
        </LootButton>
      }
    />
  );
}

/* ============================================================
   Section Components
   ============================================================ */

interface SectionProps {
  isFocused: boolean;
}

/* ----- 1. Gamification Overview ----- */
function GamificationOverview({ user, rank }: { user: User; rank: number }) {
  const xpPct = user.xpToNext > 0 ? (user.xp / user.xpToNext) * 100 : 0;
  const stats = [
    { label: "Current Level", value: user.level, icon: Zap, accent: "electric" as Accent, suffix: "" },
    { label: "Current XP", value: user.xp, icon: Star, accent: "cyan" as Accent, suffix: "" },
    { label: "Daily Streak", value: user.dailyStreak, icon: Flame, accent: "rose" as Accent, suffix: "d" },
    { label: "Referral Count", value: 18, icon: Users, accent: "purple" as Accent, suffix: "" },
    { label: "Achievements", value: 2, icon: Award, accent: "gold" as Accent, suffix: "/10" },
    { label: "Badges Earned", value: 6, icon: Medal, accent: "emerald" as Accent, suffix: "/12" },
  ];
  return (
    <WidgetCard
      title="Gamification Overview"
      description="Your live progress across levels, XP, ranks, streaks, and achievements"
      icon={<Sparkles size={18} />}
      level={3}
      glow="electric"
      action={<StatusBadge variant="electric" dot pulse>Live</StatusBadge>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Hero stats */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((s) => {
              const a = accentMap[s.accent];
              const Icon = s.icon;
              return (
                <div key={s.label} className={cn("rounded-xl p-4 ring-1 ring-border bg-gradient-to-br", a.from, a.to)}>
                  <div className={cn("size-8 rounded-lg ring-1 flex items-center justify-center mb-2", a.bg, a.text, a.ring)}>
                    <Icon size={16} />
                  </div>
                  <AnimatedCounter value={s.value} suffix={s.suffix} className="text-xl font-bold text-foreground block" />
                  <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <GlassCard level={2} className="p-4 ring-1 ring-border">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={14} className="text-gold" />
                <span className="text-xs text-muted-foreground">Current Rank</span>
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">#{rank}</p>
              <p className="text-[10px] text-emerald-brand">▲ 18 spots this week</p>
            </GlassCard>
            <GlassCard level={2} className="p-4 ring-1 ring-border">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={14} className="text-cyan-brand" />
                <span className="text-xs text-muted-foreground">Global Rank</span>
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">#142</p>
              <p className="text-[10px] text-muted-foreground">of 48,200 players</p>
            </GlassCard>
            <GlassCard level={2} className="p-4 ring-1 ring-border">
              <div className="flex items-center gap-2 mb-1">
                <Heart size={14} className="text-rose-brand" />
                <span className="text-xs text-muted-foreground">Friends Rank</span>
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">#2</p>
              <p className="text-[10px] text-muted-foreground">of 5 friends</p>
            </GlassCard>
          </div>
        </div>
        {/* Right: XP ring */}
        <GlassCard level={2} className="p-6 ring-1 ring-border flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <motion.div variants={floating} animate="animate">
              <ProgressRing value={xpPct} size={160} strokeWidth={14} gradient="electric" />
            </motion.div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Level</span>
              <AnimatedCounter value={user.level} className="text-4xl font-bold text-foreground block" />
              <span className="text-xs text-muted-foreground mt-1">{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            <AnimatedCounter value={user.xpToNext - user.xp} className="font-bold text-electric" /> XP to Level {user.level + 1}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <Flame size={14} className="text-rose-brand" />
            <span className="font-semibold text-foreground">{user.dailyStreak}-day streak</span>
            <StatusBadge variant="warning" dot pulse>Active</StatusBadge>
          </div>
        </GlassCard>
      </div>
    </WidgetCard>
  );
}

/* ----- 2. XP & Level System ----- */
function XPLevelSystem({ user }: { user: User }) {
  const xpPct = user.xpToNext > 0 ? (user.xp / user.xpToNext) * 100 : 0;
  return (
    <WidgetCard
      title="XP & Level System"
      description="Track your experience growth and unlock new tier rewards"
      icon={<Zap size={18} />}
      level={2}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Big progress ring */}
        <GlassCard level={2} className="p-6 ring-1 ring-border flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <ProgressRing value={xpPct} size={180} strokeWidth={16} gradient="electric" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Level</span>
              <AnimatedCounter value={user.level} className="text-5xl font-bold text-foreground block" />
              <span className="text-xs text-muted-foreground mt-1">Bronze Tier</span>
            </div>
          </div>
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Current XP</span>
              <span className="font-semibold text-foreground tabular-nums">{user.xp.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Required for Next</span>
              <span className="font-semibold text-foreground tabular-nums">{user.xpToNext.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-semibold text-electric tabular-nums">{(user.xpToNext - user.xp).toLocaleString()} XP</span>
            </div>
          </div>
          <LootButton variant="electric" size="sm" fullWidth className="mt-4" leftIcon={<Rocket size={14} />}>
            Boost XP Now
          </LootButton>
        </GlassCard>
        {/* Right: Milestones */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award size={16} className="text-electric" /> Level Milestones & Rewards
          </h4>
          <div className="space-y-1">
            {LEVEL_MILESTONES.map((m, i) => {
              const a = accentMap[m.accent];
              const reached = user.level >= m.level;
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.level}
                  variants={cardReveal}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  className={cn(
                    "relative flex items-center gap-4 p-3 rounded-xl ring-1",
                    reached ? cn("bg-gradient-to-r", a.from, a.to, a.ring) : "bg-muted/40 ring-border"
                  )}
                >
                  <div className={cn(
                    "size-10 rounded-xl ring-1 flex items-center justify-center shrink-0",
                    reached ? cn(a.bg, a.text, a.ring) : "bg-background text-muted-foreground ring-border"
                  )}>
                    {reached ? <Check size={18} /> : <Lock size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">Level {m.level}</p>
                      <StatusBadge variant={reached ? "success" : "default"} dot={reached}>{m.label}</StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.reward}</p>
                  </div>
                  <Icon size={20} className={cn("shrink-0", reached ? a.text : "text-muted-foreground")} />
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <GlassCard level={2} className="p-4 ring-1 ring-border ring-dashed">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={14} className="text-purple-brand" />
                <span className="text-xs text-muted-foreground">Future Prestige</span>
              </div>
              <p className="text-sm font-semibold text-foreground">Prestige Tier</p>
              <p className="text-[10px] text-muted-foreground mt-1">Unlock at Level 50 — exclusive rewards, prestige badges, and lifetime XP boosts.</p>
            </GlassCard>
            <GlassCard level={2} className="p-4 ring-1 ring-border ring-dashed">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={14} className="text-gold" />
                <span className="text-xs text-muted-foreground">Future Level Reward</span>
              </div>
              <p className="text-sm font-semibold text-foreground">Level 10 Bonus</p>
              <p className="text-[10px] text-muted-foreground mt-1">Reach Level 10 to unlock Silver tier with 500 bonus coins and 5% earn boost.</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ----- 3. Achievement Center ----- */
function AchievementCenter({ isFocused }: SectionProps) {
  const [activeCat, setActiveCat] = useState<(typeof ACHIEVEMENT_CATEGORIES)[number]>("All");
  const filtered = useMemo(() => {
    if (activeCat === "All") return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter((a) => a.category === activeCat);
  }, [activeCat]);
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  return (
    <div data-section="achievements" className={cn("scroll-mt-24 transition-all", isFocused && "ring-2 ring-electric/30 rounded-3xl p-1")}>
      <WidgetCard
        title="Achievement Center"
        description={`${unlockedCount} of ${ACHIEVEMENTS.length} achievements unlocked across all categories`}
        icon={<Award size={18} />}
        level={2}
        glow={isFocused ? "electric" : "none"}
        action={
          <div className="hidden sm:flex items-center gap-2">
            <StatusBadge variant="gold" dot pulse>{unlockedCount} unlocked</StatusBadge>
            <ProgressRing value={(unlockedCount / ACHIEVEMENTS.length) * 100} size={36} strokeWidth={4} gradient="gold" />
          </div>
        }
      >
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {ACHIEVEMENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-full ring-1 transition-all",
                activeCat === cat
                  ? "bg-electric text-white ring-electric shadow-[0_4px_16px_-4px_oklch(0.62_0.22_255/0.6)]"
                  : "bg-background text-muted-foreground ring-border hover:ring-electric/30 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <AchievementCard key={a.id} achievement={a} index={i} />
          ))}
        </div>
        {filtered.length === 0 && <NoAchievementsEmpty />}
      </WidgetCard>
    </div>
  );
}

/* ----- 4. Badge Collection ----- */
function BadgeCollection() {
  const unlockedCount = BADGES.filter((b) => b.unlocked).length;
  return (
    <WidgetCard
      title="Badge Collection"
      description={`${unlockedCount} of ${BADGES.length} badges earned — collect them all by rarity`}
      icon={<Medal size={18} />}
      level={2}
      action={<StatusBadge variant="purple" dot>{unlockedCount}/{BADGES.length}</StatusBadge>}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {BADGES.map((b, i) => (
          <BadgeCard key={b.id} badge={b} index={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ----- 5. Daily Streak Center ----- */
function DailyStreakCenter({ user }: { user: User }) {
  const longestStreak = 28;
  return (
    <WidgetCard
      title="Daily Streak Center"
      description={`You're on a ${user.dailyStreak}-day streak — keep the flame alive`}
      icon={<Flame size={18} />}
      level={2}
      glow="purple"
      action={<StatusBadge variant="warning" dot pulse>Active streak</StatusBadge>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: streak summary */}
        <div className="space-y-4">
          <GlassCard level={2} className="p-5 ring-1 ring-border bg-gradient-to-br from-rose-brand/10 to-gold/5 text-center">
            <motion.div
              animate={{ scale: [1, 1.12, 1], rotate: [0, 4, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex size-16 rounded-2xl bg-rose-brand/15 ring-1 ring-rose-brand/30 items-center justify-center mb-3"
            >
              <Flame size={32} className="text-rose-brand" />
            </motion.div>
            <AnimatedCounter value={user.dailyStreak} className="text-4xl font-bold text-foreground block" suffix=" days" />
            <p className="text-xs text-muted-foreground mt-1">Current streak</p>
            <LootButton variant="gold" size="sm" fullWidth className="mt-4" leftIcon={<Gift size={14} />}>
              Claim Today's Reward
            </LootButton>
          </GlassCard>
          <div className="grid grid-cols-2 gap-3">
            <GlassCard level={2} className="p-4 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">Longest Streak</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{longestStreak}d</p>
            </GlassCard>
            <GlassCard level={2} className="p-4 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">Today's Status</p>
              <StatusBadge variant="warning" dot pulse>Available</StatusBadge>
            </GlassCard>
            <GlassCard level={2} className="p-4 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">Tomorrow Reward</p>
              <p className="text-sm font-bold text-gold">+150 coins</p>
            </GlassCard>
            <GlassCard level={2} className="p-4 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">7-Day Milestone</p>
              <StatusBadge variant="info" dot>3 days to go</StatusBadge>
            </GlassCard>
          </div>
        </div>
        {/* Right: weekly + monthly calendar */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              <CalendarCheck size={14} className="text-electric" /> Weekly Milestone
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {DAILY_STREAK_DAYS.map((d, i) => (
                <motion.div
                  key={d.day}
                  variants={cardReveal}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className={cn(
                    "aspect-square rounded-xl p-2 flex flex-col items-center justify-center ring-1 text-center",
                    d.status === "claimed" && "bg-emerald-brand/10 ring-emerald-brand/20 text-emerald-brand",
                    d.status === "today" && "bg-gradient-to-br from-electric to-purple-brand text-white ring-electric/40 shadow-[0_8px_24px_-6px_oklch(0.62_0.22_255/0.5)]",
                    d.status === "locked" && "bg-muted/40 ring-border text-muted-foreground"
                  )}
                >
                  <span className="text-[10px] font-medium opacity-80">{d.day}</span>
                  <span className="text-sm font-bold">{d.dayNum}</span>
                  <span className="text-[9px] mt-0.5">+{d.reward}</span>
                  {d.status === "claimed" && <Check size={12} className="mt-0.5" />}
                  {d.status === "today" && <Flame size={12} className="mt-0.5" />}
                  {d.status === "locked" && <Lock size={10} className="mt-0.5 opacity-60" />}
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              <CalendarDays size={14} className="text-purple-brand" /> Monthly Milestone — July 2024
            </h4>
            <div className="grid grid-cols-7 gap-1.5">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-muted-foreground font-semibold pb-1">{d}</div>
              ))}
              {MONTH_GRID.map((day, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.015 }}
                  className={cn(
                    "aspect-square rounded-md flex items-center justify-center text-[10px] font-medium ring-1",
                    day.state === "claimed" && "bg-emerald-brand/10 ring-emerald-brand/20 text-emerald-brand",
                    day.state === "today" && "bg-gradient-to-br from-electric to-purple-brand text-white ring-electric/40",
                    day.state === "missed" && "bg-rose-brand/5 ring-rose-brand/15 text-rose-brand/60 line-through",
                    day.state === "future" && "bg-muted/30 ring-border text-muted-foreground"
                  )}
                  title={day.state}
                >
                  {day.date}
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-brand" /> Claimed</span>
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-electric" /> Today</span>
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-rose-brand/40" /> Missed</span>
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-muted-foreground/40" /> Future</span>
            </div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ----- 6. Referral Center ----- */
function ReferralCenter({ user, isFocused }: SectionProps & { user: User }) {
  const { copied, copy } = useCopy();
  const referralLink = `https://lootloom.app/r/${user.referralCode}`;
  return (
    <div data-section="referral" className={cn("scroll-mt-24 transition-all", isFocused && "ring-2 ring-electric/30 rounded-3xl p-1")}>
      <WidgetCard
        title="Referral Center"
        description="Invite friends, earn 200 coins per signup, and unlock exclusive referral rewards"
        icon={<Users size={18} />}
        level={2}
        glow={isFocused ? "electric" : "none"}
        action={<StatusBadge variant="cyan" dot pulse>18 active</StatusBadge>}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: code + share */}
          <div className="space-y-4">
            <GlassCard level={2} className="p-5 ring-1 ring-electric/20 bg-gradient-to-br from-electric/10 to-cyan-brand/5">
              <p className="text-xs text-muted-foreground mb-2">Your Referral Code</p>
              <div className="flex items-center justify-between gap-3">
                <code className="text-2xl font-bold tracking-widest text-foreground font-mono">{user.referralCode}</code>
                <LootButton
                  size="icon"
                  variant={copied ? "emerald" : "glass"}
                  onClick={() => copy(user.referralCode)}
                  aria-label="Copy referral code"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </LootButton>
              </div>
              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-emerald-brand mt-2 inline-flex items-center gap-1"
                >
                  <Check size={10} /> Copied to clipboard
                </motion.p>
              )}
            </GlassCard>
            <GlassCard level={2} className="p-4 ring-1 ring-border ring-dashed">
              <p className="text-xs text-muted-foreground mb-1">Referral Link</p>
              <p className="text-xs text-foreground font-mono truncate">{referralLink}</p>
              <div className="flex gap-2 mt-2">
                <LootButton size="sm" variant="glass" fullWidth leftIcon={<Copy size={12} />} onClick={() => copy(referralLink)}>
                  Copy Link
                </LootButton>
                <LootButton size="sm" variant="outline" fullWidth leftIcon={<Share2 size={12} />} disabled>
                  Share
                </LootButton>
              </div>
            </GlassCard>
            <div className="grid grid-cols-3 gap-2">
              <GlassCard level={2} className="p-3 ring-1 ring-border text-center">
                <QrCode size={20} className="mx-auto text-purple-brand mb-1" />
                <p className="text-[10px] text-muted-foreground">QR Code</p>
                <StatusBadge variant="default" className="text-[9px] mt-1">Soon</StatusBadge>
              </GlassCard>
              <GlassCard level={2} className="p-3 ring-1 ring-border text-center">
                <Contact size={20} className="mx-auto text-cyan-brand mb-1" />
                <p className="text-[10px] text-muted-foreground">Contacts</p>
                <StatusBadge variant="default" className="text-[9px] mt-1">Soon</StatusBadge>
              </GlassCard>
              <GlassCard level={2} className="p-3 ring-1 ring-border text-center">
                <Mail size={20} className="mx-auto text-emerald-brand mb-1" />
                <p className="text-[10px] text-muted-foreground">Email</p>
                <StatusBadge variant="default" className="text-[9px] mt-1">Soon</StatusBadge>
              </GlassCard>
            </div>
          </div>
          {/* Right: stats */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
            <ReferralCard title="Friends Invited" count={18} total={50} icon={Users} accent="electric" description="Total invites sent" />
            <ReferralCard title="Friends Registered" count={12} total={18} icon={UserPlus} accent="cyan" description="Successful signups" />
            <ReferralCard title="Pending Rewards" count={3} total={6} icon={Clock} accent="gold" description="Awaiting first activity" />
            <ReferralCard title="Completed Rewards" count={9} total={12} icon={Check} accent="emerald" description="Coins earned from referrals" />
            <GlassCard level={2} className="p-4 ring-1 ring-border col-span-2 sm:col-span-3 bg-gradient-to-br from-gold/10 to-electric/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Lifetime Referral Coins</p>
                  <AnimatedCounter value={3600} prefix="" suffix=" coins" className="text-2xl font-bold text-gold block" />
                </div>
                <div className="size-12 rounded-xl bg-gold/15 ring-1 ring-gold/30 flex items-center justify-center">
                  <Coins size={24} className="text-gold" />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </WidgetCard>
    </div>
  );
}

/* ----- 7. Referral Leaderboard ----- */
function ReferralLeaderboard() {
  return (
    <WidgetCard
      title="Referral Leaderboard"
      description="Top referrers this season — invite more to climb the rankings"
      icon={<Trophy size={18} />}
      level={2}
    >
      <div className="space-y-5">
        <LeaderboardPodium top3={REFERRAL_TOP} />
        <GlassCard level={2} className="p-4 ring-1 ring-electric/20 bg-gradient-to-r from-electric/8 to-cyan-brand/4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-lg bg-electric/15 ring-1 ring-electric/30 flex items-center justify-center font-bold text-electric text-sm tabular-nums">
                #6
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Your Position</p>
                <p className="text-xs text-muted-foreground">12 successful referrals • 3,600 coins earned</p>
              </div>
            </div>
            <StatusBadge variant="electric" dot pulse>You</StatusBadge>
          </div>
        </GlassCard>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REFERRAL_GROWTH_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "oklch(1 0 0 / 0.92)", border: "1px solid oklch(0.92 0.01 250)", borderRadius: 12, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="referrals" stroke="oklch(0.72 0.15 200)" strokeWidth={2.5} fill="url(#refGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ----- 8. Global Leaderboard ----- */
function GlobalLeaderboard({ user, rank, isFocused }: SectionProps & { user: User; rank: number }) {
  const [tab, setTab] = useState<LeaderboardTab>("Global");
  return (
    <div data-section="leaderboard" className={cn("scroll-mt-24 transition-all", isFocused && "ring-2 ring-electric/30 rounded-3xl p-1")}>
      <WidgetCard
        title="Global Leaderboard"
        description="Compete with players worldwide — climb the ranks to earn exclusive rewards"
        icon={<Crown size={18} />}
        level={2}
        glow={isFocused ? "electric" : "none"}
        action={<StatusBadge variant="gold" dot pulse>Live ranking</StatusBadge>}
      >
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {LEADERBOARD_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-full ring-1 transition-all",
                tab === t
                  ? "bg-electric text-white ring-electric shadow-[0_4px_16px_-4px_oklch(0.62_0.22_255/0.6)]"
                  : "bg-background text-muted-foreground ring-border hover:ring-electric/30 hover:text-foreground"
              )}
            >
              {t}
              {(t === "Country" || t === "Region") && <Lock size={10} className="inline ml-1 opacity-60" />}
            </button>
          ))}
        </div>
        <div className="space-y-5">
          <LeaderboardPodium top3={LEADERBOARD_USERS.slice(0, 3)} />
          {/* Full list */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 custom-scroll">
            {LEADERBOARD_USERS.map((u, i) => (
              <LeaderboardRow key={u.id} user={u} index={i} isCurrentUser={u.rank === rank} />
            ))}
            {/* Current user highlight if not in top 15 */}
            {rank > 15 && (
              <>
                <div className="flex items-center justify-center py-2">
                  <StatusBadge variant="default" dot>••• {rank - 15} players between you and rank 15 •••</StatusBadge>
                </div>
                <LeaderboardRow
                  user={{
                    id: "me",
                    rank,
                    username: user.username,
                    level: user.level,
                    xp: user.xp,
                    coins: 12840,
                    achievements: 2,
                    country: "🇮🇳",
                    trend: "up",
                  }}
                  isCurrentUser
                />
              </>
            )}
          </div>
        </div>
      </WidgetCard>
    </div>
  );
}

/* ----- 9. Friends Leaderboard ----- */
function FriendsLeaderboard() {
  return (
    <WidgetCard
      title="Friends Leaderboard"
      description="See how you stack up against your LootLoom friends this week"
      icon={<Heart size={18} />}
      level={2}
    >
      <div className="space-y-3">
        {FRIENDS.map((f, i) => {
          const isMe = false; // current user not in friends list
          return (
            <motion.div
              key={f.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              whileHover={hoverLift.whileHover}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl ring-1",
                isMe ? "bg-gradient-to-r from-electric/10 to-cyan-brand/5 ring-electric/30" : "glass-1 ring-border"
              )}
            >
              <div className="size-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold tabular-nums ring-1 ring-border">
                #{f.rank}
              </div>
              <div className="relative">
                <div className="size-10 rounded-full bg-gradient-to-br from-cyan-brand to-purple-brand text-white text-xs font-bold flex items-center justify-center ring-1 ring-white/40">
                  {getInitials(f.name)}
                </div>
                {f.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-brand ring-2 ring-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">Level {f.level} • {f.xp.toLocaleString()} XP</p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-0.5">
                <span className="text-xs font-semibold text-foreground tabular-nums">{f.weeklyProgress}%</span>
                <span className="text-[10px] text-muted-foreground">weekly progress</span>
              </div>
              <ProgressRing value={f.weeklyProgress} size={36} strokeWidth={4} gradient="cyan" showLabel={false} />
              <LootButton size="sm" variant="glass" className="hidden md:inline-flex" rightIcon={<ChevronRight size={12} />}>
                Compare
              </LootButton>
            </motion.div>
          );
        })}
        <LootButton variant="cyan" size="md" fullWidth className="mt-2" leftIcon={<UserPlus size={14} />}>
          Invite More Friends
        </LootButton>
      </div>
    </WidgetCard>
  );
}

/* ----- 10. Challenges Center ----- */
function ChallengesCenter() {
  return (
    <WidgetCard
      title="Challenges Center"
      description="Daily, weekly, monthly, and special challenges with huge rewards"
      icon={<Target size={18} />}
      level={2}
      action={<StatusBadge variant="electric" dot pulse>4 active</StatusBadge>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHALLENGES.map((c, i) => (
          <ChallengeCard key={c.id} challenge={c} index={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ----- 11. Milestone Rewards ----- */
function MilestoneRewards() {
  return (
    <WidgetCard
      title="Milestone Rewards"
      description="Track your journey to coins, referrals, XP, and streak milestones"
      icon={<Trophy size={18} />}
      level={2}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
            <Coins size={14} className="text-gold" /> Coin Milestones
          </h4>
          <div>
            {MILESTONES.filter((m) => m.unit === "coins").map((m, i) => (
              <MilestoneCard key={m.id} milestone={m} index={i} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users size={14} className="text-cyan-brand" /> Referral & Streak Milestones
          </h4>
          <div>
            {MILESTONES.filter((m) => m.unit !== "coins").map((m, i) => (
              <MilestoneCard key={m.id} milestone={m} index={i} />
            ))}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ----- 12. Reward Showcase ----- */
function RewardShowcase() {
  const typeStyles: Record<RewardShowcaseItem["type"], { variant: "default" | "info" | "cyan" | "purple" | "gold" | "electric" }> = {
    Upcoming: { variant: "info" },
    Locked: { variant: "default" },
    Recommended: { variant: "electric" },
    Achievement: { variant: "purple" },
    Referral: { variant: "cyan" },
  };
  return (
    <WidgetCard
      title="Reward Showcase"
      description="Premium rewards waiting to be unlocked — earn coins to claim them"
      icon={<Gift size={18} />}
      level={2}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REWARD_SHOWCASE.map((r, i) => {
          const a = accentMap[r.accent];
          const Icon = r.icon;
          return (
            <motion.div
              key={r.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              whileHover={hoverLift.whileHover}
              className={cn(
                "relative rounded-2xl p-5 ring-1 ring-border overflow-hidden bg-gradient-to-br",
                a.from, a.to,
                r.locked && "opacity-70"
              )}
            >
              {r.locked && (
                <div className="absolute top-3 right-3 size-7 rounded-lg bg-background/70 ring-1 ring-border flex items-center justify-center">
                  <Lock size={14} className="text-muted-foreground" />
                </div>
              )}
              <div className={cn("size-12 rounded-xl ring-1 flex items-center justify-center mb-3", a.bg, a.text, a.ring)}>
                <Icon size={24} />
              </div>
              <div className="mb-2">
                <StatusBadge variant={typeStyles[r.type].variant}>{r.type}</StatusBadge>
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">{r.name}</h4>
              <p className="text-xs text-muted-foreground mb-4 min-h-[2.5rem]">{r.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  {r.cost > 0 ? (
                    <p className="font-bold text-foreground tabular-nums">{r.cost.toLocaleString()} <span className="text-muted-foreground font-normal">coins</span></p>
                  ) : (
                    <p className="font-bold text-emerald-brand">Reward</p>
                  )}
                </div>
                <LootButton size="sm" variant={r.locked ? "glass" : "electric"} disabled={r.locked} rightIcon={r.locked ? undefined : <ChevronRight size={12} />}>
                  {r.locked ? "Locked" : r.cost > 0 ? "Redeem" : "View"}
                </LootButton>
              </div>
            </motion.div>
          );
        })}
      </div>
    </WidgetCard>
  );
}

/* ----- 13. Progress Dashboard ----- */
function ProgressDashboard({ user }: { user: User }) {
  const xpPct = user.xpToNext > 0 ? (user.xp / user.xpToNext) * 100 : 0;
  const widgets = [
    { label: "Overall Completion", value: 64, icon: Sparkles, accent: "electric" as Accent, detail: "All milestones combined" },
    { label: "Achievement Progress", value: 32, icon: Award, accent: "gold" as Accent, detail: "2 of 10 unlocked" },
    { label: "Referral Progress", value: 36, icon: Users, accent: "cyan" as Accent, detail: "18 of 50 friends" },
    { label: "Leaderboard Progress", value: 71, icon: Trophy, accent: "purple" as Accent, detail: "Rank 142 of 48k" },
    { label: "Level Progress", value: xpPct, icon: Zap, accent: "emerald" as Accent, detail: `Level ${user.level} → ${user.level + 1}` },
    { label: "VIP Progress", value: 0, icon: Crown, accent: "rose" as Accent, detail: "Locked — reach Level 25" },
  ];
  return (
    <WidgetCard
      title="Progress Dashboard"
      description="Your gamification completion across every category"
      icon={<BarChart3 size={18} />}
      level={2}
    >
      <Grid cols={3}>
        {widgets.map((w, i) => (
          <ProgressWidget key={w.label} label={w.label} value={w.value} icon={w.icon} accent={w.accent} detail={w.detail} index={i} />
        ))}
      </Grid>
    </WidgetCard>
  );
}

/* ----- 14. Activity Feed ----- */
function ActivityFeed() {
  return (
    <WidgetCard
      title="Activity Feed"
      description="Recent gamification events and milestone updates"
      icon={<Activity size={18} />}
      level={2}
      action={<StatusBadge variant="success" dot>Live</StatusBadge>}
    >
      <div className="relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-electric/40 via-purple-brand/30 to-transparent" />
        <div className="space-y-3">
          {ACTIVITY_FEED.map((item, i) => {
            const a = accentMap[item.accent];
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                variants={cardReveal}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                className="relative pl-12"
              >
                <div className={cn(
                  "absolute left-0 top-1 size-10 rounded-xl ring-1 flex items-center justify-center bg-background",
                  a.bg, a.text, a.ring
                )}>
                  <Icon size={18} />
                </div>
                <GlassCard level={1} className="p-3 ring-1 ring-border" hover>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
}

/* ----- 15. Statistics ----- */
function Statistics() {
  return (
    <WidgetCard
      title="Statistics & Insights"
      description="Visualize your gamification growth across XP, referrals, levels, and rankings"
      icon={<TrendingUp size={18} />}
      level={2}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XP Growth LineChart */}
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <LineChartIcon size={14} className="text-electric" /> XP Growth (8 weeks)
          </h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={XP_GROWTH_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(1 0 0 / 0.92)", border: "1px solid oklch(0.92 0.01 250)", borderRadius: 12, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="xp" stroke="oklch(0.62 0.22 255)" strokeWidth={2.5} dot={{ fill: "oklch(0.62 0.22 255)", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Referral Growth AreaChart */}
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-cyan-brand" /> Referral Growth (7 months)
          </h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REFERRAL_GROWTH_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="refGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(1 0 0 / 0.92)", border: "1px solid oklch(0.92 0.01 250)", borderRadius: 12, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="referrals" stroke="oklch(0.72 0.15 200)" strokeWidth={2.5} fill="url(#refGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Level Progress BarChart */}
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 size={14} className="text-purple-brand" /> Level Progress
          </h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LEVEL_PROGRESS_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="lvlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.6 0.22 295)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="oklch(0.7 0.2 320)" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "oklch(0.62 0.22 255 / 0.06)" }}
                  contentStyle={{ background: "oklch(1 0 0 / 0.92)", border: "1px solid oklch(0.92 0.01 250)", borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="value" fill="url(#lvlGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Leaderboard History LineChart */}
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-brand" /> Leaderboard History (lower is better)
          </h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={LEADERBOARD_HISTORY_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                <YAxis reversed tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(1 0 0 / 0.92)", border: "1px solid oklch(0.92 0.01 250)", borderRadius: 12, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="rank" stroke="oklch(0.7 0.17 160)" strokeWidth={2.5} dot={{ fill: "oklch(0.7 0.17 160)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Achievement Distribution PieChart */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <PieChartIcon size={14} className="text-gold" /> Achievement Distribution by Difficulty
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ACHIEVEMENT_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  stroke="oklch(1 0 0)"
                  strokeWidth={2}
                >
                  {ACHIEVEMENT_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "oklch(1 0 0 / 0.92)", border: "1px solid oklch(0.92 0.01 250)", borderRadius: 12, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {ACHIEVEMENT_DISTRIBUTION.map((d) => (
              <span key={d.name} className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Main View
   ============================================================ */

export function GamificationView() {
  const current = useNavigationStore((s) => s.current);
  const navigate = useNavigationStore((s) => s.navigate);
  const user = useUserStore();
  const wallet = useWalletStore();

  const headerByRoute: Record<string, { title: string; description: string }> = {
    referral: {
      title: "Referral Center",
      description: "Share your code, invite friends, and grow your referral network for exclusive rewards.",
    },
    achievements: {
      title: "Achievements",
      description: "Track your milestones, unlock badges, and conquer every category of achievements.",
    },
    leaderboard: {
      title: "Leaderboard",
      description: "Compete with players worldwide and friends — climb the ranks to claim your crown.",
    },
  };

  const header = headerByRoute[current] ?? {
    title: "Gamification Center",
    description: "Your complete hub for referrals, achievements, leaderboard, XP, badges, streaks, and challenges.",
  };

  // Scroll to focused section on mount/route change
  useEffect(() => {
    if (!current) return;
    if (!["referral", "achievements", "leaderboard"].includes(current)) return;
    const t = window.setTimeout(() => {
      const el = document.querySelector(`[data-section="${current}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => window.clearTimeout(t);
  }, [current]);

  const rank = user.rank;

  return (
    <PageContainer>
      <PageHeader
        title={header.title}
        description={header.description}
        actions={
          <>
            <LootButton variant="glass" size="sm" leftIcon={<Wallet size={14} />} onClick={() => navigate("wallet")}>
              Wallet
            </LootButton>
            <LootButton variant="electric" size="sm" leftIcon={<Rocket size={14} />} onClick={() => navigate("earn")}>
              Earn More
            </LootButton>
          </>
        }
      />

      {/* Top stats strip */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        <StatCard label="Available Coins" value={wallet.availableCoins} icon="Coins" accent="gold" trend={{ positive: true, value: 12 }} />
        <StatCard label="Current Level" value={user.level} icon="Zap" accent="electric" suffix="" />
        <StatCard label="Daily Streak" value={user.dailyStreak} icon="Flame" accent="rose" suffix="d" trend={{ positive: true, value: 8 }} />
        <StatCard label="Global Rank" value={rank} icon="Trophy" accent="purple" prefix="#" trend={{ positive: true, value: 18 }} />
      </motion.div>

      {/* All sections */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <GamificationOverview user={user} rank={rank} />
        <XPLevelSystem user={user} />

        <AchievementCenter
          isFocused={current === "achievements"}
        />

        <BadgeCollection />
        <DailyStreakCenter user={user} />

        <ReferralCenter
          user={user}
          isFocused={current === "referral"}
        />

        <ReferralLeaderboard />

        <GlobalLeaderboard
          user={user}
          rank={rank}
          isFocused={current === "leaderboard"}
        />

        <FriendsLeaderboard />
        <ChallengesCenter />
        <MilestoneRewards />
        <RewardShowcase />
        <ProgressDashboard user={user} />
        <ActivityFeed />
        <Statistics />

        {/* States preview */}
        <WidgetCard
          title="Status States"
          description="Reusable empty and error states used throughout the gamification center"
          icon={<Info size={18} />}
          level={2}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard level={1} className="ring-1 ring-border">
              <NoAchievementsEmpty />
            </GlassCard>
            <GlassCard level={1} className="ring-1 ring-border">
              <NoReferralsEmpty />
            </GlassCard>
            <GlassCard level={1} className="ring-1 ring-border">
              <LeaderboardUnavailableError />
            </GlassCard>
          </div>
        </WidgetCard>

        {/* Footer CTA */}
        <GlassCard level={3} className="p-6 ring-1 ring-electric/20 bg-gradient-to-br from-electric/8 via-cyan-brand/5 to-purple-brand/8 text-center">
          <h3 className="text-lg font-bold text-foreground mb-1">Ready to climb the ranks?</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xl mx-auto">
            Earn more coins to unlock achievements, badges, and climb the global leaderboard. Every action counts toward your next milestone.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LootButton variant="electric" size="md" leftIcon={<Rocket size={16} />} onClick={() => navigate("earn")}>
              Start Earning
            </LootButton>
            <LootButton variant="glass" size="md" leftIcon={<Gift size={16} />} onClick={() => navigate("rewards")}>
              Browse Rewards
            </LootButton>
            <LootButton variant="outline" size="md" leftIcon={<Trophy size={16} />} onClick={() => navigate("dashboard")}>
              View Dashboard
            </LootButton>
          </div>
        </GlassCard>
      </motion.div>
    </PageContainer>
  );
}
