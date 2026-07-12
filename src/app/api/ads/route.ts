import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEarnConfigValue } from "@/lib/earn/config";

const ipWatchMap = new Map<string, { count: number; resetAt: number }>();

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipWatchMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipWatchMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { sessionId } = body;

  if (!sessionId) {
    return NextResponse.json({ success: false, message: "Session ID required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const adEvent = await db.adEvent.findUnique({ where: { id: sessionId } });
  if (!adEvent || adEvent.userId !== userId) {
    return NextResponse.json({ success: false, message: "Invalid ad session", code: "INVALID_SESSION" }, { status: 404 });
  }

  if (adEvent.status === "VERIFIED" || adEvent.status === "COMPLETED") {
    return NextResponse.json({ success: false, message: "Ad already rewarded", code: "DUPLICATE_REWARD" }, { status: 409 });
  }
  if (adEvent.status === "FAILED") {
    return NextResponse.json({ success: false, message: "Ad session failed", code: "SESSION_FAILED" }, { status: 400 });
  }

  const minDuration = await getEarnConfigValue("MIN_AD_DURATION_MS");
  const sessionAge = Date.now() - adEvent.createdAt.getTime();
  if (sessionAge < minDuration) {
    await db.adEvent.update({ where: { id: adEvent.id }, data: { status: "FAILED" } });
    return NextResponse.json({ success: false, message: "Ad completed too quickly", code: "FRAUD_TOO_FAST" }, { status: 422 });
  }

  const velocityLimit = await getEarnConfigValue("AD_VELOCITY_LIMIT");
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentVerifiedCount = await db.adEvent.count({
    where: { userId, status: "VERIFIED", createdAt: { gte: oneMinuteAgo } },
  });
  if (recentVerifiedCount >= velocityLimit) {
    await db.adEvent.update({ where: { id: adEvent.id }, data: { status: "FAILED" } });
    return NextResponse.json({ success: false, message: "Ad velocity limit reached", code: "FRAUD_VELOCITY" }, { status: 429 });
  }

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (!checkIpRateLimit(ip)) {
    await db.adEvent.update({ where: { id: adEvent.id }, data: { status: "FAILED" } });
    return NextResponse.json({ success: false, message: "IP rate limit exceeded", code: "FRAUD_IP" }, { status: 429 });
  }

  const wallet = await db.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    return NextResponse.json({ success: false, message: "Wallet not found", code: "WALLET_NOT_FOUND" }, { status: 404 });
  }

  const rewardAmount = adEvent.rewardAmount;
  if (rewardAmount <= 0) {
    return NextResponse.json({ success: false, message: "Invalid reward amount", code: "INVALID_REWARD" }, { status: 400 });
  }

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
        referenceId: adEvent.id,
        description: `Ad reward (${adEvent.adType})`,
        status: "COMPLETED",
      },
    });

    await tx.adEvent.update({
      where: { id: adEvent.id },
      data: { status: "VERIFIED", verificationId: `verified-${Date.now()}` },
    });

    await tx.notification.create({
      data: {
        userId,
        title: "Ad Reward Earned!",
        message: `You earned ${rewardAmount} coins from watching an ad.`,
        type: "REWARD",
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "AD_REWARD_CREDITED",
        targetId: txn.id,
        metadata: JSON.stringify({ amount: rewardAmount, adEventId: adEvent.id }),
      },
    });

    // Update mission progress for WATCH_ADS mission
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

  return NextResponse.json({
    success: true,
    data: {
      transaction: {
        id: result.txn.id,
        type: result.txn.type,
        amount: result.txn.amount,
        balanceAfter: result.txn.balanceAfter,
      },
      newBalance: result.newBalance,
      rewardAmount,
    },
    message: `${rewardAmount} coins credited to your wallet`,
  });
}
