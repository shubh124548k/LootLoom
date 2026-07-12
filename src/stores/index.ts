/**
 * LootLoom — Production State Stores (Zustand)
 * REAL data flow: Database → API → Store → UI
 * No fake data. All values default to zero/empty until fetched from backend.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ViewId, AuthStatus, UserRole, NotificationItem, ActivityItem, TransactionItem } from "@/types";

/* ============================================================
   Navigation Store — current view, history, breadcrumbs
   ============================================================ */
interface NavigationState {
  current: ViewId;
  previous: ViewId | null;
  history: ViewId[];
  navigate: (view: ViewId) => void;
  goBack: () => void;
  canGoBack: () => boolean;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  current: "home",
  previous: null,
  history: ["home"],
  navigate: (view) =>
    set((state) => ({
      previous: state.current,
      current: view,
      history: [...state.history.slice(-20), view],
    })),
  goBack: () => {
    const { history } = get();
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const prev = newHistory[newHistory.length - 1];
      set({ current: prev, previous: get().current, history: newHistory });
    }
  },
  canGoBack: () => get().history.length > 1,
}));

/* ============================================================
   Auth Store — real session via NextAuth
   The actual auth state comes from useSession() in components.
   This store tracks the role (for CEO gate) and auth status.
   ============================================================ */
interface AuthState {
  status: AuthStatus;
  role: UserRole;
  isAuthenticated: boolean;
  setStatus: (status: AuthStatus) => void;
  setRole: (role: UserRole) => void;
  setAuthenticated: (v: boolean) => void;
  /** Convenience: mark authenticated + role=user. Backend wiring happens in AuthDataSync. */
  login: () => void;
  /** Convenience: mark unauthenticated + role=user. Call signOut() for real session cleanup. */
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: "unauthenticated",
      role: "user",
      isAuthenticated: false,
      setStatus: (status) => set({ status }),
      setRole: (role) => set({ role }),
      setAuthenticated: (v) =>
        set((s) => ({
          isAuthenticated: v,
          status: v ? "authenticated" : "unauthenticated",
        })),
      login: () =>
        set({ isAuthenticated: true, status: "authenticated", role: "user" }),
      logout: () =>
        set({ isAuthenticated: false, status: "unauthenticated", role: "user" }),
    }),
    {
      name: "lootloom-auth",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
      partialize: (state) => ({ role: state.role }),
    }
  )
);

/* ============================================================
   User Store — REAL user data from backend
   Defaults to empty/null. Populated by fetchUserData() after auth.
   ============================================================ */
interface RealUserState {
  id: string | null;
  fullName: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  memberSince: string | null;
  lastLogin: string | null;
  passwordChangedAt: string | null;
  // Gamification fields (kept for UI compatibility, default to 0)
  level: number;
  xp: number;
  xpToNext: number;
  rank: number;
  dailyStreak: number;
  setUser: (data: Partial<RealUserState>) => void;
  resetUser: () => void;
}

export const useUserStore = create<RealUserState>()(
  persist(
    (set) => ({
      id: null,
      fullName: "",
      username: "",
      email: "",
      avatar: null,
      role: "USER",
      status: "ACTIVE",
      emailVerified: false,
      memberSince: null,
      lastLogin: null,
      passwordChangedAt: null,
      level: 1,
      xp: 0,
      xpToNext: 1000,
      rank: 0,
      dailyStreak: 0,
      setUser: (data) => set((state) => ({ ...state, ...data })),
      resetUser: () =>
        set({
          id: null,
          fullName: "",
          username: "",
          email: "",
          avatar: null,
          role: "USER",
          status: "ACTIVE",
          emailVerified: false,
          memberSince: null,
          lastLogin: null,
          passwordChangedAt: null,
          level: 1,
          xp: 0,
          xpToNext: 1000,
          rank: 0,
          dailyStreak: 0,
        }),
    }),
    {
      name: "lootloom-user",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
    }
  )
);

/* ============================================================
   UI Store — sidebar collapse, mobile drawer, theme, search
   ============================================================ */
interface UIState {
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  searchOpen: boolean;
  notificationCenterOpen: boolean;
  profileMenuOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setMobileDrawer: (v: boolean) => void;
  setSearch: (v: boolean) => void;
  setNotificationCenter: (v: boolean) => void;
  setProfileMenu: (v: boolean) => void;
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileDrawerOpen: false,
      searchOpen: false,
      notificationCenterOpen: false,
      profileMenuOpen: false,
      theme: "light",
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setMobileDrawer: (v) => set({ mobileDrawerOpen: v }),
      setSearch: (v) => set({ searchOpen: v }),
      setNotificationCenter: (v) => set({ notificationCenterOpen: v }),
      setProfileMenu: (v) => set({ profileMenuOpen: v }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: "lootloom-ui",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, theme: s.theme }),
    }
  )
);

/* ============================================================
   Wallet Store — REAL wallet data from backend
   Defaults to 0. Populated by fetchWalletData() after auth.
   ============================================================ */
interface WalletState {
  availableCoins: number;
  pendingCoins: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  transactions: TransactionItem[];
  walletId: string | null;
  setWallet: (data: Partial<WalletState>) => void;
  setTransactions: (t: TransactionItem[]) => void;
  resetWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  availableCoins: 0,
  pendingCoins: 0,
  lifetimeEarned: 0,
  lifetimeRedeemed: 0,
  todayEarnings: 0,
  weeklyEarnings: 0,
  monthlyEarnings: 0,
  transactions: [],
  walletId: null,
  setWallet: (data) => set((s) => ({ ...s, ...data })),
  setTransactions: (t) => set({ transactions: t }),
  resetWallet: () =>
    set({
      availableCoins: 0,
      pendingCoins: 0,
      lifetimeEarned: 0,
      lifetimeRedeemed: 0,
      todayEarnings: 0,
      weeklyEarnings: 0,
      monthlyEarnings: 0,
      transactions: [],
      walletId: null,
    }),
}));

/* ============================================================
   Notification Store — REAL notifications from backend
   Defaults to empty. Populated by fetchNotifications() after auth.
   ============================================================ */
interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  setItems: (items: NotificationItem[]) => void;
  resetNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  markAllRead: () =>
    set((s) => ({
      items: s.items.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  markRead: (id) =>
    set((s) => {
      const items = s.items.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { items, unreadCount: items.filter((n) => !n.read).length };
    }),
  setItems: (items) =>
    set({ items, unreadCount: items.filter((n) => !n.read).length }),
  resetNotifications: () => set({ items: [], unreadCount: 0 }),
}));

/* ============================================================
   Activity Store — REAL activity from backend (transaction history)
   Defaults to empty. Populated from transactions API.
   ============================================================ */
interface ActivityState {
  items: ActivityItem[];
  setItems: (items: ActivityItem[]) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

