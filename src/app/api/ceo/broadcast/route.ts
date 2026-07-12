import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { emitNotificationCreated } from "@/lib/realtime";

const BROADCAST_LIMIT = new Map<string, { count: number; resetAt: number }>();
const BROADCAST_WINDOW = 60 * 1000;
const MAX_BROADCASTS = 3;

function checkBroadcastRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = BROADCAST_LIMIT.get(userId);
  if (!entry || now > entry.resetAt) {
    BROADCAST_LIMIT.set(userId, { count: 1, resetAt: now + BROADCAST_WINDOW });
    return true;
  }
  if (entry.count >= MAX_BROADCASTS) return false;
  entry.count++;
  return true;
}

async function requireCEO() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") return null;
  return session.user.id;
}

export async function POST(req: NextRequest) {
  try {
    const ceoId = await requireCEO();
    if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

    if (!checkBroadcastRateLimit(ceoId)) {
      return NextResponse.json({ success: false, message: "Too many requests. Please try again later.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const body = await req.json();
    const { title, message, type, targetUserIds } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, message: "title and message required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const where: Record<string, unknown> = {};
    if (targetUserIds && Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      where.id = { in: targetUserIds };
    }

    const users = await db.user.findMany({ where, select: { id: true } });
    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "No target users found", code: "NO_USERS" }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      await tx.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          title,
          message,
          type: type || "SYSTEM",
        })),
      });

      await tx.auditLog.create({
        data: {
          actorId: ceoId,
          action: "BROADCAST_SENT",
          metadata: JSON.stringify({ title, type, recipientCount: users.length }),
        },
      });
    });

    for (const user of users) {
      void emitNotificationCreated(user.id, { id: "broadcast", title, message, type: type || "SYSTEM", createdAt: new Date().toISOString() });
    }

    return NextResponse.json({ success: true, message: `Broadcast sent to ${users.length} users` });
  } catch (error) {
    console.error("Broadcast POST error:", error);
    return NextResponse.json({ success: false, message: "An unexpected error occurred", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
