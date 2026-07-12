"use client";

/**
 * AuthModal — production-ready auth modal wrapper.
 *
 * Renders login OR signup form inside a Dialog. The actual form content is
 * passed as children — this keeps the modal layout/animation reusable.
 *
 * Backend-ready: forms call `onSuccess()` when submitted; parent decides
 * whether to call NextAuth `signIn()` or show validation. No fake auth.
 */
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md p-0 overflow-hidden rounded-2xl glass-nav ring-1 ring-border/60",
          "max-h-[90vh] overflow-y-auto lootloom-scroll",
          className
        )}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand),var(--purple-brand))]" />
        <DialogHeader className="px-6 pt-5 pb-3 space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6"
        >
          {children}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
