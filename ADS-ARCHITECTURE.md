# LootLoom Advertisement Architecture

## Overview

The advertisement system uses a configurable waterfall architecture. Multiple ad
providers are tried in priority order until one successfully displays an ad.
The reward is always determined server-side and credited atomically.

## Waterfall Flow

```
User clicks "Watch Ad"
  → POST /api/ads/waterfall
    → Daily ad limit check
    → Daily coin limit check
    → AdManager.initAdManager()
      → registerAllProviders() — registers 11 provider adapters
      → loadProviderConfigs() — loads config from DB with 30s cache
      → buildProviders() — initializes each provider with its config
    → WaterfallStrategy.execute()
      → For each provider in priority order:
        → isAvailable()? No → skip (UNAVAILABLE)
        → hasCredentials()? No → skip (PROVIDER_NOT_CONFIGURED)
        → Create AdEvent (STARTED)
        → provider.showRewarded()
          → Load provider script (if not loaded)
          → Show popunder/popup ad
          → Track completion via focus/interval
          → Return success/failure/timeout
        → Success? → AdEvent → COMPLETED, return
        → Failed? → AdEvent → FAILED, try next provider
      → All failed → exhausted
    → VerificationService.verify()
      → Validate session (status === COMPLETED)
      → Check duplicate (status !== VERIFIED)
      → Check velocity (max per minute)
      → Check min duration (prevent too-fast)
    → RewardHandler.credit() — atomic $transaction()
      → Wallet.increment(coinBalance, totalEarned)
      → Transaction.create(type: AD_REWARD)
      → AdEvent → VERIFIED
      → Notification.create(type: REWARD)
      → AuditLog.create(action: AD_REWARD_CREDITED)
      → Mission progress (WATCH_ADS)
    → updateProviderStats(success: true)
    → Return success with reward amount
```

## Provider Lifecycle

```
registerProvider(new MonetagProvider())
  → initialize(config)
    → hasCredentials()? No → ready, return "not_configured"
    → Load script from CDN
    → Script loaded? Yes → ready, return "active"
    → Script failed? → ready, return "error"
  → showRewarded(userId, sessionId)
    → hasCredentials()? No → return PROVIDER_NOT_CONFIGURED
    → Initialize if not ready → return INIT_FAILED
    → Call showAd():
      → Check SDK → call SDK.showRewarded()
      → Fallback: popup with focus/interval tracking
      → Return { success: true/false, error? }
    → Waterfall handles result
  → destroy()
    → Remove script from DOM
    → Clear listeners
    → Reset state
  → getStatus()
    → Returns: active | not_configured | waiting | initializing |
               disabled | error | degraded
```

## Registered Providers (Priority Order)

| # | Key | Name | Script URL | Fallback |
|---|-----|------|-----------|----------|
| 1 | monetag | Monetag | `//m.monetag.com/v2/{publisherId}` | Popunder + focus tracking |
| 2 | a-ads | A-Ads | `//a-ads.com/api/script/{publisherId}` | Popunder + focus tracking |
| 3 | yllix | ylliX | `//ac.{zoneId}.yllix.com/p/{publisherId}` | Popunder + focus tracking |
| 4 | popads | PopAds | `//cdn.popads.net/{publisherId}` | SDK check only |
| 5 | hilltopads | HilltopAds | `//hilltopads.com/p/{publisherId}` | SDK check only |
| 6 | clickadu | Clickadu | `//clickadu.com/{publisherId}` | SDK check only |
| 7 | juicyads | JuicyAds | `//juicyads.com/script/{publisherId}` | SDK check only |
| 8 | richads | RichAds | `//richads.com/{publisherId}` | SDK check only |
| 9 | medianet | Media.net | `//cdn.media.net/{publisherId}` | SDK check only |
| 10 | adrevenue | AdRevenue | `//adrevenue.net/{publisherId}` | SDK check only |
| 11 | evadav | Evadav | `//evadav.com/{publisherId}` | SDK check only |

## CEO Configuration

CEO → Advertisement Providers panel:

1. Each provider card shows:
   - Name + key + enabled/disabled badge
   - Health status (Healthy / Not Configured / Initializing / Disabled / Error)
   - Fill Rate, Success Rate, Today Revenue, Total Revenue
   - Completed Ads, Failed Ads, Last Error, Priority
   - Last Success, Last Failure timestamps
   - Credential status (configured/not configured)
   - Editable: Publisher ID, Zone ID, API Key, Reward, Daily Limit, Timeout

2. Actions per provider:
   - **Save** — PATCH /api/ceo/ad-providers → invalidates cache → refreshes runtime
   - **Disable/Enable** — toggles provider on/off
   - **Test** — POST /api/ceo/ad-providers → initializes provider → returns health
   - **Reset** — clears provider statistics

3. All changes take effect immediately — no server restart needed.

## Credential Insertion

1. CEO navigates to Ad Providers panel
2. Finds the provider card (e.g. Monetag)
3. Enters Publisher ID, Zone ID, API Key
4. Clicks Save → PATCH persists to DB → cache invalidated
5. Clicks Test → initAdManager() → initializes provider → shows Healthy
6. Provider is now ready for production ad serving

## Security Architecture

- **Reward is 100% backend-determined**: Client sends only `adType`. Reward
  amount comes from `AdProvider.rewardAmount` in DB.
- **No credential leakage**: GET /api/ceo/ad-providers masks all secrets.
  Only `hasCredentials: boolean` is returned for credential status.
- **Duplicate prevention**: AdEvent status prevents re-rewarding. Verification
  checks status !== VERIFIED before allowing credit.
- **Replay prevention**: Each ad creates a unique AdEvent (STARTED). Only
  COMPLETED events can be verified. VERIFIED events are rejected.
- **Velocity check**: Configurable max rewarded ads per minute.
- **Atomic transactions**: All wallet/transaction/notification/mission updates
  happen in a single Prisma $transaction().
- **Daily limits**: Both ad count and coin earning limits checked before
  any provider runs.
- **Provider isolation**: One provider crash never stops the waterfall.
  try/catch wraps showRewarded() — crashes become failed attempts.

## Cache Architecture

| Cache | Key | TTL | Invalidation |
|-------|-----|-----|-------------|
| Provider configs | DB data | 30s | PATCH /api/ceo/ad-providers |
| Provider registry | In-memory Map | Permanent | refreshAdProviders() |
| Script loader | Script URL | Permanent (loaded) | removeScript() |
| Earn config | DB data | 60s | CEO config update |

## Testing Process

### Test a Provider
1. CEO → Ad Providers
2. Click "Test" on a provider card
3. Backend initializes the provider (loads script, checks SDK)
4. Result shown in toast: "Test passed" or "Test failed"

### Watch an Ad (end-to-end)
1. Login as user
2. Navigate to Earn page
3. Click "Watch Ad"
4. Waterfall iterates through providers
5. First available provider shows popunder
6. User views ad, closes popup
7. Reward credited atomically
8. Notification shown, mission updated

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| All providers fail | No credentials configured | Add credentials via CEO panel |
| Provider shows "Error" | Script failed to load | Check provider CDN availability |
| Provider shows "Waiting" | Not yet initialized | Click Test to trigger init |
| Waterfall returns 503 | Daily limits reached | Reset limits or wait for reset |
| Wallet not credited | Verification failed | Check audit log for error code |
| Duplicate reward error | Ad re-requested | Each AdEvent used once only |
| Provider crash | Unexpected SDK error | try/catch in waterfall handles it |

## Known Limitations

1. **Primary providers** (Monetag, A-Ads, ylliX) have popunder fallback with
   focus tracking. **Fallback providers** (PopAds through Evadav) depend on
   SDK being available — without SDK they return SDK_NOT_READY and the
   waterfall moves to the next provider.
2. All 11 providers have CDN URLs configured but these are generic patterns.
   Actual CDN endpoints may differ when real credentials are used.
3. Script loading uses DOM injection — only works in browser context.
   Server-side rendering paths skip script loading gracefully.
4. Popunder detection relies on window focus + interval polling (500ms).
   Very fast popup closures (<500ms) may be missed.
5. No real-time WebSocket push — notifications poll via API.

## Future Provider Integration

1. Create new file in `src/lib/ads/providers/`
2. Extend `BaseAdProvider`
3. Implement `scriptUrl`, `showAd()`
4. Add to `src/lib/ads/providers/index.ts` registerAllProviders()
5. Run `npx tsx src/scripts/seed-ad-providers.ts` to add DB record
6. Set priority in CEO panel

```typescript
import { BaseAdProvider } from "../base-provider";

export class NewProvider extends BaseAdProvider {
  constructor() { super("new-provider", "New Provider"); }
  get scriptUrl(): string | null {
    if (!this.config?.publisherId) return null;
    return `https://cdn.newprovider.com/${this.config.publisherId}`;
  }
  protected async showAd(_userId: string, _sessionId: string):
    Promise<{ success: boolean; error?: string }> {
    // SDK or popunder implementation
    return { success: false, error: "SDK_NOT_READY" };
  }
}
```

## File Reference

```
src/lib/ads/
├── types.ts            — Core type definitions
├── interfaces.ts       — Provider interfaces
├── events.ts           — Event system (pub/sub)
├── config.ts           — Provider config loader (30s cache)
├── provider.ts         — Provider registry
├── base-provider.ts    — Abstract base class
├── script-loader.ts    — Script loading (duplicate prevention)
├── waterfall.ts        — Waterfall execution
├── manager.ts          — AdManager facade
├── reward.ts           — Reward distribution (atomic $transaction)
├── verification.ts     — Reward verification
└── providers/
    ├── index.ts        — registerAllProviders()
    ├── monetag.ts      — Monetag adapter
    ├── a-ads.ts        — A-Ads adapter
    ├── yllix.ts        — ylliX adapter
    ├── popads.ts       — PopAds adapter
    ├── hilltopads.ts   — HilltopAds adapter
    ├── clickadu.ts     — Clickadu adapter
    ├── juicyads.ts     — JuicyAds adapter
    ├── richads.ts      — RichAds adapter
    ├── medianet.ts     — Media.net adapter
    ├── adrevenue.ts    — AdRevenue adapter
    └── evadav.ts       — Evadav adapter
```
