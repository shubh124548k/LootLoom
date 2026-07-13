import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/wallet/summary — real wallet summary with daily/weekly/monthly earnings.
 * Returns: coinBalance, totalEarned, totalSpent, todayEarnings, weeklyEarnings,
 * monthlyEarnings, pendingCoins (from pending redeems), chart data.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id;

  const [wallet, todayAgg, weekAgg, monthAgg, pendingRedeems] = await Promise.all([
    db.wallet.findUnique({ where: { userId } }),
    db.transaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      _sum: { amount: true },
    }),
    db.redeemRequest.aggregate({
      where: { userId, status: "PENDING" },
      _sum: { coinsUsed: true },
      _count: true,
    }),
  ]);

  // Build weekly chart (7 days)
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const dailyTxns = await db.transaction.findMany({
    where: { userId, createdAt: { gte: sevenDaysAgo } },
    select: { amount: true, type: true, createdAt: true },
  });

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const weeklyChart = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(sevenDaysAgo);
    day.setDate(day.getDate() + i);
    const dayTxns = dailyTxns.filter((t) => t.createdAt.toDateString() === day.toDateString());
    return {
      label: dayLabels[day.getDay()],
      earned: dayTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
      redeemed: dayTxns.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
    };
  });

  // Monthly chart (6 months)
  const sixMonthsAgo = new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000);
  sixMonthsAgo.setHours(0, 0, 0, 0);
  sixMonthsAgo.setDate(1);
  const monthlyTxns = await db.transaction.findMany({
    where: { userId, createdAt: { gte: sixMonthsAgo } },
    select: { amount: true, createdAt: true },
  });

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyChart = Array.from({ length: 6 }).map((_, i) => {
    const month = new Date(sixMonthsAgo);
    month.setMonth(month.getMonth() + i);
    const monthTxns = monthlyTxns.filter(
      (t) => t.createdAt.getMonth() === month.getMonth() && t.createdAt.getFullYear() === month.getFullYear()
    );
    return {
      label: monthLabels[month.getMonth()],
      earned: monthTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
      redeemed: monthTxns.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      coinBalance: wallet?.coinBalance || 0,
      totalEarned: wallet?.totalEarned || 0,
      totalSpent: wallet?.totalSpent || 0,
      todayEarnings: todayAgg._sum.amount || 0,
      weeklyEarnings: weekAgg._sum.amount || 0,
      monthlyEarnings: monthAgg._sum.amount || 0,
      pendingCoins: pendingRedeems._sum.coinsUsed || 0,
      pendingRedeems: pendingRedeems._count,
      weeklyChart,
      monthlyChart,
    },
  });
  } catch (error) {
    console.error("Wallet summary error:", error);
    return NextResponse.json({ success: false, message: "Internal server error", code: "SERVER_ERROR" }, { status: 500 });
  }
}
