"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShoppingBag,
  AlertCircle,
  Inbox,
  Lock,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Grid,
  GlassCard,
  LootButton,
  IconBadge,
  StatusBadge,
  GlassLoader,
  EmptyState,
  ErrorState,
} from "@/components/lootloom";
import { useWalletStore } from "@/stores";
import { cardReveal, staggerContainer, modalPop, overlayFade } from "@/lib/animations";

// ============================================================
// Types — backend-ready interfaces
// ============================================================

interface RewardItem {
  id: string;
  name: string;
  cashValue: number;
  requiredCoins: number;
  availability: "available" | "disabled" | "soldout";
}

interface RedeemDialogProps {
  reward: RewardItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  currentCoins: number;
}

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  onViewHistory: () => void;
}

// ============================================================
// Constants — coin to cash conversion (backend will provide)
// ============================================================

const COIN_TO_INR = 100; // 100 coins = ₹1 (placeholder — backend will set actual rate)

// ============================================================
// REWARD CARD
// ============================================================

function RewardCard({
  reward,
  currentCoins,
  onRedeem,
  index,
}: {
  reward: RewardItem;
  currentCoins: number;
  onRedeem: (reward: RewardItem) => void;
  index: number;
}) {
  const canAfford = currentCoins >= reward.requiredCoins;
  const isAvailable = reward.availability === "available";

  return (
    <motion.div variants={cardReveal} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-30px" }}>
      <GlassCard
        level={2}
        sheen
        glow={isAvailable && canAfford ? "electric" : "none"}
        className="p-5 h-full flex flex-col gap-4 shadow-[var(--shadow-md)]"
      >
        {/* Reward icon + cash value */}
        <div className="flex items-start justify-between">
          <div className="size-14 rounded-2xl bg-[linear-gradient(135deg,var(--gold),oklch(0.75_0.18_60))] flex items-center justify-center shadow-[var(--shadow-sm)]">
            <Gift className="text-white" size={24} />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">₹{reward.cashValue}</p>
            <p className="text-xs text-muted-foreground">Cash Value</p>
          </div>
        </div>

        {/* Reward name */}
        <div>
          <h3 className="text-base font-semibold text-foreground">{reward.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {reward.requiredCoins.toLocaleString("en-IN")} coins required
          </p>
        </div>

        {/* Availability badge */}
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <StatusBadge variant="success" dot>Available</StatusBadge>
          ) : reward.availability === "soldout" ? (
            <StatusBadge variant="error" dot>Sold Out</StatusBadge>
          ) : (
            <StatusBadge variant="default" dot>Disabled</StatusBadge>
          )}
        </div>

        {/* Redeem button */}
        <div className="mt-auto" onClick={(e) => { if (isAvailable && canAfford) { e.preventDefault(); e.stopPropagation(); onRedeem(reward); } }}>
          {isAvailable ? (
            canAfford ? (
              <div
                role="button"
                tabIndex={0}
                className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-[linear-gradient(120deg,var(--electric),var(--cyan-brand)_60%,var(--purple-brand))] transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRedeem(reward); } }}
              >
                <ShoppingBag size={15} />
                Redeem
              </div>
            ) : (
              <div className="w-full h-10 rounded-xl text-sm font-semibold text-foreground border border-border bg-transparent flex items-center justify-center gap-2 opacity-50">
                <Lock size={15} />
                Insufficient Coins
              </div>
            )
          ) : (
            <div className="w-full h-10 rounded-xl text-sm font-semibold text-muted-foreground bg-transparent flex items-center justify-center opacity-50">
              Unavailable
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ============================================================
// REDEEM CONFIRMATION DIALOG
// ============================================================

function RedeemDialog({ reward, open, onClose, onConfirm, loading, currentCoins }: RedeemDialogProps) {
  const remaining = reward ? currentCoins - reward.requiredCoins : 0;

  return (
    <AnimatePresence>
      {open && reward && (
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
                  <h2 className="text-lg font-bold text-foreground">Confirm Redemption</h2>
                  <button onClick={onClose} aria-label="Close" className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Review the details before confirming your redeem request.</p>

                {/* Reward info */}
                <GlassCard level={1} className="p-4 flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-[linear-gradient(135deg,var(--gold),oklch(0.75_0.18_60))] flex items-center justify-center shrink-0">
                    <Gift className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{reward.name}</p>
                    <p className="text-xs text-muted-foreground">₹{reward.cashValue} cash value</p>
                  </div>
                </GlassCard>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl glass-1 p-3">
                    <p className="text-xs text-muted-foreground">Required Coins</p>
                    <p className="text-lg font-bold text-foreground">{reward.requiredCoins.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-xl glass-1 p-3">
                    <p className="text-xs text-muted-foreground">Cash Amount</p>
                    <p className="text-lg font-bold text-foreground">₹{reward.cashValue}</p>
                  </div>
                  <div className="rounded-xl glass-1 p-3">
                    <p className="text-xs text-muted-foreground">Current Balance</p>
                    <p className="text-lg font-bold text-foreground">{currentCoins.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-xl glass-1 p-3">
                    <p className="text-xs text-muted-foreground">After Redeem</p>
                    <p className="text-lg font-bold text-emerald-brand">{remaining.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <LootButton variant="ghost" size="md" fullWidth onClick={onClose} leftIcon={<X size={15} />}>
                    Cancel
                  </LootButton>
                  <LootButton
                    variant="electric"
                    size="md"
                    fullWidth
                    loading={loading}
                    onClick={onConfirm}
                    leftIcon={<Check size={15} />}
                  >
                    {loading ? "Processing…" : "Confirm Redeem"}
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

// ============================================================
// SUCCESS DIALOG
// ============================================================

function SuccessDialog({ open, onClose, onViewHistory }: SuccessDialogProps) {
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
              <div className="flex flex-col items-center text-center py-8 px-6 gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.1 }}
                  className="size-20 rounded-3xl bg-emerald-brand/10 ring-1 ring-emerald-brand/25 flex items-center justify-center"
                >
                  <Check className="text-emerald-brand" size={36} strokeWidth={2.5} />
                </motion.div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-foreground">Redeem Submitted</h2>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Your redeem request has been submitted and is pending CEO approval.
                    You'll be notified once it's processed.
                  </p>
                </div>

                <StatusBadge variant="warning" dot pulse>Pending CEO Approval</StatusBadge>

                <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
                  <LootButton variant="ghost" size="md" fullWidth onClick={onClose} leftIcon={<ArrowLeft size={15} />}>
                    Return to Dashboard
                  </LootButton>
                  <LootButton variant="electric" size="md" fullWidth onClick={onViewHistory} leftIcon={<ArrowRight size={15} />}>
                    View History
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

// ============================================================
// MAIN VIEW
// ============================================================

export function RewardsView() {
  const { availableCoins } = useWalletStore();
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  // Placeholder rewards — backend will provide these via API
  // These are UI-ready placeholders that will be replaced by GET /api/rewards
  const [rewards] = useState<RewardItem[]>([
    { id: "r1", name: "₹10 UPI Cash", cashValue: 10, requiredCoins: 1000, availability: "available" },
    { id: "r2", name: "₹20 UPI Cash", cashValue: 20, requiredCoins: 2000, availability: "available" },
    { id: "r3", name: "₹30 UPI Cash", cashValue: 30, requiredCoins: 3000, availability: "available" },
    { id: "r4", name: "₹40 UPI Cash", cashValue: 40, requiredCoins: 4000, availability: "available" },
    { id: "r5", name: "₹50 UPI Cash", cashValue: 50, requiredCoins: 5000, availability: "available" },
    { id: "r6", name: "₹100 UPI Cash", cashValue: 100, requiredCoins: 10000, availability: "available" },
    { id: "r7", name: "₹200 UPI Cash", cashValue: 200, requiredCoins: 20000, availability: "available" },
    { id: "r8", name: "₹500 UPI Cash", cashValue: 500, requiredCoins: 50000, availability: "available" },
    { id: "r9", name: "₹1000 UPI Cash", cashValue: 1000, requiredCoins: 100000, availability: "available" },
  ]);

  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const cashValue = (availableCoins / COIN_TO_INR).toFixed(2);

  const handleRedeemClick = (reward: RewardItem) => {
    setSelectedReward(reward);
    setRedeemOpen(true);
  };

  const handleConfirmRedeem = async () => {
    setRedeeming(true);
    // Backend will handle: validate balance, debit coins, create redeem request, notify CEO
    // Frontend just simulates the loading state for now
    await new Promise((r) => setTimeout(r, 1500));
    setRedeeming(false);
    setRedeemOpen(false);
    setSuccessOpen(true);
  };

  const handleCloseSuccess = () => {
    setSuccessOpen(false);
    setSelectedReward(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Rewards & Redeem"
        description="Redeem your coins for real cash rewards"
      />

      {/* Current Balance */}
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
              <p className="text-xs text-muted-foreground font-medium">Equivalent Cash Value</p>
              <p className="text-2xl font-bold text-gold">₹{cashValue}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Reward Grid */}
      {loading ? (
        <Grid cols={4}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl glass-2 shimmer" />
          ))}
        </Grid>
      ) : error ? (
        <ErrorState
          icon="AlertCircle"
          title="Unable to load rewards"
          description={error}
          action={<LootButton variant="electric" size="sm" onClick={() => window.location.reload()}>Retry</LootButton>}
        />
      ) : rewards.length === 0 ? (
        <EmptyState
          icon="Inbox"
          title="No rewards available"
          description="Check back later for new rewards to redeem."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Grid cols={4}>
            {rewards.map((reward, i) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                currentCoins={availableCoins}
                onRedeem={handleRedeemClick}
                index={i}
              />
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Redeem Confirmation Dialog */}
      <RedeemDialog
        reward={selectedReward}
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        onConfirm={handleConfirmRedeem}
        loading={redeeming}
        currentCoins={availableCoins}
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={successOpen}
        onClose={handleCloseSuccess}
        onViewHistory={handleCloseSuccess}
      />
    </PageContainer>
  );
}
