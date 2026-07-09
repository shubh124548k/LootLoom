"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Logo } from "./logo";
import { useNavigationStore, useUIStore, useNotificationStore, useWalletStore, useAuthStore, useUserStore } from "@/stores";
import { PAGE_META, NAV_ITEMS } from "@/config/navigation";
import { AnimatedCounter } from "./animated-counter";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/types";

function ThemeController() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const isLight = theme === "light";
  return (
    <button
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="size-10 inline-flex items-center justify-center rounded-xl glass-2 text-foreground hover:glass-3 ring-1 ring-border transition-all"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25 }}
        >
          {isLight ? <Icons.Moon size={18} /> : <Icons.Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function SearchButton() {
  const setSearch = useUIStore((s) => s.setSearch);
  return (
    <button
      onClick={() => setSearch(true)}
      className="hidden md:inline-flex items-center gap-2 h-10 px-3 rounded-xl glass-2 ring-1 ring-border text-muted-foreground hover:text-foreground hover:glass-3 transition-all min-w-[200px] lg:min-w-[280px]"
    >
      <Icons.Search size={16} />
      <span className="text-sm flex-1 text-left">Search…</span>
      <kbd className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
        Ctrl K
      </kbd>
    </button>
  );
}

function SearchModal() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearch);
  const navigate = useNavigationStore((s) => s.navigate);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setQuery("");
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  if (!open) return null;
  const results = NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        className="fixed inset-0 z-[70] bg-foreground/30 backdrop-blur-md flex items-start justify-center pt-[12vh] px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl rounded-2xl glass-3 shadow-[var(--shadow-xl)] ring-1 ring-border overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
            <Icons.Search size={18} className="text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, rewards, activities…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">ESC</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No results found</p>
            )}
            {results.map((item) => {
              const Lucide = (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon] ?? Icons.Circle;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.id);
                    close();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <span className="size-8 rounded-lg bg-electric/10 text-electric flex items-center justify-center">
                    <Lucide size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <Icons.ArrowRight size={14} className="text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function WalletShortcut() {
  const navigate = useNavigationStore((s) => s.navigate);
  const coins = useWalletStore((s) => s.availableCoins);
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate("wallet")}
      className="inline-flex items-center gap-2 h-10 pl-2 pr-3 rounded-xl glass-2 ring-1 ring-border hover:glass-3 hover:ring-electric/30 transition-all"
      aria-label="Open wallet"
    >
      <span className="size-7 rounded-lg bg-[linear-gradient(135deg,var(--gold),oklch(0.75_0.18_60))] flex items-center justify-center">
        <Icons.Coins size={15} className="text-white" />
      </span>
      <AnimatedCounter value={coins} className="text-sm font-bold text-foreground" />
    </motion.button>
  );
}

function NotificationShortcut() {
  const setNotificationCenter = useUIStore((s) => s.setNotificationCenter);
  const centerOpen = useUIStore((s) => s.notificationCenterOpen);
  const unread = useNotificationStore((s) => s.unreadCount);
  return (
    <button
      onClick={() => setNotificationCenter(!centerOpen)}
      aria-label="Notifications"
      className="relative size-10 inline-flex items-center justify-center rounded-xl glass-2 ring-1 ring-border text-foreground hover:glass-3 hover:ring-electric/30 transition-all"
    >
      <Icons.Bell size={18} />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-brand text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

function NotificationCenter() {
  const open = useUIStore((s) => s.notificationCenterOpen);
  const setOpen = useUIStore((s) => s.setNotificationCenter);
  const { items, markAllRead, markRead } = useNotificationStore();
  const navigate = useNavigationStore((s) => s.navigate);

  if (!open) return null;
  const iconFor: Record<string, string> = {
    reward: "Gift",
    wallet: "Wallet",
    system: "Settings2",
    security: "ShieldCheck",
    social: "Users",
    announcement: "Megaphone",
  };

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="absolute right-0 top-12 z-[65] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl glass-3 shadow-[var(--shadow-xl)] ring-1 ring-border overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <button onClick={markAllRead} className="text-xs text-electric font-medium hover:underline">
            Mark all read
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
          ) : (
            items.map((n) => {
              const Lucide = (Icons as unknown as Record<string, Icons.LucideIcon>)[iconFor[n.type] ?? "Bell"] ?? Icons.Bell;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    markRead(n.id);
                    navigate("notifications");
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 hover:bg-accent/60 transition-colors text-left border-b border-border/40 last:border-0",
                    !n.read && "bg-electric/5"
                  )}
                >
                  <span className="size-8 rounded-lg bg-electric/10 text-electric flex items-center justify-center shrink-0">
                    <Lucide size={15} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                      {!n.read && <span className="size-1.5 rounded-full bg-electric shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
        <button
          onClick={() => {
            navigate("notifications");
            setOpen(false);
          }}
          className="w-full h-11 border-t border-border text-xs font-semibold text-electric hover:bg-accent/60 transition-colors"
        >
          View all notifications
        </button>
      </motion.div>
    </>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigationStore((s) => s.navigate);
  const logout = useAuthStore((s) => s.logout);
  const user = useUserStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items: { label: string; icon: keyof typeof Icons; view?: ViewId; action?: () => void }[] = [
    { label: "Profile", icon: "User", view: "profile" },
    { label: "Settings", icon: "Settings", view: "settings" },
    { label: "Support", icon: "LifeBuoy", view: "support" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Profile menu"
        className="inline-flex items-center gap-2 h-10 pl-1.5 pr-2 rounded-xl glass-2 ring-1 ring-border hover:glass-3 hover:ring-electric/30 transition-all"
      >
        <span className="size-7 rounded-full bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] flex items-center justify-center text-white text-xs font-bold">
          {user.fullName.charAt(0)}
        </span>
        <Icons.ChevronDown size={14} className="text-muted-foreground" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="absolute right-0 top-12 z-[65] w-60 rounded-2xl glass-3 shadow-[var(--shadow-xl)] ring-1 ring-border overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-electric/10 text-electric ring-1 ring-electric/20 px-2 py-0.5 text-[10px] font-semibold">
                <Icons.Star size={10} /> Level {user.level}
              </div>
            </div>
            <div className="p-1.5">
              {items.map((it) => {
                const Lucide = Icons[it.icon] as Icons.LucideIcon;
                return (
                  <button
                    key={it.label}
                    onClick={() => {
                      if (it.view) navigate(it.view);
                      if (it.action) it.action();
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
                  >
                    <Lucide size={15} className="text-muted-foreground" />
                    {it.label}
                  </button>
                );
              })}
            </div>
            <div className="p-1.5 border-t border-border">
              <button
                onClick={() => {
                  logout();
                  navigate("home");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-brand/10 transition-colors text-sm text-rose-brand"
              >
                <Icons.LogOut size={15} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Breadcrumb() {
  const current = useNavigationStore((s) => s.current);
  const navigate = useNavigationStore((s) => s.navigate);
  const meta = PAGE_META[current];
  if (!meta?.breadcrumbs?.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
      {meta.breadcrumbs.map((b, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <Icons.ChevronRight size={12} className="text-muted-foreground/50" />}
          {b.view ? (
            <button onClick={() => navigate(b.view!)} className="hover:text-foreground transition-colors">
              {b.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{b.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/**
 * Header — minimal floating top header.
 * Logo (mobile), search, wallet shortcut, notifications, theme, profile.
 */
export function Header() {
  const setMobileDrawer = useUIStore((s) => s.setMobileDrawer);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-3 z-40 mx-3 lg:mx-0 lg:ml-[calc(var(--sidebar-w)+1.5rem)] lg:mr-3 transition-[margin] duration-[400ms] ease-out"
    >
      <div className="flex items-center gap-3 h-16 px-3 sm:px-4 rounded-2xl glass-nav shadow-[var(--shadow-md)] ring-1 ring-border/50">
        {/* Mobile menu */}
        <button
          onClick={() => setMobileDrawer(true)}
          aria-label="Open menu"
          className="lg:hidden size-10 inline-flex items-center justify-center rounded-xl glass-2 text-foreground"
        >
          <Icons.Menu size={18} />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>

        <div className="hidden lg:block">
          <Breadcrumb />
        </div>

        <div className="flex-1" />

        <SearchButton />
        <WalletShortcut />
        <div className="relative">
          <NotificationShortcut />
          <NotificationCenter />
        </div>
        <ThemeController />
        <ProfileMenu />
      </div>
      <SearchModal />
    </motion.header>
  );
}
