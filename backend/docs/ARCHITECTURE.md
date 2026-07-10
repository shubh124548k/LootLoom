# LootLoom Backend — Architecture

## Overview

The LootLoom backend is a **Python + Flask** REST API built with a clean,
layered architecture designed to scale from thousands to millions of users.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.11+ |
| Framework | Flask 3.1 |
| ORM | SQLAlchemy |
| Migrations | Alembic (Flask-Migrate) |
| Auth | JWT (PyJWT) + bcrypt |
| Validation | Pydantic schemas |
| Rate Limiting | Flask-Limiter |
| Logging | structlog (structured JSON) |
| Testing | pytest |
| Database | PostgreSQL (prod) / SQLite (dev/test) |

## Layered Architecture

```
Presentation Layer (Flask Blueprints / API routes)
        ↓
Controller Layer    (request handling, response shaping)
        ↓
Service Layer       (business rules, orchestration)
        ↓
Repository Layer    (data access, DB queries)
        ↓
Database Layer      (SQLAlchemy ORM, models)
```

### Responsibilities

| Layer | Responsibility | Rule |
|-------|---------------|------|
| **API / Presentation** | Route definitions, request parsing | No business logic |
| **Controller** | Orchestrate services, shape responses | No DB access |
| **Service** | Business rules, validation, transactions | No direct DB queries |
| **Repository** | CRUD operations, query building | No business logic |
| **Model** | Schema definition, relationships | No logic |

## Project Structure

```
backend/
├── app.py                      # Flask app factory (create_app)
├── wsgi.py                     # WSGI entry point
├── requirements.txt            # Pinned dependencies
├── .env.example                # Environment template
│
├── config/                     # Configuration
│   ├── __init__.py             # Config classes (Dev/Test/Prod)
│   └── settings.py             # Env-driven settings
│
├── core/                       # Cross-cutting foundation
│   ├── database.py             # SQLAlchemy db instance
│   ├── base_model.py           # UUID PK + timestamps mixin
│   ├── enums.py                # All domain enums
│   ├── exceptions.py           # Custom exception hierarchy
│   ├── responses.py            # Standardized API response helpers
│   └── logging.py              # Structured logging (structlog)
│
├── models/                     # SQLAlchemy ORM models (Prompt 27)
│   ├── user.py                 # User domain
│   ├── administrator.py        # CEO/Admin domain
│   ├── wallet.py               # Wallet domain
│   ├── transaction.py          # Transaction ledger
│   ├── reward.py               # Reward catalog
│   ├── redeem.py               # Redeem requests
│   ├── notification.py         # Notifications
│   ├── support.py              # Tickets + messages
│   ├── referral.py             # Referrals
│   ├── achievement.py          # Achievements + user achievements
│   ├── mission.py              # Missions
│   ├── leaderboard.py          # Leaderboard
│   ├── audit.py                # Audit logs
│   ├── security_event.py       # Security events
│   └── system.py               # System settings/flags/status
│
├── schemas/                    # Validation schemas (Pydantic)
│   ├── auth.py                 # Registration, login, reset
│   ├── user.py                 # Profile, settings
│   ├── wallet.py               # Wallet responses
│   └── common.py               # Pagination, shared fields
│
├── repositories/               # Data access layer
│   ├── base.py                 # Generic CRUD repository
│   ├── user_repository.py
│   ├── admin_repository.py
│   ├── wallet_repository.py
│   ├── transaction_repository.py
│   ├── session_repository.py
│   └── redeem_repository.py
│
├── services/                   # Business logic layer
│   ├── auth_service.py         # User auth (register, login, refresh)
│   ├── ceo_auth_service.py     # CEO auth (completely separate)
│   ├── jwt_service.py          # JWT encode/decode/rotate
│   ├── password_service.py     # bcrypt hashing + validation
│   ├── session_service.py      # Session lifecycle
│   ├── permission_service.py   # RBAC checks
│   ├── user_service.py         # Profile/settings management
│   ├── wallet_service.py       # Wallet engine + credit/debit
│   ├── ledger_service.py       # Immutable ledger recording
│   └── transaction_service.py  # History, search, filters
│
├── controllers/                # Request handlers
│   ├── auth_controller.py
│   ├── ceo_auth_controller.py
│   ├── user_controller.py
│   └── wallet_controller.py
│
├── api/v1/                     # API blueprints (routes)
│   ├── health.py               # /api/v1/health, /version
│   ├── auth.py                 # /api/v1/auth/*
│   ├── ceo_auth.py             # /api/v1/ceo/auth/*
│   ├── user.py                 # /api/v1/user/*
│   └── wallet.py               # /api/v1/wallet/*
│
├── security/                   # Security layer
│   ├── jwt_manager.py          # JWT claims + token creation
│   ├── decorators.py           # @require_auth, @require_ceo, @require_permission
│   └── rbac.py                 # Roles + permissions matrix
│
├── middlewares/                # Request middleware
│   ├── auth.py                 # JWT validation middleware
│   ├── error_handler.py        # Centralized error handling
│   ├── request_id.py           # Request/correlation ID
│   └── logging.py              # Request logging
│
├── migrations/                 # Alembic migrations
│   ├── env.py                  # Migration environment
│   ├── alembic.ini             # Alembic config
│   └── versions/               # Migration scripts
│
├── tests/                      # pytest test suite
│   ├── conftest.py             # Fixtures (app, client, db, auth)
│   ├── test_auth.py            # Auth tests
│   └── test_wallet.py          # Wallet engine tests
│
└── docs/                       # Documentation
    ├── API.md                  # API endpoint reference
    └── ARCHITECTURE.md         # This file
```

## Domain Model Relationships

```
User ──< Wallet ──< Transaction (ledger)
  │          └──> (1:1)
  ├──< RedeemRequest >── Reward
  ├──< Notification
  ├──< SupportTicket ──< TicketMessage
  ├──< UserAchievement >── Achievement
  ├──< Leaderboard
  ├──< Referral (as referrer)
  └──< Referral (as invited_user)

Administrator ──< AuditLog
     │         ──< RedeemRequest (as reviewer)
     │         ──< SupportTicket (as assigned)
     │         ──< SecurityEvent
     └──> (completely separate from User auth)
```

## Wallet Engine — Immutable Ledger Architecture

Every coin balance change **must** go through the WalletService, which:

1. Validates the operation (positive amount, sufficient balance, wallet active)
2. Reads the current balance
3. Computes the new balance
4. Creates an immutable ledger entry (Transaction with prev_balance + new_balance)
5. Updates the wallet balance
6. All within a single atomic database transaction (rollback on failure)

**Never** modify `wallet.current_balance` directly — always via `WalletService.credit_coins()` or `WalletService.debit_coins()`.

## Authentication Architecture

Two completely separate auth systems:

1. **User Auth** (`/api/v1/auth/*`) — JWT with `user_id` claim, `role: "user"`
2. **CEO Auth** (`/api/v1/ceo/auth/*`) — Separate JWT with `admin_id` claim, `role: "ceo"`

User tokens **cannot** access CEO routes (enforced by `@require_ceo` decorator).

## RBAC

| Role | Permissions |
|------|-------------|
| `user` | Own profile, wallet, rewards |
| `ceo` | Full platform access |
| `administrator` | (future) Most modules |
| `moderator` | (future) Users, support |
| `support` | (future) Tickets only |

## Running

```bash
# Development
export FLASK_ENV=development
flask --app wsgi.py run --port 5000

# Migrations
flask --app wsgi.py db init    # first time only
flask --app wsgi.py db migrate -m "initial"
flask --app wsgi.py db upgrade

# Tests
pytest tests/ -v
```
