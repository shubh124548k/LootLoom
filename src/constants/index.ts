/**
 * LootLoom — Centralized Constants
 * Single source of truth for app-wide constant values.
 * No magic numbers/strings scattered in components.
 */

export const APP_CONFIG = {
  name: "LootLoom",
  version: "1.0.0",
  description: "Premium Reward Platform",
  url: "https://lootloom.app",
} as const;

export const API_CONFIG = {
  version: "v1",
  prefix: "/api",
  timeoutMs: 15000,
  retryAttempts: 3,
} as const;

export const AUTH_CONFIG = {
  tokenStorageKey: "lootloom-auth",
  minPasswordLength: 6,
  sessionCheckIntervalMs: 60000,
  ceoSessionExpiresInMs: 2 * 60 * 60 * 1000,
} as const;

export const COIN_CONFIG = {
  baseMultiplier: 1,
  vipMultiplier: 2,
  minRedeem: 1000,
  coinsPerRupee: 100,
} as const;

export const LIMITS = {
  maxNotificationsShown: 50,
  maxTransactionsPerPage: 20,
  maxLeaderboardEntries: 100,
  dailyAdLimit: 20,
  dailyMissionLimit: 10,
  referralRewardCoins: 200,
  dailyBonusBase: 50,
} as const;

export const STORAGE_KEYS = {
  auth: "lootloom-auth",
  user: "lootloom-user",
  ui: "lootloom-ui",
  theme: "lootloom-theme",
} as const;

export const Z_INDEX = {
  background: 0,
  content: 10,
  sidebar: 30,
  header: 40,
  drawer: 50,
  overlay: 60,
  modal: 70,
  toast: 80,
  tooltip: 90,
} as const;

export const ROLES = [
  "visitor",
  "user",
  "support",
  "moderator",
  "administrator",
  "ceo",
] as const;

export const NOTIFICATION_TYPES = [
  "reward",
  "wallet",
  "system",
  "security",
  "social",
  "announcement",
] as const;

export const MISSION_DIFFICULTY = ["easy", "medium", "hard", "expert"] as const;
export const ACHIEVEMENT_RARITY = ["common", "rare", "epic", "legendary"] as const;
export const REWARD_AVAILABILITY = ["available", "limited", "soldout", "soon"] as const;
