import { db } from "@/lib/db";
import type { IVerificationService } from "./interfaces";
import { AdEventType, emitAdEvent } from "./events";
import { getEarnConfigValue } from "@/lib/earn/config";

export class VerificationService implements IVerificationService {
  async verify(sessionId: string, userId: string): Promise<{ valid: boolean; rewardAmount: number; error?: string }> {
    const sessionValid = await this.validateSession(sessionId, userId);
    if (!sessionValid) {
      return { valid: false, rewardAmount: 0, error: "Invalid session" };
    }

    const duplicate = await this.checkDuplicate(sessionId);
    if (duplicate) {
      return { valid: false, rewardAmount: 0, error: "Duplicate reward" };
    }

    const velocityOk = await this.checkVelocity(userId);
    if (!velocityOk) {
      return { valid: false, rewardAmount: 0, error: "Velocity limit" };
    }

    const adEvent = await db.adEvent.findUnique({ where: { id: sessionId } });
    if (!adEvent) {
      return { valid: false, rewardAmount: 0, error: "Session not found" };
    }

    const minDuration = await getEarnConfigValue("MIN_AD_DURATION_MS");
    const sessionAge = adEvent.startedAt ? Date.now() - adEvent.startedAt.getTime() : 0;
    if (sessionAge < minDuration) {
      await db.adEvent.update({ where: { id: sessionId }, data: { status: "FAILED", errorCode: "TOO_FAST" } });
      emitAdEvent({ type: AdEventType.VERIFICATION_FAILED, userId, sessionId, errorCode: "TOO_FAST", timestamp: Date.now() });
      return { valid: false, rewardAmount: 0, error: "Completed too quickly" };
    }

    emitAdEvent({ type: AdEventType.VERIFICATION_PASSED, userId, sessionId, rewardAmount: adEvent.rewardAmount, timestamp: Date.now() });
    return { valid: true, rewardAmount: adEvent.rewardAmount };
  }

  async validateSession(sessionId: string, userId: string): Promise<boolean> {
    const adEvent = await db.adEvent.findUnique({ where: { id: sessionId } });
    if (!adEvent) return false;
    if (adEvent.userId !== userId) return false;
    if (adEvent.status !== "COMPLETED") return false;
    return true;
  }

  async checkDuplicate(sessionId: string): Promise<boolean> {
    const adEvent = await db.adEvent.findUnique({ where: { id: sessionId } });
    if (!adEvent) return true;
    return adEvent.status === "VERIFIED";
  }

  async checkVelocity(userId: string): Promise<boolean> {
    const velocityLimit = await getEarnConfigValue("AD_VELOCITY_LIMIT");
    const oneMinuteAgo = new Date(Date.now() - 60_000);
    const recentVerified = await db.adEvent.count({
      where: { userId, status: "VERIFIED", createdAt: { gte: oneMinuteAgo } },
    });
    return recentVerified < velocityLimit;
  }
}
