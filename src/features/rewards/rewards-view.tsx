"use client";

import { useState, useEffect } from "react";
import { Wallet, Banknote, Hash, X } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  LootButton,
  GlassLoader,
  EmptyState,
  ErrorState,
  PortalModal,
} from "@/components/lootloom";
import { useWalletStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import { COINS_PER_INR } from "@/lib/coin-config";

interface RewardItem {
  id: string;
  name: string;
  description: string;
  coinCost: number;
  category: string;
  stock: number;
  status: string;
}

function UpiPopup({ reward, open, onClose }: {
  reward: RewardItem;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { availableCoins } = useWalletStore();
  const [upiId, setUpiId] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!upiId.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId: reward.id,
          paymentMethod: "UPI",
          paymentDetails: upiId.trim(),
          userNote: note.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast({ title: "Redeem Submitted", description: "Pending CEO approval", variant: "default" });
        setUpiId("");
        setNote("");
        onClose();
      } else {
        toast({ title: "Error", description: json.message || "Redeem failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalModal open={open} onClose={onClose}>
      <GlassCard level={3} sheen reflect className="overflow-hidden shadow-[var(--shadow-xl)]">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">UPI Withdrawal</h2>
            <button onClick={onClose} aria-label="Close" className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl glass-1 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
              <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums">{reward.name}</p>
            </div>
            <div className="rounded-xl glass-1 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Coins Required</p>
              <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums">{reward.coinCost.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="rounded-xl glass-1 p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className={`text-sm font-bold tabular-nums ${availableCoins >= reward.coinCost ? "text-emerald-brand" : "text-rose-brand"}`}>
              {availableCoins.toLocaleString("en-IN")} coins
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="example@upi"
              className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Note <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for the CEO..."
              rows={2}
              className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric transition-shadow resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <LootButton variant="ghost" size="md" fullWidth onClick={onClose} leftIcon={<X size={15} />}>
              Cancel
            </LootButton>
            <LootButton variant="electric" size="md" fullWidth loading={saving} onClick={handleSubmit} disabled={!upiId.trim()}>
              {saving ? "Submitting..." : "Confirm"}
            </LootButton>
          </div>
        </div>
      </GlassCard>
    </PortalModal>
  );
}

function RedeemCodePopup({ reward, open, onClose }: {
  reward: RewardItem;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { availableCoins } = useWalletStore();
  const [gameName, setGameName] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!gameName.trim() || !gameUid.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId: reward.id,
          paymentMethod: "REDEEM_CODE",
          paymentDetails: JSON.stringify({ gameName: gameName.trim(), gameUid: gameUid.trim() }),
          userNote: notes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast({ title: "Request Submitted", description: "CEO will provide the redeem code", variant: "default" });
        setGameName("");
        setGameUid("");
        setNotes("");
        onClose();
      } else {
        toast({ title: "Error", description: json.message || "Request failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalModal open={open} onClose={onClose}>
      <GlassCard level={3} sheen reflect className="overflow-hidden shadow-[var(--shadow-xl)]">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Redeem Code</h2>
            <button onClick={onClose} aria-label="Close" className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl glass-1 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
              <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums">{reward.name}</p>
            </div>
            <div className="rounded-xl glass-1 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Coins Required</p>
              <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums">{reward.coinCost.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="rounded-xl glass-1 p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className={`text-sm font-bold tabular-nums ${availableCoins >= reward.coinCost ? "text-emerald-brand" : "text-rose-brand"}`}>
              {availableCoins.toLocaleString("en-IN")} coins
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Game Name</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter game name"
              className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Game UID</label>
            <input
              type="text"
              value={gameUid}
              onChange={(e) => setGameUid(e.target.value)}
              placeholder="Enter your in-game UID"
              className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric transition-shadow resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <LootButton variant="ghost" size="md" fullWidth onClick={onClose} leftIcon={<X size={15} />}>
              Cancel
            </LootButton>
            <LootButton variant="electric" size="md" fullWidth loading={saving} onClick={handleSubmit} disabled={!gameName.trim() || !gameUid.trim()}>
              {saving ? "Submitting..." : "Submit"}
            </LootButton>
          </div>
        </div>
      </GlassCard>
    </PortalModal>
  );
}

export function RewardsView() {
  const { availableCoins } = useWalletStore();
  const [tab, setTab] = useState<"upi" | "redeem-code">("upi");
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [upiOpen, setUpiOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 15000);
    fetch("/api/rewards", { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Server error: " + r.status);
        return r.json();
      })
      .then((json) => {
        if (json.success) setRewards(json.data);
        else setError("Failed to load rewards");
      })
      .catch((err) => {
        if ((err as Error)?.name === "AbortError") return;
        setError("Network error");
      })
      .finally(() => { clearTimeout(timeoutId); setLoading(false); });
    return () => { clearTimeout(timeoutId); ctrl.abort(); };
  }, []);

  const upiRewards = rewards.filter((r) => r.category === "UPI");
  const codeRewards = rewards.filter((r) => r.category === "REDEEM_CODE");
  const cashValue = (availableCoins / COINS_PER_INR).toFixed(2);

  return (
    <PageContainer>
      <PageHeader
        title="Redeem"
        description="Redeem your coins for cash or game codes"
      />

      {/* Balance Card */}
      <div className="mb-6">
        <GlassCard level={3} sheen className="p-5 sm:p-6 shadow-[var(--shadow-lg)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand)_60%,var(--purple-brand))] flex items-center justify-center shadow-[var(--shadow-glow)] shrink-0">
                <Wallet size={24} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Current Balance</p>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {availableCoins.toLocaleString("en-IN")} <span className="text-base text-muted-foreground font-normal">coins</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <p className="text-xs text-muted-foreground font-medium">Equivalent Cash</p>
              <p className="text-2xl font-bold text-gold tabular-nums">₹{cashValue}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex bg-accent/30 rounded-xl p-1 border border-border/60">
          <button
            onClick={() => setTab("upi")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              tab === "upi"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Banknote size={16} />
            UPI Withdrawal
          </button>
          <button
            onClick={() => setTab("redeem-code")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              tab === "redeem-code"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Hash size={16} />
            Redeem Code
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <GlassLoader label="Loading rewards..." />
        </div>
      ) : error ? (
        <ErrorState icon="AlertCircle" title="Failed to load" description={error} />
      ) : (tab === "upi" ? upiRewards : codeRewards).length === 0 ? (
        <EmptyState
          icon={tab === "upi" ? "Banknote" : "Hash"}
          title="No rewards available"
          description={tab === "upi" ? "UPI withdrawal options will appear here once available." : "Redeem code options will appear here once available."}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {(tab === "upi" ? upiRewards : codeRewards).map((reward) => (
            <GlassCard
              key={reward.id}
              level={2}
              hover
              className="p-4 cursor-pointer group"
              onClick={() => {
                setSelectedReward(reward);
                if (tab === "upi") setUpiOpen(true);
                else setCodeOpen(true);
              }}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`size-10 rounded-xl ring-1 flex items-center justify-center group-hover:scale-110 transition-transform ${
                  tab === "upi"
                    ? "bg-emerald-brand/10 ring-emerald-brand/20"
                    : "bg-purple-brand/10 ring-purple-brand/20"
                }`}>
                  {tab === "upi" ? (
                    <Banknote size={18} className="text-emerald-brand" />
                  ) : (
                    <Hash size={18} className="text-purple-brand" />
                  )}
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums">{reward.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{reward.coinCost.toLocaleString("en-IN")} coins</p>
                </div>
                {availableCoins >= reward.coinCost ? (
                  <span className="text-xs font-semibold text-emerald-brand bg-emerald-brand/10 px-3 py-1 rounded-full">
                    Redeem Now
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-rose-brand bg-rose-brand/10 px-3 py-1 rounded-full">
                    Insufficient Coins
                  </span>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Portal modals — rendered outside component tree via createPortal */}
      {selectedReward && selectedReward.category === "UPI" && (
        <UpiPopup key="upi-popup" reward={selectedReward} open={upiOpen} onClose={() => { setUpiOpen(false); setSelectedReward(null); }} />
      )}
      {selectedReward && selectedReward.category === "REDEEM_CODE" && (
        <RedeemCodePopup key="code-popup" reward={selectedReward} open={codeOpen} onClose={() => { setCodeOpen(false); setSelectedReward(null); }} />
      )}
    </PageContainer>
  );
}
