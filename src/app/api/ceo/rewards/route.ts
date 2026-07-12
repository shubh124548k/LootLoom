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

const ALLOWED_REWARD_FIELDS = ["name", "description", "coinCost", "category", "stock", "image", "status"] as const;

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

  if (!name || coinCost === undefined || !category) {
    return NextResponse.json({ success: false, message: "name, coinCost, category required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const cost = parseInt(coinCost);
  if (isNaN(cost) || cost <= 0) {
    return NextResponse.json({ success: false, message: "coinCost must be a positive number", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const reward = await db.reward.create({
    data: {
      name,
      description: description || null,
      coinCost: cost,
      category,
      stock: stock !== undefined ? parseInt(stock) : -1,
      image: image || null,
      status: "ACTIVE",
    },
  });

  await db.auditLog.create({
    data: { actorId: ceoId, action: "REWARD_CREATED", targetId: reward.id, metadata: JSON.stringify({ name, coinCost }) },
  });

  return NextResponse.json({ success: true, data: reward, message: "Reward created" });
}

export async function PATCH(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const { rewardId, ...updates } = body;

  if (!rewardId) {
    return NextResponse.json({ success: false, message: "rewardId required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const existing = await db.reward.findUnique({ where: { id: rewardId } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "Reward not found", code: "NOT_FOUND" }, { status: 404 });
  }

  // Whitelist allowed fields only — prevent mass assignment
  const sanitized: Record<string, unknown> = {};
  for (const field of ALLOWED_REWARD_FIELDS) {
    if (updates[field] !== undefined) {
      if (field === "coinCost" || field === "stock") {
        const val = parseInt(updates[field]);
        if (!isNaN(val)) sanitized[field] = val;
      } else {
        sanitized[field] = updates[field];
      }
    }
  }

  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json({ success: false, message: "No valid fields to update", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const reward = await db.reward.update({ where: { id: rewardId }, data: sanitized });

  await db.auditLog.create({
    data: { actorId: ceoId, action: "REWARD_UPDATED", targetId: rewardId, metadata: JSON.stringify(sanitized) },
  });

  return NextResponse.json({ success: true, data: reward, message: "Reward updated" });
}
