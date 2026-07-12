export enum AdEventType {
  PROVIDER_INITIALIZED = "PROVIDER_INITIALIZED",
  PROVIDER_INIT_FAILED = "PROVIDER_INIT_FAILED",
  AD_LOADED = "AD_LOADED",
  AD_LOAD_FAILED = "AD_LOAD_FAILED",
  AD_DISPLAYED = "AD_DISPLAYED",
  AD_COMPLETED = "AD_COMPLETED",
  AD_FAILED = "AD_FAILED",
  AD_TIMEOUT = "AD_TIMEOUT",
  AD_REJECTED = "AD_REJECTED",
  AD_REWARDED = "AD_REWARDED",
  WATERFALL_STARTED = "WATERFALL_STARTED",
  WATERFALL_ATTEMPT = "WATERFALL_ATTEMPT",
  WATERFALL_EXHAUSTED = "WATERFALL_EXHAUSTED",
  WATERFALL_SUCCESS = "WATERFALL_SUCCESS",
  VERIFICATION_STARTED = "VERIFICATION_STARTED",
  VERIFICATION_PASSED = "VERIFICATION_PASSED",
  VERIFICATION_FAILED = "VERIFICATION_FAILED",
  REWARD_CREDITED = "REWARD_CREDITED",
  REWARD_FAILED = "REWARD_FAILED",
}

export interface AdEventPayload {
  type: AdEventType;
  providerKey?: string;
  userId?: string;
  sessionId?: string;
  rewardAmount?: number;
  durationMs?: number;
  errorCode?: string;
  errorMessage?: string;
  timestamp: number;
}

type AdEventListener = (event: AdEventPayload) => void;

const listeners = new Map<AdEventType, AdEventListener[]>();

export function onAdEvent(type: AdEventType, listener: AdEventListener): void {
  const existing = listeners.get(type) || [];
  existing.push(listener);
  listeners.set(type, existing);
}

export function offAdEvent(type: AdEventType, listener: AdEventListener): void {
  const existing = listeners.get(type);
  if (!existing) return;
  const filtered = existing.filter((l) => l !== listener);
  if (filtered.length === 0) {
    listeners.delete(type);
  } else {
    listeners.set(type, filtered);
  }
}

export function emitAdEvent(payload: AdEventPayload): void {
  const existing = listeners.get(payload.type);
  if (!existing) return;
  for (const listener of existing) {
    try {
      listener(payload);
    } catch {
      // silent
    }
  }
}
