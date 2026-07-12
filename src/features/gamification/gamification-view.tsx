"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Medal,
  Sparkles,
  Coins,
  RotateCcw,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  LootButton,
  IconBadge,
  AnimatedCounter,
  StatusBadge,
  EmptyState,
  SkeletonRow,
} from "@/components/lootloom";
import { useNavigationStore, useUserStore } from "@/stores";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Types
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar?: string | null;
  /** Total cash redeemed in ₹ */
  totalRedeemedInr: number;
  /** Total coins redeemed */
  coinsRedeemed: number;
  isCurrentUser?: boolean;
}

/* ============================================================
   Placeholder dataset — backend will populate via API
   ============================================================ */

const LEADERBOARD_ENTRIES: LeaderboardEntry[] = [];

/* ============================================================
   Podium metadata for the top 3
   ============================================================ */

const PODIUM_META: Record<
  1 | 2 | 3,
  {
    accent: Accent;
    ring: string;
    gradient: string;
    glow: string;
    label: string;
    icon: typeof Crown;
    height: string;
    order: string;
  }
> = {
  1: {
    accent: "gold",
    ring: "ring-gold/40",
    gradient: "bg-[linear-gradient(145deg,oklch(0.85_0.18_85_/_0.18),oklch(0.75_0.16_70_/_0.10))]",
    glow: "shadow-[0_18px_50px_-20px_oklch(0.85_0.18_85_/_0.55)]",
    label: "Gold",
    icon: Crown,
    height: "sm:mt-0",
    order: "sm:order-2",
  },
  2: {
    accent: "cyan",
    ring: "ring-cyan-brand/40",
    gradient: "bg-[linear-gradient(145deg,oklch(0.78_0.16_200_/_0.15),oklch(0.7_0.12_220_/_0.08))]",
    glow: "shadow-[0_18px_50px_-20px_oklch(0.78_0.16_200_/_0.45)]",
    label: "Silver",
    icon: Medal,
    height: "sm:mt-6",
    order: "sm:order-1",
  },
  3: {
    accent: "purple",
    ring: "ring-purple-brand/40",
    gradient: "bg-[linear-gradient(145deg,oklch(0.7_0.18_50_/_0.18),oklch(0.6_0.16_40_/_0.10))]",
    glow: "shadow-[0_18px_50px_-20px_oklch(0.7_0.18_50_/_0.45)]",
    label: "Bronze",
    icon: Medal,
    height: "sm:mt-12",
    order: "sm:order-3",
  },
};

/* ============================================================
   Avatar helper — uses image when available, initials otherwise
   ============================================================ */

function Avatar({
  username,
  avatar,
  size = "md",
  ring = "ring-border",
}: {
  username: string;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
  ring?: string;
}) {
  const sizeCls =
    size === "lg" ? "size-16 text-lg" : size === "sm" ? "size-8 text-xs" : "size-11 text-sm";
  const initials = (username || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username}
        className={cn(
          "rounded-full object-cover ring-2",
          sizeCls,
          ring
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-foreground bg-[linear-gradient(135deg,var(--electric)/15,var(--purple-brand)/15)] ring-2",
        sizeCls,
        ring
      )}
    >
      {initials || "?"}
    </div>
  );
}

/* ============================================================
   Podium (Top 3)
   ============================================================ */

function Podium({ top3 }: { top3: LeaderboardEntry[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-end">
      {([1, 2, 3] as const).map((position) => {
        const entry = top3.find((e) => e.rank === position);
        const meta = PODIUM_META[position];
        if (!entry) {
          return (
            <div
              key={position}
              className={cn("rounded-2xl glass-1 ring-1 ring-border/60 p-5 h-44 flex items-center justify-center text-xs text-muted-foreground/60", meta.order, meta.height)}
            >
              No #{position} entry
            </div>
          );
        }
        const Icon = meta.icon;
        return (
          <motion.div
            key={entry.id}
            variants={cardReveal}
            custom={position - 1}
            initial="hidden"
            animate="visible"
            className={cn(meta.order, meta.height)}
          >
            <GlassCard
              level={2}
              sheen
              glow={meta.accent === "gold" ? "none" : meta.accent === "cyan" ? "cyan" : "purple"}
              className={cn(
                "relative overflow-hidden p-5 ring-1",
                meta.gradient,
                meta.ring,
                meta.glow,
                entry.isCurrentUser && "outline outline-2 outline-electric/50"
              )}
            >
              {/* Rank badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center ring-1",
                      meta.accent === "gold" && "bg-gold/15 text-gold ring-gold/25",
                      meta.accent === "cyan" && "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
                      meta.accent === "purple" && "bg-purple/10 text-purple-brand ring-purple-brand/20"
                    )}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    #{position} · {meta.label}
                  </span>
                </div>
                {entry.isCurrentUser && (
                  <StatusBadge variant="electric" dot pulse>
                    You
                  </StatusBadge>
                )}
              </div>

              {/* Avatar + name */}
              <div className="flex flex-col items-center text-center gap-2.5">
                <Avatar
                  username={entry.username}
                  avatar={entry.avatar}
                  size="lg"
                  ring={meta.ring}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate max-w-[160px] mx-auto">
                    {entry.username}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Rank {entry.rank}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl glass-1 ring-1 ring-border/60 p-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                    Total Redeemed
                  </p>
                  <p className="text-base font-bold text-foreground tabular-nums flex items-center justify-center gap-0.5">
                    <IndianRupee size={12} />
                    <AnimatedCounter value={entry.totalRedeemedInr} decimals={2} separator />
                  </p>
                </div>
                <div className="rounded-xl glass-1 ring-1 ring-border/60 p-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                    Coins
                  </p>
                  <p className="text-base font-bold text-gold tabular-nums flex items-center justify-center gap-1">
                    <Coins size={12} />
                    <AnimatedCounter value={entry.coinsRedeemed} separator />
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ============================================================
   Leaderboard row (rank 4+)
   ============================================================ */

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" animate="visible">
      <GlassCard
        level={1}
        sheen
        hover
        className={cn(
          "p-4 ring-1 transition-all",
          entry.isCurrentUser
            ? "ring-electric/30 bg-electric/[0.03]"
            : "ring-border/50"
        )}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Rank */}
          <div className="shrink-0 w-10 text-center">
            <span
              className={cn(
                "inline-flex items-center justify-center size-8 rounded-lg text-xs font-bold ring-1",
                entry.isCurrentUser
                  ? "bg-electric/10 text-electric ring-electric/20"
                  : "bg-muted/40 text-muted-foreground ring-border"
              )}
            >
              {entry.rank}
            </span>
          </div>

          {/* Avatar */}
          <div className="shrink-0">
            <Avatar username={entry.username} avatar={entry.avatar} size="md" />
          </div>

          {/* Username */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {entry.username}
            </p>
            {entry.isCurrentUser && (
              <p className="text-[11px] text-electric font-medium">You</p>
            )}
          </div>

          {/* Coins redeemed */}
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              Coins
            </p>
            <p className="text-sm font-bold text-gold tabular-nums flex items-center gap-1">
              <Coins size={12} />
              <AnimatedCounter value={entry.coinsRedeemed} separator />
            </p>
          </div>

          {/* Total redeemed ₹ */}
          <div className="flex flex-col items-end shrink-0 min-w-[90px]">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              Redeemed
            </p>
            <p className="text-sm font-bold text-foreground tabular-nums flex items-center gap-0.5">
              <IndianRupee size={12} />
              <AnimatedCounter value={entry.totalRedeemedInr} decimals={2} separator />
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Leaderboard list (with loading / empty / list states)
   ============================================================ */

function LeaderboardList() {
  const navigate = useNavigationStore((s) => s.navigate);
  // Loading placeholder — future API integration will toggle this.
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonRow count={6} />
      </div>
    );
  }

  if (LEADERBOARD_ENTRIES.length === 0) {
    return (
      <GlassCard level={2} sheen className="py-12">
        <EmptyState
          icon="Trophy"
          title="No rankings yet"
          description="Be the first to redeem!"
          action={
            <LootButton
              variant="electric"
              size="sm"
              leftIcon={<Sparkles size={14} />}
              onClick={() => navigate("redeem")}
            >
              Redeem Now
            </LootButton>
          }
        />
      </GlassCard>
    );
  }

  const top3 = LEADERBOARD_ENTRIES.filter((e) => e.rank >= 1 && e.rank <= 3);
  const rest = LEADERBOARD_ENTRIES.filter((e) => e.rank > 3);

  return (
    <div className="space-y-5 lg:space-y-6">
      {top3.length > 0 && <Podium top3={top3} />}

      {rest.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3 max-h-[70vh] overflow-y-auto lootloom-scroll pr-1"
        >
          {rest.map((entry, i) => (
            <LeaderboardRow key={entry.id} entry={entry} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ============================================================
   Main GamificationView (Leaderboard)
   ============================================================ */

export function GamificationView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { fullName } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Placeholder delay — real refresh will trigger an API fetch (GET /api/leaderboard)
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Leaderboard"
        description="Top earners on LootLoom"
        actions={
          <>
            <LootButton
              variant="outline"
              size="md"
              leftIcon={<ChevronRight size={15} />}
              onClick={() => navigate("history")}
            >
              <span className="hidden sm:inline">History</span>
            </LootButton>
            <LootButton
              variant="electric"
              size="md"
              loading={refreshing}
              leftIcon={!refreshing ? <RotateCcw size={15} /> : undefined}
              onClick={handleRefresh}
            >
              {refreshing ? "Syncing…" : "Refresh"}
            </LootButton>
          </>
        }
      />

      {/* Current user banner */}
      <motion.div
        variants={cardReveal}
        custom={0}
        initial="hidden"
        animate="visible"
        className="mb-5"
      >
        <GlassCard level={2} sheen glow="electric" className="p-4 sm:p-5 ring-1 ring-electric/15">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="shrink-0">
              <IconBadge name="Trophy" accent="gold" size="lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Your Standing
              </p>
              <p className="text-sm sm:text-base font-bold text-foreground truncate">
                {fullName || "Welcome back"}
              </p>
              <p className="text-xs text-muted-foreground">
                Rank will appear here once you have redemption activity.
              </p>
            </div>
            <LootButton
              variant="glass"
              size="sm"
              leftIcon={<Sparkles size={14} />}
              onClick={() => navigate("redeem")}
              className="hidden sm:inline-flex"
            >
              Redeem
            </LootButton>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-5 lg:space-y-6"
      >
        <LeaderboardList />
      </motion.div>
    </PageContainer>
  );
}
