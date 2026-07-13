import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [user, wallet, recentTransactions, recentNotifications, todayStats, weekStats, monthStats, adStats, unreadCount, dailyTxns] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, role: true, status: true, createdAt: true, lastLoginAt: true },
    }),
    db.wallet.findUnique({
      where: { userId },
      select: { coinBalance: true, totalEarned: true, totalSpent: true },
    }),
    db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, type: true, amount: true, description: true, status: true, createdAt: true },
    }),
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, message: true, type: true, read: true, createdAt: true },
    }),
    db.transaction.aggregate({
      where: { userId, type: "AD_REWARD", amount: { gt: 0 }, createdAt: { gte: today } },
      _sum: { amount: true },
      _count: true,
    }),
    db.transaction.aggregate({
      where: { userId, amount: { gt: 0 }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { userId, amount: { gt: 0 }, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      _sum: { amount: true },
    }),
    db.adEvent.aggregate({
      where: { userId, status: "VERIFIED" },
      _count: true,
      _sum: { rewardAmount: true },
    }),
    db.notification.count({ where: { userId, read: false } }),
    db.transaction.findMany({
      where: { userId, amount: { gt: 0 }, createdAt: { gte: sevenDaysAgo } },
      select: { amount: true, createdAt: true },
    }),
  ]);

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
      user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, status: user.status, memberSince: user.createdAt, lastLogin: user.lastLoginAt } : null,
      wallet: wallet ? { coinBalance: wallet.coinBalance, totalEarned: wallet.totalEarned, totalSpent: wallet.totalSpent } : { coinBalance: 0, totalEarned: 0, totalSpent: 0 },
      recentTransactions: recentTransactions.map((t) => ({ id: t.id, type: t.type, amount: t.amount, description: t.description, status: t.status, createdAt: t.createdAt })),
      recentNotifications: recentNotifications.map((n) => ({ id: n.id, title: n.title, message: n.message, type: n.type, read: n.read, createdAt: n.createdAt })),
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
