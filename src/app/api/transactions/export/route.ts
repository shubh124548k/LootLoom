import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (type) where.type = type;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const transactions = await db.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const header = "ID,Type,Amount,Balance Before,Balance After,Description,Status,Created At\n";
    const rows = transactions.map((t) =>
      `"${t.id}","${t.type}",${t.amount},${t.balanceBefore},${t.balanceAfter},"${t.description || ""}","${t.status}","${t.createdAt.toISOString()}"`
    ).join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=transactions.csv",
      },
    });
  }

  return NextResponse.json({ success: true, data: transactions });
}
