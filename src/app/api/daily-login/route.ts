import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEarnConfigValue } from "@/lib/earn/config";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const todayLogin = await db.auditLog.findFirst({
    where: {
      actorId: session.user.id,
      action: "DAILY_LOGIN_REWARD",
      createdAt: { gte: todayStart },
    },
  });

  const recentLogins = await db.auditLog.findMany({
    where: {
      actorId: session.user.id,
      action: "DAILY_LOGIN_REWARD",
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < recentLogins.length; i++) {
    const loginDate = new Date(recentLogins[i].createdAt);
    loginDate.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (loginDate.getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      claimedToday: !!todayLogin,
      streak,
      todayReward: await getEarnConfigValue("DAILY_LOGIN_REWARD"),
    },
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const rewardAmount = await getEarnConfigValue("DAILY_LOGIN_REWARD");

  let result;
  try {
    result = await db.$transaction(async (tx) => {
      const alreadyClaimed = await tx.auditLog.findFirst({
        where: {
          actorId: session.user.id,
          action: "DAILY_LOGIN_REWARD",
          createdAt: { gte: todayStart },
        },
      });

      if (alreadyClaimed) {
        throw new Error("ALREADY_CLAIMED");
      }

      const currentWallet = await tx.wallet.findUnique({ where: { userId: session.user.id } });
      if (!currentWallet) throw new Error("WALLET_NOT_FOUND");

      const balanceBefore = currentWallet.coinBalance;
      const balanceAfter = balanceBefore + rewardAmount;

      await tx.wallet.update({
        where: { id: currentWallet.id },
        data: {
          coinBalance: { increment: rewardAmount },
          totalEarned: { increment: rewardAmount },
        },
      });

      const txn = await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: currentWallet.id,
          type: "DAILY_LOGIN",
          amount: rewardAmount,
          balanceBefore,
          balanceAfter,
          description: "Daily login reward",
          status: "COMPLETED",
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "DAILY_LOGIN_REWARD",
          targetId: txn.id,
          metadata: JSON.stringify({ amount: rewardAmount }),
        },
      });

      return { txn, newBalance: currentWallet.coinBalance + rewardAmount };
    });
  } catch (txError) {
    const message = txError instanceof Error ? txError.message : "UNKNOWN";
    if (message === "ALREADY_CLAIMED") {
      return NextResponse.json({ success: false, message: "Already claimed today", code: "ALREADY_CLAIMED" }, { status: 409 });
    }
    if (message === "WALLET_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "Wallet not found", code: "WALLET_NOT_FOUND" }, { status: 404 });
    }
    throw txError;
  }

  return NextResponse.json({
    success: true,
    data: { transactionId: result.txn.id, amount: rewardAmount, newBalance: result.newBalance },
    message: `Claimed ${rewardAmount} daily login coins!`,
  });
}
