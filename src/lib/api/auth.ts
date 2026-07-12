/**
 * LootLoom — Auth API Service
 * Typed functions for authentication + session management.
 *
 * NOTE: Login/signup/logout are wired through NextAuth's `signIn` / `signOut`
 * functions (client-side). These service functions cover the REST endpoints
 * that complement NextAuth (forgot password, OTP, CEO login, sessions).
 *
 * No fake responses. All functions call real API routes.
 */
import { httpClient } from "./client";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendOtpRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
  CeoLoginRequest,
  CeoSession,
  ActiveSession,
  LoginHistoryEntry,
  TwoFactorSetupResponse,
  RecoveryCodesResponse,
} from "@/lib/models/auth";

export const authApi = {
  /* ---------- Password Reset ---------- */
  forgotPassword: (data: ForgotPasswordRequest) =>
    httpClient.post<ForgotPasswordResponse>("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    httpClient.post<ResetPasswordResponse>("/auth/reset-password", data),

  /* ---------- OTP / Verification ---------- */
  sendOtp: (data: SendOtpRequest) =>
    httpClient.post<{ sent: boolean }>("/auth/send-otp", data),

  verifyOtp: (data: VerifyOtpRequest) =>
    httpClient.post<VerifyOtpResponse>("/auth/verify-otp", data),

  /* ---------- CEO Authentication ---------- */
  ceoLogin: (data: CeoLoginRequest) =>
    httpClient.post<CeoSession>("/auth/ceo/login", data),

  ceoLogout: () =>
    httpClient.post<{ success: boolean }>("/auth/ceo/logout", {}),

  /* ---------- Sessions (future-ready) ---------- */
  getActiveSessions: () =>
    httpClient.get<ActiveSession[]>("/auth/sessions"),

  revokeSession: (sessionId: string) =>
    httpClient.delete<{ success: boolean }>(`/auth/sessions/${sessionId}`),

  getLoginHistory: () =>
    httpClient.get<LoginHistoryEntry[]>("/auth/login-history"),

  /* ---------- 2FA (future-ready) ---------- */
  setup2FA: () =>
    httpClient.post<TwoFactorSetupResponse>("/auth/2fa/setup", {}),

  verify2FA: (code: string) =>
    httpClient.post<{ verified: boolean }>("/auth/2fa/verify", { code }),

  disable2FA: (code: string) =>
    httpClient.post<{ success: boolean }>("/auth/2fa/disable", { code }),

  getRecoveryCodes: () =>
    httpClient.get<RecoveryCodesResponse>("/auth/recovery-codes"),

  regenerateRecoveryCodes: () =>
    httpClient.post<RecoveryCodesResponse>("/auth/recovery-codes/regenerate", {}),
};
