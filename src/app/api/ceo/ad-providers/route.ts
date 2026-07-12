import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { invalidateAdProviderCache } from "@/lib/ads/config";

async function requireCEO() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") return null;
  return session.user.id;
}

export async function GET() {
  const ceoId = await requireCEO();
  if (!ceoId) {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const providers = await db.adProvider.findMany({ orderBy: { priority: "asc" } });

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayStats = await Promise.all(
    providers.map((p) =>
      db.adEvent.aggregate({
        where: { providerKey: p.key, createdAt: { gte: todayStart } },
        _count: true,
        _sum: { rewardAmount: true },
      })
    )
  );

  return NextResponse.json({
    success: true,
    data: providers.map((p, i) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      enabled: p.enabled,
      priority: p.priority,
      publisherId: p.publisherId ? p.publisherId.slice(0, 4) + "****" : "",
      zoneId: p.zoneId ? p.zoneId.slice(0, 4) + "****" : "",
      apiKey: p.apiKey ? "****" + p.apiKey.slice(-4) : "",
      hasCredentials: !!(p.publisherId || p.zoneId || p.apiKey),
      rewardAmount: p.rewardAmount,
      dailyLimit: p.dailyLimit,
      timeoutMs: p.timeoutMs,
      status: p.status,
      successRate: p.successRate,
      fillRate: p.fillRate,
      todayRevenue: todayStats[i]._sum.rewardAmount || 0,
      todayAds: todayStats[i]._count,
      totalRevenue: p.totalRevenue,
      completedAds: p.completedAds,
      failedAds: p.failedAds,
      lastErrorAt: p.lastErrorAt,
      lastSuccessAt: p.lastSuccessAt,
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json();
  const { id, key, enabled, priority, publisherId, zoneId, apiKey, rewardAmount, dailyLimit, timeoutMs, status } = body;

  if (!id) {
    return NextResponse.json({ success: false, message: "Provider ID required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof enabled === "boolean") data.enabled = enabled;
  if (typeof priority === "number") data.priority = priority;
  if (publisherId !== undefined) data.publisherId = publisherId;
  if (zoneId !== undefined) data.zoneId = zoneId;
  if (apiKey !== undefined) data.apiKey = apiKey;
  if (typeof rewardAmount === "number") data.rewardAmount = rewardAmount;
  if (typeof dailyLimit === "number") data.dailyLimit = dailyLimit;
  if (typeof timeoutMs === "number") data.timeoutMs = timeoutMs;
  if (status !== undefined) data.status = status;

  await db.adProvider.update({ where: { id }, data });
  invalidateAdProviderCache();

  const { refreshAdProviders } = await import("@/lib/ads/manager");
  await refreshAdProviders();

  return NextResponse.json({ success: true, message: "Provider updated" });
}

export async function POST(req: NextRequest) {
  const ceoId = await requireCEO();
  if (!ceoId) {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json();
  const { action, providerId } = body;

  if (action === "reset" && providerId) {
    const { invalidateAdProviderCache } = await import("@/lib/ads/config");
    await db.adProvider.update({
      where: { id: providerId },
      data: { successRate: 0, fillRate: 0, todayRevenue: 0, totalRevenue: 0, completedAds: 0, failedAds: 0, lastErrorAt: null, lastSuccessAt: null },
    });
    invalidateAdProviderCache();
    return NextResponse.json({ success: true, message: "Provider stats reset" });
  }

  if (action === "test" && providerId) {
    const provider = await db.adProvider.findUnique({ where: { id: providerId } });
    if (!provider) {
      return NextResponse.json({ success: false, message: "Provider not found", code: "NOT_FOUND" }, { status: 404 });
    }
    if (!provider.publisherId && !provider.apiKey && !provider.zoneId) {
      return NextResponse.json({ success: false, message: "Provider not configured.", code: "NOT_CONFIGURED" }, { status: 400 });
    }
    try {
      const { initAdManager } = await import("@/lib/ads/manager");
      const { getProvider } = await import("@/lib/ads/provider");
      await initAdManager();
      const instance = getProvider(provider.key);
      if (instance) {
        const health = instance.getHealth ? instance.getHealth() : { status: instance.getStatus(), lastError: null, lastTestAt: null, lastTestSuccess: null };
        if (health.status === "error") {
          return NextResponse.json({ success: false, message: `Provider error: ${health.lastError || "Unknown"}`, code: "PROVIDER_ERROR" }, { status: 500 });
        }
        return NextResponse.json({ success: true, message: "Provider initialized.", data: { status: health.status, lastTestAt: Date.now() } });
      }
      return NextResponse.json({ success: true, message: "Provider registered." });
    } catch (err) {
      return NextResponse.json({ success: false, message: `Test failed: ${err instanceof Error ? err.message : "Unknown error"}`, code: "TEST_FAILED" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, message: "Invalid action", code: "VALIDATION_ERROR" }, { status: 400 });
}
