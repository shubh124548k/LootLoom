"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNavigationStore } from "@/stores";
import { BackgroundEngine, AppShell, pageTransition, RestrictedAccess } from "@/components/lootloom";
import { lazy, Suspense, useMemo } from "react";
import { GlassLoader } from "@/components/lootloom/states";

// Lazy-load all feature views for code splitting
const HomeView = lazy(() => import("@/features/home/home-view").then((m) => ({ default: m.HomeView })));
const AuthView = lazy(() => import("@/features/auth/auth-view").then((m) => ({ default: m.AuthView })));
const DashboardView = lazy(() => import("@/features/dashboard/dashboard-view").then((m) => ({ default: m.DashboardView })));
const WalletView = lazy(() => import("@/features/wallet/wallet-view").then((m) => ({ default: m.WalletView })));
const EarnView = lazy(() => import("@/features/earn/earn-view").then((m) => ({ default: m.EarnView })));
const RewardsView = lazy(() => import("@/features/rewards/rewards-view").then((m) => ({ default: m.RewardsView })));
const PagesView = lazy(() => import("@/features/pages/pages-view").then((m) => ({ default: m.PagesView })));
const SystemView = lazy(() => import("@/features/pages/system-view").then((m) => ({ default: m.SystemView })));

const AUTH_VIEWS = new Set([
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "verify-success",
  "verify-failed",
]);
const SYSTEM_VIEWS = new Set([
  "session-expired",
  "unauthorized",
  "maintenance",
  "error-403",
  "error-404",
  "error-500",
  "offline",
  "update-required",
  "auth-loading",
  "ceo-restricted",
]);

function ViewSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassLoader label="Loading" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

/**
 * AppRouter — maps current ViewId to the appropriate feature view.
 * Wraps authenticated app views in the AppShell; public/auth/system views are full-screen.
 */
export function AppRouter() {
  const current = useNavigationStore((s) => s.current);

  const isAuthView = AUTH_VIEWS.has(current);
  const isSystemView = SYSTEM_VIEWS.has(current);
  const isPublicView = current === "home";

  const view = useMemo(() => {
    if (isPublicView) {
      return (
        <ViewSuspense>
          <HomeView />
        </ViewSuspense>
      );
    }
    if (isAuthView) {
      return (
        <ViewSuspense>
          <AuthView />
        </ViewSuspense>
      );
    }
    if (isSystemView) {
      return (
        <ViewSuspense>
          <SystemView />
        </ViewSuspense>
      );
    }
    // App views
    switch (current) {
      case "dashboard":
        return (
          <ViewSuspense>
            <DashboardView />
          </ViewSuspense>
        );
      case "wallet":
        return (
          <ViewSuspense>
            <WalletView />
          </ViewSuspense>
        );
      case "earn":
        return (
          <ViewSuspense>
            <EarnView />
          </ViewSuspense>
        );
      case "rewards":
      case "redeem":
        return (
          <ViewSuspense>
            <RewardsView />
          </ViewSuspense>
        );
      case "ceo-dashboard":
        return <RestrictedAccess />;
      default:
        return (
          <ViewSuspense>
            <PagesView />
          </ViewSuspense>
        );
    }
  }, [current, isAuthView, isSystemView, isPublicView]);

  // Public, auth, and system views: full-screen (no app shell)
  if (isPublicView || isAuthView || isSystemView) {
    return (
      <div className="relative min-h-screen">
        <BackgroundEngine />
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10"
          >
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
          <motion.div
            key={current}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10"
          >
            {view}
          </motion.div>
        </AnimatePresence>
      </AppShell>
    </div>
  );
}
