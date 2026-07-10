/**
 * LootLoom — Context providers barrel.
 *
 * State is managed with Zustand stores (src/stores/), which provide
 * Auth, User, Wallet, Notifications, UI (theme/sidebar), Activity,
 * and AppLifecycle context without React Context boilerplate.
 *
 * This barrel re-exports the stores as the "context" layer for clarity.
 */
export {
  useNavigationStore,
  useAuthStore,
  useUserStore,
  useUIStore,
  useWalletStore,
  useNotificationStore,
  useActivityStore,
  useAppLifecycleStore,
} from "@/stores";
