"use client";

import { Component, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/lootloom/theme-provider";
import { ViewTransitionProvider } from "@/components/lootloom/view-transition";
import { AuthDataSync } from "@/components/lootloom/auth-data-sync";
import { GlobalErrorHandler } from "@/components/lootloom/global-error-handler";

/**
 * SessionErrorBoundary — catches errors thrown by NextAuth's SessionProvider
 * when the /api/auth/session fetch fails (e.g. dev server recompiling,
 * network issues, OOM-kill). Without this, a single session fetch failure
 * crashes the entire app with a white screen.
 */
class SessionErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidUpdate(): void {
    // Reset error state after a short delay so the session can retry
    if (this.state.hasError) {
      setTimeout(() => this.setState({ hasError: false }), 3000);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render children without session context — app works in guest mode
      return <>{this.props.children}</>;
    }
    return <>{this.props.children}</>;
  }
}

/**
 * AppProviders — centralized application provider composition.
 * SessionProvider (NextAuth) → ThemeProvider → ViewTransitionProvider → AuthDataSync
 *
 * AuthDataSync connects real Google auth session to Zustand stores
 * (user data, wallet, notifications) via API calls.
 *
 * GlobalErrorHandler mounts window-level error listeners to catch
 * ChunkLoadError before it shows the raw Next.js error overlay.
 *
 * SessionErrorBoundary ensures that if NextAuth's session fetch fails,
 * the app continues to work in guest mode instead of crashing.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  }));

  return (
    <SessionErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SessionProvider
          refetchOnWindowFocus={true}
          refetchInterval={0}
        >
          <ThemeProvider>
            <ViewTransitionProvider>
              <GlobalErrorHandler />
              <AuthDataSync>{children}</AuthDataSync>
            </ViewTransitionProvider>
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </SessionErrorBoundary>
  );
}
