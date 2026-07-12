"use client";

/**
 * LootLoom — SupportView
 * Premium support center: create ticket + my tickets list + ticket chat view.
 * All data is placeholder-ready for the backend (TICKETS array starts empty).
 */

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy,
  Plus,
  Send,
  Paperclip,
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle2,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  GlassCard,
  LootButton,
  IconBadge,
  StatusBadge,
  EmptyState,
  SkeletonRow,
} from "@/components/lootloom";
import { useNavigationStore } from "@/stores";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ============================================================
   Types
   ============================================================ */

type TicketStatus = "open" | "pending" | "answered" | "resolved" | "closed";

interface ChatMessage {
  id: string;
  role: "user" | "admin";
  content: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  lastReply: string | null;
  messages: ChatMessage[];
}

/* ============================================================
   Placeholder data — backend will populate via /api/support
   ============================================================ */

const TICKETS: Ticket[] = [];

/* ============================================================
   Status metadata — color/label/icon per status
   ============================================================ */

const STATUS_META: Record<
  TicketStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "error" | "info" | "gold" | "electric" | "purple" | "cyan";
    icon: string;
    accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
  }
> = {
  open: { label: "Open", variant: "info", icon: "CircleDot", accent: "electric" },
  pending: { label: "Pending", variant: "warning", icon: "Hourglass", accent: "gold" },
  answered: { label: "Answered", variant: "cyan", icon: "Reply", accent: "cyan" },
  resolved: { label: "Resolved", variant: "success", icon: "CheckCircle2", accent: "emerald" },
  closed: { label: "Closed", variant: "default", icon: "Lock", accent: "navy" },
};

/* ============================================================
   Date formatter (client-safe)
   ============================================================ */

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/* ============================================================
   Create Ticket Form — UI only with loading state
   ============================================================ */

function CreateTicketForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = subject.trim().length >= 3 && message.trim().length >= 10;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    // No actual submission logic — simulate a loading state, then reset.
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSubject("");
      setMessage("");
    }, 1200);
  };

  return (
    <GlassCard level={2} sheen className="p-5 sm:p-6">
      <SectionHeader
        title="Create Ticket"
        description="Tell us how we can help"
        icon={<MessageSquare size={18} />}
      />

      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <label
            htmlFor="ticket-subject"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Subject
          </label>
          <Input
            id="ticket-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your issue"
            maxLength={120}
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="ticket-message"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Message
          </label>
          <Textarea
            id="ticket-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue in detail…"
            rows={5}
            maxLength={2000}
            disabled={loading}
          />
          <p className="text-[11px] text-muted-foreground/80 text-right">
            {message.length}/2000
          </p>
        </div>

        {/* Attachment placeholder — future-ready */}
        <LootButton
          type="button"
          variant="glass"
          size="md"
          leftIcon={<Paperclip size={15} />}
          disabled
          className="opacity-70"
        >
          Attachment (coming soon)
        </LootButton>

        <div className="flex items-center justify-end gap-2 pt-1">
          <LootButton
            type="submit"
            variant="electric"
            size="md"
            loading={loading}
            leftIcon={!loading ? <Send size={15} /> : undefined}
            disabled={!canSubmit}
          >
            {loading ? "Submitting…" : "Submit Ticket"}
          </LootButton>
        </div>
      </form>
    </GlassCard>
  );
}

/* ============================================================
   Ticket Row — list item
   ============================================================ */

function TicketRow({
  ticket,
  index,
  onOpen,
}: {
  ticket: Ticket;
  index: number;
  onOpen: (t: Ticket) => void;
}) {
  const meta = STATUS_META[ticket.status] ?? STATUS_META.open;

  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" animate="visible">
      <GlassCard
        level={1}
        sheen
        hover
        onClick={() => onOpen(ticket)}
        className="p-4 sm:p-5 ring-1 ring-border/60 cursor-pointer"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <IconBadge name={meta.icon} accent={meta.accent} size="md" />

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-semibold text-muted-foreground/90">
                #{ticket.id}
              </span>
              <StatusBadge variant={meta.variant} dot pulse={ticket.status === "open"}>
                {meta.label}
              </StatusBadge>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
              {ticket.subject}
            </h3>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                Created {formatDate(ticket.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={11} />
                Updated {formatDate(ticket.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={11} />
                Last reply {ticket.lastReply ? formatDate(ticket.lastReply) : "—"}
              </span>
            </div>
          </div>

          <ArrowLeft size={16} className="text-muted-foreground/60 rotate-180 shrink-0 mt-1" />
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Message Bubble — user right, admin left
   ============================================================ */

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex gap-2.5 max-w-[85%] sm:max-w-[75%]", isUser && "flex-row-reverse")}>
        <div
          className={cn(
            "shrink-0 size-8 rounded-xl flex items-center justify-center ring-1",
            isUser
              ? "bg-electric/10 text-electric ring-electric/20"
              : "bg-purple/10 text-purple-brand ring-purple-brand/20"
          )}
        >
          {isUser ? <LifeBuoy size={15} /> : <ShieldCheck size={15} />}
        </div>

        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 ring-1",
            isUser
              ? "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand)_60%,var(--purple-brand))] text-white ring-transparent rounded-tr-sm shadow-[0_8px_20px_-8px_oklch(0.62_0.22_255/0.45)]"
              : "glass-2 text-foreground ring-border rounded-tl-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p
            className={cn(
              "text-[10px] mt-1.5 font-medium",
              isUser ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {formatDate(message.timestamp)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Ticket Chat View — conversation layout
   ============================================================ */

function TicketChat({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const meta = STATUS_META[ticket.status] ?? STATUS_META.open;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Header */}
      <GlassCard level={2} sheen className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <LootButton
            variant="glass"
            size="icon"
            onClick={onBack}
            leftIcon={<ArrowLeft size={16} />}
            aria-label="Back to tickets"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-semibold text-muted-foreground/90">
                #{ticket.id}
              </span>
              <StatusBadge variant={meta.variant} dot>
                {meta.label}
              </StatusBadge>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
              {ticket.subject}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground mt-1">
              <span className="inline-flex items-center gap-1">
                <Clock size={11} /> Created {formatDate(ticket.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={11} /> Updated {formatDate(ticket.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Conversation */}
      <GlassCard level={2} className="p-4 sm:p-5">
        <SectionHeader
          title="Conversation"
          description="Your messages and support replies"
          icon={<MessageSquare size={18} />}
        />

        <div className="mt-3 max-h-[60vh] overflow-y-auto lootloom-scroll pr-1 space-y-4">
          {ticket.messages.length === 0 ? (
            <EmptyState
              icon="MessageSquare"
              title="No messages yet"
              description="Support team replies will appear here."
            />
          ) : (
            ticket.messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   My Tickets — list with loading / empty / list states
   ============================================================ */

function MyTickets({ onOpen }: { onOpen: (t: Ticket) => void }) {
  const [loading] = useState(false);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="My Tickets"
        description="Track and manage your support requests"
        icon={<LifeBuoy size={18} />}
      />

      {loading ? (
        <SkeletonRow count={4} />
      ) : TICKETS.length === 0 ? (
        <GlassCard level={2} sheen className="py-12">
          <EmptyState
            icon="Inbox"
            title="No tickets yet"
            description="Create your first support ticket"
            action={
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Inbox size={13} />
                Use the form above to get started
              </div>
            }
          />
        </GlassCard>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {TICKETS.map((t, i) => (
            <TicketRow key={t.id} ticket={t} index={i} onOpen={onOpen} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ============================================================
   Main SupportView
   ============================================================ */

export function SupportView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [selected, setSelected] = useState<Ticket | null>(null);

  return (
    <PageContainer>
      <PageHeader
        title="Support"
        description="Get help from LootLoom support team"
        actions={
          <LootButton
            variant="outline"
            size="md"
            leftIcon={<Plus size={15} />}
            onClick={() => navigate("dashboard")}
          >
            <span className="hidden sm:inline">Dashboard</span>
          </LootButton>
        }
      />

      <AnimatePresence mode="wait">
        {selected ? (
          <TicketChat key="chat" ticket={selected} onBack={() => setSelected(null)} />
        ) : (
          <motion.div
            key="list"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6"
          >
            <motion.div variants={cardReveal} className="lg:col-span-2">
              <CreateTicketForm />
            </motion.div>
            <motion.div variants={cardReveal} className="lg:col-span-3">
              <MyTickets onOpen={setSelected} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
