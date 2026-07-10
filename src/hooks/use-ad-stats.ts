"use client";

import { useEffect, useState, useCallback } from "react";

interface AdStats {
  todayAdsWatched: number;
  todayEarnings: number;
  totalAdsWatched: number;
  totalAdEarnings: number;
  dailyLimit: number;
  remaining: number;
}

interface UseAdStatsReturn {
  stats: AdStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useAdStats — fetches real ad statistics from /api/ads/session (GET).
 * Shows today's ads watched, earnings, daily limit, remaining.
 */
export function useAdStats(): UseAdStatsReturn {
  const [stats, setStats] = useState<AdStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/ads/session");
      if (resp.status === 401) {
        setError("Session expired");
        return;
      }
      if (!resp.ok) {
        setError("Failed to load ad stats");
        return;
      }
      const json = await resp.json();
      if (json.success && json.data) {
        setStats(json.data);
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

  return { stats, loading, error, refetch: fetchData };
}

/**
 * startAdSession — requests a new ad session from the backend.
 * Returns { sessionId, rewardAmount } or throws on error.
 */
export async function startAdSession(adType?: string) {
  const resp = await fetch("/api/ads/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adType: adType || "REWARDED_VIDEO" }),
  });
  const json = await resp.json();
  if (!json.success) {
    throw new Error(json.message || "Failed to start ad session");
  }
  return json.data as { sessionId: string; rewardAmount: number; watchedToday: number; limit: number; remaining: number };
}

/**
 * completeAdSession — verifies ad completion and credits coins.
 * Returns the new balance and transaction, or throws on error.
 */
export async function completeAdSession(sessionId: string) {
  const resp = await fetch("/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  const json = await resp.json();
  if (!json.success) {
    throw new Error(json.message || "Ad verification failed");
  }
  return json.data as { newBalance: number; rewardAmount: number; transaction: { id: string; type: string; amount: number; balanceAfter: number } };
}
