"use client";

/**
 * PasswordInput — password field with eye toggle + optional strength meter.
 * Wraps FormInput.
 */
import { useMemo, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { FormInput } from "./form-input";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  showStrength?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}

function StrengthMeter({ password }: { password: string }) {
  const { score, label, color, percent } = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-transparent", percent: 0 };
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    const final = Math.min(s, 3);
    const map = [
      { label: "Too short", color: "bg-rose-brand", percent: 20 },
      { label: "Weak", color: "bg-rose-brand", percent: 35 },
      { label: "Medium", color: "bg-gold", percent: 65 },
      { label: "Strong", color: "bg-emerald-brand", percent: 100 },
    ];
    return { score: final, ...map[final] };
  }, [password]);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2"
    >
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <span
        className={cn(
          "text-[10px] font-semibold w-14 text-right",
          score === 0 && "text-muted-foreground",
          score === 1 && "text-rose-brand",
          score === 2 && "text-gold",
          score === 3 && "text-emerald-brand"
        )}
      >
        {label}
      </span>
    </motion.div>
  );
}

export function PasswordInput({
  id,
  label,
  placeholder = "••••••••",
  value,
  onChange,
  error = null,
  showStrength = false,
  autoComplete,
  disabled,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <FormInput
        id={id}
        label={label}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        icon={<Lock size={16} />}
        error={error}
        autoComplete={autoComplete}
        disabled={disabled}
        rightSlot={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={show ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      {showStrength && <StrengthMeter password={value} />}
    </div>
  );
}
