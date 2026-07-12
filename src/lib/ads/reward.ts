import { db } from "@/lib/db";
import type { IRewardHandler } from "./interfaces";
import { AdEventType, emitAdEvent } from "./events";
import { getEarnConfigValue } from "@/lib/earn/config";

export class RewardHandler implements IRewardHandler {
  async credit(
    userId: string,
    sessionId: string,
    providerKey: string,
    rewardAmount: number
  ): Promise<{
    success: boolean;
    transactionId?: string;
    newBalance?: number;
    error?: string;
  }> {
    if (rewardAmount <= 0) {
      return { success: false, error: "Invalid reward amount" };
    }

    const adEvent = await db.adEvent.findUnique({ where: { id: sessionId } });
    if (!adEvent || adEvent.userId !== userId) {
      return { success: false, error: "Invalid session" };
    }
    if (adEvent.status === "VERIFIED") {
      return { success: false, error: "Already rewarded" };
    }
    if (adEvent.status !== "COMPLETED") {
      return { success: false, error: "Ad not completed" };
    }

    const velocityLimit = await getEarnConfigValue("AD_VELOCITY_LIMIT");
    const oneMinuteAgo = new Date(Date.now() - 60_000);
    const recentVerified = await db.adEvent.count({
      where: { userId, status: "VERIFIED", createdAt: { gte: oneMinuteAgo } },
    });
    if (recentVerified >= velocityLimit) {
      return { success: false, error: "Velocity limit reached" };
    }

    const wallet = await db.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return { success: false, error: "Wallet not found" };
    }

    emitAdEvent({ type: AdEventType.VERIFICATION_STARTED, userId, sessionId, rewardAmount, timestamp: Date.now() });

    try {
      const result = await db.$transaction(async (tx) => {
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            coinBalance: { increment: rewardAmount },
            totalEarned: { increment: rewardAmount },
          },
        });

        const txn = await tx.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            type: "AD_REWARD",
            amount: rewardAmount,
            balanceBefore: wallet.coinBalance,
            balanceAfter: wallet.coinBalance + rewardAmount,
            referenceId: sessionId,
            description: `Ad reward (${providerKey})`,
            status: "COMPLETED",
          },
        });

        await tx.adEvent.update({
          where: { id: sessionId },
          data: {
            status: "VERIFIED",
            verificationId: `v-${Date.now()}`,
          },
        });

        await tx.notification.create({
          data: {
            userId,
            title: "Ad Reward Earned!",
            message: `You earned ${rewardAmount} coins from ${providerKey}.`,
            type: "REWARD",
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: "AD_REWARD_CREDITED",
            targetId: txn.id,
            metadata: JSON.stringify({ amount: rewardAmount, providerKey, adEventId: sessionId }),
          },
        });

        const watchAdMission = await tx.mission.findUnique({ where: { key: "WATCH_ADS" } });
        if (watchAdMission) {
          const userMission = await tx.userMission.findUnique({
            where: { userId_missionId: { userId, missionId: watchAdMission.id } },
          });
          if (userMission && !userMission.completed) {
            const newProgress = userMission.progress + 1;
            await tx.userMission.update({
              where: { id: userMission.id },
              data: {
                progress: newProgress,
                completed: newProgress >= watchAdMission.requirement,
              },
            });
            if (newProgress >= watchAdMission.requirement) {
              await tx.missionLog.create({
                data: { userId, missionId: watchAdMission.id, reward: watchAdMission.rewardCoins },
              });
            }
          }
        }

        return { txn, newBalance: updatedWallet.coinBalance };
      });

      emitAdEvent({ type: AdEventType.REWARD_CREDITED, providerKey, userId, sessionId, rewardAmount, timestamp: Date.now() });

      return { success: true, transactionId: result.txn.id, newBalance: result.newBalance };
    } catch (error) {
      emitAdEvent({ type: AdEventType.REWARD_FAILED, providerKey, userId, sessionId, rewardAmount, timestamp: Date.now() });
      return { success: false, error: "Transaction failed" };
    }
  }
}
