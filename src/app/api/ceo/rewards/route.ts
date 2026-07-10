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
 * GET /api/ceo/rewards — all rewards including disabled (CEO).
 * POST /api/ceo/rewards — create a new reward (CEO).
 * PATCH /api/ceo/rewards — update reward (CEO).
 */
export async function GET() {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const rewards = await db.reward.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: rewards });
}

export async function POST(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const { name, description, coinCost, category, stock, image } = body;

  if (!name || !coinCost || !category) {
    return NextResponse.json({ success: false, message: "name, coinCost, category required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const reward = await db.reward.create({
    data: { name, description, coinCost: parseInt(coinCost), category, stock: stock ?? -1, image: image || null, status: "ACTIVE" },
  });

  await db.auditLog.create({ data: { actorId: ceoId, action: "REWARD_CREATED", targetId: reward.id, metadata: JSON.stringify({ name, coinCost }) } });

  return NextResponse.json({ success: true, data: reward, message: "Reward created" });
}

export async function PATCH(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const { rewardId, ...updates } = body;

  if (!rewardId) return NextResponse.json({ success: false, message: "rewardId required", code: "VALIDATION_ERROR" }, { status: 400 });

  if (updates.coinCost) updates.coinCost = parseInt(updates.coinCost);
  if (updates.stock !== undefined) updates.stock = parseInt(updates.stock);

  const reward = await db.reward.update({ where: { id: rewardId }, data: updates });
  await db.auditLog.create({ data: { actorId: ceoId, action: "REWARD_UPDATED", targetId: rewardId, metadata: JSON.stringify(updates) } });

  return NextResponse.json({ success: true, data: reward, message: "Reward updated" });
}
