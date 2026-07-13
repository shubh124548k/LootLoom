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

    const role = ((session.user as { role?: string })?.role || "").toLowerCase();
    if (role !== "ceo" && role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
    }

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, dailyUsers, weeklyUsers, monthlyUsers, walletAgg, totalAds, pendingRedeems, completedRedeems, rejectedRedeems, missionCompletions, referralSuccess, recentLogins, newUsersToday] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { lastLoginAt: { gte: todayStart } } }),
      db.user.count({ where: { lastLoginAt: { gte: weekAgo } } }),
      db.user.count({ where: { lastLoginAt: { gte: monthAgo } } }),
      db.wallet.aggregate({ _sum: { totalEarned: true, totalSpent: true } }),
      db.adEvent.count({ where: { status: "VERIFIED" } }),
      db.redeemRequest.count({ where: { status: "PENDING" } }),
      db.redeemRequest.count({ where: { status: "COMPLETED" } }),
      db.redeemRequest.count({ where: { status: "REJECTED" } }),
      db.missionLog.count({ where: { createdAt: { gte: monthAgo } } }),
      db.referral.count({ where: { createdAt: { gte: monthAgo } } }),
      db.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      db.user.count({ where: { createdAt: { gte: todayStart } } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: { total: totalUsers, daily: dailyUsers, weekly: weeklyUsers, monthly: monthlyUsers, newToday: newUsersToday, recentLogin: recentLogins },
        coins: { issued: walletAgg._sum.totalEarned || 0, redeemed: walletAgg._sum.totalSpent || 0 },
        redeems: { pending: pendingRedeems, completed: completedRedeems, rejected: rejectedRedeems },
        ads: { totalWatched: totalAds },
        missions: { completedLast30d: missionCompletions },
        referrals: { successfulLast30d: referralSuccess },
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ success: false, message: "Internal server error", code: "SERVER_ERROR" }, { status: 500 });
  }
}
