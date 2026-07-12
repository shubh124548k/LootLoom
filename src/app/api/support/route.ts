import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const SUPPORT_LIMIT = new Map<string, { count: number; resetAt: number }>();
const SUPPORT_WINDOW = 60 * 1000;
const MAX_SUPPORT_TICKETS = 5;

function checkSupportRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = SUPPORT_LIMIT.get(userId);
  if (!entry || now > entry.resetAt) {
    SUPPORT_LIMIT.set(userId, { count: 1, resetAt: now + SUPPORT_WINDOW });
    return true;
  }
  if (entry.count >= MAX_SUPPORT_TICKETS) return false;
  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "10"), 50);

    const where: Record<string, unknown> = { userId: session.user.id };
    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { messages: { orderBy: { createdAt: "asc" } } },
      }),
      db.supportTicket.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: tickets, pagination: { page, pageSize, total } });
  } catch (error) {
    console.error("Support GET error:", error);
    return NextResponse.json({ success: false, message: "An unexpected error occurred", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    if (!checkSupportRateLimit(session.user.id)) {
      return NextResponse.json({ success: false, message: "Too many requests. Please try again later.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const body = await req.json();
    const { subject, category, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ success: false, message: "subject and message required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const ticket = await db.supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        category: category || "GENERAL",
        status: "OPEN",
        messages: { create: { senderId: session.user.id, message } },
      },
      include: { messages: true },
    });

    await db.auditLog.create({
      data: { actorId: session.user.id, action: "SUPPORT_TICKET_CREATED", targetId: ticket.id },
    });

    return NextResponse.json({ success: true, data: ticket, message: "Support ticket created" });
  } catch (error) {
    console.error("Support POST error:", error);
    return NextResponse.json({ success: false, message: "An unexpected error occurred", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
