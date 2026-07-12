import type { AdProviderConfig, WaterfallAttempt, AdProviderKey } from "./types";
import type { IAdProvider } from "./interfaces";

export class GenericAdProvider implements IAdProvider {
  readonly key: string;
  readonly name: string;
  private config: AdProviderConfig | null = null;
  private ready = false;

  constructor(key: string, name: string) {
    this.key = key;
    this.name = name;
  }

  async initialize(config: AdProviderConfig): Promise<boolean> {
    this.config = config;
    this.ready = true;
    return true;
  }

  async load(): Promise<boolean> {
    return this.ready;
  }

  isAvailable(): boolean {
    return this.ready && (this.config?.enabled ?? false) && this.config?.status === "ACTIVE";
  }

  async showRewarded(_userId: string, sessionId: string): Promise<WaterfallAttempt> {
    const start = Date.now();
    if (!this.isAvailable()) {
      return { providerKey: this.key as AdProviderKey, status: "failed", errorCode: "PROVIDER_UNAVAILABLE", durationMs: Date.now() - start };
    }
    if (this.config && this.config.timeoutMs > 0) {
      await new Promise((r) => setTimeout(r, Math.min(50, this.config.timeoutMs)));
    }
    return { providerKey: this.key as AdProviderKey, status: "success", durationMs: Date.now() - start };
  }

  destroy(): void {
    this.ready = false;
    this.config = null;
  }

  getStatus(): string {
    if (!this.ready) return "uninitialized";
    if (!this.config?.enabled) return "disabled";
    return this.config.status;
  }
}

const providerRegistry = new Map<string, IAdProvider>();

export function registerProvider(provider: IAdProvider): void {
  providerRegistry.set(provider.key, provider);
}

export function getProvider(key: string): IAdProvider | undefined {
  return providerRegistry.get(key);
}

export function getAllProviders(): IAdProvider[] {
  return Array.from(providerRegistry.values());
}

export function clearProviders(): void {
  for (const p of providerRegistry.values()) {
    p.destroy();
  }
  providerRegistry.clear();
}

export async function buildProviders(configs: AdProviderConfig[]): Promise<IAdProvider[]> {
  const providers: IAdProvider[] = [];
  for (const cfg of configs) {
    const existing = providerRegistry.get(cfg.key);
    if (existing) {
      await existing.initialize(cfg);
      providers.push(existing);
    }
  }
  return providers;
}
