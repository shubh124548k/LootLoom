"use client";

/**
 * Background Monetization — Monetag (Push, In-Page Push, Vignette)
 *
 * Uses the exact official Monetag integration codes.
 * Completely separate from the reward ad system (Adsterra only).
 * No OnClick, No Popunder, No Multitag, No reward flow interaction.
 * Each format initializes independently — one failure never blocks others.
 */

export interface FormatResult {
  name: string;
  success: boolean;
  error?: string;
}

interface MonetagFormat {
  readonly name: string;
  load(): Promise<FormatResult>;
  cleanup(): void;
}

// ── Push Notifications ──
// Official Monetag tag + service worker for push delivery.
export function createMonetagPush(): MonetagFormat {
  let pageScript: HTMLScriptElement | null = null;

  return {
    name: "Monetag Push Notifications",
    async load() {
      // Register service worker (idempotent — no duplicate)
      try {
        if ("serviceWorker" in navigator) {
          await navigator.serviceWorker.register("/sw.js");
        }
      } catch { /* non-blocking */ }

      // Skip if page script already exists
      const existing = document.querySelector('script[src*="5gvci.com/act/files/tag.min.js"]');
      if (existing) {
        return { name: "Monetag Push Notifications", success: true };
      }

      return new Promise((resolve) => {
        pageScript = document.createElement("script");
        pageScript.src = "https://5gvci.com/act/files/tag.min.js?z=11282287";
        pageScript.setAttribute("data-cfasync", "false");
        pageScript.async = true;
        pageScript.onload = () => {
          console.log("[BACKGROUND] Monetag Push Notifications: loaded");
          resolve({ name: "Monetag Push Notifications", success: true });
        };
        pageScript.onerror = () => {
          pageScript?.remove();
          pageScript = null;
          console.log("[BACKGROUND] Monetag Push Notifications: script failed");
          resolve({ name: "Monetag Push Notifications", success: false, error: "SCRIPT_FAILED" });
        };
        document.head.appendChild(pageScript);
      });
    },
    cleanup() {
      pageScript?.remove();
      pageScript = null;
    },
  };
}

// ── In-Page Push ──
// Official Monetag code — unmodified.
export function createMonetagInPagePush(): MonetagFormat {
  let innerScript: HTMLScriptElement | null = null;

  return {
    name: "Monetag In-Page Push",
    async load() {
      // Skip if already loaded
      const existing = document.querySelector('script[src*="nap5k.com"]');
      if (existing) {
        return { name: "Monetag In-Page Push", success: true };
      }

      try {
        // Execute exact official Monetag code — unmodified
        const temp = document.createElement("script");
        temp.textContent = `(function(s){
    s.dataset.zone='11282292',
    s.src='https://nap5k.com/tag.min.js'
})(
    [document.documentElement, document.body]
        .filter(Boolean)
        .pop()
        .appendChild(document.createElement('script'))
)`;
        document.head.appendChild(temp);
        temp.remove();

        // Capture the dynamically created script element
        const scripts = document.querySelectorAll('script[src*="nap5k.com"]');
        if (scripts.length > 0) {
          innerScript = scripts[scripts.length - 1] as HTMLScriptElement;
          console.log("[BACKGROUND] Monetag In-Page Push: loaded");
          return { name: "Monetag In-Page Push", success: true };
        }
        return { name: "Monetag In-Page Push", success: false, error: "ELEMENT_NOT_FOUND" };
      } catch (err) {
        return { name: "Monetag In-Page Push", success: false, error: err instanceof Error ? err.message : "LOAD_FAILED" };
      }
    },
    cleanup() {
      innerScript?.remove();
      innerScript = null;
    },
  };
}

// ── Vignette Banner ──
// Official Monetag code — unmodified.
export function createMonetagVignette(): MonetagFormat {
  let innerScript: HTMLScriptElement | null = null;

  return {
    name: "Monetag Vignette",
    async load() {
      // Skip if already loaded
      const existing = document.querySelector('script[src*="n6wxm.com"]');
      if (existing) {
        return { name: "Monetag Vignette", success: true };
      }

      try {
        // Execute exact official Monetag code — unmodified
        const temp = document.createElement("script");
        temp.textContent = `(function(s){
    s.dataset.zone='11282294',
    s.src='https://n6wxm.com/vignette.min.js'
})(
    [document.documentElement, document.body]
        .filter(Boolean)
        .pop()
        .appendChild(document.createElement('script'))
)`;
        document.head.appendChild(temp);
        temp.remove();

        // Capture the dynamically created script element
        const scripts = document.querySelectorAll('script[src*="n6wxm.com"]');
        if (scripts.length > 0) {
          innerScript = scripts[scripts.length - 1] as HTMLScriptElement;
          console.log("[BACKGROUND] Monetag Vignette: loaded");
          return { name: "Monetag Vignette", success: true };
        }
        return { name: "Monetag Vignette", success: false, error: "ELEMENT_NOT_FOUND" };
      } catch (err) {
        return { name: "Monetag Vignette", success: false, error: err instanceof Error ? err.message : "LOAD_FAILED" };
      }
    },
    cleanup() {
      innerScript?.remove();
      innerScript = null;
    },
  };
}

// ── Orchestrator ──
let activeFormats: MonetagFormat[] = [];

export async function initBackgroundMonetization(): Promise<FormatResult[]> {
  cleanupBackgroundMonetization();

  const formats: MonetagFormat[] = [
    createMonetagPush(),
    createMonetagInPagePush(),
    createMonetagVignette(),
  ];

  activeFormats = formats;
  const results = await Promise.all(formats.map((f) => f.load()));
  return results;
}

export function cleanupBackgroundMonetization(): void {
  for (const f of activeFormats) {
    f.cleanup();
  }
  activeFormats = [];
}
