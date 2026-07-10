"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { GlassCard } from "./glass-card";
import { LootButton } from "./loot-button";
import { PageContainer } from "./page-container";
import { useNavigationStore } from "@/stores";

/**
 * RestrictedAccess — premium glass security panel shown when a normal
 * user selects the CEO Dashboard. Never exposes administrator data.
 */
export function RestrictedAccess() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <PageContainer className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl"
      >
        <GlassCard level={3} sheen reflect className="overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,var(--rose-brand),var(--purple-brand),var(--electric))]" />

          <div className="p-8 sm:p-10">
            {/* Security illustration */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 blur-2xl bg-rose-brand/30 rounded-full"
                />
                <div className="relative size-24 rounded-3xl glass-3 ring-1 ring-rose-brand/25 flex items-center justify-center shadow-[var(--shadow-lg)]">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, -4, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Lock className="text-rose-brand" size={40} strokeWidth={2.2} />
                  </motion.div>
                  {/* Orbiting shield */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <ShieldCheck
                      className="absolute -top-1 left-1/2 -translate-x-1/2 text-electric/70"
                      size={18}
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-brand/10 text-rose-brand ring-1 ring-rose-brand/20 px-3 py-1 text-xs font-semibold">
                <AlertCircle size={13} />
                Restricted Area
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Restricted CEO Dashboard
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                This administration area is reserved exclusively for authorized
                Chief Executive Officers and approved administrators. Your
                current account does not have permission to access this area.
              </p>
              <p className="text-xs text-muted-foreground/80 italic">
                If you believe you require administrator access, please contact
                the platform owner.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <LootButton
                variant="electric"
                size="lg"
                leftIcon={<ArrowLeft size={18} />}
                onClick={() => navigate("dashboard")}
                className="group"
              >
                Return to Dashboard
              </LootButton>
              <LootButton
                variant="glass"
                size="lg"
                leftIcon={<Lock size={16} />}
                onClick={() => navigate("ceo-login")}
              >
                Administrator Login
              </LootButton>
            </motion.div>

            {/* Security footer */}
            <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck size={13} className="text-emerald-brand" />
              <span>Access attempt logged • Session secured</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </PageContainer>
  );
}
