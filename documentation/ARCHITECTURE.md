# LootLoom — Architecture Documentation

## Overview
LootLoom is a premium reward platform built as a **Next.js 16 single-route SPA**
with a Zustand-driven view state. The environment exposes only the `/` route;
all navigation is client-side via `useNavigationStore.navigate(viewId)`.

## Project Structure

```
lootloom/
├── src/                      # Frontend application (Next.js 16)
│   ├── app/                  # Next.js App Router (layout.tsx, page.tsx, globals.css)
│   ├── api/                  # API client barrel → src/services
│   ├── animations/           # Animation catalogue barrel → src/lib/animations
│   ├── assets/               # Asset manifest (images, icons, lottie, etc.)
│   ├── components/
│   │   ├── lootloom/         # LootLoom design system + app shell
│   │   └── ui/               # shadcn/ui primitives
│   ├── config/               # design-tokens, navigation config
│   ├── constants/            # Centralized constants
│   ├── contexts/             # Zustand stores barrel (context layer)
│   ├── features/             # Feature views (home, auth, dashboard, wallet, earn, rewards, pages)
│   ├── hooks/                # Custom hooks
│   ├── icons/                # Icon catalogue barrel
│   ├── layouts/              # Layout barrel (AppShell)
│   ├── lib/                  # utils, animations, db
│   ├── pages/                # Pages barrel (feature view re-exports)
│   ├── providers/            # AppProviders composition
│   ├── services/             # Service layer (future API client stubs)
│   ├── stores/               # Zustand stores (navigation, auth, user, ui, wallet, etc.)
│   ├── styles/               # Global styles barrel
│   ├── themes/               # Theme tokens (JS mirror)
│   ├── types/                # Shared TypeScript types
│   ├── utils/                # Centralized helper functions
│   └── widgets/              # Reusable widget barrel
├── shared/                   # Types + constants shared with future backend
├── backend/                  # Modular backend scaffold (documented)
│   └── src/{config,controllers,database,middlewares,models,repositories,
│           routes,schemas,security,services,types,utils,validators,jobs,logs,storage}
├── documentation/            # Architecture docs (this file)
├── scripts/                  # Build/dev/utility scripts
├── configuration/            # Centralized configuration files
├── public/                   # Static assets (logo.svg, robots.txt)
├── assets/                   # Root-level asset folder
├── prisma/                   # Prisma schema (SQLite)
├── .env.example              # Environment configuration template
└── worklog.md                # Cross-prompt work log
```

## Design System
- **Theme**: Premium White (electric blue / cyan / purple / navy / gold accents)
- **Glassmorphism**: 5 levels (1–4 + nav) via `.glass-1`…`.glass-nav` utilities
- **Tokens**: CSS custom properties in `globals.css` + JS mirror in `src/config/design-tokens.ts`
- **Animations**: 20+ framer-motion presets in `src/lib/animations.ts`
- **Background**: Aurora + mesh gradient + stars + shooting star + particles (`BackgroundEngine`)

## Application Shell
- **Sidebar**: floating glass left sidebar, 16 nav items, collapse + mobile drawer
- **Header**: minimal — search (Ctrl+K), wallet shortcut, notification center, theme controller, profile menu, breadcrumb
- **CEO Dashboard**: always visible with lock icon; normal users see `RestrictedAccess` screen

## State Management
- **Zustand** stores (`src/stores/`): navigation, auth, user, ui, wallet, notification, activity, appLifecycle
- Persisted (localStorage): auth, user, ui (sidebar collapse + theme)

## Routing
Single `/` route. `AppRouter` maps `ViewId` → feature view. Public/auth/system views are full-screen; authenticated app views render inside `AppShell`. Lazy-loaded via `React.lazy` for code splitting.

## Future Backend Integration
Service stubs in `src/services/` map 1:1 to future REST endpoints under `/api/v1`. Shared types in `shared/`. Backend modular scaffold documented in `backend/README.md`.

## Quality
- `bun run lint` passes with 0 errors
- TypeScript strict
- Responsive (mobile → ultra-wide)
- Accessible (semantic HTML, keyboard nav, ARIA, reduced motion)
