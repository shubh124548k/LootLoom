"use client";

/**
 * AdminFilter — single-select dropdown filter built on shadcn Select.
 * Backend-ready: calls onChange(value); parent decides fetch.
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminFilterOption {
  label: string;
  value: string;
}

interface AdminFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: AdminFilterOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  /** When true, shows a Filter icon before the trigger label. */
  withIcon?: boolean;
}

export function AdminFilter({
  value,
  onChange,
  options,
  placeholder = "All",
  label,
  className,
  disabled,
  withIcon = true,
}: AdminFilterProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "h-10 w-full min-w-[140px] rounded-xl glass-2 ring-1 ring-border text-sm",
            "focus:ring-2 focus:ring-electric/40 data-[placeholder]:text-muted-foreground/60"
          )}
        >
          {withIcon && (
            <Filter size={14} className="mr-1.5 text-muted-foreground/70" />
          )}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-sm rounded-lg"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
