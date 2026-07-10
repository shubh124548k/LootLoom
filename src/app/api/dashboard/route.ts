import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/dashboard — real aggregated dashboard data for authenticated user.
 * Returns: user summary, wallet summary, recent transactions, recent notifications,
 * earning statistics (today/weekly/monthly), ad stats.
 *
 * All data is scoped to the authenticated user — no cross-user data leakage.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch real user + wallet in parallel
  const [user, wallet, recentTransactions, recentNotifications, todayStats, weekStats, monthStats, adStats] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    }),
    db.wallet.findUnique({ where: { userId } }),
    db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Today's earnings
    db.transaction.aggregate({
      where: {
        userId,
        type: "AD_REWARD",
        amount: { gt: 0 },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // This week's earnings
    db.transaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      _sum: { amount: true },
    }),
    // This month's earnings
    db.transaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      _sum: { amount: true },
    }),
    // Ad stats
    db.adEvent.aggregate({
      where: { userId, status: "VERIFIED" },
      _count: true,
      _sum: { rewardAmount: true },
    }),
  ]);

  // Unread notification count
  const unreadCount = await db.notification.count({
    where: { userId, read: false },
  });

  // Build 7-day earnings chart data (real)
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const dailyTxns = await db.transaction.findMany({
    where: {
      userId,
      amount: { gt: 0 },
      createdAt: { gte: sevenDaysAgo },
    },
    select: { amount: true, createdAt: true },
  });

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(sevenDaysAgo);
    day.setDate(day.getDate() + i);
    const dayTotal = dailyTxns
      .filter((t) => t.createdAt.toDateString() === day.toDateString())
      .reduce((sum, t) => sum + t.amount, 0);
    return { day: dayLabels[day.getDay()], value: dayTotal };
  });

  return NextResponse.json({
    success: true,
    data: {
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
            memberSince: user.createdAt,
            lastLogin: user.lastLoginAt,
          }
        : null,
      wallet: wallet
        ? {
            coinBalance: wallet.coinBalance,
            totalEarned: wallet.totalEarned,
            totalSpent: wallet.totalSpent,
          }
        : { coinBalance: 0, totalEarned: 0, totalSpent: 0 },
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
      })),
      recentNotifications: recentNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
      stats: {
        todayEarnings: todayStats._sum.amount || 0,
        todayAdsWatched: todayStats._count,
        weeklyEarnings: weekStats._sum.amount || 0,
        monthlyEarnings: monthStats._sum.amount || 0,
        totalAdsWatched: adStats._count,
        totalAdEarnings: adStats._sum.rewardAmount || 0,
      },
      chart: chartData,
    },
  });
}
