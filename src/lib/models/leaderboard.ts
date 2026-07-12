/**
 * LootLoom — Leaderboard Models
 * Top earners ranked by total redeemed.
 */
import type { EntityId, ISODateString } from "./common";

/** Leaderboard time window. */
export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "all-time";

/** Leaderboard entry (ranked user). */
export interface LeaderboardEntry {
  id: EntityId;
  rank: number;
  username: string;
  fullName: string;
  avatar?: string | null;
  /** Total INR value redeemed (primary ranking metric). */
  totalRedeemedInr: number;
  /** Total coins redeemed. */
  coinsRedeemed: number;
  /** True if this entry is the current authenticated user. */
  isCurrentUser?: boolean;
}

/** Leaderboard response (top entries + current user's standing). */
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
  /** Current user's entry (even if outside top N). */
  currentUser?: LeaderboardEntry;
  /** Total users on the leaderboard. */
  total: number;
}

/** Leaderboard query params. */
export interface LeaderboardQuery {
  period?: LeaderboardPeriod;
  /** Number of top entries to return. */
  limit?: number;
}
