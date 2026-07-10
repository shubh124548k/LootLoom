# Task 14-gamification — full-stack-developer

## Task
Build LootLoom Gamification Center (referral/achievements/leaderboard/XP/badges/streak/challenges) as a single new file at `/home/z/my-project/src/features/gamification/gamification-view.tsx`.

## Work Log
- Read `/home/z/my-project/worklog.md` to understand the established architecture (Next.js 16 single-route SPA, premium white glassmorphism, Zustand navigation, lootloom component library, framer-motion + recharts)
- Inspected existing infrastructure: `WidgetCard`, `PageContainer/PageHeader/SectionHeader/Grid`, `GlassCard`, `LootButton`, `IconBadge`, `AnimatedCounter`, `ProgressRing`, `StatCard`, `StatusBadge`, `EmptyState`, `ErrorState`, `SkeletonRow`
- Inspected `@/stores`: `useNavigationStore` (navigate, current), `useUserStore` (level, xp, xpToNext, rank, dailyStreak, referralCode, username), `useWalletStore` (availableCoins)
- Inspected `@/lib/animations`: `cardReveal`, `staggerContainer`, `hoverLift`, `floating`, `floatingSmall`
- Inspected existing sibling views (wallet-view, rewards-view) for recharts/clipboard/section patterns
- Confirmed `app-router.tsx` already maps `referral` / `achievements` / `leaderboard` → `GamificationView` via lazy(() => import("@/features/gamification/gamification-view").then(m => ({ default: m.GamificationView })))
- Created `/home/z/my-project/src/features/gamification/gamification-view.tsx` (named export `GamificationView`, `"use client"` first line)
- Defined strongly-typed placeholder data arrays: ACHIEVEMENTS (10 items across 8 categories), ACHIEVEMENT_CATEGORIES chips, BADGES (12 with 9 rarity tiers), LEVEL_MILESTONES (5), LEADERBOARD_USERS (15 rows), REFERRAL_TOP (3 podium), FRIENDS (5), CHALLENGES (6), MILESTONES (8 coin/referral/streak), ACTIVITY_FEED (7), REWARD_SHOWCASE (5), XP_GROWTH_DATA, REFERRAL_GROWTH_DATA, LEVEL_PROGRESS_DATA, LEADERBOARD_HISTORY_DATA, ACHIEVEMENT_DISTRIBUTION (PieChart), DAILY_STREAK_DAYS (7), MONTH_GRID (28-day July calendar)
- Built reusable helper components: `AchievementCard`, `BadgeCard`, `ChallengeCard`, `MilestoneCard`, `LeaderboardRow`, `LeaderboardPodium`, `ReferralCard`, `ProgressWidget` (all staggered `cardReveal` + `hoverLift`)
- Built state components: `NoAchievementsEmpty`, `NoReferralsEmpty`, `LeaderboardUnavailableError`
- Built all 16 sections inside `<PageContainer>` + `<PageHeader>`:
  1. **GamificationOverview** — hero glass card with 6 mini-stat tiles, current/global/friends rank cards, large XP ProgressRing (160px) with floating animation, AnimatedCounter for level + XP, streak badge
  2. **XPLevelSystem** — large 180px ProgressRing (electric gradient) with current/required/remaining XP, level milestones timeline (5 tiers Bronze→Diamond), future prestige/level rewards with dashed ring placeholders
  3. **AchievementCenter** — 8 category filter chips (All/Beginner/Intermediate/Advanced/Expert/Legendary/Seasonal/Special Event/VIP) with active state, 10 AchievementCards (icon, difficulty badge, XP/coin rewards, ProgressRing, claim button for unlocked-unclaimed), unlocked count + ring in header
  4. **BadgeCollection** — 12 BadgeCards grid (2/3/4/6 cols responsive) with 9 rarity tiers (common/uncommon/rare/epic/legendary/limited/seasonal/founder/vip), shimmer on unlocked, lock icon on locked, rarity glow shadows
  5. **DailyStreakCenter** — animated flame icon (scale+rotate loop), 4 mini-stats (longest/today/tomorrow/milestone), 7-day weekly tile grid with claimed/today/locked states, 28-day monthly calendar with claimed/today/missed/future legend
  6. **ReferralCenter** — styled referral code box from `useUserStore().referralCode` + copy button (clipboard + copied state), referral link placeholder, 3 share options (QR/Contacts/Email all locked), 4 ReferralCards (invited/registered/pending/completed), lifetime referral coins AnimatedCounter
  7. **ReferralLeaderboard** — top 3 podium (silver/gold/bronze), current position highlight card, referral growth AreaChart (cyan gradient)
  8. **GlobalLeaderboard** — 7 tab chips (Global/Friends/Weekly/Monthly/Lifetime/Country/Region — last 2 locked), top-3 podium, 15 LeaderboardRows with rank/initials avatar/level/coins/XP/trend, current user highlight, scrollable list with custom-scroll, fallback "you" row when rank > 15
  9. **FriendsLeaderboard** — 5 friend cards with online indicator, weekly progress ring, level/XP, compare button, invite friends CTA
  10. **ChallengesCenter** — 6 ChallengeCards (Daily/Weekly/Monthly/Special/Community/Tournament-locked), each with ProgressRing, XP/coin rewards, ends-in timer, join/completed/locked CTA
  11. **MilestoneRewards** — two-column timeline (coins / referrals+streaks) using MilestoneCard with vertical connector, reached/unreached states, animated progress bar, reward descriptions
  12. **RewardShowcase** — 5 premium glass reward cards (Upcoming/Locked/Recommended/Achievement/Referral) with lock icons for locked, redeem/view CTAs
  13. **ProgressDashboard** — Grid cols=3 of 6 ProgressWidgets (overall/achievement/referral/leaderboard/level/VIP-locked) each with mini ProgressRing + accent gradient
  14. **ActivityFeed** — vertical gradient timeline with 7 typed events (achievement/referral/levelup/badge/leaderboard/challenge/event), per-type IconBadge, timestamps
  15. **Statistics** — 5 recharts visualizations: XP Growth (LineChart electric), Referral Growth (AreaChart cyan), Level Progress (BarChart purple gradient), Leaderboard History (LineChart emerald reversed Y-axis), Achievement Distribution (PieChart donut with 5 difficulty colors + legend)
  16. **Status States** preview WidgetCard containing NoAchievementsEmpty, NoReferralsEmpty, LeaderboardUnavailableError side-by-side
- Wired route-aware behavior via `useNavigationStore().current`:
  - PageHeader title/description adapts: "Referral Center" / "Achievements" / "Leaderboard" / "Gamification Center" fallback
  - Each of the 3 main sections (AchievementCenter, ReferralCenter, GlobalLeaderboard) wrapped in a `<div data-section="...">` that gets `ring-2 ring-electric/30` highlight when `isFocused`
  - `useEffect` scrollIntoView smooth-scroll to the matching section on mount/route change (300ms delay)
- Wired PageHeader actions: Wallet (glass → navigate wallet), Earn More (electric → navigate earn)
- Footer CTA card with Start Earning / Browse Rewards / View Dashboard buttons
- Premium WHITE glass theme throughout: GlassCard levels 1-3, gradient backgrounds (electric/cyan/purple/gold/emerald/rose/navy accents — no indigo/blue), sheen + glow on hero/section cards, floating decorative motion, staggered cardReveal entrance animations, hoverLift on all interactive glass tiles
- Responsive grids throughout: mobile stacked → sm 2-col → lg 3-col → xl multi-column
- Removed unused imports (AnimatePresence, useRef, duplicate aliased icons) — cleaned up to ~40 icons + 12 recharts primitives + 12 lootloom components
- Defined local `User` interface to avoid `ReturnType<typeof useUserStore>` unknown errors (UserState isn't exported from stores)
- Ran eslint: 0 errors, 0 warnings on new file
- Ran tsc --noEmit: 0 errors in gamification-view.tsx
- Verified dev server compiles successfully ("✓ Compiled in 3.4s")
- Did NOT modify any shared files; only created the one requested file

## Stage Summary
- `src/features/gamification/gamification-view.tsx` (~2150 lines) created with named export `GamificationView` and `"use client";` first line
- Serves THREE sidebar routes (referral / achievements / leaderboard) with route-aware header, focused-section highlight ring, and smooth scrollIntoView
- All 16 required sections built with placeholder data only (no backend, no calculations) — uses `useUserStore` for real level/xp/rank/streak/referralCode/username
- 8 reusable helper components defined in-file (AchievementCard, BadgeCard, ChallengeCard, MilestoneCard, LeaderboardRow, LeaderboardPodium, ReferralCard, ProgressWidget)
- 3 state components defined in-file (NoAchievementsEmpty, NoReferralsEmpty, LeaderboardUnavailableError)
- 5 recharts visualizations (LineChart × 2, AreaChart × 2, BarChart, PieChart) with electric/cyan/purple/emerald/gold gradient fills
- File passes ESLint (0 errors, 0 warnings) and TypeScript (0 errors); matches app-router lazy import contract `m.GamificationView`
- Premium white glassmorphism with framer-motion staggered reveals, floating animations, hover lifts, and gradient accents — no indigo/blue
