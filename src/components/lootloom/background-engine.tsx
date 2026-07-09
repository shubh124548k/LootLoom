"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { auroraDrift, auroraDriftAlt, twinkle } from "@/lib/animations";

/**
 * LootLoom Background Engine
 * Layered: base mesh → aurora blobs → stars → occasional shooting star → particles.
 * GPU-accelerated, pointer-events-none, behind all content.
 *
 * Random-generated layers (stars, particles) only render after mount to avoid
 * SSR/client hydration mismatches.
 */
export function BackgroundEngine() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stars = useMemo(
    () =>
      Array.from({ length: 32 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.2,
        delay: Math.random() * 4,
        duration: 2.5 + Math.random() * 3,
      })),
    []
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 5,
        delay: Math.random() * 14,
        duration: 16 + Math.random() * 12,
      })),
    []
  );

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      {/* Base white */}
      <div className="absolute inset-0 bg-background" />

      {/* Soft mesh gradient wash */}
      <div className="absolute inset-0 mesh-bg opacity-70" />

      {/* Aurora blobs */}
      <motion.div
        variants={auroraDrift}
        animate="animate"
        className="aurora-layer aurora-drift"
        style={{
          top: "-12%",
          left: "-8%",
          width: "52vw",
          height: "52vw",
          background:
            "radial-gradient(circle, oklch(0.78 0.18 250 / 0.55), transparent 65%)",
        }}
      />
      <motion.div
        variants={auroraDriftAlt}
        animate="animate"
        className="aurora-layer aurora-drift-alt"
        style={{
          top: "10%",
          right: "-12%",
          width: "48vw",
          height: "48vw",
          background:
            "radial-gradient(circle, oklch(0.8 0.16 200 / 0.5), transparent 65%)",
        }}
      />
      <motion.div
        variants={auroraDrift}
        animate="animate"
        className="aurora-layer aurora-drift"
        style={{
          bottom: "-18%",
          left: "20%",
          width: "56vw",
          height: "56vw",
          background:
            "radial-gradient(circle, oklch(0.8 0.16 295 / 0.42), transparent 65%)",
        }}
      />

      {/* Stars — client-only to avoid hydration mismatch */}
      {mounted &&
        stars.map((s) => (
          <motion.span
            key={s.id}
            variants={twinkle}
            animate="animate"
            className="absolute rounded-full"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              background: "oklch(0.6 0.15 250)",
              transitionDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}

      {/* Occasional shooting star */}
      {mounted && (
        <div
          className="absolute"
          style={{
            top: "18%",
            right: "8%",
            width: 2,
            height: 2,
          }}
        >
          <span
            className="block"
            style={{
              width: 120,
              height: 1.5,
              background:
                "linear-gradient(90deg, transparent, oklch(0.7 0.18 250 / 0.9), transparent)",
              transformOrigin: "left center",
              animation: "shoot 9s ease-in 3s infinite",
            }}
          />
        </div>
      )}

      {/* Floating particles — client-only */}
      {mounted &&
        particles.map((p) => (
          <span
            key={p.id}
            className="absolute bottom-[-10px] rounded-full"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background:
                "radial-gradient(circle, oklch(0.62 0.2 255 / 0.5), transparent 70%)",
              animation: `particleDrift ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}

      {/* Top sheen */}
      <div
        className="absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "linear-gradient(180deg, oklch(1 0 0 / 0.7), transparent)",
        }}
      />
    </div>
  );
}
