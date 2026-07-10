import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/ceo/audit — audit log center for CEO.
 * Returns: all audit logs with actor details, filterable by action.
 * CEO-only access.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "50"), 200);

  const where: Record<string, unknown> = {};
  if (action && action !== "ALL") where.action = action;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: logs.map((l) => ({
      id: l.id,
      actor: l.actor,
      action: l.action,
      targetId: l.targetId,
      metadata: l.metadata,
      timestamp: l.createdAt,
    })),
    pagination: { page, pageSize, total, hasMore: page * pageSize < total },
  });
}
