"use client";

/* ============================================================
   LootLoom — CEO Audit History & Activity Log
   View renders INSIDE the CeoLayout. No sidebar/header/background.
   Backend-ready: empty data array + TODO comment.
   Inherits premium WHITE executive design language (navy + electric).
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import {
  AdminFilter,
  AdminPagination,
  AdminSearch,
  AdminToolbar,
  type AdminColumn,
  DataTable,
} from "@/components/admin";
import {
  EmptyState,
  IconBadge,
  LootButton,
  PageContainer,
  PageHeader,
  SkeletonRow,
  StatusBadge,
} from "@/components/lootloom";
import { cardReveal, staggerContainer } from "@/lib/animations";

/* ----------------------------- Types ----------------------------- */

type ActionType =
  | "redeem_approved"
  | "redeem_rejected"
  | "user_updated"
  | "support_reply"
  | "account_action";

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

interface CeoAuditEntry {
  id: string;
  actionType: ActionType;
  actionLabel: string;
  performedBy: string;
  targetUser?: string;
  date: string; // ISO string
  details: string;
}

interface ActionMeta {
  iconName: string;
  accent: Accent;
  label: string;
}

/* ----------------------------- Meta Maps ----------------------------- */

const ACTION_META: Record<ActionType, ActionMeta> = {
  redeem_approved: { iconName: "CheckCircle2", accent: "emerald", label: "Redeem Approved" },
  redeem_rejected: { iconName: "XCircle", accent: "rose", label: "Redeem Rejected" },
  user_updated: { iconName: "UserCog", accent: "electric", label: "User Updated" },
  support_reply: { iconName: "MessageSquare", accent: "cyan", label: "Support Reply" },
  account_action: { iconName: "Shield", accent: "gold", label: "Account Action" },
};

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Redeem Approved", value: "redeem_approved" },
  { label: "Redeem Rejected", value: "redeem_rejected" },
  { label: "User Updated", value: "user_updated" },
  { label: "Support Reply", value: "support_reply" },
  { label: "Account Action", value: "account_action" },
];

const PAGE_SIZE = 10;

/* ----------------------------- Data ----------------------------- */

// TODO: replace with fetch from /api/ceo/audit
const CEO_HISTORY: CeoAuditEntry[] = [];

/* ----------------------------- Helpers ----------------------------- */

function formatDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "—", time: "" };
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: "—", time: "" };
    return {
      date: d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  } catch {
    return { date: "—", time: "" };
  }
}

/* ----------------------------- View ----------------------------- */

export function CeoHistoryView() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Simulated 600ms loading on mount (backend fetch would go here)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CEO_HISTORY.filter((entry) => {
      if (filter !== "all" && entry.actionType !== filter) return false;
      if (!q) return true;
      return (
        entry.actionLabel.toLowerCase().includes(q) ||
        entry.performedBy.toLowerCase().includes(q) ||
        (entry.targetUser ?? "").toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q)
      );
    });
  }, [search, filter]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleRefresh = () => {
    setLoading(true);
    // TODO: re-fetch /api/ceo/audit
    setTimeout(() => setLoading(false), 500);
  };

  /* ----------------------------- Columns ----------------------------- */

  const columns: AdminColumn<CeoAuditEntry>[] = [
    {
      key: "action",
      header: "Action",
      mobileTitle: true,
      cell: (row) => {
        const meta = ACTION_META[row.actionType];
        return (
          <div className="flex items-center gap-3 min-w-0">
            <IconBadge name={meta.iconName} accent={meta.accent} size="sm" animate={false} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {row.actionLabel}
              </p>
              <p className="text-[11px] text-muted-foreground/80 truncate">{meta.label}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "performedBy",
      header: "Performed By",
      mobileSubtitle: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground font-medium">{row.performedBy}</span>
          <StatusBadge variant="gold" className="uppercase tracking-wide">
            CEO
          </StatusBadge>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-foreground/90">
          {row.targetUser && row.targetUser.trim() ? row.targetUser : "—"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      align: "right",
      cell: (row) => {
        const { date, time } = formatDateTime(row.date);
        return (
          <div className="text-right">
            <p className="text-xs font-semibold text-foreground">{date}</p>
            {time && <p className="text-[11px] text-muted-foreground">{time}</p>}
          </div>
        );
      },
    },
    {
      key: "details",
      header: "Details",
      hideOnMobile: true,
      cell: (row) => (
        <p className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
          {row.details || "—"}
        </p>
      ),
    },
  ];

  /* ----------------------------- Render ----------------------------- */

  return (
    <PageContainer>
      <PageHeader
        title="History"
        description="CEO audit & activity log"
        actions={
          <LootButton
            variant="glass"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </LootButton>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <motion.div variants={cardReveal}>
          <AdminToolbar>
            <AdminSearch
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by action, user, details…"
              className="sm:max-w-md"
            />
            <AdminFilter
              value={filter}
              onChange={handleFilterChange}
              options={FILTER_OPTIONS}
              label="Action Type"
              className="sm:w-56"
            />
          </AdminToolbar>
        </motion.div>

        <motion.div variants={cardReveal}>
          <DataTable
            columns={columns}
            rows={paged}
            rowId={(row) => row.id}
            loading={loading ? <SkeletonRow count={6} /> : undefined}
            emptyState={
              <EmptyState
                icon="History"
                title="No activity yet"
                description="CEO actions will be logged here once the backend is connected"
              />
            }
          />
        </motion.div>

        {!loading && filtered.length > 0 && (
          <motion.div variants={cardReveal}>
            <AdminPagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
