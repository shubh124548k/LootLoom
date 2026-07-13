const loadedScripts = new Set<string>();

async function loadScriptOnce(src: string, id?: string): Promise<void> {
  if (loadedScripts.has(src)) return;
  if (document.querySelector(`script[src="${src}"]`)) {
    loadedScripts.add(src);
    return;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    if (id) script.id = id;
    script.async = true;
    script.onload = () => { loadedScripts.add(src); resolve(); };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

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

// ── Adsterra: social bar on main page ──
registerRenderer("adsterra", (_sessionId: string) => {
  let cleanupCalled = false;
  return {
    key: "adsterra",
    async render() {
      await loadScriptOnce(
        "https://pl30349373.effectivecpmnetwork.com/2e/88/bc/2e88bc28cdbfdafc4b85833ebade6a5c.js",
        "ad-adsterra"
      );
      await new Promise((r) => setTimeout(r, 15000));
      return { success: true };
    },
    cleanup() {
      if (cleanupCalled) return;
      cleanupCalled = true;
      const el = document.getElementById("ad-adsterra");
      if (el) el.remove();
      const bar = document.querySelector("[id*='adsterra'], [class*='adsterra']");
      if (bar) bar.remove();
    },
  };
});

// ── Monetag: popup with SDK ──
registerRenderer("monetag", (_sessionId: string) => {
  let popup: Window | null = null;
  let cleanupCalled = false;
  return {
    key: "monetag",
    async render() {
      popup = window.open("about:blank", "_blank", "width=500,height=400,left=200,top=150");
      if (!popup || popup.closed) {
        return { success: false, error: "POPUP_BLOCKED" };
      }
      try {
        popup.document.write(`<!DOCTYPE html><html><head><title>Monetag Ad</title><script src="https://3nbf4.com/act/files/tag.min.js?zoneId=11277987"><\/script><style>body{margin:0;font-family:sans-serif;background:#fff}</style></head><body><div id="ad-container" style="width:100%;height:100vh"></div></body></html>`);
      } catch {
        popup.close();
        return { success: false, error: "POPUP_ACCESS_DENIED" };
      }
      await new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          if (popup?.closed) { clearInterval(timer); resolve(); }
        }, 500);
      });
      return { success: true };
    },
    cleanup() {
      if (cleanupCalled) return;
      cleanupCalled = true;
      try { if (popup && !popup.closed) popup.close(); } catch { /* ignore */ }
    },
  };
});

// ── Exported list of officially supported provider keys ──
export const OFFICIAL_PROVIDER_KEYS = ["adsterra", "monetag"];

export function hasOfficialRenderer(key: string): boolean {
  return rendererRegistry.has(key);
}
