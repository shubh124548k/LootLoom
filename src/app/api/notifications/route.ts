import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 50);
    const type = searchParams.get("type");
    const read = searchParams.get("read");

    const where: Record<string, unknown> = { userId: session.user.id };
    if (type) where.type = type;
    if (read === "true") where.read = true;
    else if (read === "false") where.read = false;

    const [items, total, unreadCount] = await Promise.all([
      db.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      db.notification.count({ where }),
      db.notification.count({ where: { userId: session.user.id, read: false } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { items, unreadCount, total, page, pageSize, hasMore: page * pageSize < total },
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ success: false, message: "Internal server error", code: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, all } = body;

    if (all) {
      await db.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (!notificationId) {
      return NextResponse.json({ success: false, message: "notificationId or all required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    await db.notification.updateMany({ where: { id: notificationId, userId: session.user.id }, data: { read: true } });
    return NextResponse.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json({ success: false, message: "Internal server error", code: "SERVER_ERROR" }, { status: 500 });
  }
}
