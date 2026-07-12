/**
 * LootLoom — Realtime Client (Socket.IO-ready)
 *
 * Frontend integration layer for Socket.IO realtime events.
 *
 * Architecture:
 *   - Backend (mini-service on port 3003) runs Socket.IO server.
 *   - Frontend connects via gateway: io("/?XTransformPort=3003")
 *   - Server emits events to user's private room (userId) or CEO room.
 *   - This module provides typed event constants + a useRealtime hook.
 *
 * SECURITY: The server only emits events to authenticated users' own rooms.
 * The frontend can only receive, never emit sensitive events.
 *
 * This file provides:
 *   - RealtimeEvent type union (all possible events)
 *   - RealtimePayload map (event → payload type)
 *   - useRealtime hook (subscribe to events)
 *   - useWalletRealtime / useNotificationRealtime / useRedeemRealtime helpers
 *   - useCeoRealtime (CEO-specific events)
 */
import { useEffect, useRef } from "react";
import type { io } from "socket.io-client";

/* ============================================================
   Event Types + Payloads
   ============================================================ */

/** All realtime events the frontend can receive. */
export type RealtimeEvent =
  // User events
  | "wallet.updated"
  | "transaction.created"
  | "notification.created"
  | "redeem.updated"
  | "support.reply"
  | "session.revoked"
  // CEO events
  | "ceo:new-user"
  | "ceo:redeem-created"
  | "ceo:redeem-updated"
  | "ceo:support-created"
  | "ceo:support-reply"
  | "ceo:security-alert"
  | "ceo:system-event";

/** Event → payload type mapping for type-safe subscriptions. */
export interface RealtimePayloadMap {
  "wallet.updated": {
    coinBalance: number;
    pendingBalance?: number;
    totalEarned?: number;
    totalSpent?: number;
  };
  "transaction.created": {
    id: string;
    type: string;
    direction: "credit" | "debit";
    amount: number;
    description: string;
    createdAt: string;
  };
  "notification.created": {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
  };
  "redeem.updated": {
    id: string;
    status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
    rewardName?: string;
    adminMessage?: string;
  };
  "support.reply": {
    ticketId: string;
    message: string;
    authorName: string;
    createdAt: string;
  };
  "session.revoked": {
    reason: string;
    timestamp: string;
  };
  "ceo:new-user": {
    userId: string;
    name: string;
    email: string;
  };
  "ceo:redeem-created": {
    requestId: string;
    userId: string;
    username: string;
    rewardName: string;
    coins: number;
  };
  "ceo:redeem-updated": {
    requestId: string;
    status: string;
    processedBy: string;
  };
  "ceo:support-created": {
    ticketId: string;
    userId: string;
    subject: string;
  };
  "ceo:support-reply": {
    ticketId: string;
    userId: string;
    message: string;
  };
  "ceo:security-alert": {
    type: string;
    userId: string;
    severity: "low" | "medium" | "high" | "critical";
    message: string;
  };
  "ceo:system-event": {
    type: string;
    message: string;
    timestamp: string;
  };
}

/** Type-safe event handler. */
export type RealtimeHandler<K extends RealtimeEvent> = (
  payload: RealtimePayloadMap[K]
) => void;

/* ============================================================
   Socket Client (singleton)
   ============================================================ */

let socketRef: ReturnType<typeof io> | null = null;
let connectionPromise: Promise<ReturnType<typeof io>> | null = null;

/**
 * Get the singleton Socket.IO client. Connects lazily on first call.
 * Connection URL uses the gateway pattern (?XTransformPort=3003) so Caddy
 * forwards to the realtime mini-service.
 */
export async function getSocket(): Promise<ReturnType<typeof io>> {
  if (socketRef?.connected) return socketRef;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const { io } = await import("socket.io-client");
    const socket = io("/", {
      path: "/socket.io",
      transports: ["websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      // Gateway forwarding query
      query: { XTransformPort: "3003" },
    });

    socket.on("connect", () => {
      // Connection established — server will join this socket to the user's room
    });
    socket.on("connect_error", () => {
      // Silent — realtime is a nice-to-have
    });
    socket.on("disconnect", () => {
      // Will auto-reconnect
    });

    socketRef = socket;
    return socket;
  })();

  return connectionPromise;
}

/** Disconnect the socket (called on logout). */
export function disconnectSocket(): void {
  if (socketRef) {
    socketRef.disconnect();
    socketRef = null;
    connectionPromise = null;
  }
}

/* ============================================================
   useRealtime Hook
   ============================================================ */

/**
 * Subscribe to a realtime event. Automatically cleans up on unmount.
 *
 * Usage:
 *   useRealtime("wallet.updated", (payload) => {
 *     useWalletStore.getState().setWallet({ availableCoins: payload.coinBalance });
 *   });
 */
export function useRealtime<K extends RealtimeEvent>(
  event: K,
  handler: RealtimeHandler<K>
): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    getSocket()
      .then((socket) => {
        if (cancelled) return;
        const listener = ((payload: RealtimePayloadMap[K]) => {
          handlerRef.current(payload);
        }) as (...args: unknown[]) => void;
        socket.on(event, listener as never);
        cleanup = () => {
          socket.off(event, listener as never);
        };
      })
      .catch(() => {
        // Silent — realtime is best-effort
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [event]);
}

/* ============================================================
   Domain-specific Hooks
   ============================================================ */

/**
 * Subscribe to wallet updates. Auto-syncs to the wallet store.
 *
 * Usage:
 *   useWalletRealtime(); // call once at the app root
 */
export function useWalletRealtime(
  onUpdated?: (payload: RealtimePayloadMap["wallet.updated"]) => void
): void {
  useRealtime("wallet.updated", (payload) => {
    onUpdated?.(payload);
  });
  useRealtime("transaction.created", (payload) => {
    // Could trigger a refetch or toast
    void payload;
  });
}

/**
 * Subscribe to notification updates.
 */
export function useNotificationRealtime(
  onCreated?: (payload: RealtimePayloadMap["notification.created"]) => void
): void {
  useRealtime("notification.created", (payload) => {
    onCreated?.(payload);
  });
}

/**
 * Subscribe to redeem status updates.
 */
export function useRedeemRealtime(
  onUpdated?: (payload: RealtimePayloadMap["redeem.updated"]) => void
): void {
  useRealtime("redeem.updated", (payload) => {
    onUpdated?.(payload);
  });
}

/**
 * Subscribe to support ticket replies.
 */
export function useSupportRealtime(
  onReply?: (payload: RealtimePayloadMap["support.reply"]) => void
): void {
  useRealtime("support.reply", (payload) => {
    onReply?.(payload);
  });
}

/**
 * Subscribe to session revocation (force logout).
 */
export function useSessionRevoked(
  onRevoked?: (payload: RealtimePayloadMap["session.revoked"]) => void
): void {
  useRealtime("session.revoked", (payload) => {
    onRevoked?.(payload);
  });
}

/* ============================================================
   CEO Realtime Hooks
   ============================================================ */

/**
 * Subscribe to all CEO realtime events. Call once in the CEO layout.
 */
export function useCeoRealtime(handlers: {
  onNewUser?: RealtimeHandler<"ceo:new-user">;
  onRedeemCreated?: RealtimeHandler<"ceo:redeem-created">;
  onRedeemUpdated?: RealtimeHandler<"ceo:redeem-updated">;
  onSupportCreated?: RealtimeHandler<"ceo:support-created">;
  onSupportReply?: RealtimeHandler<"ceo:support-reply">;
  onSecurityAlert?: RealtimeHandler<"ceo:security-alert">;
  onSystemEvent?: RealtimeHandler<"ceo:system-event">;
}): void {
  useRealtime("ceo:new-user", (p) => handlers.onNewUser?.(p));
  useRealtime("ceo:redeem-created", (p) => handlers.onRedeemCreated?.(p));
  useRealtime("ceo:redeem-updated", (p) => handlers.onRedeemUpdated?.(p));
  useRealtime("ceo:support-created", (p) => handlers.onSupportCreated?.(p));
  useRealtime("ceo:support-reply", (p) => handlers.onSupportReply?.(p));
  useRealtime("ceo:security-alert", (p) => handlers.onSecurityAlert?.(p));
  useRealtime("ceo:system-event", (p) => handlers.onSystemEvent?.(p));
}
