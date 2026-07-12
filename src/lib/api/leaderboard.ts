/**
 * LootLoom — Leaderboard API Service
 * Typed functions for the leaderboard rankings.
 */
import { httpClient, buildQueryString } from "./client";
import type {
  LeaderboardResponse,
  LeaderboardQuery,
} from "@/lib/models/leaderboard";

export const leaderboardApi = {
  get: (query?: LeaderboardQuery) =>
    httpClient.get<LeaderboardResponse>(
      `/leaderboard${buildQueryString({
        period: query?.period,
        limit: query?.limit,
      })}`
    ),
};
