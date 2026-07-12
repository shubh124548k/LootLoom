"use client";

/**
 * LootLoom — Global Error Handler
 *
 * Mounts window-level listeners for unhandled errors and unhandled promise
 * rejections. Catches ChunkLoadError (lazy chunk failed to load) and
 * auto-reloads the page once before showing the error UI.
 *
 * This prevents the raw Next.js error overlay ("Pretty print" button) from
 * appearing for transient chunk-load failures.
 */
import { useEffect } from "react";

/** Check if an error is a chunk load failure (transient). */
function isChunkLoadFailure(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("chunkloaderror") ||
    lower.includes("loading chunk") ||
    lower.includes("loading css chunk") ||
    lower.includes("failed to fetch dynamically imported module") ||
    lower.includes("importing a module script failed")
  );
}

export function GlobalErrorHandler() {
  useEffect(() => {
    const handleChunkError = (message: string) => {
      if (!isChunkLoadFailure(message)) return false;
      const key = "lootloom-chunk-reload";
      const hasReloaded = sessionStorage.getItem(key);
      if (!hasReloaded) {
        sessionStorage.setItem(key, "1");
        // Small delay to let dev server finish recompiling
        setTimeout(() => window.location.reload(), 500);
        return true;
      }
      // Already reloaded — clear flag and let error boundary handle it
      sessionStorage.removeItem(key);
      return false;
    };

    const onError = (event: ErrorEvent) => {
      const msg = event.message || event.error?.message || "";
      if (handleChunkError(msg)) {
        event.preventDefault();
        return;
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg =
        typeof reason === "string"
          ? reason
          : reason?.message || reason?.toString?.() || "";
      if (handleChunkError(msg)) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
