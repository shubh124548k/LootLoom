# Task p2-earn — Simplify Earn page

**Agent:** full-stack-developer
**File modified:** `src/features/earn/earn-view.tsx`

## Summary
Reduced the Earn view from 15 sections (2036 lines) to 5 focused sections (~440 lines) while preserving the premium glass-card design language, animations, and gradients.

## Sections kept
1. **Hero — Watch Rewarded Ads** (rewritten): big Watch Ad Now button, reward-per-ad highlight, 4 ad-stat tiles, Today's Ad Progress bar + estimated today's earnings. All values from `adStats` placeholder state (API-ready, all 0).
2. **Offerwall** (simplified): 4 provider cards only — removed category chips and Launch CTA.
3. **Reward History Preview** (kept verbatim): SkeletonRow loading + View/Open history buttons.
4. **Earn Analytics** (simplified): one weekly earnings BarChart — removed period toggle, pie chart, area chart.
5. **Tips** (limited to 4, content rewritten to remove referral/daily-bonus references + hardcoded coin amounts).

## Sections removed
Earning Activities grid, standalone Rewarded Ads WidgetCard, Daily Bonus, Daily/Weekly/Monthly Missions, Achievement Rewards, Referral Rewards, Event Center, Activity Distribution pie chart, Weekly Trend area chart, period toggle, States Preview demo.

## Cleanup
- Removed 5 unused recharts imports, 13 unused lucide icons, 3 unused lootloom components, 2 unused store imports, `useMemo`.
- Removed 11 unused types/data arrays + RARITY maps.
- Removed 9 unused helper components + `MiniStat` primitive.

## Verification
- `bun run lint`: 0 errors, 0 warnings
- Dev server: ✓ Compiled in 6.1s, home page 200 OK
- No hardcoded reward amounts (25/50/100/200/500/1500/2500/5000) remain in display values.
