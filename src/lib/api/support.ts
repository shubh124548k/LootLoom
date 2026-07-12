/**
 * LootLoom — Support API Service
 * Typed functions for user support tickets.
 */
import { httpClient, buildQueryString } from "./client";
import type {
  SupportTicket,
  SupportTicketWithMessages,
  CreateTicketRequest,
  CreateTicketResponse,
  ReplyRequest,
  ReplyResponse,
  TicketQuery,
  CloseTicketRequest,
} from "@/lib/models/support";
import type { PaginatedResponse } from "@/lib/models/common";

export const supportApi = {
  /* ---------- User ---------- */
  list: (query?: TicketQuery) =>
    httpClient.get<PaginatedResponse<SupportTicket>>(
      `/support${buildQueryString({
        status: query?.status,
        page: query?.page,
        pageSize: query?.pageSize,
        search: query?.search,
      })}`
    ),

  get: (id: string) =>
    httpClient.get<SupportTicketWithMessages>(`/support/${id}`),

  create: (data: CreateTicketRequest) =>
    httpClient.post<CreateTicketResponse>("/support", data),

  reply: (data: ReplyRequest) =>
    httpClient.post<ReplyResponse>("/support/reply", data),

  close: (data: CloseTicketRequest) =>
    httpClient.post<{ success: boolean }>("/support/close", data),
};
