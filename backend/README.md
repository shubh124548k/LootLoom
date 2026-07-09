# LootLoom — Backend Architecture (Scaffold)

This folder documents the **production-ready backend modular architecture**
specified by LootLoom Prompt 1. In the current environment the application
runs as a single **Next.js 16** app (App Router), so business logic will be
implemented as Next.js Route Handlers under `src/app/api/`. This scaffold
defines the **target modular structure** for when the backend is extracted
into a standalone Node.js/Express service, and keeps the architecture
documented so future prompts can drop implementations in without redesign.

## Module Responsibilities

| Folder | Responsibility |
|--------|---------------|
| `src/config/` | Environment, database, security, app configuration loaders |
| `src/controllers/` | HTTP request handlers — receive req, call services, return responses |
| `src/database/` | Database connection, migrations, seeders, schema |
| `src/middlewares/` | Auth, rate-limit, CORS, error-handling, logging, validation middleware |
| `src/models/` | Data models / ORM entities (User, Wallet, Transaction, Reward, RedeemRequest) |
| `src/repositories/` | Data-access layer — encapsulates all DB queries (clean architecture) |
| `src/routes/` | Express route definitions per resource, mounted under `/api/v1` |
| `src/schemas/` | Zod / Joi request/response validation schemas |
| `src/security/` | JWT, hashing, encryption, CEO guards, anti-fraud primitives |
| `src/services/` | Business logic — orchestrates repositories, application rules |
| `src/types/` | Shared backend TypeScript types |
| `src/utils/` | Backend utility helpers (logger, formatters, id generators) |
| `src/validators/` | Custom domain validators (email, password, coin, redeem eligibility) |
| `src/jobs/` | Background jobs / cron (daily bonus reset, streak calc, payout processing) |
| `src/logs/` | Rotating log output destination |
| `src/storage/` | File/object storage adapters (local, S3) for receipts, assets |

## API Versioning

All routes mount under `/api/v1`. Versioned route files live in `src/routes/v1/`.
A `x-api-version` header is supported for explicit version negotiation.

## Response Envelope

Every endpoint returns a standardized envelope (see `shared/types/index.ts`):

```ts
{
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}
```

## Current Status

- ✅ Folder structure scaffolded
- ✅ Shared types/constants defined (`shared/`)
- ⏳ Controllers/services/repositories: prepared for future prompts
- 🔄 In the interim, Next.js Route Handlers under `src/app/api/` serve the same role
