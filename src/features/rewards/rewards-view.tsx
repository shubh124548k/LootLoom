"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Banknote,
  Hash,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  LootButton,
  IconBadge,
  StatusBadge,
} from "@/components/lootloom";
import { useWalletStore, useNavigationStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import { cardReveal, modalPop, overlayFade } from "@/lib/animations";
import { COINS_PER_INR } from "@/lib/coin-config";

function UpiRedeemDialog({ open, onClose, onViewHistory }: {
  open: boolean;
  onClose: () => void;
  onViewHistory: () => void;
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
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayFade}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-foreground/30 backdrop-blur-md flex items-center justify-center px-4"
        >
          <motion.div
            variants={modalPop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard level={3} sheen reflect className="overflow-hidden shadow-[var(--shadow-xl)]">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">UPI Withdrawal</h2>
                  <button onClick={onClose} aria-label="Close" className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Enter your UPI ID to receive payment.</p>

                <div className="rounded-xl glass-1 p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Balance</span>
                  <span className="text-lg font-bold text-foreground">{availableCoins.toLocaleString("en-IN")} coins</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="example@upi"
                    className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Note <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note for the CEO..."
                    rows={2}
                    className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <LootButton variant="ghost" size="md" fullWidth onClick={onClose} leftIcon={<X size={15} />}>
                    Cancel
                  </LootButton>
                  <LootButton variant="electric" size="md" fullWidth loading={saving} onClick={handleSubmit} disabled={!upiId.trim()}>
                    {saving ? "Submitting..." : "Submit"}
                  </LootButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RedeemCodeDialog({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
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
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayFade}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-foreground/30 backdrop-blur-md flex items-center justify-center px-4"
        >
          <motion.div
            variants={modalPop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard level={3} sheen reflect className="overflow-hidden shadow-[var(--shadow-xl)]">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Redeem Code</h2>
                  <button onClick={onClose} aria-label="Close" className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Request a redeem code for your game.</p>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Game Name</label>
                  <input
                    type="text"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    placeholder="Enter game name"
                    className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Game UID</label>
                  <input
                    type="text"
                    value={gameUid}
                    onChange={(e) => setGameUid(e.target.value)}
                    placeholder="Enter your in-game UID"
                    className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional details..."
                    rows={2}
                    className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric resize-none"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RewardsView() {
  const { availableCoins } = useWalletStore();
  const navigate = useNavigationStore((s) => s.navigate);
  const [upiOpen, setUpiOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  const cashValue = (availableCoins / COINS_PER_INR).toFixed(2);

  return (
    <PageContainer>
      <PageHeader
        title="Redeem"
        description="Redeem your coins for cash or game codes"
      />

      {/* Balance */}
      <motion.div
        variants={cardReveal}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <GlassCard level={3} sheen className="p-6 shadow-[var(--shadow-lg)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-[linear-gradient(135deg,var(--electric),var(--cyan-brand)_60%,var(--purple-brand))] flex items-center justify-center shadow-[var(--shadow-glow)]">
                <IconBadge name="Wallet" accent="electric" size="lg" className="border-0 bg-transparent ring-0" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Current Balance</p>
                <p className="text-3xl font-bold text-foreground">
                  {availableCoins.toLocaleString("en-IN")} <span className="text-base text-muted-foreground">coins</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <p className="text-xs text-muted-foreground font-medium">Cash Value</p>
              <p className="text-2xl font-bold text-gold">₹{cashValue}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Redeem Options */}
      <motion.div
        variants={cardReveal}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* UPI Withdrawal */}
        <GlassCard hover level={2} sheen className="p-6 cursor-pointer" onClick={() => setUpiOpen(true)}>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="size-16 rounded-2xl bg-emerald-brand/10 ring-1 ring-emerald-brand/25 flex items-center justify-center">
              <Banknote size={28} className="text-emerald-brand" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">UPI Withdrawal</h3>
              <p className="text-sm text-muted-foreground mt-1">Redeem coins directly to your UPI account</p>
            </div>
            <StatusBadge variant="success" dot>Available</StatusBadge>
          </div>
        </GlassCard>

        {/* Redeem Code */}
        <GlassCard hover level={2} sheen className="p-6 cursor-pointer" onClick={() => setCodeOpen(true)}>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="size-16 rounded-2xl bg-purple-brand/10 ring-1 ring-purple-brand/25 flex items-center justify-center">
              <Hash size={28} className="text-purple-brand" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Redeem Code</h3>
              <p className="text-sm text-muted-foreground mt-1">Request a game redeem code</p>
            </div>
            <StatusBadge variant="success" dot>Available</StatusBadge>
          </div>
        </GlassCard>
      </motion.div>

      <UpiRedeemDialog
        open={upiOpen}
        onClose={() => setUpiOpen(false)}
        onViewHistory={() => navigate("history")}
      />

      <RedeemCodeDialog
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
      />
    </PageContainer>
  );
}
