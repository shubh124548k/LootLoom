/**
 * LootLoom — Reward Models
 * Reward catalog entries users can redeem coins for.
 */
import type { EntityId, ISODateString, Timestamps } from "./common";

/** Reward availability status (drives UI + redeem eligibility). */
export type RewardAvailability = "available" | "limited" | "soldout" | "soon";

/** Reward featured tag (for marketing badges). */
export type RewardFeatured = "recommended" | "popular" | "best-value" | "limited-time";

/** Reward category (UPI, voucher, gift card, etc.). */
export type RewardCategory =
  | "upi"
  | "amazon"
  | "flipkart"
  | "gift-card"
  | "voucher"
  | "other";

/** Reward status (simplified — same as availability for the catalog). */
export type RewardStatus = RewardAvailability;

/** Reward entity (catalog entry). */
export interface Reward extends Timestamps {
  id: EntityId;
  name: string;
  description: string;
  category: RewardCategory;
  /** Cash value in INR (what the user receives). */
  cashValue: number;
  /** Coins required to redeem. */
  coinsRequired: number;
  status: RewardStatus;
  availability: RewardAvailability;
  /** Estimated processing time for redemption. */
  processingTime: string;
  /** Marketing badge (optional). */
  featured?: RewardFeatured | null;
  /** Popularity score (0-100, optional). */
  popularity?: number;
  /** Image URL (optional). */
  imageUrl?: string | null;
}

/** Reward catalog (list of all available rewards). */
export interface RewardCatalog {
  rewards: Reward[];
  /** Total count (for pagination). */
  total: number;
}

/** Reward filter query params. */
export interface RewardQuery {
  category?: RewardCategory;
  availability?: RewardAvailability;
  /** Max coins required (budget filter). */
  maxCoins?: number;
  search?: string;
  sortBy?: "coinsRequired" | "cashValue" | "popularity" | "createdAt";
  sortOrder?: "asc" | "desc";
}

/** Reward redemption preview (shows coin cost + new balance). */
export interface RewardRedeemPreview {
  reward: Reward;
  currentCoins: number;
  coinsAfterRedeem: number;
  canRedeem: boolean;
  reason?: "insufficient-coins" | "unavailable";
}
