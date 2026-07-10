import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/feature-flags — public feature flags for frontend.
 * Returns enabled flags with rollout percentage.
 */
export async function GET() {
  const flags = await db.featureFlag.findMany({ where: { enabled: true } });
  return NextResponse.json({
    success: true,
    data: flags.map((f) => ({ key: f.key, name: f.name, enabled: f.enabled, rollout: f.rollout })),
  });
}
