"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  LogIn,
  HelpCircle,
  ChevronDown,
  Shield,
  ShieldCheck,
  Coins,
  Check,
  Twitter,
  Github,
  Linkedin,
  Youtube,
  Send,
} from "lucide-react";
import {
  GlassCard,
  LootButton,
  Logo,
  IconBadge,
  AnimatedCounter,
  StatusBadge,
} from "@/components/lootloom";
import { Navbar } from "@/components/navbar";
import {
  pageTransition,
  slideUp,
  scaleIn,
  floating,
  floatingSmall,
  cardReveal,
  staggerContainer,
} from "@/lib/animations";
import { useNavigationStore, useAuthStore } from "@/stores";
import type { ViewId } from "@/types";

/* ============================================================
   Static content data — kept local to the home view
   All values below are marketing copy, NOT user data.
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

const WHAT_YOU_CAN_DO: {
  title: string;
  desc: string;
  icon: string;
  accent: Accent;
  view: ViewId;
}[] = [
  { title: "Earn Coins", desc: "Watch rewarded ads, complete offerwalls, finish missions.", icon: "Coins", accent: "electric", view: "earn" },
  { title: "Wallet", desc: "Track balances, transactions and lifetime earnings.", icon: "Wallet", accent: "cyan", view: "wallet" },
  { title: "Redeem Rewards", desc: "Convert coins into UPI, vouchers and gift cards.", icon: "Gift", accent: "purple", view: "redeem" },
  { title: "Daily Bonus", desc: "Claim a free reward every day and grow your streak.", icon: "CalendarCheck", accent: "gold", view: "daily-bonus" },
  { title: "Referral", desc: "Invite friends and earn bonus coins on their activity.", icon: "Users", accent: "emerald", view: "referral" },
  { title: "Leaderboard", desc: "Compete with members worldwide for top ranks.", icon: "Trophy", accent: "rose", view: "leaderboard" },
  { title: "Achievements", desc: "Unlock badges and milestones as you progress.", icon: "Award", accent: "navy", view: "achievements" },
  { title: "Support", desc: "Get help from our 24/7 support team anytime.", icon: "LifeBuoy", accent: "electric", view: "support" },
];

const TIMELINE_STEPS: {
  title: string;
  desc: string;
  icon: string;
  accent: Accent;
}[] = [
  { title: "Create Account", desc: "Sign up free in under 60 seconds.", icon: "UserPlus", accent: "electric" },
  { title: "Verify Account", desc: "Confirm your email to unlock earning.", icon: "BadgeCheck", accent: "cyan" },
  { title: "Start Earning", desc: "Watch ads, finish missions, invite friends.", icon: "Rocket", accent: "purple" },
  { title: "Coins Added", desc: "Coins instantly credited to your wallet.", icon: "Coins", accent: "gold" },
  { title: "Redeem Rewards", desc: "Cash out via UPI, vouchers or gift cards.", icon: "Gift", accent: "emerald" },
];

// Static marketing catalog of reward tiers — shown to all visitors.
// Coin costs are reference values used everywhere rewards are marketed.
const REWARD_TIERS: {
  name: string;
  category: "UPI" | "Voucher";
  coins: number;
  icon: string;
  accent: Accent;
}[] = [
  { name: "₹10 UPI", category: "UPI", coins: 1000, icon: "HandCoins", accent: "electric" },
  { name: "₹20 UPI", category: "UPI", coins: 2000, icon: "HandCoins", accent: "cyan" },
  { name: "₹50 UPI", category: "UPI", coins: 5000, icon: "HandCoins", accent: "purple" },
  { name: "₹100 UPI", category: "UPI", coins: 10000, icon: "HandCoins", accent: "gold" },
  { name: "₹200 UPI", category: "UPI", coins: 20000, icon: "HandCoins", accent: "emerald" },
  { name: "₹500 UPI", category: "UPI", coins: 50000, icon: "HandCoins", accent: "rose" },
  { name: "Amazon Voucher", category: "Voucher", coins: 5000, icon: "Gift", accent: "cyan" },
  { name: "Flipkart Voucher", category: "Voucher", coins: 5000, icon: "Gift", accent: "purple" },
];

const SECURITY_FEATURES: {
  title: string;
  desc: string;
  icon: string;
}[] = [
  { title: "Secure Authentication", desc: "Email verification + future 2FA support.", icon: "Fingerprint" },
  { title: "Encrypted Sessions", desc: "End-to-end TLS for all session traffic.", icon: "Lock" },
  { title: "Privacy First", desc: "We never sell your personal data, ever.", icon: "Eye" },
  { title: "Safe Reward Processing", desc: "Fraud-checked redemptions, every time.", icon: "ShieldCheck" },
];

const FAQS: { q: string; a: string }[] = [
  { q: "Is LootLoom free to use?", a: "Yes. Creating an account and earning coins is completely free. We only require a verified email address to unlock redemptions." },
  { q: "How do I redeem coins?", a: "Head to the Redeem page, choose a reward (UPI, voucher or gift card), enter the amount, and we'll process your request within the stated timeframe." },
  { q: "When do coins get credited?", a: "Coins from rewarded ads and missions are credited instantly. Referral bonuses appear as soon as your friend verifies their email." },
  { q: "Can I use LootLoom on mobile?", a: "Our web app is fully responsive. Native Android and iOS apps are on the roadmap and will be available soon." },
  { q: "What if I run into issues?", a: "Open a ticket from the Support page and our team will respond within 24 hours. Premium members get priority handling." },
];

const SUPPORT_OPTIONS: {
  title: string;
  desc: string;
  icon: string;
  accent: Accent;
}[] = [
  { title: "Support Center", desc: "Browse help articles", icon: "LifeBuoy", accent: "electric" },
  { title: "Help Center", desc: "Guides & tutorials", icon: "BookOpen", accent: "cyan" },
  { title: "Contact Us", desc: "Reach our team", icon: "Mail", accent: "purple" },
  { title: "Open a Ticket", desc: "Get personalized help", icon: "Ticket", accent: "gold" },
  { title: "Live Chat", desc: "Coming soon", icon: "MessageCircle", accent: "emerald" },
];

/* ============================================================
   Small presentational helpers
   ============================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && (
        <motion.span
          variants={slideUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-electric bg-electric/10 ring-1 ring-electric/20 mb-3"
        >
          <Sparkles size={12} />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        variants={slideUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={slideUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-3 text-sm sm:text-base text-muted-foreground"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

function FloatingCoin({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`pointer-events-none absolute size-8 rounded-full bg-[linear-gradient(135deg,var(--gold),oklch(0.75_0.18_60))] shadow-[0_4px_14px_-4px_oklch(0.75_0.18_60/0.6)] flex items-center justify-center ${className ?? ""}`}
      variants={floatingSmall}
      animate="animate"
      transition={{ delay, duration: 4 + (delay % 2), repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <Coins size={14} className="text-white" />
    </motion.div>
  );
}

/* ============================================================
   Section 1: Premium Hero
   ============================================================ */
function Hero() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [stats, setStats] = useState([
    { value: 0, suffix: "+", label: "Active Members" },
    { value: 0, suffix: "+", label: "Coins Redeemed" },
    { value: 0, suffix: "+", label: "Rewards Available" },
  ]);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setStats([
            { value: Number(json.data.activeMembers) || 0, suffix: "+", label: "Active Members" },
            { value: Number(json.data.coinsRedeemed) || 0, suffix: "+", label: "Coins Redeemed" },
            { value: Number(json.data.rewardsAvailable) || 0, suffix: "+", label: "Rewards Available" },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative px-3 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Left: copy + CTAs */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={cardReveal}>
            <StatusBadge variant="electric" dot pulse className="px-3 py-1">
              <Sparkles size={12} />
              Premium Rewards Platform
            </StatusBadge>
          </motion.div>
          <motion.h1
            variants={cardReveal}
            custom={1}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
          >
            Earn Rewards.
            <br />
            <span className="text-gradient-electric">Redeem Joy.</span>
          </motion.h1>
          <motion.p variants={cardReveal} custom={2} className="text-base sm:text-lg text-muted-foreground max-w-xl">
            LootLoom turns your time into real rewards — watch ads, finish missions, invite
            friends, and redeem coins for UPI cash, gift cards and vouchers. Built for everyday earners.
          </motion.p>
          <motion.div variants={cardReveal} custom={3} className="flex flex-wrap items-center gap-3">
            <LootButton
              size="lg"
              variant="electric"
              onClick={() => navigate("register")}
              rightIcon={<ArrowRight size={16} />}
            >
              Get Started
            </LootButton>
            <LootButton size="lg" variant="glass" onClick={() => navigate("login")} leftIcon={<LogIn size={16} />}>
              Sign In
            </LootButton>
          </motion.div>
          <motion.div variants={cardReveal} custom={4} className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
            {stats.map((s) => (
              <div key={s.label} className="space-y-0.5">
                <AnimatedCounter
                  value={s.value}
                  suffix={s.suffix}
                  className="text-xl sm:text-2xl font-bold text-foreground tracking-tight"
                />
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: floating glass widget composition — purely decorative */}
        <motion.div
          variants={scaleIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="relative h-[420px] sm:h-[480px] lg:h-[520px] perspective-1000"
        >
          <motion.div
            whileHover={{ rotateX: 4, rotateY: -4 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-full h-full preserve-3d"
          >
            {/* Dashboard widget — decorative only, balance shown as 0 */}
            <motion.div
              variants={floating}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2, duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 left-2 sm:top-4 sm:left-4 w-[58%] z-20"
            >
              <GlassCard level={3} sheen className="p-4 shadow-[var(--shadow-lg)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconBadge name="LayoutDashboard" accent="electric" size="sm" />
                    <span className="text-xs font-semibold text-foreground">Dashboard</span>
                  </div>
                  <StatusBadge variant="success" dot pulse className="text-[10px]">Live</StatusBadge>
                </div>
                <div className="flex items-end gap-2">
                  <AnimatedCounter value={0} className="text-3xl font-bold text-foreground" />
                  <Coins size={18} className="text-gold mb-1.5" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Available balance</p>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand),var(--purple-brand))]"
                  />
                </div>
              </GlassCard>
            </motion.div>

            {/* Wallet widget — decorative gradient bar, no fake weekly numbers */}
            <motion.div
              variants={floatingSmall}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.6, duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 right-0 sm:top-10 sm:right-2 w-[44%] z-30"
            >
              <GlassCard level={3} sheen glow="cyan" className="p-3.5 shadow-[var(--shadow-lg)]">
                <div className="flex items-center gap-2 mb-2">
                  <IconBadge name="Wallet" accent="cyan" size="sm" />
                  <span className="text-xs font-semibold text-foreground">Wallet</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Track earnings</p>
                <div className="mt-2 flex items-end gap-1 h-8">
                  {[0.4, 0.6, 0.45, 0.75, 0.55, 0.85, 1].map((h, i) => (
                    <motion.span
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.06, ease: "easeOut" }}
                      className="flex-1 rounded-sm bg-[linear-gradient(180deg,var(--cyan-brand),oklch(0.72_0.15_200/0.4))]"
                    />
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Earn widget — decorative, no specific reward amounts */}
            <motion.div
              variants={floatingSmall}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4, duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-20 left-0 sm:bottom-24 sm:left-0 w-[46%] z-20"
            >
              <GlassCard level={3} sheen glow="purple" className="p-3.5 shadow-[var(--shadow-lg)]">
                <div className="flex items-center gap-2 mb-2">
                  <IconBadge name="PlayCircle" accent="purple" size="sm" />
                  <span className="text-xs font-semibold text-foreground">Earn</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Rewarded Ad</p>
                    <p className="text-lg font-bold text-purple-brand">+Coins</p>
                  </div>
                  <LootButton size="sm" variant="purple" className="h-7 px-2.5 text-[10px]">
                    Start
                  </LootButton>
                </div>
              </GlassCard>
            </motion.div>

            {/* Rewards widget — decorative reward names only */}
            <motion.div
              variants={floating}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.8, duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 right-2 sm:bottom-6 sm:right-4 w-[50%] z-30"
            >
              <GlassCard level={3} sheen glow="electric" className="p-3.5 shadow-[var(--shadow-lg)]">
                <div className="flex items-center gap-2 mb-2">
                  <IconBadge name="Gift" accent="gold" size="sm" />
                  <span className="text-xs font-semibold text-foreground">Rewards</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "UPI Cashout" },
                    { label: "Amazon Voucher" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{r.label}</span>
                      <span className="text-muted-foreground">Redeem</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Welcome toast — marketing copy, no fake numbers */}
            <motion.div
              variants={floatingSmall}
              initial="initial"
              animate="animate"
              transition={{ delay: 1, duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[64%] z-40"
            >
              <GlassCard level={4} sheen className="p-3 shadow-[var(--shadow-xl)] flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-brand/15 flex items-center justify-center shrink-0">
                  <Check size={16} className="text-emerald-brand" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">Welcome to LootLoom</p>
                  <p className="text-[10px] text-muted-foreground truncate">Join thousands of earners</p>
                </div>
              </GlassCard>
            </motion.div>

            <FloatingCoin className="top-0 right-1/3" delay={0.3} />
            <FloatingCoin className="bottom-8 left-1/3" delay={1.1} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 2: How LootLoom Works
   ============================================================ */
function HowItWorks() {
  return (
    <section id="how" className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Process"
          title="How LootLoom Works"
          description="From sign-up to redeem in five simple steps. No hidden catches, no complexity."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12"
        >
          {/* Desktop: horizontal timeline */}
          <div className="hidden lg:block relative">
            <div className="absolute top-9 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-electric/30 via-purple-brand/40 to-emerald-brand/30 rounded-full" />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute top-9 left-[10%] right-[10%] h-0.5 bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand),var(--purple-brand),var(--gold),var(--emerald-brand))] origin-left rounded-full"
            />
            <div className="grid grid-cols-5 gap-4">
              {TIMELINE_STEPS.map((step, i) => (
                <motion.div key={step.title} variants={cardReveal} custom={i} className="flex flex-col items-center text-center">
                  <GlassCard level={3} sheen className="size-18 w-18 h-18 rounded-full flex items-center justify-center shadow-[var(--shadow-md)] relative">
                    <IconBadge name={step.icon} accent={step.accent} size="lg" />
                    <span className="absolute -top-2 -right-2 size-6 rounded-full bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                  </GlassCard>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="lg:hidden relative pl-6">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-electric via-purple-brand to-emerald-brand rounded-full opacity-40" />
            <div className="space-y-5">
              {TIMELINE_STEPS.map((step, i) => (
                <motion.div key={step.title} variants={cardReveal} custom={i} className="relative flex items-start gap-3">
                  <GlassCard level={3} sheen className="size-10 rounded-full flex items-center justify-center shadow-[var(--shadow-sm)] shrink-0 z-10">
                    <IconBadge name={step.icon} accent={step.accent} size="sm" />
                  </GlassCard>
                  <GlassCard level={2} sheen className="flex-1 p-3.5 shadow-[var(--shadow-sm)]">
                    <div className="flex items-center gap-2">
                      <span className="size-5 rounded-full bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] text-white text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 3: What You Can Do (Features grid)
   ============================================================ */
function WhatYouCanDo() {
  const navigate = useNavigationStore((s) => s.navigate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <section id="overview" className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Features"
          title="What You Can Do"
          description="Everything you need to earn, track, redeem and grow your rewards — in one premium platform."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {WHAT_YOU_CAN_DO.map((item) => (
            <motion.div key={item.title} variants={cardReveal}>
              <motion.div
                variants={floatingSmall}
                animate="animate"
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full"
              >
                <GlassCard
                  level={2}
                  hover
                  sheen
                  glow={item.accent === "navy" ? "none" : (item.accent as "electric" | "cyan" | "purple")}
                  className="p-5 h-full flex flex-col gap-3 shadow-[var(--shadow-md)]"
                  onClick={() => navigate(isAuthenticated ? item.view : "register")}
                >
                  <IconBadge name={item.icon} accent={item.accent} size="lg" />
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-electric">
                    {isAuthenticated ? "Open" : "Sign up"} <ArrowRight size={12} />
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 4: Rewards Preview (marketing catalog)
   ============================================================ */
function RewardsPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleRedeem = () => navigate(isAuthenticated ? "redeem" : "register");

  return (
    <section id="rewards" className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Rewards"
          title="Redeem Your Coins"
          description="A transparent catalog of rewards available to every member — UPI cash, vouchers and gift cards."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {REWARD_TIERS.map((reward, i) => (
            <motion.div key={reward.name} variants={cardReveal} custom={i}>
              <GlassCard
                level={2}
                hover
                sheen
                glow={reward.accent === "gold" || reward.accent === "emerald" || reward.accent === "rose" || reward.accent === "navy" ? "none" : (reward.accent as "electric" | "cyan" | "purple")}
                className="p-4 sm:p-5 h-full flex flex-col gap-3 shadow-[var(--shadow-md)]"
              >
                <div className="flex items-center justify-between">
                  <IconBadge name={reward.icon} accent={reward.accent} size="lg" />
                  <StatusBadge
                    variant={reward.category === "UPI" ? "emerald" : "purple"}
                    className="text-[10px]"
                  >
                    {reward.category}
                  </StatusBadge>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">{reward.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Coins size={11} className="text-gold" />
                    <span className="font-semibold text-gold tabular-nums">
                      {reward.coins.toLocaleString("en-IN")}
                    </span>
                    <span>coins</span>
                  </div>
                </div>
                <div className="mt-auto pt-1">
                  <LootButton
                    size="sm"
                    variant={isAuthenticated ? "electric" : "outline"}
                    fullWidth
                    onClick={handleRedeem}
                    rightIcon={<ArrowRight size={12} />}
                  >
                    {isAuthenticated ? "Redeem" : "Sign up to Redeem"}
                  </LootButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <LootButton
            variant="glass"
            onClick={() => navigate(isAuthenticated ? "redeem" : "register")}
            rightIcon={<ArrowRight size={15} />}
          >
            {isAuthenticated ? "Open Redeem Page" : "Get Started to Redeem"}
          </LootButton>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 5: Security
   ============================================================ */
function SecurityPreview() {
  return (
    <section className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Security"
          title="Built Safe, by Design"
          description="Your account, data and rewards are protected with industry-standard security."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {SECURITY_FEATURES.map((f, i) => (
            <motion.div key={f.title} variants={cardReveal} custom={i}>
              <GlassCard level={2} hover sheen className="p-5 h-full flex flex-col gap-3 shadow-[var(--shadow-md)]">
                <div className="inline-flex items-center justify-center rounded-xl bg-emerald-brand/10 text-emerald-brand ring-1 ring-emerald-brand/20 size-12">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </div>
                <div className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-brand">
                  <ShieldCheck size={12} /> Protected
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 6: FAQ
   ============================================================ */
function FAQPreview() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Quick answers to the things members ask us most."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 space-y-3"
        >
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div key={f.q} variants={cardReveal} custom={i}>
                <GlassCard level={2} sheen className="shadow-[var(--shadow-sm)] overflow-hidden">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <HelpCircle size={16} className="text-electric shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{f.q}</span>
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0 text-muted-foreground"
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 pl-[42px] text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 7: Support
   ============================================================ */
function SupportPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <section id="support" className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Support"
          title="We're Here to Help"
          description="Multiple channels to get the answers you need — fast."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {SUPPORT_OPTIONS.map((s, i) => {
            const isLiveChat = s.title === "Live Chat";
            const target: ViewId = isAuthenticated ? "support" : "register";
            return (
              <motion.div key={s.title} variants={cardReveal} custom={i}>
                <GlassCard
                  level={2}
                  hover
                  sheen
                  glow={s.accent === "gold" || s.accent === "emerald" ? "none" : s.accent}
                  className={`p-4 sm:p-5 h-full flex flex-col gap-3 shadow-[var(--shadow-md)] ${isLiveChat ? "opacity-70" : ""}`}
                  onClick={() => !isLiveChat && navigate(target)}
                >
                  <IconBadge name={s.icon} accent={s.accent} />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {s.title}
                      {isLiveChat && <StatusBadge variant="default" className="text-[9px]">Soon</StatusBadge>}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                  <div className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-electric">
                    {!isLiveChat && (
                      <>
                        {isAuthenticated ? "Open" : "Sign up"} <ArrowRight size={12} />
                      </>
                    )}
                    {isLiveChat && <>Coming soon</>}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 8: Footer
   ============================================================ */
function Footer() {
  const navigate = useNavigationStore((s) => s.navigate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const quickLinks: { label: string; view: ViewId }[] = [
    { label: "Dashboard", view: "dashboard" },
    { label: "Earn Coins", view: "earn" },
    { label: "Wallet", view: "wallet" },
    { label: "Rewards", view: "rewards" },
    { label: "Leaderboard", view: "leaderboard" },
  ];
  const legalLinks: { label: string; view: ViewId }[] = [
    { label: "Privacy Policy", view: "privacy" },
    { label: "Terms of Service", view: "terms" },
    { label: "Cookie Policy", view: "cookies" },
    { label: "Community Guidelines", view: "community-guidelines" },
    { label: "Security", view: "security-policy" },
  ];
  const supportLinks: { label: string; view: ViewId }[] = [
    { label: "Support Center", view: "support" },
    { label: "Help Center", view: "support" },
    { label: "Contact Us", view: "support" },
  ];
  const socials = [
    { icon: Twitter, label: "Twitter" },
    { icon: Github, label: "GitHub" },
    { icon: Linkedin, label: "LinkedIn" },
    { icon: Youtube, label: "YouTube" },
    { icon: Send, label: "Telegram" },
  ];
  const handleQuickLink = (view: ViewId) => navigate(isAuthenticated ? view : "register");
  return (
    <footer className="px-3 sm:px-6 lg:px-8 pb-6 pt-12 mt-auto">
      <div className="max-w-7xl mx-auto">
        <GlassCard level={3} sheen className="p-6 sm:p-8 shadow-[var(--shadow-md)] border-t-2 border-t-electric/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  navigate("home");
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                aria-label="LootLoom home"
              >
                <Logo size="md" />
              </button>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                LootLoom is a premium rewards platform that turns your time into real value —
                watch, complete, invite and redeem.
              </p>
              <div className="flex items-center gap-2">
                {socials.map((s) => (
                  <button
                    key={s.label}
                    aria-label={s.label}
                    className="size-8 rounded-full glass-2 ring-1 ring-border flex items-center justify-center text-muted-foreground hover:text-electric hover:ring-electric/30 transition-colors"
                  >
                    <s.icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => handleQuickLink(l.view)}
                      className="text-xs text-muted-foreground hover:text-electric transition-colors text-left"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Legal</h4>
              <ul className="space-y-2">
                {legalLinks.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => navigate(l.view)}
                      className="text-xs text-muted-foreground hover:text-electric transition-colors text-left"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Support</h4>
              <ul className="space-y-2">
                {supportLinks.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => navigate(isAuthenticated ? l.view : "register")}
                      className="text-xs text-muted-foreground hover:text-electric transition-colors text-left"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
                <li>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-brand/10 px-2 py-1 text-[10px] font-semibold text-emerald-brand">
                    <span className="size-1.5 rounded-full bg-emerald-brand animate-pulse" />
                    24/7 Available
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} LootLoom. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-brand" /> Secure Platform
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles size={12} className="text-gold" /> Premium Rewards
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
}

/* ============================================================
   Main: HomeView — marketing-only homepage
   ============================================================ */
export function HomeView() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="relative min-h-screen flex flex-col"
    >
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <WhatYouCanDo />
        <RewardsPreview />
        <SecurityPreview />
        <FAQPreview />
        <SupportPreview />
      </main>
      <Footer />
    </motion.div>
  );
}
