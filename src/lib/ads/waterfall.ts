import { db } from "@/lib/db";
import type { IAdProvider, IWaterfallStrategy } from "./interfaces";
import type { WaterfallAttempt, AdProviderKey } from "./types";
import { AdEventType, emitAdEvent } from "./events";

export class WaterfallStrategy implements IWaterfallStrategy {
  async execute(
    providers: IAdProvider[],
    userId: string,
    adType: string
  ): Promise<{
    success: boolean;
    sessionId?: string;
    rewardAmount: number;
    attempts: WaterfallAttempt[];
    providerUsed?: string;
  }> {
    emitAdEvent({ type: AdEventType.WATERFALL_STARTED, userId, timestamp: Date.now() });

    const attempts: WaterfallAttempt[] = [];
    const configs = await import("./config").then((m) => m.loadProviderConfigs());
    const configMap = new Map(configs.map((c) => [c.key, c]));

    for (const provider of providers) {
      if (!provider.isAvailable()) {
        attempts.push({
          providerKey: provider.key as AdProviderKey,
          status: "failed",
          errorCode: "UNAVAILABLE",
          durationMs: 0,
        });
        continue;
      }

      const providerReward = configMap.get(provider.key as AdProviderKey)?.rewardAmount ?? 1;

      const adEvent = await db.adEvent.create({
        data: {
          userId,
          providerKey: provider.key,
          adType,
          rewardAmount: providerReward,
          status: "STARTED",
          startedAt: new Date(),
        },
      });

      const startTime = Date.now();
      emitAdEvent({ type: AdEventType.WATERFALL_ATTEMPT, providerKey: provider.key, userId, sessionId: adEvent.id, timestamp: Date.now() });

      let attempt: WaterfallAttempt;
      try {
        attempt = await provider.showRewarded(userId, adEvent.id);
      } catch (err) {
        attempt = { providerKey: provider.key as AdProviderKey, status: "failed", errorCode: "PROVIDER_CRASHED", durationMs: Date.now() - startTime };
      }
      attempt.durationMs = Date.now() - startTime;
      attempts.push(attempt);

      if (attempt.status === "success") {
        await db.adEvent.update({
          where: { id: adEvent.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });

        emitAdEvent({ type: AdEventType.WATERFALL_SUCCESS, providerKey: provider.key, userId, sessionId: adEvent.id, rewardAmount: providerReward, durationMs: attempt.durationMs, timestamp: Date.now() });

        return { success: true, sessionId: adEvent.id, rewardAmount: providerReward, attempts, providerUsed: provider.key };
      }

      await db.adEvent.update({
        where: { id: adEvent.id },
        data: { status: "FAILED", errorCode: attempt.errorCode || "PROVIDER_FAILED" },
      });
    }

    emitAdEvent({ type: AdEventType.WATERFALL_EXHAUSTED, userId, timestamp: Date.now() });

    return { success: false, rewardAmount: 0, attempts };
  }
}
