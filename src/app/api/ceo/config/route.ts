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

/**
 * GET /api/ceo/config — all platform config (CEO).
 * POST /api/ceo/config — set a config value (CEO).
 */
export async function GET() {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const configs = await db.platformConfig.findMany();
  return NextResponse.json({ success: true, data: configs });
}

export async function POST(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const { key, value, label, type } = body;

  if (!key || value === undefined) {
    return NextResponse.json({ success: false, message: "key and value required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const config = await db.platformConfig.upsert({
    where: { key },
    update: { value: String(value), label: label || undefined, type: type || "STRING" },
    create: { key, value: String(value), label: label || null, type: type || "STRING" },
  });

  await db.auditLog.create({ data: { actorId: ceoId, action: "CONFIG_UPDATED", metadata: JSON.stringify({ key, value }) } });

  return NextResponse.json({ success: true, data: config, message: "Config updated" });
}
