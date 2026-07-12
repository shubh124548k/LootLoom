"use client";

/**
 * LootLoom — CeoRedeemView
 * CEO Redeem Requests Management — review and approve user redemption requests.
 *
 * Backend-ready: REDEEM_REQUESTS is initialized to [].
 * TODO: replace with fetch from /api/ceo/redeem
 */
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Coins,
  Eye,
  IndianRupee,
  MessageSquare,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  LootButton,
  StatusBadge,
  SkeletonRow,
  EmptyState,
} from "@/components/lootloom";
import {
  DataTable,
  type AdminColumn,
  AdminSearch,
  AdminFilter,
  AdminToolbar,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* ============================================================
   Types
   ============================================================ */
export interface RedeemRequest {
  id: string;
  username: string;
  fullName: string;
  rewardAmountInr: number;
  coins: number;
  date: string;
  status: "pending" | "approved" | "rejected";
  userMessage?: string;
  adminMessage?: string;
}

type RedeemStatus = RedeemRequest["status"];
type RedeemAction = "approve" | "reject";

/* ============================================================
   Placeholder data — initialized to [] (backend-ready).
   TODO: replace with fetch from /api/ceo/redeem
   ============================================================ */
const REDEEM_REQUESTS: RedeemRequest[] = [];

/* ============================================================
   Constants
   ============================================================ */
const STATUS_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_META: Record<
  RedeemStatus,
  { variant: "warning" | "success" | "error"; label: string; pulse?: boolean }
> = {
  pending: { variant: "warning", label: "Pending", pulse: true },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "error", label: "Rejected" },
};

/* ============================================================
   Helpers
   ============================================================ */
function formatRequestId(id: string): string {
  return `#RR-${id.slice(-6).toUpperCase()}`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function statusBadge(status: RedeemStatus) {
  const meta = STATUS_META[status];
  return (
    <StatusBadge variant={meta.variant} dot pulse={meta.pulse}>
      {meta.label}
    </StatusBadge>
  );
}

/* ============================================================
   Detail Modal sub-components
   ============================================================ */
function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl glass-2 ring-1 ring-border p-4">
      <div className="flex items-center gap-1.5 mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{children}</div>
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
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
      <p
        className={cn(
          "text-sm font-medium truncate",
          accentClass,
          mono && "font-mono"
        )}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   Detail Modal — shown on row click or "View" action
   ============================================================ */
interface DetailModalProps {
  request: RedeemRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function DetailModal({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl glass-nav ring-1 ring-border/60 rounded-2xl">
        {request && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                <span className="font-mono text-electric">
                  {formatRequestId(request.id)}
                </span>
                {statusBadge(request.status)}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Redeem request detail — review and process below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto lootloom-scroll pr-1">
              {/* User Information */}
              <DetailSection title="User Information" icon={<User size={14} />}>
                <DetailField
                  label="Username"
                  value={`@${request.username}`}
                  accent="electric"
                />
                <DetailField label="Full Name" value={request.fullName} />
                <DetailField
                  label="Request ID"
                  value={formatRequestId(request.id)}
                  mono
                />
              </DetailSection>

              {/* Reward Information */}
              <DetailSection
                title="Reward Information"
                icon={<IndianRupee size={14} />}
              >
                <DetailField
                  label="Reward Amount"
                  value={formatInr(request.rewardAmountInr)}
                  accent="emerald"
                />
                <DetailField
                  label="Coins Cost"
                  value={`${request.coins.toLocaleString("en-IN")} Coins`}
                  accent="gold"
                />
                <DetailField label="Date" value={formatDate(request.date)} />
              </DetailSection>

              {/* Coin Deduction note */}
              <div className="flex items-start gap-2.5 rounded-xl glass-2 ring-1 ring-gold/20 p-3.5 text-xs text-muted-foreground">
                <Coins size={14} className="text-gold shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold text-gold">
                    {request.coins.toLocaleString("en-IN")}
                  </span>{" "}
                  coins will be deducted from the user&apos;s wallet on approval.
                </span>
              </div>

              {/* User Message (quote block) */}
              {request.userMessage && (
                <div className="rounded-xl glass-2 ring-1 ring-purple-brand/20 p-4">
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-purple-brand">
                    <MessageSquare size={12} />
                    User Message
                  </div>
                  <p className="text-sm text-foreground/90 italic leading-relaxed">
                    &ldquo;{request.userMessage}&rdquo;
                  </p>
                </div>
              )}

              {/* Existing Admin Message (if previously processed) */}
              {request.adminMessage && (
                <div className="rounded-xl glass-2 ring-1 ring-border p-4">
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <MessageSquare size={12} />
                    Admin Message
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {request.adminMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <DialogFooter className="pt-2">
              <LootButton
                variant="ghost"
                size="md"
                onClick={() => onOpenChange(false)}
              >
                Close
              </LootButton>
              <LootButton
                variant="destructive"
                size="md"
                leftIcon={<XCircle size={15} />}
                disabled={request.status !== "pending"}
                onClick={() => onReject(request.id)}
              >
                Reject
              </LootButton>
              <LootButton
                variant="emerald"
                size="md"
                leftIcon={<CheckCircle2 size={15} />}
                disabled={request.status !== "pending"}
                onClick={() => onApprove(request.id)}
              >
                Approve
              </LootButton>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Main View
   ============================================================ */
export function CeoRedeemView() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<RedeemRequest | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    action: RedeemAction | null;
    requestId: string | null;
    adminMessage: string;
    loading: boolean;
  }>({ open: false, action: null, requestId: null, adminMessage: "", loading: false });

  // Simulated 600ms load — gives the skeleton a chance to render while the
  // backend wiring is still pending.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  function handleRefresh() {
    setLoading(true);
    // TODO: replace with real fetch + setLoading(false) in finally block.
    setTimeout(() => setLoading(false), 600);
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REDEEM_REQUESTS.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.username.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        formatRequestId(r.id).toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter]);

  function openDetail(request: RedeemRequest) {
    setDetailRequest(request);
    setDetailOpen(true);
  }

  function openConfirm(action: RedeemAction, requestId: string) {
    setDetailOpen(false);
    setConfirmState({
      open: true,
      action,
      requestId,
      adminMessage: "",
      loading: false,
    });
  }

  function closeConfirm() {
    setConfirmState((s) => ({ ...s, open: false }));
  }

  async function handleConfirm() {
    const { action, requestId, adminMessage } = confirmState;
    if (!action || !requestId) {
      closeConfirm();
      return;
    }
    // TODO: replace with POST to /api/ceo/redeem/{id}/approve or /reject
    // Payload: { adminMessage }
    setConfirmState((s) => ({ ...s, loading: true }));
    await new Promise((r) => setTimeout(r, 600));
    setConfirmState((s) => ({ ...s, loading: false }));
    closeConfirm();
  }

  function rowActions(row: RedeemRequest): AdminActionItem[] {
    const isPending = row.status === "pending";
    return [
      {
        label: "View",
        icon: <Eye size={14} />,
        onClick: () => openDetail(row),
        tone: "info",
      },
      {
        label: "Approve",
        icon: <CheckCircle2 size={14} />,
        onClick: () => openConfirm("approve", row.id),
        tone: "success",
        disabled: !isPending,
      },
      {
        label: "Reject",
        icon: <XCircle size={14} />,
        onClick: () => openConfirm("reject", row.id),
        tone: "danger",
        disabled: !isPending,
      },
    ];
  }

  const columns: AdminColumn<RedeemRequest>[] = [
    {
      key: "id",
      header: "Request ID",
      mobileTitle: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-electric">
          {formatRequestId(row.id)}
        </span>
      ),
    },
    {
      key: "username",
      header: "Username",
      mobileSubtitle: true,
      cell: (row) => (
        <span className="text-sm font-medium text-foreground">@{row.username}</span>
      ),
    },
    {
      key: "fullName",
      header: "User Name",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.fullName}</span>
      ),
    },
    {
      key: "rewardAmountInr",
      header: "Reward Amount",
      align: "right",
      cell: (row) => (
        <span className="text-sm font-semibold text-emerald-brand tabular-nums">
          {formatInr(row.rewardAmountInr)}
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
          <span className="text-xs ml-1 text-gold/80">Coins</span>
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.date)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => statusBadge(row.status),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      cell: (row) => (
        <ActionButton actions={rowActions(row)} label="Request Actions" />
      ),
    },
  ];

  const confirmTitle =
    confirmState.action === "approve"
      ? "Approve Redeem Request?"
      : "Reject Redeem Request?";
  const confirmDescription =
    confirmState.action === "approve"
      ? "Approving will deduct the coin cost from the user's wallet and queue the payout. This action cannot be undone."
      : "Rejecting will keep the coins in the user's wallet. The user will be notified with the reason below.";
  const confirmLabel =
    confirmState.action === "approve" ? "Approve Request" : "Reject Request";

  return (
    <PageContainer>
      <PageHeader
        title="Redeem Requests"
        description="Review and approve user redemption requests"
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
            placeholder="Search by request ID, username…"
            className="sm:flex-1"
          />
          <AdminFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            placeholder="All Status"
            label="Status"
          />
        </AdminToolbar>

        <DataTable<RedeemRequest>
          columns={columns}
          rows={filteredRows}
          rowId={(row) => row.id}
          onRowClick={openDetail}
          loading={loading ? <SkeletonRow count={5} /> : undefined}
          emptyState={
            <EmptyState
              icon="ShoppingBag"
              title="No redeem requests"
              description="Pending redemption requests will appear here once the backend is connected"
            />
          }
        />
      </div>

      {/* Detail Modal — opened by row click or "View" action */}
      <DetailModal
        request={detailRequest}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onApprove={(id) => openConfirm("approve", id)}
        onReject={(id) => openConfirm("reject", id)}
      />

      {/* Confirm Modal — approve / reject with admin message */}
      <ConfirmModal
        open={confirmState.open}
        onOpenChange={(o) => !o && closeConfirm()}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        cancelLabel="Cancel"
        tone={confirmState.action === "approve" ? "success" : "danger"}
        loading={confirmState.loading}
        onConfirm={handleConfirm}
      >
        <div className="space-y-2 my-2">
          <Label
            htmlFor="admin-message"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Admin Message{" "}
            <span className="text-muted-foreground/70 normal-case font-normal">
              {confirmState.action === "reject" ? "(required)" : "(optional)"}
            </span>
          </Label>
          <Textarea
            id="admin-message"
            value={confirmState.adminMessage}
            onChange={(e) =>
              setConfirmState((s) => ({ ...s, adminMessage: e.target.value }))
            }
            placeholder={
              confirmState.action === "approve"
                ? "Optional note to include in the user's approval notification…"
                : "Explain why this request was rejected. The user will see this message…"
            }
            className="min-h-[100px] rounded-xl glass-2 ring-1 ring-border resize-none text-sm"
          />
        </div>
      </ConfirmModal>
    </PageContainer>
  );
}
