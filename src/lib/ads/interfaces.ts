import type { AdProviderConfig, WaterfallAttempt } from "./types";

export interface IAdProvider {
  readonly key: string;
  readonly name: string;

  initialize(config: AdProviderConfig): Promise<boolean>;
  load(): Promise<boolean>;
  isAvailable(): boolean;
  showRewarded(userId: string, sessionId: string): Promise<WaterfallAttempt>;
  destroy(): void;
  getStatus(): string;
  getHealth(): { status: string; lastError: string | null; lastTestAt: number | null; lastTestSuccess: boolean | null };
}

export interface IWaterfallStrategy {
  execute(providers: IAdProvider[], userId: string, adType: string): Promise<{
    success: boolean;
    sessionId?: string;
    rewardAmount: number;
    attempts: WaterfallAttempt[];
    providerUsed?: string;
  }>;
}

export interface IRewardHandler {
  credit(userId: string, sessionId: string, providerKey: string, rewardAmount: number): Promise<{
    success: boolean;
    transactionId?: string;
    newBalance?: number;
    error?: string;
  }>;
}

export interface IVerificationService {
  verify(sessionId: string, userId: string): Promise<{
    valid: boolean;
    rewardAmount: number;
    error?: string;
  }>;
  validateSession(sessionId: string, userId: string): Promise<boolean>;
  checkDuplicate(sessionId: string): Promise<boolean>;
  checkVelocity(userId: string): Promise<boolean>;
}

export interface IAdAnalyticsCollector {
  recordProviderResult(providerKey: string, success: boolean, durationMs: number, rewardAmount: number): Promise<void>;
  getSnapshot(): Promise<Record<string, unknown>>;
  getProviderRanking(): Promise<Array<{ key: string; name: string; successRate: number }>>;
}
