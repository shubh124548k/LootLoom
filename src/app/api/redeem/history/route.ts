import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/redeem/history — user's redeem history (real data from database).
 * Returns all redeem requests for the authenticated user with reward details.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const requests = await db.redeemRequest.findMany({
    where: { userId: session.user.id },
    include: { reward: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: requests.map((r) => ({
      id: r.id,
      rewardName: r.reward.name,
      rewardCategory: r.reward.category,
      coinsUsed: r.coinsUsed,
      status: r.status,
      paymentMethod: r.paymentMethod,
      adminNote: r.adminNote,
      requestedAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  });
}
