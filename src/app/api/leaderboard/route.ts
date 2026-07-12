import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all"; // daily | weekly | monthly | all
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  let dateFilter: Date | null = null;
  const now = new Date();
  if (period === "daily") {
    dateFilter = new Date(now.setHours(0, 0, 0, 0));
  } else if (period === "weekly") {
    dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "monthly") {
    dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const where: Record<string, unknown> = {
    type: { in: ["AD_REWARD", "MISSION_REWARD", "REFERRAL_BONUS", "DAILY_LOGIN", "ADMIN_ADJUSTMENT"] },
    status: "COMPLETED",
  };
  if (dateFilter) where.createdAt = { gte: dateFilter };

  const earnings = await db.transaction.groupBy({
    by: ["userId"],
    where,
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  const userIds = earnings.map((e) => e.userId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, username: true, avatar: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const data = earnings.map((e, i) => {
    const user = userMap.get(e.userId);
    return {
      rank: i + 1,
      userId: e.userId,
      username: user?.username || user?.name || "Unknown",
      name: user?.name || "Unknown",
      avatar: user?.avatar || null,
      totalEarned: e._sum.amount || 0,
      isCurrentUser: e.userId === session.user.id,
    };
  });

  const currentUserRank = data.find((d) => d.isCurrentUser)?.rank || null;
  const currentUserEarnings = await db.transaction.aggregate({
    where: { ...where, userId: session.user.id },
    _sum: { amount: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      entries: data,
      currentUser: {
        rank: currentUserRank,
        totalEarned: currentUserEarnings._sum.amount || 0,
      },
    },
  });
}
