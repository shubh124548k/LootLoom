/**
 * LootLoom — History API Service
 * Typed functions for user activity history.
 */
import { httpClient, buildQueryString } from "./client";
import type {
  HistoryItem,
  HistoryQuery,
} from "@/lib/models/history";
import type { PaginatedResponse } from "@/lib/models/common";

export const historyApi = {
  list: (query?: HistoryQuery) =>
    httpClient.get<PaginatedResponse<HistoryItem>>(
      `/transactions${buildQueryString({
        type: query?.type,
        status: query?.status,
        page: query?.page,
        pageSize: query?.pageSize,
        startDate: query?.startDate,
        endDate: query?.endDate,
      })}`
    ),

  get: (id: string) =>
    httpClient.get<HistoryItem>(`/transactions/${id}`),
};
