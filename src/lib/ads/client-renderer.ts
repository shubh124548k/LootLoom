interface Renderer {
  key: string;
  render(): Promise<{ success: boolean; error?: string }>;
  cleanup(): void;
}

const rendererRegistry = new Map<string, (sessionId: string) => Renderer>();

export function registerRenderer(key: string, factory: (sessionId: string) => Renderer): void {
  rendererRegistry.set(key, factory);
}

export function getRenderer(key: string, sessionId: string): Renderer | null {
  const factory = rendererRegistry.get(key);
  return factory ? factory(sessionId) : null;
}

export const OFFICIAL_PROVIDER_KEYS = ["monetag", "adsterra"];

export function hasOfficialRenderer(key: string): boolean {
  return rendererRegistry.has(key);
}

// ── Monetag: official tag script (in-page) ──
registerRenderer("monetag", (_sessionId: string) => {
  let cleaned = false;
  const scriptId = "ad-monetag-tag";
  const clean = () => { if (cleaned) return; cleaned = true; document.getElementById(scriptId)?.remove(); };
  return {
    key: "monetag",
    async render() {
      console.log("[AD] Monetag: loading official tag");
      if (document.getElementById(scriptId)) document.getElementById(scriptId)?.remove();
      return new Promise((resolve) => {
        const s = document.createElement("script");
        s.src = "https://quge5.com/88/tag.min.js";
        s.setAttribute("data-zone", "259304");
        s.async = true;
        s.id = scriptId;
        s.setAttribute("data-cfasync", "false");
        const to = setTimeout(() => { clean(); resolve({ success: false, error: "SCRIPT_TIMEOUT" }); }, 20000);
        s.onload = () => { clearTimeout(to); console.log("[AD] Monetag: loaded"); resolve({ success: true }); };
        s.onerror = () => { clearTimeout(to); clean(); resolve({ success: false, error: "SCRIPT_FAILED" }); };
        document.body.appendChild(s);
      });
    },
    cleanup() { clean(); },
  };
});

// ── Adsterra: social bar (in-page) ──
registerRenderer("adsterra", (_sessionId: string) => {
  let cleaned = false;
  const scriptId = "ad-adsterra";
  const clean = () => {
    if (cleaned) return; cleaned = true;
    document.getElementById(scriptId)?.remove();
    document.querySelector("[id*='adsterra'], [class*='adsterra']")?.remove();
  };
  return {
    key: "adsterra",
    async render() {
      console.log("[AD] Adsterra: loading social bar");
      const s = document.createElement("script");
      s.src = "https://pl30349373.effectivecpmnetwork.com/2e/88/bc/2e88bc28cdbfdafc4b85833ebade6a5c.js";
      s.id = scriptId;
      s.async = true;
      return new Promise((resolve) => {
        const to = setTimeout(() => { clean(); resolve({ success: false, error: "SCRIPT_TIMEOUT" }); }, 20000);
        s.onload = () => { clearTimeout(to); console.log("[AD] Adsterra: loaded"); resolve({ success: true }); };
        s.onerror = () => { clearTimeout(to); clean(); resolve({ success: false, error: "SCRIPT_FAILED" }); };
        document.body.appendChild(s);
      });
    },
    cleanup() { clean(); },
  };
});
