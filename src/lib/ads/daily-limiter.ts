import { db } from "@/lib/db";
import { getEarnConfig } from "@/lib/earn/config";

export interface DailyAdStatus {
  adsWatchedToday: number;
  dailyLimit: number;
  adsRemainingToday: number;
  rewardPerAd: number;
  earningsToday: number;
  dailyCoinLimit: number;
  remainingCoins: number;
  progressPercent: number;
  limitReached: boolean;
  nextReset: string;
  totalAdsWatched: number;
  totalAdEarnings: number;
}

export function getMidnightUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
}

export function isNewDay(lastReset: Date | null): boolean {
  if (!lastReset) return true;
  const now = new Date();
  const reset = new Date(lastReset);
  return (
    now.getUTCFullYear() !== reset.getUTCFullYear() ||
    now.getUTCMonth() !== reset.getUTCMonth() ||
    now.getUTCDate() !== reset.getUTCDate()
  );
}

export async function resetDailyCountsIfNeeded(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { lastResetDate: true, adsWatchedToday: true, dailyCoinsEarned: true },
  });
  if (!user) return;
  if (!isNewDay(user.lastResetDate)) return;
  await db.user.update({
    where: { id: userId },
    data: {
      adsWatchedToday: 0,
      dailyCoinsEarned: 0,
      lastResetDate: new Date(),
      lastRewardTime: null,
    },
  });
}

async function syncDailyCounts(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { adsWatchedToday: true, dailyCoinsEarned: true, lastResetDate: true },
  });
  if (!user || user.lastResetDate) return;
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const [adCount, coinSum] = await Promise.all([
    db.adEvent.count({ where: { userId, createdAt: { gte: todayStart }, status: "VERIFIED" } }),
    db.transaction.aggregate({
      where: { userId, type: "AD_REWARD", createdAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
  ]);
  if (adCount > 0 || (coinSum._sum.amount || 0) > 0) {
    await db.user.update({
      where: { id: userId },
      data: {
        adsWatchedToday: adCount,
        dailyCoinsEarned: coinSum._sum.amount || 0,
        lastResetDate: new Date(),
      },
    });
  } else {
    await db.user.update({
      where: { id: userId },
      data: { lastResetDate: new Date() },
    });
  }
}

export async function getDailyAdStatus(userId: string): Promise<DailyAdStatus> {
  await resetDailyCountsIfNeeded(userId);
  await syncDailyCounts(userId);

  const config = await getEarnConfig();
  const dailyLimit = parseInt(config.DAILY_AD_LIMIT, 10);
  const rewardPerAd = parseInt(config.AD_REWARD_AMOUNT, 10);
  const dailyCoinLimit = parseInt(config.DAILY_COIN_LIMIT, 10);

  const [user, totalStats] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { adsWatchedToday: true, dailyCoinsEarned: true },
    }),
    db.adEvent.aggregate({
      where: { userId, status: "VERIFIED" },
      _sum: { rewardAmount: true },
      _count: true,
    }),
  ]);

  const adsWatchedToday = user?.adsWatchedToday ?? 0;
  const earningsToday = user?.dailyCoinsEarned ?? 0;
  const adsRemainingToday = Math.max(0, dailyLimit - adsWatchedToday);
  const remainingCoins = Math.max(0, dailyCoinLimit - earningsToday);
  const progressPercent = Math.min(100, Math.round((adsWatchedToday / dailyLimit) * 100));
  const limitReached = adsWatchedToday >= dailyLimit;
  const nextReset = (await getMidnightUTC()).toISOString();
  const totalAdsWatched = totalStats._count ?? 0;
  const totalAdEarnings = totalStats._sum.rewardAmount ?? 0;

  return {
    adsWatchedToday,
    dailyLimit,
    adsRemainingToday,
    rewardPerAd,
    earningsToday,
    dailyCoinLimit,
    remainingCoins,
    progressPercent,
    limitReached,
    nextReset,
    totalAdsWatched,
    totalAdEarnings,
  };
}
