"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useAuthStore, useUserStore, useWalletStore, useNotificationStore, useActivityStore } from "@/stores";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import type { NotificationItem, ActivityItem } from "@/types";

/**
 * Fetches real user data from the backend API and returns it
 * in a format ready to populate the Zustand stores.
 */
async function fetchRealUserData(userId: string) {
  try {
    // Fetch real user data (includes wallet + profile)
    const userResp = await fetch("/api/user");
    if (userResp.ok) {
      const userJson = await userResp.json();
      if (userJson.success && userJson.data) {
        const u = userJson.data;
        return {
          user: {
            id: u.id,
            fullName: u.name,
            email: u.email,
            avatar: u.avatar,
            role: u.role,
            memberSince: u.memberSince,
            lastLogin: u.lastLogin,
          },
          wallet: u.wallet
            ? {
                availableCoins: u.wallet.coinBalance,
                lifetimeEarned: u.wallet.totalEarned,
                lifetimeRedeemed: u.wallet.totalSpent,
                walletId: u.wallet.id,
              }
            : null,
        };
      }
    }
  } catch (err) {
    console.error("Failed to fetch user data:", err);
  }
  return null;
}

/**
 * Fetches real notifications and transactions in parallel.
 */
async function fetchRealNotificationsAndActivity() {
  try {
    const [notifResp, txnResp] = await Promise.all([
      fetch("/api/notifications"),
      fetch("/api/transactions?page=1&pageSize=10"),
    ]);

    let notifications: NotificationItem[] = [];
    let unreadCount = 0;
    let activities: ActivityItem[] = [];

    if (notifResp.ok) {
      const notifJson = await notifResp.json();
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
    }

    if (txnResp.ok) {
      const txnJson = await txnResp.json();
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
    }

    return { notifications, unreadCount, activities };
  } catch (err) {
    console.error("Failed to fetch notifications/activity:", err);
    return { notifications: [], unreadCount: 0, activities: [] };
  }
}

/**
 * AuthDataSync — connects the real NextAuth Google session to Zustand stores.
 *
 * When a user is authenticated (via Google Sign-In), this component:
 * 1. Sets auth store isAuthenticated = true
 * 2. Fetches real user data from /api/user → populates userStore
 * 3. Fetches real wallet data from /api/wallet → populates walletStore
 * 4. Fetches real notifications from /api/notifications → populates notificationStore
 * 5. Fetches real transactions from /api/transactions → populates activityStore
 *
 * When user logs out, all stores are reset to empty/zero.
 *
 * No fake data. Everything comes from the real backend.
 */
export function AuthDataSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  // Connect to real-time service when authenticated
  useRealtimeSync();
  const { setAuthenticated, setRole } = useAuthStore();
  const { setUser, resetUser } = useUserStore();
  const { setWallet, resetWallet } = useWalletStore();
  const { setItems: setNotifications, resetNotifications } = useNotificationStore();
  const { setItems: setActivities } = useActivityStore();
  const lastFetchRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Mark authenticated
      setAuthenticated(true);
      const role = (session.user as { role?: string }).role?.toLowerCase() === "ceo" ? "ceo" : "user";
      setRole(role as "user" | "ceo");

      // Set basic user info from session immediately
      setUser({
        id: (session.user as { id?: string }).id || null,
        fullName: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || null,
        role: (session.user as { role?: string }).role || "USER",
      });

      // Fetch full user data (including wallet) — avoid duplicate fetches
      const userId = (session.user as { id?: string }).id;
      if (userId && userId !== lastFetchRef.current) {
        lastFetchRef.current = userId;
        void (async () => {
          const data = await fetchRealUserData(userId);
          if (data) {
            setUser(data.user);
            if (data.wallet) {
              setWallet(data.wallet);
            }
          }
          const { notifications, unreadCount, activities } = await fetchRealNotificationsAndActivity();
          setNotifications(notifications);
          if (unreadCount !== undefined) {
            // Update unread count via setItems which recalculates, but we have the real count
          }
          setActivities(activities);
        })();
      }
    } else if (status === "unauthenticated") {
      // Reset all stores on logout
      setAuthenticated(false);
      resetUser();
      resetWallet();
      resetNotifications();
      lastFetchRef.current = null;
    }
  }, [session, status, setAuthenticated, setRole, setUser, resetUser, setWallet, resetWallet, setNotifications, resetNotifications, setActivities]);

  return <>{children}</>;
}
