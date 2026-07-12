export interface ScriptOptions {
  src: string;
  id?: string;
  async?: boolean;
  timeout?: number;
}

export interface ScriptLoadResult {
  success: boolean;
  durationMs: number;
  error?: string;
}

const loadedScripts = new Map<string, Promise<ScriptLoadResult>>();
const scriptElements = new Map<string, HTMLScriptElement>();
const eventListeners = new Map<string, Array<() => void>>();

export async function loadScript(options: ScriptOptions): Promise<ScriptLoadResult> {
  const src = options.src;
  const timeout = options.timeout || 10000;

  if (loadedScripts.has(src)) {
    const result = await loadedScripts.get(src)!;
    if (result.success) {
      return { success: true, durationMs: 0 };
    }
    loadedScripts.delete(src);
  }

  const startTime = Date.now();

  const loadPromise = new Promise<ScriptLoadResult>((resolve) => {
    if (typeof document === "undefined") {
      resolve({ success: false, durationMs: 0, error: "NOT_BROWSER" });
      return;
    }

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing && existing.getAttribute("data-loaded") === "true") {
      resolve({ success: true, durationMs: Date.now() - startTime });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = options.async ?? true;
    if (options.id) script.id = options.id;

    const timeoutId = setTimeout(() => {
      script.remove();
      loadedScripts.delete(src);
      resolve({ success: false, durationMs: Date.now() - startTime, error: "SCRIPT_TIMEOUT" });
    }, timeout);

    script.onload = () => {
      clearTimeout(timeoutId);
      script.setAttribute("data-loaded", "true");
      scriptElements.set(src, script);
      resolve({ success: true, durationMs: Date.now() - startTime });
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      script.remove();
      loadedScripts.delete(src);
      resolve({ success: false, durationMs: Date.now() - startTime, error: "SCRIPT_LOAD_FAILED" });
    };

    document.head.appendChild(script);
  });

  loadedScripts.set(src, loadPromise);
  return loadPromise;
}

export function removeScript(src: string): void {
  const script = scriptElements.get(src);
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
  scriptElements.delete(src);
  loadedScripts.delete(src);
  const listeners = eventListeners.get(src);
  if (listeners) {
    for (const listener of listeners) {
      listener();
    }
    eventListeners.delete(src);
  }
}

export function registerCleanup(src: string, cleanup: () => void): void {
  const existing = eventListeners.get(src) || [];
  existing.push(cleanup);
  eventListeners.set(src, existing);
}

export function isScriptLoaded(src: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.querySelector(`script[src="${src}"]`);
  return !!el && el.getAttribute("data-loaded") === "true";
}

export function clearAllScripts(): void {
  for (const [src] of scriptElements) {
    removeScript(src);
  }
}
