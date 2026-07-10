# Task 16-legal — LootLoom Public Information System & Legal Center

**Agent:** full-stack-developer
**Task:** Build LootLoom Public Information System & Legal Center (single file `src/features/legal/legal-view.tsx`)

## Work Log

- Read `/home/z/my-project/worklog.md` to understand architecture (Next.js 16 single-route SPA, Premium White theme, glassmorphism, lootloom component library, Zustand navigation store, framer-motion animation presets, lazy-loaded feature views).
- Inspected lootloom component APIs: `GlassCard` (level 1-4 + nav, hover/sheen/reflect/glow), `LootButton` (10 variants × 4 sizes), `Logo`, `IconBadge` (accent + dynamic lucide name lookup), `AnimatedCounter`, `ProgressRing`, `StatusBadge` (success/warning/error/info/gold/electric/purple/cyan), `page-container` helpers, `states`.
- Inspected `useNavigationStore` (current/navigate), `useScroll`/`useSpring` from framer-motion, and the shadcn `Accordion` from `@/components/ui/accordion`.
- Confirmed `LEGAL_VIEWS` set in `src/config/navigation.ts` includes all 19 target ViewIds; `app-router.tsx` lazy-imports `@/features/legal/legal-view` → `m.LegalView` and renders it full-screen (no AppShell).
- Verified all lucide icons used exist in the installed lucide-react version (PlayCircle did not — swapped to `Play`; verified Send, Briefcase, Scale, Megaphone, Workflow, Gauge, GitBranch, etc.).
- Created `/home/z/my-project/src/features/legal/legal-view.tsx` (single new file, named export `LegalView`, `"use client";` first line, ~2740 lines). No shared files modified.

### Reusable components defined in-file (per spec)

- `ScrollProgress` — top progress bar using `useScroll` + `useSpring`, fixed z-[60], electric→cyan→purple gradient.
- `BackToTop` — floating bottom-right glass button with AnimatePresence; appears when `window.scrollY > 600`.
- `LegalTopBar` — sticky floating `GlassCard level="nav"` with Logo (→ home), "Home" (ghost), "Sign In" (glass → login), "Get Started" (electric → register).
- `PolicyBadge` — accent-colored pill (7 accents) with optional icon.
- `SectionCard` — premium glass section with id (for TOC anchor), IconBadge, title, optional description, optional badge, body, optional footer. Uses `cardReveal` whileInView.
- `LegalHeader` — premium hero GlassCard with floating decorative blobs, breadcrumb (Home > Public Information > Current), large icon badge + StatusBadge eyebrow, gradient-friendly title, description, "Living document" + "Content under active development" PolicyBadges.
- `WarningCard` — rose/gold accent warning card for "draft" notices on policy pages.
- `InformationCard` — compact glass info tile with locked state for future items.
- `LegalTimeline` — vertical timeline with gradient rail + numbered accent-colored dots.
- `TocNav` — sticky desktop sidebar (260px column, `top-24`) AND mobile collapsible (lg:hidden) using IntersectionObserver scrollspy; numbered pills, active highlight with ring, ChevronRight indicator, Back-to-Home + Get-Started shortcuts on desktop sidebar.
- `LegalFooter` — premium footer GlassCard with related-pages quick links, Get Started / Sign In CTAs, Back-to-Home button, "Living document" notice.
- `LegalLayout` — composes ScrollProgress + LegalTopBar + LegalHeader + TocNav + content + LegalFooter + BackToTop. Two-column grid `lg:grid-cols-[260px_minmax(0,1fr)]`.
- `PageSections` — helper that maps `SectionDef[]` to `SectionCard` list.

### Page content renderers (one per ViewId, dispatched via switch in `LegalView`)

1. **about** — 7 SectionCards (Vision, Mission, Philosophy, User-First, Security, Roadmap, Technology) + CTA. Honest placeholder copy.
2. **features-overview** — 5 category sections (Core, Wallet & Rewards, Social, Support, Future) each as a SectionCard containing an `InformationCard` grid; Future features marked with `locked` and PolicyBadge "Future".
3. **how-it-works** — overview SectionCard + 8-step `LegalTimeline` (Register → Login → Dashboard → Earn → Wallet Updated → Redeem → Review → Completed) + CTA.
4. **help-center** — 6 knowledge `SectionCard`s in a 2-col grid, each with article list (Read more affordance, "Article content pending." note) + "Need more help?" CTA → contact/faq-public.
5. **contact** — 9 `InformationCard`s in 3-col grid (Support Email/Portal/Help Center/FAQ + Live Chat/Discord/Telegram/Phone/Business); future channels marked locked with "Coming soon" copy; CTA → register/faq-public.
6. **faq-public** — 10 category pills (Account/Wallet/Rewards/Redeem/Security/Referral/Leaderboard/Notifications/Support/General); selected category renders shadcn `Accordion` with placeholder Q&A; "Content pending." answers honestly labeled.
7. **privacy** — 10 SectionCards (Collection, Account, Usage, Cookies, Analytics, Security, Retention, Rights, Children, Contact) + gold WarningCard "draft" notice.
8. **terms** — 10 SectionCards (Account, Usage, Rewards, Redeem, Conduct, IP, Termination, Liability, Payments, Disputes) + WarningCard.
9. **cookies** — 5 SectionCards (Necessary, Functional, Analytics, Preferences, Advertising) + cross-link CTA to Privacy/Terms.
10. **community-guidelines** — 8 rule `SectionCard`s in 2-col grid with "Rule N" badges.
11. **security-policy** — 9 SectionCards (Account, Password, Browsing, Scam, 2FA-future, Device-future, Reporting, Timeline, Status); Security Timeline uses nested `LegalTimeline` with 4 entries.
12. **disclaimer** — 6 SectionCards + WarningCard.
13. **copyright** — 6 SectionCards (Ownership, License, Trademarks, User Content, Infringement, Contact).
14. **dmca** — 5 SectionCards + WarningCard.
15. **refund** — 6 SectionCards + WarningCard.
16. **status-page** — overview SectionCard with "All systems nominal" + display-only notice + 8 status cards in 2-col grid with `StatusBadge` (operational=success, maintenance=warning, issue=error) + CTA.
17. **changelog** — Latest Version SectionCard with version/date/tag PolicyBadges + 2 version cards (v0.1.0 + Future roadmap) each with 4 categorized lists (New Features/Bug Fixes/Security/Performance or Future Releases).
18. **whats-new** — 4 sections (Latest Updates, Upcoming, Recently Improved, Roadmap) each as a SectionCard with an `InformationCard` grid; upcoming items marked locked.
19. **platform-updates** — 4 announcement cards in 2-col grid with tag/date/StatusBadge + CTA to changelog/status-page.

### Main `LegalView` component

- Reads `useNavigationStore().current`, looks up `LEGAL_PAGES[current]` for meta (title/description/icon/accent/eyebrow/TOC items).
- `useEffect` resets window scroll on view change.
- Wraps content in `LegalLayout` with `AnimatePresence mode="wait"` keyed on `current` for premium page transitions.
- `renderPageContent(view)` switch dispatches to per-page content component.
- Returns `null` if meta is missing (defensive — AppRouter only renders LegalView for known LEGAL_VIEWS).

### Honest-content rule (per spec)

- All placeholder copy uses phrasing like "This section will outline…", "Content pending.", "Details to be finalized.", "Living document — content under active development."
- No claims of unimplemented services (no fake support email, no fake phone number, no fake analytics cookies, no fake payment functionality).
- Future channels/features consistently marked with Lock icon + "Future" / "Coming soon" PolicyBadge.
- Status page values explicitly labeled "Display only — real monitoring to be wired in."
- Changelog version numbers/dates explicitly labeled "placeholders — the first public release has not shipped yet."

### Verification

- `npx eslint src/features/legal/legal-view.tsx` → 0 errors, 0 warnings.
- `npx tsc --noEmit` → no legal-view-related errors.
- Dev server compiles successfully (✓ Compiled in 3.4s); the only dev.log error is a pre-existing `@/features/system/system-view` Module not found from another agent's incomplete work — unrelated to this task.
- Did NOT modify any shared files; only created `src/features/legal/legal-view.tsx`.

## Stage Summary

- `src/features/legal/legal-view.tsx` created — named export `LegalView`, `"use client";` first line, ~2740 lines.
- Premium WHITE glassmorphism legal/info center; does NOT look like ordinary legal docs.
- 11 reusable components defined in-file: `LegalLayout`, `SectionCard`, `LegalHeader`, `WarningCard`, `InformationCard`, `LegalTimeline`, `PolicyBadge`, `TocNav`, `ScrollProgress`, `BackToTop`, `LegalTopBar` (+ bonus `Breadcrumb`, `LegalFooter`, `PageSections`, `LucideByName`).
- All 19 ViewIds served (about, features-overview, how-it-works, help-center, contact, faq-public, privacy, terms, cookies, community-guidelines, security-policy, disclaimer, copyright, dmca, refund, status-page, changelog, whats-new, platform-updates).
- Two-column layout (sticky TOC + content) on desktop; collapsible TOC menu on mobile; scroll progress top bar; floating Back-to-Top; IntersectionObserver scrollspy; per-section `whileInView` cardReveal animations.
- Top bar with Logo (→ home) + Home + Sign In (→ login) + Get Started (→ register).
- Honest placeholder content throughout — no misleading legal claims, no unimplemented functionality advertised as live.
- File passes ESLint and TypeScript cleanly. Ready for integration with the existing `app-router.tsx` lazy import (`m.LegalView`).
