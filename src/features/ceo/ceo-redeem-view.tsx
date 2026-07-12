"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Eye, RefreshCw, Download,
  ArrowUpDown,
  User, IndianRupee, Coins, MessageSquare,
  Receipt, Ban, RotateCcw,
  ChevronDown, ShoppingBag, Clock,
} from "lucide-react";
import {
  PageContainer, PageHeader, GlassCard, LootButton, StatusBadge,
  SkeletonRow, EmptyState, ErrorState,
} from "@/components/lootloom";
import {
  DataTable, type AdminColumn, AdminSearch,
  AdminToolbar, ActionButton, type AdminActionItem, ConfirmModal,
  AdminPagination,
} from "@/components/admin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/* ============================================================
   Types
   ============================================================ */

type RedeemStatus = "PENDING" | "APPROVED" | "PROCESSING" | "PAID" | "REJECTED" | "CANCELLED" | "REFUNDED" | "COMPLETED";

type RedeemAction = "APPROVE" | "PROCESS" | "PAID" | "REJECT" | "CANCEL" | "REFUND" | "COMPLETE";

type SortValue = "newest" | "oldest" | "reward_high" | "reward_low";

interface RedeemRequest {
  id: string;
  username: string;
  fullName: string;
  email: string;
  rewardName: string;
  rewardAmountInr: number;
  coinsUsed: number;
  upiId: string | null;
  status: RedeemStatus;
  transactionId: string | null;
  paymentDate: string | null;
  userNote: string | null;
  adminNote: string | null;
  processedBy: string | null;
  processedAt: string | null;
  requestedAt: string;
  updatedAt: string;
}

interface ApiRedeemRequest {
  id: string;
  user: { id: string; username: string; email: string; fullName: string; avatar: string | null };
  reward: { id: string; name: string; amountInr: number };
  coinsUsed: number;
  status: string;
  upiId: string | null;
  transactionId: string | null;
  paymentDate: string | null;
  userNote: string | null;
  adminNote: string | null;
  processedBy: string | null;
  processedAt: string | null;
  requestedAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: ApiRedeemRequest[];
  pagination?: { page: number; pageSize: number; total: number };
}

/* ============================================================
   Constants
   ============================================================ */

const STATUS_TABS = [
  { id: "ALL" as const, label: "All" },
  { id: "PENDING" as const, label: "Pending" },
  { id: "PROCESSING" as const, label: "Processing" },
  { id: "PAID" as const, label: "Paid" },
  { id: "REJECTED" as const, label: "Rejected" },
  { id: "CANCELLED" as const, label: "Cancelled" },
];

type TabId = (typeof STATUS_TABS)[number]["id"];

const STATUS_META: Record<RedeemStatus, { variant: "default" | "success" | "warning" | "error" | "info" | "cyan" | "electric"; label: string; dot: boolean; pulse: boolean }> = {
  PENDING: { label: "Pending", variant: "warning", dot: true, pulse: true },
  APPROVED: { label: "Approved", variant: "electric", dot: true, pulse: true },
  PROCESSING: { label: "Processing", variant: "cyan", dot: true, pulse: true },
  PAID: { label: "Paid", variant: "success", dot: true, pulse: false },
  REJECTED: { label: "Rejected", variant: "error", dot: true, pulse: false },
  CANCELLED: { label: "Cancelled", variant: "default", dot: false, pulse: false },
  REFUNDED: { label: "Refunded", variant: "info", dot: true, pulse: false },
  COMPLETED: { label: "Completed", variant: "success", dot: true, pulse: false },
};

const SORT_OPTIONS: { label: string; value: SortValue }[] = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Highest Reward", value: "reward_high" },
  { label: "Lowest Reward", value: "reward_low" },
];

const PAGE_SIZE = 20;

/* ============================================================
   Helpers
   ============================================================ */

function formatRequestId(id: string): string {
  return `#RR-${id.slice(-6).toUpperCase()}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "\u2014";
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

function formatDateShort(iso: string | null | undefined): string {
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

function maskUpi(upi: string | null | undefined): string {
  if (!upi) return "\u2014";
  const last4 = upi.slice(-4);
  return `\u2022\u2022\u2022\u2022${last4}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function mapApiRequest(api: ApiRedeemRequest): RedeemRequest {
  return {
    id: api.id,
    username: api.user.username,
    fullName: api.user.fullName,
    email: api.user.email,
    rewardName: api.reward.name,
    rewardAmountInr: api.reward.amountInr,
    coinsUsed: api.coinsUsed,
    upiId: api.upiId,
    status: api.status as RedeemStatus,
    transactionId: api.transactionId,
    paymentDate: api.paymentDate,
    userNote: api.userNote,
    adminNote: api.adminNote,
    processedBy: api.processedBy,
    processedAt: api.processedAt,
    requestedAt: api.requestedAt,
    updatedAt: api.updatedAt,
  };
}

/* ============================================================
   Status Badge
   ============================================================ */

function RedeemStatusBadge({ status }: { status: RedeemStatus }) {
  const meta = STATUS_META[status];
  return (
    <StatusBadge variant={meta.variant} dot={meta.dot} pulse={meta.pulse}>
      {meta.label}
    </StatusBadge>
  );
}

/* ============================================================
   Avatar with initials
   ============================================================ */

function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "size-8 inline-flex items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0",
        "bg-[linear-gradient(120deg,var(--electric),var(--purple-brand))] ring-1 ring-electric/20",
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}

/* ============================================================
   Tabs bar
   ============================================================ */

interface TabsBarProps {
  tabs: typeof STATUS_TABS;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  counts: Record<string, number>;
}

function TabsBar({ tabs, activeTab, onTabChange, counts }: TabsBarProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = tab.id === "ALL"
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[tab.id] ?? 0;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0",
              isActive
                ? "text-electric shadow-[inset_0_0_0_1px_oklch(0.62_0.22_255/0.3)] bg-electric/8"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold",
                isActive
                  ? "bg-electric/15 text-electric"
                  : "bg-muted/60 text-muted-foreground"
              )}
            >
              {count}
            </span>
            {isActive && (
              <motion.span
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl ring-1 ring-electric/30"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Sort dropdown
   ============================================================ */

interface SortDropdownProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
}

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Sort";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Sort requests"
          className={cn(
            "inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold",
            "glass-2 ring-1 ring-border hover:bg-accent/60 transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40"
          )}
        >
          <ArrowUpDown size={14} className="text-muted-foreground/70" />
          <span className="text-foreground/80">{currentLabel}</span>
          <ChevronDown size={14} className="text-muted-foreground/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] rounded-xl glass-nav ring-1 ring-border/60 p-1.5">
        {SORT_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-sm cursor-pointer",
              value === opt.value && "text-electric bg-electric/8"
            )}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================================
   Detail Modal sub-components
   ============================================================ */

function DetailSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
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

function DetailField({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: "emerald" | "gold" | "electric" }) {
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
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <p className={cn("text-sm font-medium truncate", accentClass, mono && "font-mono")}>{value}</p>
    </div>
  );
}

/* ============================================================
   Detail Modal
   ============================================================ */

interface DetailModalProps {
  request: RedeemRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: RedeemAction, request: RedeemRequest) => void;
}

function DetailModal({ request, open, onOpenChange, onAction }: DetailModalProps) {
  const actions = useMemo(() => request ? getRowActions(request, () => {}, onAction) : [], [request, onAction]);

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl glass-nav ring-1 ring-border/60 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <span className="font-mono text-electric">{formatRequestId(request.id)}</span>
            <RedeemStatusBadge status={request.status} />
          </DialogTitle>
          <DialogDescription className="text-xs">
            Full redemption request details.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-1">
          <div className="space-y-3">
            <DetailSection title="Request Info" icon={<Receipt size={14} />}>
              <DetailField label="Request ID" value={formatRequestId(request.id)} mono accent="electric" />
              <DetailField label="Status" value={STATUS_META[request.status].label} />
              <DetailField label="Created" value={formatDate(request.requestedAt)} />
              <DetailField label="Updated" value={formatDate(request.updatedAt)} />
            </DetailSection>

            <DetailSection title="User Info" icon={<User size={14} />}>
              <DetailField label="Username" value={`@${request.username}`} accent="electric" />
              <DetailField label="Email" value={request.email} />
              <DetailField label="Full Name" value={request.fullName} />
            </DetailSection>

            <DetailSection title="Reward Info" icon={<IndianRupee size={14} />}>
              <DetailField label="Reward Name" value={request.rewardName} />
              <DetailField label="Amount" value={formatInr(request.rewardAmountInr)} accent="emerald" />
              <DetailField label="Coins Used" value={`${request.coinsUsed.toLocaleString("en-IN")}`} accent="gold" />
            </DetailSection>

            <DetailSection title="Payment Info" icon={<Coins size={14} />}>
              <DetailField label="UPI ID" value={maskUpi(request.upiId)} />
              <DetailField label="Transaction ID" value={request.transactionId ?? "\u2014"} mono={!!request.transactionId} />
              <DetailField label="Payment Date" value={formatDateShort(request.paymentDate)} />
            </DetailSection>

            {request.userNote && (
              <div className="rounded-xl glass-2 ring-1 ring-purple-brand/20 p-4">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-purple-brand">
                  <MessageSquare size={12} />
                  User Note
                </div>
                <p className="text-sm text-foreground/90 italic leading-relaxed">&ldquo;{request.userNote}&rdquo;</p>
              </div>
            )}

            {request.adminNote && (
              <div className="rounded-xl glass-2 ring-1 ring-border p-4">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <MessageSquare size={12} />
                  Admin Note
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{request.adminNote}</p>
              </div>
            )}

            {request.processedBy && (
              <DetailSection title="Admin Processing" icon={<User size={14} />}>
                <DetailField label="Processed By" value={request.processedBy} />
                <DetailField label="Processed At" value={formatDate(request.processedAt)} />
              </DetailSection>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-2 flex-wrap sm:flex-nowrap">
          <LootButton variant="ghost" size="md" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            Close
          </LootButton>
          {actions
            .filter((a) => a.label !== "View")
            .map((action) => (
              <LootButton
                key={action.label}
                variant={
                  action.tone === "success" ? "emerald"
                  : action.tone === "danger" ? "destructive"
                  : action.tone === "warning" ? "gold"
                  : "glass"
                }
                size="md"
                leftIcon={action.icon}
                disabled={action.disabled}
                onClick={() => {
                  onOpenChange(false);
                  action.onClick();
                }}
                className="flex-1 sm:flex-none"
              >
                {action.label}
              </LootButton>
            ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Action dialog variants
   ============================================================ */

interface ActionDialogState {
  open: boolean;
  type: RedeemAction | null;
  request: RedeemRequest | null;
  loading: boolean;
  transactionId: string;
  paymentDate: string;
  reason: string;
}

function initialActionState(): ActionDialogState {
  return {
    open: false,
    type: null,
    request: null,
    loading: false,
    transactionId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    reason: "",
  };
}

/* ============================================================
   Row actions factory
   ============================================================ */

function getRowActions(
  row: RedeemRequest,
  onView: (r: RedeemRequest) => void,
  onAction: (action: RedeemAction, r: RedeemRequest) => void
): AdminActionItem[] {
  const items: AdminActionItem[] = [
    { label: "View", icon: <Eye size={14} />, onClick: () => onView(row), tone: "info" },
  ];

  switch (row.status) {
    case "PENDING":
      items.push(
        { label: "Approve", icon: <CheckCircle2 size={14} />, onClick: () => onAction("APPROVE", row), tone: "success" },
        { label: "Reject", icon: <XCircle size={14} />, onClick: () => onAction("REJECT", row), tone: "danger" },
        { label: "Cancel", icon: <Ban size={14} />, onClick: () => onAction("CANCEL", row), tone: "warning" },
      );
      break;
    case "APPROVED":
      items.push(
        { label: "Process", icon: <Clock size={14} />, onClick: () => onAction("PROCESS", row), tone: "info" },
        { label: "Cancel", icon: <Ban size={14} />, onClick: () => onAction("CANCEL", row), tone: "warning" },
      );
      break;
    case "PROCESSING":
      items.push(
        { label: "Mark Paid", icon: <CheckCircle2 size={14} />, onClick: () => onAction("PAID", row), tone: "success" },
      );
      break;
    case "PAID":
      items.push(
        { label: "Complete", icon: <CheckCircle2 size={14} />, onClick: () => onAction("COMPLETE", row), tone: "success" },
        { label: "Refund", icon: <RotateCcw size={14} />, onClick: () => onAction("REFUND", row), tone: "warning" },
      );
      break;
    case "REJECTED":
      items.push(
        { label: "Refund", icon: <RotateCcw size={14} />, onClick: () => onAction("REFUND", row), tone: "warning" },
      );
      break;
  }

  return items;
}

/* ============================================================
   Main View
   ============================================================ */

export function CeoRedeemView() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<RedeemRequest[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("PENDING");
  const [sort, setSort] = useState<SortValue>("newest");
  const [page, setPage] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<RedeemRequest | null>(null);

  const [actionState, setActionState] = useState<ActionDialogState>(initialActionState);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("status", "ALL");
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("sort", sort);
      params.set("page", "1");

      const res = await fetch(`/api/ceo/redeem?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const json: ApiResponse = await res.json();
      if (!json.success) throw new Error("Request failed");
      setRequests((json.data ?? []).map(mapApiRequest));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load redeem requests";
      setError(message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /* ---------- Derived data ---------- */

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of requests) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    }
    return counts;
  }, [requests]);

  const filtered = useMemo(() => {
    let result = requests;

    if (activeTab !== "ALL") {
      result = result.filter((r) => r.status === activeTab);
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "newest": return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
        case "oldest": return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
        case "reward_high": return b.rewardAmountInr - a.rewardAmountInr;
        case "reward_low": return a.rewardAmountInr - b.rewardAmountInr;
        default: return 0;
      }
    });

    return result;
  }, [requests, activeTab, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  /* ---------- Handlers ---------- */

  function handleRefresh() {
    fetchRequests();
  }

  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    setPage(1);
  }

  function handleOpenDetail(request: RedeemRequest) {
    setDetailRequest(request);
    setDetailOpen(true);
  }

  function handleOpenAction(action: RedeemAction, request: RedeemRequest) {
    setDetailOpen(false);
    setActionState({
      open: true,
      type: action,
      request,
      loading: false,
      transactionId: "",
      paymentDate: new Date().toISOString().split("T")[0],
      reason: "",
    });
  }

  function closeAction() {
    setActionState((s) => ({ ...s, open: false }));
  }

  async function executeAction() {
    const { type, request, transactionId, paymentDate, reason } = actionState;
    if (!type || !request) {
      closeAction();
      return;
    }

    setActionState((s) => ({ ...s, loading: true }));

    try {
      const body: Record<string, unknown> = { requestId: request.id, action: type };
      if (type === "PAID") {
        if (!transactionId.trim()) {
          toast({ title: "Validation Error", description: "Transaction ID is required.", variant: "destructive" });
          setActionState((s) => ({ ...s, loading: false }));
          return;
        }
        body.transactionId = transactionId.trim();
        if (paymentDate) body.paymentDate = paymentDate;
        if (reason.trim()) body.reason = reason.trim();
      }
      if ((type === "APPROVE" || type === "REJECT") && reason.trim()) {
        body.reason = reason.trim();
      }
      if (type === "REJECT" && !reason.trim()) {
        toast({ title: "Validation Error", description: "Reason is required to reject.", variant: "destructive" });
        setActionState((s) => ({ ...s, loading: false }));
        return;
      }

      const res = await fetch("/api/ceo/redeem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Action failed");

      toast({
        title: "Request Updated",
        description: `Redeem request ${formatRequestId(request.id)} ${type.toLowerCase()}d successfully.`,
      });

      closeAction();
      fetchRequests();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed";
      toast({ title: "Error", description: message, variant: "destructive" });
      setActionState((s) => ({ ...s, loading: false }));
    }
  }

  function handleExport() {
    window.open("/api/ceo/export?type=redeems", "_blank");
  }

  /* ---------- Action dialog config ---------- */

  const actionDialogConfig = useMemo(() => {
    const t = actionState.type;
    if (!t) return null;

    const configs: Record<RedeemAction, {
      title: string;
      description: string;
      confirmLabel: string;
      tone: "success" | "danger" | "warning" | "info" | "default";
      showReason?: boolean;
      reasonRequired?: boolean;
      reasonPlaceholder?: string;
      showTransactionId?: boolean;
      showPaymentDate?: boolean;
    }> = {
      APPROVE: {
        title: "Approve Redeem Request?",
        description: "The user's coins have already been deducted. Approving will queue this for payment processing.",
        confirmLabel: "Approve",
        tone: "success",
        showReason: true,
        reasonPlaceholder: "Optional note to include in the approval notification\u2026",
      },
      PROCESS: {
        title: "Mark as Processing?",
        description: "This will move the request to processing. Payment will be handled in the next step.",
        confirmLabel: "Mark Processing",
        tone: "info",
      },
      PAID: {
        title: "Mark as Paid",
        description: "Record payment details for this request.",
        confirmLabel: "Mark Paid",
        tone: "success",
        showTransactionId: true,
        showPaymentDate: true,
        showReason: true,
        reasonPlaceholder: "Optional admin note\u2026",
      },
      REJECT: {
        title: "Reject Redeem Request?",
        description: "Coins will be refunded to the user's wallet.",
        confirmLabel: "Reject & Refund",
        tone: "danger",
        showReason: true,
        reasonRequired: true,
        reasonPlaceholder: "Explain why this was rejected. The user will see this message\u2026",
      },
      CANCEL: {
        title: "Cancel this request?",
        description: "Coins will be refunded to the user's wallet.",
        confirmLabel: "Cancel Request",
        tone: "warning",
      },
      REFUND: {
        title: "Refund coins to user?",
        description: "This will credit the coins back to their wallet.",
        confirmLabel: "Refund Coins",
        tone: "warning",
      },
      COMPLETE: {
        title: "Complete this request?",
        description: "Mark this redemption request as fully complete.",
        confirmLabel: "Complete",
        tone: "success",
      },
    };

    return configs[t];
  }, [actionState.type]);

  /* ---------- Column definitions ---------- */

  const columns: AdminColumn<RedeemRequest>[] = useMemo(() => [
    {
      key: "id",
      header: "Request ID",
      mobileTitle: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-electric">{formatRequestId(row.id)}</span>
      ),
    },
    {
      key: "username",
      header: "Username",
      mobileSubtitle: true,
      cell: (row) => (
        <span className="inline-flex items-center gap-2 min-w-0">
          <UserAvatar name={row.fullName || row.username} />
          <span className="text-sm font-medium text-foreground truncate">@{row.username}</span>
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground truncate">{row.email}</span>
      ),
    },
    {
      key: "rewardName",
      header: "Reward Name",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-foreground/90 truncate max-w-[160px]">{row.rewardName}</span>
      ),
    },
    {
      key: "rewardAmountInr",
      header: "Reward Amount",
      align: "right",
      cell: (row) => (
        <span className="text-sm font-semibold text-emerald-brand tabular-nums">{formatInr(row.rewardAmountInr)}</span>
      ),
    },
    {
      key: "coinsUsed",
      header: "Coins Used",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm font-semibold text-gold tabular-nums">
          {row.coinsUsed.toLocaleString("en-IN")}
          <span className="text-xs ml-1 text-gold/80">Coins</span>
        </span>
      ),
    },
    {
      key: "upiId",
      header: "UPI ID",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs font-mono text-muted-foreground">{maskUpi(row.upiId)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => <RedeemStatusBadge status={row.status} />,
    },
    {
      key: "requestedAt",
      header: "Date",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.requestedAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      cell: (row) => (
        <ActionButton
          label="Request Actions"
          actions={getRowActions(
            row,
            (r) => handleOpenDetail(r),
            (action, r) => handleOpenAction(action, r)
          )}
        />
      ),
    },
  ], []);

  /* ---------- Render ---------- */

  return (
    <PageContainer>
      <PageHeader
        title="Redeem Requests"
        description="Review and process user redemption requests"
        actions={
          <div className="flex items-center gap-2">
            <LootButton
              variant="glass"
              size="md"
              onClick={handleExport}
              leftIcon={<Download size={15} />}
            >
              Export CSV
            </LootButton>
            <LootButton
              variant="glass"
              size="md"
              onClick={handleRefresh}
              leftIcon={<RefreshCw size={15} />}
              loading={loading}
            >
              Refresh
            </LootButton>
          </div>
        }
      />

      <div className="space-y-4">
        <TabsBar
          tabs={STATUS_TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={tabCounts}
        />

        <AdminToolbar>
          <AdminSearch
            value={search}
            onChange={setSearch}
            placeholder="Search by username, email, request ID, transaction ID\u2026"
            className="sm:flex-1 sm:max-w-md"
          />
          <SortDropdown value={sort} onChange={(v) => { setSort(v); setPage(1); }} />
        </AdminToolbar>

        {loading ? (
          <SkeletonRow count={5} />
        ) : error ? (
          <ErrorState
            title="Failed to load requests"
            description={error}
            action={
              <LootButton variant="glass" size="md" onClick={handleRefresh} leftIcon={<RefreshCw size={15} />}>
                Retry
              </LootButton>
            }
          />
        ) : filtered.length === 0 ? (
          <GlassCard level={1} className="py-12">
            <EmptyState
              icon="ShoppingBag"
              title="No redemption requests"
              description={
                debouncedSearch || activeTab !== "ALL"
                  ? "No requests match your current filters."
                  : "No redemption requests have been created yet."
              }
            />
          </GlassCard>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <DataTable<RedeemRequest>
              columns={columns}
              rows={paged}
              rowId={(r) => r.id}
              onRowClick={handleOpenDetail}
              emptyState={
                <EmptyState
                  icon="ShoppingBag"
                  title="No requests"
                  description="No requests on this page."
                />
              }
            />
          </motion.div>
        )}

        {filtered.length > PAGE_SIZE && !error && (
          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
          />
        )}
      </div>

      <DetailModal
        request={detailRequest}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAction={handleOpenAction}
      />

      {/* Approve / Process / Reject / Cancel / Refund / Complete dialogs */}
      {actionState.open && actionDialogConfig && actionState.type &&
        (actionState.type === "PAID" ? (
          /* Paid dialog — custom form */
          <Dialog open={actionState.open} onOpenChange={(o) => { if (!o) closeAction(); }}>
            <DialogContent className="sm:max-w-lg glass-nav ring-1 ring-border/60 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-foreground">{actionDialogConfig.title}</DialogTitle>
                {actionDialogConfig.description && (
                  <DialogDescription className="text-sm text-muted-foreground">{actionDialogConfig.description}</DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="txn-id" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Transaction ID <span className="text-rose-brand">*</span>
                  </Label>
                  <Input
                    id="txn-id"
                    value={actionState.transactionId}
                    onChange={(e) => setActionState((s) => ({ ...s, transactionId: e.target.value }))}
                    placeholder="UPI transaction reference ID\u2026"
                    className="rounded-xl glass-2 ring-1 ring-border text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment Date <span className="text-muted-foreground/70 normal-case font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={actionState.paymentDate}
                    onChange={(e) => setActionState((s) => ({ ...s, paymentDate: e.target.value }))}
                    className="rounded-xl glass-2 ring-1 ring-border text-sm"
                  />
                </div>

                {actionDialogConfig.showReason && (
                  <div className="space-y-2">
                    <Label htmlFor="paid-note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Admin Note <span className="text-muted-foreground/70 normal-case font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      id="paid-note"
                      value={actionState.reason}
                      onChange={(e) => setActionState((s) => ({ ...s, reason: e.target.value }))}
                      placeholder={actionDialogConfig.reasonPlaceholder}
                      className="min-h-[80px] rounded-xl glass-2 ring-1 ring-border resize-none text-sm"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <LootButton variant="ghost" size="md" onClick={closeAction}>Cancel</LootButton>
                <LootButton
                  variant="emerald"
                  size="md"
                  loading={actionState.loading}
                  leftIcon={<CheckCircle2 size={15} />}
                  onClick={executeAction}
                >
                  {actionDialogConfig.confirmLabel}
                </LootButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          /* All other action dialogs using ConfirmModal */
          <ConfirmModal
            open={actionState.open}
            onOpenChange={(o) => { if (!o) closeAction(); }}
            title={actionDialogConfig.title}
            description={actionDialogConfig.description}
            confirmLabel={actionDialogConfig.confirmLabel}
            cancelLabel="Cancel"
            tone={actionDialogConfig.tone}
            loading={actionState.loading}
            onConfirm={executeAction}
          >
            {actionDialogConfig.showReason && (
              <div className="space-y-2 my-2">
                <Label
                  htmlFor="action-reason"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Admin Message{" "}
                  <span className="text-muted-foreground/70 normal-case font-normal">
                    {actionDialogConfig.reasonRequired ? "(required)" : "(optional)"}
                  </span>
                </Label>
                <Textarea
                  id="action-reason"
                  value={actionState.reason}
                  onChange={(e) => setActionState((s) => ({ ...s, reason: e.target.value }))}
                  placeholder={actionDialogConfig.reasonPlaceholder}
                  className="min-h-[100px] rounded-xl glass-2 ring-1 ring-border resize-none text-sm"
                />
              </div>
            )}
          </ConfirmModal>
        ))}
    </PageContainer>
  );
}
