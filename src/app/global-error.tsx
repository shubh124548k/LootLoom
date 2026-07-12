"use client";

/**
 * LootLoom — Global Error Boundary
 *
 * IMPORTANT: This component replaces the root layout when a global error
 * occurs. It CANNOT use any external libraries (framer-motion, lucide-react)
 * because those chunks may be the ones that failed to load.
 *
 * Uses only React + inline styles to guarantee it always renders.
 */
import { useEffect } from "react";

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
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("importing a module script failed")
  );
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // ChunkLoadError is almost always transient. Auto-reload once.
    if (isChunkLoadError(error)) {
      const hasReloaded = sessionStorage.getItem("lootloom-chunk-reload");
      if (!hasReloaded) {
        sessionStorage.setItem("lootloom-chunk-reload", "1");
        window.location.reload();
        return;
      }
      sessionStorage.removeItem("lootloom-chunk-reload");
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

  // Inline styles — no external CSS dependencies
  const containerStyle: React.CSSProperties = {
    margin: 0,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, oklch(0.98 0.01 250), oklch(0.96 0.01 240))",
    fontFamily: "system-ui, -apple-system, sans-serif",
    color: "#1a1a2e",
    padding: "1.5rem",
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: "480px",
    width: "100%",
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.9)",
    boxShadow: "0 20px 48px -12px rgba(15,23,42,0.12)",
    padding: "2.5rem",
    textAlign: "center",
  };

  const iconStyle: React.CSSProperties = {
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    background: isChunkError ? "rgba(255,180,0,0.12)" : "rgba(244,63,94,0.1)",
    border: `1px solid ${
      isChunkError ? "rgba(255,180,0,0.25)" : "rgba(244,63,94,0.2)"
    }`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
    color: isChunkError ? "#d97706" : "#e11d48",
    fontSize: "2rem",
    fontWeight: 700,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: "0 0 0.5rem",
    letterSpacing: "-0.02em",
  };

  const descStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "#64748b",
    lineHeight: 1.6,
    margin: "0 0 2rem",
  };

  const buttonRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "center",
    flexWrap: "wrap",
  };

  const primaryButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    height: "44px",
    padding: "0 1.75rem",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(120deg, #3b82f6, #06b6d4)",
    color: "white",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    height: "44px",
    padding: "0 1.75rem",
    borderRadius: "12px",
    border: "1px solid rgba(15,23,42,0.1)",
    background: "rgba(255,255,255,0.6)",
    color: "#334155",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <html lang="en">
      <body style={containerStyle}>
        <div style={cardStyle}>
          {/* Icon — pure CSS, no icon library */}
          <div style={iconStyle}>
            {isChunkError ? "↻" : "!"}
          </div>

          <h1 style={titleStyle}>
            {isChunkError ? "Page Updated" : "Something went wrong"}
          </h1>

          <p style={descStyle}>
            {isChunkError
              ? "We refreshed the page to load the latest version. If the problem persists, please reload manually."
              : "An unexpected error occurred. Please try reloading the page."}
          </p>

          <div style={buttonRowStyle}>
            <button onClick={handleReload} style={primaryButtonStyle}>
              ↻ Reload Page
            </button>
            <button onClick={handleHome} style={secondaryButtonStyle}>
              ⌂ Go Home
            </button>
          </div>

          {process.env.NODE_ENV === "development" && error.digest && (
            <p
              style={{
                marginTop: "1.5rem",
                fontSize: "0.75rem",
                color: "#94a3b8",
                fontFamily: "monospace",
              }}
            >
              Error digest: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
