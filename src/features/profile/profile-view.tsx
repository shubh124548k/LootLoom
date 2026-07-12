"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Calendar,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  Bell,
  Sparkles,
  DollarSign,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  GlassCard,
  LootButton,
  SkeletonCard,
} from "@/components/lootloom";
import { useUserStore } from "@/stores";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  if (!iso) return "\u2014";
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

function InfoRow({ icon, label, value, className }: { icon: React.ReactNode; label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 text-sm min-w-0", className)}>
      <span className="text-electric shrink-0">{icon}</span>
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="text-foreground font-medium truncate">{value}</span>
    </div>
  );
}

function SectionCard({ title, icon, children, className }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={cardReveal}>
      <GlassCard level={2} sheen className={cn("p-5 sm:p-7", className)}>
        <SectionHeader title={title} icon={icon} className="mb-5" />
        {children}
      </GlassCard>
    </motion.div>
  );
}

interface PrivacySettings {
  showOnLeaderboard: boolean;
  receiveNotifications: boolean;
  allowPersonalization: boolean;
  showEarningsPublicly: boolean;
}

const SETTINGS_LABELS: Record<keyof PrivacySettings, { label: string; description: string; icon: React.ReactNode }> = {
  showOnLeaderboard: {
    label: "Show profile on leaderboard",
    description: "Display your name and rank on the public leaderboard",
    icon: <LayoutDashboard size={16} />,
  },
  receiveNotifications: {
    label: "Receive notifications",
    description: "Get notified about rewards, updates, and activity",
    icon: <Bell size={16} />,
  },
  allowPersonalization: {
    label: "Allow personalization",
    description: "Let us tailor your experience based on your activity",
    icon: <Sparkles size={16} />,
  },
  showEarningsPublicly: {
    label: "Show earnings publicly",
    description: "Display your lifetime earnings on your public profile",
    icon: <DollarSign size={16} />,
  },
};

export function ProfileView() {
  const { fullName, email, memberSince, avatar } = useUserStore();
  const { toast } = useToast();

  const [settings, setSettings] = useState<PrivacySettings>({
    showOnLeaderboard: true,
    receiveNotifications: true,
    allowPersonalization: false,
    showEarningsPublicly: false,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState<Partial<Record<keyof PrivacySettings, boolean>>>({});

  useEffect(() => {
    fetch("/api/profile/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSettings((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {
        toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
      })
      .finally(() => setSettingsLoading(false));
  }, []);

  const handleToggle = async (key: keyof PrivacySettings, value: boolean) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    setSettings((prev) => ({ ...prev, [key]: value }));

    try {
      const res = await fetch("/api/profile/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setSettings((prev) => ({ ...prev, [key]: !value }));
        toast({ title: "Error", description: json.message || "Failed to update setting", variant: "destructive" });
      }
    } catch {
      setSettings((prev) => ({ ...prev, [key]: !value }));
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/" });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your profile and privacy preferences"
      />

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5 lg:space-y-6">
        {/* Profile Card */}
        <motion.div variants={cardReveal}>
          <GlassCard level={2} sheen glow="electric" className="p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <ProfileAvatar avatar={avatar} fullName={fullName} size="xl" />
              <div className="flex-1 min-w-0 space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {fullName || "LootLoom Member"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  <InfoRow icon={<UserIcon size={14} />} label="Full Name" value={fullName || "\u2014"} />
                  <InfoRow icon={<Mail size={14} />} label="Email" value={email || "\u2014"} />
                  <InfoRow icon={<Calendar size={14} />} label="Member since" value={formatDate(memberSince)} />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Privacy Toggles */}
        <SectionCard title="Privacy" icon={<ShieldCheck size={18} />}>
          {settingsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} className="h-14" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {(Object.keys(SETTINGS_LABELS) as Array<keyof PrivacySettings>).map((key) => {
                const item = SETTINGS_LABELS[key];
                const isSaving = saving[key];
                return (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-electric shrink-0 mt-0.5">{item.icon}</span>
                      <div className="min-w-0">
                        <Label htmlFor={`setting-${key}`} className="text-sm font-medium text-foreground cursor-pointer">
                          {item.label}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isSaving && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
                      <Switch
                        id={`setting-${key}`}
                        checked={settings[key]}
                        onCheckedChange={(v) => handleToggle(key, v)}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Logout */}
        <motion.div variants={cardReveal}>
          <GlassCard level={2} sheen className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Sign out</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sign out of your account on this device</p>
              </div>
              <LootButton variant="outline" size="sm" leftIcon={<LogOut size={14} />} onClick={handleLogout}>
                Logout
              </LootButton>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
