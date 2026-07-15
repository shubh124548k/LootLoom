"use client";

import { useEffect } from "react";

const INPAGE_SRC = "//pricklyassociation.com/byX.VWsydpG/lD0SYmWncw/RepmT9KujZDUfl/k/PeT-cXyqMaj/QZxbN/Twcnt/NIziImyxNED-Ev2/MGQS";
const VIDEO_SRC = "//pricklyassociation.com/b.XtV/sMdhG/lW0cYRWHcT/ueomz9bufZTUPlok/P/T/cNyYM-jiQ/xhNtz/MSt_NSztINylNYDfE/3aNuwR";

const INPAGE_SEGMENT = "byX.VW";
const VIDEO_SEGMENT = "b.XtV";

let inPageLoaded = false;
let videoLoaded = false;

function injectScript(src: string, segment: string): boolean {
  if (document.querySelector(`script[src*="${segment}"]`)) return false;
  const s = document.createElement("script");
  (s as unknown as { settings: Record<string, unknown> }).settings = {};
  s.src = src;
  s.async = true;
  s.referrerPolicy = "no-referrer-when-downgrade";
  document.body.appendChild(s);
  return true;
}

export function HilltopGlobalAds() {
  useEffect(() => {
    if (!videoLoaded) {
      const loadVideo = () => {
        if (videoLoaded) return;
        injectScript(VIDEO_SRC, VIDEO_SEGMENT);
        videoLoaded = true;
      };
      if ("requestIdleCallback" in window) {
        requestIdleCallback(loadVideo);
      } else {
        setTimeout(loadVideo, 1000);
      }
    }

    if (!inPageLoaded) {
      const handler = () => {
        if (inPageLoaded) return;
        injectScript(INPAGE_SRC, INPAGE_SEGMENT);
        inPageLoaded = true;
      };
      document.addEventListener("click", handler, { once: true });
      document.addEventListener("scroll", handler, { once: true });
      document.addEventListener("touchstart", handler, { once: true });
    }
  }, []);

  return null;
}
