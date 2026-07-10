"use client";

/* ============================================================
   LootLoom — Public Information System & Legal Center
   Premium white-theme, glassmorphism, floating layouts.
   Serves all LEGAL_VIEWS via useNavigationStore().current.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  LogIn,
  UserPlus,
  Sparkles,
  Info,
  Shield,
  ShieldCheck,
  FileText,
  Cookie,
  Users,
  Lock,
  AlertTriangle,
  Copyright,
  ScrollText,
  Activity,
  GitBranch,
  Bell,
  BookOpen,
  Mail,
  MessageCircle,
  Phone,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Zap,
  Rocket,
  HandCoins,
  Fingerprint,
  Crown,
  Target,
  Wallet,
  Gift,
  Coins,
  Trophy,
  LifeBuoy,
  Settings,
  CheckCircle2,
  Clock,
  Megaphone,
  Server,
  Database,
  Globe,
  Cpu,
  Eye,
  RefreshCw,
  Tag,
  Workflow,
  Gauge,
} from "lucide-react";
import {
  GlassCard,
  LootButton,
  Logo,
  IconBadge,
  AnimatedCounter,
  ProgressRing,
  StatusBadge,
} from "@/components/lootloom";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  pageTransition,
  slideUp,
  cardReveal,
  staggerContainer,
  floating,
  floatingSmall,
} from "@/lib/animations";
import { useNavigationStore } from "@/stores";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/types";

/* ============================================================
   Types
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

interface TocItem {
  id: string;
  label: string;
}

interface LegalPageMeta {
  view: ViewId;
  title: string;
  description: string;
  icon: string;
  accent: Accent;
  eyebrow: string;
  toc: TocItem[];
}

interface SectionDef {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  accent?: Accent;
  badge?: string;
  body: React.ReactNode;
  footer?: React.ReactNode;
}

interface TimelineItem {
  title: string;
  desc: string;
  icon: string;
  accent: Accent;
  meta?: string;
}

/* ============================================================
   Accent → StatusBadge variant mapping
   ============================================================ */

const STATUS_VARIANT: Record<Accent, "electric" | "cyan" | "purple" | "gold" | "success" | "error" | "info"> = {
  electric: "electric",
  cyan: "cyan",
  purple: "purple",
  gold: "gold",
  emerald: "success",
  rose: "error",
  navy: "info",
};

/* ============================================================
   LEGAL_PAGES — per-view metadata + TOC
   ============================================================ */

const LEGAL_PAGES: Partial<Record<ViewId, LegalPageMeta>> = {
  about: {
    view: "about",
    title: "About LootLoom",
    description:
      "A premium reward platform built around the member experience. This page outlines the vision, mission, and product philosophy that shape LootLoom.",
    icon: "Info",
    accent: "electric",
    eyebrow: "About the Platform",
    toc: [
      { id: "vision", label: "Platform Vision" },
      { id: "mission", label: "Mission" },
      { id: "philosophy", label: "Reward Platform Philosophy" },
      { id: "user-first", label: "User First Experience" },
      { id: "security", label: "Security Commitment" },
      { id: "roadmap", label: "Future Roadmap" },
      { id: "technology", label: "Technology Overview" },
    ],
  },
  "features-overview": {
    view: "features-overview",
    title: "Features Overview",
    description:
      "Explore every LootLoom capability in one premium grid. Active features are highlighted; future capabilities are clearly marked.",
    icon: "Sparkles",
    accent: "purple",
    eyebrow: "Platform Capabilities",
    toc: [
      { id: "core", label: "Core Platform" },
      { id: "wallet", label: "Wallet & Rewards" },
      { id: "social", label: "Social & Competition" },
      { id: "support", label: "Support & Notifications" },
      { id: "future", label: "Future Features" },
    ],
  },
  "how-it-works": {
    view: "how-it-works",
    title: "How LootLoom Works",
    description:
      "A guided journey through the LootLoom experience — from registration to a successfully redeemed reward.",
    icon: "Workflow",
    accent: "cyan",
    eyebrow: "The Member Journey",
    toc: [
      { id: "register", label: "1. Register" },
      { id: "login", label: "2. Login" },
      { id: "dashboard", label: "3. Dashboard" },
      { id: "earn", label: "4. Earn Coins" },
      { id: "wallet", label: "5. Wallet Updated" },
      { id: "redeem", label: "6. Redeem Rewards" },
      { id: "review", label: "7. Review" },
      { id: "completed", label: "8. Completed" },
    ],
  },
  "help-center": {
    view: "help-center",
    title: "Help Center",
    description:
      "Knowledge cards covering the most common LootLoom topics. Each card is a starting point — full articles will be added over time.",
    icon: "HelpCircle",
    accent: "emerald",
    eyebrow: "Knowledge Base",
    toc: [
      { id: "getting-started", label: "Getting Started" },
      { id: "account", label: "Account" },
      { id: "wallet", label: "Wallet" },
      { id: "rewards", label: "Rewards" },
      { id: "redeem", label: "Redeem" },
      { id: "security", label: "Security" },
      { id: "more-help", label: "Need More Help?" },
    ],
  },
  contact: {
    view: "contact",
    title: "Contact LootLoom",
    description:
      "Reach the LootLoom team. Active channels are listed first; upcoming channels are clearly marked as future.",
    icon: "Mail",
    accent: "gold",
    eyebrow: "Get in Touch",
    toc: [
      { id: "support-email", label: "Support Email" },
      { id: "support-portal", label: "Support Portal" },
      { id: "help-center", label: "Help Center" },
      { id: "faq", label: "FAQ" },
      { id: "live-chat", label: "Live Chat" },
      { id: "discord", label: "Discord" },
      { id: "telegram", label: "Telegram" },
      { id: "phone", label: "Phone" },
      { id: "business", label: "Business Contact" },
    ],
  },
  "faq-public": {
    view: "faq-public",
    title: "Frequently Asked Questions",
    description:
      "Common questions from the LootLoom community, grouped by topic. Answers are being prepared — placeholder content is shown honestly.",
    icon: "HelpCircle",
    accent: "electric",
    eyebrow: "Public FAQ",
    toc: [
      { id: "account", label: "Account" },
      { id: "wallet", label: "Wallet" },
      { id: "rewards", label: "Rewards" },
      { id: "redeem", label: "Redeem" },
      { id: "security", label: "Security" },
      { id: "referral", label: "Referral" },
      { id: "leaderboard", label: "Leaderboard" },
      { id: "notifications", label: "Notifications" },
      { id: "support", label: "Support" },
      { id: "general", label: "General" },
    ],
  },
  privacy: {
    view: "privacy",
    title: "Privacy Policy",
    description:
      "How LootLoom intends to handle member information. This document is under active development — details will be finalized before launch.",
    icon: "ShieldCheck",
    accent: "emerald",
    eyebrow: "Privacy",
    toc: [
      { id: "collection", label: "Information Collection" },
      { id: "account", label: "Account Information" },
      { id: "usage", label: "Usage Information" },
      { id: "cookies", label: "Cookies" },
      { id: "analytics", label: "Analytics" },
      { id: "security", label: "Security" },
      { id: "retention", label: "Data Retention" },
      { id: "rights", label: "User Rights" },
      { id: "children", label: "Children's Privacy" },
      { id: "contact", label: "Contact" },
    ],
  },
  terms: {
    view: "terms",
    title: "Terms & Conditions",
    description:
      "The rules that govern use of LootLoom. Specific terms are being drafted — placeholder structure is shown below.",
    icon: "FileText",
    accent: "navy",
    eyebrow: "Terms of Use",
    toc: [
      { id: "account", label: "Account Responsibilities" },
      { id: "usage", label: "Platform Usage" },
      { id: "rewards", label: "Reward Rules" },
      { id: "redeem", label: "Redeem Rules" },
      { id: "conduct", label: "User Conduct" },
      { id: "ip", label: "Intellectual Property" },
      { id: "termination", label: "Termination" },
      { id: "liability", label: "Limitation of Liability" },
      { id: "payments", label: "Payment Terms" },
      { id: "disputes", label: "Dispute Resolution" },
    ],
  },
  cookies: {
    view: "cookies",
    title: "Cookie Policy",
    description:
      "How LootLoom uses cookies and similar storage. Only cookies actually in use are described — future cookies are clearly marked.",
    icon: "Cookie",
    accent: "gold",
    eyebrow: "Cookies & Storage",
    toc: [
      { id: "necessary", label: "Necessary Cookies" },
      { id: "functional", label: "Functional Cookies" },
      { id: "analytics", label: "Analytics" },
      { id: "preferences", label: "Preference Storage" },
      { id: "advertising", label: "Advertising Cookies" },
    ],
  },
  "community-guidelines": {
    view: "community-guidelines",
    title: "Community Guidelines",
    description:
      "The rules that keep LootLoom fair, respectful, and rewarding for everyone. Violations may affect account standing.",
    icon: "Users",
    accent: "electric",
    eyebrow: "Community Rules",
    toc: [
      { id: "respect", label: "Respect Others" },
      { id: "abuse", label: "No Abuse" },
      { id: "spam", label: "No Spam" },
      { id: "fraud", label: "No Fraud" },
      { id: "fair", label: "Fair Usage" },
      { id: "integrity", label: "Reward Integrity" },
      { id: "safety", label: "Account Safety" },
      { id: "reporting", label: "Reporting Violations" },
    ],
  },
  "security-policy": {
    view: "security-policy",
    title: "Security Policy",
    description:
      "LootLoom's commitments and best-practice recommendations for keeping member accounts safe.",
    icon: "Shield",
    accent: "emerald",
    eyebrow: "Security",
    toc: [
      { id: "account", label: "Account Security" },
      { id: "password", label: "Password Tips" },
      { id: "browsing", label: "Safe Browsing" },
      { id: "scam", label: "Scam Awareness" },
      { id: "2fa", label: "Two-Factor Auth" },
      { id: "device", label: "Device Verification" },
      { id: "reporting", label: "Reporting Issues" },
      { id: "timeline", label: "Security Timeline" },
      { id: "status", label: "Security Status" },
    ],
  },
  disclaimer: {
    view: "disclaimer",
    title: "Disclaimer",
    description:
      "General disclaimers about the LootLoom platform, reward availability, and external content. Under active development.",
    icon: "AlertTriangle",
    accent: "gold",
    eyebrow: "Disclaimer",
    toc: [
      { id: "general", label: "General Disclaimer" },
      { id: "rewards", label: "Rewards Disclaimer" },
      { id: "availability", label: "Availability" },
      { id: "external", label: "External Links" },
      { id: "liability", label: "Liability" },
      { id: "changes", label: "Changes" },
    ],
  },
  copyright: {
    view: "copyright",
    title: "Copyright Notice",
    description:
      "Intellectual property notice for the LootLoom platform, branding, and member-submitted content.",
    icon: "Copyright",
    accent: "purple",
    eyebrow: "Intellectual Property",
    toc: [
      { id: "ownership", label: "Ownership" },
      { id: "license", label: "License to Use" },
      { id: "trademarks", label: "Trademarks" },
      { id: "user-content", label: "User Content" },
      { id: "infringement", label: "Infringement" },
      { id: "contact", label: "Contact" },
    ],
  },
  dmca: {
    view: "dmca",
    title: "DMCA Policy",
    description:
      "How LootLoom intends to respond to Digital Millennium Copyright Act notices. Process details to be finalized.",
    icon: "ScrollText",
    accent: "rose",
    eyebrow: "DMCA",
    toc: [
      { id: "overview", label: "Overview" },
      { id: "notice", label: "DMCA Notice" },
      { id: "counter-notice", label: "Counter-Notice" },
      { id: "repeat", label: "Repeat Infringers" },
      { id: "contact", label: "Contact" },
    ],
  },
  refund: {
    view: "refund",
    title: "Refund Policy",
    description:
      "How LootLoom approaches refunds and reversals. Specific terms will be added here once finalized.",
    icon: "HandCoins",
    accent: "cyan",
    eyebrow: "Refunds",
    toc: [
      { id: "overview", label: "Overview" },
      { id: "eligibility", label: "Eligibility" },
      { id: "process", label: "Refund Process" },
      { id: "timeline", label: "Timeline" },
      { id: "exceptions", label: "Exceptions" },
      { id: "contact", label: "Contact" },
    ],
  },
  "status-page": {
    view: "status-page",
    title: "Platform Status",
    description:
      "A live-style status overview of LootLoom services. Displayed values are placeholders — real monitoring will be wired in later.",
    icon: "Activity",
    accent: "emerald",
    eyebrow: "System Status",
    toc: [
      { id: "system", label: "System Status" },
      { id: "auth", label: "Authentication" },
      { id: "wallet", label: "Wallet" },
      { id: "rewards", label: "Rewards" },
      { id: "redeem", label: "Redeem" },
      { id: "notifications", label: "Notifications" },
      { id: "support", label: "Support" },
      { id: "future", label: "Future Services" },
    ],
  },
  changelog: {
    view: "changelog",
    title: "Changelog",
    description:
      "A timeline of LootLoom releases. Version numbers and feature lists below are placeholders until the first public release ships.",
    icon: "GitBranch",
    accent: "electric",
    eyebrow: "Release History",
    toc: [
      { id: "latest", label: "Latest Version" },
      { id: "features", label: "New Features" },
      { id: "fixes", label: "Bug Fixes" },
      { id: "security", label: "Security Improvements" },
      { id: "performance", label: "Performance" },
      { id: "future", label: "Future Releases" },
    ],
  },
  "whats-new": {
    view: "whats-new",
    title: "What's New",
    description:
      "The latest on LootLoom — recent updates, upcoming features, recently improved areas, and the future roadmap.",
    icon: "Bell",
    accent: "purple",
    eyebrow: "Latest Updates",
    toc: [
      { id: "latest", label: "Latest Updates" },
      { id: "upcoming", label: "Upcoming Features" },
      { id: "improved", label: "Recently Improved" },
      { id: "roadmap", label: "Future Roadmap" },
    ],
  },
  "platform-updates": {
    view: "platform-updates",
    title: "Platform Updates",
    description:
      "Official LootLoom announcements, maintenance windows, and release notes. Content below is placeholder.",
    icon: "Megaphone",
    accent: "cyan",
    eyebrow: "Announcements",
    toc: [
      { id: "announcements", label: "Announcements" },
      { id: "maintenance", label: "Maintenance" },
      { id: "releases", label: "Releases" },
      { id: "upcoming", label: "Upcoming" },
    ],
  },
};

/* ============================================================
   Reusable: ScrollProgress (top progress bar)
   ============================================================ */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60] bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand)_45%,var(--purple-brand))]"
      aria-hidden
    />
  );
}

/* ============================================================
   Reusable: BackToTop (floating button)
   ============================================================ */

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 size-12 rounded-full glass-2 ring-1 ring-border shadow-[var(--shadow-md)] flex items-center justify-center text-electric hover:glass-3 transition-all"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   Reusable: LegalTopBar (sticky nav with auth shortcuts)
   ============================================================ */

function LegalTopBar() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <motion.header
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="sticky top-0 z-50 px-3 sm:px-4 lg:px-6 pt-3"
    >
      <GlassCard
        level="nav"
        sheen
        className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 shadow-[var(--shadow-md)]"
      >
        <button
          onClick={() => navigate("home")}
          aria-label="LootLoom home"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          <Logo size="md" />
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LootButton
            size="sm"
            variant="ghost"
            onClick={() => navigate("home")}
            leftIcon={<ArrowLeft size={14} />}
            aria-label="Back to home"
          >
            <span className="hidden sm:inline">Home</span>
          </LootButton>
          <LootButton
            size="sm"
            variant="glass"
            onClick={() => navigate("login")}
            leftIcon={<LogIn size={14} />}
          >
            <span className="hidden sm:inline">Sign In</span>
          </LootButton>
          <LootButton
            size="sm"
            variant="electric"
            onClick={() => navigate("register")}
            leftIcon={<UserPlus size={14} />}
          >
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Start</span>
          </LootButton>
        </div>
      </GlassCard>
    </motion.header>
  );
}

/* ============================================================
   Reusable: PolicyBadge (small pill)
   ============================================================ */

const POLICY_BADGE_CLASS: Record<Accent, string> = {
  electric: "bg-electric/10 text-electric ring-electric/20",
  cyan: "bg-cyan/10 text-cyan-brand ring-cyan-brand/20",
  purple: "bg-purple/10 text-purple-brand ring-purple-brand/20",
  gold: "bg-gold/15 text-gold ring-gold/25",
  emerald: "bg-emerald-brand/10 text-emerald-brand ring-emerald-brand/20",
  rose: "bg-rose-brand/10 text-rose-brand ring-rose-brand/20",
  navy: "bg-navy/10 text-navy ring-navy/20",
};

function PolicyBadge({
  children,
  accent = "electric",
  icon,
}: {
  children: React.ReactNode;
  accent?: Accent;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
        POLICY_BADGE_CLASS[accent]
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* ============================================================
   Reusable: LegalHeader (premium page hero)
   ============================================================ */

function Breadcrumb({ meta }: { meta: LegalPageMeta }) {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <button
        onClick={() => navigate("home")}
        className="hover:text-foreground transition-colors font-medium"
      >
        Home
      </button>
      <ChevronRight size={12} className="text-muted-foreground/50" />
      <span className="text-foreground font-medium">Public Information</span>
      <ChevronRight size={12} className="text-muted-foreground/50" />
      <span className="text-foreground font-semibold truncate max-w-[180px]">{meta.title}</span>
    </nav>
  );
}

function LegalHeader({ meta }: { meta: LegalPageMeta }) {
  return (
    <GlassCard
      level={3}
      sheen
      glow="electric"
      className="p-6 lg:p-10 mb-6 lg:mb-8 relative overflow-hidden"
    >
      {/* Decorative floating blobs */}
      <motion.div
        variants={floating}
        animate="animate"
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-electric/10 blur-3xl"
        aria-hidden
      />
      <motion.div
        variants={floatingSmall}
        animate="animate"
        transition={{ delay: 1.5, duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-20 -left-12 size-64 rounded-full bg-purple/10 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <motion.div variants={cardReveal} className="space-y-3">
            <Breadcrumb meta={meta} />
            <div className="flex items-center gap-3 flex-wrap">
              <IconBadge name={meta.icon} accent={meta.accent} size="lg" />
              <StatusBadge variant={STATUS_VARIANT[meta.accent]} dot pulse className="px-3 py-1">
                {meta.eyebrow}
              </StatusBadge>
            </div>
          </motion.div>
          <motion.h1
            variants={cardReveal}
            custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]"
          >
            {meta.title}
          </motion.h1>
          <motion.p
            variants={cardReveal}
            custom={2}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
          >
            {meta.description}
          </motion.p>
          <motion.div variants={cardReveal} custom={3} className="flex flex-wrap items-center gap-2 pt-1">
            <PolicyBadge accent="gold" icon={<Clock size={11} />}>
              Living document
            </PolicyBadge>
            <PolicyBadge accent="cyan" icon={<BookOpen size={11} />}>
              Content under active development
            </PolicyBadge>
          </motion.div>
        </motion.div>
      </div>
    </GlassCard>
  );
}

/* ============================================================
   Reusable: SectionCard
   ============================================================ */

function SectionCard({
  id,
  index = 0,
  icon,
  accent = "electric",
  title,
  description,
  badge,
  badgeIcon,
  children,
  footer,
}: {
  id: string;
  index?: number;
  icon?: string;
  accent?: Accent;
  title: string;
  description?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="scroll-mt-24"
    >
      <GlassCard level={3} sheen className="p-6 lg:p-8 shadow-[var(--shadow-md)] h-full">
        <div className="flex items-start gap-4 mb-5">
          {icon && <IconBadge name={icon} accent={accent} size="lg" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{title}</h2>
              {badge && (
                <PolicyBadge accent={accent} icon={badgeIcon}>
                  {badge}
                </PolicyBadge>
              )}
            </div>
            {description && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>}
          </div>
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground space-y-3">{children}</div>
        {footer && <div className="mt-6 pt-5 border-t border-border">{footer}</div>}
      </GlassCard>
    </motion.section>
  );
}

/* ============================================================
   Reusable: WarningCard (rose/gold accent warning)
   ============================================================ */

function WarningCard({
  title,
  icon = "AlertTriangle",
  accent = "rose",
  children,
  index = 0,
}: {
  title: string;
  icon?: string;
  accent?: Accent;
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <GlassCard
        level={2}
        className={cn(
          "p-5 lg:p-6 ring-1 ring-border",
          accent === "rose" && "ring-rose-brand/20",
          accent === "gold" && "ring-gold/20"
        )}
      >
        <div className="flex items-start gap-3.5">
          <IconBadge name={icon} accent={accent} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Reusable: InformationCard (compact info tile)
   ============================================================ */

function InformationCard({
  icon,
  accent = "electric",
  title,
  children,
  index = 0,
  badge,
  locked = false,
}: {
  icon: string;
  accent?: Accent;
  title: string;
  children?: React.ReactNode;
  index?: number;
  badge?: string;
  locked?: boolean;
}) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      className={cn("h-full", locked && "opacity-70")}
    >
      <GlassCard level={2} sheen className="p-5 h-full flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-3">
          <IconBadge name={icon} accent={accent} size="md" />
          {locked ? (
            <PolicyBadge accent="navy" icon={<Lock size={10} />}>
              Future
            </PolicyBadge>
          ) : badge ? (
            <PolicyBadge accent={accent}>{badge}</PolicyBadge>
          ) : null}
        </div>
        <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
        {children && <div className="text-sm text-muted-foreground leading-relaxed flex-1">{children}</div>}
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Reusable: LegalTimeline (vertical)
   ============================================================ */

function LegalTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative pl-8 lg:pl-10">
      {/* Gradient rail */}
      <div className="absolute left-[14px] lg:left-[18px] top-2 bottom-2 w-[2px] bg-[linear-gradient(180deg,var(--electric),var(--cyan-brand)_45%,var(--purple-brand))]" />
      <div className="space-y-6">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            variants={cardReveal}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative"
          >
            <div className="absolute -left-8 lg:-left-10 top-1">
              <div
                className={cn(
                  "size-7 lg:size-9 rounded-full flex items-center justify-center ring-4 ring-background",
                  it.accent === "electric" && "bg-electric/15 text-electric",
                  it.accent === "cyan" && "bg-cyan/15 text-cyan-brand",
                  it.accent === "purple" && "bg-purple/15 text-purple-brand",
                  it.accent === "gold" && "bg-gold/20 text-gold",
                  it.accent === "emerald" && "bg-emerald-brand/15 text-emerald-brand",
                  it.accent === "rose" && "bg-rose-brand/15 text-rose-brand",
                  it.accent === "navy" && "bg-navy/15 text-navy"
                )}
              >
                <IconBadgeName name={it.icon} size={16} />
              </div>
            </div>
            <GlassCard level={2} sheen className="p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                <h3 className="text-base font-bold text-foreground">{it.title}</h3>
                {it.meta && (
                  <PolicyBadge accent={it.accent} icon={<Clock size={10} />}>
                    {it.meta}
                  </PolicyBadge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Small helper to render a lucide icon by name inside the timeline dots. */
function IconBadgeName({ name, size = 16 }: { name: string; size?: number }) {
  return <LucideByName name={name} size={size} />;
}

/** Lightweight lucide-by-name lookup to avoid a giant switch. */
function LucideByName({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[name] ?? LucideIcons.Sparkles;
  return <Icon size={size} className={className} />;
}

/* ============================================================
   Reusable: TocNav (sticky desktop sidebar + mobile collapsible)
   ============================================================ */

function TocNav({ items, accent }: { items: TocItem[]; accent: Accent }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          if (top?.target?.id) setActive(top.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  const navList = (
    <nav className="space-y-1">
      {items.map((it, i) => {
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => handleClick(it.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5 group",
              isActive
                ? "bg-electric/10 text-electric ring-1 ring-electric/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <span
              className={cn(
                "size-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 tabular-nums transition-colors",
                isActive ? "bg-electric/20 text-electric" : "bg-muted text-muted-foreground group-hover:bg-accent"
              )}
            >
              {i + 1}
            </span>
            <span className="truncate">{it.label}</span>
            {isActive && <ChevronRight size={12} className="ml-auto text-electric shrink-0" />}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <GlassCard level={2} className="p-4">
            <div className="flex items-center gap-2 mb-3 px-1">
              <BookOpen size={14} className="text-electric" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                On this page
              </span>
            </div>
            {navList}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <LootButton
                size="sm"
                variant="glass"
                fullWidth
                onClick={() => useNavigationStore.getState().navigate("home")}
                leftIcon={<ArrowLeft size={14} />}
              >
                Back to Home
              </LootButton>
              <LootButton
                size="sm"
                variant="electric"
                fullWidth
                onClick={() => useNavigationStore.getState().navigate("register")}
                leftIcon={<UserPlus size={14} />}
              >
                Get Started
              </LootButton>
            </div>
          </GlassCard>
        </div>
      </aside>

      {/* Mobile collapsible */}
      <div className="lg:hidden">
        <GlassCard level={2} className="overflow-hidden">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-foreground"
            aria-expanded={mobileOpen}
          >
            <span className="flex items-center gap-2">
              <BookOpen size={14} className={cn(
                accent === "electric" && "text-electric",
                accent === "cyan" && "text-cyan-brand",
                accent === "purple" && "text-purple-brand",
                accent === "gold" && "text-gold",
                accent === "emerald" && "text-emerald-brand",
                accent === "rose" && "text-rose-brand",
                accent === "navy" && "text-navy"
              )} />
              On this page
            </span>
            <ChevronDown
              size={16}
              className={cn("transition-transform text-muted-foreground", mobileOpen && "rotate-180")}
            />
          </button>
          <AnimatePresence initial={false}>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="p-3 pt-2 border-t border-border mt-1">{navList}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </>
  );
}

/* ============================================================
   Reusable: LegalFooter
   ============================================================ */

function LegalFooter() {
  const navigate = useNavigationStore((s) => s.navigate);
  const related: { view: ViewId; label: string; icon: string }[] = [
    { view: "about", label: "About", icon: "Info" },
    { view: "privacy", label: "Privacy", icon: "ShieldCheck" },
    { view: "terms", label: "Terms", icon: "FileText" },
    { view: "cookies", label: "Cookies", icon: "Cookie" },
    { view: "faq-public", label: "FAQ", icon: "HelpCircle" },
    { view: "contact", label: "Contact", icon: "Mail" },
    { view: "status-page", label: "Status", icon: "Activity" },
    { view: "changelog", label: "Changelog", icon: "GitBranch" },
    { view: "whats-new", label: "What's New", icon: "Bell" },
    { view: "platform-updates", label: "Updates", icon: "Megaphone" },
  ];
  return (
    <footer className="mt-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-10">
        <GlassCard level={3} sheen className="p-6 lg:p-8">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Logo size="sm" />
                <span className="text-xs text-muted-foreground font-medium">Public Information Center</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md mb-5 leading-relaxed">
                Explore LootLoom's policies, platform information, and legal documentation. All
                content is under active development — final wording will appear before launch.
              </p>
              <div className="flex flex-wrap gap-2">
                {related.map((p) => (
                  <button
                    key={p.view}
                    onClick={() => navigate(p.view)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-2 ring-1 ring-border text-xs font-medium text-muted-foreground hover:text-foreground hover:glass-3 transition-all"
                  >
                    <LucideByName name={p.icon} size={12} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 lg:items-end">
              <LootButton
                variant="electric"
                size="md"
                onClick={() => navigate("register")}
                rightIcon={<ArrowRight size={14} />}
              >
                Get Started
              </LootButton>
              <LootButton
                variant="glass"
                size="md"
                onClick={() => navigate("login")}
                leftIcon={<LogIn size={14} />}
              >
                Sign In
              </LootButton>
              <button
                onClick={() => navigate("home")}
                className="text-xs text-muted-foreground hover:text-foreground mt-1 inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={12} /> Back to Home
              </button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>© LootLoom — Public Information Center</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={11} /> Living document — content under active development
            </span>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
}

/* ============================================================
   Reusable: LegalLayout (top bar + header + TOC + content + footer)
   ============================================================ */

function LegalLayout({ meta, children }: { meta: LegalPageMeta; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <LegalTopBar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12">
        <LegalHeader meta={meta} />
        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          <TocNav items={meta.toc} accent={meta.accent} />
          <div className="space-y-6 min-w-0">{children}</div>
        </div>
      </main>
      <LegalFooter />
      <BackToTop />
    </div>
  );
}

/* ============================================================
   Page-section renderer (uses SectionCard for each SectionDef)
   ============================================================ */

function PageSections({ sections }: { sections: SectionDef[] }) {
  return (
    <div className="space-y-6">
      {sections.map((s, i) => (
        <SectionCard
          key={s.id}
          id={s.id}
          index={i}
          icon={s.icon}
          accent={s.accent ?? "electric"}
          title={s.title}
          description={s.description}
          badge={s.badge}
          badgeIcon={s.badge ? <CheckCircle2 size={11} /> : undefined}
          footer={s.footer}
        >
          {s.body}
        </SectionCard>
      ))}
    </div>
  );
}

/* ============================================================
   Page: About
   ============================================================ */

function AboutContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  const sections: SectionDef[] = [
    {
      id: "vision",
      title: "Platform Vision",
      description: "Where LootLoom is headed.",
      icon: "Eye",
      accent: "electric",
      badge: "Vision",
      body: (
        <>
          <p>
            This section will outline LootLoom's long-term vision for the rewards platform — the
            member experience we are building toward and the principles that guide product
            decisions.
          </p>
          <p>
            Details to be finalized. The intent is a transparent, member-first platform where
            everyday time and attention convert fairly into redeemable value.
          </p>
        </>
      ),
    },
    {
      id: "mission",
      title: "Mission",
      description: "What LootLoom exists to do.",
      icon: "Target",
      accent: "cyan",
      badge: "Mission",
      body: (
        <>
          <p>
            This section will outline LootLoom's mission — the concrete member outcomes the
            platform is being built to deliver.
          </p>
          <p>
            Content pending. The mission centers on making rewards accessible, fair, and
            transparent for everyday members.
          </p>
        </>
      ),
    },
    {
      id: "philosophy",
      title: "Reward Platform Philosophy",
      description: "How we think about rewards.",
      icon: "Gift",
      accent: "purple",
      badge: "Philosophy",
      body: (
        <>
          <p>
            This section will outline the philosophy behind LootLoom's reward model — how earning,
            wallet, and redeem flows are designed to be fair and easy to understand.
          </p>
          <p>Specific principles will be documented here once finalized.</p>
        </>
      ),
    },
    {
      id: "user-first",
      title: "User First Experience",
      description: "Members come first.",
      icon: "Users",
      accent: "gold",
      badge: "Member-first",
      body: (
        <>
          <p>
            This section will outline the user-first principles that guide LootLoom's design
            choices — clarity, transparency, and accessible rewards.
          </p>
          <p>Content pending.</p>
        </>
      ),
    },
    {
      id: "security",
      title: "Security Commitment",
      description: "How we approach safety.",
      icon: "ShieldCheck",
      accent: "emerald",
      badge: "Security",
      body: (
        <>
          <p>
            This section will outline LootLoom's commitments to account security, safe reward
            processing, and platform integrity.
          </p>
          <p>Specific security practices will be documented here once finalized.</p>
        </>
      ),
    },
    {
      id: "roadmap",
      title: "Future Roadmap",
      description: "What's coming next.",
      icon: "Rocket",
      accent: "rose",
      badge: "Future",
      body: (
        <>
          <p>
            This section will outline the future roadmap for LootLoom — upcoming features, planned
            improvements, and longer-term directions.
          </p>
          <p>Roadmap details to be finalized.</p>
        </>
      ),
    },
    {
      id: "technology",
      title: "Technology Overview",
      description: "How LootLoom is built.",
      icon: "Cpu",
      accent: "navy",
      badge: "Tech",
      body: (
        <>
          <p>
            This section will outline the technology stack and architecture choices behind
            LootLoom, at a high level.
          </p>
          <p>Content pending.</p>
        </>
      ),
    },
  ];
  return (
    <>
      <PageSections sections={sections} />
      <SectionCard
        id="about-cta"
        index={sections.length}
        icon="Sparkles"
        accent="electric"
        title="Ready to explore LootLoom?"
        description="Create a free account or sign in to continue."
      >
        <div className="flex flex-wrap gap-3">
          <LootButton variant="electric" onClick={() => navigate("register")} leftIcon={<UserPlus size={16} />}>
            Get Started
          </LootButton>
          <LootButton variant="glass" onClick={() => navigate("login")} leftIcon={<LogIn size={16} />}>
            Sign In
          </LootButton>
          <LootButton variant="ghost" onClick={() => navigate("features-overview")} rightIcon={<ArrowRight size={16} />}>
            Browse Features
          </LootButton>
        </div>
      </SectionCard>
    </>
  );
}

/* ============================================================
   Page: Features Overview
   ============================================================ */

const FEATURE_CARDS: {
  category: string;
  items: { title: string; desc: string; icon: string; accent: Accent; locked?: boolean }[];
}[] = [
  {
    category: "Core Platform",
    items: [
      { title: "Authentication", desc: "Secure sign-in, registration, password recovery and email verification flows.", icon: "Fingerprint", accent: "electric" },
      { title: "Dashboard", desc: "Personal hub with balance, activity, missions, daily bonus and quick actions.", icon: "Gauge", accent: "cyan" },
      { title: "Notifications", desc: "Real-time updates for rewards, security, wallet and platform announcements.", icon: "Bell", accent: "purple" },
    ],
  },
  {
    category: "Wallet & Rewards",
    items: [
      { title: "Wallet", desc: "Coin balances, lifetime earnings, transactions and analytics.", icon: "Wallet", accent: "emerald" },
      { title: "Rewards", desc: "Browse the rewards catalog with categories and featured items.", icon: "Gift", accent: "gold" },
      { title: "Redeem", desc: "Convert coins into rewards with a guided redeem workflow.", icon: "HandCoins", accent: "rose" },
    ],
  },
  {
    category: "Social & Competition",
    items: [
      { title: "Leaderboard", desc: "Compete with members worldwide across daily, weekly and monthly periods.", icon: "Trophy", accent: "gold" },
      { title: "Achievements", desc: "Unlock badges and milestones as you progress through the platform.", icon: "Target", accent: "purple" },
      { title: "Referral", desc: "Invite friends and earn bonus coins when they join LootLoom.", icon: "Users", accent: "cyan" },
    ],
  },
  {
    category: "Support & Notifications",
    items: [
      { title: "Support", desc: "Help center, contact channels and ticket tracking.", icon: "LifeBuoy", accent: "electric" },
      { title: "Security", desc: "Account security tools, safe browsing guidance and reporting.", icon: "ShieldCheck", accent: "emerald" },
      { title: "Settings", desc: "Profile, preferences, notifications and privacy controls.", icon: "Settings", accent: "navy" },
    ],
  },
  {
    category: "Future Features",
    items: [
      { title: "Rewarded Ads", desc: "Watch rewarded advertisements to earn coins.", icon: "Play" as string, accent: "electric", locked: true },
      { title: "CEO Dashboard", desc: "Restricted administration area for platform operators.", icon: "Crown", accent: "gold", locked: true },
    ],
  },
];

// `PlayCircle` is a valid lucide icon; cast for typing safety only.
function FeaturesOverviewContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <>
      {FEATURE_CARDS.map((cat, ci) => (
        <motion.section
          key={cat.category}
          id={cat.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
          variants={cardReveal}
          custom={ci}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="scroll-mt-24"
        >
          <GlassCard level={3} sheen className="p-6 lg:p-8 shadow-[var(--shadow-md)]">
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                <IconBadge
                  name={ci === 0 ? "Sparkles" : ci === 1 ? "Wallet" : ci === 2 ? "Users" : ci === 3 ? "LifeBuoy" : "Rocket"}
                  accent={ci === 0 ? "purple" : ci === 1 ? "emerald" : ci === 2 ? "gold" : ci === 3 ? "electric" : "rose"}
                  size="lg"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{cat.category}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {cat.items.length} {cat.items.length === 1 ? "feature" : "features"}
                  </p>
                </div>
              </div>
              {ci === FEATURE_CARDS.length - 1 && (
                <PolicyBadge accent="rose" icon={<Lock size={11} />}>
                  Locked
                </PolicyBadge>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((f, fi) => (
                <InformationCard
                  key={f.title}
                  icon={f.icon}
                  accent={f.accent}
                  title={f.title}
                  index={fi}
                  locked={f.locked}
                >
                  {f.desc}
                </InformationCard>
              ))}
            </div>
          </GlassCard>
        </motion.section>
      ))}
      <SectionCard
        id="features-cta"
        index={FEATURE_CARDS.length}
        icon="Rocket"
        accent="electric"
        title="Want the full tour?"
        description="See the member journey from registration to redeemed reward."
      >
        <div className="flex flex-wrap gap-3">
          <LootButton variant="electric" onClick={() => navigate("how-it-works")} rightIcon={<ArrowRight size={16} />}>
            How it Works
          </LootButton>
          <LootButton variant="glass" onClick={() => navigate("register")} leftIcon={<UserPlus size={16} />}>
            Get Started
          </LootButton>
        </div>
      </SectionCard>
    </>
  );
}

/* ============================================================
   Page: How It Works (animated timeline)
   ============================================================ */

const HOW_STEPS: TimelineItem[] = [
  { title: "Register", desc: "Create your free LootLoom account with email and a secure password.", icon: "UserPlus", accent: "electric", meta: "Step 1" },
  { title: "Login", desc: "Sign in to access your dashboard and start your earning journey.", icon: "LogIn", accent: "cyan", meta: "Step 2" },
  { title: "Dashboard", desc: "View your balance, daily bonus, missions, and quick actions.", icon: "Gauge", accent: "purple", meta: "Step 3" },
  { title: "Earn Coins", desc: "Complete missions, claim daily bonuses, and invite friends.", icon: "Coins", accent: "gold", meta: "Step 4" },
  { title: "Wallet Updated", desc: "Your wallet balance updates as coins are earned.", icon: "Wallet", accent: "emerald", meta: "Step 5" },
  { title: "Redeem Rewards", desc: "Browse rewards and submit a redeem request.", icon: "Gift", accent: "rose", meta: "Step 6" },
  { title: "Review", desc: "Your redeem request is reviewed by the platform.", icon: "Eye", accent: "electric", meta: "Step 7" },
  { title: "Completed", desc: "Receive your reward — the journey complete.", icon: "CheckCircle2", accent: "cyan", meta: "Step 8" },
];

function HowItWorksContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <>
      <SectionCard
        id="overview"
        index={0}
        icon="Workflow"
        accent="cyan"
        title="The Member Journey"
        description="A guided tour of the LootLoom experience — eight steps from sign-up to a redeemed reward."
      >
        <p>
          Each step below corresponds to a stage of the member journey. Click through the timeline
          to see how everything fits together.
        </p>
      </SectionCard>
      <motion.section
        variants={cardReveal}
        custom={1}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <GlassCard level={3} sheen className="p-6 lg:p-8 shadow-[var(--shadow-md)]">
          <div className="flex items-center gap-3 mb-6">
            <IconBadge name="Rocket" accent="cyan" size="lg" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Step-by-step Timeline</h2>
              <p className="text-sm text-muted-foreground mt-0.5">From registration to a completed redeem.</p>
            </div>
          </div>
          <LegalTimeline items={HOW_STEPS} />
        </GlassCard>
      </motion.section>
      <SectionCard
        id="next-steps"
        index={2}
        icon="Sparkles"
        accent="electric"
        title="Ready to start the journey?"
        description="Create your free account to begin."
      >
        <div className="flex flex-wrap gap-3">
          <LootButton variant="electric" onClick={() => navigate("register")} leftIcon={<UserPlus size={16} />}>
            Get Started
          </LootButton>
          <LootButton variant="glass" onClick={() => navigate("features-overview")} rightIcon={<ArrowRight size={16} />}>
            Browse Features
          </LootButton>
        </div>
      </SectionCard>
    </>
  );
}

/* ============================================================
   Page: Help Center
   ============================================================ */

const HELP_CARDS: { title: string; desc: string; icon: string; accent: Accent; articles: string[] }[] = [
  { title: "Getting Started", desc: "Account creation, verification, and first steps.", icon: "Rocket", accent: "electric", articles: ["How to register", "Verifying your email", "Setting up your profile"] },
  { title: "Account", desc: "Managing your LootLoom account.", icon: "UserPlus", accent: "cyan", articles: ["Updating profile info", "Resetting your password", "Account security basics"] },
  { title: "Wallet", desc: "Understanding your coin balance and transactions.", icon: "Wallet", accent: "purple", articles: ["Reading your balance", "Transaction history", "Pending vs available coins"] },
  { title: "Rewards", desc: "Browsing and choosing rewards.", icon: "Gift", accent: "gold", articles: ["Reward categories", "Featured rewards", "Eligibility basics"] },
  { title: "Redeem", desc: "Submitting and tracking redeem requests.", icon: "HandCoins", accent: "rose", articles: ["How to redeem", "Redeem workflow", "Tracking your request"] },
  { title: "Security", desc: "Keeping your account safe.", icon: "ShieldCheck", accent: "emerald", articles: ["Strong passwords", "Recognizing scams", "Reporting issues"] },
];

function HelpCenterContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-5">
        {HELP_CARDS.map((c, i) => (
          <SectionCard
            key={c.title}
            id={c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
            index={i}
            icon={c.icon}
            accent={c.accent}
            title={c.title}
            description={c.desc}
          >
            <ul className="space-y-2">
              {c.articles.map((a) => (
                <li key={a} className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors group">
                  <span className="flex items-center gap-2.5 text-sm text-foreground font-medium">
                    <BookOpen size={14} className="text-muted-foreground group-hover:text-electric transition-colors" />
                    {a}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    Read more
                    <ChevronRight size={11} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground italic pt-2">Article content pending.</p>
          </SectionCard>
        ))}
      </div>
      <SectionCard
        id="more-help"
        index={HELP_CARDS.length}
        icon="LifeBuoy"
        accent="electric"
        title="Need more help?"
        description="Can't find what you're looking for? Our support channels are here for you."
      >
        <div className="flex flex-wrap gap-3">
          <LootButton variant="electric" onClick={() => navigate("contact")} leftIcon={<Mail size={16} />}>
            Contact Us
          </LootButton>
          <LootButton variant="glass" onClick={() => navigate("faq-public")} leftIcon={<HelpCircle size={16} />}>
            Browse FAQ
          </LootButton>
          <LootButton variant="ghost" onClick={() => navigate("register")} rightIcon={<ArrowRight size={16} />}>
            Get Started
          </LootButton>
        </div>
      </SectionCard>
    </>
  );
}

/* ============================================================
   Page: Contact
   ============================================================ */

const CONTACT_CARDS: { title: string; desc: string; icon: string; accent: Accent; status: "active" | "future"; meta: string }[] = [
  { title: "Support Email", desc: "Email our support team for help with your account.", icon: "Mail", accent: "electric", status: "future", meta: "Pending" },
  { title: "Support Portal", desc: "Open and track support tickets from your account.", icon: "LifeBuoy", accent: "cyan", status: "active", meta: "In-app" },
  { title: "Help Center", desc: "Browse knowledge articles and guides.", icon: "BookOpen", accent: "purple", status: "active", meta: "Available" },
  { title: "FAQ", desc: "Quick answers to common questions.", icon: "HelpCircle", accent: "gold", status: "active", meta: "Available" },
  { title: "Live Chat", desc: "Real-time chat with a support agent.", icon: "MessageCircle", accent: "emerald", status: "future", meta: "Coming soon" },
  { title: "Discord", desc: "Join the LootLoom community on Discord.", icon: "Users", accent: "rose", status: "future", meta: "Coming soon" },
  { title: "Telegram", desc: "Follow announcements on Telegram.", icon: "Send" as string, accent: "cyan", status: "future", meta: "Coming soon" },
  { title: "Phone", desc: "Call our support line during business hours.", icon: "Phone", accent: "purple", status: "future", meta: "Coming soon" },
  { title: "Business Contact", desc: "For partnerships and business inquiries.", icon: "Briefcase" as string, accent: "navy", status: "future", meta: "Pending" },
];

function ContactContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CONTACT_CARDS.map((c, i) => (
          <InformationCard
            key={c.title}
            icon={c.icon}
            accent={c.accent}
            title={c.title}
            index={i}
            locked={c.status === "future"}
            badge={c.status === "active" ? c.meta : undefined}
          >
            <p>{c.desc}</p>
            {c.status === "future" && (
              <p className="text-xs italic text-muted-foreground pt-2">
                This channel is not yet active. Details to be finalized.
              </p>
            )}
          </InformationCard>
        ))}
      </div>
      <SectionCard
        id="contact-cta"
        index={CONTACT_CARDS.length}
        icon="Sparkles"
        accent="electric"
        title="Get started with LootLoom"
        description="Create a free account to access the in-app support portal."
      >
        <div className="flex flex-wrap gap-3">
          <LootButton variant="electric" onClick={() => navigate("register")} leftIcon={<UserPlus size={16} />}>
            Get Started
          </LootButton>
          <LootButton variant="glass" onClick={() => navigate("faq-public")} leftIcon={<HelpCircle size={16} />}>
            Browse FAQ
          </LootButton>
        </div>
      </SectionCard>
    </>
  );
}

/* ============================================================
   Page: FAQ (accordion)
   ============================================================ */

const FAQ_CATEGORIES: { id: string; label: string; icon: string; accent: Accent; items: { q: string; a: string }[] }[] = [
  {
    id: "account",
    label: "Account",
    icon: "UserPlus",
    accent: "electric",
    items: [
      { q: "How do I create a LootLoom account?", a: "Content pending. This answer will explain the registration flow once finalized." },
      { q: "How do I verify my email?", a: "Content pending. Email verification steps will be documented here." },
      { q: "How do I reset my password?", a: "Content pending. Password reset steps will be documented here." },
    ],
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: "Wallet",
    accent: "cyan",
    items: [
      { q: "What are LootLoom coins?", a: "Content pending. This answer will describe the coin system once finalized." },
      { q: "What's the difference between available and pending coins?", a: "Content pending." },
      { q: "Where can I see my transactions?", a: "Content pending." },
    ],
  },
  {
    id: "rewards",
    label: "Rewards",
    icon: "Gift",
    accent: "purple",
    items: [
      { q: "What rewards are available?", a: "Content pending. Reward catalog details will be documented here." },
      { q: "How are reward prices set?", a: "Content pending." },
    ],
  },
  {
    id: "redeem",
    label: "Redeem",
    icon: "HandCoins",
    accent: "gold",
    items: [
      { q: "How do I redeem a reward?", a: "Content pending. The redeem workflow will be documented here." },
      { q: "How long does redemption take?", a: "Content pending." },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: "ShieldCheck",
    accent: "emerald",
    items: [
      { q: "How do I keep my account secure?", a: "Content pending. Account security recommendations will be documented here." },
      { q: "What should I do if I notice suspicious activity?", a: "Content pending." },
    ],
  },
  {
    id: "referral",
    label: "Referral",
    icon: "Users",
    accent: "rose",
    items: [
      { q: "How does the referral program work?", a: "Content pending. Referral reward details will be documented here." },
      { q: "When do I receive referral bonuses?", a: "Content pending." },
    ],
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: "Trophy",
    accent: "navy",
    items: [
      { q: "How are leaderboard ranks calculated?", a: "Content pending." },
      { q: "What are the leaderboard periods?", a: "Content pending." },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "Bell",
    accent: "electric",
    items: [
      { q: "Can I customize which notifications I receive?", a: "Content pending. Notification preferences will be documented here." },
      { q: "Where can I see past notifications?", a: "Content pending." },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: "LifeBuoy",
    accent: "cyan",
    items: [
      { q: "How do I contact support?", a: "Content pending. Contact channels will be documented here." },
      { q: "What are support hours?", a: "Content pending." },
    ],
  },
  {
    id: "general",
    label: "General",
    icon: "Sparkles",
    accent: "purple",
    items: [
      { q: "Is LootLoom free to use?", a: "Content pending." },
      { q: "Which countries does LootLoom support?", a: "Content pending." },
    ],
  },
];

function FaqPublicContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [activeCat, setActiveCat] = useState<string>("account");
  const current = FAQ_CATEGORIES.find((c) => c.id === activeCat) ?? FAQ_CATEGORIES[0];
  return (
    <>
      <SectionCard
        id={current.id}
        index={0}
        icon={current.icon}
        accent={current.accent}
        title={`${current.label} Questions`}
        description={`Frequently asked questions about ${current.label.toLowerCase()}.`}
        badge="FAQ"
      >
        <div className="flex flex-wrap gap-2 -mt-1 mb-4">
          {FAQ_CATEGORIES.map((c) => (
            <button
              key={c.id}
              id={c.id}
              onClick={() => {
                setActiveCat(c.id);
                document.getElementById(c.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 transition-all",
                activeCat === c.id
                  ? cn(
                      "text-foreground",
                      POLICY_BADGE_CLASS[c.accent]
                    )
                  : "text-muted-foreground ring-border hover:text-foreground hover:bg-accent"
              )}
            >
              <LucideByName name={c.icon} size={12} />
              {c.label}
            </button>
          ))}
        </div>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {current.items.map((item, i) => (
            <GlassCard key={i} level={2} className="px-4">
              <AccordionItem value={`q-${i}`} className="border-b-0">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4">
                  <span className="flex items-start gap-2.5 text-left">
                    <HelpCircle size={14} className={cn("mt-0.5 shrink-0", "text-electric")} />
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-7">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            </GlassCard>
          ))}
        </Accordion>
      </SectionCard>
      <SectionCard
        id="more-help"
        index={1}
        icon="LifeBuoy"
        accent="electric"
        title="Still have questions?"
        description="Reach out through our support channels."
      >
        <div className="flex flex-wrap gap-3">
          <LootButton variant="electric" onClick={() => navigate("contact")} leftIcon={<Mail size={16} />}>
            Contact Us
          </LootButton>
          <LootButton variant="glass" onClick={() => navigate("help-center")} leftIcon={<BookOpen size={16} />}>
            Help Center
          </LootButton>
        </div>
      </SectionCard>
    </>
  );
}

/* ============================================================
   Page: Privacy Policy
   ============================================================ */

function PrivacyContent() {
  const sections: SectionDef[] = [
    {
      id: "collection",
      title: "Information Collection",
      description: "What information LootLoom intends to collect.",
      icon: "Database",
      accent: "emerald",
      body: (
        <p>
          This section will outline the categories of information LootLoom collects — account
          information, usage information, and technical data. Specific categories will be
          documented here once finalized.
        </p>
      ),
    },
    {
      id: "account",
      title: "Account Information",
      description: "Information you provide when creating an account.",
      icon: "UserPlus",
      accent: "electric",
      body: (
        <p>
          This section will outline the account information collected at registration — such as
          name, username, email, and authentication credentials. Details to be finalized.
        </p>
      ),
    },
    {
      id: "usage",
      title: "Usage Information",
      description: "Information about how you use LootLoom.",
      icon: "Activity",
      accent: "cyan",
      body: (
        <p>
          This section will outline the usage information collected as you interact with LootLoom —
          activity, transactions, and engagement signals. Content pending.
        </p>
      ),
    },
    {
      id: "cookies",
      title: "Cookies",
      description: "How cookies and similar technologies are used.",
      icon: "Cookie",
      accent: "gold",
      body: (
        <p>
          This section will outline the cookies and similar storage technologies LootLoom uses.
          See the dedicated Cookie Policy for category-level detail. Only cookies actually in use
          will be described.
        </p>
      ),
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "How platform analytics work.",
      icon: "Gauge",
      accent: "purple",
      body: (
        <p>
          This section will outline any analytics tooling LootLoom uses to understand platform
          usage. Details to be finalized — no third-party analytics are wired in yet.
        </p>
      ),
    },
    {
      id: "security",
      title: "Security",
      description: "How your information is protected.",
      icon: "ShieldCheck",
      accent: "emerald",
      body: (
        <p>
          This section will outline the security measures LootLoom takes to protect member
          information. Specific practices will be documented here once finalized.
        </p>
      ),
    },
    {
      id: "retention",
      title: "Data Retention",
      description: "How long information is kept.",
      icon: "Clock",
      accent: "navy",
      body: (
        <p>
          This section will outline how long LootLoom retains member information. Retention
          periods will be documented here once finalized.
        </p>
      ),
    },
    {
      id: "rights",
      title: "User Rights",
      description: "Your rights regarding your information.",
      icon: "Users",
      accent: "rose",
      body: (
        <p>
          This section will outline the rights members have regarding their information — access,
          correction, deletion, and export. Details to be finalized.
        </p>
      ),
    },
    {
      id: "children",
      title: "Children's Privacy",
      description: "LootLoom and users under the minimum age.",
      icon: "Shield",
      accent: "gold",
      body: (
        <p>
          This section will outline LootLoom's stance on children's privacy and the minimum age
          requirement for using the platform. Content pending.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How to reach us about privacy.",
      icon: "Mail",
      accent: "electric",
      body: (
        <p>
          This section will provide a privacy contact channel once finalized. Until then, please
          use the in-app support portal or the Contact page.
        </p>
      ),
    },
  ];
  return (
    <>
      <WarningCard title="This policy is a work in progress" accent="gold" icon="AlertTriangle">
        <p>
          The structure below is a placeholder. Specific data practices, retention periods, and
          contact details will be added before this policy takes effect.
        </p>
      </WarningCard>
      <PageSections sections={sections} />
    </>
  );
}

/* ============================================================
   Page: Terms & Conditions
   ============================================================ */

function TermsContent() {
  const sections: SectionDef[] = [
    { id: "account", title: "Account Responsibilities", description: "Your responsibilities as an account holder.", icon: "UserPlus", accent: "navy", body: <p>This section will outline member responsibilities when creating and using a LootLoom account. Details to be finalized.</p> },
    { id: "usage", title: "Platform Usage", description: "How the platform may be used.", icon: "Globe", accent: "electric", body: <p>This section will outline the permitted uses of LootLoom. Content pending.</p> },
    { id: "rewards", title: "Reward Rules", description: "Rules governing rewards.", icon: "Gift", accent: "purple", body: <p>This section will outline how rewards are earned, valued, and managed. Details to be finalized.</p> },
    { id: "redeem", title: "Redeem Rules", description: "Rules governing redemptions.", icon: "HandCoins", accent: "gold", body: <p>This section will outline the rules for redeeming coins, including eligibility and processing. Content pending.</p> },
    { id: "conduct", title: "User Conduct", description: "Expected member conduct.", icon: "Users", accent: "rose", body: <p>This section will outline expected member conduct and prohibited behavior. See also the Community Guidelines. Details to be finalized.</p> },
    { id: "ip", title: "Intellectual Property", description: "Ownership of platform content.", icon: "Copyright", accent: "cyan", body: <p>This section will outline intellectual property ownership of LootLoom content. See also the Copyright Notice. Content pending.</p> },
    { id: "termination", title: "Termination", description: "How accounts may be terminated.", icon: "Lock", accent: "emerald", body: <p>This section will outline how accounts may be terminated by members or by LootLoom. Details to be finalized.</p> },
    { id: "liability", title: "Limitation of Liability", description: "Limits on LootLoom's liability.", icon: "Shield", accent: "navy", body: <p>This section will outline limitations of liability. Content pending.</p> },
    { id: "payments", title: "Payment Terms", description: "Future payment terms.", icon: "HandCoins", accent: "gold", body: <p>This section will outline payment terms once paid features are introduced. No paid features are active yet — details to be finalized.</p> },
    { id: "disputes", title: "Dispute Resolution", description: "How disputes will be handled.", icon: "ScrollText", accent: "rose", body: <p>This section will outline how disputes between members and LootLoom will be resolved. Content pending.</p> },
  ];
  return (
    <>
      <WarningCard title="These terms are a draft" accent="gold" icon="AlertTriangle">
        <p>
          The structure below is a placeholder. Specific terms will be added and reviewed before
          these terms take effect.
        </p>
      </WarningCard>
      <PageSections sections={sections} />
    </>
  );
}

/* ============================================================
   Page: Cookies
   ============================================================ */

function CookiesContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  const sections: SectionDef[] = [
    { id: "necessary", title: "Necessary Cookies", description: "Essential cookies required for the platform to function.", icon: "Lock", accent: "electric", body: <p>This section will outline the strictly necessary cookies LootLoom uses — for example, session and authentication cookies. Specific cookie names will be documented here once finalized.</p> },
    { id: "functional", title: "Functional Cookies", description: "Cookies that enable enhanced functionality.", icon: "Settings", accent: "cyan", body: <p>This section will outline functional cookies — for example, preference persistence. Content pending.</p> },
    { id: "analytics", title: "Analytics", description: "Analytics cookies — future.", icon: "Gauge", accent: "purple", body: <p>This section will outline any analytics cookies LootLoom may use in the future. No third-party analytics are wired in yet. Details to be finalized.</p> },
    { id: "preferences", title: "Preference Storage", description: "How preferences are stored locally.", icon: "Database", accent: "gold", body: <p>This section will outline how LootLoom stores member preferences — for example, theme and sidebar state — using browser local storage. Content pending.</p> },
    { id: "advertising", title: "Advertising Cookies", description: "Advertising cookies — future.", icon: "Megaphone", accent: "rose", body: <p>This section will outline any advertising cookies that may be introduced alongside future ad features. No advertising cookies are in use. Details to be finalized.</p> },
  ];
  return (
    <>
      <PageSections sections={sections} />
      <SectionCard
        id="cookies-cta"
        index={sections.length}
        icon="BookOpen"
        accent="gold"
        title="Related documentation"
        description="Cross-reference with the Privacy Policy."
      >
        <div className="flex flex-wrap gap-3">
          <LootButton variant="glass" onClick={() => navigate("privacy")} leftIcon={<ShieldCheck size={16} />}>
            Privacy Policy
          </LootButton>
          <LootButton variant="glass" onClick={() => navigate("terms")} leftIcon={<FileText size={16} />}>
            Terms
          </LootButton>
        </div>
      </SectionCard>
    </>
  );
}

/* ============================================================
   Page: Community Guidelines
   ============================================================ */

function CommunityGuidelinesContent() {
  const rules: { id: string; title: string; desc: string; icon: string; accent: Accent }[] = [
    { id: "respect", title: "Respect Others", desc: "Treat fellow members with respect. Harassment and personal attacks are not tolerated.", icon: "Users", accent: "electric" },
    { id: "abuse", title: "No Abuse", desc: "Abusive behavior toward members or staff is prohibited.", icon: "Shield", accent: "rose" },
    { id: "spam", title: "No Spam", desc: "Do not post spam, repetitive content, or unsolicited promotions.", icon: "AlertTriangle", accent: "gold" },
    { id: "fraud", title: "No Fraud", desc: "Attempting to defraud LootLoom or other members is prohibited.", icon: "Lock", accent: "rose" },
    { id: "fair", title: "Fair Usage", desc: "Use LootLoom fairly. Do not attempt to game earning or reward systems.", icon: "Scale" as string, accent: "cyan" },
    { id: "integrity", title: "Reward Integrity", desc: "Do not attempt to manipulate rewards, balances, or redemptions.", icon: "Gift", accent: "purple" },
    { id: "safety", title: "Account Safety", desc: "Keep your account secure. Do not share credentials or use automated tooling.", icon: "ShieldCheck", accent: "emerald" },
    { id: "reporting", title: "Reporting Violations", desc: "Report violations through the in-app support portal.", icon: "LifeBuoy", accent: "navy" },
  ];
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-5">
        {rules.map((r, i) => (
          <SectionCard
            key={r.id}
            id={r.id}
            index={i}
            icon={r.icon}
            accent={r.accent}
            title={r.title}
            badge={`Rule ${i + 1}`}
          >
            <p>{r.desc}</p>
            <p className="text-xs italic text-muted-foreground pt-1">Specific consequences and enforcement details to be finalized.</p>
          </SectionCard>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   Page: Security Policy
   ============================================================ */

function SecurityPolicyContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  const sections: SectionDef[] = [
    { id: "account", title: "Account Security", description: "How to keep your account secure.", icon: "ShieldCheck", accent: "emerald", body: <p>This section will outline LootLoom's account security recommendations and the controls available to members. Content pending.</p> },
    { id: "password", title: "Password Tips", description: "Best practices for passwords.", icon: "Lock", accent: "electric", body: <p>This section will outline password best practices — length, uniqueness, and use of a password manager. Details to be finalized.</p> },
    { id: "browsing", title: "Safe Browsing", description: "Staying safe online.", icon: "Globe", accent: "cyan", body: <p>This section will outline safe browsing recommendations when using LootLoom. Content pending.</p> },
    { id: "scam", title: "Scam Awareness", description: "Recognizing and avoiding scams.", icon: "AlertTriangle", accent: "gold", body: <p>This section will outline common scams and how to recognize them. Details to be finalized.</p> },
    { id: "2fa", title: "Two-Factor Authentication", description: "2FA — future.", icon: "Fingerprint", accent: "purple", body: <p>This section will outline two-factor authentication once it is introduced. 2FA is not yet available. Details to be finalized.</p> },
    { id: "device", title: "Device Verification", description: "Device verification — future.", icon: "Cpu", accent: "rose", body: <p>This section will outline device verification once it is introduced. Device verification is not yet available. Content pending.</p> },
    { id: "reporting", title: "Reporting Security Issues", description: "How to report security issues.", icon: "LifeBuoy", accent: "navy", body: <p>This section will outline how to report security issues to LootLoom. A dedicated security contact channel will be published here once finalized.</p> },
    {
      id: "timeline",
      title: "Security Timeline",
      description: "Planned security features.",
      icon: "Clock",
      accent: "electric",
      body: (
        <LegalTimeline
          items={[
            { title: "Account Security Basics", desc: "Strong passwords, secure sessions — in progress.", icon: "ShieldCheck", accent: "emerald", meta: "Active" },
            { title: "Two-Factor Authentication", desc: "Optional 2FA for members — planned.", icon: "Fingerprint", accent: "purple", meta: "Future" },
            { title: "Device Verification", desc: "Recognized-device prompts — planned.", icon: "Cpu", accent: "rose", meta: "Future" },
            { title: "Security Audit Log", desc: "Member-visible audit log — planned.", icon: "Eye", accent: "cyan", meta: "Future" },
          ]}
        />
      ),
    },
    { id: "status", title: "Security Status", description: "Current security posture.", icon: "Activity", accent: "emerald", body: <p>This section will outline the current security status of LootLoom. Content pending — see the Status page for live-style platform status.</p> },
  ];
  return (
    <>
      <PageSections sections={sections} />
      <SectionCard
        id="security-cta"
        index={sections.length}
        icon="LifeBuoy"
        accent="emerald"
        title="Found a security issue?"
        description="Report it through the in-app support portal."
      >
        <div className="flex flex-wrap gap-3">
          <LootButton variant="electric" onClick={() => navigate("contact")} leftIcon={<Mail size={16} />}>
            Contact
          </LootButton>
          <LootButton variant="glass" onClick={() => navigate("status-page")} leftIcon={<Activity size={16} />}>
            Platform Status
          </LootButton>
        </div>
      </SectionCard>
    </>
  );
}

/* ============================================================
   Page: Disclaimer
   ============================================================ */

function DisclaimerContent() {
  const sections: SectionDef[] = [
    { id: "general", title: "General Disclaimer", description: "General information about the platform.", icon: "Info", accent: "gold", body: <p>This section will outline general disclaimers about the LootLoom platform. Content pending.</p> },
    { id: "rewards", title: "Rewards Disclaimer", description: "Disclaimers about rewards.", icon: "Gift", accent: "purple", body: <p>This section will outline disclaimers about reward availability, value, and processing. Details to be finalized.</p> },
    { id: "availability", title: "Availability Disclaimer", description: "Platform availability.", icon: "Server", accent: "cyan", body: <p>This section will outline that LootLoom may not always be available and may be modified or discontinued. Content pending.</p> },
    { id: "external", title: "External Links", description: "Links to third-party content.", icon: "Globe", accent: "electric", body: <p>This section will outline LootLoom's stance on external links. Details to be finalized.</p> },
    { id: "liability", title: "Liability", description: "Limits of liability.", icon: "Shield", accent: "rose", body: <p>This section will outline limits of liability. Content pending — see also the Terms.</p> },
    { id: "changes", title: "Changes to this Disclaimer", description: "How this disclaimer may change.", icon: "RefreshCw", accent: "navy", body: <p>This section will outline how this disclaimer may be updated over time. Details to be finalized.</p> },
  ];
  return (
    <>
      <WarningCard title="Disclaimer is a draft" accent="gold" icon="AlertTriangle">
        <p>The structure below is a placeholder. Specific disclaimers will be added before this document takes effect.</p>
      </WarningCard>
      <PageSections sections={sections} />
    </>
  );
}

/* ============================================================
   Page: Copyright
   ============================================================ */

function CopyrightContent() {
  const sections: SectionDef[] = [
    { id: "ownership", title: "Ownership", description: "Who owns LootLoom content.", icon: "Copyright", accent: "purple", body: <p>This section will outline ownership of LootLoom platform content, branding, and software. Content pending.</p> },
    { id: "license", title: "License to Use", description: "The license granted to members.", icon: "FileText", accent: "electric", body: <p>This section will outline the limited license granted to members to use LootLoom. Details to be finalized.</p> },
    { id: "trademarks", title: "Trademarks", description: "LootLoom trademarks and branding.", icon: "Tag", accent: "gold", body: <p>This section will outline LootLoom's trademarks and branding guidelines. Content pending.</p> },
    { id: "user-content", title: "User Content", description: "Content submitted by members.", icon: "Users", accent: "cyan", body: <p>This section will outline how member-submitted content is handled. Details to be finalized.</p> },
    { id: "infringement", title: "Infringement", description: "Reporting intellectual property infringement.", icon: "AlertTriangle", accent: "rose", body: <p>This section will outline how to report intellectual property infringement. See also the DMCA Policy. Content pending.</p> },
    { id: "contact", title: "Contact", description: "How to reach us about copyright.", icon: "Mail", accent: "emerald", body: <p>This section will provide a copyright contact channel once finalized.</p> },
  ];
  return <PageSections sections={sections} />;
}

/* ============================================================
   Page: DMCA
   ============================================================ */

function DmcaContent() {
  const sections: SectionDef[] = [
    { id: "overview", title: "Overview", description: "About this DMCA policy.", icon: "ScrollText", accent: "rose", body: <p>This section will outline how LootLoom intends to respond to DMCA notices. Details to be finalized.</p> },
    { id: "notice", title: "DMCA Notice", description: "How to submit a DMCA notice.", icon: "FileText", accent: "electric", body: <p>This section will outline the requirements for a valid DMCA notice and where to submit it. Content pending.</p> },
    { id: "counter-notice", title: "Counter-Notice", description: "How to submit a counter-notice.", icon: "RefreshCw", accent: "cyan", body: <p>This section will outline the counter-notice process. Details to be finalized.</p> },
    { id: "repeat", title: "Repeat Infringers", description: "How repeat infringers are handled.", icon: "Lock", accent: "purple", body: <p>This section will outline how LootLoom handles repeat infringers. Content pending.</p> },
    { id: "contact", title: "Contact", description: "DMCA contact channel.", icon: "Mail", accent: "emerald", body: <p>This section will provide a DMCA contact channel once finalized.</p> },
  ];
  return (
    <>
      <WarningCard title="DMCA policy is a draft" accent="gold" icon="AlertTriangle">
        <p>The structure below is a placeholder. Specific DMCA procedures will be added before this policy takes effect.</p>
      </WarningCard>
      <PageSections sections={sections} />
    </>
  );
}

/* ============================================================
   Page: Refund
   ============================================================ */

function RefundContent() {
  const sections: SectionDef[] = [
    { id: "overview", title: "Overview", description: "About this refund policy.", icon: "HandCoins", accent: "cyan", body: <p>This section will outline LootLoom's approach to refunds and reversals. Details to be finalized.</p> },
    { id: "eligibility", title: "Eligibility", description: "What is eligible for a refund.", icon: "CheckCircle2", accent: "electric", body: <p>This section will outline what is eligible for a refund. Content pending.</p> },
    { id: "process", title: "Refund Process", description: "How refunds are requested and processed.", icon: "RefreshCw", accent: "purple", body: <p>This section will outline the refund request and processing flow. Details to be finalized.</p> },
    { id: "timeline", title: "Timeline", description: "How long refunds take.", icon: "Clock", accent: "gold", body: <p>This section will outline refund processing timelines. Content pending.</p> },
    { id: "exceptions", title: "Exceptions", description: "Cases where refunds do not apply.", icon: "AlertTriangle", accent: "rose", body: <p>This section will outline cases where refunds do not apply. Details to be finalized.</p> },
    { id: "contact", title: "Contact", description: "How to reach us about refunds.", icon: "Mail", accent: "emerald", body: <p>This section will provide a refund contact channel once finalized.</p> },
  ];
  return (
    <>
      <WarningCard title="Refund policy is a draft" accent="gold" icon="AlertTriangle">
        <p>The structure below is a placeholder. Specific refund terms will be added before this policy takes effect.</p>
      </WarningCard>
      <PageSections sections={sections} />
    </>
  );
}

/* ============================================================
   Page: Status Page
   ============================================================ */

const STATUS_ITEMS: { id: string; title: string; desc: string; icon: string; accent: Accent; status: "operational" | "maintenance" | "issue"; note?: string }[] = [
  { id: "system", title: "System Status", desc: "Overall LootLoom platform status.", icon: "Activity", accent: "emerald", status: "operational", note: "Display only — real monitoring to be wired in." },
  { id: "auth", title: "Authentication", desc: "Login, registration, session management.", icon: "Fingerprint", accent: "electric", status: "operational" },
  { id: "wallet", title: "Wallet", desc: "Balances and transactions.", icon: "Wallet", accent: "cyan", status: "operational" },
  { id: "rewards", title: "Rewards", desc: "Reward catalog browsing.", icon: "Gift", accent: "purple", status: "operational" },
  { id: "redeem", title: "Redeem", desc: "Redeem request submission.", icon: "HandCoins", accent: "gold", status: "maintenance", note: "Processing times may be longer than usual." },
  { id: "notifications", title: "Notifications", desc: "In-app notification delivery.", icon: "Bell", accent: "rose", status: "operational" },
  { id: "support", title: "Support", desc: "In-app support portal.", icon: "LifeBuoy", accent: "navy", status: "operational" },
  { id: "future", title: "Future Services", desc: "Ad network, public APIs, and more.", icon: "Rocket", accent: "purple", status: "issue", note: "Not yet available — coming soon." },
];

const STATUS_META: Record<"operational" | "maintenance" | "issue", { variant: "success" | "warning" | "error"; label: string }> = {
  operational: { variant: "success", label: "Operational" },
  maintenance: { variant: "warning", label: "Maintenance" },
  issue: { variant: "error", label: "Issue" },
};

function StatusPageContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <>
      <SectionCard
        id="overview"
        index={0}
        icon="Activity"
        accent="emerald"
        title="Live-style Status Overview"
        description="A premium status board for LootLoom services."
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge variant="success" dot pulse>
            All systems nominal
          </StatusBadge>
          <PolicyBadge accent="gold" icon={<Clock size={11} />}>
            Display only
          </PolicyBadge>
          <p className="text-xs text-muted-foreground">
            Status values shown are placeholders — real-time monitoring will be wired in later.
          </p>
        </div>
      </SectionCard>
      <div className="grid sm:grid-cols-2 gap-5">
        {STATUS_ITEMS.map((s, i) => {
          const meta = STATUS_META[s.status];
          return (
            <motion.section
              key={s.id}
              id={s.id}
              variants={cardReveal}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="scroll-mt-24"
            >
              <GlassCard level={3} sheen className="p-5 lg:p-6 shadow-[var(--shadow-md)] h-full">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <IconBadge name={s.icon} accent={s.accent} size="md" />
                  <StatusBadge variant={meta.variant} dot pulse>
                    {meta.label}
                  </StatusBadge>
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                {s.note && (
                  <p className="text-xs italic text-muted-foreground pt-2 mt-2 border-t border-border">{s.note}</p>
                )}
              </GlassCard>
            </motion.section>
          );
        })}
      </div>
      <SectionCard
        id="status-cta"
        index={STATUS_ITEMS.length + 1}
        icon="Bell"
        accent="emerald"
        title="Stay informed"
        description="Get notified about platform updates."
      >
        <div className="flex flex-wrap gap-3">
          <LootButton variant="electric" onClick={() => navigate("platform-updates")} leftIcon={<Megaphone size={16} />}>
            Platform Updates
          </LootButton>
          <LootButton variant="glass" onClick={() => navigate("changelog")} leftIcon={<GitBranch size={16} />}>
            Changelog
          </LootButton>
        </div>
      </SectionCard>
    </>
  );
}

/* ============================================================
   Page: Changelog
   ============================================================ */

const CHANGELOG_VERSIONS: { version: string; date: string; tag: string; accent: Accent; sections: { label: string; icon: string; items: string[] }[] }[] = [
  {
    version: "v0.1.0",
    date: "Coming soon",
    tag: "Initial preview",
    accent: "electric",
    sections: [
      { label: "New Features", icon: "Sparkles", items: ["Core platform scaffold", "Authentication flow", "Dashboard, wallet, earn, rewards views"] },
      { label: "Bug Fixes", icon: "CheckCircle2", items: ["To be listed once releases ship"] },
      { label: "Security Improvements", icon: "ShieldCheck", items: ["To be listed once releases ship"] },
      { label: "Performance", icon: "Zap", items: ["To be listed once releases ship"] },
    ],
  },
  {
    version: "Future",
    date: "Planned",
    tag: "Roadmap",
    accent: "purple",
    sections: [
      { label: "Future Releases", icon: "Rocket", items: ["Rewarded ads", "Two-factor authentication", "Device verification", "Public APIs"] },
    ],
  },
];

function ChangelogContent() {
  return (
    <>
      <SectionCard
        id="latest"
        index={0}
        icon="GitBranch"
        accent="electric"
        title="Latest Version"
        description="The most recent LootLoom release."
      >
        <div className="flex items-center gap-3 flex-wrap">
          <PolicyBadge accent="electric" icon={<Tag size={11} />}>
            {CHANGELOG_VERSIONS[0].version}
          </PolicyBadge>
          <PolicyBadge accent="gold" icon={<Clock size={11} />}>
            {CHANGELOG_VERSIONS[0].date}
          </PolicyBadge>
          <PolicyBadge accent="cyan" icon={<Sparkles size={11} />}>
            {CHANGELOG_VERSIONS[0].tag}
          </PolicyBadge>
        </div>
        <p className="text-xs italic text-muted-foreground pt-1">
          Version numbers and dates are placeholders — the first public release has not shipped yet.
        </p>
      </SectionCard>
      <div className="space-y-6">
        {CHANGELOG_VERSIONS.map((v, vi) => (
          <motion.section
            key={v.version}
            id={vi === 0 ? "features" : "future"}
            variants={cardReveal}
            custom={vi + 1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="scroll-mt-24"
          >
            <GlassCard level={3} sheen className="p-6 lg:p-8 shadow-[var(--shadow-md)]">
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-3">
                  <IconBadge name="GitBranch" accent={v.accent} size="lg" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{v.version}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{v.tag} · {v.date}</p>
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {v.sections.map((sec) => (
                  <div key={sec.label}>
                    <div className="flex items-center gap-2 mb-3">
                      <LucideByName name={sec.icon} size={14} className="text-electric" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{sec.label}</h3>
                    </div>
                    <ul className="space-y-2">
                      {sec.items.map((it, ii) => (
                        <li key={ii} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 size={14} className="text-emerald-brand mt-0.5 shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.section>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   Page: What's New
   ============================================================ */

const WHATS_NEW: { id: string; title: string; desc: string; icon: string; accent: Accent; items: { title: string; desc: string; locked?: boolean }[] }[] = [
  {
    id: "latest",
    title: "Latest Updates",
    desc: "Recent changes to LootLoom.",
    icon: "Bell",
    accent: "purple",
    items: [
      { title: "Public Information Center", desc: "This very page — premium legal & info hub." },
      { title: "Glassmorphism refresh", desc: "Refined glass surfaces across the platform." },
      { title: "Notification center", desc: "Categorized, filterable notifications." },
    ],
  },
  {
    id: "upcoming",
    title: "Upcoming Features",
    desc: "What's coming soon.",
    icon: "Rocket",
    accent: "electric",
    items: [
      { title: "Rewarded Ads", desc: "Watch ads to earn coins.", locked: true },
      { title: "Two-Factor Authentication", desc: "Optional 2FA for members.", locked: true },
      { title: "Device Verification", desc: "Recognized-device prompts.", locked: true },
    ],
  },
  {
    id: "improved",
    title: "Recently Improved",
    desc: "Recently polished areas.",
    icon: "Sparkles",
    accent: "cyan",
    items: [
      { title: "Dashboard layout", desc: "Better information density and hierarchy." },
      { title: "Wallet analytics", desc: "Clearer charts and insights." },
      { title: "Redeem workflow", desc: "Streamlined step-by-step flow." },
    ],
  },
  {
    id: "roadmap",
    title: "Future Roadmap",
    desc: "Longer-term directions.",
    icon: "Target",
    accent: "gold",
    items: [
      { title: "Public APIs", desc: "Open platform integrations.", locked: true },
      { title: "Mobile apps", desc: "Native iOS and Android.", locked: true },
      { title: "Community programs", desc: "Member-driven events.", locked: true },
    ],
  },
];

function WhatsNewContent() {
  return (
    <div className="space-y-6">
      {WHATS_NEW.map((s, si) => (
        <motion.section
          key={s.id}
          id={s.id}
          variants={cardReveal}
          custom={si}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="scroll-mt-24"
        >
          <GlassCard level={3} sheen className="p-6 lg:p-8 shadow-[var(--shadow-md)]">
            <div className="flex items-center gap-3 mb-5">
              <IconBadge name={s.icon} accent={s.accent} size="lg" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{s.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {s.items.map((it, ii) => (
                <InformationCard
                  key={it.title}
                  icon={s.icon}
                  accent={s.accent}
                  title={it.title}
                  index={ii}
                  locked={it.locked}
                >
                  {it.desc}
                </InformationCard>
              ))}
            </div>
          </GlassCard>
        </motion.section>
      ))}
    </div>
  );
}

/* ============================================================
   Page: Platform Updates (announcement cards)
   ============================================================ */

const PLATFORM_UPDATES: { id: string; title: string; body: string; date: string; tag: string; status: "info" | "success" | "warning"; accent: Accent; icon: string }[] = [
  { id: "announcements", title: "Welcome to LootLoom", body: "An overview of what LootLoom is and who it's for. Content pending.", date: "Recently", tag: "Announcement", status: "info", accent: "electric", icon: "Megaphone" },
  { id: "maintenance", title: "Scheduled maintenance window", body: "A placeholder maintenance announcement. Specific dates and times to be finalized.", date: "Upcoming", tag: "Maintenance", status: "warning", accent: "gold", icon: "Server" },
  { id: "releases", title: "Platform release notes", body: "Release notes will be published here as versions ship. Content pending.", date: "Latest", tag: "Release", status: "success", accent: "emerald", icon: "GitBranch" },
  { id: "upcoming", title: "Upcoming capabilities", body: "A preview of future features currently in planning. Content pending.", date: "Planned", tag: "Upcoming", status: "info", accent: "purple", icon: "Rocket" },
];

const UPDATE_STATUS_VARIANT: Record<"info" | "success" | "warning", "info" | "success" | "warning"> = {
  info: "info",
  success: "success",
  warning: "warning",
};

function PlatformUpdatesContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-5">
        {PLATFORM_UPDATES.map((u, i) => (
          <motion.section
            key={u.id}
            id={u.id}
            variants={cardReveal}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="scroll-mt-24"
          >
            <GlassCard level={3} sheen className="p-6 shadow-[var(--shadow-md)] h-full flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-4">
                <IconBadge name={u.icon} accent={u.accent} size="md" />
                <div className="flex items-center gap-2">
                  <PolicyBadge accent={u.accent}>{u.tag}</PolicyBadge>
                  <StatusBadge variant={UPDATE_STATUS_VARIANT[u.status]} dot>
                    {u.date}
                  </StatusBadge>
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">{u.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{u.body}</p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={11} /> Placeholder date
                </span>
                <span className="inline-flex items-center gap-1 text-foreground font-medium">
                  Read more <ChevronRight size={12} />
                </span>
              </div>
            </GlassCard>
          </motion.section>
        ))}
      </div>
      <SectionCard
        id="updates-cta"
        index={PLATFORM_UPDATES.length}
        icon="Bell"
        accent="cyan"
        title="Never miss an update"
        description="Track platform changes through the changelog."
      >
        <div className="flex flex-wrap gap-3">
          <LootButton variant="electric" onClick={() => navigate("changelog")} leftIcon={<GitBranch size={16} />}>
            View Changelog
          </LootButton>
          <LootButton variant="glass" onClick={() => navigate("status-page")} leftIcon={<Activity size={16} />}>
            Platform Status
          </LootButton>
        </div>
      </SectionCard>
    </>
  );
}

/* ============================================================
   Page renderer — maps a ViewId to its content component
   ============================================================ */

function renderPageContent(view: ViewId): React.ReactNode {
  switch (view) {
    case "about":
      return <AboutContent />;
    case "features-overview":
      return <FeaturesOverviewContent />;
    case "how-it-works":
      return <HowItWorksContent />;
    case "help-center":
      return <HelpCenterContent />;
    case "contact":
      return <ContactContent />;
    case "faq-public":
      return <FaqPublicContent />;
    case "privacy":
      return <PrivacyContent />;
    case "terms":
      return <TermsContent />;
    case "cookies":
      return <CookiesContent />;
    case "community-guidelines":
      return <CommunityGuidelinesContent />;
    case "security-policy":
      return <SecurityPolicyContent />;
    case "disclaimer":
      return <DisclaimerContent />;
    case "copyright":
      return <CopyrightContent />;
    case "dmca":
      return <DmcaContent />;
    case "refund":
      return <RefundContent />;
    case "status-page":
      return <StatusPageContent />;
    case "changelog":
      return <ChangelogContent />;
    case "whats-new":
      return <WhatsNewContent />;
    case "platform-updates":
      return <PlatformUpdatesContent />;
    default:
      return null;
  }
}

/* ============================================================
   Main: LegalView
   ============================================================ */

export function LegalView() {
  const current = useNavigationStore((s) => s.current);
  const meta = useMemo(() => LEGAL_PAGES[current], [current]);

  // Reset scroll position when the legal view changes.
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [current]);

  if (!meta) return null;

  return (
    <LegalLayout meta={meta}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {renderPageContent(current)}
        </motion.div>
      </AnimatePresence>
    </LegalLayout>
  );
}
