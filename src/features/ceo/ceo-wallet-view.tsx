"use client";

/* ============================================================
   LootLoom — CEO Wallet & Financial Management Center
   View renders INSIDE the CeoLayout. No sidebar/header/background.
   Skeleton-first: no backend, no wallet data, no coin mutations.
   Inherits premium WHITE executive design language (navy + electric).
   ============================================================ */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeAlert,
  Ban,
  Banknote,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  Crown,
  DollarSign,
  Download,
  Eye,
  FileBarChart,
  FileText,
  Filter,
  Fingerprint,
  Flame,
  Gift,
  History,
  Layers,
  Lock,
  Megaphone,
  MoreVertical,
  Network,
  PieChart as PieChartIcon,
  Printer,
  Receipt,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Star,
  StickyNote,
  TrendingUp,
  Trophy,
  Unlock,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import {
  AnimatedCounter,
  EmptyState,
  ErrorState,
  GlassCard,
  Grid,
  IconBadge,
  LootButton,
  PageContainer,
  PageHeader,
  SkeletonRow,
  StatCard,
  StatusBadge,
  WidgetCard,
} from "@/components/lootloom";
import { cardReveal, floating, hoverLift, staggerContainer } from "@/lib/animations";
import { useNavigationStore } from "@/stores";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* ============================================================
   Types & static data
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

interface ChipDef {
  id: string;
  label: string;
  future?: boolean;
}

const SEARCH_BY_CHIPS: ChipDef[] = [
  { id: "userid", label: "User ID" },
  { id: "walletid", label: "Wallet ID" },
  { id: "username", label: "Username" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone", future: true },
  { id: "txid", label: "Transaction ID" },
  { id: "upi", label: "Future UPI", future: true },
  { id: "paymentid", label: "Future Payment ID", future: true },
  { id: "refid", label: "Future Reference ID", future: true },
];

const WALLET_STATUS_CHIPS: ChipDef[] = [
  { id: "active", label: "Active" },
  { id: "frozen", label: "Frozen" },
  { id: "flagged", label: "Flagged" },
  { id: "pending", label: "Pending Verification" },
];

const TRANSACTION_TYPE_CHIPS: ChipDef[] = [
  { id: "earned", label: "Coins Earned" },
  { id: "redeemed", label: "Coins Redeemed" },
  { id: "bonus", label: "Bonus Coins" },
  { id: "referral", label: "Referral Coins" },
  { id: "adjusted", label: "Admin Adjusted" },
  { id: "reversed", label: "Reversed", future: true },
];

const REWARD_SOURCE_CHIPS: ChipDef[] = [
  { id: "daily", label: "Daily Login" },
  { id: "mission", label: "Mission Reward" },
  { id: "achievement", label: "Achievement" },
  { id: "referral", label: "Referral Bonus" },
  { id: "event", label: "Event Reward" },
  { id: "leaderboard", label: "Leaderboard" },
];

const REDEEM_STATUS_CHIPS: ChipDef[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const LAST_ACTIVITY_CHIPS: ChipDef[] = [
  { id: "1h", label: "Last 1 hour" },
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
];

const VERIFICATION_CHIPS: ChipDef[] = [
  { id: "verified", label: "Verified" },
  { id: "unverified", label: "Unverified" },
  { id: "pending", label: "Pending Review" },
];

const RISK_CHIPS: ChipDef[] = [
  { id: "low", label: "Low Risk" },
  { id: "medium", label: "Medium Risk" },
  { id: "high", label: "High Risk" },
  { id: "critical", label: "Critical" },
];

const FUTURE_CURRENCY_CHIPS: ChipDef[] = [
  { id: "usd", label: "USD", future: true },
  { id: "inr", label: "INR", future: true },
  { id: "eur", label: "EUR", future: true },
  { id: "gbp", label: "GBP", future: true },
];

const FUTURE_PAYMENT_METHOD_CHIPS: ChipDef[] = [
  { id: "upi", label: "UPI", future: true },
  { id: "bank", label: "Bank Transfer", future: true },
  { id: "paypal", label: "PayPal", future: true },
  { id: "card", label: "Credit Card", future: true },
  { id: "crypto", label: "Crypto", future: true },
];

const FUTURE_COUNTRY_CHIPS: ChipDef[] = [
  { id: "us", label: "United States", future: true },
  { id: "in", label: "India", future: true },
  { id: "uk", label: "United Kingdom", future: true },
  { id: "ca", label: "Canada", future: true },
  { id: "au", label: "Australia", future: true },
];

const SORT_OPTIONS = [
  "Highest Current Balance",
  "Lowest Current Balance",
  "Most Lifetime Earned",
  "Most Lifetime Redeemed",
  "Recently Updated",
  "Oldest Updated",
  "Recently Created",
  "Highest Risk Score",
] as const;

interface OverviewStatDef {
  label: string;
  value: number;
  icon: string;
  accent: Accent;
  future?: boolean;
  trend?: { value: number; positive: boolean };
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const OVERVIEW_STATS: OverviewStatDef[] = [
  { label: "Total Coins Issued", value: 0, icon: "Coins", accent: "gold" },
  { label: "Total Coins Earned", value: 0, icon: "TrendingUp", accent: "emerald", trend: { value: 0, positive: true } },
  { label: "Total Coins Redeemed", value: 0, icon: "Trophy", accent: "purple", trend: { value: 0, positive: true } },
  { label: "Coins In Circulation", value: 0, icon: "Wallet", accent: "electric" },
  { label: "Pending Wallet Operations", value: 0, icon: "Clock", accent: "cyan" },
  { label: "Pending Redeems", value: 0, icon: "Gift", accent: "gold" },
  { label: "Average User Balance", value: 0, icon: "BarChart3", accent: "navy" },
  { label: "Highest Wallet Balance", value: 0, icon: "Crown", accent: "purple" },
  { label: "Future Revenue", value: 0, icon: "DollarSign", accent: "emerald", future: true, prefix: "$" },
  { label: "Future Profit", value: 0, icon: "TrendingUp", accent: "emerald", future: true, prefix: "$" },
  { label: "Future Advertisement Revenue", value: 0, icon: "Megaphone", accent: "cyan", future: true, prefix: "$" },
  { label: "Future Operational Cost", value: 0, icon: "Receipt", accent: "rose", future: true, prefix: "$" },
];

/* Wallet table column layout (desktop grid):
   [40px] checkbox
   [120px] Wallet ID
   [1fr]   User
   [110px] Current Balance   (lg+)
   [110px] Pending Balance   (xl+)
   [110px] Lifetime Earned   (xl+)
   [110px] Lifetime Redeemed (2xl+)
   [120px] Wallet Status
   [130px] Verification      (lg+)
   [130px] Last Updated      (xl+)
   [90px]  Details
   [56px]  Actions
*/
const WALLET_TABLE_GRID =
  "grid-cols-[40px_120px_minmax(180px,1fr)_110px_110px_110px_110px_120px_130px_130px_90px_56px]";

const TX_TABLE_GRID =
  "grid-cols-[40px_140px_minmax(160px,1fr)_140px_90px_120px_130px_130px_90px_56px_56px]";

const ANALYTICS_PERIODS = ["7D", "30D", "90D", "1Y"] as const;
type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

const CHART_COLORS: Record<Accent, string> = {
  electric: "oklch(0.62 0.22 255)",
  cyan: "oklch(0.72 0.15 200)",
  purple: "oklch(0.6 0.22 295)",
  gold: "oklch(0.8 0.16 85)",
  emerald: "oklch(0.7 0.17 160)",
  rose: "oklch(0.65 0.21 15)",
  navy: "oklch(0.35 0.1 260)",
};

const PIE_COLORS = [
  CHART_COLORS.electric,
  CHART_COLORS.cyan,
  CHART_COLORS.purple,
  CHART_COLORS.gold,
  CHART_COLORS.emerald,
  CHART_COLORS.rose,
];

const DAILY_FLOW = [
  { label: "Mon", issued: 0, redeemed: 0 },
  { label: "Tue", issued: 0, redeemed: 0 },
  { label: "Wed", issued: 0, redeemed: 0 },
  { label: "Thu", issued: 0, redeemed: 0 },
  { label: "Fri", issued: 0, redeemed: 0 },
  { label: "Sat", issued: 0, redeemed: 0 },
  { label: "Sun", issued: 0, redeemed: 0 },
];

const WALLET_GROWTH = [
  { label: "W1", value: 0 },
  { label: "W2", value: 0 },
  { label: "W3", value: 0 },
  { label: "W4", value: 0 },
  { label: "W5", value: 0 },
  { label: "W6", value: 0 },
  { label: "W7", value: 0 },
  { label: "W8", value: 0 },
];

const MONTHLY_FLOW = [
  { label: "Jan", issued: 0, redeemed: 0 },
  { label: "Feb", issued: 0, redeemed: 0 },
  { label: "Mar", issued: 0, redeemed: 0 },
  { label: "Apr", issued: 0, redeemed: 0 },
  { label: "May", issued: 0, redeemed: 0 },
  { label: "Jun", issued: 0, redeemed: 0 },
];

const COIN_DISTRIBUTION = [
  { name: "Circulating", value: 35, color: PIE_COLORS[0] },
  { name: "Earned", value: 25, color: PIE_COLORS[1] },
  { name: "Pending", value: 15, color: PIE_COLORS[2] },
  { name: "Redeemed", value: 15, color: PIE_COLORS[3] },
  { name: "Reserve", value: 10, color: PIE_COLORS[4] },
];

const REWARD_DISTRIBUTION = [
  { name: "Daily", value: 30, color: PIE_COLORS[0] },
  { name: "Mission", value: 25, color: PIE_COLORS[1] },
  { name: "Achievement", value: 20, color: PIE_COLORS[2] },
  { name: "Referral", value: 15, color: PIE_COLORS[3] },
  { name: "Event", value: 10, color: PIE_COLORS[4] },
];

const REDEEM_DISTRIBUTION = [
  { name: "Pending", value: 25, color: PIE_COLORS[2] },
  { name: "Approved", value: 35, color: PIE_COLORS[4] },
  { name: "Rejected", value: 15, color: PIE_COLORS[5] },
  { name: "Completed", value: 25, color: PIE_COLORS[1] },
];

const REFERRAL_DISTRIBUTION = [
  { name: "Active Referrers", value: 40, color: PIE_COLORS[4] },
  { name: "Pending Bonus", value: 20, color: PIE_COLORS[2] },
  { name: "Capped", value: 15, color: PIE_COLORS[5] },
  { name: "Expired", value: 25, color: PIE_COLORS[3] },
];

const ADMIN_WALLET_ACTIONS: {
  id: string;
  label: string;
  icon: typeof Eye;
  variant?: "default" | "warning" | "destructive";
  future?: boolean;
}[] = [
  { id: "view", label: "View Wallet", icon: Eye },
  { id: "view-tx", label: "View Transactions", icon: History },
  { id: "view-rewards", label: "View Rewards", icon: Gift },
  { id: "view-redeems", label: "View Redeems", icon: Trophy },
  { id: "add", label: "Future Add Coins", icon: ArrowUpRight, variant: "default", future: true },
  { id: "remove", label: "Future Remove Coins", icon: ArrowDownLeft, variant: "warning", future: true },
  { id: "adjust", label: "Future Adjust Balance", icon: SlidersHorizontal, variant: "default", future: true },
  { id: "freeze", label: "Future Freeze Wallet", icon: Snowflake, variant: "warning", future: true },
  { id: "unfreeze", label: "Future Unfreeze Wallet", icon: Unlock, variant: "default", future: true },
  { id: "reset", label: "Future Reset Wallet", icon: RotateCcw, variant: "destructive", future: true },
  { id: "notes", label: "Future Wallet Notes", icon: StickyNote, variant: "default", future: true },
];

const COIN_ECONOMY_CARDS: {
  label: string;
  icon: typeof Coins;
  accent: Accent;
  future?: boolean;
  desc: string;
}[] = [
  { label: "Total Platform Coins", icon: Coins, accent: "gold", desc: "All coins ever minted" },
  { label: "Daily Coin Creation", icon: Sparkles, accent: "electric", desc: "New coins issued today" },
  { label: "Daily Coin Redemption", icon: Trophy, accent: "purple", desc: "Coins redeemed today" },
  { label: "Pending Rewards", icon: Gift, accent: "cyan", desc: "Awaiting distribution" },
  { label: "Coin Velocity", icon: Activity, accent: "emerald", future: true, desc: "Circulation speed index" },
  { label: "Future Inflation", icon: TrendingUp, accent: "rose", future: true, desc: "Coin supply growth" },
  { label: "Future Burn Rate", icon: Flame, accent: "rose", future: true, desc: "Coins removed daily" },
  { label: "Future Economy Health", icon: ShieldCheck, accent: "navy", future: true, desc: "Composite health score" },
];

const SECURITY_CARDS: {
  label: string;
  icon: typeof ShieldCheck;
  accent: Accent;
  future?: boolean;
  desc: string;
}[] = [
  { label: "Wallet Verification", icon: ShieldCheck, accent: "emerald", desc: "Verified wallet ratio" },
  { label: "Fraud Detection", icon: ShieldAlert, accent: "rose", future: true, desc: "ML-powered fraud signals" },
  { label: "Suspicious Activity", icon: AlertTriangle, accent: "gold", desc: "Flagged transactions" },
  { label: "Future AML", icon: BadgeAlert, accent: "navy", future: true, desc: "Anti-money laundering checks" },
  { label: "Future Risk Detection", icon: Fingerprint, accent: "purple", future: true, desc: "Behavioral risk scoring" },
  { label: "Future Duplicate Wallets", icon: Copy, accent: "cyan", future: true, desc: "Multi-wallet abuse scan" },
  { label: "Future Coin Abuse", icon: Ban, accent: "rose", future: true, desc: "Farming & exploit detection" },
];

const REPORT_CARDS: {
  id: string;
  label: string;
  icon: typeof FileText;
  accent: Accent;
  future?: boolean;
  desc: string;
}[] = [
  { id: "daily", label: "Daily Report", icon: FileText, accent: "electric", desc: "24-hour wallet snapshot" },
  { id: "weekly", label: "Weekly Report", icon: Calendar, accent: "cyan", desc: "7-day financial summary" },
  { id: "monthly", label: "Monthly Report", icon: BarChart3, accent: "purple", desc: "30-day aggregate analytics" },
  { id: "yearly", label: "Yearly Report", icon: TrendingUp, accent: "gold", desc: "Annual financial rollup" },
  { id: "wallet", label: "Wallet Report", icon: Wallet, accent: "emerald", desc: "Per-wallet activity ledger" },
  { id: "reward", label: "Reward Report", icon: Gift, accent: "purple", desc: "Reward distribution audit" },
  { id: "redeem", label: "Redeem Report", icon: Trophy, accent: "gold", desc: "Redemption fulfillment log" },
  { id: "profit", label: "Future Profit Report", icon: DollarSign, accent: "emerald", future: true, desc: "P&L statement export" },
  { id: "tax", label: "Future Tax Report", icon: Receipt, accent: "rose", future: true, desc: "Regulatory tax filing pack" },
];

const EXPORT_TILES = [
  { id: "csv", label: "CSV Export", desc: "Comma-separated values", icon: FileText },
  { id: "excel", label: "Excel Workbook", desc: "Microsoft .xlsx", icon: Briefcase },
  { id: "pdf", label: "PDF Report", desc: "Formatted PDF document", icon: Printer },
  { id: "print", label: "Print Preview", desc: "Print-ready layout", icon: Printer },
  { id: "scheduled", label: "Future Scheduled Reports", desc: "Daily / weekly / monthly cadence", icon: Calendar, future: true },
  { id: "cloud", label: "Future Cloud Export", desc: "Direct to S3 / GCS / Azure", icon: Network, future: true },
];

const BULK_WALLET_ACTIONS = [
  { id: "export", label: "Export Selected", icon: Download, future: true },
  { id: "freeze", label: "Freeze Wallets", icon: Snowflake, variant: "warning" as const, future: true },
  { id: "unfreeze", label: "Unfreeze Wallets", icon: Unlock, future: true },
  { id: "verify", label: "Bulk Verify", icon: ShieldCheck, future: true },
  { id: "adjust", label: "Bulk Adjust", icon: SlidersHorizontal, future: true },
  { id: "audit", label: "Bulk Audit", icon: History, future: true },
];

/* ============================================================
   Reusable Helper: FilterChip
   Pill toggle for filter categories. UI-only.
   ============================================================ */

interface FilterChipProps {
  label: string;
  active?: boolean;
  future?: boolean;
  onClick?: () => void;
  accent?: Accent;
}

export function FilterChip({ label, active, future, onClick, accent = "electric" }: FilterChipProps) {
  const accentActive: Record<Accent, string> = {
    electric: "bg-electric/15 text-electric ring-electric/30",
    cyan: "bg-cyan/15 text-cyan-brand ring-cyan-brand/30",
    purple: "bg-purple/15 text-purple-brand ring-purple-brand/30",
    gold: "bg-gold/15 text-gold ring-gold/30",
    emerald: "bg-emerald-brand/15 text-emerald-brand ring-emerald-brand/30",
    rose: "bg-rose-brand/15 text-rose-brand ring-rose-brand/30",
    navy: "bg-navy/15 text-navy ring-navy/30",
  };
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-all whitespace-nowrap",
        active
          ? accentActive[accent]
          : "bg-transparent text-muted-foreground ring-border hover:bg-accent/60 hover:text-foreground"
      )}
    >
      {future && <Lock size={10} className="opacity-60" />}
      {label}
      {active && !future && <CheckCircle2 size={12} />}
    </motion.button>
  );
}

/* ============================================================
   Reusable Helper: ConfirmActionDialog
   Confirmation modal for admin wallet actions. No backend.
   ============================================================ */

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  variant?: "default" | "warning" | "destructive";
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon,
}: ConfirmActionDialogProps) {
  const btnVariant =
    variant === "destructive"
      ? "destructive"
      : variant === "warning"
      ? "gold"
      : "electric";
  const accent =
    variant === "destructive" ? "rose" : variant === "warning" ? "gold" : "electric";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <IconBadge
              name={variant === "destructive" ? "AlertTriangle" : variant === "warning" ? "ShieldAlert" : "ShieldCheck"}
              accent={accent}
            />
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        {icon && <div className="rounded-xl glass-2 p-3 text-xs text-muted-foreground">{icon}</div>}
        <DialogFooter className="gap-2">
          <LootButton variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </LootButton>
          <LootButton
            variant={btnVariant as "electric" | "gold" | "destructive"}
            size="sm"
            leftIcon={<ShieldCheck size={14} />}
            onClick={() => onOpenChange(false)}
          >
            {confirmLabel}
          </LootButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Reusable Helper: AdminWalletActionMenu
   Dropdown with all admin wallet actions. Triggers confirmation
   dialogs for warning/destructive operations.
   ============================================================ */

export function AdminWalletActionMenu({ compact = false }: { compact?: boolean }) {
  const [confirm, setConfirm] = useState<{ open: boolean; actionId: string | null }>({
    open: false,
    actionId: null,
  });

  const triggerAction = (action: (typeof ADMIN_WALLET_ACTIONS)[number]) => {
    if (action.variant === "warning" || action.variant === "destructive") {
      setConfirm({ open: true, actionId: action.id });
    }
  };

  const currentAction = ADMIN_WALLET_ACTIONS.find((a) => a.id === confirm.actionId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileTap={{ scale: 0.94 }}
            className={cn(
              "inline-flex items-center justify-center rounded-lg glass-2 ring-1 ring-border text-foreground hover:glass-3 transition-all",
              compact ? "size-8" : "size-9"
            )}
            aria-label="Wallet administrator actions"
          >
            <MoreVertical size={compact ? 14 : 16} />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 glass-2 ring-1 ring-border">
          <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Wallet Administrator Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ADMIN_WALLET_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            const isDestructive = action.variant === "destructive";
            const isWarning = action.variant === "warning";
            const needsSepBefore =
              i > 0 &&
              ADMIN_WALLET_ACTIONS[i - 1]?.variant !== action.variant &&
              action.variant !== "default";
            return (
              <div key={action.id}>
                {needsSepBefore && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onSelect={() => triggerAction(action)}
                  className={cn(
                    "gap-2.5 cursor-pointer text-sm",
                    isDestructive && "text-rose-brand focus:text-rose-brand",
                    isWarning && "text-gold focus:text-gold"
                  )}
                >
                  <Icon size={15} className="opacity-80" />
                  <span className="flex-1">{action.label}</span>
                  {action.future && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 px-1.5 py-0.5 rounded bg-muted">
                      Soon
                    </span>
                  )}
                </DropdownMenuItem>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmActionDialog
        open={confirm.open}
        onOpenChange={(o) => setConfirm({ open: o, actionId: confirm.actionId })}
        title={currentAction?.label ?? "Confirm Action"}
        description={
          currentAction?.variant === "destructive"
            ? "This is a destructive placeholder action. No wallet state will be modified. Backend integration is pending."
            : "This is a placeholder wallet administrative action. No state will change. Backend integration is pending."
        }
        variant={currentAction?.variant === "destructive" ? "destructive" : "warning"}
        confirmLabel={currentAction?.variant === "destructive" ? "Confirm Reset" : "Confirm"}
      />
    </>
  );
}

/* ============================================================
   Reusable Helper: WalletTableRow
   Skeleton table row matching the wallet column layout.
   ============================================================ */

export function WalletTableRow() {
  return (
    <div
      className={cn(
        "grid items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors",
        WALLET_TABLE_GRID
      )}
    >
      <Checkbox aria-label="Select wallet row" />
      <div className="h-3 w-20 rounded shimmer" />
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-full shimmer shrink-0" />
        <div className="space-y-1.5 min-w-0">
          <div className="h-3 w-28 rounded shimmer" />
          <div className="h-2.5 w-36 rounded shimmer" />
        </div>
      </div>
      <div className="h-3 w-14 rounded shimmer" />
      <div className="h-3 w-14 rounded shimmer" />
      <div className="h-3 w-14 rounded shimmer" />
      <div className="h-3 w-14 rounded shimmer" />
      <div className="h-5 w-20 rounded-full shimmer" />
      <div className="h-5 w-24 rounded-full shimmer" />
      <div className="h-3 w-20 rounded shimmer" />
      <div className="h-7 w-14 rounded-md shimmer" />
      <div className="size-7 rounded-md shimmer" />
    </div>
  );
}

/* ============================================================
   Reusable Helper: WalletCardMobile
   Skeleton mobile card for wallets list.
   ============================================================ */

export function WalletCardMobile() {
  return (
    <GlassCard level={1} className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox />
        <div className="size-11 rounded-full shimmer shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="h-3 w-32 rounded shimmer" />
          <div className="h-2.5 w-40 rounded shimmer" />
        </div>
        <div className="h-5 w-16 rounded-full shimmer" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2.5 w-10 rounded shimmer" />
            <div className="h-3.5 w-12 rounded shimmer" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="h-5 w-20 rounded-full shimmer" />
        <div className="h-5 w-24 rounded-full shimmer" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="h-3 w-24 rounded shimmer" />
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-14 rounded-md shimmer" />
          <div className="size-7 rounded-md shimmer" />
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================================================
   Reusable Helper: AnalyticsTabs
   Period selector for analytics chart widgets.
   ============================================================ */

export function AnalyticsTabs({
  value,
  onChange,
}: {
  value: AnalyticsPeriod;
  onChange: (v: AnalyticsPeriod) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl glass-2 ring-1 ring-border">
      {ANALYTICS_PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
            value === p
              ? "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   Reusable Helper: BulkActionBar
   Sticky bar shown above the wallet table when items selected.
   ============================================================ */

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
}

/* Module-level helper for table column header cells. */
function HeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

function BulkActionBar({ selectedCount, onClear }: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-4"
        >
          <GlassCard level={2} className="p-3 flex flex-wrap items-center gap-2 ring-1 ring-electric/20">
            <div className="flex items-center gap-2 pr-3 border-r border-border/60">
              <span className="inline-flex items-center justify-center size-7 rounded-lg bg-electric/15 text-electric text-xs font-bold">
                {selectedCount}
              </span>
              <span className="text-xs font-semibold text-foreground">wallets selected</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {BULK_WALLET_ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.id}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold ring-1 transition-all",
                      a.variant === "warning"
                        ? "text-gold ring-gold/30 bg-gold/5 hover:bg-gold/10"
                        : "text-foreground ring-border bg-transparent hover:bg-accent/60"
                    )}
                  >
                    <Icon size={12} />
                    {a.label}
                    {a.future && <Lock size={9} className="opacity-60" />}
                  </button>
                );
              })}
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={onClear}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
              >
                <X size={12} /> Clear
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   Reusable Helper: WalletDetailsDrawer
   Right-side Sheet drawer with full wallet financial breakdown.
   All skeleton/placeholder content.
   ============================================================ */

export function WalletDetailsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const summaryTiles: {
    label: string;
    icon: typeof Wallet;
    accent: Accent;
    future?: boolean;
  }[] = [
    { label: "Current Balance", icon: Wallet, accent: "electric" },
    { label: "Pending Coins", icon: Clock, accent: "cyan" },
    { label: "Lifetime Earnings", icon: TrendingUp, accent: "emerald" },
    { label: "Lifetime Redeems", icon: Trophy, accent: "gold" },
    { label: "Daily Earnings", icon: Calendar, accent: "purple", future: true },
    { label: "Monthly Earnings", icon: BarChart3, accent: "navy", future: true },
  ];

  const summaryCards: {
    label: string;
    icon: typeof Gift;
    accent: Accent;
    future?: boolean;
  }[] = [
    { label: "Reward Summary", icon: Gift, accent: "purple" },
    { label: "Redeem Summary", icon: Trophy, accent: "gold" },
    { label: "Referral Summary", icon: UserPlus, accent: "emerald" },
    { label: "Achievement Bonus", icon: Crown, accent: "purple", future: true },
    { label: "Future Payment Accounts", icon: Banknote, accent: "cyan", future: true },
    { label: "Future Linked Wallets", icon: Network, accent: "navy", future: true },
  ];

  const profileFields: { label: string; icon: string; future?: boolean }[] = [
    { label: "Wallet ID", icon: "Wallet" },
    { label: "Owner", icon: "Users" },
    { label: "Wallet Type", icon: "Layers" },
    { label: "Created At", icon: "Calendar" },
    { label: "Last Activity", icon: "Clock" },
    { label: "Verification Status", icon: "ShieldCheck" },
    { label: "Risk Score", icon: "AlertTriangle", future: true },
    { label: "Linked Devices", icon: "Smartphone", future: true },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl lg:max-w-2xl p-0 overflow-y-auto glass-nav ring-1 ring-border/50"
      >
        {/* Banner */}
        <div className="relative h-32 sm:h-36 bg-[linear-gradient(120deg,var(--navy),var(--electric)_55%,var(--purple-brand))] overflow-hidden">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay">
            <div className="absolute -top-8 -right-8 size-40 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-12 left-10 size-32 rounded-full bg-cyan-brand/30 blur-2xl" />
          </div>
          <SheetHeader className="absolute inset-x-0 top-0 p-4">
            <SheetTitle className="sr-only">Wallet Details</SheetTitle>
            <SheetDescription className="sr-only">
              Detailed administrator view of wallet financial profile.
            </SheetDescription>
          </SheetHeader>
          <div className="absolute bottom-3 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/20">
            <Lock size={10} /> ADMIN VIEW
          </div>
        </div>

        {/* Wallet header */}
        <div className="px-5 -mt-10 relative">
          <div className="flex items-end gap-4">
            <div className="size-20 rounded-2xl glass-2 ring-4 ring-background flex items-center justify-center shrink-0">
              <Wallet className="text-electric" size={28} />
            </div>
            <div className="flex-1 space-y-2 pb-2">
              <div className="h-5 w-40 rounded shimmer" />
              <div className="h-3 w-56 rounded shimmer" />
            </div>
            <StatusBadge variant="info" dot pulse>
              Active
            </StatusBadge>
          </div>

          {/* Summary tiles */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {summaryTiles.map((m) => {
              const Icon = m.icon;
              return (
                <GlassCard key={m.label} level={2} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Icon size={14} className="opacity-60" />
                    {m.future && <Lock size={9} className="text-muted-foreground/60" />}
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 w-14 rounded shimmer" />
                    <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Profile info grid */}
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-5 mb-2.5 px-1">
            Wallet Profile
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {profileFields.map((item) => (
              <GlassCard key={item.label} level={2} className="p-3 flex items-center gap-2.5">
                <IconBadge name={item.icon} accent="electric" size="sm" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                      {item.label}
                    </p>
                    {item.future && <Lock size={9} className="text-muted-foreground/60" />}
                  </div>
                  <div className="h-3 w-3/4 rounded shimmer" />
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Summary cards */}
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-5 mb-2.5 px-1">
            Financial Summaries
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {summaryCards.map((s) => {
              const Icon = s.icon;
              return (
                <GlassCard key={s.label} level={2} className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground">{s.label}</span>
                    </div>
                    {s.future ? <Lock size={9} className="text-muted-foreground/60" /> : <ChevronRight size={12} className="text-muted-foreground/60" />}
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-4 w-16 rounded shimmer" />
                    <div className="h-2.5 w-3/4 rounded shimmer" />
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Admin action footer */}
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-5 mb-2.5 px-1">
            Administrator Controls
          </p>
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <LootButton size="sm" variant="glass" leftIcon={<Eye size={13} />}>
              View Transactions
            </LootButton>
            <LootButton size="sm" variant="outline" leftIcon={<Gift size={13} />}>
              View Rewards
            </LootButton>
            <LootButton size="sm" variant="outline" leftIcon={<Trophy size={13} />}>
              View Redeems
            </LootButton>
            <AdminWalletActionMenu compact />
          </div>
        </div>

        <div className="h-8" />
      </SheetContent>
    </Sheet>
  );
}

/* ============================================================
   Empty / Error State Helpers
   ============================================================ */

export function NoWalletsEmpty({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon="Wallet"
      title="No wallets on the platform yet"
      description="No user wallets have been initialized. New sign-ups will mint their wallet automatically."
      action={
        onReset && (
          <LootButton variant="glass" size="sm" leftIcon={<RefreshCw size={14} />} onClick={onReset}>
            Refresh
          </LootButton>
        )
      }
    />
  );
}

export function NoTransactionsEmpty({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon="Receipt"
      title="No transactions found"
      description="No coin movements matched your current filters. Try adjusting the criteria or clearing filters."
      action={
        onClear && (
          <LootButton variant="glass" size="sm" leftIcon={<X size={14} />} onClick={onClear}>
            Clear Filters
          </LootButton>
        )
      }
    />
  );
}

export function WalletModuleUnavailableError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon="ServerCrash"
      title="Wallet module temporarily unavailable"
      description="We could not reach the wallet management service. Please retry or check service status in Mission Control."
      variant="error"
      action={
        onRetry && (
          <LootButton variant="electric" size="sm" leftIcon={<RefreshCw size={14} />} onClick={onRetry}>
            Retry
          </LootButton>
        )
      }
    />
  );
}

/* ============================================================
   Section: Financial Overview
   ============================================================ */

function FinancialOverviewSection() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
      <Grid cols={4}>
        {OVERVIEW_STATS.map((s, i) => (
          <div key={s.label} variants={cardReveal} custom={i} className="relative">
            {s.future && (
              <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                <Lock size={8} /> Soon
              </span>
            )}
            <StatCard
              index={i}
              label={s.label}
              value={s.value}
              icon={s.icon}
              accent={s.accent}
              trend={s.trend}
              prefix={s.prefix}
              suffix={s.suffix}
              decimals={s.decimals}
            />
          </div>
        ))}
      </Grid>
    </motion.div>
  );
}

/* ============================================================
   Section: Global Wallet Search
   ============================================================ */

function GlobalWalletSearchSection() {
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState("walletid");

  return (
    <WidgetCard
      title="Global Wallet Search"
      description="Cross-platform wallet lookup by identifier"
      icon={<Search size={18} className="text-electric" />}
      action={<StatusBadge variant="info" dot pulse>Live</StatusBadge>}
    >
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by User ID, Wallet ID, Username, Email, Phone, Transaction ID, UPI, Payment ID, Reference ID…"
            className="w-full h-11 pl-10 pr-24 rounded-xl glass-2 ring-1 ring-border text-sm text-foreground placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-electric/40 focus:outline-none transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
              >
                <X size={13} />
              </button>
            )}
            <LootButton size="sm" variant="electric" leftIcon={<Search size={13} />}>
              Search
            </LootButton>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mr-1">
            Search by:
          </span>
          {SEARCH_BY_CHIPS.map((c) => (
            <FilterChip
              key={c.id}
              label={c.label}
              active={activeChip === c.id}
              future={c.future}
              onClick={() => setActiveChip(c.id)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground">
            Real-time search active. Results filter as you type.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ScanLine size={11} className="text-electric" />
            Indexed across all wallet identifiers
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section: Advanced Filters
   ============================================================ */

function AdvancedFiltersSection() {
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>("Highest Current Balance");
  const [active, setActive] = useState<Record<string, string[]>>({
    wallet: ["active"],
    txtype: [],
    reward: [],
    redeem: [],
    activity: [],
    verification: ["verified"],
    risk: [],
    currency: [],
    payment: [],
    country: [],
  });

  const toggle = (group: string, id: string) =>
    setActive((s) => ({
      ...s,
      [group]: s[group]?.includes(id)
        ? s[group].filter((x) => x !== id)
        : [...(s[group] ?? []), id],
    }));

  const resetAll = () =>
    setActive({
      wallet: [],
      txtype: [],
      reward: [],
      redeem: [],
      activity: [],
      verification: [],
      risk: [],
      currency: [],
      payment: [],
      country: [],
    });

  const activeFilterCount = useMemo(
    () => Object.values(active).reduce((acc, arr) => acc + (arr?.length ?? 0), 0),
    [active]
  );

  const renderChipGroup = (group: string, chips: ChipDef[], accent: Accent = "electric") => (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{group}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {chips.map((c) => (
          <FilterChip
            key={c.id}
            label={c.label}
            active={active[group]?.includes(c.id)}
            future={c.future}
            accent={accent}
            onClick={() => toggle(group, c.id)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="Advanced Filters"
      description="Granular refinement across wallet, transaction, reward & redeem dimensions"
      icon={<SlidersHorizontal size={18} className="text-electric" />}
      action={
        <div className="flex items-center gap-2">
          <StatusBadge variant={activeFilterCount > 0 ? "electric" : "default"} dot>
            {activeFilterCount} filters
          </StatusBadge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg glass-2 ring-1 ring-border text-xs font-semibold text-foreground hover:glass-3 transition-all">
                <ArrowRight size={12} className="text-muted-foreground" />
                {sort}
                <ChevronDown size={12} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 glass-2 ring-1 ring-border">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sort By
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onSelect={() => setSort(opt)}
                  className="gap-2 cursor-pointer text-sm"
                >
                  {sort === opt && <CheckCircle2 size={13} className="text-electric" />}
                  <span className={cn(sort === opt && "ml-[-1.125rem]")}>{opt}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Coin balance range + registration date */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard level={1} className="p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Coins size={12} className="text-gold" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Coin Balance Range
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Min</label>
                <input
                  type="number"
                  placeholder="0"
                  className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-gold/40 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Max</label>
                <input
                  type="number"
                  placeholder="∞"
                  className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-gold/40 focus:outline-none"
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard level={1} className="p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-electric" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Registration Date Range
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">From</label>
                <input
                  type="date"
                  className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground focus:ring-2 focus:ring-electric/40 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">To</label>
                <input
                  type="date"
                  className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground focus:ring-2 focus:ring-electric/40 focus:outline-none"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Primary chip groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderChipGroup("Wallet Status", WALLET_STATUS_CHIPS, "gold")}
          {renderChipGroup("Transaction Type", TRANSACTION_TYPE_CHIPS, "electric")}
          {renderChipGroup("Reward Source", REWARD_SOURCE_CHIPS, "purple")}
          {renderChipGroup("Redeem Status", REDEEM_STATUS_CHIPS, "emerald")}
          {renderChipGroup("Last Wallet Activity", LAST_ACTIVITY_CHIPS, "cyan")}
          {renderChipGroup("Verification Status", VERIFICATION_CHIPS, "emerald")}
          {renderChipGroup("Future Risk Score", RISK_CHIPS, "rose")}
          {renderChipGroup("Future Currency", FUTURE_CURRENCY_CHIPS, "gold")}
          {renderChipGroup("Future Payment Method", FUTURE_PAYMENT_METHOD_CHIPS, "cyan")}
          {renderChipGroup("Future Country", FUTURE_COUNTRY_CHIPS, "navy")}
        </div>

        {/* Active filter chips preview */}
        <GlassCard level={1} className="p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Active Filter Chips
            </p>
            <span className="text-[10px] text-muted-foreground">{activeFilterCount} active</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
            {activeFilterCount === 0 ? (
              <p className="text-[11px] text-muted-foreground/70 italic">No filters applied — showing all wallets.</p>
            ) : (
              Object.entries(active).flatMap(([group, ids]) =>
                ids.map((id) => (
                  <span
                    key={`${group}-${id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-electric/10 text-electric ring-1 ring-electric/20 px-2 py-0.5 text-[10px] font-semibold"
                  >
                    {id}
                    <X size={10} className="opacity-70 cursor-pointer" onClick={() => toggle(group, id)} />
                  </span>
                ))
              )
            )}
          </div>
        </GlassCard>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all">
            <Star size={12} /> Saved Filters
            <Lock size={9} className="opacity-60" />
          </button>
          <div className="flex items-center gap-2">
            <LootButton variant="ghost" size="sm" leftIcon={<RotateCcw size={13} />} onClick={resetAll}>
              Reset Filters
            </LootButton>
            <LootButton variant="electric" size="sm" leftIcon={<Filter size={13} />}>
              Apply Filters
            </LootButton>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section: Wallet Table
   ============================================================ */

function WalletTableSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const allSelected = selected.length === 10;

  const toggleAll = () => setSelected(allSelected ? [] : Array.from({ length: 10 }, (_, i) => i));
  const toggleOne = (i: number) =>
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  return (
    <WidgetCard
      title="Wallet Directory"
      description="All platform wallets — live executive table"
      icon={<Wallet size={18} className="text-electric" />}
      action={
        <div className="flex items-center gap-2">
          <StatusBadge variant="info" dot pulse>{selected.length} selected</StatusBadge>
          <LootButton size="sm" variant="glass" leftIcon={<RefreshCw size={13} />}>
            Refresh
          </LootButton>
        </div>
      }
    >
      <BulkActionBar selectedCount={selected.length} onClear={() => setSelected([])} />

      {/* ===== Desktop table ===== */}
      <div className="hidden xl:block rounded-xl overflow-hidden ring-1 ring-border/60">
        {/* Header row */}
        <div className={cn("bg-muted/40 grid items-center gap-3 px-4 py-2.5 border-b border-border", WALLET_TABLE_GRID)}>
          <div className="flex items-center">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all wallets" />
          </div>
          <HeaderCell>Wallet ID</HeaderCell>
          <HeaderCell>User</HeaderCell>
          <HeaderCell>Current Balance</HeaderCell>
          <HeaderCell>Pending Balance</HeaderCell>
          <HeaderCell>Lifetime Earned</HeaderCell>
          <HeaderCell>Lifetime Redeemed</HeaderCell>
          <HeaderCell>Wallet Status</HeaderCell>
          <HeaderCell>Verification</HeaderCell>
          <HeaderCell>Last Updated</HeaderCell>
          <HeaderCell className="text-right">Details</HeaderCell>
          <HeaderCell className="text-right">Actions</HeaderCell>
        </div>
        {/* Skeleton rows */}
        <div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "grid items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors",
                WALLET_TABLE_GRID
              )}
            >
              <Checkbox
                checked={selected.includes(i)}
                onCheckedChange={() => toggleOne(i)}
                aria-label={`Select wallet row ${i + 1}`}
              />
              <div className="h-3 w-20 rounded shimmer" />
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full shimmer shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <div className="h-3 w-28 rounded shimmer" />
                  <div className="h-2.5 w-36 rounded shimmer" />
                </div>
              </div>
              <div className="h-3 w-14 rounded shimmer" />
              <div className="h-3 w-14 rounded shimmer" />
              <div className="h-3 w-14 rounded shimmer" />
              <div className="h-3 w-14 rounded shimmer" />
              <div className="h-5 w-20 rounded-full shimmer" />
              <div className="h-5 w-24 rounded-full shimmer" />
              <div className="h-3 w-20 rounded shimmer" />
              <div className="flex items-center justify-end">
                <LootButton
                  size="sm"
                  variant="outline"
                  leftIcon={<Eye size={12} />}
                  onClick={() => setDrawerOpen(true)}
                >
                  View
                </LootButton>
              </div>
              <div className="flex items-center justify-end">
                <AdminWalletActionMenu compact />
              </div>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="bg-muted/30 flex items-center justify-between px-4 py-2.5 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            Showing <span className="font-semibold text-foreground">1–10</span> of{" "}
            <span className="font-semibold text-foreground">—</span> wallets
          </p>
          <div className="flex items-center gap-1">
            <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 disabled:opacity-40 transition-all" disabled>
              <ChevronDown size={14} className="rotate-90" />
            </button>
            <span className="text-[11px] font-semibold text-foreground px-1.5">1 / —</span>
            <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 disabled:opacity-40 transition-all" disabled>
              <ChevronDown size={14} className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Mobile cards ===== */}
      <div className="xl:hidden space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all wallets" />
          <span className="text-[11px] text-muted-foreground">
            {selected.length > 0 ? `${selected.length} of 10 selected` : "Tap checkbox to select"}
          </span>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <WalletCardMobile />
            <div className="flex items-center justify-end gap-2 -mt-1">
              <LootButton
                size="sm"
                variant="outline"
                leftIcon={<Eye size={12} />}
                onClick={() => setDrawerOpen(true)}
              >
                View
              </LootButton>
              <AdminWalletActionMenu compact />
            </div>
          </div>
        ))}
      </div>

      <WalletDetailsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </WidgetCard>
  );
}

/* ============================================================
   Section: Financial Analytics
   ============================================================ */

function ChartContainer({
  title,
  description,
  icon,
  accent,
  children,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: Accent;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div variants={cardReveal} custom={index}>
      <GlassCard level={2} hover sheen className="p-4 space-y-3 h-full flex flex-col shadow-[var(--shadow-md)]">
        <div className="flex items-center gap-2.5">
          <span className={cn(
            "size-8 rounded-lg flex items-center justify-center ring-1",
            {
              electric: "bg-electric/10 text-electric ring-electric/20",
              cyan: "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
              purple: "bg-purple/10 text-purple-brand ring-purple-brand/20",
              gold: "bg-gold/15 text-gold ring-gold/25",
              emerald: "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
              rose: "bg-rose-brand/10 text-rose-brand ring-rose-brand/20",
              navy: "bg-navy/10 text-navy ring-navy/20",
            }[accent]
          )}>
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
            <p className="text-[11px] text-muted-foreground truncate">{description}</p>
          </div>
        </div>
        <div className="flex-1 min-h-0">{children}</div>
      </GlassCard>
    </motion.div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid oklch(0.3 0.1 260 / 0.12)",
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(8px)",
  fontSize: 11,
} as const;

function FinancialAnalyticsSection() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30D");

  return (
    <WidgetCard
      title="Financial Analytics"
      description="Aggregate coin economy & wallet distribution trends"
      icon={<BarChart3 size={18} className="text-electric" />}
      action={<AnalyticsTabs value={period} onChange={setPeriod} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Coin Distribution — PieChart */}
        <ChartContainer
          title="Coin Distribution"
          description="Lifetime allocation across categories"
          icon={<PieChartIcon size={16} className="text-gold" />}
          accent="gold"
          index={0}
        >
          <div className="h-[180px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={COIN_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  stroke="none"
                >
                  {COIN_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {COIN_DISTRIBUTION.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: c.color }} />
                {c.name} {c.value}%
              </span>
            ))}
          </div>
        </ChartContainer>

        {/* Wallet Growth — AreaChart */}
        <ChartContainer
          title="Wallet Growth"
          description="New wallets created weekly"
          icon={<TrendingUp size={16} className="text-electric" />}
          accent="electric"
          index={1}
        >
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WALLET_GROWTH} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="walletGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.electric} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLORS.electric} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.1 260 / 0.08)" />
                <XAxis dataKey="label" stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ stroke: CHART_COLORS.electric, strokeWidth: 1, strokeDasharray: "4 4" }} contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS.electric}
                  strokeWidth={2.5}
                  fill="url(#walletGrowth)"
                  dot={{ r: 3, fill: CHART_COLORS.electric, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: CHART_COLORS.electric }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Daily Coin Flow — BarChart */}
        <ChartContainer
          title="Daily Coin Flow"
          description="Issued vs redeemed per day"
          icon={<Activity size={16} className="text-cyan-brand" />}
          accent="cyan"
          index={2}
        >
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_FLOW} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.1 260 / 0.08)" />
                <XAxis dataKey="label" stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "oklch(0.3 0.1 260 / 0.04)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="issued" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} maxBarSize={14} />
                <Bar dataKey="redeemed" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: CHART_COLORS.emerald }} />
              Issued
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: CHART_COLORS.purple }} />
              Redeemed
            </span>
          </div>
        </ChartContainer>

        {/* Monthly Coin Flow — AreaChart */}
        <ChartContainer
          title="Monthly Coin Flow"
          description="6-month issued vs redeemed"
          icon={<BarChart3 size={16} className="text-purple-brand" />}
          accent="purple"
          index={3}
        >
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_FLOW} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="monthlyIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.purple} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLORS.purple} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="monthlyRedeemed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.rose} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLORS.rose} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.1 260 / 0.08)" />
                <XAxis dataKey="label" stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ stroke: CHART_COLORS.purple, strokeWidth: 1, strokeDasharray: "4 4" }} contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="issued"
                  stroke={CHART_COLORS.purple}
                  strokeWidth={2.5}
                  fill="url(#monthlyIssued)"
                  dot={{ r: 3, fill: CHART_COLORS.purple, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="redeemed"
                  stroke={CHART_COLORS.rose}
                  strokeWidth={2.5}
                  fill="url(#monthlyRedeemed)"
                  dot={{ r: 3, fill: CHART_COLORS.rose, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Reward Distribution — PieChart */}
        <ChartContainer
          title="Reward Distribution"
          description="Coins by reward source"
          icon={<Gift size={16} className="text-purple-brand" />}
          accent="purple"
          index={4}
        >
          <div className="h-[180px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REWARD_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  stroke="none"
                >
                  {REWARD_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {REWARD_DISTRIBUTION.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: c.color }} />
                {c.name} {c.value}%
              </span>
            ))}
          </div>
        </ChartContainer>

        {/* Redeem Distribution — PieChart */}
        <ChartContainer
          title="Redeem Distribution"
          description="Redeem request statuses"
          icon={<Trophy size={16} className="text-gold" />}
          accent="gold"
          index={5}
        >
          <div className="h-[180px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REDEEM_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  stroke="none"
                >
                  {REDEEM_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {REDEEM_DISTRIBUTION.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: c.color }} />
                {c.name} {c.value}%
              </span>
            ))}
          </div>
        </ChartContainer>

        {/* Referral Distribution — PieChart */}
        <ChartContainer
          title="Referral Distribution"
          description="Referral bonus lifecycle"
          icon={<UserPlus size={16} className="text-emerald-brand" />}
          accent="emerald"
          index={6}
        >
          <div className="h-[180px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REFERRAL_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  stroke="none"
                >
                  {REFERRAL_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {REFERRAL_DISTRIBUTION.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: c.color }} />
                {c.name} {c.value}%
              </span>
            ))}
          </div>
        </ChartContainer>

        {/* Future Advertisement Revenue — placeholder */}
        <ChartContainer
          title="Future Advertisement Revenue"
          description="Ad monetization pipeline"
          icon={<Megaphone size={16} className="text-cyan-brand" />}
          accent="cyan"
          index={7}
        >
          <div className="h-[180px] rounded-xl ring-1 ring-border/60 bg-muted/20 flex flex-col items-center justify-center gap-3">
            <div className="size-12 rounded-2xl bg-cyan/10 ring-1 ring-cyan-brand/20 flex items-center justify-center">
              <Lock className="text-cyan-brand" size={20} />
            </div>
            <div className="text-center px-4">
              <p className="text-xs font-semibold text-foreground">Coming Soon</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Ad revenue analytics pending integration</p>
            </div>
          </div>
        </ChartContainer>

        {/* Future Platform Revenue — placeholder */}
        <ChartContainer
          title="Future Platform Revenue"
          description="Composite revenue streams"
          icon={<DollarSign size={16} className="text-emerald-brand" />}
          accent="emerald"
          index={8}
        >
          <div className="h-[180px] rounded-xl ring-1 ring-border/60 bg-muted/20 flex flex-col items-center justify-center gap-3">
            <div className="size-12 rounded-2xl bg-emerald-brand/10 ring-1 ring-emerald-brand/20 flex items-center justify-center">
              <Lock className="text-emerald-brand" size={20} />
            </div>
            <div className="text-center px-4">
              <p className="text-xs font-semibold text-foreground">Coming Soon</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Revenue model integration pending</p>
            </div>
          </div>
        </ChartContainer>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section: Transaction Monitor
   ============================================================ */

function TransactionMonitorSection() {
  return (
    <WidgetCard
      title="Transaction Monitor"
      description="Live coin movement audit feed — last 100 operations"
      icon={<Activity size={18} className="text-electric" />}
      action={
        <div className="flex items-center gap-2">
          <StatusBadge variant="success" dot pulse>Streaming</StatusBadge>
          <LootButton size="sm" variant="glass" leftIcon={<Download size={13} />}>
            Export
            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1 py-0.5 rounded">
              <Lock size={8} /> Soon
            </span>
          </LootButton>
        </div>
      }
    >
      {/* ===== Desktop table ===== */}
      <div className="hidden lg:block rounded-xl overflow-hidden ring-1 ring-border/60">
        {/* Header row */}
        <div className={cn("bg-muted/40 grid items-center gap-3 px-4 py-2.5 border-b border-border", TX_TABLE_GRID)}>
          <HeaderCell></HeaderCell>
          <HeaderCell>Transaction ID</HeaderCell>
          <HeaderCell>User</HeaderCell>
          <HeaderCell>Transaction Type</HeaderCell>
          <HeaderCell>Coins</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Date</HeaderCell>
          <HeaderCell>Reference <Lock size={9} className="inline opacity-60" /></HeaderCell>
          <HeaderCell className="text-right">Details</HeaderCell>
          <HeaderCell className="text-right">Export</HeaderCell>
          <HeaderCell className="text-right">Audit</HeaderCell>
        </div>
        {/* Skeleton rows */}
        <div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "grid items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors",
                TX_TABLE_GRID
              )}
            >
              <Checkbox aria-label={`Select transaction ${i + 1}`} />
              <div className="h-3 w-24 rounded shimmer" />
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full shimmer shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <div className="h-3 w-24 rounded shimmer" />
                  <div className="h-2.5 w-32 rounded shimmer" />
                </div>
              </div>
              <div className="h-5 w-24 rounded-full shimmer" />
              <div className="h-3 w-12 rounded shimmer" />
              <div className="h-5 w-20 rounded-full shimmer" />
              <div className="h-3 w-20 rounded shimmer" />
              <div className="h-3 w-20 rounded shimmer" />
              <div className="flex items-center justify-end">
                <LootButton size="sm" variant="outline" leftIcon={<Eye size={12} />}>
                  View
                </LootButton>
              </div>
              <div className="flex items-center justify-end">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  className="size-7 inline-flex items-center justify-center rounded-md glass-2 ring-1 ring-border text-muted-foreground hover:text-electric hover:glass-3 transition-all"
                  aria-label="Export transaction"
                >
                  <Download size={13} />
                </motion.button>
              </div>
              <div className="flex items-center justify-end">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  className="size-7 inline-flex items-center justify-center rounded-md glass-2 ring-1 ring-border text-muted-foreground hover:text-purple-brand hover:glass-3 transition-all"
                  aria-label="Audit transaction"
                >
                  <History size={13} />
                </motion.button>
              </div>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="bg-muted/30 flex items-center justify-between px-4 py-2.5 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            Showing <span className="font-semibold text-foreground">1–8</span> of{" "}
            <span className="font-semibold text-foreground">—</span> transactions
          </p>
          <div className="flex items-center gap-1">
            <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 disabled:opacity-40 transition-all" disabled>
              <ChevronDown size={14} className="rotate-90" />
            </button>
            <span className="text-[11px] font-semibold text-foreground px-1.5">1 / —</span>
            <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 disabled:opacity-40 transition-all" disabled>
              <ChevronDown size={14} className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Mobile cards ===== */}
      <div className="lg:hidden space-y-3">
        <SkeletonRow count={6} />
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section: Administrator Wallet Actions
   ============================================================ */

function AdministratorWalletActionsSection() {
  return (
    <WidgetCard
      title="Administrator Wallet Actions"
      description="Reference catalog of wallet operations — confirmation-gated"
      icon={<ShieldCheck size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Pending Backend
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {ADMIN_WALLET_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          const isDestructive = a.variant === "destructive";
          const isWarning = a.variant === "warning";
          return (
            <motion.button
              key={a.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              {...hoverLift}
              className={cn(
                "flex flex-col items-start gap-2 p-3 rounded-xl ring-1 text-left transition-all",
                isDestructive
                  ? "ring-rose-brand/20 bg-rose-brand/5 hover:bg-rose-brand/10"
                  : isWarning
                  ? "ring-gold/20 bg-gold/5 hover:bg-gold/10"
                  : "ring-border bg-transparent hover:bg-accent/60"
              )}
            >
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center",
                isDestructive
                  ? "bg-rose-brand/15 text-rose-brand"
                  : isWarning
                  ? "bg-gold/15 text-gold"
                  : "bg-electric/10 text-electric"
              )}>
                <Icon size={14} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  {a.label}
                  {a.future && <Lock size={9} className="text-muted-foreground/60" />}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {a.variant === "destructive"
                    ? "Destructive · confirmation required"
                    : a.variant === "warning"
                    ? "Warning · confirmation required"
                    : "Placeholder · no backend"}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40">
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck size={11} className="text-electric" />
          All actions require CEO confirmation and are recorded in the audit trail.
        </p>
        <div className="flex items-center gap-2">
          <LootButton size="sm" variant="outline" leftIcon={<History size={13} />}>
            Action Log
          </LootButton>
          <AdminWalletActionMenu />
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section: Coin Economy
   ============================================================ */

function CoinEconomySection() {
  return (
    <WidgetCard
      title="Coin Economy"
      description="Executive dashboard of platform-wide coin supply & velocity"
      icon={<Coins size={18} className="text-gold" />}
      action={
        <StatusBadge variant="gold" dot>
          Economy Monitor
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {COIN_ECONOMY_CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              {...hoverLift}
            >
              <GlassCard level={2} hover className="p-4 space-y-3 h-full relative overflow-hidden">
                <div className="absolute -top-6 -right-6 size-20 rounded-full bg-gold/8 blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <IconBadge
                    name={c.icon === Sparkles ? "Sparkles" : c.icon === Coins ? "Coins" : c.icon === Trophy ? "Trophy" : c.icon === Gift ? "Gift" : c.icon === Activity ? "Activity" : c.icon === TrendingUp ? "TrendingUp" : c.icon === Flame ? "Flame" : "ShieldCheck"}
                    accent={c.accent}
                    size="sm"
                  />
                  {c.future && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                      <Lock size={8} /> Soon
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="h-7 w-20 rounded shimmer" />
                  <p className="text-[11px] font-semibold text-foreground">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug">{c.desc}</p>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section: Financial Security
   ============================================================ */

function FinancialSecuritySection() {
  return (
    <WidgetCard
      title="Financial Security"
      description="Wallet integrity, fraud signals & abuse detection"
      icon={<Shield size={18} className="text-emerald-brand" />}
      action={
        <StatusBadge variant="success" dot pulse>
          Security Active
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {SECURITY_CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              {...hoverLift}
            >
              <GlassCard level={2} className="p-4 space-y-3 h-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <IconBadge
                      name={c.icon === ShieldCheck ? "ShieldCheck" : c.icon === ShieldAlert ? "ShieldAlert" : c.icon === AlertTriangle ? "AlertTriangle" : c.icon === BadgeAlert ? "BadgeAlert" : c.icon === Fingerprint ? "Fingerprint" : c.icon === Copy ? "Copy" : "Ban"}
                      accent={c.accent}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1 truncate">
                        {c.label}
                        {c.future && <Lock size={9} className="text-muted-foreground/60 shrink-0" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{c.desc}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <StatusBadge
                    variant={c.future ? "default" : c.accent === "rose" ? "error" : c.accent === "gold" ? "warning" : "success"}
                    dot
                  >
                    {c.future ? "Pending" : c.accent === "rose" ? "Alert" : c.accent === "gold" ? "Watch" : "Clear"}
                  </StatusBadge>
                  <div className="h-3 w-16 rounded shimmer" />
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <GlassCard level={1} className="p-3.5 flex items-center gap-3">
          <IconBadge name="ShieldCheck" accent="emerald" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Verification Coverage</p>
            <p className="text-[10px] text-muted-foreground">All wallets continuously scanned</p>
          </div>
          <StatusBadge variant="success" dot pulse>Active</StatusBadge>
        </GlassCard>
        <GlassCard level={1} className="p-3.5 flex items-center gap-3">
          <IconBadge name="Fingerprint" accent="purple" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Behavioral Risk</p>
            <p className="text-[10px] text-muted-foreground">Future ML model pending</p>
          </div>
          <StatusBadge variant="default" dot>
            <Lock size={9} className="mr-0.5" /> Soon
          </StatusBadge>
        </GlassCard>
        <GlassCard level={1} className="p-3.5 flex items-center gap-3">
          <IconBadge name="BadgeAlert" accent="rose" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">AML Compliance</p>
            <p className="text-[10px] text-muted-foreground">Future regulatory pipeline</p>
          </div>
          <StatusBadge variant="default" dot>
            <Lock size={9} className="mr-0.5" /> Soon
          </StatusBadge>
        </GlassCard>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section: Financial Reports
   ============================================================ */

function FinancialReportsSection() {
  return (
    <WidgetCard
      title="Financial Reports"
      description="Executive report center — generate & download platform reports"
      icon={<FileBarChart size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Coming Soon
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3">
        {REPORT_CARDS.map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.div
              key={r.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              {...hoverLift}
            >
              <GlassCard level={2} hover className="p-4 space-y-3 h-full relative overflow-hidden">
                <div className="absolute -top-6 -right-6 size-20 rounded-full bg-electric/8 blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-xl bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand))] flex items-center justify-center text-white shadow-sm">
                    <Icon size={16} />
                  </div>
                  {r.future && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                      <Lock size={8} /> Soon
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{r.desc}</p>
                </div>
                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-bold">
                    {r.future ? "Pending" : "Ready"}
                  </span>
                  <ArrowRight size={12} className="text-electric" />
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section: Export Center
   ============================================================ */

function ExportCenterSection() {
  return (
    <WidgetCard
      title="Export Center"
      description="Download or schedule wallet & financial data exports"
      icon={<Download size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Coming Soon
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {EXPORT_TILES.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              {...hoverLift}
            >
              <GlassCard level={2} hover className="p-4 space-y-3 cursor-pointer relative overflow-hidden h-full">
                <div className="absolute -top-6 -right-6 size-20 rounded-full bg-electric/8 blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-xl bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand))] flex items-center justify-center text-white shadow-sm">
                    <Icon size={16} />
                  </div>
                  {t.future ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                      <Lock size={8} /> Soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-electric bg-electric/10 ring-1 ring-electric/20 px-1.5 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{t.desc}</p>
                </div>
                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-bold">
                    {t.future ? "Scheduled" : "Ready"}
                  </span>
                  <ArrowRight size={12} className="text-electric" />
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Main View: CeoWalletView
   ============================================================ */

export function CeoWalletView() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <PageContainer>
      <PageHeader
        title="Wallet Management"
        description="Platform wallet ecosystem & financial monitoring"
        actions={
          <>
            <LootButton
              variant="glass"
              size="sm"
              leftIcon={<Download size={14} />}
            >
              Export
              <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1 py-0.5 rounded">
                <Lock size={8} /> Soon
              </span>
            </LootButton>
            <LootButton
              variant="outline"
              size="sm"
              leftIcon={<ArrowRight size={14} className="rotate-180" />}
              onClick={() => navigate("ceo-dashboard")}
            >
              Mission Control
            </LootButton>
            <LootButton
              variant="electric"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
            >
              Refresh
            </LootButton>
          </>
        }
      />

      {/* Quick-nav chips to sibling CEO modules */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 flex-wrap mb-6"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Related modules:
        </span>
        <button
          onClick={() => navigate("ceo-users")}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full glass-2 ring-1 ring-border text-[11px] font-semibold text-foreground hover:ring-electric/40 hover:text-electric transition-all"
        >
          <History size={11} /> Users
        </button>
        <button
          onClick={() => navigate("ceo-redeem")}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full glass-2 ring-1 ring-border text-[11px] font-semibold text-foreground hover:ring-electric/40 hover:text-electric transition-all"
        >
          <Trophy size={11} /> Redeems
        </button>
        <button
          onClick={() => navigate("ceo-dashboard")}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full glass-2 ring-1 ring-border text-[11px] font-semibold text-foreground hover:ring-electric/40 hover:text-electric transition-all"
        >
          <BarChart3 size={11} /> Dashboard
        </button>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 1. Financial Overview */}
        <FinancialOverviewSection />

        {/* 2. Global Wallet Search */}
        <GlobalWalletSearchSection />

        {/* 3. Advanced Filters */}
        <AdvancedFiltersSection />

        {/* 4. Wallet Table (with details drawer + admin action menu) */}
        <WalletTableSection />

        {/* 6. Financial Analytics */}
        <FinancialAnalyticsSection />

        {/* 7. Transaction Monitor */}
        <TransactionMonitorSection />

        {/* 8. Administrator Wallet Actions */}
        <AdministratorWalletActionsSection />

        {/* 9. Coin Economy */}
        <CoinEconomySection />

        {/* 10. Financial Security */}
        <FinancialSecuritySection />

        {/* 11. Financial Reports */}
        <FinancialReportsSection />

        {/* 12. Export Center */}
        <ExportCenterSection />

        {/* Footer note */}
        <GlassCard level={1} className="p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <IconBadge name="ShieldCheck" accent="emerald" size="sm" />
            <div>
              <p className="text-xs font-semibold text-foreground">CEO Financial Session</p>
              <p className="text-[11px] text-muted-foreground">
                All wallet & financial operations are audited and recorded.
              </p>
            </div>
          </div>
          <StatusBadge variant="success" dot pulse>
            Audit Trail Active
          </StatusBadge>
        </GlassCard>
      </motion.div>
    </PageContainer>
  );
}
