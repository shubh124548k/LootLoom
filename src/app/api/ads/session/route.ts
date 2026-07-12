import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEarnConfig } from "@/lib/earn/config";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json().catch(() => ({}));
  const adType = body.adType || "REWARDED_VIDEO";

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ success: false, message: "Account not active", code: "ACCOUNT_INACTIVE" }, { status: 403 });
  }

  const config = await getEarnConfig();
  const dailyAdLimit = parseInt(config.DAILY_AD_LIMIT, 10);
  const dailyCoinLimit = parseInt(config.DAILY_COIN_LIMIT, 10);
  const rewardAmount = parseInt(config.AD_REWARD_AMOUNT, 10);

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const [todayAdCount, todayCoinEarned] = await Promise.all([
    db.adEvent.count({
      where: { userId, createdAt: { gte: todayStart }, status: "VERIFIED" },
    }),
    db.transaction.aggregate({
      where: {
        userId,
        type: "AD_REWARD",
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
    }),
  ]);

  if (todayAdCount >= dailyAdLimit) {
    return NextResponse.json({
      success: false,
      message: `Daily ad limit (${dailyAdLimit}) reached. Try again tomorrow.`,
      code: "DAILY_LIMIT_REACHED",
      data: { watchedToday: todayAdCount, limit: dailyAdLimit },
    }, { status: 429 });
  }

  const earnedToday = todayCoinEarned._sum.amount || 0;
  if (earnedToday + rewardAmount > dailyCoinLimit) {
    return NextResponse.json({
      success: false,
      message: `Daily coin earning limit (${dailyCoinLimit}) reached.`,
      code: "DAILY_COIN_LIMIT_REACHED",
      data: { earnedToday, limit: dailyCoinLimit },
    }, { status: 429 });
  }

  const adEvent = await db.adEvent.create({
    data: {
      userId,
      network: "waterfall",
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
      limit: dailyAdLimit,
      remaining: Math.max(0, dailyAdLimit - todayAdCount),
      dailyCoinLimit,
      earnedToday,
    },
    message: "Ad session created. Complete the ad to earn coins.",
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id;
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const config = await getEarnConfig();

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

  const dailyAdLimit = parseInt(config.DAILY_AD_LIMIT, 10);
  const dailyCoinLimit = parseInt(config.DAILY_COIN_LIMIT, 10);
  const rewardAmount = parseInt(config.AD_REWARD_AMOUNT, 10);

  return NextResponse.json({
    success: true,
    data: {
      todayAdsWatched: todayCount,
      todayEarnings: todayEarned._sum.rewardAmount || 0,
      totalAdsWatched: totalWatched,
      totalAdEarnings: totalEarned._sum.rewardAmount || 0,
      dailyLimit: dailyAdLimit,
      dailyCoinLimit,
      rewardPerAd: rewardAmount,
      remaining: Math.max(0, dailyAdLimit - todayCount),
      remainingCoins: Math.max(0, dailyCoinLimit - (todayEarned._sum.rewardAmount || 0)),
    },
  });
}
