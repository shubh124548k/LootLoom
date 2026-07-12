"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNavigationStore, useAuthStore } from "@/stores";
import { BackgroundEngine, AppShell, pageTransition, RestrictedAccess, CeoLayout } from "@/components/lootloom";
import { LEGAL_VIEWS, CEO_VIEWS, SYSTEM_VIEWS, AUTH_VIEWS } from "@/config/navigation";
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
const SystemView = lazy(() => import("@/features/system/system-view").then((m) => ({ default: m.SystemView })));
const TransactionsView = lazy(() => import("@/features/transactions/transactions-view").then((m) => ({ default: m.TransactionsView })));
const NotificationsView = lazy(() => import("@/features/notifications/notifications-view").then((m) => ({ default: m.NotificationsView })));
const ProfileView = lazy(() => import("@/features/profile/profile-view").then((m) => ({ default: m.ProfileView })));
const GamificationView = lazy(() => import("@/features/gamification/gamification-view").then((m) => ({ default: m.GamificationView })));
const SupportView = lazy(() => import("@/features/support/support-view").then((m) => ({ default: m.SupportView })));
const LegalView = lazy(() => import("@/features/legal/legal-view").then((m) => ({ default: m.LegalView })));
const CeoAuthView = lazy(() => import("@/features/ceo/ceo-auth-view").then((m) => ({ default: m.CeoAuthView })));
const CeoDashboardView = lazy(() => import("@/features/ceo/ceo-dashboard-view").then((m) => ({ default: m.CeoDashboardView })));
const CeoUsersView = lazy(() => import("@/features/ceo/ceo-users-view").then((m) => ({ default: m.CeoUsersView })));
const CeoRedeemView = lazy(() => import("@/features/ceo/ceo-redeem-view").then((m) => ({ default: m.CeoRedeemView })));
const CeoSupportView = lazy(() => import("@/features/ceo/ceo-support-view").then((m) => ({ default: m.CeoSupportView })));

const AUTH_SET = new Set(AUTH_VIEWS);
const SYSTEM_SET = new Set(SYSTEM_VIEWS);
const LEGAL_SET = new Set(LEGAL_VIEWS);
const CEO_SET = new Set(CEO_VIEWS);

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
      return <ViewSuspense><HomeView /></ViewSuspense>;
    if (isAuthView)
      return <ViewSuspense><AuthView /></ViewSuspense>;
    if (isSystemView)
      return <ViewSuspense><SystemView /></ViewSuspense>;
    if (isLegalView)
      return <ViewSuspense><LegalView /></ViewSuspense>;
    if (current === "ceo-login")
      return <ViewSuspense><CeoAuthView /></ViewSuspense>;

    // CEO authenticated views — guarded by role check
    if (current === "ceo-dashboard")
      return isCeoAuthenticated ? <ViewSuspense><CeoDashboardView /></ViewSuspense> : <RestrictedAccess />;
    if (current === "ceo-users")
      return isCeoAuthenticated ? <ViewSuspense><CeoUsersView /></ViewSuspense> : <RestrictedAccess />;
    if (current === "ceo-redeem")
      return isCeoAuthenticated ? <ViewSuspense><CeoRedeemView /></ViewSuspense> : <RestrictedAccess />;
    if (current === "ceo-support")
      return isCeoAuthenticated ? <ViewSuspense><CeoSupportView /></ViewSuspense> : <RestrictedAccess />;

    // App views
    switch (current) {
      case "dashboard":
        return <ViewSuspense><DashboardView /></ViewSuspense>;
      case "wallet":
        return <ViewSuspense><WalletView /></ViewSuspense>;
      case "earn":
        return <ViewSuspense><EarnView /></ViewSuspense>;
      case "redeem":
        return <ViewSuspense><RewardsView /></ViewSuspense>;
      case "history":
        return <ViewSuspense><TransactionsView /></ViewSuspense>;
      case "notifications":
        return <ViewSuspense><NotificationsView /></ViewSuspense>;
      case "profile":
        return <ViewSuspense><ProfileView /></ViewSuspense>;
      case "leaderboard":
        return <ViewSuspense><GamificationView /></ViewSuspense>;
      case "support":
        return <ViewSuspense><SupportView /></ViewSuspense>;
      case "ceo-restricted":
        return <RestrictedAccess />;
      default:
        return <ViewSuspense><PagesView /></ViewSuspense>;
    }
  }, [current, isAuthView, isSystemView, isLegalView, isCeoView, isPublicView, isCeoAuthenticated]);

  // CEO authenticated views use CeoLayout (only when CEO role is set)
  const CEO_APP_VIEWS = ["ceo-dashboard", "ceo-users", "ceo-redeem", "ceo-support"];
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
  const CEO_GUARDED = ["ceo-dashboard", "ceo-users", "ceo-redeem", "ceo-support"];
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
