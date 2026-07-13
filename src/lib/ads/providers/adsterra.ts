import { BaseAdProvider } from "../base-provider";
import type { ScriptOptions } from "../script-loader";
import { loadScript } from "../script-loader";
import { AdEventType, emitAdEvent } from "../events";

const ADSTERRA_SCRIPT_URL = "https://pl30349373.effectivecpmnetwork.com/2e/88/bc/2e88bc28cdbfdafc4b85833ebade6a5c.js";

export class AdsterraProvider extends BaseAdProvider {
  private scriptLoaded = false;

  constructor() {
    super("adsterra", "Adsterra");
  }

  hasCredentials(): boolean {
    return true;
  }

  get scriptUrl(): string | null {
    return null;
  }

  async initialize(config: import("../types").AdProviderConfig): Promise<boolean> {
    this.config = config;
    this.ready = true;
    this.lastError = null;
    emitAdEvent({ type: AdEventType.PROVIDER_INITIALIZED, providerKey: this.key, timestamp: Date.now() });
    return true;
  }

  protected getScriptOptions(url: string): ScriptOptions {
    return { src: url, id: "ad-adsterra", timeout: this.config?.timeoutMs || 15000 };
  }

  protected async showAd(_userId: string, _sessionId: string): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();
    emitAdEvent({ type: AdEventType.AD_DISPLAYED, providerKey: this.key, timestamp: startTime });

    if (!this.scriptLoaded) {
      const result = await loadScript(this.getScriptOptions(ADSTERRA_SCRIPT_URL));
      if (!result.success) {
        emitAdEvent({ type: AdEventType.AD_FAILED, providerKey: this.key, errorCode: "SCRIPT_LOAD_FAILED", timestamp: Date.now() });
        return { success: false, error: "SCRIPT_LOAD_FAILED" };
      }
      this.scriptLoaded = true;
    }

    const minDuration = this.config?.timeoutMs || 15000;
    const elapsed = Date.now() - startTime;
    if (elapsed < minDuration) {
      await new Promise((r) => setTimeout(r, minDuration - elapsed));
    }

    emitAdEvent({ type: AdEventType.AD_COMPLETED, providerKey: this.key, timestamp: Date.now() });
    return { success: true };
  }
}
