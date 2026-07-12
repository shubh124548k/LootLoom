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
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 50);

  const [broadcasts, total] = await Promise.all([
    db.auditLog.findMany({
      where: { action: "BROADCAST_SENT" },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count({ where: { action: "BROADCAST_SENT" } }),
  ]);

  return NextResponse.json({
    success: true,
    data: broadcasts.map((b) => ({
      id: b.id,
      metadata: JSON.parse(b.metadata || "{}"),
      createdAt: b.createdAt,
    })),
    pagination: { page, pageSize, total },
  });
}
