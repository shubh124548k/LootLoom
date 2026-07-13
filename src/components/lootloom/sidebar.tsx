"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { useMemo } from "react";
import { Logo } from "./logo";
import { useNavigationStore, useUIStore, useNotificationStore, useWalletStore, useAuthStore } from "@/stores";
import { NAV_ITEMS, NAV_GROUPS } from "@/config/navigation";
import { sidebarItem, drawerLeft, overlayFade } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { NavItem, ViewId } from "@/types";

function NavIcon({ name, size = 18 }: { name: string; size?: number }) {
  const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Circle;
  return <LucideIcon size={size} strokeWidth={2} />;
}

function getBadge(view: ViewId): { count: number; dot: boolean } | null {
  if (view === "notifications") {
    const count = useNotificationStore.getState().unreadCount;
    return { count, dot: count > 0 };
  }
  if (view === "wallet") {
    const pending = useWalletStore.getState().pendingCoins;
    return { count: pending, dot: pending > 0 };
  }
  return null;
}

interface SidebarNavItemProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  index: number;
  onClick: () => void;
}

function SidebarNavItem({ item, active, collapsed, index, onClick }: SidebarNavItemProps) {
  const badge = getBadge(item.id);
  const isCeo = item.id === "ceo-dashboard";

  return (
    <motion.button
      variants={sidebarItem}
      custom={index}
      initial="initial"
      animate="animate"
      whileHover={{ x: collapsed ? 0 : 2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={cn(
        "group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        active
          ? "bg-[linear-gradient(120deg,var(--electric)/12,var(--purple-brand)/10)] text-foreground ring-1 ring-electric/20 shadow-[var(--shadow-sm)]"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
        collapsed && "justify-center px-0"
      )}
    >
      {active && <span className="nav-active-indicator" />}

      <span
        className={cn(
          "relative inline-flex items-center justify-center shrink-0 transition-transform",
          active && "text-electric",
          !active && "group-hover:scale-110"
        )}
      >
        <NavIcon name={item.icon} />
        {isCeo && (
          <Icons.Lock
            size={10}
            className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 box-content text-foreground/70"
          />
        )}
        {badge?.dot && !isCeo && (
          <span className="absolute -top-1 -right-1 size-2 rounded-full bg-rose-brand ring-2 ring-background" />
        )}
      </span>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 text-left truncate overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {!collapsed && badge && badge.count > 0 && !isCeo && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-electric/15 text-electric text-[10px] font-bold px-1.5"
        >
          {badge.count > 99 ? "99+" : badge.count}
        </motion.span>
      )}

      {!collapsed && isCeo && (
        <Icons.Lock size={13} className="ml-auto text-muted-foreground/70" />
      )}
    </motion.button>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const { current, navigate } = useNavigationStore();
  const groups = useMemo(() => {
    const map: Record<string, NavItem[]> = {};
    for (const item of NAV_ITEMS) {
      (map[item.group] ??= []).push(item);
    }
    return map;
  }, []);

  const groupOrder: NavItem["group"][] = ["main", "earning", "account", "system", "ceo"];
  let idx = 0;

  return (
    <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5" aria-label="Main navigation">
      {groupOrder.map((g) => {
        const items = groups[g];
        if (!items?.length) return null;
        return (
          <div key={g} className="space-y-1">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1"
                >
                  {NAV_GROUPS[g]}
                </motion.p>
              )}
            </AnimatePresence>
            {items.map((item) => {
              const localIdx = idx++;
              return (
                <SidebarNavItem
                  key={item.id}
                  item={item}
                  index={localIdx}
                  active={current === item.id}
                  collapsed={collapsed}
                  onClick={() => navigate(item.id)}
                />
              );
            })}
          </div>
        );
      })}

    </nav>
  );
}

/**
 * Sidebar — floating glass left sidebar with collapse + mobile drawer.
 */
export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUIStore((s) => s.mobileDrawerOpen);
  const setMobileDrawer = useUIStore((s) => s.setMobileDrawer);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <>
      {/* Desktop floating sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 88 : 272 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:block fixed left-3 top-3 bottom-3 z-30"
      >
        <div className="h-full w-full rounded-3xl glass-nav shadow-[var(--shadow-lg)] flex flex-col overflow-hidden">
          {/* Logo header */}
          <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-sidebar-border">
            <button onClick={() => navigate("home")} aria-label="Go to home" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
              {collapsed ? <Logo withText={false} /> : <Logo />}
            </button>
            <button
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Icons.PanelLeftClose
                size={16}
                className={cn("transition-transform", collapsed && "rotate-180")}
              />
            </button>
          </div>

          <SidebarContent collapsed={collapsed} />

          {/* Footer user mini */}
          <div className="px-3 py-3 border-t border-sidebar-border">
            <button
              onClick={() => navigate("settings")}
              aria-label="Open settings"
              className={cn(
                "w-full flex items-center gap-3 rounded-xl p-2 hover:bg-accent/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                collapsed && "justify-center"
              )}
            >
              <div className="size-8 rounded-full bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] flex items-center justify-center text-white text-xs font-bold shrink-0" aria-hidden="true">
                LM
              </div>
              {!collapsed && (
                <div className="text-left min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">Member</p>
                  <p className="text-[10px] text-muted-foreground truncate">Level 7</p>
                </div>
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              variants={overlayFade}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setMobileDrawer(false)}
              aria-hidden="true"
              className="lg:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
            />
            <motion.aside
              variants={drawerLeft}
              initial="initial"
              animate="animate"
              exit="exit"
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] glass-nav shadow-[var(--shadow-xl)] flex flex-col"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
                <Logo />
                <button
                  onClick={() => setMobileDrawer(false)}
                  aria-label="Close menu"
                  className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Icons.X size={18} aria-hidden="true" />
                </button>
              </div>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
