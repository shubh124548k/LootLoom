/**
 * LootLoom — Auth Models
 * Authentication + session types for user + CEO flows.
 */
import type { EntityId, ISODateString, Timestamps } from "./common";

/* ============================================================
   User Authentication
   ============================================================ */

/** Login request payload (credentials provider). */
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

/** Signup request payload. */
export interface SignupRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}

/** Authenticated session returned after login. */
export interface Session {
  user: SessionUser;
  expires: ISODateString;
  accessToken?: string;
}

/** User identity embedded in a session. */
export interface SessionUser {
  id: EntityId;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
}

/** Logout response. */
export interface LogoutResponse {
  success: true;
  message?: string;
}

/* ============================================================
   Password Reset
   ============================================================ */

/** Request a password reset link (email step). */
export interface ForgotPasswordRequest {
  email: string;
}

/** Response after requesting a reset link. */
export interface ForgotPasswordResponse {
  sent: boolean;
  expiresInMinutes: number;
}

/** Reset password using a token (new password step). */
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

/** Reset password response. */
export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

/* ============================================================
   OTP / Email Verification
   ============================================================ */

/** Request an OTP to be sent to the user's email. */
export interface SendOtpRequest {
  email: string;
  purpose: "email-verification" | "password-reset" | "2fa";
}

/** Verify an OTP code. */
export interface VerifyOtpRequest {
  email: string;
  code: string;
  purpose: "email-verification" | "password-reset" | "2fa";
}

/** OTP verification response. */
export interface VerifyOtpResponse {
  verified: boolean;
  token?: string; // temporary token for the next step (e.g. reset password)
  expiresInMinutes?: number;
}

/* ============================================================
   Google Authentication
   ============================================================ */

/** Google OAuth callback result (after redirect-back). */
export interface GoogleAuthCallback {
  success: boolean;
  session?: Session;
  error?: string;
}

/* ============================================================
   Roles
   ============================================================ */

export type UserRole = "USER" | "CEO" | "SUPER_ADMIN";

/* ============================================================
   CEO Authentication
   ============================================================ */

/** CEO login request (separate from normal user login). */
export interface CeoLoginRequest {
  identifier: string; // email or username
  password: string;
  /** Future: 2FA code when 2FA is enabled. */
  otp?: string;
}

/** CEO session — extends Session with elevated role + audit fields. */
export interface CeoSession {
  user: CeoUser;
  expires: ISODateString;
  /** IP address of the CEO session (for audit log). */
  ipAddress?: string;
  /** User-agent of the CEO session. */
  device?: string;
}

/** CEO user identity. */
export interface CeoUser {
  id: EntityId;
  fullName: string;
  email: string;
  role: "CEO" | "SUPER_ADMIN";
  avatar?: string | null;
  lastLoginAt?: ISODateString | null;
}

/* ============================================================
   Future Security (UI-ready, backend later)
   ============================================================ */

/** Two-factor authentication setup response. */
export interface TwoFactorSetupResponse {
  qrCode: string; // data URL
  secret: string;
  backupCodes: string[];
}

/** Active session entry (for "Active Sessions" UI). */
export interface ActiveSession {
  id: EntityId;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  current: boolean;
  lastActive: ISODateString;
}

/** Login history entry (for "Login History" UI). */
export interface LoginHistoryEntry {
  id: EntityId;
  device: string;
  ipAddress: string;
  location?: string;
  success: boolean;
  timestamp: ISODateString;
}

/** Recovery codes response. */
export interface RecoveryCodesResponse {
  codes: string[];
  generatedAt: ISODateString;
}
