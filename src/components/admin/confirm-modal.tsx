"use client";

/**
 * ConfirmModal — destructive / confirmation dialog used for approve/reject/suspend etc.
 * Built on shadcn AlertDialog for proper a11y + focus trapping.
 */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "danger" | "warning";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  tone?: Tone;
  loading?: boolean;
  /** Optional extra node (e.g. textarea for admin message). */
  children?: React.ReactNode;
}

const toneBtn: Record<Tone, string> = {
  default: "bg-foreground text-background hover:bg-foreground/90",
  success:
    "bg-[linear-gradient(120deg,var(--emerald-brand),oklch(0.75_0.16_180))] text-white hover:opacity-90",
  danger: "bg-destructive text-white hover:bg-destructive/90",
  warning:
    "bg-[linear-gradient(120deg,var(--gold),oklch(0.75_0.18_60))] text-foreground hover:opacity-90",
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  tone = "default",
  loading = false,
  children,
}: ConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl glass-nav ring-1 ring-border/60 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter className="flex flex-row gap-2 sm:justify-end">
          <AlertDialogCancel
            disabled={loading}
            className="mt-0 rounded-xl glass-2 ring-1 ring-border hover:bg-accent/60"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className={cn(
              "rounded-xl font-semibold transition-all disabled:opacity-60 disabled:pointer-events-none",
              toneBtn[tone]
            )}
          >
            {loading && (
              <span className="size-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
            )}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
