"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  Ban,
  MessageSquareQuote,
  Coins,
  RotateCcw,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  LootButton,
  IconBadge,
  StatusBadge,
  EmptyState,
  SkeletonRow,
} from "@/components/lootloom";
import { useNavigationStore, useWalletStore } from "@/stores";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { COINS_PER_INR } from "@/lib/coin-config";
import type { TransactionItem } from "@/types";

/* ============================================================
   Types
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

type HistoryType = "redeem" | "credit" | "debit" | "bonus" | "referral" | "system";

type HistoryStatus = "Pending" | "Approved" | "Rejected" | "Cancelled" | "Completed";

interface HistoryItem {
  id: string;
  type: HistoryType;
  /** Cash value in ₹ (populated by backend) */
  amountInr: number;
  /** Coins involved (populated by backend) */
  coins: number;
  status: HistoryStatus;
  /** ISO date string */
  date: string;
  description?: string;
  /** CEO / admin note, approval message or rejection reason */
  ceoMessage?: string;
}

/* ============================================================
   Status & Type metadata maps
   ============================================================ */

const STATUS_VARIANT: Record<
  HistoryStatus,
  { variant: "warning" | "success" | "error" | "default" | "info"; icon: typeof Hourglass }
> = {
  Pending: { variant: "warning", icon: Hourglass },
  Approved: { variant: "success", icon: CheckCircle2 },
  Rejected: { variant: "error", icon: XCircle },
  Cancelled: { variant: "default", icon: Ban },
  Completed: { variant: "success", icon: CheckCircle2 },
};

const TYPE_META: Record<
  HistoryType,
  { label: string; icon: string; accent: Accent; direction: "in" | "out" | "neutral" }
> = {
  redeem: { label: "Redeem", icon: "Gift", accent: "purple", direction: "out" },
  credit: { label: "Credit", icon: "ArrowDownLeft", accent: "emerald", direction: "in" },
  debit: { label: "Debit", icon: "ArrowUpRight", accent: "rose", direction: "out" },
  bonus: { label: "Bonus", icon: "Sparkles", accent: "gold", direction: "in" },
  referral: { label: "Referral", icon: "Users", accent: "cyan", direction: "in" },
  system: { label: "System", icon: "Wallet", accent: "navy", direction: "neutral" },
};

/* ============================================================
   Placeholder dataset — backend will populate via API
   ============================================================ */

const HISTORY_ITEMS: HistoryItem[] = [];

/* ============================================================
   Date formatter (client-safe)
   ============================================================ */

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ============================================================
   History item card
   ============================================================ */

function HistoryItemCard({ item, index }: { item: HistoryItem; index: number }) {
  const meta = TYPE_META[item.type];
  const statusMeta = STATUS_VARIANT[item.status];
  const isCredit = meta.direction === "in";
  const isDebit = meta.direction === "out";

  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      animate="visible"
    >
      <GlassCard
        level={1}
        sheen
        hover
        className="p-4 sm:p-5 ring-1 ring-border/60 group"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Type icon */}
          <div className="shrink-0">
            <IconBadge name={meta.icon} accent={meta.accent} size="md" />
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {meta.label}
              </span>
              <StatusBadge variant={statusMeta.variant} dot pulse={item.status === "Pending"}>
                <span className="inline-flex items-center gap-1">
                  <statusMeta.icon size={11} />
                  {item.status}
                </span>
              </StatusBadge>
              {item.description && (
                <span className="text-xs text-muted-foreground truncate">
                  · {item.description}
                </span>
              )}
            </div>

            {/* Amount + coins row */}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                  Amount
                </span>
                <span
                  className={cn(
                    "text-base font-bold tabular-nums",
                    isCredit && "text-emerald-brand",
                    isDebit && "text-rose-brand",
                    meta.direction === "neutral" && "text-foreground"
                  )}
                >
                  {isCredit ? "+" : isDebit ? "−" : ""}
                  ₹
                  {item.amountInr.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                  Coins
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold">
                  <Coins size={13} />
                  <span className="tabular-nums">
                    {item.coins.toLocaleString("en-IN")}
                  </span>
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock size={11} />
              <span>{formatDate(item.date)}</span>
            </div>

            {/* CEO message */}
            {item.ceoMessage && (
              <div className="mt-2 rounded-xl glass-2 ring-1 ring-purple-brand/15 p-3 flex items-start gap-2.5">
                <div className="shrink-0 mt-0.5">
                  <div className="size-7 rounded-lg bg-purple/10 text-purple-brand ring-1 ring-purple-brand/20 flex items-center justify-center">
                    <MessageSquareQuote size={14} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-purple-brand mb-0.5">
                    {item.status === "Rejected"
                      ? "Rejection Reason"
                      : item.status === "Approved"
                      ? "Approval Message"
                      : "CEO Message"}
                  </p>
                  <p className="text-xs text-foreground/90 leading-relaxed break-words">
                    {item.ceoMessage}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   History list — real wallet data
   ============================================================ */

function HistoryList() {
  const navigate = useNavigationStore((s) => s.navigate);
  const transactions = useWalletStore((s) => s.transactions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    fetch("/api/transactions?pageSize=50", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const { setTransactions } = useWalletStore.getState();
          setTransactions(json.data);
        }
      })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); setLoading(false); });
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonRow count={5} />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <GlassCard level={2} sheen className="py-10">
        <EmptyState
          icon="Inbox"
          title="No history yet"
          description="Start earning coins to see your activity"
          action={
            <LootButton
              variant="electric"
              size="sm"
              leftIcon={<Sparkles size={14} />}
              onClick={() => navigate("earn")}
            >
              Start Earning
            </LootButton>
          }
        />
      </GlassCard>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3 max-h-[80vh] overflow-y-auto lootloom-scroll pr-1"
    >
      {transactions.map((tx, i) => {
        const historyItem: HistoryItem = {
          id: tx.id,
          type: tx.type.toLowerCase().includes("redeem") ? "redeem" : "credit",
          amountInr: Math.floor(Math.abs(tx.amount) / COINS_PER_INR),
          coins: Math.abs(tx.amount),
          status: tx.status === "completed" ? "Completed" : tx.status === "pending" ? "Pending" : "Completed",
          date: tx.date,
          description: tx.description || "",
        };
        return <HistoryItemCard key={tx.id} item={historyItem} index={i} />;
      })}
    </motion.div>
  );
}

/* ============================================================
   Main TransactionsView (History page)
   ============================================================ */

export function TransactionsView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const resp = await fetch("/api/transactions?pageSize=50", { signal: ctrl.signal });
      clearTimeout(timer);
      const json = await resp.json();
      if (json.success) {
        const { setTransactions } = useWalletStore.getState();
        setTransactions(json.data);
      }
    } catch { /* ignore */ }
    setRefreshing(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="History"
        description="Your redeem and account activity"
        actions={
          <>
            <LootButton
              variant="outline"
              size="md"
              leftIcon={<ChevronRight size={15} />}
              onClick={() => navigate("wallet")}
            >
              <span className="hidden sm:inline">Wallet</span>
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

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-5 lg:space-y-6"
      >
        <HistoryList />
      </motion.div>
    </PageContainer>
  );
}
