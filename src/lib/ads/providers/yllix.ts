import { BaseAdProvider } from "../base-provider";

export class YllixProvider extends BaseAdProvider {
  constructor() {
    super("yllix", "ylliX");
  }

  get scriptUrl(): string | null {
    if (!this.config?.publisherId) return null;
    return `https://ac.${this.config.zoneId || "serve"}.yllix.com/p/${this.config.publisherId}`;
  }

  protected async showAd(_userId: string, _sessionId: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const sdk = (window as any).Yllix || (window as any).yllix;

      if (typeof sdk?.showRewarded === "function") {
        Promise.resolve(sdk.showRewarded())
          .then(() => resolve({ success: true }))
          .catch((err: unknown) => resolve({ success: false, error: err instanceof Error ? err.message : "SDK_ERROR" }));
        return;
      }

      const popup = window.open("", "_blank", "width=400,height=300,left=100,top=100");
      if (!popup || popup.closed) {
        resolve({ success: false, error: "POPUP_BLOCKED" });
        return;
      }
      try {
        popup.location.href = "about:blank";
        popup.document.write("<html><body><h2>Loading ad...</h2></body></html>");
      } catch {
        resolve({ success: false, error: "POPUP_ACCESS_DENIED" });
        return;
      }

      let resolved = false;
      const timer = setInterval(() => {
        if (resolved) return;
        try {
          if (popup.closed) {
            resolved = true;
            clearInterval(timer);
            resolve({ success: true });
          }
        } catch {
          resolved = true;
          clearInterval(timer);
          resolve({ success: true });
        }
      }, 500);

      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        clearInterval(timer);
        try { if (!popup.closed) popup.close(); } catch { /* ignore */ }
        resolve({ success: false, error: "TIMEOUT" });
      }, 30000);
    });
  }
}
