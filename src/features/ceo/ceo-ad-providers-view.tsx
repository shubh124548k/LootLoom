"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Ban,
  CheckCircle2,
  DollarSign,
  Eye,
  EyeOff,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Target,
  Zap,
} from "lucide-react";
import {
  GlassCard,
  LootButton,
  PageContainer,
  PageHeader,
  EmptyState,
  ErrorState,
  StatusBadge,
} from "@/components/lootloom";
import { cardReveal, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/* ============================================================
   Types
   ============================================================ */
interface AdProviderData {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  priority: number;
  publisherId: string;
  zoneId: string;
  apiKey: string;
  hasCredentials: boolean;
  rewardAmount: number;
  dailyLimit: number;
  timeoutMs: number;
  status: string;
  successRate: number;
  fillRate: number;
  todayRevenue: number;
  todayAds: number;
  totalRevenue: number;
  completedAds: number;
  failedAds: number;
  lastErrorAt: string | null;
  lastSuccessAt: string | null;
}

interface ApiResponse {
  success: boolean;
  data: AdProviderData[];
}

/* ============================================================
   Helpers
   ============================================================ */
function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function providerStatusBadge(status: string) {
  const variant =
    status === "active"
      ? "success"
      : status === "error" || status === "failed"
      ? "error"
      : status === "degraded"
      ? "warning"
      : "default";
  return (
    <StatusBadge variant={variant} dot pulse={status === "active"}>
      {status}
    </StatusBadge>
  );
}

function providerHealthDetails(status: string): { label: string; variant: "success" | "warning" | "error" | "info" | "default"; pulse?: boolean } {
  switch (status) {
    case "active": return { label: "Healthy", variant: "success", pulse: true };
    case "not_configured": return { label: "Not Configured", variant: "warning" };
    case "waiting": return { label: "Waiting", variant: "info" };
    case "initializing": return { label: "Initializing", variant: "info", pulse: true };
    case "disabled": return { label: "Disabled", variant: "default" };
    case "error": return { label: "Error", variant: "error", pulse: true };
    case "degraded": return { label: "Degraded", variant: "warning" };
    default: return { label: "Unknown", variant: "default" };
  }
}

/* ============================================================
   EditField — inline editable input
   ============================================================ */
function EditField({
  label,
  value,
  onChange,
  type = "text",
  mono,
  suffix,
  masked,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  mono?: boolean;
  suffix?: string;
  masked?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isMasked = masked && !show;

  return (
    <div className="space-y-1 min-w-0">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </label>
      <div className="relative">
        <input
          type={isMasked ? "password" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-9 w-full rounded-lg glass-2 ring-1 ring-border text-sm px-2.5 outline-none transition-all",
            "focus:ring-2 focus:ring-electric/40 focus:bg-background/40",
            mono && "font-mono text-xs tracking-tight"
          )}
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 pointer-events-none">
            {suffix}
          </span>
        )}
        {masked && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 size-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            aria-label={show ? "Hide API key" : "Show API key"}
          >
            {show ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   StatBadge — small metric display
   ============================================================ */
function StatBadge({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "emerald" | "gold" | "electric" | "rose" | "cyan";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-brand"
      : accent === "gold"
      ? "text-gold"
      : accent === "electric"
      ? "text-electric"
      : accent === "rose"
      ? "text-rose-brand"
      : accent === "cyan"
      ? "text-cyan-brand"
      : "text-foreground";

  return (
    <div className="flex items-center gap-1.5 rounded-lg glass-1 ring-1 ring-border/40 px-3 py-2 min-w-0">
      <span className="text-muted-foreground/60 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 truncate">
          {label}
        </p>
        <p className={cn("text-sm font-bold tabular-nums truncate", accentClass)}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Provider Card
   ============================================================ */
interface ProviderCardProps {
  provider: AdProviderData;
  changes: Partial<AdProviderData>;
  onFieldChange: (field: string, value: string | number | boolean) => void;
  onSave: () => void;
  onToggle: () => void;
  onTest: () => void;
  onReset: () => void;
  saving: boolean;
  testing: boolean;
}

function ProviderCard({
  provider,
  changes,
  onFieldChange,
  onSave,
  onToggle,
  onTest,
  onReset,
  saving,
  testing,
}: ProviderCardProps) {
  const hasChanges = Object.keys(changes).length > 0;
  const isEnabled = changes.enabled ?? provider.enabled;

  return (
    <GlassCard level={2} className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-border/40">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-foreground truncate">
              {provider.name}
            </h3>
            <StatusBadge
              variant={isEnabled ? "success" : "default"}
              dot
            >
              {isEnabled ? "Enabled" : "Disabled"}
            </StatusBadge>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground/60 truncate">
            {provider.key}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge variant={providerHealthDetails(provider.status).variant} dot pulse={providerHealthDetails(provider.status).pulse}>
            {providerHealthDetails(provider.status).label}
          </StatusBadge>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <StatBadge
          icon={<Target size={12} />}
          label="Fill Rate"
          value={formatPercent(provider.fillRate)}
          accent="cyan"
        />
        <StatBadge
          icon={<Zap size={12} />}
          label="Success Rate"
          value={formatPercent(provider.successRate)}
          accent="emerald"
        />
        <StatBadge
          icon={<DollarSign size={12} />}
          label="Today"
          value={formatCurrency(provider.todayRevenue)}
          accent="gold"
        />
        <StatBadge
          icon={<Activity size={12} />}
          label="Total"
          value={formatCurrency(provider.totalRevenue)}
          accent="electric"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="rounded-lg glass-1 ring-1 ring-border/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Completed
          </p>
          <p className="text-sm font-bold text-emerald-brand tabular-nums">
            {formatCount(provider.completedAds)}
          </p>
        </div>
        <div className="rounded-lg glass-1 ring-1 ring-border/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Failed
          </p>
          <p className="text-sm font-bold text-rose-brand tabular-nums">
            {formatCount(provider.failedAds)}
          </p>
        </div>
        <div className="rounded-lg glass-1 ring-1 ring-border/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Last Error
          </p>
          <p className="text-sm font-medium tabular-nums text-muted-foreground truncate">
            {formatTimestamp(provider.lastErrorAt)}
          </p>
        </div>
        <div className="rounded-lg glass-1 ring-1 ring-border/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Priority
          </p>
          <p className="text-sm font-bold text-electric tabular-nums">
            {changes.priority ?? provider.priority}
          </p>
        </div>
      </div>

      {/* Provider Health */}
      <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1">
          <span className={cn("size-2 rounded-full", provider.lastSuccessAt ? "bg-emerald-brand" : "bg-muted")} />
          Last Success: {provider.lastSuccessAt ? formatTimestamp(provider.lastSuccessAt) : "Never"}
        </span>
        <span className="text-muted-foreground/40">|</span>
        <span className="inline-flex items-center gap-1">
          <span className={cn("size-2 rounded-full", provider.lastErrorAt ? "bg-rose-brand" : "bg-muted")} />
          Last Failure: {provider.lastErrorAt ? formatTimestamp(provider.lastErrorAt) : "Never"}
        </span>
        <span className="text-muted-foreground/40">|</span>
        <span className="inline-flex items-center gap-1">
          <Activity size={11} className="text-muted-foreground/60" />
          Priority: {provider.priority}
        </span>
      </div>

      {/* Configurable fields */}
      <div className="space-y-3 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
          Configuration
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Credentials status */}
          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 rounded-lg glass-1 ring-1 ring-border/40 px-3 py-2">
            <span className={cn("size-2 rounded-full", provider.hasCredentials ? "bg-emerald-brand" : "bg-amber-brand")} />
            <span className="text-xs text-muted-foreground">
              {provider.hasCredentials
                ? "Credentials configured. Enter new values to replace existing credentials."
                : "No credentials configured. Add credentials to enable this provider."}
            </span>
          </div>
          <EditField
            label="Publisher ID"
            value={changes.publisherId ?? ""}
            onChange={(v) => onFieldChange("publisherId", v)}
            mono
          />
          <EditField
            label="Zone ID"
            value={changes.zoneId ?? ""}
            onChange={(v) => onFieldChange("zoneId", v)}
            mono
          />
          <EditField
            label="API Key"
            value={changes.apiKey ?? ""}
            onChange={(v) => onFieldChange("apiKey", v)}
            mono
            masked
          />
          <EditField
            label="Reward per Ad"
            value={String(changes.rewardAmount ?? provider.rewardAmount)}
            onChange={(v) => onFieldChange("rewardAmount", Number(v) || 0)}
            type="number"
            suffix="USD"
          />
          <EditField
            label="Daily Limit"
            value={String(changes.dailyLimit ?? provider.dailyLimit)}
            onChange={(v) => onFieldChange("dailyLimit", Number(v) || 0)}
            type="number"
          />
          <EditField
            label="Timeout (ms)"
            value={String(changes.timeoutMs ?? provider.timeoutMs)}
            onChange={(v) => onFieldChange("timeoutMs", Number(v) || 0)}
            type="number"
            mono
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center flex-wrap gap-2 pt-3 border-t border-border/40">
        <LootButton
          variant="electric"
          size="sm"
          leftIcon={<Save size={13} />}
          onClick={onSave}
          loading={saving}
          disabled={!hasChanges || saving}
        >
          {saving ? "Saving..." : "Save"}
        </LootButton>
        <LootButton
          variant={isEnabled ? "gold" : "emerald"}
          size="sm"
          leftIcon={isEnabled ? <Ban size={13} /> : <CheckCircle2 size={13} />}
          onClick={onToggle}
        >
          {isEnabled ? "Disable" : "Enable"}
        </LootButton>
        <LootButton
          variant="glass"
          size="sm"
          leftIcon={<Play size={13} />}
          onClick={onTest}
          loading={testing}
        >
          Test
        </LootButton>
        <LootButton
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw size={13} />}
          onClick={onReset}
        >
          Reset
        </LootButton>
      </div>
    </GlassCard>
  );
}

/* ============================================================
   Main View
   ============================================================ */
export function CeoAdProvidersView() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<AdProviderData[]>([]);

  const [changesMap, setChangesMap] = useState<Record<string, Partial<AdProviderData>>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ceo/ad-providers");
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const json: ApiResponse = await res.json();
      if (!json.success) throw new Error("Failed to load ad providers");
      setProviders(json.data ?? []);
      setChangesMap({});
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load ad providers";
      setError(message);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  function handleRefresh() {
    fetchProviders();
  }

  function handleFieldChange(providerId: string, field: string, value: string | number | boolean) {
    setChangesMap((prev) => ({
      ...prev,
      [providerId]: {
        ...(prev[providerId] ?? {}),
        [field]: value,
      },
    }));
  }

  async function handleSave(provider: AdProviderData) {
    const changes = changesMap[provider.id];
    if (!changes || Object.keys(changes).length === 0) return;

    setSavingIds((prev) => new Set(prev).add(provider.id));
    try {
      const res = await fetch("/api/ceo/ad-providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: provider.id, ...changes }),
      });
      if (!res.ok) throw new Error(`Failed to save (${res.status})`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to save");

      setProviders((prev) =>
        prev.map((p) =>
          p.id === provider.id ? { ...p, ...changes } : p
        )
      );
      setChangesMap((prev) => {
        const next = { ...prev };
        delete next[provider.id];
        return next;
      });

      toast({
        title: "Provider saved",
        description: `${provider.name} configuration updated successfully.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save provider";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(provider.id);
        return next;
      });
    }
  }

  function handleToggle(provider: AdProviderData) {
    const newEnabled = !(changesMap[provider.id]?.enabled ?? provider.enabled);
    handleFieldChange(provider.id, "enabled", newEnabled);
  }

  async function handleTest(provider: AdProviderData) {
    setTestingId(provider.id);
    try {
      const hasCredentials = provider.hasCredentials || changes.publisherId || changes.apiKey || changes.zoneId;
      if (!hasCredentials) {
        toast({
          title: "Provider not configured",
          description: "Add Publisher ID, Zone ID, or API Key first.",
          variant: "warning",
        });
        return;
      }
      const res = await fetch("/api/ceo/ad-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", providerId: provider.id }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast({
          title: "Test passed",
          description: `${provider.name} initialization successful. Ready for production.`,
        });
      } else {
        toast({
          title: "Test failed",
          description: json.message || "Provider initialization failed.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Test request failed";
      toast({
        title: "Test error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setTestingId(null);
    }
  }

  async function handleReset(provider: AdProviderData) {
    try {
      const res = await fetch("/api/ceo/ad-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", providerId: provider.id }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setProviders((prev) =>
          prev.map((p) =>
            p.id === provider.id
              ? { ...p, successRate: 0, fillRate: 0, todayRevenue: 0, totalRevenue: 0, completedAds: 0, failedAds: 0, lastErrorAt: null, lastSuccessAt: null }
              : p
          )
        );
        toast({
          title: "Stats reset",
          description: `${provider.name} statistics have been cleared.`,
        });
      } else {
        throw new Error(json.message || "Reset failed");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reset request failed";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }

  /* ===================== Render ===================== */

  return (
    <PageContainer>
      <PageHeader
        title="Ad Providers"
        description="Manage advertisement provider configurations"
        actions={
          <LootButton
            variant="glass"
            size="md"
            onClick={handleRefresh}
            leftIcon={<RefreshCw size={15} />}
            loading={loading}
          >
            Refresh
          </LootButton>
        }
      />

      {error ? (
        <ErrorState
          title="Failed to load providers"
          description={error}
          action={
            <LootButton variant="glass" size="md" onClick={handleRefresh} leftIcon={<RefreshCw size={15} />}>
              Retry
            </LootButton>
          }
        />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} level={2} className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded-md shimmer" />
                  <div className="h-3 w-1/3 rounded-md shimmer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-16 rounded-xl shimmer" />
                <div className="h-16 rounded-xl shimmer" />
                <div className="h-16 rounded-xl shimmer" />
                <div className="h-16 rounded-xl shimmer" />
              </div>
              <div className="h-8 rounded-lg shimmer" />
            </GlassCard>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <EmptyState
          icon="Zap"
          title="No ad providers"
          description="No advertisement providers have been configured yet."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6"
        >
          {providers.map((provider, i) => (
            <motion.div key={provider.id} variants={cardReveal} custom={i}>
              <ProviderCard
                provider={provider}
                changes={changesMap[provider.id] ?? {}}
                onFieldChange={(field, value) => handleFieldChange(provider.id, field, value)}
                onSave={() => handleSave(provider)}
                onToggle={() => handleToggle(provider)}
                onTest={() => handleTest(provider)}
                onReset={() => handleReset(provider)}
                saving={savingIds.has(provider.id)}
                testing={testingId === provider.id}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageContainer>
  );
}
