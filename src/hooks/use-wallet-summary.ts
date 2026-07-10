"use client";

import { useEffect, useState, useCallback } from "react";

interface WalletSummary {
  coinBalance: number;
  totalEarned: number;
  totalSpent: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  pendingCoins: number;
  pendingRedeems: number;
  weeklyChart: Array<{ label: string; earned: number; redeemed: number }>;
  monthlyChart: Array<{ label: string; earned: number; redeemed: number }>;
}

interface UseWalletSummaryReturn {
  summary: WalletSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useWalletSummary — fetches real wallet summary from /api/wallet/summary.
 * Includes daily/weekly/monthly earnings + chart data.
 * No fake data — all from the backend.
 */
export function useWalletSummary(): UseWalletSummaryReturn {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/wallet/summary");
      if (resp.status === 401) {
        setError("Session expired");
        return;
      }
      if (!resp.ok) {
        setError("Failed to load wallet");
        return;
      }
      const json = await resp.json();
      if (json.success && json.data) {
        setSummary(json.data);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { summary, loading, error, refetch: fetchData };
}
