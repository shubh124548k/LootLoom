import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/ceo/reports — generate business reports (CEO).
 * Query: ?type=daily|weekly|monthly&format=json
 *
 * Returns: users, revenue, ads, rewards, redeems, security summary.
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
  const type = searchParams.get("type") || "daily";

  let since = new Date(new Date().setHours(0, 0, 0, 0));
  if (type === "weekly") since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  else if (type === "monthly") since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [newUsers, totalUsers, verifiedAds, adRevenue, redeems, redeemCoins, completedRedeems, rejectedRedeems, failedAds, walletAgg, auditLogs] = await Promise.all([
    db.user.count({ where: { role: "USER", createdAt: { gte: since } } }),
    db.user.count({ where: { role: "USER" } }),
    db.adEvent.count({ where: { status: "VERIFIED", createdAt: { gte: since } } }),
    db.adEvent.aggregate({ where: { status: "VERIFIED", createdAt: { gte: since } }, _sum: { rewardAmount: true } }),
    db.redeemRequest.count({ where: { createdAt: { gte: since } } }),
    db.redeemRequest.aggregate({ where: { createdAt: { gte: since } }, _sum: { coinsUsed: true } }),
    db.redeemRequest.count({ where: { status: "COMPLETED", createdAt: { gte: since } } }),
    db.redeemRequest.count({ where: { status: "REJECTED", createdAt: { gte: since } } }),
    db.adEvent.count({ where: { status: "FAILED", createdAt: { gte: since } } }),
    db.wallet.aggregate({ _sum: { coinBalance: true, totalEarned: true, totalSpent: true } }),
    db.auditLog.count({ where: { createdAt: { gte: since } } }),
  ]);

  const estimatedAdRevenue = verifiedAds * 0.05; // ₹0.05 per ad view
  const estimatedRewardCost = (redeemCoins._sum.coinsUsed || 0) / 100; // 100 coins = ₹1
  const estimatedProfit = estimatedAdRevenue - estimatedRewardCost;

  return NextResponse.json({
    success: true,
    data: {
      reportType: type,
      period: { from: since.toISOString(), to: new Date().toISOString() },
      users: {
        newUsers,
        totalUsers,
        growthRate: totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0,
      },
      ads: {
        verifiedAds,
        failedAds,
        completionRate: verifiedAds + failedAds > 0 ? (verifiedAds / (verifiedAds + failedAds)) * 100 : 100,
        adRevenueCoins: adRevenue._sum.rewardAmount || 0,
      },
      redeems: {
        total: redeems,
        completed: completedRedeems,
        rejected: rejectedRedeems,
        coinsUsed: redeemCoins._sum.coinsUsed || 0,
      },
      finance: {
        coinsInCirculation: walletAgg._sum.coinBalance || 0,
        totalCoinsEarned: walletAgg._sum.totalEarned || 0,
        totalCoinsSpent: walletAgg._sum.totalSpent || 0,
        estimatedAdRevenue,
        estimatedRewardCost,
        estimatedProfit,
      },
      security: {
        auditEvents: auditLogs,
        failedAdAttempts: failedAds,
      },
      generatedAt: new Date().toISOString(),
    },
  });
}
