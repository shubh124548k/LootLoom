import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/user — real authenticated user data
 * Returns: { id, name, email, avatar, role, status, wallet, profile }
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { wallet: true, profile: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        memberSince: user.createdAt,
        lastLogin: user.lastLoginAt,
        wallet: user.wallet
          ? {
              id: user.wallet.id,
              coinBalance: user.wallet.coinBalance,
              totalEarned: user.wallet.totalEarned,
              totalSpent: user.wallet.totalSpent,
            }
          : null,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error", code: "SERVER_ERROR" }, { status: 500 });
  }
}
