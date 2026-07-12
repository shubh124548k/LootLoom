/**
 * LootLoom — Ads / Earning Models
 * Rewarded ad sessions, offerwall, and earning statistics.
 */
import type { EntityId, ISODateString, Timestamps } from "./common";

/* ============================================================
   Rewarded Ads
   ============================================================ */

/** Ad session lifecycle. */
export type AdSessionStatus =
  | "created"
  | "playing"
  | "completed"
  | "rewarded"
  | "skipped"
  | "error";

/** Ad provider identifier (future-ready for multiple networks). */
export type AdProvider = "google-admob" | "unity-ads" | "applovin" | "internal";

/** Ad session entity (tracks a single ad watch). */
export interface AdSession extends Timestamps {
  id: EntityId;
  userId: EntityId;
  provider: AdProvider;
  status: AdSessionStatus;
  /** Coins promised for completing this ad. */
  rewardCoins: number;
  /** Duration of the ad in seconds. */
  durationSeconds: number;
  /** When the ad started playing. */
  startedAt: ISODateString | null;
  /** When the ad finished (completed/skipped/error). */
  completedAt: ISODateString | null;
  /** Provider's tracking ID (for fraud verification). */
  providerImpressionId?: string | null;
  /** Error message if status === "error". */
  errorReason?: string | null;
}

/** Ad reward granted after successful completion. */
export interface AdReward {
  sessionId: EntityId;
  coins: number;
  /** New wallet balance after reward. */
  newBalance: number;
  grantedAt: ISODateString;
}

/** Ad completion payload (sent to backend to verify + reward). */
export interface AdCompletionRequest {
  sessionId: EntityId;
  providerImpressionId: string;
  /** Proof-of-watch token from the ad SDK. */
  verificationToken: string;
}

/** Ad completion response. */
export interface AdCompletionResponse {
  rewarded: boolean;
  reward?: AdReward;
  error?: string;
}

/* ============================================================
   Daily Ad Limits
   ============================================================ */

/** Daily ad watch limit tracking. */
export interface DailyAdLimit {
  /** Max ads allowed per day. */
  dailyLimit: number;
  /** Ads watched today. */
  watchedToday: number;
  /** Remaining ads for today. */
  remaining: number;
  /** Coins earned from ads today. */
  earningsToday: number;
  /** When the limit resets (next midnight user-local). */
  resetsAt: ISODateString;
}

/* ============================================================
   Offerwall (future)
   ============================================================ */

/** Offerwall provider status. */
export type OfferwallProviderStatus = "active" | "low-inventory" | "coming-soon";

/** Offerwall provider entry. */
export interface OfferwallProvider {
  id: EntityId;
  name: string;
  description: string;
  rewardRange: string;
  completionRate: number;
  status: OfferwallProviderStatus;
  /** External offerwall URL (with user tracking token appended). */
  offerwallUrl?: string | null;
}

/* ============================================================
   Earning Statistics
   ============================================================ */

/** Single chart data point (re-exported from wallet for convenience). */
export type { ChartPoint } from "./wallet";
import type { ChartPoint } from "./wallet";

/** Earning analytics summary. */
export interface EarnStatistics {
  totalEarned: number;
  adsWatched: number;
  offersCompleted: number;
  averagePerAd: number;
  /** Weekly earnings breakdown. */
  weekly: ChartPoint[];
  /** Daily earnings for the last 7 days. */
  daily: ChartPoint[];
}
