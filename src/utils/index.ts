/**
 * LootLoom — Centralized Utility Helpers
 * Reusable pure functions used across the application.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merger. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with locale separators. */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Convert coin amount to display currency string (placeholder). */
export function coinsToCurrency(coins: number, symbol = "₹"): string {
  return `${symbol}${formatNumber(Math.floor(coins / 100))}`;
}

/** Truncate text with ellipsis. */
export function truncate(text: string, max = 40): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Generate a pseudo id (client-only, non-crypto). */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Time-ago formatter from an ISO timestamp. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

/** Get a greeting based on current hour. */
export function timeGreeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Percentage helper. */
export function percent(current: number, total: number): number {
  if (total <= 0) return 0;
  return clamp((current / total) * 100, 0, 100);
}

/** Sleep promise. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Copy text to clipboard with graceful fallback. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

/** Validate email format. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Password strength score (0-3). */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  let s = 0;
  if (password.length >= 6) s++;
  if (password.length >= 10) s++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) s++;
  return Math.min(s, 3) as 0 | 1 | 2 | 3;
}

/** Initials from a full name. */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
