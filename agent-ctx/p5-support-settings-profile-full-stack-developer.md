# Agent Context — p5-support-settings-profile

**Task ID:** p5-support-settings-profile
**Agent:** full-stack-developer
**Date:** Current session

## Task
Rewrite three LootLoom feature views to simplify them to their core required structure:
1. `src/features/support/support-view.tsx` → SupportView
2. `src/features/pages/pages-view.tsx` → PagesView (settings + profile only)
3. `src/features/profile/profile-view.tsx` → ProfileView

## Constraints honored
- Did NOT redesign UI — kept premium glass cards, animations, gradients
- Did NOT change colors, fonts, spacing
- Did NOT remove animations
- Only simplified each page to the required structure
- All values placeholder-ready for API (no hardcoded fake numbers)
- Reused existing components from `@/components/lootloom`
- Used framer-motion `staggerContainer`, `cardReveal`
- Used `@/stores` for state (useNavigationStore, useUserStore, useWalletStore)
- Each file starts with `"use client";`
- Used `@/components/ui` Input, Textarea, Switch
- Used lucide-react for icons

## What was kept (per spec)
- Support: PageHeader + Create Ticket form (Subject/Message/Submit + disabled Attachment placeholder) + My Tickets list (Ticket ID/Subject/Status badge/Created/Updated/Last Reply) + Ticket Chat view (user right bubbles, admin left bubbles); 5 statuses (Open/Pending/Answered/Resolved/Closed); empty + loading states; placeholder 0 tickets
- Settings: PageHeader + Profile Section (read-only: Avatar/FullName/Username/Email/Phone/Bio/MemberSince) + Edit Profile form (FullName/Username/Bio/Phone + Save/Cancel + loading + username availability check UI with loading/success/error states) + Security Section (Change Password form + 5 coming-soon cards: Email/Phone Verification, 2FA, Active Sessions, Login History) + Privacy Section (4 Switch toggles: Account Visibility/Data Preferences/Notification Preferences/Privacy Controls)
- Profile: PageHeader + Profile card (Avatar/FullName/Username/Email/MemberSince/Active status badge) + Quick Stats (Current Coins/Total Earned/Total Spent from useWalletStore) + Edit Profile button (navigates to settings); empty + loading states

## What was removed
- Support: fake ticket statistics, fake response times, fake support analytics, FAQ cards/accordion, help widgets, categories, priority badges, dummy conversations, placeholder tickets, community guidelines, security help, contact center, report center, feedback center, broadcast preview, recharts, dialogs, selects
- Pages: daily-bonus, missions, notifications, achievements, leaderboard, referral, transactions, history, support page handlers; fake security score, fake devices, fake sessions, fake verification badges, fake account statistics, fake achievements, fake leaderboard, fake daily bonus, fake missions, fake referral tiers, fake FAQs
- Profile: fake badges, fake achievements, fake activity timeline, fake devices, fake connected accounts, fake danger zone, fake download data, fake security info, fake privacy center, fake appearance settings, fake notification preferences, dialogs, accordions, tabs

## Verification
- `bun run lint` → exit code 0, 0 errors, 0 warnings
- Dev server hot-reloaded successfully (see "✓ Compiled" entries in dev.log)

## Files modified
- `/home/z/my-project/src/features/support/support-view.tsx` (~2786 → ~420 lines)
- `/home/z/my-project/src/features/pages/pages-view.tsx` (~1992 → ~960 lines)
- `/home/z/my-project/src/features/profile/profile-view.tsx` (~2000+ → ~290 lines)

## Exports
- `export function SupportView()` — named export
- `export function PagesView()` — named export (dispatches settings + profile)
- `export function ProfileView()` — named export

## Reusable patterns established for future agents
- `Ticket` interface with `messages: ChatMessage[]` — backend should populate ticket + conversation thread
- `TicketStatus` union (open/pending/answered/resolved/closed) + `STATUS_META` map (label/variant/icon/accent) — backend sends status string, UI maps to badge
- `ChatMessage` interface with `role: "user" | "admin"` — user bubbles render on right (gradient), admin on left (glass)
- `useUsernameCheck(username)` hook — frontend-only availability check (idle/invalid/checking/available/taken); uses RESERVED_USERNAMES set; derived synchronous state for idle/invalid/checking, async setState (in setTimeout only) for available/taken — avoids react-hooks/set-state-in-effect lint error
- `ComingSoonCard` component — disabled future-ready card with "Coming soon" badge for not-yet-implemented security features
- `PrivacyToggle` component — label + description + Switch row for privacy preferences
- `ProfileAvatar` helper — image URL or initials in gradient circle (electric→cyan→purple gradient)
- `FieldRow` helper — read-only icon + label + value display row for profile info
- `QuickStat` helper — IconBadge + label + AnimatedCounter card for wallet stats
- Store field gaps: useUserStore currently lacks `username`, `phone`, `bio` — UI shows "—" placeholder until backend populates (or store schema extended)

## Lint notes for future agents
- `@next/next/no-img-element` rule is NOT triggering in this project — do NOT add `// eslint-disable-next-line @next/next/no-img-element` above `<img>` tags (it produces an "unused eslint-disable directive" warning)
- `react-hooks/set-state-in-effect` rule IS active — never call `setState()` synchronously in a useEffect body. Derive synchronous state inline, and only call setState from within async callbacks (setTimeout, event listeners, promises)
