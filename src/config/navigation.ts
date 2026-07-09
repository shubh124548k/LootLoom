/**
 * LootLoom — Centralized Navigation Configuration
 * Single source of truth for sidebar + routing metadata.
 */
import type { NavItem, ViewId, PageMeta } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", group: "main", description: "Account overview & activity" },
  { id: "earn", label: "Earn Coins", icon: "Coins", group: "earning", description: "Complete activities to earn coins" },
  { id: "wallet", label: "Wallet", icon: "Wallet", group: "earning", description: "Balance & transactions", badge: "wallet" },
  { id: "rewards", label: "Rewards", icon: "Gift", group: "earning", description: "Browse available rewards" },
  { id: "redeem", label: "Redeem", icon: "ShoppingBag", group: "earning", description: "Redeem your coins" },
  { id: "transactions", label: "Transactions", icon: "ArrowLeftRight", group: "earning", description: "All transactions" },
  { id: "history", label: "History", icon: "History", group: "earning", description: "Activity history" },
  { id: "referral", label: "Referral", icon: "Users", group: "earning", description: "Invite friends & earn" },
  { id: "notifications", label: "Notifications", icon: "Bell", group: "account", badge: "notifications", description: "Recent updates" },
  { id: "achievements", label: "Achievements", icon: "Trophy", group: "account", description: "Badges & milestones" },
  { id: "leaderboard", label: "Leaderboard", icon: "Crown", group: "account", description: "Top earners" },
  { id: "daily-bonus", label: "Daily Bonus", icon: "CalendarCheck", group: "earning", description: "Daily login rewards" },
  { id: "missions", label: "Missions", icon: "Target", group: "earning", description: "Complete missions" },
  { id: "support", label: "Support", icon: "LifeBuoy", group: "system", description: "Help center" },
  { id: "settings", label: "Settings", icon: "Settings", group: "system", description: "Account settings" },
  { id: "ceo-dashboard", label: "CEO Dashboard", icon: "ShieldCheck", group: "ceo", restricted: true, description: "Restricted access" },
];

export const NAV_GROUPS: Record<NavItem["group"], string> = {
  main: "Overview",
  earning: "Earning",
  account: "Account",
  system: "System",
  ceo: "Administration",
};

export const PAGE_META: Partial<Record<ViewId, PageMeta>> = {
  home: { title: "LootLoom", description: "Premium reward platform", group: "public", breadcrumbs: [] },
  login: { title: "Sign In", description: "Welcome back", group: "auth", breadcrumbs: [{ label: "Home", view: "home" }, { label: "Sign In" }] },
  register: { title: "Create Account", description: "Join LootLoom", group: "auth", breadcrumbs: [{ label: "Home", view: "home" }, { label: "Register" }] },
  "forgot-password": { title: "Forgot Password", description: "Reset your password", group: "auth", breadcrumbs: [{ label: "Home", view: "home" }, { label: "Sign In", view: "login" }, { label: "Forgot Password" }] },
  "reset-password": { title: "Reset Password", description: "Set a new password", group: "auth", breadcrumbs: [{ label: "Forgot Password", view: "forgot-password" }, { label: "Reset" }] },
  "verify-email": { title: "Verify Email", description: "Confirm your email address", group: "auth", breadcrumbs: [{ label: "Register", view: "register" }, { label: "Verify" }] },
  dashboard: { title: "Dashboard", description: "Your account overview", group: "app", breadcrumbs: [{ label: "Dashboard" }] },
  earn: { title: "Earn Coins", description: "Complete activities to earn rewards", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Earn" }] },
  wallet: { title: "Wallet", description: "Your coin balance & transactions", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Wallet" }] },
  rewards: { title: "Rewards", description: "Browse available rewards", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Rewards" }] },
  redeem: { title: "Redeem", description: "Redeem your coins for rewards", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Redeem" }] },
  transactions: { title: "Transactions", description: "All your transactions", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Transactions" }] },
  history: { title: "History", description: "Activity history", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "History" }] },
  referral: { title: "Referral", description: "Invite friends & earn", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Referral" }] },
  notifications: { title: "Notifications", description: "Recent updates", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Notifications" }] },
  achievements: { title: "Achievements", description: "Badges & milestones", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Achievements" }] },
  leaderboard: { title: "Leaderboard", description: "Top earners", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Leaderboard" }] },
  "daily-bonus": { title: "Daily Bonus", description: "Daily login rewards", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Daily Bonus" }] },
  missions: { title: "Missions", description: "Complete missions", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Missions" }] },
  support: { title: "Support", description: "Help center", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Support" }] },
  settings: { title: "Settings", description: "Account settings", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Settings" }] },
  profile: { title: "Profile", description: "Your profile", group: "app", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "Profile" }] },
  "ceo-restricted": { title: "Restricted Access", description: "CEO Dashboard is restricted", group: "system", breadcrumbs: [{ label: "Dashboard", view: "dashboard" }, { label: "CEO Dashboard" }] },
  "ceo-login": { title: "CEO Login", description: "Administrator sign-in", group: "ceo", breadcrumbs: [{ label: "CEO Access" }] },
  "ceo-dashboard": { title: "CEO Dashboard", description: "Administration area", group: "ceo", breadcrumbs: [{ label: "CEO Dashboard" }] },
  "session-expired": { title: "Session Expired", description: "Please sign in again", group: "system", breadcrumbs: [] },
  unauthorized: { title: "Unauthorized", description: "Access denied", group: "system", breadcrumbs: [] },
  maintenance: { title: "Maintenance", description: "We'll be back soon", group: "system", breadcrumbs: [] },
  "error-403": { title: "403", description: "Forbidden", group: "system", breadcrumbs: [] },
  "error-404": { title: "404", description: "Page not found", group: "system", breadcrumbs: [] },
  "error-500": { title: "500", description: "Server error", group: "system", breadcrumbs: [] },
  offline: { title: "Offline", description: "No connection", group: "system", breadcrumbs: [] },
  "update-required": { title: "Update Required", description: "Please update", group: "system", breadcrumbs: [] },
};

export const PUBLIC_VIEWS: ViewId[] = ["home"];
export const AUTH_VIEWS: ViewId[] = [
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "verify-success",
  "verify-failed",
];
export const APP_VIEWS: ViewId[] = [
  "dashboard",
  "earn",
  "wallet",
  "rewards",
  "redeem",
  "transactions",
  "history",
  "referral",
  "notifications",
  "achievements",
  "leaderboard",
  "daily-bonus",
  "missions",
  "support",
  "settings",
  "profile",
];
export const SYSTEM_VIEWS: ViewId[] = [
  "ceo-restricted",
  "session-expired",
  "unauthorized",
  "maintenance",
  "error-403",
  "error-404",
  "error-500",
  "offline",
  "update-required",
  "auth-loading",
];
