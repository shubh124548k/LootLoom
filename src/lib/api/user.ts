/**
 * LootLoom — User API Service
 * Typed functions for user profile, settings, and account management.
 */
import { httpClient, buildQueryString } from "./client";
import type {
  UserProfile,
  UserSettings,
  UpdateProfileRequest,
  UsernameAvailabilityResponse,
  AvatarUploadResponse,
  UserStats,
} from "@/lib/models/user";

export const userApi = {
  /* ---------- Profile ---------- */
  getProfile: () =>
    httpClient.get<UserProfile>("/user"),

  updateProfile: (data: UpdateProfileRequest) =>
    httpClient.patch<UserProfile>("/user", data),

  /* ---------- Username ---------- */
  checkUsername: (username: string) =>
    httpClient.get<UsernameAvailabilityResponse>(`/user/username-check${buildQueryString({ username })}`),

  /* ---------- Avatar ---------- */
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return httpClient.post<AvatarUploadResponse>("/user/avatar", formData, {
      headers: { "Content-Type": undefined as unknown as string },
    });
  },

  removeAvatar: () =>
    httpClient.delete<{ success: boolean }>("/user/avatar"),

  /* ---------- Settings ---------- */
  getSettings: () =>
    httpClient.get<UserSettings>("/user/settings"),

  updateSettings: (data: Partial<UserSettings>) =>
    httpClient.patch<UserSettings>("/user/settings", data),

  /* ---------- Stats ---------- */
  getStats: () =>
    httpClient.get<UserStats>("/user/stats"),

  /* ---------- Account ---------- */
  deleteAccount: () =>
    httpClient.delete<{ success: boolean }>("/user"),
};
