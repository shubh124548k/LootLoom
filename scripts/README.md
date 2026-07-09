# Scripts

Utility and build scripts for LootLoom.

## Available npm/bun scripts (defined in package.json)
- `bun run dev` — start Next.js dev server (port 3000)
- `bun run build` — production build
- `bun run start` — start production server
- `bun run lint` — ESLint (Next.js + TypeScript rules)
- `bun run db:push` — push Prisma schema to SQLite
- `bun run db:generate` — generate Prisma client
- `bun run db:migrate` — create + apply a Prisma migration
- `bun run db:reset` — reset the database

## Future scripts (when backend is extracted)
- `bun run backend:dev` — start Express backend
- `bun run backend:build` — build backend
- `bun run test` — run test suite
- `bun run test:e2e` — end-to-end tests
