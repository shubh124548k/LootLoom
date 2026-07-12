"use client";

/* ============================================================
   LootLoom — CEO Notifications View
   Renders INSIDE the CeoLayout. No sidebar/header/background.
   Skeleton-first: local typed array initialized to [].
   All values backend-ready — replace CEO_NOTIFICATIONS with a
   fetch from /api/ceo/notifications to go live.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCheck, RefreshCw, Search } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Grid,
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
  type AdminFilterOption,
} from "@/components/admin";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Types
   ============================================================ */
type NotificationCategory =
  | "redeem"
  | "user"
  | "support"
  | "security"
  | "system";

interface CeoNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

/* ============================================================
   Category meta — icon name, accent, label, StatusBadge variant
   ============================================================ */
type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

interface CategoryMeta {
  icon: string;
  accent: Accent;
  label: string;
  badgeVariant: "default" | "success" | "warning" | "error" | "info" | "gold" | "electric" | "purple" | "cyan";
}

const CATEGORY_META: Record<NotificationCategory, CategoryMeta> = {
  redeem: {
    icon: "ShoppingBag",
    accent: "gold",
    label: "New Redeem",
    badgeVariant: "gold",
  },
  user: {
    icon: "UserPlus",
    accent: "electric",
    label: "New User",
    badgeVariant: "electric",
  },
  support: {
    icon: "MessageSquare",
    accent: "cyan",
    label: "Support Reply",
    badgeVariant: "cyan",
  },
  security: {
    icon: "ShieldAlert",
    accent: "rose",
    label: "Security Alert",
    badgeVariant: "error",
  },
  system: {
    icon: "Server",
    accent: "navy",
    label: "System Event",
    badgeVariant: "default",
  },
};

/* ============================================================
   Filter options
   ============================================================ */
const CATEGORY_FILTERS: AdminFilterOption[] = [
  { label: "All", value: "all" },
  { label: "New Redeem", value: "redeem" },
  { label: "New User", value: "user" },
  { label: "Support Reply", value: "support" },
  { label: "Security Alert", value: "security" },
  { label: "System Event", value: "system" },
];

/* ============================================================
   Placeholder data — initialized to [] (backend-ready).
   TODO: replace with fetch from /api/ceo/notifications
   ============================================================ */
const CEO_NOTIFICATIONS: CeoNotification[] = [];

/* ============================================================
   Relative time formatter
   - Accepts ISO string or epoch ms.
   - Returns "Just now" / "Xm ago" / "Xh ago" / "Xd ago" / date.
   ============================================================ */
function formatRelativeTime(time: string): string {
  const t = new Date(time).getTime();
  if (Number.isNaN(t)) return "—";
  const diffMs = Date.now() - t;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(t).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/* ============================================================
   Single notification card
   ============================================================ */
interface NotificationCardProps {
  notification: CeoNotification;
  onMarkRead: (id: string) => void;
  index: number;
}

function NotificationCard({ notification, onMarkRead, index }: NotificationCardProps) {
  const meta = CATEGORY_META[notification.category];
  const unread = !notification.read;

  return (
    <motion.div variants={cardReveal} custom={index} className="h-full">
      <GlassCard
        level={2}
        className={cn(
          "p-4 sm:p-5 h-full flex flex-col gap-3 transition-all",
          unread
            ? "ring-electric/30 bg-electric/[0.04]"
            : "ring-border/60 opacity-80"
        )}
      >
        <div className="flex items-start gap-3">
          <IconBadge name={meta.icon} accent={meta.accent} size="md" />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground leading-snug">
                {notification.title}
              </h3>
              {unread && (
                <span
                  aria-hidden
                  className="mt-1 size-2 rounded-full bg-electric shrink-0 shadow-[0_0_8px_var(--electric)]"
                />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge variant={meta.badgeVariant} dot={unread} pulse={unread}>
                {meta.label}
              </StatusBadge>
              <span className="text-[11px] text-muted-foreground/80 font-medium">
                {formatRelativeTime(notification.time)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
          {notification.body}
        </p>

        <div className="mt-auto pt-1 flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
            #{notification.id.slice(-6).toUpperCase()}
          </span>
          {unread && (
            <LootButton
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(notification.id)}
              leftIcon={<CheckCheck size={13} />}
            >
              Mark as read
            </LootButton>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Main view
   ============================================================ */
export function CeoNotificationsView() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CeoNotification[]>(CEO_NOTIFICATIONS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  // Simulated 600ms load on mount — preserves premium feel while backend is pending.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items]
  );

  // Filter by category + search query (title + body).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((n) => {
      if (category !== "all" && n.category !== category) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q)
      );
    });
  }, [items, category, query]);

  function handleMarkRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // TODO: POST /api/ceo/notifications/{id}/read
  }

  function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    // TODO: POST /api/ceo/notifications/read-all
  }

  function handleRefresh() {
    setLoading(true);
    // TODO: replace with real fetch + setLoading(false) in finally block.
    setTimeout(() => setLoading(false), 600);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="CEO notification center — platform events & alerts"
        actions={
          <LootButton
            variant="glass"
            size="md"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            leftIcon={<CheckCheck size={15} />}
          >
            Mark all read
          </LootButton>
        }
      />

      {/* Toolbar */}
      <div className="mb-5">
        <AdminToolbar>
          <AdminSearch
            value={query}
            onChange={setQuery}
            placeholder="Search notifications…"
            className="sm:flex-1 sm:max-w-md"
          />
          <AdminFilter
            value={category}
            onChange={setCategory}
            options={CATEGORY_FILTERS}
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

      {/* Unread count banner */}
      {!loading && items.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Search size={13} className="text-muted-foreground/60" />
          <span>
            Showing{" "}
            <span className="text-foreground font-semibold">{filtered.length}</span>{" "}
            of {items.length} ·{" "}
            <span className="text-electric font-semibold">{unreadCount}</span> unread
          </span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <SkeletonRow count={5} />
      ) : filtered.length === 0 ? (
        <GlassCard level={1} className="py-12">
          <EmptyState
            icon="BellOff"
            title="No notifications"
            description="Platform events will appear here once the backend is connected"
          />
        </GlassCard>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Grid cols={2}>
            {filtered.map((n, i) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                index={i}
              />
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Backend hint footer */}
      {!loading && items.length === 0 && (
        <div className="mt-5">
          <GlassCard level={1} className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <IconBadge name="Info" accent="electric" size="sm" />
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  Live events will appear once backend is connected
                </p>
                <p className="text-xs text-muted-foreground">
                  Wire{" "}
                  <code className="text-[11px] font-mono px-1 py-0.5 rounded bg-muted text-foreground/80">
                    /api/ceo/notifications
                  </code>{" "}
                  to surface new redeems, user signups, support replies, security
                  alerts and system events.
                </p>
              </div>
              <StatusBadge variant="warning" dot pulse>
                Awaiting backend
              </StatusBadge>
            </div>
          </GlassCard>
        </div>
      )}
    </PageContainer>
  );
}

