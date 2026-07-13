import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { watchAd } from "@/lib/ads/manager";
import { db } from "@/lib/db";

const adQueueLocks = new Map<string, number>();

export async function POST(req: NextRequest) {
  let lockAcquired = false;
  let sessionUserId = "";
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;
    sessionUserId = userId;

    if (adQueueLocks.has(userId)) {
      const elapsed = Date.now() - adQueueLocks.get(userId)!;
      if (elapsed < 15000) {
        return NextResponse.json({ success: false, message: "Ad request already in progress", code: "QUEUE_LOCKED" }, { status: 429 });
      }
      adQueueLocks.delete(userId);
    }
    adQueueLocks.set(userId, Date.now());
    lockAcquired = true;

    const body = await req.json().catch(() => ({}));
    const adType = body.adType || "REWARDED_VIDEO";

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json({ success: false, message: "Account not active", code: "ACCOUNT_INACTIVE" }, { status: 403 });
    }

    const result = await watchAd(userId, adType);

    if (result.status === "success" && result.sessionId && result.rewardAmount > 0) {
      return NextResponse.json({
        success: true,
        data: {
          sessionId: result.sessionId,
          rewardAmount: result.rewardAmount,
          providerUsed: result.providerUsed,
          attempts: result.attempts.length,
        },
        message: `${result.rewardAmount} coins earned!`,
      });
    }

    if (result.status === "exhausted") {
      return NextResponse.json({
        success: false,
        message: "No ad available. Try again later.",
        code: "ALL_PROVIDERS_FAILED",
        data: { attempts: result.attempts.length },
      }, { status: 503 });
    }

    if (result.status === "error" && result.code === "DAILY_LIMIT_REACHED") {
      return NextResponse.json({
        success: false,
        message: "Daily limit reached. Come back tomorrow!",
        code: "DAILY_LIMIT_REACHED",
      }, { status: 429 });
    }

    return NextResponse.json({
      success: false,
      message: "Unable to show ad at this time.",
      code: "WATERFALL_ERROR",
      data: { attempts: result.attempts.length },
    }, { status: 503 });
  } catch (error) {
    console.error("[WATERFALL]", error instanceof Error ? error.stack || error.message : error);
    return NextResponse.json({ success: false, message: "Ad service error", code: "WATERFALL_CRASH", error: error instanceof Error ? error.message : "UNKNOWN" }, { status: 500 });
  } finally {
    if (lockAcquired && sessionUserId) adQueueLocks.delete(sessionUserId);
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const { getEarnConfig } = await import("@/lib/earn/config");
    const config = await getEarnConfig();

    const [todayCount, todayEarned, totalEarned, totalWatched, activeProviders] = await Promise.all([
      db.adEvent.count({ where: { userId, createdAt: { gte: todayStart }, status: "VERIFIED" } }),
      db.adEvent.aggregate({ where: { userId, createdAt: { gte: todayStart }, status: "VERIFIED" }, _sum: { rewardAmount: true } }),
      db.adEvent.aggregate({ where: { userId, status: "VERIFIED" }, _sum: { rewardAmount: true } }),
      db.adEvent.count({ where: { userId, status: "VERIFIED" } }),
      db.adProvider.findMany({ where: { enabled: true, status: "ACTIVE" }, orderBy: { priority: "asc" }, select: { key: true, name: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        todayAdsWatched: todayCount,
        todayEarnings: todayEarned._sum.rewardAmount || 0,
        totalAdsWatched: totalWatched,
        totalAdEarnings: totalEarned._sum.rewardAmount || 0,
        dailyLimit: parseInt(config.DAILY_AD_LIMIT, 10),
        dailyCoinLimit: parseInt(config.DAILY_COIN_LIMIT, 10),
        rewardPerAd: parseInt(config.AD_REWARD_AMOUNT, 10),
        remaining: Math.max(0, parseInt(config.DAILY_AD_LIMIT, 10) - todayCount),
        remainingCoins: Math.max(0, parseInt(config.DAILY_COIN_LIMIT, 10) - (todayEarned._sum.rewardAmount || 0)),
        providers: activeProviders,
      },
    });
  } catch (error) {
    console.error("[WATERFALL STATS]", error instanceof Error ? error.stack || error.message : error);
    return NextResponse.json({ success: false, message: "Failed to load ad stats", code: "STATS_ERROR", error: error instanceof Error ? error.message : "UNKNOWN" }, { status: 500 });
  }
}
