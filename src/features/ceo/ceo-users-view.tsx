"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  Mail,
  Pause,
  RefreshCw,
  Snowflake,
  UserCheck,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  LootButton,
  StatusBadge,
  SkeletonRow,
  EmptyState,
  ErrorState,
} from "@/components/lootloom";
import {
  DataTable,
  type AdminColumn,
  AdminSearch,
  AdminFilter,
  AdminToolbar,
  AdminPagination,
  ActionButton,
  type AdminActionItem,
  ConfirmModal,
} from "@/components/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string | null;
  coins: number;
  totalRedeemedInr: number;
  status: "active" | "suspended" | "frozen";
  createdAt: string;
}

type UserStatus = AdminUser["status"];
type UserAction = "suspend" | "activate" | "freeze";

interface ApiUser {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  memberSince: string;
  lastLogin: string | null;
  profile: { firstName: string | null; lastName: string | null } | null;
  wallet: { coinBalance: number; totalEarned: number; totalSpent: number } | null;
  stats: { transactions: number; redeems: number; ads: number };
}

interface ApiResponse {
  success: boolean;
  data: ApiUser[];
  pagination: { page: number; pageSize: number; total: number };
}

const STATUS_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Frozen", value: "frozen" },
];

const STATUS_META: Record<
  UserStatus,
  { variant: "success" | "warning" | "info"; label: string }
> = {
  active: { variant: "success", label: "Active" },
  suspended: { variant: "warning", label: "Suspended" },
  frozen: { variant: "info", label: "Frozen" },
};

const ACTION_META: Record<
  UserAction,
  {
    title: string;
    description: string;
    confirmLabel: string;
    tone: "warning" | "success" | "danger";
    icon: React.ReactNode;
    label: string;
  }
> = {
  suspend: {
    title: "Suspend User?",
    description:
      "The user will be signed out and unable to log in until reactivated. Their wallet and history are preserved.",
    confirmLabel: "Suspend User",
    tone: "warning",
    icon: <Pause size={14} />,
    label: "Suspend",
  },
  activate: {
    title: "Activate User?",
    description:
      "The user will regain full access to their account and can log in immediately.",
    confirmLabel: "Activate User",
    tone: "success",
    icon: <UserCheck size={14} />,
    label: "Activate",
  },
  freeze: {
    title: "Freeze Account?",
    description:
      "Freezing locks the wallet and blocks all transactions (redeem, earn, transfer). The user can still log in but cannot move funds.",
    confirmLabel: "Freeze Account",
    tone: "danger",
    icon: <Snowflake size={14} />,
    label: "Freeze Account",
  },
};

function formatDate(iso: string): string {
  if (!iso) return "\u2014";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatInr(amount: number): string {
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function statusBadge(status: UserStatus) {
  const meta = STATUS_META[status];
  return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
}

function UserAvatar({
  user,
  className,
}: {
  user: AdminUser;
  className?: string;
}) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`${user.fullName}'s avatar`}
        className={cn(
          "size-9 rounded-full ring-1 ring-border object-cover shrink-0",
          className
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "size-9 inline-flex items-center justify-center rounded-full text-xs font-bold text-white shrink-0",
        "bg-[linear-gradient(120deg,var(--electric),var(--purple-brand))] ring-1 ring-electric/20",
        className
      )}
    >
      {getInitials(user.fullName || user.username)}
    </span>
  );
}

function DetailField({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "gold" | "electric";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-brand"
      : accent === "gold"
      ? "text-gold"
      : accent === "electric"
      ? "text-electric"
      : "text-foreground";
  return (
    <div className="space-y-1 min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <p className={cn("text-sm font-medium truncate", accentClass)}>{value}</p>
    </div>
  );
}

interface DetailModalProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: UserAction, userId: string) => void;
}

function DetailModal({ user, open, onOpenChange, onAction }: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl glass-nav ring-1 ring-border/60 rounded-2xl">
        {user && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg font-bold text-foreground">
                <UserAvatar user={user} className="size-10" />
                <span className="min-w-0 truncate">{user.fullName}</span>
                {statusBadge(user.status)}
              </DialogTitle>
              <DialogDescription className="text-xs">
                User profile detail \u2014 review account and manage status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto lootloom-scroll pr-1">
              <div className="flex items-center gap-4 rounded-xl glass-2 ring-1 ring-border p-4">
                <UserAvatar user={user} className="size-14" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-foreground truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    <Mail size={11} />
                    {user.email}
                  </p>
                </div>
                {statusBadge(user.status)}
              </div>

              <div className="rounded-xl glass-2 ring-1 ring-border p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <DetailField
                    label="Username"
                    value={`@${user.username}`}
                    accent="electric"
                  />
                  <DetailField label="Full Name" value={user.fullName} />
                  <DetailField label="Email" value={user.email} />
                  <DetailField label="User ID" value={user.id} accent="electric" />
                  <DetailField
                    label="Current Coins"
                    value={`${user.coins.toLocaleString("en-IN")}`}
                    accent="gold"
                  />
                  <DetailField
                    label="Total Redeemed"
                    value={formatInr(user.totalRedeemedInr)}
                    accent="emerald"
                  />
                  <DetailField
                    label="Member Since"
                    value={formatDate(user.createdAt)}
                  />
                  <DetailField label="Status" value={STATUS_META[user.status].label} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl glass-2 ring-1 ring-gold/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gold/80 mb-1">
                    Current Coins
                  </p>
                  <p className="text-2xl font-bold text-gold tabular-nums">
                    {user.coins.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl glass-2 ring-1 ring-emerald-brand/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-brand/80 mb-1">
                    Total Redeemed
                  </p>
                  <p className="text-2xl font-bold text-emerald-brand tabular-nums">
                    {formatInr(user.totalRedeemedInr)}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 flex-wrap sm:flex-nowrap">
              <LootButton
                variant="ghost"
                size="md"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Close
              </LootButton>
              <LootButton
                variant="gold"
                size="md"
                leftIcon={<Pause size={15} />}
                disabled={user.status === "suspended"}
                onClick={() => onAction("suspend", user.id)}
                className="flex-1 sm:flex-none"
              >
                Suspend
              </LootButton>
              <LootButton
                variant="emerald"
                size="md"
                leftIcon={<UserCheck size={15} />}
                disabled={user.status === "active"}
                onClick={() => onAction("activate", user.id)}
                className="flex-1 sm:flex-none"
              >
                Activate
              </LootButton>
              <LootButton
                variant="destructive"
                size="md"
                leftIcon={<Snowflake size={15} />}
                disabled={user.status === "frozen"}
                onClick={() => onAction("freeze", user.id)}
                className="flex-1 sm:flex-none"
              >
                Freeze Account
              </LootButton>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function mapApiUser(u: ApiUser): AdminUser {
  return {
    id: u.id,
    username: u.username,
    fullName: u.name,
    email: u.email,
    avatar: u.avatar,
    coins: u.wallet?.coinBalance || 0,
    totalRedeemedInr: Math.round((u.wallet?.totalSpent || 0) / 30),
    status: u.status.toLowerCase() as AdminUser["status"],
    createdAt: u.memberSince,
  };
}

const PAGE_SIZE = 20;

export function CeoUsersView() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    action: UserAction | null;
    userId: string | null;
    loading: boolean;
  }>({ open: false, action: null, userId: null, loading: false });

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));

      const resp = await fetch(`/api/ceo/users?${params.toString()}`);
      if (!resp.ok) {
        setError(`Request failed (${resp.status})`);
        setLoading(false);
        return;
      }
      const json: ApiResponse = await resp.json();
      if (!json.success) {
        setError("Failed to load users");
        setLoading(false);
        return;
      }
      setUsers(json.data.map(mapApiUser));
      setTotal(json.pagination.total);
    } catch {
      setError("Network error \u2014 could not reach the server");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleRefresh() {
    fetchUsers();
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function openDetail(user: AdminUser) {
    setDetailUser(user);
    setDetailOpen(true);
  }

  function openConfirm(action: UserAction, userId: string) {
    setDetailOpen(false);
    setConfirmState({ open: true, action, userId, loading: false });
  }

  function closeConfirm() {
    setConfirmState((s) => ({ ...s, open: false }));
  }

  async function handleConfirm() {
    const { action, userId } = confirmState;
    if (!action || !userId) {
      closeConfirm();
      return;
    }
    setConfirmState((s) => ({ ...s, loading: true }));
    await new Promise((r) => setTimeout(r, 600));
    setConfirmState((s) => ({ ...s, loading: false }));
    closeConfirm();
    const label = ACTION_META[action].label;
    toast({ title: `${label} performed`, description: `User ${userId.slice(0, 8)}\u2026 has been ${action === "activate" ? "activated" : action === "freeze" ? "frozen" : "suspended"}.`, variant: "default" });
  }

  function rowActions(row: AdminUser): AdminActionItem[] {
    return [
      {
        label: "View Profile",
        icon: <Eye size={14} />,
        onClick: () => openDetail(row),
        tone: "info",
      },
      {
        label: "Suspend",
        icon: <Pause size={14} />,
        onClick: () => openConfirm("suspend", row.id),
        tone: "warning",
        disabled: row.status === "suspended",
      },
      {
        label: "Activate",
        icon: <UserCheck size={14} />,
        onClick: () => openConfirm("activate", row.id),
        tone: "success",
        disabled: row.status === "active",
      },
      {
        label: "Freeze Account",
        icon: <Snowflake size={14} />,
        onClick: () => openConfirm("freeze", row.id),
        tone: "danger",
        disabled: row.status === "frozen",
      },
    ];
  }

  const columns: AdminColumn<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      mobileTitle: true,
      cell: (row) => (
        <span className="inline-flex items-center gap-2.5 min-w-0">
          <UserAvatar user={row} />
          <span className="text-sm font-medium text-foreground truncate">
            @{row.username}
          </span>
        </span>
      ),
    },
    {
      key: "fullName",
      header: "Full Name",
      mobileSubtitle: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.fullName}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground truncate inline-flex items-center gap-1">
          <Mail size={11} className="text-muted-foreground/60" />
          {row.email}
        </span>
      ),
    },
    {
      key: "coins",
      header: "Coins",
      align: "right",
      cell: (row) => (
        <span className="text-sm font-semibold text-gold tabular-nums">
          {row.coins.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "totalRedeemedInr",
      header: "Total Redeemed",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm font-semibold text-emerald-brand tabular-nums">
          {formatInr(row.totalRedeemedInr)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => statusBadge(row.status),
    },
    {
      key: "createdAt",
      header: "Created",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      cell: (row) => (
        <ActionButton actions={rowActions(row)} label="User Actions" />
      ),
    },
  ];

  const actionMeta = confirmState.action
    ? ACTION_META[confirmState.action]
    : null;

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Manage platform users and account status"
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

      <div className="space-y-4">
        <AdminToolbar>
          <AdminSearch
            value={search}
            onChange={setSearch}
            placeholder="Search by username, email\u2026"
            className="sm:flex-1"
          />
          <AdminFilter
            value={statusFilter}
            onChange={handleStatusChange}
            options={STATUS_FILTER_OPTIONS}
            placeholder="All Status"
            label="Status"
          />
        </AdminToolbar>

        {error ? (
          <ErrorState
            title="Failed to load users"
            description={error}
            action={
              <LootButton
                variant="glass"
                size="md"
                onClick={handleRefresh}
                leftIcon={<RefreshCw size={15} />}
              >
                Retry
              </LootButton>
            }
          />
        ) : (
          <DataTable<AdminUser>
            columns={columns}
            rows={users}
            rowId={(row) => row.id}
            onRowClick={openDetail}
            loading={loading ? <SkeletonRow count={5} /> : undefined}
            emptyState={
              !loading ? (
                <EmptyState
                  icon="Users"
                  title="No users yet"
                  description={
                    debouncedSearch || statusFilter !== "all"
                      ? "No users match your search criteria"
                      : "No users have been registered yet"
                  }
                />
              ) : undefined
            }
          />
        )}

        {total > PAGE_SIZE && !error && (
          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        )}
      </div>

      <DetailModal
        user={detailUser}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAction={openConfirm}
      />

      <ConfirmModal
        open={confirmState.open}
        onOpenChange={(o) => !o && closeConfirm()}
        title={actionMeta?.title ?? "Confirm Action"}
        description={actionMeta?.description}
        confirmLabel={actionMeta?.confirmLabel ?? "Confirm"}
        cancelLabel="Cancel"
        tone={actionMeta?.tone ?? "default"}
        loading={confirmState.loading}
        onConfirm={handleConfirm}
      />
    </PageContainer>
  );
}
