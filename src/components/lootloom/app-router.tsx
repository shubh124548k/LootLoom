"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigationStore, useAuthStore } from "@/stores";
import { BackgroundEngine, AppShell, pageTransition, RestrictedAccess, CeoLayout } from "@/components/lootloom";
import { LEGAL_VIEWS, CEO_VIEWS, SYSTEM_VIEWS, AUTH_VIEWS } from "@/config/navigation";
import { RouteGuard } from "@/components/auth";
import { useEffect, Component, type ReactNode } from "react";
import { GlassLoader } from "@/components/lootloom/states";
import { RefreshCw, AlertTriangle } from "lucide-react";
import type { ViewId } from "@/types";

const LazyHomeView = dynamic(() => import("@/features/home/home-view").then((m) => ({ default: m.HomeView })), { loading: () => <PageFallback /> });
const LazyAuthView = dynamic(() => import("@/features/auth/auth-view").then((m) => ({ default: m.AuthView })), { loading: () => <PageFallback /> });
const LazyDashboardView = dynamic(() => import("@/features/dashboard/dashboard-view").then((m) => ({ default: m.DashboardView })), { loading: () => <PageFallback /> });
const LazyWalletView = dynamic(() => import("@/features/wallet/wallet-view").then((m) => ({ default: m.WalletView })), { loading: () => <PageFallback /> });
const LazyEarnView = dynamic(() => import("@/features/earn/earn-view").then((m) => ({ default: m.EarnView })), { loading: () => <PageFallback /> });
const LazyRewardsView = dynamic(() => import("@/features/rewards/rewards-view").then((m) => ({ default: m.RewardsView })), { loading: () => <PageFallback /> });
const LazyPagesView = dynamic(() => import("@/features/pages/pages-view").then((m) => ({ default: m.PagesView })), { loading: () => <PageFallback /> });
const LazySystemView = dynamic(() => import("@/features/system/system-view").then((m) => ({ default: m.SystemView })), { loading: () => <PageFallback /> });
const LazyTransactionsView = dynamic(() => import("@/features/transactions/transactions-view").then((m) => ({ default: m.TransactionsView })), { loading: () => <PageFallback /> });
const LazyNotificationsView = dynamic(() => import("@/features/notifications/notifications-view").then((m) => ({ default: m.NotificationsView })), { loading: () => <PageFallback /> });
const LazyProfileView = dynamic(() => import("@/features/profile/profile-view").then((m) => ({ default: m.ProfileView })), { loading: () => <PageFallback /> });
const LazyGamificationView = dynamic(() => import("@/features/gamification/gamification-view").then((m) => ({ default: m.GamificationView })), { loading: () => <PageFallback /> });
const LazySupportView = dynamic(() => import("@/features/support/support-view").then((m) => ({ default: m.SupportView })), { loading: () => <PageFallback /> });
const LazyLegalView = dynamic(() => import("@/features/legal/legal-view").then((m) => ({ default: m.LegalView })), { loading: () => <PageFallback /> });

const LazyCeoAuthView = dynamic(() => import("@/features/ceo/ceo-auth-view").then((m) => ({ default: m.CeoAuthView })), { loading: () => <PageFallback /> });
const LazyCeoDashboardView = dynamic(() => import("@/features/ceo/ceo-dashboard-view").then((m) => ({ default: m.CeoDashboardView })), { loading: () => <PageFallback /> });
const LazyCeoUsersView = dynamic(() => import("@/features/ceo/ceo-users-view").then((m) => ({ default: m.CeoUsersView })), { loading: () => <PageFallback /> });
const LazyCeoRedeemView = dynamic(() => import("@/features/ceo/ceo-redeem-view").then((m) => ({ default: m.CeoRedeemView })), { loading: () => <PageFallback /> });
const LazyCeoSupportView = dynamic(() => import("@/features/ceo/ceo-support-view").then((m) => ({ default: m.CeoSupportView })), { loading: () => <PageFallback /> });
const LazyCeoNotificationsView = dynamic(() => import("@/features/ceo/ceo-notifications-view").then((m) => ({ default: m.CeoNotificationsView })), { loading: () => <PageFallback /> });
const LazyCeoHistoryView = dynamic(() => import("@/features/ceo/ceo-history-view").then((m) => ({ default: m.CeoHistoryView })), { loading: () => <PageFallback /> });
const LazyCeoSettingsView = dynamic(() => import("@/features/ceo/ceo-settings-view").then((m) => ({ default: m.CeoSettingsView })), { loading: () => <PageFallback /> });
const LazyCeoAdProvidersView = dynamic(() => import("@/features/ceo/ceo-ad-providers-view").then((m) => ({ default: m.CeoAdProvidersView })), { loading: () => <PageFallback /> });

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <GlassLoader label="Loading" />
    </div>
  );
}

const AUTH_SET = new Set(AUTH_VIEWS);
const SYSTEM_SET = new Set(SYSTEM_VIEWS);
const LEGAL_SET = new Set(LEGAL_VIEWS);
const CEO_SET = new Set(CEO_VIEWS);

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

function ViewFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <GlassLoader label="Loading" />
    </div>
  );
}

const CEO_APP_VIEWS: ViewId[] = [
  "ceo-dashboard",
  "ceo-redeem",
  "ceo-users",
  "ceo-notifications",
  "ceo-support",
  "ceo-history",
  "ceo-settings",
  "ceo-ad-providers",
];

export function AppRouter() {
  const current = useNavigationStore((s) => s.current);
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const unsub = useNavigationStore.subscribe((state, prev) => {
      if (state.current !== prev.current) {
        window.location.hash = state.current;
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace("#", "") as ViewId;
      if (hash && hash !== useNavigationStore.getState().current) {
        useNavigationStore.getState().navigate(hash);
      }
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  useEffect(() => {
    if (role === "ceo") {
      fetch("/api/auth/session").then(res => res.json()).then(session => {
        const userRole = (session?.user as any)?.role;
        if (userRole !== "CEO" && userRole !== "ADMIN") {
          useAuthStore.setState({ isAuthenticated: false, role: "user", status: "unauthenticated" });
          useNavigationStore.getState().navigate("ceo-login");
        }
      }).catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    if (AUTH_SET.has(current) && isAuthenticated) {
      useNavigationStore.getState().navigate("earn");
    }
  }, [current, isAuthenticated]);

  useEffect(() => {
    if (CEO_SET.has(current) && current !== "ceo-login" && role !== "ceo") {
      useNavigationStore.getState().navigate("ceo-login");
    }
  }, [current, role]);

  useEffect(() => {
    const preload = (p: () => Promise<unknown>) => { p(); };
    preload(() => import("@/features/dashboard/dashboard-view"));
    preload(() => import("@/features/earn/earn-view"));
    preload(() => import("@/features/wallet/wallet-view"));
    preload(() => import("@/features/rewards/rewards-view"));
    preload(() => import("@/features/transactions/transactions-view"));
    preload(() => import("@/features/notifications/notifications-view"));
    preload(() => import("@/features/profile/profile-view"));
    preload(() => import("@/features/support/support-view"));
    preload(() => import("@/features/pages/pages-view"));
    preload(() => import("@/features/gamification/gamification-view"));
  }, []);

  const isAuthView = AUTH_SET.has(current);
  const isSystemView = SYSTEM_SET.has(current);
  const isLegalView = LEGAL_SET.has(current);
  const isCeoView = CEO_SET.has(current);
  const isPublicView = current === "home";
  const isCeoAuthenticated = role === "ceo";

  let view: ReactNode;
  if (isPublicView)
    view = <LazyHomeView />;
  else if (isAuthView)
    view = <LazyAuthView />;
  else if (isSystemView)
    view = <LazySystemView />;
  else if (isLegalView)
    view = <LazyLegalView />;
  else if (current === "ceo-login")
    view = <LazyCeoAuthView />;
  else if (current === "ceo-dashboard")
    view = isCeoAuthenticated ? <LazyCeoDashboardView /> : null;
  else if (current === "ceo-redeem")
    view = isCeoAuthenticated ? <LazyCeoRedeemView /> : null;
  else if (current === "ceo-users")
    view = isCeoAuthenticated ? <LazyCeoUsersView /> : null;
  else if (current === "ceo-notifications")
    view = isCeoAuthenticated ? <LazyCeoNotificationsView /> : null;
  else if (current === "ceo-support")
    view = isCeoAuthenticated ? <LazyCeoSupportView /> : null;
  else if (current === "ceo-history")
    view = isCeoAuthenticated ? <LazyCeoHistoryView /> : null;
  else if (current === "ceo-settings")
    view = isCeoAuthenticated ? <LazyCeoSettingsView /> : null;
  else if (current === "ceo-ad-providers")
    view = isCeoAuthenticated ? <LazyCeoAdProvidersView /> : null;
  else {
    switch (current) {
      case "dashboard": view = <RouteGuard><LazyDashboardView /></RouteGuard>; break;
      case "wallet": view = <RouteGuard><LazyWalletView /></RouteGuard>; break;
      case "earn": view = <RouteGuard><LazyEarnView /></RouteGuard>; break;
      case "redeem": view = <RouteGuard><LazyRewardsView /></RouteGuard>; break;
      case "history": view = <RouteGuard><LazyTransactionsView /></RouteGuard>; break;
      case "notifications": view = <RouteGuard><LazyNotificationsView /></RouteGuard>; break;
      case "profile": view = <RouteGuard><LazyProfileView /></RouteGuard>; break;
      case "leaderboard": view = <RouteGuard><LazyGamificationView /></RouteGuard>; break;
      case "support": view = <RouteGuard><LazySupportView /></RouteGuard>; break;
      case "settings": view = <RouteGuard><LazyPagesView /></RouteGuard>; break;
      case "ceo-restricted": view = <RestrictedAccess />; break;
      default: view = <RouteGuard><LazyPagesView /></RouteGuard>;
    }
  }

  const wrappedView = (
    <ViewErrorBoundary key={current}>
      {view || <ViewFallback />}
    </ViewErrorBoundary>
  );

  const animateContent = (
    <AnimatePresence mode="popLayout">
      <motion.div key={current} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="relative z-10">
        {wrappedView}
      </motion.div>
    </AnimatePresence>
  );

  if ((isCeoAuthenticated || current === "ceo-login") && CEO_APP_VIEWS.includes(current)) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <BackgroundEngine />
        <CeoLayout>{animateContent}</CeoLayout>
      </div>
    );
  }

  const CEO_GUARDED: ViewId[] = CEO_APP_VIEWS;
  if (isPublicView || isAuthView || isSystemView || isLegalView || current === "ceo-login" || current === "ceo-restricted" || CEO_GUARDED.includes(current)) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <BackgroundEngine />
        {animateContent}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundEngine />
      <AppShell>{animateContent}</AppShell>
    </div>
  );
}
