import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/rewards — real reward catalog from database
 */
export async function GET() {
  const rewards = await db.reward.findMany({
    where: { status: "ACTIVE" },
    orderBy: { coinCost: "asc" },
  });

  return NextResponse.json({ success: true, data: rewards });
}
