"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronRight,
  Clock,
  Coins,
  Hash,
  Info,
  Lightbulb,
  Lock,
  PlayCircle,
  TrendingUp,
  Zap,
} from "lucide-react";

import {
  AnimatedCounter,
  EmptyState,
  ErrorState,
  GlassCard,
  Grid,
  IconBadge,
  LootButton,
  PageContainer,
  PageHeader,
  SkeletonRow,
  StatusBadge,
  WidgetCard,
} from "@/components/lootloom";
import {
  cardReveal,
  floating,
  floatingSmall,
  staggerContainer,
} from "@/lib/animations";
import { useNavigationStore } from "@/stores";
import { cn } from "@/lib/utils";

/* ============================================================
   Types
   ============================================================ */
type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

interface OfferProvider {
  id: string;
  name: string;
  description: string;
  rewardRange: string;
  completionRate: number;
  status: "active" | "low-inventory" | "coming-soon";
  accent: Accent;
}

interface TipDef {
  id: string;
  title: string;
  body: string;
  icon: string;
  accent: Accent;
}

interface AdStats {
  rewardPerAd: number;
  dailyLimit: number;
  adsWatchedToday: number;
  adsRemainingToday: number;
  earningsToday: number;
}

/* ============================================================
   Placeholder data (backend-ready — replace with API responses)
   ============================================================ */
// TODO: replace with fetch from /api/earn/offerwall/providers
const OFFER_PROVIDERS: OfferProvider[] = [];

// TODO: replace with fetch from /api/earn/analytics?period=weekly
const ANALYTICS_WEEKLY: { label: string; value: number }[] = [];

const TIPS: TipDef[] = [
  {
    id: "t1",
    title: "Stack your rewards",
    body: "Complete offerwall tasks and watch ads in the same session to build momentum faster.",
    icon: "Zap",
    accent: "electric",
  },
  {
    id: "t2",
    title: "Watch ads daily",
    body: "Watch your daily ads every day to keep a steady stream of coins flowing into your wallet.",
    icon: "Flame",
    accent: "rose",
  },
  {
    id: "t3",
    title: "Pick high-value offers",
    body: "Filter the offerwall by reward size. Surveys pay more but take longer — balance both.",
    icon: "Target",
    accent: "purple",
  },
  {
    id: "t4",
    title: "Verify your rewards",
    body: "Always complete the post-watch verification step so your ad rewards are credited instantly.",
    icon: "Lightbulb",
    accent: "emerald",
  },
];

/* ============================================================
   Helper components
   ============================================================ */
function OfferProviderCard({ provider, index }: { provider: OfferProvider; index: number }) {
  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <GlassCard hover sheen level={2} className="p-4 flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <IconBadge name="Hash" accent={provider.accent} size="md" />
            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate">{provider.name}</h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{provider.description}</p>
            </div>
          </div>
          {provider.status === "active" && <StatusBadge variant="success" dot pulse>Active</StatusBadge>}
          {provider.status === "low-inventory" && <StatusBadge variant="warning" dot>Low</StatusBadge>}
          {provider.status === "coming-soon" && <StatusBadge variant="default" dot>Soon</StatusBadge>}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-gold/12 ring-1 ring-gold/25 px-2.5 py-1">
            <Coins size={12} className="text-gold" />
            <span className="font-bold text-gold">{provider.rewardRange}</span>
          </div>
          <span className="text-muted-foreground">Completion {provider.completionRate}%</span>
        </div>

        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${provider.completionRate}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            className={cn(
              "h-full rounded-full",
              provider.completionRate >= 60 ? "bg-emerald-brand" : provider.completionRate >= 30 ? "bg-gold" : "bg-electric"
            )}
          />
        </div>

        <LootButton
          variant={provider.status === "coming-soon" ? "glass" : "outline"}
          size="sm"
          fullWidth
          disabled={provider.status === "coming-soon"}
          rightIcon={provider.status === "coming-soon" ? <Lock size={12} /> : <ChevronRight size={14} />}
        >
          {provider.status === "coming-soon" ? "Coming Soon" : "Browse Offers"}
        </LootButton>
      </GlassCard>
    </motion.div>
  );
}

function TipCard({ tip, index }: { tip: TipDef; index: number }) {
  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <GlassCard hover sheen level={2} className="p-4 flex gap-3 h-full">
        <div className="shrink-0">
          <IconBadge name={tip.icon} accent={tip.accent} size="md" />
        </div>
        <div className="space-y-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground">{tip.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{tip.body}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ============================================================
   Small reusable chart tooltip
   ============================================================ */
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg glass-3 ring-1 ring-border px-3 py-2 text-xs shadow-md">
      {label && <p className="font-semibold text-foreground mb-0.5">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: p.color ?? "var(--electric)" }} />
          <span className="font-semibold text-foreground tabular-nums">{p.value.toLocaleString("en-IN")}</span>
          <span>coins</span>
        </p>
      ))}
    </div>
  );
}

/* ============================================================
   Main view
   ============================================================ */
export function EarnView() {
  const navigate = useNavigationStore((s) => s.navigate);

  // Simulated loading state — replace with real fetch from /api/earn/offerwall/providers
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Only schedule the loading→false transition; loading is reset to true by the
    // retry handler (a user event) so we never call setState synchronously in the effect.
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setRetryCount((c) => c + 1);
  };

  // Placeholder ad stats — replace with GET /api/earn/ads
  const [adStats] = useState<AdStats>({
    rewardPerAd: 0,
    dailyLimit: 0,
    adsWatchedToday: 0,
    adsRemainingToday: 0,
    earningsToday: 0,
  });

  const adProgressPercent =
    adStats.dailyLimit > 0
      ? Math.min(100, Math.round((adStats.adsWatchedToday / adStats.dailyLimit) * 100))
      : 0;
  const estimatedRemainingToday = adStats.adsRemainingToday * adStats.rewardPerAd;

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Earn Coins"
        description="Complete activities to earn rewards"
        actions={
          <>
            <LootButton
              variant="ghost"
              size="sm"
              leftIcon={<Info size={14} />}
              onClick={() => navigate("rewards")}
            >
              How it works
            </LootButton>
            <LootButton
              variant="electric"
              size="sm"
              leftIcon={<Coins size={14} />}
              onClick={() => navigate("wallet")}
            >
              View Wallet
            </LootButton>
          </>
        }
      />

      {/* ============ 1. Hero — Watch Rewarded Ads ============ */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <GlassCard level={1} sheen glow="electric" className="relative overflow-hidden p-6 lg:p-8">
          {/* Decorative floating blobs */}
          <motion.div
            variants={floating}
            animate="animate"
            className="absolute -top-16 -right-16 size-64 rounded-full bg-electric/20 blur-3xl pointer-events-none"
          />
          <motion.div
            variants={floatingSmall}
            animate="animate"
            className="absolute -bottom-20 -left-10 size-56 rounded-full bg-purple-brand/15 blur-3xl pointer-events-none"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: headline + Watch Ad CTA */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge variant="gold" dot pulse>
                  Earn Center Live
                </StatusBadge>
                <StatusBadge variant="info" dot>
                  Rewarded Ads Ready
                </StatusBadge>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Watch Rewarded Ads
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Watch short video ads and earn coins instantly. New ad inventory refreshes every day.
                </p>
              </div>

              {/* Reward per ad highlight */}
              <div className="inline-flex items-center gap-3 rounded-xl glass-2 ring-1 ring-gold/25 px-4 py-2.5 self-start">
                <motion.div
                  variants={floatingSmall}
                  animate="animate"
                  className="size-9 rounded-lg bg-gold/15 ring-1 ring-gold/25 flex items-center justify-center"
                >
                  <Coins size={18} className="text-gold" />
                </motion.div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Reward Per Ad
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    +<AnimatedCounter value={adStats.rewardPerAd} />{" "}
                    <span className="text-xs font-medium text-muted-foreground">coins</span>
                  </p>
                </div>
              </div>

              {/* Big Watch Ad button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <LootButton
                  variant="electric"
                  size="lg"
                  leftIcon={<PlayCircle size={18} />}
                  disabled
                >
                  Watch Ad Now
                </LootButton>
                <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <Lock size={11} /> Ad SDK integration coming soon
                </p>
              </div>
            </div>

            {/* Right: stats + progress */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <MiniStatBox
                  icon="PlayCircle"
                  accent="electric"
                  label="Ads Remaining"
                  value={`${adStats.adsRemainingToday}`}
                  sub={`of ${adStats.dailyLimit}`}
                />
                <MiniStatBox
                  icon="Coins"
                  accent="gold"
                  label="Earned Today"
                  value={`${adStats.earningsToday}`}
                  sub="coins"
                />
                <MiniStatBox
                  icon="Clock"
                  accent="cyan"
                  label="Watched Today"
                  value={`${adStats.adsWatchedToday}`}
                  sub="ads"
                />
                <MiniStatBox
                  icon="Zap"
                  accent="purple"
                  label="Daily Limit"
                  value={`${adStats.dailyLimit}`}
                  sub="ads"
                />
              </div>

              <GlassCard level={3} className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Today&apos;s Ad Progress</span>
                  <span className="text-muted-foreground">
                    {adStats.adsWatchedToday} / {adStats.dailyLimit} watched
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${adProgressPercent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand))]"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Estimated today:{" "}
                  <span className="text-emerald-brand font-semibold">
                    {estimatedRemainingToday.toLocaleString("en-IN")} coins
                  </span>
                </p>
              </GlassCard>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ============ 2. Offerwall ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Offerwall"
          description="Complete offers from trusted providers for the biggest rewards"
          icon={<Hash size={18} />}
          action={<StatusBadge variant="info" dot>Provider network</StatusBadge>}
          glow="cyan"
          index={0}
        >
          {loading ? (
            <SkeletonRow count={3} />
          ) : error ? (
            <ErrorState
              icon="AlertCircle"
              title="Unable to load offers"
              description={error}
              action={
                <LootButton variant="electric" size="sm" onClick={handleRetry}>
                  Retry
                </LootButton>
              }
            />
          ) : OFFER_PROVIDERS.length === 0 ? (
            <EmptyState
              icon="Target"
              title="No offers available"
              description="New offerwall tasks will appear here once available."
            />
          ) : (
            <Grid cols={4}>
              {OFFER_PROVIDERS.map((p, i) => (
                <OfferProviderCard key={p.id} provider={p} index={i} />
              ))}
            </Grid>
          )}

          <div className="mt-5 flex items-center justify-center gap-2 pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <Info size={12} /> Provider inventory loads from the offerwall API.
            </p>
          </div>
        </WidgetCard>
      </section>

      {/* ============ 3. Reward History Preview ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Reward History"
          description="Recent completed earning activities"
          icon={<Clock size={18} />}
          action={
            <LootButton variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />} onClick={() => navigate("history")}>
              View history
            </LootButton>
          }
          index={0}
        >
          <div className="space-y-3">
            <SkeletonRow count={4} />
            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                <Info size={12} /> Full history table loads once you complete an activity.
              </p>
              <LootButton variant="outline" size="sm" onClick={() => navigate("history")} rightIcon={<ChevronRight size={14} />}>
                Open history
              </LootButton>
            </div>
          </div>
        </WidgetCard>
      </section>

      {/* ============ 4. Earn Analytics ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Earn Analytics"
          description="Track your earnings performance over time"
          icon={<TrendingUp size={18} />}
          index={0}
        >
          <GlassCard level={3} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Weekly Earnings
              </p>
              <span className="text-xs text-muted-foreground">in coins</span>
            </div>
            {ANALYTICS_WEEKLY.length === 0 ? (
              <EmptyState
                icon="TrendingUp"
                title="No analytics data yet"
                description="Your weekly earnings chart will appear here once you start earning."
                className="h-64"
              />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ANALYTICS_WEEKLY} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="earnBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.62 0.22 255)" />
                        <stop offset="100%" stopColor="oklch(0.72 0.15 200)" />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      width={40}
                    />
                    <Tooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
                    <Bar dataKey="value" fill="url(#earnBar)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>
        </WidgetCard>
      </section>

      {/* ============ 5. Tips & Recommendations ============ */}
      <section className="mb-8">
        <WidgetCard
          title="Tips & Recommendations"
          description="Optimize your earning strategy"
          icon={<Lightbulb size={18} />}
          index={0}
        >
          <Grid cols={4}>
            {TIPS.map((t, i) => (
              <TipCard key={t.id} tip={t} index={i} />
            ))}
          </Grid>
        </WidgetCard>
      </section>
    </PageContainer>
  );
}

/* ============================================================
   Small in-file primitives
   ============================================================ */
function MiniStatBox({
  icon,
  accent,
  label,
  value,
  sub,
}: {
  icon: string;
  accent: Accent;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <GlassCard level={3} className="p-3 flex items-center gap-3">
      <IconBadge name={icon} accent={accent} size="md" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium truncate">{label}</p>
        <p className="text-base font-bold text-foreground tabular-nums leading-tight">
          {value} <span className="text-[10px] font-medium text-muted-foreground">{sub}</span>
        </p>
      </div>
    </GlassCard>
  );
}
