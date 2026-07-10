"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
  PlayCircle,
  Wallet,
  Gift,
  CalendarCheck,
  Users,
  Trophy,
  Award,
  LifeBuoy,
  ShieldCheck,
  Lock,
  Eye,
  Shield,
  Coins,
  Bell,
  TrendingUp,
  Flame,
  Star,
  ChevronDown,
  QrCode,
  Apple,
  Smartphone,
  HelpCircle,
  Mail,
  MessageCircle,
  Ticket,
  BookOpen,
  Target,
  Crown,
  Medal,
  Zap,
  Check,
  Twitter,
  Github,
  Linkedin,
  Youtube,
  Send,
  Rocket,
  HandCoins,
  PiggyBank,
  Fingerprint,
  BadgeCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";
import {
  GlassCard,
  LootButton,
  Logo,
  IconBadge,
  AnimatedCounter,
  ProgressRing,
  StatusBadge,
} from "@/components/lootloom";
import {
  pageTransition,
  slideUp,
  scaleIn,
  floating,
  floatingSmall,
  cardReveal,
  staggerContainer,
} from "@/lib/animations";
import { useNavigationStore, useWalletStore, useUserStore } from "@/stores";
import type { ViewId } from "@/types";

/* ============================================================
   Static content data — kept local to the home view
   ============================================================ */

const QUICK_ACTIONS: {
  title: string;
  desc: string;
  icon: string;
  accent: "electric" | "cyan" | "purple" | "gold";
  view?: ViewId;
  scroll?: string;
}[] = [
  { title: "Start Earning", desc: "Watch ads, complete missions", icon: "PlayCircle", accent: "electric", view: "earn" },
  { title: "Register", desc: "Create your free account", icon: "UserPlus", accent: "cyan", view: "register" },
  { title: "Login", desc: "Welcome back, member", icon: "LogIn", accent: "purple", view: "login" },
  { title: "Explore Features", desc: "See everything you can do", icon: "Sparkles", accent: "gold", scroll: "overview" },
];

const WHAT_YOU_CAN_DO: {
  title: string;
  desc: string;
  icon: string;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
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
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald";
}[] = [
  { title: "Create Account", desc: "Sign up free in under 60 seconds.", icon: "UserPlus", accent: "electric" },
  { title: "Verify Account", desc: "Confirm your email to unlock earning.", icon: "BadgeCheck", accent: "cyan" },
  { title: "Start Earning", desc: "Watch ads, finish missions, invite friends.", icon: "Rocket", accent: "purple" },
  { title: "Coins Added", desc: "Coins instantly credited to your wallet.", icon: "Coins", accent: "gold" },
  { title: "Redeem Rewards", desc: "Cash out via UPI, vouchers or gift cards.", icon: "Gift", accent: "emerald" },
];

const WALLET_CHART_DATA = [
  { day: "Mon", v: 120 },
  { day: "Tue", v: 180 },
  { day: "Wed", v: 140 },
  { day: "Thu", v: 220 },
  { day: "Fri", v: 280 },
  { day: "Sat", v: 320 },
  { day: "Sun", v: 380 },
];

const EARN_ACTIVITIES: {
  title: string;
  desc: string;
  reward: number;
  icon: string;
  accent: "electric" | "cyan" | "purple" | "gold";
  time: string;
}[] = [
  { title: "Rewarded Ads", desc: "Watch short ads and earn coins instantly.", reward: 25, icon: "PlayCircle", accent: "electric", time: "~30s" },
  { title: "Offerwall", desc: "Complete offers from partner brands.", reward: 150, icon: "Target", accent: "purple", time: "~5 min" },
  { title: "Daily Bonus", desc: "Claim your free daily login reward.", reward: 50, icon: "CalendarCheck", accent: "gold", time: "Daily" },
  { title: "Missions", desc: "Finish multi-step missions for big payouts.", reward: 320, icon: "Rocket", accent: "cyan", time: "~15 min" },
];

const LEADERBOARD_TOP3: {
  rank: number;
  name: string;
  xp: number;
  coins: number;
  level: number;
  medal: "gold" | "silver" | "bronze";
}[] = [
  { rank: 2, name: "Aarav S.", xp: 18420, coins: 92400, level: 24, medal: "silver" },
  { rank: 1, name: "Priya K.", xp: 24180, coins: 128500, level: 28, medal: "gold" },
  { rank: 3, name: "Rohan M.", xp: 16240, coins: 81200, level: 22, medal: "bronze" },
];

const ACHIEVEMENTS: {
  name: string;
  desc: string;
  icon: string;
  progress: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}[] = [
  { name: "First Steps", desc: "Complete your first mission", icon: "Footprints", progress: 100, rarity: "common" },
  { name: "Streak Keeper", desc: "Maintain a 7-day streak", icon: "Flame", progress: 71, rarity: "rare" },
  { name: "Coin Collector", desc: "Earn 50,000 lifetime coins", icon: "PiggyBank", progress: 92, rarity: "epic" },
  { name: "Legendary Earner", desc: "Reach the global top 10", icon: "Crown", progress: 28, rarity: "legendary" },
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
  { q: "Can I use LootLoom on mobile?", a: "Our web app is fully responsive. Native Android and iOS apps are on the roadmap and will be available soon via the Download section." },
  { q: "What if I run into issues?", a: "Open a ticket from the Support page and our team will respond within 24 hours. Premium members get priority handling." },
];

const SUPPORT_OPTIONS: {
  title: string;
  desc: string;
  icon: string;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald";
}[] = [
  { title: "Support Center", desc: "Browse help articles", icon: "LifeBuoy", accent: "electric" },
  { title: "Help Center", desc: "Guides & tutorials", icon: "BookOpen", accent: "cyan" },
  { title: "Contact Us", desc: "Reach our team", icon: "Mail", accent: "purple" },
  { title: "Open a Ticket", desc: "Get personalized help", icon: "Ticket", accent: "gold" },
  { title: "Live Chat", desc: "Coming soon", icon: "MessageCircle", accent: "emerald" },
];

const RARITY_COLOR: Record<string, "gold" | "electric" | "purple" | "cyan"> = {
  common: "cyan",
  rare: "electric",
  epic: "purple",
  legendary: "gold",
};

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
   Section: Sticky top bar
   ============================================================ */
function TopBar() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <motion.header
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="sticky top-0 z-50 px-3 sm:px-4 lg:px-6 pt-3"
    >
      <GlassCard
        level="nav"
        sheen
        className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 shadow-[var(--shadow-md)]"
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          aria-label="LootLoom home"
        >
          <Logo size="md" />
        </button>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {[
            { label: "Overview", target: "overview" },
            { label: "How it Works", target: "how" },
            { label: "Rewards", view: "rewards" as ViewId },
            { label: "Support", view: "support" as ViewId },
          ].map((item) =>
            item.view ? (
              <button
                key={item.label}
                onClick={() => navigate(item.view!)}
                className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium"
              >
                {item.label}
              </button>
            ) : (
              <button
                key={item.label}
                onClick={() => document.getElementById(item.target!)?.scrollIntoView({ behavior: "smooth" })}
                className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium"
              >
                {item.label}
              </button>
            )
          )}
        </nav>
        <div className="flex items-center gap-2">
          <LootButton size="sm" variant="glass" onClick={() => navigate("login")} leftIcon={<LogIn size={14} />}>
            <span className="hidden sm:inline">Sign In</span>
          </LootButton>
          <LootButton size="sm" variant="electric" onClick={() => navigate("register")} leftIcon={<UserPlus size={14} />}>
            Get Started
          </LootButton>
        </div>
      </GlassCard>
    </motion.header>
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
            { value: json.data.activeMembers, suffix: "+", label: "Active Members" },
            { value: json.data.coinsRedeemed, suffix: "+", label: "Coins Redeemed" },
            { value: json.data.rewardsAvailable, suffix: "+", label: "Rewards Available" },
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
                <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums tracking-tight">
                  {s.value.toLocaleString("en-IN")}{s.suffix}
                </span>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: floating glass widget composition */}
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
            {/* Dashboard widget */}
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
                  <AnimatedCounter
                    value={0}
                    className="text-3xl font-bold text-foreground"
                  />
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

            {/* Wallet widget */}
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
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter value={980} prefix="+" className="text-xl font-bold text-cyan-brand" />
                  <span className="text-[10px] text-muted-foreground">this week</span>
                </div>
                <div className="mt-2 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={WALLET_CHART_DATA}>
                      <defs>
                        <linearGradient id="heroWallet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="oklch(0.72 0.15 200)"
                        strokeWidth={2}
                        fill="url(#heroWallet)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </motion.div>

            {/* Earn widget */}
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
                    <p className="text-lg font-bold text-purple-brand">+25</p>
                  </div>
                  <LootButton size="sm" variant="purple" className="h-7 px-2.5 text-[10px]">
                    Start
                  </LootButton>
                </div>
              </GlassCard>
            </motion.div>

            {/* Rewards widget */}
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
                    { label: "₹100 UPI", cost: "10,000" },
                    { label: "Amazon Voucher", cost: "5,000" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{r.label}</span>
                      <span className="text-muted-foreground">{r.cost} coins</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Notification toast */}
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
                  <p className="text-xs font-semibold text-foreground truncate">Coins earned!</p>
                  <p className="text-[10px] text-muted-foreground truncate">+50 daily bonus added</p>
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
   Section 2: Quick Action Cards
   ============================================================ */
function QuickActions() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <section className="px-3 sm:px-6 lg:px-8 py-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {QUICK_ACTIONS.map((a) => (
          <motion.div key={a.title} variants={cardReveal}>
            <GlassCard
              level={2}
              hover
              sheen
              glow={a.accent === "gold" ? "none" : a.accent}
              className="p-4 sm:p-5 h-full flex flex-col gap-3 shadow-[var(--shadow-md)]"
              onClick={() =>
                a.view ? navigate(a.view) : document.getElementById(a.scroll!)?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <IconBadge name={a.icon} accent={a.accent} />
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">{a.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
              <div className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-electric">
                Continue <ArrowRight size={12} />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ============================================================
   Section 3: What You Can Do
   ============================================================ */
function WhatYouCanDo() {
  const navigate = useNavigationStore((s) => s.navigate);
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
                  onClick={() => navigate(item.view)}
                >
                  <IconBadge name={item.icon} accent={item.accent} size="lg" />
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-electric">
                    Open <ArrowRight size={12} />
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
   Section 4: How LootLoom Works
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
   Section 5: Live Dashboard Preview
   ============================================================ */
function DashboardPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { dailyStreak, xp, xpToNext } = useUserStore();
  const xpPct = Math.round((xp / xpToNext) * 100);
  const recentRewards = [
    { name: "₹100 UPI", date: "2 hours ago", coins: 10000, icon: "HandCoins", accent: "emerald" as const },
    { name: "Amazon Voucher", date: "Yesterday", coins: 5000, icon: "Gift", accent: "purple" as const },
    { name: "Spotify Premium", date: "3 days ago", coins: 7500, icon: "Gift", accent: "cyan" as const },
  ];
  return (
    <section className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Live Preview"
          title="Your Dashboard, Alive"
          description="A premium command center for your rewards — balances, streaks, XP, notifications and recent activity in one place."
        />
        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10"
        >
          <GlassCard level={3} sheen className="p-5 sm:p-7 shadow-[var(--shadow-lg)]">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <IconBadge name="LayoutDashboard" accent="electric" size="lg" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">Member Dashboard</h3>
                  <p className="text-xs text-muted-foreground">Welcome back, ready to earn?</p>
                </div>
              </div>
              <LootButton size="sm" variant="electric" onClick={() => navigate("dashboard")} rightIcon={<ArrowRight size={14} />}>
                Open Dashboard
              </LootButton>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Balance + XP card */}
              <GlassCard level={2} sheen className="p-5 lg:col-span-1 flex flex-col gap-4 shadow-[var(--shadow-sm)]">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Available Balance</p>
                  <div className="flex items-end gap-2 mt-1">
                    <AnimatedCounter value={0} className="text-3xl font-bold text-foreground" />
                    <Coins size={18} className="text-gold mb-1.5" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressRing value={xpPct} size={92} strokeWidth={9} gradient="electric" />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Level Progress</p>
                    <p className="text-lg font-bold text-foreground">
                      <AnimatedCounter value={xp} /> / <AnimatedCounter value={xpToNext} /> XP
                    </p>
                    <StatusBadge variant="electric" className="text-[10px]">Level 7</StatusBadge>
                  </div>
                </div>
              </GlassCard>

              {/* Streak + stats */}
              <GlassCard level={2} sheen className="p-5 grid grid-cols-2 gap-4 shadow-[var(--shadow-sm)]">
                <div className="col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconBadge name="Flame" accent="gold" />
                    <span className="text-sm font-semibold text-foreground">Daily Streak</span>
                  </div>
                  <StatusBadge variant="gold" dot pulse>{dailyStreak} days</StatusBadge>
                </div>
                {[
                  { label: "Today", value: 145, accent: "text-electric", icon: "TrendingUp" },
                  { label: "This Week", value: 980, accent: "text-cyan-brand", icon: "TrendingUp" },
                  { label: "This Month", value: 4280, accent: "text-purple-brand", icon: "TrendingUp" },
                  { label: "Lifetime", value: 0, accent: "text-gold", icon: "Award" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-accent/40 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                    <AnimatedCounter value={s.value} className={`text-xl font-bold ${s.accent}`} />
                  </div>
                ))}
              </GlassCard>

              {/* Recent rewards */}
              <GlassCard level={2} sheen className="p-5 shadow-[var(--shadow-sm)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">Recent Rewards</span>
                  <Bell size={14} className="text-muted-foreground" />
                </div>
                <ul className="space-y-2.5 max-h-[180px] overflow-y-auto no-scrollbar">
                  {recentRewards.map((r) => (
                    <li key={r.name} className="flex items-center gap-2.5">
                      <IconBadge name={r.icon} accent={r.accent} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground">{r.date}</p>
                      </div>
                      <span className="text-xs font-bold text-gold inline-flex items-center gap-0.5">
                        <Coins size={11} />
                        {r.coins.toLocaleString("en-IN")}
                      </span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 6: Wallet Preview
   ============================================================ */
function WalletPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { availableCoins, lifetimeEarned, todayEarnings } = useWalletStore();
  const transactions = [
    { title: "Daily Bonus", time: "2h ago", amount: 50, positive: true },
    { title: "UPI Redemption", time: "Yesterday", amount: -10000, positive: false },
    { title: "Mission Reward", time: "2 days ago", amount: 320, positive: true },
  ];
  return (
    <section className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Wallet"
          title="Track Every Coin"
          description="A transparent, real-time view of your earnings, redemptions and lifetime totals."
        />
        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10"
        >
          <GlassCard level={3} sheen className="p-5 sm:p-7 shadow-[var(--shadow-lg)] relative overflow-hidden">
            <FloatingCoin className="top-4 right-8" delay={0.2} />
            <FloatingCoin className="bottom-6 right-1/4" delay={0.9} />
            <div className="grid lg:grid-cols-5 gap-5 relative z-10">
              {/* Left: balance */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <IconBadge name="Wallet" accent="cyan" size="lg" />
                  <span className="text-sm font-semibold text-foreground">Wallet Balance</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available Coins</p>
                  <div className="flex items-end gap-2 mt-1">
                    <AnimatedCounter value={availableCoins} className="text-4xl font-bold text-foreground" />
                    <Coins size={20} className="text-gold mb-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl bg-accent/50 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase">Today</p>
                    <AnimatedCounter value={todayEarnings} prefix="+" className="text-lg font-bold text-emerald-brand" />
                  </div>
                  <div className="rounded-xl bg-accent/50 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase">Lifetime</p>
                    <AnimatedCounter value={lifetimeEarned} className="text-lg font-bold text-electric" />
                  </div>
                </div>
                <LootButton size="sm" variant="cyan" onClick={() => navigate("wallet")} rightIcon={<ArrowRight size={14} />} className="mt-1">
                  Open Wallet
                </LootButton>
              </div>

              {/* Right: chart + transactions */}
              <div className="lg:col-span-3 space-y-4">
                <div className="rounded-xl bg-accent/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground">Weekly Earnings</span>
                    <StatusBadge variant="success" className="text-[10px]">
                      <TrendingUp size={11} /> +28%
                    </StatusBadge>
                  </div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={WALLET_CHART_DATA} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="walletArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 10, fill: "oklch(0.52 0.02 256)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "oklch(1 0 0 / 0.92)",
                            border: "1px solid oklch(0.92 0.01 250)",
                            borderRadius: 12,
                            fontSize: 12,
                            boxShadow: "0 8px 24px -6px rgb(15 23 42 / 0.12)",
                          }}
                          labelStyle={{ color: "oklch(0.21 0.04 256)" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke="oklch(0.62 0.22 255)"
                          strokeWidth={2.5}
                          fill="url(#walletArea)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Recent Transactions</span>
                    <button
                      onClick={() => navigate("wallet")}
                      className="text-[11px] font-semibold text-electric hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <ul className="space-y-1.5">
                    {transactions.map((t) => (
                      <li
                        key={t.title}
                        className="flex items-center gap-3 rounded-xl bg-accent/30 px-3 py-2.5"
                      >
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                            t.positive ? "bg-emerald-brand/15 text-emerald-brand" : "bg-rose-brand/12 text-rose-brand"
                          }`}
                        >
                          {t.positive ? <ArrowRight size={14} className="rotate-[270deg]" /> : <ArrowRight size={14} className="rotate-90" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground">{t.time}</p>
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${t.positive ? "text-emerald-brand" : "text-rose-brand"}`}>
                          {t.positive ? "+" : "-"}
                          {Math.abs(t.amount).toLocaleString("en-IN")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 7: Earn Preview
   ============================================================ */
function EarnPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <section className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Earning"
          title="Multiple Ways to Earn"
          description="Pick what fits your time — quick ads, deeper missions, daily bonuses or offerwall deals."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {EARN_ACTIVITIES.map((a, i) => (
            <motion.div key={a.title} variants={cardReveal} custom={i}>
              <GlassCard
                level={2}
                hover
                sheen
                glow={a.accent === "gold" ? "none" : a.accent}
                className="p-5 h-full flex flex-col gap-3 shadow-[var(--shadow-md)]"
                onClick={() => navigate("earn")}
              >
                <div className="flex items-center justify-between">
                  <IconBadge name={a.icon} accent={a.accent} size="lg" />
                  <StatusBadge variant="gold" className="text-[10px]">
                    <Coins size={11} /> +{a.reward}
                  </StatusBadge>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.desc}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Zap size={10} /> {a.time}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-electric">
                    Start <ArrowRight size={12} />
                  </span>
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
   Section 8: Referral Preview
   ============================================================ */
function ReferralPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { referralCode } = useUserStore();
  const friendsJoined = 8;
  const referralEarnings = 2400;
  const goalFriends = 25;
  const progressPct = Math.round((friendsJoined / goalFriends) * 100);

  return (
    <section className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Referrals"
          title="Invite Friends, Earn Together"
          description="Share your code — earn bonus coins for every friend who verifies their account."
        />
        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10"
        >
          <GlassCard level={3} sheen glow="purple" className="p-5 sm:p-7 shadow-[var(--shadow-lg)]">
            <div className="grid lg:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <IconBadge name="Users" accent="emerald" size="lg" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">Your Referral Code</h3>
                    <p className="text-xs text-muted-foreground">Share and earn 200 coins per verified friend</p>
                  </div>
                </div>
                <div className="rounded-2xl border-2 border-dashed border-electric/30 bg-electric/5 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Code</p>
                    <p className="text-xl font-bold tracking-wider text-gradient-electric">{referralCode}</p>
                  </div>
                  <LootButton
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard?.writeText(referralCode)}
                    leftIcon={<HandCoins size={14} />}
                  >
                    Copy
                  </LootButton>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-accent/40 p-4">
                    <p className="text-[10px] text-muted-foreground uppercase">Friends Joined</p>
                    <AnimatedCounter value={friendsJoined} className="text-2xl font-bold text-emerald-brand" />
                  </div>
                  <div className="rounded-xl bg-accent/40 p-4">
                    <p className="text-[10px] text-muted-foreground uppercase">Referral Earnings</p>
                    <div className="flex items-center gap-1">
                      <AnimatedCounter value={referralEarnings} className="text-2xl font-bold text-gold" />
                      <Coins size={14} className="text-gold" />
                    </div>
                  </div>
                </div>
                <LootButton size="md" variant="purple" onClick={() => navigate("referral")} rightIcon={<ArrowRight size={15} />}>
                  Open Referral Hub
                </LootButton>
              </div>

              {/* Progress to next milestone */}
              <GlassCard level={2} sheen className="p-5 shadow-[var(--shadow-sm)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Next Milestone</p>
                    <p className="text-xs text-muted-foreground">Reach {goalFriends} friends for a 5,000 coin bonus</p>
                  </div>
                  <Trophy size={20} className="text-gold" />
                </div>
                <div className="flex items-center justify-center py-3">
                  <ProgressRing value={progressPct} size={140} strokeWidth={12} gradient="purple" label={`${progressPct}%`} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{friendsJoined} friends</span>
                  <span className="text-muted-foreground">{goalFriends} goal</span>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-brand/10 px-3 py-2">
                  <Check size={14} className="text-emerald-brand" />
                  <span className="text-xs text-emerald-brand font-semibold">+200 coins per verified friend</span>
                </div>
              </GlassCard>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 9: Leaderboard Preview
   ============================================================ */
function LeaderboardPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  const medalStyle: Record<string, { text: string; ring: string; bg: string; icon: typeof Crown }> = {
    gold: { text: "text-gold", ring: "ring-gold/30", bg: "bg-gold/10", icon: Crown },
    silver: { text: "text-foreground/80", ring: "ring-foreground/20", bg: "bg-muted", icon: Medal },
    bronze: { text: "text-rose-brand", ring: "ring-rose-brand/30", bg: "bg-rose-brand/10", icon: Medal },
  };
  const podiumOrder = [1, 0, 2]; // silver, gold, bronze for podium visual
  return (
    <section className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Leaderboard"
          title="Climb the Ranks"
          description="Top earners this week. Earn XP, level up and compete with members worldwide."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-end"
        >
          {podiumOrder.map((idx, podiumIdx) => {
            const user = LEADERBOARD_TOP3[idx];
            const m = medalStyle[user.medal];
            const MedalIcon = m.icon;
            const isWinner = user.medal === "gold";
            return (
              <motion.div key={user.name} variants={cardReveal} custom={podiumIdx} className={isWinner ? "sm:-translate-y-4" : ""}>
                <GlassCard
                  level={isWinner ? 3 : 2}
                  sheen
                  glow={isWinner ? "electric" : "none"}
                  className={`p-5 text-center shadow-[var(--shadow-lg)] ${isWinner ? "ring-2 ring-gold/30" : ""}`}
                >
                  <div className="relative inline-block">
                    <div
                      className={`size-16 sm:size-20 mx-auto rounded-full bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] flex items-center justify-center text-white font-bold text-xl ring-4 ${m.ring} ${m.bg}`}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <span className={`absolute -top-1 -right-1 size-7 rounded-full flex items-center justify-center shadow-sm ${m.bg} ring-2 ring-background`}>
                      <MedalIcon size={14} className={m.text} />
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm sm:text-base font-bold text-foreground">{user.name}</h3>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <StatusBadge variant="electric" className="text-[10px]">Level {user.level}</StatusBadge>
                    {isWinner && <StatusBadge variant="gold" dot pulse className="text-[10px]">Champion</StatusBadge>}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-accent/50 py-2">
                      <p className="text-[9px] text-muted-foreground uppercase">XP</p>
                      <p className="text-sm font-bold text-foreground tabular-nums">{user.xp.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="rounded-lg bg-accent/50 py-2">
                      <p className="text-[9px] text-muted-foreground uppercase">Coins</p>
                      <p className="text-sm font-bold text-gold tabular-nums">{user.coins.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 text-center"
        >
          <LootButton variant="glass" onClick={() => navigate("leaderboard")} rightIcon={<ArrowRight size={15} />}>
            View Full Leaderboard
          </LootButton>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 10: Achievement Preview
   ============================================================ */
function AchievementsPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <section className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Achievements"
          title="Unlock Your Badges"
          description="Earn progression across four rarity tiers — from common milestones to legendary feats."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {ACHIEVEMENTS.map((a, i) => {
            const grad = RARITY_COLOR[a.rarity];
            return (
              <motion.div key={a.name} variants={cardReveal} custom={i}>
                <GlassCard level={2} hover sheen className="p-5 h-full flex flex-col items-center text-center gap-3 shadow-[var(--shadow-md)]">
                  <div className="relative">
                    <ProgressRing
                      value={a.progress}
                      size={92}
                      strokeWidth={8}
                      gradient={grad}
                      showLabel={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconBadge name={a.icon} accent={grad === "gold" ? "gold" : grad === "electric" ? "electric" : grad === "purple" ? "purple" : "cyan"} size="md" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{a.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <StatusBadge
                      variant={a.rarity === "legendary" ? "gold" : a.rarity === "epic" ? "purple" : a.rarity === "rare" ? "electric" : "cyan"}
                      className="text-[10px] uppercase"
                    >
                      {a.rarity}
                    </StatusBadge>
                    <span className="text-xs font-bold text-foreground tabular-nums">{a.progress}%</span>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 text-center"
        >
          <LootButton variant="glass" onClick={() => navigate("achievements")} rightIcon={<ArrowRight size={15} />}>
            See All Achievements
          </LootButton>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 11: Security Preview
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
   Section 12: Download App
   ============================================================ */
function DownloadApp() {
  return (
    <section className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <GlassCard level={3} sheen glow="electric" className="p-6 sm:p-10 shadow-[var(--shadow-lg)] overflow-hidden relative">
            <FloatingCoin className="top-6 right-10" delay={0.4} />
            <FloatingCoin className="bottom-8 right-1/3" delay={1.2} />
            <div className="grid lg:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4">
                <StatusBadge variant="purple" dot pulse>
                  <Rocket size={12} /> Coming Soon
                </StatusBadge>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  Take LootLoom <span className="text-gradient-electric">Anywhere</span>
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
                  Native apps for Android and iOS are on the roadmap. Earn on the go, get instant
                  push notifications for rewards and never miss a daily bonus.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    disabled
                    className="inline-flex items-center gap-2 rounded-xl glass-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed ring-1 ring-border opacity-70"
                    aria-label="Download on App Store (coming soon)"
                  >
                    <Apple size={18} />
                    <span className="text-left leading-tight">
                      <span className="block text-[9px] font-medium">Download on the</span>
                      App Store
                    </span>
                  </button>
                  <button
                    disabled
                    className="inline-flex items-center gap-2 rounded-xl glass-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed ring-1 ring-border opacity-70"
                    aria-label="Get it on Google Play (coming soon)"
                  >
                    <Smartphone size={18} />
                    <span className="text-left leading-tight">
                      <span className="block text-[9px] font-medium">Get it on</span>
                      Google Play
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <GlassCard level={2} sheen className="p-5 shadow-[var(--shadow-md)] flex flex-col items-center gap-3">
                  <div className="size-40 rounded-2xl bg-white ring-1 ring-border p-3 flex items-center justify-center shadow-inner">
                    <div className="grid grid-cols-7 gap-1 w-full h-full">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${i % 3 === 0 ? "bg-foreground" : i % 5 === 0 ? "bg-foreground/40" : "bg-foreground/10"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <QrCode size={14} />
                    Scan to get notified
                  </div>
                  <StatusBadge variant="info" className="text-[10px]">Placeholder QR · Not active</StatusBadge>
                </GlassCard>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 13: FAQ Preview
   ============================================================ */
function FAQPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
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
        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 text-center"
        >
          <LootButton variant="glass" onClick={() => navigate("support")} rightIcon={<ArrowRight size={15} />}>
            View all FAQs
          </LootButton>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 14: Support Preview
   ============================================================ */
function SupportPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <section className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
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
            return (
              <motion.div key={s.title} variants={cardReveal} custom={i}>
                <GlassCard
                  level={2}
                  hover
                  sheen
                  glow={s.accent === "gold" || s.accent === "emerald" ? "none" : s.accent}
                  className={`p-4 sm:p-5 h-full flex flex-col gap-3 shadow-[var(--shadow-md)] ${isLiveChat ? "opacity-70" : ""}`}
                  onClick={() => !isLiveChat && navigate("support")}
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
                    {!isLiveChat && <>Open <ArrowRight size={12} /></>}
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
   Section 15: Footer
   ============================================================ */
function Footer() {
  const navigate = useNavigationStore((s) => s.navigate);
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
  return (
    <footer className="px-3 sm:px-6 lg:px-8 pb-6 pt-12 mt-auto">
      <div className="max-w-7xl mx-auto">
        <GlassCard level={3} sheen className="p-6 sm:p-8 shadow-[var(--shadow-md)] border-t-2 border-t-electric/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <Logo size="md" />
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
                      onClick={() => navigate(l.view)}
                      className="text-xs text-muted-foreground hover:text-electric transition-colors"
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
                      onClick={() => navigate(l.view)}
                      className="text-xs text-muted-foreground hover:text-electric transition-colors"
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
   Main: HomeView
   ============================================================ */
export function HomeView() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1">
        <Hero />
        <QuickActions />
        <WhatYouCanDo />
        <HowItWorks />
        <DashboardPreview />
        <WalletPreview />
        <EarnPreview />
        <ReferralPreview />
        <LeaderboardPreview />
        <AchievementsPreview />
        <SecurityPreview />
        <DownloadApp />
        <FAQPreview />
        <SupportPreview />
      </main>
      <Footer />
    </div>
  );
}
