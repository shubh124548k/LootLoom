/**
 * LootLoom — Production Database Migration
 *
 * One command to sync the production database with the current codebase.
 * Run AFTER every deployment.
 *
 *   npx tsx src/scripts/migrate-prod.ts
 *
 * What it does:
 *   1. Sets DAILY_AD_LIMIT to 150 in platformConfig
 *   2. Disables ALL old game rewards (non-UPI, non-REDEEM_CODE categories)
 *   3. Creates/updates UPI reward tiers (₹10 – ₹1000, 21 values)
 *   4. Creates/updates REDEEM_CODE reward tiers (₹10 – ₹1000, 21 values)
 *   5. Disables any stray rewards in UPI/REDEEM_CODE with unexpected names
 *   6. Reports every change
 */
import { db } from "@/lib/db";
import { inrToCoins } from "@/lib/coin-config";

const ALLOWED_CATEGORIES = ["UPI", "REDEEM_CODE"];
const TIERS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000];

const EXPECTED_NAMES = new Set<string>([
  ...TIERS.map((v) => `₹${v} UPI`),
  ...TIERS.map((v) => `₹${v} Redeem Code`),
]);

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  LootLoom — Production DB Migration");
  console.log("═══════════════════════════════════════════");

  // ── Step 1: Fix platform config ──
  console.log("\n◆ Platform Config");
  const configKey = "DAILY_AD_LIMIT";
  const existingConfig = await db.platformConfig.findUnique({ where: { key: configKey } });
  if (existingConfig) {
    if (existingConfig.value !== "150") {
      await db.platformConfig.update({ where: { key: configKey }, data: { value: "150" } });
      console.log(`  ✓ Updated ${configKey}: ${existingConfig.value} → 150`);
    } else {
      console.log(`  ✓ ${configKey} already = 150 (correct)`);
    }
  } else {
    await db.platformConfig.create({ data: { key: configKey, value: "150", label: "Max ads per day", type: "NUMBER" } });
    console.log(`  ✓ Created ${configKey} = 150`);
  }

  const loginKey = "DAILY_LOGIN_REWARD";
  const existingLogin = await db.platformConfig.findUnique({ where: { key: loginKey } });
  if (existingLogin && existingLogin.value !== "3") {
    await db.platformConfig.update({ where: { key: loginKey }, data: { value: "3" } });
    console.log(`  ✓ Updated ${loginKey}: ${existingLogin.value} → 3 (matches code default)`);
  }

  // ── Step 2: Disable old game rewards (non-allowed categories) ──
  console.log("\n◆ Old Game Rewards Cleanup");
  const oldRewards = await db.reward.findMany({
    where: { category: { notIn: ALLOWED_CATEGORIES }, status: "ACTIVE" },
  });
  for (const r of oldRewards) {
    await db.reward.update({ where: { id: r.id }, data: { status: "DISABLED" } });
    console.log(`  ✗ Disabled: "${r.name}" (category: ${r.category})`);
  }
  if (oldRewards.length === 0) console.log("  ✓ No old game rewards found");

  // ── Step 3: Create/update UPI tiers ──
  console.log("\n◆ UPI Rewards (₹10–₹1000)");
  for (const value of TIERS) {
    const name = `₹${value} UPI`;
    const coinCost = inrToCoins(value);
    const existing = await db.reward.findFirst({ where: { name } });
    if (!existing) {
      await db.reward.create({
        data: { name, description: `Redeem ₹${value} directly to your UPI account`, coinCost, category: "UPI", stock: -1, status: "ACTIVE" },
      });
    } else {
      const updates: Record<string, unknown> = {};
      if (existing.coinCost !== coinCost) updates.coinCost = coinCost;
      if (existing.category !== "UPI") updates.category = "UPI";
      if (existing.status !== "ACTIVE") updates.status = "ACTIVE";
      if (Object.keys(updates).length > 0) {
        await db.reward.update({ where: { id: existing.id }, data: updates });
      }
    }
  }
  console.log(`  ✓ ${TIERS.length} UPI tiers synced`);

  // ── Step 4: Create/update REDEEM_CODE tiers ──
  console.log("\n◆ Redeem Code Rewards (₹10–₹1000)");
  for (const value of TIERS) {
    const name = `₹${value} Redeem Code`;
    const coinCost = inrToCoins(value);
    const existing = await db.reward.findFirst({ where: { name } });
    if (!existing) {
      await db.reward.create({
        data: { name, description: `Get a ₹${value} redeem code for your game`, coinCost, category: "REDEEM_CODE", stock: -1, status: "ACTIVE" },
      });
    } else {
      const updates: Record<string, unknown> = {};
      if (existing.coinCost !== coinCost) updates.coinCost = coinCost;
      if (existing.category !== "REDEEM_CODE") updates.category = "REDEEM_CODE";
      if (existing.status !== "ACTIVE") updates.status = "ACTIVE";
      if (Object.keys(updates).length > 0) {
        await db.reward.update({ where: { id: existing.id }, data: updates });
      }
    }
  }
  console.log(`  ✓ ${TIERS.length} Redeem Code tiers synced`);

  // ── Step 5: Disable stray rewards in allowed categories with unexpected names ──
  // This catches edge cases like: name="BGMI" category="UPI" (old manually-added junk)
  console.log("\n◆ Stray Rewards Cleanup");
  const strayRewards = await db.reward.findMany({
    where: { category: { in: ALLOWED_CATEGORIES }, status: "ACTIVE" },
  });
  let strayCount = 0;
  for (const r of strayRewards) {
    if (!EXPECTED_NAMES.has(r.name)) {
      await db.reward.update({ where: { id: r.id }, data: { status: "DISABLED" } });
      console.log(`  ✗ Disabled stray: "${r.name}" (category: ${r.category})`);
      strayCount++;
    }
  }
  if (strayCount === 0) console.log("  ✓ No stray rewards in allowed categories");

  // ── Summary ──
  const activeAllowed = await db.reward.count({ where: { status: "ACTIVE", category: { in: ALLOWED_CATEGORIES } } });
  const totalActive = await db.reward.count({ where: { status: "ACTIVE" } });
  const finalConfig = await db.platformConfig.findUnique({ where: { key: configKey } });

  console.log("\n═══════════════════════════════════════════");
  console.log("  Migration Complete");
  console.log(`  Active rewards: ${activeAllowed} (UPI + Redeem Code) / ${totalActive} total`);
  console.log(`  DAILY_AD_LIMIT: ${finalConfig?.value || "150"}`);
  console.log("═══════════════════════════════════════════");
  console.log("\n  Next step: Restart your server so the config cache clears.");
  console.log("═══════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
