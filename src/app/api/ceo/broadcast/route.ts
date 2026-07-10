import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { emitNotificationCreated } from "@/lib/realtime";

/**
 * POST /api/ceo/broadcast — CEO sends a notification to all users or selected users.
 * Body: { title, message, type, userIds? (optional — if null/empty, all users) }
 *
 * Creates a notification for each target user and emits realtime events.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const ceo = await db.user.findUnique({ where: { id: session.user.id } });
  if (!ceo || ceo.role !== "CEO") {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json();
  const { title, message, type = "SYSTEM", userIds } = body;

  if (!title || !message) {
    return NextResponse.json({ success: false, message: "title and message required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  // Determine target users
  const targetUsers = userIds && userIds.length > 0
    ? await db.user.findMany({ where: { id: { in: userIds }, role: "USER" }, select: { id: true } })
    : await db.user.findMany({ where: { role: "USER" }, select: { id: true } });

  // Create notifications for all target users
  const notifications = await Promise.all(
    targetUsers.map((u) =>
      db.notification.create({
        data: { userId: u.id, title, message, type },
      })
    )
  );

  // Audit log
  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "BROADCAST_SENT",
      metadata: JSON.stringify({ title, type, recipientCount: targetUsers.length }),
    },
  });

  // Real-time events (non-blocking)
  for (const notif of notifications) {
    void emitNotificationCreated(notif.userId, {
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      createdAt: notif.createdAt.toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    message: `Broadcast sent to ${targetUsers.length} users`,
    data: { recipientCount: targetUsers.length },
  });
}
