/**
 * LootLoom — Shared Constants
 * Constants shared between frontend and (future) backend.
 */
export const APP_NAME = "LootLoom" as const;
export const API_VERSION = "v1" as const;

export const USER_ROLES = [
  "visitor",
  "user",
  "support",
  "moderator",
  "administrator",
  "ceo",
] as const;

export const REWARD_CATEGORIES = [
  "upi-cash",
  "gift-cards",
  "gaming",
  "digital-vouchers",
  "mobile-recharge",
  "shopping",
  "premium-membership",
  "custom",
] as const;

export const TRANSACTION_TYPES = [
  "credit",
  "debit",
  "redeem",
  "bonus",
  "referral",
] as const;

export const REDEEM_STATUSES = [
  "pending",
  "reviewing",
  "completed",
  "rejected",
] as const;
