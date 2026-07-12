"use client";

/**
 * AdminPagination — page navigation with prev/next + numbered pages.
 * Backend-ready: parent controls total + current + onChange.
 */
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Show "Showing X–Y of Z" summary. */
  showSummary?: boolean;
}

function buildPageList(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
}

export function AdminPagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
  showSummary = true,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = buildPageList(page, totalPages);

  if (total === 0) return null;

  const btnBase =
    "inline-flex items-center justify-center h-9 min-w-9 px-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-1",
        className
      )}
    >
      {showSummary && (
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{from}</span>–
          <span className="font-semibold text-foreground">{to}</span> of{" "}
          <span className="font-semibold text-foreground">{total.toLocaleString("en-IN")}</span>
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className={cn(btnBase, "glass-2 ring-1 ring-border hover:bg-accent/60")}
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`e-${i}`}
              className="inline-flex items-center justify-center size-9 text-muted-foreground"
            >
              <MoreHorizontal size={14} />
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                btnBase,
                p === page
                  ? "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand))] text-white shadow-[0_6px_18px_-6px_oklch(0.62_0.22_255/0.6)]"
                  : "glass-2 ring-1 ring-border hover:bg-accent/60"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={cn(btnBase, "glass-2 ring-1 ring-border hover:bg-accent/60")}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
