"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useUIStore, useNavigationStore } from "@/stores";

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const navigate = useNavigationStore((s) => s.navigate);
  const sidebarWidth = collapsed ? "88px" : "272px";

  return (
    <div
      className="relative min-h-screen"
      style={
        { "--sidebar-w": sidebarWidth } as React.CSSProperties
      }
    >
      <Sidebar />
      <Header />
      <main className="lg:ml-[calc(var(--sidebar-w)+1.5rem)] pt-3 pr-3 lg:pr-3 min-h-screen transition-[margin] duration-[400ms] ease-out">
        <motion.button
          onClick={() => navigate("home")}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-4 z-50 size-9 rounded-xl glass-2 ring-1 ring-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all lg:hidden"
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
        </motion.button>
        <div className="min-h-[calc(100vh-7rem)]">{children}</div>
      </main>
    </div>
  );
}
