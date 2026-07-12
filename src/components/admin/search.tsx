"use client";

/**
 * AdminSearch — controlled search input with icon + clear button.
 * Backend-ready: just calls onChange(value); parent decides debounce/fetch.
 */
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AdminSearch({
  value,
  onChange,
  placeholder = "Search…",
  className,
  disabled,
}: AdminSearchProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-10 w-full rounded-xl glass-2 ring-1 ring-border pl-10 pr-9 text-sm",
          "placeholder:text-muted-foreground/60 outline-none transition-all",
          "focus:ring-2 focus:ring-electric/40 focus:bg-background/40",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 size-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
