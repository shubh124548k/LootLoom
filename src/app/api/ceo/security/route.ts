import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/ceo/security — security dashboard for CEO.
 * Returns: recent security events, risk users, blocked attempts, fraud alerts.
 * CEO-only access.
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
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  // Recent audit logs (security-relevant actions)
  const securityActions = [
    "AD_REWARD_CREDITED", "REDEEM_REQUESTED", "REDEEM_APPROVED", "REDEEM_REJECTED",
    "USER_REGISTERED", "USER_LOGIN", "BROADCAST_SENT", "WALLET_ADJUSTMENT",
  ];
  const recentEvents = await db.auditLog.findMany({
    where: { action: { in: securityActions } },
    include: { actor: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Detect suspicious users: high ad velocity (>50 ads in last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const adVelocityRaw = await db.adEvent.findMany({
    where: { status: "VERIFIED", createdAt: { gte: oneHourAgo } },
    select: { userId: true },
    take: 1000,
  });
  // Count per user manually
  const adCountMap = new Map<string, number>();
  for (const a of adVelocityRaw) {
    adCountMap.set(a.userId, (adCountMap.get(a.userId) || 0) + 1);
  }
  const adVelocityUsers = Array.from(adCountMap.entries())
    .filter(([_, count]) => count >= 50)
    .map(([userId, count]) => ({ userId, _count: count }));

  // Detect duplicate reward attempts: failed ad events (potential fraud)
  const failedAdAttempts = await db.adEvent.count({
    where: { status: "FAILED", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });

  // Users with multiple pending redeems (potential abuse)
  const multiPendingRaw = await db.redeemRequest.findMany({
    where: { status: "PENDING" },
    select: { userId: true },
    take: 1000,
  });
  const pendingCountMap = new Map<string, number>();
  for (const r of multiPendingRaw) {
    pendingCountMap.set(r.userId, (pendingCountMap.get(r.userId) || 0) + 1);
  }
  const multiPendingUsers = Array.from(pendingCountMap.entries())
    .filter(([_, count]) => count >= 3)
    .map(([userId, count]) => ({ userId, _count: count }));

  // Risk users with details
  const riskUsers = await Promise.all(
    adVelocityUsers.map(async (u) => {
      const user = await db.user.findUnique({ where: { id: u.userId }, select: { id: true, name: true, email: true, createdAt: true } });
      const count = u._count;
      return {
        user,
        riskLevel: count > 80 ? "CRITICAL" : count > 60 ? "HIGH" : "MEDIUM",
        reason: `Ad velocity: ${count} ads in last hour`,
        adsInHour: count,
      };
    })
  );

  // Stats summary
  const [totalEvents, totalUsers, suspendedUsers] = await Promise.all([
    db.auditLog.count({ where: { action: { in: securityActions } } }),
    db.user.count({ where: { role: "USER" } }),
    db.user.count({ where: { role: "USER", status: "SUSPENDED" } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalEvents,
        totalUsers,
        suspendedUsers,
        riskUsersCount: riskUsers.length,
        failedAdAttempts,
        multiPendingUsers: multiPendingUsers.length,
      },
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        actor: e.actor,
        action: e.action,
        targetId: e.targetId,
        metadata: e.metadata,
        timestamp: e.createdAt,
      })),
      riskUsers,
      fraudIndicators: {
        highAdVelocity: riskUsers.length,
        failedAdAttempts,
        multiPendingRedeems: multiPendingUsers.length,
      },
    },
  });
}
