# LootLoom Backend — API Reference

## Base URL
```
/api/v1
```

## Authentication
All authenticated endpoints require a Bearer JWT in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

## Standard Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed",
  "error": null,
  "timestamp": "2025-01-10T12:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Invalid credentials",
  "error": "INVALID_CREDENTIALS",
  "timestamp": "2025-01-10T12:00:00Z"
}
```

---

## Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/health` | Service health check | No |
| GET | `/api/v1/version` | API version info | No |

---

## Authentication (Prompt 28)

### User Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register a new user | No |
| POST | `/api/v1/auth/login` | User login (returns access + refresh tokens) | No |
| POST | `/api/v1/auth/logout` | Logout (revokes session) | Yes |
| POST | `/api/v1/auth/refresh` | Refresh access token | No (refresh token in body) |
| GET | `/api/v1/auth/me` | Current authenticated user | Yes |
| POST | `/api/v1/auth/forgot-password` | Request password reset (architecture only) | No |
| POST | `/api/v1/auth/reset-password` | Reset password with token | No |
| POST | `/api/v1/auth/verify-email` | Verify email with code | No |
| POST | `/api/v1/auth/resend-verification` | Resend verification email | No |

### CEO Auth (completely separate)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/ceo/auth/login` | CEO login | No |
| POST | `/api/v1/ceo/auth/logout` | CEO logout | CEO |
| POST | `/api/v1/ceo/auth/refresh` | CEO refresh token | No (refresh in body) |
| GET | `/api/v1/ceo/auth/me` | Current CEO session | CEO |

### Request Schemas

#### POST /api/v1/auth/register
```json
{
  "username": "string (3-30, alphanumeric)",
  "email": "string (valid email)",
  "password": "string (min 6, complexity recommended)"
}
```

#### POST /api/v1/auth/login
```json
{
  "identifier": "string (email or username)",
  "password": "string"
}
```

### Response (login)
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": { "id": "uuid", "username": "...", "email": "..." }
  }
}
```

---

## User Profile & Account (Prompt 29)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/user/profile` | Retrieve current user profile | Yes |
| PUT | `/api/v1/user/profile` | Update profile | Yes |
| GET | `/api/v1/user/profile/public/<username>` | Public profile | No |
| GET | `/api/v1/user/settings` | Retrieve settings | Yes |
| PUT | `/api/v1/user/settings` | Update settings | Yes |
| GET | `/api/v1/user/security` | Security info | Yes |
| PUT | `/api/v1/user/password` | Change password | Yes |
| GET | `/api/v1/user/sessions` | Active sessions | Yes |
| DELETE | `/api/v1/user/sessions/current` | Logout current session | Yes |
| DELETE | `/api/v1/user/sessions/all` | Logout all sessions | Yes |
| GET | `/api/v1/user/preferences` | Retrieve preferences | Yes |
| PUT | `/api/v1/user/preferences` | Update preferences | Yes |
| GET | `/api/v1/user/status` | Account status | Yes |

### PUT /api/v1/user/profile
```json
{
  "display_name": "string (optional)",
  "bio": "string (optional, max 500)",
  "country": "string (optional)",
  "language": "string (optional)",
  "timezone": "string (optional)",
  "date_of_birth": "YYYY-MM-DD (optional)"
}
```

### PUT /api/v1/user/password
```json
{
  "current_password": "string",
  "new_password": "string (min 6)"
}
```

---

## Wallet Engine (Prompt 30)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/wallet` | Current user's wallet | Yes |
| GET | `/api/v1/wallet/summary` | Wallet summary | Yes |
| GET | `/api/v1/wallet/history` | Paginated transaction history | Yes |
| GET | `/api/v1/wallet/transactions` | Alias for /history | Yes |
| GET | `/api/v1/wallet/transaction/<id>` | Single transaction detail | Yes |
| GET | `/api/v1/wallet/statistics` | Wallet statistics | Yes |

### Query Parameters (history/transactions)
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default 1) |
| `page_size` | int | Items per page (default 20, max 100) |
| `sort` | string | Sort field (default `-created_at`) |
| `status` | string | Filter by status |
| `type` | string | Filter by transaction type |
| `date_from` | ISO date | Filter from date |
| `date_to` | ISO date | Filter to date |

### Wallet Response
```json
{
  "wallet_id": "uuid",
  "current_balance": 12840,
  "pending_balance": 320,
  "lifetime_earned": 45820,
  "lifetime_redeemed": 32660,
  "status": "active",
  "last_updated": "2025-01-10T12:00:00Z"
}
```

### Transaction (Ledger Entry)
```json
{
  "transaction_id": "uuid",
  "wallet_id": "uuid",
  "user_id": "uuid",
  "transaction_type": "reward_credit",
  "amount": 100,
  "previous_balance": 0,
  "new_balance": 100,
  "status": "completed",
  "reference": "reward-001",
  "description": "Daily bonus reward",
  "created_at": "2025-01-10T12:00:00Z"
}
```

---

## Transaction Types
| Type | Direction | Description |
|------|-----------|-------------|
| `reward_credit` | Credit | Reward earned from activities |
| `referral_bonus` | Credit | Referral reward |
| `mission_reward` | Credit | Mission completion reward |
| `achievement_reward` | Credit | Achievement unlocked |
| `daily_bonus` | Credit | Daily login bonus |
| `administrator_adjustment` | Credit/Debit | Admin adjustment |
| `redeem_debit` | Debit | Redemption request |
| `refund` | Credit | Refund placeholder |
| `correction` | Credit/Debit | Correction placeholder |
| `system_adjustment` | Credit/Debit | System adjustment placeholder |

---

## Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `UNAUTHORIZED` | 401 | No token or invalid token |
| `TOKEN_EXPIRED` | 401 | Token has expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource |
| `BUSINESS_ERROR` | 422 | Business rule violation |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
