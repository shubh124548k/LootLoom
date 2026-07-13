"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore, useNavigationStore } from "@/stores";
import { GlassLoader } from "@/components/lootloom/states";
import { LootButton } from "@/components/lootloom";

interface RouteGuardProps {
  children: React.ReactNode;
  requireCeo?: boolean;
}

export function RouteGuard({ children, requireCeo = false }: RouteGuardProps) {
  const { status: sessionStatus } = useSession();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigationStore((state) => state.navigate);
  const [timedOut, setTimedOut] = useState(false);

  const sessionLoading = sessionStatus === "loading";

  useEffect(() => {
    if (sessionLoading) return;
    if (isAuthenticated) return;
    const timer = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, sessionLoading]);

  if (requireCeo && role !== "ceo") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <GlassLoader label="Restricted access" />
      </div>
    );
  }

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassLoader label="Verifying session" />
      </div>
    );
  }

  if (timedOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <h2 className="text-lg font-bold text-foreground">Session required</h2>
        <p className="text-sm text-muted-foreground max-w-sm">Your session could not be verified. Please sign in to continue.</p>
        <LootButton variant="electric" size="md" onClick={() => navigate("login")}>
          Sign In
        </LootButton>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassLoader label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}
