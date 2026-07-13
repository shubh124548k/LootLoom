"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LifeBuoy, Mail } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  IconBadge,
} from "@/components/lootloom";
import { cardReveal } from "@/lib/animations";

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
        title="Contact Us"
        description="We're here to help"
      />

      <motion.div
        variants={cardReveal}
        initial="hidden"
        animate="visible"
        className="max-w-lg mx-auto"
      >
        <GlassCard level={2} sheen className="p-8 sm:p-10 text-center">
          <div className="flex flex-col items-center gap-5">
            <div className="size-16 rounded-2xl bg-electric/10 ring-1 ring-electric/20 flex items-center justify-center">
              <LifeBuoy size={32} className="text-electric" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Need help?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                You can contact us anytime. We&apos;ll respond as soon as possible.
              </p>
            </div>

            {supportEmail && (
              <div className="flex items-center gap-3 rounded-xl glass-2 ring-1 ring-border px-5 py-3.5">
                <Mail size={18} className="text-electric shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email
                  </p>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-sm font-semibold text-foreground hover:text-electric transition-colors"
                  >
                    {supportEmail}
                  </a>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              We typically respond within 24 hours.
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </PageContainer>
  );
}
