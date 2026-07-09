/**
 * LootLoom — Centralized State Stores (Zustand)
 * All client state lives here: navigation, auth, user, ui, notifications, wallet, theme.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ViewId,
  AuthStatus,
  UserRole,
  NotificationItem,
  ActivityItem,
  TransactionItem,
} from "@/types";

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
   Auth Store — session status, role, tokens (future)
   ============================================================ */
interface AuthState {
  status: AuthStatus;
  role: UserRole;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: () => void;
  logout: () => void;
  setStatus: (status: AuthStatus) => void;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: "unauthenticated",
      role: "user",
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      login: () =>
        set({ status: "authenticated", isAuthenticated: true, role: "user" }),
      logout: () =>
        set({
          status: "unauthenticated",
          isAuthenticated: false,
          role: "visitor",
          accessToken: null,
          refreshToken: null,
        }),
      setStatus: (status) => set({ status }),
      setRole: (role) => set({ role }),
    }),
    {
      name: "lootloom-auth",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
      partialize: (state) => ({
        status: state.status,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/* ============================================================
   User Store — placeholder profile data
   ============================================================ */
interface UserState {
  fullName: string;
  username: string;
  email: string;
  memberSince: string;
  level: number;
  xp: number;
  xpToNext: number;
  rank: number;
  dailyStreak: number;
  lastLogin: string;
  referralCode: string;
  avatarUrl: string | null;
  setUser: (data: Partial<UserState>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      fullName: "LootLoom Member",
      username: "@member",
      email: "member@lootloom.app",
      memberSince: "2024",
      level: 7,
      xp: 2840,
      xpToNext: 4000,
      rank: 142,
      dailyStreak: 12,
      lastLogin: "Today",
      referralCode: "LOOT-7K2X",
      avatarUrl: null,
      setUser: (data) => set((state) => ({ ...state, ...data })),
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
   Wallet Store — coin balances (placeholders)
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
  setCoins: (data: Partial<WalletState>) => void;
  setTransactions: (t: TransactionItem[]) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  availableCoins: 12840,
  pendingCoins: 320,
  lifetimeEarned: 45820,
  lifetimeRedeemed: 32660,
  todayEarnings: 145,
  weeklyEarnings: 980,
  monthlyEarnings: 4280,
  transactions: [],
  setCoins: (data) => set((s) => ({ ...s, ...data })),
  setTransactions: (t) => set({ transactions: t }),
}));

/* ============================================================
   Notification Store — unread count, items
   ============================================================ */
interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  setItems: (items: NotificationItem[]) => void;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", title: "Daily Bonus Ready", body: "Claim your daily login reward of 50 coins.", time: "2m ago", type: "reward", read: false, icon: "CalendarCheck" },
  { id: "n2", title: "Mission Completed", body: "You earned 120 coins from 'Watch 5 ads'.", time: "18m ago", type: "reward", read: false, icon: "Target" },
  { id: "n3", title: "Referral Reward", body: "Your friend joined! You earned 200 coins.", time: "1h ago", type: "social", read: false, icon: "Users" },
  { id: "n4", title: "Security Notice", body: "New device signed in from Mumbai.", time: "3h ago", type: "security", read: true, icon: "ShieldCheck" },
  { id: "n5", title: "Weekly Summary", body: "You earned 980 coins this week.", time: "1d ago", type: "wallet", read: true, icon: "Wallet" },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  items: SAMPLE_NOTIFICATIONS,
  unreadCount: SAMPLE_NOTIFICATIONS.filter((n) => !n.read).length,
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
}));

/* ============================================================
   Activity Store — recent activity timeline (placeholders)
   ============================================================ */
interface ActivityState {
  items: ActivityItem[];
}

export const useActivityStore = create<ActivityState>(() => ({
  items: [
    { id: "a1", type: "earned", title: "Rewarded Ad", description: "Watched a rewarded advertisement", amount: 25, time: "5 min ago", icon: "PlayCircle" },
    { id: "a2", type: "mission", title: "Mission Completed", description: "Completed 'Daily Explorer' mission", amount: 120, time: "32 min ago", icon: "Target" },
    { id: "a3", type: "bonus", title: "Daily Bonus", description: "Claimed daily login bonus", amount: 50, time: "2 hours ago", icon: "CalendarCheck" },
    { id: "a4", type: "referral", title: "Referral Reward", description: "Friend signed up with your code", amount: 200, time: "5 hours ago", icon: "Users" },
    { id: "a5", type: "redeemed", title: "Redeem Request", description: "Submitted redeem for ₹100 UPI", amount: -1000, time: "Yesterday", icon: "ShoppingBag" },
  ],
}));

/* ============================================================
   App Lifecycle Store — boot sequence
   ============================================================ */
import type { AppLifecycle } from "@/types";

interface AppLifecycleState {
  lifecycle: AppLifecycle;
  setLifecycle: (l: AppLifecycle) => void;
}

export const useAppLifecycleStore = create<AppLifecycleState>((set) => ({
  lifecycle: "ready",
  setLifecycle: (l) => set({ lifecycle: l }),
}));
