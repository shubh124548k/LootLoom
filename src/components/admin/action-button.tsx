"use client";

/**
 * ActionButton — row-level action menu (dropdown) OR a single icon button.
 *
 * Use `actions` prop for a dropdown of multiple actions.
 * Use `icon` + `onClick` for a single icon action.
 */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  /** Visual tone. */
  tone?: "default" | "success" | "warning" | "danger" | "info";
  /** Disable this item. */
  disabled?: boolean;
}

interface ActionButtonProps {
  actions: AdminActionItem[];
  label?: string;
  className?: string;
  align?: "start" | "end";
}

const toneClass: Record<NonNullable<AdminActionItem["tone"]>, string> = {
  default: "text-foreground focus:text-foreground",
  success: "text-emerald-brand focus:text-emerald-brand",
  warning: "text-gold focus:text-gold",
  danger: "text-rose-brand focus:text-rose-brand",
  info: "text-electric focus:text-electric",
};

export function ActionButton({
  actions,
  label = "Actions",
  className,
  align = "end",
}: ActionButtonProps) {
  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center size-8 rounded-lg glass-2 ring-1 ring-border",
          "text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all",
          "focus:outline-none focus:ring-2 focus:ring-electric/40",
          className
        )}
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="min-w-[180px] rounded-xl glass-nav ring-1 ring-border/60 p-1.5"
      >
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60 my-1" />
        {actions.map((action, i) => (
          <DropdownMenuItem
            key={`${action.label}-${i}`}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "rounded-lg px-2 py-1.5 text-sm cursor-pointer flex items-center gap-2.5",
              "focus:bg-accent/60",
              toneClass[action.tone ?? "default"],
              action.disabled && "opacity-50 pointer-events-none"
            )}
          >
            {action.icon && <span className="shrink-0">{action.icon}</span>}
            <span className="flex-1">{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
