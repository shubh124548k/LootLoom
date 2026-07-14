"use client";

import { useEffect } from "react";
import { initBackgroundMonetization, cleanupBackgroundMonetization } from "@/lib/ads/background-monetization";

/**
 * BackgroundMonetizationLoader — loads Monetag background formats on mount.
 *
 * Formats loaded:
 *   - Push Notifications (via /sw.js + tag.min.js)
 *   - In-Page Push (via nap5k.com)
 *   - Vignette Banner (via n6wxm.com)
 *
 * Completely separate from the reward ad system (Adsterra only).
 * Never blocks navigation. Never interferes with Watch Ad flow.
 */
export function BackgroundMonetizationLoader() {
  useEffect(() => {
    initBackgroundMonetization().then((results) => {
      for (const r of results) {
        if (!r.success) {
          console.log(`[BACKGROUND] ${r.name}: ${r.error || "failed"}`);
        }
      }
    });

    return () => {
      cleanupBackgroundMonetization();
    };
  }, []);

  return null;
}
