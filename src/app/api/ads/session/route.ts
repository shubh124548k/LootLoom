import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/ads/session — create a new ad session for the user.
 * Body: { adType?: "REWARDED_VIDEO" }
 *
 * Flow: User clicks "Watch Ad" → frontend requests session → backend validates
 * (auth, daily limit, account status) → returns session ID + reward amount.
 *
 * The reward amount is determined by the BACKEND, never the frontend.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json().catch(() => ({}));
  const adType = body.adType || "REWARDED_VIDEO";

  // Check account status
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ success: false, message: "Account not active", code: "ACCOUNT_INACTIVE" }, { status: 403 });
  }

  // Daily ad limit check (100 ads per day for free users)
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayAdCount = await db.adEvent.count({
    where: { userId, createdAt: { gte: todayStart }, status: "VERIFIED" },
  });
  const DAILY_LIMIT = 100;
  if (todayAdCount >= DAILY_LIMIT) {
    return NextResponse.json({
      success: false,
      message: `Daily ad limit (${DAILY_LIMIT}) reached. Try again tomorrow.`,
      code: "DAILY_LIMIT_REACHED",
      data: { watchedToday: todayAdCount, limit: DAILY_LIMIT },
    }, { status: 429 });
  }

  // Backend determines reward amount (never frontend)
  // Standard rewarded video = 25 coins (configurable in future via RewardConfig table)
  const rewardAmount = 25;

  // Create ad session
  const adEvent = await db.adEvent.create({
    data: {
      userId,
      network: "waterfall", // determined by waterfall selection
      adType,
      rewardAmount,
      status: "STARTED",
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      sessionId: adEvent.id,
      rewardAmount,
      adType,
      watchedToday: todayAdCount,
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - todayAdCount,
    },
    message: "Ad session created. Complete the ad to earn coins.",
  });
}

/**
 * GET /api/ads/session — get user's ad stats for today.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id;
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const [todayCount, todayEarned, totalEarned, totalWatched] = await Promise.all([
    db.adEvent.count({ where: { userId, createdAt: { gte: todayStart }, status: "VERIFIED" } }),
    db.adEvent.aggregate({
      where: { userId, createdAt: { gte: todayStart }, status: "VERIFIED" },
      _sum: { rewardAmount: true },
    }),
    db.adEvent.aggregate({
      where: { userId, status: "VERIFIED" },
      _sum: { rewardAmount: true },
    }),
    db.adEvent.count({ where: { userId, status: "VERIFIED" } }),
  ]);

  const DAILY_LIMIT = 100;

  return NextResponse.json({
    success: true,
    data: {
      todayAdsWatched: todayCount,
      todayEarnings: todayEarned._sum.rewardAmount || 0,
      totalAdsWatched: totalWatched,
      totalAdEarnings: totalEarned._sum.rewardAmount || 0,
      dailyLimit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - todayCount),
    },
  });
}
