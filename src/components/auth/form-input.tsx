"use client";

/**
 * FormInput — premium labeled input with leading icon + error state.
 * Reusable across all auth forms (login, register, forgot password, etc.).
 */
import { forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_INPUT_CLASS =
  "h-12 rounded-xl glass-2 ring-1 ring-border px-4 text-sm focus:ring-electric/40 focus:ring-2 outline-none transition-all w-full";

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  icon?: React.ReactNode;
  error?: string | null;
  onChange: (value: string) => void;
  rightSlot?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      type = "text",
      placeholder,
      value,
      onChange,
      icon,
      error = null,
      autoComplete,
      inputMode,
      maxLength,
      disabled = false,
      rightSlot,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-foreground/70 tracking-wide"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            name={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            disabled={disabled}
            className={cn(
              BASE_INPUT_CLASS,
              icon && "pl-11",
              rightSlot && "pr-12",
              error && "ring-rose-brand/50 focus:ring-rose-brand/40",
              disabled && "opacity-60 pointer-events-none",
              className
            )}
            {...rest}
          />
          {rightSlot && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightSlot}
            </span>
          )}
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-medium text-rose-brand flex items-center gap-1"
            >
              <XCircle size={12} />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
FormInput.displayName = "FormInput";
