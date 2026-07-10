import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/redeem — submit a redeem request
 * Body: { rewardId, paymentMethod, paymentDetails }
 * Flow: User redeems → coins debited → request created → CEO notified
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const { rewardId, paymentMethod, paymentDetails } = body;

  // Get reward
  const reward = await db.reward.findUnique({ where: { id: rewardId } });
  if (!reward || reward.status !== "ACTIVE") {
    return NextResponse.json({ success: false, message: "Reward not available", code: "REWARD_NOT_FOUND" }, { status: 404 });
  }

  // Get wallet
  const wallet = await db.wallet.findUnique({ where: { userId: session.user.id } });
  if (!wallet) {
    return NextResponse.json({ success: false, message: "Wallet not found", code: "WALLET_NOT_FOUND" }, { status: 404 });
  }

  // Check sufficient balance
  if (wallet.coinBalance < reward.coinCost) {
    return NextResponse.json({ success: false, message: "Insufficient coins", code: "INSUFFICIENT_BALANCE" }, { status: 422 });
  }

  // Atomic: debit coins + create ledger entry + create redeem request
  const balanceBefore = wallet.coinBalance;
  const balanceAfter = balanceBefore - reward.coinCost;

  const [updatedWallet, transaction, redeemRequest] = await Promise.all([
    db.wallet.update({
      where: { id: wallet.id },
      data: {
        coinBalance: balanceAfter,
        totalSpent: { increment: reward.coinCost },
      },
    }),
    db.transaction.create({
      data: {
        userId: session.user.id,
        walletId: wallet.id,
        type: "REDEEM",
        amount: -reward.coinCost,
        balanceBefore,
        balanceAfter,
        description: `Redeem: ${reward.name}`,
        status: "COMPLETED",
      },
    }),
    db.redeemRequest.create({
      data: {
        userId: session.user.id,
        rewardId: reward.id,
        walletId: wallet.id,
        coinsUsed: reward.coinCost,
        paymentMethod: paymentMethod || null,
        paymentDetails: paymentDetails || null,
        status: "PENDING",
      },
    }),
  ]);

  // Create notification
  await db.notification.create({
    data: {
      userId: session.user.id,
      title: "Redeem Request Submitted",
      message: `Your redeem request for ${reward.name} has been submitted and is pending review.`,
      type: "REDEEM",
    },
  });

  // Audit log
  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "REDEEM_REQUESTED",
      targetId: redeemRequest.id,
      metadata: JSON.stringify({ rewardId, coinsUsed: reward.coinCost }),
    },
  });

  return NextResponse.json({
    success: true,
    data: { redeemRequest, newBalance: updatedWallet.coinBalance },
    message: "Redeem request submitted successfully",
  });
}

/**
 * GET /api/redeem — user's redeem history
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const requests = await db.redeemRequest.findMany({
    where: { userId: session.user.id },
    include: { reward: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: requests });
}
