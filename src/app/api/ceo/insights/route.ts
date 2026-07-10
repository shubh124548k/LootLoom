import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/ceo/insights — AI-generated CEO business insights based on real data.
 * Returns: trend insights, anomaly detection, business recommendations.
 * CEO-only access.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  const [todayUsers, yesterdayUsers, todayAds, yesterdayAds, todayRedeems, pendingRedeems, totalUsers, walletAgg, todayAdRevenue, yesterdayAdRevenue, recentFailedAds, topReward] = await Promise.all([
    db.user.count({ where: { role: "USER", createdAt: { gte: todayStart } } }),
    db.user.count({ where: { role: "USER", createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    db.adEvent.count({ where: { status: "VERIFIED", createdAt: { gte: todayStart } } }),
    db.adEvent.count({ where: { status: "VERIFIED", createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    db.redeemRequest.count({ where: { createdAt: { gte: todayStart } } }),
    db.redeemRequest.count({ where: { status: "PENDING" } }),
    db.user.count({ where: { role: "USER" } }),
    db.wallet.aggregate({ _sum: { coinBalance: true, totalEarned: true } }),
    db.adEvent.aggregate({ where: { status: "VERIFIED", createdAt: { gte: todayStart } }, _sum: { rewardAmount: true } }),
    db.adEvent.aggregate({ where: { status: "VERIFIED", createdAt: { gte: yesterdayStart, lt: todayStart } }, _sum: { rewardAmount: true } }),
    db.adEvent.count({ where: { status: "FAILED", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    db.redeemRequest.groupBy({ by: ["rewardId"], _count: true, orderBy: { _count: { rewardId: "desc" } }, take: 1 }),
  ]);

  const insights: Array<{ type: string; title: string; description: string; severity: "info" | "warning" | "success" | "critical"; metric?: string }> = [];

  // User growth insight
  if (yesterdayUsers > 0) {
    const growth = ((todayUsers - yesterdayUsers) / yesterdayUsers) * 100;
    if (growth > 0) {
      insights.push({
        type: "USER_GROWTH",
        title: `User registrations up ${growth.toFixed(0)}%`,
        description: `${todayUsers} new users today vs ${yesterdayUsers} yesterday.`,
        severity: "success",
        metric: `${growth.toFixed(0)}%`,
      });
    } else if (growth < 0) {
      insights.push({
        type: "USER_DECLINE",
        title: `User registrations down ${Math.abs(growth).toFixed(0)}%`,
        description: `${todayUsers} new users today vs ${yesterdayUsers} yesterday.`,
        severity: "warning",
        metric: `${growth.toFixed(0)}%`,
      });
    }
  }

  // Ad performance insight
  if (yesterdayAds > 0) {
    const adChange = ((todayAds - yesterdayAds) / yesterdayAds) * 100;
    if (adChange > 20) {
      insights.push({
        type: "AD_PERFORMANCE",
        title: `Ad completions increased ${adChange.toFixed(0)}%`,
        description: `${todayAds} ads completed today vs ${yesterdayAds} yesterday.`,
        severity: "success",
        metric: `${adChange.toFixed(0)}%`,
      });
    } else if (adChange < -20) {
      insights.push({
        type: "AD_DECLINE",
        title: `Ad completations decreased ${Math.abs(adChange).toFixed(0)}%`,
        description: `${todayAds} ads completed today vs ${yesterdayAds} yesterday. Check ad provider status.`,
        severity: "warning",
      });
    }
  }

  // Revenue insight
  const todayRev = todayAdRevenue._sum.rewardAmount || 0;
  const yesterdayRev = yesterdayAdRevenue._sum.rewardAmount || 0;
  if (yesterdayRev > 0) {
    const revChange = ((todayRev - yesterdayRev) / yesterdayRev) * 100;
    if (Math.abs(revChange) > 10) {
      insights.push({
        type: "REVENUE",
        title: `Ad revenue ${revChange > 0 ? "up" : "down"} ${Math.abs(revChange).toFixed(0)}%`,
        description: `${todayRev} coins rewarded today vs ${yesterdayRev} yesterday.`,
        severity: revChange > 0 ? "success" : "warning",
      });
    }
  }

  // Pending redeems alert
  if (pendingRedeems > 10) {
    insights.push({
      type: "REDEEM_BACKLOG",
      title: `${pendingRedeems} pending redeem requests`,
      description: "High number of pending redeems. Review and approve to maintain user satisfaction.",
      severity: "warning",
    });
  }

  // Failed ads alert
  if (recentFailedAds > 20) {
    insights.push({
      type: "FRAUD_ALERT",
      title: `${recentFailedAds} failed ad attempts in 24h`,
      description: "High number of failed ad completions. Possible fraud or ad provider issues.",
      severity: "critical",
    });
  }

  // Top reward insight
  if (topReward.length > 0) {
    const reward = await db.reward.findUnique({ where: { id: topReward[0].rewardId } });
    if (reward) {
      insights.push({
        type: "POPULAR_REWARD",
        title: `"${reward.name}" is trending`,
        description: `${topReward[0]._count} total redeem requests — most popular reward.`,
        severity: "info",
      });
    }
  }

  // Milestone insight
  if (totalUsers > 0 && totalUsers % 100 === 0) {
    insights.push({
      type: "MILESTONE",
      title: `${totalUsers} users milestone reached!`,
      description: "LootLoom has reached a user milestone. Great work!",
      severity: "success",
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      insights,
      summary: {
        totalUsers,
        todayUsers,
        todayAds,
        todayRedeems,
        pendingRedeems,
        coinsInCirculation: walletAgg._sum.coinBalance || 0,
        failedAds24h: recentFailedAds,
      },
    },
  });
}
