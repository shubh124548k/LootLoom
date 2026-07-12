/**
 * LootLoom — Redeem API Service
 * Typed functions for user redemption requests.
 */
import { httpClient, buildQueryString } from "./client";
import type {
  CreateRedeemRequest,
  RedeemResponse,
  RedeemRequest,
  RedeemQuery,
} from "@/lib/models/redeem";
import type { PaginatedResponse as GenericPaginated } from "@/lib/models/common";

export const redeemApi = {
  /* ---------- User ---------- */
  create: (data: CreateRedeemRequest) =>
    httpClient.post<RedeemResponse>("/redeem", data),

  list: (query?: RedeemQuery) =>
    httpClient.get<GenericPaginated<RedeemRequest>>(
      `/redeem/history${buildQueryString({
        status: query?.status,
        page: query?.page,
        pageSize: query?.pageSize,
      })}`
    ),

  get: (id: string) =>
    httpClient.get<RedeemRequest>(`/redeem/${id}`),

  cancel: (id: string) =>
    httpClient.post<{ success: boolean }>(`/redeem/${id}/cancel`, {}),
};
