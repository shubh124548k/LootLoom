/**
 * LootLoom — Wallet API Service
 * Typed functions for wallet balance, transactions, and history.
 */
import { httpClient, buildQueryString } from "./client";
import type {
  Wallet,
  WalletSummary,
  Transaction,
  TransactionQuery,
  TransactionHistoryResponse,
} from "@/lib/models/wallet";

export const walletApi = {
  /* ---------- Wallet ---------- */
  getWallet: () =>
    httpClient.get<Wallet>("/wallet"),

  getSummary: () =>
    httpClient.get<WalletSummary>("/wallet/summary"),

  /* ---------- Transactions ---------- */
  getTransactions: (query?: TransactionQuery) =>
    httpClient.get<TransactionHistoryResponse>(
      `/wallet/transactions${buildQueryString({
        page: query?.page,
        pageSize: query?.pageSize,
        type: query?.type,
        direction: query?.direction,
        status: query?.status,
        startDate: query?.startDate,
        endDate: query?.endDate,
      })}`
    ),

  getTransaction: (id: string) =>
    httpClient.get<Transaction>(`/wallet/transactions/${id}`),

  /* ---------- Admin Adjustment (CEO only) ---------- */
  adjustBalance: (data: { userId: string; amount: number; reason: string }) =>
    httpClient.post<Transaction>("/wallet/adjust", data),
};
