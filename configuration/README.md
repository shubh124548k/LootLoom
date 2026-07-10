# Configuration

This folder holds centralized configuration reference files for LootLoom.

- `.env.example` (project root) — environment variable template (development / production / testing)
- `src/config/design-tokens.ts` — design token JS mirror
- `src/config/navigation.ts` — navigation + page metadata
- `src/constants/index.ts` — centralized constants
- `src/themes/index.ts` — theme palette
- `backend/src/config/` — backend configuration (scaffold)

## Environment Setup
```bash
cp .env.example .env          # development
cp .env.example .env.production
cp .env.example .env.testing
```

Never hardcode secrets. All secrets live in environment files (git-ignored).
