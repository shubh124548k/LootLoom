import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { emitWalletUpdated, emitNotificationCreated, emitRedeemUpdated } from "@/lib/realtime";

/**
 * CEO authorization check — only CEO role can access these endpoints.
 */
async function requireCEO() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") return null;
  return session.user.id;
}

/**
 * GET /api/ceo/redeem — all redeem requests (CEO view).
 * Returns all redeem requests with user + reward details.
 * Payment details are masked for security (only show last 4 chars).
 */
export async function GET(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") where.status = status;

  const requests = await db.redeemRequest.findMany({
    where,
    include: { user: true, reward: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    success: true,
    data: requests.map((r) => ({
      id: r.id,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        avatar: r.user.avatar,
      },
      reward: {
        id: r.reward.id,
        name: r.reward.name,
        category: r.reward.category,
      },
      coinsUsed: r.coinsUsed,
      status: r.status,
      paymentMethod: r.paymentMethod,
      // Mask payment details for security — CEO sees only last 4 chars
      paymentDetailsMasked: r.paymentDetails ? `****${r.paymentDetails.slice(-4)}` : null,
      adminNote: r.adminNote,
      requestedAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  });
}

/**
 * PATCH /api/ceo/redeem — approve/reject/complete a redeem request.
 * Body: { requestId, action: "APPROVE" | "REJECT" | "COMPLETE", reason? }
 *
 * If REJECT: automatically refund coins to user's wallet + create REDEEM_REFUND transaction.
 * All actions: update status, create audit log, send notification, emit realtime event.
 */
export async function PATCH(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json();
  const { requestId, action, reason } = body;

  if (!requestId || !action) {
    return NextResponse.json({ success: false, message: "requestId and action required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const redeemRequest = await db.redeemRequest.findUnique({
    where: { id: requestId },
    include: { user: true, reward: true, wallet: true },
  });

  if (!redeemRequest) {
    return NextResponse.json({ success: false, message: "Request not found", code: "NOT_FOUND" }, { status: 404 });
  }

  let newStatus = redeemRequest.status;
  let refundAmount = 0;

  if (action === "APPROVE") {
    newStatus = "APPROVED";
  } else if (action === "REJECT") {
    newStatus = "REJECTED";
    refundAmount = redeemRequest.coinsUsed;
  } else if (action === "COMPLETE") {
    newStatus = "COMPLETED";
  } else {
    return NextResponse.json({ success: false, message: "Invalid action", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  // Update redeem request
  await db.redeemRequest.update({
    where: { id: requestId },
    data: { status: newStatus, adminNote: reason || null },
  });

  // If rejecting — refund coins
  if (refundAmount > 0) {
    const wallet = redeemRequest.wallet;
    const balanceBefore = wallet.coinBalance;
    const balanceAfter = balanceBefore + refundAmount;

    await db.wallet.update({
      where: { id: wallet.id },
      data: {
        coinBalance: balanceAfter,
        totalSpent: { decrement: refundAmount },
      },
    });

    // Create refund transaction
    await db.transaction.create({
      data: {
        userId: redeemRequest.userId,
        walletId: wallet.id,
        type: "ADMIN_ADJUSTMENT",
        amount: refundAmount,
        balanceBefore,
        balanceAfter,
        referenceId: requestId,
        description: `Refund: Redeem rejected - ${redeemRequest.reward.name}`,
        status: "COMPLETED",
      },
    });

    // Real-time wallet update
    void emitWalletUpdated(redeemRequest.userId, { coinBalance: balanceAfter, totalEarned: wallet.totalEarned, totalSpent: wallet.totalSpent - refundAmount });
  }

  // Notification to user
  const notifTitle = action === "APPROVE" ? "Redeem Approved!" : action === "REJECT" ? "Redeem Rejected" : "Redeem Completed!";
  const notifMsg = action === "APPROVE"
    ? `Your redeem request for ${redeemRequest.reward.name} has been approved and is being processed.`
    : action === "REJECT"
    ? `Your redeem request for ${redeemRequest.reward.name} was rejected. ${refundAmount > 0 ? `${refundAmount} coins have been refunded to your wallet.` : ""} ${reason ? `Reason: ${reason}` : ""}`
    : `Your redeem request for ${redeemRequest.reward.name} has been completed. Enjoy your reward!`;

  await db.notification.create({
    data: {
      userId: redeemRequest.userId,
      title: notifTitle,
      message: notifMsg,
      type: "REDEEM",
    },
  });

  // Audit log
  await db.auditLog.create({
    data: {
      actorId: ceoId,
      action: `REDEEM_${action}D`,
      targetId: requestId,
      metadata: JSON.stringify({ userId: redeemRequest.userId, rewardName: redeemRequest.reward.name, coins: redeemRequest.coinsUsed, reason }),
    },
  });

  // Real-time events
  void emitNotificationCreated(redeemRequest.userId, { id: "temp", title: notifTitle, message: notifMsg, type: "REDEEM", createdAt: new Date().toISOString() });
  void emitRedeemUpdated(redeemRequest.userId, { id: requestId, status: newStatus, rewardName: redeemRequest.reward.name });

  return NextResponse.json({
    success: true,
    message: `Redeem request ${newStatus.toLowerCase()}`,
    data: { requestId, status: newStatus, refundAmount },
  });
}
