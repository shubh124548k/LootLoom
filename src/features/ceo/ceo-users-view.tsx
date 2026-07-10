"use client";

/* ============================================================
   LootLoom — CEO User Management Center
   View renders INSIDE the CeoLayout. No sidebar/header/background.
   Skeleton-first: no backend, no user data, no mutations.
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
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Ban,
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
  Filter,
  Fingerprint,
  Flame,
  Gift,
  Globe,
  Headphones,
  History,
  KeyRound,
  Languages,
  LifeBuoy,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Monitor,
  MoreVertical,
  Network,
  Phone,
  Pencil,
  Power,
  Printer,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  Wallet,
  X,
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
  { id: "username", label: "Username" },
  { id: "userid", label: "User ID" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone Number" },
  { id: "referral", label: "Referral Code" },
  { id: "wallet", label: "Wallet ID", future: true },
  { id: "device", label: "Device ID", future: true },
  { id: "ip", label: "IP Address", future: true },
  { id: "session", label: "Session ID", future: true },
];

const ACCOUNT_STATUS_CHIPS: ChipDef[] = [
  { id: "active", label: "Active" },
  { id: "suspended", label: "Suspended" },
  { id: "pending", label: "Pending" },
];

const VERIFICATION_CHIPS: ChipDef[] = [
  { id: "verified", label: "Verified" },
  { id: "unverified", label: "Unverified" },
  { id: "pending", label: "Pending Review" },
];

const WALLET_STATUS_CHIPS: ChipDef[] = [
  { id: "active", label: "Active Wallet" },
  { id: "frozen", label: "Frozen Wallet" },
  { id: "flagged", label: "Flagged" },
];

const REFERRAL_CHIPS: ChipDef[] = [
  { id: "referrer", label: "Is Referrer" },
  { id: "referred", label: "Was Referred" },
  { id: "none", label: "No Referral" },
];

const ACHIEVEMENT_CHIPS: ChipDef[] = [
  { id: "completed", label: "Achievements Completed" },
  { id: "inprogress", label: "In Progress" },
  { id: "none", label: "No Achievements" },
];

const LAST_LOGIN_CHIPS: ChipDef[] = [
  { id: "1h", label: "Last 1 hour" },
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
];

const DEVICE_CHIPS: ChipDef[] = [
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
  { id: "tablet", label: "Tablet" },
];

const PLATFORM_CHIPS: ChipDef[] = [
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" },
  { id: "web", label: "Web" },
  { id: "windows", label: "Windows" },
  { id: "macos", label: "macOS" },
];

const RISK_CHIPS: ChipDef[] = [
  { id: "low", label: "Low Risk" },
  { id: "medium", label: "Medium Risk" },
  { id: "high", label: "High Risk" },
  { id: "critical", label: "Critical" },
];

const SORT_OPTIONS = [
  "Newest Registration",
  "Oldest Registration",
  "Most Active",
  "Highest Coin Balance",
  "Lowest Coin Balance",
  "Highest XP",
  "Highest Risk Score",
  "Last Login (Recent)",
] as const;

const OVERVIEW_STATS = [
  { label: "Total Registered Users", value: 0, icon: "Users", accent: "electric" as Accent },
  { label: "Today's Registrations", value: 0, icon: "UserPlus", accent: "emerald" as Accent, trend: { value: 0, positive: true } },
  { label: "Active Users", value: 0, icon: "UserCheck", accent: "cyan" as Accent },
  { label: "Online Now", value: 0, icon: "Activity", accent: "electric" as Accent },
  { label: "Suspended Users", value: 0, icon: "UserX", accent: "rose" as Accent },
  { label: "Verified Users", value: 0, icon: "ShieldCheck", accent: "emerald" as Accent },
  { label: "Unverified Users", value: 0, icon: "ShieldAlert", accent: "gold" as Accent },
  { label: "Premium Users", value: 0, icon: "Crown", accent: "purple" as Accent },
  { label: "VIP Users", value: 0, icon: "Trophy", accent: "gold" as Accent },
] as const;

const TABLE_COLUMNS = [
  { key: "userid", label: "User ID", className: "w-[120px]" },
  { key: "avatar", label: "User", className: "min-w-[200px]" },
  { key: "email", label: "Email", className: "min-w-[200px] hidden xl:table-cell" },
  { key: "phone", label: "Phone", className: "min-w-[140px] hidden 2xl:table-cell" },
  { key: "coins", label: "Coins", className: "w-[100px] hidden lg:table-cell" },
  { key: "wallet", label: "Wallet", className: "w-[110px] hidden lg:table-cell" },
  { key: "level", label: "Level", className: "w-[90px] hidden xl:table-cell" },
  { key: "xp", label: "XP", className: "w-[90px] hidden 2xl:table-cell" },
  { key: "verification", label: "Verification", className: "w-[130px] hidden lg:table-cell" },
  { key: "registered", label: "Registered", className: "w-[130px] hidden xl:table-cell" },
  { key: "lastlogin", label: "Last Login", className: "w-[130px] hidden xl:table-cell" },
  { key: "status", label: "Status", className: "w-[110px]" },
  { key: "actions", label: "", className: "w-[120px] text-right" },
] as const;

const ANALYTICS_PERIODS = ["7D", "30D", "90D", "1Y"] as const;
type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

const REGISTRATION_TREND = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 0 },
  { label: "Wed", value: 0 },
  { label: "Thu", value: 0 },
  { label: "Fri", value: 0 },
  { label: "Sat", value: 0 },
  { label: "Sun", value: 0 },
];

const ACTIVITY_TREND = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 0 },
  { label: "Wed", value: 0 },
  { label: "Thu", value: 0 },
  { label: "Fri", value: 0 },
  { label: "Sat", value: 0 },
  { label: "Sun", value: 0 },
];

const COIN_TREND = [
  { label: "W1", value: 0 },
  { label: "W2", value: 0 },
  { label: "W3", value: 0 },
  { label: "W4", value: 0 },
  { label: "W5", value: 0 },
  { label: "W6", value: 0 },
];

const REWARD_TREND = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 0 },
  { label: "Wed", value: 0 },
  { label: "Thu", value: 0 },
  { label: "Fri", value: 0 },
  { label: "Sat", value: 0 },
  { label: "Sun", value: 0 },
];

const REFERRAL_TREND = [
  { label: "W1", value: 0 },
  { label: "W2", value: 0 },
  { label: "W3", value: 0 },
  { label: "W4", value: 0 },
  { label: "W5", value: 0 },
  { label: "W6", value: 0 },
];

const LOGIN_TREND = [
  { label: "W1", value: 0 },
  { label: "W2", value: 0 },
  { label: "W3", value: 0 },
  { label: "W4", value: 0 },
  { label: "W5", value: 0 },
  { label: "W6", value: 0 },
];

const ADMIN_ACTIONS: {
  id: string;
  label: string;
  icon: typeof Eye;
  variant?: "default" | "warning" | "destructive";
  future?: boolean;
}[] = [
  { id: "view", label: "View User", icon: Eye },
  { id: "edit", label: "Edit User", icon: Pencil, future: true },
  { id: "adjust-wallet", label: "Adjust Wallet", icon: Wallet, future: true },
  { id: "view-wallet", label: "View Wallet", icon: Wallet },
  { id: "view-rewards", label: "View Rewards", icon: Gift },
  { id: "view-redeems", label: "View Redeems", icon: Trophy },
  { id: "view-notifications", label: "View Notifications", icon: Bell },
  { id: "view-support", label: "View Support Tickets", icon: LifeBuoy },
  { id: "view-audit", label: "View Audit Logs", icon: History },
  { id: "suspend", label: "Suspend User", icon: Ban, variant: "warning", future: true },
  { id: "reactivate", label: "Reactivate User", icon: Power, variant: "default", future: true },
  { id: "reset-password", label: "Reset Password", icon: KeyRound, future: true },
  { id: "force-logout", label: "Force Logout", icon: LogOut, future: true },
  { id: "delete", label: "Delete User", icon: Trash2, variant: "destructive", future: true },
];

const EXPORT_TILES = [
  { id: "csv", label: "CSV Export", desc: "Comma-separated values", icon: Download },
  { id: "excel", label: "Excel Workbook", desc: "Microsoft .xlsx", icon: Briefcase },
  { id: "pdf", label: "PDF Report", desc: "Formatted PDF document", icon: Printer },
  { id: "print", label: "Print Preview", desc: "Print-ready layout", icon: Printer },
  { id: "scheduled", label: "Scheduled Reports", desc: "Daily / weekly / monthly", icon: Calendar, future: true },
  { id: "api", label: "API Export", desc: "Programmatic delivery", icon: Network, future: true },
];

const BULK_ACTIONS = [
  { id: "export", label: "Export Selected", icon: Download, future: true },
  { id: "assign", label: "Assign Tag", icon: Tag, future: true },
  { id: "notify", label: "Send Notification", icon: Send, future: true },
  { id: "suspend", label: "Suspend", icon: Ban, variant: "warning" as const, future: true },
  { id: "activate", label: "Activate", icon: Power, future: true },
  { id: "role", label: "Assign Role", icon: ShieldCheck, future: true },
  { id: "tags", label: "Bulk Tags", icon: Star, future: true },
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
   Confirmation modal for admin actions. No backend.
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
   Reusable Helper: AdminActionMenu
   Dropdown with all admin actions. Triggers confirm dialog for
   destructive operations.
   ============================================================ */

export function AdminActionMenu({ compact = false }: { compact?: boolean }) {
  const [confirm, setConfirm] = useState<{ open: boolean; actionId: string | null }>({
    open: false,
    actionId: null,
  });

  const triggerAction = (action: (typeof ADMIN_ACTIONS)[number]) => {
    if (action.variant === "warning" || action.variant === "destructive") {
      setConfirm({ open: true, actionId: action.id });
    }
  };

  const currentAction = ADMIN_ACTIONS.find((a) => a.id === confirm.actionId);

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
            aria-label="Admin actions"
          >
            <MoreVertical size={compact ? 14 : 16} />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 glass-2 ring-1 ring-border">
          <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Administrator Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ADMIN_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            const isDestructive = action.variant === "destructive";
            const isWarning = action.variant === "warning";
            const needsSepBefore = i > 0 && ADMIN_ACTIONS[i - 1]?.variant !== action.variant && action.variant !== "default";
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
            ? "This is a destructive placeholder action. No data will be modified. Backend integration is pending."
            : "This is a placeholder administrative action. No state will change. Backend integration is pending."
        }
        variant={currentAction?.variant === "destructive" ? "destructive" : "warning"}
        confirmLabel={currentAction?.variant === "destructive" ? "Confirm Delete" : "Confirm"}
      />
    </>
  );
}

/* ============================================================
   Reusable Helper: UserTableRow
   Skeleton table row matching the column header layout.
   ============================================================ */

export function UserTableRow() {
  return (
    <div className="grid grid-cols-[120px_1fr_100px_110px_90px_130px_110px_120px] items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0">
      <div className="h-3 w-16 rounded shimmer" />
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-full shimmer" />
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded shimmer" />
          <div className="h-2.5 w-36 rounded shimmer" />
        </div>
      </div>
      <div className="h-3 w-14 rounded shimmer" />
      <div className="h-5 w-20 rounded-full shimmer" />
      <div className="h-3 w-10 rounded shimmer" />
      <div className="h-5 w-24 rounded-full shimmer" />
      <div className="h-3 w-20 rounded shimmer" />
      <div className="flex items-center justify-end gap-1.5">
        <div className="h-7 w-12 rounded-md shimmer" />
        <div className="size-7 rounded-md shimmer" />
      </div>
    </div>
  );
}

/* ============================================================
   Reusable Helper: UserCardMobile
   Skeleton mobile card for users list.
   ============================================================ */

export function UserCardMobile() {
  return (
    <GlassCard level={1} className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox />
        <div className="size-11 rounded-full shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded shimmer" />
          <div className="h-2.5 w-40 rounded shimmer" />
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
   Sticky bar shown above the table when items are selected.
   ============================================================ */

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
}

export function BulkActionBar({ selectedCount, onClear }: BulkActionBarProps) {
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
              <span className="text-xs font-semibold text-foreground">selected</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {BULK_ACTIONS.map((a) => {
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
   Reusable Helper: UserProfileDrawer
   Right-side Sheet drawer with full user profile tabs.
   All skeleton/placeholder content.
   ============================================================ */

export function UserProfileDrawer({
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
        {/* Banner + avatar header */}
        <div className="relative h-32 sm:h-36 bg-[linear-gradient(120deg,var(--navy),var(--electric)_55%,var(--purple-brand))] overflow-hidden">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay">
            <div className="absolute -top-8 -right-8 size-40 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-12 left-10 size-32 rounded-full bg-cyan-brand/30 blur-2xl" />
          </div>
          <SheetHeader className="absolute inset-x-0 top-0 p-4">
            <SheetTitle className="sr-only">User Profile</SheetTitle>
            <SheetDescription className="sr-only">
              Detailed administrator view of user account.
            </SheetDescription>
          </SheetHeader>
          <div className="absolute bottom-3 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/20">
            <Lock size={10} /> ADMIN VIEW
          </div>
        </div>

        {/* Profile header */}
        <div className="px-5 -mt-10 relative">
          <div className="flex items-end gap-4">
            <div className="size-20 rounded-2xl glass-2 ring-4 ring-background shimmer shrink-0" />
            <div className="flex-1 space-y-2 pb-2">
              <div className="h-5 w-32 rounded shimmer" />
              <div className="h-3 w-48 rounded shimmer" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Current Coins", icon: Coins, accent: "gold" as Accent },
              { label: "Current Rank", icon: Trophy, accent: "purple" as Accent },
              { label: "Daily Streak", icon: Flame, accent: "rose" as Accent },
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

          {/* Tabs */}
          <Tabs defaultValue="overview" className="mt-5">
            <TabsList className="bg-muted/60 w-full justify-start overflow-x-auto h-auto p-1">
              <TabsTrigger value="overview" className="gap-1.5">
                <Eye size={13} /> Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5">
                <Activity size={13} /> Activity
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5">
                <ShieldCheck size={13} /> Security
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-1.5">
                <Settings size={13} /> Admin Actions
              </TabsTrigger>
            </TabsList>

            {/* ===== Overview Tab ===== */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              <ProfileInfoGrid />
              <ProfileSummaryWidgets />
            </TabsContent>

            {/* ===== Activity Tab ===== */}
            <TabsContent value="activity" className="mt-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Activity Timeline
              </p>
              <ActivityTimeline />
            </TabsContent>

            {/* ===== Security Tab ===== */}
            <TabsContent value="security" className="mt-4 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Security Status
              </p>
              <SecurityBadges />
            </TabsContent>

            {/* ===== Admin Actions Tab ===== */}
            <TabsContent value="admin" className="mt-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Administrator Controls
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ADMIN_ACTIONS.map((a) => {
                  const Icon = a.icon;
                  const isDestructive = a.variant === "destructive";
                  const isWarning = a.variant === "warning";
                  return (
                    <button
                      key={a.id}
                      className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-xl ring-1 text-left transition-all",
                        isDestructive
                          ? "ring-rose-brand/20 bg-rose-brand/5 hover:bg-rose-brand/10 text-rose-brand"
                          : isWarning
                          ? "ring-gold/20 bg-gold/5 hover:bg-gold/10 text-gold"
                          : "ring-border bg-transparent hover:bg-accent/60 text-foreground"
                      )}
                    >
                      <Icon size={14} />
                      <span className="flex-1 text-xs font-semibold">{a.label}</span>
                      {a.future && <Lock size={9} className="opacity-60" />}
                    </button>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="h-8" />
      </SheetContent>
    </Sheet>
  );
}

/* ===== Profile Info Grid (used inside Overview tab) ===== */

function ProfileInfoGrid() {
  const info: { label: string; icon: string; future?: boolean }[] = [
    { label: "Full Name", icon: "Users" },
    { label: "Email Address", icon: "Mail" },
    { label: "Phone Number", icon: "Phone" },
    { label: "Country", icon: "Globe" },
    { label: "Timezone", icon: "Clock" },
    { label: "Registration Date", icon: "Calendar" },
    { label: "Last Login", icon: "LogIn" },
    { label: "Member Since", icon: "History" },
    { label: "Current XP", icon: "Zap" },
    { label: "Referral Code", icon: "Tag" },
    { label: "Device List", icon: "Monitor", future: true },
    { label: "Session List", icon: "History", future: true },
    { label: "Security Score", icon: "ShieldCheck", future: true },
    { label: "Risk Score", icon: "AlertTriangle", future: true },
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

/* ===== Profile Summary Widgets (Account Summary section, inside drawer) ===== */

function ProfileSummaryWidgets() {
  const summaries = [
    { label: "Wallet Summary", icon: Wallet, accent: "electric" as Accent },
    { label: "Reward Summary", icon: Gift, accent: "purple" as Accent },
    { label: "Redeem Summary", icon: Trophy, accent: "gold" as Accent },
    { label: "Notification Summary", icon: Bell, accent: "cyan" as Accent },
    { label: "Support Summary", icon: LifeBuoy, accent: "navy" as Accent },
    { label: "Referral Summary", icon: UserPlus, accent: "emerald" as Accent },
    { label: "Achievement Summary", icon: Award, accent: "rose" as Accent },
    { label: "Leaderboard Summary", icon: Crown, accent: "purple" as Accent },
  ];
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2.5">
        Account Summaries
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

/* ===== Activity Timeline (inside drawer) ===== */

function ActivityTimeline() {
  const events = [
    { label: "Registration", icon: UserPlus, accent: "electric" as Accent },
    { label: "Login", icon: LogIn, accent: "cyan" as Accent },
    { label: "Reward Earned", icon: Gift, accent: "purple" as Accent },
    { label: "Wallet Transaction", icon: Wallet, accent: "gold" as Accent },
    { label: "Redeem", icon: Trophy, accent: "emerald" as Accent },
    { label: "Referral", icon: UserPlus, accent: "cyan" as Accent },
    { label: "Support Ticket", icon: LifeBuoy, accent: "navy" as Accent },
    { label: "Security Event", icon: ShieldAlert, accent: "rose" as Accent, future: true },
  ];
  return (
    <div className="relative pl-4">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-electric/40 via-border to-transparent" />
      <div className="space-y-2.5">
        {events.map((e, i) => {
          const Icon = e.icon;
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
            <motion.div
              key={e.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <span className={cn(
                "absolute -left-4 top-3 size-3.5 rounded-full ring-2 ring-background flex items-center justify-center",
                accentBg[e.accent]
              )}>
                <Icon size={8} />
              </span>
              <GlassCard level={1} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    {e.label}
                    {e.future && <Lock size={9} className="text-muted-foreground/60" />}
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

/* ===== Security Badges (inside drawer) ===== */

function SecurityBadges() {
  const security = [
    { label: "Email Verification", icon: Mail, status: "verified" },
    { label: "Phone Verification", icon: Phone, status: "verified" },
    { label: "Password Status", icon: KeyRound, status: "strong", future: true },
    { label: "Two-Factor Auth (2FA)", icon: ShieldCheck, status: "off", future: true },
    { label: "Trusted Devices", icon: Monitor, status: "neutral", future: true },
    { label: "Device Fingerprint", icon: Fingerprint, status: "neutral", future: true },
    { label: "Login Attempts", icon: LogIn, status: "neutral", future: true },
    { label: "Risk Analysis", icon: AlertTriangle, status: "neutral", future: true },
    { label: "Suspicious Activity", icon: ShieldAlert, status: "neutral", future: true },
  ] as const;

  const statusMap: Record<string, { variant: "success" | "warning" | "error" | "default" | "info"; label: string }> = {
    verified: { variant: "success", label: "Verified" },
    strong: { variant: "success", label: "Strong" },
    off: { variant: "warning", label: "Disabled" },
    neutral: { variant: "default", label: "Pending" },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {security.map((s) => {
        const Icon = s.icon;
        const meta = statusMap[s.status];
        return (
          <GlassCard key={s.label} level={2} className="p-3 flex items-center gap-3">
            <Icon size={15} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                {s.label}
                {s.future && <Lock size={9} className="text-muted-foreground/60" />}
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

/* ============================================================
   Empty / Error State Helpers
   ============================================================ */

export function NoUsersEmpty({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon="Users"
      title="No registered users yet"
      description="The platform has not registered any users. New sign-ups will appear here automatically."
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

export function NoSearchResultsEmpty({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon="Search"
      title="No matching users"
      description="No users matched your search query or active filters. Try adjusting the keywords or clearing filters."
      action={
        onClear && (
          <LootButton variant="glass" size="sm" leftIcon={<X size={14} />} onClick={onClear}>
            Clear Search
          </LootButton>
        )
      }
    />
  );
}

export function UserModuleUnavailableError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon="ServerCrash"
      title="User module temporarily unavailable"
      description="We could not reach the user management service. Please retry or check service status in Mission Control."
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
   Section: Overview Stats
   ============================================================ */

function OverviewStatsSection() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
      <Grid cols={4}>
        {OVERVIEW_STATS.map((s, i) => (
          <div key={s.label} variants={cardReveal} custom={i}>
            <StatCard
              index={i}
              label={s.label}
              value={s.value}
              icon={s.icon}
              accent={s.accent}
              trend={"trend" in s ? s.trend : undefined}
            />
          </div>
        ))}
      </Grid>
    </motion.div>
  );
}

/* ============================================================
   Section: Global User Search
   ============================================================ */

function GlobalSearchSection() {
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState("username");

  return (
    <WidgetCard
      title="Global User Search"
      description="Cross-platform lookup by identifier"
      icon={<Search size={18} className="text-electric" />}
      action={<StatusBadge variant="info" dot pulse>Live</StatusBadge>}
    >
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username, ID, email, phone, referral code, wallet, device, IP, session…"
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
            Indexed across all identifiers
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
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>("Newest Registration");
  const [active, setActive] = useState<Record<string, string[]>>({
    account: ["active"],
    verification: ["verified"],
    wallet: [],
    referral: [],
    achievement: [],
    lastlogin: [],
    device: [],
    platform: [],
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
    setActive({ account: [], verification: [], wallet: [], referral: [], achievement: [], lastlogin: [], device: [], platform: [], risk: [] });

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
      description="Granular refinement across account, wallet, device & risk dimensions"
      icon={<SlidersHorizontal size={18} className="text-electric" />}
      action={
        <div className="flex items-center gap-2">
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
        </div>
      }
    >
      <div className="space-y-5">
        {/* Date range + coin range */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        </div>

        {/* Chip groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderChipGroup("Account Status", ACCOUNT_STATUS_CHIPS, "emerald")}
          {renderChipGroup("Verification Status", VERIFICATION_CHIPS, "cyan")}
          {renderChipGroup("Wallet Status", WALLET_STATUS_CHIPS, "gold")}
          {renderChipGroup("Referral Status", REFERRAL_CHIPS, "purple")}
          {renderChipGroup("Achievement Status", ACHIEVEMENT_CHIPS, "rose")}
          {renderChipGroup("Last Login", LAST_LOGIN_CHIPS, "electric")}
          {renderChipGroup("Device Type", DEVICE_CHIPS, "navy")}
          {renderChipGroup("Platform", PLATFORM_CHIPS, "cyan")}
          {renderChipGroup("Risk Level", RISK_CHIPS, "rose")}
        </div>

        {/* Country / Language placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard level={1} className="p-3.5 space-y-2">
            <div className="flex items-center gap-1.5">
              <Globe size={12} className="text-electric" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Country <Lock size={9} className="opacity-60 ml-0.5" />
              </p>
            </div>
            <div className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Select country…</span>
              <ChevronDown size={12} className="text-muted-foreground" />
            </div>
          </GlassCard>
          <GlassCard level={1} className="p-3.5 space-y-2">
            <div className="flex items-center gap-1.5">
              <Languages size={12} className="text-electric" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Language <Lock size={9} className="opacity-60 ml-0.5" />
              </p>
            </div>
            <div className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Select language…</span>
              <ChevronDown size={12} className="text-muted-foreground" />
            </div>
          </GlassCard>
        </div>

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
   Section: User Table
   ============================================================ */

function UserTableSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const allSelected = selected.length === 10;

  const toggleAll = () => setSelected(allSelected ? [] : Array.from({ length: 10 }, (_, i) => i));
  const toggleOne = (i: number) =>
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  return (
    <WidgetCard
      title="User Directory"
      description="All platform users — live table"
      icon={<Users size={18} className="text-electric" />}
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
      <div className="hidden lg:block rounded-xl overflow-hidden ring-1 ring-border/60">
        {/* Header row */}
        <div className="bg-muted/40 grid grid-cols-[120px_1fr_100px_110px_90px_130px_110px_120px] items-center gap-3 px-4 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">User ID</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">User</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Coins</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wallet</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Level</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verification</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</span>
        </div>
        {/* Skeleton rows */}
        <div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[120px_1fr_100px_110px_90px_130px_110px_120px] items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selected.includes(i)}
                  onCheckedChange={() => toggleOne(i)}
                  aria-label={`Select row ${i + 1}`}
                />
                <div className="h-3 w-16 rounded shimmer" />
              </div>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full shimmer shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <div className="h-3 w-28 rounded shimmer" />
                  <div className="h-2.5 w-36 rounded shimmer" />
                </div>
              </div>
              <div className="h-3 w-14 rounded shimmer" />
              <div className="h-5 w-20 rounded-full shimmer" />
              <div className="h-3 w-10 rounded shimmer" />
              <div className="h-5 w-24 rounded-full shimmer" />
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
                <AdminActionMenu compact />
              </div>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="bg-muted/30 flex items-center justify-between px-4 py-2.5 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            Showing <span className="font-semibold text-foreground">1–10</span> of{" "}
            <span className="font-semibold text-foreground">—</span> users
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
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <UserCardMobile />
            <div className="flex items-center justify-end gap-2 -mt-1">
              <LootButton
                size="sm"
                variant="outline"
                leftIcon={<Eye size={12} />}
                onClick={() => setDrawerOpen(true)}
              >
                View
              </LootButton>
              <AdminActionMenu compact />
            </div>
          </div>
        ))}
      </div>

      <UserProfileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </WidgetCard>
  );
}

/* ============================================================
   Section: User Analytics
   ============================================================ */

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
  type: "line" | "bar" | "area";
  data: { label: string; value: number }[];
  index: number;
  accent: Accent;
}) {
  const accentColor: Record<Accent, string> = {
    electric: "oklch(0.62 0.22 255)",
    cyan: "oklch(0.72 0.15 200)",
    purple: "oklch(0.6 0.22 295)",
    gold: "oklch(0.8 0.16 85)",
    emerald: "oklch(0.7 0.17 160)",
    rose: "oklch(0.65 0.21 15)",
    navy: "oklch(0.3 0.1 260)",
  };
  const color = accentColor[accent];

  return (
    <WidgetCard
      title={title}
      description={description}
      icon={icon}
      index={index}
    >
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
          ) : (
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
          )}
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

function UserAnalyticsSection() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30D");

  return (
    <WidgetCard
      title="User Analytics"
      description="Aggregate platform-wide user trends"
      icon={<Activity size={18} className="text-electric" />}
      action={<AnalyticsTabs value={period} onChange={setPeriod} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnalyticsChartCard
          title="Registration Trend"
          description="New sign-ups over time"
          icon={<UserPlus size={16} className="text-electric" />}
          type="line"
          data={REGISTRATION_TREND}
          index={0}
          accent="electric"
        />
        <AnalyticsChartCard
          title="Activity Trend"
          description="Daily active users"
          icon={<Activity size={16} className="text-cyan-brand" />}
          type="bar"
          data={ACTIVITY_TREND}
          index={1}
          accent="cyan"
        />
        <AnalyticsChartCard
          title="Coin Trend"
          description="Aggregate coin balance"
          icon={<Coins size={16} className="text-gold" />}
          type="area"
          data={COIN_TREND}
          index={2}
          accent="gold"
        />
        <AnalyticsChartCard
          title="Reward Trend"
          description="Rewards claimed"
          icon={<Gift size={16} className="text-purple-brand" />}
          type="bar"
          data={REWARD_TREND}
          index={3}
          accent="purple"
        />
        <AnalyticsChartCard
          title="Referral Trend"
          description="Successful referrals"
          icon={<UserPlus size={16} className="text-emerald-brand" />}
          type="line"
          data={REFERRAL_TREND}
          index={4}
          accent="emerald"
        />
        <AnalyticsChartCard
          title="Login Trend"
          description="Total logins"
          icon={<LogIn size={16} className="text-rose-brand" />}
          type="area"
          data={LOGIN_TREND}
          index={5}
          accent="rose"
        />
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section: Bulk Actions
   ============================================================ */

function BulkActionsSection() {
  return (
    <WidgetCard
      title="Bulk Operations"
      description="Mass operations across multiple users"
      icon={<Briefcase size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Pending Backend
        </StatusBadge>
      }
    >
      <div className="space-y-4">
        <GlassCard level={1} className="p-3.5 flex items-center gap-3">
          <Checkbox />
          <div className="flex-1">
            <p className="text-xs font-semibold text-foreground">Select All Visible Users</p>
            <p className="text-[11px] text-muted-foreground">Apply bulk operations to all users currently in the table.</p>
          </div>
          <ChevronRight size={14} className="text-muted-foreground" />
        </GlassCard>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {BULK_ACTIONS.map((a) => {
            const Icon = a.icon;
            const isWarning = a.variant === "warning";
            return (
              <button
                key={a.id}
                className={cn(
                  "flex flex-col items-start gap-2 p-3 rounded-xl ring-1 text-left transition-all",
                  isWarning
                    ? "ring-gold/20 bg-gold/5 hover:bg-gold/10"
                    : "ring-border bg-transparent hover:bg-accent/60"
                )}
              >
                <div className={cn(
                  "size-8 rounded-lg flex items-center justify-center",
                  isWarning ? "bg-gold/15 text-gold" : "bg-electric/10 text-electric"
                )}>
                  <Icon size={14} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                    {a.label}
                    {a.future && <Lock size={9} className="text-muted-foreground/60" />}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Placeholder · No backend</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-electric" />
            All bulk operations require CEO confirmation.
          </p>
          <LootButton size="sm" variant="outline" leftIcon={<RotateCcw size={13} />}>
            Reset Selection
          </LootButton>
        </div>
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
      description="Download or schedule user data exports"
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
                  {t.future && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                      <Lock size={8} /> Soon
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
   Main View: CeoUsersView
   ============================================================ */

export function CeoUsersView() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <PageContainer>
      <PageHeader
        title="User Management"
        description="View, search and manage platform users"
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

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 1. Overview Stats */}
        <OverviewStatsSection />

        {/* 2. Global Search */}
        <GlobalSearchSection />

        {/* 3. Advanced Filters */}
        <AdvancedFiltersSection />

        {/* 4. User Table (with profile drawer + admin action menu) */}
        <UserTableSection />

        {/* 10. User Analytics */}
        <UserAnalyticsSection />

        {/* 11. Bulk Actions */}
        <BulkActionsSection />

        {/* 12. Export Center */}
        <ExportCenterSection />

        {/* Footer note */}
        <GlassCard level={1} className="p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <IconBadge name="ShieldCheck" accent="emerald" size="sm" />
            <div>
              <p className="text-xs font-semibold text-foreground">CEO Secure Session</p>
              <p className="text-[11px] text-muted-foreground">
                All user management actions are audited and recorded.
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
