"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextType {
  open: string | null;
  setOpen: (v: string | null) => void;
}

const AccordionContext = createContext<AccordionContextType>({ open: null, setOpen: () => {} });

export function Accordion({ children, type, collapsible, className }: { children: ReactNode; type?: string; collapsible?: boolean; className?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const ctx = { open, setOpen };
  return <AccordionContext.Provider value={ctx}><div className={cn(type === "single" && collapsible !== false ? "space-y-1" : "", className)}>{children}</div></AccordionContext.Provider>;
}

export function AccordionItem({ children, value, className }: { children: ReactNode; value: string; className?: string }) {
  return <div className={className} data-value={value}>{children}</div>;
}

export function AccordionTrigger({ children, className }: { children: ReactNode; className?: string }) {
  const { open, setOpen } = useContext(AccordionContext);
  const parent = (typeof children === "object" && children !== null && "props" in children) ? null : null;
  const itemEl = (el: HTMLElement | null) => {
    if (el) {
      const val = el.closest("[data-value]")?.getAttribute("data-value") || null;
      el.onclick = () => setOpen(open === val ? null : val);
    }
  };
  return (
    <button ref={itemEl} className={cn("flex w-full items-center justify-between gap-2 text-left", className)}>
      {children}
      <ChevronDown size={14} className={cn("shrink-0 text-muted-foreground transition-transform", open === "dummy" && "rotate-180")} />
    </button>
  );
}

export function AccordionContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden", className)}>{children}</div>;
}
