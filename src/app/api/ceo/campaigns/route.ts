import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_CAMPAIGN_STATUSES = ["ACTIVE", "INACTIVE", "PAUSED", "COMPLETED", "DRAFT"] as const;

async function requireCEO() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") return null;
  return session.user.id;
}

/**
 * GET /api/ceo/campaigns — list all campaigns (CEO).
 * POST /api/ceo/campaigns — create a new campaign (CEO).
 */
export async function GET() {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const campaigns = await db.campaign.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: campaigns });
}

export async function POST(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const { name, description, type, multiplier, startDate, endDate, targetUsers } = body;

  if (!name || !startDate || !endDate) {
    return NextResponse.json({ success: false, message: "name, startDate, endDate required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const campaign = await db.campaign.create({
    data: {
      name,
      description: description || null,
      type: type || "EARNING_MULTIPLIER",
      multiplier: multiplier || 1.0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      targetUsers: targetUsers || "ALL",
      status: "SCHEDULED",
    },
  });

  await db.auditLog.create({
    data: { actorId: ceoId, action: "CAMPAIGN_CREATED", targetId: campaign.id, metadata: JSON.stringify({ name, multiplier }) },
  });

  return NextResponse.json({ success: true, data: campaign, message: "Campaign created" });
}

/**
 * PATCH /api/ceo/campaigns — update campaign status (CEO).
 */
export async function PATCH(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const { campaignId, status } = body;

  if (status && !ALLOWED_CAMPAIGN_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: "Invalid campaign status", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const campaign = await db.campaign.update({ where: { id: campaignId }, data: { status } });
  await db.auditLog.create({ data: { actorId: ceoId, action: "CAMPAIGN_UPDATED", targetId: campaignId, metadata: JSON.stringify({ status }) } });

  return NextResponse.json({ success: true, data: campaign, message: `Campaign ${status.toLowerCase()}` });
}
