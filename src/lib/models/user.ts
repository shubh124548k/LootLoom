/**
 * LootLoom — User Models
 * Profile, settings, and update request types.
 */
import type { EntityId, ISODateString, Timestamps } from "./common";
import type { UserRole } from "./auth";

/** Account status (drives UI state for suspend/freeze/active). */
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "FROZEN";

/** Full user profile (returned by GET /api/user). */
export interface UserProfile {
  id: EntityId;
  fullName: string;
  username: string | null;
  email: string;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
  role: UserRole;
  status: AccountStatus;
  memberSince: ISODateString;
  lastLogin: ISODateString | null;
  emailVerified: boolean;
  phoneVerified: boolean;
}

/** User account settings (preferences). */
export interface UserSettings {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  appearance: AppearancePreferences;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  redeemUpdates: boolean;
  securityAlerts: boolean;
  supportReplies: boolean;
  ceoMessages: boolean;
}

export interface PrivacyPreferences {
  profileVisible: boolean;
  showOnLeaderboard: boolean;
  shareActivity: boolean;
}

export interface AppearancePreferences {
  theme: "light" | "dark" | "system";
  compactMode: boolean;
  reducedMotion: boolean;
}

/** Update profile request payload. */
export interface UpdateProfileRequest {
  fullName?: string;
  username?: string;
  bio?: string;
  phone?: string;
}

/** Username availability check response. */
export interface UsernameAvailabilityResponse {
  username: string;
  available: boolean;
  reason?: "taken" | "invalid" | "reserved" | "too-short" | "too-long";
}

/** Avatar upload response. */
export interface AvatarUploadResponse {
  avatarUrl: string;
  uploadedAt: ISODateString;
}

/** Public user profile (limited fields, shown on leaderboard etc.). */
export interface PublicUserProfile {
  id: EntityId;
  username: string | null;
  fullName: string;
  avatar: string | null;
}

/** User with admin/CEO metadata (for CEO Users page). */
export interface AdminUserView {
  id: EntityId;
  username: string;
  fullName: string;
  email: string;
  avatar?: string | null;
  coins: number;
  totalRedeemedInr: number;
  status: AccountStatus;
  createdAt: ISODateString;
}

/** User statistics summary. */
export interface UserStats {
  totalEarned: number;
  totalRedeemed: number;
  adsWatched: number;
  redeemCount: number;
  supportTicketsOpened: number;
  memberSinceDays: number;
}

/** User entity for persistence (extends Timestamps). */
export interface User extends Timestamps {
  id: EntityId;
  googleId?: string | null;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  status: AccountStatus;
  lastLoginAt: ISODateString | null;
}
