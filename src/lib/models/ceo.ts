/**
 * LootLoom — CEO Models
 * Administration entities: CEO user, redeem approvals, audit log, notifications.
 */
import type { EntityId, ISODateString, PaginatedResponse, Timestamps } from "./common";
import type { RedeemRequestWithUser, RedeemApprovalRequest, RedeemApprovalResponse } from "./redeem";
import type { AccountStatus } from "./user";

/** Re-export for convenience. */
export type { RedeemRequestWithUser, RedeemApprovalRequest, RedeemApprovalResponse };

/** CEO user entity (administrator). */
export interface CeoUserEntity extends Timestamps {
  id: EntityId;
  fullName: string;
  email: string;
  role: "CEO" | "SUPER_ADMIN";
  avatar: string | null;
  phone: string | null;
  lastLoginAt: ISODateString | null;
  /** Whether 2FA is enabled. */
  twoFactorEnabled: boolean;
}

/** CEO action types (for audit log). */
export type AdminActionType =
  | "redeem_approved"
  | "redeem_rejected"
  | "user_updated"
  | "user_suspended"
  | "user_activated"
  | "user_frozen"
  | "support_reply"
  | "ticket_closed"
  | "ticket_resolved"
  | "profile_updated"
  | "password_changed"
  | "session_revoked"
  | "config_updated";

/** Admin action on a user account. */
export type AccountAction = "suspend" | "activate" | "freeze";

/** Admin action request. */
export interface AdminActionRequest {
  userId: EntityId;
  action: AccountAction;
  reason?: string;
}

/** Admin action response. */
export interface AdminActionResponse {
  userId: EntityId;
  status: AccountStatus;
  action: AccountAction;
  performedAt: ISODateString;
}

/** Audit log entry (CEO History page). */
export interface AuditLog extends Timestamps {
  id: EntityId;
  /** CEO who performed the action. */
  actorId: EntityId;
  actorName: string;
  actionType: AdminActionType;
  /** Display label (e.g. "Redeem Approved"). */
  actionLabel: string;
  /** Target user (if action was on a user). */
  targetUserId?: EntityId | null;
  targetUsername?: string | null;
  /** Free-form details. */
  details: string;
  /** IP address of the actor. */
  ipAddress?: string | null;
}

/** Audit log query params. */
export interface AuditLogQuery {
  actionType?: AdminActionType;
  actorId?: EntityId;
  page?: number;
  pageSize?: number;
  startDate?: ISODateString;
  endDate?: ISODateString;
}

/** Paginated audit log response. */
export type AuditLogResponse = PaginatedResponse<AuditLog>;

/** CEO dashboard summary (KPI cards). */
export interface CeoDashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingRedeems: number;
  completedRedeems: number;
  totalCoinsDistributed: number;
  totalPayoutInr: number;
  supportTickets: number;
  securityAlerts: number;
}

/** CEO user management list item. */
export interface CeoUserListItem {
  id: EntityId;
  username: string;
  fullName: string;
  email: string;
  avatar?: string | null;
  coins: number;
  totalRedeemedInr: number;
  status: AccountStatus;
  createdAt: ISODateString;
}

/** CEO user list query params. */
export interface CeoUserQuery {
  status?: AccountStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** Paginated CEO user list. */
export type CeoUserListResponse = PaginatedResponse<CeoUserListItem>;

/** CEO profile (for Settings page). */
export interface CeoProfile {
  id: EntityId;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: "CEO" | "SUPER_ADMIN";
  lastLoginAt: ISODateString | null;
}

/** Update CEO profile request. */
export interface UpdateCeoProfileRequest {
  fullName?: string;
  email?: string;
  phone?: string;
}

/** Change password request (CEO + user). */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Change password response. */
export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}
