"use client";

import { ThemeProvider } from "@/components/lootloom/theme-provider";
import { ViewTransitionProvider } from "@/components/lootloom/view-transition";

/**
 * AppProviders — centralized application provider composition.
 * Wraps the entire app with: Theme → ViewTransition.
 *
 * Future providers (Auth, Wallet, Notifications, Reward, Settings,
 * Advertisement, FeatureFlags) will compose here as the backend integrates.
 *
 * Usage in layout:
 *   <AppProviders>{children}</AppProviders>
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ViewTransitionProvider>{children}</ViewTransitionProvider>
    </ThemeProvider>
  );
}
