"use client";

import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useUIStore } from "@/stores";

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const sidebarWidth = collapsed ? "88px" : "272px";

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={
        { "--sidebar-w": sidebarWidth } as React.CSSProperties
      }
    >
      <Sidebar />
      <Header />
      <main className="lg:ml-[calc(var(--sidebar-w)+1.5rem)] pt-3 pr-3 lg:pr-3 min-h-screen transition-[margin] duration-[400ms] ease-out">
        <div className="min-h-[calc(100vh-7rem)]">{children}</div>
      </main>
    </div>
  );
}
