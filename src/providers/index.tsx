"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/lootloom/theme-provider";
import { ViewTransitionProvider } from "@/components/lootloom/view-transition";
import { AuthDataSync } from "@/components/lootloom/auth-data-sync";

/**
 * AppProviders — centralized application provider composition.
 * SessionProvider (NextAuth) → ThemeProvider → ViewTransitionProvider → AuthDataSync
 *
 * AuthDataSync connects real Google auth session to Zustand stores
 * (user data, wallet, notifications) via API calls.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ViewTransitionProvider>
          <AuthDataSync>{children}</AuthDataSync>
        </ViewTransitionProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
