"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Gift,
  ShoppingBag,
  Smartphone,
  Gamepad2,
  Wallet,
  Crown,
  Star,
  Clock,
  Check,
  Lock,
  Sparkles,
  ArrowRight,
  Receipt,
  Headphones,
  MessageCircle,
  Ticket,
  ShieldCheck,
  Search,
  Download,
  Filter,
  MousePointerClick,
  UserCog,
  PartyPopper,
  BadgePercent,
  Coins,
  IndianRupee,
  Info,
  Mail,
  BadgeCheck,
  ScanFace,
  Cpu,
  TrendingUp,
  History,
  ChevronRight,
  Zap,
  Trophy,
  Flame,
} from "lucide-react";

import {
  GlassCard,
  LootButton,
  IconBadge,
  AnimatedCounter,
  ProgressRing,
  StatusBadge,
  WidgetCard,
  PageContainer,
  PageHeader,
  SectionHeader,
  SkeletonRow,
} from "@/components/lootloom";
import { useNavigationStore, useWalletStore } from "@/stores";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

/* ============================================================
   Types
   ============================================================ */
type Availability = "available" | "limited" | "soldout" | "soon";
type Featured = "recommended" | "popular" | "best-value" | "limited-time";

interface RewardCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  gradient: string;
  description: string;
  requiredCoins: number;
  processingTime: string;
  availability: Availability;
  popularity: number;
}

interface FeaturedReward {
  id: string;
  name: string;
  icon: LucideIcon;
  gradient: string;
  tagline: string;
  description: string;
  requiredCoins: number;
  processingTime: string;
  availability: Availability;
  featured: Featured;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose";
}

interface RedeemStep {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose";
}

/* ============================================================
   Placeholder Data
   ============================================================ */

const REWARD_CATEGORIES: RewardCategory[] = [
  {
    id: "upi-cash",
    name: "UPI Cash",
    icon: Wallet,
    gradient: "linear-gradient(135deg, oklch(0.62 0.22 255), oklch(0.72 0.15 200))",
    description: "Instant transfer to your UPI-linked bank account.",
    requiredCoins: 1000,
    processingTime: "Instant – 2h",
    availability: "available",
    popularity: 92,
  },
  {
    id: "gift-cards",
    name: "Gift Cards",
    icon: Gift,
    gradient: "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.7 0.2 320))",
    description: "Amazon, Flipkart, Netflix & 40+ brand gift cards.",
    requiredCoins: 1500,
    processingTime: "5 – 30 min",
    availability: "available",
    popularity: 88,
  },
  {
    id: "gaming-rewards",
    name: "Gaming Rewards",
    icon: Gamepad2,
    gradient: "linear-gradient(135deg, oklch(0.7 0.17 160), oklch(0.75 0.16 180))",
    description: "Steam, BGMI, Free Fire & game top-ups.",
    requiredCoins: 2000,
    processingTime: "10 – 60 min",
    availability: "available",
    popularity: 79,
  },
  {
    id: "digital-vouchers",
    name: "Digital Vouchers",
    icon: Ticket,
    gradient: "linear-gradient(135deg, oklch(0.8 0.16 85), oklch(0.75 0.18 60))",
    description: "Streaming, software & subscription vouchers.",
    requiredCoins: 1800,
    processingTime: "15 – 45 min",
    availability: "limited",
    popularity: 74,
  },
  {
    id: "mobile-recharge",
    name: "Mobile Recharge",
    icon: Smartphone,
    gradient: "linear-gradient(135deg, oklch(0.72 0.15 200), oklch(0.62 0.22 255))",
    description: "Prepaid recharge for all major operators.",
    requiredCoins: 800,
    processingTime: "Instant – 10 min",
    availability: "available",
    popularity: 84,
  },
  {
    id: "shopping-rewards",
    name: "Shopping Rewards",
    icon: ShoppingBag,
    gradient: "linear-gradient(135deg, oklch(0.7 0.2 320), oklch(0.6 0.22 295))",
    description: "Coupon codes & cashback for shopping platforms.",
    requiredCoins: 1200,
    processingTime: "5 – 20 min",
    availability: "available",
    popularity: 71,
  },
  {
    id: "premium-membership",
    name: "Premium Membership",
    icon: Crown,
    gradient: "linear-gradient(135deg, oklch(0.8 0.16 85), oklch(0.62 0.22 255))",
    description: "LootLoom Premium & partner memberships.",
    requiredCoins: 5000,
    processingTime: "1 – 24h",
    availability: "soon",
    popularity: 66,
  },
  {
    id: "custom-rewards",
    name: "Custom Rewards",
    icon: Sparkles,
    gradient: "linear-gradient(135deg, oklch(0.62 0.22 255), oklch(0.6 0.22 295), oklch(0.7 0.2 320))",
    description: "Request a custom reward — subject to approval.",
    requiredCoins: 3000,
    processingTime: "1 – 3 days",
    availability: "available",
    popularity: 58,
  },
];

const FEATURED_REWARDS: FeaturedReward[] = [
  {
    id: "ft-500-upi",
    name: "₹500 UPI Cash",
    icon: Wallet,
    gradient: "linear-gradient(135deg, oklch(0.62 0.22 255), oklch(0.72 0.15 200))",
    tagline: "Editor's pick — fastest payout",
    description: "Redeem 5,000 coins for an instant ₹500 UPI transfer to your verified bank account.",
    requiredCoins: 5000,
    processingTime: "Instant – 2h",
    availability: "available",
    featured: "recommended",
    accent: "electric",
  },
  {
    id: "ft-amazon-gc",
    name: "₹250 Amazon Gift Card",
    icon: Gift,
    gradient: "linear-gradient(135deg, oklch(0.8 0.16 85), oklch(0.75 0.18 60))",
    tagline: "Most redeemed this month",
    description: "A ₹250 Amazon Pay gift card delivered to your email within 30 minutes.",
    requiredCoins: 2500,
    processingTime: "5 – 30 min",
    availability: "available",
    featured: "popular",
    accent: "gold",
  },
  {
    id: "ft-netflix-3m",
    name: "Netflix 3-Month Voucher",
    icon: Ticket,
    gradient: "linear-gradient(135deg, oklch(0.7 0.17 160), oklch(0.75 0.16 180))",
    tagline: "Best value — save 20%",
    description: "Three months of Netflix Mobile+ plan. Best coin-to-value ratio on the catalog.",
    requiredCoins: 6000,
    processingTime: "15 – 45 min",
    availability: "available",
    featured: "best-value",
    accent: "emerald",
  },
  {
    id: "ft-bgmi-uc",
    name: "660 UC — BGMI Top-up",
    icon: Gamepad2,
    gradient: "linear-gradient(135deg, oklch(0.62 0.24 25), oklch(0.7 0.2 320))",
    tagline: "Limited stock — ends soon",
    description: "660 Unknown Cash for BGMI, credited directly to your game ID.",
    requiredCoins: 4200,
    processingTime: "10 – 60 min",
    availability: "limited",
    featured: "limited-time",
    accent: "rose",
  },
];

const REDEEM_STEPS: RedeemStep[] = [
  {
    id: 1,
    title: "Select Reward",
    description: "Browse the catalog and pick the reward that fits your coin balance.",
    icon: MousePointerClick,
    accent: "electric",
  },
  {
    id: 2,
    title: "Review Eligibility",
    description: "We verify your account, balance and KYC status before proceeding.",
    icon: ShieldCheck,
    accent: "cyan",
  },
  {
    id: 3,
    title: "Confirm Redeem",
    description: "Accept the reward terms and confirm the redemption request.",
    icon: Check,
    accent: "purple",
  },
  {
    id: 4,
    title: "Pending Review",
    description: "Your request enters the queue and is reviewed by the system.",
    icon: Clock,
    accent: "gold",
  },
  {
    id: 5,
    title: "Administrator Verification",
    description: "A moderator verifies the request and authorises the payout.",
    icon: UserCog,
    accent: "emerald",
  },
  {
    id: 6,
    title: "Reward Completed",
    description: "Your reward is delivered and the coins are debited from your wallet.",
    icon: PartyPopper,
    accent: "rose",
  },
];

const FAQ_ITEMS = [
  {
    q: "How long does a redemption take?",
    a: "Most rewards are processed within 24–72 hours. UPI cash and mobile recharges are typically instant, while custom rewards may take up to 3 business days.",
  },
  {
    q: "What is the minimum coin balance to redeem?",
    a: "The minimum redemption threshold is 1,000 coins. Each reward also lists its own required coin amount on the card.",
  },
  {
    q: "Why is my request marked 'Under Review'?",
    a: "All redemptions pass through an automated eligibility check and a manual administrator verification step to prevent fraud. This is normal and usually resolves within a few hours.",
  },
  {
    q: "Can I cancel a redeem request?",
    a: "You can cancel a request only while it is in the 'Pending Review' stage. Once administrator verification begins, the request can no longer be cancelled.",
  },
  {
    q: "What if I don't meet the eligibility criteria?",
    a: "You'll see a 'Pending' badge on the relevant eligibility item. Complete the missing verification step (email, identity, etc.) and your reward eligibility will be re-evaluated automatically.",
  },
];

const FEATURED_META: Record<Featured, { label: string; accent: string; ribbon: string }> = {
  recommended: {
    label: "Recommended",
    accent: "text-electric",
    ribbon: "from-electric to-cyan-brand",
  },
  popular: {
    label: "Most Popular",
    accent: "text-gold",
    ribbon: "from-gold to-amber-400",
  },
  "best-value": {
    label: "Best Value",
    accent: "text-emerald-brand",
    ribbon: "from-emerald-brand to-emerald-400",
  },
  "limited-time": {
    label: "Limited Time",
    accent: "text-rose-brand",
    ribbon: "from-rose-brand to-rose-400",
  },
};

const AVAILABILITY_META: Record<
  Availability,
  { label: string; variant: "success" | "warning" | "error" | "default" }
> = {
  available: { label: "Available", variant: "success" },
  limited: { label: "Limited Stock", variant: "warning" },
  soldout: { label: "Sold Out", variant: "error" },
  soon: { label: "Coming Soon", variant: "default" },
};

const COIN_TO_INR = 0.1; // 1 coin ≈ ₹0.10

/* ============================================================
   Helper components
   ============================================================ */

function availabilityLabel(a: Availability) {
  return AVAILABILITY_META[a].label;
}
function availabilityVariant(a: Availability) {
  return AVAILABILITY_META[a].variant;
}

function MiniStat({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  accent = "electric",
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  accent?: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose";
}) {
  return (
    <div className="glass-1 rounded-xl p-3.5 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className={cn(
            accent === "electric" && "text-electric",
            accent === "cyan" && "text-cyan-brand",
            accent === "purple" && "text-purple-brand",
            accent === "gold" && "text-gold",
            accent === "emerald" && "text-emerald-brand",
            accent === "rose" && "text-rose-brand"
          )}
        />
        <span className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <AnimatedCounter
        value={value}
        prefix={prefix}
        suffix={suffix}
        className="text-lg font-bold text-foreground"
      />
    </div>
  );
}

function SkeletonField({ label, width = "w-24" }: { label: string; width?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
        {label}
      </span>
      <div className={cn("h-3.5 rounded shimmer", width)} />
    </div>
  );
}

/* ============================================================
   Section: Rewards Overview (Hero)
   ============================================================ */

function RewardsOverview({ isRedeem }: { isRedeem: boolean }) {
  const { availableCoins, pendingCoins, lifetimeEarned, lifetimeRedeemed } = useWalletStore();
  const pendingRequests = 2;
  const completedRedeems = 32;
  const estimatedValue = Math.round(availableCoins * COIN_TO_INR);
  const eligibilityPct = Math.min(100, Math.round((availableCoins / 1000) * 100));

  return (
    <motion.div variants={cardReveal} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
      <GlassCard level={3} sheen glow="electric" className="p-6 lg:p-8 relative overflow-hidden">
        {/* decorative aurora blobs */}
        <div className="absolute -top-16 -right-16 size-64 rounded-full bg-electric/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 size-72 rounded-full bg-purple-brand/10 blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left: balance + ring */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <IconBadge name="Sparkles" accent="electric" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {isRedeem ? "Redeem Center" : "Rewards Overview"}
                  </p>
                  <h2 className="text-base font-bold text-foreground">Your coin wallet</h2>
                </div>
              </div>
              <StatusBadge variant="success" dot pulse>
                Eligible
              </StatusBadge>
            </div>

            <div className="flex items-center gap-5">
              <ProgressRing value={eligibilityPct} size={116} strokeWidth={11} gradient="electric" label={`${eligibilityPct}%`} />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Current Coin Balance</p>
                <AnimatedCounter
                  value={availableCoins}
                  className="text-4xl font-bold text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  ≈ <span className="font-semibold text-emerald-brand">₹{estimatedValue.toLocaleString("en-IN")}</span> estimated value
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <LootButton
                size="sm"
                variant="electric"
                leftIcon={<ArrowRight size={14} className="rotate-90" />}
                onClick={() => useNavigationStore.getState().navigate("earn")}
              >
                Earn more coins
              </LootButton>
              <LootButton
                size="sm"
                variant="glass"
                leftIcon={<Wallet size={14} />}
                onClick={() => useNavigationStore.getState().navigate("wallet")}
              >
                Open wallet
              </LootButton>
            </div>
          </div>

          {/* Right: stats grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MiniStat icon={Coins} label="Redeemable" value={availableCoins} accent="gold" />
            <MiniStat icon={Clock} label="Pending Requests" value={pendingRequests} accent="cyan" />
            <MiniStat icon={Check} label="Completed Redeems" value={completedRedeems} accent="emerald" />
            <MiniStat icon={Trophy} label="Lifetime Rewards" value={lifetimeEarned} accent="purple" />
            <MiniStat icon={Receipt} label="Lifetime Redeemed" value={lifetimeRedeemed} accent="electric" />
            <MiniStat icon={IndianRupee} label="Est. Value (₹)" value={estimatedValue} prefix="₹" accent="emerald" />
            <MiniStat icon={TrendingUp} label="Pending Coins" value={pendingCoins} accent="rose" />
            <MiniStat icon={BadgePercent} label="Min. Coins" value={1000} accent="gold" />
            <MiniStat icon={Zap} label="Avg. Payout (h)" value={2} suffix="h" accent="electric" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Section: Reward Categories
   ============================================================ */

function RewardCategories({
  onSelect,
}: {
  onSelect: (r: { name: string; requiredCoins: number; processingTime: string; icon: LucideIcon; gradient: string; description: string; availability: Availability }) => void;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Browse Rewards"
        description="Premium reward categories — select one to redeem"
        icon={<Gift size={18} />}
        action={
          <LootButton size="sm" variant="ghost" rightIcon={<ChevronRight size={14} />}>
            View all
          </LootButton>
        }
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
      >
        {REWARD_CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const av = AVAILABILITY_META[cat.availability];
          return (
            <motion.div
              key={cat.id}
              variants={cardReveal}
              custom={i}
              style={{ perspective: 1000 }}
              className="h-full"
            >
              <GlassCard
                level={2}
                sheen
                glow="electric"
                className="h-full p-5 flex flex-col gap-4"
                whileHover={{ rotateX: 5, rotateY: -5, y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                {/* image placeholder */}
                <div
                  className="size-[120px] rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0"
                  style={{ background: cat.gradient }}
                >
                  <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <Icon className="text-white drop-shadow-lg" size={48} strokeWidth={1.8} />
                  </motion.div>
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-foreground ring-1 ring-white/40">
                    <Flame size={10} className="text-rose-brand" />
                    {cat.popularity}%
                  </span>
                </div>

                {/* name + desc */}
                <div>
                  <h3 className="font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                </div>

                {/* coins + processing */}
                <div className="flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-1.5">
                    <Coins size={14} className="text-gold" />
                    <span className="font-bold text-foreground">
                      {cat.requiredCoins.toLocaleString("en-IN")}
                    </span>
                    <span className="text-muted-foreground">coins</span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock size={12} />
                    {cat.processingTime}
                  </div>
                </div>

                {/* footer */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <StatusBadge variant={av.variant} dot pulse={cat.availability === "limited"}>
                    {av.label}
                  </StatusBadge>
                  <LootButton
                    size="sm"
                    variant="electric"
                    disabled={cat.availability === "soldout" || cat.availability === "soon"}
                    rightIcon={<ArrowRight size={14} />}
                    onClick={() => onSelect(cat)}
                  >
                    Redeem
                  </LootButton>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ============================================================
   Section: Featured Rewards
   ============================================================ */

function FeaturedRewards({
  onSelect,
  onPreview,
}: {
  onSelect: (r: FeaturedReward) => void;
  onPreview: (r: FeaturedReward) => void;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Featured"
        description="Hand-picked rewards with the best value and fastest payouts"
        icon={<Star size={18} />}
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5"
      >
        {FEATURED_REWARDS.map((r, i) => {
          const Icon = r.icon;
          const meta = FEATURED_META[r.featured];
          const av = AVAILABILITY_META[r.availability];
          return (
            <motion.div key={r.id} variants={cardReveal} custom={i} style={{ perspective: 1000 }} className="h-full">
              <GlassCard
                level={3}
                sheen
                glow={r.accent === "electric" ? "electric" : r.accent === "cyan" ? "cyan" : "purple"}
                className="h-full p-5 flex flex-col gap-4 relative"
                whileHover={{ rotateX: 4, rotateY: -4, y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
              >
                {/* ribbon */}
                <div className="absolute -top-2 left-5 z-10">
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white shadow-md bg-gradient-to-r",
                      meta.ribbon
                    )}
                  >
                    {meta.label}
                  </div>
                </div>

                {/* image placeholder */}
                <button
                  type="button"
                  onClick={() => onPreview(r)}
                  className="size-full h-32 rounded-2xl flex items-center justify-center relative overflow-hidden group"
                  style={{ background: r.gradient }}
                  aria-label={`Preview ${r.name}`}
                >
                  <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <Icon className="text-white drop-shadow-xl" size={56} strokeWidth={1.6} />
                  </motion.div>
                  <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                    <Info size={10} /> Details
                  </div>
                </button>

                <div>
                  <h3 className="font-bold text-foreground">{r.name}</h3>
                  <p className={cn("text-xs font-semibold mt-0.5", meta.accent)}>{r.tagline}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{r.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-1.5">
                    <Coins size={14} className="text-gold" />
                    <span className="font-bold text-foreground">
                      {r.requiredCoins.toLocaleString("en-IN")}
                    </span>
                    <span className="text-muted-foreground">coins</span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock size={12} />
                    {r.processingTime}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-1">
                  <StatusBadge variant={av.variant} dot pulse={r.availability === "limited"}>
                    {av.label}
                  </StatusBadge>
                  <LootButton
                    size="sm"
                    variant={r.accent === "gold" ? "gold" : r.accent === "emerald" ? "emerald" : r.accent === "rose" ? "destructive" : r.accent === "purple" ? "purple" : "electric"}
                    rightIcon={<ArrowRight size={14} />}
                    onClick={() => onSelect(r)}
                  >
                    Redeem
                  </LootButton>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ============================================================
   Section: Redeem Workflow
   ============================================================ */

function RedeemWorkflow() {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="How Redeeming Works"
        description="A transparent, six-step journey from selection to delivery"
        icon={<Receipt size={18} />}
      />
      <WidgetCard level={2} glow="electric">
        {/* Desktop horizontal timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* connector line */}
            <div className="absolute top-7 left-7 right-7 h-0.5 bg-gradient-to-r from-electric via-purple-brand to-rose-brand opacity-30" />
            <div className="grid grid-cols-6 gap-3 relative">
              {REDEEM_STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.id}
                    variants={cardReveal}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-30px" }}
                    className="flex flex-col items-center text-center gap-3"
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          "size-14 rounded-2xl glass-3 ring-1 flex items-center justify-center shadow-md",
                          s.accent === "electric" && "ring-electric/30",
                          s.accent === "cyan" && "ring-cyan-brand/30",
                          s.accent === "purple" && "ring-purple-brand/30",
                          s.accent === "gold" && "ring-gold/30",
                          s.accent === "emerald" && "ring-emerald-brand/30",
                          s.accent === "rose" && "ring-rose-brand/30"
                        )}
                      >
                        <Icon
                          size={22}
                          className={cn(
                            s.accent === "electric" && "text-electric",
                            s.accent === "cyan" && "text-cyan-brand",
                            s.accent === "purple" && "text-purple-brand",
                            s.accent === "gold" && "text-gold",
                            s.accent === "emerald" && "text-emerald-brand",
                            s.accent === "rose" && "text-rose-brand"
                          )}
                        />
                      </div>
                      <span className="absolute -top-2 -right-2 size-6 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center justify-center ring-2 ring-background">
                        {s.id}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{s.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="lg:hidden space-y-4">
          {REDEEM_STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.id}
                variants={cardReveal}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                className="flex items-start gap-4 relative"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "size-12 rounded-2xl glass-3 ring-1 flex items-center justify-center shadow-sm shrink-0",
                      s.accent === "electric" && "ring-electric/30",
                      s.accent === "cyan" && "ring-cyan-brand/30",
                      s.accent === "purple" && "ring-purple-brand/30",
                      s.accent === "gold" && "ring-gold/30",
                      s.accent === "emerald" && "ring-emerald-brand/30",
                      s.accent === "rose" && "ring-rose-brand/30"
                    )}
                  >
                    <Icon
                      size={20}
                      className={cn(
                        s.accent === "electric" && "text-electric",
                        s.accent === "cyan" && "text-cyan-brand",
                        s.accent === "purple" && "text-purple-brand",
                        s.accent === "gold" && "text-gold",
                        s.accent === "emerald" && "text-emerald-brand",
                        s.accent === "rose" && "text-rose-brand"
                      )}
                    />
                  </div>
                  {i < REDEEM_STEPS.length - 1 && (
                    <div className="w-0.5 flex-1 mt-2 mb-2 bg-gradient-to-b from-electric/40 to-purple-brand/30 min-h-8" />
                  )}
                </div>
                <div className="flex-1 pt-1 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                      {s.id}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </WidgetCard>
    </section>
  );
}

/* ============================================================
   Section: Reward Details Panel
   ============================================================ */

interface SelectedReward {
  name: string;
  requiredCoins: number;
  processingTime: string;
  icon: LucideIcon;
  gradient: string;
  description: string;
  availability: Availability;
}

function RewardDetailsPanel({
  reward,
  onRedeem,
}: {
  reward: SelectedReward;
  onRedeem: () => void;
}) {
  const Icon = reward.icon;
  const av = AVAILABILITY_META[reward.availability];
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Reward Details"
        description="Full breakdown of the selected reward"
        icon={<Info size={18} />}
      />
      <WidgetCard level={2} glow="cyan">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* preview image placeholder */}
          <div className="md:col-span-5">
            <div
              className="aspect-square w-full rounded-2xl flex items-center justify-center relative overflow-hidden ring-1 ring-white/20"
              style={{ background: reward.gradient }}
            >
              <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <Icon className="text-white drop-shadow-2xl" size={96} strokeWidth={1.4} />
              </motion.div>
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-foreground">
                <Sparkles size={12} className="text-electric" />
                Preview
              </div>
            </div>
          </div>

          {/* details */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">{reward.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
              </div>
              <StatusBadge variant={av.variant} dot>
                {av.label}
              </StatusBadge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-1 rounded-xl p-3.5">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                  Required Coins
                </p>
                <p className="text-xl font-bold text-foreground mt-1 inline-flex items-center gap-1.5">
                  <Coins size={16} className="text-gold" />
                  {reward.requiredCoins.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="glass-1 rounded-xl p-3.5">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                  Processing Time
                </p>
                <p className="text-xl font-bold text-foreground mt-1 inline-flex items-center gap-1.5">
                  <Clock size={16} className="text-electric" />
                  {reward.processingTime}
                </p>
              </div>
            </div>

            {/* eligibility placeholder */}
            <div className="glass-1 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-brand" /> Eligibility
                </span>
                <StatusBadge variant="success" dot>Eligible</StatusBadge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-brand" /> Coin balance
                </span>
                <span className="font-semibold text-foreground">Sufficient</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-brand" /> Account verified
                </span>
                <span className="font-semibold text-foreground">Verified</span>
              </div>
            </div>

            {/* future terms + instructions */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="inline-flex items-start gap-1.5">
                <Info size={12} className="text-electric mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">Terms:</span> Reward terms & conditions
                  will be displayed here in a future update. Redemption is non-reversible once administrator
                  verification begins.
                </span>
              </p>
              <p className="inline-flex items-start gap-1.5">
                <Info size={12} className="text-electric mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">Instructions:</span> Delivery instructions
                  (e.g. UPI ID, game UID, email) will be collected during the confirmation step.
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-auto">
              <LootButton variant="electric" onClick={onRedeem} rightIcon={<ArrowRight size={14} />}>
                Redeem this reward
              </LootButton>
              <LootButton variant="glass" leftIcon={<History size={14} />} onClick={() => useNavigationStore.getState().navigate("history")}>
                Redeem history
              </LootButton>
            </div>
          </div>
        </div>
      </WidgetCard>
    </section>
  );
}

/* ============================================================
   Section: Pending Redeem Requests (skeleton style)
   ============================================================ */

function PendingRedeemRequests() {
  const placeholders = [
    { id: "RR-2401", status: "Pending" as const, accent: "gold" as const },
    { id: "RR-2402", status: "Reviewing" as const, accent: "electric" as const },
    { id: "RR-2403", status: "Pending" as const, accent: "gold" as const },
  ];
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Pending Redeem Requests"
        description="Requests currently in the review queue"
        icon={<Clock size={18} />}
      />
      <WidgetCard level={2}>
        <div className="space-y-3">
          {placeholders.map((p, i) => (
            <motion.div
              key={p.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
            >
              <GlassCard level={1} className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl shimmer" />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-foreground">{p.id}</span>
                    <div className="h-2.5 w-20 rounded shimmer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <SkeletonField label="Reward" width="w-20" />
                  <SkeletonField label="Requested" width="w-16" />
                  <SkeletonField label="Coins Used" width="w-14" />
                  <SkeletonField label="Est. Completion" width="w-18" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                    Status
                  </span>
                  <StatusBadge variant={p.status === "Reviewing" ? "info" : "warning"} dot pulse>
                    {p.status}
                  </StatusBadge>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                    Administrator Notes
                  </span>
                  <div className="h-3.5 w-full rounded shimmer" />
                  <div className="h-3.5 w-2/3 rounded shimmer" />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <Info size={12} className="text-electric" />
            Live request data will appear here once backend redemption is enabled.
          </p>
          <LootButton
            size="sm"
            variant="ghost"
            rightIcon={<ChevronRight size={14} />}
            onClick={() => useNavigationStore.getState().navigate("history")}
          >
            View full history
          </LootButton>
        </div>
      </WidgetCard>
    </section>
  );
}

/* ============================================================
   Section: Redeem History (table + SkeletonRow)
   ============================================================ */

const HISTORY_COLUMNS = [
  "Redeem ID",
  "Reward",
  "Coins",
  "Status",
  "Requested Date",
  "Completed Date",
  "View Details",
];

function RedeemHistory() {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Redeem History"
        description="A complete log of every redemption request"
        icon={<History size={18} />}
        action={
          <div className="flex items-center gap-2">
            <LootButton size="sm" variant="glass" leftIcon={<Search size={14} />}>
              <span className="hidden sm:inline">Search</span>
            </LootButton>
            <LootButton size="sm" variant="glass" leftIcon={<Filter size={14} />}>
              <span className="hidden sm:inline">Filter</span>
            </LootButton>
            <LootButton size="sm" variant="glass" leftIcon={<Download size={14} />}>
              <span className="hidden sm:inline">Export</span>
            </LootButton>
          </div>
        }
      />
      <WidgetCard level={2}>
        {/* header row */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground border-b border-border">
          <span className="col-span-2">{HISTORY_COLUMNS[0]}</span>
          <span className="col-span-3">{HISTORY_COLUMNS[1]}</span>
          <span className="col-span-1">{HISTORY_COLUMNS[2]}</span>
          <span className="col-span-2">{HISTORY_COLUMNS[3]}</span>
          <span className="col-span-2">{HISTORY_COLUMNS[4]}</span>
          <span className="col-span-1">{HISTORY_COLUMNS[5]}</span>
          <span className="col-span-1 text-right">{HISTORY_COLUMNS[6]}</span>
        </div>
        <div className="pt-3">
          <SkeletonRow count={5} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <Info size={12} className="text-electric" />
            Historical redemptions load here once backend sync is connected.
          </p>
          <LootButton size="sm" variant="ghost" rightIcon={<ChevronRight size={14} />}>
            Load more
          </LootButton>
        </div>
      </WidgetCard>
    </section>
  );
}

/* ============================================================
   Section: Reward Eligibility
   ============================================================ */

interface EligibilityItem {
  label: string;
  icon: LucideIcon;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose";
  status: "met" | "pending";
  hint: string;
  locked?: boolean;
}

const ELIGIBILITY_ITEMS: EligibilityItem[] = [
  {
    label: "Minimum Coins (1,000)",
    icon: Coins,
    accent: "gold",
    status: "met",
    hint: "You hold more than the minimum coin balance required to redeem.",
  },
  {
    label: "Account Verification",
    icon: BadgeCheck,
    accent: "emerald",
    status: "met",
    hint: "Your LootLoom account is fully verified.",
  },
  {
    label: "Email Verification",
    icon: Mail,
    accent: "electric",
    status: "pending",
    hint: "Future: confirm a verified email address for reward delivery.",
    locked: true,
  },
  {
    label: "Identity Verification (KYC)",
    icon: ScanFace,
    accent: "purple",
    status: "pending",
    hint: "Future: complete KYC to unlock high-value redemptions.",
    locked: true,
  },
  {
    label: "Security Check",
    icon: ShieldCheck,
    accent: "cyan",
    status: "pending",
    hint: "Future: 2FA + device security posture validation.",
    locked: true,
  },
  {
    label: "Device Validation",
    icon: Cpu,
    accent: "rose",
    status: "pending",
    hint: "Future: validate redeem request originates from a trusted device.",
    locked: true,
  },
];

function RewardEligibility() {
  const metCount = ELIGIBILITY_ITEMS.filter((i) => i.status === "met").length;
  const eligibilityPct = Math.round((metCount / ELIGIBILITY_ITEMS.length) * 100);
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Reward Eligibility"
        description="Criteria evaluated before a redeem request is approved"
        icon={<ShieldCheck size={18} />}
      />
      <WidgetCard level={2}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 p-4 glass-1 rounded-xl">
          <ProgressRing value={eligibilityPct} size={88} strokeWidth={9} gradient="emerald" label={`${eligibilityPct}%`} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {metCount} of {ELIGIBILITY_ITEMS.length} criteria met
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete the remaining future verification steps to unlock higher-value rewards and faster
              payouts.
            </p>
          </div>
          <StatusBadge variant={metCount >= 2 ? "success" : "warning"} dot pulse>
            {metCount >= 2 ? "Partially Eligible" : "Action Required"}
          </StatusBadge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ELIGIBILITY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            const accentClasses = cn(
              item.accent === "electric" && "bg-electric/10 text-electric ring-electric/20",
              item.accent === "cyan" && "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
              item.accent === "purple" && "bg-purple/10 text-purple-brand ring-purple-brand/20",
              item.accent === "gold" && "bg-gold/15 text-gold ring-gold/25",
              item.accent === "emerald" && "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
              item.accent === "rose" && "bg-rose-brand/10 text-rose-brand ring-rose-brand/20"
            );
            return (
              <motion.div
                key={item.label}
                variants={cardReveal}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                className="glass-1 rounded-xl p-4 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "size-8 rounded-xl ring-1 flex items-center justify-center shrink-0",
                        accentClasses
                      )}
                    >
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {item.label}
                      </p>
                      {item.locked && (
                        <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                          <Lock size={9} /> Future
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge variant={item.status === "met" ? "success" : "warning"} dot>
                    {item.status === "met" ? "Met" : "Pending"}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.hint}</p>
              </motion.div>
            );
          })}
        </div>
      </WidgetCard>
    </section>
  );
}

/* ============================================================
   Section: Reward Recommendations
   ============================================================ */

interface Recommendation {
  id: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  requiredCoins: number;
  reason: string;
  reasonLabel: string;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose";
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-balance",
    title: "₹500 UPI Cash",
    icon: Wallet,
    gradient: "linear-gradient(135deg, oklch(0.62 0.22 255), oklch(0.72 0.15 200))",
    requiredCoins: 5000,
    reason: "You currently hold enough coins to redeem this instantly.",
    reasonLabel: "Based on balance",
    accent: "electric",
  },
  {
    id: "rec-history",
    title: "₹250 Amazon Gift Card",
    icon: Gift,
    gradient: "linear-gradient(135deg, oklch(0.8 0.16 85), oklch(0.75 0.18 60))",
    requiredCoins: 2500,
    reason: "You've redeemed Amazon gift cards 3× before — redemption is familiar and fast.",
    reasonLabel: "Based on history",
    accent: "gold",
  },
  {
    id: "rec-achievements",
    title: "LootLoom Premium (1 mo)",
    icon: Crown,
    gradient: "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.7 0.2 320))",
    requiredCoins: 5000,
    reason: "You unlocked the 'Loyal Earner' achievement — premium memberships pair perfectly.",
    reasonLabel: "Based on achievements",
    accent: "purple",
  },
];

function RewardRecommendations({
  onSelect,
}: {
  onSelect: (r: Recommendation) => void;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Reward Recommendations"
        description="Personalised suggestions from the recommendation engine"
        icon={<Sparkles size={18} />}
      />
      <WidgetCard level={2} glow="purple">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {RECOMMENDATIONS.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.id} variants={cardReveal} custom={i}>
                <GlassCard
                  level={1}
                  sheen
                  className="p-4 flex flex-col gap-3 h-full"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="size-14 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
                      style={{ background: r.gradient }}
                    >
                      <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
                      <Icon className="text-white" size={24} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground leading-tight">{r.title}</h4>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wide mt-1 inline-block",
                          r.accent === "electric" && "text-electric",
                          r.accent === "gold" && "text-gold",
                          r.accent === "purple" && "text-purple-brand"
                        )}
                      >
                        {r.reasonLabel}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.reason}</p>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-xs font-bold text-foreground inline-flex items-center gap-1.5">
                      <Coins size={13} className="text-gold" />
                      {r.requiredCoins.toLocaleString("en-IN")}
                    </span>
                    <LootButton
                      size="sm"
                      variant="ghost"
                      rightIcon={<ArrowRight size={13} />}
                      onClick={() => onSelect(r)}
                    >
                      View
                    </LootButton>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </WidgetCard>
    </section>
  );
}

/* ============================================================
   Section: Reward FAQ Preview
   ============================================================ */

function RewardFAQPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Redeem FAQ"
        description="Quick answers to the most common redemption questions"
        icon={<Info size={18} />}
      />
      <WidgetCard level={2}>
        <Accordion type="single" collapsible className="w-full" defaultValue="faq-0">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-4 flex justify-end">
          <LootButton
            size="sm"
            variant="glass"
            rightIcon={<ArrowRight size={14} />}
            onClick={() => navigate("support")}
          >
            View full FAQ
          </LootButton>
        </div>
      </WidgetCard>
    </section>
  );
}

/* ============================================================
   Section: Support Preview
   ============================================================ */

function SupportPreview() {
  const navigate = useNavigationStore((s) => s.navigate);
  const items = [
    {
      label: "Redeem Support",
      description: "Get help with a stuck or delayed redemption request.",
      icon: Headphones,
      accent: "electric" as const,
      locked: false,
      cta: "Open ticket",
      onClick: () => navigate("support"),
    },
    {
      label: "Live Chat",
      description: "Future: chat with a redemption specialist in real time.",
      icon: MessageCircle,
      accent: "cyan" as const,
      locked: true,
      cta: "Coming soon",
      onClick: () => {},
    },
    {
      label: "Ticket System",
      description: "Track and manage your existing support tickets.",
      icon: Ticket,
      accent: "purple" as const,
      locked: false,
      cta: "Open tickets",
      onClick: () => navigate("support"),
    },
    {
      label: "Contact Support",
      description: "Email the rewards team directly with your query.",
      icon: Mail,
      accent: "gold" as const,
      locked: false,
      cta: "Contact",
      onClick: () => navigate("support"),
    },
  ];
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Redeem Support"
        description="Stuck on a redemption? We're here to help"
        icon={<Headphones size={18} />}
      />
      <WidgetCard level={2}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {items.map((it, i) => {
            const Icon = it.icon;
            const accentClasses = cn(
              it.accent === "electric" && "bg-electric/10 text-electric ring-electric/20",
              it.accent === "cyan" && "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
              it.accent === "purple" && "bg-purple/10 text-purple-brand ring-purple-brand/20",
              it.accent === "gold" && "bg-gold/15 text-gold ring-gold/25",
              it.accent === "emerald" && "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
              it.accent === "rose" && "bg-rose-brand/10 text-rose-brand ring-rose-brand/20"
            );
            return (
              <motion.div key={it.label} variants={cardReveal} custom={i}>
                <GlassCard
                  level={1}
                  className="p-4 flex items-start gap-3 h-full"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                >
                  <div
                    className={cn(
                      "size-10 rounded-xl ring-1 flex items-center justify-center shrink-0",
                      accentClasses
                    )}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{it.label}</h4>
                      {it.locked && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          <Lock size={9} /> Future
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{it.description}</p>
                    <div className="mt-3">
                      <LootButton
                        size="sm"
                        variant={it.locked ? "outline" : "glass"}
                        disabled={it.locked}
                        rightIcon={it.locked ? <Lock size={12} /> : <ArrowRight size={12} />}
                        onClick={it.onClick}
                      >
                        {it.cta}
                      </LootButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </WidgetCard>
    </section>
  );
}

/* ============================================================
   Section: Redeem Confirmation Dialog
   ============================================================ */

function RedeemConfirmationDialog({
  open,
  onOpenChange,
  reward,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reward: SelectedReward | null;
}) {
  const { availableCoins } = useWalletStore();
  const { toast } = useToast();
  const [accepted, setAccepted] = useState(false);

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) setAccepted(false);
  };

  const handleSubmit = () => {
    handleOpenChange(false);
    toast({
      title: "Redeem request prepared (demo)",
      description: reward
        ? `${reward.name} queued for review. No coins were debited.`
        : "Your redeem request was prepared for review (demo).",
    });
  };

  if (!reward) return null;
  const Icon = reward.icon;
  const sufficient = availableCoins >= reward.requiredCoins;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
              style={{ background: reward.gradient }}
            >
              <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
              <Icon className="text-white" size={22} />
            </div>
            <div>
              <DialogTitle className="text-base">Confirm Redemption</DialogTitle>
              <DialogDescription className="text-xs">
                Review the details before submitting your request.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          {/* selected reward */}
          <div className="glass-1 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                Selected Reward
              </p>
              <p className="text-sm font-bold text-foreground">{reward.name}</p>
            </div>
            <StatusBadge variant={availabilityVariant(reward.availability)} dot>
              {availabilityLabel(reward.availability)}
            </StatusBadge>
          </div>

          {/* coins + balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-1 rounded-xl p-3.5">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                Required Coins
              </p>
              <p className="text-lg font-bold text-foreground inline-flex items-center gap-1.5 mt-1">
                <Coins size={14} className="text-gold" />
                {reward.requiredCoins.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="glass-1 rounded-xl p-3.5">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                Current Balance
              </p>
              <p className="text-lg font-bold text-foreground inline-flex items-center gap-1.5 mt-1">
                <Wallet size={14} className="text-electric" />
                {availableCoins.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* confirmation message */}
          <div
            className={cn(
              "rounded-xl p-3.5 ring-1 text-xs leading-relaxed",
              sufficient
                ? "bg-emerald-brand/8 text-emerald-brand ring-emerald-brand/20"
                : "bg-rose-brand/8 text-rose-brand ring-rose-brand/20"
            )}
          >
            {sufficient ? (
              <span className="inline-flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0" />
                You have sufficient coins. After confirmation, your request enters the review queue and
                coins will be held until administrator verification completes.
              </span>
            ) : (
              <span className="inline-flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                Insufficient coin balance for this reward. Earn{" "}
                {(reward.requiredCoins - availableCoins).toLocaleString("en-IN")} more coins to unlock it.
              </span>
            )}
          </div>

          {/* future terms acceptance */}
          <label
            htmlFor="redeem-terms"
            className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl hover:bg-accent/40 transition-colors"
          >
            <Checkbox
              id="redeem-terms"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
              className="mt-0.5"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Future:</span> I accept the reward terms &
              conditions, confirm the provided delivery details are accurate, and understand redemption is
              non-reversible once administrator verification begins.
            </span>
          </label>
        </div>

        <DialogFooter className="gap-2">
          <LootButton variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </LootButton>
          <LootButton
            variant="electric"
            disabled={!accepted || !sufficient}
            leftIcon={<Check size={14} />}
            onClick={handleSubmit}
          >
            Submit Redeem
          </LootButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Main View
   ============================================================ */

export function RewardsView() {
  const current = useNavigationStore((s) => s.current);
  const isRedeem = current === "redeem";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedReward>(() => {
    const f = FEATURED_REWARDS[0];
    return {
      name: f.name,
      requiredCoins: f.requiredCoins,
      processingTime: f.processingTime,
      icon: f.icon,
      gradient: f.gradient,
      description: f.description,
      availability: f.availability,
    };
  });

  const openRedeem = (r: SelectedReward) => {
    setSelected(r);
    setDialogOpen(true);
  };

  const openRedeemCategory = (c: RewardCategory) =>
    openRedeem({
      name: c.name,
      requiredCoins: c.requiredCoins,
      processingTime: c.processingTime,
      icon: c.icon,
      gradient: c.gradient,
      description: c.description,
      availability: c.availability,
    });

  const openRedeemFeatured = (f: FeaturedReward) =>
    openRedeem({
      name: f.name,
      requiredCoins: f.requiredCoins,
      processingTime: f.processingTime,
      icon: f.icon,
      gradient: f.gradient,
      description: f.description,
      availability: f.availability,
    });

  const openRedeemRecommendation = (r: Recommendation) =>
    openRedeem({
      name: r.title,
      requiredCoins: r.requiredCoins,
      processingTime: "Varies",
      icon: r.icon,
      gradient: r.gradient,
      description: r.reason,
      availability: "available",
    });

  const previewFeatured = (f: FeaturedReward) =>
    setSelected({
      name: f.name,
      requiredCoins: f.requiredCoins,
      processingTime: f.processingTime,
      icon: f.icon,
      gradient: f.gradient,
      description: f.description,
      availability: f.availability,
    });

  const title = isRedeem ? "Redeem" : "Rewards";
  const description = isRedeem
    ? "Convert your earned coins into real-world rewards. Review the workflow, pick a reward and submit a redeem request."
    : "Browse the premium reward catalog, track pending requests and convert your coins into real value.";

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex items-center gap-2">
            <LootButton
              size="sm"
              variant="glass"
              leftIcon={<Wallet size={14} />}
              onClick={() => useNavigationStore.getState().navigate("wallet")}
            >
              Wallet
            </LootButton>
            <LootButton
              size="sm"
              variant="electric"
              leftIcon={<History size={14} />}
              onClick={() => useNavigationStore.getState().navigate("history")}
            >
              History
            </LootButton>
          </div>
        }
      />

      <div className="space-y-8 lg:space-y-10">
        {isRedeem && <RedeemWorkflow />}
        <RewardsOverview isRedeem={isRedeem} />
        <RewardCategories onSelect={openRedeemCategory} />
        <FeaturedRewards onSelect={openRedeemFeatured} onPreview={previewFeatured} />
        {!isRedeem && <RedeemWorkflow />}
        <RewardDetailsPanel reward={selected} onRedeem={() => openRedeem(selected)} />
        <PendingRedeemRequests />
        <RedeemHistory />
        <RewardEligibility />
        <RewardRecommendations onSelect={openRedeemRecommendation} />
        <RewardFAQPreview />
        <SupportPreview />
      </div>

      <RedeemConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reward={selected}
      />
    </PageContainer>
  );
}
