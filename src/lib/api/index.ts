/**
 * LootLoom — API Service Layer Barrel Export
 *
 * Single import point for all API services.
 *
 * Usage:
 *   import { userApi, walletApi, ceoApi } from "@/lib/api";
 *
 * All services use the typed HttpClient (@/lib/api/client) which:
 *   - Unwraps ApiResponse<T> envelopes automatically
 *   - Throws ApiError subclasses on failure (see @/lib/errors)
 *   - Forwards NextAuth JWT cookies via credentials: "include"
 *   - Supports AbortSignal for cancellable requests
 *
 * No fake responses. No mock data. Pure typed transport layer
 * ready for OpenCode backend implementation.
 */
export { httpClient, request, buildQueryString, buildListQuery, requestRaw } from "./client";
export type { HttpClient, RequestOptions } from "./client";

export { authApi } from "./auth";
export { userApi } from "./user";
export { walletApi } from "./wallet";
export { rewardsApi } from "./rewards";
export { redeemApi } from "./redeem";
export { historyApi } from "./history";
export { notificationsApi } from "./notifications";
export { leaderboardApi } from "./leaderboard";
export { supportApi } from "./support";
export { ceoApi } from "./ceo";
