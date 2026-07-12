/**
 * LootLoom — Wallet Models
 * Coin balance, transactions, and earning/redemption types.
 */
import type { EntityId, ISODateString, PaginatedResponse, Timestamps } from "./common";

/** Wallet entity (one per user). */
export interface Wallet extends Timestamps {
  id: EntityId;
  userId: EntityId;
  coinBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
}

/** Lightweight coin balance (for header/widgets). */
export interface CoinBalance {
  available: number;
  pending: number;
  /** Cash value in INR (100 coins = ₹1). */
  cashValueInr: number;
}

/** Wallet summary (overview card). */
export interface WalletSummary {
  balance: CoinBalance;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  /** Weekly chart data for visualization. */
  weeklyChart: ChartPoint[];
}

/** Single chart data point. */
export interface ChartPoint {
  label: string;
  value: number;
  date?: ISODateString;
}

/** Transaction types supported by the platform. */
export type WalletTransactionType =
  | "ad_reward" // coins earned from watching an ad
  | "offerwall_reward" // coins earned from offerwall completion
  | "redeem_deduction" // coins deducted for a redemption
  | "admin_adjustment" // coins added/deducted by an admin
  | "referral_bonus" // coins from referral (future)
  | "daily_bonus" // coins from daily bonus (future)
  | "mission_reward"; // coins from mission completion (future)

/** Whether a transaction adds or removes coins. */
export type TransactionDirection = "credit" | "debit";

/** Transaction status. */
export type TransactionStatus = "completed" | "pending" | "failed" | "processing";

/** Transaction entity (ledger entry). */
export interface Transaction extends Timestamps {
  id: EntityId;
  userId: EntityId;
  type: WalletTransactionType;
  direction: TransactionDirection;
  amount: number; // always positive; direction indicates +/- 
  status: TransactionStatus;
  description: string;
  /** Related entity ID (e.g. redeem request ID, ad session ID). */
  referenceId?: EntityId | null;
  /** Running wallet balance after this transaction. */
  balanceAfter?: number;
  /** Admin/CEO message attached to admin adjustments. */
  adminNote?: string | null;
}

/** Paginated transaction history response. */
export type TransactionHistoryResponse = PaginatedResponse<Transaction>;

/** Wallet transaction query params. */
export interface TransactionQuery {
  page?: number;
  pageSize?: number;
  type?: WalletTransactionType;
  direction?: TransactionDirection;
  status?: TransactionStatus;
  startDate?: ISODateString;
  endDate?: ISODateString;
}
