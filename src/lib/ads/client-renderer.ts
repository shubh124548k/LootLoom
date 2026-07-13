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

export const OFFICIAL_PROVIDER_KEYS = ["adsterra", "monetag"];

export function hasOfficialRenderer(key: string): boolean {
  return rendererRegistry.has(key);
}

// ── Adsterra: social bar on main page ──
registerRenderer("adsterra", (_sessionId: string) => {
  let cleanupCalled = false;
  return {
    key: "adsterra",
    async render() {
      console.log("[AD] Adsterra: loading script");
      try {
        await loadScriptOnce(
          "https://pl30349373.effectivecpmnetwork.com/2e/88/bc/2e88bc28cdbfdafc4b85833ebade6a5c.js",
          "ad-adsterra"
        );
      } catch (err) {
        console.log("[AD] Adsterra: script load failed", err);
        return { success: false, error: "SCRIPT_LOAD_FAILED" };
      }
      console.log("[AD] Adsterra: script loaded, waiting 15s");
      await new Promise((r) => setTimeout(r, 15000));
      console.log("[AD] Adsterra: completed");
      return { success: true };
    },
    cleanup() {
      if (cleanupCalled) return;
      cleanupCalled = true;
      const el = document.getElementById("ad-adsterra");
      if (el) el.remove();
      const bar = document.querySelector("[id*='adsterra'], [class*='adsterra']");
      if (bar) bar.remove();
      console.log("[AD] Adsterra: cleaned up");
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
      console.log("[AD] Monetag: opening popup");
      popup = window.open("", "_blank", "width=500,height=400,left=200,top=150");
      if (!popup || popup.closed) {
        console.log("[AD] Monetag: popup blocked");
        return { success: false, error: "POPUP_BLOCKED" };
      }
      try {
        popup.document.write(`<!DOCTYPE html><html><head><title>Monetag Ad</title><style>body{margin:0;font-family:sans-serif;background:#fff}</style></head><body><div id="ad-container" style="width:100%;height:100vh"></div></body></html>`);
        popup.document.close();
      } catch {
        popup.close();
        console.log("[AD] Monetag: popup access denied");
        return { success: false, error: "POPUP_ACCESS_DENIED" };
      }

      // Wait for SDK to load and render content
      console.log("[AD] Monetag: loading SDK script");
      const sdkScript = popup.document.createElement("script");
      sdkScript.src = "https://3nbf4.com/act/files/tag.min.js?zoneId=11277987";
      popup.document.body.appendChild(sdkScript);

      // Wait up to 8s for the SDK to render something in the popup
      const sdkLoaded = await new Promise<boolean>((resolve) => {
        const check = () => {
          try {
            if (!popup || popup.closed) { resolve(false); return; }
            const bodyHTML = popup.document.body.innerHTML;
            if (bodyHTML.length > 40 && !bodyHTML.includes("ad-container")) {
              resolve(true);
              return;
            }
          } catch { resolve(false); return; }
          setTimeout(check, 500);
        };
        setTimeout(() => resolve(false), 8000);
        check();
      });

      if (!sdkLoaded) {
        console.log("[AD] Monetag: SDK did not render ad");
        try { if (popup && !popup.closed) popup.close(); } catch { /* ignore */ }
        return { success: false, error: "AD_NOT_RENDERED" };
      }

      console.log("[AD] Monetag: ad rendered, waiting for popup close");
      await new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          if (popup?.closed) { clearInterval(timer); resolve(); }
        }, 500);
      });
      console.log("[AD] Monetag: completed");
      return { success: true };
    },
    cleanup() {
      if (cleanupCalled) return;
      cleanupCalled = true;
      try { if (popup && !popup.closed) popup.close(); } catch { /* ignore */ }
      console.log("[AD] Monetag: cleaned up");
    },
  };
});
