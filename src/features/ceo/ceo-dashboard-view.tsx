"use client";

/**
 * LootLoom — CeoDashboardView
 * CEO Platform overview: a clean KPI grid with backend-ready values.
 *
 * All stat values default to 0 — there is NO fake data, NO hardcoded
 * numbers, NO charts. A single `STATS` placeholder object holds the
 * values; once the `/api/ceo/dashboard` route exists, replace the object
 * with a `fetch` call and the UI lights up automatically.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Grid,
  SkeletonCard,
  GlassCard,
  LootButton,
  IconBadge,
  StatusBadge,
} from "@/components/lootloom";
import { AdminStatCard } from "@/components/admin";
import { cardReveal, staggerContainer } from "@/lib/animations";

/* ============================================================
   Placeholder stats — initialized to 0 (backend-ready).
   TODO: replace with fetch from /api/ceo/dashboard
   ============================================================ */
const STATS = {
  totalUsers: 0,
  activeUsers: 0,
  pendingRedeems: 0,
  completedRedeems: 0,
  totalCoinsDistributed: 0,
  totalPayoutInr: 0,
  supportTickets: 0,
  securityAlerts: 0,
} as const;

interface KpiConfig {
  key: keyof typeof STATS;
  label: string;
  icon: string;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
  prefix?: string;
  hint?: string;
}

const KPI_GRID: KpiConfig[] = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: "Users",
    accent: "electric",
    hint: "All registered accounts",
  },
  {
    key: "activeUsers",
    label: "Active Users",
    icon: "UserCheck",
    accent: "cyan",
    hint: "Active in last 30 days",
  },
  {
    key: "pendingRedeems",
    label: "Pending Redeems",
    icon: "Clock",
    accent: "gold",
    hint: "Awaiting review",
  },
  {
    key: "completedRedeems",
    label: "Completed Redeems",
    icon: "CheckCircle2",
    accent: "emerald",
    hint: "Fulfilled all-time",
  },
  {
    key: "totalCoinsDistributed",
    label: "Coins Distributed",
    icon: "Coins",
    accent: "purple",
    hint: "Lifetime credits",
  },
  {
    key: "totalPayoutInr",
    label: "Total Payout",
    icon: "IndianRupee",
    accent: "emerald",
    prefix: "₹",
    hint: "Lifetime INR disbursed",
  },
  {
    key: "supportTickets",
    label: "Support Tickets",
    icon: "LifeBuoy",
    accent: "rose",
    hint: "Open + in progress",
  },
  {
    key: "securityAlerts",
    label: "Security Alerts",
    icon: "ShieldAlert",
    accent: "navy",
    hint: "Unresolved alerts",
  },
];

/* ============================================================
   Hint card — shown beneath the stats grid while backend is offline.
   ============================================================ */
function BackendHintCard() {
  return (
    <GlassCard level={1} className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <IconBadge name="Info" accent="electric" size="sm" />
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            Live data will appear once backend is connected
          </p>
          <p className="text-xs text-muted-foreground">
            KPIs currently show placeholder values. Wire{" "}
            <code className="text-[11px] font-mono px-1 py-0.5 rounded bg-muted text-foreground/80">
              /api/ceo/dashboard
            </code>{" "}
            to populate real platform metrics.
          </p>
        </div>
        <StatusBadge variant="warning" dot pulse>
          Awaiting backend
        </StatusBadge>
      </div>
    </GlassCard>
  );
}

/* ============================================================
   Main view
   ============================================================ */
export function CeoDashboardView() {
  const [loading, setLoading] = useState(true);

  // Simulated 600ms load — gives the skeleton a chance to render so the
  // premium feel is preserved while backend wiring is still pending.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  function handleRefresh() {
    setLoading(true);
    // TODO: replace with real fetch + setLoading(false) in finally block.
    setTimeout(() => setLoading(false), 600);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Platform overview at a glance"
        actions={
          <LootButton
            variant="glass"
            size="md"
            onClick={handleRefresh}
            leftIcon={<RefreshCw size={15} />}
            loading={loading}
          >
            Refresh
          </LootButton>
        }
      />

      {loading ? (
        <Grid cols={4}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </Grid>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          <Grid cols={4}>
            {KPI_GRID.map((kpi, i) => (
              <motion.div
                key={kpi.key}
                variants={cardReveal}
                custom={i}
                className="h-full"
              >
                <AdminStatCard
                  label={kpi.label}
                  value={STATS[kpi.key]}
                  prefix={kpi.prefix}
                  icon={kpi.icon}
                  accent={kpi.accent}
                  hint={kpi.hint}
                  index={i}
                  className="h-full"
                />
              </motion.div>
            ))}
          </Grid>

          <BackendHintCard />
        </motion.div>
      )}
    </PageContainer>
  );
}
