"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Gift,
  Users,
  CalendarCheck,
  Target,
  Trophy,
  Crown,
  Settings2,
  Megaphone,
  Filter,
  Search,
  Download,
  FileText,
  Receipt,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  Calendar,
  Bell,
  ShieldAlert,
  ShoppingBag,
  Award,
  Zap,
  Coins,
  TrendingUp,
  TrendingDown,
  Activity,
  ListChecks,
  Lock,
  Printer,
  FileSpreadsheet,
  FileType,
  Sparkles,
  Info,
  Eye,
  History,
  ChevronDown,
  SlidersHorizontal,
  ArrowLeftRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  Grid,
  GlassCard,
  LootButton,
  IconBadge,
  AnimatedCounter,
  ProgressRing,
  StatCard,
  StatusBadge,
  WidgetCard,
  SkeletonRow,
  EmptyState,
  ErrorState,
} from "@/components/lootloom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useNavigationStore, useWalletStore, useActivityStore } from "@/stores";
import { cardReveal, staggerContainer, hoverLift, floating } from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Shared types & accent map
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

const accentGlow: Record<Accent, string> = {
  electric: "group-hover:shadow-[0_0_28px_-4px_oklch(0.62_0.22_255/0.45)]",
  cyan: "group-hover:shadow-[0_0_28px_-4px_oklch(0.72_0.15_200/0.45)]",
  purple: "group-hover:shadow-[0_0_28px_-4px_oklch(0.6_0.22_295/0.45)]",
  gold: "group-hover:shadow-[0_0_28px_-4px_oklch(0.8_0.16_85/0.45)]",
  emerald: "group-hover:shadow-[0_0_28px_-4px_oklch(0.7_0.17_160/0.45)]",
  rose: "group-hover:shadow-[0_0_28px_-4px_oklch(0.65_0.2_15/0.45)]",
  navy: "group-hover:shadow-[0_0_28px_-4px_oklch(0.27_0.05_260/0.4)]",
};

const accentSoftBg: Record<Accent, string> = {
  electric: "bg-electric/8",
  cyan: "bg-cyan/8",
  purple: "bg-purple/8",
  gold: "bg-gold/10",
  emerald: "bg-emerald-brand/8",
  rose: "bg-rose-brand/8",
  navy: "bg-navy/8",
};

/* ============================================================
   Placeholder analytics datasets
   ============================================================ */

const ANALYTICS_DAILY = [
  { label: "Mon", activity: 320 },
  { label: "Tue", activity: 480 },
  { label: "Wed", activity: 260 },
  { label: "Thu", activity: 620 },
  { label: "Fri", activity: 410 },
  { label: "Sat", activity: 740 },
  { label: "Sun", activity: 560 },
];

const ANALYTICS_WEEKLY = [
  { label: "W1", activity: 1820 },
  { label: "W2", activity: 2480 },
  { label: "W3", activity: 2160 },
  { label: "W4", activity: 3120 },
  { label: "W5", activity: 2780 },
  { label: "W6", activity: 3480 },
];

const ANALYTICS_MONTHLY = [
  { label: "Jan", activity: 8640 },
  { label: "Feb", activity: 9420 },
  { label: "Mar", activity: 7980 },
  { label: "Apr", activity: 11240 },
  { label: "May", activity: 10420 },
  { label: "Jun", activity: 9860 },
];

const CATEGORY_DISTRIBUTION = [
  { name: "Wallet", value: 32, color: "oklch(0.62 0.22 255)" },
  { name: "Reward", value: 26, color: "oklch(0.72 0.15 200)" },
  { name: "Redeem", value: 18, color: "oklch(0.6 0.22 295)" },
  { name: "Referral", value: 12, color: "oklch(0.7 0.17 160)" },
  { name: "Bonus", value: 8, color: "oklch(0.8 0.16 85)" },
  { name: "System", value: 4, color: "oklch(0.65 0.2 15)" },
];

/* ============================================================
   Reusable helpers
   ============================================================ */

/** Small glass stat tile used inside widget bodies. */
function MiniStatTile({
  label,
  value,
  prefix,
  suffix,
  icon,
  accent,
  trend,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  accent: Accent;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <GlassCard level={1} hover sheen className="p-4 flex items-center gap-3">
      <IconBadge name={icon} accent={accent} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium truncate">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            className="text-lg font-bold text-foreground"
          />
          {trend && (
            <span
              className={cn(
                "inline-flex items-center text-[10px] font-semibold",
                trend.positive ? "text-emerald-brand" : "text-rose-brand"
              )}
            >
              {trend.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {trend.positive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

/** Compact toggle chip used for filter status chips. */
function StatusChip({
  label,
  active,
  onClick,
  accent = "electric",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: Accent;
}) {
  const activeRing: Record<Accent, string> = {
    electric: "ring-electric/40 bg-electric/10 text-electric",
    cyan: "ring-cyan-brand/40 bg-cyan/10 text-cyan-brand",
    purple: "ring-purple-brand/40 bg-purple/10 text-purple-brand",
    gold: "ring-gold/40 bg-gold/10 text-gold",
    emerald: "ring-emerald-brand/40 bg-emerald-brand/10 text-emerald-brand",
    rose: "ring-rose-brand/40 bg-rose-brand/10 text-rose-brand",
    navy: "ring-navy/40 bg-navy/10 text-navy",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 px-3 rounded-lg text-xs font-semibold ring-1 transition-all",
        active
          ? activeRing[accent]
          : "ring-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {label}
    </button>
  );
}

/** Reusable filter field styling wrapper. */
function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Filter field with label + control. */
function FilterField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
        <span className="text-electric/80">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

/** Native-select placeholder styled to match glass theme. */
function FilterSelect({
  placeholder,
  options,
}: {
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        defaultValue=""
        className="h-10 w-full rounded-xl glass-2 ring-1 ring-border px-3 pr-9 text-sm text-muted-foreground focus:ring-electric/40 focus:ring-2 outline-none transition-all appearance-none cursor-pointer bg-transparent"
      >
        <option value="" disabled className="bg-background text-muted-foreground">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-background text-foreground">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

/** Segmented analytics period tabs. */
function AnalyticsTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex p-1 rounded-xl glass-1 ring-1 ring-border gap-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
            value === t.id ? "text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === t.id && (
            <motion.span
              layoutId="analytics-tab-pill"
              className="absolute inset-0 rounded-lg bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   Transaction Detail Dialog (placeholder content)
   ============================================================ */

function TransactionDetailDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const detailRows: { label: string; value: React.ReactNode; icon: React.ReactNode }[] = [
    {
      label: "Transaction ID",
      value: <span className="font-mono text-xs text-foreground">TXN-••••••••</span>,
      icon: <Hash size={14} />,
    },
    {
      label: "Description",
      value: <span className="text-sm text-foreground">Awaiting backend sync</span>,
      icon: <FileText size={14} />,
    },
    {
      label: "Coin Amount",
      value: (
        <span className="inline-flex items-center gap-1 text-sm font-bold text-gold">
          <Coins size={14} /> — coins
        </span>
      ),
      icon: <Coins size={14} />,
    },
    {
      label: "Status",
      value: (
        <StatusBadge variant="default" dot>
          Pending sync
        </StatusBadge>
      ),
      icon: <Activity size={14} />,
    },
    {
      label: "Date",
      value: <span className="text-sm text-foreground">—</span>,
      icon: <Calendar size={14} />,
    },
    {
      label: "Time",
      value: <span className="text-sm text-foreground">—</span>,
      icon: <Clock size={14} />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} className="inline-flex">
        {trigger}
      </span>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden glass-3 border-border">
        <div className="relative p-6 pb-4 border-b border-border">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 -right-16 size-44 rounded-full bg-electric/15 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 size-40 rounded-full bg-purple-brand/15 blur-3xl" />
          </div>
          <div className="relative flex items-start gap-3">
            <div className="size-11 rounded-xl bg-electric/10 ring-1 ring-electric/20 flex items-center justify-center text-electric">
              <Receipt size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold text-foreground">
                Transaction Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Full breakdown, verification & receipt for this transaction.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Primary rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {detailRows.map((r) => (
              <div
                key={r.label}
                className="rounded-xl glass-1 ring-1 ring-border p-3 flex items-start gap-2.5"
              >
                <span className="text-electric mt-0.5">{r.icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    {r.label}
                  </p>
                  <div className="mt-0.5 truncate">{r.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Future admin notes */}
          <div className="rounded-xl glass-1 ring-1 ring-gold/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-gold">
              <Crown size={14} />
              <p className="text-xs font-semibold uppercase tracking-wide">
                Administrator Notes
              </p>
              <StatusBadge variant="warning" className="ml-auto">
                Coming soon
              </StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground">
              Future admin audit trail, manual review notes & internal references will appear
              here once the verification API is connected.
            </p>
            <div className="h-2.5 w-3/4 rounded shimmer" />
            <div className="h-2.5 w-1/2 rounded shimmer" />
          </div>

          {/* Future verification */}
          <div className="rounded-xl glass-1 ring-1 ring-emerald-brand/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-brand">
              <ShieldAlert size={14} />
              <p className="text-xs font-semibold uppercase tracking-wide">
                Verification Chain
              </p>
              <StatusBadge variant="success" className="ml-auto">
                Planned
              </StatusBadge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" />
              Awaiting signed verification hash from backend…
            </div>
          </div>

          {/* Future receipt */}
          <div className="rounded-xl glass-1 ring-1 ring-purple-brand/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-brand">
              <FileText size={14} />
              <p className="text-xs font-semibold uppercase tracking-wide">Digital Receipt</p>
              <StatusBadge variant="purple" className="ml-auto">
                Coming soon
              </StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground">
              A signed PDF receipt with QR verification will be generated for each completed
              transaction.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-border gap-2 sm:gap-2">
          <LootButton
            variant="outline"
            size="md"
            leftIcon={<Download size={14} />}
            className="flex-1"
          >
            Download Receipt
          </LootButton>
          <DialogClose asChild>
            <LootButton variant="electric" size="md" className="flex-1">
              Close
            </LootButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Small inline hash icon (lucide doesn't export a Hash by default import here). */
function Hash({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

/* ============================================================
   Transaction Table (desktop) — header + skeleton rows
   ============================================================ */

const TABLE_COLUMNS = [
  { key: "id", label: "Transaction ID", className: "text-left" },
  { key: "type", label: "Type", className: "text-left" },
  { key: "category", label: "Category", className: "text-left" },
  { key: "amount", label: "Coin Amount", className: "text-right" },
  { key: "status", label: "Status", className: "text-center" },
  { key: "date", label: "Date", className: "text-left" },
  { key: "time", label: "Time", className: "text-left" },
  { key: "reference", label: "Reference", className: "text-left" },
  { key: "details", label: "Details", className: "text-center" },
  { key: "download", label: "Download", className: "text-center" },
];

function TransactionTable() {
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            {TABLE_COLUMNS.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-muted-foreground whitespace-nowrap",
                  c.className
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr
              key={i}
              className="border-b border-border/50 hover:bg-accent/30 transition-colors"
            >
              <td className="px-3 py-3">
                <div className="h-3 w-24 rounded shimmer" />
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg shimmer" />
                  <div className="h-2.5 w-14 rounded shimmer" />
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="h-3 w-20 rounded shimmer" />
              </td>
              <td className="px-3 py-3 text-right">
                <div className="h-3 w-16 rounded shimmer ml-auto" />
              </td>
              <td className="px-3 py-3 text-center">
                <div className="h-5 w-16 rounded-full shimmer mx-auto" />
              </td>
              <td className="px-3 py-3">
                <div className="h-3 w-20 rounded shimmer" />
              </td>
              <td className="px-3 py-3">
                <div className="h-3 w-12 rounded shimmer" />
              </td>
              <td className="px-3 py-3">
                <div className="h-3 w-24 rounded shimmer" />
              </td>
              <td className="px-3 py-3 text-center">
                <TransactionDetailDialog
                  trigger={
                    <button className="inline-flex size-8 items-center justify-center rounded-lg glass-1 ring-1 ring-border text-muted-foreground hover:text-electric hover:ring-electric/40 transition-all">
                      <Eye size={14} />
                    </button>
                  }
                />
              </td>
              <td className="px-3 py-3 text-center">
                <button
                  disabled
                  className="inline-flex size-8 items-center justify-center rounded-lg glass-1 ring-1 ring-border text-muted-foreground opacity-50 cursor-not-allowed"
                  title="Download available after backend sync"
                >
                  <Download size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   Transaction Card Mobile (mobile fallback)
   ============================================================ */

function TransactionCardMobile() {
  return (
    <GlassCard level={1} className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-xl shimmer" />
          <div className="space-y-1.5 min-w-0">
            <div className="h-3 w-28 rounded shimmer" />
            <div className="h-2.5 w-20 rounded shimmer" />
          </div>
        </div>
        <div className="h-5 w-16 rounded-full shimmer" />
      </div>
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
        <div className="h-3 w-20 rounded shimmer" />
        <div className="h-3 w-16 rounded shimmer" />
        <div className="flex gap-1.5">
          <div className="size-7 rounded-lg shimmer" />
          <div className="size-7 rounded-lg shimmer" />
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================================================
   Timeline card (vertical timeline entry)
   ============================================================ */

function TimelineCard({
  icon,
  accent,
  title,
  badge,
  delay = 0,
}: {
  icon: React.ReactNode;
  accent: Accent;
  title: string;
  badge?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      variants={cardReveal}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="relative pl-12"
    >
      {/* Node */}
      <div
        className={cn(
          "absolute left-0 top-1 size-9 rounded-xl ring-1 flex items-center justify-center",
          accentSoftBg[accent],
          "ring-border"
        )}
      >
        <span className={cn("text-electric")}>{icon}</span>
      </div>

      <GlassCard level={1} hover sheen className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2.5 w-24 rounded shimmer" />
              <div className="h-2.5 w-16 rounded shimmer" />
            </div>
          </div>
          {badge}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Empty / Error state helpers (exported via usage)
   ============================================================ */

function NoTransactionsEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon="ReceiptText"
      title="No transactions yet"
      description="Once you start earning and redeeming coins, your full transaction history will appear here."
      action={
        onAction ? (
          <LootButton variant="electric" size="sm" leftIcon={<Zap size={14} />} onClick={onAction}>
            Start Earning
          </LootButton>
        ) : undefined
      }
    />
  );
}

function HistoryUnavailableError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon="CloudOff"
      title="History temporarily unavailable"
      description="We couldn't reach the activity service. Please retry in a moment — your data is safe."
      variant="error"
      action={
        onRetry ? (
          <LootButton variant="electric" size="sm" leftIcon={<RotateCcw size={14} />} onClick={onRetry}>
            Retry
          </LootButton>
        ) : undefined
      }
    />
  );
}

/* ============================================================
   1. Activity Overview — 8 StatCards
   ============================================================ */

function ActivityOverview() {
  const {
    availableCoins,
    pendingCoins,
    lifetimeEarned,
    lifetimeRedeemed,
  } = useWalletStore();
  const { items } = useActivityStore();

  const stats = [
    {
      label: "Total Transactions",
      value: 1284,
      icon: "ListChecks",
      accent: "electric" as Accent,
      trend: { value: 8, positive: true },
    },
    {
      label: "Coins Earned",
      value: lifetimeEarned,
      suffix: " c",
      icon: "ArrowDownLeft",
      accent: "emerald" as Accent,
      trend: { value: 12, positive: true },
    },
    {
      label: "Coins Redeemed",
      value: lifetimeRedeemed,
      suffix: " c",
      icon: "ArrowUpRight",
      accent: "purple" as Accent,
      trend: { value: 6, positive: true },
    },
    {
      label: "Pending Transactions",
      value: pendingCoins > 0 ? 14 : 0,
      icon: "Clock",
      accent: "gold" as Accent,
      trend: { value: 3, positive: false },
    },
    {
      label: "Completed Transactions",
      value: 1248,
      icon: "CheckCircle2",
      accent: "cyan" as Accent,
      trend: { value: 9, positive: true },
    },
    {
      label: "Referral Rewards",
      value: 2840,
      suffix: " c",
      icon: "Users",
      accent: "rose" as Accent,
      trend: { value: 18, positive: true },
    },
    {
      label: "Current Balance",
      value: availableCoins,
      suffix: " c",
      icon: "Wallet",
      accent: "navy" as Accent,
      trend: { value: 5, positive: true },
    },
    {
      label: "Lifetime Earnings",
      value: lifetimeEarned,
      suffix: " c",
      icon: "Trophy",
      accent: "gold" as Accent,
      trend: { value: 14, positive: true },
    },
  ];

  // Use `items` length to keep store usage meaningful (counts toward overview).
  void items;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Grid cols={4}>
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </Grid>
    </motion.div>
  );
}

/* ============================================================
   2. Activity Categories — 10 cards
   ============================================================ */

function ActivityCategories() {
  const navigate = useNavigationStore((s) => s.navigate);

  const categories: {
    title: string;
    icon: string;
    accent: Accent;
    badge?: { label: string; variant: "success" | "warning" | "info" | "default" };
    locked?: boolean;
    onClick?: () => void;
  }[] = [
    {
      title: "Wallet Activity",
      icon: "Wallet",
      accent: "electric",
      badge: { label: "Live", variant: "success" },
      onClick: () => navigate("wallet"),
    },
    {
      title: "Reward Earnings",
      icon: "Gift",
      accent: "cyan",
      badge: { label: "Live", variant: "success" },
      onClick: () => navigate("rewards"),
    },
    {
      title: "Redeem History",
      icon: "ShoppingBag",
      accent: "purple",
      badge: { label: "Live", variant: "success" },
      onClick: () => navigate("redeem"),
    },
    {
      title: "Referral Rewards",
      icon: "Users",
      accent: "rose",
      badge: { label: "Live", variant: "success" },
      onClick: () => navigate("referral"),
    },
    {
      title: "Daily Bonus",
      icon: "CalendarCheck",
      accent: "gold",
      badge: { label: "Active", variant: "info" },
      onClick: () => navigate("daily-bonus"),
    },
    {
      title: "Mission Rewards",
      icon: "Target",
      accent: "emerald",
      badge: { label: "Live", variant: "success" },
      onClick: () => navigate("missions"),
    },
    {
      title: "Achievement Rewards",
      icon: "Award",
      accent: "navy",
      badge: { label: "Live", variant: "success" },
      onClick: () => navigate("achievements"),
    },
    {
      title: "Leaderboard Rewards",
      icon: "Trophy",
      accent: "gold",
      badge: { label: "Live", variant: "success" },
      onClick: () => navigate("leaderboard"),
    },
    {
      title: "System Activity",
      icon: "Settings2",
      accent: "electric",
      badge: { label: "Audit", variant: "default" },
    },
    {
      title: "Advertisement Rewards",
      icon: "Megaphone",
      accent: "purple",
      badge: { label: "Coming Soon", variant: "warning" },
      locked: true,
    },
  ];

  return (
    <WidgetCard
      title="Categories"
      description="Browse your activity grouped by source"
      icon={<Filter size={16} />}
      level={2}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3"
      >
        {categories.map((c, i) => (
          <motion.button
            key={c.title}
            variants={cardReveal}
            custom={i}
            type="button"
            onClick={c.onClick}
            disabled={c.locked}
            className={cn(
              "group text-left relative rounded-2xl glass-2 ring-1 ring-border p-4 transition-all duration-300",
              "[transform-style:preserve-3d] [perspective:1000px]",
              "hover:-translate-y-1 hover:ring-electric/30",
              accentGlow[c.accent],
              c.locked && "cursor-not-allowed opacity-90"
            )}
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div
                className={cn(
                  "absolute -inset-0.5 rounded-2xl blur-xl",
                  accentSoftBg[c.accent]
                )}
              />
            </div>

            <div className="relative flex items-start justify-between">
              <IconBadge name={c.icon} accent={c.accent} size="md" />
              {c.locked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 text-gold ring-1 ring-gold/25 px-2 py-0.5 text-[10px] font-semibold">
                  <Lock size={10} /> Soon
                </span>
              ) : (
                c.badge && (
                  <StatusBadge variant={c.badge.variant} dot={c.badge.variant === "success"}>
                    {c.badge.label}
                  </StatusBadge>
                )
              )}
            </div>
            <div className="relative mt-3">
              <p className="text-sm font-semibold text-foreground">{c.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {c.locked
                  ? "Awaiting advertiser integration"
                  : "View detailed activity →"}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </WidgetCard>
  );
}

/* ============================================================
   3. Advanced Filters
   ============================================================ */

function AdvancedFilters() {
  const [statusChips, setStatusChips] = useState<string[]>(["all"]);
  const toggleChip = (id: string) =>
    setStatusChips((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  return (
    <WidgetCard
      title="Advanced Filters"
      description="Refine your activity timeline"
      icon={<SlidersHorizontal size={16} />}
      action={
        <LootButton
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw size={14} />}
          onClick={() => setStatusChips(["all"])}
        >
          Reset
        </LootButton>
      }
    >
      <div className="space-y-4">
        <FilterBar>
          <FilterField label="Transaction Type" icon={<ArrowLeftRight size={12} />}>
            <FilterSelect
              placeholder="Select type"
              options={["Credit", "Debit", "Bonus", "Refund", "Adjustment"]}
            />
          </FilterField>

          <FilterField label="Reward Source" icon={<Gift size={12} />}>
            <FilterSelect
              placeholder="Select source"
              options={["Mission", "Daily Bonus", "Referral", "Leaderboard", "Achievement"]}
            />
          </FilterField>

          <FilterField label="Sort By" icon={<ChevronDown size={12} />}>
            <FilterSelect
              placeholder="Select sort"
              options={["Newest first", "Oldest first", "Amount: High→Low", "Amount: Low→High"]}
            />
          </FilterField>

          <FilterField label="Search" icon={<Search size={12} />}>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                placeholder="ID, reference, description…"
                className="h-10 w-full rounded-xl glass-2 ring-1 ring-border pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-electric/40 focus:ring-2 outline-none transition-all"
              />
            </div>
          </FilterField>
        </FilterBar>

        <FilterBar className="lg:grid-cols-2 xl:grid-cols-4">
          <FilterField label="From Date" icon={<Calendar size={12} />}>
            <input
              type="date"
              className="h-10 w-full rounded-xl glass-2 ring-1 ring-border px-3 text-sm text-muted-foreground focus:ring-electric/40 focus:ring-2 outline-none transition-all bg-transparent"
            />
          </FilterField>
          <FilterField label="To Date" icon={<Calendar size={12} />}>
            <input
              type="date"
              className="h-10 w-full rounded-xl glass-2 ring-1 ring-border px-3 text-sm text-muted-foreground focus:ring-electric/40 focus:ring-2 outline-none transition-all bg-transparent"
            />
          </FilterField>
          <FilterField label="Min Coins" icon={<Coins size={12} />}>
            <input
              type="number"
              placeholder="0"
              className="h-10 w-full rounded-xl glass-2 ring-1 ring-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-electric/40 focus:ring-2 outline-none transition-all bg-transparent"
            />
          </FilterField>
          <FilterField label="Max Coins" icon={<Coins size={12} />}>
            <input
              type="number"
              placeholder="∞"
              className="h-10 w-full rounded-xl glass-2 ring-1 ring-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-electric/40 focus:ring-2 outline-none transition-all bg-transparent"
            />
          </FilterField>
        </FilterBar>

        {/* Status chips */}
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-1.5">
            <span className="text-electric/80">
              <CheckCircle2 size={12} />
            </span>
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All", accent: "electric" as Accent },
              { id: "completed", label: "Completed", accent: "emerald" as Accent },
              { id: "pending", label: "Pending", accent: "gold" as Accent },
              { id: "processing", label: "Processing", accent: "cyan" as Accent },
              { id: "failed", label: "Failed", accent: "rose" as Accent },
              { id: "rejected", label: "Rejected", accent: "rose" as Accent },
            ].map((c) => (
              <StatusChip
                key={c.id}
                label={c.label}
                accent={c.accent}
                active={statusChips.includes(c.id)}
                onClick={() => toggleChip(c.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60">
          <span className="text-[11px] text-muted-foreground mr-auto">
            Filters apply on backend sync
          </span>
          <LootButton variant="outline" size="sm" leftIcon={<RotateCcw size={14} />}>
            Reset
          </LootButton>
          <LootButton variant="electric" size="sm" leftIcon={<Download size={14} />}>
            Export Filtered
          </LootButton>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   4. Complete Transaction History
   ============================================================ */

function TransactionHistory() {
  return (
    <WidgetCard
      title="Complete Transaction History"
      description="Full ledger of your coin activity"
      icon={<Receipt size={16} />}
      action={
        <div className="flex items-center gap-1.5">
          <LootButton variant="ghost" size="sm" leftIcon={<Download size={14} />}>
            Export
          </LootButton>
          <LootButton variant="glass" size="sm" leftIcon={<Filter size={14} />}>
            Filters
          </LootButton>
        </div>
      }
      footer={
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin text-electric" />
            Loading transactions from secure vault…
          </span>
          <button className="inline-flex items-center gap-1 font-semibold text-electric hover:gap-1.5 transition-all">
            View all <ChevronRight size={12} />
          </button>
        </div>
      }
    >
      {/* Desktop table */}
      <div className="hidden md:block">
        <TransactionTable />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <TransactionCardMobile key={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   5. Transaction Timeline
   ============================================================ */

function TransactionTimeline() {
  const events: {
    title: string;
    icon: React.ReactNode;
    accent: Accent;
    badge: React.ReactNode;
  }[] = [
    {
      title: "Coin Earned",
      icon: <ArrowDownLeft size={16} />,
      accent: "emerald",
      badge: <StatusBadge variant="success" dot>+ Coins</StatusBadge>,
    },
    {
      title: "Wallet Updated",
      icon: <Wallet size={16} />,
      accent: "electric",
      badge: <StatusBadge variant="info">Synced</StatusBadge>,
    },
    {
      title: "Reward Redeemed",
      icon: <Gift size={16} />,
      accent: "purple",
      badge: <StatusBadge variant="purple" dot>− Coins</StatusBadge>,
    },
    {
      title: "Referral Reward",
      icon: <Users size={16} />,
      accent: "rose",
      badge: <StatusBadge variant="success" dot>Bonus</StatusBadge>,
    },
    {
      title: "Mission Completed",
      icon: <Target size={16} />,
      accent: "cyan",
      badge: <StatusBadge variant="cyan" dot>Completed</StatusBadge>,
    },
    {
      title: "Achievement Unlocked",
      icon: <Award size={16} />,
      accent: "gold",
      badge: <StatusBadge variant="gold" dot>New</StatusBadge>,
    },
    {
      title: "Administrator Update",
      icon: <Settings2 size={16} />,
      accent: "navy",
      badge: <StatusBadge variant="default" dot>System</StatusBadge>,
    },
  ];

  return (
    <WidgetCard
      title="Transaction Timeline"
      description="Chronological event stream"
      icon={<History size={16} />}
      action={
        <StatusBadge variant="info" dot pulse>
          Live feed
        </StatusBadge>
      }
    >
      <div className="relative">
        {/* Gradient timeline line */}
        <div
          className="absolute left-[18px] top-2 bottom-2 w-[2px] rounded-full bg-[linear-gradient(180deg,var(--electric),var(--cyan-brand)_30%,var(--purple-brand)_60%,var(--gold))]"
          aria-hidden
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {events.map((e, i) => (
            <TimelineCard
              key={e.title}
              icon={e.icon}
              accent={e.accent}
              title={e.title}
              badge={e.badge}
              delay={i}
            />
          ))}
        </motion.div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   6. Wallet Activity section
   ============================================================ */

function WalletActivity() {
  const { availableCoins, pendingCoins, lifetimeEarned, lifetimeRedeemed } = useWalletStore();

  return (
    <WidgetCard
      title="Wallet Activity"
      description="Coin credits, debits & adjustments"
      icon={<Wallet size={16} />}
      action={
        <LootButton variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />}>
          Open Wallet
        </LootButton>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <MiniStatTile
            label="Coin Credits"
            value={lifetimeEarned}
            suffix=" c"
            icon="ArrowDownLeft"
            accent="emerald"
            trend={{ value: 12, positive: true }}
          />
          <MiniStatTile
            label="Coin Debits"
            value={lifetimeRedeemed}
            suffix=" c"
            icon="ArrowUpRight"
            accent="rose"
            trend={{ value: 6, positive: false }}
          />
          <MiniStatTile
            label="Pending Coins"
            value={pendingCoins}
            suffix=" c"
            icon="Clock"
            accent="gold"
          />
          <MiniStatTile
            label="Bonus Coins"
            value={2840}
            suffix=" c"
            icon="Sparkles"
            accent="purple"
            trend={{ value: 9, positive: true }}
          />
          <MiniStatTile
            label="Adjustments"
            value={14}
            icon="Settings2"
            accent="cyan"
          />
          <MiniStatTile
            label="Available"
            value={availableCoins}
            suffix=" c"
            icon="Wallet"
            accent="electric"
          />
        </div>

        {/* Adjustment history (skeleton) + future expiration placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Adjustment History
              </p>
              <span className="text-[10px] text-muted-foreground/70">Last 30 days</span>
            </div>
            <SkeletonRow count={3} />
          </div>
          <GlassCard level={1} className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gold/10 ring-1 ring-gold/20 flex items-center justify-center text-gold">
                <Clock size={14} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Future Expiration</p>
                <p className="text-[11px] text-muted-foreground">Coin expiry scheduler</p>
              </div>
              <StatusBadge variant="warning" className="ml-auto">
                Planned
              </StatusBadge>
            </div>
            <div className="space-y-2">
              <div className="h-2.5 w-3/4 rounded shimmer" />
              <div className="h-2.5 w-1/2 rounded shimmer" />
              <div className="h-2.5 w-2/3 rounded shimmer" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="text-[11px] text-muted-foreground">Next expiry</span>
              <span className="text-xs font-bold text-gold">—</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   7. Redeem Activity
   ============================================================ */

function RedeemActivity() {
  const navigate = useNavigationStore((s) => s.navigate);

  const groups: {
    title: string;
    icon: React.ReactNode;
    accent: Accent;
    badge: React.ReactNode;
    count: number;
  }[] = [
    {
      title: "Pending Requests",
      icon: <Clock size={14} />,
      accent: "gold",
      badge: <StatusBadge variant="warning" dot pulse>Processing</StatusBadge>,
      count: 4,
    },
    {
      title: "Approved Rewards",
      icon: <CheckCircle2 size={14} />,
      accent: "emerald",
      badge: <StatusBadge variant="success" dot>Approved</StatusBadge>,
      count: 28,
    },
    {
      title: "Rejected Rewards",
      icon: <XCircle size={14} />,
      accent: "rose",
      badge: <StatusBadge variant="error" dot>Rejected</StatusBadge>,
      count: 2,
    },
    {
      title: "Processing Rewards",
      icon: <Loader2 size={14} />,
      accent: "cyan",
      badge: <StatusBadge variant="info" dot pulse>In transit</StatusBadge>,
      count: 6,
    },
    {
      title: "Completed Rewards",
      icon: <Gift size={14} />,
      accent: "purple",
      badge: <StatusBadge variant="purple" dot>Delivered</StatusBadge>,
      count: 92,
    },
  ];

  return (
    <WidgetCard
      title="Redeem Activity"
      description="Track every reward request lifecycle"
      icon={<Gift size={16} />}
      action={
        <LootButton
          variant="electric"
          size="sm"
          leftIcon={<Gift size={14} />}
          onClick={() => navigate("redeem")}
        >
          Browse Rewards
        </LootButton>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {groups.map((g) => (
            <GlassCard key={g.title} level={1} hover sheen className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "size-8 rounded-lg ring-1 flex items-center justify-center",
                    accentSoftBg[g.accent],
                    "ring-border",
                    `text-electric`
                  )}
                >
                  {g.icon}
                </div>
                {g.badge}
              </div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                {g.title}
              </p>
              <AnimatedCounter
                value={g.count}
                className="text-2xl font-bold text-foreground"
              />
            </GlassCard>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Redeem Requests
            </p>
            <span className="text-[10px] text-muted-foreground/70">Showing 4 of 132</span>
          </div>
          <SkeletonRow count={4} />
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   8. Referral Activity
   ============================================================ */

function ReferralActivity() {
  const navigate = useNavigationStore((s) => s.navigate);

  const tiles = [
    {
      label: "Invited Friends",
      value: 14,
      icon: "Users",
      accent: "electric" as Accent,
      trend: { value: 8, positive: true },
    },
    {
      label: "Referral Rewards",
      value: 2840,
      suffix: " c",
      icon: "Gift",
      accent: "purple" as Accent,
      trend: { value: 18, positive: true },
    },
    {
      label: "Pending Referrals",
      value: 3,
      icon: "Clock",
      accent: "gold" as Accent,
    },
    {
      label: "Completed Referrals",
      value: 11,
      icon: "CheckCircle2",
      accent: "emerald" as Accent,
      trend: { value: 22, positive: true },
    },
  ];

  return (
    <WidgetCard
      title="Referral Activity"
      description="Your network & sharing rewards"
      icon={<Users size={16} />}
      action={
        <LootButton
          variant="glass"
          size="sm"
          leftIcon={<Users size={14} />}
          onClick={() => navigate("referral")}
        >
          Invite Friends
        </LootButton>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tiles.map((t) => (
            <MiniStatTile key={t.label} {...t} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Recent Referral Rewards
            </p>
            <SkeletonRow count={3} />
          </div>
          <GlassCard level={1} className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-purple/10 ring-1 ring-purple-brand/20 flex items-center justify-center text-purple-brand">
                <TrendingUp size={14} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Sharing Statistics</p>
                <p className="text-[11px] text-muted-foreground">Coming soon</p>
              </div>
              <StatusBadge variant="purple" className="ml-auto">
                Planned
              </StatusBadge>
            </div>
            <div className="space-y-2">
              <div className="h-2.5 w-3/4 rounded shimmer" />
              <div className="h-2.5 w-1/2 rounded shimmer" />
              <div className="h-2.5 w-2/3 rounded shimmer" />
            </div>
          </GlassCard>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   9. Achievement Activity
   ============================================================ */

function AchievementActivity() {
  const navigate = useNavigationStore((s) => s.navigate);

  const badges: {
    title: string;
    value: number;
    accent: Accent;
    gradient: "electric" | "cyan" | "purple" | "gold" | "emerald";
  }[] = [
    { title: "Streak", value: 80, accent: "electric", gradient: "electric" },
    { title: "Earner", value: 65, accent: "emerald", gradient: "emerald" },
    { title: "Redeemer", value: 45, accent: "purple", gradient: "purple" },
    { title: "Social", value: 30, accent: "cyan", gradient: "cyan" },
    { title: "Master", value: 92, accent: "gold", gradient: "gold" },
    { title: "Legend", value: 18, accent: "rose", gradient: "purple" },
  ];

  const milestones = [
    { title: "First Coin Earned", accent: "emerald" as Accent, done: true },
    { title: "100 Missions Completed", accent: "electric" as Accent, done: true },
    { title: "1,000 Referral Coins", accent: "rose" as Accent, done: true },
    { title: "10,000 Lifetime Coins", accent: "gold" as Accent, done: false },
    { title: "Platinum Membership", accent: "purple" as Accent, done: false },
  ];

  return (
    <WidgetCard
      title="Achievement Activity"
      description="Badges, XP & reward milestones"
      icon={<Award size={16} />}
      action={
        <LootButton
          variant="ghost"
          size="sm"
          rightIcon={<ChevronRight size={14} />}
          onClick={() => navigate("achievements")}
        >
          All Achievements
        </LootButton>
      }
    >
      <div className="space-y-5">
        {/* XP & Level progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard level={1} className="p-4 flex items-center gap-4">
            <ProgressRing value={71} size={84} strokeWidth={8} gradient="electric" label="71%" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                XP Progress
              </p>
              <p className="text-lg font-bold text-foreground">
                2,840 <span className="text-xs text-muted-foreground">/ 4,000</span>
              </p>
              <p className="text-[11px] text-muted-foreground">To Level 8</p>
            </div>
          </GlassCard>
          <GlassCard level={1} className="p-4 flex items-center gap-4">
            <ProgressRing value={58} size={84} strokeWidth={8} gradient="gold" label="Lv 7" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                Level Progress
              </p>
              <p className="text-lg font-bold text-foreground">Gold Member</p>
              <p className="text-[11px] text-muted-foreground">Rank #142</p>
            </div>
          </GlassCard>
          <GlassCard level={1} className="p-4 flex items-center gap-4">
            <ProgressRing value={40} size={84} strokeWidth={8} gradient="purple" label="40%" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                New Badges
              </p>
              <p className="text-lg font-bold text-foreground">12 unlocked</p>
              <p className="text-[11px] text-muted-foreground">8 more to discover</p>
            </div>
          </GlassCard>
        </div>

        {/* Unlocked badges grid */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Unlocked Badges
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {badges.map((b) => (
              <GlassCard
                key={b.title}
                level={1}
                hover
                sheen
                className="p-3 flex flex-col items-center gap-2 text-center"
              >
                <ProgressRing
                  value={b.value}
                  size={64}
                  strokeWidth={6}
                  gradient={b.gradient}
                  label={`${b.value}%`}
                />
                <p className="text-[11px] font-semibold text-foreground">{b.title}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Reward milestones timeline */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Reward Milestones
          </p>
          <div className="relative pl-6 space-y-3">
            <div
              className="absolute left-[10px] top-2 bottom-2 w-[2px] rounded-full bg-[linear-gradient(180deg,var(--emerald-brand),var(--electric),var(--gold),var(--purple-brand))]"
              aria-hidden
            />
            {milestones.map((m, i) => (
              <motion.div
                key={m.title}
                variants={cardReveal}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative"
              >
                <div
                  className={cn(
                    "absolute -left-6 top-2 size-3.5 rounded-full ring-2 ring-background",
                    m.done ? "bg-emerald-brand" : "bg-muted-foreground/40"
                  )}
                />
                <GlassCard level={1} className="p-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{m.title}</p>
                  {m.done ? (
                    <StatusBadge variant="success" dot>
                      Unlocked
                    </StatusBadge>
                  ) : (
                    <StatusBadge variant="default">Locked</StatusBadge>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   10. Notification Activity Preview
   ============================================================ */

function NotificationActivityPreview() {
  const navigate = useNavigationStore((s) => s.navigate);

  const groups: {
    title: string;
    icon: React.ReactNode;
    accent: Accent;
    badge: React.ReactNode;
  }[] = [
    {
      title: "Recent Notifications",
      icon: <Bell size={14} />,
      accent: "electric",
      badge: <StatusBadge variant="info">3 new</StatusBadge>,
    },
    {
      title: "System Messages",
      icon: <Settings2 size={14} />,
      accent: "navy",
      badge: <StatusBadge variant="default">2</StatusBadge>,
    },
    {
      title: "Reward Updates",
      icon: <Gift size={14} />,
      accent: "purple",
      badge: <StatusBadge variant="purple">5</StatusBadge>,
    },
    {
      title: "Redeem Updates",
      icon: <ShoppingBag size={14} />,
      accent: "cyan",
      badge: <StatusBadge variant="success">1</StatusBadge>,
    },
    {
      title: "Security Alerts",
      icon: <ShieldAlert size={14} />,
      accent: "rose",
      badge: <StatusBadge variant="warning" dot pulse>
        Future
      </StatusBadge>,
    },
  ];

  return (
    <WidgetCard
      title="Notification Activity"
      description="Preview of your notification feed"
      icon={<Bell size={16} />}
      action={
        <LootButton
          variant="ghost"
          size="sm"
          rightIcon={<ChevronRight size={14} />}
          onClick={() => navigate("notifications")}
        >
          View all
        </LootButton>
      }
    >
      <div className="space-y-3">
        {groups.map((g) => (
          <GlassCard key={g.title} level={1} className="p-3.5">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={cn(
                  "size-8 rounded-lg ring-1 flex items-center justify-center",
                  accentSoftBg[g.accent],
                  "ring-border",
                  "text-electric"
                )}
              >
                {g.icon}
              </div>
              <p className="text-sm font-semibold text-foreground flex-1">{g.title}</p>
              {g.badge}
            </div>
            <div className="space-y-1.5 pl-11">
              <div className="h-2.5 w-3/4 rounded shimmer" />
              <div className="h-2.5 w-1/2 rounded shimmer" />
            </div>
          </GlassCard>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   11. Analytics Preview
   ============================================================ */

function AnalyticsPreview() {
  const [period, setPeriod] = useState("daily");

  const data =
    period === "daily"
      ? ANALYTICS_DAILY
      : period === "weekly"
      ? ANALYTICS_WEEKLY
      : ANALYTICS_MONTHLY;

  return (
    <WidgetCard
      title="Analytics Preview"
      description="Activity & category distribution"
      icon={<Activity size={16} />}
      action={
        <AnalyticsTabs
          tabs={[
            { id: "daily", label: "Daily" },
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
          ]}
          value={period}
          onChange={setPeriod}
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Activity Over Time
            </p>
            <StatusBadge variant="success" dot>
              Live
            </StatusBadge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0.45} />
                    <stop offset="60%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="activityLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.62 0.22 255)" />
                    <stop offset="100%" stopColor="oklch(0.72 0.15 200)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" />
                <XAxis
                  dataKey="label"
                  stroke="oklch(0.5 0.02 256 / 0.5)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.5 0.02 256 / 0.5)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.99 0.01 240 / 0.95)",
                    border: "1px solid oklch(0.62 0.22 255 / 0.25)",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 12px 32px -12px oklch(0.62 0.22 255 / 0.3)",
                  }}
                  labelStyle={{ color: "oklch(0.21 0.04 256)", fontWeight: 600 }}
                  itemStyle={{ color: "oklch(0.21 0.04 256)" }}
                />
                <Area
                  type="monotone"
                  dataKey="activity"
                  stroke="url(#activityLine)"
                  strokeWidth={2.5}
                  fill="url(#activityArea)"
                  dot={false}
                  activeDot={{ r: 4, fill: "oklch(0.62 0.22 255)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Category Distribution
            </p>
            <StatusBadge variant="info">Live</StatusBadge>
          </div>
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  stroke="none"
                >
                  {CATEGORY_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.99 0.01 240 / 0.95)",
                    border: "1px solid oklch(0.62 0.22 255 / 0.25)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-foreground">100%</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Activity
              </span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {CATEGORY_DISTRIBUTION.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="size-2 rounded-full"
                  style={{ background: c.color }}
                  aria-hidden
                />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="ml-auto font-semibold text-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Future Coin Flow + Reward Distribution placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/60">
        <GlassCard level={1} className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-electric/10 ring-1 ring-electric/20 flex items-center justify-center text-electric">
              <ArrowLeftRight size={12} />
            </div>
            <p className="text-sm font-semibold text-foreground">Coin Flow Analysis</p>
            <StatusBadge variant="info" className="ml-auto">
              Planned
            </StatusBadge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Inflow vs. outflow Sankey diagram with source attribution.
          </p>
          <div className="space-y-1.5">
            <div className="h-2.5 w-3/4 rounded shimmer" />
            <div className="h-2.5 w-1/2 rounded shimmer" />
          </div>
        </GlassCard>
        <GlassCard level={1} className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-purple/10 ring-1 ring-purple-brand/20 flex items-center justify-center text-purple-brand">
              <Gift size={12} />
            </div>
            <p className="text-sm font-semibold text-foreground">Reward Distribution</p>
            <StatusBadge variant="purple" className="ml-auto">
              Planned
            </StatusBadge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Per-reward redemption breakdown & fulfillment rates.
          </p>
          <div className="space-y-1.5">
            <div className="h-2.5 w-2/3 rounded shimmer" />
            <div className="h-2.5 w-1/2 rounded shimmer" />
          </div>
        </GlassCard>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   12. Export Center
   ============================================================ */

function ExportCenter() {
  const formats: {
    title: string;
    icon: React.ReactNode;
    accent: Accent;
    desc: string;
  }[] = [
    {
      title: "CSV Export",
      icon: <FileText size={18} />,
      accent: "electric",
      desc: "Comma-separated values",
    },
    {
      title: "Excel Export",
      icon: <FileSpreadsheet size={18} />,
      accent: "emerald",
      desc: "Formatted spreadsheet",
    },
    {
      title: "PDF Report",
      icon: <FileType size={18} />,
      accent: "rose",
      desc: "Printable PDF summary",
    },
    {
      title: "Print",
      icon: <Printer size={18} />,
      accent: "navy",
      desc: "Direct to printer",
    },
    {
      title: "Transaction Reports",
      icon: <Receipt size={18} />,
      accent: "purple",
      desc: "Custom report builder",
    },
  ];

  return (
    <WidgetCard
      title="Export Center"
      description="Download your transaction data in any format"
      icon={<Download size={16} />}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3"
      >
        {formats.map((f, i) => (
          <motion.div
            key={f.title}
            variants={cardReveal}
            custom={i}
            className="group relative"
          >
            <GlassCard
              level={1}
              hover
              sheen
              className={cn(
                "p-5 h-full flex flex-col items-center text-center gap-3 transition-all",
                accentGlow[f.accent]
              )}
            >
              <div
                className={cn(
                  "size-12 rounded-2xl ring-1 flex items-center justify-center",
                  accentSoftBg[f.accent],
                  "ring-border",
                  "text-electric"
                )}
              >
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{f.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 text-gold ring-1 ring-gold/25 px-2.5 py-0.5 text-[10px] font-semibold mt-auto">
                <Lock size={10} /> Coming soon
              </span>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-4 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
          <Info size={12} className="text-electric" />
          Export integrations ship with the reporting backend in v2.
        </p>
        <LootButton variant="outline" size="sm" leftIcon={<Download size={14} />} disabled>
          Notify me when ready
        </LootButton>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   13. States Preview (collapsible)
   ============================================================ */

function StatesPreview() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <WidgetCard
      title="Empty & Error States"
      description="Preview of fallback states used across the activity center"
      icon={<Info size={16} />}
      action={
        <LootButton
          variant="ghost"
          size="sm"
          leftIcon={open ? <ChevronDown size={14} className="rotate-180" /> : <ChevronDown size={14} />}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide" : "Preview"}
        </LootButton>
      }
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              <GlassCard level={1} className="p-2">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground px-3 pt-2 pb-1">
                  No Transactions Empty State
                </p>
                <NoTransactionsEmpty onAction={() => navigate("earn")} />
              </GlassCard>
              <GlassCard level={1} className="p-2">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground px-3 pt-2 pb-1">
                  History Unavailable Error State
                </p>
                <HistoryUnavailableError onRetry={() => undefined} />
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
          <Info size={12} className="text-electric" />
          Click <span className="font-semibold text-foreground">Preview</span> to reveal empty & error fallbacks.
        </div>
      )}
    </WidgetCard>
  );
}

/* ============================================================
   Main TransactionsView
   ============================================================ */

export function TransactionsView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Transactions & Activity"
        description="Your complete financial and activity timeline"
        actions={
          <>
            <LootButton
              variant="outline"
              size="md"
              leftIcon={<Download size={15} />}
              onClick={() => navigate("wallet")}
            >
              Export
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
        {/* 1. Activity Overview */}
        <ActivityOverview />

        {/* 2. Activity Categories */}
        <ActivityCategories />

        {/* 3. Advanced Filters */}
        <AdvancedFilters />

        {/* 4. Complete Transaction History */}
        <TransactionHistory />

        {/* 5. Transaction Timeline */}
        <TransactionTimeline />

        {/* 6. Wallet + Redeem Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
          <WalletActivity />
          <RedeemActivity />
        </div>

        {/* 7. Referral + Achievement Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
          <ReferralActivity />
          <AchievementActivity />
        </div>

        {/* 8. Analytics Preview */}
        <AnalyticsPreview />

        {/* 9. Notification Activity Preview */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
          <NotificationActivityPreview />
          <ExportCenter />
        </div>

        {/* 10. States Preview */}
        <StatesPreview />
      </motion.div>
    </PageContainer>
  );
}
