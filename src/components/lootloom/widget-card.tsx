"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./glass-card";
import { SectionHeader } from "./page-container";
import { cardReveal } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  level?: 1 | 2 | 3 | 4;
  hover?: boolean;
  index?: number;
  glow?: "none" | "electric" | "cyan" | "purple";
  footer?: React.ReactNode;
}

const WidgetCardInner = ({
  title,
  description,
  icon,
  action,
  children,
  className,
  bodyClassName,
  level = 2,
  hover = false,
  index = 0,
  glow = "none",
  footer,
}: WidgetCardProps) => {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className={cn("h-full", className)}
    >
      <GlassCard
        level={level}
        hover={hover}
        glow={glow}
        sheen
        className="h-full flex flex-col shadow-[var(--shadow-md)]"
      >
        {(title || action) && (
          <div className="p-5 pb-3">
            <SectionHeader title={title ?? ""} description={description} icon={icon} action={action} />
          </div>
        )}
        <div className={cn("flex-1 p-5 pt-3", bodyClassName)}>{children}</div>
        {footer && <div className="p-5 pt-0">{footer}</div>}
      </GlassCard>
    </motion.div>
  );
};

export const WidgetCard = memo(WidgetCardInner);
