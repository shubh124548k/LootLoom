"use client";

/**
 * DataTable — production admin table with automatic mobile → card transformation.
 *
 * Desktop (md+): traditional table inside a glass card.
 * Mobile (<md):  each row collapses to a stacked glass card with label/value pairs.
 *
 * No hardcoded data — accepts rows + columns. Backend-ready.
 */
import { motion } from "framer-motion";
import { GlassCard } from "@/components/lootloom/glass-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { cardReveal } from "@/lib/animations";

export interface AdminColumn<T> {
  /** Stable key on the row object (or accessor function). */
  key: string;
  /** Header label. */
  header: string;
  /** Render cell content. */
  cell: (row: T) => React.ReactNode;
  /** Hide this column on mobile (e.g. redundant info). */
  hideOnMobile?: boolean;
  /** On mobile cards, render this column as the card title (large, bold). */
  mobileTitle?: boolean;
  /** On mobile cards, render this column as a small subtitle under the title. */
  mobileSubtitle?: boolean;
  /** Header alignment. */
  align?: "left" | "center" | "right";
  /** Optional className for the cell wrapper (desktop). */
  className?: string;
}

interface DataTableProps<T> {
  columns: AdminColumn<T>[];
  rows: T[];
  /** Returns a stable id for each row (used for React keys + aria). */
  rowId: (row: T) => string;
  /** Click handler for entire row (optional). */
  onRowClick?: (row: T) => void;
  /** Empty state node rendered when rows is empty. */
  emptyState?: React.ReactNode;
  /** Loading skeleton node (renders in place of body when truthy). */
  loading?: React.ReactNode;
  className?: string;
  /** Compact rows (less vertical padding). */
  compact?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  rowId,
  onRowClick,
  emptyState,
  loading,
  className,
  compact = false,
}: DataTableProps<T>) {
  const cellPad = compact ? "py-2.5 px-3" : "py-3.5 px-4";

  return (
    <GlassCard level={1} className={cn("overflow-hidden", className)}>
      {/* Desktop / tablet table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 bg-muted/30",
                    cellPad,
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className={cellPad}>
                  {loading}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className={cellPad}>
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <motion.tr
                  key={rowId(row)}
                  variants={cardReveal}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border/40 transition-colors group",
                    onRowClick && "cursor-pointer hover:bg-accent/40",
                    "last:border-0"
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        cellPad,
                        "text-sm text-foreground align-middle",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden divide-y divide-border/40">
        {loading ? (
          <div className="p-4">{loading}</div>
        ) : rows.length === 0 ? (
          <div className="p-4">{emptyState}</div>
        ) : (
          rows.map((row, i) => {
            const titleCol = columns.find((c) => c.mobileTitle);
            const subtitleCol = columns.find((c) => c.mobileSubtitle);
            const restCols = columns.filter(
              (c) => !c.mobileTitle && !c.mobileSubtitle && !c.hideOnMobile
            );
            return (
              <motion.div
                key={rowId(row)}
                variants={cardReveal}
                custom={i}
                initial="hidden"
                animate="visible"
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "p-4 space-y-2.5",
                  onRowClick && "cursor-pointer active:bg-accent/40"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    {titleCol && (
                      <p className="text-sm font-semibold text-foreground truncate">
                        {titleCol.cell(row)}
                      </p>
                    )}
                    {subtitleCol && (
                      <p className="text-xs text-muted-foreground truncate">
                        {subtitleCol.cell(row)}
                      </p>
                    )}
                  </div>
                  {/* Last column (usually Status/Action) renders on the right */}
                  {!restCols[restCols.length - 1]?.hideOnMobile && (
                    <div className="shrink-0">
                      {restCols[restCols.length - 1]?.cell(row)}
                    </div>
                  )}
                </div>
                {/* Remaining fields as label/value rows */}
                {restCols.slice(0, -1).map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-muted-foreground/80">{col.header}</span>
                    <span className="text-foreground font-medium text-right">
                      {col.cell(row)}
                    </span>
                  </div>
                ))}
              </motion.div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
