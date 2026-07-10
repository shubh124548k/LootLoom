"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";
import { useWalletStore, useNotificationStore, useActivityStore } from "@/stores";
import type { ActivityItem, NotificationItem } from "@/types";

/**
 * useRealtimeSync — connects to the LootLoom real-time socket.io service.
 *
 * When authenticated, joins the user's personal room and listens for:
 * - wallet.updated → updates walletStore balance
 * - transaction.created → prepends to activity store
 * - notification.created → prepends to notification store + increments unread
 *
 * Uses the gateway pattern: io("/?XTransformPort=3003")
 * No manual refresh required.
 */
export function useRealtimeSync() {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const { setWallet } = useWalletStore();
  const { setItems: setNotifications } = useNotificationStore();
  const { setItems: setActivities } = useActivityStore();

  useEffect(() => {
    if (!session?.user) return;

    // Connect via gateway with XTransformPort
    const socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      const userId = (session.user as { id?: string }).id;
      if (userId) {
        socket.emit("auth", { userId });
      }
    });

    // Wallet balance updated
    socket.on("wallet.updated", (payload: { coinBalance: number; totalEarned?: number; totalSpent?: number }) => {
      setWallet({
        availableCoins: payload.coinBalance,
        lifetimeEarned: payload.totalEarned,
        lifetimeRedeemed: payload.totalSpent,
      });
    });

    // New transaction created
    socket.on("transaction.created", (payload: { id: string; type: string; amount: number; description: string; createdAt: string }) => {
      const activity: ActivityItem = {
        id: payload.id,
        type: payload.type.toLowerCase().includes("redeem") ? "redeemed" : "earned",
        title: payload.description || "Transaction",
        description: payload.description || "",
        amount: payload.amount,
        time: new Date(payload.createdAt).toLocaleString(),
      };
      // Prepend to activity feed
      setActivities([activity, ...useActivityStore.getState().items].slice(0, 20));
    });

    // New notification created
    socket.on("notification.created", (payload: { id: string; title: string; message: string; type: string; createdAt: string }) => {
      const notif: NotificationItem = {
        id: payload.id,
        title: payload.title,
        body: payload.message,
        time: new Date(payload.createdAt).toLocaleString(),
        type: (payload.type || "system").toLowerCase() as NotificationItem["type"],
        read: false,
      };
      const current = useNotificationStore.getState().items;
      setNotifications([notif, ...current].slice(0, 50));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session, setWallet, setNotifications, setActivities]);
}
