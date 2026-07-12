import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEarnConfigValue } from "@/lib/earn/config";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const referralCode = await db.referralCode.findUnique({
    where: { userId: session.user.id },
  });

  const referrals = await db.referral.findMany({
    where: { referrerId: session.user.id },
    include: { referee: { select: { name: true, username: true, avatar: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: {
      code: referralCode?.code || null,
      totalReferrals: referrals.length,
      rewardGiven: referrals.filter((r) => r.rewardGiven).length,
      pendingRewards: referrals.filter((r) => !r.rewardGiven).length,
      referrals: referrals.map((r) => ({
        id: r.id,
        referee: {
          name: r.referee.name,
          username: r.referee.username,
          avatar: r.referee.avatar,
        },
        rewardGiven: r.rewardGiven,
        createdAt: r.createdAt,
      })),
    },
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const referralReward = await getEarnConfigValue("REFERRAL_REWARD");

  const pendingReferrals = await db.referral.findMany({
    where: { referrerId: session.user.id, rewardGiven: false },
  });

  if (pendingReferrals.length === 0) {
    return NextResponse.json({ success: false, message: "No pending referral rewards", code: "NO_PENDING" }, { status: 400 });
  }

  const wallet = await db.wallet.findUnique({ where: { userId: session.user.id } });
  if (!wallet) {
    return NextResponse.json({ success: false, message: "Wallet not found", code: "WALLET_NOT_FOUND" }, { status: 404 });
  }

  let totalReward = 0;
  await db.$transaction(async (tx) => {
    for (const ref of pendingReferrals) {
      await tx.referral.update({
        where: { id: ref.id },
        data: { rewardGiven: true },
      });
      totalReward += referralReward;
    }

    const balanceBefore = wallet.coinBalance;
    const balanceAfter = balanceBefore + totalReward;

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        coinBalance: { increment: totalReward },
        totalEarned: { increment: totalReward },
      },
    });

    await tx.transaction.create({
      data: {
        userId: session.user.id,
        walletId: wallet.id,
        type: "REFERRAL_BONUS",
        amount: totalReward,
        balanceBefore,
        balanceAfter,
        description: `Referral reward for ${pendingReferrals.length} referral(s)`,
        status: "COMPLETED",
      },
    });

    await tx.notification.create({
      data: {
        userId: session.user.id,
        title: "Referral Reward!",
        message: `You earned ${totalReward} coins from ${pendingReferrals.length} referral(s)!`,
        type: "REWARD",
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "REFERRAL_REWARDED",
        metadata: JSON.stringify({ count: pendingReferrals.length, totalReward }),
      },
    });
  });

  return NextResponse.json({
    success: true,
    data: { totalReward, referralsProcessed: pendingReferrals.length },
    message: `Claimed ${totalReward} coins for ${pendingReferrals.length} referral(s)!`,
  });
}
