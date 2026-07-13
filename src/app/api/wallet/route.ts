import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/wallet — real wallet data for authenticated user
 * Returns: { coinBalance, totalEarned, totalSpent, status }
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const wallet = await db.wallet.findUnique({
    where: { userId: session.user.id },
    select: { id: true, coinBalance: true, totalEarned: true, totalSpent: true, status: true, updatedAt: true },
  });

  if (!wallet) {
    return NextResponse.json({ success: false, message: "Wallet not found", code: "WALLET_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: wallet.id,
      coinBalance: wallet.coinBalance,
      totalEarned: wallet.totalEarned,
      totalSpent: wallet.totalSpent,
      status: wallet.status,
      updatedAt: wallet.updatedAt,
    },
  });
}
