"use client";

/* ============================================================
   LootLoom — CEO Redeem Management & Approval Center
   View renders INSIDE the CeoLayout. No sidebar/header/background.
   Skeleton-first: no backend, no approval logic, no wallet deduction.
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
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Ban,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Crown,
  Download,
  Eye,
  FileText,
  Filter,
  Fingerprint,
  Flame,
  Gift,
  Globe,
  History,
  Lock,
  Mail,
  MapPin,
  Monitor,
  MoreVertical,
  Pause,
  Phone,
  Printer,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserCheck,
  UserPlus,
  Wallet,
  X,
  XCircle,
  Zap,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

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
  { id: "redeem-id", label: "Redeem ID" },
  { id: "user-id", label: "User ID" },
  { id: "username", label: "Username" },
  { id: "email", label: "Email" },
  { id: "reward-name", label: "Reward Name" },
  { id: "reward-category", label: "Reward Category" },
  { id: "transaction-id", label: "Transaction ID" },
  { id: "reference-id", label: "Reference ID", future: true },
  { id: "upi-ref", label: "UPI Reference", future: true },
  { id: "payment-ref", label: "Payment Reference", future: true },
];

const REDEEM_STATUS_CHIPS: ChipDef[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "processing", label: "Processing" },
  { id: "completed", label: "Completed" },
];

const REWARD_CATEGORY_CHIPS: ChipDef[] = [
  { id: "gift-cards", label: "Gift Cards" },
  { id: "gaming", label: "Gaming Rewards" },
  { id: "vouchers", label: "Digital Vouchers" },
  { id: "recharge", label: "Recharge Rewards" },
  { id: "shopping", label: "Shopping Rewards" },
  { id: "membership", label: "Premium Membership" },
  { id: "upi", label: "UPI Rewards", future: true },
  { id: "custom", label: "Custom Rewards", future: true },
];

const VERIFICATION_CHIPS: ChipDef[] = [
  { id: "verified", label: "Verified" },
  { id: "unverified", label: "Unverified" },
  { id: "pending", label: "Pending Review" },
  { id: "flagged", label: "Flagged" },
];

const PRIORITY_CHIPS: ChipDef[] = [
  { id: "low", label: "Low Priority" },
  { id: "normal", label: "Normal" },
  { id: "high", label: "High Priority" },
  { id: "urgent", label: "Urgent" },
];

const PAYMENT_METHOD_CHIPS: ChipDef[] = [
  { id: "upi", label: "UPI", future: true },
  { id: "bank", label: "Bank Transfer", future: true },
  { id: "wallet", label: "Wallet Credit", future: true },
  { id: "voucher", label: "Voucher Code", future: true },
  { id: "gift-card", label: "Gift Card", future: true },
];

const COUNTRY_CHIPS: ChipDef[] = [
  { id: "in", label: "India", future: true },
  { id: "us", label: "United States", future: true },
  { id: "uk", label: "United Kingdom", future: true },
  { id: "ca", label: "Canada", future: true },
  { id: "au", label: "Australia", future: true },
];

const RISK_LEVEL_CHIPS: ChipDef[] = [
  { id: "low", label: "Low Risk", future: true },
  { id: "medium", label: "Medium Risk", future: true },
  { id: "high", label: "High Risk", future: true },
  { id: "critical", label: "Critical", future: true },
];

const SORT_OPTIONS = [
  "Newest Request",
  "Oldest Request",
  "Highest Coin Value",
  "Lowest Coin Value",
  "Longest Processing Time",
  "Highest Priority",
  "Most Recent Status Change",
  "Approver (A–Z)",
] as const;

const OVERVIEW_STATS: {
  label: string;
  value: number;
  icon: string;
  accent: Accent;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: { value: number; positive: boolean };
  future?: boolean;
}[] = [
  { label: "Total Redeem Requests", value: 0, icon: "ShoppingBag", accent: "electric" as Accent },
  { label: "Pending Approval", value: 0, icon: "Clock", accent: "gold" as Accent, trend: { value: 0, positive: true } },
  { label: "Approved Requests", value: 0, icon: "CheckCircle2", accent: "emerald" as Accent },
  { label: "Rejected Requests", value: 0, icon: "XCircle", accent: "rose" as Accent },
  { label: "Processing Requests", value: 0, icon: "RefreshCw", accent: "cyan" as Accent },
  { label: "Completed Rewards", value: 0, icon: "Gift", accent: "purple" as Accent },
  { label: "Average Processing Time", value: 0, icon: "Timer", accent: "navy" as Accent, suffix: "h" },
  { label: "Today's Requests", value: 0, icon: "Calendar", accent: "electric" as Accent, trend: { value: 0, positive: true } },
  { label: "Weekly Requests", value: 0, icon: "BarChart3", accent: "cyan" as Accent },
  { label: "Monthly Requests", value: 0, icon: "TrendingUp", accent: "purple" as Accent },
  { label: "Future Success Rate", value: 0, icon: "Award", accent: "emerald" as Accent, suffix: "%", future: true },
  { label: "Future Reward Value", value: 0, icon: "Coins", accent: "gold" as Accent, prefix: "$", future: true },
];

const TABLE_COLUMNS = [
  { key: "redeem-id", label: "Redeem ID", className: "w-[120px]" },
  { key: "user", label: "User", className: "min-w-[200px]" },
  { key: "reward", label: "Reward", className: "min-w-[180px] hidden xl:table-cell" },
  { key: "coins", label: "Required Coins", className: "w-[110px] hidden lg:table-cell" },
  { key: "status", label: "Current Status", className: "w-[120px]" },
  { key: "requested", label: "Requested Date", className: "w-[130px] hidden xl:table-cell" },
  { key: "processing", label: "Processing Time", className: "w-[120px] hidden 2xl:table-cell" },
  { key: "priority", label: "Priority", className: "w-[110px] hidden lg:table-cell" },
  { key: "view", label: "View Details", className: "w-[110px] text-right" },
  { key: "actions", label: "Actions", className: "w-[60px] text-right" },
] as const;

const ANALYTICS_PERIODS = ["7D", "30D", "90D", "1Y"] as const;
type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

const EMPTY_BAR_WEEK = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 0 },
  { label: "Wed", value: 0 },
  { label: "Thu", value: 0 },
  { label: "Fri", value: 0 },
  { label: "Sat", value: 0 },
  { label: "Sun", value: 0 },
];

const EMPTY_TREND_6W = [
  { label: "W1", value: 0 },
  { label: "W2", value: 0 },
  { label: "W3", value: 0 },
  { label: "W4", value: 0 },
  { label: "W5", value: 0 },
  { label: "W6", value: 0 },
];

const REWARD_DISTRIBUTION_DATA = [
  { label: "Gift Cards", value: 0 },
  { label: "Gaming", value: 0 },
  { label: "Vouchers", value: 0 },
  { label: "Recharge", value: 0 },
  { label: "Shopping", value: 0 },
  { label: "Membership", value: 0 },
];

const CATEGORY_DISTRIBUTION_DATA = [
  { label: "Digital", value: 0 },
  { label: "Physical", value: 0 },
  { label: "Service", value: 0 },
  { label: "Subscription", value: 0 },
];

const APPROVAL_WORKFLOW_STEPS: {
  id: string;
  label: string;
  description: string;
  icon: typeof Eye;
  accent: Accent;
  state: "completed" | "active" | "pending" | "future";
}[] = [
  { id: "received", label: "Request Received", description: "User submitted redemption request", icon: ShoppingBag, accent: "electric", state: "completed" },
  { id: "eligibility", label: "Eligibility Review", description: "Wallet balance & reward availability", icon: ShieldCheck, accent: "cyan", state: "completed" },
  { id: "admin", label: "Administrator Review", description: "Manual verification queue", icon: Eye, accent: "purple", state: "active" },
  { id: "decision", label: "Approval Decision", description: "Approve, reject, or hold", icon: CheckCircle2, accent: "gold", state: "pending" },
  { id: "processing", label: "Reward Processing", description: "Fulfillment & delivery", icon: Gift, accent: "emerald", state: "future" },
  { id: "completed", label: "Completed", description: "Reward delivered to user", icon: Trophy, accent: "rose", state: "future" },
];

const ADMIN_REDEEM_ACTIONS: {
  id: string;
  label: string;
  icon: typeof Eye;
  variant?: "default" | "warning" | "destructive";
  future?: boolean;
}[] = [
  { id: "view-request", label: "View Request", icon: Eye },
  { id: "view-user", label: "View User", icon: UserCheck },
  { id: "view-wallet", label: "View Wallet", icon: Wallet },
  { id: "view-reward", label: "View Reward", icon: Gift },
  { id: "approve", label: "Approve", icon: CheckCircle2, variant: "default", future: true },
  { id: "reject", label: "Reject", icon: XCircle, variant: "destructive", future: true },
  { id: "hold", label: "Hold", icon: Pause, variant: "warning", future: true },
  { id: "request-info", label: "Request Information", icon: Mail, future: true },
  { id: "add-note", label: "Add Internal Note", icon: FileText, future: true },
  { id: "assign-reviewer", label: "Assign Reviewer", icon: UserPlus, future: true },
  { id: "escalate", label: "Escalate", icon: ShieldAlert, variant: "warning", future: true },
  { id: "export", label: "Export", icon: Download, future: true },
];

const VERIFICATION_CARDS: {
  id: string;
  label: string;
  icon: typeof Eye;
  accent: Accent;
  status: "verified" | "off" | "neutral";
  future?: boolean;
}[] = [
  { id: "wallet", label: "Wallet Status", icon: Wallet, accent: "emerald", status: "verified" },
  { id: "account", label: "Account Verification", icon: ShieldCheck, accent: "electric", status: "verified" },
  { id: "email", label: "Email Verification", icon: Mail, accent: "cyan", status: "verified" },
  { id: "phone", label: "Phone Verification", icon: Phone, accent: "purple", status: "verified" },
  { id: "identity", label: "Identity Verification", icon: Fingerprint, accent: "gold", status: "neutral", future: true },
  { id: "device", label: "Device Verification", icon: Smartphone, accent: "navy", status: "neutral", future: true },
  { id: "fraud", label: "Fraud Score", icon: ShieldAlert, accent: "rose", status: "neutral", future: true },
  { id: "duplicate", label: "Duplicate Check", icon: ScanLine, accent: "cyan", status: "neutral", future: true },
  { id: "manual", label: "Manual Review", icon: Eye, accent: "purple", status: "neutral", future: true },
];

const REWARD_CATEGORIES: {
  id: string;
  label: string;
  icon: typeof Eye;
  accent: Accent;
  future?: boolean;
}[] = [
  { id: "upi", label: "UPI Rewards", icon: Smartphone, accent: "cyan", future: true },
  { id: "gift-cards", label: "Gift Cards", icon: Gift, accent: "purple" },
  { id: "gaming", label: "Gaming Rewards", icon: Trophy, accent: "emerald" },
  { id: "vouchers", label: "Digital Vouchers", icon: Tag, accent: "gold" },
  { id: "recharge", label: "Recharge Rewards", icon: Smartphone, accent: "electric" },
  { id: "shopping", label: "Shopping Rewards", icon: ShoppingBag, accent: "rose" },
  { id: "membership", label: "Premium Membership", icon: Crown, accent: "purple" },
  { id: "custom", label: "Custom Rewards", icon: Sparkles, accent: "navy", future: true },
];

const AUDIT_EVENTS: {
  id: string;
  label: string;
  icon: typeof Eye;
  accent: Accent;
  state: "completed" | "pending" | "future";
}[] = [
  { id: "created", label: "Request Created", icon: ShoppingBag, accent: "electric", state: "completed" },
  { id: "viewed", label: "Administrator Viewed", icon: Eye, accent: "cyan", state: "future" },
  { id: "note-added", label: "Note Added", icon: FileText, accent: "purple", state: "future" },
  { id: "approved", label: "Approved", icon: CheckCircle2, accent: "emerald", state: "future" },
  { id: "rejected", label: "Rejected", icon: XCircle, accent: "rose", state: "future" },
  { id: "completed", label: "Completed", icon: Trophy, accent: "gold", state: "future" },
  { id: "notification", label: "Notification Sent", icon: Bell, accent: "navy", state: "future" },
];

const NOTE_PANELS: {
  id: string;
  label: string;
  icon: typeof Eye;
  accent: Accent;
  future?: boolean;
}[] = [
  { id: "internal", label: "Internal Notes", icon: FileText, accent: "electric" },
  { id: "review", label: "Review Notes", icon: Eye, accent: "cyan", future: true },
  { id: "processing", label: "Processing Notes", icon: Gift, accent: "purple", future: true },
  { id: "fraud", label: "Fraud Notes", icon: ShieldAlert, accent: "rose", future: true },
  { id: "attachments", label: "Attachments", icon: Briefcase, accent: "gold", future: true },
  { id: "history", label: "Note History", icon: History, accent: "navy", future: true },
];

const REPORT_TILES: {
  id: string;
  label: string;
  desc: string;
  icon: typeof Eye;
  accent: Accent;
  future?: boolean;
}[] = [
  { id: "daily", label: "Daily Redeems", desc: "24-hour rolling summary", icon: Calendar, accent: "electric" },
  { id: "weekly", label: "Weekly Redeems", desc: "7-day breakdown", icon: BarChart3, accent: "cyan" },
  { id: "monthly", label: "Monthly Redeems", desc: "30-day aggregate", icon: TrendingUp, accent: "purple" },
  { id: "reward", label: "Reward Reports", desc: "Per-reward analytics", icon: Gift, accent: "gold" },
  { id: "status", label: "Status Reports", desc: "Status pipeline view", icon: Clock, accent: "emerald" },
  { id: "revenue", label: "Revenue Reports", desc: "Coin value summary", icon: Coins, accent: "rose", future: true },
  { id: "performance", label: "Performance Reports", desc: "Approver KPI metrics", icon: Award, accent: "navy", future: true },
];

const EXPORT_TILES: {
  id: string;
  label: string;
  desc: string;
  icon: typeof Eye;
  future?: boolean;
}[] = [
  { id: "csv", label: "CSV Export", desc: "Comma-separated values", icon: Download },
  { id: "excel", label: "Excel Workbook", desc: "Microsoft .xlsx", icon: Briefcase },
  { id: "pdf", label: "PDF Report", desc: "Formatted PDF document", icon: Printer },
  { id: "print", label: "Print Preview", desc: "Print-ready layout", icon: Printer },
  { id: "scheduled", label: "Scheduled Export", desc: "Daily / weekly / monthly", icon: Calendar, future: true },
  { id: "cloud", label: "Cloud Export", desc: "Direct to S3 / GCS", icon: Globe, future: true },
];

const PIE_COLORS: Accent[] = ["electric", "cyan", "purple", "gold", "emerald", "rose", "navy"];

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
   Confirmation modal for admin redeem actions. No backend.
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
    variant === "destructive"
      ? "rose"
      : variant === "warning"
      ? "gold"
      : "electric";

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
   Reusable Helper: AdminRedeemActionMenu
   Dropdown with all admin redeem actions. Triggers confirm dialog
   for destructive/warning operations.
   ============================================================ */

export function AdminRedeemActionMenu({ compact = false }: { compact?: boolean }) {
  const [confirm, setConfirm] = useState<{ open: boolean; actionId: string | null }>({
    open: false,
    actionId: null,
  });

  const triggerAction = (action: (typeof ADMIN_REDEEM_ACTIONS)[number]) => {
    if (action.variant === "warning" || action.variant === "destructive") {
      setConfirm({ open: true, actionId: action.id });
    }
  };

  const currentAction = ADMIN_REDEEM_ACTIONS.find((a) => a.id === confirm.actionId);

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
            aria-label="Administrator actions"
          >
            <MoreVertical size={compact ? 14 : 16} />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 glass-2 ring-1 ring-border">
          <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Administrator Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ADMIN_REDEEM_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            const isDestructive = action.variant === "destructive";
            const isWarning = action.variant === "warning";
            const needsSepBefore = i > 0 && ADMIN_REDEEM_ACTIONS[i - 1]?.variant !== action.variant && action.variant !== "default";
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
            ? "This is a destructive placeholder action. No redeem state will be modified. Backend integration is pending."
            : "This is a placeholder administrative action. No state will change. Backend integration is pending."
        }
        variant={currentAction?.variant === "destructive" ? "destructive" : "warning"}
        confirmLabel={currentAction?.variant === "destructive" ? "Confirm Reject" : "Confirm"}
      />
    </>
  );
}

/* ============================================================
   Reusable Helper: RedeemTableRow
   Skeleton table row matching the redeem column header layout.
   ============================================================ */

export function RedeemTableRow() {
  return (
    <div className="grid grid-cols-[120px_1fr_110px_120px_130px_120px_110px_110px_60px] items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors">
      <div className="h-3 w-16 rounded shimmer" />
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 rounded-full shimmer shrink-0" />
        <div className="space-y-1.5 min-w-0">
          <div className="h-3 w-28 rounded shimmer" />
          <div className="h-2.5 w-36 rounded shimmer" />
        </div>
      </div>
      <div className="h-3 w-16 rounded shimmer" />
      <div className="h-5 w-20 rounded-full shimmer" />
      <div className="h-3 w-20 rounded shimmer" />
      <div className="h-3 w-12 rounded shimmer" />
      <div className="h-5 w-20 rounded-full shimmer" />
      <div className="flex items-center justify-end gap-1.5">
        <div className="h-7 w-12 rounded-md shimmer" />
        <div className="size-7 rounded-md shimmer" />
      </div>
    </div>
  );
}

/* ============================================================
   Reusable Helper: RedeemCardMobile
   Skeleton mobile card for redeem requests list.
   ============================================================ */

export function RedeemCardMobile() {
  return (
    <GlassCard level={1} className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox />
        <div className="size-11 rounded-xl shimmer" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="h-3 w-24 rounded shimmer" />
          <div className="h-2.5 w-32 rounded shimmer" />
        </div>
        <div className="h-5 w-16 rounded-full shimmer" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="h-5 w-20 rounded-full shimmer" />
        <div className="h-5 w-24 rounded-full shimmer" />
        <div className="h-5 w-16 rounded-full shimmer" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="h-3 w-24 rounded shimmer" />
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-12 rounded-md shimmer" />
          <div className="size-7 rounded-md shimmer" />
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================================================
   Reusable Helper: AnalyticsTabs
   Period selector for redeem analytics chart widgets.
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
   Reusable Helper: ApprovalTimeline
   Premium animated 6-step approval workflow timeline.
   ============================================================ */

export function ApprovalTimeline() {
  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute left-[19px] sm:left-1/2 top-4 bottom-4 w-px sm:-translate-x-1/2 bg-gradient-to-b from-electric/40 via-border to-transparent" />
      <div className="space-y-4">
        {APPROVAL_WORKFLOW_STEPS.map((step, i) => {
          const Icon = step.icon;
          const accentBg: Record<Accent, string> = {
            electric: "bg-electric/15 text-electric ring-electric/25",
            cyan: "bg-cyan/15 text-cyan-brand ring-cyan-brand/25",
            purple: "bg-purple/15 text-purple-brand ring-purple-brand/25",
            gold: "bg-gold/15 text-gold ring-gold/25",
            emerald: "bg-emerald-brand/15 text-emerald-brand ring-emerald-brand/25",
            rose: "bg-rose-brand/15 text-rose-brand ring-rose-brand/25",
            navy: "bg-navy/15 text-navy ring-navy/25",
          };
          const stateRing: Record<string, string> = {
            completed: "ring-2 ring-offset-2 ring-offset-background ring-emerald-brand/40",
            active: "ring-2 ring-offset-2 ring-offset-background ring-electric/60 animate-pulse",
            pending: "opacity-70",
            future: "opacity-50",
          };
          const stateLabel: Record<string, { variant: "success" | "info" | "warning" | "default"; label: string }> = {
            completed: { variant: "success", label: "Completed" },
            active: { variant: "info", label: "In Review" },
            pending: { variant: "warning", label: "Pending" },
            future: { variant: "default", label: "Future" },
          };
          const meta = stateLabel[step.state];
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "relative flex items-start gap-4 sm:justify-center",
                i % 2 === 1 && "sm:flex-row-reverse"
              )}
            >
              <div className={cn(
                "relative z-10 size-10 rounded-xl ring-1 flex items-center justify-center shrink-0 bg-background",
                accentBg[step.accent],
                stateRing[step.state]
              )}>
                <Icon size={16} />
              </div>
              <div className={cn("flex-1 sm:flex-none sm:w-[42%]", i % 2 === 1 && "sm:text-right")}>
                <GlassCard level={2} className="p-3.5 space-y-2">
                  <div className={cn("flex items-center gap-2", i % 2 === 1 && "sm:flex-row-reverse")}>
                    <span className="text-xs font-bold text-foreground">{step.label}</span>
                    {step.state === "future" && <Lock size={9} className="text-muted-foreground/60" />}
                    <div className={cn("ml-auto sm:ml-0", i % 2 === 1 && "sm:mr-auto sm:ml-0")}>
                      <StatusBadge variant={meta.variant} dot pulse={step.state === "active"}>
                        {meta.label}
                      </StatusBadge>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{step.description}</p>
                  <div className="h-2 w-2/3 rounded shimmer" />
                </GlassCard>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Reusable Helper: RedeemDetailsDrawer
   Right-side Sheet drawer with full redeem request details.
   All skeleton/placeholder content. No backend.
   ============================================================ */

export function RedeemDetailsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
            <SheetTitle className="sr-only">Redeem Request Details</SheetTitle>
            <SheetDescription className="sr-only">
              Detailed administrator view of a single reward redemption request.
            </SheetDescription>
          </SheetHeader>
          <div className="absolute bottom-3 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/20">
            <Lock size={10} /> ADMIN VIEW
          </div>
        </div>

        {/* Header */}
        <div className="px-5 -mt-10 relative">
          <div className="flex items-end gap-4">
            <div className="size-20 rounded-2xl glass-2 ring-4 ring-background shimmer shrink-0 flex items-center justify-center">
              <Gift size={28} className="text-muted-foreground/40" />
            </div>
            <div className="flex-1 space-y-2 pb-2">
              <div className="h-5 w-32 rounded shimmer" />
              <div className="h-3 w-48 rounded shimmer" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Required Coins", icon: Coins, accent: "gold" as Accent },
              { label: "Priority", icon: Flame, accent: "rose" as Accent },
              { label: "Status", icon: Clock, accent: "electric" as Accent },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <GlassCard key={m.label} level={2} className="p-3 space-y-2">
                  <Icon size={14} className="opacity-60" />
                  <div className="space-y-1">
                    <div className="h-4 w-12 rounded shimmer" />
                    <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <Tabs defaultValue="overview" className="mt-5">
            <TabsList className="bg-muted/60 w-full justify-start overflow-x-auto h-auto p-1">
              <TabsTrigger value="overview" className="gap-1.5">
                <Eye size={13} /> Overview
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-1.5">
                <History size={13} /> Workflow
              </TabsTrigger>
              <TabsTrigger value="verification" className="gap-1.5">
                <ShieldCheck size={13} /> Verification
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-1.5">
                <FileText size={13} /> Audit
              </TabsTrigger>
            </TabsList>

            {/* ===== Overview Tab ===== */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              <RedeemDetailsInfoGrid />
              <RedeemDetailsRewardInfo />
            </TabsContent>

            {/* ===== Workflow Tab ===== */}
            <TabsContent value="timeline" className="mt-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Approval Workflow
              </p>
              <ApprovalTimeline />
            </TabsContent>

            {/* ===== Verification Tab ===== */}
            <TabsContent value="verification" className="mt-4 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Verification Status
              </p>
              <RedeemDetailsVerification />
            </TabsContent>

            {/* ===== Audit Tab ===== */}
            <TabsContent value="audit" className="mt-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Audit History
              </p>
              <RedeemDetailsAuditTimeline />
            </TabsContent>
          </Tabs>
        </div>

        <div className="h-8" />
      </SheetContent>
    </Sheet>
  );
}

/* ===== Redeem Details Info Grid (inside drawer Overview tab) ===== */

function RedeemDetailsInfoGrid() {
  const info: { label: string; icon: string; future?: boolean }[] = [
    { label: "Redeem ID", icon: "ShoppingBag" },
    { label: "User Information", icon: "UserCheck" },
    { label: "Reward Information", icon: "Gift" },
    { label: "Required Coins", icon: "Coins" },
    { label: "Current Wallet", icon: "Wallet", future: true },
    { label: "Reward Category", icon: "Tag" },
    { label: "Request Time", icon: "Clock" },
    { label: "Status", icon: "CheckCircle2" },
    { label: "Priority", icon: "Flame" },
    { label: "Future Administrator", icon: "ShieldCheck", future: true },
    { label: "Future Processing Timeline", icon: "Timer", future: true },
    { label: "Future Attachments", icon: "Briefcase", future: true },
    { label: "Future Verification Notes", icon: "FileText", future: true },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {info.map((item) => (
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
  );
}

/* ===== Redeem Details Reward Info (inside Overview tab) ===== */

function RedeemDetailsRewardInfo() {
  const summaries = [
    { label: "Reward Summary", icon: Gift, accent: "purple" as Accent },
    { label: "Wallet Summary", icon: Wallet, accent: "electric" as Accent },
    { label: "User Summary", icon: UserCheck, accent: "cyan" as Accent },
    { label: "Processing Summary", icon: Timer, accent: "gold" as Accent },
  ];
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2.5">
        Request Summaries
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {summaries.map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} level={2} className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <Icon size={14} className="text-muted-foreground" />
                <ChevronRight size={12} className="text-muted-foreground/60" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 w-14 rounded shimmer" />
                <p className="text-[10px] font-semibold text-muted-foreground truncate">{s.label}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

/* ===== Redeem Details Verification (inside Verification tab) ===== */

function RedeemDetailsVerification() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {VERIFICATION_CARDS.map((v) => {
        const Icon = v.icon;
        const statusMap: Record<string, { variant: "success" | "warning" | "default"; label: string }> = {
          verified: { variant: "success", label: "Verified" },
          off: { variant: "warning", label: "Disabled" },
          neutral: { variant: "default", label: "Pending" },
        };
        const meta = statusMap[v.status];
        return (
          <GlassCard key={v.id} level={2} className="p-3 flex items-center gap-3">
            <Icon size={15} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                {v.label}
                {v.future && <Lock size={9} className="text-muted-foreground/60" />}
              </p>
            </div>
            <StatusBadge variant={meta.variant} dot pulse={meta.variant === "warning"}>
              {meta.label}
            </StatusBadge>
          </GlassCard>
        );
      })}
    </div>
  );
}

/* ===== Redeem Details Audit Timeline (inside Audit tab) ===== */

function RedeemDetailsAuditTimeline() {
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/15 text-electric ring-electric/25",
    cyan: "bg-cyan/15 text-cyan-brand ring-cyan-brand/25",
    purple: "bg-purple/15 text-purple-brand ring-purple-brand/25",
    gold: "bg-gold/15 text-gold ring-gold/25",
    emerald: "bg-emerald-brand/15 text-emerald-brand ring-emerald-brand/25",
    rose: "bg-rose-brand/15 text-rose-brand ring-rose-brand/25",
    navy: "bg-navy/15 text-navy ring-navy/25",
  };
  return (
    <div className="relative pl-4">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-electric/40 via-border to-transparent" />
      <div className="space-y-2.5">
        {AUDIT_EVENTS.map((e, i) => {
          const Icon = e.icon;
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <span className={cn(
                "absolute -left-4 top-3 size-3.5 rounded-full ring-2 ring-background flex items-center justify-center",
                accentBg[e.accent],
                e.state === "future" && "opacity-50"
              )}>
                <Icon size={8} />
              </span>
              <GlassCard level={1} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    {e.label}
                    {e.state === "future" && <Lock size={9} className="text-muted-foreground/60" />}
                  </span>
                  <span className="text-[10px] text-muted-foreground">—</span>
                </div>
                <div className="h-2.5 w-3/4 rounded shimmer" />
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Empty / Error State Helpers
   ============================================================ */

export function NoRedeemRequestsEmpty({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon="ShoppingBag"
      title="No redeem requests yet"
      description="Users have not submitted any reward redemption requests. New submissions will appear here automatically."
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

export function NoPendingRequestsEmpty({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon="CheckCircle2"
      title="No pending approvals"
      description="The approval queue is empty. All current redeem requests have been reviewed."
      action={
        onReset && (
          <LootButton variant="glass" size="sm" leftIcon={<RefreshCw size={14} />} onClick={onReset}>
            Check Again
          </LootButton>
        )
      }
    />
  );
}

export function RedeemModuleUnavailableError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon="ServerCrash"
      title="Redeem module temporarily unavailable"
      description="We could not reach the redemption management service. Please retry or check service status in Mission Control."
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
   Section 1: Redeem Overview Stats
   ============================================================ */

function RedeemOverviewSection() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
      <Grid cols={4}>
        {OVERVIEW_STATS.map((s, i) => (
          <motion.div key={s.label} variants={cardReveal} custom={i} className="relative">
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
              prefix={s.prefix}
              suffix={s.suffix}
              decimals={s.decimals}
              trend={s.trend}
            />
          </motion.div>
        ))}
      </Grid>
    </motion.div>
  );
}

/* ============================================================
   Section 2: Global Redeem Search
   ============================================================ */

function GlobalRedeemSearchSection() {
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState("redeem-id");

  return (
    <WidgetCard
      title="Global Redeem Search"
      description="Cross-platform lookup by request identifier"
      icon={<Search size={18} className="text-electric" />}
      action={<StatusBadge variant="info" dot pulse>Live</StatusBadge>}
    >
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Redeem ID, User ID, Username, Email, Reward Name, Category, Transaction ID…"
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
            Indexed across all redeem identifiers
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 3: Advanced Filters
   ============================================================ */

function AdvancedFiltersSection() {
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>("Newest Request");
  const [active, setActive] = useState<Record<string, string[]>>({
    status: ["pending"],
    category: [],
    verification: [],
    priority: [],
    payment: [],
    country: [],
    risk: [],
  });

  const toggle = (group: string, id: string) =>
    setActive((s) => ({
      ...s,
      [group]: s[group]?.includes(id)
        ? s[group].filter((x) => x !== id)
        : [...(s[group] ?? []), id],
    }));

  const resetAll = () =>
    setActive({ status: [], category: [], verification: [], priority: [], payment: [], country: [], risk: [] });

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
      description="Granular refinement across status, category, priority & risk dimensions"
      icon={<SlidersHorizontal size={18} className="text-electric" />}
      action={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg glass-2 ring-1 ring-border text-xs font-semibold text-foreground hover:glass-3 transition-all">
              <ArrowRight size={12} className="text-muted-foreground" />
              {sort}
              <ChevronDown size={12} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-2 ring-1 ring-border">
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
      }
    >
      <div className="space-y-5">
        {/* Date ranges + coin range */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard level={1} className="p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-electric" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Request Date Range
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">From</label>
                <input type="date" className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground focus:ring-2 focus:ring-electric/40 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">To</label>
                <input type="date" className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground focus:ring-2 focus:ring-electric/40 focus:outline-none" />
              </div>
            </div>
          </GlassCard>

          <GlassCard level={1} className="p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-cyan-brand" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Approval Date Range
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">From</label>
                <input type="date" className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground focus:ring-2 focus:ring-cyan-brand/40 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">To</label>
                <input type="date" className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground focus:ring-2 focus:ring-cyan-brand/40 focus:outline-none" />
              </div>
            </div>
          </GlassCard>

          <GlassCard level={1} className="p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Coins size={12} className="text-gold" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Coin Range
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Min Coins</label>
                <input type="number" placeholder="0" className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-gold/40 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Max Coins</label>
                <input type="number" placeholder="∞" className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-gold/40 focus:outline-none" />
              </div>
            </div>
          </GlassCard>

          <GlassCard level={1} className="p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Timer size={12} className="text-purple-brand" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Processing Time
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Min (hours)</label>
                <input type="number" placeholder="0" className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-purple-brand/40 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Max (hours)</label>
                <input type="number" placeholder="∞" className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-purple-brand/40 focus:outline-none" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Chip groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderChipGroup("Redeem Status", REDEEM_STATUS_CHIPS, "electric")}
          {renderChipGroup("Reward Category", REWARD_CATEGORY_CHIPS, "purple")}
          {renderChipGroup("Verification Status", VERIFICATION_CHIPS, "cyan")}
          {renderChipGroup("Priority", PRIORITY_CHIPS, "rose")}
          {renderChipGroup("Future Payment Method", PAYMENT_METHOD_CHIPS, "gold")}
          {renderChipGroup("Future Country", COUNTRY_CHIPS, "navy")}
          {renderChipGroup("Future Risk Level", RISK_LEVEL_CHIPS, "rose")}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 flex-wrap gap-2">
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
   Section 4: Redeem Table
   ============================================================ */

function RedeemTableSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const allSelected = selected.length === 10;

  const toggleAll = () => setSelected(allSelected ? [] : Array.from({ length: 10 }, (_, i) => i));
  const toggleOne = (i: number) =>
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  return (
    <WidgetCard
      title="Redeem Requests"
      description="All reward redemption requests — live table"
      icon={<ShoppingBag size={18} className="text-electric" />}
      action={
        <div className="flex items-center gap-2">
          <StatusBadge variant="info" dot pulse>{selected.length} selected</StatusBadge>
          <LootButton size="sm" variant="glass" leftIcon={<RefreshCw size={13} />}>
            Refresh
          </LootButton>
        </div>
      }
    >
      {/* Sticky bulk bar */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4"
          >
            <GlassCard level={2} className="p-3 flex flex-wrap items-center gap-2 ring-1 ring-electric/20">
              <div className="flex items-center gap-2 pr-3 border-r border-border/60">
                <span className="inline-flex items-center justify-center size-7 rounded-lg bg-electric/15 text-electric text-xs font-bold">
                  {selected.length}
                </span>
                <span className="text-xs font-semibold text-foreground">requests selected</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold ring-1 ring-border bg-transparent hover:bg-accent/60 transition-all">
                  <Download size={12} /> Export
                  <Lock size={9} className="opacity-60" />
                </button>
                <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold ring-1 ring-emerald-brand/30 bg-emerald-brand/5 text-emerald-brand hover:bg-emerald-brand/10 transition-all">
                  <CheckCircle2 size={12} /> Bulk Approve
                  <Lock size={9} className="opacity-60" />
                </button>
                <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold ring-1 ring-rose-brand/30 bg-rose-brand/5 text-rose-brand hover:bg-rose-brand/10 transition-all">
                  <XCircle size={12} /> Bulk Reject
                  <Lock size={9} className="opacity-60" />
                </button>
              </div>
              <button
                onClick={() => setSelected([])}
                className="ml-auto inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
              >
                <X size={12} /> Clear
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Desktop executive table ===== */}
      <div className="hidden lg:block rounded-xl overflow-hidden ring-1 ring-border/60">
        {/* Header row */}
        <div className="bg-muted/40 grid grid-cols-[120px_1fr_110px_120px_130px_120px_110px_110px_60px] items-center gap-3 px-4 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Redeem ID</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">User</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Required Coins</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Status</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Requested Date</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Processing Time</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">View</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</span>
        </div>
        {/* Skeleton rows */}
        <div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[120px_1fr_110px_120px_130px_120px_110px_110px_60px] items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selected.includes(i)}
                  onCheckedChange={() => toggleOne(i)}
                  aria-label={`Select row ${i + 1}`}
                />
                <div className="h-3 w-16 rounded shimmer" />
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-full shimmer shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <div className="h-3 w-28 rounded shimmer" />
                  <div className="h-2.5 w-36 rounded shimmer" />
                </div>
              </div>
              <div className="h-3 w-16 rounded shimmer" />
              <div className="h-5 w-20 rounded-full shimmer" />
              <div className="h-3 w-20 rounded shimmer" />
              <div className="h-3 w-12 rounded shimmer" />
              <div className="h-5 w-20 rounded-full shimmer" />
              <div className="flex items-center justify-end gap-1.5">
                <LootButton
                  size="sm"
                  variant="outline"
                  leftIcon={<Eye size={12} />}
                  onClick={() => setDrawerOpen(true)}
                >
                  View
                </LootButton>
                <AdminRedeemActionMenu compact />
              </div>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="bg-muted/30 flex items-center justify-between px-4 py-2.5 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            Showing <span className="font-semibold text-foreground">1–10</span> of{" "}
            <span className="font-semibold text-foreground">—</span> requests
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
      <div className="lg:hidden space-y-3 max-h-[640px] overflow-y-auto pr-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <RedeemCardMobile />
            <div className="flex items-center justify-end gap-2 -mt-1">
              <LootButton
                size="sm"
                variant="outline"
                leftIcon={<Eye size={12} />}
                onClick={() => setDrawerOpen(true)}
              >
                View Details
              </LootButton>
              <AdminRedeemActionMenu compact />
            </div>
          </div>
        ))}
      </div>

      <RedeemDetailsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </WidgetCard>
  );
}

/* ============================================================
   Section 6: Approval Workflow
   ============================================================ */

function ApprovalWorkflowSection() {
  return (
    <WidgetCard
      title="Approval Workflow"
      description="Executive 6-stage redemption pipeline"
      icon={<CheckCircle2 size={18} className="text-electric" />}
      action={
        <StatusBadge variant="info" dot pulse>
          <span className="hidden sm:inline">Pipeline · </span>Stage 3 / 6
        </StatusBadge>
      }
    >
      <div className="space-y-4">
        <ApprovalTimeline />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-border/40">
          {[
            { label: "Eligibility Pass Rate", icon: ShieldCheck, accent: "emerald" as Accent, future: false },
            { label: "Avg Review Time", icon: Timer, accent: "cyan" as Accent, future: true },
            { label: "Approver Workload", icon: UserCheck, accent: "purple" as Accent, future: true },
            { label: "Future SLA Status", icon: Clock, accent: "gold" as Accent, future: true },
            { label: "Future Auto-Approve", icon: Zap, accent: "electric" as Accent, future: true },
            { label: "Future Escalations", icon: ShieldAlert, accent: "rose" as Accent, future: true },
          ].map((tile) => {
            const Icon = tile.icon;
            const accentBg: Record<Accent, string> = {
              electric: "bg-electric/10 text-electric",
              cyan: "bg-cyan/10 text-cyan-brand",
              purple: "bg-purple/10 text-purple-brand",
              gold: "bg-gold/10 text-gold",
              emerald: "bg-emerald-brand/10 text-emerald-brand",
              rose: "bg-rose-brand/10 text-rose-brand",
              navy: "bg-navy/10 text-navy",
            };
            return (
              <GlassCard key={tile.label} level={2} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className={cn("size-7 rounded-lg flex items-center justify-center", accentBg[tile.accent])}>
                    <Icon size={13} />
                  </div>
                  {tile.future && <Lock size={9} className="text-muted-foreground/60" />}
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-12 rounded shimmer" />
                  <p className="text-[10px] font-semibold text-muted-foreground truncate">{tile.label}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
          <ShieldCheck size={11} className="text-electric" />
          Workflow visualization only — no approval logic or state mutation is performed.
        </p>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 8: Verification Center
   ============================================================ */

function VerificationCenterSection() {
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/10 text-electric ring-electric/20",
    cyan: "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
    purple: "bg-purple/10 text-purple-brand ring-purple-brand/20",
    gold: "bg-gold/10 text-gold ring-gold/20",
    emerald: "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
    rose: "bg-rose-brand/10 text-rose-brand ring-rose-brand/20",
    navy: "bg-navy/10 text-navy ring-navy/20",
  };
  return (
    <WidgetCard
      title="Verification Center"
      description="Pre-approval security & verification panel"
      icon={<ShieldCheck size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Pending Backend
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {VERIFICATION_CARDS.map((v) => {
          const Icon = v.icon;
          const statusMap: Record<string, { variant: "success" | "warning" | "default"; label: string }> = {
            verified: { variant: "success", label: "Verified" },
            off: { variant: "warning", label: "Disabled" },
            neutral: { variant: "default", label: "Pending" },
          };
          const meta = statusMap[v.status];
          return (
            <GlassCard key={v.id} level={2} className="p-3.5 space-y-3">
              <div className="flex items-start justify-between">
                <div className={cn("size-9 rounded-xl flex items-center justify-center ring-1", accentBg[v.accent])}>
                  <Icon size={15} />
                </div>
                {v.future && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                    <Lock size={8} /> Soon
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">{v.label}</p>
                <div className="h-2.5 w-2/3 rounded shimmer" />
              </div>
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <StatusBadge variant={meta.variant} dot pulse={meta.variant === "warning"}>
                  {meta.label}
                </StatusBadge>
                <ChevronRight size={12} className="text-muted-foreground/60" />
              </div>
            </GlassCard>
          );
        })}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 9: Redeem Analytics
   ============================================================ */

const ACCENT_COLOR: Record<Accent, string> = {
  electric: "oklch(0.62 0.22 255)",
  cyan: "oklch(0.72 0.15 200)",
  purple: "oklch(0.6 0.22 295)",
  gold: "oklch(0.8 0.16 85)",
  emerald: "oklch(0.7 0.17 160)",
  rose: "oklch(0.65 0.21 15)",
  navy: "oklch(0.3 0.1 260)",
};

function AnalyticsChartCard({
  title,
  description,
  icon,
  type,
  data,
  index,
  accent,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "line" | "bar" | "area" | "pie";
  data: { label: string; value: number }[];
  index: number;
  accent: Accent;
}) {
  const color = ACCENT_COLOR[accent];

  return (
    <WidgetCard title={title} description={description} icon={icon} index={index}>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.1 260 / 0.08)" />
              <XAxis dataKey="label" stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid oklch(0.3 0.1 260 / 0.12)",
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(8px)",
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: color }}
              />
            </LineChart>
          ) : type === "bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.1 260 / 0.08)" />
              <XAxis dataKey="label" stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "oklch(0.3 0.1 260 / 0.04)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid oklch(0.3 0.1 260 / 0.12)",
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(8px)",
                  fontSize: 11,
                }}
              />
              <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          ) : type === "area" ? (
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.1 260 / 0.08)" />
              <XAxis dataKey="label" stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid oklch(0.3 0.1 260 / 0.12)",
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(8px)",
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#grad-${title})`}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: color }}
              />
            </AreaChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                stroke="rgba(255,255,255,0.6)"
                strokeWidth={1.5}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={ACCENT_COLOR[PIE_COLORS[i % PIE_COLORS.length]]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid oklch(0.3 0.1 260 / 0.12)",
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(8px)",
                  fontSize: 11,
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      {type === "pie" && (
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 border-t border-border/40">
          {data.map((d, i) => (
            <span key={d.label} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ background: ACCENT_COLOR[PIE_COLORS[i % PIE_COLORS.length]] }}
              />
              {d.label}
            </span>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

function RedeemAnalyticsSection() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30D");
  const periodLabel = useMemo(() => `Last ${period}`, [period]);

  return (
    <WidgetCard
      title="Redeem Analytics"
      description={`Aggregate redemption trends · ${periodLabel}`}
      icon={<BarChart3 size={18} className="text-electric" />}
      action={<AnalyticsTabs value={period} onChange={setPeriod} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnalyticsChartCard
          title="Pending Requests"
          description="Awaiting administrator review"
          icon={<Clock size={16} className="text-gold" />}
          type="bar"
          data={EMPTY_BAR_WEEK}
          index={0}
          accent="gold"
        />
        <AnalyticsChartCard
          title="Approval Trend"
          description="Approved redemptions over time"
          icon={<CheckCircle2 size={16} className="text-emerald-brand" />}
          type="line"
          data={EMPTY_TREND_6W}
          index={1}
          accent="emerald"
        />
        <AnalyticsChartCard
          title="Rejection Trend"
          description="Rejected redemptions over time"
          icon={<XCircle size={16} className="text-rose-brand" />}
          type="line"
          data={EMPTY_TREND_6W}
          index={2}
          accent="rose"
        />
        <AnalyticsChartCard
          title="Reward Distribution"
          description="By reward type"
          icon={<Gift size={16} className="text-purple-brand" />}
          type="pie"
          data={REWARD_DISTRIBUTION_DATA}
          index={3}
          accent="purple"
        />
        <AnalyticsChartCard
          title="Category Distribution"
          description="By reward category"
          icon={<Tag size={16} className="text-cyan-brand" />}
          type="pie"
          data={CATEGORY_DISTRIBUTION_DATA}
          index={4}
          accent="cyan"
        />
        <AnalyticsChartCard
          title="Processing Time"
          description="Average hours per status"
          icon={<Timer size={16} className="text-electric" />}
          type="bar"
          data={EMPTY_BAR_WEEK}
          index={5}
          accent="electric"
        />
      </div>

      {/* Future analytics tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/40">
        {[
          { label: "Future Success Rate", icon: Award, accent: "emerald" as Accent, desc: "Approval success percentage" },
          { label: "Future Coin Usage", icon: Coins, accent: "gold" as Accent, desc: "Coins redeemed over time" },
        ].map((tile) => {
          const Icon = tile.icon;
          const accentBg: Record<Accent, string> = {
            electric: "bg-electric/10 text-electric",
            cyan: "bg-cyan/10 text-cyan-brand",
            purple: "bg-purple/10 text-purple-brand",
            gold: "bg-gold/10 text-gold",
            emerald: "bg-emerald-brand/10 text-emerald-brand",
            rose: "bg-rose-brand/10 text-rose-brand",
            navy: "bg-navy/10 text-navy",
          };
          return (
            <GlassCard key={tile.label} level={2} className="p-4 flex items-center gap-3">
              <div className={cn("size-10 rounded-xl flex items-center justify-center", accentBg[tile.accent])}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  {tile.label}
                  <Lock size={9} className="text-muted-foreground/60" />
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{tile.desc}</p>
              </div>
              <div className="h-8 w-16 rounded-md shimmer" />
            </GlassCard>
          );
        })}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 10: Reward Categories
   ============================================================ */

function RewardCategoriesSection() {
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/10 text-electric",
    cyan: "bg-cyan/10 text-cyan-brand",
    purple: "bg-purple/10 text-purple-brand",
    gold: "bg-gold/10 text-gold",
    emerald: "bg-emerald-brand/10 text-emerald-brand",
    rose: "bg-rose-brand/10 text-rose-brand",
    navy: "bg-navy/10 text-navy",
  };
  return (
    <WidgetCard
      title="Reward Categories"
      description="Per-category redemption breakdown"
      icon={<Gift size={18} className="text-electric" />}
      action={<StatusBadge variant="default" dot>8 categories</StatusBadge>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REWARD_CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              {...hoverLift}
            >
              <GlassCard level={2} hover className="p-4 space-y-3 h-full relative overflow-hidden">
                <div className="absolute -top-6 -right-6 size-20 rounded-full bg-electric/8 blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center", accentBg[cat.accent])}>
                    <Icon size={16} />
                  </div>
                  {cat.future && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                      <Lock size={8} /> Soon
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Total", accent: "text-foreground" },
                    { label: "Pending", accent: "text-gold" },
                    { label: "Completed", accent: "text-emerald-brand" },
                    { label: "Avg Time", accent: "text-muted-foreground", future: true },
                  ].map((stat) => (
                    <div key={stat.label} className="space-y-1">
                      <div className="h-4 w-10 rounded shimmer" />
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        {stat.label}
                        {stat.future && <Lock size={8} className="opacity-60" />}
                      </p>
                    </div>
                  ))}
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
   Section 11: Audit History
   ============================================================ */

function AuditHistorySection() {
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/15 text-electric ring-electric/25",
    cyan: "bg-cyan/15 text-cyan-brand ring-cyan-brand/25",
    purple: "bg-purple/15 text-purple-brand ring-purple-brand/25",
    gold: "bg-gold/15 text-gold ring-gold/25",
    emerald: "bg-emerald-brand/15 text-emerald-brand ring-emerald-brand/25",
    rose: "bg-rose-brand/15 text-rose-brand ring-rose-brand/25",
    navy: "bg-navy/15 text-navy ring-navy/25",
  };
  return (
    <WidgetCard
      title="Audit History"
      description="Per-request audit trail timeline"
      icon={<History size={18} className="text-electric" />}
      action={
        <LootButton size="sm" variant="glass" leftIcon={<Download size={13} />}>
          Export Audit
        </LootButton>
      }
    >
      <div className="relative pl-4 max-h-96 overflow-y-auto pr-1">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-electric/40 via-border to-transparent" />
        <div className="space-y-2.5">
          {AUDIT_EVENTS.map((e, i) => {
            const Icon = e.icon;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <span className={cn(
                  "absolute -left-4 top-3 size-3.5 rounded-full ring-2 ring-background flex items-center justify-center",
                  accentBg[e.accent],
                  e.state === "future" && "opacity-50"
                )}>
                  <Icon size={8} />
                </span>
                <GlassCard level={1} className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      {e.label}
                      {e.state === "future" && <Lock size={9} className="text-muted-foreground/60" />}
                    </span>
                    <StatusBadge
                      variant={e.state === "completed" ? "success" : "default"}
                      dot
                      pulse={e.state === "completed"}
                    >
                      {e.state === "completed" ? "Logged" : "Future"}
                    </StatusBadge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <div className="h-2.5 w-12 rounded shimmer" />
                      <p className="text-[9px] text-muted-foreground">Actor</p>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2.5 w-12 rounded shimmer" />
                      <p className="text-[9px] text-muted-foreground">Timestamp</p>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2.5 w-12 rounded shimmer" />
                      <p className="text-[9px] text-muted-foreground">Source</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 12: Administrator Notes
   ============================================================ */

function AdministratorNotesSection() {
  const [active, setActive] = useState("internal");
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/10 text-electric ring-electric/25",
    cyan: "bg-cyan/10 text-cyan-brand ring-cyan-brand/25",
    purple: "bg-purple/10 text-purple-brand ring-purple-brand/25",
    gold: "bg-gold/10 text-gold ring-gold/25",
    emerald: "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/25",
    rose: "bg-rose-brand/10 text-rose-brand ring-rose-brand/25",
    navy: "bg-navy/10 text-navy ring-navy/25",
  };

  return (
    <WidgetCard
      title="Administrator Notes"
      description="Internal notes & review commentary"
      icon={<FileText size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Display Only
        </StatusBadge>
      }
    >
      <div className="space-y-4">
        {/* Tab chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {NOTE_PANELS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-all",
                  active === p.id
                    ? accentBg[p.accent]
                    : "bg-transparent text-muted-foreground ring-border hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon size={12} />
                {p.label}
                {p.future && <Lock size={9} className="opacity-60" />}
              </button>
            );
          })}
        </div>

        {/* Textarea (display only) */}
        <GlassCard level={1} className="p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {NOTE_PANELS.find((p) => p.id === active)?.label} · New Entry
            </p>
            <span className="text-[10px] text-muted-foreground/70">Not saved · UI preview</span>
          </div>
          <Textarea
            placeholder="Type an internal note about this redemption request… (display only — not saved)"
            className="min-h-[120px] bg-transparent resize-y text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-electric/40"
          />
          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Lock size={9} className="opacity-60" />
              Saving disabled — backend integration pending
            </p>
            <div className="flex items-center gap-1.5">
              <LootButton size="sm" variant="ghost" leftIcon={<X size={12} />}>
                Clear
              </LootButton>
              <LootButton size="sm" variant="electric" leftIcon={<Send size={12} />}>
                Save Note
              </LootButton>
            </div>
          </div>
        </GlassCard>

        {/* Notes history (skeleton) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
            Recent Notes
          </p>
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <GlassCard key={i} level={2} className="p-3 flex items-start gap-3">
                <div className="size-8 rounded-full shimmer shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 rounded shimmer" />
                    <div className="h-2.5 w-16 rounded shimmer" />
                  </div>
                  <div className="h-2.5 w-full rounded shimmer" />
                  <div className="h-2.5 w-2/3 rounded shimmer" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 13: Report Center
   ============================================================ */

function ReportCenterSection() {
  const accentBg: Record<Accent, string> = {
    electric: "bg-electric/10 text-electric",
    cyan: "bg-cyan/10 text-cyan-brand",
    purple: "bg-purple/10 text-purple-brand",
    gold: "bg-gold/10 text-gold",
    emerald: "bg-emerald-brand/10 text-emerald-brand",
    rose: "bg-rose-brand/10 text-rose-brand",
    navy: "bg-navy/10 text-navy",
  };
  return (
    <WidgetCard
      title="Report Center"
      description="Generated executive reports"
      icon={<BarChart3 size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Placeholder
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {REPORT_TILES.map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.div
              key={r.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              {...hoverLift}
            >
              <GlassCard level={2} hover className="p-4 space-y-3 h-full relative overflow-hidden">
                <div className="absolute -top-6 -right-6 size-20 rounded-full bg-electric/8 blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center", accentBg[r.accent])}>
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
                    {r.future ? "Scheduled" : "Ready"}
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
   Section 14: Export Center
   ============================================================ */

function ExportCenterSection() {
  return (
    <WidgetCard
      title="Export Center"
      description="Download or schedule redemption data exports"
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
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                    <Lock size={8} /> Coming soon
                  </span>
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
   Main View: CeoRedeemView
   ============================================================ */

export function CeoRedeemView() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <PageContainer>
      <PageHeader
        title="Redeem Management"
        description="Review & approve reward redemption requests"
        actions={
          <>
            <LootButton variant="glass" size="sm" leftIcon={<Download size={14} />}>
              Export
              <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1 py-0.5 rounded">
                <Lock size={8} /> Soon
              </span>
            </LootButton>
            <LootButton
              variant="outline"
              size="sm"
              leftIcon={<Wallet size={14} />}
              onClick={() => navigate("ceo-wallet")}
            >
              Wallet
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
              variant="outline"
              size="sm"
              leftIcon={<UserCheck size={14} />}
              onClick={() => navigate("ceo-users")}
            >
              Users
            </LootButton>
            <LootButton variant="electric" size="sm" leftIcon={<RefreshCw size={14} />}>
              Refresh
            </LootButton>
          </>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 1. Redeem Overview */}
        <RedeemOverviewSection />

        {/* 2. Global Redeem Search */}
        <GlobalRedeemSearchSection />

        {/* 3. Advanced Filters */}
        <AdvancedFiltersSection />

        {/* 4. Redeem Table (with details drawer + admin action menu) */}
        <RedeemTableSection />

        {/* 6. Approval Workflow */}
        <ApprovalWorkflowSection />

        {/* 8. Verification Center */}
        <VerificationCenterSection />

        {/* 9. Redeem Analytics */}
        <RedeemAnalyticsSection />

        {/* 10. Reward Categories */}
        <RewardCategoriesSection />

        {/* 11. Audit History */}
        <AuditHistorySection />

        {/* 12. Administrator Notes */}
        <AdministratorNotesSection />

        {/* 13. Report Center */}
        <ReportCenterSection />

        {/* 14. Export Center */}
        <ExportCenterSection />

        {/* Footer note */}
        <GlassCard level={1} className="p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <motion.div {...floating}>
              <IconBadge name="ShieldCheck" accent="emerald" size="sm" />
            </motion.div>
            <div>
              <p className="text-xs font-semibold text-foreground">CEO Secure Redeem Console</p>
              <p className="text-[11px] text-muted-foreground">
                All redemption reviews are audited. No approval logic or wallet deduction is performed in this preview.
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
