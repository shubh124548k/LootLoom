import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/wallet/transactions — real transaction history with filters, search, pagination.
 * Query: ?page=1&pageSize=20&type=AD_REWARD&status=COMPLETED&search=reward&dateFrom=&dateTo=
 *
 * Security: user can only see their own transactions (scoped by session.user.id).
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 100);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // Build where clause — always scoped to authenticated user
  const where: Record<string, unknown> = { userId: session.user.id };
  if (type && type !== "ALL") where.type = type;
  if (status && status !== "ALL") where.status = status;
  if (search) {
    where.OR = [
      { description: { contains: search } },
      { referenceId: { contains: search } },
    ];
  }
  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo);
    where.createdAt = createdAt;
  }

  const [transactions, total] = await Promise.all([
    db.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.transaction.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      balanceBefore: t.balanceBefore,
      balanceAfter: t.balanceAfter,
      description: t.description,
      referenceId: t.referenceId,
      status: t.status,
      createdAt: t.createdAt,
    })),
    pagination: { page, pageSize, total, hasMore: page * pageSize < total },
  });
}
