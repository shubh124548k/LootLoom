import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { emitSupportReply } from "@/lib/realtime";

/**
 * GET /api/support — user's support tickets (real data).
 * CEO can see all tickets.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const currentUser = await db.user.findUnique({ where: { id: session.user.id } });
  if (!currentUser) {
    return NextResponse.json({ success: false, message: "User not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  // CEO sees all tickets; users see only their own
  const where: Record<string, unknown> = {};
  if (currentUser.role !== "CEO") {
    where.userId = session.user.id;
  }
  if (status && status !== "ALL") where.status = status;

  const tickets = await db.supportTicket.findMany({
    where,
    include: { user: true, messages: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    data: tickets.map((t) => ({
      id: t.id,
      user: { id: t.user.id, name: t.user.name, email: t.user.email, avatar: t.user.avatar },
      subject: t.subject,
      category: t.category,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      messages: t.messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        message: m.message,
        createdAt: m.createdAt,
      })),
    })),
  });
}

/**
 * POST /api/support — create a support ticket (user) or reply to a ticket (CEO).
 * Body: { subject?, category?, message, ticketId? }
 * If ticketId is provided → it's a reply. Otherwise → new ticket.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const { subject, category, message, ticketId } = body;

  if (!message) {
    return NextResponse.json({ success: false, message: "message required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  // If ticketId → reply to existing ticket
  if (ticketId) {
    const ticket = await db.supportTicket.findUnique({ where: { id: ticketId }, include: { user: true } });
    if (!ticket) {
      return NextResponse.json({ success: false, message: "Ticket not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // Create message
    const msg = await db.supportMessage.create({
      data: { ticketId, senderId: session.user.id, message },
    });

    // If CEO replied → notify user + realtime
    const sender = await db.user.findUnique({ where: { id: session.user.id } });
    if (sender?.role === "CEO") {
      await db.notification.create({
        data: {
          userId: ticket.userId,
          title: "Support Reply Received",
          message: `You have a new reply on your ticket: ${ticket.subject}`,
          type: "SUPPORT",
        },
      });
      void emitSupportReply(ticket.userId, { ticketId, message, createdAt: msg.createdAt.toISOString() });
    }

    return NextResponse.json({ success: true, data: { messageId: msg.id }, message: "Reply sent" });
  }

  // New ticket
  if (!subject) {
    return NextResponse.json({ success: false, message: "subject required for new ticket", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const ticket = await db.supportTicket.create({
    data: {
      userId: session.user.id,
      subject,
      category: category || "GENERAL",
      status: "OPEN",
      priority: "MEDIUM",
    },
  });

  await db.supportMessage.create({
    data: { ticketId: ticket.id, senderId: session.user.id, message },
  });

  return NextResponse.json({
    success: true,
    data: { ticketId: ticket.id },
    message: "Support ticket created",
  });
}
