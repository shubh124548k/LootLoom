/**
 * LootLoom — Seed real rewards into the database.
 * Run: bun run src/scripts/seed-rewards.ts
 */
import { db } from "@/lib/db";

async function main() {
  console.log("Seeding real rewards...");

  const rewards = [
    { name: "₹100 UPI Cash", description: "Get ₹100 directly to your UPI account", coinCost: 10000, category: "UPI", stock: -1, status: "ACTIVE" },
    { name: "₹250 UPI Cash", description: "Get ₹250 directly to your UPI account", coinCost: 25000, category: "UPI", stock: -1, status: "ACTIVE" },
    { name: "₹500 UPI Cash", description: "Get ₹500 directly to your UPI account", coinCost: 50000, category: "UPI", stock: -1, status: "ACTIVE" },
    { name: "₹100 Mobile Recharge", description: "Mobile recharge for any Indian number", coinCost: 10000, category: "RECHARGE", stock: -1, status: "ACTIVE" },
    { name: "₹200 Mobile Recharge", description: "Mobile recharge for any Indian number", coinCost: 20000, category: "RECHARGE", stock: -1, status: "ACTIVE" },
    { name: "Amazon Gift Card ₹100", description: "Amazon India gift card worth ₹100", coinCost: 12000, category: "GIFT_CARD", stock: 50, status: "ACTIVE" },
    { name: "Amazon Gift Card ₹500", description: "Amazon India gift card worth ₹500", coinCost: 55000, category: "GIFT_CARD", stock: 30, status: "ACTIVE" },
    { name: "Flipkart Gift Card ₹250", description: "Flipkart gift card worth ₹250", coinCost: 28000, category: "GIFT_CARD", stock: 25, status: "ACTIVE" },
    { name: "Google Play Code ₹100", description: "Google Play recharge code worth ₹100", coinCost: 11000, category: "VOUCHER", stock: -1, status: "ACTIVE" },
    { name: "Netflix Premium 1 Month", description: "Netflix Premium subscription for 1 month", coinCost: 80000, category: "VOUCHER", stock: 10, status: "ACTIVE" },
    { name: "Premium Membership 30 Days", description: "LootLoom Premium membership with 2x earning multiplier", coinCost: 15000, category: "MEMBERSHIP", stock: -1, status: "ACTIVE" },
    { name: "Free Fire Diamonds 100", description: "100 Diamonds for Free Fire", coinCost: 8000, category: "GAMING", stock: -1, status: "ACTIVE" },
  ];

  for (const reward of rewards) {
    const existing = await db.reward.findFirst({ where: { name: reward.name } });
    if (!existing) {
      await db.reward.create({ data: reward });
      console.log(`  + Created: ${reward.name}`);
    } else {
      console.log(`  - Exists: ${reward.name}`);
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
