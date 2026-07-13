"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

async function fetchDashboard(): Promise<DashboardData> {
  const resp = await fetch("/api/dashboard");
  if (resp.status === 401) {
    throw new Error("Session expired");
  }
  if (!resp.ok) {
    throw new Error("Failed to load dashboard");
  }
  const json = await resp.json();
  if (json.success && json.data) {
    return json.data;
  }
  throw new Error("Failed to load dashboard");
}

export function useDashboardData() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<DashboardData, Error>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 15 * 1000,
    gcTime: 60 * 1000,
    retry: 1,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refetch: useCallback(() => refetch(), [refetch]),
  };
}
