import { BaseAdProvider } from "../base-provider";
import type { ScriptOptions } from "../script-loader";
import { AdEventType, emitAdEvent } from "../events";

export class MonetagProvider extends BaseAdProvider {
  constructor() {
    super("monetag", "Monetag");
  }

  get scriptUrl(): string | null {
    if (!this.config?.publisherId) return null;
    return `https://m.monetag.com/v2/${this.config.publisherId}`;
  }

  protected getScriptOptions(url: string): ScriptOptions {
    return { src: url, id: "ad-monetag", timeout: this.config?.timeoutMs || 10000 };
  }

  protected async showAd(_userId: string, _sessionId: string): Promise<{ success: boolean; error?: string }> {
    emitAdEvent({ type: AdEventType.AD_DISPLAYED, providerKey: this.key, timestamp: Date.now() });

    const sdk = (window as any).Monetag || (window as any).monetag;

    if (typeof sdk?.showRewarded === "function") {
      try {
        await Promise.resolve(sdk.showRewarded());
        emitAdEvent({ type: AdEventType.AD_COMPLETED, providerKey: this.key, timestamp: Date.now() });
        return { success: true };
      } catch (err) {
        emitAdEvent({ type: AdEventType.AD_FAILED, providerKey: this.key, errorCode: "SDK_ERROR", errorMessage: err instanceof Error ? err.message : "SDK call failed", timestamp: Date.now() });
        return { success: false, error: err instanceof Error ? err.message : "SDK_ERROR" };
      }
    }

    const popup = window.open("", "_blank", "width=400,height=300,left=100,top=100");
    if (!popup || popup.closed) {
      emitAdEvent({ type: AdEventType.AD_FAILED, providerKey: this.key, errorCode: "POPUP_BLOCKED", timestamp: Date.now() });
      return { success: false, error: "POPUP_BLOCKED" };
    }

    try {
      popup.location.href = "about:blank";
      popup.document.write("<!DOCTYPE html><html><head><title>Loading ad...</title></head><body><p style='font-family:sans-serif;text-align:center;padding-top:40%'>Loading advertisement...</p></body></html>");
    } catch {
      try { popup.close(); } catch { /* ignore */ }
      emitAdEvent({ type: AdEventType.AD_FAILED, providerKey: this.key, errorCode: "POPUP_ACCESS_DENIED", timestamp: Date.now() });
      return { success: false, error: "POPUP_ACCESS_DENIED" };
    }

    return new Promise((resolve) => {
      let resolved = false;

      const focusHandler = () => {
        if (resolved) return;
        if (popup.closed) {
          resolved = true;
          cleanup();
          emitAdEvent({ type: AdEventType.AD_COMPLETED, providerKey: this.key, timestamp: Date.now() });
          resolve({ success: true });
        }
      };

      const interval = setInterval(() => {
        if (resolved) return;
        try {
          if (popup.closed) {
            resolved = true;
            clearInterval(interval);
            window.removeEventListener("focus", focusHandler);
            emitAdEvent({ type: AdEventType.AD_COMPLETED, providerKey: this.key, timestamp: Date.now() });
            resolve({ success: true });
          }
        } catch {
          resolved = true;
          clearInterval(interval);
          window.removeEventListener("focus", focusHandler);
          try { if (!popup.closed) popup.close(); } catch { /* ignore */ }
          emitAdEvent({ type: AdEventType.AD_FAILED, providerKey: this.key, errorCode: "POPUP_ERROR", timestamp: Date.now() });
          resolve({ success: false, error: "POPUP_ERROR" });
        }
      }, 500);

      window.addEventListener("focus", focusHandler);

      const cleanup = () => {
        clearInterval(interval);
        window.removeEventListener("focus", focusHandler);
      };

      const timeout = this.config?.timeoutMs || 30000;
      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        cleanup();
        try { if (!popup.closed) popup.close(); } catch { /* ignore */ }
        emitAdEvent({ type: AdEventType.AD_TIMEOUT, providerKey: this.key, durationMs: timeout, timestamp: Date.now() });
        resolve({ success: false, error: "TIMEOUT" });
      }, timeout);
    });
  }
}
