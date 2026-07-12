/**
 * LootLoom — CEO API Service
 * Typed functions for the CEO administration area.
 *
 * All endpoints require CEO or SUPER_ADMIN role (enforced server-side).
 */
import { httpClient, buildQueryString } from "./client";
import type {
  CeoDashboardStats,
  CeoUserListItem,
  CeoUserQuery,
  CeoUserListResponse,
  CeoProfile,
  UpdateCeoProfileRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  AdminActionRequest,
  AdminActionResponse,
  AuditLog,
  AuditLogQuery,
  AuditLogResponse,
  RedeemRequestWithUser,
  RedeemApprovalRequest,
  RedeemApprovalResponse,
} from "@/lib/models/ceo";
import type {
  CeoNotification,
} from "@/lib/models/notification";
import type {
  SupportTicket,
  SupportTicketWithMessages,
  TicketQuery,
  ReplyResponse,
} from "@/lib/models/support";
import type { PaginatedResponse } from "@/lib/models/common";

export const ceoApi = {
  /* ---------- Dashboard ---------- */
  getDashboardStats: () =>
    httpClient.get<CeoDashboardStats>("/ceo/dashboard"),

  /* ---------- Redeem Requests ---------- */
  listRedeemRequests: (query?: { status?: string; page?: number; pageSize?: number; search?: string }) =>
    httpClient.get<PaginatedResponse<RedeemRequestWithUser>>(
      `/ceo/redeem${buildQueryString({
        status: query?.status,
        page: query?.page,
        pageSize: query?.pageSize,
        search: query?.search,
      })}`
    ),

  getRedeemRequest: (id: string) =>
    httpClient.get<RedeemRequestWithUser>(`/ceo/redeem/${id}`),

  approveRedeem: (data: RedeemApprovalRequest) =>
    httpClient.post<RedeemApprovalResponse>("/ceo/redeem/approve", data),

  rejectRedeem: (data: RedeemApprovalRequest) =>
    httpClient.post<RedeemApprovalResponse>("/ceo/redeem/reject", data),

  /* ---------- Users ---------- */
  listUsers: (query?: CeoUserQuery) =>
    httpClient.get<CeoUserListResponse>(
      `/ceo/users${buildQueryString({
        status: query?.status,
        search: query?.search,
        page: query?.page,
        pageSize: query?.pageSize,
      })}`
    ),

  getUser: (id: string) =>
    httpClient.get<CeoUserListItem>(`/ceo/users/${id}`),

  performUserAction: (data: AdminActionRequest) =>
    httpClient.post<AdminActionResponse>("/ceo/users/action", data),

  /* ---------- Notifications ---------- */
  listNotifications: (query?: { category?: string; page?: number; pageSize?: number }) =>
    httpClient.get<PaginatedResponse<CeoNotification>>(
      `/ceo/notifications${buildQueryString({
        category: query?.category,
        page: query?.page,
        pageSize: query?.pageSize,
      })}`
    ),

  markNotificationRead: (id: string) =>
    httpClient.patch<{ success: boolean }>(`/ceo/notifications/${id}/read`, {}),

  markAllNotificationsRead: () =>
    httpClient.post<{ updated: number }>("/ceo/notifications/read-all", {}),

  /* ---------- Support ---------- */
  listTickets: (query?: TicketQuery) =>
    httpClient.get<PaginatedResponse<SupportTicket>>(
      `/ceo/support${buildQueryString({
        status: query?.status,
        page: query?.page,
        pageSize: query?.pageSize,
        search: query?.search,
      })}`
    ),

  getTicket: (id: string) =>
    httpClient.get<SupportTicketWithMessages>(`/ceo/support/${id}`),

  replyTicket: (data: { ticketId: string; content: string }) =>
    httpClient.post<ReplyResponse>("/ceo/support/reply", data),

  closeTicket: (id: string, reason?: string) =>
    httpClient.post<{ success: boolean }>("/ceo/support/close", { ticketId: id, reason }),

  resolveTicket: (id: string) =>
    httpClient.post<{ success: boolean }>("/ceo/support/resolve", { ticketId: id }),

  /* ---------- History / Audit Log ---------- */
  listAuditLogs: (query?: AuditLogQuery) =>
    httpClient.get<AuditLogResponse>(
      `/ceo/audit${buildQueryString({
        actionType: query?.actionType,
        actorId: query?.actorId,
        page: query?.page,
        pageSize: query?.pageSize,
        startDate: query?.startDate,
        endDate: query?.endDate,
      })}`
    ),

  /* ---------- Profile + Settings ---------- */
  getProfile: () =>
    httpClient.get<CeoProfile>("/ceo/profile"),

  updateProfile: (data: UpdateCeoProfileRequest) =>
    httpClient.patch<CeoProfile>("/ceo/profile", data),

  changePassword: (data: ChangePasswordRequest) =>
    httpClient.post<ChangePasswordResponse>("/ceo/password", data),
};
