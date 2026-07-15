"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "//pricklyassociation.com/b-XLV.sydzGvlE0TYoWgck/PefmQ9PuqZbUzlAkKP/TecvySM/j/Q/xiNQDjEVt/N/zuI_yCNVDuEX0RNfQb";
const UNIQUE_SEGMENT = "b-XLV";
let bannerLoaded = false;

export function HilltopBanner({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bannerLoaded) return;
    if (document.querySelector(`script[src*="${UNIQUE_SEGMENT}"]`)) {
      bannerLoaded = true;
      return;
    }

    const s = document.createElement("script");
    (s as unknown as { settings: Record<string, unknown> }).settings = {};
    s.src = SCRIPT_SRC;
    s.async = true;
    s.referrerPolicy = "no-referrer-when-downgrade";
    document.body.appendChild(s);
    bannerLoaded = true;
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: 300, height: 250, maxWidth: "100%" }}
    />
  );
}
