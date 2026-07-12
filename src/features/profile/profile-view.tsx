"use client";

/**
 * LootLoom — ProfileView
 * Premium account overview: profile card + quick wallet stats + edit CTA.
 * All values are store-driven (placeholder-ready for API).
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Calendar,
  User as UserIcon,
  Wallet,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  GlassCard,
  LootButton,
  IconBadge,
  StatusBadge,
  AnimatedCounter,
  EmptyState,
  SkeletonCard,
} from "@/components/lootloom";
import { useNavigationStore, useUserStore, useWalletStore } from "@/stores";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================================
   Helpers
   ============================================================ */

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/* ============================================================
   Avatar — image URL or initials in gradient circle
   ============================================================ */

function ProfileAvatar({
  avatar,
  fullName,
  size = "lg",
}: {
  avatar: string | null;
  fullName: string;
  size?: "md" | "lg" | "xl";
}) {
  const sizeClass = {
    md: "size-14 text-lg",
    lg: "size-20 text-2xl",
    xl: "size-24 sm:size-28 text-3xl",
  }[size];

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={fullName || "User avatar"}
        className={cn(
          "rounded-2xl object-cover ring-2 ring-electric/30 shadow-[0_8px_24px_-8px_oklch(0.62_0.22_255/0.4)]",
          sizeClass
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center font-bold text-white ring-2 ring-electric/30 shadow-[0_8px_24px_-8px_oklch(0.62_0.22_255/0.4)]",
        "bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand)_60%,var(--purple-brand))]",
        sizeClass
      )}
    >
      {getInitials(fullName)}
    </div>
  );
}

/* ============================================================
   Quick Stat Card
   ============================================================ */

function QuickStat({
  label,
  value,
  prefix,
  suffix,
  icon,
  accent,
  index,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
  index: number;
}) {
  return (
    <motion.div variants={cardReveal} custom={index}>
      <GlassCard level={2} sheen hover className="p-5 h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <IconBadge name={icon} accent={accent} size="md" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </p>
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          className="text-2xl sm:text-3xl font-bold text-foreground"
        />
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Profile Card
   ============================================================ */

function ProfileCard() {
  const { fullName, email, avatar, memberSince } = useUserStore();
  const navigate = useNavigationStore((s) => s.navigate);

  // Username is not currently in the user store — backend will populate.
  // Shown as placeholder until then.
  const username = "—";

  return (
    <motion.div variants={cardReveal} custom={0}>
      <GlassCard level={2} sheen glow="electric" className="p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <ProfileAvatar avatar={avatar} fullName={fullName} size="xl" />

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {fullName || "LootLoom Member"}
              </h2>
              <StatusBadge variant="success" dot pulse>
                Active
              </StatusBadge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                <UserIcon size={14} className="text-electric shrink-0" />
                <span className="truncate">{username}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                <Mail size={14} className="text-electric shrink-0" />
                <span className="truncate">{email || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                <Calendar size={14} className="text-electric shrink-0" />
                <span className="truncate">Member since {formatDate(memberSince)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                <ShieldCheck size={14} className="text-emerald-brand shrink-0" />
                <span className="truncate">Account verified</span>
              </div>
            </div>
          </div>

          <div className="sm:shrink-0">
            <LootButton
              variant="electric"
              size="md"
              leftIcon={<Pencil size={15} />}
              onClick={() => navigate("settings")}
            >
              Edit Profile
            </LootButton>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Main ProfileView
   ============================================================ */

export function ProfileView() {
  const { fullName, email } = useUserStore();
  const { availableCoins, lifetimeEarned, lifetimeRedeemed } = useWalletStore();
  const navigate = useNavigationStore((s) => s.navigate);
  const [loading] = useState(false);

  const hasProfile = Boolean(fullName || email);

  return (
    <PageContainer>
      <PageHeader
        title="Profile"
        description="Your account overview"
        actions={
          <LootButton
            variant="electric"
            size="md"
            leftIcon={<Pencil size={15} />}
            onClick={() => navigate("settings")}
          >
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </LootButton>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SkeletonCard className="lg:col-span-3 h-40" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !hasProfile ? (
        <GlassCard level={2} sheen className="py-12">
          <EmptyState
            icon="User"
            title="No profile data"
            description="Your profile details will appear here once your account is loaded."
          />
        </GlassCard>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-5 lg:space-y-6"
        >
          <ProfileCard />

          <div className="space-y-3">
            <SectionHeader
              title="Quick Stats"
              description="Your wallet at a glance"
              icon={<Wallet size={18} />}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <QuickStat
                label="Current Coins"
                value={availableCoins}
                icon="Coins"
                accent="gold"
                index={1}
              />
              <QuickStat
                label="Total Earned"
                value={lifetimeEarned}
                icon="TrendingUp"
                accent="emerald"
                index={2}
              />
              <QuickStat
                label="Total Spent"
                value={lifetimeRedeemed}
                icon="TrendingDown"
                accent="purple"
                index={3}
              />
            </div>
          </div>
        </motion.div>
      )}
    </PageContainer>
  );
}
