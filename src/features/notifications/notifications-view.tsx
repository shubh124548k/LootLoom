"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Check,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  LootButton,
  IconBadge,
  StatusBadge,
  EmptyState,
  SkeletonRow,
} from "@/components/lootloom";
import { useNavigationStore, useNotificationStore } from "@/stores";
import type { NotificationItem } from "@/types";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Types
   ============================================================ */

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

type NotificationEvent =
  | "redeem_submitted"
  | "redeem_approved"
  | "redeem_rejected"
  | "coins_added"
  | "coins_deducted"
  | "ceo_message"
  | "support_reply"
  | "profile_updated"
  | "security_alert";

/* ============================================================
   Event metadata (icon, accent, label) for each supported event
   ============================================================ */

const EVENT_META: Record<
  NotificationEvent,
  { label: string; icon: string; accent: Accent }
> = {
  redeem_submitted: { label: "Redeem Submitted", icon: "Gift", accent: "purple" },
  redeem_approved: { label: "Redeem Approved", icon: "CheckCircle2", accent: "emerald" },
  redeem_rejected: { label: "Redeem Rejected", icon: "XCircle", accent: "rose" },
  coins_added: { label: "Coins Added", icon: "Plus", accent: "emerald" },
  coins_deducted: { label: "Coins Deducted", icon: "Minus", accent: "rose" },
  ceo_message: { label: "CEO Message", icon: "MessageSquareQuote", accent: "gold" },
  support_reply: { label: "Support Reply", icon: "LifeBuoy", accent: "cyan" },
  profile_updated: { label: "Profile Updated", icon: "UserCog", accent: "electric" },
  security_alert: { label: "Security Alert", icon: "ShieldAlert", accent: "rose" },
};

/* ============================================================
   Derive event from NotificationItem
   Backend will eventually send a richer discriminator; for now
   we infer from the standard `type` field + title keywords.
   ============================================================ */

function deriveEvent(item: NotificationItem): NotificationEvent {
  const t = (item.title || "").toLowerCase();
  const b = (item.body || "").toLowerCase();
  const hay = `${t} ${b}`;

  if (item.type === "security" || hay.includes("security") || hay.includes("login")) {
    return "security_alert";
  }
  if (hay.includes("ceo") || hay.includes("broadcast") || item.type === "announcement") {
    return "ceo_message";
  }
  if (hay.includes("support") || hay.includes("ticket") || hay.includes("reply")) {
    return "support_reply";
  }
  if (hay.includes("profile") || hay.includes("updated your")) {
    return "profile_updated";
  }
  if (hay.includes("approved")) return "redeem_approved";
  if (hay.includes("rejected")) return "redeem_rejected";
  if (hay.includes("submitted") || hay.includes("redeem")) return "redeem_submitted";
  if (hay.includes("deduct") || hay.includes("removed") || (item.type === "wallet" && b.includes("deduct"))) {
    return "coins_deducted";
  }
  if (hay.includes("added") || hay.includes("earned") || hay.includes("credited") || item.type === "reward" || item.type === "wallet") {
    return "coins_added";
  }
  return "coins_added";
}

/* ============================================================
   Date formatter (client-safe)
   ============================================================ */

function formatTime(time: string): string {
  if (!time) return "—";
  try {
    const d = new Date(time);
    if (Number.isNaN(d.getTime())) return time;
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return time;
  }
}

/* ============================================================
   Notification item card
   ============================================================ */

function NotificationCard({
  item,
  index,
  onMarkRead,
}: {
  item: NotificationItem;
  index: number;
  onMarkRead: (id: string) => void;
}) {
  const event = deriveEvent(item);
  const meta = EVENT_META[event];

  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" animate="visible">
      <GlassCard
        level={1}
        sheen
        hover
        className={cn(
          "p-4 sm:p-5 ring-1 transition-all",
          item.read ? "ring-border/40" : "ring-electric/25 bg-electric/[0.03]"
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icon */}
          <div className="shrink-0 relative">
            <IconBadge name={meta.icon} accent={meta.accent} size="md" />
            {!item.read && (
              <span className="absolute -top-1 -right-1 size-3 rounded-full bg-electric ring-2 ring-background" />
            )}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {item.title || meta.label}
              </span>
              <StatusBadge variant={item.read ? "default" : "info"} dot pulse={!item.read}>
                {item.read ? "Read" : "Unread"}
              </StatusBadge>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">
                {meta.label}
              </span>
            </div>

            {item.body && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                {item.body}
              </p>
            )}

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock size={11} />
                <span>{formatTime(item.time)}</span>
              </div>

              {!item.read && (
                <LootButton
                  variant="glass"
                  size="sm"
                  leftIcon={<Check size={13} />}
                  onClick={() => onMarkRead(item.id)}
                  className="h-7 px-2.5 text-[11px]"
                >
                  Mark as Read
                </LootButton>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Notification list (with loading / empty / list states)
   ============================================================ */

function NotificationList() {
  const { items, markRead } = useNotificationStore();
  // Loading placeholder — future API integration will toggle this.
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonRow count={5} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <GlassCard level={2} sheen className="py-10">
        <EmptyState
          icon="Bell"
          title="No notifications"
          description="You're all caught up"
        />
      </GlassCard>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3 max-h-[80vh] overflow-y-auto lootloom-scroll pr-1"
    >
      {items.map((item, i) => (
        <NotificationCard
          key={item.id}
          item={item}
          index={i}
          onMarkRead={markRead}
        />
      ))}
    </motion.div>
  );
}

/* ============================================================
   Main NotificationsView
   ============================================================ */

export function NotificationsView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { items, unreadCount, markAllRead } = useNotificationStore();

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="Your recent updates"
        actions={
          <>
            <LootButton
              variant="outline"
              size="md"
              leftIcon={<Sparkles size={15} />}
              onClick={() => navigate("earn")}
            >
              <span className="hidden sm:inline">Earn Coins</span>
            </LootButton>
            <LootButton
              variant="electric"
              size="md"
              leftIcon={<CheckCheck size={15} />}
              onClick={markAllRead}
              disabled={items.length === 0 || unreadCount === 0}
            >
              Mark All Read
            </LootButton>
          </>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-5 lg:space-y-6"
      >
        <NotificationList />
      </motion.div>
    </PageContainer>
  );
}
