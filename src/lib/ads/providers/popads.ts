import { BaseAdProvider } from "../base-provider";

export class PopAdsProvider extends BaseAdProvider {
  constructor() { super("popads", "PopAds"); }

  get scriptUrl(): string | null {
    if (!this.config?.publisherId) return null;
    return `https://cdn.popads.net/${this.config.publisherId}`;
  }

  protected async showAd(_userId: string, _sessionId: string): Promise<{ success: boolean; error?: string }> {
    const sdk = (window as any).PopAds;
    if (typeof sdk?.showRewarded === "function") {
      try {
        await sdk.showRewarded();
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "SDK_ERROR" };
      }
    }
    return { success: false, error: "SDK_NOT_READY" };
  }
}
