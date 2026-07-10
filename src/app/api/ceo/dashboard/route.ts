import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/ceo/dashboard — real CEO dashboard statistics.
 * Returns: total users, active users today, new users today, total coins,
 * total ads watched, total redeems, pending redeems, completed redeems,
 * recent activity, pending redeem requests (with user+reward).
 *
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

  const [
    totalUsers,
    newUsersToday,
    walletAgg,
    totalAds,
    totalRedeems,
    pendingRedeems,
    completedRedeems,
    rejectedRedeems,
    recentUsers,
    pendingRedeemRequests,
    recentTransactions,
  ] = await Promise.all([
    db.user.count({ where: { role: "USER" } }),
    db.user.count({ where: { role: "USER", createdAt: { gte: todayStart } } }),
    db.wallet.aggregate({ _sum: { coinBalance: true, totalEarned: true, totalSpent: true } }),
    db.adEvent.count({ where: { status: "VERIFIED" } }),
    db.redeemRequest.count(),
    db.redeemRequest.count({ where: { status: "PENDING" } }),
    db.redeemRequest.count({ where: { status: "COMPLETED" } }),
    db.redeemRequest.count({ where: { status: "REJECTED" } }),
    db.user.findMany({ where: { role: "USER" }, orderBy: { createdAt: "desc" }, take: 5, include: { wallet: true } }),
    db.redeemRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true, reward: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.transaction.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: true } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        newUsersToday,
        totalCoinsDistributed: walletAgg._sum.totalEarned || 0,
        totalCoinsInCirculation: walletAgg._sum.coinBalance || 0,
        totalCoinsSpent: walletAgg._sum.totalSpent || 0,
        totalAdsWatched: totalAds,
        totalRedeems,
        pendingRedeems,
        completedRedeems,
        rejectedRedeems,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        walletBalance: u.wallet?.coinBalance || 0,
        joinedAt: u.createdAt,
        lastLogin: u.lastLoginAt,
      })),
      pendingRedeemRequests: pendingRedeemRequests.map((r) => ({
        id: r.id,
        user: { id: r.user.id, name: r.user.name, email: r.user.email },
        reward: { id: r.reward.id, name: r.reward.name, category: r.reward.category },
        coinsUsed: r.coinsUsed,
        paymentMethod: r.paymentMethod,
        requestedAt: r.createdAt,
      })),
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        user: { id: t.user.id, name: t.user.name },
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
      })),
    },
  });
}
