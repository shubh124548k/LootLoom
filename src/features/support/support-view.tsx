"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy, Mail, MessageSquare, Plus, X, ChevronDown, ChevronUp,
  Clock, CheckCircle2, AlertCircle, Loader2, Search, ChevronRight,
  RefreshCw, Ticket, ArrowLeft,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  LootButton,
  StatusBadge,
  GlassLoader,
  EmptyState,
  ErrorState,
  IconBadge,
} from "@/components/lootloom";
import { cardReveal, staggerContainer, modalPop, overlayFade } from "@/lib/animations";
import { useNavigationStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";

const FAQ_ITEMS = [
  { q: "How do I earn coins?", a: "Watch ads, complete missions, and refer friends to earn coins. Visit the Earn page for available opportunities." },
  { q: "How do I redeem my coins?", a: "Go to the Redeem page, select a UPI cash reward, enter your UPI ID, and submit. Your request will be reviewed by our team." },
  { q: "How long do redemptions take?", a: "UPI redemptions are typically processed within 24-48 hours after CEO approval. You'll be notified when your request is processed." },
  { q: "What is the minimum withdrawal amount?", a: "You can redeem ₹10 UPI cash for 300 coins. Check the Redeem page for all available amounts." },
  { q: "Why was my redeem request rejected?", a: "Common reasons include invalid UPI ID, policy violations, or suspicious activity. Contact support for specific details." },
  { q: "How do I refer a friend?", a: "Share your referral link from the Dashboard or Earn page. You'll earn bonus coins when your friend joins and starts earning." },
  { q: "Is there a daily earning limit?", a: "There's no hard limit, but ad availability may vary. Keep checking the Earn page throughout the day." },
  { q: "How do I update my profile?", a: "Go to Settings from the profile menu to update your name, username, and other profile details." },
];

const CATEGORIES = [
  { value: "GENERAL", label: "General Inquiry" },
  { value: "BUG", label: "Bug Report" },
  { value: "FEATURE", label: "Feature Request" },
  { value: "PAYMENT", label: "Payment Issue" },
  { value: "ACCOUNT", label: "Account Issue" },
  { value: "REDEEM", label: "Redeem Problem" },
  { value: "OTHER", label: "Other" },
];

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = FAQ_ITEMS.filter(
    (f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <GlassCard level={2} sheen className="p-5 sm:p-6">
      <h3 className="text-base font-semibold text-foreground mb-1">Frequently Asked Questions</h3>
      <p className="text-sm text-muted-foreground mb-4">Quick answers to common questions</p>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search FAQ…"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric"
        />
      </div>

      <div className="space-y-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No matching questions found.</p>
        ) : (
          filtered.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="rounded-xl border border-border/60 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-accent/40 transition-colors"
                >
                  <span className="flex-1">{faq.q}</span>
                  {isOpen ? <ChevronUp size={14} className="shrink-0 text-muted-foreground" /> : <ChevronDown size={14} className="shrink-0 text-muted-foreground" />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}

interface TicketItem {
  id: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{ id: string; message: string; senderId: string; createdAt: string }>;
}

function TicketList({ tickets, loading, error, onSelect, onRetry }: {
  tickets: TicketItem[];
  loading: boolean;
  error: string | null;
  onSelect: (t: TicketItem) => void;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <GlassLoader label="Loading tickets…" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        icon="AlertCircle"
        title="Failed to load tickets"
        description={error}
        action={<LootButton variant="electric" size="sm" onClick={onRetry} leftIcon={<RefreshCw size={14} />}>Retry</LootButton>}
      />
    );
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon="Inbox"
        title="No support tickets"
        description="You haven't created any support tickets yet."
      />
    );
  }

  const statusVariant = (s: string): "warning" | "success" | "error" | "default" => {
    if (s === "OPEN") return "warning";
    if (s === "RESOLVED" || s === "CLOSED") return "success";
    if (s === "REJECTED") return "error";
    return "default";
  };

  return (
    <div className="space-y-2">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          onClick={() => onSelect(ticket)}
          className="w-full text-left rounded-xl glass-2 ring-1 ring-border p-4 hover:glass-3 hover:ring-electric/30 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-foreground truncate">{ticket.subject}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {CATEGORIES.find((c) => c.value === ticket.category)?.label || ticket.category}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge variant={statusVariant(ticket.status)} dot>{ticket.status}</StatusBadge>
              <ChevronRight size={14} className="text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock size={11} /> {new Date(ticket.createdAt).toLocaleDateString("en-IN")}</span>
            <span className="inline-flex items-center gap-1"><MessageSquare size={11} /> {ticket.messages.length} message{ticket.messages.length !== 1 ? "s" : ""}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function TicketDetail({ ticket, onBack }: { ticket: TicketItem; onBack: () => void }) {
  const statusVariant = (s: string): "warning" | "success" | "error" | "default" => {
    if (s === "OPEN") return "warning";
    if (s === "RESOLVED" || s === "CLOSED") return "success";
    if (s === "REJECTED") return "error";
    return "default";
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to tickets
      </button>

      <GlassCard level={2} sheen className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{ticket.subject}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {CATEGORIES.find((c) => c.value === ticket.category)?.label || ticket.category} &middot; Created {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
          <StatusBadge variant={statusVariant(ticket.status)} dot pulse={ticket.status === "OPEN"}>{ticket.status}</StatusBadge>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {ticket.messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
          ) : (
            ticket.messages.map((msg) => (
              <div key={msg.id} className="rounded-xl glass-1 ring-1 ring-border p-3">
                <p className="text-sm text-foreground">{msg.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(msg.createdAt).toLocaleString("en-IN")}</p>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function CreateTicketForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), category, message: message.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast({ title: "Ticket created", description: "We'll get back to you soon.", variant: "default" });
        setSubject("");
        setMessage("");
        setCategory("GENERAL");
        onSuccess();
      } else {
        throw new Error(json.message || "Failed to create ticket");
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard level={2} sheen className="p-5 sm:p-6">
      <h3 className="text-base font-semibold text-foreground mb-1">Create a Ticket</h3>
      <p className="text-sm text-muted-foreground mb-4">Reach out to our support team</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-electric"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief title for your issue"
            maxLength={200}
            className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue in detail…"
            rows={4}
            maxLength={2000}
            className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric resize-none"
          />
          <p className="text-[11px] text-muted-foreground text-right mt-1">{message.length}/2000</p>
        </div>
        <LootButton variant="electric" size="md" fullWidth loading={saving} leftIcon={!saving ? <Ticket size={15} /> : undefined} disabled={!subject.trim() || !message.trim()}>
          {saving ? "Submitting…" : "Submit Ticket"}
        </LootButton>
      </form>
    </GlassCard>
  );
}

export function SupportView() {
  const [supportEmail, setSupportEmail] = useState("");
  const [mode, setMode] = useState<"main" | "tickets" | "create" | "detail">("main");
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.supportEmail) {
          setSupportEmail(data.data.supportEmail);
        }
      })
      .catch(() => {});
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/support");
      const json = await res.json();
      if (res.ok && json.success) {
        setTickets(json.data);
      } else {
        setError("Failed to load tickets");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Support Center"
        description="Get help, report bugs, request features"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-5 lg:space-y-6"
      >
        {mode === "main" && (
          <>
            {/* Quick actions */}
            <motion.div variants={cardReveal} custom={0} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <GlassCard hover level={2} onClick={() => { setMode("tickets"); fetchTickets(); }} className="p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <IconBadge name="Ticket" accent="electric" size="md" />
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">My Tickets</p>
                <p className="text-xs text-muted-foreground mt-0.5">View and track support requests</p>
              </GlassCard>
              <GlassCard hover level={2} onClick={() => setMode("create")} className="p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <IconBadge name="Plus" accent="emerald" size="md" />
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">New Ticket</p>
                <p className="text-xs text-muted-foreground mt-0.5">Create a new support request</p>
              </GlassCard>
              <GlassCard hover level={2} onClick={() => window.open(`mailto:${supportEmail}`)} className="p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <IconBadge name="Mail" accent="cyan" size="md" />
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">Email Us</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{supportEmail || "support@lootloom.com"}</p>
              </GlassCard>
            </motion.div>

            {/* FAQ */}
            <motion.div variants={cardReveal} custom={1}>
              <FaqSection />
            </motion.div>

            {/* Contact card */}
            <motion.div variants={cardReveal} custom={2}>
              <GlassCard level={2} sheen className="p-5 sm:p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <LifeBuoy size={24} className="text-electric" />
                  <p className="text-sm text-muted-foreground">Need more help? Email us directly at</p>
                  {supportEmail && (
                    <a href={`mailto:${supportEmail}`} className="text-sm font-semibold text-electric hover:underline">
                      {supportEmail}
                    </a>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}

        {mode === "tickets" && (
          <motion.div variants={cardReveal} custom={0}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setMode("main")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
                <h3 className="text-base font-semibold text-foreground">My Tickets</h3>
              </div>
              <LootButton variant="electric" size="sm" onClick={() => setMode("create")} leftIcon={<Plus size={14} />}>
                New Ticket
              </LootButton>
            </div>
            <TicketList
              tickets={tickets}
              loading={loading}
              error={error}
              onSelect={(t) => { setSelectedTicket(t); setMode("detail"); }}
              onRetry={fetchTickets}
            />
          </motion.div>
        )}

        {mode === "detail" && selectedTicket && (
          <motion.div variants={cardReveal} custom={0}>
            <TicketDetail
              ticket={selectedTicket}
              onBack={() => setMode("tickets")}
            />
          </motion.div>
        )}

        {mode === "create" && (
          <motion.div variants={cardReveal} custom={0}>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setMode("main")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
            </div>
            <CreateTicketForm onSuccess={() => { setMode("tickets"); fetchTickets(); }} />
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
