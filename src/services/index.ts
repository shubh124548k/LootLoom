/**
 * LootLoom — Centralized Service Layer (placeholders)
 *
 * Future backend integration points. Each service wraps an API namespace
 * and is consumed via TanStack Query hooks in features. No real network
 * calls yet — these are prepared stubs for Prompts 5–10 future wiring.
 */
import { API_CONFIG } from "@/constants";

const BASE = `${API_CONFIG.prefix}/${API_CONFIG.version}`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const authService = {
  login: (body: unknown) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body: unknown) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  refresh: () => request("/auth/refresh", { method: "POST" }),
  verifyEmail: (body: unknown) => request("/auth/verify-email", { method: "POST", body: JSON.stringify(body) }),
  forgotPassword: (body: unknown) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),
  resetPassword: (body: unknown) => request("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
  session: () => request("/auth/session"),
};

export const walletService = {
  summary: () => request("/wallet/summary"),
  transactions: (params?: string) => request(`/wallet/transactions${params ? `?${params}` : ""}`),
  analytics: (period: string) => request(`/wallet/analytics?period=${period}`),
};

export const rewardService = {
  catalog: () => request("/rewards"),
  eligibility: () => request("/rewards/eligibility"),
  redeem: (body: unknown) => request("/rewards/redeem", { method: "POST", body: JSON.stringify(body) }),
  history: () => request("/rewards/history"),
};

export const earnService = {
  activities: () => request("/earn/activities"),
  missions: (category: string) => request(`/earn/missions?category=${category}`),
  dailyBonus: () => request("/earn/daily-bonus"),
  claimBonus: () => request("/earn/daily-bonus/claim", { method: "POST" }),
  analytics: (period: string) => request(`/earn/analytics?period=${period}`),
};

export const referralService = {
  summary: () => request("/referral/summary"),
  history: () => request("/referral/history"),
};

export const notificationService = {
  list: () => request("/notifications"),
  markRead: (id: string) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request("/notifications/read-all", { method: "PATCH" }),
};

export const leaderboardService = {
  top: (period: string) => request(`/leaderboard?period=${period}`),
};

export const achievementService = {
  list: () => request("/achievements"),
};

export const supportService = {
  tickets: () => request("/support/tickets"),
  createTicket: (body: unknown) => request("/support/tickets", { method: "POST", body: JSON.stringify(body) }),
  faq: () => request("/support/faq"),
};

export const userService = {
  profile: () => request("/user/profile"),
  updateProfile: (body: unknown) => request("/user/profile", { method: "PATCH", body: JSON.stringify(body) }),
  settings: () => request("/user/settings"),
  updateSettings: (body: unknown) => request("/user/settings", { method: "PATCH", body: JSON.stringify(body) }),
};

export const ceoService = {
  login: (body: unknown) => request("/ceo/login", { method: "POST", body: JSON.stringify(body) }),
  dashboard: () => request("/ceo/dashboard"),
  users: () => request("/ceo/users"),
  auditLogs: () => request("/ceo/audit-logs"),
};
