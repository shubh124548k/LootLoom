import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireCEO() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") return null;
  return session.user.id;
}

export async function GET(req: NextRequest) {
  try {
    const ceoId = await requireCEO();
    if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 50);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, name: true, email: true, avatar: true } }, messages: { orderBy: { createdAt: "asc" } } },
      }),
      db.supportTicket.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: tickets, pagination: { page, pageSize, total } });
  } catch (error) {
    console.error("CEO support GET error:", error);
    return NextResponse.json({ success: false, message: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const { ticketId, message, action } = body;

  if (!ticketId || !message) {
    return NextResponse.json({ success: false, message: "ticketId and message required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    return NextResponse.json({ success: false, message: "Ticket not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const result = await db.$transaction(async (tx) => {
    const msg = await tx.supportMessage.create({
      data: { ticketId, senderId: ceoId, message },
    });

    let newStatus = ticket.status;
    if (action === "CLOSE") newStatus = "CLOSED";
    else if (action === "RESOLVE") newStatus = "RESOLVED";
    else if (action === "PENDING") newStatus = "PENDING";

    if (newStatus !== ticket.status) {
      await tx.supportTicket.update({ where: { id: ticketId }, data: { status: newStatus } });
    }

    await tx.auditLog.create({
      data: { actorId: ceoId, action: "SUPPORT_ADMIN_REPLY", targetId: ticketId },
    });

    return msg;
  });

  return NextResponse.json({ success: true, data: result, message: "Reply sent" });
}
