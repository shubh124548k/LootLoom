import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireCEO() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") return null;
  return session.user.id;
}

export async function GET(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 100);
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { username: { contains: search } },
    ];
  }
  if (status) where.status = status;

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { wallet: true, profile: true, _count: { select: { transactions: true, redeemRequests: true, adEvents: true } } },
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      avatar: u.avatar,
      role: u.role,
      status: u.status,
      emailVerified: u.emailVerified,
      memberSince: u.createdAt,
      lastLogin: u.lastLoginAt,
      profile: u.profile,
      wallet: u.wallet ? { coinBalance: u.wallet.coinBalance, totalEarned: u.wallet.totalEarned, totalSpent: u.wallet.totalSpent } : null,
      stats: { transactions: u._count.transactions, redeems: u._count.redeemRequests, ads: u._count.adEvents },
    })),
    pagination: { page, pageSize, total },
  });
}
