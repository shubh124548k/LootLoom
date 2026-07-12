/**
 * LootLoom — Notifications API Service
 * Typed functions for user notifications.
 */
import { httpClient, buildQueryString } from "./client";
import type {
  Notification,
  NotificationQuery,
  MarkAllReadResponse,
} from "@/lib/models/notification";
import type { PaginatedResponse } from "@/lib/models/common";

export const notificationsApi = {
  list: (query?: NotificationQuery) =>
    httpClient.get<PaginatedResponse<Notification>>(
      `/notifications${buildQueryString({
        unreadOnly: query?.unreadOnly,
        type: query?.type,
        page: query?.page,
        pageSize: query?.pageSize,
      })}`
    ),

  markRead: (id: string) =>
    httpClient.patch<{ success: boolean }>(`/notifications/${id}/read`, {}),

  markAllRead: () =>
    httpClient.post<MarkAllReadResponse>("/notifications/read-all", {}),

  delete: (id: string) =>
    httpClient.delete<{ success: boolean }>(`/notifications/${id}`),
};
