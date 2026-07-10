# Task 13-profile — LootLoom Profile & Account Center

## Agent
full-stack-developer

## Task
Build the LootLoom Profile & Account Center (`/home/z/my-project/src/features/profile/profile-view.tsx`) — a complete personal account management hub with 14 sections, premium WHITE glassmorphism, store-driven profile data, placeholder forms/toggles, and confirmation dialogs for danger-zone actions. No backend, no saving, no auth logic — editable placeholders only.

## Work Log
- Read `/home/z/my-project/worklog.md` to understand the LootLoom architecture (Next.js 16 single-route SPA, premium WHITE glassmorphism, Zustand stores, lootloom component library, framer-motion + lucide-react, lazy-loaded feature views).
- Inspected infrastructure contracts in `/home/z/my-project/src/components/lootloom/`:
  - `page-container.tsx` — `PageContainer`, `PageHeader`, `SectionHeader`, `Grid` (cols 1/2/3/4/auto/dashboard/analytics/ceo/wallet/reward)
  - `widget-card.tsx` — `WidgetCard` (title/description/icon/action/footer/level/hover/glow/index)
  - `glass-card.tsx` — `GlassCard` (levels 1-4 + nav, hover/sheen/reflect/glow)
  - `loot-button.tsx` — `LootButton` (10 variants × 4 sizes, leftIcon/rightIcon/loading/fullWidth)
  - `icon-badge.tsx` — `IconBadge` (string name + 7 accents + sm/md/lg)
  - `progress-ring.tsx` — `ProgressRing` (electric/cyan/purple/gold/emerald gradients, custom label)
  - `animated-counter.tsx` — `AnimatedCounter` (prefix/suffix/decimals/separator)
  - `stat-card.tsx` — `StatCard` (label/value/icon/accent/trend/index)
  - `status-badge.tsx` — `StatusBadge` (9 variants + dot + pulse)
  - `states.tsx` — `EmptyState`, `ErrorState`, `SkeletonRow`, `SkeletonCard`
- Verified store APIs in `/home/z/my-project/src/stores/index.ts`:
  - `useNavigationStore.navigate(view: ViewId)`
  - `useUserStore`: fullName, username, email, memberSince, level, xp, xpToNext, rank, dailyStreak, referralCode, avatarUrl, setUser
  - `useWalletStore`: availableCoins, lifetimeEarned, lifetimeRedeemed, todayEarnings
  - `useUIStore`: theme, setTheme, toggleTheme, sidebarCollapsed, setSidebarCollapsed, toggleSidebar
- Verified ui primitives: `@/components/ui/switch` (Switch), `@/components/ui/input` (Input), `@/components/ui/dialog` (Dialog/DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter), `@/hooks/use-toast` (toast)
- Confirmed `AppRouter` lazy-imports `ProfileView` via `m.ProfileView` — existing route contract on `current === "profile"`.
- Created `/home/z/my-project/src/features/profile/profile-view.tsx` (single new file, `"use client";` first line, named export `ProfileView`).
- Built reusable helper components in-file:
  - `SettingRow` — labelled row with trailing control (icon + label + description + locked indicator + accent text)
  - `ToggleCard` — compact glass card with `Switch` (icon + label + description + accent ring + locked state)
  - `ConfirmDialog` — warning-style `Dialog` (icon, title, description, confirm/cancel, danger/warning variants)
  - `BadgeCard` — badge grid tile (rarity ring/text/bg, `ProgressRing` or unlocked checkmark, progress bar)
  - `DeviceCard` — device row (icon, current/trusted/locked badges, sign-out action)
  - `ConnectedAccountCard` — OAuth placeholder row (icon, name, description, connect/disconnect/locked)
  - `Field` — labelled form input wrapper with icon
  - `SelectField` — segmented selector (Low/Medium/High/Ultra etc.)
  - Local SVG icon helpers (`Edit`, `Plus`, `AtSign`, `Search`, `Accessibility`, `LifeBuoy`, `Settings`, `ShoppingBagIcon`, `SendIcon`, `XIcon`, `LogInIcon`) with optional `size`/`className` props
  - `showToast()` wrapper around `toast()` for placeholder action feedback
  - `getInitials()` helper for avatar initials
- Built all 14 required sections inside `PageContainer` + `PageHeader` (title "Profile & Account", description, actions: Settings glass button + Edit Profile electric button that scrolls to `#personal-information`):
  1. **ProfileOverview** — gradient cover banner with floating decorative shapes, large gradient initials avatar (size-28) with camera upload button, full name + Active/Verified badges, username/email/phone/memberSince inline meta, quick actions (Share / Edit), 4 stat tiles (Level+ProgressRing, Coins+AnimatedCounter, Rank, Streak) — pulls real store data
  2. **PersonalInformation** — `WidgetCard` with profile photo row + 10-input form grid (Full Name, Display Name, Username, Email, Phone, DOB, Country, Language, Timezone, Website), Bio textarea with character counter, 4 social link placeholder inputs; "Save Changes" `LootButton` calls `setUser` + toast (non-functional save)
  3. **AccountSecurity** — `WidgetCard` with Security Score `ProgressRing` (emerald, 72%), 8 setting rows (Password Strong, Email Verified, Phone Pending, 2FA toggle, Biometric locked, Trusted Devices locked, Login History skeleton, Recovery Codes locked) using `StatusBadge` + `Switch` + Lock indicators
  4. **PrivacyCenter** — `WidgetCard` with 7 `ToggleCard`s (Profile/Activity/Leaderboard/Referral visibility + locked Data Sharing/Public Profile/Search Visibility)
  5. **AppearanceSettings** — `WidgetCard` wired to `useUIStore`: Theme toggle (Light/Dark via `setTheme`), 6 accent color swatches, Sidebar Mode toggle (Expanded/Collapsed via `setSidebarCollapsed`), Glass Intensity + Font Size segmented selectors, 5 `ToggleCard`s (Animations, Reduced Motion, Compact Mode, High Contrast locked, Accessibility Theme locked)
  6. **NotificationPreferences** — `WidgetCard` with 11 `ToggleCard`s (Reward, Wallet, Redeem, Referral, Achievement, Security, Support, Announcements, Email, Push locked, SMS locked) + Enable all action
  7. **ConnectedAccounts** — `WidgetCard` with 7 `ConnectedAccountCard`s (Google connected, Apple locked, Facebook, GitHub, Discord connected, Telegram locked, Twitter/X locked) — no OAuth implemented, Connect buttons show toast
  8. **AccountStatistics** — `WidgetCard` with `Grid cols={4}` of 8 `StatCard`s (Lifetime Earnings/Redeems, Referral Count, Achievements, Missions Completed, Leaderboard Rank, Daily Streak, Current Level) + 3 wallet summary glass tiles using `AnimatedCounter`
  9. **BadgeCollection** — `WidgetCard` with animated badge grid (`staggerContainer` + `cardReveal`), 10 badges across all rarities (common=gray, rare=electric, epic=purple, legendary=gold, special=emerald, vip=rose with lock), unlocked checkmark, progress bar for in-progress badges, Show all/Show less toggle, View all → achievements
  10. **ActivitySummary** — `WidgetCard` with vertical timeline (gradient line + electric dots), 5 placeholder event cards + skeleton row for future Device Activity, Full history → history view
  11. **DeviceManagement** — `WidgetCard` with current device highlighted (electric ring + Active badge), 3 other devices (smartphone/laptop/tablet icons), Trusted Devices + Session Management placeholder cards (locked), Logout all action
  12. **DownloadData** — `WidgetCard` with 5 placeholder export cards (Profile, Wallet, History, Rewards, GDPR) each with disabled Export button + format badge
  13. **DangerZone** — `WidgetCard` with rose/red accent, 5 warning cards (Change Password, Logout All, Account Recovery, Deactivate, Delete) each opening a `ConfirmDialog` with appropriate icon/description/variant; `AnimatePresence` wraps dialog
  14. **StatesPreview** — collapsible `WidgetCard` showcasing `NoBadgesEmpty` and `ProfileUnavailableError` defined in-file
- Added `QuickNavRow` chips (Settings, Wallet, Rewards, Achievements, Support) between hero and Personal Information for quick cross-view navigation.
- All toggles use `Switch` with local `useState`; all toasts use `showToast()` wrapper; all navigations via `useNavigationStore.navigate()`.
- Premium white glass theme: `GlassCard` levels 1-3, electric/cyan/purple/gold/emerald/rose/navy accents, card-sheen on hero, floating motion on banner decorations, `staggerContainer` for section orchestration, `cardReveal` for individual cards, `hoverLift` on interactive tiles.
- Responsive throughout: mobile single-column → `sm:2-col` → `lg:3-4-col` grids; avatar scales 24→28 across breakpoints; form grid uses `md:grid-cols-2`; stat tiles use `grid-cols-2 lg:grid-cols-4`.
- Accessibility: `aria-label`s on switches/buttons, semantic headings, `sr-only` close text in `Dialog`, focus-visible rings on `LootButton`, disabled states with reduced opacity, icon-only buttons have `aria-label`.
- Verified: `npx eslint src/features/profile/profile-view.tsx` passes with **0 errors 0 warnings**; `npx tsc --noEmit` shows **no profile-related errors** (pre-existing errors are for missing sibling feature views owned by other agents — system/transactions/notifications/gamification/support/legal/ceo, out of scope).
- Did NOT modify any shared files; only created `/home/z/my-project/src/features/profile/profile-view.tsx`.

## Stage Summary
- `src/features/profile/profile-view.tsx` created (~2590 lines) with named export `ProfileView` and `"use client";` first line.
- All 14 required sections built with placeholder forms/toggles, store-driven profile data, glass badges, animated counters, `ProgressRing`s, `ConfirmDialog`s.
- Reusable helpers (`SettingRow`, `ToggleCard`, `ConfirmDialog`, `BadgeCard`, `DeviceCard`, `ConnectedAccountCard`, `Field`, `SelectField`) + local SVG icon helpers defined in-file per spec.
- `NoBadgesEmpty` and `ProfileUnavailableError` state components defined and demoed in collapsible States Preview section.
- No backend, no save logic, no OAuth, no real exports — all marked as future/placeholder via `Lock` icons, disabled buttons, and `showToast()` notifications.
- File passes ESLint (0 errors) and TypeScript (0 errors); already wired into `app-router.tsx` via existing lazy import `m.ProfileView`.
- Ready for integration with downstream feature views and backend.
