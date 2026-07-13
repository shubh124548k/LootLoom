import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEarnConfigValue } from "@/lib/earn/config";

/**
 * POST /api/ai/assistant — LootLoom AI Assistant (rule-based, no fake AI).
 * Body: { message }
 *
 * Analyzes the user's message and provides helpful responses based on real data.
 * The assistant can help with: earning methods, rewards, wallet, redeem status, common issues.
 *
 * Security: AI is assistant only — cannot modify wallet, approve redeems, or change user data.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ success: false, message: "Message required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const userId = session.user.id;
  const lowerMsg = message.toLowerCase();

  // Fetch real user context
  const [dailyLimit, user, wallet, pendingRedeems, todayAds, activeCampaigns] = await Promise.all([
    getEarnConfigValue("DAILY_AD_LIMIT"),
    db.user.findUnique({ where: { id: userId }, select: { name: true, createdAt: true } }),
    db.wallet.findUnique({ where: { userId }, select: { coinBalance: true, totalEarned: true, totalSpent: true } }),
    db.redeemRequest.count({ where: { userId, status: "PENDING" } }),
    db.adEvent.count({ where: { userId, status: "VERIFIED", createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    db.campaign.findMany({ where: { status: "ACTIVE", endDate: { gte: new Date() } }, take: 3 }),
  ]);

  const balance = wallet?.coinBalance || 0;
  const totalEarned = wallet?.totalEarned || 0;
  const totalSpent = wallet?.totalSpent || 0;

  // Rule-based response engine
  let response = "";
  let suggestions: string[] = [];

  if (lowerMsg.includes("earn") || lowerMsg.includes("coin") || lowerMsg.includes("make")) {
    const remaining = Math.max(0, dailyLimit - todayAds);
    response = `You can earn coins by:\n\n1. **Watch Rewarded Ads** — ${remaining} ads available today (25 coins each)\n2. **Daily Bonus** — claim your daily login bonus\n3. **Missions** — complete daily missions for bonus coins\n4. **Active Campaigns** — ${activeCampaigns.length} special campaign(s) running now${activeCampaigns.length > 0 ? ` (${activeCampaigns.map(c => c.name).join(", ")})` : ""}\n\nYour earnings so far: ${totalEarned.toLocaleString()} coins.`;
    suggestions = ["Watch an ad now", "Check daily bonus", "View active campaigns"];
  } else if (lowerMsg.includes("wallet") || lowerMsg.includes("balance")) {
    response = `Your wallet status:\n\n• **Current Balance**: ${balance.toLocaleString()} coins\n• **Total Earned**: ${totalEarned.toLocaleString()} coins\n• **Total Spent**: ${totalSpent.toLocaleString()} coins\n\nYou can use your coins to redeem rewards or save up for bigger ones.`;
    suggestions = ["View wallet", "Browse rewards", "Transaction history"];
  } else if (lowerMsg.includes("redeem") || lowerMsg.includes("reward")) {
    const rewards = await db.reward.findMany({ where: { status: "ACTIVE" }, orderBy: { coinCost: "asc" }, take: 3 });
    const affordable = rewards.filter(r => r.coinCost <= balance);
    response = `You have ${pendingRedeems} pending redeem request(s).\n\n${affordable.length > 0 ? `Rewards you can afford right now:\n${affordable.map(r => `• ${r.name} — ${r.coinCost.toLocaleString()} coins`).join("\n")}` : `You need ${rewards[0] ? (rewards[0].coinCost - balance).toLocaleString() : 0} more coins for the cheapest reward (${rewards[0]?.name || "N/A"}).`}`;
    suggestions = ["Browse all rewards", "Check redeem history", "Earn more coins"];
  } else if (lowerMsg.includes("support") || lowerMsg.includes("help") || lowerMsg.includes("issue") || lowerMsg.includes("problem")) {
    response = `I can help you with common issues:\n\n• **Earning coins** — watch ads, complete missions\n• **Wallet questions** — check your balance and history\n• **Redeem rewards** — browse and request redemptions\n• **Account issues** — contact support for account-specific problems\n\nFor complex issues, you can create a support ticket and our team will assist you.`;
    suggestions = ["Create support ticket", "View FAQ", "Contact support"];
  } else if (lowerMsg.includes("campaign") || lowerMsg.includes("event") || lowerMsg.includes("bonus")) {
    response = activeCampaigns.length > 0
      ? `Active campaigns right now:\n\n${activeCampaigns.map(c => `• **${c.name}** — ${c.multiplier}x multiplier${c.description ? `\n  ${c.description}` : ""}\n  Ends: ${new Date(c.endDate).toLocaleDateString()}`).join("\n\n")}`
      : "No active campaigns right now. Check back later for special earning events and bonus weekends!";
    suggestions = ["Watch ads to earn", "Check daily bonus"];
  } else if (lowerMsg.includes("how") && (lowerMsg.includes("work") || lowerMsg.includes("use"))) {
    response = `LootLoom is simple:\n\n1. **Sign in** with Google\n2. **Earn coins** by watching ads, completing missions, and claiming daily bonuses\n3. **Redeem rewards** — browse the rewards catalog and request redemptions\n4. **Get rewarded** — CEO approves your request and you receive your reward\n\nYour coins are stored in your wallet and every transaction is recorded.`;
    suggestions = ["Start earning", "Browse rewards", "View my wallet"];
  } else {
    response = `Hi ${user?.name || "there"}! I'm your LootLoom assistant. I can help you with:\n\n• Earning more coins\n• Finding the right rewards\n• Understanding your wallet\n• Tracking redeem status\n• Active campaigns and bonuses\n\nWhat would you like to know?`;
    suggestions = ["How do I earn coins?", "What rewards can I get?", "Check my wallet"];
  }

  return NextResponse.json({
    success: true,
    data: { response, suggestions, context: { balance, todayAds, pendingRedeems } },
  });
}
