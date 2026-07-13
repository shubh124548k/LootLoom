"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  Target,
  Flame,
  CheckCircle,
  LogIn,
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
import { useNavigationStore, useWalletStore } from "@/stores";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Accent = "electric" | "cyan" | "purple" | "gold" | "emerald" | "rose" | "navy";

interface TipDef {
  id: string;
  title: string;
  body: string;
  icon: string;
  accent: Accent;
}

interface AdStatus {
  adsWatchedToday: number;
  dailyLimit: number;
  adsRemainingToday: number;
  rewardPerAd: number;
  earningsToday: number;
  dailyCoinLimit: number;
  remainingCoins: number;
  progressPercent: number;
  limitReached: boolean;
  nextReset: string;
  totalAdsWatched: number;
  totalAdEarnings: number;
}

interface MissionProgress {
  id: string;
  key: string;
  name: string;
  description: string | null;
  rewardCoins: number;
  requirement: number;
  progress: number;
  completed: boolean;
  claimedAt: string | null;
}

interface DailyLoginStatus {
  claimedToday: boolean;
  streak: number;
  todayReward: number;
}

interface ChartData {
  label: string;
  earned: number;
  redeemed: number;
}

const TIPS: TipDef[] = [
  {
    id: "t1",
    title: "Stack your rewards",
    body: "Watch ads and complete daily activities in the same session to build momentum faster.",
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
    title: "Complete missions",
    body: "Check the missions tab for bonus coin opportunities beyond ads and daily activities.",
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

function MiniStatBox({ icon, accent, label, value, sub }: { icon: string; accent: Accent; label: string; value: string; sub: string }) {
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

function CountdownTimer({ targetIso, onExpire }: { targetIso: string; onExpire?: () => void }) {
  const [display, setDisplay] = useState("00:00:00");
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    function tick() {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) {
        setDisplay("00:00:00");
        if (!expiredRef.current) {
          expiredRef.current = true;
          onExpire?.();
        }
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDisplay(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso, onExpire]);

  return (
    <span className="font-bold text-xl tabular-nums tracking-wider text-foreground">
      {display}
    </span>
  );
}

export function EarnView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { setWallet } = useWalletStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adStatus, setAdStatus] = useState<AdStatus | null>(null);
  const [missions, setMissions] = useState<MissionProgress[]>([]);
  const [dailyLogin, setDailyLogin] = useState<DailyLoginStatus | null>(null);
  const [weeklyChart, setWeeklyChart] = useState<ChartData[]>([]);
  const [watchLoading, setWatchLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const fetchIdRef = useRef(0);

  const parseJson = useCallback(async (result: PromiseSettledResult<Response>) => {
    if (result.status !== "fulfilled" || !result.value.ok) return null;
    try { return await result.value.json(); } catch { return null; }
  }, []);

  const fetchAll = useCallback(async () => {
    const id = ++fetchIdRef.current;
    const fetchWithTimeout = (url: string, ms: number) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), ms);
      return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
    };
    try {
      setError(null);
      const [adResult, missionResult, loginResult, walletResult] = await Promise.allSettled([
        fetchWithTimeout("/api/ads/status", 15000),
        fetchWithTimeout("/api/missions", 15000),
        fetchWithTimeout("/api/daily-login", 15000),
        fetchWithTimeout("/api/wallet/summary", 15000),
      ]);

      if (id !== fetchIdRef.current) return;

      const [adJson, missionJson, loginJson, walletJson] = await Promise.all([
        parseJson(adResult),
        parseJson(missionResult),
        parseJson(loginResult),
        parseJson(walletResult),
      ]);

      if (id !== fetchIdRef.current) return;

      if (adJson?.success) setAdStatus(adJson.data);
      if (missionJson?.success) setMissions(missionJson.data);
      if (loginJson?.success) setDailyLogin(loginJson.data);
      if (walletJson?.success && walletJson.data) {
        setWallet({
          availableCoins: walletJson.data.coinBalance ?? 0,
          lifetimeEarned: walletJson.data.totalEarned ?? 0,
          lifetimeRedeemed: walletJson.data.totalSpent ?? 0,
          todayEarnings: walletJson.data.todayEarnings ?? 0,
          weeklyEarnings: walletJson.data.weeklyEarnings ?? 0,
          monthlyEarnings: walletJson.data.monthlyEarnings ?? 0,
        });
        if (walletJson.data.weeklyChart) setWeeklyChart(walletJson.data.weeklyChart);
      }
      if (id === fetchIdRef.current) setLoading(false);
    } catch {
      if (id === fetchIdRef.current) { setError("Failed to load earn data"); setLoading(false); }
    }
  }, [setWallet, parseJson]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleWatchAd = async () => {
    setWatchLoading(true);
    let currentRenderer: { cleanup: () => void } | null = null;
    try {
      const sessionResp = await fetch("/api/ads/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adType: "REWARDED_VIDEO" }),
      });
      const sessionJson = await sessionResp.json();
      if (!sessionResp.ok || !sessionJson.success) {
        toast({
          title: "Ad unavailable",
          description: sessionJson.message || "Daily limit reached. Come back tomorrow!",
          variant: "default",
        });
        if (sessionJson.code === "DAILY_LIMIT_REACHED") fetchAll();
        return;
      }

      const { sessionId } = sessionJson.data;
      const providerKey = sessionJson.data.providerKey || "adsterra";

      const { getRenderer } = await import("@/lib/ads/client-renderer");
      const renderer = getRenderer(providerKey, sessionId);
      if (!renderer) {
        toast({ title: "Ad error", description: "No renderer available", variant: "destructive" });
        return;
      }
      currentRenderer = renderer;

      const result = await renderer.render();
      renderer.cleanup();
      currentRenderer = null;

      if (!result.success) {
        toast({ title: "Ad failed", description: result.error || "Could not show ad", variant: "destructive" });
        return;
      }

      const creditResp = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const creditJson = await creditResp.json();
      if (creditResp.ok && creditJson.success) {
        toast({ title: "Ad Reward!", description: `+${creditJson.data.rewardAmount} coins earned`, variant: "default" });
      } else {
        toast({ title: "Ad completed", description: creditJson.message || "Reward could not be credited", variant: "default" });
      }
      fetchAll();
    } catch {
      toast({ title: "Network error", description: "Could not load ad", variant: "destructive" });
    } finally {
      if (currentRenderer) currentRenderer.cleanup();
      setWatchLoading(false);
    }
  };

  const handleDailyLogin = async () => {
    setLoginLoading(true);
    try {
      const resp = await fetch("/api/daily-login", { method: "POST" });
      const json = await resp.json();
      if (resp.ok) {
        toast({ title: "Daily Login Reward!", description: `+${json.data?.amount || json.data?.newBalance || 0} coins claimed`, variant: "default" });
        fetchAll();
      } else {
        toast({ title: json.message || "Already claimed", variant: "default" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const missionCategories = [
    { key: "daily", label: "Daily", missions: missions.filter(m => m.key.startsWith("DAILY_") || m.key.startsWith("WATCH_")) },
    { key: "milestone", label: "Milestones", missions: missions.filter(m => m.key.startsWith("MILESTONE_")) },
    { key: "referral", label: "Referral", missions: missions.filter(m => m.key.startsWith("REFERRAL")) },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Earn Coins"
        description="Complete activities to earn rewards"
        actions={
          <>
            <LootButton variant="ghost" size="sm" leftIcon={<Info size={14} />} onClick={() => navigate("rewards")}>How it works</LootButton>
            <LootButton variant="electric" size="sm" leftIcon={<Coins size={14} />} onClick={() => navigate("wallet")}>View Wallet</LootButton>
          </>
        }
      />

      {error ? (
        <ErrorState icon="AlertCircle" title="Failed to load" description={error} />
      ) : loading ? (
        <div className="space-y-6">
          <SkeletonRow count={3} />
          <SkeletonRow count={2} />
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          {/* Hero — Watch Rewarded Ads */}
          <motion.div variants={cardReveal} custom={0}>
            <GlassCard level={1} sheen glow="electric" className="relative overflow-hidden p-6 lg:p-8">
              <motion.div variants={floating} animate="animate" className="absolute -top-16 -right-16 size-64 rounded-full bg-electric/20 blur-3xl pointer-events-none" />
              <motion.div variants={floatingSmall} animate="animate" className="absolute -bottom-20 -left-10 size-56 rounded-full bg-purple-brand/15 blur-3xl pointer-events-none" />
              <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge variant="gold" dot pulse>Earn Center Live</StatusBadge>
                    <StatusBadge variant="info" dot>Rewarded Ads Ready</StatusBadge>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Watch Rewarded Ads</h2>
                    <p className="text-sm text-muted-foreground max-w-md">Watch short video ads and earn coins instantly. New ad inventory refreshes every day.</p>
                  </div>
                  {adStatus && (
                    <div className="inline-flex items-center gap-3 rounded-xl glass-2 ring-1 ring-gold/25 px-4 py-2.5 self-start">
                      <motion.div variants={floatingSmall} animate="animate" className="size-9 rounded-lg bg-gold/15 ring-1 ring-gold/25 flex items-center justify-center">
                        <Coins size={18} className="text-gold" />
                      </motion.div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Reward Per Ad</p>
                        <p className="text-lg font-bold text-foreground">+<AnimatedCounter value={adStatus.rewardPerAd} /> <span className="text-xs font-medium text-muted-foreground">coins</span></p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <LootButton
                      variant="electric"
                      size="lg"
                      leftIcon={adStatus?.limitReached ? <Lock size={18} /> : <PlayCircle size={18} />}
                      onClick={handleWatchAd}
                      loading={watchLoading}
                      disabled={watchLoading || !!adStatus?.limitReached}
                    >
                      {adStatus?.limitReached ? "Daily Limit Reached" : "Watch Ad Now"}
                    </LootButton>
                    <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                      <Info size={11} /> Rewards credited after completion
                    </p>
                  </div>

                  {/* Live countdown — always visible */}
                  {adStatus && (
                    <div className="rounded-xl glass-2 ring-1 ring-electric/20 px-4 py-3 self-start flex items-center gap-3">
                      <Clock size={16} className={adStatus.limitReached ? "text-rose-400" : "text-electric"} />
                      <div>
                        <p className={`text-xs font-semibold ${adStatus.limitReached ? "text-rose-400" : "text-muted-foreground"}`}>
                          {adStatus.limitReached ? "Daily limit reached — resets in" : "Next reset in"}
                        </p>
                        <CountdownTimer targetIso={adStatus.nextReset} onExpire={fetchAll} />
                      </div>
                    </div>
                  )}
                </div>
                {adStatus && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <MiniStatBox icon="PlayCircle" accent="electric" label="Ads Remaining" value={`${adStatus.adsRemainingToday}`} sub={`of ${adStatus.dailyLimit}`} />
                      <MiniStatBox icon="Coins" accent="gold" label="Earned Today" value={`${adStatus.earningsToday}`} sub="coins" />
                      <MiniStatBox icon="Clock" accent="cyan" label="Watched Today" value={`${adStatus.adsWatchedToday}`} sub="ads" />
                      <MiniStatBox icon="Zap" accent="purple" label="Daily Limit" value={`${adStatus.dailyLimit}`} sub="ads" />
                    </div>
                    <GlassCard level={3} className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">Today&apos;s Ad Progress</span>
                        <span className="text-muted-foreground">{adStatus.adsWatchedToday} / {adStatus.dailyLimit} watched</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${adStatus.progressPercent}%` }}
                          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                          className={cn(
                            "h-full rounded-full",
                            adStatus.limitReached
                              ? "bg-rose-500"
                              : "bg-[linear-gradient(90deg,var(--electric),var(--cyan-brand))]"
                          )}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Estimated remaining: <span className="text-emerald-brand font-semibold">{adStatus.remainingCoins.toLocaleString("en-IN")} coins</span>
                      </p>
                    </GlassCard>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Daily Login */}
          <motion.div variants={cardReveal} custom={1}>
            <GlassCard level={2} sheen className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <IconBadge name="LogIn" accent={dailyLogin?.claimedToday ? "emerald" : "gold"} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Daily Login Reward</p>
                    <p className="text-xs text-muted-foreground">
                      {dailyLogin?.claimedToday
                        ? `Claimed today! Streak: ${dailyLogin.streak} day${dailyLogin.streak !== 1 ? "s" : ""}`
                        : `Log in daily for +${dailyLogin?.todayReward || 10} coins`}
                    </p>
                  </div>
                </div>
                {dailyLogin && (
                  <LootButton
                    variant={dailyLogin.claimedToday ? "outline" : "electric"}
                    size="sm"
                    leftIcon={dailyLogin.claimedToday ? <CheckCircle size={14} /> : <LogIn size={14} />}
                    onClick={handleDailyLogin}
                    loading={loginLoading}
                    disabled={dailyLogin.claimedToday}
                  >
                    {dailyLogin.claimedToday ? `Claimed (${dailyLogin.streak}d)` : `Claim ${dailyLogin.todayReward} coins`}
                  </LootButton>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Missions */}
          <motion.div variants={cardReveal} custom={2}>
            <WidgetCard title="Missions" description="Complete missions to earn bonus coins" icon={<Target size={18} />} index={0}>
              {missions.length === 0 ? (
                <EmptyState icon="Target" title="No missions available" description="New missions will appear here." />
              ) : (
                <div className="space-y-4">
                  {missionCategories.filter(c => c.missions.length > 0).map((cat) => (
                    <div key={cat.key}>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat.label}</h4>
                      <div className="space-y-2">
                        {cat.missions.map((m) => (
                          <GlassCard key={m.id} level={2} className={cn("p-3 flex items-center gap-3", m.completed && "ring-1 ring-emerald-500/30")}>
                            <IconBadge name={m.completed ? "CheckCircle" : "Target"} accent={m.completed ? "emerald" : "electric"} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{m.name}</p>
                                {m.completed && !m.claimedAt && <StatusBadge variant="success" dot pulse>Ready</StatusBadge>}
                                {m.claimedAt && <StatusBadge variant="default">Claimed</StatusBadge>}
                              </div>
                              {m.description && <p className="text-xs text-muted-foreground truncate">{m.description}</p>}
                              {!m.completed && m.requirement > 1 && (
                                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (m.progress / m.requirement) * 100)}%` }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full rounded-full bg-electric"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-gold">+{m.rewardCoins}</p>
                              {!m.completed && m.requirement > 1 && (
                                <p className="text-[10px] text-muted-foreground">{m.progress}/{m.requirement}</p>
                              )}
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </WidgetCard>
          </motion.div>

          {/* Earn Analytics */}
          <motion.div variants={cardReveal} custom={3}>
            <WidgetCard title="Earn Analytics" description="Track your earnings performance over time" icon={<TrendingUp size={18} />} index={0}>
              <GlassCard level={3} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Weekly Earnings</p>
                  <span className="text-xs text-muted-foreground">in coins</span>
                </div>
                {weeklyChart.length === 0 ? (
                  <EmptyState icon="TrendingUp" title="No analytics data yet" description="Your weekly earnings chart will appear here once you start earning." className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyChart} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                        <defs>
                          <linearGradient id="earnBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.62 0.22 255)" />
                            <stop offset="100%" stopColor="oklch(0.72 0.15 200)" />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={40} />
                        <Tooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
                        <Bar dataKey="earned" fill="url(#earnBar)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </GlassCard>
            </WidgetCard>
          </motion.div>

          {/* Tips */}
          <motion.div variants={cardReveal} custom={4}>
            <WidgetCard title="Tips & Recommendations" description="Optimize your earning strategy" icon={<Lightbulb size={18} />} index={0}>
              <Grid cols={4}>
                {TIPS.map((t, i) => (
                  <motion.div key={t.id} variants={cardReveal} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <GlassCard hover sheen level={2} className="p-4 flex gap-3 h-full">
                      <div className="shrink-0"><IconBadge name={t.icon} accent={t.accent} size="md" /></div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground">{t.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t.body}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </Grid>
            </WidgetCard>
          </motion.div>
        </motion.div>
      )}
    </PageContainer>
  );
}
