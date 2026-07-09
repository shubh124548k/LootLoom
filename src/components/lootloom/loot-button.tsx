"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "electric"
  | "cyan"
  | "purple"
  | "gold"
  | "emerald"
  | "outline"
  | "ghost"
  | "glass"
  | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

interface LootButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:opacity-90 shadow-sm",
  electric:
    "text-white shadow-[0_8px_24px_-8px_oklch(0.62_0.22_255/0.6)] bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand)_60%,var(--purple-brand))]",
  cyan: "text-white bg-[linear-gradient(120deg,var(--cyan-brand),oklch(0.78_0.16_180))]",
  purple: "text-white bg-[linear-gradient(120deg,var(--purple-brand),oklch(0.7_0.2_320))]",
  gold: "text-foreground bg-[linear-gradient(120deg,var(--gold),oklch(0.75_0.18_60))]",
  emerald: "text-white bg-[linear-gradient(120deg,var(--emerald-brand),oklch(0.75_0.16_180))]",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-accent hover:border-electric/40",
  ghost: "bg-transparent text-foreground hover:bg-accent",
  glass: "glass-2 text-foreground hover:glass-3 ring-1 ring-border",
  destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-7 text-sm gap-2.5 rounded-xl",
  icon: "size-10 rounded-xl",
};

/**
 * LootButton — premium application button with gradient, glass, and motion.
 */
export const LootButton = forwardRef<HTMLButtonElement, LootButtonProps>(
  (
    {
      variant = "electric",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      children,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center font-semibold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-60",
          "overflow-hidden select-none",
          variantClass[variant],
          sizeClass[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {variant === "electric" && (
          <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
            <span className="absolute -inset-1 bg-white/20 blur-md" />
          </span>
        )}
        {loading && (
          <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </motion.button>
    );
  }
);
LootButton.displayName = "LootButton";
