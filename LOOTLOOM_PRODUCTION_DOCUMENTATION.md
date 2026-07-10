# LootLoom — Production Documentation

## 1. Architecture Overview

LootLoom is a premium reward platform built as a **Next.js 16 full-stack application** with a real-time socket.io service.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui |
| State | Zustand (client), NextAuth (session) |
| Backend | Next.js API Routes (App Router) |
| Database | SQLite via Prisma ORM (PostgreSQL-compatible schema) |
| Auth | NextAuth.js with Google OAuth 2.0 |
| Realtime | Socket.io (mini-service on port 3003) |
| Charts | Recharts |
| Animations | Framer Motion |

### Data Flow
```
User Action → API Route → Service Logic → Prisma ORM → Database
                                      ↓
                              Real-time Event → Socket.io → Frontend Store → UI
```

## 2. Database Schema

10 production models with relationships:
- **User** (googleId, name, email, avatar, role, status, lastLoginAt)
- **UserProfile** (phone, country, timezone)
- **Wallet** (coinBalance, totalEarned, totalSpent) — one per user
- **Transaction** (immutable ledger: type, amount, balanceBefore, balanceAfter, referenceId)
- **AdEvent** (network, adType, rewardAmount, status, verificationId)
- **Reward** (name, coinCost, category, stock, status)
- **RedeemRequest** (userId, rewardId, coinsUsed, status, paymentMethod)
- **Notification** (title, message, type, read)
- **SupportTicket + SupportMessage**
- **AuditLog** (actorId, action, targetId, metadata)

## 3. API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Platform statistics |
| GET | `/api/rewards` | Reward catalog |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| * | `/api/auth/*` | NextAuth (Google Sign-In) |

### User (authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | Current user profile |
| GET | `/api/dashboard` | Aggregated dashboard data |
| GET | `/api/wallet` | Wallet balance |
| GET | `/api/wallet/summary` | Wallet summary + charts |
| GET | `/api/wallet/transactions` | Transaction history (filters, pagination) |
| GET | `/api/transactions` | Transaction history (alias) |
| GET | `/api/notifications` | Notifications |
| PATCH | `/api/notifications` | Mark all read |
| GET | `/api/redeem/history` | Redeem history |
| POST | `/api/redeem` | Submit redeem request |
| POST | `/api/ads/session` | Create ad session |
| GET | `/api/ads/session` | Ad stats |
| POST | `/api/ads` | Complete ad (verify + credit) |
| GET | `/api/support` | Support tickets |
| POST | `/api/support` | Create ticket / reply |

### CEO (role: CEO required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ceo/dashboard` | CEO dashboard stats |
| GET | `/api/ceo/analytics` | Analytics (users, ads, coins, redeems) |
| GET | `/api/ceo/redeem` | All redeem requests |
| PATCH | `/api/ceo/redeem` | Approve/reject/complete redeem |
| POST | `/api/ceo/broadcast` | Send broadcast notification |
| GET | `/api/ceo/security` | Security dashboard (fraud, risk users) |
| GET | `/api/ceo/audit` | Audit logs |
| GET | `/api/ceo/monitoring` | System health monitoring |

## 4. Security

### Authentication
- Google OAuth 2.0 via NextAuth.js (no password storage)
- JWT session strategy with role claims
- Separate CEO auth (role check on all CEO endpoints)

### Wallet Security
- Immutable transaction ledger (balanceBefore + balanceAfter)
- All balance changes via atomic database transactions
- Backend is final authority (frontend cannot modify balance)

### Fraud Detection
- Ad session age check (min 5 seconds — prevents bot rapid completion)
- Ad velocity check (max 10 ads/minute)
- Daily ad limit (100/day)
- Duplicate reward prevention (session must be STARTED)
- User ownership check on all sessions

### Data Privacy
- Payment details masked in CEO view (last 4 chars only)
- User-scoped queries (no cross-user data leakage)
- CEO-only access to sensitive endpoints (role check + 403)

### Audit Logging
Every important action creates an AuditLog entry:
- User registration, login
- Ad reward credited
- Redeem requested, approved, rejected, completed
- CEO broadcast sent
- Wallet adjustments

## 5. Real-time System

### Socket.io Service
- Runs on port 3003 (mini-services/realtime-service)
- Users join room `user:{userId}` on connect
- Events: `wallet.updated`, `transaction.created`, `notification.created`, `redeem.updated`, `support.reply`
- CEO events: `ceo:new.user`, `ceo:redeem.created`, `ceo:support.created`, `ceo:security.alert`

### Frontend Integration
- `useRealtimeSync` hook connects via `io("/?XTransformPort=3003")`
- Auto-reconnect on disconnect
- Events update Zustand stores (wallet, notifications, activity)
- No manual refresh required

## 6. Deployment

### Prerequisites
- Node.js 18+ / Bun
- SQLite (dev) or PostgreSQL (prod)
- Google OAuth credentials

### Environment Variables
```
DATABASE_URL=file:./db/custom.db
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
SOCKET_PORT=3003
```

### Build & Deploy
```bash
# Install dependencies
bun install

# Push database schema
bun run db:push

# Seed rewards
bun run src/scripts/seed-rewards.ts

# Start real-time service
cd mini-services/realtime-service && bun install && bun run dev &

# Build frontend
bun run build

# Start production server
bun run start
```

## 7. Backup Strategy

### Database Backup
```bash
# Daily backup (SQLite)
cp db/custom.db backups/custom-$(date +%Y%m%d).db

# Restore
cp backups/custom-20250110.db db/custom.db
```

### Migration to PostgreSQL (production)
1. Update `DATABASE_URL` in `.env`
2. Change Prisma provider to `postgresql`
3. Run `bun run db:push`
4. Migrate data from SQLite

## 8. Maintenance

### Regular Tasks
- Monitor audit logs for suspicious activity
- Review pending redeem requests (CEO dashboard)
- Check system monitoring (`/api/ceo/monitoring`)
- Backup database daily
- Review fraud indicators (security dashboard)

### Performance Optimization
- Database indexes on: email, username, userId, createdAt, status, type
- API pagination on all list endpoints (max 100 per page)
- Lazy-loaded feature views (code splitting)
- Real-time updates reduce polling overhead

## 9. Testing

### User Flow
1. Login with Google → Dashboard (0 coins)
2. Watch ad → Coins credited → Notification appears
3. Open rewards → Select reward → Redeem
4. CEO approves → User receives notification → History updates

### CEO Flow
1. CEO login → Dashboard (real stats)
2. View pending redeems → Approve/reject
3. Send broadcast notification
4. View analytics → Security dashboard
5. Monitor system health

## 10. Production Readiness

| Area | Status | Notes |
|------|--------|-------|
| Frontend | ✅ Production-ready | Premium UI, responsive, accessible |
| Backend | ✅ Production-ready | Real APIs, validation, error handling |
| Database | ✅ Production-ready | 10 models, indexes, ledger architecture |
| Authentication | ✅ Google OAuth | NextAuth.js with JWT sessions |
| Real-time | ✅ Socket.io | Live updates for wallet/notifications |
| Security | ✅ Hardened | Fraud detection, audit logs, role-based access |
| Analytics | ✅ Real data | CEO analytics with DB aggregations |
| PWA | ✅ Manifest | Installable web app |
| Monitoring | ✅ Health checks | System monitoring API |
| Documentation | ✅ Complete | This document |

### Remaining for Launch
1. **Google OAuth credentials**: Configure in `.env`
2. **PostgreSQL**: Migrate from SQLite for production scale
3. **Ad SDK integration**: Connect real ad providers (Unity, Yandex, AppLovin)
4. **Push notifications**: Configure web push (FCM)
5. **CI/CD**: Set up GitHub Actions pipeline
