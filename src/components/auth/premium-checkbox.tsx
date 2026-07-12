"use client";

/**
 * PremiumCheckbox — custom checkbox with check animation.
 * Used for "Remember Me" + "Terms" in auth forms.
 */
import { AnimatePresence, motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  error?: string | null;
}

export function PremiumCheckbox({
  id,
  checked,
  onChange,
  label,
  error = null,
}: PremiumCheckboxProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="flex items-start gap-2.5 cursor-pointer group select-none"
      >
        <button
          type="button"
          role="checkbox"
          id={id}
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "mt-0.5 size-5 rounded-md ring-1 flex items-center justify-center transition-all shrink-0",
            checked
              ? "bg-electric ring-electric text-white"
              : "bg-transparent ring-border text-transparent group-hover:ring-electric/40"
          )}
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 16 }}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
        <span className="text-xs text-muted-foreground leading-relaxed">
          {label}
        </span>
      </label>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs font-medium text-rose-brand flex items-center gap-1 pl-7"
          >
            <XCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
