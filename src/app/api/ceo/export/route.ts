import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/ceo/export — export data as CSV (CEO).
 * Query: ?type=users|transactions|redeems|rewards
 *
 * Returns CSV-formatted data for CEO export.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "users";

  let csv = "";
  let filename = `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;

  if (type === "users") {
    const users = await db.user.findMany({ include: { wallet: true }, take: 1000 });
    csv = "ID,Name,Email,Role,Status,Created At,Last Login,Wallet Balance\n";
    for (const u of users) {
      csv += `${u.id},"${u.name}","${u.email}",${u.role},${u.status},${u.createdAt.toISOString()},${u.lastLoginAt?.toISOString() || "N/A"},${u.wallet?.coinBalance || 0}\n`;
    }
  } else if (type === "transactions") {
    const txns = await db.transaction.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 1000 });
    csv = "ID,User,Type,Amount,Balance Before,Balance After,Status,Description,Created At\n";
    for (const t of txns) {
      csv += `${t.id},"${t.user.name}",${t.type},${t.amount},${t.balanceBefore},${t.balanceAfter},${t.status},"${t.description || ""}",${t.createdAt.toISOString()}\n`;
    }
  } else if (type === "redeems") {
    const redeems = await db.redeemRequest.findMany({ include: { user: true, reward: true }, orderBy: { createdAt: "desc" }, take: 1000 });
    csv = "ID,User,Reward,Coins Used,Status,Payment Method,Created At\n";
    for (const r of redeems) {
      csv += `${r.id},"${r.user.name}","${r.reward.name}",${r.coinsUsed},${r.status},${r.paymentMethod || "N/A"},${r.createdAt.toISOString()}\n`;
    }
  } else if (type === "rewards") {
    const rewards = await db.reward.findMany();
    csv = "ID,Name,Category,Coin Cost,Stock,Status,Created At\n";
    for (const r of rewards) {
      csv += `${r.id},"${r.name}",${r.category},${r.coinCost},${r.stock},${r.status},${r.createdAt.toISOString()}\n`;
    }
  } else {
    return NextResponse.json({ success: false, message: "Invalid export type", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
