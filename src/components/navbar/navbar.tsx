"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import * as Icons from "lucide-react";
import { Logo, LootButton } from "@/components/lootloom";
import { UserMenu } from "@/components/auth";
import { useNavigationStore, useAuthStore } from "@/stores";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { pageTransition } from "@/lib/animations";
import { signOut } from "next-auth/react";

interface NavLink {
  label: string;
  target: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Features", target: "overview" },
  { label: "How It Works", target: "how" },
  { label: "Rewards", target: "rewards" },
  { label: "FAQ", target: "faq" },
  { label: "Support", target: "support" },
];

function scrollToSection(target: string) {
  const el = document.getElementById(target);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function Navbar() {
  const navigate = useNavigationStore((s) => s.navigate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
    const sections = NAV_LINKS.map((l) => l.target);
    let current = sections[0];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.offsetTop - 120 <= latest) {
        current = id;
      }
    }
    setActiveSection(current);
  });

  const handleLogout = async () => {
    logout();
    try {
      await signOut({ redirect: false });
    } catch {
      // ignore
    }
    navigate("home");
    setMobileOpen(false);
  };

  return (
    <motion.header
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="sticky top-0 z-50 px-3 sm:px-4 lg:px-6 pt-3"
    >
      <nav
        className={cn(
          "px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 transition-shadow duration-300",
          "rounded-2xl glass-nav sheen ring-1 ring-border/40",
          scrolled
            ? "shadow-[var(--shadow-lg)] ring-border/70"
            : "shadow-[var(--shadow-md)]"
        )}
        aria-label="Primary"
      >
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            navigate("home");
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg shrink-0"
          aria-label="LootLoom home"
        >
          <Logo size="md" />
        </button>

        <div className="hidden md:flex items-center gap-1 text-sm">
          {NAV_LINKS.map((item) => {
            const isActive = activeSection === item.target;
            return (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.target)}
                className={cn(
                  "relative px-3 py-1.5 rounded-lg font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "text-electric"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-electric/8"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <LootButton
                size="sm"
                variant="glass"
                onClick={() => navigate("login")}
                leftIcon={<Icons.LogIn size={14} />}
              >
                Sign In
              </LootButton>
              <LootButton
                size="sm"
                variant="electric"
                onClick={() => navigate("register")}
                leftIcon={<Icons.UserPlus size={14} />}
              >
                Get Started
              </LootButton>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center size-10 rounded-xl glass-2 ring-1 ring-border text-foreground hover:bg-accent/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Icons.Menu size={18} aria-hidden="true" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[280px] p-0 glass-nav border-0 ring-1 ring-border/40"
          >
            <SheetHeader className="px-4 h-16 flex flex-row items-center border-b border-sidebar-border space-y-0">
              <Logo size="md" />
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    scrollToSection(item.target);
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  {item.label}
                </button>
              ))}

              <div className="h-px bg-border/60 my-3" />

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => { navigate("dashboard"); setMobileOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent/60 transition-colors flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <Icons.LayoutDashboard size={16} className="text-electric" aria-hidden="true" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => { navigate("profile"); setMobileOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent/60 transition-colors flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <Icons.User size={16} className="text-cyan-brand" aria-hidden="true" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-rose-brand hover:bg-rose-brand/10 transition-colors flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <Icons.LogOut size={16} aria-hidden="true" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <LootButton
                    size="md"
                    variant="glass"
                    fullWidth
                    onClick={() => { navigate("login"); setMobileOpen(false); }}
                    leftIcon={<Icons.LogIn size={16} />}
                  >
                    Sign In
                  </LootButton>
                  <LootButton
                    size="md"
                    variant="electric"
                    fullWidth
                    onClick={() => { navigate("register"); setMobileOpen(false); }}
                    leftIcon={<Icons.UserPlus size={16} />}
                  >
                    Get Started
                  </LootButton>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}
