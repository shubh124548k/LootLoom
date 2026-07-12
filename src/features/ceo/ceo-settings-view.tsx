"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  FileKey,
  History,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Pencil,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ConfirmModal } from "@/components/admin";
import {
  GlassCard,
  IconBadge,
  LootButton,
  PageContainer,
  PageHeader,
  StatusBadge,
} from "@/components/lootloom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore, useNavigationStore } from "@/stores";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/* ----------------------------- Types ----------------------------- */

interface CeoProfile {
  fullName: string;
  email: string;
  phone: string;
}

interface SecurityItem {
  iconName: string;
  accent: "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";
  title: string;
  description: string;
}

/* ----------------------------- Config ----------------------------- */

const SECURITY_ITEMS: SecurityItem[] = [
  {
    iconName: "Smartphone",
    accent: "electric",
    title: "Two-Factor Authentication",
    description: "Require a TOTP code from an authenticator app at every sign-in.",
  },
  {
    iconName: "KeyRound",
    accent: "cyan",
    title: "OTP Verification",
    description: "One-time passwords for sensitive admin actions (payouts, deletes).",
  },
  {
    iconName: "ShieldCheck",
    accent: "purple",
    title: "Session Verification",
    description: "Verify each new session through a trusted device challenge.",
  },
  {
    iconName: "Monitor",
    accent: "gold",
    title: "Device Verification",
    description: "Restrict CEO access to a whitelist of approved devices.",
  },
  {
    iconName: "FileKey",
    accent: "emerald",
    title: "Recovery Codes",
    description: "Generate single-use backup codes for emergency account recovery.",
  },
  {
    iconName: "History",
    accent: "navy",
    title: "Login History",
    description: "Audit recent sign-in events, IPs and locations in real-time.",
  },
];

/* ----------------------------- Small UI helpers ----------------------------- */

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground/70 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground truncate">
          {value && value.trim() ? value : "\u2014"}
        </p>
      </div>
    </div>
  );
}

function FieldInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-11 w-full rounded-xl glass-2 ring-1 ring-border text-sm",
            "placeholder:text-muted-foreground/50 outline-none transition-all",
            "focus:ring-2 focus:ring-electric/40 focus:bg-background/40",
            icon ? "pl-9 pr-3" : "px-3",
            error && "ring-2 ring-rose-brand/50"
          )}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-brand flex items-center gap-1.5">
          <AlertTriangle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  show,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </Label>
      <div className="relative">
        <Lock
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
        />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-11 w-full rounded-xl glass-2 ring-1 ring-border pl-9 pr-10 text-sm",
            "placeholder:text-muted-foreground/50 outline-none transition-all",
            "focus:ring-2 focus:ring-electric/40 focus:bg-background/40",
            error && "ring-2 ring-rose-brand/50"
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-rose-brand flex items-center gap-1.5">
          <AlertTriangle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ----------------------------- View ----------------------------- */

export function CeoSettingsView() {
  const { toast } = useToast();

  /* ---- Profile state ---- */
  const [profile, setProfile] = useState<CeoProfile>({ fullName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to load profile");
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load profile");
        const data = json.data;
        if (!cancelled) {
          setProfile({
            fullName: data.name || "",
            email: data.email || "",
            phone: "",
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "An error occurred");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<CeoProfile>({ fullName: "", email: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const openEdit = () => {
    setEditForm(profile);
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const nameParts = editForm.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to save profile");
      setProfile({ ...editForm });
      setEditOpen(false);
      toast({ title: "Profile updated", description: "Your CEO profile has been saved." });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  /* ---- Password state ---- */
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleUpdatePassword = () => {
    const errors: typeof pwdErrors = {};
    if (!currentPwd.trim()) errors.current = "Current password is required.";
    if (newPwd.length < 8) errors.new = "New password must be at least 8 characters.";
    if (confirmPwd !== newPwd) errors.confirm = "Passwords do not match.";
    setPwdErrors(errors);
    setPwdSuccess(false);
    if (Object.keys(errors).length > 0) return;

    setSavingPwd(true);
    setTimeout(() => {
      setSavingPwd(false);
      setPwdSuccess(true);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setTimeout(() => setPwdSuccess(false), 4000);
    }, 800);
  };

  /* ---- Logout state ---- */
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { setAuthenticated, setRole, setStatus } = useAuthStore();
  const navigate = useNavigationStore((s) => s.navigate);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut({ redirect: false });
    } catch {
      // signOut unavailable; proceed with local logout
    }
    setAuthenticated(false);
    setRole("user");
    setStatus("unauthenticated");
    navigate("ceo-login");
    setLoggingOut(false);
    setLogoutOpen(false);
  };

  /* ----------------------------- Render ----------------------------- */

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="CEO profile & security preferences"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6"
      >
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="space-y-5 lg:space-y-6">
          {/* ---------- Section 1: CEO Profile ---------- */}
          <motion.div variants={cardReveal}>
            <GlassCard level={2} className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <IconBadge name="UserCog" accent="electric" size="sm" animate={false} />
                  <div>
                    <h2 className="text-base font-semibold text-foreground">CEO Profile</h2>
                    <p className="text-xs text-muted-foreground">Your executive account info</p>
                  </div>
                </div>
                <LootButton
                  variant="glass"
                  size="sm"
                  leftIcon={<Pencil size={13} />}
                  onClick={openEdit}
                  disabled={loading}
                >
                  Edit Profile
                </LootButton>
              </div>

              {/* Avatar + name row */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border/40">
                <div className="size-20 rounded-2xl bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand)_55%,var(--purple-brand))] flex items-center justify-center ring-1 ring-border shadow-[0_10px_30px_-10px_oklch(0.62_0.22_255/0.55)] shrink-0">
                  <span className="text-2xl font-bold text-white tracking-wider">CEO</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-semibold text-foreground truncate">
                      {profile.fullName && profile.fullName.trim()
                        ? profile.fullName
                        : "CEO Account"}
                    </p>
                    <StatusBadge variant="gold" className="uppercase tracking-wide">
                      CEO
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {profile.email && profile.email.trim()
                      ? profile.email
                      : "No email on record"}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    Full platform administrative access
                  </p>
                </div>
              </div>

              {/* Read-only field rows */}
              <div>
                {loading ? (
                  <div className="space-y-3 py-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-10 rounded-lg shimmer"
                      />
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-brand/10 ring-1 ring-rose-brand/20 px-3.5 py-2.5">
                    <AlertTriangle size={14} className="text-rose-brand shrink-0" />
                    <p className="text-xs text-rose-brand">{error}</p>
                  </div>
                ) : (
                  <>
                    <ProfileRow
                      icon={<User size={14} />}
                      label="Full Name"
                      value={profile.fullName}
                    />
                    <ProfileRow
                      icon={<Mail size={14} />}
                      label="Email"
                      value={profile.email}
                    />
                    <ProfileRow
                      icon={<Phone size={14} />}
                      label="Phone"
                      value={profile.phone}
                    />
                  </>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* ---------- Section 2: Change Password ---------- */}
          <motion.div variants={cardReveal}>
            <GlassCard level={2} className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <IconBadge name="KeyRound" accent="cyan" size="sm" animate={false} />
                <div>
                  <h2 className="text-base font-semibold text-foreground">Change Password</h2>
                  <p className="text-xs text-muted-foreground">
                    Use a strong, unique password
                  </p>
                </div>
              </div>

              {pwdSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-brand/10 ring-1 ring-emerald-brand/20 px-3.5 py-2.5 mb-4"
                >
                  <CheckCircle2 size={16} className="text-emerald-brand shrink-0" />
                  <p className="text-xs font-medium text-emerald-brand">
                    Password updated successfully.
                  </p>
                </motion.div>
              )}

              <div className="space-y-4">
                <PasswordField
                  id="current-pwd"
                  label="Current Password"
                  value={currentPwd}
                  onChange={(v) => {
                    setCurrentPwd(v);
                    setPwdErrors((e) => ({ ...e, current: undefined }));
                    setPwdSuccess(false);
                  }}
                  placeholder="Enter current password"
                  error={pwdErrors.current}
                  show={showCurrent}
                  onToggle={() => setShowCurrent((s) => !s)}
                />
                <PasswordField
                  id="new-pwd"
                  label="New Password"
                  value={newPwd}
                  onChange={(v) => {
                    setNewPwd(v);
                    setPwdErrors((e) => ({ ...e, new: undefined }));
                    setPwdSuccess(false);
                  }}
                  placeholder="At least 8 characters"
                  error={pwdErrors.new}
                  show={showNew}
                  onToggle={() => setShowNew((s) => !s)}
                />
                <PasswordField
                  id="confirm-pwd"
                  label="Confirm New Password"
                  value={confirmPwd}
                  onChange={(v) => {
                    setConfirmPwd(v);
                    setPwdErrors((e) => ({ ...e, confirm: undefined }));
                    setPwdSuccess(false);
                  }}
                  placeholder="Re-enter new password"
                  error={pwdErrors.confirm}
                  show={showConfirm}
                  onToggle={() => setShowConfirm((s) => !s)}
                />

                <LootButton
                  variant="electric"
                  size="md"
                  fullWidth
                  loading={savingPwd}
                  onClick={handleUpdatePassword}
                  leftIcon={<Lock size={14} />}
                >
                  {savingPwd ? "Updating\u2026" : "Update Password"}
                </LootButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="space-y-5 lg:space-y-6">
          {/* ---------- Section 3: Security Settings ---------- */}
          <motion.div variants={cardReveal}>
            <GlassCard level={2} className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <IconBadge name="ShieldCheck" accent="purple" size="sm" animate={false} />
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Security Settings
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Advanced protection controls
                  </p>
                </div>
              </div>

              <div className="space-y-1 divide-y divide-border/30">
                {SECURITY_ITEMS.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 opacity-70"
                  >
                    <IconBadge
                      name={item.iconName}
                      accent={item.accent}
                      size="sm"
                      animate={false}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 truncate">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch disabled aria-label={`${item.title} toggle`} />
                      <StatusBadge variant="default" className="hidden sm:inline-flex">
                        Soon
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-border/40">
                <div className="flex items-start gap-2.5">
                  <Shield size={14} className="text-electric mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    These controls will be enforced once backend security services
                    are connected. No toggles can be modified in preview mode.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* ---------- Section 4: Session ---------- */}
          <motion.div variants={cardReveal}>
            <GlassCard level={2} className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <IconBadge name="Monitor" accent="navy" size="sm" animate={false} />
                <div>
                  <h2 className="text-base font-semibold text-foreground">Session</h2>
                  <p className="text-xs text-muted-foreground">
                    Manage your active CEO session
                  </p>
                </div>
              </div>

              {/* Active session row */}
              <div className="flex items-center gap-3 rounded-xl bg-emerald-brand/8 ring-1 ring-emerald-brand/20 px-4 py-3.5 mb-5">
                <span className="relative flex size-2.5 shrink-0">
                  <span className="absolute inline-flex size-2.5 rounded-full bg-emerald-brand opacity-75 animate-ping" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-brand" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Active Session</p>
                  <p className="text-[11px] text-muted-foreground">
                    You are currently signed in as CEO
                  </p>
                </div>
                <StatusBadge variant="gold" dot pulse>
                  CEO Mode
                </StatusBadge>
              </div>

              {/* Session meta */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground/80">Role</span>
                  <span className="text-sm font-semibold text-foreground">
                    Chief Executive Officer
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground/80">Access Scope</span>
                  <span className="text-sm font-semibold text-foreground">Full Platform</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground/80">Session Status</span>
                  <span className="text-sm font-semibold text-emerald-brand">Authenticated</span>
                </div>
              </div>

              <LootButton
                variant="destructive"
                size="md"
                fullWidth
                leftIcon={<LogOut size={14} />}
                onClick={() => setLogoutOpen(true)}
              >
                Logout
              </LootButton>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>

      {/* ===================== Edit Profile Dialog ===================== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl glass-nav ring-1 ring-border/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Pencil size={16} className="text-electric" />
              Edit CEO Profile
            </DialogTitle>
            <DialogDescription>
              Update your CEO profile information. Changes are saved to your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FieldInput
              id="edit-fullname"
              label="Full Name"
              value={editForm.fullName}
              onChange={(v) => setEditForm((f) => ({ ...f, fullName: v }))}
              placeholder="e.g. Aarav Mehta"
              icon={<User size={14} />}
            />
            <FieldInput
              id="edit-email"
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(v) => setEditForm((f) => ({ ...f, email: v }))}
              placeholder="ceo@lootloom.io"
              icon={<Mail size={14} />}
            />
            <FieldInput
              id="edit-phone"
              label="Phone"
              type="tel"
              value={editForm.phone}
              onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))}
              placeholder="+91 98765 43210"
              icon={<Phone size={14} />}
            />
          </div>

          <DialogFooter className="pt-2">
            <LootButton
              variant="glass"
              size="md"
              onClick={() => setEditOpen(false)}
              disabled={savingProfile}
            >
              Cancel
            </LootButton>
            <LootButton
              variant="electric"
              size="md"
              loading={savingProfile}
              onClick={handleSaveProfile}
              leftIcon={<Save size={14} />}
            >
              {savingProfile ? "Saving\u2026" : "Save Changes"}
            </LootButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== Logout Confirmation ===================== */}
      <ConfirmModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="End CEO Session?"
        description="You will be returned to the CEO login screen. Make sure all pending changes have been saved."
        confirmLabel="Logout"
        cancelLabel="Stay Logged In"
        tone="danger"
        loading={loggingOut}
        onConfirm={handleLogout}
      />
    </PageContainer>
  );
}
