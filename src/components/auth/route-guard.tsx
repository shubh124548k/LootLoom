"use client";

import { useAuthStore } from "@/stores";
import { GlassLoader } from "@/components/lootloom/states";

interface RouteGuardProps {
  children: React.ReactNode;
  requireCeo?: boolean;
}

export function RouteGuard({ children, requireCeo = false }: RouteGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);

  if (!isAuthenticated || (requireCeo && role !== "ceo")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassLoader label={requireCeo ? "Verifying CEO access" : "Loading"} />
      </div>
    );
  }

  return <>{children}</>;
}
