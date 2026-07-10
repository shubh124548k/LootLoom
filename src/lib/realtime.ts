/**
 * LootLoom — Real-time event emitter.
 * API routes call these functions to emit events to the socket.io service.
 * The socket.io service then forwards to the user's private room.
 *
 * Security: events are only emitted server-side (from API routes),
 * never from the frontend. Users can only receive their own events.
 */

interface RealtimePayload {
  [key: string]: unknown;
}

/**
 * Emit an event to a specific user's private channel.
 * Uses the internal server:emit protocol on the socket.io service.
 */
async function emitToUser(userId: string, event: string, payload: RealtimePayload): Promise<void> {
  try {
    // Emit via the socket.io service's internal endpoint
    await fetch("http://localhost:3003/?XTransformPort=3003", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        event,
        payload,
      }),
    }).catch(() => {
      // Non-blocking: realtime service may be down; DB is source of truth
    });
  } catch {
    // Silent fail — realtime is a nice-to-have, not critical
  }
}

/**
 * Emit an event to the CEO channel.
 */
async function emitToCEO(event: string, payload: RealtimePayload): Promise<void> {
  try {
    await fetch("http://localhost:3003/?XTransformPort=3003", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "ceo",
        event: `ceo:${event}`,
        payload,
      }),
    }).catch(() => {});
  } catch {
    // Silent fail
  }
}

// ─── Typed event emitters ───────────────────────────────────────────────────

export async function emitWalletUpdated(userId: string, data: { coinBalance: number; totalEarned?: number; totalSpent?: number }): Promise<void> {
  await emitToUser(userId, "wallet.updated", data);
}

export async function emitTransactionCreated(userId: string, data: { id: string; type: string; amount: number; description: string; createdAt: string }): Promise<void> {
  await emitToUser(userId, "transaction.created", data);
}

export async function emitNotificationCreated(userId: string, data: { id: string; title: string; message: string; type: string; createdAt: string }): Promise<void> {
  await emitToUser(userId, "notification.created", data);
}

export async function emitRedeemUpdated(userId: string, data: { id: string; status: string; rewardName?: string }): Promise<void> {
  await emitToUser(userId, "redeem.updated", data);
}

export async function emitSupportReply(userId: string, data: { ticketId: string; message: string; createdAt: string }): Promise<void> {
  await emitToUser(userId, "support.reply", data);
}

// CEO events
export async function emitNewUser(data: { userId: string; name: string; email: string }): Promise<void> {
  await emitToCEO("new.user", data);
}

export async function emitRedeemCreated(data: { requestId: string; userId: string; rewardName: string; coins: number }): Promise<void> {
  await emitToCEO("redeem.created", data);
}

export async function emitSupportCreated(data: { ticketId: string; userId: string; subject: string }): Promise<void> {
  await emitToCEO("support.created", data);
}

export async function emitSecurityAlert(data: { type: string; userId: string; severity: string; message: string }): Promise<void> {
  await emitToCEO("security.alert", data);
}
