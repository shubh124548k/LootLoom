"use client";

/**
 * LootLoom — Route Error Boundary
 *
 * Catches errors thrown within any route segment.
 * Shows a friendly error card with "Try Again" + "Go Home" buttons
 * instead of the raw Next.js error overlay ("Pretty print").
 *
 * For ChunkLoadError (transient — dev server recompiling / memory pressure),
 * auto-reloads the page once before showing the manual error UI.
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, Home, WifiOff } from "lucide-react";
import { useNavigationStore } from "@/stores";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Check if this is a chunk load error (transient — auto-reload). */
function isChunkLoadError(error: Error): boolean {
  const msg = error.message?.toLowerCase() ?? "";
  return (
    msg.includes("chunkloaderror") ||
    msg.includes("loading chunk") ||
    msg.includes("loading css chunk") ||
    msg.includes("failed to fetch dynamically imported module")
  );
}

/** Check if this is a network error (server unreachable). */
function isNetworkError(error: Error): boolean {
  const msg = error.message?.toLowerCase() ?? "";
  return (
    msg.includes("network error") ||
    msg.includes("failed to fetch") ||
    msg.includes("err_connection_refused") ||
    msg.includes("err_internet_disconnected")
  );
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const navigate = useNavigationStore();

  useEffect(() => {
    // ChunkLoadError is almost always transient. Auto-reload once.
    if (isChunkLoadError(error)) {
      const hasReloaded = sessionStorage.getItem("lootloom-route-reload");
      if (!hasReloaded) {
        sessionStorage.setItem("lootloom-route-reload", "1");
        window.location.reload();
        return;
      }
      sessionStorage.removeItem("lootloom-route-reload");
    }

    if (process.env.NODE_ENV === "development") {
      console.error("[RouteError]", error);
    }
  }, [error]);

  const handleRetry = () => {
    sessionStorage.removeItem("lootloom-route-reload");
    reset();
    // Small delay to let the chunk recompile
    setTimeout(() => window.location.reload(), 100);
  };

  const handleHome = () => {
    sessionStorage.removeItem("lootloom-route-reload");
    navigate.navigate("home");
    reset();
  };

  const isChunkError = isChunkLoadError(error);
  const isNetwork = isNetworkError(error);

  const config = isChunkError
    ? {
        icon: RefreshCw,
        title: "Page Updated",
        description:
          "We detected an update and refreshed the page. If it still doesn't load, please try again.",
        accent: { bg: "rgba(255,180,0,0.12)", text: "#d97706", ring: "rgba(255,180,0,0.25)" },
      }
    : isNetwork
    ? {
        icon: WifiOff,
        title: "Connection Lost",
        description:
          "We couldn't reach the server. Please check your internet connection and try again.",
        accent: { bg: "rgba(244,63,94,0.1)", text: "#e11d48", ring: "rgba(244,63,94,0.2)" },
      }
    : {
        icon: AlertTriangle,
        title: "Something went wrong",
        description:
          "An unexpected error occurred while loading this page. Please try again or return to the home page.",
        accent: { bg: "rgba(244,63,94,0.1)", text: "#e11d48", ring: "rgba(244,63,94,0.2)" },
      };

  const Icon = config.icon;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl glass-2 ring-1 ring-border/60 shadow-[var(--shadow-lg)] p-8 text-center">
          {/* Icon */}
          <div
            className="size-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: config.accent.bg,
              border: `1px solid ${config.accent.ring}`,
              color: config.accent.text,
            }}
          >
            <Icon size={36} strokeWidth={2} />
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-foreground mb-2 tracking-tight">
            {config.title}
          </h1>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {config.description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold text-white shadow-[0_8px_24px_-8px_oklch(0.62_0.22_255/0.6)] bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] hover:opacity-90 transition-all hover:-translate-y-0.5"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <button
              onClick={handleHome}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold text-foreground glass-2 ring-1 ring-border hover:bg-accent/60 transition-all hover:-translate-y-0.5"
            >
              <Home size={16} />
              Go Home
            </button>
          </div>

          {/* Error digest (dev only) */}
          {process.env.NODE_ENV === "development" && error.digest && (
            <p className="mt-6 text-xs text-muted-foreground/60 font-mono">
              Error digest: {error.digest}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
