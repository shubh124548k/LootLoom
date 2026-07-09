"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores";

/**
 * ThemeProvider — applies the persisted theme (light/dark) to <html>.
 * LootLoom defaults to the Premium White (light) theme.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return <>{children}</>;
}
