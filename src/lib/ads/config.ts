import { db } from "@/lib/db";
import type { AdProviderConfig, AdProviderKey } from "./types";

let cachedProviders: AdProviderConfig[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 30_000;

export async function loadProviderConfigs(): Promise<AdProviderConfig[]> {
  if (cachedProviders && Date.now() - cacheTime < CACHE_TTL) {
    return cachedProviders;
  }
  const rows = await db.adProvider.findMany({
    orderBy: { priority: "asc" },
  });
  cachedProviders = rows.map((r) => ({
    key: r.key as AdProviderKey,
    name: r.name,
    enabled: r.enabled,
    priority: r.priority,
    publisherId: r.publisherId ?? undefined,
    zoneId: r.zoneId ?? undefined,
    apiKey: r.apiKey ?? undefined,
    rewardAmount: r.rewardAmount,
    dailyLimit: r.dailyLimit,
    timeoutMs: r.timeoutMs,
    status: r.status as AdProviderConfig["status"],
  }));
  cacheTime = Date.now();
  return cachedProviders;
}

export async function getEnabledProviders(): Promise<AdProviderConfig[]> {
  const all = await loadProviderConfigs();
  return all.filter((p) => p.enabled && p.status === "ACTIVE");
}

export function invalidateAdProviderCache(): void {
  cachedProviders = null;
  cacheTime = 0;
}

export async function updateProviderStats(
  key: string,
  delta: { success?: boolean; revenue?: number; error?: boolean }
): Promise<void> {
  const data: Record<string, unknown> = {};
  if (delta.success) {
    data.completedAds = { increment: 1 };
    data.todayRevenue = { increment: delta.revenue ?? 0 };
    data.totalRevenue = { increment: delta.revenue ?? 0 };
    data.lastSuccessAt = new Date();
  }
  if (delta.error) {
    data.failedAds = { increment: 1 };
    data.lastErrorAt = new Date();
  }
  if (Object.keys(data).length > 0) {
    await db.adProvider.update({ where: { key }, data });
    invalidateAdProviderCache();
  }
}
