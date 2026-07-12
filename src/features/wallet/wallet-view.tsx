"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Coins,
  TrendingUp,
  ArrowLeftRight,
  Sparkles,
  ChevronRight,
  Zap,
  Gift,
  History,
  Filter,
  Search,
  Download,
  Banknote,
  PlayCircle,
  Hash,
} from "lucide-react";

import {
  PageContainer,
  PageHeader,
  GlassCard,
  LootButton,
  IconBadge,
  AnimatedCounter,
  StatusBadge,
  WidgetCard,
  StatCard,
  EmptyState,
  SkeletonCard,
  SkeletonRow,
} from "@/components/lootloom";
import { useNavigationStore, useWalletStore } from "@/stores";
import type { TransactionItem } from "@/types";
import { cardReveal, staggerContainer, hoverLift, floating } from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Shared helpers
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

/** A small glass tile used inside the overview hero. */
function MiniStatTile({
  label,
  value,
  prefix,
  suffix,
  decimals,
  icon,
  accent,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: string;
  accent: Accent;
}) {
  return (
    <GlassCard level={1} hover sheen className="p-4 flex items-center gap-3">
      <IconBadge name={icon} accent={accent} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium truncate">
          {label}
        </p>
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="text-lg font-bold text-foreground"
        />
      </div>
    </GlassCard>
  );
}

/* ============================================================
   1. Wallet Overview Hero
   ============================================================ */

function WalletOverview({ loading }: { loading: boolean }) {
  const { availableCoins, lifetimeEarned } = useWalletStore();

  if (loading) {
    return (
      <motion.div variants={cardReveal} initial="hidden" animate="visible" custom={0}>
        <SkeletonCard className="h-32" />
      </motion.div>
    );
  }

  const estimatedValue = availableCoins / 100; // 100 coins = ₹1 placeholder
  const redeemableBalance = availableCoins; // coins available for redemption

  return (
    <motion.div variants={cardReveal} initial="hidden" animate="visible" custom={0}>
      <GlassCard level={2} sheen glow="electric" className="relative overflow-hidden p-6 lg:p-8">
        {/* Animated gradient accents + floating coins */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-electric/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 size-72 rounded-full bg-purple-brand/20 blur-3xl" />
          <div className="absolute top-1/2 right-1/3 size-40 rounded-full bg-cyan-brand/15 blur-3xl" />
          {[
            { icon: Coins, x: "12%", y: "18%", d: 0, s: 22, c: "text-electric/30" },
            { icon: Coins, x: "82%", y: "70%", d: 1.2, s: 28, c: "text-purple-brand/25" },
            { icon: Coins, x: "70%", y: "20%", d: 2.1, s: 18, c: "text-cyan-brand/30" },
            { icon: Coins, x: "28%", y: "78%", d: 0.8, s: 16, c: "text-gold/30" },
          ].map((c, i) => (
            <motion.div
              key={i}
              variants={floating}
              initial="initial"
              animate="animate"
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: c.d }}
              className={cn("absolute", c.c)}
              style={{ left: c.x, top: c.y }}
            >
              <c.icon size={c.s} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Balance column */}
          <div className="lg:col-span-2 flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <IconBadge name="Wallet" accent="electric" size="lg" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Current Coin Balance
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">LootLoom Wallet</p>
                </div>
              </div>
              <StatusBadge variant="success" dot pulse>
                Wallet Active
              </StatusBadge>
            </div>

            <div>
              <div className="flex items-end gap-3 flex-wrap">
                <AnimatedCounter
                  value={availableCoins}
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand)_55%,var(--purple-brand))] bg-clip-text text-transparent"
                />
                <span className="inline-flex items-center gap-1 mb-2 text-sm font-semibold text-gold">
                  <Coins size={16} />
                  coins
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Equivalent Cash Value:{" "}
                <span className="font-bold text-foreground">
                  ₹<AnimatedCounter value={estimatedValue} decimals={2} />
                </span>{" "}
                <span className="text-[11px] text-muted-foreground/70">(100 coins = ₹1)</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <LootButton variant="electric" size="sm" leftIcon={<Zap size={14} />}>
                Quick Earn
              </LootButton>
              <LootButton variant="glass" size="sm" leftIcon={<ArrowLeftRight size={14} />}>
                Convert
              </LootButton>
              <LootButton variant="ghost" size="sm" leftIcon={<History size={14} />}>
                Activity
              </LootButton>
            </div>
          </div>

          {/* Redeemable summary column */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl glass-1 ring-1 ring-border p-5">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Redeemable Balance
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="text-2xl font-bold bg-[linear-gradient(120deg,var(--purple-brand),var(--electric))] bg-clip-text text-transparent">
                  <AnimatedCounter value={redeemableBalance} />
                </span>
                <StatusBadge variant="purple">Coins</StatusBadge>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">
                  ₹<AnimatedCounter value={estimatedValue} decimals={2} />
                </span>{" "}
                cash equivalent ready to redeem
              </p>
            </div>
          </div>
        </div>

        {/* Mini stat tiles */}
        <div className="relative z-10 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStatTile
            label="Current Balance"
            value={availableCoins}
            suffix=" coins"
            icon="Wallet"
            accent="electric"
          />
          <MiniStatTile
            label="Cash Value"
            value={estimatedValue}
            prefix="₹"
            decimals={2}
            icon="Banknote"
            accent="cyan"
          />
          <MiniStatTile
            label="Total Earned"
            value={lifetimeEarned}
            suffix=" coins"
            icon="TrendingUp"
            accent="emerald"
          />
          <MiniStatTile
            label="Redeemable Balance"
            value={redeemableBalance}
            suffix=" coins"
            icon="Gift"
            accent="purple"
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   2. Wallet Statistics (simple stat cards — API-ready)
   ============================================================ */

function WalletStatistics({ loading }: { loading: boolean }) {
  const { availableCoins, lifetimeEarned } = useWalletStore();
  // Ads watched & today's ads are placeholders — populated by future API.
  const adsWatched = 0;
  const todayAds = 0;
  const redeemableBalance = availableCoins;

  const stats: {
    label: string;
    value: number;
    suffix?: string;
    icon: string;
    accent: Accent;
  }[] = [
    {
      label: "Ads Watched",
      value: adsWatched,
      icon: "PlayCircle",
      accent: "electric",
    },
    {
      label: "Today's Ads",
      value: todayAds,
      icon: "CalendarCheck",
      accent: "cyan",
    },
    {
      label: "Total Earned",
      value: lifetimeEarned,
      suffix: " coins",
      icon: "TrendingUp",
      accent: "emerald",
    },
    {
      label: "Redeemable Balance",
      value: redeemableBalance,
      suffix: " coins",
      icon: "Gift",
      accent: "purple",
    },
  ];

  return (
    <WidgetCard
      title="Wallet Statistics"
      description="Quick snapshot of your wallet activity"
      icon={<TrendingUp size={16} />}
      level={2}
      index={1}
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              suffix={s.suffix}
              icon={s.icon}
              accent={s.accent}
              index={i}
            />
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

/* ============================================================
   Transaction Row (renders a real TransactionItem from the store)
   ============================================================ */

const TX_TYPE_COLOR: Record<TransactionItem["type"], string> = {
  credit: "text-emerald-brand",
  debit: "text-rose-brand",
  redeem: "text-purple-brand",
  bonus: "text-gold",
  referral: "text-cyan-brand",
};

const TX_STATUS_VARIANT: Record<
  TransactionItem["status"],
  "default" | "success" | "warning" | "error" | "info"
> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  processing: "info",
};

function TransactionRow({ tx }: { tx: TransactionItem }) {
  const isOutgoing = tx.type === "debit" || tx.type === "redeem";
  const typeColor = TX_TYPE_COLOR[tx.type];
  const statusVariant = TX_STATUS_VARIANT[tx.status];

  return (
    <div className="grid grid-cols-12 gap-3 items-center px-3 py-3 rounded-xl glass-1 ring-1 ring-border/60">
      <div className="col-span-2 md:col-span-2 flex items-center gap-2.5 min-w-0">
        <div className="size-9 rounded-lg bg-electric/10 ring-1 ring-electric/20 flex items-center justify-center shrink-0">
          <Hash size={14} className="text-electric" />
        </div>
        <span className="text-xs font-mono text-foreground truncate">
          #{tx.id.slice(-6)}
        </span>
      </div>
      <div className="hidden md:block col-span-2 text-xs text-muted-foreground truncate">
        {tx.date}
      </div>
      <div className="hidden md:block col-span-1">
        <StatusBadge variant="default">{tx.type}</StatusBadge>
      </div>
      <div
        className={cn(
          "col-span-3 md:col-span-2 text-sm font-bold text-right tabular-nums",
          typeColor
        )}
      >
        {isOutgoing ? "-" : "+"}
        {tx.amount.toLocaleString("en-IN")}
      </div>
      <div className="hidden md:block col-span-2">
        <StatusBadge variant={statusVariant} dot>
          {tx.status}
        </StatusBadge>
      </div>
      <div className="hidden md:block col-span-3 text-xs text-muted-foreground truncate">
        {tx.description}
      </div>
    </div>
  );
}

/* ============================================================
   3. Recent Transactions (loading / empty / content states)
   ============================================================ */

function RecentTransactions({ loading }: { loading: boolean }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const transactions = useWalletStore((s) => s.transactions);

  const columns = ["Transaction ID", "Date", "Type", "Amount", "Status", "Description"];

  return (
    <WidgetCard
      title="Recent Transactions"
      description="Transaction history will appear here once connected to backend"
      icon={<ArrowLeftRight size={16} />}
      level={2}
      index={2}
      action={
        <div className="flex items-center gap-1.5">
          <LootButton variant="ghost" size="sm" leftIcon={<Filter size={14} />}>
            <span className="hidden sm:inline">Filter</span>
          </LootButton>
          <LootButton variant="ghost" size="sm" leftIcon={<Search size={14} />}>
            <span className="hidden sm:inline">Search</span>
          </LootButton>
          <LootButton variant="ghost" size="sm" leftIcon={<Download size={14} />}>
            <span className="hidden sm:inline">Export</span>
          </LootButton>
        </div>
      }
      footer={
        <LootButton
          variant="glass"
          size="sm"
          fullWidth
          rightIcon={<ChevronRight size={14} />}
          onClick={() => navigate("history")}
        >
          View all transactions
        </LootButton>
      }
    >
      {loading ? (
        <SkeletonRow count={5} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="Receipt"
          title="No transactions yet"
          description="Your earning and redemption history will appear here."
        />
      ) : (
        <>
          {/* Column header row */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
            {columns.map((c, i) => (
              <div
                key={c}
                className={cn(
                  i === 0 && "col-span-2",
                  i === 1 && "col-span-2",
                  i === 2 && "col-span-1",
                  i === 3 && "col-span-2 text-right",
                  i === 4 && "col-span-2",
                  i === 5 && "col-span-3"
                )}
              >
                {c}
              </div>
            ))}
          </div>

          {/* Transaction rows */}
          <div className="space-y-2.5">
            {transactions.slice(0, 5).map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        </>
      )}
    </WidgetCard>
  );
}

/* ============================================================
   4. Quick Wallet Actions
   ============================================================ */

function QuickWalletActions() {
  const navigate = useNavigationStore((s) => s.navigate);

  const actions: {
    title: string;
    description: string;
    icon: string;
    accent: Accent;
    onClick: () => void;
  }[] = [
    {
      title: "Watch Ads",
      description: "Earn coins by watching ads",
      icon: "PlayCircle",
      accent: "electric",
      onClick: () => navigate("earn"),
    },
    {
      title: "Redeem",
      description: "Convert coins to rewards",
      icon: "Gift",
      accent: "purple",
      onClick: () => navigate("redeem"),
    },
    {
      title: "History",
      description: "View all transactions",
      icon: "History",
      accent: "cyan",
      onClick: () => navigate("history"),
    },
  ];

  return (
    <WidgetCard
      title="Quick Actions"
      description="Jump to the most common wallet tasks"
      icon={<Sparkles size={16} />}
      level={2}
      index={3}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((a, i) => (
          <motion.button
            key={a.title}
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            custom={i}
            onClick={a.onClick}
            {...hoverLift}
            className={cn(
              "group text-left rounded-2xl p-4 glass-1 ring-1 ring-border hover:ring-electric/30 transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <IconBadge name={a.icon} accent={a.accent} />
              <ChevronRight
                size={16}
                className="text-muted-foreground group-hover:text-electric group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <p className="text-sm font-semibold text-foreground mb-0.5">{a.title}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{a.description}</p>
          </motion.button>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Main WalletView
   ============================================================ */

export function WalletView() {
  const navigate = useNavigationStore((s) => s.navigate);
  // Derive loading state: walletId is null until AuthDataSync fetches wallet data.
  const loading = !useWalletStore((s) => s.walletId);

  return (
    <PageContainer>
      <PageHeader
        title="Wallet"
        description="Your coin balance & transactions"
        actions={
          <>
            <LootButton
              variant="electric"
              size="md"
              leftIcon={<Zap size={15} />}
              onClick={() => navigate("earn")}
            >
              Earn More
            </LootButton>
            <LootButton
              variant="glass"
              size="md"
              leftIcon={<Gift size={15} />}
              onClick={() => navigate("redeem")}
            >
              Redeem
            </LootButton>
          </>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-5 lg:space-y-6"
      >
        {/* 1. Wallet Overview Hero */}
        <WalletOverview loading={loading} />

        {/* 2. Wallet Statistics */}
        <WalletStatistics loading={loading} />

        {/* 3. Recent Transactions */}
        <RecentTransactions loading={loading} />

        {/* 4. Quick Actions */}
        <QuickWalletActions />
      </motion.div>
    </PageContainer>
  );
}
