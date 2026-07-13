/**
 * LootLoom — Seed Ad Providers for the waterfall ad system.
 * Run: npx tsx src/scripts/seed-ad-providers.ts
 */
import { db } from "@/lib/db";

const PROVIDERS = [
  { key: "monetag", name: "Monetag", priority: 1, rewardAmount: 1, dailyLimit: 150, timeoutMs: 8000, zoneId: "11277987", publisherId: "3nbf4.com" },
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
];

async function main() {
  console.log("Seeding ad providers...");
  
  for (const provider of PROVIDERS) {
    const existing = await db.adProvider.findUnique({ where: { key: provider.key } });
    if (!existing) {
      await db.adProvider.create({
        data: {
          ...provider,
          status: "ACTIVE",
          publisherId: "",
          zoneId: "",
          apiKey: "",
        },
      });
      console.log(`  + Created: ${provider.name} (priority ${provider.priority})`);
    } else {
      await db.adProvider.update({
        where: { key: provider.key },
        data: { priority: provider.priority, rewardAmount: provider.rewardAmount, dailyLimit: provider.dailyLimit, timeoutMs: provider.timeoutMs },
      });
      console.log(`  ~ Updated: ${provider.name}`);
    }
  }
  
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
