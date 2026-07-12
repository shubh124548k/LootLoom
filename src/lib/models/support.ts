/**
 * LootLoom — Support Models
 * User support tickets + conversation thread.
 */
import type { EntityId, ISODateString, Timestamps } from "./common";

/** Ticket lifecycle status. */
export type TicketStatus =
  | "open" // user opened, awaiting first response
  | "pending" // awaiting user reply
  | "answered" // CEO replied, awaiting user
  | "resolved" // marked resolved
  | "closed"; // closed by CEO or user

/** Message sender role. */
export type MessageRole = "user" | "admin";

/** Support ticket entity. */
export interface SupportTicket extends Timestamps {
  id: EntityId;
  userId: EntityId;
  username: string;
  subject: string;
  status: TicketStatus;
  /** Last message preview (truncated). */
  lastMessage: string;
  lastMessageAt: ISODateString;
  /** Number of messages in the thread. */
  messageCount: number;
  /** CEO who last replied. */
  assignedTo?: EntityId | null;
  closedAt?: ISODateString | null;
}

/** Support message entity (single message in a ticket thread). */
export interface SupportMessage extends Timestamps {
  id: EntityId;
  ticketId: EntityId;
  role: MessageRole;
  content: string;
  /** Author name (user's fullName or "CEO"). */
  authorName: string;
}

/** Ticket with messages (detail view). */
export interface SupportTicketWithMessages extends SupportTicket {
  messages: SupportMessage[];
}

/** Create ticket request payload. */
export interface CreateTicketRequest {
  subject: string;
  message: string;
  /** Optional attachment URL (future). */
  attachmentUrl?: string;
}

/** Create ticket response. */
export interface CreateTicketResponse {
  ticket: SupportTicket;
  firstMessage: SupportMessage;
}

/** Reply request payload. */
export interface ReplyRequest {
  ticketId: EntityId;
  content: string;
}

/** Reply response. */
export interface ReplyResponse {
  ticket: SupportTicket;
  message: SupportMessage;
}

/** Close ticket request. */
export interface CloseTicketRequest {
  ticketId: EntityId;
  reason?: string;
}

/** Ticket query params. */
export interface TicketQuery {
  status?: TicketStatus;
  page?: number;
  pageSize?: number;
  search?: string;
}
