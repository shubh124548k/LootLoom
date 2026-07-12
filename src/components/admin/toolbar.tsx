"use client";

/**
 * AdminToolbar — wraps search + filters + actions above a DataTable.
 * Responsive: stacks on mobile, inline on sm+.
 */
import { cn } from "@/lib/utils";

interface AdminToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminToolbar({ children, className }: AdminToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2.5",
        className
      )}
    >
      {children}
    </div>
  );
}
