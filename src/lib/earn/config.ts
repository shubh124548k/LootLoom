import { db } from "@/lib/db";

const DEFAULTS = {
  AD_REWARD_AMOUNT: "1",
  DAILY_AD_LIMIT: "150",
  DAILY_COIN_LIMIT: "150",
  DAILY_MISSION_LIMIT: "10",
  DAILY_LOGIN_REWARD: "3",
  MISSION_AD_WATCH_REWARD: "50",
  REFERRAL_REWARD: "100",
  MIN_AD_DURATION_MS: "5000",
  AD_VELOCITY_LIMIT: "10",
};

export type EarnConfigKey = keyof typeof DEFAULTS;

let cachedConfig: Record<string, string> | null = null;
let configCacheTime = 0;
const CACHE_TTL = 60_000;

async function syncDbWithDefaults(): Promise<void> {
  const keys = Object.keys(DEFAULTS);
  const rows = await db.platformConfig.findMany({ where: { key: { in: keys } } });
  const dbMap = new Map(rows.map((r) => [r.key, r.value]));
  for (const key of keys) {
    const defaultValue = DEFAULTS[key as EarnConfigKey];
    const dbValue = dbMap.get(key);
    if (dbValue === undefined) {
      await db.platformConfig.create({ data: { key, value: defaultValue, label: key, type: "STRING" } }).catch(() => {});
    } else if (dbValue !== defaultValue) {
      await db.platformConfig.update({ where: { key }, data: { value: defaultValue } }).catch(() => {});
    }
  }
}

async function loadFromDb(): Promise<Record<string, string>> {
  const keys = Object.keys(DEFAULTS);
  const rows = await db.platformConfig.findMany({ where: { key: { in: keys } } });
  const config: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) {
    config[row.key] = row.value;
  }
  return config;
}

export async function getEarnConfig(): Promise<Record<string, string>> {
  if (cachedConfig && Date.now() - configCacheTime < CACHE_TTL) {
    return cachedConfig;
  }
  await syncDbWithDefaults();
  const config = await loadFromDb();
  cachedConfig = config;
  configCacheTime = Date.now();
  return config;
}

export async function getEarnConfigValue(key: EarnConfigKey): Promise<number> {
  const config = await getEarnConfig();
  return parseInt(config[key], 10);
}

export function invalidateEarnConfigCache(): void {
  cachedConfig = null;
  configCacheTime = 0;
}
