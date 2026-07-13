import { db } from "@/lib/db";
import type { AdProviderConfig, WaterfallResult, AdProviderKey, WaterfallAttempt } from "./types";
import { getEnabledProviders, updateProviderStats } from "./config";
import { buildProviders, clearProviders, getProvider, registerProvider, GenericAdProvider } from "./provider";
import { WaterfallStrategy } from "./waterfall";
import { RewardHandler } from "./reward";
import { VerificationService } from "./verification";
import { loadProviderConfigs } from "./config";
import { registerAllProviders } from "./providers";
import { getEarnConfig } from "@/lib/earn/config";

const waterfall = new WaterfallStrategy();
const rewardHandler = new RewardHandler();
const verificationService = new VerificationService();

let initialized = false;

export async function initAdManager(): Promise<void> {
  if (initialized) return;
  registerAllProviders();
  const configs = await loadProviderConfigs();
  if (configs.length > 0) {
    await buildProviders(configs);
  }
  initialized = true;
}

export async function refreshAdProviders(): Promise<void> {
  initialized = false;
  await initAdManager();
}

export async function watchAd(userId: string, adType = "REWARDED_VIDEO"): Promise<WaterfallResult> {
  const config = await getEarnConfig();
  const dailyAdLimit = parseInt(config.DAILY_AD_LIMIT, 10);
  const dailyCoinLimit = parseInt(config.DAILY_COIN_LIMIT, 10);

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const [todayAdCount, todayCoinEarned] = await Promise.all([
    db.adEvent.count({
      where: { userId, createdAt: { gte: todayStart }, status: "VERIFIED" },
    }),
    db.transaction.aggregate({
      where: { userId, type: "AD_REWARD", createdAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
  ]);

  if (todayAdCount >= dailyAdLimit) {
    return {
      status: "error",
      rewardAmount: 0,
      attempts: [],
    };
  }

  const earnedToday = todayCoinEarned._sum.amount || 0;
  const configs = await getEnabledProviders();
  const baseReward = configs.length > 0 ? configs[0].rewardAmount : parseInt(config.AD_REWARD_AMOUNT, 10);

  if (earnedToday + baseReward > dailyCoinLimit) {
    return {
      status: "error",
      rewardAmount: 0,
      attempts: [],
    };
  }

  await initAdManager();
  const providers = configs.map((cfg: AdProviderConfig) => {
    let p = getProvider(cfg.key);
    if (!p) {
      p = new GenericAdProvider(cfg.key, cfg.name);
      registerProvider(p);
    }
    return p;
  });

  const result = await waterfall.execute(providers, userId, adType);

  if (result.success && result.sessionId) {
    const verification = await verificationService.verify(result.sessionId, userId);
    if (verification.valid) {
      const creditResult = await rewardHandler.credit(userId, result.sessionId, result.providerUsed || "waterfall", result.rewardAmount);
      if (creditResult.success && result.providerUsed) {
        await updateProviderStats(result.providerUsed, { success: true, revenue: result.rewardAmount });
      }
      return {
        status: creditResult.success ? "success" : "error",
        sessionId: result.sessionId,
        rewardAmount: result.rewardAmount,
        attempts: result.attempts,
        providerUsed: result.providerUsed as AdProviderKey,
      };
    }
  }

  if (result.providerUsed) {
    await updateProviderStats(result.providerUsed, { error: true });
  }

  if (result.attempts.length > 0) {
    return {
      status: "exhausted",
      rewardAmount: 0,
      attempts: result.attempts,
    };
  }

  return {
    status: "error",
    rewardAmount: 0,
    attempts: result.attempts,
  };
}

export function getVerificationService(): VerificationService {
  return verificationService;
}

export function getRewardHandler(): RewardHandler {
  return rewardHandler;
}
