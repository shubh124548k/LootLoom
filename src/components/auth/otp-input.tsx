"use client";

/**
 * OtpInput — 6-digit verification code input with paste support.
 * Used in email verification + forgot password OTP step.
 */
import { useRef } from "react";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string[];
  onChange: (v: string[]) => void;
  hasError?: boolean;
  length?: number;
}

export function OtpInput({
  value,
  onChange,
  hasError = false,
  length = 6,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[idx] = char;
    onChange(next);
    if (char && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < length - 1) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    const next = Array.from({ length }, () => "");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    onChange(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <motion.input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          variants={scaleIn}
          custom={i}
          className={cn(
            "size-12 sm:size-14 rounded-xl glass-2 ring-1 text-center text-lg font-bold",
            "focus:ring-electric/40 focus:ring-2 outline-none transition-all",
            "tabular-nums",
            hasError ? "ring-rose-brand/50" : "ring-border",
            value[i] && !hasError && "ring-electric/40 text-electric"
          )}
          aria-label={`Verification code digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
