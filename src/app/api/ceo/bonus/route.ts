import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { atomicCoinCredit } from "@/lib/earn/credit";

const CEO_BONUS_LIMIT = new Map<string, { count: number; resetAt: number }>();
const BONUS_WINDOW = 60 * 1000;
const MAX_BONUS = 10;

function checkBonusRateLimit(ceoId: string): boolean {
  const now = Date.now();
  const entry = CEO_BONUS_LIMIT.get(ceoId);
  if (!entry || now > entry.resetAt) {
    CEO_BONUS_LIMIT.set(ceoId, { count: 1, resetAt: now + BONUS_WINDOW });
    return true;
  }
  if (entry.count >= MAX_BONUS) return false;
  entry.count++;
  return true;
}

async function requireCEO() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") return null;
  return session.user.id;
}

export async function POST(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  if (!checkBonusRateLimit(ceoId)) {
    return NextResponse.json({ success: false, message: "Too many bonus actions. Slow down.", code: "RATE_LIMITED" }, { status: 429 });
  }

  let body: { userId?: string; amount?: unknown; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body", code: "PARSE_ERROR" }, { status: 400 });
  }
  const { userId, amount, reason } = body;

  if (!userId || amount === undefined || amount === null || typeof amount !== "number" || !Number.isFinite(amount) || amount === 0) {
    return NextResponse.json({ success: false, message: "Amount must be a non-zero finite number", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  try {
    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
    }

    const wallet = await db.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return NextResponse.json({ success: false, message: "Wallet not found", code: "WALLET_NOT_FOUND" }, { status: 404 });
    }

    if (targetUser.status !== "ACTIVE" && amount > 0) {
      return NextResponse.json({ success: false, message: "Cannot credit coins to inactive user", code: "USER_INACTIVE" }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      const credit = await atomicCoinCredit(tx, {
        userId,
        walletId: wallet.id,
        amount,
        type: "ADMIN_ADJUSTMENT",
        description: reason || (amount > 0 ? "CEO bonus" : "CEO adjustment"),
        actorId: ceoId,
      });

      await tx.notification.create({
        data: {
          userId,
          title: amount > 0 ? "Bonus Received!" : "Coin Adjustment",
          message: amount > 0
            ? `You received a bonus of ${amount} coins!`
            : `${Math.abs(amount)} coins have been adjusted from your wallet.`,
          type: "WALLET",
        },
      });

      return credit;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Adjusted ${amount} coins for ${targetUser.name}`,
    });
  } catch (error) {
    console.error("[CEO BONUS POST]", error);
    return NextResponse.json({ success: false, message: "Failed to process bonus. Please try again.", code: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  if (!checkBonusRateLimit(ceoId)) {
    return NextResponse.json({ success: false, message: "Too many bonus actions. Slow down.", code: "RATE_LIMITED" }, { status: 429 });
  }

  let body: { userId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body", code: "PARSE_ERROR" }, { status: 400 });
  }
  const { userId, action } = body;

  if (!userId || !action) {
    return NextResponse.json({ success: false, message: "userId and action required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  try {
    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
    }

    let update: Record<string, unknown> = {};
    let auditAction = "";

    if (action === "FREEZE_EARNING") {
      update = { status: "SUSPENDED" };
      auditAction = "USER_EARNING_FROZEN";
    } else if (action === "UNFREEZE_EARNING") {
      update = { status: "ACTIVE" };
      auditAction = "USER_EARNING_UNFROZEN";
    } else if (action === "BAN") {
      update = { status: "BANNED" };
      auditAction = "USER_BANNED";
    } else {
      return NextResponse.json({ success: false, message: "Invalid action", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: update });
      await tx.auditLog.create({
        data: {
          actorId: ceoId,
          action: auditAction,
          targetId: userId,
          metadata: JSON.stringify({ userId, action }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `User ${action === "FREEZE_EARNING" ? "frozen" : action === "UNFREEZE_EARNING" ? "unfrozen" : "banned"} successfully`,
    });
  } catch (error) {
    console.error("[CEO BONUS PATCH]", error);
    return NextResponse.json({ success: false, message: "Failed to process action. Please try again.", code: "SERVER_ERROR" }, { status: 500 });
  }
}
