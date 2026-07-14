export type AdProviderKey =
  | "a-ads"
  | "yllix"
  | "popads"
  | "hilltopads"
  | "clickadu"
  | "juicyads"
  | "richads"
  | "medianet"
  | "adrevenue"
  | "evadav"
  | "adsterra";

export type AdProviderStatus = "ACTIVE" | "DISABLED" | "ERROR";

export type AdEventStatus = "STARTED" | "COMPLETED" | "FAILED" | "VERIFIED";

export type WaterfallResultStatus = "success" | "fallback" | "exhausted" | "error";

export interface AdProviderConfig {
  key: AdProviderKey;
  name: string;
  enabled: boolean;
  priority: number;
  publisherId?: string;
  zoneId?: string;
  apiKey?: string;
  rewardAmount: number;
  dailyLimit: number;
  timeoutMs: number;
  status: AdProviderStatus;
}

export interface WaterfallRequest {
  userId: string;
  adType: string;
}

export interface WaterfallAttempt {
  providerKey: AdProviderKey;
  status: "loading" | "success" | "failed" | "timeout";
  errorCode?: string;
  durationMs: number;
}

export interface WaterfallResult {
  status: WaterfallResultStatus;
  code?: string;
  sessionId?: string;
  rewardAmount: number;
  attempts: WaterfallAttempt[];
  providerUsed?: AdProviderKey;
}

export interface RewardVerification {
  sessionId: string;
  providerKey: AdProviderKey;
  rewardAmount: number;
  verified: boolean;
  signature: string;
  timestamp: number;
}

export interface AdEventLog {
  id: string;
  userId: string;
  providerKey?: string;
  adType: string;
  rewardAmount: number;
  status: AdEventStatus;
  errorCode?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface AdAnalyticsSnapshot {
  todayAds: number;
  todayRevenue: number;
  fillRate: number;
  averageCompletion: number;
  providerRanking: Array<{ key: string; name: string; successRate: number; fillRate: number }>;
  failedAds: number;
  coinsIssued: number;
  averageReward: number;
  averageWatchTime: number;
  topProvider: string;
  providerErrors: Array<{ key: string; count: number; lastError: string }>;
}
