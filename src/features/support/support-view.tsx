"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy, Mail, ChevronDown, ChevronUp, Search, Bug, Lightbulb,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  IconBadge,
} from "@/components/lootloom";
import { cardReveal, staggerContainer } from "@/lib/animations";

const FAQ_ITEMS = [
  { q: "How do I earn coins?", a: "Watch ads, complete missions, and refer friends to earn coins. Visit the Earn page for available opportunities." },
  { q: "How do I redeem my coins?", a: "Go to the Redeem page, select a UPI cash reward, enter your UPI ID, and submit. Your request will be reviewed by our team." },
  { q: "How long do redemptions take?", a: "UPI redemptions are typically processed within 24-48 hours after CEO approval. You'll be notified when your request is processed." },
  { q: "What is the minimum withdrawal amount?", a: "You can redeem ₹10 UPI cash for 300 coins. Check the Redeem page for all available amounts." },
  { q: "Why was my redeem request rejected?", a: "Common reasons include invalid UPI ID, policy violations, or suspicious activity. Contact support for specific details." },
  { q: "How do I refer a friend?", a: "Share your referral link from the Dashboard or Earn page. You'll earn bonus coins when your friend joins and starts earning." },
  { q: "Is there a daily earning limit?", a: "There's no hard limit, but ad availability may vary. Keep checking the Earn page throughout the day." },
  { q: "How do I update my profile?", a: "Go to Settings from the profile menu to update your name, username, and other profile details." },
];

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = FAQ_ITEMS.filter(
    (f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <GlassCard level={2} sheen className="p-5 sm:p-6">
      <h3 className="text-base font-semibold text-foreground mb-1">Frequently Asked Questions</h3>
      <p className="text-sm text-muted-foreground mb-4">Quick answers to common questions</p>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search FAQ…"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric"
        />
      </div>

      <div className="space-y-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No matching questions found.</p>
        ) : (
          filtered.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="rounded-xl border border-border/60 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-accent/40 transition-colors"
                >
                  <span className="flex-1">{faq.q}</span>
                  {isOpen ? <ChevronUp size={14} className="shrink-0 text-muted-foreground" /> : <ChevronDown size={14} className="shrink-0 text-muted-foreground" />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}

export function SupportView() {
  const [supportEmail, setSupportEmail] = useState("");

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.supportEmail) {
          setSupportEmail(data.data.supportEmail);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Support Center"
        description="Get help, report bugs, request features"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-5 lg:space-y-6"
      >
        {/* Quick actions */}
        <motion.div variants={cardReveal} custom={0} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <GlassCard hover level={2} onClick={() => window.open(`mailto:${supportEmail}`)} className="p-5 cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <IconBadge name="Mail" accent="cyan" size="md" />
            </div>
            <p className="text-sm font-semibold text-foreground">Support Email</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{supportEmail || "support@lootloom.com"}</p>
          </GlassCard>

          <GlassCard hover level={2} onClick={() => window.open(`mailto:${supportEmail}?subject=Bug Report`)} className="p-5 cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <IconBadge name="AlertCircle" accent="rose" size="md" />
            </div>
            <p className="text-sm font-semibold text-foreground">Report Bug</p>
            <p className="text-xs text-muted-foreground mt-0.5">Report an issue you encountered</p>
          </GlassCard>

          <GlassCard hover level={2} onClick={() => window.open(`mailto:${supportEmail}?subject=Feature Request`)} className="p-5 cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <IconBadge name="Lightbulb" accent="gold" size="md" />
            </div>
            <p className="text-sm font-semibold text-foreground">Request Feature</p>
            <p className="text-xs text-muted-foreground mt-0.5">Suggest a new feature or improvement</p>
          </GlassCard>
        </motion.div>

        {/* FAQ */}
        <motion.div variants={cardReveal} custom={1}>
          <FaqSection />
        </motion.div>

        {/* Contact CEO */}
        <motion.div variants={cardReveal} custom={2}>
          <GlassCard level={2} sheen className="p-5 sm:p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <LifeBuoy size={24} className="text-electric" />
              <p className="text-sm text-muted-foreground">Need more help? Contact the CEO directly</p>
              {supportEmail && (
                <a href={`mailto:${supportEmail}?subject=CEO Inquiry`} className="text-sm font-semibold text-electric hover:underline">
                  {supportEmail}
                </a>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
