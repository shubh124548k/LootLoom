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

export const OFFICIAL_PROVIDER_KEYS = ["adsterra"];

export function hasOfficialRenderer(key: string): boolean {
  return rendererRegistry.has(key);
}

function removeProviderElements(providerSubstring: string): void {
  document.querySelectorAll(`script[src*="${providerSubstring}"], iframe[src*="${providerSubstring}"]`).forEach((el) => el.remove());
  document.querySelectorAll(`[id*="${providerSubstring}"], [class*="${providerSubstring}"]`).forEach((el) => el.remove());
}

function clearProviderGlobals(): void {
  try {
    delete (window as any).Adsterra;
    delete (window as any).adsterra;
  } catch { /* some globals may be non-configurable */ }
}

// ── Adsterra: social bar (in-page) ──
registerRenderer("adsterra", (_sessionId: string) => {
  let cleaned = false;
  const scriptId = "ad-adsterra";
  const clean = () => {
    if (cleaned) return; cleaned = true;
    document.getElementById(scriptId)?.remove();
    removeProviderElements("adsterra");
    removeProviderElements("effectivecpmnetwork");
    clearProviderGlobals();
  };
  return {
    key: "adsterra",
    async render() {
      const s = document.createElement("script");
      s.src = "https://pl30349373.effectivecpmnetwork.com/2e/88/bc/2e88bc28cdbfdafc4b85833ebade6a5c.js";
      s.id = scriptId;
      s.async = true;
      console.log("[ADSTERRA] Loading SDK");
      return new Promise((resolve) => {
        const to = setTimeout(() => { clean(); console.log("[ADSTERRA] SDK Timeout"); resolve({ success: false, error: "SCRIPT_TIMEOUT" }); }, 20000);
        s.onload = () => { clearTimeout(to); console.log("[ADSTERRA] SDK Loaded"); resolve({ success: true }); };
        s.onerror = () => { clearTimeout(to); clean(); console.log("[ADSTERRA] SDK Failed"); resolve({ success: false, error: "SCRIPT_FAILED" }); };
        document.body.appendChild(s);
      });
    },
    cleanup() { clean(); },
  };
});
