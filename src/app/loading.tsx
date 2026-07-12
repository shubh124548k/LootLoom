"use client";

/**
 * LootLoom — Route Loading State
 * Shown while lazy-loaded route segments are fetching.
 */
import { motion } from "framer-motion";
import { Logo } from "@/components/lootloom";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative size-16"
      >
        <div className="absolute inset-0 rounded-full border-4 border-electric/15" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-electric" />
      </motion.div>
      <div className="flex flex-col items-center gap-2">
        <Logo size="sm" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Loading…
        </p>
      </div>
    </div>
  );
}
