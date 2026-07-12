import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const REDEEM_LIMIT = new Map<string, { count: number; resetAt: number }>();
const REDEEM_WINDOW = 60 * 1000;
const MAX_REDEEMS = 5;

function checkRedeemRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = REDEEM_LIMIT.get(userId);
  if (!entry || now > entry.resetAt) {
    REDEEM_LIMIT.set(userId, { count: 1, resetAt: now + REDEEM_WINDOW });
    return true;
  }
  if (entry.count >= MAX_REDEEMS) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    if (!checkRedeemRateLimit(session.user.id)) {
      return NextResponse.json({ success: false, message: "Too many requests. Please try again later.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const body = await req.json();
    const { rewardId, paymentMethod, paymentDetails, userNote } = body;

    if (!rewardId || !paymentDetails) {
      return NextResponse.json(
        { success: false, message: "Reward ID and payment details are required", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    const reward = await db.reward.findUnique({ where: { id: rewardId } });
    if (!reward || reward.status !== "ACTIVE") {
      return NextResponse.json({ success: false, message: "Reward not available", code: "REWARD_NOT_FOUND" }, { status: 404 });
    }

    let result;
    try {
      result = await db.$transaction(async (tx) => {
        const existingPending = await tx.redeemRequest.findFirst({
          where: { userId: session.user.id, rewardId, status: "PENDING" },
        });
        if (existingPending) {
          throw new Error("DUPLICATE_REQUEST");
        }

        const currentWallet = await tx.wallet.findUnique({ where: { userId: session.user.id } });
        if (!currentWallet) throw new Error("WALLET_NOT_FOUND");
        if (currentWallet.status === "FROZEN") throw new Error("WALLET_FROZEN");

        if (currentWallet.coinBalance < reward.coinCost) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        const balanceBefore = currentWallet.coinBalance;
        const balanceAfter = balanceBefore - reward.coinCost;

        const updatedWallet = await tx.wallet.update({
          where: { id: currentWallet.id },
          data: {
            coinBalance: balanceAfter,
            totalSpent: { increment: reward.coinCost },
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            userId: session.user.id,
            walletId: currentWallet.id,
            type: "REDEEM",
            amount: -reward.coinCost,
            balanceBefore,
            balanceAfter,
            description: `Redeem: ${reward.name}`,
            status: "COMPLETED",
          },
        });

        const redeemRequest = await tx.redeemRequest.create({
          data: {
            userId: session.user.id,
            rewardId: reward.id,
            walletId: currentWallet.id,
            coinsUsed: reward.coinCost,
            paymentMethod: paymentMethod || null,
            paymentDetails: paymentDetails || null,
            userNote: userNote || null,
            status: "PENDING",
          },
        });

        await tx.notification.create({
          data: {
            userId: session.user.id,
            title: "Redeem Request Submitted",
            message: `Your redeem for ${reward.name} has been submitted and is pending review.`,
            type: "REDEEM",
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "REDEEM_REQUESTED",
            targetId: redeemRequest.id,
            metadata: JSON.stringify({ rewardId, coinsUsed: reward.coinCost }),
          },
        });

        return { updatedWallet, transaction, redeemRequest };
      });
    } catch (txError) {
      const message = txError instanceof Error ? txError.message : "UNKNOWN";
      if (message === "DUPLICATE_REQUEST") {
        return NextResponse.json({ success: false, message: "You already have a pending redeem for this reward", code: "DUPLICATE_REQUEST" }, { status: 409 });
      }
      if (message === "WALLET_FROZEN") {
        return NextResponse.json({ success: false, message: "Wallet is frozen", code: "WALLET_FROZEN" }, { status: 403 });
      }
      if (message === "INSUFFICIENT_BALANCE") {
        return NextResponse.json({ success: false, message: "Insufficient coins", code: "INSUFFICIENT_BALANCE" }, { status: 422 });
      }
      if (message === "WALLET_NOT_FOUND") {
        return NextResponse.json({ success: false, message: "Wallet not found", code: "WALLET_NOT_FOUND" }, { status: 404 });
      }
      throw txError;
    }

    return NextResponse.json({
      success: true,
      data: {
        redeemRequest: result.redeemRequest,
        newBalance: result.updatedWallet.coinBalance,
      },
      message: "Redeem request submitted successfully",
    });
  } catch (error) {
    console.error("Redeem POST error:", error);
    return NextResponse.json({ success: false, message: "An unexpected error occurred", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const requests = await db.redeemRequest.findMany({
      where: { userId: session.user.id },
      include: { reward: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: requests.map((r) => ({
        ...r,
        paymentDetails: r.paymentDetails ? `****${r.paymentDetails.slice(-4)}` : null,
      })),
    });
  } catch (error) {
    console.error("Redeem GET error:", error);
    return NextResponse.json({ success: false, message: "An unexpected error occurred", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
