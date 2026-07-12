"use client";

/**
 * RouteGuard — frontend route guard for protected views.
 *
 * Backend-ready: checks `useAuthStore.isAuthenticated` (driven by NextAuth
 * session via AuthDataSync). When unauthenticated, redirects to login view
 * and shows nothing. Does NOT implement backend auth — purely a UI gate.
 *
 * Usage:
 *   <RouteGuard><ProtectedView /></RouteGuard>
 */
import { useEffect } from "react";
import { useAuthStore, useNavigationStore } from "@/stores";
import { GlassLoader } from "@/components/lootloom/states";

interface RouteGuardProps {
  children: React.ReactNode;
  /** When true, requires CEO role. Defaults to requiring regular user auth. */
  requireCeo?: boolean;
}

export function RouteGuard({ children, requireCeo = false }: RouteGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigationStore((s) => s.navigate);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(requireCeo ? "ceo-login" : "login");
    } else if (requireCeo && role !== "ceo") {
      navigate("ceo-restricted");
    }
  }, [isAuthenticated, role, requireCeo, navigate]);

  if (!isAuthenticated || (requireCeo && role !== "ceo")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassLoader label={requireCeo ? "Verifying CEO access" : "Verifying session"} />
      </div>
    );
  }

  return <>{children}</>;
}
