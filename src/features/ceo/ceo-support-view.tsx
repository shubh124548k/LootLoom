"use client";

/* ============================================================
   LootLoom — CEO Support & Ticket Management Center
   View renders INSIDE the CeoLayout. No sidebar/header/background.
   Skeleton-first: no backend, no messaging, no ticket processing.
   Inherits premium WHITE executive design language (navy + electric).
   ============================================================ */

import { useState } from "react";
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
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Cloud,
  Download,
  Eye,
  FileText,
  Filter,
  Globe,
  Headphones,
  HelpCircle,
  History,
  Inbox,
  Languages,
  Lock,
  Mail,
  Megaphone,
  MessageSquare,
  MessageSquareReply,
  Monitor,
  MoreVertical,
  Paperclip,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  Ticket as TicketIcon,
  TrendingDown,
  TrendingUp,
  Users,
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
  { id: "ticketid", label: "Ticket ID" },
  { id: "userid", label: "User ID" },
  { id: "username", label: "Username" },
  { id: "email", label: "Email" },
  { id: "category", label: "Category" },
  { id: "subject", label: "Subject" },
  { id: "priority", label: "Priority" },
  { id: "status", label: "Status" },
  { id: "device", label: "Device ID", future: true },
  { id: "session", label: "Session ID", future: true },
  { id: "conversation", label: "Conversation ID", future: true },
];

const STATUS_CHIPS: ChipDef[] = [
  { id: "open", label: "Open" },
  { id: "pending", label: "Pending Reply" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" },
  { id: "reopened", label: "Reopened" },
  { id: "escalated", label: "Escalated" },
];

const PRIORITY_CHIPS: ChipDef[] = [
  { id: "urgent", label: "Urgent" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

const CATEGORY_CHIPS: ChipDef[] = [
  { id: "account", label: "Account" },
  { id: "wallet", label: "Wallet" },
  { id: "redeem", label: "Redeem" },
  { id: "reward", label: "Reward" },
  { id: "technical", label: "Technical" },
  { id: "billing", label: "Billing" },
  { id: "bug", label: "Bug Report" },
  { id: "feedback", label: "Feedback" },
];

const LAST_UPDATED_CHIPS: ChipDef[] = [
  { id: "1h", label: "Last 1 hour" },
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
];

const VERIFICATION_CHIPS: ChipDef[] = [
  { id: "verified", label: "Verified Users" },
  { id: "unverified", label: "Unverified Users" },
  { id: "pending", label: "Pending Review" },
];

const SORT_OPTIONS = [
  "Newest Tickets",
  "Oldest Tickets",
  "Highest Priority",
  "Most Recently Updated",
  "Most Replies",
  "Longest Open",
] as const;

const OVERVIEW_STATS: Array<{
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  accent: Accent;
  trend?: { value: number; positive: boolean };
  future?: boolean;
}> = [
  { label: "Total Tickets", value: 0, icon: "Ticket", accent: "electric" },
  { label: "Open Tickets", value: 0, icon: "Inbox", accent: "cyan", trend: { value: 0, positive: false } },
  { label: "Pending Replies", value: 0, icon: "MessageSquare", accent: "gold" },
  { label: "Resolved Tickets", value: 0, icon: "CheckCircle2", accent: "emerald" },
  { label: "Closed Tickets", value: 0, icon: "Lock", accent: "navy" },
  { label: "High Priority Tickets", value: 0, icon: "AlertTriangle", accent: "rose", trend: { value: 0, positive: true } },
  { label: "Average Response Time", value: 0, suffix: "m", icon: "Clock", accent: "purple", future: true },
  { label: "Customer Satisfaction", value: 0, suffix: "%", icon: "Star", accent: "emerald", future: true },
  { label: "Today's Tickets", value: 0, icon: "Calendar", accent: "electric" },
  { label: "Weekly Tickets", value: 0, icon: "Calendar", accent: "cyan" },
  { label: "Monthly Tickets", value: 0, icon: "Calendar", accent: "purple" },
  { label: "Future AI Suggestions", value: 0, icon: "Bot", accent: "gold", future: true },
];

const TABLE_COLUMNS = [
  { key: "ticketid", label: "Ticket ID" },
  { key: "user", label: "User" },
  { key: "subject", label: "Subject", responsive: "hidden xl:table-cell" },
  { key: "category", label: "Category", responsive: "hidden lg:table-cell" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "created", label: "Created", responsive: "hidden xl:table-cell" },
  { key: "updated", label: "Updated", responsive: "hidden xl:table-cell" },
  { key: "assigned", label: "Assigned", responsive: "hidden 2xl:table-cell", future: true },
  { key: "details", label: "Details" },
  { key: "actions", label: "" },
] as const;

const ANALYTICS_PERIODS = ["7D", "30D", "90D", "1Y"] as const;
type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

const CHART_COLORS: Record<Accent, string> = {
  electric: "oklch(0.62 0.22 255)",
  cyan: "oklch(0.72 0.15 200)",
  purple: "oklch(0.6 0.22 295)",
  gold: "oklch(0.8 0.16 85)",
  emerald: "oklch(0.7 0.17 160)",
  rose: "oklch(0.65 0.21 15)",
  navy: "oklch(0.3 0.1 260)",
};

const CATEGORY_BAR_DATA = [
  { label: "Account", value: 0 },
  { label: "Wallet", value: 0 },
  { label: "Redeem", value: 0 },
  { label: "Reward", value: 0 },
  { label: "Technical", value: 0 },
  { label: "Billing", value: 0 },
];

const RESOLUTION_TREND = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 0 },
  { label: "Wed", value: 0 },
  { label: "Thu", value: 0 },
  { label: "Fri", value: 0 },
  { label: "Sat", value: 0 },
  { label: "Sun", value: 0 },
];

const PRIORITY_PIE_DATA = [
  { name: "Urgent", value: 0, color: CHART_COLORS.rose },
  { name: "High", value: 0, color: CHART_COLORS.gold },
  { name: "Medium", value: 0, color: CHART_COLORS.electric },
  { name: "Low", value: 0, color: CHART_COLORS.cyan },
];

const RESPONSE_TIME_DATA = [
  { label: "Open", value: 0 },
  { label: "Pending", value: 0 },
  { label: "Resolved", value: 0 },
  { label: "Closed", value: 0 },
  { label: "Escal.", value: 0 },
];

const OPEN_CLOSED_DATA = [
  { label: "W1", value: 0 },
  { label: "W2", value: 0 },
  { label: "W3", value: 0 },
  { label: "W4", value: 0 },
  { label: "W5", value: 0 },
  { label: "W6", value: 0 },
];

const AUDIT_TIMELINE: Array<{
  id: string;
  label: string;
  icon: typeof Eye;
  accent: Accent;
  future?: boolean;
}> = [
  { id: "created", label: "Ticket Created", icon: TicketIcon, accent: "electric" },
  { id: "viewed", label: "Viewed", icon: Eye, accent: "cyan", future: true },
  { id: "assigned", label: "Assigned", icon: Users, accent: "purple", future: true },
  { id: "replied", label: "Replied", icon: MessageSquareReply, accent: "gold", future: true },
  { id: "closed", label: "Closed", icon: CheckCircle2, accent: "emerald", future: true },
  { id: "reopened", label: "Reopened", icon: RotateCcw, accent: "navy", future: true },
  { id: "escalated", label: "Escalated", icon: AlertTriangle, accent: "rose", future: true },
  { id: "ai", label: "Future AI Reply", icon: Bot, accent: "gold", future: true },
];

const ADMIN_ACTIONS: Array<{
  id: string;
  label: string;
  icon: typeof Eye;
  variant?: "default" | "warning" | "destructive";
  future?: boolean;
}> = [
  { id: "view", label: "View Ticket", icon: Eye },
  { id: "reply", label: "Reply", icon: MessageSquareReply, future: true },
  { id: "close", label: "Close Ticket", icon: CheckCircle2, variant: "warning" },
  { id: "reopen", label: "Reopen Ticket", icon: RotateCcw },
  { id: "assign", label: "Assign", icon: Users, future: true },
  { id: "transfer", label: "Transfer", icon: ArrowRight, future: true },
  { id: "escalate", label: "Escalate", icon: AlertTriangle, variant: "warning", future: true },
  { id: "merge", label: "Merge", icon: ClipboardList, future: true },
  { id: "delete", label: "Delete", icon: X, variant: "destructive", future: true },
  { id: "ai-reply", label: "Future AI Reply", icon: Bot, future: true },
  { id: "quick-replies", label: "Future Quick Replies", icon: Zap, future: true },
];

const BROADCAST_TILES: Array<{
  id: string;
  label: string;
  description: string;
  icon: typeof Megaphone;
  accent: Accent;
  future?: boolean;
}> = [
  { id: "user", label: "Send to User", description: "Direct message to a single user", icon: MessageSquare, accent: "electric", future: true },
  { id: "multiple", label: "Send to Multiple Users", description: "Segmented multi-recipient push", icon: Users, accent: "cyan", future: true },
  { id: "announce", label: "Announcement", description: "Platform-wide banner broadcast", icon: Megaphone, accent: "purple", future: true },
  { id: "email", label: "Email", description: "Transactional email campaign", icon: Mail, accent: "gold", future: true },
  { id: "push", label: "Push Notification", description: "Mobile & web push delivery", icon: Bell, accent: "emerald", future: true },
  { id: "sms", label: "SMS", description: "Carrier SMS gateway dispatch", icon: Smartphone, accent: "rose", future: true },
];

const REPORT_TILES: Array<{
  id: string;
  label: string;
  description: string;
  icon: typeof FileText;
  accent: Accent;
  future?: boolean;
}> = [
  { id: "daily", label: "Daily Tickets", description: "24-hour ticket volume", icon: Calendar, accent: "electric" },
  { id: "weekly", label: "Weekly Tickets", description: "7-day rolling summary", icon: Calendar, accent: "cyan" },
  { id: "monthly", label: "Monthly Tickets", description: "30-day trend analysis", icon: Calendar, accent: "purple" },
  { id: "priority", label: "Priority Reports", description: "Breakdown by urgency tier", icon: AlertTriangle, accent: "rose" },
  { id: "agent", label: "Agent Reports", description: "Per-staff performance", icon: Headphones, accent: "gold", future: true },
  { id: "performance", label: "Performance Reports", description: "CSAT & response SLA", icon: BarChart3, accent: "emerald", future: true },
];

const EXPORT_TILES: Array<{
  id: string;
  label: string;
  description: string;
  icon: typeof Download;
  accent: Accent;
  future?: boolean;
}> = [
  { id: "csv", label: "CSV", description: "Comma-separated values", icon: Download, accent: "electric" },
  { id: "excel", label: "Excel", description: "Microsoft .xlsx workbook", icon: Briefcase, accent: "emerald" },
  { id: "pdf", label: "PDF", description: "Formatted PDF document", icon: FileText, accent: "rose" },
  { id: "print", label: "Print", description: "Print-ready layout", icon: Printer, accent: "purple" },
  { id: "cloud", label: "Cloud Export", description: "Push to S3 / GCS bucket", icon: Cloud, accent: "cyan", future: true },
  { id: "scheduled", label: "Scheduled Reports", description: "Daily / weekly / monthly", icon: Calendar, accent: "gold", future: true },
];

const CONVERSATION_PLACEHOLDER: Array<{
  id: string;
  role: "user" | "admin";
  status?: string;
  statusVariant?: "info" | "success" | "warning";
}> = [
  { id: "m1", role: "user" },
  { id: "m2", role: "admin", status: "Replied", statusVariant: "success" },
  { id: "m3", role: "user", status: "Pending Reply", statusVariant: "warning" },
];

const TICKET_INFO_FIELDS: Array<{ label: string; icon: string; future?: boolean }> = [
  { label: "Ticket ID", icon: "Ticket" },
  { label: "Ticket Subject", icon: "FileText" },
  { label: "Category", icon: "Tag" },
  { label: "Priority", icon: "AlertTriangle" },
  { label: "Status", icon: "Activity" },
  { label: "Created Time", icon: "Clock" },
  { label: "Last Updated", icon: "RefreshCw" },
  { label: "Future Assigned Staff", icon: "Headphones", future: true },
  { label: "Future Device Information", icon: "Smartphone", future: true },
  { label: "Future Browser", icon: "Monitor", future: true },
  { label: "Future Platform", icon: "Globe", future: true },
];

const USER_INFO_FIELDS: Array<{ label: string; icon: string; future?: boolean }> = [
  { label: "Profile", icon: "Users" },
  { label: "Email", icon: "Mail" },
  { label: "Phone", icon: "Phone", future: true },
  { label: "Current Wallet", icon: "Wallet" },
  { label: "Current Level", icon: "Trophy" },
  { label: "Referral Summary", icon: "UserPlus" },
  { label: "Recent Activity", icon: "Activity" },
  { label: "Support History", icon: "LifeBuoy" },
  { label: "Future Risk Score", icon: "AlertTriangle", future: true },
  { label: "Future Verification", icon: "ShieldCheck", future: true },
];

const KNOWLEDGE_TILES: Array<{
  id: string;
  label: string;
  icon: typeof HelpCircle;
  accent: Accent;
  future?: boolean;
}> = [
  { id: "faq", label: "Suggested FAQ", icon: HelpCircle, accent: "electric" },
  { id: "articles", label: "Suggested Articles", icon: FileText, accent: "cyan" },
  { id: "related", label: "Related Issues", icon: ClipboardList, accent: "purple" },
  { id: "ai", label: "Future AI Suggestions", icon: Bot, accent: "gold", future: true },
  { id: "macros", label: "Future Macros", icon: Zap, accent: "emerald", future: true },
  { id: "templates", label: "Future Templates", icon: FileText, accent: "rose", future: true },
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
   Reusable Helper: AdminTicketActionMenu
   Dropdown with all admin ticket actions. Triggers confirm dialog
   for destructive / warning operations. No backend.
   ============================================================ */

export function AdminTicketActionMenu({ compact = false }: { compact?: boolean }) {
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
            aria-label="Ticket actions"
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
            const needsSepBefore =
              i > 0 && ADMIN_ACTIONS[i - 1]?.variant !== action.variant && action.variant !== "default";
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
            ? "This is a destructive placeholder action. No ticket data will be modified. Backend integration is pending."
            : "This is a placeholder administrative action. No ticket state will change. Backend integration is pending."
        }
        variant={currentAction?.variant === "destructive" ? "destructive" : "warning"}
        confirmLabel={currentAction?.variant === "destructive" ? "Confirm Delete" : "Confirm"}
      />
    </>
  );
}

/* ============================================================
   Reusable Helper: TicketTableRow
   Skeleton table row matching the column header layout.
   ============================================================ */

export function TicketTableRow({
  selected,
  onSelect,
  onView,
}: {
  selected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
}) {
  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors">
      {/* Ticket ID */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2">
          <Checkbox checked={selected} onCheckedChange={onSelect} aria-label="Select row" />
          <div className="h-3 w-16 rounded shimmer" />
        </div>
      </td>
      {/* User */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full shimmer shrink-0" />
          <div className="space-y-1.5 min-w-0">
            <div className="h-3 w-24 rounded shimmer" />
            <div className="h-2.5 w-32 rounded shimmer" />
          </div>
        </div>
      </td>
      {/* Subject */}
      <td className="hidden xl:table-cell px-4 py-3 align-middle">
        <div className="space-y-1.5">
          <div className="h-3 w-40 rounded shimmer" />
          <div className="h-2.5 w-28 rounded shimmer" />
        </div>
      </td>
      {/* Category */}
      <td className="hidden lg:table-cell px-4 py-3 align-middle">
        <div className="h-5 w-20 rounded-full shimmer" />
      </td>
      {/* Priority */}
      <td className="px-4 py-3 align-middle">
        <div className="h-5 w-16 rounded-full shimmer" />
      </td>
      {/* Status */}
      <td className="px-4 py-3 align-middle">
        <div className="h-5 w-24 rounded-full shimmer" />
      </td>
      {/* Created */}
      <td className="hidden xl:table-cell px-4 py-3 align-middle">
        <div className="h-3 w-20 rounded shimmer" />
      </td>
      {/* Updated */}
      <td className="hidden xl:table-cell px-4 py-3 align-middle">
        <div className="h-3 w-20 rounded shimmer" />
      </td>
      {/* Assigned */}
      <td className="hidden 2xl:table-cell px-4 py-3 align-middle">
        <div className="flex items-center gap-1.5">
          <Lock size={10} className="text-muted-foreground/50" />
          <div className="h-3 w-14 rounded shimmer" />
        </div>
      </td>
      {/* Details */}
      <td className="px-4 py-3 align-middle">
        <LootButton size="sm" variant="outline" leftIcon={<Eye size={12} />} onClick={onView}>
          Details
        </LootButton>
      </td>
      {/* Actions */}
      <td className="px-4 py-3 align-middle text-right">
        <div className="flex items-center justify-end">
          <AdminTicketActionMenu compact />
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   Reusable Helper: TicketCardMobile
   Skeleton mobile card for tickets list.
   ============================================================ */

export function TicketCardMobile({ onView }: { onView?: () => void }) {
  return (
    <GlassCard level={1} className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox />
        <div className="size-10 rounded-full shimmer shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-20 rounded shimmer" />
            <div className="h-5 w-16 rounded-full shimmer" />
          </div>
          <div className="h-2.5 w-32 rounded shimmer" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-3/4 rounded shimmer" />
        <div className="h-2.5 w-1/2 rounded shimmer" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="h-5 w-20 rounded-full shimmer" />
        <div className="h-5 w-24 rounded-full shimmer" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="h-3 w-24 rounded shimmer" />
        <div className="flex items-center gap-1.5">
          <LootButton size="sm" variant="outline" leftIcon={<Eye size={12} />} onClick={onView}>
            Details
          </LootButton>
          <AdminTicketActionMenu compact />
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================================================
   Reusable Helper: ChatBubble
   Glass conversation bubble — user left, admin right.
   Skeleton content (no message text rendered).
   ============================================================ */

interface ChatBubbleProps {
  role: "user" | "admin";
  status?: string;
  statusVariant?: "info" | "success" | "warning";
  timestamp?: boolean;
  attachment?: boolean;
}

export function ChatBubble({ role, status, statusVariant = "info", timestamp = true, attachment = false }: ChatBubbleProps) {
  const isAdmin = role === "admin";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, x: isAdmin ? 8 : -8 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4 }}
      className={cn("flex gap-2.5", isAdmin ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "size-8 rounded-xl shrink-0 flex items-center justify-center ring-1",
          isAdmin
            ? "bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] text-white ring-electric/30"
            : "bg-muted/60 text-muted-foreground ring-border"
        )}
      >
        {isAdmin ? <ShieldCheck size={14} /> : <Users size={14} />}
      </div>

      {/* Bubble */}
      <div className={cn("flex-1 max-w-[80%] space-y-2", isAdmin && "items-end flex flex-col")}>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-semibold text-foreground">{isAdmin ? "Administrator" : "User"}</span>
          {status && (
            <StatusBadge variant={statusVariant} dot>
              {status}
            </StatusBadge>
          )}
        </div>
        <div
          className={cn(
            "rounded-2xl p-3.5 ring-1",
            isAdmin
              ? "bg-electric/8 ring-electric/20 rounded-tr-sm"
              : "bg-muted/40 ring-border rounded-tl-sm"
          )}
        >
          <div className="space-y-2">
            <div className={cn("h-3 rounded shimmer", isAdmin ? "w-3/4 ml-auto" : "w-full")} />
            <div className={cn("h-3 rounded shimmer", isAdmin ? "w-1/2 ml-auto" : "w-2/3")} />
            <div className={cn("h-2.5 rounded shimmer", isAdmin ? "w-2/3 ml-auto" : "w-1/2")} />
          </div>

          {attachment && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-background/50 ring-1 ring-border/60 p-2">
              <div className="size-8 rounded-lg bg-electric/10 text-electric flex items-center justify-center shrink-0">
                <Paperclip size={14} />
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="h-2.5 w-24 rounded shimmer" />
                <div className="h-2 w-16 rounded shimmer" />
              </div>
              <Lock size={10} className="text-muted-foreground/50 shrink-0" />
            </div>
          )}
        </div>

        {timestamp && (
          <div className={cn("flex items-center gap-2 text-[10px] text-muted-foreground", isAdmin ? "justify-end" : "justify-start")}>
            <Clock size={9} />
            <span className="font-medium">—</span>
            <Lock size={9} className="opacity-50" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ============================================================
   Reusable Helper: ConversationViewer
   Premium chat interface inside the drawer. Display-only — the
   composer Textarea + send button do NOT submit any data.
   ============================================================ */

export function ConversationViewer() {
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-4">
      {/* Conversation stream */}
      <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
        {CONVERSATION_PLACEHOLDER.map((m) => (
          <ChatBubble
            key={m.id}
            role={m.role}
            status={m.status}
            statusVariant={m.statusVariant}
            attachment={m.id === "m3"}
          />
        ))}

        {/* Future features strip */}
        <GlassCard level={1} className="p-3 flex items-center gap-2 flex-wrap">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Future:
          </p>
          {[
            { label: "Emoji", icon: Sparkles },
            { label: "Voice", icon: Bell },
            { label: "Internal Reply", icon: Lock },
            { label: "Mentions", icon: AtSign },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <span
                key={f.label}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 ring-1 ring-border rounded-full px-2 py-0.5"
              >
                <Icon size={9} className="opacity-60" /> {f.label}
              </span>
            );
          })}
        </GlassCard>
      </div>

      {/* Composer (display-only) */}
      <div className="space-y-2">
        <div className="rounded-xl glass-2 ring-1 ring-border p-2 flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your administrator reply… (display only — no backend)"
            className="min-h-[60px] max-h-[140px] bg-transparent ring-0 border-0 focus-visible:ring-0 text-sm resize-none"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 ring-1 ring-border transition-all"
            >
              <Paperclip size={12} /> Attach
              <Lock size={9} className="opacity-60" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 ring-1 ring-border transition-all"
            >
              <Bot size={12} /> AI Reply
              <Lock size={9} className="opacity-60" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 ring-1 ring-border transition-all"
            >
              <Zap size={12} /> Quick Replies
              <Lock size={9} className="opacity-60" />
            </button>
          </div>
          <LootButton size="sm" variant="electric" leftIcon={<Send size={13} />}>
            Send Reply
          </LootButton>
        </div>
      </div>
    </div>
  );
}

/* Small inline AtSign icon (not in lucide-react import set above) */
function AtSign(props: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

/* ============================================================
   Reusable Helper: TicketDetailsDrawer
   Right-side Sheet with full ticket detail tabs.
   All skeleton / placeholder content. No backend.
   ============================================================ */

export function TicketDetailsDrawer({
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
        {/* Banner header */}
        <div className="relative h-32 sm:h-36 bg-[linear-gradient(120deg,var(--navy),var(--electric)_55%,var(--cyan-brand))] overflow-hidden">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay">
            <div className="absolute -top-8 -right-8 size-40 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-12 left-10 size-32 rounded-full bg-cyan-brand/30 blur-2xl" />
          </div>
          <SheetHeader className="absolute inset-x-0 top-0 p-4">
            <SheetTitle className="sr-only">Ticket Details</SheetTitle>
            <SheetDescription className="sr-only">
              Detailed administrator view of support ticket.
            </SheetDescription>
          </SheetHeader>
          <div className="absolute bottom-3 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/20">
            <Lock size={10} /> ADMIN VIEW
          </div>
        </div>

        {/* Ticket header */}
        <div className="px-5 -mt-10 relative">
          <div className="flex items-end gap-4">
            <div className="size-20 rounded-2xl glass-2 ring-4 ring-background shrink-0 flex items-center justify-center">
              <IconBadge name="Ticket" accent="electric" size="md" />
            </div>
            <div className="flex-1 space-y-2 pb-2">
              <div className="h-5 w-32 rounded shimmer" />
              <div className="h-3 w-48 rounded shimmer" />
            </div>
          </div>

          {/* Quick metrics */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Priority", icon: AlertTriangle, accent: "rose" as Accent },
              { label: "Status", icon: Activity, accent: "electric" as Accent },
              { label: "Replies", icon: MessageSquare, accent: "cyan" as Accent },
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

          {/* Action toolbar */}
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            <LootButton size="sm" variant="electric" leftIcon={<MessageSquareReply size={13} />}>
              Reply <Lock size={9} className="opacity-60 ml-1" />
            </LootButton>
            <LootButton size="sm" variant="outline" leftIcon={<CheckCircle2 size={13} />}>
              Close
            </LootButton>
            <LootButton size="sm" variant="outline" leftIcon={<RotateCcw size={13} />}>
              Reopen
            </LootButton>
            <AdminTicketActionMenu compact />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="conversation" className="mt-5">
            <TabsList className="bg-muted/60 w-full justify-start overflow-x-auto h-auto p-1">
              <TabsTrigger value="conversation" className="gap-1.5">
                <MessageSquare size={13} /> Conversation
              </TabsTrigger>
              <TabsTrigger value="userinfo" className="gap-1.5">
                <Users size={13} /> User Info
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-1.5">
                <FileText size={13} /> Notes
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="gap-1.5">
                <HelpCircle size={13} /> Knowledge
              </TabsTrigger>
            </TabsList>

            {/* ===== Conversation Tab ===== */}
            <TabsContent value="conversation" className="mt-4 space-y-4">
              <ConversationViewer />
            </TabsContent>

            {/* ===== User Info Tab ===== */}
            <TabsContent value="userinfo" className="mt-4 space-y-4">
              <UserInfoPanel />
            </TabsContent>

            {/* ===== Notes Tab ===== */}
            <TabsContent value="notes" className="mt-4 space-y-4">
              <InternalNotesPanel />
            </TabsContent>

            {/* ===== Knowledge Tab ===== */}
            <TabsContent value="knowledge" className="mt-4 space-y-4">
              <KnowledgePanel />
            </TabsContent>
          </Tabs>
        </div>

        <div className="h-8" />
      </SheetContent>
    </Sheet>
  );
}

/* ===== User Info Panel (inside drawer) ===== */

function UserInfoPanel() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2.5">
          User Information
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {USER_INFO_FIELDS.map((item) => (
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
      </div>
    </div>
  );
}

/* ===== Internal Notes Panel (inside drawer) ===== */

function InternalNotesPanel() {
  const [note, setNote] = useState("");
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2.5">
          Administrator Internal Notes
        </p>
        <GlassCard level={2} className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText size={12} className="text-electric" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Internal Note
              </p>
            </div>
            <Lock size={10} className="text-muted-foreground/50" />
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an internal administrator note… (display only — not saved)"
            className="min-h-[80px] bg-transparent ring-1 ring-border/60 focus-visible:ring-electric/40 text-sm"
          />
          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Lock size={9} className="opacity-60" />
              Private — not visible to user
            </p>
            <LootButton size="sm" variant="ghost" leftIcon={<Lock size={11} />}>
              Save (Coming Soon)
            </LootButton>
          </div>
        </GlassCard>
      </div>

      {/* Note type placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {[
          { label: "Follow-up Notes", icon: Clock, accent: "gold" as Accent },
          { label: "Investigation Notes", icon: Search, accent: "electric" as Accent },
          { label: "Future Private Comments", icon: Lock, accent: "purple" as Accent, future: true },
          { label: "Future Attachments", icon: Paperclip, accent: "cyan" as Accent, future: true },
          { label: "Future History", icon: History, accent: "emerald" as Accent, future: true },
        ].map((n) => {
          const Icon = n.icon;
          return (
            <GlassCard key={n.label} level={2} className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <Icon size={14} className="text-muted-foreground" />
                <ChevronRight size={12} className="text-muted-foreground/60" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 w-14 rounded shimmer" />
                <p className="text-[10px] font-semibold text-muted-foreground truncate flex items-center gap-1">
                  {n.label}
                  {n.future && <Lock size={9} className="opacity-60" />}
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

/* ===== Knowledge Panel (inside drawer) ===== */

function KnowledgePanel() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2.5">
          Knowledge Base & Suggestions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {KNOWLEDGE_TILES.map((tile) => {
            const Icon = tile.icon;
            const accentBg: Record<Accent, string> = {
              electric: "bg-electric/10 text-electric ring-electric/20",
              cyan: "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
              purple: "bg-purple/10 text-purple-brand ring-purple-brand/20",
              gold: "bg-gold/15 text-gold ring-gold/25",
              emerald: "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
              rose: "bg-rose-brand/10 text-rose-brand ring-rose-brand/20",
              navy: "bg-navy/10 text-navy ring-navy/20",
            };
            return (
              <GlassCard key={tile.id} level={2} hover className="p-3.5 space-y-3 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className={cn("size-9 rounded-lg flex items-center justify-center ring-1", accentBg[tile.accent])}>
                    <Icon size={14} />
                  </div>
                  {tile.future && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 px-1.5 py-0.5 rounded bg-muted">
                      <Lock size={8} /> Soon
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">{tile.label}</p>
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full rounded shimmer" />
                    <div className="h-2.5 w-2/3 rounded shimmer" />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Empty / Error State Helpers
   ============================================================ */

export function NoTicketsEmpty({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon="Ticket"
      title="No support tickets"
      description="The platform has not received any tickets yet. New support requests will appear here automatically."
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

export function NoConversationsEmpty() {
  return (
    <EmptyState
      icon="MessageSquare"
      title="No conversation history"
      description="This ticket does not have any replies yet. Administrator replies will appear here once posted."
    />
  );
}

export function SupportModuleUnavailableError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon="ServerCrash"
      title="Support module temporarily unavailable"
      description="We could not reach the support management service. Please retry or check service status in Mission Control."
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
   Section: Support Overview Stats
   ============================================================ */

function OverviewStatsSection() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      <Grid cols={4}>
        {OVERVIEW_STATS.map((s, i) => (
          <div key={s.label} variants={cardReveal} custom={i}>
            <StatCard
              index={i}
              label={s.future ? `${s.label}` : s.label}
              value={s.value}
              prefix={s.prefix}
              suffix={s.suffix}
              icon={s.icon}
              accent={s.accent}
              trend={s.trend}
            />
          </div>
        ))}
      </Grid>
    </motion.div>
  );
}

/* ============================================================
   Section: Global Ticket Search
   ============================================================ */

function GlobalTicketSearchSection() {
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState("ticketid");

  return (
    <WidgetCard
      title="Global Ticket Search"
      description="Cross-platform ticket lookup by any identifier"
      icon={<Search size={18} className="text-electric" />}
      action={<StatusBadge variant="info" dot pulse>Live</StatusBadge>}
    >
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets by ID, user, email, category, subject, priority, status, device, session…"
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
            <Sparkles size={11} className="text-electric" />
            Indexed across all ticket fields
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
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>("Newest Tickets");
  const [active, setActive] = useState<Record<string, string[]>>({
    status: ["open"],
    priority: [],
    category: [],
    updated: [],
    verification: [],
  });

  const toggle = (group: string, id: string) =>
    setActive((s) => ({
      ...s,
      [group]: s[group]?.includes(id)
        ? s[group].filter((x) => x !== id)
        : [...(s[group] ?? []), id],
    }));

  const resetAll = () =>
    setActive({ status: [], priority: [], category: [], updated: [], verification: [] });

  const renderChipGroup = (group: string, label: string, chips: ChipDef[], accent: Accent = "electric") => (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{label}</p>
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
      description="Granular refinement across status, priority, category & metadata dimensions"
      icon={<Filter size={18} className="text-electric" />}
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
        {/* Date range + Last updated */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard level={1} className="p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-electric" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Created Date Range
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
              <Headphones size={12} className="text-purple-brand" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Assigned Staff <Lock size={9} className="opacity-60 ml-0.5" />
              </p>
            </div>
            <div className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Select staff member…</span>
              <ChevronDown size={12} className="text-muted-foreground" />
            </div>
          </GlassCard>
        </div>

        {/* Chip groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderChipGroup("status", "Status", STATUS_CHIPS, "emerald")}
          {renderChipGroup("priority", "Priority", PRIORITY_CHIPS, "rose")}
          {renderChipGroup("category", "Category", CATEGORY_CHIPS, "purple")}
          {renderChipGroup("updated", "Last Updated", LAST_UPDATED_CHIPS, "electric")}
          {renderChipGroup("verification", "User Verification", VERIFICATION_CHIPS, "cyan")}
        </div>

        {/* Country / Language / AI placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          <GlassCard level={1} className="p-3.5 space-y-2">
            <div className="flex items-center gap-1.5">
              <Bot size={12} className="text-gold" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Future AI Classification <Lock size={9} className="opacity-60 ml-0.5" />
              </p>
            </div>
            <div className="h-9 w-full px-2.5 rounded-lg glass-2 ring-1 ring-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">AI-suggested category…</span>
              <ChevronDown size={12} className="text-muted-foreground" />
            </div>
          </GlassCard>
        </div>

        {/* Active filter chips preview */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mr-1">
            Active Filters:
          </span>
          {Object.entries(active).flatMap(([group, ids]) =>
            ids.map((id) => {
              const chip = [...STATUS_CHIPS, ...PRIORITY_CHIPS, ...CATEGORY_CHIPS, ...LAST_UPDATED_CHIPS, ...VERIFICATION_CHIPS].find(
                (c) => c.id === id
              );
              if (!chip) return null;
              return (
                <span
                  key={`${group}-${id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-electric/10 text-electric ring-1 ring-electric/20 px-2.5 py-0.5 text-[10px] font-semibold"
                >
                  {chip.label}
                  <button
                    onClick={() => toggle(group, id)}
                    className="hover:bg-electric/20 rounded-full size-3.5 inline-flex items-center justify-center"
                  >
                    <X size={9} />
                  </button>
                </span>
              );
            })
          )}
          {Object.values(active).every((arr) => arr.length === 0) && (
            <span className="text-[10px] text-muted-foreground/70 italic">No active filters</span>
          )}
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
   Section: Support Table
   ============================================================ */

function SupportTableSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const allSelected = selected.length === 10;

  const toggleAll = () => setSelected(allSelected ? [] : Array.from({ length: 10 }, (_, i) => i));
  const toggleOne = (i: number) =>
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  return (
    <WidgetCard
      title="Support Ticket Directory"
      description="All platform tickets — live executive table"
      icon={<TicketIcon size={18} className="text-electric" />}
      action={
        <div className="flex items-center gap-2">
          <StatusBadge variant="info" dot pulse>{selected.length} selected</StatusBadge>
          <LootButton size="sm" variant="glass" leftIcon={<RefreshCw size={13} />}>
            Refresh
          </LootButton>
        </div>
      }
    >
      {/* Bulk action bar */}
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
                <span className="text-xs font-semibold text-foreground">tickets selected</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold ring-1 ring-border bg-transparent hover:bg-accent/60 text-foreground transition-all">
                  <Download size={12} /> Export Selected <Lock size={9} className="opacity-60" />
                </button>
                <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold ring-1 ring-border bg-transparent hover:bg-accent/60 text-foreground transition-all">
                  <Users size={12} /> Bulk Assign <Lock size={9} className="opacity-60" />
                </button>
                <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold ring-1 ring-gold/30 bg-gold/5 hover:bg-gold/10 text-gold transition-all">
                  <CheckCircle2 size={12} /> Bulk Close <Lock size={9} className="opacity-60" />
                </button>
                <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold ring-1 ring-rose-brand/30 bg-rose-brand/5 hover:bg-rose-brand/10 text-rose-brand transition-all">
                  <X size={12} /> Bulk Delete <Lock size={9} className="opacity-60" />
                </button>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setSelected([])}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
                >
                  <X size={12} /> Clear
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Desktop table ===== */}
      <div className="hidden lg:block rounded-xl overflow-hidden ring-1 ring-border/60">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-4 py-2.5 text-left">
                <div className="flex items-center gap-2">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Ticket ID
                  </span>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                User
              </th>
              <th className="hidden xl:table-cell px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Subject
              </th>
              <th className="hidden lg:table-cell px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Category
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Priority
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="hidden xl:table-cell px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Created
              </th>
              <th className="hidden xl:table-cell px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Updated
              </th>
              <th className="hidden 2xl:table-cell px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Assigned
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Details
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TicketTableRow
                key={i}
                selected={selected.includes(i)}
                onSelect={() => toggleOne(i)}
                onView={() => setDrawerOpen(true)}
              />
            ))}
          </tbody>
        </table>
        {/* Footer */}
        <div className="bg-muted/30 flex items-center justify-between px-4 py-2.5 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            Showing <span className="font-semibold text-foreground">1–10</span> of{" "}
            <span className="font-semibold text-foreground">—</span> tickets
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
          <TicketCardMobile key={i} onView={() => setDrawerOpen(true)} />
        ))}
      </div>

      <TicketDetailsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </WidgetCard>
  );
}

/* ============================================================
   Section: Support Analytics
   ============================================================ */

function AnalyticsChartCard({
  title,
  description,
  icon,
  type,
  data,
  index,
  accent,
  future,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "line" | "bar" | "area" | "pie";
  data: { label?: string; value?: number; name?: string; color?: string }[];
  index: number;
  accent: Accent;
  future?: boolean;
}) {
  const color = CHART_COLORS[accent];
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="h-full"
    >
      <GlassCard level={2} hover sheen className="p-4 h-full flex flex-col gap-3 ring-1 ring-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0">{icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{description}</p>
            </div>
          </div>
          {future && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 px-1.5 py-0.5 rounded bg-muted shrink-0">
              <Lock size={8} /> Soon
            </span>
          )}
        </div>
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
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5, fill: color }} />
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
            ) : type === "pie" ? (
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color ?? color} />
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
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#grad-${title})`} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5, fill: color }} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function SupportAnalyticsSection() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30D");

  return (
    <WidgetCard
      title="Support Analytics"
      description="Aggregate ticket trends, resolution rate & performance"
      icon={<BarChart3 size={18} className="text-electric" />}
      action={<AnalyticsTabs value={period} onChange={setPeriod} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnalyticsChartCard
          title="Ticket Categories"
          description="Distribution by category"
          icon={<Tag size={16} className="text-electric" />}
          type="bar"
          data={CATEGORY_BAR_DATA}
          index={0}
          accent="electric"
        />
        <AnalyticsChartCard
          title="Resolution Trend"
          description="Closed tickets over time"
          icon={<CheckCircle2 size={16} className="text-emerald-brand" />}
          type="line"
          data={RESOLUTION_TREND}
          index={1}
          accent="emerald"
        />
        <AnalyticsChartCard
          title="Priority Distribution"
          description="Tickets by urgency tier"
          icon={<AlertTriangle size={16} className="text-rose-brand" />}
          type="pie"
          data={PRIORITY_PIE_DATA}
          index={2}
          accent="rose"
        />
        <AnalyticsChartCard
          title="Response Time"
          description="Avg first-reply by status"
          icon={<Clock size={16} className="text-purple-brand" />}
          type="bar"
          data={RESPONSE_TIME_DATA}
          index={3}
          accent="purple"
        />
        <AnalyticsChartCard
          title="Open vs Closed"
          description="Weekly resolution volume"
          icon={<Activity size={16} className="text-cyan-brand" />}
          type="area"
          data={OPEN_CLOSED_DATA}
          index={4}
          accent="cyan"
        />
        <AnalyticsChartCard
          title="Future AI Performance"
          description="AI-resolved tickets (placeholder)"
          icon={<Bot size={16} className="text-gold" />}
          type="line"
          data={RESOLUTION_TREND}
          index={5}
          accent="gold"
          future
        />
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section: Audit Timeline
   ============================================================ */

function AuditTimelineSection() {
  return (
    <WidgetCard
      title="Audit Timeline"
      description="Lifecycle events of the selected ticket"
      icon={<History size={18} className="text-electric" />}
      action={<StatusBadge variant="success" dot pulse>Audit Trail Active</StatusBadge>}
    >
      <div className="relative pl-4">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-electric/40 via-border to-transparent" />
        <div className="space-y-2.5">
          {AUDIT_TIMELINE.map((e, i) => {
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
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <span
                  className={cn(
                    "absolute -left-4 top-3 size-3.5 rounded-full ring-2 ring-background flex items-center justify-center",
                    accentBg[e.accent]
                  )}
                >
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
    </WidgetCard>
  );
}

/* ============================================================
   Section: Broadcast Placeholder
   ============================================================ */

function BroadcastPlaceholderSection() {
  return (
    <WidgetCard
      title="Broadcast Center"
      description="Send messages to users across channels"
      icon={<Megaphone size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Coming Soon
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {BROADCAST_TILES.map((t, i) => {
          const Icon = t.icon;
          const accentBg: Record<Accent, string> = {
            electric: "bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand))]",
            cyan: "bg-[linear-gradient(135deg,var(--cyan-brand),var(--electric))]",
            purple: "bg-[linear-gradient(135deg,var(--purple-brand),var(--electric))]",
            gold: "bg-[linear-gradient(135deg,var(--gold),var(--purple-brand))]",
            emerald: "bg-[linear-gradient(135deg,var(--emerald-brand),var(--cyan-brand))]",
            rose: "bg-[linear-gradient(135deg,var(--rose-brand),var(--gold))]",
            navy: "bg-[linear-gradient(135deg,var(--navy),var(--electric))]",
          };
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
                  <div className={cn("size-10 rounded-xl flex items-center justify-center text-white shadow-sm", accentBg[t.accent])}>
                    <Icon size={16} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                    <Lock size={8} /> Soon
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{t.description}</p>
                </div>
                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-bold">
                    Placeholder
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
   Section: Report Center
   ============================================================ */

function ReportCenterSection() {
  return (
    <WidgetCard
      title="Report Center"
      description="Generate executive support reports"
      icon={<FileText size={18} className="text-electric" />}
      action={<StatusBadge variant="default" dot>Placeholder</StatusBadge>}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {REPORT_TILES.map((t, i) => {
          const Icon = t.icon;
          const accentBg: Record<Accent, string> = {
            electric: "bg-electric/10 text-electric ring-electric/20",
            cyan: "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
            purple: "bg-purple/10 text-purple-brand ring-purple-brand/20",
            gold: "bg-gold/15 text-gold ring-gold/25",
            emerald: "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
            rose: "bg-rose-brand/10 text-rose-brand ring-rose-brand/20",
            navy: "bg-navy/10 text-navy ring-navy/20",
          };
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
              <GlassCard level={2} hover className="p-4 space-y-3 cursor-pointer h-full">
                <div className="flex items-start justify-between">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center ring-1", accentBg[t.accent])}>
                    <Icon size={16} />
                  </div>
                  {t.future && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                      <Lock size={8} /> Soon
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{t.description}</p>
                </div>
                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-bold">
                    {t.future ? "Pending" : "Ready"}
                  </span>
                  <Download size={12} className={cn(t.future ? "text-muted-foreground/40" : "text-electric")} />
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
      description="Download or schedule ticket data exports"
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
          const accentBg: Record<Accent, string> = {
            electric: "bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand))]",
            cyan: "bg-[linear-gradient(135deg,var(--cyan-brand),var(--electric))]",
            purple: "bg-[linear-gradient(135deg,var(--purple-brand),var(--electric))]",
            gold: "bg-[linear-gradient(135deg,var(--gold),var(--purple-brand))]",
            emerald: "bg-[linear-gradient(135deg,var(--emerald-brand),var(--cyan-brand))]",
            rose: "bg-[linear-gradient(135deg,var(--rose-brand),var(--gold))]",
            navy: "bg-[linear-gradient(135deg,var(--navy),var(--electric))]",
          };
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
                  <div className={cn("size-10 rounded-xl flex items-center justify-center text-white shadow-sm", accentBg[t.accent])}>
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
                  <p className="text-[11px] text-muted-foreground leading-snug">{t.description}</p>
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
   Main View: CeoSupportView
   ============================================================ */

export function CeoSupportView() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <PageContainer>
      <PageHeader
        title="Support Management"
        description="Monitor & manage support tickets"
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
              leftIcon={<ArrowRight size={14} className="rotate-180" />}
              onClick={() => navigate("ceo-dashboard")}
            >
              Mission Control
            </LootButton>
            <LootButton
              variant="outline"
              size="sm"
              leftIcon={<Megaphone size={14} />}
              onClick={() => navigate("ceo-communication")}
            >
              Communication
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
        {/* 1. Support Overview */}
        <OverviewStatsSection />

        {/* 2. Global Ticket Search */}
        <GlobalTicketSearchSection />

        {/* 3. Advanced Filters */}
        <AdvancedFiltersSection />

        {/* 4. Support Table (with ticket details drawer + admin action menu) */}
        <SupportTableSection />

        {/* 5. Support Analytics */}
        <SupportAnalyticsSection />

        {/* 6. Audit Timeline */}
        <AuditTimelineSection />

        {/* 7. Broadcast Placeholder */}
        <BroadcastPlaceholderSection />

        {/* 8. Report Center */}
        <ReportCenterSection />

        {/* 9. Export Center */}
        <ExportCenterSection />

        {/* Footer note */}
        <GlassCard level={1} className="p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <IconBadge name="ShieldCheck" accent="emerald" size="sm" />
            <div>
              <p className="text-xs font-semibold text-foreground">CEO Secure Session</p>
              <p className="text-[11px] text-muted-foreground">
                All support management actions are audited and recorded.
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
