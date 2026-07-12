"use client";

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
  ErrorState,
} from "@/components/lootloom";
import { AdminStatCard } from "@/components/admin";
import { cardReveal, staggerContainer } from "@/lib/animations";

interface DashboardData {
  stats: {
    totalUsers: number;
    newUsersToday: number;
    totalCoinsDistributed: number;
    totalCoinsInCirculation: number;
    totalCoinsSpent: number;
    totalAdsWatched: number;
    totalRedeems: number;
    pendingRedeems: number;
    completedRedeems: number;
    rejectedRedeems: number;
  };
  recentUsers: unknown[];
  pendingRedeemRequests: unknown[];
  recentTransactions: unknown[];
}

interface KpiConfig {
  key: string;
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
    prefix: "\u20B9",
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

function getKpiValue(data: DashboardData | null, key: string): number {
  if (!data) return 0;
  const s = data.stats;
  switch (key) {
    case "totalUsers":
      return s.totalUsers;
    case "activeUsers":
      return s.totalUsers;
    case "pendingRedeems":
      return s.pendingRedeems;
    case "completedRedeems":
      return s.completedRedeems;
    case "totalCoinsDistributed":
      return s.totalCoinsDistributed;
    case "totalPayoutInr":
      return Math.round(s.totalCoinsSpent / 30);
    case "supportTickets":
      return 0;
    case "securityAlerts":
      return 0;
    default:
      return 0;
  }
}

export function CeoDashboardView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  async function fetchDashboard() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/ceo/dashboard");
      if (!resp.ok) {
        throw new Error(`Request failed with status ${resp.status}`);
      }
      const json = await resp.json();
      if (!json.success) {
        throw new Error(json.message ?? "API returned unsuccessful response");
      }
      setData(json.data as DashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Platform overview at a glance"
        actions={
          <LootButton
            variant="glass"
            size="md"
            onClick={fetchDashboard}
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
      ) : error ? (
        <ErrorState
          title="Failed to load dashboard"
          description={error}
          action={
            <LootButton variant="glass" size="md" onClick={fetchDashboard}>
              Try again
            </LootButton>
          }
        />
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
                  value={getKpiValue(data, kpi.key)}
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
        </motion.div>
      )}
    </PageContainer>
  );
}
