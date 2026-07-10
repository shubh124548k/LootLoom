import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/ads/complete — verify ad completion and credit coins
 * Body: { network, adType, rewardAmount, verificationId }
 * Flow: Ad completed → Backend verifies → Coins added → Wallet updated → Transaction created → Notification created
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const { network, adType, rewardAmount, verificationId } = body;

  if (!rewardAmount || rewardAmount <= 0) {
    return NextResponse.json({ success: false, message: "Invalid reward amount", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  // Get user's wallet
  const wallet = await db.wallet.findUnique({ where: { userId: session.user.id } });
  if (!wallet) {
    return NextResponse.json({ success: false, message: "Wallet not found", code: "WALLET_NOT_FOUND" }, { status: 404 });
  }

  // Create AdEvent record
  const adEvent = await db.adEvent.create({
    data: {
      userId: session.user.id,
      network: network || "unknown",
      adType: adType || "REWARDED_VIDEO",
      rewardAmount,
      status: "VERIFIED",
      verificationId: verificationId || null,
    },
  });

  // Atomic: credit coins + create ledger entry
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
        userId: session.user.id,
        walletId: wallet.id,
        type: "AD_REWARD",
        amount: rewardAmount,
        balanceBefore,
        balanceAfter,
        referenceId: adEvent.id,
        description: `Ad reward (${adType || "Rewarded Video"})`,
        status: "COMPLETED",
      },
    }),
  ]);

  // Create notification
  await db.notification.create({
    data: {
      userId: session.user.id,
      title: "Ad Reward Earned!",
      message: `You earned ${rewardAmount} coins from watching an ad.`,
      type: "REWARD",
    },
  });

  // Audit log
  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "AD_REWARD_CREDITED",
      targetId: transaction.id,
      metadata: JSON.stringify({ amount: rewardAmount, adEventId: adEvent.id }),
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      transaction,
      newBalance: updatedWallet.coinBalance,
    },
    message: `${rewardAmount} coins credited to your wallet`,
  });
}
