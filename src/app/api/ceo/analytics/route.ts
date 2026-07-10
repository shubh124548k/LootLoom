import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/ceo/analytics — real analytics dashboard for CEO.
 * Query: ?period=today|7days|30days|alltime
 *
 * Returns: user analytics, ads analytics, coin economy, reward analytics,
 * redeem analytics, revenue dashboard — all real database aggregations.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "30days";
  const now = new Date();
  let since = new Date(0);
  if (period === "today") since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  else if (period === "7days") since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  else if (period === "30days") since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, newUsers, walletAgg, totalAds, verifiedAds, failedAds, adRevenueAgg, totalRedeems, pendingRedeems, approvedRedeems, completedRedeems, rejectedRedeems, redeemCoinsAgg] = await Promise.all([
    db.user.count({ where: { role: "USER" } }),
    db.user.count({ where: { role: "USER", createdAt: { gte: since } } }),
    db.wallet.aggregate({ _sum: { coinBalance: true, totalEarned: true, totalSpent: true } }),
    db.adEvent.count({ where: { createdAt: { gte: since } } }),
    db.adEvent.count({ where: { status: "VERIFIED", createdAt: { gte: since } } }),
    db.adEvent.count({ where: { status: "FAILED", createdAt: { gte: since } } }),
    db.adEvent.aggregate({ where: { status: "VERIFIED", createdAt: { gte: since } }, _sum: { rewardAmount: true } }),
    db.redeemRequest.count({ where: { createdAt: { gte: since } } }),
    db.redeemRequest.count({ where: { status: "PENDING", createdAt: { gte: since } } }),
    db.redeemRequest.count({ where: { status: "APPROVED", createdAt: { gte: since } } }),
    db.redeemRequest.count({ where: { status: "COMPLETED", createdAt: { gte: since } } }),
    db.redeemRequest.count({ where: { status: "REJECTED", createdAt: { gte: since } } }),
    db.redeemRequest.aggregate({ where: { createdAt: { gte: since } }, _sum: { coinsUsed: true } }),
  ]);

  // Reward popularity — most redeemed rewards (manual count to avoid Prisma groupBy issues)
  const allRedeems = await db.redeemRequest.findMany({
    where: { createdAt: { gte: since } },
    select: { rewardId: true },
    take: 5000,
  });
  const redeemCountMap = new Map<string, number>();
  for (const r of allRedeems) {
    redeemCountMap.set(r.rewardId, (redeemCountMap.get(r.rewardId) || 0) + 1);
  }
  const sortedRewardIds = Array.from(redeemCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topRewards = await Promise.all(
    sortedRewardIds.map(async ([rewardId, count]) => {
      const reward = await db.reward.findUnique({ where: { id: rewardId } });
      return { name: reward?.name || "Unknown", count, coinCost: reward?.coinCost || 0 };
    })
  );

  // Daily user registration chart (last 14 days)
  const fourteenDaysAgo = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);
  const recentUsers = await db.user.findMany({
    where: { role: "USER", createdAt: { gte: fourteenDaysAgo } },
    select: { createdAt: true },
  });
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const userGrowthChart = Array.from({ length: 14 }).map((_, i) => {
    const day = new Date(fourteenDaysAgo);
    day.setDate(day.getDate() + i);
    const count = recentUsers.filter((u) => u.createdAt.toDateString() === day.toDateString()).length;
    return { label: `${day.getDate()}/${day.getMonth() + 1}`, value: count };
  });

  // Daily ad completions chart
  const recentAds = await db.adEvent.findMany({
    where: { status: "VERIFIED", createdAt: { gte: fourteenDaysAgo } },
    select: { createdAt: true, rewardAmount: true },
  });
  const adChart = Array.from({ length: 14 }).map((_, i) => {
    const day = new Date(fourteenDaysAgo);
    day.setDate(day.getDate() + i);
    const dayAds = recentAds.filter((a) => a.createdAt.toDateString() === day.toDateString());
    return { label: `${day.getDate()}/${day.getMonth() + 1}`, count: dayAds.length, revenue: dayAds.reduce((s, a) => s + a.rewardAmount, 0) };
  });

  return NextResponse.json({
    success: true,
    data: {
      period,
      users: { total: totalUsers, new: newUsers, growthRate: totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0 },
      ads: {
        totalWatched: totalAds,
        verified: verifiedAds,
        failed: failedAds,
        completionRate: totalAds > 0 ? (verifiedAds / totalAds) * 100 : 0,
        revenue: adRevenueAgg._sum.rewardAmount || 0,
      },
      coinEconomy: {
        inCirculation: walletAgg._sum.coinBalance || 0,
        totalEarned: walletAgg._sum.totalEarned || 0,
        totalSpent: walletAgg._sum.totalSpent || 0,
        adRewards: adRevenueAgg._sum.rewardAmount || 0,
        redeems: redeemCoinsAgg._sum.coinsUsed || 0,
      },
      redeems: {
        total: totalRedeems,
        pending: pendingRedeems,
        approved: approvedRedeems,
        completed: completedRedeems,
        rejected: rejectedRedeems,
        successRate: totalRedeems > 0 ? ((approvedRedeems + completedRedeems) / totalRedeems) * 100 : 0,
        coinsUsed: redeemCoinsAgg._sum.coinsUsed || 0,
      },
      topRewards,
      charts: { userGrowth: userGrowthChart, ads: adChart },
      revenue: {
        adRevenue: adRevenueAgg._sum.rewardAmount || 0,
        redeemCost: redeemCoinsAgg._sum.coinsUsed || 0,
        // Estimated revenue model: 1 ad view ≈ ₹0.05 ad revenue, 1 coin ≈ ₹0.01 reward cost
        estimatedAdRevenue: verifiedAds * 0.05,
        estimatedRewardCost: (redeemCoinsAgg._sum.coinsUsed || 0) / 100,
        estimatedProfit: verifiedAds * 0.05 - (redeemCoinsAgg._sum.coinsUsed || 0) / 100,
      },
    },
  });
}
