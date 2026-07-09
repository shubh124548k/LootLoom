/**
 * LootLoom — Layout Barrel
 *
 * Layout composition is handled centrally in the AppRouter which selects:
 *  - Public layout (home)          → full-screen, no shell
 *  - Authentication layout          → full-screen split, no shell
 *  - User Application layout        → AppShell (glass sidebar + header)
 *  - CEO layout                     → AppShell (future: CEO guard)
 *  - System / Error layout          → full-screen centered
 *  - Maintenance / Loading layout   → full-screen centered
 *
 * The AppShell component (src/components/lootloom/app-shell.tsx) is the
 * single reusable application layout wrapper for all authenticated views.
 */
export { AppShell } from "@/components/lootloom/app-shell";
export type { PublicLayoutProps } from "./types";

// Local type placeholder (kept lightweight to avoid extra files)
export interface PublicLayoutProps {
  children: React.ReactNode;
}
