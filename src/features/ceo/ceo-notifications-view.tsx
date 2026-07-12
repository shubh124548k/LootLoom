"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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

const CATEGORY_FILTERS: AdminFilterOption[] = [
  { label: "All", value: "all" },
  { label: "New Redeem", value: "redeem" },
  { label: "New User", value: "user" },
  { label: "Support Reply", value: "support" },
  { label: "Security Alert", value: "security" },
  { label: "System Event", value: "system" },
];

function mapApiType(type: string | null): NotificationCategory {
  if (type === "security") return "security";
  return "system";
}

interface ApiNotification {
  id: string;
  metadata: { title: string; message: string; type: string | null };
  createdAt: string;
}

function mapApiNotification(item: ApiNotification): CeoNotification {
  return {
    id: item.id,
    category: mapApiType(item.metadata.type),
    title: item.metadata.title || "Notification",
    body: item.metadata.message || "",
    time: item.createdAt,
    read: false,
  };
}

function formatRelativeTime(time: string): string {
  const t = new Date(time).getTime();
  if (Number.isNaN(t)) return "\u2014";
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

export function CeoNotificationsView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CeoNotification[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/ceo/notifications?page=1&pageSize=20");
      if (!resp.ok) {
        throw new Error(`Request failed with status ${resp.status}`);
      }
      const json = await resp.json();
      if (!json.success) {
        throw new Error(json.message ?? "API returned unsuccessful response");
      }
      const mapped = (json.data as ApiNotification[]).map(mapApiNotification);
      setItems(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items]
  );

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
  }

  function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleRefresh() {
    fetchNotifications();
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

      <div className="mb-5">
        <AdminToolbar>
          <AdminSearch
            value={query}
            onChange={setQuery}
            placeholder="Search notifications\u2026"
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

      {!loading && !error && items.length > 0 && (
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

      {loading ? (
        <SkeletonRow count={5} />
      ) : error ? (
        <GlassCard level={1} className="py-12">
          <EmptyState
            icon="AlertTriangle"
            title="Failed to load notifications"
            description={error}
          />
        </GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard level={1} className="py-12">
          <EmptyState
            icon="BellOff"
            title="No notifications"
            description={
              items.length === 0
                ? "No notifications yet"
                : "No notifications match your filters"
            }
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
    </PageContainer>
  );
}
