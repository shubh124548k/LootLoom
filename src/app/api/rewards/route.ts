import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/rewards — real reward catalog from database.
 * Returns only ACTIVE rewards.
 */
export async function GET() {
  const rewards = await db.reward.findMany({
    where: { status: "ACTIVE" },
    orderBy: { coinCost: "asc" },
    select: { id: true, name: true, coinCost: true, status: true, category: true, description: true, stock: true },
  });

  return NextResponse.json({ success: true, data: rewards });
}
