import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALLOWED_CATEGORIES = ["UPI", "REDEEM_CODE"];

/**
 * GET /api/rewards — reward catalog from database.
 * Returns only ACTIVE rewards in allowed categories (UPI, REDEEM_CODE).
 * Old game rewards (BGMI, PUBG, Free Fire, Steam, etc.) are excluded.
 */
export async function GET() {
  const rewards = await db.reward.findMany({
    where: { status: "ACTIVE", category: { in: ALLOWED_CATEGORIES } },
    orderBy: { coinCost: "asc" },
    select: { id: true, name: true, coinCost: true, status: true, category: true, description: true, stock: true },
  });

  return NextResponse.json({ success: true, data: rewards });
}
