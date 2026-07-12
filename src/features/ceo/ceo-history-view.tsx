"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  date: string;
  details: string;
}

interface ActionMeta {
  iconName: string;
  accent: Accent;
  label: string;
}

interface ApiAuditActor {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface ApiAuditEntry {
  id: string;
  actor: ApiAuditActor;
  action: string;
  targetId: string | null;
  metadata: string | null;
  timestamp: string;
}

interface ApiAuditPagination {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

interface ApiAuditResponse {
  success: boolean;
  data: ApiAuditEntry[];
  pagination: ApiAuditPagination;
  message?: string;
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

function mapActionType(action: string): ActionType {
  switch (action) {
    case "REDEEM_APPROVED":
      return "redeem_approved";
    case "REDEEM_REJECTED":
      return "redeem_rejected";
    case "SUPPORT_ADMIN_REPLY":
      return "support_reply";
    default:
      if (action.startsWith("USER_") || action.startsWith("ACCOUNT_")) return "account_action";
      return "user_updated";
  }
}

function mapActionLabel(action: string): string {
  switch (action) {
    case "REDEEM_APPROVED":
      return "Redeem Approved";
    case "REDEEM_REJECTED":
      return "Redeem Rejected";
    case "SUPPORT_ADMIN_REPLY":
      return "Support Reply";
    default: {
      const parts = action.replace(/^USER_|^ACCOUNT_/, "").split("_");
      return parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }
}

function mapEntry(entry: ApiAuditEntry): CeoAuditEntry {
  let targetUser: string | undefined;
  let details = mapActionLabel(entry.action);

  if (entry.metadata) {
    try {
      const parsed = JSON.parse(entry.metadata);
      if (parsed.userId) targetUser = parsed.userId;
      if (parsed.reason) details = parsed.reason;
      else if (parsed.detail) details = parsed.detail;
      else if (parsed.description) details = parsed.description;
    } catch {
      // invalid JSON in metadata
    }
  }

  return {
    id: entry.id,
    actionType: mapActionType(entry.action),
    actionLabel: mapActionLabel(entry.action),
    performedBy: entry.actor.name || entry.actor.email,
    targetUser,
    date: entry.timestamp,
    details,
  };
}

/* ----------------------------- View ----------------------------- */

export function CeoHistoryView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<CeoAuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("action", filter);
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));

      const resp = await fetch(`/api/ceo/audit?${params.toString()}`);
      if (!resp.ok) throw new Error(`Request failed with status ${resp.status}`);

      const json: ApiAuditResponse = await resp.json();
      if (!json.success) throw new Error(json.message ?? "API returned unsuccessful response");

      setEntries(json.data.map(mapEntry));
      setTotal(json.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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
    if (!q) return entries;
    return entries.filter(
      (entry) =>
        entry.actionLabel.toLowerCase().includes(q) ||
        entry.performedBy.toLowerCase().includes(q) ||
        (entry.targetUser ?? "").toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q),
    );
  }, [search, entries]);

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
            onClick={fetchLogs}
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
            rows={filtered}
            rowId={(row) => row.id}
            loading={loading ? <SkeletonRow count={6} /> : undefined}
            emptyState={
              error ? (
                <EmptyState
                  icon="AlertTriangle"
                  title="Failed to load audit log"
                  description={error}
                />
              ) : (
                <EmptyState
                  icon="History"
                  title="No activity yet"
                  description="CEO actions will appear here as they occur"
                />
              )
            }
          />
        </motion.div>

        {!loading && !error && filtered.length > 0 && (
          <motion.div variants={cardReveal}>
            <AdminPagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
