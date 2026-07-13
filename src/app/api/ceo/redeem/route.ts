import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { emitWalletUpdated, emitNotificationCreated, emitRedeemUpdated } from "@/lib/realtime";

async function requireCEO() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") return null;
  return session.user.id;
}

const VALID_STATUSES = ["PENDING", "APPROVED", "PROCESSING", "PAID", "REJECTED", "CANCELLED", "REFUNDED", "COMPLETED"] as const;
type RedeemStatus = typeof VALID_STATUSES[number];

const STATUS_TRANSITIONS: Record<string, RedeemStatus[]> = {
  APPROVE: ["PENDING"],
  PROCESS: ["APPROVED"],
  PAID: ["PROCESSING"],
  REJECT: ["PENDING"],
  CANCEL: ["PENDING", "APPROVED"],
  REFUND: ["PAID", "COMPLETED"],
  COMPLETE: ["PAID"],
};

const REFUND_ACTIONS = new Set(["REJECT", "CANCEL", "REFUND"]);

function maskPaymentDetails(details: string | null): string | null {
  if (!details) return null;
  if (details.length <= 4) return details;
  return `${"*".repeat(details.length - 4)}${details.slice(-4)}`;
}

export async function GET(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10) || 20));
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const rewardId = searchParams.get("rewardId");

  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (rewardId) {
    where.rewardId = rewardId;
  }

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo);
    where.createdAt = createdAt;
  }

  if (search) {
    where.OR = [
      { user: { username: { contains: search } } },
      { user: { email: { contains: search } } },
      { paymentDetails: { contains: search } },
      { transactionId: { contains: search } },
      { redeemId: { contains: search } },
    ];
  }

  const orderBy: Record<string, string> =
    sort === "oldest" ? { createdAt: "asc" } :
    sort === "highest" ? { coinsUsed: "desc" } :
    sort === "lowest" ? { coinsUsed: "asc" } :
    { createdAt: "desc" };

  const [data, total] = await Promise.all([
    db.redeemRequest.findMany({
      where,
      include: { user: true, reward: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.redeemRequest.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: data.map((r) => ({
      id: r.id,
      redeemId: r.redeemId,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        avatar: r.user.avatar,
      },
      reward: {
        id: r.reward.id,
        name: r.reward.name,
        category: r.reward.category,
        coinCost: r.reward.coinCost,
      },
      coinsUsed: r.coinsUsed,
      paymentMethod: r.paymentMethod,
      paymentDetailsMasked: maskPaymentDetails(r.paymentDetails),
      userNote: r.userNote,
      status: r.status,
      adminNote: r.adminNote,
      transactionId: r.transactionId,
      paymentDate: r.paymentDate,
      processedBy: r.processedBy,
      processedAt: r.processedAt,
      requestedAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
    pagination: { page, pageSize, total },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const ceoId = await requireCEO();
    if (!ceoId) {
      return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, action, reason, transactionId, paymentDate } = body;

    if (!requestId || !action) {
      return NextResponse.json({ success: false, message: "requestId and action required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    if (!STATUS_TRANSITIONS[action]) {
      return NextResponse.json({ success: false, message: `Invalid action "${action}". Valid actions: ${Object.keys(STATUS_TRANSITIONS).join(", ")}`, code: "INVALID_ACTION" }, { status: 400 });
    }

    if (reason !== undefined && (typeof reason !== "string" || reason.length > 500)) {
      return NextResponse.json({ success: false, message: "reason must be a string with at most 500 characters", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const redeemRequest = await db.redeemRequest.findUnique({
      where: { id: requestId },
      include: { user: true, reward: true, wallet: true },
    });

    if (!redeemRequest) {
      return NextResponse.json({ success: false, message: "Redeem request not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const allowedStatuses = STATUS_TRANSITIONS[action];
    if (!allowedStatuses.includes(redeemRequest.status as RedeemStatus)) {
      return NextResponse.json({
        success: false,
        message: `Cannot ${action} a request with status "${redeemRequest.status}". Expected status: ${allowedStatuses.join(" or ")}`,
        code: "INVALID_STATUS_TRANSITION",
      }, { status: 400 });
    }

    if (action === "PAID") {
      if (!transactionId || typeof transactionId !== "string" || !transactionId.trim()) {
        return NextResponse.json({ success: false, message: "transactionId is required for PAID action", code: "VALIDATION_ERROR" }, { status: 400 });
      }
      if (redeemRequest.transactionId) {
        return NextResponse.json({ success: false, message: "A transaction ID has already been set for this request", code: "CONFLICT" }, { status: 409 });
      }
    }

    if (action === "APPROVE" && redeemRequest.transactionId) {
      return NextResponse.json({ success: false, message: "Cannot approve — a transaction ID is already present", code: "CONFLICT" }, { status: 409 });
    }

    if (REFUND_ACTIONS.has(action) && redeemRequest.status === "REFUNDED") {
      return NextResponse.json({ success: false, message: "This request has already been refunded", code: "DOUBLE_REFUND" }, { status: 400 });
    }

    const newStatus: RedeemStatus =
      action === "APPROVE" ? "APPROVED" :
      action === "PROCESS" ? "PROCESSING" :
      action === "PAID" ? "PAID" :
      action === "REJECT" ? "REJECTED" :
      action === "CANCEL" ? "CANCELLED" :
      action === "REFUND" ? "REFUNDED" :
      action === "COMPLETE" ? "COMPLETED" :
      redeemRequest.status as RedeemStatus;

    const shouldRefund = REFUND_ACTIONS.has(action);
    const now = new Date();

    type NotificationMeta = { title: string; message: string };
    const notif = ((): NotificationMeta => {
      switch (action) {
        case "APPROVE":
          return {
            title: "Redeem Approved!",
            message: `Your redeem request for ${redeemRequest.reward.name} has been approved and is being processed.${reason ? ` Note: ${reason}` : ""}`,
          };
        case "PROCESS":
          return {
            title: "Redeem Processing",
            message: `Your redeem request for ${redeemRequest.reward.name} is now being processed.`,
          };
        case "PAID":
          return {
            title: "Redeem Paid!",
            message: `Your redeem request for ${redeemRequest.reward.name} has been paid (Tx: ${transactionId}).${reason ? ` Note: ${reason}` : ""}`,
          };
        case "REJECT":
          return {
            title: "Redeem Rejected",
            message: `Your redeem request for ${redeemRequest.reward.name} was rejected. ${redeemRequest.coinsUsed} coins have been refunded to your wallet.${reason ? ` Reason: ${reason}` : ""}`,
          };
        case "CANCEL":
          return {
            title: "Redeem Cancelled",
            message: `Your redeem request for ${redeemRequest.reward.name} has been cancelled. ${redeemRequest.coinsUsed} coins have been refunded to your wallet.${reason ? ` Reason: ${reason}` : ""}`,
          };
        case "REFUND":
          return {
            title: "Redeem Refunded",
            message: `Your redeem request for ${redeemRequest.reward.name} has been refunded. ${redeemRequest.coinsUsed} coins have been credited back to your wallet.${reason ? ` Reason: ${reason}` : ""}`,
          };
        case "COMPLETE":
          return {
            title: "Redeem Completed!",
            message: `Your redeem request for ${redeemRequest.reward.name} has been completed. Enjoy your reward!`,
          };
        default:
          return { title: "Redeem Updated", message: `Your redeem request for ${redeemRequest.reward.name} has been updated.` };
      }
    })();

    const auditAction = `REDEEM_${action}`;

    await db.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = { status: newStatus };

      if (reason) {
        updateData.adminNote = reason;
      }

      if (action === "PAID") {
        updateData.transactionId = transactionId!.trim();
        updateData.paymentDate = paymentDate ? new Date(paymentDate) : now;
        updateData.processedBy = ceoId;
        updateData.processedAt = now;
      }

      await tx.redeemRequest.update({
        where: { id: requestId },
        data: updateData,
      });

      if (shouldRefund) {
        const wallet = redeemRequest.wallet;
        const balanceBefore = wallet.coinBalance;
        const balanceAfter = balanceBefore + redeemRequest.coinsUsed;

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            coinBalance: { increment: redeemRequest.coinsUsed },
            totalSpent: { decrement: redeemRequest.coinsUsed },
          },
        });

        await tx.transaction.create({
          data: {
            userId: redeemRequest.userId,
            walletId: wallet.id,
            type: "REFUND",
            amount: redeemRequest.coinsUsed,
            balanceBefore,
            balanceAfter,
            referenceId: requestId,
            description: `Refund: Redeem ${action.toLowerCase()}d - ${redeemRequest.reward.name}`,
            status: "COMPLETED",
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: redeemRequest.userId,
          title: notif.title,
          message: notif.message,
          type: "REDEEM",
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: ceoId,
          action: auditAction,
          targetId: requestId,
          metadata: JSON.stringify({
            userId: redeemRequest.userId,
            rewardName: redeemRequest.reward.name,
            coins: redeemRequest.coinsUsed,
            reason: reason || null,
            transactionId: transactionId || null,
            previousStatus: redeemRequest.status,
            newStatus,
          }),
        },
      });
    });

    if (shouldRefund) {
      void emitWalletUpdated(redeemRequest.userId, {
        coinBalance: redeemRequest.wallet.coinBalance + redeemRequest.coinsUsed,
        totalEarned: redeemRequest.wallet.totalEarned,
        totalSpent: redeemRequest.wallet.totalSpent - redeemRequest.coinsUsed,
      });
    }
    void emitNotificationCreated(redeemRequest.userId, {
      id: requestId,
      title: notif.title,
      message: notif.message,
      type: "REDEEM",
      createdAt: new Date().toISOString(),
    });
    void emitRedeemUpdated(redeemRequest.userId, {
      id: requestId,
      status: newStatus,
      rewardName: redeemRequest.reward.name,
    });

    return NextResponse.json({
      success: true,
      message: `Redeem request ${newStatus.toLowerCase()}`,
      data: {
        requestId,
        status: newStatus,
        refundAmount: shouldRefund ? redeemRequest.coinsUsed : 0,
        transactionId: action === "PAID" ? transactionId : undefined,
      },
    });
  } catch (error) {
    console.error("[CEO REDEEM PATCH]", error);
    return NextResponse.json({ success: false, message: "Failed to process redeem request" }, { status: 500 });
  }
}
