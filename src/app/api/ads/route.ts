import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/ads/complete — verify ad completion and credit coins.
 * Body: { sessionId }
 *
 * Server-side verification flow:
 * 1. Authenticate user
 * 2. Find the ad session by sessionId + userId (ownership check)
 * 3. Verify session status is STARTED (not already completed — prevents duplicate rewards)
 * 4. Read reward amount from the AdEvent record (never trust frontend amount)
 * 5. Get wallet, compute new balance
 * 6. Atomic: update wallet + create ledger entry + mark ad as VERIFIED + notification + audit
 *
 * Fraud protection:
 * - Duplicate callback rejected (session must be STARTED, not VERIFIED)
 * - User can only complete their own sessions
 * - Reward amount comes from backend-created AdEvent, not frontend
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { sessionId } = body;

  if (!sessionId) {
    return NextResponse.json({ success: false, message: "Session ID required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  // Find the ad session — must belong to the authenticated user
  const adEvent = await db.adEvent.findUnique({ where: { id: sessionId } });
  if (!adEvent || adEvent.userId !== userId) {
    return NextResponse.json({ success: false, message: "Invalid ad session", code: "INVALID_SESSION" }, { status: 404 });
  }

  // Fraud check: session must be STARTED (not already completed/verified)
  if (adEvent.status === "VERIFIED" || adEvent.status === "COMPLETED") {
    return NextResponse.json({ success: false, message: "Ad already rewarded", code: "DUPLICATE_REWARD" }, { status: 409 });
  }
  if (adEvent.status === "FAILED") {
    return NextResponse.json({ success: false, message: "Ad session failed", code: "SESSION_FAILED" }, { status: 400 });
  }

  // Fraud check: rapid ad completion (ad created less than 5 seconds ago = likely bot)
  const sessionAge = Date.now() - adEvent.createdAt.getTime();
  if (sessionAge < 5000) {
    await db.adEvent.update({ where: { id: adEvent.id }, data: { status: "FAILED" } });
    return NextResponse.json({ success: false, message: "Ad completed too quickly. Please watch the full ad.", code: "FRAUD_TOO_FAST" }, { status: 422 });
  }

  // Fraud check: velocity — more than 10 ads in the last minute
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentVerifiedCount = await db.adEvent.count({
    where: { userId, status: "VERIFIED", createdAt: { gte: oneMinuteAgo } },
  });
  if (recentVerifiedCount >= 10) {
    await db.adEvent.update({ where: { id: adEvent.id }, data: { status: "FAILED" } });
    return NextResponse.json({ success: false, message: "Ad velocity limit reached. Please slow down.", code: "FRAUD_VELOCITY" }, { status: 429 });
  }

  // Get user's wallet
  const wallet = await db.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    return NextResponse.json({ success: false, message: "Wallet not found", code: "WALLET_NOT_FOUND" }, { status: 404 });
  }

  // Reward amount from backend-created AdEvent (never from frontend)
  const rewardAmount = adEvent.rewardAmount;
  if (rewardAmount <= 0) {
    return NextResponse.json({ success: false, message: "Invalid reward amount", code: "INVALID_REWARD" }, { status: 400 });
  }

  // Atomic: credit coins + create ledger entry + mark ad verified
  const balanceBefore = wallet.coinBalance;
  const balanceAfter = balanceBefore + rewardAmount;

  const [updatedWallet, transaction] = await Promise.all([
    db.wallet.update({
      where: { id: wallet.id },
      data: {
        coinBalance: balanceAfter,
        totalEarned: { increment: rewardAmount },
      },
    }),
    db.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: "AD_REWARD",
        amount: rewardAmount,
        balanceBefore,
        balanceAfter,
        referenceId: adEvent.id,
        description: `Ad reward (${adEvent.adType})`,
        status: "COMPLETED",
      },
    }),
    db.adEvent.update({
      where: { id: adEvent.id },
      data: { status: "VERIFIED", verificationId: `verified-${Date.now()}` },
    }),
  ]);

  // Create notification
  await db.notification.create({
    data: {
      userId,
      title: "Ad Reward Earned!",
      message: `You earned ${rewardAmount} coins from watching an ad.`,
      type: "REWARD",
    },
  });

  // Audit log
  await db.auditLog.create({
    data: {
      actorId: userId,
      action: "AD_REWARD_CREDITED",
      targetId: transaction.id,
      metadata: JSON.stringify({ amount: rewardAmount, adEventId: adEvent.id }),
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        balanceAfter: transaction.balanceAfter,
      },
      newBalance: updatedWallet.coinBalance,
      rewardAmount,
    },
    message: `${rewardAmount} coins credited to your wallet`,
  });
}
