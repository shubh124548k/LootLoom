/**
 * LootLoom — Notification Models
 * User + CEO notification types.
 */
import type { EntityId, ISODateString, Timestamps } from "./common";

/** Notification type (drives icon + accent color). */
export type NotificationType =
  | "redeem_submitted"
  | "redeem_approved"
  | "redeem_rejected"
  | "coins_added"
  | "coins_deducted"
  | "ceo_message"
  | "support_reply"
  | "profile_updated"
  | "security_alert"
  | "system_event";

/** Notification status (read/unread). */
export type NotificationStatus = "read" | "unread";

/** Notification entity. */
export interface Notification extends Timestamps {
  id: EntityId;
  userId: EntityId;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  /** Related entity ID (redeem request ID, ticket ID, etc.). */
  referenceId?: EntityId | null;
  /** Deep-link view to navigate to when clicked. */
  linkView?: string | null;
}

/** Notification with computed fields (for UI). */
export interface NotificationWithMeta extends Notification {
  /** Relative time string (e.g. "2m ago"). */
  relativeTime: string;
  /** Icon name (lucide). */
  icon: string;
  /** Accent color. */
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
}

/** Mark notification as read request. */
export interface MarkReadRequest {
  notificationId: EntityId;
}

/** Mark all notifications as read response. */
export interface MarkAllReadResponse {
  updated: number;
}

/** Notification query params. */
export interface NotificationQuery {
  unreadOnly?: boolean;
  type?: NotificationType;
  page?: number;
  pageSize?: number;
}

/* ============================================================
   CEO Notifications
   ============================================================ */

/** CEO notification category. */
export type CeoNotificationCategory =
  | "redeem" // new redeem request
  | "user" // new user registered
  | "support" // support reply
  | "security" // security alert
  | "system"; // system event

/** CEO notification entity. */
export interface CeoNotification {
  id: EntityId;
  category: CeoNotificationCategory;
  title: string;
  body: string;
  read: boolean;
  time: ISODateString;
  referenceId?: EntityId;
}
