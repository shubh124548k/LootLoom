import { db } from "@/lib/db";
import type { PrismaClient, Prisma } from "@prisma/client";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

interface CreditResult {
  transactionId: string;
  balanceBefore: number;
  balanceAfter: number;
  walletId: string;
}

interface CreditInput {
  userId: string;
  walletId: string;
  amount: number;
  type: string;
  referenceId?: string;
  description: string;
  actorId?: string;
}

export async function atomicCoinCredit(
  tx: TxClient,
  input: CreditInput
): Promise<CreditResult> {
  const { userId, walletId, amount, type, referenceId, description, actorId } = input;

  const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) throw new Error("Wallet not found");

  const balanceBefore = wallet.coinBalance;
  const balanceAfter = balanceBefore + amount;

  await tx.wallet.update({
    where: { id: walletId },
    data: {
      coinBalance: { increment: amount },
      totalEarned: { increment: amount > 0 ? amount : 0 },
      ...(amount < 0 ? { totalSpent: { increment: Math.abs(amount) } } : {}),
    },
  });

  const txn = await tx.transaction.create({
    data: {
      userId,
      walletId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      referenceId: referenceId || null,
      description,
      status: "COMPLETED",
    },
  });

  await tx.auditLog.create({
    data: {
      actorId: actorId || userId,
      action: amount > 0 ? "WALLET_CREDIT" : "WALLET_DEBIT",
      targetId: txn.id,
      metadata: JSON.stringify({ amount, type, referenceId, description }),
    },
  });

  return {
    transactionId: txn.id,
    balanceBefore,
    balanceAfter,
    walletId,
  };
}
