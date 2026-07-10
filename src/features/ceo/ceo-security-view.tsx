"use client";

/* ============================================================
   LootLoom — CEO Security Operations Center (SOC)
   Audit Logs · Platform Monitoring · Future Fraud Detection
   View renders INSIDE the CeoLayout. No sidebar/header/background.
   Skeleton-first: no backend, no monitoring services, no intrusion
   or fraud detection. Inherits premium WHITE executive design
   language (navy + electric + emerald for security).
   ============================================================ */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
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
  AlertOctagon,
  AlertTriangle,
  Bell,
  Bot,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  Fingerprint,
  Globe,
  HardDrive,
  History,
  KeyRound,
  Lock,
  Megaphone,
  Monitor,
  MoreVertical,
  Network,
  Printer,
  RefreshCw,
  ScanFace,
  Search,
  Send,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  UserCheck,
  Users,
  Wand2,
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
  SectionHeader,
  SkeletonRow,
  StatCard,
  StatusBadge,
  WidgetCard,
} from "@/components/lootloom";
import { cardReveal, floating, hoverLift, staggerContainer } from "@/lib/animations";
import { useNavigationStore } from "@/stores";
import { cn } from "@/lib/utils";

/* ============================================================
   Types
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
type HealthState = "operational" | "degraded" | "maintenance";
type Severity = "critical" | "high" | "medium" | "low" | "info";

/* ============================================================
   Chart palette
   ============================================================ */

const CHART = {
  electric: "oklch(0.62 0.22 255)",
  cyan: "oklch(0.72 0.15 200)",
  purple: "oklch(0.6 0.22 295)",
  gold: "oklch(0.8 0.16 85)",
  emerald: "oklch(0.7 0.17 160)",
  rose: "oklch(0.65 0.2 20)",
  navy: "oklch(0.27 0.05 260)",
};

/* ============================================================
   Static placeholder datasets (UI only — no backend, no logs)
   ============================================================ */

const OVERVIEW_STATS: Array<{
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  accent: Accent;
  trend?: { value: number; positive: boolean };
  future?: boolean;
  isStatus?: boolean;
  statusLabel?: string;
  statusVariant?: "success" | "warning" | "error" | "info";
}> = [
  { label: "Platform Security Status", value: 0, icon: "ShieldCheck", accent: "emerald", isStatus: true, statusLabel: "Secured", statusVariant: "success" },
  { label: "Current Security Level", value: 0, icon: "Lock", accent: "navy", isStatus: true, statusLabel: "Level 4 · Elevated", statusVariant: "info" },
  { label: "Today's Security Events", value: 0, icon: "Activity", accent: "electric", trend: { value: 4.2, positive: false } },
  { label: "Critical Alerts", value: 0, icon: "AlertOctagon", accent: "rose", trend: { value: 0, positive: true } },
  { label: "Warning Alerts", value: 0, icon: "AlertTriangle", accent: "gold", trend: { value: 1.1, positive: false } },
  { label: "Administrator Sessions", value: 0, icon: "UserCheck", accent: "cyan", trend: { value: 0.8, positive: true } },
  { label: "Active CEO Sessions", value: 0, icon: "Crown", accent: "purple" },
  { label: "Future Risk Score", value: 0, suffix: "/100", icon: "ShieldAlert", accent: "gold", future: true },
  { label: "Future Threat Score", value: 0, suffix: "/100", icon: "AlertTriangle", accent: "rose", future: true },
  { label: "Future System Integrity", value: 0, suffix: "%", icon: "HardDrive", accent: "emerald", future: true, trend: { value: 0.2, positive: true } },
  { label: "Future Compliance Score", value: 0, suffix: "%", icon: "FileText", accent: "electric", future: true },
  { label: "Future Security Health", value: 0, suffix: "/100", icon: "Activity", accent: "cyan", future: true },
];

const SECURITY_DASHBOARD_TILES: Array<{
  name: string;
  icon: string;
  accent: Accent;
  status: HealthState;
  health: "green" | "yellow" | "red";
  latency: string;
  uptime: string;
  future?: boolean;
}> = [
  { name: "Authentication", icon: "ShieldCheck", accent: "emerald", status: "operational", health: "green", latency: "—", uptime: "—" },
  { name: "Wallet Security", icon: "Wallet", accent: "electric", status: "operational", health: "green", latency: "—", uptime: "—" },
  { name: "Redeem Security", icon: "ShoppingBag", accent: "purple", status: "operational", health: "green", latency: "—", uptime: "—" },
  { name: "Notification Security", icon: "Bell", accent: "cyan", status: "operational", health: "green", latency: "—", uptime: "—" },
  { name: "Support Security", icon: "LifeBuoy", accent: "rose", status: "operational", health: "green", latency: "—", uptime: "—" },
  { name: "Database", icon: "Database", accent: "navy", status: "operational", health: "green", latency: "—", uptime: "—", future: true },
  { name: "API Gateway", icon: "Server", accent: "electric", status: "operational", health: "green", latency: "—", uptime: "—", future: true },
  { name: "Advertisement", icon: "Megaphone", accent: "gold", status: "maintenance", health: "yellow", latency: "—", uptime: "—", future: true },
  { name: "Future Anti-Fraud", icon: "ScanFace", accent: "rose", status: "operational", health: "green", latency: "—", uptime: "—", future: true },
  { name: "Future AI Security", icon: "BrainCircuit", accent: "purple", status: "operational", health: "green", latency: "—", uptime: "—", future: true },
  { name: "Future Monitoring Agents", icon: "Bot", accent: "cyan", status: "operational", health: "green", latency: "—", uptime: "—", future: true },
];

const AUDIT_TABLE_COLUMNS: Array<{ key: string; label: string; className?: string }> = [
  { key: "logid", label: "Log ID", className: "w-[120px]" },
  { key: "admin", label: "Administrator", className: "min-w-[160px]" },
  { key: "action", label: "Action", className: "min-w-[160px]" },
  { key: "module", label: "Module", className: "min-w-[130px] hidden md:table-cell" },
  { key: "severity", label: "Severity", className: "w-[110px] hidden lg:table-cell" },
  { key: "date", label: "Date", className: "w-[120px] hidden xl:table-cell" },
  { key: "time", label: "Time", className: "w-[100px] hidden xl:table-cell" },
  { key: "status", label: "Status", className: "w-[110px] hidden lg:table-cell" },
  { key: "ip", label: "Future IP", className: "w-[130px] hidden 2xl:table-cell" },
  { key: "device", label: "Future Device", className: "w-[150px] hidden 2xl:table-cell" },
  { key: "details", label: "", className: "w-[80px] text-right" },
];

const ADMIN_ACTIVITY: Array<{
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  accent: Accent;
  badge: string;
  badgeVariant: "info" | "success" | "warning" | "error" | "purple" | "gold" | "cyan";
  future?: boolean;
}> = [
  { id: "a1", title: "Administrator Login", description: "CEO session opened via MFA + biometric verification.", time: "Just now", icon: "LogIn", accent: "emerald", badge: "Auth", badgeVariant: "success" },
  { id: "a2", title: "Future Logout", description: "Administrator session terminated and audit record signed.", time: "12m ago", icon: "LogOut", accent: "navy", badge: "Session", badgeVariant: "info", future: true },
  { id: "a3", title: "Future User Viewed", description: "Opened user_29481 detail panel from the user management table.", time: "28m ago", icon: "Eye", accent: "electric", badge: "Read", badgeVariant: "info", future: true },
  { id: "a4", title: "Future Wallet Viewed", description: "Wallet ledger inspected for wallet_8812 — no adjustments.", time: "44m ago", icon: "Wallet", accent: "gold", badge: "Wallet", badgeVariant: "gold", future: true },
  { id: "a5", title: "Future Redeem Reviewed", description: "Redeem request #1182 marked for approval — pending.", time: "1h ago", icon: "ShoppingBag", accent: "purple", badge: "Redeem", badgeVariant: "purple", future: true },
  { id: "a6", title: "Future Ticket Viewed", description: "Support ticket #882 opened — escalated to Tier 2.", time: "1h ago", icon: "LifeBuoy", accent: "rose", badge: "Ticket", badgeVariant: "error", future: true },
  { id: "a7", title: "Future Broadcast Created", description: "Weekly digest scheduled for 942K recipients.", time: "2h ago", icon: "Megaphone", accent: "cyan", badge: "Broadcast", badgeVariant: "cyan", future: true },
  { id: "a8", title: "Future Security Change", description: "Updated MFA policy for Tier 0 administrators.", time: "3h ago", icon: "ShieldAlert", accent: "rose", badge: "Security", badgeVariant: "warning", future: true },
  { id: "a9", title: "Future Settings Updated", description: "Platform notification preferences revised.", time: "5h ago", icon: "Settings", accent: "electric", badge: "Config", badgeVariant: "info", future: true },
  { id: "a10", title: "Future Export Created", description: "Daily audit log export queued for delivery.", time: "8h ago", icon: "Download", accent: "navy", badge: "Export", badgeVariant: "info", future: true },
];

const SECURITY_EVENTS: Array<{
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  accent: Accent;
  severity: Severity;
  future?: boolean;
}> = [
  { id: "e1", title: "Login Event", description: "Successful CEO login from recognized device + location.", time: "Just now", icon: "LogIn", accent: "emerald", severity: "info" },
  { id: "e2", title: "Permission Event", description: "Role assignment reviewed — no changes made.", time: "12m ago", icon: "KeyRound", accent: "electric", severity: "low" },
  { id: "e3", title: "Session Event", description: "New administrator session opened with MFA verified.", time: "32m ago", icon: "Monitor", accent: "cyan", severity: "info" },
  { id: "e4", title: "Authentication Event", description: "Multiple failed login attempts blocked for user_29481.", time: "1h ago", icon: "ShieldAlert", accent: "gold", severity: "medium" },
  { id: "e5", title: "Future Fraud Event", description: "Anomalous redeem pattern flagged for 3 accounts.", time: "2h ago", icon: "AlertTriangle", accent: "rose", severity: "high", future: true },
  { id: "e6", title: "Future Device Alert", description: "Login from unrecognized device fingerprint.", time: "3h ago", icon: "Smartphone", accent: "gold", severity: "medium", future: true },
  { id: "e7", title: "Future API Alert", description: "Rate limit threshold crossed on public API.", time: "4h ago", icon: "Server", accent: "electric", severity: "medium", future: true },
  { id: "e8", title: "Future Database Alert", description: "Replication lag detected on read-replica-02.", time: "6h ago", icon: "Database", accent: "rose", severity: "critical", future: true },
  { id: "e9", title: "Future Monitoring Alert", description: "Telemetry pipeline buffer near capacity.", time: "8h ago", icon: "Activity", accent: "gold", severity: "low", future: true },
  { id: "e10", title: "Future Advertisement Alert", description: "Campaign budget 92% consumed — review cap.", time: "12h ago", icon: "Megaphone", accent: "cyan", severity: "info", future: true },
];

const SESSION_CARDS: Array<{
  id: string;
  label: string;
  value: string;
  icon: string;
  accent: Accent;
  future?: boolean;
}> = [
  { id: "s1", label: "Current Sessions", value: "—", icon: "Monitor", accent: "emerald" },
  { id: "s2", label: "Administrator Devices", value: "—", icon: "Smartphone", accent: "electric" },
  { id: "s3", label: "Browser", value: "—", icon: "Globe", accent: "cyan", future: true },
  { id: "s4", label: "Operating System", value: "—", icon: "Cpu", accent: "purple", future: true },
  { id: "s5", label: "Session Duration", value: "—", icon: "Timer", accent: "gold" },
  { id: "s6", label: "Future IP Address", value: "—", icon: "Network", accent: "navy", future: true },
  { id: "s7", label: "Future Geolocation", value: "—", icon: "MapPin", accent: "rose", future: true },
  { id: "s8", label: "Future Device Fingerprint", value: "—", icon: "Fingerprint", accent: "electric", future: true },
  { id: "s9", label: "Future Trusted Device", value: "—", icon: "ShieldCheck", accent: "emerald", future: true },
  { id: "s10", label: "Future Session Risk", value: "—", icon: "AlertTriangle", accent: "gold", future: true },
];

const PERMISSION_CARDS: Array<{
  id: string;
  role: string;
  summary: string;
  accessLevel: string;
  accent: Accent;
  permissions: string[];
  future?: boolean;
}> = [
  {
    id: "p1",
    role: "CEO",
    summary: "Full platform control · root access",
    accessLevel: "Tier 0 · Root",
    accent: "purple",
    permissions: ["All modules", "Audit logs", "Security config", "Role management"],
  },
  {
    id: "p2",
    role: "Administrator",
    summary: "Operational control across modules",
    accessLevel: "Tier 1 · Elevated",
    accent: "electric",
    permissions: ["Users", "Wallet", "Redeem", "Support", "Notifications"],
  },
  {
    id: "p3",
    role: "Moderator",
    summary: "Content & community moderation",
    accessLevel: "Tier 2 · Limited",
    accent: "cyan",
    permissions: ["Reports", "User flags", "Content review"],
    future: true,
  },
  {
    id: "p4",
    role: "Support",
    summary: "Ticket triage & user assistance",
    accessLevel: "Tier 2 · Limited",
    accent: "emerald",
    permissions: ["Tickets", "User view", "Broadcasts"],
    future: true,
  },
  {
    id: "p5",
    role: "Finance",
    summary: "Financial reconciliation & payouts",
    accessLevel: "Tier 1 · Elevated",
    accent: "gold",
    permissions: ["Wallet ledger", "Payouts", "Audit export"],
    future: true,
  },
  {
    id: "p6",
    role: "Read Only",
    summary: "Observability without mutations",
    accessLevel: "Tier 3 · Read",
    accent: "navy",
    permissions: ["All read", "Reports", "Analytics"],
    future: true,
  },
];

const PLATFORM_MONITORING: Array<{
  id: string;
  name: string;
  icon: string;
  accent: Accent;
  status: HealthState;
  future?: boolean;
}> = [
  { id: "m1", name: "Authentication", icon: "ShieldCheck", accent: "emerald", status: "operational" },
  { id: "m2", name: "User Platform", icon: "Users", accent: "electric", status: "operational" },
  { id: "m3", name: "CEO Platform", icon: "Crown", accent: "purple", status: "operational" },
  { id: "m4", name: "Wallet", icon: "Wallet", accent: "gold", status: "operational" },
  { id: "m5", name: "Redeem", icon: "ShoppingBag", accent: "purple", status: "degraded" },
  { id: "m6", name: "Notifications", icon: "Bell", accent: "cyan", status: "operational" },
  { id: "m7", name: "Support", icon: "LifeBuoy", accent: "rose", status: "operational" },
  { id: "m8", name: "Reports", icon: "FileText", accent: "navy", status: "operational" },
  { id: "m9", name: "Advertisement", icon: "Megaphone", accent: "gold", status: "maintenance", future: true },
  { id: "m10", name: "Future Queue", icon: "ListChecks", accent: "electric", status: "operational", future: true },
  { id: "m11", name: "Future Cache", icon: "HardDrive", accent: "cyan", status: "operational", future: true },
  { id: "m12", name: "Future Storage", icon: "Database", accent: "emerald", status: "operational", future: true },
  { id: "m13", name: "Future Background Jobs", icon: "Cpu", accent: "purple", status: "operational", future: true },
];

const ALERT_CENTER: Array<{
  id: string;
  title: string;
  description: string;
  time: string;
  severity: Severity | "maintenance" | "emergency" | "ai";
  icon: string;
  future?: boolean;
}> = [
  { id: "al1", title: "Critical Alert", description: "Multiple failed CEO login attempts detected from unknown device.", time: "4m ago", severity: "critical", icon: "AlertOctagon" },
  { id: "al2", title: "High Alert", description: "Wallet adjustment requested outside business hours.", time: "22m ago", severity: "high", icon: "ShieldAlert" },
  { id: "al3", title: "Medium Alert", description: "Bulk notification dispatch exceeding throughput threshold.", time: "1h ago", severity: "medium", icon: "Bell" },
  { id: "al4", title: "Low Alert", description: "Password rotation reminder for 2 administrator accounts.", time: "3h ago", severity: "low", icon: "KeyRound" },
  { id: "al5", title: "Information", description: "Weekly security digest report available for review.", time: "5h ago", severity: "info", icon: "FileText" },
  { id: "al6", title: "Maintenance", description: "Advertisement service scheduled downtime tonight 02:00–02:30 IST.", time: "1h ago", severity: "maintenance", icon: "Server" },
  { id: "al7", title: "Future Emergency", description: "Platform-wide incident declared — auto-failover engaged.", time: "—", severity: "emergency", icon: "AlertTriangle", future: true },
  { id: "al8", title: "Future AI Detection", description: "Anomaly model flagged suspicious redeem cluster for review.", time: "—", severity: "ai", icon: "BrainCircuit", future: true },
];

const COMPLIANCE_CARDS: Array<{
  id: string;
  label: string;
  status: string;
  icon: string;
  accent: Accent;
  variant: "success" | "warning" | "info";
  future?: boolean;
}> = [
  { id: "c1", label: "Audit Status", status: "Active", icon: "ShieldCheck", accent: "emerald", variant: "success" },
  { id: "c2", label: "Policy Compliance", status: "Compliant", icon: "FileText", accent: "electric", variant: "success" },
  { id: "c3", label: "Future GDPR", status: "Pending", icon: "Lock", accent: "gold", variant: "warning", future: true },
  { id: "c4", label: "Future Data Protection", status: "Pending", icon: "KeyRound", accent: "cyan", variant: "warning", future: true },
  { id: "c5", label: "Future Security Review", status: "Scheduled", icon: "ShieldAlert", accent: "purple", variant: "info", future: true },
  { id: "c6", label: "Future Internal Audit", status: "Queued", icon: "FileText", accent: "navy", variant: "info", future: true },
  { id: "c7", label: "Future External Audit", status: "Not started", icon: "CheckCircle2", accent: "rose", variant: "warning", future: true },
  { id: "c8", label: "Future Certification", status: "In progress", icon: "Award", accent: "gold", variant: "info", future: true },
];

const SECURITY_REPORTS: Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: Accent;
  future?: boolean;
}> = [
  { id: "r1", title: "Daily Security Report", description: "Today's events, alerts, and administrator actions.", icon: "FileText", accent: "electric" },
  { id: "r2", title: "Weekly Security Report", description: "Rolling 7-day security posture summary.", icon: "Calendar", accent: "cyan" },
  { id: "r3", title: "Monthly Security Report", description: "30-day trends, incidents, and compliance status.", icon: "FileText", accent: "purple" },
  { id: "r4", title: "Administrator Report", description: "Per-administrator activity and access summary.", icon: "UserCheck", accent: "emerald" },
  { id: "r5", title: "Audit Report", description: "Complete audit trail with immutable signatures.", icon: "History", accent: "navy" },
  { id: "r6", title: "Permission Report", description: "Role matrix, access levels, and assignments.", icon: "KeyRound", accent: "gold" },
  { id: "r7", title: "Incident Report", description: "Resolved and open incident retrospectives.", icon: "AlertTriangle", accent: "rose" },
  { id: "r8", title: "Future Compliance Report", description: "Regulatory + certification readiness.", icon: "ShieldCheck", accent: "electric", future: true },
];

const EXPORT_TILES: Array<{
  id: string;
  label: string;
  desc: string;
  icon: string;
  accent: Accent;
  future?: boolean;
}> = [
  { id: "x1", label: "CSV", desc: "Comma-separated audit logs", icon: "Download", accent: "electric" },
  { id: "x2", label: "Excel", desc: "Microsoft .xlsx workbook", icon: "Briefcase", accent: "emerald" },
  { id: "x3", label: "PDF", desc: "Formatted PDF document", icon: "Printer", accent: "rose" },
  { id: "x4", label: "Print", desc: "Print-ready layout", icon: "Printer", accent: "navy" },
  { id: "x5", label: "Scheduled Reports", desc: "Daily / weekly / monthly", icon: "Calendar", accent: "purple", future: true },
  { id: "x6", label: "Cloud Export", desc: "Direct to S3 / GCS / Azure", icon: "UploadCloud", accent: "cyan", future: true },
];

const AI_SECURITY_PANEL: Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: Accent;
}> = [
  { id: "ai1", title: "Future Threat Analysis", description: "Continuous threat surface modeling across services.", icon: "BrainCircuit", accent: "rose" },
  { id: "ai2", title: "Future Risk Prediction", description: "Predictive risk scoring for sessions & redeems.", icon: "TrendingUp", accent: "gold" },
  { id: "ai3", title: "Future Security Suggestions", description: "Actionable hardening recommendations.", icon: "Wand2", accent: "electric" },
  { id: "ai4", title: "Future Incident Summary", description: "Auto-generated post-incident retrospectives.", icon: "FileText", accent: "purple" },
  { id: "ai5", title: "Future Log Analysis", description: "Natural-language queries over audit history.", icon: "Search", accent: "cyan" },
  { id: "ai6", title: "Future Smart Search", description: "Semantic search across events & sessions.", icon: "Sparkles", accent: "emerald" },
];

/* ============================================================
   Chart placeholder datasets
   ============================================================ */

const SECURITY_EVENTS_CHART = [
  { x: "Mon", v: 0 },
  { x: "Tue", v: 0 },
  { x: "Wed", v: 0 },
  { x: "Thu", v: 0 },
  { x: "Fri", v: 0 },
  { x: "Sat", v: 0 },
  { x: "Sun", v: 0 },
];

const ADMIN_ACTIVITY_CHART = [
  { x: "Auth", v: 0 },
  { x: "Users", v: 0 },
  { x: "Wallet", v: 0 },
  { x: "Redeem", v: 0 },
  { x: "Notify", v: 0 },
  { x: "Support", v: 0 },
];

const LOGIN_TREND_CHART = [
  { x: "W1", v: 0 },
  { x: "W2", v: 0 },
  { x: "W3", v: 0 },
  { x: "W4", v: 0 },
  { x: "W5", v: 0 },
  { x: "W6", v: 0 },
];

const PERMISSION_USAGE_PIE = [
  { name: "CEO", value: 1, color: CHART.purple },
  { name: "Admin", value: 3, color: CHART.electric },
  { name: "Moderator", value: 5, color: CHART.cyan },
  { name: "Support", value: 8, color: CHART.emerald },
  { name: "Read Only", value: 12, color: CHART.navy },
];

const MODULE_ACTIVITY_CHART = [
  { x: "Users", v: 0 },
  { x: "Wallet", v: 0 },
  { x: "Redeem", v: 0 },
  { x: "Tickets", v: 0 },
  { x: "Broadcast", v: 0 },
  { x: "Settings", v: 0 },
];

/* ============================================================
   Reusable helpers
   ============================================================ */

/* --- SeverityBadge ----------------------------------------- */

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const cfg: Record<Severity, { variant: "error" | "warning" | "info" | "default" | "purple"; label: string }> = {
    critical: { variant: "error", label: "Critical" },
    high: { variant: "warning", label: "High" },
    medium: { variant: "purple", label: "Medium" },
    low: { variant: "info", label: "Low" },
    info: { variant: "default", label: "Info" },
  };
  const c = cfg[severity];
  return (
    <StatusBadge variant={c.variant} dot={severity === "critical"} pulse={severity === "critical"} className={className}>
      {c.label}
    </StatusBadge>
  );
}

/* --- MonitoringTile ---------------------------------------- */

interface MonitoringTileProps {
  name: string;
  icon: string;
  accent: Accent;
  status: HealthState;
  health: "green" | "yellow" | "red";
  latency: string;
  uptime: string;
  index?: number;
  future?: boolean;
}

export function MonitoringTile({
  name,
  icon,
  accent,
  status,
  health,
  latency,
  uptime,
  index = 0,
  future = false,
}: MonitoringTileProps) {
  const healthCfg: Record<"green" | "yellow" | "red", { dot: string; ring: string; badge: "success" | "warning" | "error"; label: string }> = {
    green: { dot: "bg-emerald-brand", ring: "ring-emerald-brand/20", badge: "success", label: "Healthy" },
    yellow: { dot: "bg-gold", ring: "ring-gold/25", badge: "warning", label: "Degraded" },
    red: { dot: "bg-rose-brand", ring: "ring-rose-brand/20", badge: "error", label: "Critical" },
  };
  const hcfg = healthCfg[health];

  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="h-full"
    >
      <GlassCard
        hover
        sheen
        level={2}
        className={cn("p-4 h-full flex flex-col gap-3 ring-1", hcfg.ring, "shadow-[var(--shadow-sm)]")}
      >
        <div className="flex items-center justify-between">
          <IconBadge name={icon} accent={accent} size="sm" />
          {future ? (
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Future</span>
          ) : (
            <StatusBadge variant={hcfg.badge} dot pulse={health === "red"}>
              {hcfg.label}
            </StatusBadge>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", hcfg.dot)} />
            <StatusBadge variant={hcfg.badge}>{hcfg.label}</StatusBadge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 pt-1 border-t border-border/60">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Latency</p>
            <p className="text-xs font-semibold text-foreground tabular-nums">{latency}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Uptime</p>
            <p className="text-xs font-semibold text-emerald-brand tabular-nums">{uptime}</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* --- AuditLogRow ------------------------------------------- */
/* Skeleton placeholder for a single audit log table row, aligned
   with the real column headers. No fake data. */

interface AuditLogRowProps {
  index?: number;
}

export function AuditLogRow({ index = 0 }: AuditLogRowProps) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-10px" }}
      className="contents"
    >
      <div className="hidden md:grid grid-cols-[120px_1.4fr_1.4fr_1fr_110px_120px_100px_110px_130px_150px_80px] items-center gap-3 px-4 py-3 rounded-xl glass-1 ring-1 ring-border/60">
        <div className="h-3 w-16 rounded shimmer" />
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-lg shimmer" />
          <div className="h-3 w-20 rounded shimmer" />
        </div>
        <div className="h-3 w-24 rounded shimmer" />
        <div className="hidden md:block h-3 w-16 rounded shimmer" />
        <div className="hidden lg:block h-5 w-16 rounded-md shimmer" />
        <div className="hidden xl:block h-3 w-20 rounded shimmer" />
        <div className="hidden xl:block h-3 w-14 rounded shimmer" />
        <div className="hidden lg:block h-5 w-16 rounded-md shimmer" />
        <div className="hidden 2xl:block h-3 w-20 rounded shimmer" />
        <div className="hidden 2xl:block h-3 w-24 rounded shimmer" />
        <div className="flex justify-end">
          <div className="size-7 rounded-lg shimmer" />
        </div>
      </div>
    </motion.div>
  );
}

/* --- AuditLogCardMobile ------------------------------------ */
/* Mobile-first skeleton placeholder mirroring the row, displayed
   on small screens instead of the wide table. */

export function AuditLogCardMobile({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-10px" }}
    >
      <GlassCard level={1} className="p-4 ring-1 ring-border/60 md:hidden">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded shimmer" />
            <div className="h-2.5 w-3/4 rounded shimmer" />
            <div className="flex gap-2 pt-1">
              <div className="h-4 w-14 rounded-md shimmer" />
              <div className="h-4 w-16 rounded-md shimmer" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="h-2.5 w-20 rounded shimmer" />
              <div className="size-7 rounded-lg shimmer" />
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* --- SecurityEventCard ------------------------------------- */

interface SecurityEventCardProps {
  title: string;
  description: string;
  time: string;
  icon: string;
  accent: Accent;
  severity: Severity;
  index?: number;
  future?: boolean;
}

export function SecurityEventCard({
  title,
  description,
  time,
  icon,
  accent,
  severity,
  index = 0,
  future = false,
}: SecurityEventCardProps) {
  const sevRing: Record<Severity, string> = {
    critical: "ring-rose-brand/25",
    high: "ring-gold/25",
    medium: "ring-purple-brand/20",
    low: "ring-electric/20",
    info: "ring-border/60",
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
      <GlassCard level={2} sheen className={cn("p-4 h-full flex flex-col gap-2 ring-1", sevRing[severity])}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <IconBadge name={icon} accent={accent} size="sm" />
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          </div>
          <SeverityBadge severity={severity} />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground/80 inline-flex items-center gap-1">
            <Clock size={10} /> {time}
          </span>
          {future && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Future</span>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* --- AlertCard --------------------------------------------- */
/* Colored glass alert card by severity. Reused for the Alert
   Center. Variant drives ring + background tint. */

interface AlertCardProps {
  title: string;
  description: string;
  time: string;
  severity: Severity | "maintenance" | "emergency" | "ai";
  icon: string;
  index?: number;
  future?: boolean;
}

export function AlertCard({
  title,
  description,
  time,
  severity,
  icon,
  index = 0,
  future = false,
}: AlertCardProps) {
  const cfg: Record<
    AlertCardProps["severity"],
    { accent: Accent; bg: string; ring: string; badge: "error" | "warning" | "info" | "success" | "default" | "purple" | "cyan"; label: string }
  > = {
    critical: { accent: "rose", bg: "bg-rose-brand/8", ring: "ring-rose-brand/25", badge: "error", label: "Critical" },
    high: { accent: "gold", bg: "bg-gold/10", ring: "ring-gold/25", badge: "warning", label: "High" },
    medium: { accent: "purple", bg: "bg-purple/8", ring: "ring-purple-brand/20", badge: "purple", label: "Medium" },
    low: { accent: "electric", bg: "bg-electric/8", ring: "ring-electric/20", badge: "info", label: "Low" },
    info: { accent: "emerald", bg: "bg-emerald-brand/8", ring: "ring-emerald-brand/20", badge: "success", label: "Info" },
    maintenance: { accent: "cyan", bg: "bg-cyan/8", ring: "ring-cyan-brand/20", badge: "cyan", label: "Maintenance" },
    emergency: { accent: "rose", bg: "bg-rose-brand/12", ring: "ring-rose-brand/35", badge: "error", label: "Emergency" },
    ai: { accent: "purple", bg: "bg-purple/10", ring: "ring-purple-brand/30", badge: "purple", label: "AI" },
  };
  const c = cfg[severity];
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
    >
      <GlassCard level={2} sheen className={cn("p-4 flex items-start gap-3 ring-1", c.bg, c.ring)}>
        <div className="shrink-0">
          <IconBadge name={icon} accent={c.accent} size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
            <StatusBadge variant={c.badge} dot={severity === "critical" || severity === "emergency"} pulse={severity === "critical" || severity === "emergency"}>
              {c.label}
            </StatusBadge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground/80">{time}</span>
            {future && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Future</span>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* --- PermissionCard ---------------------------------------- */

interface PermissionCardProps {
  role: string;
  summary: string;
  accessLevel: string;
  accent: Accent;
  permissions: string[];
  index?: number;
  future?: boolean;
}

export function PermissionCard({
  role,
  summary,
  accessLevel,
  accent,
  permissions,
  index = 0,
  future = false,
}: PermissionCardProps) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className="h-full"
    >
      <GlassCard hover sheen level={2} className="p-5 h-full flex flex-col gap-3 ring-1 ring-border/60">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconBadge name="ShieldCheck" accent={accent} size="md" />
            <div>
              <p className="text-sm font-semibold text-foreground">{role}</p>
              <p className="text-[11px] text-muted-foreground">{accessLevel}</p>
            </div>
          </div>
          {future && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Future</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
        <div className="rounded-xl glass-1 ring-1 ring-border/60 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Permission Summary</p>
          <div className="flex flex-wrap gap-1.5">
            {permissions.map((p) => (
              <span
                key={p}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1",
                  accent === "rose" && "bg-rose-brand/10 text-rose-brand ring-rose-brand/20",
                  accent === "gold" && "bg-gold/10 text-gold ring-gold/25",
                  accent === "emerald" && "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
                  accent === "electric" && "bg-electric/10 text-electric ring-electric/20",
                  accent === "cyan" && "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
                  accent === "purple" && "bg-purple/10 text-purple-brand ring-purple-brand/20",
                  accent === "navy" && "bg-navy/10 text-navy ring-navy/20"
                )}
              >
                <ShieldCheck size={10} /> {p}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
          <div className="rounded-lg glass-1 ring-1 ring-border/60 p-2 relative">
            <Lock size={9} className="absolute top-1.5 right-1.5 text-muted-foreground/50" />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Matrix</p>
            <p className="text-[11px] font-semibold text-muted-foreground">Future</p>
          </div>
          <div className="rounded-lg glass-1 ring-1 ring-border/60 p-2 relative">
            <Lock size={9} className="absolute top-1.5 right-1.5 text-muted-foreground/50" />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Custom Roles</p>
            <p className="text-[11px] font-semibold text-muted-foreground">Future</p>
          </div>
          <div className="rounded-lg glass-1 ring-1 ring-border/60 p-2 relative col-span-2">
            <Lock size={9} className="absolute top-1.5 right-1.5 text-muted-foreground/50" />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Role Assignment</p>
            <p className="text-[11px] font-semibold text-muted-foreground">Future</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* --- AnalyticsTabs ----------------------------------------- */
/* Period-tabbed analytics panel with placeholder charts. */

const ANALYTICS_PERIODS = ["7D", "30D", "90D", "1Y"] as const;
type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export function AnalyticsTabs() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("7D");
  const [hasError, setHasError] = useState(false);

  const data = useMemo(() => {
    const factor = period === "7D" ? 1 : period === "30D" ? 4 : period === "90D" ? 12 : 48;
    return {
      securityEvents: SECURITY_EVENTS_CHART.map((d) => ({ x: d.x, v: d.v })),
      adminActivity: ADMIN_ACTIVITY_CHART.map((d) => ({ x: d.x, v: d.v })),
      loginTrend: LOGIN_TREND_CHART.map((d) => ({ x: d.x, v: d.v })),
      moduleActivity: MODULE_ACTIVITY_CHART.map((d) => ({ x: d.x, v: d.v })),
      factor,
    };
  }, [period]);

  return (
    <WidgetCard
      title="Security Analytics"
      description="Events, activity & trends"
      icon={<Activity size={16} />}
      index={0}
      action={
        <div className="inline-flex items-center rounded-lg glass-2 ring-1 ring-border p-0.5">
          {ANALYTICS_PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                period === p
                  ? "bg-[linear-gradient(120deg,var(--electric),var(--purple-brand))] text-white shadow-[var(--shadow-sm)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      }
    >
      {hasError ? (
        <SecurityModuleUnavailableError />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {/* Security Events — BarChart */}
          <AnalyticsCard title="Security Events" description={`${period} events by day`} iconName="ShieldAlert" accent="rose" index={0}>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.securityEvents} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.65 0.2 20 / 0.2)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                    cursor={{ fill: "oklch(0.65 0.2 20 / 0.08)" }}
                  />
                  <Bar dataKey="v" fill={CHART.rose} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Administrator Activity — BarChart */}
          <AnalyticsCard title="Administrator Activity" description={`${period} actions by module`} iconName="UserCheck" accent="electric" index={1}>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.adminActivity} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.62 0.22 255 / 0.2)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                    cursor={{ fill: "oklch(0.62 0.22 255 / 0.08)" }}
                  />
                  <Bar dataKey="v" fill={CHART.electric} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Login Trend — LineChart */}
          <AnalyticsCard title="Login Trend" description={`${period} administrator logins`} iconName="LogIn" accent="emerald" index={2}>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.loginTrend} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.7 0.17 160 / 0.25)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={CHART.emerald}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: CHART.emerald }}
                    activeDot={{ r: 5, fill: CHART.emerald }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Permission Usage — PieChart */}
          <AnalyticsCard title="Permission Usage" description="Active sessions by role" iconName="KeyRound" accent="purple" index={3}>
            <div className="h-40 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PERMISSION_USAGE_PIE}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={62}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {PERMISSION_USAGE_PIE.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.6 0.22 295 / 0.2)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {PERMISSION_USAGE_PIE.map((c) => (
                <span key={c.name} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: c.color }} />
                  {c.name} {c.value}
                </span>
              ))}
            </div>
          </AnalyticsCard>

          {/* Module Activity — BarChart */}
          <AnalyticsCard title="Module Activity" description={`${period} access by module`} iconName="LayoutGrid" accent="cyan" index={4}>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.moduleActivity} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 256 / 0.12)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 9, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 256)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.99 0.01 240 / 0.92)",
                      border: "1px solid oklch(0.72 0.15 200 / 0.2)",
                      borderRadius: 12,
                      fontSize: 12,
                      backdropFilter: "blur(8px)",
                    }}
                    cursor={{ fill: "oklch(0.72 0.15 200 / 0.08)" }}
                  />
                  <Bar dataKey="v" fill={CHART.cyan} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Future Threat / Fraud / Incident trend — placeholder */}
          <AnalyticsCard title="Future Threat Trend" description="Predictive threat scoring" iconName="BrainCircuit" accent="gold" index={5} action={<span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Future</span>}>
            <div className="grid grid-cols-3 gap-2 h-full content-center">
              {[
                { label: "Threat", value: "—", color: "text-rose-brand" },
                { label: "Fraud", value: "—", color: "text-gold" },
                { label: "Incident", value: "—", color: "text-electric" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl glass-2 p-3 ring-1 ring-border/60 text-center">
                  <Lock size={11} className="mx-auto text-muted-foreground/60 mb-1" />
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
                  <p className={cn("text-base font-bold tabular-nums", m.color)}>{m.value}</p>
                </div>
              ))}
            </div>
          </AnalyticsCard>
        </motion.div>
      )}
    </WidgetCard>
  );
}

/* --- AnalyticsCard (inner) --------------------------------- */

interface AnalyticsCardProps {
  title: string;
  description: string;
  iconName: string;
  accent: Accent;
  index?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function AnalyticsCard({ title, description, iconName, accent, index = 0, action, children }: AnalyticsCardProps) {
  const accentBorder: Record<Accent, string> = {
    electric: "hover:ring-electric/30",
    cyan: "hover:ring-cyan-brand/30",
    purple: "hover:ring-purple-brand/30",
    gold: "hover:ring-gold/30",
    emerald: "hover:ring-emerald-brand/30",
    rose: "hover:ring-rose-brand/30",
    navy: "hover:ring-navy/30",
  };
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="h-full"
    >
      <GlassCard hover sheen level={2} className={cn("p-4 h-full flex flex-col gap-3 ring-1 ring-border transition-all", accentBorder[accent])}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0">
              <IconBadge name={iconName} accent={accent} size="sm" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{description}</p>
            </div>
          </div>
          {action}
        </div>
        <div className="flex-1 min-h-0">{children}</div>
      </GlassCard>
    </motion.div>
  );
}

/* --- Executive Stat Card (status + counter) ---------------- */

interface ExecutiveStatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  accent: Accent;
  trend?: { value: number; positive: boolean };
  index?: number;
  future?: boolean;
  isStatus?: boolean;
  statusLabel?: string;
  statusVariant?: "success" | "warning" | "error" | "info";
}

function ExecutiveStatCard({
  label,
  value,
  prefix,
  suffix,
  icon,
  accent,
  trend,
  index = 0,
  future = false,
  isStatus = false,
  statusLabel,
  statusVariant = "success",
}: ExecutiveStatCardProps) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="h-full"
    >
      <GlassCard hover sheen level={2} className="p-5 h-full flex flex-col gap-3 shadow-[var(--shadow-md)] relative overflow-hidden">
        {future && (
          <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 px-1.5 py-0.5 rounded-md bg-muted/50">
            Future
          </span>
        )}
        <div className="flex items-start justify-between">
          <IconBadge name={icon} accent={accent} size="md" />
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5",
                trend.positive ? "bg-emerald-brand/10 text-emerald-brand" : "bg-rose-brand/10 text-rose-brand"
              )}
            >
              {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.positive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          {isStatus ? (
            <div className="flex items-center gap-2 pt-1">
              <StatusBadge variant={statusVariant} dot pulse>
                {statusLabel}
              </StatusBadge>
            </div>
          ) : (
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              className="text-2xl font-bold text-foreground"
            />
          )}
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* --- Activity Timeline Item -------------------------------- */

interface ActivityTimelineItemProps {
  title: string;
  description: string;
  time: string;
  icon: string;
  accent: Accent;
  badge: string;
  badgeVariant: "info" | "success" | "warning" | "error" | "purple" | "gold" | "cyan";
  index?: number;
  isLast?: boolean;
  future?: boolean;
}

function ActivityTimelineItem({
  title,
  description,
  time,
  icon,
  accent,
  badge,
  badgeVariant,
  index = 0,
  isLast = false,
  future = false,
}: ActivityTimelineItemProps) {
  const dotAccent: Record<Accent, string> = {
    electric: "bg-electric",
    cyan: "bg-cyan-brand",
    purple: "bg-purple-brand",
    gold: "bg-gold",
    emerald: "bg-emerald-brand",
    rose: "bg-rose-brand",
    navy: "bg-navy",
  };
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className="relative pl-10"
    >
      {!isLast && (
        <span className="absolute left-[18px] top-7 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
      )}
      <span className={cn("absolute left-3 top-1.5 size-3.5 rounded-full ring-4 ring-background", dotAccent[accent])} />
      <GlassCard level={1} className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <IconBadge name={icon} accent={accent} size="sm" />
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          </div>
          <StatusBadge variant={badgeVariant}>{badge}</StatusBadge>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/80 inline-flex items-center gap-1">
            <Clock size={10} /> {time}
          </span>
          {future && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Future</span>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Empty / Error states
   ============================================================ */

export function NoSecurityEventsEmpty() {
  return (
    <EmptyState
      icon="ShieldCheck"
      title="No security events recorded"
      description="Live security events will appear here in real time as they occur across the platform."
    />
  );
}

export function NoAuditLogsEmpty() {
  return (
    <EmptyState
      icon="History"
      title="Audit logs are loading"
      description="Administrator audit records are streamed from the audit service. Skeleton placeholders are displayed until the first batch arrives."
    />
  );
}

export function SecurityModuleUnavailableError() {
  return (
    <ErrorState
      icon="ShieldAlert"
      title="Security module unavailable"
      description="The security monitoring service is temporarily unreachable. Please retry in a moment — all data is read-only and no operations were affected."
      variant="warning"
    />
  );
}

/* ============================================================
   Main View
   ============================================================ */

export function CeoSecurityView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Security Operations"
        description="Platform security, audit & monitoring"
        actions={
          <div className="flex items-center gap-2">
            <LootButton variant="glass" size="md" leftIcon={<FileText size={16} />}>
              <span className="hidden sm:inline">Export</span>
            </LootButton>
            <LootButton
              variant="electric"
              size="md"
              loading={refreshing}
              leftIcon={!refreshing ? <RefreshCw size={16} /> : undefined}
              onClick={handleRefresh}
            >
              <span className="hidden sm:inline">Refresh</span>
            </LootButton>
          </div>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6 lg:space-y-8"
      >
        {/* ============ Section 1 — Security Overview ============ */}
        <section aria-label="Security Overview">
          <Grid cols={4}>
            {OVERVIEW_STATS.map((s, i) => (
              <ExecutiveStatCard
                key={s.label}
                label={s.label}
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                icon={s.icon}
                accent={s.accent}
                trend={s.trend}
                index={i}
                future={s.future}
                isStatus={s.isStatus}
                statusLabel={s.statusLabel}
                statusVariant={s.statusVariant}
              />
            ))}
          </Grid>
        </section>

        {/* ============ Section 2 — Security Dashboard ============ */}
        <section aria-label="Security Dashboard">
          <WidgetCard
            title="Security Dashboard"
            description="Live monitoring across platform modules"
            icon={<ShieldCheck size={16} />}
            index={0}
            action={
              <StatusBadge variant="success" dot pulse>
                Live
              </StatusBadge>
            }
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
            >
              {SECURITY_DASHBOARD_TILES.map((t, i) => (
                <MonitoringTile
                  key={t.name}
                  name={t.name}
                  icon={t.icon}
                  accent={t.accent}
                  status={t.status}
                  health={t.health}
                  latency={t.latency}
                  uptime={t.uptime}
                  index={i}
                  future={t.future}
                />
              ))}
            </motion.div>
          </WidgetCard>
        </section>

        {/* ============ Section 3 — Audit Log Center ============ */}
        <section aria-label="Audit Log Center">
          <WidgetCard
            title="Audit Log Center"
            description="Administrator action history · audit trail"
            icon={<History size={16} />}
            index={0}
            action={
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg glass-2 ring-1 ring-border">
                  <Search size={14} className="text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search audit logs…"
                    className="w-40 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                  />
                </div>
                <LootButton variant="glass" size="sm" leftIcon={<Filter size={14} />}>
                  <span className="hidden sm:inline">Filter</span>
                </LootButton>
              </div>
            }
          >
            {/* Desktop table */}
            <div className="hidden md:block">
              {/* Real column headers */}
              <div className="grid grid-cols-[120px_1.4fr_1.4fr_1fr_110px_120px_100px_110px_130px_150px_80px] items-center gap-3 px-4 py-2 mb-2">
                {AUDIT_TABLE_COLUMNS.map((c) => (
                  <div
                    key={c.key}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
                      c.className,
                      c.className?.includes("hidden") && c.className.includes("md:table-cell") && "hidden md:block",
                      c.className?.includes("hidden") && c.className.includes("lg:table-cell") && "hidden lg:block",
                      c.className?.includes("hidden") && c.className.includes("xl:table-cell") && "hidden xl:block",
                      c.className?.includes("hidden") && c.className.includes("2xl:table-cell") && "hidden 2xl:block",
                      c.className?.includes("text-right") && "text-right"
                    )}
                  >
                    {c.label}
                  </div>
                ))}
              </div>
              {/* 10 skeleton rows — no fake audit logs generated */}
              <div className="space-y-2 max-h-[28rem] overflow-y-auto no-scrollbar pr-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <AuditLogRow key={i} index={i} />
                ))}
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3 max-h-[28rem] overflow-y-auto no-scrollbar pr-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <AuditLogCardMobile key={i} index={i} />
              ))}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
              <p className="text-[11px] text-muted-foreground italic">
                Audit log backend is queued for a future milestone — no fake records are generated in this preview.
              </p>
              <div className="flex items-center gap-2">
                <LootButton variant="ghost" size="sm" leftIcon={<Download size={14} />} onClick={() => navigate("ceo-dashboard")}>
                  Export
                </LootButton>
                <LootButton variant="outline" size="sm" leftIcon={<Eye size={14} />} onClick={() => navigate("ceo-users")}>
                  Open Users
                </LootButton>
              </div>
            </div>
          </WidgetCard>
        </section>

        {/* ============ Section 4 — Administrator Activity ============ */}
        <section aria-label="Administrator Activity">
          <WidgetCard
            title="Administrator Activity"
            description="Recent administrator actions timeline"
            icon={<UserCheck size={16} />}
            index={0}
            action={
              <LootButton variant="ghost" size="sm" leftIcon={<Activity size={14} />}>
                Streaming
              </LootButton>
            }
          >
            <div className="max-h-[28rem] overflow-y-auto no-scrollbar pr-1 space-y-3">
              {ADMIN_ACTIVITY.map((a, i) => (
                <ActivityTimelineItem
                  key={a.id}
                  title={a.title}
                  description={a.description}
                  time={a.time}
                  icon={a.icon}
                  accent={a.accent}
                  badge={a.badge}
                  badgeVariant={a.badgeVariant}
                  index={i}
                  isLast={i === ADMIN_ACTIVITY.length - 1}
                  future={a.future}
                />
              ))}
            </div>
          </WidgetCard>
        </section>

        {/* ============ Section 5 — Security Events ============ */}
        <section aria-label="Security Events">
          <WidgetCard
            title="Security Events"
            description="Login, session, permission & future fraud events"
            icon={<ShieldAlert size={16} />}
            index={0}
            action={
              <StatusBadge variant="warning" dot pulse>
                {SECURITY_EVENTS.filter((e) => e.severity === "critical" || e.severity === "high").length} high priority
              </StatusBadge>
            }
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
            >
              {SECURITY_EVENTS.map((e, i) => (
                <SecurityEventCard
                  key={e.id}
                  title={e.title}
                  description={e.description}
                  time={e.time}
                  icon={e.icon}
                  accent={e.accent}
                  severity={e.severity}
                  index={i}
                  future={e.future}
                />
              ))}
            </motion.div>
          </WidgetCard>
        </section>

        {/* ============ Section 6 — Session Monitoring ============ */}
        <section aria-label="Session Monitoring">
          <WidgetCard
            title="Session Monitoring"
            description="Active sessions · devices · fingerprints"
            icon={<Monitor size={16} />}
            index={0}
            action={
              <StatusBadge variant="info" dot>
                No tracking
              </StatusBadge>
            }
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
            >
              {SESSION_CARDS.map((s, i) => (
                <motion.div key={s.id} variants={cardReveal} custom={i} className="h-full">
                  <GlassCard hover sheen level={2} className="p-4 h-full flex flex-col gap-2 ring-1 ring-border/60 relative">
                    {s.future && (
                      <span className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        Fut
                      </span>
                    )}
                    <IconBadge name={s.icon} accent={s.accent} size="sm" />
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">{s.value}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
            <p className="mt-3 text-[11px] text-muted-foreground/80 italic">
              Session monitoring is UI-only in this preview — no device tracking, fingerprinting, or geolocation is performed.
            </p>
          </WidgetCard>
        </section>

        {/* ============ Section 7 — Permission Center ============ */}
        <section aria-label="Permission Center">
          <WidgetCard
            title="Permission Center"
            description="Roles, access levels & future permission matrix"
            icon={<KeyRound size={16} />}
            index={0}
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {PERMISSION_CARDS.map((p, i) => (
                <PermissionCard
                  key={p.id}
                  role={p.role}
                  summary={p.summary}
                  accessLevel={p.accessLevel}
                  accent={p.accent}
                  permissions={p.permissions}
                  index={i}
                  future={p.future}
                />
              ))}
            </motion.div>
          </WidgetCard>
        </section>

        {/* ============ Section 8 — Platform Monitoring ============ */}
        <section aria-label="Platform Monitoring">
          <WidgetCard
            title="Platform Monitoring"
            description="Service status across modules"
            icon={<Server size={16} />}
            index={0}
            action={
              <StatusBadge variant="success" dot pulse>
                Operational
              </StatusBadge>
            }
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
            >
              {PLATFORM_MONITORING.map((m, i) => (
                <PlatformMonitorCard key={m.id} {...m} index={i} />
              ))}
            </motion.div>
          </WidgetCard>
        </section>

        {/* ============ Section 9 — Security Analytics ============ */}
        <section aria-label="Security Analytics">
          <AnalyticsTabs />
        </section>

        {/* ============ Section 10 — Alert Center ============ */}
        <section aria-label="Alert Center">
          <WidgetCard
            title="Alert Center"
            description="Prioritized alerts by severity"
            icon={<AlertTriangle size={16} />}
            index={0}
            action={
              <StatusBadge variant="error" dot pulse>
                {ALERT_CENTER.filter((a) => a.severity === "critical" || a.severity === "emergency").length} critical
              </StatusBadge>
            }
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {ALERT_CENTER.map((a, i) => (
                <AlertCard
                  key={a.id}
                  title={a.title}
                  description={a.description}
                  time={a.time}
                  severity={a.severity}
                  icon={a.icon}
                  index={i}
                  future={a.future}
                />
              ))}
            </motion.div>
          </WidgetCard>
        </section>

        {/* ============ Section 11 — Compliance Center ============ */}
        <section aria-label="Compliance Center">
          <WidgetCard
            title="Compliance Center"
            description="Audit status, policies & future certifications"
            icon={<ShieldCheck size={16} />}
            index={0}
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {COMPLIANCE_CARDS.map((c, i) => (
                <motion.div key={c.id} variants={cardReveal} custom={i} className="h-full">
                  <GlassCard hover sheen level={2} className="p-4 h-full flex flex-col gap-2 ring-1 ring-border/60 relative">
                    {c.future && (
                      <span className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        Fut
                      </span>
                    )}
                    <IconBadge name={c.icon} accent={c.accent} size="md" />
                    <p className="text-sm font-semibold text-foreground">{c.label}</p>
                    <StatusBadge variant={c.variant} dot>
                      {c.status}
                    </StatusBadge>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </WidgetCard>
        </section>

        {/* ============ Section 12 — Security Reports ============ */}
        <section aria-label="Security Reports">
          <WidgetCard
            title="Security Reports"
            description="Executive security report cards"
            icon={<FileText size={16} />}
            index={0}
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
            >
              {SECURITY_REPORTS.map((r, i) => (
                <motion.div key={r.id} variants={cardReveal} custom={i} className="h-full">
                  <GlassCard hover sheen level={2} className="p-4 h-full flex flex-col gap-3 ring-1 ring-border/60 relative">
                    {r.future && (
                      <span className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        Fut
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <IconBadge name={r.icon} accent={r.accent} size="md" />
                      <MoreVertical size={14} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{r.description}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      <LootButton variant="glass" size="sm" leftIcon={<Eye size={12} />} fullWidth>
                        Preview
                      </LootButton>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </WidgetCard>
        </section>

        {/* ============ Section 13 — Export Center ============ */}
        <section aria-label="Export Center">
          <WidgetCard
            title="Export Center"
            description="Download audit & security reports"
            icon={<Download size={16} />}
            index={0}
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
            >
              {EXPORT_TILES.map((x, i) => (
                <motion.div key={x.id} variants={cardReveal} custom={i} className="h-full">
                  <GlassCard hover sheen level={2} className="p-4 h-full flex flex-col gap-2 ring-1 ring-border/60 relative">
                    {x.future && (
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        <Lock size={8} /> Soon
                      </span>
                    )}
                    <IconBadge name={x.icon} accent={x.accent} size="md" />
                    <p className="text-sm font-semibold text-foreground">{x.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{x.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </WidgetCard>
        </section>

        {/* ============ Section 14 — AI Security Assistant ============ */}
        <section aria-label="AI Security Assistant">
          <WidgetCard
            title="AI Security Assistant"
            description="Future threat analysis & smart search"
            icon={<BrainCircuit size={16} />}
            index={0}
            action={
              <StatusBadge variant="purple" dot>
                Coming soon
              </StatusBadge>
            }
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {AI_SECURITY_PANEL.map((ai, i) => (
                <motion.div key={ai.id} variants={cardReveal} custom={i} className="h-full">
                  <GlassCard hover sheen level={2} className="p-4 h-full flex flex-col gap-2 ring-1 ring-purple-brand/20 relative">
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">
                      <Lock size={8} /> Soon
                    </span>
                    <IconBadge name={ai.icon} accent={ai.accent} size="md" />
                    <p className="text-sm font-semibold text-foreground">{ai.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{ai.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            {/* Styled chat-like input (display only) */}
            <div className="mt-4 rounded-2xl glass-1 ring-1 ring-border/60 p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-xl bg-[linear-gradient(120deg,var(--purple-brand),var(--electric))] flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">AI Security Assistant</p>
                  <p className="text-[10px] text-muted-foreground">Display only · not connected to a model</p>
                </div>
                <Lock size={12} className="text-muted-foreground/60" />
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2">
                  <div className="size-6 rounded-md bg-muted/60 flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                    You
                  </div>
                  <div className="rounded-xl glass-2 ring-1 ring-border/60 px-3 py-2 text-[11px] text-muted-foreground italic max-w-[80%]">
                    Summarize today's critical security events.
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="rounded-xl bg-[linear-gradient(120deg,var(--electric),var(--purple-brand))] px-3 py-2 text-[11px] text-white max-w-[80%]">
                    AI assistant is a future capability. Live threat summaries, log analysis, and smart search will be available here.
                  </div>
                  <div className="size-6 rounded-md bg-[linear-gradient(120deg,var(--purple-brand),var(--electric))] flex items-center justify-center text-white shrink-0">
                    <Sparkles size={10} />
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  placeholder="Ask the AI security assistant…"
                  className="w-full h-11 pl-4 pr-24 rounded-xl glass-2 ring-1 ring-border text-sm text-foreground placeholder:text-muted-foreground/70 cursor-not-allowed"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 px-2 py-1 rounded-md bg-muted/40">
                    <Lock size={9} /> Soon
                  </span>
                  <button
                    type="button"
                    disabled
                    className="size-8 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground/60 cursor-not-allowed"
                    aria-label="Send (coming soon)"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </WidgetCard>
        </section>

        {/* ============ Section 15 — Empty / Error state preview ============ */}
        <section aria-label="State previews">
          <SectionHeader
            title="State Previews"
            description="Reusable empty & error states for security modules"
            icon={<Sparkles size={16} />}
          />
          <Grid cols={3}>
            <WidgetCard title="No Security Events" description="Empty state" index={0}>
              <NoSecurityEventsEmpty />
            </WidgetCard>
            <WidgetCard title="No Audit Logs" description="Empty state" index={1}>
              <NoAuditLogsEmpty />
            </WidgetCard>
            <WidgetCard title="Module Unavailable" description="Error state" index={2}>
              <SecurityModuleUnavailableError />
            </WidgetCard>
          </Grid>
        </section>

        {/* ============ Footer navigation ============ */}
        <section aria-label="Quick navigation">
          <GlassCard level={1} sheen className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <IconBadge name="ShieldCheck" accent="emerald" size="md" />
              <div>
                <p className="text-sm font-semibold text-foreground">Security Operations Center</p>
                <p className="text-xs text-muted-foreground">Jump to related executive modules</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LootButton variant="glass" size="sm" leftIcon={<Activity size={14} />} onClick={() => navigate("ceo-dashboard")}>
                Dashboard
              </LootButton>
              <LootButton variant="outline" size="sm" leftIcon={<Users size={14} />} onClick={() => navigate("ceo-users")}>
                User Management
              </LootButton>
            </div>
          </GlassCard>
        </section>
      </motion.div>
    </PageContainer>
  );
}

/* ============================================================
   PlatformMonitorCard (inline helper — not exported)
   ============================================================ */

interface PlatformMonitorCardProps {
  id: string;
  name: string;
  icon: string;
  accent: Accent;
  status: HealthState;
  future?: boolean;
  index?: number;
}

function PlatformMonitorCard({ name, icon, accent, status, future, index = 0 }: PlatformMonitorCardProps) {
  const statusCfg: Record<HealthState, { dot: string; ring: string; badge: "success" | "warning" | "info"; label: string }> = {
    operational: { dot: "bg-emerald-brand", ring: "ring-emerald-brand/20", badge: "success", label: "Operational" },
    degraded: { dot: "bg-gold", ring: "ring-gold/25", badge: "warning", label: "Degraded" },
    maintenance: { dot: "bg-electric", ring: "ring-electric/20", badge: "info", label: "Maintenance" },
  };
  const cfg = statusCfg[status];
  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }} className="h-full">
      <GlassCard hover sheen level={2} className={cn("p-4 h-full flex flex-col gap-2 ring-1", cfg.ring)}>
        <div className="flex items-center justify-between">
          <IconBadge name={icon} accent={accent} size="sm" />
          {future ? (
            <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">Fut</span>
          ) : (
            <MoreVertical size={14} className="text-muted-foreground" />
          )}
        </div>
        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
        <div className="flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", cfg.dot)} />
          <StatusBadge variant={cfg.badge}>{cfg.label}</StatusBadge>
        </div>
      </GlassCard>
    </motion.div>
  );
}
