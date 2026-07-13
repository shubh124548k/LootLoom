"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useAuthStore, useUserStore, useWalletStore, useNotificationStore, useActivityStore } from "@/stores";
import type { NotificationItem, ActivityItem } from "@/types";

function fetchWithTimeout(url: string, ms = 15000, signal?: AbortSignal) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  if (signal) signal.addEventListener("abort", () => { ctrl.abort(); clearTimeout(timer); }, { once: true });
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function fetchRealUserData(userId: string, signal?: AbortSignal) {
  try {
    const userResp = await fetchWithTimeout("/api/user", 15000, signal);
    if (userResp.ok) {
      const userJson = await userResp.json();
      if (userJson.success && userJson.data) {
        const u = userJson.data;
        return {
          user: {
            id: u.id,
            fullName: u.name,
            username: u.username || "",
            email: u.email,
            avatar: u.avatar,
            role: u.role,
            status: u.status || "ACTIVE",
            emailVerified: u.emailVerified || false,
            memberSince: u.memberSince,
            lastLogin: u.lastLogin,
            passwordChangedAt: u.passwordChangedAt || null,
          },
          wallet: u.wallet ? {
            availableCoins: u.wallet.coinBalance ?? 0,
            lifetimeEarned: u.wallet.totalEarned ?? 0,
            lifetimeRedeemed: u.wallet.totalSpent ?? 0,
            walletId: u.wallet.id,
          } : null,
        };
      }
    }
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return null;
    console.error("Failed to fetch user data:", err);
  }
  return null;
}

async function fetchRealNotificationsAndActivity(signal?: AbortSignal) {
  try {
    const [notifResult, txnResult] = await Promise.allSettled([
      fetchWithTimeout("/api/notifications", 15000, signal),
      fetchWithTimeout("/api/transactions?page=1&pageSize=10", 15000, signal),
    ]);

    let notifications: NotificationItem[] = [];
    let unreadCount = 0;
    let activities: ActivityItem[] = [];

    if (notifResult.status === "fulfilled" && notifResult.value.ok) {
      try {
        const notifJson = await notifResult.value.json();
        if (notifJson.success && notifJson.data) {
          notifications = (notifJson.data.items || []).map((n: Record<string, unknown>) => ({
            id: n.id as string,
            title: n.title as string,
            body: n.message as string,
            time: new Date(n.createdAt as string).toLocaleString(),
            type: (n.type as string).toLowerCase() as NotificationItem["type"],
            read: n.read as boolean,
          }));
          unreadCount = notifJson.data.unreadCount || 0;
        }
      } catch { /* ignore parse errors */ }
    }

    if (txnResult.status === "fulfilled" && txnResult.value.ok) {
      try {
        const txnJson = await txnResult.value.json();
        if (txnJson.success && txnJson.data) {
          activities = (txnJson.data || []).map((t: Record<string, unknown>) => ({
            id: t.id as string,
            type: (t.type as string).toLowerCase().includes("redeem") ? "redeemed" : "earned",
            title: (t.description as string) || "Transaction",
            description: (t.description as string) || "",
            amount: t.amount as number,
            time: new Date(t.createdAt as string).toLocaleString(),
          }));
        }
      } catch { /* ignore parse errors */ }
    }

    return { notifications, unreadCount, activities };
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return { notifications: [], unreadCount: 0, activities: [] };
    console.error("Failed to fetch notifications/activity:", err);
    return { notifications: [], unreadCount: 0, activities: [] };
  }
}

export function AuthDataSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setAuthenticated, setRole } = useAuthStore();
  const { setUser, resetUser } = useUserStore();
  const { setWallet, resetWallet } = useWalletStore();
  const { setItems: setNotifications, resetNotifications, setUnreadCount } = useNotificationStore();
  const { setItems: setActivities } = useActivityStore();
  const lastFetchRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    const abortCtrl = new AbortController();

    if (status === "authenticated" && session?.user) {
      setAuthenticated(true);
      const role = (session.user as { role?: string }).role?.toLowerCase() === "ceo" ? "ceo" : "user";
      setRole(role as "user" | "ceo");

      setUser({
        id: (session.user as { id?: string }).id || null,
        fullName: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || null,
        role: (session.user as { role?: string }).role || "USER",
      });

      const userId = (session.user as { id?: string }).id;
      if (userId && userId !== lastFetchRef.current) {
        lastFetchRef.current = userId;
        void (async () => {
          try {
            const data = await fetchRealUserData(userId, abortCtrl.signal);
            if (!abortCtrl.signal.aborted && data) {
              setUser(data.user);
              if (data.wallet) setWallet(data.wallet);
            }
            const { notifications, unreadCount, activities } = await fetchRealNotificationsAndActivity(abortCtrl.signal);
            if (!abortCtrl.signal.aborted) {
              setNotifications(notifications);
              try { setUnreadCount(unreadCount); } catch { /* method may not exist */ }
              setActivities(activities);
            }
          } catch {
            // Session-only data is already set
          }
        })();
      }
    } else if (status === "unauthenticated") {
      setAuthenticated(false);
      resetUser();
      resetWallet();
      resetNotifications();
      lastFetchRef.current = null;
    }

    return () => abortCtrl.abort();
  }, [session, status, setAuthenticated, setRole, setUser, resetUser, setWallet, resetWallet, setNotifications, resetNotifications, setActivities]);

  return <>{children}</>;
}
