# Task 2-auth — Auth View Build Record

**Agent:** full-stack-developer
**Task ID:** 2-auth
**File created:** `/home/z/my-project/src/features/auth/auth-view.tsx`
**Export:** named `AuthView` (first line `"use client"`)

## Scope
Build all 10 LootLoom authentication screens in a single file, keyed off `useNavigationStore().current`. No shared files modified.

## Decisions
- Used exact premium input class specified: `h-12 rounded-xl glass-2 ring-1 ring-border px-4 text-sm focus:ring-electric/40 focus:ring-2 outline-none transition-all w-full`
- Split layout via `lg:grid-cols-2` inside `min-h-screen flex items-center`; LEFT preview `hidden lg:block`, RIGHT form `max-w-md`
- Top-left floating Logo button (clickable → home) lives in `AuthShell` wrapper, shared by all form-based screens (excludes `auth-loading` which is full-screen)
- `useSimulatedApi` hook centralizes local loading state (1200ms timeout)
- OTP input supports paste, arrow keys, backspace navigation; 6 boxes with focus-select
- PasswordStrengthMeter: 0–3 score (too short / weak / medium / strong) with colored bar
- SocialPlaceholders are intentionally disabled + grayscale (premium "coming soon" look) per spec
- AuthPreview uses `perspective-1000`, `floating` variant with 5 staggered widgets + mesh backdrop + aurora drift + headline overlay
- AuthLoading auto-redirects to dashboard after 2s via `useEffect` (cleanup-protected timeout)
- All animations drawn from `@/lib/animations`: `pageTransition`, `slideUp`, `scaleIn`, `floating`, `staggerContainer`, `modalPop`, `successCheck`

## Reusable components (in-file, not exported)
`AuthInput`, `PasswordInput`, `PasswordStrengthMeter`, `AuthHeader`, `Divider`, `SocialPlaceholders`, `PremiumCheckbox` (serves as TermsCheckbox + RememberMe), `AuthFooter`, `OtpInput`, `AuthShell`, `AuthPreview`.

## Navigation contract
- login → on submit: `useAuthStore.login()` then `navigate("dashboard")`
- register → on submit: `navigate("verify-email")`
- forgot-password → success state → `navigate("reset-password")`
- reset-password → on submit: `navigate("login")`
- verify-email → on submit: `navigate("verify-success")`
- verify-success → "Continue": `useAuthStore.login()` then `navigate("dashboard")`
- verify-failed → "Try Again": `navigate("verify-email")`
- auth-loading → auto `navigate("dashboard")` after 2s
- session-expired → "Sign In Again": `useAuthStore.logout()` then `navigate("login")`
- unauthorized → "Return Home": `navigate("home")`

## Lint status
- 0 errors in new file (verified via `bun run lint`)
- 3 pre-existing errors remain in `header.tsx` and `view-transition.tsx` from prior task (not in scope)

## Integration
`app-router.tsx` already lazy-imports: `lazy(() => import("@/features/auth/auth-view").then((m) => ({ default: m.AuthView })))` — contract satisfied.
