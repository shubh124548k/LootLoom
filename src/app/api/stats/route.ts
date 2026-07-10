import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/stats — public platform statistics (no auth required)
 * Returns real aggregate data: user count, total coins earned, total redeemed, reward count.
 */
export async function GET() {
  const [userCount, walletAgg, redeemCount, rewardCount] = await Promise.all([
    db.user.count(),
    db.wallet.aggregate({ _sum: { totalEarned: true, totalSpent: true } }),
    db.redeemRequest.count({ where: { status: "COMPLETED" } }),
    db.reward.count({ where: { status: "ACTIVE" } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      activeMembers: userCount,
      coinsRedeemed: walletAgg._sum.totalSpent || 0,
      coinsEarned: walletAgg._sum.totalEarned || 0,
      rewardsAvailable: rewardCount,
      completedRedeems: redeemCount,
    },
  });
}
