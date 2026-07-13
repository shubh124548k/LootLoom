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

function waitForDomElements(selector: string, timeoutMs: number): Promise<boolean> {
  if (document.querySelector(selector)) return Promise.resolve(true);
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(true);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); resolve(false); }, timeoutMs);
  });
}

function trackVisibility(adContainer: Element | null, minVisibleMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (!adContainer) { resolve(false); return; }
    let visibleStart = 0;
    let totalVisible = 0;
    const io = new IntersectionObserver((entries) => {
      const now = Date.now();
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (visibleStart === 0) visibleStart = now;
          totalVisible += now - visibleStart;
          visibleStart = now;
        } else {
          if (visibleStart > 0) totalVisible += now - visibleStart;
          visibleStart = 0;
        }
        if (totalVisible >= minVisibleMs) {
          io.disconnect();
          resolve(true);
        }
      }
    }, { threshold: 0.5 });
    io.observe(adContainer);
    setTimeout(() => { io.disconnect(); resolve(totalVisible >= minVisibleMs); }, minVisibleMs + 5000);
  });
}

function waitForUserAttention(): Promise<boolean> {
  if (document.visibilityState === "visible" && document.hasFocus()) return Promise.resolve(true);
  return new Promise((resolve) => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && document.hasFocus()) {
        document.removeEventListener("visibilitychange", onVisible);
        window.removeEventListener("focus", onVisible);
        resolve(true);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      resolve(document.visibilityState === "visible");
    }, 10000);
  });
}

function countNewElements(before: number): number {
  return document.querySelectorAll("*").length - before;
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
      const domBefore = document.querySelectorAll("*").length;
      try {
        await loadScriptOnce(
          "https://pl30349373.effectivecpmnetwork.com/2e/88/bc/2e88bc28cdbfdafc4b85833ebade6a5c.js",
          "ad-adsterra"
        );
      } catch (err) {
        console.log("[AD] Adsterra: script load failed", err);
        return { success: false, error: "SCRIPT_LOAD_FAILED" };
      }
      console.log("[AD] Adsterra: script loaded, checking for DOM injection");
      const hasNewElements = countNewElements(domBefore) > 2;
      if (!hasNewElements) {
        console.log("[AD] Adsterra: no new DOM elements detected — ad may not have rendered");
      }
      const barSelector = "iframe, [id*='adsterra'], [class*='adsterra'], [id*='social-bar'], [class*='social-bar'], [class*='floating'], [style*='fixed']";
      const containerFound = await waitForDomElements(barSelector, 8000);
      if (!containerFound) {
        console.log("[AD] Adsterra: ad container not found in DOM");
        return { success: false, error: "AD_CONTAINER_NOT_FOUND" };
      }
      const adEl = document.querySelector(barSelector);
      console.log("[AD] Adsterra: ad container found, tracking visibility");
      const attention = await waitForUserAttention();
      if (!attention) {
        console.log("[AD] Adsterra: user was not actively viewing the page");
      }
      const visible = adEl ? await trackVisibility(adEl, 10000) : false;
      if (!visible) {
        console.log("[AD] Adsterra: ad was not visible for minimum duration");
        return { success: false, error: "AD_NOT_VISIBLE" };
      }
      console.log("[AD] Adsterra: ad visible for 10s, completing");
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

// ── Monetag: official tag script (in-page) ──
registerRenderer("monetag", (_sessionId: string) => {
  let cleanupCalled = false;
  const scriptId = "ad-monetag-tag";
  return {
    key: "monetag",
    async render() {
      console.log("[AD] Monetag: loading official tag script");
      if (document.getElementById(scriptId)) {
        document.getElementById(scriptId)?.remove();
      }
      const domBefore = document.querySelectorAll("*").length;
      const removeScript = () => {
        if (cleanupCalled) return;
        cleanupCalled = true;
        const el = document.getElementById(scriptId);
        if (el) el.remove();
      };

      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://quge5.com/88/tag.min.js";
        script.setAttribute("data-zone", "259304");
        script.async = true;
        script.id = scriptId;
        script.setAttribute("data-cfasync", "false");

        const timeout = setTimeout(() => {
          console.log("[AD] Monetag: script load timeout");
          removeScript();
          resolve({ success: false, error: "SCRIPT_TIMEOUT" });
        }, 15000);

        script.onload = async () => {
          console.log("[AD] Monetag: script loaded, checking for DOM injection");
          clearTimeout(timeout);
          const hasNewElements = countNewElements(domBefore) > 2;
          if (!hasNewElements) {
            console.log("[AD] Monetag: no new DOM elements detected — ad may not have rendered");
          }
          const monetagSelector = "iframe, [id*='monetag'], [class*='monetag'], [id*='ad'], [class*='ad'], [id*='pop'], [class*='pop'], [style*='position'], [style*='fixed'], [style*='z-index']";
          const containerFound = await waitForDomElements(monetagSelector, 8000);
          if (!containerFound) {
            console.log("[AD] Monetag: ad container not found in DOM");
            removeScript();
            resolve({ success: false, error: "AD_CONTAINER_NOT_FOUND" });
            return;
          }
          const adEl = document.querySelector(monetagSelector);
          console.log("[AD] Monetag: ad container found, tracking visibility");
          const attention = await waitForUserAttention();
          if (!attention) {
            console.log("[AD] Monetag: user was not actively viewing the page");
          }
          const visible = adEl ? await trackVisibility(adEl, 10000) : false;
          if (!visible) {
            console.log("[AD] Monetag: ad was not visible for minimum duration");
            removeScript();
            resolve({ success: false, error: "AD_NOT_VISIBLE" });
            return;
          }
          console.log("[AD] Monetag: ad visible for 10s, completing");
          removeScript();
          resolve({ success: true });
        };

        script.onerror = () => {
          console.log("[AD] Monetag: script load failed");
          clearTimeout(timeout);
          removeScript();
          resolve({ success: false, error: "SCRIPT_LOAD_FAILED" });
        };

        document.body.appendChild(script);
      });
    },
    cleanup() {
      if (cleanupCalled) return;
      cleanupCalled = true;
      const el = document.getElementById(scriptId);
      if (el) el.remove();
      console.log("[AD] Monetag: cleaned up");
    },
  };
});
