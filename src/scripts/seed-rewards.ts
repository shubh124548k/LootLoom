/**
 * LootLoom — Seed UPI-only rewards into the database.
 * Run: bun run src/scripts/seed-rewards.ts
 */
import { db } from "@/lib/db";

const UPI_REWARDS = [
  { name: "₹10 UPI", description: "Redeem ₹10 directly to your UPI account", coinCost: 300, category: "UPI", stock: -1, status: "ACTIVE" },
  { name: "₹20 UPI", description: "Redeem ₹20 directly to your UPI account", coinCost: 600, category: "UPI", stock: -1, status: "ACTIVE" },
  { name: "₹30 UPI", description: "Redeem ₹30 directly to your UPI account", coinCost: 900, category: "UPI", stock: -1, status: "ACTIVE" },
  { name: "₹40 UPI", description: "Redeem ₹40 directly to your UPI account", coinCost: 1200, category: "UPI", stock: -1, status: "ACTIVE" },
  { name: "₹50 UPI", description: "Redeem ₹50 directly to your UPI account", coinCost: 1500, category: "UPI", stock: -1, status: "ACTIVE" },
  { name: "₹60 UPI", description: "Redeem ₹60 directly to your UPI account", coinCost: 1800, category: "UPI", stock: -1, status: "ACTIVE" },
  { name: "₹70 UPI", description: "Redeem ₹70 directly to your UPI account", coinCost: 2100, category: "UPI", stock: -1, status: "ACTIVE" },
  { name: "₹80 UPI", description: "Redeem ₹80 directly to your UPI account", coinCost: 2400, category: "UPI", stock: -1, status: "ACTIVE" },
  { name: "₹90 UPI", description: "Redeem ₹90 directly to your UPI account", coinCost: 2700, category: "UPI", stock: -1, status: "ACTIVE" },
  { name: "₹100 UPI", description: "Redeem ₹100 directly to your UPI account", coinCost: 3000, category: "UPI", stock: -1, status: "ACTIVE" },
];

async function main() {
  console.log("Seeding UPI rewards...");

  for (const reward of UPI_REWARDS) {
    const existing = await db.reward.findFirst({ where: { name: reward.name } });
    if (!existing) {
      await db.reward.create({ data: reward });
      console.log(`  + Created: ${reward.name} (${reward.coinCost} coins)`);
    } else {
      // Update existing reward if coin cost changed
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

  // Disable all non-UPI rewards (remove game/gift card options)
  const nonUpi = await db.reward.findMany({ where: { category: { not: "UPI" } } });
  for (const r of nonUpi) {
    await db.reward.update({ where: { id: r.id }, data: { status: "DISABLED" } });
    console.log(`  x Disabled: ${r.name}`);
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
