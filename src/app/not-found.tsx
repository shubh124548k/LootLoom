"use client";

/**
 * LootLoom — 404 Not Found
 * Premium glass error page for unmatched routes.
 */
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md text-center"
      >
        <div className="rounded-3xl glass-2 ring-1 ring-border/60 shadow-[var(--shadow-lg)] p-8">
          {/* Icon */}
          <div className="size-20 rounded-3xl bg-electric/10 ring-1 ring-electric/20 flex items-center justify-center mx-auto mb-5 text-electric">
            <Compass size={36} strokeWidth={2} />
          </div>

          {/* 404 */}
          <h1 className="text-5xl font-bold text-foreground mb-2 tracking-tight">
            404
          </h1>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Page not found
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Action */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold text-white shadow-[0_8px_24px_-8px_oklch(0.62_0.22_255/0.6)] bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] hover:opacity-90 transition-all hover:-translate-y-0.5"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
