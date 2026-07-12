/**
 * LootLoom — History Models
 * User-facing activity history (redeems, credits, debits, bonuses).
 */
import type { EntityId, ISODateString } from "./common";
import type { RedeemStatus } from "./redeem";

/** History entry type (user-facing categorization). */
export type HistoryType =
  | "redeem"
  | "credit"
  | "debit"
  | "bonus"
  | "referral"
  | "system";

/** History entry status. */
export type HistoryItemStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

/** CEO message attached to history items (approval/rejection reason). */
export interface CeoMessage {
  id: EntityId;
  /** "Rejection Reason" | "Approval Message" | "CEO Message". */
  label: string;
  content: string;
  author: string;
  timestamp: ISODateString;
}

/** Admin reply (for support tickets, future-ready). */
export interface AdminReply {
  id: EntityId;
  content: string;
  author: string;
  timestamp: ISODateString;
}

/** History item (user-facing activity entry). */
export interface HistoryItem {
  id: EntityId;
  type: HistoryType;
  /** Display label (e.g. "Redeem Approved", "Ad Reward"). */
  title: string;
  description: string;
  /** Amount in INR (positive for credits, negative for debits). */
  amountInr?: number;
  /** Coin amount (positive for credits, negative for debits). */
  coins?: number;
  status: HistoryItemStatus;
  date: ISODateString;
  /** CEO/admin message (for redeem approvals/rejections). */
  ceoMessage?: CeoMessage | null;
  /** Related entity ID (redeem request ID, transaction ID, etc.). */
  referenceId?: EntityId;
}

/** History query params. */
export interface HistoryQuery {
  type?: HistoryType;
  status?: HistoryItemStatus;
  page?: number;
  pageSize?: number;
  startDate?: ISODateString;
  endDate?: ISODateString;
}

/** Helper: derive display label for a history item. */
export function deriveHistoryLabel(item: HistoryItem): string {
  if (item.type === "redeem") {
    switch (item.status) {
      case "pending": return "Redeem Requested";
      case "approved": return "Redeem Approved";
      case "rejected": return "Redeem Rejected";
      case "completed": return "Redeem Completed";
      case "cancelled": return "Redeem Cancelled";
    }
  }
  return item.title;
}
