"use client";

/**
 * FormButton — submit button for auth forms with loading + icon support.
 * Wraps LootButton (preserves premium animations).
 */
import { LootButton } from "@/components/lootloom";
import type { ComponentProps } from "react";

type LootButtonProps = ComponentProps<typeof LootButton>;

interface FormButtonProps extends Omit<LootButtonProps, "type" | "fullWidth"> {
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export function FormButton({
  type = "submit",
  fullWidth = true,
  children,
  ...rest
}: FormButtonProps) {
  return (
    <LootButton type={type} fullWidth={fullWidth} {...rest}>
      {children}
    </LootButton>
  );
}
