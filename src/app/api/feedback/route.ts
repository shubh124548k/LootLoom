import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/feedback — user feedback (ratings, suggestions, bugs).
 * POST /api/feedback — submit feedback.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });

  // CEO sees all feedback; users see only their own
  const where = user?.role === "CEO" ? {} : { userId: session.user.id };
  const feedback = await db.userFeedback.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ success: true, data: feedback });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const { category, message, rating } = body;

  if (!category || !message) {
    return NextResponse.json({ success: false, message: "category and message required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const feedback = await db.userFeedback.create({
    data: { userId: session.user.id, category, message, rating: rating ? parseInt(rating) : null },
  });

  return NextResponse.json({ success: true, data: feedback, message: "Feedback submitted. Thank you!" });
}
