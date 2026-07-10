"use client";

import { createContext, useContext } from "react";

interface ViewTransitionContextValue {
  isTransitioning: boolean;
  key: string;
}

const ViewTransitionContext = createContext<ViewTransitionContextValue>({
  isTransitioning: false,
  key: "",
});

/**
 * ViewTransitionProvider — non-blocking context.
 * The transition `key` is derived directly from the current view (no effect),
 * so framer-motion AnimatePresence in AppRouter can drive page transitions.
 */
export function ViewTransitionProvider({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitionContext.Provider value={{ isTransitioning: false, key: "" }}>
      {children}
    </ViewTransitionContext.Provider>
  );
}

export const useViewTransition = () => useContext(ViewTransitionContext);
