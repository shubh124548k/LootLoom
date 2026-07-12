"use client";

/* ============================================================
   LootLoom — CEO Support View
   Renders INSIDE the CeoLayout. No sidebar/header/background.
   Skeleton-first: local typed array initialized to [].
   All values backend-ready — replace SUPPORT_TICKETS with a
   fetch from /api/ceo/support to go live.

   Includes:
   - DataTable with ticket columns + row actions
   - Ticket detail Dialog with conversation thread
   - Reply textarea + Send Reply (disabled when closed/empty)
   - ConfirmModal for Close Ticket
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  LootButton,
  IconBadge,
  StatusBadge,
  SkeletonRow,
  EmptyState,
} from "@/components/lootloom";
import {
  AdminToolbar,
  AdminSearch,
  AdminFilter,
  DataTable,
  ActionButton,
  ConfirmModal,
  type AdminColumn,
  type AdminFilterOption,
} from "@/components/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ScrollArea,
} from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Types
   ============================================================ */
interface SupportMessage {
  id: string;
  role: "user" | "admin";
  content: string;
  timestamp: string;
}

type TicketStatus = "open" | "pending" | "answered" | "resolved" | "closed";

interface SupportTicket {
  id: string;
  username: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
  messages: SupportMessage[];
}

/* ============================================================
   Status meta — label + StatusBadge variant + dot/pulse flags
   ============================================================ */
interface StatusMeta {
  label: string;
  variant: "default" | "success" | "warning" | "error" | "info" | "cyan";
  dot: boolean;
  pulse: boolean;
}

const STATUS_META: Record<TicketStatus, StatusMeta> = {
  open: { label: "Open", variant: "info", dot: true, pulse: true },
  pending: { label: "Pending", variant: "warning", dot: true, pulse: false },
  answered: { label: "Answered", variant: "cyan", dot: true, pulse: false },
  resolved: { label: "Resolved", variant: "success", dot: true, pulse: false },
  closed: { label: "Closed", variant: "default", dot: false, pulse: false },
};

/* ============================================================
   Filter options
   ============================================================ */
const STATUS_FILTERS: AdminFilterOption[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Pending", value: "pending" },
  { label: "Answered", value: "answered" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

/* ============================================================
   Placeholder data — initialized to [] (backend-ready).
   TODO: replace with fetch from /api/ceo/support
   ============================================================ */
const SUPPORT_TICKETS: SupportTicket[] = [];

/* ============================================================
   Helpers
   ============================================================ */
function formatTicketId(id: string): string {
  return `#TK-${id.slice(-6).toUpperCase()}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ============================================================
   MessageBubble — single chat message in the conversation thread
   - user: right-aligned gradient bubble with avatar initials
   - admin: left-aligned glass bubble with "CEO" badge
   ============================================================ */
interface MessageBubbleProps {
  message: SupportMessage;
  username: string;
}

function MessageBubble({ message, username }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const initials = isUser ? getInitials(username) : "CE";

  if (isUser) {
    return (
      <motion.div
        variants={cardReveal}
        className="flex items-start gap-2.5 justify-end"
      >
        <div className="flex flex-col items-end gap-1 max-w-[78%]">
          <div className="rounded-2xl rounded-tr-sm bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand)_70%,var(--purple-brand))] text-white px-3.5 py-2.5 text-[13px] leading-relaxed shadow-[0_6px_20px_-8px_oklch(0.62_0.22_255/0.6)]">
            {message.content}
          </div>
          <span className="text-[10px] text-muted-foreground/70 pr-1">
            {username} · {formatMessageTime(message.timestamp)}
          </span>
        </div>
        <div className="size-8 rounded-full bg-electric/15 text-electric ring-1 ring-electric/25 flex items-center justify-center text-[11px] font-bold shrink-0">
          {initials}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardReveal}
      className="flex items-start gap-2.5 justify-start"
    >
      <div className="size-8 rounded-full bg-purple/15 text-purple-brand ring-1 ring-purple-brand/25 flex items-center justify-center text-[11px] font-bold shrink-0">
        {initials}
      </div>
      <div className="flex flex-col items-start gap-1 max-w-[78%]">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-purple/15 text-purple-brand ring-1 ring-purple-brand/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
            CEO
          </span>
        </div>
        <div className="rounded-2xl rounded-tl-sm glass-2 ring-1 ring-border text-foreground px-3.5 py-2.5 text-[13px] leading-relaxed">
          {message.content}
        </div>
        <span className="text-[10px] text-muted-foreground/70 pl-1">
          Support Team · {formatMessageTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Ticket detail dialog — conversation thread + reply box
   ============================================================ */
interface TicketDetailDialogProps {
  ticket: SupportTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyText: string;
  onReplyChange: (text: string) => void;
  onSendReply: () => void;
  sendingReply: boolean;
  onCloseTicket: (id: string) => void;
  onResolveTicket: (id: string) => void;
}

function TicketDetailDialog({
  ticket,
  open,
  onOpenChange,
  replyText,
  onReplyChange,
  onSendReply,
  sendingReply,
  onCloseTicket,
  onResolveTicket,
}: TicketDetailDialogProps) {
  if (!ticket) return null;

  const statusMeta = STATUS_META[ticket.status];
  const isClosed = ticket.status === "closed";
  const canReply = !isClosed && replyText.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="sm:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border/60 shrink-0 space-y-2">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">
                  {formatTicketId(ticket.id)}
                </span>
                <StatusBadge
                  variant={statusMeta.variant}
                  dot={statusMeta.dot}
                  pulse={statusMeta.pulse}
                >
                  {statusMeta.label}
                </StatusBadge>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground leading-snug">
                {ticket.subject}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Opened by{" "}
                <span className="text-foreground font-medium">{ticket.username}</span>{" "}
                · Created {formatDate(ticket.createdAt)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Conversation */}
        <div className="flex-1 min-h-0 px-5 sm:px-6 py-4">
          {ticket.messages.length === 0 ? (
            <EmptyState
              icon="MessageSquare"
              title="No messages yet"
              description="Be the first to reply to this ticket"
            />
          ) : (
            <ScrollArea className="h-[45vh] lg:h-[55vh] pr-2">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4 pb-2"
              >
                {ticket.messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    username={ticket.username}
                  />
                ))}
              </motion.div>
            </ScrollArea>
          )}
        </div>

        {/* Reply input + footer actions */}
        <div className="border-t border-border/60 px-5 sm:px-6 py-4 shrink-0 space-y-3 bg-muted/20">
          {isClosed ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <XCircle size={14} className="text-rose-brand" />
              This ticket is closed. Reopen it from the backend to continue the
              conversation.
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Reply as CEO
              </label>
              <Textarea
                value={replyText}
                onChange={(e) => onReplyChange(e.target.value)}
                placeholder="Type your reply to the user…"
                className="min-h-[88px] max-h-[160px] rounded-xl glass-2 ring-1 ring-border text-sm resize-none focus-visible:ring-2 focus-visible:ring-electric/40"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground/70">
                  {replyText.trim().length} characters
                </span>
                <LootButton
                  variant="electric"
                  size="sm"
                  onClick={onSendReply}
                  disabled={!canReply}
                  loading={sendingReply}
                  leftIcon={<Send size={13} />}
                >
                  Send Reply
                </LootButton>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
            <LootButton
              variant="outline"
              size="sm"
              onClick={() => onResolveTicket(ticket.id)}
              disabled={isClosed || ticket.status === "resolved"}
              leftIcon={<CheckCircle2 size={13} />}
            >
              Mark Resolved
            </LootButton>
            <LootButton
              variant="destructive"
              size="sm"
              onClick={() => onCloseTicket(ticket.id)}
              disabled={isClosed}
              leftIcon={<XCircle size={13} />}
            >
              Close Ticket
            </LootButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Main view
   ============================================================ */
export function CeoSupportView() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Ticket detail dialog state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // ConfirmModal state for Close Ticket
  const [closeConfirmId, setCloseConfirmId] = useState<string | null>(null);

  // Simulated 600ms load on mount.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId]
  );

  const closeConfirmTicket = useMemo(
    () => tickets.find((t) => t.id === closeConfirmId) ?? null,
    [tickets, closeConfirmId]
  );

  // Filter by status + search query (ticket ID, username, subject).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.username.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    });
  }, [tickets, statusFilter, query]);

  /* ---------- Handlers ---------- */

  function handleRefresh() {
    setLoading(true);
    // TODO: replace with real fetch + setLoading(false) in finally block.
    setTimeout(() => setLoading(false), 600);
  }

  function handleViewTicket(ticket: SupportTicket) {
    setSelectedTicketId(ticket.id);
    setReplyText("");
    setDialogOpen(true);
  }

  function handleSendReply() {
    if (!selectedTicket || !replyText.trim()) return;
    setSendingReply(true);
    // Simulated reply append — preserves premium feel while backend is pending.
    // TODO: POST /api/ceo/support/{id}/reply with { content: replyText }
    setTimeout(() => {
      const newMessage: SupportMessage = {
        id: `msg_${Date.now()}`,
        role: "admin",
        content: replyText.trim(),
        timestamp: new Date().toISOString(),
      };
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                status: "answered",
                updatedAt: newMessage.timestamp,
                lastMessage: newMessage.content,
                messages: [...t.messages, newMessage],
              }
            : t
        )
      );
      setReplyText("");
      setSendingReply(false);
    }, 600);
  }

  function handleCloseTicket(id: string) {
    // Open confirm modal.
    setCloseConfirmId(id);
  }

  function confirmCloseTicket() {
    if (!closeConfirmId) return;
    // TODO: POST /api/ceo/support/{id}/close
    setTickets((prev) =>
      prev.map((t) =>
        t.id === closeConfirmId
          ? {
              ...t,
              status: "closed",
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    setCloseConfirmId(null);
  }

  function handleResolveTicket(id: string) {
    // TODO: POST /api/ceo/support/{id}/resolve
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "resolved",
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  }

  /* ---------- Column definitions ---------- */

  const columns: AdminColumn<SupportTicket>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Ticket ID",
        mobileTitle: true,
        cell: (t) => (
          <span className="font-mono text-xs text-foreground/90 font-semibold">
            {formatTicketId(t.id)}
          </span>
        ),
      },
      {
        key: "username",
        header: "Username",
        mobileSubtitle: true,
        cell: (t) => (
          <span className="text-sm text-foreground font-medium">{t.username}</span>
        ),
      },
      {
        key: "subject",
        header: "Subject",
        hideOnMobile: true,
        cell: (t) => (
          <span className="text-sm text-foreground/90 line-clamp-1 max-w-[240px]">
            {t.subject}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (t) => {
          const meta = STATUS_META[t.status];
          return (
            <StatusBadge variant={meta.variant} dot={meta.dot} pulse={meta.pulse}>
              {meta.label}
            </StatusBadge>
          );
        },
      },
      {
        key: "lastMessage",
        header: "Last Message",
        hideOnMobile: true,
        cell: (t) => (
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[260px] italic">
            {t.lastMessage || "—"}
          </span>
        ),
      },
      {
        key: "date",
        header: "Date",
        hideOnMobile: true,
        cell: (t) => (
          <span className="text-xs text-muted-foreground/90">
            {formatDate(t.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Action",
        align: "right",
        cell: (t) => (
          <ActionButton
            label="Ticket actions"
            actions={[
              {
                label: "View",
                icon: <Eye size={14} />,
                onClick: () => handleViewTicket(t),
                tone: "info",
              },
              {
                label: "Close Ticket",
                icon: <XCircle size={14} />,
                onClick: () => handleCloseTicket(t.id),
                tone: "danger",
                disabled: t.status === "closed",
              },
            ]}
          />
        ),
      },
    ],
    []
  );

  /* ---------- Render ---------- */

  return (
    <PageContainer>
      <PageHeader
        title="Support"
        description="Manage user support tickets"
      />

      {/* Toolbar */}
      <div className="mb-5">
        <AdminToolbar>
          <AdminSearch
            value={query}
            onChange={setQuery}
            placeholder="Search by ticket ID, username, subject…"
            className="sm:flex-1 sm:max-w-md"
          />
          <AdminFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTERS}
            className="sm:w-auto"
          />
          <LootButton
            variant="glass"
            size="md"
            onClick={handleRefresh}
            loading={loading}
            leftIcon={<RefreshCw size={15} />}
            className="sm:ml-auto"
          >
            Refresh
          </LootButton>
        </AdminToolbar>
      </div>

      {/* Loading / empty / table */}
      {loading ? (
        <SkeletonRow count={5} />
      ) : filtered.length === 0 ? (
        <GlassCard level={1} className="py-12">
          <EmptyState
            icon="LifeBuoy"
            title="No support tickets"
            description="User support tickets will appear here once the backend is connected"
          />
        </GlassCard>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <DataTable
            columns={columns}
            rows={filtered}
            rowId={(t) => t.id}
            onRowClick={handleViewTicket}
          />
        </motion.div>
      )}

      {/* Backend hint footer */}
      {!loading && tickets.length === 0 && (
        <div className="mt-5">
          <GlassCard level={1} className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <IconBadge name="LifeBuoy" accent="rose" size="sm" />
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  Live tickets will appear once backend is connected
                </p>
                <p className="text-xs text-muted-foreground">
                  Wire{" "}
                  <code className="text-[11px] font-mono px-1 py-0.5 rounded bg-muted text-foreground/80">
                    /api/ceo/support
                  </code>{" "}
                  to surface user support requests. Reply, resolve and close
                  actions will POST to the same endpoint family.
                </p>
              </div>
              <StatusBadge variant="warning" dot pulse>
                Awaiting backend
              </StatusBadge>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Ticket detail dialog */}
      <TicketDetailDialog
        ticket={selectedTicket}
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) {
            setSelectedTicketId(null);
            setReplyText("");
          }
        }}
        replyText={replyText}
        onReplyChange={setReplyText}
        onSendReply={handleSendReply}
        sendingReply={sendingReply}
        onCloseTicket={handleCloseTicket}
        onResolveTicket={handleResolveTicket}
      />

      {/* Close ticket confirmation */}
      <ConfirmModal
        open={closeConfirmId !== null}
        onOpenChange={(o) => {
          if (!o) setCloseConfirmId(null);
        }}
        title="Close this ticket?"
        description={
          closeConfirmTicket
            ? `Ticket ${formatTicketId(
                closeConfirmTicket.id
              )} from ${closeConfirmTicket.username} will be marked as closed. The user will no longer be able to reply.`
            : ""
        }
        confirmLabel="Close Ticket"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={confirmCloseTicket}
      />
    </PageContainer>
  );
}

