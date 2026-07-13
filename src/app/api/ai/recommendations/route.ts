import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEarnConfigValue } from "@/lib/earn/config";

/**
 * GET /api/ai/recommendations — personalized earning + reward recommendations.
 *
 * Analyzes real user data (balance, ad history, reward history, activity patterns)
 * and returns smart recommendations.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id;
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const [dailyLimit, rewardPerAd, wallet, todayAds, totalAds, pendingRedeems, recentRedeems, activeCampaigns, allRewards] = await Promise.all([
    getEarnConfigValue("DAILY_AD_LIMIT"),
    getEarnConfigValue("AD_REWARD_AMOUNT"),
    db.wallet.findUnique({ where: { userId } }),
    db.adEvent.count({ where: { userId, status: "VERIFIED", createdAt: { gte: todayStart } } }),
    db.adEvent.count({ where: { userId, status: "VERIFIED" } }),
    db.redeemRequest.count({ where: { userId, status: "PENDING" } }),
    db.redeemRequest.findMany({ where: { userId }, include: { reward: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.campaign.findMany({ where: { status: "ACTIVE", endDate: { gte: new Date() } } }),
    db.reward.findMany({ where: { status: "ACTIVE" }, orderBy: { coinCost: "asc" } }),
  ]);

  const balance = wallet?.coinBalance || 0;
  const remainingAds = Math.max(0, dailyLimit - todayAds);
  const recommendations: Array<{ type: string; title: string; description: string; action?: string; priority: number }> = [];

  // Earning recommendations
  if (remainingAds > 0) {
    recommendations.push({
      type: "EARN_AD",
      title: `${remainingAds} rewarded ads available`,
      description: `Watch ${remainingAds} more ad${remainingAds > 1 ? "s" : ""} to earn ${remainingAds * rewardPerAd} coins today.`,
      action: "earn",
      priority: 100,
    });
  }

  // Daily bonus recommendation
  const lastAdTime = await db.adEvent.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
  if (!lastAdTime || lastAdTime.createdAt < todayStart) {
    recommendations.push({
      type: "DAILY_BONUS",
      title: "Daily bonus available",
      description: "Claim your daily login bonus for extra coins.",
      action: "daily-bonus",
      priority: 90,
    });
  }

  // Active campaigns
  for (const c of activeCampaigns) {
    recommendations.push({
      type: "CAMPAIGN",
      title: `Campaign active: ${c.name}`,
      description: `${c.multiplier}x coin multiplier. Ends ${new Date(c.endDate).toLocaleDateString()}.`,
      action: "earn",
      priority: 85,
    });
  }

  // Reward recommendations — near user's balance
  const affordableRewards = allRewards.filter((r) => r.coinCost <= balance);
  const nearBalanceRewards = allRewards
    .filter((r) => r.coinCost > balance && r.coinCost <= balance * 2)
    .slice(0, 3);

  if (affordableRewards.length > 0) {
    const best = affordableRewards[affordableRewards.length - 1];
    recommendations.push({
      type: "REWARD_AFFORDABLE",
      title: `You can redeem: ${best.name}`,
      description: `You have ${balance.toLocaleString()} coins — enough for ${best.name} (${best.coinCost.toLocaleString()} coins).`,
      action: "rewards",
      priority: 80,
    });
  }

  for (const r of nearBalanceRewards) {
    const coinsNeeded = r.coinCost - balance;
    recommendations.push({
      type: "REWARD_NEAR",
      title: `${coinsNeeded.toLocaleString()} coins away from ${r.name}`,
      description: `Earn ${coinsNeeded.toLocaleString()} more coins to unlock ${r.name}.`,
      action: "earn",
      priority: 70,
    });
  }

  // Pending redeem status
  if (pendingRedeems > 0) {
    recommendations.push({
      type: "REDEEM_STATUS",
      title: `${pendingRedeems} redeem request${pendingRedeems > 1 ? "s" : ""} pending`,
      description: "Your redeem request(s) are under review. We'll notify you when approved.",
      action: "history",
      priority: 75,
    });
  }

  // New user recommendation
  if (totalAds === 0) {
    recommendations.push({
      type: "WELCOME",
      title: "Welcome to LootLoom!",
      description: "Watch your first ad to start earning coins. It's quick and easy!",
      action: "earn",
      priority: 100,
    });
  }

  // Sort by priority
  recommendations.sort((a, b) => b.priority - a.priority);

  return NextResponse.json({
    success: true,
    data: {
      recommendations: recommendations.slice(0, 6),
      stats: {
        balance,
        todayAds,
        remainingAds,
        pendingRedeems,
        totalAds,
        activeCampaigns: activeCampaigns.length,
      },
    },
  });
}
