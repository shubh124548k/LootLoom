import type { AdProviderConfig, WaterfallAttempt, AdProviderKey } from "./types";
import type { IAdProvider } from "./interfaces";
import { loadScript, removeScript, type ScriptOptions } from "./script-loader";
import { AdEventType, emitAdEvent } from "./events";

export abstract class BaseAdProvider implements IAdProvider {
  readonly key: string;
  readonly name: string;
  protected config: AdProviderConfig | null = null;
  protected ready = false;
  protected lastError: string | null = null;
  protected lastTestAt: number | null = null;
  protected lastTestSuccess: boolean | null = null;

  constructor(key: string, name: string) {
    this.key = key;
    this.name = name;
  }

  abstract get scriptUrl(): string | null;

  hasCredentials(): boolean {
    if (!this.config) return false;
    return !!(this.config.publisherId || this.config.apiKey || this.config.zoneId);
  }

  async initialize(config: AdProviderConfig): Promise<boolean> {
    this.config = config;
    this.ready = false;
    this.lastError = null;

    if (!config.enabled || config.status !== "ACTIVE") {
      this.ready = false;
      return false;
    }

    if (!this.hasCredentials()) {
      this.lastError = "PROVIDER_NOT_CONFIGURED";
      this.ready = true;
      emitAdEvent({ type: AdEventType.PROVIDER_INIT_FAILED, providerKey: this.key, errorCode: "PROVIDER_NOT_CONFIGURED", timestamp: Date.now() });
      return true;
    }

    const scriptUrl = this.scriptUrl;
    if (!scriptUrl) {
      this.ready = true;
      return true;
    }

    const result = await loadScript(this.getScriptOptions(scriptUrl));
    if (result.success) {
      this.ready = true;
      emitAdEvent({ type: AdEventType.PROVIDER_INITIALIZED, providerKey: this.key, durationMs: result.durationMs, timestamp: Date.now() });
    } else {
      this.lastError = result.error || "SCRIPT_LOAD_FAILED";
      emitAdEvent({ type: AdEventType.PROVIDER_INIT_FAILED, providerKey: this.key, errorCode: this.lastError, durationMs: result.durationMs, timestamp: Date.now() });
    }

    return result.success;
  }

  protected getScriptOptions(url: string): ScriptOptions {
    return { src: url, id: `ad-${this.key}`, timeout: this.config?.timeoutMs || 10000 };
  }

  async load(): Promise<boolean> {
    return this.ready;
  }

  isAvailable(): boolean {
    return this.ready && (this.config?.enabled ?? false) && this.config?.status === "ACTIVE";
  }

  async showRewarded(userId: string, sessionId: string): Promise<WaterfallAttempt> {
    const start = Date.now();

    if (!this.config) {
      return { providerKey: this.key as AdProviderKey, status: "failed", errorCode: "NO_CONFIG", durationMs: Date.now() - start };
    }

    if (!this.hasCredentials()) {
      return { providerKey: this.key as AdProviderKey, status: "failed", errorCode: "PROVIDER_NOT_CONFIGURED", durationMs: Date.now() - start };
    }

    if (!this.ready) {
      await this.initialize(this.config);
      if (!this.ready) {
        return { providerKey: this.key as AdProviderKey, status: "failed", errorCode: "INIT_FAILED", durationMs: Date.now() - start };
      }
    }

    try {
      const result = await this.showAd(userId, sessionId);
      return { providerKey: this.key as AdProviderKey, status: result.success ? "success" : "failed", errorCode: result.error, durationMs: Date.now() - start };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      emitAdEvent({ type: AdEventType.AD_FAILED, providerKey: this.key, userId, sessionId, errorCode: "AD_ERROR", errorMessage: errorMsg, timestamp: Date.now() });
      return { providerKey: this.key as AdProviderKey, status: "failed", errorCode: "AD_ERROR", durationMs: Date.now() - start };
    }
  }

  protected abstract showAd(userId: string, sessionId: string): Promise<{ success: boolean; error?: string }>;

  destroy(): void {
    const scriptUrl = this.scriptUrl;
    if (scriptUrl) {
      removeScript(scriptUrl);
    }
    this.ready = false;
    this.config = null;
    this.lastError = null;
  }

  getStatus(): string {
    if (!this.config?.enabled) return "disabled";
    if (!this.hasCredentials()) return "not_configured";
    if (this.lastError === "SCRIPT_LOAD_FAILED") return "error";
    if (this.lastError === "PROVIDER_NOT_CONFIGURED") return "not_configured";
    if (!this.ready) return "waiting";
    if (this.lastError) return "degraded";
    return "active";
  }

  getHealth(): { status: string; lastError: string | null; lastTestAt: number | null; lastTestSuccess: boolean | null } {
    return { status: this.getStatus(), lastError: this.lastError, lastTestAt: this.lastTestAt, lastTestSuccess: this.lastTestSuccess };
  }
}
