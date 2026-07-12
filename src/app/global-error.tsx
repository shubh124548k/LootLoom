"use client";

/**
 * LootLoom — Global Error Boundary
 *
 * Catches root-level errors that escape route error boundaries.
 * Handles ChunkLoadError (lazy chunk failed to load — usually transient,
 * caused by dev server recompiling or memory pressure) by auto-reloading.
 *
 * In production, shows a friendly error page with a "Reload" button
 * instead of the raw Next.js error overlay.
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";

interface GlobalErrorProps {
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

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // ChunkLoadError is almost always transient (dev server recompiling,
    // memory pressure, or a deploy in progress). Auto-reload once.
    if (isChunkLoadError(error)) {
      const hasReloaded = sessionStorage.getItem("lootloom-chunk-reload");
      if (!hasReloaded) {
        sessionStorage.setItem("lootloom-chunk-reload", "1");
        window.location.reload();
        return;
      }
      // Already reloaded once — clear flag and show manual error UI
      sessionStorage.removeItem("lootloom-chunk-reload");
    }

    // Log to console for debugging (dev only)
    if (process.env.NODE_ENV === "development") {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  const handleReload = () => {
    sessionStorage.removeItem("lootloom-chunk-reload");
    window.location.reload();
  };

  const handleHome = () => {
    sessionStorage.removeItem("lootloom-chunk-reload");
    window.location.href = "/";
  };

  const isChunkError = isChunkLoadError(error);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, oklch(0.98 0.01 250), oklch(0.96 0.01 240))",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "oklch(0.2 0.02 256)",
          padding: "1.5rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 20px 48px -12px rgba(15,23,42,0.12)",
            padding: "2.5rem",
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "24px",
              background: isChunkError
                ? "rgba(255,180,0,0.12)"
                : "rgba(244,63,94,0.1)",
              border: `1px solid ${
                isChunkError
                  ? "rgba(255,180,0,0.25)"
                  : "rgba(244,63,94,0.2)"
              }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              color: isChunkError ? "#d97706" : "#e11d48",
            }}
          >
            <AlertTriangle size={36} strokeWidth={2} />
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              margin: "0 0 0.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            {isChunkError ? "Connection Refreshed" : "Something went wrong"}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "0.875rem",
              color: "oklch(0.5 0.02 256)",
              lineHeight: 1.6,
              margin: "0 0 2rem",
            }}
          >
            {isChunkError
              ? "We refreshed the page to load the latest version. If the problem persists, please reload manually."
              : "An unexpected error occurred. Please try reloading the page. If the problem continues, return to the home page."}
          </p>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleReload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                height: "44px",
                padding: "0 1.75rem",
                borderRadius: "12px",
                border: "none",
                background:
                  "linear-gradient(120deg, oklch(0.62 0.22 255), oklch(0.72 0.15 200))",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "transform 0.2s, opacity 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
            <button
              onClick={handleHome}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                height: "44px",
                padding: "0 1.75rem",
                borderRadius: "12px",
                border: "1px solid rgba(15,23,42,0.1)",
                background: "rgba(255,255,255,0.5)",
                color: "oklch(0.3 0.02 256)",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "transform 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.background = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.5)";
              }}
            >
              <Home size={16} />
              Go Home
            </button>
          </div>

          {/* Error digest (dev only) */}
          {process.env.NODE_ENV === "development" && error.digest && (
            <p
              style={{
                marginTop: "1.5rem",
                fontSize: "0.75rem",
                color: "oklch(0.6 0.02 256)",
                fontFamily: "monospace",
              }}
            >
              Error digest: {error.digest}
            </p>
          )}
        </motion.div>
      </body>
    </html>
  );
}
