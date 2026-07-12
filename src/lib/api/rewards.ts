/**
 * LootLoom — Rewards API Service
 * Typed functions for the reward catalog.
 */
import { httpClient, buildQueryString } from "./client";
import type {
  Reward,
  RewardCatalog,
  RewardQuery,
  RewardRedeemPreview,
} from "@/lib/models/reward";

export const rewardsApi = {
  /* ---------- Catalog ---------- */
  list: (query?: RewardQuery) =>
    httpClient.get<RewardCatalog>(
      `/rewards${buildQueryString({
        category: query?.category,
        availability: query?.availability,
        maxCoins: query?.maxCoins,
        search: query?.search,
        sortBy: query?.sortBy,
        sortOrder: query?.sortOrder,
      })}`
    ),

  get: (id: string) =>
    httpClient.get<Reward>(`/rewards/${id}`),

  /* ---------- Redeem Preview (checks eligibility) ---------- */
  previewRedeem: (id: string) =>
    httpClient.get<RewardRedeemPreview>(`/rewards/${id}/preview-redeem`),
};
