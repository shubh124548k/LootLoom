/**
 * LootLoom — Redeem Models
 * User redemption requests + CEO approval flow.
 */
import type { EntityId, ISODateString, Timestamps } from "./common";
import type { Reward } from "./reward";

/** Redeem request lifecycle. */
export type RedeemStatus =
  | "pending" // awaiting CEO review
  | "approved" // CEO approved, pending fulfillment
  | "rejected" // CEO rejected
  | "completed" // reward delivered to user
  | "cancelled"; // user cancelled

/** Create redeem request payload. */
export interface CreateRedeemRequest {
  rewardId: EntityId;
  /** Optional user message to CEO (e.g. UPI ID, account details). */
  userMessage?: string;
}

/** Redeem request entity. */
export interface RedeemRequest extends Timestamps {
  id: EntityId;
  userId: EntityId;
  username: string;
  fullName: string;
  rewardId: EntityId;
  /** Snapshot of reward at request time. */
  reward: Pick<Reward, "name" | "cashValue" | "coinsRequired">;
  /** Coins deducted at request time (snapshot). */
  coins: number;
  /** Cash value in INR the user will receive. */
  rewardAmountInr: number;
  status: RedeemStatus;
  /** User's message to CEO. */
  userMessage?: string | null;
  /** CEO's message to user (approval reason / rejection reason). */
  adminMessage?: string | null;
  /** CEO who processed the request. */
  processedBy?: EntityId | null;
  processedAt?: ISODateString | null;
}

/** Redeem response (after creating a request). */
export interface RedeemResponse {
  request: RedeemRequest;
  /** New wallet balance after coin deduction. */
  newBalance: number;
}

/** Redeem request query params (for user history). */
export interface RedeemQuery {
  status?: RedeemStatus;
  page?: number;
  pageSize?: number;
}

/* ============================================================
   CEO Approval Flow
   ============================================================ */

/** CEO redeem approval request. */
export interface RedeemApprovalRequest {
  requestId: EntityId;
  action: "approve" | "reject";
  /** Required for reject, optional for approve. */
  adminMessage?: string;
}

/** CEO redeem approval response. */
export interface RedeemApprovalResponse {
  request: RedeemRequest;
  /** Updated wallet balance if coins were refunded (on reject). */
  newBalance?: number;
}

/** Redeem request with user info (CEO view). */
export interface RedeemRequestWithUser extends RedeemRequest {
  userAvatar?: string | null;
  userEmail: string;
  userCreatedAt: ISODateString;
}
