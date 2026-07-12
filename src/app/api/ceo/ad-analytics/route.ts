import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role !== "CEO") {
      return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
    }

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [todayAds, todayRevenue, totalAds, totalRevenue, completedAds, failedAds, coinsIssued, providers, recentEvents] = await Promise.all([
      db.adEvent.count({ where: { createdAt: { gte: todayStart } } }),
      db.adEvent.aggregate({ where: { createdAt: { gte: todayStart }, status: "VERIFIED" }, _sum: { rewardAmount: true } }),
      db.adEvent.count(),
      db.adEvent.aggregate({ where: { status: "VERIFIED" }, _sum: { rewardAmount: true } }),
      db.adEvent.count({ where: { status: "VERIFIED" } }),
      db.adEvent.count({ where: { status: "FAILED" } }),
      db.transaction.aggregate({ where: { type: "AD_REWARD", createdAt: { gte: thirtyDaysAgo } }, _sum: { amount: true } }),
      db.adProvider.findMany({ orderBy: { priority: "asc" } }),
      db.adEvent.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, orderBy: { createdAt: "desc" }, take: 5000 }),
    ]);

    const fillRate = totalAds > 0 ? (completedAds / totalAds) * 100 : 0;
    const averageReward = completedAds > 0 ? Math.round((totalRevenue._sum.rewardAmount || 0) / completedAds) : 0;

    const providerErrorsMap = new Map<string, { count: number; lastError: string }>();
    for (const event of recentEvents) {
      if (event.status === "FAILED" && event.providerKey && event.errorCode) {
        const existing = providerErrorsMap.get(event.providerKey) || { count: 0, lastError: "" };
        existing.count++;
        existing.lastError = event.errorCode;
        providerErrorsMap.set(event.providerKey, existing);
      }
    }

    const providerRanking = providers
      .map((p) => {
        const total = p.completedAds + p.failedAds;
        const successRate = total > 0 ? (p.completedAds / total) * 100 : 0;
        return { key: p.key, name: p.name, successRate: Math.round(successRate * 100) / 100, fillRate: p.fillRate };
      })
      .sort((a, b) => b.successRate - a.successRate);

    const topProvider = providerRanking.length > 0 ? providerRanking[0].name : "None";

    return NextResponse.json({
      success: true,
      data: {
        todayAds,
        todayRevenue: todayRevenue._sum.rewardAmount || 0,
        totalAds,
        totalRevenue: totalRevenue._sum.rewardAmount || 0,
        fillRate: Math.round(fillRate * 100) / 100,
        completedAds,
        failedAds,
        coinsIssued: coinsIssued._sum.amount || 0,
        averageReward,
        topProvider,
        providerRanking,
        providerErrors: Array.from(providerErrorsMap.entries()).map(([key, val]) => ({ key, count: val.count, lastError: val.lastError })),
        providers: providers.map((p) => ({
          id: p.id,
          key: p.key,
          name: p.name,
          enabled: p.enabled,
          priority: p.priority,
          status: p.status,
          successRate: p.successRate,
          fillRate: p.fillRate,
          todayRevenue: 0,
          totalRevenue: p.totalRevenue,
          completedAds: p.completedAds,
          failedAds: p.failedAds,
        })),
      },
    });
  } catch (error) {
    console.error("[CEO AD ANALYTICS]", error);
    return NextResponse.json({ success: false, message: "Failed to load ad analytics" }, { status: 500 });
  }
}
