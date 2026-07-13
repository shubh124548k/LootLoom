import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("=== Seeding all earning data ===");

  // 1. Missions
  console.log("\n--- Missions ---");
  const missions = [
    { key: "DAILY_LOGIN", name: "Daily Login", description: "Log in daily to earn rewards", rewardCoins: 10, requirement: 1, cooldownHours: 24 },
    { key: "WATCH_ADS", name: "Ad Watcher", description: "Watch rewarded ads to earn coins", rewardCoins: 50, requirement: 5, cooldownHours: null },

    { key: "MILESTONE_100", name: "Earn 100 Coins", description: "Reach 100 total coins earned", rewardCoins: 100, requirement: 1, cooldownHours: null },
    { key: "MILESTONE_500", name: "Earn 500 Coins", description: "Reach 500 total coins earned", rewardCoins: 250, requirement: 1, cooldownHours: null },
    { key: "MILESTONE_1000", name: "Earn 1,000 Coins", description: "Reach 1,000 total coins earned", rewardCoins: 500, requirement: 1, cooldownHours: null },
    { key: "REFERRAL", name: "Referral Bonus", description: "Refer friends to earn bonus coins", rewardCoins: 100, requirement: 1, cooldownHours: null },
  ];
  for (const m of missions) {
    const existing = await db.mission.findUnique({ where: { key: m.key } });
    if (!existing) {
      await db.mission.create({ data: m });
      console.log(`  + Created: ${m.name}`);
    } else {
      console.log(`  = Already exists: ${m.name}`);
    }
  }

  // 2. Earning config
  console.log("\n--- Earning Config ---");
  const configs = [
    { key: "AD_REWARD_AMOUNT", value: "25", label: "Coins per rewarded ad", type: "NUMBER" },
    { key: "DAILY_AD_LIMIT", value: "150", label: "Max ads per day", type: "NUMBER" },
    { key: "DAILY_COIN_LIMIT", value: "500", label: "Max coins earnable per day", type: "NUMBER" },
    { key: "DAILY_MISSION_LIMIT", value: "10", label: "Max missions completable per day", type: "NUMBER" },
    { key: "DAILY_LOGIN_REWARD", value: "10", label: "Coins for daily login", type: "NUMBER" },
    { key: "MISSION_AD_WATCH_REWARD", value: "50", label: "Coins for completing ad watch mission", type: "NUMBER" },
    { key: "REFERRAL_REWARD", value: "100", label: "Coins for successful referral", type: "NUMBER" },
    { key: "MIN_AD_DURATION_MS", value: "5000", label: "Minimum ad watch duration (ms)", type: "NUMBER" },
    { key: "AD_VELOCITY_LIMIT", value: "10", label: "Max verified ads per minute", type: "NUMBER" },
  ];
  for (const cfg of configs) {
    const existing = await db.platformConfig.findUnique({ where: { key: cfg.key } });
    if (!existing) {
      await db.platformConfig.create({ data: cfg });
      console.log(`  + Created: ${cfg.key} = ${cfg.value}`);
    } else {
      console.log(`  = Already exists: ${cfg.key} = ${existing.value}`);
    }
  }

  console.log("\n=== Seed complete! ===");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
