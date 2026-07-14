import { db } from "@/lib/db";
import type { AdProviderConfig, AdProviderKey } from "./types";

let cachedProviders: AdProviderConfig[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 30_000;

const DEFAULT_PROVIDERS: {
  key: string; name: string; priority: number; rewardAmount: number; dailyLimit: number; timeoutMs: number; publisherId?: string; zoneId?: string;
}[] = [
  { key: "a-ads", name: "A-Ads", priority: 2, rewardAmount: 1, dailyLimit: 150, timeoutMs: 8000 },
  { key: "yllix", name: "ylliX", priority: 3, rewardAmount: 1, dailyLimit: 150, timeoutMs: 8000 },
  { key: "popads", name: "PopAds", priority: 4, rewardAmount: 1, dailyLimit: 80, timeoutMs: 8000 },
  { key: "hilltopads", name: "HilltopAds", priority: 5, rewardAmount: 1, dailyLimit: 80, timeoutMs: 8000 },
  { key: "clickadu", name: "Clickadu", priority: 6, rewardAmount: 1, dailyLimit: 80, timeoutMs: 8000 },
  { key: "juicyads", name: "JuicyAds", priority: 7, rewardAmount: 1, dailyLimit: 60, timeoutMs: 8000 },
  { key: "richads", name: "RichAds", priority: 8, rewardAmount: 1, dailyLimit: 60, timeoutMs: 8000 },
  { key: "medianet", name: "Media.net", priority: 9, rewardAmount: 1, dailyLimit: 60, timeoutMs: 8000 },
  { key: "adrevenue", name: "AdRevenue", priority: 10, rewardAmount: 1, dailyLimit: 50, timeoutMs: 8000 },
  { key: "evadav", name: "Evadav", priority: 11, rewardAmount: 1, dailyLimit: 50, timeoutMs: 8000 },
  { key: "adsterra", name: "Adsterra", priority: 12, rewardAmount: 1, dailyLimit: 150, timeoutMs: 8000 },
];

export async function loadProviderConfigs(): Promise<AdProviderConfig[]> {
  if (cachedProviders && Date.now() - cacheTime < CACHE_TTL) {
    return cachedProviders;
  }
  let rows = await db.adProvider.findMany({
    orderBy: { priority: "asc" },
  });
  const existingKeys = new Set(rows.map((r) => r.key));
  for (const p of DEFAULT_PROVIDERS) {
    if (!existingKeys.has(p.key)) {
      await db.adProvider.create({ data: { ...p, status: "ACTIVE", enabled: true, publisherId: p.publisherId || "", zoneId: p.zoneId || "", apiKey: "" } }).catch(() => {});
    }
  }
  if (rows.length !== DEFAULT_PROVIDERS.length) {
    rows = await db.adProvider.findMany({ orderBy: { priority: "asc" } });
  }
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
