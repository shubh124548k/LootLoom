"use client";

import { useEffect, useState, useCallback } from "react";

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    status: string;
    memberSince: string;
    lastLogin: string | null;
  } | null;
  wallet: {
    coinBalance: number;
    totalEarned: number;
    totalSpent: number;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string | null;
    status: string;
    createdAt: string;
  }>;
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
  }>;
  unreadCount: number;
  stats: {
    todayEarnings: number;
    todayAdsWatched: number;
    weeklyEarnings: number;
    monthlyEarnings: number;
    totalAdsWatched: number;
    totalAdEarnings: number;
  };
  chart: Array<{ day: string; value: number }>;
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useDashboardData — fetches real aggregated dashboard data from /api/dashboard.
 *
 * - Initial load shows loading state (skeletons)
 * - New user with zero activity shows real empty data (0 coins, empty arrays)
 * - No fake data — everything from the backend
 * - Refetch on demand for refresh button
 */
export function useDashboardData(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/dashboard");
      if (resp.status === 401) {
        setError("Session expired");
        setData(null);
        return;
      }
      if (!resp.ok) {
        setError("Failed to load dashboard");
        return;
      }
      const json = await resp.json();
      if (json.success && json.data) {
        setData(json.data);
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

  return { data, loading, error, refetch: fetchData };
}
