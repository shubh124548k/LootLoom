/**
 * LootLoom — Shared Types
 * Types shared between frontend and (future) backend.
 * Kept framework-agnostic so they can be imported by either side.
 */

export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  level: number;
  xp: number;
  avatarUrl: string | null;
}

export interface Wallet extends BaseEntity {
  userId: ID;
  availableCoins: number;
  pendingCoins: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
}

export interface Transaction extends BaseEntity {
  userId: ID;
  type: "credit" | "debit" | "redeem" | "bonus" | "referral";
  amount: number;
  status: "completed" | "pending" | "failed" | "processing";
  description: string;
}

export interface Reward extends BaseEntity {
  name: string;
  category: string;
  requiredCoins: number;
  processingTime: string;
  availability: "available" | "limited" | "soldout" | "soon";
}

export interface RedeemRequest extends BaseEntity {
  userId: ID;
  rewardId: ID;
  coinsUsed: number;
  status: "pending" | "reviewing" | "completed" | "rejected";
}

export type UserRole =
  | "visitor"
  | "user"
  | "support"
  | "moderator"
  | "administrator"
  | "ceo";

/** Standard API response envelope. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
