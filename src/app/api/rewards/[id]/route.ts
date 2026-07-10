import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/rewards/[id] — real reward details from database.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reward = await db.reward.findUnique({ where: { id } });

  if (!reward) {
    return NextResponse.json({ success: false, message: "Reward not found", code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: reward });
}
