"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNavigationStore, useAuthStore } from "@/stores";
import { BackgroundEngine, AppShell, pageTransition, RestrictedAccess, CeoLayout } from "@/components/lootloom";
import { LEGAL_VIEWS, CEO_VIEWS, SYSTEM_VIEWS, AUTH_VIEWS } from "@/config/navigation";
import { RouteGuard } from "@/components/auth";
import { Suspense, useMemo, Component, type ReactNode } from "react";
import { GlassLoader } from "@/components/lootloom/states";
import { RefreshCw, AlertTriangle } from "lucide-react";
import type { ViewId } from "@/types";

// CRITICAL: All views are imported DIRECTLY (not lazy) because lazy loading
// causes separate chunk compilation/loading which fails in memory-constrained
// environments (4GB sandbox). Direct imports bundle everything into one chunk
// that loads reliably.
import { HomeView } from "@/features/home/home-view";
import { AuthView } from "@/features/auth/auth-view";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { WalletView } from "@/features/wallet/wallet-view";
import { EarnView } from "@/features/earn/earn-view";
import { RewardsView } from "@/features/rewards/rewards-view";
import { PagesView } from "@/features/pages/pages-view";
import { SystemView } from "@/features/system/system-view";
import { TransactionsView } from "@/features/transactions/transactions-view";
import { NotificationsView } from "@/features/notifications/notifications-view";
import { ProfileView } from "@/features/profile/profile-view";
import { GamificationView } from "@/features/gamification/gamification-view";
import { SupportView } from "@/features/support/support-view";
import { LegalView } from "@/features/legal/legal-view";

// CEO views
import { CeoAuthView } from "@/features/ceo/ceo-auth-view";
import { CeoDashboardView } from "@/features/ceo/ceo-dashboard-view";
import { CeoUsersView } from "@/features/ceo/ceo-users-view";
import { CeoRedeemView } from "@/features/ceo/ceo-redeem-view";
import { CeoSupportView } from "@/features/ceo/ceo-support-view";
import { CeoNotificationsView } from "@/features/ceo/ceo-notifications-view";
import { CeoHistoryView } from "@/features/ceo/ceo-history-view";
import { CeoSettingsView } from "@/features/ceo/ceo-settings-view";

const AUTH_SET = new Set(AUTH_VIEWS);
const SYSTEM_SET = new Set(SYSTEM_VIEWS);
const LEGAL_SET = new Set(LEGAL_VIEWS);
const CEO_SET = new Set(CEO_VIEWS);

/**
 * ViewErrorBoundary — catches errors thrown by lazy-loaded views
 * (especially ChunkLoadError when the dev server recompiles).
 * Prevents a single failed chunk from crashing the entire app.
 */
interface ViewErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ViewErrorBoundary extends Component<
  { children: ReactNode },
  ViewErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ViewErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    // For chunk load errors, reload the page to get fresh chunks
    const isChunkError =
      this.state.error?.message?.toLowerCase().includes("chunkloaderror") ||
      this.state.error?.message?.toLowerCase().includes("failed to fetch dynamically imported module") ||
      this.state.error?.message?.toLowerCase().includes("loading chunk");

    if (isChunkError) {
      const hasReloaded = sessionStorage.getItem("lootloom-view-reload");
      if (!hasReloaded) {
        sessionStorage.setItem("lootloom-view-reload", "1");
        window.location.reload();
        return;
      }
      sessionStorage.removeItem("lootloom-view-reload");
    }

    // Otherwise just reset the boundary and try again
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md w-full text-center">
            <div className="size-16 rounded-2xl bg-rose-brand/10 ring-1 ring-rose-brand/20 flex items-center justify-center mx-auto mb-4 text-rose-brand">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              Failed to load
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              This section couldn&apos;t load. Please try again.
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] hover:opacity-90 transition-all"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ViewSuspense({ children }: { children: React.ReactNode }) {
  return (
    <ViewErrorBoundary>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <GlassLoader label="Loading" />
          </div>
        }
      >
        {children}
      </Suspense>
    </ViewErrorBoundary>
  );
}

/** All CEO authenticated workspace views (rendered inside CeoLayout). */
const CEO_APP_VIEWS: ViewId[] = [
  "ceo-dashboard",
  "ceo-redeem",
  "ceo-users",
  "ceo-notifications",
  "ceo-support",
  "ceo-history",
  "ceo-settings",
];

/**
 * AppRouter — maps current ViewId to the appropriate feature view.
 * Layouts: public/auth/system/legal = full-screen; app = AppShell; ceo = CeoLayout.
 */
export function AppRouter() {
  const current = useNavigationStore((s) => s.current);
  const role = useAuthStore((s) => s.role);
  const isCeoAuthenticated = role === "ceo";

  const isAuthView = AUTH_SET.has(current);
  const isSystemView = SYSTEM_SET.has(current);
  const isLegalView = LEGAL_SET.has(current);
  const isCeoView = CEO_SET.has(current);
  const isPublicView = current === "home";

  const view = useMemo(() => {
    if (isPublicView)
      return <HomeView />;
    if (isAuthView)
      return <AuthView />;
    if (isSystemView)
      return <SystemView />;
    if (isLegalView)
      return <LegalView />;
    if (current === "ceo-login")
      return <CeoAuthView />;

    // CEO authenticated views — guarded by role check
    if (current === "ceo-dashboard")
      return isCeoAuthenticated ? <CeoDashboardView /> : <RestrictedAccess />;
    if (current === "ceo-redeem")
      return isCeoAuthenticated ? <CeoRedeemView /> : <RestrictedAccess />;
    if (current === "ceo-users")
      return isCeoAuthenticated ? <CeoUsersView /> : <RestrictedAccess />;
    if (current === "ceo-notifications")
      return isCeoAuthenticated ? <CeoNotificationsView /> : <RestrictedAccess />;
    if (current === "ceo-support")
      return isCeoAuthenticated ? <CeoSupportView /> : <RestrictedAccess />;
    if (current === "ceo-history")
      return isCeoAuthenticated ? <CeoHistoryView /> : <RestrictedAccess />;
    if (current === "ceo-settings")
      return isCeoAuthenticated ? <CeoSettingsView /> : <RestrictedAccess />;

    // App views — protected by RouteGuard (redirects to login when unauthenticated)
    switch (current) {
      case "dashboard":
        return <RouteGuard><DashboardView /></RouteGuard>;
      case "wallet":
        return <RouteGuard><WalletView /></RouteGuard>;
      case "earn":
        return <RouteGuard><EarnView /></RouteGuard>;
      case "redeem":
        return <RouteGuard><RewardsView /></RouteGuard>;
      case "history":
        return <RouteGuard><TransactionsView /></RouteGuard>;
      case "notifications":
        return <RouteGuard><NotificationsView /></RouteGuard>;
      case "profile":
        return <RouteGuard><ProfileView /></RouteGuard>;
      case "leaderboard":
        return <RouteGuard><GamificationView /></RouteGuard>;
      case "support":
        return <RouteGuard><SupportView /></RouteGuard>;
      case "ceo-restricted":
        return <RestrictedAccess />;
      default:
        return <RouteGuard><PagesView /></RouteGuard>;
    }
  }, [current, isAuthView, isSystemView, isLegalView, isCeoView, isPublicView, isCeoAuthenticated]);

  // CEO authenticated views use CeoLayout (only when CEO role is set)
  if (isCeoAuthenticated && CEO_APP_VIEWS.includes(current)) {
    return (
      <div className="relative min-h-screen">
        <BackgroundEngine />
        <CeoLayout>
          <AnimatePresence mode="wait">
            <motion.div key={current} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="relative z-10">
              {view}
            </motion.div>
          </AnimatePresence>
        </CeoLayout>
      </div>
    );
  }

  // Public, auth, system, legal, ceo-login, ceo-restricted, non-CEO ceo views: full-screen (no shell)
  const CEO_GUARDED: ViewId[] = ["ceo-dashboard", "ceo-redeem", "ceo-users", "ceo-notifications", "ceo-support", "ceo-history", "ceo-settings"];
  if (isPublicView || isAuthView || isSystemView || isLegalView || current === "ceo-login" || current === "ceo-restricted" || CEO_GUARDED.includes(current)) {
    return (
      <div className="relative min-h-screen">
        <BackgroundEngine />
        <AnimatePresence mode="wait">
          <motion.div key={current} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="relative z-10">
            {view}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Authenticated app views: inside AppShell
  return (
    <div className="relative min-h-screen">
      <BackgroundEngine />
      <AppShell>
        <AnimatePresence mode="wait">
          <motion.div key={current} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="relative z-10">
            {view}
          </motion.div>
        </AnimatePresence>
      </AppShell>
    </div>
  );
}
