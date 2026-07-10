"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  LifeBuoy,
  Ticket,
  MessageSquare,
  Bug,
  Lightbulb,
  Mail,
  Phone,
  MessageCircle,
  ShieldAlert,
  FileText,
  BookOpen,
  HelpCircle,
  Plus,
  Send,
  Paperclip,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertTriangle,
  Inbox,
  Bell,
  Settings,
  User,
  Search,
  Filter,
  ArrowRight,
  ArrowUpRight,
  Star,
  ThumbsUp,
  Globe,
  Tag,
  Flag,
  ShieldCheck,
  KeyRound,
  UserCheck,
  Users,
  ScrollText,
  Server,
  RefreshCw,
  Smile,
  Frown,
  Meh,
  Heart,
  Activity,
  TrendingUp,
  AlertCircle,
  Info,
  Headphones,
  BookMarked,
  Rocket,
  Hourglass,
  CircleDot,
  Reply,
  XCircle,
  RotateCcw,
  MessageCircleMore,
  Bot,
  Megaphone,
  Wrench,
  Wallet,
  Gift,
  ShoppingBag,
  Trophy,
  Medal,
  BadgeCheck,
  CreditCard,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  EmptyState,
  ErrorState,
  GlassCard,
  Grid,
  IconBadge,
  LootButton,
  PageContainer,
  PageHeader,
  ProgressRing,
  SkeletonRow,
  StatCard,
  StatusBadge,
  WidgetCard,
} from "@/components/lootloom";
import {
  cardReveal,
  staggerContainer,
} from "@/lib/animations";
import { useNavigationStore, useNotificationStore } from "@/stores";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ============================================================
   Types
   ============================================================ */
type Accent =
  | "electric"
  | "cyan"
  | "purple"
  | "gold"
  | "emerald"
  | "rose"
  | "navy";

type Priority = "low" | "medium" | "high" | "urgent";
type TicketStatus = "open" | "pending" | "resolved" | "closed";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
  locked?: boolean;
  kind:
    | "new-ticket"
    | "contact"
    | "help"
    | "faq"
    | "bug"
    | "feature"
    | "feedback"
    | "community"
    | "security"
    | "abuse"
    | "live-chat"
    | "ai-assistant";
}

interface KnowledgeArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  icon: LucideIcon;
  accent: Accent;
}

interface FaqItem {
  id: string;
  question: string;
  category: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  accent: Accent;
  items: FaqItem[];
}

interface ContactChannel {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
  locked?: boolean;
  badge?: string;
}

interface CommunityRule {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
  future?: boolean;
}

interface SecurityTip {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
  future?: boolean;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
}

interface NotificationPreviewItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
}

interface FeatureRequestCard {
  id: string;
  title: string;
  description: string;
  category: string;
  votes: number;
  status: string;
  accent: Accent;
}

/* ============================================================
   Placeholder Data
   ============================================================ */

const SUPPORT_STATS: {
  label: string;
  value: number;
  icon: string;
  accent: Accent;
  trend?: { positive: boolean; value: number };
  suffix?: string;
  prefix?: string;
  future?: boolean;
}[] = [
  {
    label: "Open Tickets",
    value: 0,
    icon: "Ticket",
    accent: "electric",
    trend: { positive: false, value: 0 },
  },
  {
    label: "Resolved Tickets",
    value: 0,
    icon: "CheckCircle2",
    accent: "emerald",
    trend: { positive: true, value: 0 },
  },
  {
    label: "Pending Replies",
    value: 0,
    icon: "MessageSquare",
    accent: "gold",
  },
  {
    label: "Announcements",
    value: 0,
    icon: "Megaphone",
    accent: "purple",
  },
  {
    label: "Help Articles",
    value: 12,
    icon: "BookOpen",
    accent: "cyan",
  },
  {
    label: "FAQ Entries",
    value: 11,
    icon: "HelpCircle",
    accent: "electric",
  },
  {
    label: "Support Status",
    value: 100,
    icon: "Activity",
    accent: "emerald",
    suffix: "%",
  },
  {
    label: "Avg. Response Time",
    value: 0,
    icon: "Hourglass",
    accent: "rose",
    future: true,
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "new-ticket",
    label: "Open New Ticket",
    description: "Submit a support request",
    icon: Plus,
    accent: "electric",
    kind: "new-ticket",
  },
  {
    id: "contact",
    label: "Contact Support",
    description: "Reach our team directly",
    icon: Headphones,
    accent: "cyan",
    kind: "contact",
  },
  {
    id: "help",
    label: "Help Center",
    description: "Browse knowledge base",
    icon: BookOpen,
    accent: "purple",
    kind: "help",
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Quick answers",
    icon: HelpCircle,
    accent: "gold",
    kind: "faq",
  },
  {
    id: "bug",
    label: "Bug Report",
    description: "Report an issue",
    icon: Bug,
    accent: "rose",
    kind: "bug",
  },
  {
    id: "feature",
    label: "Feature Request",
    description: "Suggest an idea",
    icon: Lightbulb,
    accent: "emerald",
    kind: "feature",
  },
  {
    id: "feedback",
    label: "Feedback",
    description: "Share your thoughts",
    icon: MessageSquare,
    accent: "electric",
    kind: "feedback",
  },
  {
    id: "community",
    label: "Community Guidelines",
    description: "Rules of conduct",
    icon: Users,
    accent: "cyan",
    kind: "community",
  },
  {
    id: "security",
    label: "Security Center",
    description: "Protect your account",
    icon: ShieldCheck,
    accent: "purple",
    kind: "security",
  },
  {
    id: "abuse",
    label: "Report Abuse",
    description: "Flag inappropriate behavior",
    icon: Flag,
    accent: "rose",
    kind: "abuse",
  },
  {
    id: "live-chat",
    label: "Live Chat",
    description: "Coming soon",
    icon: MessageCircle,
    accent: "gold",
    locked: true,
    kind: "live-chat",
  },
  {
    id: "ai-assistant",
    label: "AI Assistant",
    description: "Coming soon",
    icon: Bot,
    accent: "emerald",
    locked: true,
    kind: "ai-assistant",
  },
];

const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Set up your account, claim your first coins, and explore LootLoom basics.",
    category: "Onboarding",
    readingTime: "5 min read",
    icon: Rocket,
    accent: "electric",
  },
  {
    id: "account",
    title: "Account Management",
    description: "Profile, login, password reset, email verification and account recovery.",
    category: "Account",
    readingTime: "4 min read",
    icon: UserCheck,
    accent: "cyan",
  },
  {
    id: "wallet",
    title: "Wallet & Coins",
    description: "Understanding balances, pending coins, lifetime earnings and transactions.",
    category: "Wallet",
    readingTime: "6 min read",
    icon: Wallet,
    accent: "purple",
  },
  {
    id: "rewards",
    title: "Rewards Catalog",
    description: "Browse reward categories, featured offers and availability statuses.",
    category: "Rewards",
    readingTime: "5 min read",
    icon: Gift,
    accent: "gold",
  },
  {
    id: "redeem",
    title: "Redeem Process",
    description: "Step-by-step guide to redeeming coins for UPI, gift cards and more.",
    category: "Redeem",
    readingTime: "7 min read",
    icon: ShoppingBag,
    accent: "emerald",
  },
  {
    id: "referral",
    title: "Referral Program",
    description: "Invite friends, share your code and earn referral bonuses.",
    category: "Referral",
    readingTime: "4 min read",
    icon: Users,
    accent: "electric",
  },
  {
    id: "leaderboard",
    title: "Leaderboard & Ranks",
    description: "How rankings work, weekly resets and top-earner milestones.",
    category: "Gamification",
    readingTime: "5 min read",
    icon: Trophy,
    accent: "gold",
  },
  {
    id: "achievements",
    title: "Achievements",
    description: "Unlock badges, complete missions and progress through levels.",
    category: "Gamification",
    readingTime: "6 min read",
    icon: Medal,
    accent: "purple",
  },
  {
    id: "security",
    title: "Security Best Practices",
    description: "Strong passwords, 2FA, scam awareness and account protection.",
    category: "Security",
    readingTime: "8 min read",
    icon: ShieldCheck,
    accent: "rose",
  },
  {
    id: "privacy",
    title: "Privacy & Data",
    description: "What data we collect, how it is used and your privacy controls.",
    category: "Privacy",
    readingTime: "6 min read",
    icon: Lock,
    accent: "cyan",
  },
  {
    id: "technical",
    title: "Technical Issues",
    description: "Troubleshoot loading, ad playback, payout delays and app crashes.",
    category: "Technical",
    readingTime: "7 min read",
    icon: Wrench,
    accent: "emerald",
  },
  {
    id: "general",
    title: "General Questions",
    description: "Platform availability, eligibility, supported regions and more.",
    category: "General",
    readingTime: "5 min read",
    icon: HelpCircle,
    accent: "electric",
  },
];

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "general",
    label: "General",
    icon: HelpCircle,
    accent: "electric",
    items: [
      { id: "g1", question: "How do I earn coins on LootLoom?", category: "General" },
      { id: "g2", question: "Is LootLoom free to use?", category: "General" },
      { id: "g3", question: "Which countries are supported?", category: "General" },
    ],
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    accent: "purple",
    items: [
      { id: "w1", question: "Why are my coins pending?", category: "Wallet" },
      { id: "w2", question: "How long do coins take to become available?", category: "Wallet" },
    ],
  },
  {
    id: "rewards",
    label: "Rewards",
    icon: Gift,
    accent: "gold",
    items: [
      { id: "r1", question: "How often is the rewards catalog updated?", category: "Rewards" },
      { id: "r2", question: "Are rewards available in my region?", category: "Rewards" },
    ],
  },
  {
    id: "redeem",
    label: "Redeem",
    icon: ShoppingBag,
    accent: "emerald",
    items: [
      { id: "rd1", question: "What is the minimum redeem amount?", category: "Redeem" },
      { id: "rd2", question: "How long do redemptions take to process?", category: "Redeem" },
      { id: "rd3", question: "Why was my redemption rejected?", category: "Redeem" },
    ],
  },
  {
    id: "account",
    label: "Account",
    icon: UserCheck,
    accent: "cyan",
    items: [
      { id: "a1", question: "How do I reset my password?", category: "Account" },
      { id: "a2", question: "Can I change my username?", category: "Account" },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    accent: "rose",
    items: [
      { id: "s1", question: "How do I enable two-factor authentication?", category: "Security" },
      { id: "s2", question: "What should I do if I suspect unauthorized access?", category: "Security" },
    ],
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: Lock,
    accent: "purple",
    items: [
      { id: "p1", question: "What data does LootLoom collect?", category: "Privacy" },
      { id: "p2", question: "How can I request data deletion?", category: "Privacy" },
    ],
  },
  {
    id: "technical",
    label: "Technical",
    icon: Wrench,
    accent: "emerald",
    items: [
      { id: "t1", question: "Why are rewarded ads not loading?", category: "Technical" },
      { id: "t2", question: "The app keeps crashing — what should I do?", category: "Technical" },
    ],
  },
  {
    id: "future-ads",
    label: "Advertisements (Future)",
    icon: Megaphone,
    accent: "gold",
    items: [
      { id: "fa1", question: "Will LootLoom offer premium ad placements?", category: "Future" },
    ],
  },
  {
    id: "future-payments",
    label: "Payments (Future)",
    icon: CreditCard,
    accent: "electric",
    items: [
      { id: "fp1", question: "Will LootLoom support international payouts?", category: "Future" },
      { id: "fp2", question: "Will crypto redemptions be supported?", category: "Future" },
    ],
  },
  {
    id: "future-referral",
    label: "Referral (Future)",
    icon: Users,
    accent: "cyan",
    items: [
      { id: "fr1", question: "Will referral tiers be introduced?", category: "Future" },
    ],
  },
];

const TICKET_TABLE_COLUMNS = [
  "Ticket ID",
  "Category",
  "Priority",
  "Status",
  "Created",
  "Last Updated",
  "Assigned To",
  "Actions",
] as const;

const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: "email",
    label: "Support Email",
    value: "support@lootloom.app",
    description: "Send us a detailed message — replies typically within 24 hours.",
    icon: Mail,
    accent: "electric",
    badge: "Placeholder",
  },
  {
    id: "portal",
    label: "Support Portal",
    value: "Help Desk",
    description: "Open and track your tickets from the Support Ticket Center above.",
    icon: Ticket,
    accent: "cyan",
  },
  {
    id: "discord",
    label: "Discord Community",
    value: "discord.gg/lootloom",
    description: "Join the community, share tips, and get help from fellow members.",
    icon: MessageCircle,
    accent: "purple",
    badge: "Placeholder",
  },
  {
    id: "telegram",
    label: "Telegram Channel",
    value: "@lootloomofficial",
    description: "Announcements, updates and quick community chat.",
    icon: Send,
    accent: "cyan",
    badge: "Placeholder",
  },
  {
    id: "phone",
    label: "Phone Support",
    value: "Coming soon",
    description: "Direct phone support will be available in a future release.",
    icon: Phone,
    accent: "gold",
    locked: true,
  },
  {
    id: "live-chat",
    label: "Live Chat",
    value: "Coming soon",
    description: "Real-time chat with a support agent — currently in development.",
    icon: MessageCircleMore,
    accent: "emerald",
    locked: true,
  },
  {
    id: "social",
    label: "Social Support",
    value: "Coming soon",
    description: "Reach us on Twitter, Instagram and other social platforms.",
    icon: Globe,
    accent: "rose",
    locked: true,
  },
];

const COMMUNITY_RULES: CommunityRule[] = [
  {
    id: "respect",
    title: "Respectful Behaviour",
    description: "Treat all members, moderators and staff with courtesy. Harassment, hate speech and personal attacks are not tolerated.",
    icon: Heart,
    accent: "rose",
  },
  {
    id: "account-safety",
    title: "Account Safety",
    description: "Never share your password, OTP or 2FA codes. LootLoom staff will never ask for these.",
    icon: KeyRound,
    accent: "purple",
  },
  {
    id: "reward-rules",
    title: "Reward Rules",
    description: "Earn coins fairly. Use of automated tools, multi-accounting or fraudulent activity will result in bans.",
    icon: Gift,
    accent: "gold",
  },
  {
    id: "platform-rules",
    title: "Platform Rules",
    description: "Follow all LootLoom terms of service. Misuse of features or exploits is prohibited.",
    icon: ScrollText,
    accent: "electric",
  },
  {
    id: "reporting",
    title: "Reporting Abuse",
    description: "Use the Report Abuse action to flag suspicious users, scams or inappropriate content.",
    icon: Flag,
    accent: "emerald",
  },
  {
    id: "full-guidelines",
    title: "Full Guidelines",
    description: "A complete community guidelines document will be published in a future update.",
    icon: BookMarked,
    accent: "cyan",
    future: true,
  },
];

const SECURITY_TIPS: SecurityTip[] = [
  {
    id: "account-protection",
    title: "Account Protection",
    description: "Use a unique, strong password. Enable 2FA. Review active sessions regularly.",
    icon: ShieldCheck,
    accent: "emerald",
  },
  {
    id: "password-tips",
    title: "Password Tips",
    description: "Combine upper/lowercase letters, numbers and symbols. Never reuse passwords across services.",
    icon: KeyRound,
    accent: "electric",
  },
  {
    id: "verification",
    title: "Verification Guide",
    description: "Verify your email and phone. Verified accounts unlock higher daily limits and faster redemptions.",
    icon: BadgeCheck,
    accent: "cyan",
  },
  {
    id: "scam-awareness",
    title: "Scam Awareness",
    description: "Be wary of offers that seem too good to be true. LootLoom will never ask for payment to redeem rewards.",
    icon: AlertTriangle,
    accent: "gold",
  },
  {
    id: "report-suspicious",
    title: "Reporting Suspicious Activity",
    description: "If something feels off — unusual login, suspicious DM, fake staff — report it immediately via Report Abuse.",
    icon: ShieldAlert,
    accent: "rose",
  },
  {
    id: "recovery",
    title: "Recovery Guide",
    description: "A step-by-step account recovery flow is being prepared for future release.",
    icon: LifeBuoy,
    accent: "purple",
    future: true,
  },
];

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "created",
    title: "Ticket Created",
    description: "Your support request has been received and queued for review.",
    icon: Plus,
    accent: "electric",
  },
  {
    id: "replied",
    title: "Support Reply",
    description: "A support agent has reviewed your ticket and responded.",
    icon: Reply,
    accent: "cyan",
  },
  {
    id: "pending-review",
    title: "Pending Review",
    description: "Awaiting your reply or additional information from you.",
    icon: Hourglass,
    accent: "gold",
  },
  {
    id: "resolved",
    title: "Resolved",
    description: "The issue has been marked as resolved by the support team.",
    icon: CheckCircle2,
    accent: "emerald",
  },
  {
    id: "closed",
    title: "Closed",
    description: "The ticket has been closed. You may reopen within 7 days.",
    icon: XCircle,
    accent: "rose",
  },
  {
    id: "reopened",
    title: "Reopened",
    description: "You reopened the ticket for further assistance.",
    icon: RotateCcw,
    accent: "purple",
  },
  {
    id: "admin-message",
    title: "Administrator Message",
    description: "A platform administrator has left an official note on this ticket.",
    icon: ShieldAlert,
    accent: "navy",
  },
];

const NOTIFICATION_PREVIEW: NotificationPreviewItem[] = [
  {
    id: "support-replies",
    label: "Support Replies",
    description: "Replies from the support team on your tickets.",
    icon: Reply,
    accent: "electric",
  },
  {
    id: "system-messages",
    label: "System Messages",
    description: "Platform-wide notices and feature announcements.",
    icon: Server,
    accent: "purple",
  },
  {
    id: "maintenance",
    label: "Maintenance Notices",
    description: "Scheduled downtime and post-maintenance updates.",
    icon: Wrench,
    accent: "gold",
  },
  {
    id: "security-alerts",
    label: "Security Alerts",
    description: "Login warnings, password changes and 2FA events.",
    icon: ShieldAlert,
    accent: "rose",
  },
  {
    id: "live-updates",
    label: "Live Updates",
    description: "Real-time ticket status updates — coming soon.",
    icon: Activity,
    accent: "cyan",
  },
];

const FEATURE_REQUEST_CARDS: FeatureRequestCard[] = [
  {
    id: "fr-crypto",
    title: "Crypto Redemptions",
    description: "Allow members to redeem coins for popular cryptocurrencies.",
    category: "Redeem",
    votes: 0,
    status: "Planned",
    accent: "electric",
  },
  {
    id: "fr-international",
    title: "International Payouts",
    description: "Support payouts to bank accounts outside the current supported regions.",
    category: "Wallet",
    votes: 0,
    status: "Under Review",
    accent: "cyan",
  },
  {
    id: "fr-dark-stats",
    title: "Detailed Earning Analytics",
    description: "Granular charts for daily, weekly and category-level earnings.",
    category: "Analytics",
    votes: 0,
    status: "Planned",
    accent: "purple",
  },
  {
    id: "fr-api",
    title: "Public Developer API",
    description: "An official API for community-built tools and integrations.",
    category: "Developer",
    votes: 0,
    status: "Future",
    accent: "gold",
  },
];

const ANALYTICS_OPEN_TICKETS = [
  { name: "Mon", value: 0 },
  { name: "Tue", value: 0 },
  { name: "Wed", value: 0 },
  { name: "Thu", value: 0 },
  { name: "Fri", value: 0 },
  { name: "Sat", value: 0 },
  { name: "Sun", value: 0 },
];

const ANALYTICS_RESOLUTION = [
  { name: "Open", value: 0, color: "oklch(0.62 0.22 255)" },
  { name: "Pending", value: 0, color: "oklch(0.8 0.16 85)" },
  { name: "Resolved", value: 0, color: "oklch(0.7 0.17 160)" },
  { name: "Closed", value: 0, color: "oklch(0.65 0.05 270)" },
];

const ANALYTICS_CATEGORIES = [
  { name: "Wallet", value: 0 },
  { name: "Redeem", value: 0 },
  { name: "Account", value: 0 },
  { name: "Security", value: 0 },
  { name: "Technical", value: 0 },
  { name: "Rewards", value: 0 },
];

const ANALYTICS_PRIORITY = [
  { name: "Low", value: 0, color: "oklch(0.7 0.17 160)" },
  { name: "Medium", value: 0, color: "oklch(0.72 0.15 200)" },
  { name: "High", value: 0, color: "oklch(0.8 0.16 85)" },
  { name: "Urgent", value: 0, color: "oklch(0.65 0.22 25)" },
];

const TICKET_CATEGORIES = [
  "General Inquiry",
  "Account Issue",
  "Wallet & Coins",
  "Redeem Request",
  "Rewards Catalog",
  "Security Concern",
  "Technical Bug",
  "Feedback",
] as const;

const TICKET_PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const BUG_CATEGORIES = [
  "App Crash",
  "Login Issue",
  "Ad Playback",
  "Redeem Failure",
  "UI / Visual Glitch",
  "Performance",
  "Other",
] as const;

const FEATURE_CATEGORIES = [
  "Wallet",
  "Redeem",
  "Rewards",
  "Analytics",
  "Security",
  "Developer",
  "Other",
] as const;

/* ============================================================
   Helpers — Accent → classes
   ============================================================ */
const accentText: Record<Accent, string> = {
  electric: "text-electric",
  cyan: "text-cyan-brand",
  purple: "text-purple-brand",
  gold: "text-gold",
  emerald: "text-emerald-brand",
  rose: "text-rose-brand",
  navy: "text-navy",
};

const accentBgSoft: Record<Accent, string> = {
  electric: "bg-electric/10",
  cyan: "bg-cyan/10",
  purple: "bg-purple/10",
  gold: "bg-gold/15",
  emerald: "bg-emerald-brand/10",
  rose: "bg-rose-brand/10",
  navy: "bg-navy/10",
};

const accentRing: Record<Accent, string> = {
  electric: "ring-electric/20",
  cyan: "ring-cyan-brand/20",
  purple: "ring-purple-brand/20",
  gold: "ring-gold/25",
  emerald: "ring-emerald-brand/20",
  rose: "ring-rose-brand/20",
  navy: "ring-navy/20",
};

const priorityBadge: Record<Priority, { label: string; variant: "default" | "info" | "warning" | "error" }> = {
  low: { label: "Low", variant: "default" },
  medium: { label: "Medium", variant: "info" },
  high: { label: "High", variant: "warning" },
  urgent: { label: "Urgent", variant: "error" },
};

/* ============================================================
   Reusable — New Ticket Dialog
   ============================================================ */
interface NewTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function NewTicketDialog({ open, onOpenChange }: NewTicketDialogProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [description, setDescription] = useState("");

  const handleSaveDraft = () => {
    // Draft persistence is a future enhancement — no-op for now.
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-electric/10 text-electric ring-1 ring-electric/20">
              <Plus size={16} />
            </span>
            Open a New Support Ticket
          </DialogTitle>
          <DialogDescription>
            Fill in the details below. This form is a placeholder — ticket submission
            will be enabled in a future update.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe your issue"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in as much detail as possible…"
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Tip: include steps to reproduce, expected vs actual behaviour, and screenshots.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Screenshot</label>
              <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground text-xs">
                <div className="flex flex-col items-center gap-1">
                  <Paperclip size={16} />
                  <span>Screenshot placeholder</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Attachments</label>
              <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground text-xs">
                <div className="flex flex-col items-center gap-1">
                  <Paperclip size={16} />
                  <span>Attachment placeholder</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-electric/5 ring-1 ring-electric/15 p-3 text-xs text-muted-foreground">
            <Lock size={14} className="text-electric shrink-0" />
            File uploads and ticket submission are coming in a future release.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <LootButton variant="ghost" size="md" onClick={() => onOpenChange(false)}>
            Cancel
          </LootButton>
          <LootButton variant="glass" size="md" leftIcon={<FileText size={14} />} onClick={handleSaveDraft}>
            Save Draft
          </LootButton>
          <LootButton
            variant="electric"
            size="md"
            leftIcon={<Send size={14} />}
            disabled
          >
            Submit Ticket
          </LootButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Reusable — Ticket Row (desktop) + Mobile Card
   ============================================================ */
function TicketRow() {
  return (
    <GlassCard level={1} className="p-4 hover:ring-1 hover:ring-electric/20 transition-all">
      <div className="grid grid-cols-12 gap-3 items-center">
        <div className="col-span-2">
          <div className="h-3 w-20 rounded shimmer mb-2" />
          <div className="h-2.5 w-14 rounded shimmer" />
        </div>
        <div className="col-span-2">
          <div className="h-5 w-20 rounded-md shimmer" />
        </div>
        <div className="col-span-1">
          <div className="h-5 w-14 rounded-full shimmer" />
        </div>
        <div className="col-span-1">
          <div className="h-5 w-16 rounded-full shimmer" />
        </div>
        <div className="col-span-2">
          <div className="h-3 w-20 rounded shimmer" />
        </div>
        <div className="col-span-1">
          <div className="h-3 w-14 rounded shimmer" />
        </div>
        <div className="col-span-1">
          <div className="size-7 rounded-full shimmer" />
        </div>
        <div className="col-span-2 flex justify-end gap-1">
          <div className="size-7 rounded-md shimmer" />
          <div className="size-7 rounded-md shimmer" />
          <div className="size-7 rounded-md shimmer" />
        </div>
      </div>
    </GlassCard>
  );
}

function TicketCardMobile() {
  return (
    <GlassCard level={1} className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3 w-24 rounded shimmer" />
          <div className="h-2.5 w-16 rounded shimmer" />
        </div>
        <div className="size-8 rounded-xl shimmer" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 w-20 rounded-md shimmer" />
        <div className="h-5 w-14 rounded-full shimmer" />
        <div className="h-5 w-16 rounded-full shimmer" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-24 rounded shimmer" />
        <div className="h-2.5 w-16 rounded shimmer" />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <div className="size-7 rounded-md shimmer" />
        <div className="size-7 rounded-md shimmer" />
        <div className="size-7 rounded-md shimmer" />
        <div className="size-7 rounded-md shimmer" />
      </div>
    </GlassCard>
  );
}

/* ============================================================
   Reusable — Knowledge Card
   ============================================================ */
function KnowledgeCard({ article, index }: { article: KnowledgeArticle; index: number }) {
  const Icon = article.icon;
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <GlassCard
        level={2}
        hover
        sheen
        className="p-5 h-full flex flex-col gap-3 group cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-xl ring-1",
              accentBgSoft[article.accent],
              accentText[article.accent],
              accentRing[article.accent]
            )}
          >
            <Icon size={22} />
          </div>
          <StatusBadge variant="default">{article.category}</StatusBadge>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-foreground">{article.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
        </div>
        <div className="flex items-center justify-between pt-2 mt-auto">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            {article.readingTime}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-electric group-hover:gap-1.5 transition-all">
            Read More
            <ArrowRight size={12} />
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Reusable — FAQ Accordion
   ============================================================ */
function FaqAccordion({ category }: { category: FaqCategory }) {
  const Icon = category.icon;
  return (
    <GlassCard level={2} className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-lg ring-1",
            accentBgSoft[category.accent],
            accentText[category.accent],
            accentRing[category.accent]
          )}
        >
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{category.label}</h3>
          <p className="text-xs text-muted-foreground">{category.items.length} questions</p>
        </div>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {category.items.map((item) => (
          <AccordionItem key={item.id} value={item.id} className="border-border/60">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              This answer will be provided once the FAQ content is finalized.
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-electric">
                <Info size={12} />
                Placeholder content
              </span>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </GlassCard>
  );
}

/* ============================================================
   Reusable — Contact Card
   ============================================================ */
function ContactCard({ channel, index }: { channel: ContactChannel; index: number }) {
  const Icon = channel.icon;
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <GlassCard
        level={2}
        hover={!channel.locked}
        sheen
        className={cn(
          "p-5 h-full flex flex-col gap-3",
          channel.locked && "opacity-70"
        )}
      >
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-xl ring-1",
              accentBgSoft[channel.accent],
              accentText[channel.accent],
              accentRing[channel.accent]
            )}
          >
            <Icon size={22} />
          </div>
          {channel.locked ? (
            <StatusBadge variant="gold" dot pulse>
              <Lock size={10} /> Soon
            </StatusBadge>
          ) : channel.badge ? (
            <StatusBadge variant="default">{channel.badge}</StatusBadge>
          ) : (
            <StatusBadge variant="success" dot pulse>
              Active
            </StatusBadge>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{channel.label}</h3>
          <p className={cn("text-sm font-medium", accentText[channel.accent])}>{channel.value}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{channel.description}</p>
        </div>
        <div className="mt-auto pt-2">
          <LootButton
            variant="outline"
            size="sm"
            fullWidth
            disabled={channel.locked}
            rightIcon={channel.locked ? <Lock size={12} /> : <ArrowUpRight size={12} />}
          >
            {channel.locked ? "Coming Soon" : "Open Channel"}
          </LootButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Reusable — Bug Report Form
   ============================================================ */
function BugReportForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [device, setDevice] = useState<string>("");
  const [browser, setBrowser] = useState<string>("");
  const [description, setDescription] = useState("");

  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Bug Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Redeem button unresponsive"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {BUG_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Device</label>
          <Select value={device} onValueChange={setDevice}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Browser / App</label>
          <Select value={browser} onValueChange={setBrowser}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select browser" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chrome">Chrome</SelectItem>
              <SelectItem value="safari">Safari</SelectItem>
              <SelectItem value="firefox">Firefox</SelectItem>
              <SelectItem value="edge">Edge</SelectItem>
              <SelectItem value="app">LootLoom App</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what happened, what you expected, and steps to reproduce…"
          rows={5}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Screenshot</label>
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground text-xs">
            <div className="flex flex-col items-center gap-1">
              <Paperclip size={16} />
              <span>Screenshot placeholder</span>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Diagnostic Logs</label>
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground text-xs gap-2">
            <Lock size={14} className="text-electric" />
            <span>Log collection — coming soon</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-rose-brand/5 ring-1 ring-rose-brand/15 p-3 text-xs text-muted-foreground">
        <ShieldAlert size={14} className="text-rose-brand shrink-0" />
        Bug reports are not yet submitted. This form is a placeholder for future integration.
      </div>

      <div className="flex justify-end gap-2">
        <LootButton variant="ghost" size="md">
          Clear
        </LootButton>
        <LootButton variant="electric" size="md" leftIcon={<Send size={14} />} disabled>
          Submit Bug Report
        </LootButton>
      </div>
    </div>
  );
}

/* ============================================================
   Reusable — Feature Request Form
   ============================================================ */
function FeatureRequestForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [description, setDescription] = useState("");

  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Feature Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly earnings leaderboard widget"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {FEATURE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Priority</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {TICKET_PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Future Voting</label>
          <div className="flex h-9 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-muted-foreground text-xs gap-2">
            <Lock size={12} className="text-electric" />
            Community voting — coming soon
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your feature idea and the problem it solves…"
          rows={5}
        />
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-emerald-brand/5 ring-1 ring-emerald-brand/15 p-3 text-xs text-muted-foreground">
        <Lightbulb size={14} className="text-emerald-brand shrink-0" />
        Feature requests are not yet submitted. This form is a placeholder for future integration.
      </div>

      <div className="flex justify-end gap-2">
        <LootButton variant="ghost" size="md">
          Clear
        </LootButton>
        <LootButton variant="emerald" size="md" leftIcon={<Send size={14} />} disabled>
          Submit Feature Request
        </LootButton>
      </div>
    </div>
  );
}

/* ============================================================
   Reusable — Feedback Widget
   ============================================================ */
function FeedbackWidget() {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [mood, setMood] = useState<"happy" | "neutral" | "sad" | null>(null);
  const [comments, setComments] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const moods: { id: "happy" | "neutral" | "sad"; icon: LucideIcon; label: string; accent: Accent }[] = [
    { id: "happy", icon: Smile, label: "Happy", accent: "emerald" },
    { id: "neutral", icon: Meh, label: "Neutral", accent: "gold" },
    { id: "sad", icon: Frown, label: "Unhappy", accent: "rose" },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Star rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Rate your experience</label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="p-1"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  size={28}
                  className={cn(
                    "transition-colors",
                    (hover || rating) >= star
                      ? "text-gold fill-gold"
                      : "text-muted-foreground/40"
                  )}
                />
              </motion.button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-semibold text-foreground">
                {rating}.0
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Local rating preview — submission coming soon.
          </p>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Overall mood</label>
          <div className="flex items-center gap-2">
            {moods.map((m) => {
              const Icon = m.icon;
              const active = mood === m.id;
              return (
                <motion.button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 rounded-xl ring-1 py-3 transition-all",
                    active
                      ? cn(accentBgSoft[m.accent], accentText[m.accent], accentRing[m.accent])
                      : "bg-muted/30 text-muted-foreground ring-border hover:bg-muted/50"
                  )}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{m.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Comments</label>
        <Textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Tell us what you loved or what we could improve…"
          rows={4}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Suggestions</label>
        <Textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="Any specific suggestions for improvement?"
          rows={3}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg bg-purple/5 ring-1 ring-purple-brand/15 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-purple-brand" />
            <span className="text-xs font-semibold text-foreground">Satisfaction Survey</span>
          </div>
          <p className="text-xs text-muted-foreground">
            A detailed CSAT survey will be added in a future release.
          </p>
        </div>
        <div className="rounded-lg bg-electric/5 ring-1 ring-electric/15 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-electric" />
            <span className="text-xs font-semibold text-foreground">Recommendation Score</span>
          </div>
          <p className="text-xs text-muted-foreground">
            NPS-style scoring will be introduced alongside the survey.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <LootButton variant="ghost" size="md">
          Clear
        </LootButton>
        <LootButton variant="purple" size="md" leftIcon={<Send size={14} />} disabled>
          Submit Feedback
        </LootButton>
      </div>
    </div>
  );
}

/* ============================================================
   State Components
   ============================================================ */
function NoTicketsEmpty() {
  return (
    <EmptyState
      icon="Ticket"
      title="No support tickets yet"
      description="When you open a ticket, it will appear here with full status tracking, replies and resolution history."
      action={
        <LootButton variant="electric" size="md" leftIcon={<Plus size={14} />}>
          Open Your First Ticket
        </LootButton>
      }
    />
  );
}

function SupportUnavailableError() {
  return (
    <ErrorState
      icon="AlertCircle"
      title="Support center unavailable"
      description="We couldn't load the support center right now. Please refresh the page or try again in a moment."
      variant="error"
      action={
        <LootButton variant="electric" size="md" leftIcon={<RefreshCw size={14} />}>
          Retry
        </LootButton>
      }
    />
  );
}

/* ============================================================
   Main View
   ============================================================ */
export function SupportView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { items: notificationItems } = useNotificationStore();
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [showError, setShowError] = useState(false);

  const unreadCount = useMemo(
    () => notificationItems.filter((n) => !n.read).length,
    [notificationItems]
  );

  const handleAction = (action: QuickAction) => {
    if (action.locked) return;
    switch (action.kind) {
      case "new-ticket":
        setTicketDialogOpen(true);
        break;
      case "abuse":
      case "community":
      case "security":
        // same-view scroll — handled by section presence
        break;
      case "contact":
      case "help":
      case "faq":
      case "bug":
      case "feature":
      case "feedback":
        break;
      default:
        break;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Support Center"
        description="We're here to help — explore knowledge, open tickets, and reach our team."
        actions={
          <LootButton
            variant="electric"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => setTicketDialogOpen(true)}
          >
            New Ticket
          </LootButton>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6 lg:space-y-8"
      >
        {/* ===================== 1. Support Dashboard ===================== */}
        <section>
          <Grid cols={4}>
            {SUPPORT_STATS.map((stat, i) =>
              stat.label === "Support Status" ? (
                <motion.div
                  key={stat.label}
                  variants={cardReveal}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  className="h-full"
                >
                  <GlassCard level={2} hover sheen className="p-5 h-full flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <IconBadge name={stat.icon} accent={stat.accent} />
                      <StatusBadge variant="success" dot pulse>
                        Operational
                      </StatusBadge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-foreground">All Systems Go</div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : stat.future ? (
                <motion.div
                  key={stat.label}
                  variants={cardReveal}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  className="h-full"
                >
                  <GlassCard level={2} hover sheen className="p-5 h-full flex flex-col gap-3 opacity-80">
                    <div className="flex items-start justify-between">
                      <IconBadge name={stat.icon} accent={stat.accent} />
                      <StatusBadge variant="gold" dot pulse>
                        <Lock size={10} /> Soon
                      </StatusBadge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-foreground">—</div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  accent={stat.accent}
                  trend={stat.trend}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  index={i}
                />
              )
            )}
          </Grid>
        </section>

        {/* ===================== 2. Quick Support Actions ===================== */}
        <section>
          <WidgetCard
            title="Quick Support Actions"
            description="Jump straight to the help you need"
            icon={<LifeBuoy size={18} />}
            level={1}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {QUICK_ACTIONS.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    type="button"
                    onClick={() => handleAction(action)}
                    variants={cardReveal}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-20px" }}
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    disabled={action.locked}
                    className={cn(
                      "group relative text-left rounded-2xl glass-2 p-4 flex flex-col gap-3 ring-1 ring-border transition-all",
                      "hover:ring-electric/30 hover:shadow-[var(--shadow-glow)]",
                      action.locked && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {action.locked && (
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-gold/15 text-gold ring-1 ring-gold/25 px-1.5 py-0.5 text-[10px] font-semibold">
                        <Lock size={9} /> Soon
                      </span>
                    )}
                    <div
                      className={cn(
                        "inline-flex size-10 items-center justify-center rounded-xl ring-1",
                        accentBgSoft[action.accent],
                        accentText[action.accent],
                        accentRing[action.accent]
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-foreground leading-tight">
                        {action.label}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </WidgetCard>
        </section>

        {/* ===================== 3. Support Ticket Center ===================== */}
        <section>
          <WidgetCard
            title="Support Ticket Center"
            description="Track, manage and respond to your support tickets"
            icon={<Ticket size={18} />}
            level={1}
            action={
              <LootButton
                variant="electric"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() => setTicketDialogOpen(true)}
              >
                New Ticket
              </LootButton>
            }
            footer={
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Info size={12} className="text-electric" />
                Ticket actions (View, Reply, Close, Reopen, Attachments) will become available
                once the support backend is integrated.
              </div>
            }
          >
            {/* Filter bar (display only) */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search tickets…" className="pl-8 h-9" disabled />
              </div>
              <LootButton variant="glass" size="sm" leftIcon={<Filter size={14} />} disabled>
                Filter
              </LootButton>
              <LootButton variant="glass" size="sm" leftIcon={<Tag size={14} />} disabled>
                Category
              </LootButton>
              <LootButton variant="glass" size="sm" leftIcon={<CircleDot size={14} />} disabled>
                Status
              </LootButton>
              <div className="ml-auto flex items-center gap-2">
                <LootButton
                  variant="outline"
                  size="sm"
                  leftIcon={<Inbox size={14} />}
                  onClick={() => setShowEmpty((v) => !v)}
                >
                  {showEmpty ? "Show Skeleton" : "Show Empty"}
                </LootButton>
                <LootButton
                  variant="outline"
                  size="sm"
                  leftIcon={<AlertCircle size={14} />}
                  onClick={() => setShowError((v) => !v)}
                >
                  {showError ? "Hide Error" : "Show Error"}
                </LootButton>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SupportUnavailableError />
                </motion.div>
              ) : showEmpty ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <NoTicketsEmpty />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Desktop table header */}
                  <div className="hidden lg:block">
                    <div className="grid grid-cols-12 gap-3 px-4 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {TICKET_TABLE_COLUMNS.map((col) => (
                        <div
                          key={col}
                          className={cn(
                            col === "Actions" && "text-right col-span-2",
                            col === "Ticket ID" && "col-span-2",
                            col === "Category" && "col-span-2",
                            col === "Priority" && "col-span-1",
                            col === "Status" && "col-span-1",
                            col === "Created" && "col-span-2",
                            col === "Last Updated" && "col-span-1",
                            col === "Assigned To" && "col-span-1"
                          )}
                        >
                          {col}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TicketRow key={i} />
                      ))}
                    </div>
                  </div>

                  {/* Mobile cards */}
                  <div className="lg:hidden space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TicketCardMobile key={i} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </WidgetCard>
        </section>

        {/* ===================== 4. New Ticket Dialog (renders here, opened from many places) ===================== */}
        <NewTicketDialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen} />

        {/* ===================== 5. Help Center ===================== */}
        <section>
          <WidgetCard
            title="Help Center"
            description="Browse our knowledge base by topic"
            icon={<BookOpen size={18} />}
            level={1}
            action={
              <LootButton variant="glass" size="sm" leftIcon={<Search size={14} />} disabled>
                Search Articles
              </LootButton>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {KNOWLEDGE_ARTICLES.map((article, i) => (
                <KnowledgeCard key={article.id} article={article} index={i} />
              ))}
            </div>
          </WidgetCard>
        </section>

        {/* ===================== 6. FAQ Center ===================== */}
        <section>
          <WidgetCard
            title="FAQ Center"
            description="Frequently asked questions across categories"
            icon={<HelpCircle size={18} />}
            level={1}
            action={
              <LootButton variant="glass" size="sm" leftIcon={<Search size={14} />} disabled>
                Search FAQ
              </LootButton>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {FAQ_CATEGORIES.map((cat) => (
                <FaqAccordion key={cat.id} category={cat} />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-electric/5 ring-1 ring-electric/15 p-3 text-xs text-muted-foreground">
              <Info size={14} className="text-electric shrink-0" />
              FAQ content is being prepared. Answers will be populated before public launch.
            </div>
          </WidgetCard>
        </section>

        {/* ===================== 7. Bug Report Center ===================== */}
        <section>
          <WidgetCard
            title="Bug Report Center"
            description="Help us improve by reporting issues you encounter"
            icon={<Bug size={18} />}
            level={1}
          >
            <BugReportForm />
          </WidgetCard>
        </section>

        {/* ===================== 8. Feature Request Center ===================== */}
        <section>
          <WidgetCard
            title="Feature Request Center"
            description="Suggest improvements and vote on community ideas"
            icon={<Lightbulb size={18} />}
            level={1}
          >
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Plus size={14} className="text-electric" />
                  Submit a Feature Request
                </h3>
                <FeatureRequestForm />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-brand" />
                  Premium Request Spotlight
                </h3>
                <div className="space-y-3">
                  {FEATURE_REQUEST_CARDS.map((fr, i) => {
                    const statusVariant =
                      fr.status === "Planned"
                        ? "info"
                        : fr.status === "Under Review"
                        ? "warning"
                        : "default";
                    return (
                      <motion.div
                        key={fr.id}
                        variants={cardReveal}
                        custom={i}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-20px" }}
                      >
                        <GlassCard level={2} hover sheen className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-foreground">{fr.title}</h4>
                            <StatusBadge variant={statusVariant as "info" | "warning" | "default"}>
                              {fr.status}
                            </StatusBadge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {fr.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Tag size={11} />
                              {fr.category}
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-xs font-semibold",
                                accentText[fr.accent]
                              )}
                            >
                              <ThumbsUp size={12} />
                              {fr.votes} votes
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <LootButton variant="outline" size="sm" leftIcon={<ThumbsUp size={12} />} disabled>
                              Vote
                            </LootButton>
                            <LootButton variant="ghost" size="sm" leftIcon={<MessageSquare size={12} />} disabled>
                              Discuss
                            </LootButton>
                          </div>
                        </GlassCard>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-brand/5 ring-1 ring-emerald-brand/15 p-3 text-xs text-muted-foreground">
                  <Lock size={12} className="text-emerald-brand shrink-0" />
                  Community voting and feature statuses will activate in a future release.
                </div>
              </div>
            </div>
          </WidgetCard>
        </section>

        {/* ===================== 9. Feedback Center ===================== */}
        <section>
          <WidgetCard
            title="Feedback Center"
            description="Tell us how we're doing — your input shapes LootLoom"
            icon={<MessageSquare size={18} />}
            level={1}
          >
            <FeedbackWidget />
          </WidgetCard>
        </section>

        {/* ===================== 10. Contact Center ===================== */}
        <section>
          <WidgetCard
            title="Contact Center"
            description="Reach the LootLoom team through any of these channels"
            icon={<Headphones size={18} />}
            level={1}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CONTACT_CHANNELS.map((channel, i) => (
                <ContactCard key={channel.id} channel={channel} index={i} />
              ))}
            </div>
          </WidgetCard>
        </section>

        {/* ===================== 11. Community Guidelines Preview ===================== */}
        <section>
          <WidgetCard
            title="Community Guidelines"
            description="The rules that keep LootLoom fair, safe and friendly"
            icon={<Users size={18} />}
            level={1}
            action={
              <LootButton variant="glass" size="sm" leftIcon={<BookMarked size={14} />} disabled>
                Full Guidelines
              </LootButton>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMMUNITY_RULES.map((rule, i) => {
                const Icon = rule.icon;
                return (
                  <motion.div
                    key={rule.id}
                    variants={cardReveal}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-20px" }}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    <GlassCard
                      level={2}
                      hover
                      sheen
                      className={cn("p-5 h-full flex flex-col gap-3", rule.future && "opacity-75")}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={cn(
                            "inline-flex size-10 items-center justify-center rounded-xl ring-1",
                            accentBgSoft[rule.accent],
                            accentText[rule.accent],
                            accentRing[rule.accent]
                          )}
                        >
                          <Icon size={20} />
                        </div>
                        {rule.future && (
                          <StatusBadge variant="gold" dot pulse>
                            <Lock size={10} /> Soon
                          </StatusBadge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">{rule.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {rule.description}
                        </p>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </WidgetCard>
        </section>

        {/* ===================== 12. Security Help ===================== */}
        <section>
          <WidgetCard
            title="Security Help"
            description="Protect your account and learn to spot scams"
            icon={<ShieldCheck size={18} />}
            level={1}
            glow="electric"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECURITY_TIPS.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <motion.div
                    key={tip.id}
                    variants={cardReveal}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-20px" }}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    <GlassCard
                      level={2}
                      hover
                      sheen
                      className={cn(
                        "p-5 h-full flex flex-col gap-3 ring-1 ring-emerald-brand/10",
                        tip.future && "opacity-75"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={cn(
                            "inline-flex size-10 items-center justify-center rounded-xl ring-1",
                            accentBgSoft[tip.accent],
                            accentText[tip.accent],
                            accentRing[tip.accent]
                          )}
                        >
                          <Icon size={20} />
                        </div>
                        {tip.future ? (
                          <StatusBadge variant="gold" dot pulse>
                            <Lock size={10} /> Soon
                          </StatusBadge>
                        ) : (
                          <ShieldCheck size={14} className="text-emerald-brand/70" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">{tip.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                      <div className="mt-auto pt-2">
                        <LootButton
                          variant="ghost"
                          size="sm"
                          fullWidth
                          disabled={tip.future}
                          rightIcon={<ArrowRight size={12} />}
                        >
                          {tip.future ? "Coming Soon" : "Learn More"}
                        </LootButton>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </WidgetCard>
        </section>

        {/* ===================== 13. Support Timeline ===================== */}
        <section>
          <WidgetCard
            title="Support Timeline"
            description="The lifecycle of a typical support ticket"
            icon={<Activity size={18} />}
            level={1}
          >
            <div className="relative">
              {/* vertical connector */}
              <div className="absolute left-4 sm:left-5 top-2 bottom-2 w-px bg-gradient-to-b from-electric/40 via-purple-brand/30 to-rose-brand/30" />
              <div className="space-y-4">
                {TIMELINE_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.id}
                      variants={cardReveal}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-30px" }}
                      className="relative pl-12 sm:pl-16"
                    >
                      <div
                        className={cn(
                          "absolute left-0 top-0 inline-flex size-9 sm:size-10 items-center justify-center rounded-full ring-4 ring-background",
                          accentBgSoft[step.accent],
                          accentText[step.accent]
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <GlassCard level={2} hover sheen className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                          <StatusBadge variant="default">Step {i + 1}</StatusBadge>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </WidgetCard>
        </section>

        {/* ===================== 14. Notification Preview ===================== */}
        <section>
          <WidgetCard
            title="Notification Preview"
            description="Support-related notifications you'll receive"
            icon={<Bell size={18} />}
            level={1}
            action={
              <LootButton
                variant="glass"
                size="sm"
                leftIcon={<ArrowUpRight size={14} />}
                onClick={() => navigate("notifications")}
              >
                View all
              </LootButton>
            }
          >
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                {NOTIFICATION_PREVIEW.map((n, i) => {
                  const Icon = n.icon;
                  return (
                    <motion.div
                      key={n.id}
                      variants={cardReveal}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-20px" }}
                    >
                      <GlassCard level={2} hover sheen className="p-4 flex items-center gap-3">
                        <div
                          className={cn(
                            "inline-flex size-10 items-center justify-center rounded-xl ring-1 shrink-0",
                            accentBgSoft[n.accent],
                            accentText[n.accent],
                            accentRing[n.accent]
                          )}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-foreground">{n.label}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {n.description}
                          </p>
                        </div>
                        {n.id === "live-updates" ? (
                          <StatusBadge variant="gold" dot pulse>
                            <Lock size={10} /> Soon
                          </StatusBadge>
                        ) : (
                          <StatusBadge variant="success" dot pulse>
                            Active
                          </StatusBadge>
                        )}
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Recent Notifications</h4>
                  <span className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </span>
                </div>
                <SkeletonRow count={4} />
                <div className="mt-3 flex justify-end">
                  <LootButton
                    variant="outline"
                    size="sm"
                    rightIcon={<ArrowRight size={12} />}
                    onClick={() => navigate("notifications")}
                  >
                    Open Notification Center
                  </LootButton>
                </div>
              </div>
            </div>
          </WidgetCard>
        </section>

        {/* ===================== 15. Support Analytics ===================== */}
        <section>
          <WidgetCard
            title="Support Analytics"
            description="Insights into ticket volume, resolution and satisfaction"
            icon={<TrendingUp size={18} />}
            level={1}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Open Tickets — Bar Chart */}
              <GlassCard level={2} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Open Tickets (7 days)</h4>
                  <StatusBadge variant="default">Placeholder</StatusBadge>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ANALYTICS_OPEN_TICKETS}>
                      <XAxis dataKey="name" stroke="oklch(0.55 0.02 270)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="oklch(0.55 0.02 270)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: "oklch(0.62 0.22 255 / 0.06)" }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--border)",
                          background: "var(--background)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" fill="oklch(0.62 0.22 255)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Resolution Status — Pie Chart */}
              <GlassCard level={2} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Resolution Status</h4>
                  <StatusBadge variant="default">Placeholder</StatusBadge>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ANALYTICS_RESOLUTION}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {ANALYTICS_RESOLUTION.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--border)",
                          background: "var(--background)",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  {ANALYTICS_RESOLUTION.map((entry) => (
                    <span key={entry.name} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-2 rounded-full" style={{ background: entry.color }} />
                      {entry.name}
                    </span>
                  ))}
                </div>
              </GlassCard>

              {/* Categories — Bar Chart */}
              <GlassCard level={2} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Tickets by Category</h4>
                  <StatusBadge variant="default">Placeholder</StatusBadge>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ANALYTICS_CATEGORIES} layout="vertical">
                      <XAxis type="number" stroke="oklch(0.55 0.02 270)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" stroke="oklch(0.55 0.02 270)" fontSize={11} tickLine={false} axisLine={false} width={70} />
                      <Tooltip
                        cursor={{ fill: "oklch(0.6 0.22 295 / 0.06)" }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--border)",
                          background: "var(--background)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" fill="oklch(0.6 0.22 295)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Priority Distribution — Pie + Satisfaction Ring */}
              <GlassCard level={2} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Priority Distribution</h4>
                  <StatusBadge variant="default">Placeholder</StatusBadge>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ANALYTICS_PRIORITY}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          paddingAngle={3}
                        >
                          {ANALYTICS_PRIORITY.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid var(--border)",
                            background: "var(--background)",
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2">Satisfaction Score</p>
                      <div className="flex items-center gap-3">
                        <ProgressRing value={0} size={70} strokeWidth={7} gradient="emerald" label="—" />
                        <div className="space-y-1">
                          <StatusBadge variant="gold" dot pulse>
                            <Lock size={10} /> Future
                          </StatusBadge>
                          <p className="text-[10px] text-muted-foreground max-w-[120px]">
                            CSAT score will appear here once feedback collection launches.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ANALYTICS_PRIORITY.map((entry) => (
                        <span key={entry.name} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="size-2 rounded-full" style={{ background: entry.color }} />
                          {entry.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-electric/5 ring-1 ring-electric/15 p-3 text-xs text-muted-foreground">
              <Info size={14} className="text-electric shrink-0" />
              Charts reflect placeholder structure. Real metrics will populate once the
              support backend is integrated.
            </div>
          </WidgetCard>
        </section>

        {/* ===================== Footer shortcut strip ===================== */}
        <section>
          <GlassCard level={2} sheen className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-xl bg-electric/10 text-electric ring-1 ring-electric/20">
                <LifeBuoy size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Still need help?</h3>
                <p className="text-xs text-muted-foreground">
                  Open a ticket, browse the Help Center, or check your account settings.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LootButton
                variant="electric"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() => setTicketDialogOpen(true)}
              >
                New Ticket
              </LootButton>
              <LootButton
                variant="glass"
                size="sm"
                leftIcon={<Settings size={14} />}
                onClick={() => navigate("settings")}
              >
                Account Settings
              </LootButton>
              <LootButton
                variant="ghost"
                size="sm"
                leftIcon={<User size={14} />}
                onClick={() => navigate("profile")}
              >
                Your Profile
              </LootButton>
            </div>
          </GlassCard>
        </section>
      </motion.div>
    </PageContainer>
  );
}

/* ============================================================
   Aliases used in data tables to keep imports clean
   ============================================================ */
// (Wallet, Gift, ShoppingBag, Trophy, Medal, CreditCard, BadgeCheck are imported above
//  for use in KNOWLEDGE_ARTICLES, FAQ_CATEGORIES, SECURITY_TIPS data arrays.)
