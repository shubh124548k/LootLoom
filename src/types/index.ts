/**
 * LootLoom — Centralized Type System
 * Shared types across the entire application.
 */

export type ViewId =
  | "home"
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "verify-email"
  | "verify-success"
  | "verify-failed"
  | "auth-loading"
  | "session-expired"
  | "unauthorized"
  | "dashboard"
  | "earn"
  | "wallet"
  | "rewards"
  | "redeem"
  | "transactions"
  | "history"
  | "referral"
  | "notifications"
  | "achievements"
  | "leaderboard"
  | "daily-bonus"
  | "missions"
  | "support"
  | "settings"
  | "profile"
  | "ceo-restricted"
  | "ceo-login"
  | "ceo-dashboard"
  | "ceo-users"
  | "maintenance"
  | "error-403"
  | "error-404"
  | "error-500"
  | "offline"
  | "update-required"
  // Prompt 16 — Public Info & Legal Center
  | "about"
  | "features-overview"
  | "how-it-works"
  | "help-center"
  | "contact"
  | "faq-public"
  | "privacy"
  | "terms"
  | "cookies"
  | "community-guidelines"
  | "security-policy"
  | "disclaimer"
  | "copyright"
  | "dmca"
  | "refund"
  | "status-page"
  | "changelog"
  | "whats-new"
  | "platform-updates"
  // Prompt 17 — System Experience Layer (additional)
  | "splash"
  | "app-loading"
  | "coming-soon"
  | "feature-not-available"
  | "service-unavailable";

export type RouteGroup =
  | "public"
  | "auth"
  | "app"
  | "ceo"
  | "system";

export type UserRole = "visitor" | "user" | "support" | "moderator" | "administrator" | "ceo";

export type AuthStatus =
  | "unauthenticated"
  | "authenticating"
  | "authenticated"
  | "verification-pending"
  | "session-expired"
  | "loading";

export type AppLifecycle =
  | "authenticating"
  | "loading-session"
  | "initializing"
  | "ready"
  | "session-expired"
  | "unauthorized"
  | "preparing-data";

export interface NavItem {
  id: ViewId;
  label: string;
  icon: string;
  group: "main" | "earning" | "account" | "system" | "ceo";
  badge?: "notifications" | "wallet" | "ceo" | "new";
  restricted?: boolean;
  description?: string;
}

export interface BreadcrumbItem {
  label: string;
  view?: ViewId;
}

export interface PageMeta {
  title: string;
  description: string;
  group: RouteGroup;
  breadcrumbs: BreadcrumbItem[];
}

export interface GlassConfig {
  level: 1 | 2 | 3 | 4 | "nav";
  className?: string;
}

export interface StatConfig {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: string;
  accent?: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
  trend?: { value: number; positive: boolean };
  decimals?: number;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: "default" | "success" | "warning" | "error" | "info";
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "reward" | "wallet" | "system" | "security" | "social" | "announcement";
  read: boolean;
  icon?: string;
}

export interface ActivityItem {
  id: string;
  type: "earned" | "redeemed" | "mission" | "referral" | "bonus" | "system";
  title: string;
  description: string;
  amount?: number;
  time: string;
  icon?: string;
}

export interface MissionItem {
  id: string;
  name: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
  estimatedTime: string;
  category: "daily" | "weekly" | "monthly";
  status: "available" | "in-progress" | "completed" | "locked";
}

export interface RewardItem {
  id: string;
  name: string;
  category: string;
  requiredCoins: number;
  processingTime: string;
  availability: "available" | "limited" | "soldout" | "soon";
  popularity?: number;
  featured?: "recommended" | "popular" | "best-value" | "limited-time";
  description: string;
}

export interface TransactionItem {
  id: string;
  date: string;
  type: "credit" | "debit" | "redeem" | "bonus" | "referral";
  amount: number;
  status: "completed" | "pending" | "failed" | "processing";
  description: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  coins: number;
  level: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

export interface AchievementItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
}
