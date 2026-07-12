/**
 * LootLoom — Security Frontend Types
 * Role-based access control (RBAC) types for route guards + UI gating.
 *
 * Backend will enforce these permissions server-side. This module provides
 * the frontend types + helpers for UI gating (showing/hiding elements).
 */
import type { UserRole } from "@/lib/models/auth";
import type { ViewId } from "@/types";

/* ============================================================
   Roles
   ============================================================ */

/** Re-export UserRole for convenience. */
export type { UserRole };

/** All possible roles on the platform. */
export type Role = UserRole | "visitor";

/** Roles that can access the CEO administration area. */
export const CEO_ROLES: UserRole[] = ["CEO", "SUPER_ADMIN"];

/** Roles that can access authenticated user views. */
export const AUTHENTICATED_ROLES: UserRole[] = ["USER", "CEO", "SUPER_ADMIN"];

/* ============================================================
   Permissions
   ============================================================ */

/** Granular permissions (for future-ready UI gating). */
export type Permission =
  // User permissions
  | "earn:watch-ad"
  | "earn:offerwall"
  | "wallet:view"
  | "wallet:transactions:view"
  | "redeem:request"
  | "redeem:cancel"
  | "profile:view"
  | "profile:edit"
  | "settings:edit"
  | "support:create"
  | "support:reply"
  // CEO permissions
  | "ceo:dashboard:view"
  | "ceo:redeem:approve"
  | "ceo:redeem:reject"
  | "ceo:users:view"
  | "ceo:users:suspend"
  | "ceo:users:activate"
  | "ceo:users:freeze"
  | "ceo:support:view"
  | "ceo:support:reply"
  | "ceo:support:close"
  | "ceo:notifications:view"
  | "ceo:history:view"
  | "ceo:settings:edit"
  // Super admin only
  | "admin:ceo:create"
  | "admin:ceo:delete"
  | "admin:config:edit";

/** Permission → roles that grant it. */
export const PERMISSION_ROLE_MAP: Record<Permission, Role[]> = {
  // User permissions
  "earn:watch-ad": ["USER", "CEO", "SUPER_ADMIN"],
  "earn:offerwall": ["USER", "CEO", "SUPER_ADMIN"],
  "wallet:view": ["USER", "CEO", "SUPER_ADMIN"],
  "wallet:transactions:view": ["USER", "CEO", "SUPER_ADMIN"],
  "redeem:request": ["USER", "CEO", "SUPER_ADMIN"],
  "redeem:cancel": ["USER", "CEO", "SUPER_ADMIN"],
  "profile:view": ["USER", "CEO", "SUPER_ADMIN"],
  "profile:edit": ["USER", "CEO", "SUPER_ADMIN"],
  "settings:edit": ["USER", "CEO", "SUPER_ADMIN"],
  "support:create": ["USER", "CEO", "SUPER_ADMIN"],
  "support:reply": ["USER", "CEO", "SUPER_ADMIN"],
  // CEO permissions
  "ceo:dashboard:view": ["CEO", "SUPER_ADMIN"],
  "ceo:redeem:approve": ["CEO", "SUPER_ADMIN"],
  "ceo:redeem:reject": ["CEO", "SUPER_ADMIN"],
  "ceo:users:view": ["CEO", "SUPER_ADMIN"],
  "ceo:users:suspend": ["CEO", "SUPER_ADMIN"],
  "ceo:users:activate": ["CEO", "SUPER_ADMIN"],
  "ceo:users:freeze": ["CEO", "SUPER_ADMIN"],
  "ceo:support:view": ["CEO", "SUPER_ADMIN"],
  "ceo:support:reply": ["CEO", "SUPER_ADMIN"],
  "ceo:support:close": ["CEO", "SUPER_ADMIN"],
  "ceo:notifications:view": ["CEO", "SUPER_ADMIN"],
  "ceo:history:view": ["CEO", "SUPER_ADMIN"],
  "ceo:settings:edit": ["CEO", "SUPER_ADMIN"],
  // Super admin only
  "admin:ceo:create": ["SUPER_ADMIN"],
  "admin:ceo:delete": ["SUPER_ADMIN"],
  "admin:config:edit": ["SUPER_ADMIN"],
};

/* ============================================================
   Route Protection
   ============================================================ */

/** Route access level. */
export type RouteAccessLevel =
  | "public" // anyone (home, login, register)
  | "authenticated" // any logged-in user
  | "ceo" // CEO or SUPER_ADMIN only
  | "super-admin"; // SUPER_ADMIN only

/** Protected route definition. */
export interface ProtectedRoute {
  view: ViewId;
  access: RouteAccessLevel;
  /** Required permissions (all must be satisfied). */
  permissions?: Permission[];
  /** Redirect view when access denied. */
  redirectTo: ViewId;
}

/** Check if a role has a permission. */
export function hasPermission(role: Role, permission: Permission): boolean {
  if (role === "visitor") return false;
  return PERMISSION_ROLE_MAP[permission].includes(role);
}

/** Check if a role can access a route access level. */
export function canAccess(role: Role, access: RouteAccessLevel): boolean {
  switch (access) {
    case "public":
      return true;
    case "authenticated":
      return AUTHENTICATED_ROLES.includes(role as UserRole);
    case "ceo":
      return CEO_ROLES.includes(role as UserRole);
    case "super-admin":
      return role === "SUPER_ADMIN";
    default:
      return false;
  }
}

/** Check if a role is a CEO-level role. */
export function isCeoRole(role: Role): boolean {
  return CEO_ROLES.includes(role as UserRole);
}
