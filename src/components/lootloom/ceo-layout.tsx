"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Logo } from "@/components/lootloom/logo";
import { useNavigationStore, useUIStore } from "@/stores";
import { sidebarItem, drawerLeft, overlayFade } from "@/lib/animations";
import { AnimatedCounter } from "@/components/lootloom/animated-counter";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/types";

interface CeoNavItem {
  id: ViewId;
  label: string;
  icon: string;
}

const CEO_NAV: CeoNavItem[] = [
  { id: "ceo-dashboard", label: "Mission Control", icon: "LayoutDashboard" },
  { id: "ceo-users", label: "User Management", icon: "Users" },
  { id: "ceo-wallet", label: "Wallet Management", icon: "Wallet" },
  { id: "ceo-redeem", label: "Redeem Approval", icon: "ShoppingBag" },
  { id: "ceo-support", label: "Support Center", icon: "LifeBuoy" },
  { id: "ceo-communication", label: "Communication", icon: "Megaphone" },
  { id: "ceo-security", label: "Security Ops", icon: "ShieldCheck" },
];

function CeoNav() {
  const { current, navigate } = useNavigationStore();
  return (
    <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4" aria-label="CEO navigation">
      <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
        Administration
      </p>
      <div className="space-y-1">
        {CEO_NAV.map((item, i) => {
          const Lucide = (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon] ?? Icons.Circle;
          const active = current === item.id;
          return (
            <motion.button
              key={item.id}
              variants={sidebarItem}
              custom={i}
              initial="initial"
              animate="animate"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.id)}
              className={cn(
                "group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-[linear-gradient(120deg,var(--electric)/12,var(--purple-brand)/10)] text-foreground ring-1 ring-electric/20 shadow-[var(--shadow-sm)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              {active && <span className="nav-active-indicator" />}
              <Lucide size={18} className={cn(active && "text-electric")} />
              <span className="flex-1 text-left">{item.label}</span>
              <Icons.Lock size={12} className="text-muted-foreground/60" />
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl glass-2 p-4 ring-1 ring-border/60 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 size-20 rounded-full bg-emerald-brand/15 blur-2xl" />
        <div className="flex items-center gap-2 mb-2">
          <Icons.ShieldCheck size={14} className="text-emerald-brand" />
          <p className="text-xs font-semibold text-foreground">Secure Session</p>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Encrypted administrator session active. All actions are audited.
        </p>
      </div>
    </nav>
  );
}

function CeoHeader() {
  const navigate = useNavigationStore((s) => s.navigate);
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-3 z-40 mx-3 lg:ml-[calc(280px+1.5rem)] lg:mr-3 transition-[margin] duration-[400ms] ease-out"
    >
      <div className="flex items-center gap-3 h-16 px-4 rounded-2xl glass-nav shadow-[var(--shadow-md)] ring-1 ring-border/50">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-brand animate-pulse" />
          <span className="text-xs font-semibold text-emerald-brand hidden sm:inline">CEO MODE</span>
        </div>
        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
        <button
          onClick={() => navigate("ceo-dashboard")}
          className="text-sm font-semibold text-foreground hover:text-electric transition-colors"
        >
          Mission Control
        </button>

        <div className="flex-1" />

        <button className="hidden md:inline-flex items-center gap-2 h-10 px-3 rounded-xl glass-2 ring-1 ring-border text-muted-foreground hover:text-foreground transition-all min-w-[220px]">
          <Icons.Search size={16} />
          <span className="text-sm flex-1 text-left">Search…</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Ctrl K</kbd>
        </button>

        <button className="relative size-10 inline-flex items-center justify-center rounded-xl glass-2 ring-1 ring-border text-foreground hover:glass-3 transition-all">
          <Icons.Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-brand text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background">3</span>
        </button>

        <button className="inline-flex items-center gap-2 h-10 pl-1.5 pr-2 rounded-xl glass-2 ring-1 ring-border hover:glass-3 transition-all">
          <span className="size-7 rounded-full bg-[linear-gradient(135deg,var(--navy),var(--electric))] flex items-center justify-center text-white text-xs font-bold">
            CEO
          </span>
          <Icons.ChevronDown size={14} className="text-muted-foreground" />
        </button>
      </div>
    </motion.header>
  );
}

/**
 * CeoLayout — dedicated private administration layout.
 * Completely isolated from the normal user AppShell. Private left sidebar,
 * minimal admin header with security status bar, dynamic workspace.
 */
export function CeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen" style={{ "--sidebar-w": "280px" } as React.CSSProperties}>
      {/* CEO Sidebar (desktop) */}
      <aside className="hidden lg:block fixed left-3 top-3 bottom-3 z-30 w-[280px]">
        <div className="h-full w-full rounded-3xl glass-nav shadow-[var(--shadow-lg)] flex flex-col overflow-hidden ring-1 ring-border/40">
          <div className="flex items-center gap-2 px-4 h-16 shrink-0 border-b border-sidebar-border">
            <Logo />
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-navy/10 text-navy ring-1 ring-navy/20 px-2 py-0.5 text-[10px] font-bold">
              <Icons.Lock size={9} /> CEO
            </span>
          </div>
          <CeoNav />
          <div className="px-3 py-3 border-t border-sidebar-border">
            <button className="w-full flex items-center gap-3 rounded-xl p-2 hover:bg-accent/60 transition-colors">
              <div className="size-8 rounded-full bg-[linear-gradient(135deg,var(--navy),var(--electric))] flex items-center justify-center text-white text-xs font-bold shrink-0">
                CE
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">Chief Executive</p>
                <p className="text-[10px] text-emerald-brand truncate">● Active Session</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <CeoHeader />
      <main className="lg:ml-[calc(280px+1.5rem)] pt-3 pr-3 lg:pr-3 min-h-screen transition-[margin] duration-[400ms] ease-out">
        <div className="min-h-[calc(100vh-7rem)]">{children}</div>
      </main>
    </div>
  );
}
