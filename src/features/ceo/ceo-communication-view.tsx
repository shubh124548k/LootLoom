"use client";

/* ============================================================
   LootLoom — CEO Notification, Broadcast & Communication Center
   View renders INSIDE the CeoLayout. No sidebar/header/background.
   Skeleton-first: no backend, no notification delivery, no mutations.
   Inherits premium WHITE executive design language (navy + electric).
   ============================================================ */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowRight,
  BarChart3,
  Bell,
  BellRing,
  Bold,
  Bot,
  Calendar,
  CalendarClock,
  CalendarRange,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  CloudUpload,
  Copy,
  Crown,
  Download,
  Eye,
  FileBarChart,
  FileText,
  Filter,
  Gift,
  Globe,
  History,
  Hourglass,
  Image as ImageIcon,
  Inbox,
  Italic,
  Languages,
  Lightbulb,
  Link2,
  ListChecks,
  Lock,
  Mail,
  Megaphone,
  MessageSquare,
  Monitor,
  MoreVertical,
  MousePointerClick,
  Paperclip,
  Pause,
  Pencil,
  PenTool,
  PieChart,
  PlayCircle,
  Plus,
  RefreshCw,
  Repeat,
  Rocket,
  Save,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Smile,
  Smartphone,
  Sparkles,
  Star,
  Strikethrough,
  Tablet,
  Tag,
  TrendingUp,
  Type,
  Users,
  Volume2,
  Wand2,
  Workflow,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/* ============================================================
   Types & static data
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

const accentColor: Record<Accent, string> = {
  electric: "oklch(0.62 0.22 255)",
  cyan: "oklch(0.72 0.15 200)",
  purple: "oklch(0.6 0.22 295)",
  gold: "oklch(0.8 0.16 85)",
  emerald: "oklch(0.7 0.17 160)",
  rose: "oklch(0.68 0.2 15)",
  navy: "oklch(0.3 0.1 260)",
};

const OVERVIEW_STATS: {
  label: string;
  value: number;
  icon: string;
  accent: Accent;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  future?: boolean;
  trend?: { value: number; positive: boolean };
}[] = [
  { label: "Total Broadcasts", value: 0, icon: "Megaphone", accent: "electric" },
  { label: "Scheduled Broadcasts", value: 0, icon: "CalendarClock", accent: "cyan" },
  { label: "Draft Messages", value: 0, icon: "FileText", accent: "gold" },
  { label: "Completed Campaigns", value: 0, icon: "CheckCircle2", accent: "emerald" },
  { label: "Platform Announcements", value: 0, icon: "BellRing", accent: "purple" },
  { label: "Unread Notifications", value: 0, icon: "Bell", accent: "rose" },
  { label: "Future Push Campaigns", value: 0, icon: "Smartphone", accent: "electric", future: true },
  { label: "Future Email Campaigns", value: 0, icon: "Mail", accent: "cyan", future: true },
  { label: "Future SMS Campaigns", value: 0, icon: "MessageSquare", accent: "purple", future: true },
  { label: "Future Delivery Rate", value: 0, icon: "Send", accent: "emerald", suffix: "%", decimals: 1, future: true, trend: { value: 0, positive: true } },
  { label: "Future Open Rate", value: 0, icon: "Eye", accent: "gold", suffix: "%", decimals: 1, future: true, trend: { value: 0, positive: true } },
  { label: "Future Click Rate", value: 0, icon: "MousePointerClick", accent: "navy", suffix: "%", decimals: 1, future: true, trend: { value: 0, positive: true } },
];

const QUICK_ACTIONS: {
  id: string;
  label: string;
  desc: string;
  icon: typeof Megaphone;
  accent: Accent;
  future?: boolean;
}[] = [
  { id: "announcement", label: "Create Announcement", desc: "Broadcast platform-wide news", icon: Megaphone, accent: "electric" },
  { id: "notification", label: "Create Notification", desc: "Send a user notification", icon: Bell, accent: "cyan" },
  { id: "broadcast", label: "Broadcast Message", desc: "Multi-channel broadcast", icon: Send, accent: "purple" },
  { id: "system-alert", label: "System Alert", desc: "Critical platform alert", icon: ShieldAlert, accent: "rose" },
  { id: "maintenance", label: "Maintenance Notice", desc: "Schedule downtime notice", icon: Settings, accent: "gold" },
  { id: "reward", label: "Reward Campaign", desc: "Promote reward events", icon: Gift, accent: "emerald" },
  { id: "festival", label: "Festival Campaign", desc: "Seasonal themed message", icon: Sparkles, accent: "purple" },
  { id: "emergency", label: "Emergency Alert", desc: "Urgent platform-wide alert", icon: AlertTriangle, accent: "rose" },
  { id: "email", label: "Future Email Campaign", desc: "Email channel — pending", icon: Mail, accent: "cyan", future: true },
  { id: "push", label: "Future Push Campaign", desc: "Push channel — pending", icon: Smartphone, accent: "electric", future: true },
  { id: "sms", label: "Future SMS Campaign", desc: "SMS channel — pending", icon: MessageSquare, accent: "purple", future: true },
  { id: "ai-generator", label: "Future AI Generator", desc: "AI message composer — pending", icon: Wand2, accent: "gold", future: true },
];

const CATEGORY_OPTIONS = [
  { id: "announcement", label: "Announcement" },
  { id: "reward", label: "Reward Update" },
  { id: "redeem", label: "Redeem Notice" },
  { id: "wallet", label: "Wallet Update" },
  { id: "security", label: "Security Alert" },
  { id: "maintenance", label: "Maintenance" },
  { id: "system", label: "System Update" },
  { id: "festival", label: "Festival Greeting" },
] as const;

const PRIORITY_OPTIONS = [
  { id: "low", label: "Low Priority", accent: "emerald" as Accent },
  { id: "normal", label: "Normal Priority", accent: "electric" as Accent },
  { id: "high", label: "High Priority", accent: "gold" as Accent },
  { id: "critical", label: "Critical Priority", accent: "rose" as Accent },
] as const;

const AUDIENCE_OPTIONS: {
  id: string;
  label: string;
  desc: string;
  icon: typeof Users;
  accent: Accent;
  future?: boolean;
}[] = [
  { id: "all", label: "All Users", desc: "Every registered user", icon: Users, accent: "electric" },
  { id: "selected", label: "Selected Users", desc: "Manually picked list", icon: Check, accent: "cyan" },
  { id: "verified", label: "Verified Users", desc: "Email/phone verified", icon: ShieldCheck, accent: "emerald" },
  { id: "unverified", label: "Unverified Users", desc: "Pending verification", icon: ShieldAlert, accent: "gold" },
  { id: "new", label: "New Users", desc: "Joined within 7 days", icon: Plus, accent: "purple" },
  { id: "active", label: "Active Users", desc: "Active in last 24h", icon: Activity, accent: "electric" },
  { id: "inactive", label: "Inactive Users", desc: "Inactive 30+ days", icon: Clock, accent: "rose" },
  { id: "vip", label: "VIP Users", desc: "VIP tier placeholder", icon: Crown, accent: "gold", future: true },
  { id: "country", label: "By Country", desc: "Geo-targeted", icon: Globe, accent: "cyan", future: true },
  { id: "language", label: "By Language", desc: "Language-targeted", icon: Languages, accent: "purple", future: true },
  { id: "segments", label: "Dynamic Segments", desc: "AI-built segments", icon: Sparkles, accent: "navy", future: true },
];

const TEMPLATES: {
  id: string;
  label: string;
  desc: string;
  icon: typeof FileText;
  accent: Accent;
  future?: boolean;
}[] = [
  { id: "maintenance", label: "Maintenance Notice", desc: "Downtime window template", icon: Settings, accent: "gold" },
  { id: "reward-update", label: "Reward Update", desc: "New reward announcement", icon: Gift, accent: "emerald" },
  { id: "redeem-approved", label: "Redeem Approved", desc: "Approval confirmation", icon: CheckCircle2, accent: "emerald" },
  { id: "redeem-rejected", label: "Redeem Rejected", desc: "Rejection notice", icon: AlertTriangle, accent: "rose" },
  { id: "wallet-update", label: "Wallet Update", desc: "Balance change notice", icon: Activity, accent: "cyan" },
  { id: "security-alert", label: "Security Alert", desc: "Security incident notice", icon: ShieldAlert, accent: "rose" },
  { id: "welcome", label: "Welcome Message", desc: "Onboarding greeting", icon: Sparkles, accent: "electric" },
  { id: "festival", label: "Festival Greeting", desc: "Holiday greeting template", icon: Star, accent: "purple" },
  { id: "platform-update", label: "Platform Update", desc: "New feature announcement", icon: Rocket, accent: "electric" },
  { id: "marketing", label: "Future Marketing", desc: "Marketing campaign template", icon: Megaphone, accent: "gold", future: true },
  { id: "reminder", label: "Future Reminder", desc: "Action reminder template", icon: Bell, accent: "cyan", future: true },
  { id: "ai-template", label: "Future AI Template", desc: "AI-generated template", icon: Wand2, accent: "purple", future: true },
];

const CAMPAIGN_TABS: {
  id: string;
  label: string;
  count: number;
  future?: boolean;
}[] = [
  { id: "draft", label: "Draft", count: 0 },
  { id: "scheduled", label: "Scheduled", count: 0 },
  { id: "sending", label: "Sending", count: 0, future: true },
  { id: "completed", label: "Completed", count: 0 },
  { id: "cancelled", label: "Cancelled", count: 0 },
  { id: "expired", label: "Expired", count: 0 },
  { id: "paused", label: "Paused", count: 0, future: true },
  { id: "archived", label: "Archived", count: 0, future: true },
  { id: "recurring", label: "Recurring", count: 0, future: true },
];

const ANNOUNCEMENTS: {
  id: string;
  title: string;
  desc: string;
  icon: typeof Megaphone;
  accent: Accent;
  gradient: string;
  status: "success" | "warning" | "info" | "default";
  statusLabel: string;
  future?: boolean;
}[] = [
  { id: "platform-news", title: "Platform News", desc: "General platform news banner", icon: Megaphone, accent: "electric", gradient: "from-electric/80 via-cyan-brand/60 to-purple-brand/40", status: "info", statusLabel: "Published" },
  { id: "feature-release", title: "Feature Release", desc: "New feature release announcement", icon: Rocket, accent: "purple", gradient: "from-purple-brand/80 via-electric/50 to-cyan-brand/30", status: "success", statusLabel: "Live" },
  { id: "version-update", title: "Version Update", desc: "App version update banner", icon: Tag, accent: "cyan", gradient: "from-cyan-brand/80 via-electric/50 to-purple-brand/30", status: "info", statusLabel: "Rolling Out" },
  { id: "maintenance", title: "Maintenance Notice", desc: "Scheduled maintenance window", icon: Settings, accent: "gold", gradient: "from-gold/80 via-gold/40 to-electric/20", status: "warning", statusLabel: "Scheduled" },
  { id: "security", title: "Security Notice", desc: "Security advisory notice", icon: ShieldAlert, accent: "rose", gradient: "from-rose-brand/80 via-rose-brand/40 to-purple-brand/20", status: "warning", statusLabel: "Active" },
  { id: "community", title: "Community Update", desc: "Community program update", icon: Users, accent: "emerald", gradient: "from-emerald-brand/80 via-emerald-brand/40 to-cyan-brand/20", status: "info", statusLabel: "Published" },
  { id: "reward-event", title: "Reward Event", desc: "Reward campaign event banner", icon: Gift, accent: "gold", gradient: "from-gold/80 via-emerald-brand/40 to-electric/20", status: "success", statusLabel: "Live" },
  { id: "holiday", title: "Holiday Event", desc: "Seasonal holiday event", icon: Star, accent: "purple", gradient: "from-purple-brand/80 via-rose-brand/40 to-gold/20", status: "default", statusLabel: "Draft" },
  { id: "emergency", title: "Emergency Banner", desc: "Critical emergency broadcast", icon: AlertTriangle, accent: "rose", gradient: "from-rose-brand/85 via-rose-brand/40 to-navy/30", status: "warning", statusLabel: "Active" },
  { id: "sticky", title: "Future Sticky Announcement", desc: "Persistent sticky banner — pending", icon: Bell, accent: "navy", gradient: "from-navy/80 via-electric/40 to-cyan-brand/20", status: "default", statusLabel: "Future", future: true },
];

const PREVIEW_CARDS: {
  id: string;
  label: string;
  desc: string;
  icon: typeof Bell;
  accent: Accent;
  future?: boolean;
}[] = [
  { id: "in-app", label: "In-App Notification", desc: "Native in-app toast style", icon: Bell, accent: "electric" },
  { id: "push", label: "Push Notification", desc: "OS push notification mockup", icon: Smartphone, accent: "cyan", future: true },
  { id: "email", label: "Email Preview", desc: "Email body mockup", icon: Mail, accent: "purple", future: true },
  { id: "sms", label: "SMS Preview", desc: "SMS message mockup", icon: MessageSquare, accent: "gold", future: true },
  { id: "desktop", label: "Desktop Notification", desc: "Desktop OS banner", icon: Monitor, accent: "emerald", future: true },
  { id: "mobile", label: "Mobile Preview", desc: "Phone-frame preview", icon: Smartphone, accent: "electric" },
  { id: "tablet", label: "Tablet Preview", desc: "Tablet-frame preview", icon: Tablet, accent: "rose", future: true },
];

const ANALYTICS_PERIODS = ["7D", "30D", "90D", "1Y"] as const;
type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

const ANALYTICS_TABS: {
  id: string;
  label: string;
  icon: typeof BarChart3;
  future?: boolean;
}[] = [
  { id: "timeline", label: "Broadcast Timeline", icon: Activity },
  { id: "category", label: "Category Distribution", icon: PieChart },
  { id: "audience", label: "Audience Distribution", icon: Users },
  { id: "delivery", label: "Delivery Trend", icon: Send, future: true },
  { id: "read", label: "Read Trend", icon: Eye, future: true },
  { id: "engagement", label: "Future Engagement", icon: TrendingUp, future: true },
  { id: "conversion", label: "Future Conversion", icon: MousePointerClick, future: true },
];

const APPROVAL_STEPS: {
  id: string;
  label: string;
  desc: string;
  icon: typeof FileText;
  accent: Accent;
  future?: boolean;
}[] = [
  { id: "draft", label: "Draft", desc: "Message authored & saved", icon: FileText, accent: "electric" },
  { id: "review", label: "Review", desc: "Submitted for review", icon: Eye, accent: "cyan" },
  { id: "approval", label: "Approval", desc: "Pending CEO approval", icon: ShieldCheck, accent: "gold", future: true },
  { id: "schedule", label: "Schedule", desc: "Time slot reserved", icon: CalendarClock, accent: "purple" },
  { id: "broadcast", label: "Broadcast", desc: "Live broadcast in progress", icon: Megaphone, accent: "emerald", future: true },
  { id: "delivered", label: "Delivered", desc: "All channels delivered", icon: CheckCheck, accent: "emerald" },
  { id: "archived", label: "Archived", desc: "Campaign archived", icon: Archive, accent: "navy", future: true },
];

const AI_TOOLS: {
  id: string;
  label: string;
  desc: string;
  icon: typeof Wand2;
  accent: Accent;
}[] = [
  { id: "generate", label: "Generate Announcement", desc: "Draft from a brief", icon: Wand2, accent: "electric" },
  { id: "rewrite", label: "Rewrite Message", desc: "Rephrase for clarity", icon: PenTool, accent: "cyan" },
  { id: "grammar", label: "Grammar Check", desc: "Proofread content", icon: Check, accent: "emerald" },
  { id: "translate", label: "Translation", desc: "Multi-language draft", icon: Languages, accent: "purple" },
  { id: "tone", label: "Tone Adjustment", desc: "Shift tone & voice", icon: Smile, accent: "gold" },
  { id: "smart", label: "Smart Suggestions", desc: "Contextual hints", icon: Lightbulb, accent: "rose" },
];

const REPORTS: {
  id: string;
  label: string;
  desc: string;
  icon: typeof FileBarChart;
  accent: Accent;
}[] = [
  { id: "daily", label: "Daily Communication", desc: "Daily broadcast summary", icon: FileBarChart, accent: "electric" },
  { id: "weekly", label: "Weekly Communication", desc: "Weekly delivery digest", icon: Calendar, accent: "cyan" },
  { id: "monthly", label: "Monthly Communication", desc: "Monthly executive report", icon: CalendarRange, accent: "purple" },
  { id: "audience", label: "Audience Report", desc: "Reach & segment insights", icon: Users, accent: "gold" },
  { id: "campaign", label: "Campaign Report", desc: "Campaign performance", icon: Megaphone, accent: "emerald" },
  { id: "notification", label: "Notification Report", desc: "Notification analytics", icon: Bell, accent: "rose" },
];

const EXPORT_TILES: {
  id: string;
  label: string;
  desc: string;
  icon?: typeof Download;
  future?: boolean;
}[] = [
  { id: "csv", label: "CSV Export", desc: "Comma-separated values", icon: Download },
  { id: "excel", label: "Excel Workbook", desc: "Microsoft .xlsx", icon: FileBarChart },
  { id: "pdf", label: "PDF Report", desc: "Formatted PDF document", icon: FileText },
  { id: "print", label: "Print Preview", desc: "Print-ready layout", icon: FileText },
  { id: "cloud", label: "Cloud Export", desc: "Direct to cloud storage", icon: CloudUpload, future: true },
  { id: "scheduled", label: "Scheduled Reports", desc: "Daily / weekly / monthly", icon: CalendarClock, future: true },
];

const HISTORY_COLUMNS = [
  { key: "campaignid", label: "Campaign ID", className: "w-[120px]" },
  { key: "title", label: "Title", className: "min-w-[180px]" },
  { key: "category", label: "Category", className: "w-[130px] hidden lg:table-cell" },
  { key: "audience", label: "Audience", className: "w-[140px] hidden xl:table-cell" },
  { key: "created", label: "Created", className: "w-[120px] hidden lg:table-cell" },
  { key: "scheduled", label: "Scheduled", className: "w-[120px] hidden xl:table-cell" },
  { key: "status", label: "Status", className: "w-[110px]" },
  { key: "priority", label: "Priority", className: "w-[110px] hidden lg:table-cell" },
  { key: "details", label: "Details", className: "w-[100px] text-right" },
  { key: "duplicate", label: "", className: "w-[44px]" },
  { key: "archive", label: "", className: "w-[44px]" },
] as const;

const TIMELINE_DATA = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 0 },
  { label: "Wed", value: 0 },
  { label: "Thu", value: 0 },
  { label: "Fri", value: 0 },
  { label: "Sat", value: 0 },
  { label: "Sun", value: 0 },
];

const CATEGORY_PIE = [
  { label: "Announcement", value: 0, accent: "electric" as Accent },
  { label: "Reward", value: 0, accent: "emerald" as Accent },
  { label: "Security", value: 0, accent: "rose" as Accent },
  { label: "Maintenance", value: 0, accent: "gold" as Accent },
  { label: "Festival", value: 0, accent: "purple" as Accent },
  { label: "System", value: 0, accent: "cyan" as Accent },
];

const AUDIENCE_PIE = [
  { label: "All Users", value: 0, accent: "electric" as Accent },
  { label: "Verified", value: 0, accent: "emerald" as Accent },
  { label: "Active", value: 0, accent: "cyan" as Accent },
  { label: "New Users", value: 0, accent: "purple" as Accent },
  { label: "VIP", value: 0, accent: "gold" as Accent },
  { label: "Segments", value: 0, accent: "navy" as Accent },
];

/* ============================================================
   Reusable Helper: FilterChip
   Pill toggle for filter categories and tab bars. UI-only.
   ============================================================ */

interface FilterChipProps {
  label: string;
  active?: boolean;
  future?: boolean;
  count?: number;
  onClick?: () => void;
  accent?: Accent;
}

export function FilterChip({ label, active, future, count, onClick, accent = "electric" }: FilterChipProps) {
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
      {typeof count === "number" && (
        <span className={cn(
          "ml-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[9px] font-bold",
          active ? "bg-foreground/15" : "bg-muted text-muted-foreground"
        )}>
          {count}
        </span>
      )}
      {active && !future && <CheckCircle2 size={12} />}
    </motion.button>
  );
}

/* ============================================================
   Reusable Helper: AnalyticsTabs
   Period selector for analytics widgets. UI-only.
   ============================================================ */

export function AnalyticsTabs({
  value,
  onChange,
}: {
  value: AnalyticsPeriod;
  onChange: (v: AnalyticsPeriod) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl glass-2 p-0.5 ring-1 ring-border">
      {ANALYTICS_PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "px-3 py-1 text-xs font-semibold rounded-lg transition-all",
            value === p
              ? "bg-electric/15 text-electric shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   Reusable Helper: MessageComposer
   Reusable message editor surface. UI-only — no send logic.
   ============================================================ */

interface MessageComposerProps {
  defaultTitle?: string;
  compact?: boolean;
}

export function MessageComposer({ defaultTitle = "", compact = false }: MessageComposerProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState<string>("announcement");
  const [priority, setPriority] = useState<string>("normal");
  const [audience, setAudience] = useState<string>("all");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [sound, setSound] = useState(false);

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      {/* Title + Subtitle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Title <span className="text-rose-brand">*</span>
          </label>
          <Input
            placeholder="Enter broadcast title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Subtitle
          </label>
          <Input
            placeholder="Optional subtitle / hook"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      {/* Category + Priority + Audience */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Priority
          </label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Audience
          </label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              {AUDIENCE_OPTIONS.map((a) => (
                <SelectItem key={a.id} value={a.id} disabled={a.future}>
                  {a.label}{a.future ? " (Future)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Message Body + Rich Text placeholder */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Message Body <span className="text-rose-brand">*</span>
          </label>
          <span className="text-[10px] text-muted-foreground">{body.length} / 2,000</span>
        </div>
        {/* Rich text toolbar placeholder */}
        <div className="flex items-center gap-0.5 rounded-t-xl glass-2 ring-1 ring-border px-2 py-1.5">
          <ToolbarBtn icon={Bold} label="Bold" future />
          <ToolbarBtn icon={Italic} label="Italic" future />
          <ToolbarBtn icon={Strikethrough} label="Strikethrough" future />
          <div className="w-px h-5 bg-border mx-1" />
          <ToolbarBtn icon={Type} label="Heading" future />
          <ToolbarBtn icon={ListChecks} label="List" future />
          <ToolbarBtn icon={ImageIcon} label="Image" future />
          <ToolbarBtn icon={Smile} label="Emoji" future />
          <ToolbarBtn icon={Paperclip} label="Attach" future />
          <ToolbarBtn icon={Link2} label="Link" future />
          <div className="flex-1" />
          <ToolbarBtn icon={Wand2} label="AI Generate" future />
        </div>
        <Textarea
          placeholder="Write your broadcast message here…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          className="rounded-t-none min-h-[140px] resize-none"
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GlassCard level={1} className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <IconBadge name="Bell" accent="electric" size="sm" />
            <div>
              <p className="text-xs font-semibold text-foreground">Pin to Top</p>
              <p className="text-[11px] text-muted-foreground">Display as a sticky banner.</p>
            </div>
          </div>
          <Switch checked={pinned} onCheckedChange={setPinned} />
        </GlassCard>
        <GlassCard level={1} className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <IconBadge name="Volume2" accent="gold" size="sm" />
            <div>
              <p className="text-xs font-semibold text-foreground">Notification Sound</p>
              <p className="text-[11px] text-muted-foreground">Play sound on delivery.</p>
            </div>
          </div>
          <Switch checked={sound} onCheckedChange={setSound} />
        </GlassCard>
      </div>

      {/* Future enhancements row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: "Attachments", icon: Paperclip },
          { label: "Banner Image", icon: ImageIcon },
          { label: "CTA Button", icon: MousePointerClick },
          { label: "Schedule", icon: CalendarClock },
          { label: "Expiration", icon: Hourglass },
          { label: "Preview", icon: Eye },
        ].map((f) => (
          <button
            key={f.label}
            className="flex flex-col items-center gap-1.5 rounded-xl ring-1 ring-border bg-transparent hover:bg-accent/40 p-3 transition-all"
          >
            <f.icon size={14} className="text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
              <Lock size={9} className="opacity-60" />
              {f.label}
            </span>
          </button>
        ))}
      </div>

      {/* Footer actions — display only */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40">
        <div className="flex items-center gap-2">
          <StatusBadge variant="default" dot>
            <Lock size={9} className="mr-0.5" /> Auto-saved draft
          </StatusBadge>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            No backend — display only
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LootButton size="sm" variant="outline" leftIcon={<Save size={13} />}>
            Save Draft
          </LootButton>
          <LootButton size="sm" variant="gold" leftIcon={<CalendarClock size={13} />}>
            Schedule
          </LootButton>
          <LootButton size="sm" variant="electric" leftIcon={<Send size={13} />}>
            Send Now
          </LootButton>
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({ icon: Icon, label, future }: { icon: typeof Bold; label: string; future?: boolean }) {
  return (
    <button
      type="button"
      title={future ? `${label} (future)` : label}
      className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all relative"
    >
      <Icon size={13} />
      {future && <Lock size={8} className="absolute -bottom-0.5 -right-0.5 text-muted-foreground/60 bg-background rounded-full" />}
    </button>
  );
}

/* ============================================================
   Reusable Helper: AudienceSelector
   Reusable audience chip/card picker. UI-only.
   ============================================================ */

export function AudienceSelector() {
  const [selected, setSelected] = useState<string[]>(["all"]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {AUDIENCE_OPTIONS.map((opt, i) => {
          const Icon = opt.icon;
          const active = selected.includes(opt.id);
          const accentActiveBg: Record<Accent, string> = {
            electric: "ring-electric/40 bg-electric/8",
            cyan: "ring-cyan-brand/40 bg-cyan/8",
            purple: "ring-purple-brand/40 bg-purple/8",
            gold: "ring-gold/40 bg-gold/8",
            emerald: "ring-emerald-brand/40 bg-emerald-brand/8",
            rose: "ring-rose-brand/40 bg-rose-brand/8",
            navy: "ring-navy/40 bg-navy/8",
          };
          const accentActiveText: Record<Accent, string> = {
            electric: "text-electric",
            cyan: "text-cyan-brand",
            purple: "text-purple-brand",
            gold: "text-gold",
            emerald: "text-emerald-brand",
            rose: "text-rose-brand",
            navy: "text-navy",
          };
          return (
            <motion.button
              key={opt.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !opt.future && toggle(opt.id)}
              disabled={opt.future}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl ring-1 text-left transition-all w-full",
                active
                  ? accentActiveBg[opt.accent]
                  : "ring-border bg-transparent hover:bg-accent/40",
                opt.future && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "size-9 rounded-lg flex items-center justify-center shrink-0",
                active
                  ? cn("bg-foreground/8", accentActiveText[opt.accent])
                  : "bg-muted text-muted-foreground"
              )}>
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1 truncate">
                  {opt.label}
                  {opt.future && <Lock size={9} className="text-muted-foreground/60 shrink-0" />}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{opt.desc}</p>
              </div>
              <div className={cn(
                "size-5 rounded-full flex items-center justify-center ring-1 shrink-0",
                active ? cn("ring-foreground/30", accentActiveText[opt.accent]) : "ring-border text-transparent"
              )}>
                <Check size={11} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Estimated reach placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Estimated Reach", value: 0, icon: Users, accent: "electric" as Accent },
          { label: "Eligible Devices", value: 0, icon: Smartphone, accent: "cyan" as Accent },
          { label: "Active Recipients", value: 0, icon: Activity, accent: "emerald" as Accent },
          { label: "Suppressed", value: 0, icon: ShieldAlert, accent: "rose" as Accent },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} level={1} className="p-3 flex items-center gap-2.5">
              <IconBadge name={s.icon.name} accent={s.accent} size="sm" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground truncate">{s.label}</p>
                <AnimatedCounter value={s.value} className="text-base font-bold text-foreground" />
              </div>
              <Icon size={12} className="ml-auto text-muted-foreground/60" />
            </GlassCard>
          );
        })}
      </div>

      <GlassCard level={1} className="p-3 flex items-center gap-2.5">
        <ShieldCheck size={14} className="text-electric shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          Reach figures are placeholders. Backend audience counting is pending.
        </p>
      </GlassCard>
    </div>
  );
}

/* ============================================================
   Reusable Helper: TemplateCard
   Reusable template library card with "Use Template" button.
   ============================================================ */

interface TemplateCardProps {
  template: (typeof TEMPLATES)[number];
  index?: number;
}

export function TemplateCard({ template, index = 0 }: TemplateCardProps) {
  const Icon = template.icon;
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
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      {...hoverLift}
      className="h-full"
    >
      <GlassCard level={2} hover sheen className="p-4 h-full flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 size-20 rounded-full bg-electric/6 blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between">
          <div className={cn("size-10 rounded-xl ring-1 flex items-center justify-center", accentBg[template.accent])}>
            <Icon size={16} />
          </div>
          {template.future && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
              <Lock size={8} /> Soon
            </span>
          )}
        </div>
        <div className="space-y-1 flex-1">
          <p className="text-sm font-semibold text-foreground">{template.label}</p>
          <p className="text-[11px] text-muted-foreground leading-snug">{template.desc}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full w-1/2 shimmer rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
            {template.future ? "Pending" : "Ready"}
          </span>
          <LootButton
            size="sm"
            variant={template.future ? "ghost" : "outline"}
            leftIcon={template.future ? <Lock size={11} /> : <ArrowRight size={11} />}
            disabled={template.future}
          >
            {template.future ? "Locked" : "Use Template"}
          </LootButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Reusable Helper: CampaignCard
   Skeleton campaign card with status badge.
   ============================================================ */

interface CampaignCardProps {
  index?: number;
  status: "draft" | "scheduled" | "sending" | "completed" | "cancelled" | "expired" | "paused" | "archived" | "recurring";
}

export function CampaignCard({ index = 0, status }: CampaignCardProps) {
  const statusVariant: Record<CampaignCardProps["status"], "default" | "info" | "success" | "warning" | "error" | "gold" | "electric" | "purple" | "cyan"> = {
    draft: "default",
    scheduled: "info",
    sending: "electric",
    completed: "success",
    cancelled: "error",
    expired: "default",
    paused: "warning",
    archived: "purple",
    recurring: "cyan",
  };
  const statusIcon: Record<CampaignCardProps["status"], typeof FileText> = {
    draft: FileText,
    scheduled: CalendarClock,
    sending: PlayCircle,
    completed: CheckCircle2,
    cancelled: X,
    expired: Hourglass,
    paused: Pause,
    archived: Archive,
    recurring: Repeat,
  };
  const StatusIcon = statusIcon[status];
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className="h-full"
    >
      <GlassCard level={2} hover sheen className="p-4 h-full flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl shimmer" />
            <div className="space-y-1.5">
              <div className="h-3 w-32 rounded shimmer" />
              <div className="h-2.5 w-20 rounded shimmer" />
            </div>
          </div>
          <StatusBadge variant={statusVariant[status]} dot>
            <StatusIcon size={11} className="mr-0.5" />
            <span className="capitalize">{status}</span>
          </StatusBadge>
        </div>

        <div className="space-y-1.5">
          <div className="h-3 w-3/4 rounded shimmer" />
          <div className="h-2.5 w-full rounded shimmer" />
          <div className="h-2.5 w-5/6 rounded shimmer" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/60 ring-1 ring-border rounded-full px-2 py-0.5">
            <Tag size={9} /> Category
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/60 ring-1 ring-border rounded-full px-2 py-0.5">
            <Users size={9} /> Audience
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/60 ring-1 ring-border rounded-full px-2 py-0.5">
            <Clock size={9} /> Date
          </span>
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-electric/60 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
              Skeleton
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all" title="View">
              <Eye size={13} />
            </button>
            <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all" title="Duplicate">
              <Copy size={13} />
            </button>
            <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all" title="More">
              <MoreVertical size={13} />
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Reusable Helper: AnnouncementCard
   Premium announcement card with gradient banner.
   ============================================================ */

interface AnnouncementCardProps {
  announcement: (typeof ANNOUNCEMENTS)[number];
  index?: number;
}

export function AnnouncementCard({ announcement, index = 0 }: AnnouncementCardProps) {
  const Icon = announcement.icon;
  const accentText: Record<Accent, string> = {
    electric: "text-electric",
    cyan: "text-cyan-brand",
    purple: "text-purple-brand",
    gold: "text-gold",
    emerald: "text-emerald-brand",
    rose: "text-rose-brand",
    navy: "text-navy",
  };
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      {...hoverLift}
      className="h-full"
    >
      <GlassCard level={2} hover sheen className="h-full flex flex-col overflow-hidden">
        {/* Gradient banner */}
        <div className={cn(
          "relative h-20 bg-gradient-to-br p-4 flex items-start justify-between",
          announcement.gradient
        )}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)] pointer-events-none" />
          <div className="relative size-10 rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30 flex items-center justify-center text-white shrink-0">
            <Icon size={18} />
          </div>
          <div className="relative flex items-center gap-1.5">
            {announcement.future && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white/90 bg-white/15 ring-1 ring-white/30 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                <Lock size={8} /> Future
              </span>
            )}
            <StatusBadge variant={announcement.status} dot>
              {announcement.statusLabel}
            </StatusBadge>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Icon size={12} className={accentText[announcement.accent]} />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Announcement
            </p>
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug">{announcement.title}</p>
          <p className="text-[11px] text-muted-foreground leading-snug">{announcement.desc}</p>

          {/* Skeleton body lines */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 w-full rounded shimmer" />
            <div className="h-2.5 w-4/5 rounded shimmer" />
            <div className="h-2.5 w-2/3 rounded shimmer" />
          </div>

          <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/40">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
              Body pending
            </span>
            <div className="flex items-center gap-1">
              <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all" title="Edit">
                <Pencil size={12} />
              </button>
              <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all" title="View">
                <Eye size={12} />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Reusable Helper: NotificationPreviewCard
   UI-only mockup of how a notification would look per channel.
   ============================================================ */

interface NotificationPreviewCardProps {
  preview: (typeof PREVIEW_CARDS)[number];
  index?: number;
}

export function NotificationPreviewCard({ preview, index = 0 }: NotificationPreviewCardProps) {
  const Icon = preview.icon;
  const accentText: Record<Accent, string> = {
    electric: "text-electric",
    cyan: "text-cyan-brand",
    purple: "text-purple-brand",
    gold: "text-gold",
    emerald: "text-emerald-brand",
    rose: "text-rose-brand",
    navy: "text-navy",
  };

  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className="h-full"
    >
      <GlassCard level={2} hover sheen className="p-4 h-full flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("size-9 rounded-xl ring-1 ring-border bg-muted/40 flex items-center justify-center", accentText[preview.accent])}>
              <Icon size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                {preview.label}
                {preview.future && <Lock size={9} className="text-muted-foreground/60" />}
              </p>
              <p className="text-[11px] text-muted-foreground">{preview.desc}</p>
            </div>
          </div>
          {preview.future && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
              <Lock size={8} /> Soon
            </span>
          )}
        </div>

        {/* Mockup device frame */}
        <PreviewMockup id={preview.id} accent={preview.accent} />

        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
            UI preview only
          </span>
          <LootButton size="sm" variant="ghost" leftIcon={<Eye size={11} />}>
            Full preview
          </LootButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function PreviewMockup({ id, accent }: { id: string; accent: Accent }) {
  const dotColor: Record<Accent, string> = {
    electric: "bg-electric",
    cyan: "bg-cyan-brand",
    purple: "bg-purple-brand",
    gold: "bg-gold",
    emerald: "bg-emerald-brand",
    rose: "bg-rose-brand",
    navy: "bg-navy",
  };

  if (id === "mobile" || id === "tablet") {
    const isMobile = id === "mobile";
    return (
      <div className={cn(
        "mx-auto rounded-[1.5rem] glass-1 ring-1 ring-border p-2",
        isMobile ? "w-[200px]" : "w-[260px]"
      )}>
        <div className={cn(
          "rounded-[1.1rem] bg-[linear-gradient(180deg,oklch(0.3_0.1_260),oklch(0.4_0.06_260))] p-3",
          isMobile ? "h-[280px]" : "h-[200px]"
        )}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold text-white/80">9:41</span>
            <div className="flex items-center gap-1">
              <span className="size-1 rounded-full bg-white/60" />
              <span className="size-1 rounded-full bg-white/60" />
              <span className="size-1 rounded-full bg-white/60" />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-white/95 backdrop-blur-sm shadow-lg p-2.5 space-y-1.5"
          >
            <div className="flex items-center gap-1.5">
              <div className={cn("size-5 rounded-md", dotColor[accent])} />
              <span className="text-[10px] font-bold text-foreground">LootLoom</span>
              <span className="ml-auto text-[9px] text-muted-foreground">now</span>
            </div>
            <div className="h-2 w-3/4 rounded bg-foreground/80" />
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded bg-muted" />
              <div className="h-1.5 w-5/6 rounded bg-muted" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default: in-app / push / email / sms / desktop toast mockup
  return (
    <div className="rounded-xl glass-1 ring-1 ring-border p-3 space-y-2.5">
      <div className="flex items-start gap-2.5">
        <div className={cn("size-8 rounded-lg shrink-0 flex items-center justify-center text-white", dotColor[accent])}>
          <Bell size={14} />
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="h-2.5 w-1/3 rounded shimmer" />
            <span className="text-[10px] text-muted-foreground shrink-0">just now</span>
          </div>
          <div className="h-2 w-2/3 rounded shimmer" />
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded shimmer" />
            <div className="h-1.5 w-5/6 rounded shimmer" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 pt-1 border-t border-border/40">
        <div className={cn("h-1.5 w-1.5 rounded-full", dotColor[accent])} />
        <span className="text-[10px] text-muted-foreground capitalize">{id} preview</span>
      </div>
    </div>
  );
}

/* ============================================================
   Reusable Helper: ApprovalWorkflowTimeline
   Animated timeline of approval steps.
   ============================================================ */

export function ApprovalWorkflowTimeline() {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-4">
      {/* Horizontal timeline (desktop) */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-border" />
          <motion.div
            className="absolute top-6 left-6 h-0.5 bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand),var(--purple-brand))]"
            initial={{ width: "0%" }}
            whileInView={{ width: `${(active / (APPROVAL_STEPS.length - 1)) * (100 - 12 / 8)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ maxWidth: "calc(100% - 48px)" }}
          />
          <div className="relative grid grid-cols-7 gap-2">
            {APPROVAL_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = i < active;
              const isActive = i === active;
              const isFuture = i > active;
              const accentFill: Record<Accent, string> = {
                electric: "bg-electric text-white ring-electric/30",
                cyan: "bg-cyan-brand text-white ring-cyan-brand/30",
                purple: "bg-purple-brand text-white ring-purple-brand/30",
                gold: "bg-gold text-foreground ring-gold/30",
                emerald: "bg-emerald-brand text-white ring-emerald-brand/30",
                rose: "bg-rose-brand text-white ring-rose-brand/30",
                navy: "bg-navy text-white ring-navy/30",
              };
              const accentRing: Record<Accent, string> = {
                electric: "ring-electric/50 text-electric",
                cyan: "ring-cyan-brand/50 text-cyan-brand",
                purple: "ring-purple-brand/50 text-purple-brand",
                gold: "ring-gold/50 text-gold",
                emerald: "ring-emerald-brand/50 text-emerald-brand",
                rose: "ring-rose-brand/50 text-rose-brand",
                navy: "ring-navy/50 text-navy",
              };
              return (
                <motion.button
                  key={step.id}
                  type="button"
                  onClick={() => setActive(i)}
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-center gap-2 text-center group"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "relative size-12 rounded-xl ring-2 flex items-center justify-center transition-all",
                      isCompleted
                        ? accentFill[step.accent]
                        : isActive
                        ? cn("bg-background", accentRing[step.accent])
                        : "bg-background ring-border text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} />
                    ) : step.future ? (
                      <Lock size={14} className="opacity-70" />
                    ) : (
                      <Icon size={16} />
                    )}
                    {isActive && (
                      <motion.span
                        className={cn("absolute -inset-1 rounded-xl ring-2", accentRing[step.accent])}
                        animate={{ opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  <div className="space-y-0.5">
                    <p className={cn(
                      "text-[11px] font-bold",
                      isFuture ? "text-muted-foreground/70" : "text-foreground"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight hidden xl:block max-w-[110px]">
                      {step.desc}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vertical timeline (mobile) */}
      <div className="lg:hidden space-y-1">
        {APPROVAL_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = i < active;
          const isActive = i === active;
          const accentBg: Record<Accent, string> = {
            electric: "bg-electric text-white",
            cyan: "bg-cyan-brand text-white",
            purple: "bg-purple-brand text-white",
            gold: "bg-gold text-foreground",
            emerald: "bg-emerald-brand text-white",
            rose: "bg-rose-brand text-white",
            navy: "bg-navy text-white",
          };
          return (
            <motion.button
              key={step.id}
              type="button"
              onClick={() => setActive(i)}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-accent/40 transition-all"
            >
              <div className="flex flex-col items-center self-stretch">
                <div className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0",
                  isCompleted ? accentBg[step.accent] : isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? <CheckCircle2 size={14} /> : step.future ? <Lock size={11} /> : <Icon size={13} />}
                </div>
                {i < APPROVAL_STEPS.length - 1 && (
                  <div className={cn("w-0.5 flex-1 my-1", isCompleted ? "bg-electric/40" : "bg-border")} />
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <p className={cn("text-xs font-semibold", isActive ? "text-foreground" : isCompleted ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                  {step.future && <Lock size={9} className="inline-block ml-1.5 text-muted-foreground/60" />}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug">{step.desc}</p>
              </div>
              {isActive && (
                <StatusBadge variant="electric" dot pulse>
                  Active
                </StatusBadge>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Step controls */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Workflow size={11} className="text-electric" />
          Step <span className="font-semibold text-foreground">{active + 1}</span> of {APPROVAL_STEPS.length}
          <Lock size={9} className="ml-1.5 text-muted-foreground/60" />
          <span className="text-muted-foreground/70">Workflow pending backend</span>
        </p>
        <div className="flex items-center gap-2">
          <LootButton
            size="sm"
            variant="outline"
            leftIcon={<ChevronDown size={12} className="rotate-90" />}
            disabled={active === 0}
            onClick={() => setActive((a) => Math.max(0, a - 1))}
          >
            Previous
          </LootButton>
          <LootButton
            size="sm"
            variant="electric"
            rightIcon={<ChevronDown size={12} className="-rotate-90" />}
            disabled={active === APPROVAL_STEPS.length - 1}
            onClick={() => setActive((a) => Math.min(APPROVAL_STEPS.length - 1, a + 1))}
          >
            Advance
          </LootButton>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Section 1: Communication Overview
   ============================================================ */

function CommunicationOverviewSection() {
  return (
    <Grid cols={4}>
      {OVERVIEW_STATS.map((s, i) => (
        <StatCard
          key={s.label}
          label={s.label}
          value={s.value}
          prefix={s.prefix}
          suffix={s.suffix}
          decimals={s.decimals ?? 0}
          icon={s.icon}
          accent={s.accent}
          trend={s.trend}
          index={i}
          className={cn(s.future && "opacity-90")}
        />
      ))}
    </Grid>
  );
}

/* ============================================================
   Section 2: Quick Communication Actions
   ============================================================ */

function QuickActionsSection() {
  return (
    <WidgetCard
      title="Quick Communication Actions"
      description="Start a new broadcast, announcement or campaign"
      icon={<Zap size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          12 actions
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          const accentBg: Record<Accent, string> = {
            electric: "bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand))]",
            cyan: "bg-[linear-gradient(135deg,var(--cyan-brand),oklch(0.78_0.16_180))]",
            purple: "bg-[linear-gradient(135deg,var(--purple-brand),oklch(0.7_0.2_320))]",
            gold: "bg-[linear-gradient(135deg,var(--gold),oklch(0.75_0.18_60))]",
            emerald: "bg-[linear-gradient(135deg,var(--emerald-brand),oklch(0.75_0.16_180))]",
            rose: "bg-[linear-gradient(135deg,var(--rose-brand),oklch(0.7_0.18_30))]",
            navy: "bg-[linear-gradient(135deg,var(--navy),var(--electric))]",
          };
          return (
            <motion.div
              key={a.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              {...hoverLift}
              className="h-full"
            >
              <GlassCard level={2} hover sheen className="p-4 h-full flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 size-20 rounded-full bg-electric/6 blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 16 }}
                    className={cn("size-10 rounded-xl flex items-center justify-center text-white shadow-sm", accentBg[a.accent])}
                  >
                    <Icon size={16} />
                  </motion.div>
                  {a.future && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                      <Lock size={8} /> Soon
                    </span>
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-snug">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{a.desc}</p>
                </div>
                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                    {a.future ? "Pending" : "Ready"}
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
   Section 3: Message Composer
   ============================================================ */

function MessageComposerSection() {
  return (
    <WidgetCard
      title="Message Composer"
      description="Reusable broadcast editor — UI only, no delivery"
      icon={<PenTool size={18} className="text-electric" />}
      action={
        <div className="flex items-center gap-2">
          <StatusBadge variant="default" dot>
            <Lock size={9} className="mr-0.5" /> Display only
          </StatusBadge>
        </div>
      }
    >
      <MessageComposer />
    </WidgetCard>
  );
}

/* ============================================================
   Section 4: Audience Selector
   ============================================================ */

function AudienceSelectorSection() {
  return (
    <WidgetCard
      title="Audience Selector"
      description="Choose who receives the broadcast"
      icon={<Users size={18} className="text-electric" />}
      action={
        <LootButton size="sm" variant="glass" leftIcon={<Filter size={13} />}>
          Filters
          <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1 py-0.5 rounded">
            <Lock size={8} /> Soon
          </span>
        </LootButton>
      }
    >
      <AudienceSelector />
    </WidgetCard>
  );
}

/* ============================================================
   Section 5: Message Templates
   ============================================================ */

function MessageTemplatesSection() {
  return (
    <WidgetCard
      title="Message Templates"
      description="Reusable message templates — one click to load"
      icon={<FileText size={18} className="text-electric" />}
      action={
        <div className="flex items-center gap-2">
          <LootButton size="sm" variant="glass" leftIcon={<Search size={13} />}>
            Search
          </LootButton>
          <LootButton size="sm" variant="electric" leftIcon={<Plus size={13} />}>
            New Template
          </LootButton>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {TEMPLATES.map((t, i) => (
          <TemplateCard key={t.id} template={t} index={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 6: Campaign Management
   ============================================================ */

function CampaignManagementSection() {
  const [tab, setTab] = useState("draft");

  return (
    <WidgetCard
      title="Campaign Management"
      description="Manage every broadcast campaign across its lifecycle"
      icon={<Megaphone size={18} className="text-electric" />}
      action={
        <div className="flex items-center gap-2">
          <LootButton size="sm" variant="glass" leftIcon={<RefreshCw size={13} />}>
            Refresh
          </LootButton>
          <LootButton size="sm" variant="electric" leftIcon={<Plus size={13} />}>
            New Campaign
          </LootButton>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Status tabs */}
        <div className="flex items-center gap-1.5 flex-wrap p-1.5 rounded-xl glass-2 ring-1 ring-border">
          {CAMPAIGN_TABS.map((t) => (
            <FilterChip
              key={t.id}
              label={t.label}
              count={t.count}
              active={tab === t.id}
              future={t.future}
              onClick={() => setTab(t.id)}
              accent="electric"
            />
          ))}
        </div>

        {/* Empty state if no campaigns */}
        <NoCampaignsEmpty />

        {/* Skeleton campaign cards (6-8 placeholder) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <CampaignCard key={i} index={i} status={tab as CampaignCardProps["status"]} />
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-electric" />
            Showing skeleton placeholders — no campaigns created yet.
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
    </WidgetCard>
  );
}

/* ============================================================
   Section 7: Announcement Center
   ============================================================ */

function AnnouncementCenterSection() {
  return (
    <WidgetCard
      title="Announcement Center"
      description="Platform-wide announcements — managed from one place"
      icon={<BellRing size={18} className="text-electric" />}
      action={
        <LootButton size="sm" variant="electric" leftIcon={<Plus size={13} />}>
          New Announcement
        </LootButton>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {ANNOUNCEMENTS.map((a, i) => (
          <AnnouncementCard key={a.id} announcement={a} index={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 8: Notification Preview
   ============================================================ */

function NotificationPreviewSection() {
  return (
    <WidgetCard
      title="Notification Preview"
      description="Preview how each channel renders the message"
      icon={<Eye size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> UI mockups
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {PREVIEW_CARDS.map((p, i) => (
          <NotificationPreviewCard key={p.id} preview={p} index={i} />
        ))}
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 9: Communication Analytics
   ============================================================ */

function CommunicationAnalyticsSection() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30D");
  const [tab, setTab] = useState("timeline");

  return (
    <WidgetCard
      title="Communication Analytics"
      description="Reach, delivery and engagement trends"
      icon={<BarChart3 size={18} className="text-electric" />}
      action={<AnalyticsTabs value={period} onChange={setPeriod} />}
    >
      <div className="space-y-4">
        {/* Analytics tabs */}
        <div className="flex items-center gap-1.5 flex-wrap p-1.5 rounded-xl glass-2 ring-1 ring-border">
          {ANALYTICS_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <FilterChip
                key={t.id}
                label={t.label}
                active={tab === t.id}
                future={t.future}
                onClick={() => setTab(t.id)}
                accent="electric"
              />
            );
          })}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Broadcast Timeline */}
          <GlassCard level={1} className={cn("p-4 space-y-3", tab !== "timeline" && "hidden")}>
            <ChartHeader
              title="Broadcast Timeline"
              description="Daily broadcast volume"
              icon={<Activity size={14} className="text-electric" />}
            />
            <ChartContainer>
              <AreaChart data={TIMELINE_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-timeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentColor.electric} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={accentColor.electric} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.1 260 / 0.08)" />
                <XAxis dataKey="label" stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.3 0.1 260 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ stroke: accentColor.electric, strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={tooltipStyle}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={accentColor.electric}
                  strokeWidth={2.5}
                  fill="url(#grad-timeline)"
                  dot={{ r: 3, fill: accentColor.electric, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: accentColor.electric }}
                />
              </AreaChart>
            </ChartContainer>
          </GlassCard>

          {/* Category Distribution */}
          <GlassCard level={1} className={cn("p-4 space-y-3", tab !== "category" && "hidden")}>
            <ChartHeader
              title="Category Distribution"
              description="Broadcasts by category"
              icon={<Tag size={14} className="text-purple-brand" />}
            />
            <ChartContainer>
              <RechartsPieChart>
                <Pie
                  data={CATEGORY_PIE}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={2}
                  stroke="none"
                >
                  {CATEGORY_PIE.map((entry, i) => (
                    <Cell key={i} fill={accentColor[entry.accent]} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </RechartsPieChart>
            </ChartContainer>
            <PieLegend items={CATEGORY_PIE} />
          </GlassCard>

          {/* Audience Distribution */}
          <GlassCard level={1} className={cn("p-4 space-y-3", tab !== "audience" && "hidden")}>
            <ChartHeader
              title="Audience Distribution"
              description="Reach by audience segment"
              icon={<Users size={14} className="text-cyan-brand" />}
            />
            <ChartContainer>
              <RechartsPieChart>
                <Pie
                  data={AUDIENCE_PIE}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={2}
                  stroke="none"
                >
                  {AUDIENCE_PIE.map((entry, i) => (
                    <Cell key={i} fill={accentColor[entry.accent]} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </RechartsPieChart>
            </ChartContainer>
            <PieLegend items={AUDIENCE_PIE} />
          </GlassCard>

          {/* Future placeholders (delivery, read, engagement, conversion) */}
          {ANALYTICS_TABS.filter((t) => t.future).map((t) => {
            const Icon = t.icon;
            return (
              <GlassCard
                key={t.id}
                level={1}
                className={cn("p-4 space-y-3", tab !== t.id && "hidden")}
              >
                <ChartHeader
                  title={t.label}
                  description="Coming soon — pending analytics backend"
                  icon={<Icon size={14} className="text-gold" />}
                  future
                />
                <div className="h-[200px] flex flex-col items-center justify-center gap-3 rounded-xl bg-muted/20 ring-1 ring-border/40">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="size-10 rounded-full border-2 border-gold/30 border-t-gold"
                  />
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-center">
                      <Lock size={11} className="text-gold" />
                      Future chart
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-[200px]">
                      Will display {t.label.toLowerCase()} once data pipeline is live.
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid oklch(0.3 0.1 260 / 0.12)",
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(8px)",
  fontSize: 11,
} as const;

function ChartContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

function ChartHeader({
  title,
  description,
  icon,
  future,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  future?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg glass-2 ring-1 ring-border flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
            {title}
            {future && <Lock size={9} className="text-gold" />}
          </p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function PieLegend({ items }: { items: { label: string; value: number; accent: Accent }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 border-t border-border/40">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full shrink-0"
            style={{ background: accentColor[item.accent] }}
          />
          <span className="text-[10px] text-muted-foreground truncate">{item.label}</span>
          <span className="text-[10px] font-semibold text-foreground ml-auto tabular-nums">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Section 10: Communication History
   ============================================================ */

function CommunicationHistorySection() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const cols = useMemo(() => HISTORY_COLUMNS, []);

  return (
    <WidgetCard
      title="Communication History"
      description="Executive log of every campaign ever broadcast"
      icon={<History size={18} className="text-electric" />}
      action={
        <div className="flex items-center gap-2">
          <LootButton size="sm" variant="glass" leftIcon={<Download size={13} />}>
            Export
            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1 py-0.5 rounded">
              <Lock size={8} /> Soon
            </span>
          </LootButton>
          <LootButton size="sm" variant="outline" leftIcon={<RefreshCw size={13} />}>
            Refresh
          </LootButton>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaign by ID or title…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <LootButton size="sm" variant="outline" leftIcon={<Filter size={13} />}>
            More Filters
          </LootButton>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block rounded-xl overflow-hidden ring-1 ring-border/60">
          {/* Header */}
          <div className="bg-muted/40 grid grid-cols-[120px_minmax(180px,1fr)_130px_140px_120px_120px_110px_110px_100px_44px_44px] items-center gap-3 px-4 py-2.5 border-b border-border">
            {cols.map((c) => (
              <span
                key={c.key}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
                  c.key === "details" && "text-right",
                  c.className
                )}
              >
                {c.label}
              </span>
            ))}
          </div>
          {/* Skeleton rows (8) */}
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[120px_minmax(180px,1fr)_130px_140px_120px_120px_110px_110px_100px_44px_44px] items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors"
              >
                <div className="h-3 w-20 rounded shimmer" />
                <div className="space-y-1.5">
                  <div className="h-3 w-2/3 rounded shimmer" />
                  <div className="h-2.5 w-1/2 rounded shimmer" />
                </div>
                <div className="h-5 w-20 rounded-full shimmer" />
                <div className="h-5 w-24 rounded-full shimmer" />
                <div className="h-3 w-16 rounded shimmer" />
                <div className="h-3 w-16 rounded shimmer" />
                <div className="h-5 w-20 rounded-full shimmer" />
                <div className="h-5 w-16 rounded-full shimmer" />
                <div className="flex items-center justify-end">
                  <LootButton size="sm" variant="outline" leftIcon={<Eye size={11} />}>
                    Details
                  </LootButton>
                </div>
                <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all" title="Duplicate">
                  <Copy size={13} />
                </button>
                <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all" title="Archive">
                  <Archive size={13} />
                </button>
              </div>
            ))}
          </div>
          {/* Footer */}
          <div className="bg-muted/30 flex items-center justify-between px-4 py-2.5 border-t border-border">
            <p className="text-[11px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground">1–8</span> of{" "}
              <span className="font-semibold text-foreground">—</span> campaigns
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

        {/* Mobile cards (SkeletonRow) */}
        <div className="lg:hidden">
          <SkeletonRow count={8} />
        </div>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 11: Approval Workflow
   ============================================================ */

function ApprovalWorkflowSection() {
  return (
    <WidgetCard
      title="Approval Workflow"
      description="Animated campaign approval pipeline"
      icon={<Workflow size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Pending backend
        </StatusBadge>
      }
    >
      <ApprovalWorkflowTimeline />
    </WidgetCard>
  );
}

/* ============================================================
   Section 12: AI Assistant Placeholder
   ============================================================ */

function AIAssistantSection() {
  return (
    <WidgetCard
      title="AI Assistant"
      description="Future AI helpers for message authoring"
      icon={<Bot size={18} className="text-electric" />}
      action={
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-2 py-0.5 rounded-full">
          <Lock size={10} /> Coming soon
        </span>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tools grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {AI_TOOLS.map((tool, i) => {
              const Icon = tool.icon;
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
                <motion.button
                  key={tool.id}
                  variants={cardReveal}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-20px" }}
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-start gap-2 p-3 rounded-xl ring-1 ring-border bg-transparent hover:bg-accent/40 text-left transition-all relative"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={cn("size-8 rounded-lg flex items-center justify-center ring-1", accentBg[tool.accent])}>
                      <Icon size={14} />
                    </div>
                    <Lock size={11} className="text-muted-foreground/60" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">{tool.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">{tool.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Chat-like input (display only) */}
          <GlassCard level={1} className="p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] flex items-center justify-center text-white">
                <Bot size={12} />
              </div>
              <p className="text-xs font-semibold text-foreground">AI Composer</p>
              <StatusBadge variant="warning" dot>
                <Lock size={9} className="mr-0.5" /> Disabled
              </StatusBadge>
            </div>
            {/* Mock conversation */}
            <div className="space-y-2 max-h-[140px] overflow-y-auto no-scrollbar">
              <div className="flex items-start gap-2">
                <div className="size-5 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <Sparkles size={10} />
                </div>
                <div className="rounded-lg bg-muted/60 ring-1 ring-border p-2 text-[11px] text-muted-foreground max-w-[85%]">
                  Future AI assistant will help you draft, refine and translate broadcasts.
                </div>
              </div>
            </div>
            {/* Input row (display only) */}
            <div className="flex items-center gap-2 pt-1.5 border-t border-border/40">
              <Input
                placeholder="Ask AI to draft a broadcast… (disabled)"
                disabled
                className="h-9 flex-1"
              />
              <LootButton size="icon" variant="electric" disabled>
                <Send size={14} />
              </LootButton>
            </div>
          </GlassCard>
        </div>

        {/* Right: feature illustration */}
        <GlassCard level={1} className="p-4 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 size-32 rounded-full bg-purple-brand/10 blur-3xl pointer-events-none" />
          <motion.div
            variants={floating}
            animate="animate"
            className="relative size-20 rounded-3xl bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] flex items-center justify-center text-white shadow-[0_12px_40px_-8px_oklch(0.62_0.22_255/0.5)]"
          >
            <Wand2 size={32} />
            <motion.span
              className="absolute -top-1 -right-1 size-6 rounded-full bg-gold flex items-center justify-center text-foreground"
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={12} />
            </motion.span>
          </motion.div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">AI Composer</p>
            <p className="text-[11px] text-muted-foreground max-w-[220px] leading-snug">
              Generate announcements, rewrite messages, check grammar, translate and adjust tone — all coming soon.
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {["GPT", "Translation", "Tone", "Grammar"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 ring-1 ring-border px-1.5 py-0.5 rounded-full">
                <Lock size={8} /> {t}
              </span>
            ))}
          </div>
          <LootButton size="sm" variant="outline" leftIcon={<Bell size={12} />}>
            Notify me at launch
          </LootButton>
        </GlassCard>
      </div>
    </WidgetCard>
  );
}

/* ============================================================
   Section 13: Report Center
   ============================================================ */

function ReportCenterSection() {
  return (
    <WidgetCard
      title="Report Center"
      description="Executive communication reports — placeholders"
      icon={<FileBarChart size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Coming soon
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORTS.map((r, i) => {
          const Icon = r.icon;
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
              key={r.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              {...hoverLift}
              className="h-full"
            >
              <GlassCard level={2} hover sheen className="p-4 h-full flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 size-20 rounded-full bg-electric/6 blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div className={cn("size-10 rounded-xl ring-1 flex items-center justify-center", accentBg[r.accent])}>
                    <Icon size={16} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 ring-1 ring-gold/20 px-1.5 py-0.5 rounded-full">
                    <Lock size={8} /> Soon
                  </span>
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-semibold text-foreground">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{r.desc}</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="h-1.5 rounded-full shimmer" />
                  ))}
                </div>
                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                    Auto-generated
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all" title="Download">
                      <Download size={12} />
                    </button>
                    <button className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all" title="Preview">
                      <Eye size={12} />
                    </button>
                  </div>
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
      description="Download or schedule communication data exports"
      icon={<Download size={18} className="text-electric" />}
      action={
        <StatusBadge variant="default" dot>
          <Lock size={9} className="mr-0.5" /> Coming soon
        </StatusBadge>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {EXPORT_TILES.map((t, i) => {
          const Icon = t.icon ?? Download;
          return (
            <motion.div
              key={t.id}
              variants={cardReveal}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              {...hoverLift}
              className="h-full"
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
   Empty / Error states
   ============================================================ */

export function NoBroadcastsEmpty() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <EmptyState
      icon="Megaphone"
      title="No broadcasts yet"
      description="You have not sent any broadcasts. Start your first announcement from the Quick Actions above."
      action={
        <div className="flex items-center gap-2">
          <LootButton size="sm" variant="electric" leftIcon={<Plus size={13} />}>
            Create Broadcast
          </LootButton>
          <LootButton size="sm" variant="outline" leftIcon={<ArrowRight size={13} className="rotate-180" />} onClick={() => navigate("ceo-dashboard")}>
            Mission Control
          </LootButton>
        </div>
      }
    />
  );
}

export function NoCampaignsEmpty() {
  return (
    <GlassCard level={1} className="p-4 flex items-center gap-3">
      <IconBadge name="Inbox" accent="gold" size="sm" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-foreground">No campaigns in this tab</p>
        <p className="text-[11px] text-muted-foreground">
          Skeleton cards below show how real campaigns will render once created.
        </p>
      </div>
      <LootButton size="sm" variant="outline" leftIcon={<Plus size={12} />}>
        New Campaign
      </LootButton>
    </GlassCard>
  );
}

export function CommunicationModuleUnavailableError({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <ErrorState
      icon="AlertCircle"
      title="Communication module unavailable"
      description="The communication center could not be reached. Retry, or return to Mission Control / Support."
      variant="error"
      action={
        <div className="flex items-center gap-2">
          <LootButton
            size="sm"
            variant="electric"
            leftIcon={<RefreshCw size={13} />}
            onClick={onRetry ?? (() => window.location.reload())}
          >
            Retry
          </LootButton>
          <LootButton size="sm" variant="outline" onClick={() => navigate("ceo-dashboard")}>
            Mission Control
          </LootButton>
          <LootButton size="sm" variant="glass" onClick={() => navigate("ceo-support")}>
            Support
          </LootButton>
        </div>
      }
    />
  );
}

/* ============================================================
   Main View: CeoCommunicationView
   ============================================================ */

export function CeoCommunicationView() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <PageContainer>
      <PageHeader
        title="Communication Center"
        description="Broadcast & announcement management"
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
        {/* 1. Communication Overview */}
        <CommunicationOverviewSection />

        {/* 2. Quick Communication Actions */}
        <QuickActionsSection />

        {/* 3. Message Composer */}
        <MessageComposerSection />

        {/* 4. Audience Selector */}
        <AudienceSelectorSection />

        {/* 5. Message Templates */}
        <MessageTemplatesSection />

        {/* 6. Campaign Management */}
        <CampaignManagementSection />

        {/* 7. Announcement Center */}
        <AnnouncementCenterSection />

        {/* 8. Notification Preview */}
        <NotificationPreviewSection />

        {/* 9. Communication Analytics */}
        <CommunicationAnalyticsSection />

        {/* 10. Communication History */}
        <CommunicationHistorySection />

        {/* 11. Approval Workflow */}
        <ApprovalWorkflowSection />

        {/* 12. AI Assistant Placeholder */}
        <AIAssistantSection />

        {/* 13. Report Center */}
        <ReportCenterSection />

        {/* 14. Export Center */}
        <ExportCenterSection />

        {/* Footer note */}
        <GlassCard level={1} className="p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <IconBadge name="ShieldCheck" accent="emerald" size="sm" />
            <div>
              <p className="text-xs font-semibold text-foreground">CEO Secure Communication</p>
              <p className="text-[11px] text-muted-foreground">
                All broadcasts are CEO-approved, audited and recorded. No message is delivered without review.
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
