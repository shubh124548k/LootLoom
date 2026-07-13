/**
 * LootLoom — Seed rewards into the database.
 * Run: bun run src/scripts/seed-rewards.ts
 */
import { db } from "@/lib/db";
import { inrToCoins } from "@/lib/coin-config";

const ACTIVE_CATEGORIES = ["UPI", "REDEEM_CODE"];
const TIERS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000];

const UPI_REWARDS = TIERS.map((value) => ({
  name: `₹${value} UPI`,
  description: `Redeem ₹${value} directly to your UPI account`,
  coinCost: inrToCoins(value),
  category: "UPI" as const,
  stock: -1,
  status: "ACTIVE" as const,
}));

const REDEEM_CODE_REWARDS = TIERS.map((value) => ({
  name: `₹${value} Redeem Code`,
  description: `Get a ₹${value} redeem code for your game`,
  coinCost: inrToCoins(value),
  category: "REDEEM_CODE" as const,
  stock: -1,
  status: "ACTIVE" as const,
}));

async function seedRewards(rewards: Array<typeof UPI_REWARDS[number]>, label: string) {
  console.log(`Seeding ${label}...`);
  for (const reward of rewards) {
    const existing = await db.reward.findFirst({ where: { name: reward.name } });
    if (!existing) {
      await db.reward.create({ data: reward });
      console.log(`  + Created: ${reward.name} (${reward.coinCost} coins)`);
    } else {
      if (existing.coinCost !== reward.coinCost || existing.category !== reward.category) {
        await db.reward.update({
          where: { id: existing.id },
          data: { coinCost: reward.coinCost, category: reward.category },
        });
        console.log(`  ~ Updated: ${reward.name} (${reward.coinCost} coins)`);
      } else {
        console.log(`  - Exists: ${reward.name}`);
      }
    }
  }
}

async function main() {
  await seedRewards(UPI_REWARDS, "UPI rewards");
  await seedRewards(REDEEM_CODE_REWARDS, "Redeem Code rewards");

  // Disable rewards outside active categories (remove game/gift card options)
  const toDisable = await db.reward.findMany({ where: { category: { notIn: ACTIVE_CATEGORIES } } });
  for (const r of toDisable) {
    await db.reward.update({ where: { id: r.id }, data: { status: "DISABLED" } });
    console.log(`  x Disabled: ${r.name} (${r.category})`);
  }

  // Ensure all active-category rewards are enabled
  const toEnable = await db.reward.findMany({ where: { category: { in: ACTIVE_CATEGORIES }, status: "DISABLED" } });
  for (const r of toEnable) {
    await db.reward.update({ where: { id: r.id }, data: { status: "ACTIVE" } });
    console.log(`  ✓ Enabled: ${r.name}`);
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
