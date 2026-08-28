"use client";

import { useEffect } from "react";
import { APP_NAVIGATION_EVENT } from "../lib/navigation";

function publicLocation() {
  const url = new URL(location.href);
  const moduleName = url.searchParams.get("module");
  return `${url.pathname}${moduleName ? `?module=${encodeURIComponent(moduleName)}` : ""}`;
}

export default function AnalyticsTracker() {
  useEffect(() => {
    if (navigator.doNotTrack === "1") return;
    let lastKey = "";
    let lastSentAt = 0;
    let firstView = true;
    let activeSeconds = 0;
    let engagementPath = publicLocation();
    let focused = document.hasFocus();
    const flushEngagement = () => {
      if (activeSeconds < 1) return;
      const seconds = activeSeconds;
      activeSeconds = 0;
      void fetch("/api/analytics/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: engagementPath, seconds }),
        keepalive: true,
        credentials: "same-origin",
      }).catch(() => undefined);
    };
    const send = () => {
      const path = publicLocation();
      const now = Date.now();
      if (path === lastKey && now - lastSentAt < 5_000) return;
      flushEngagement();
      engagementPath = path;
      lastKey = path;
      lastSentAt = now;
      const referrer = firstView ? document.referrer : location.href;
      firstView = false;
      void fetch("/api/analytics/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, referrer }),
        keepalive: true,
        credentials: "same-origin",
      }).catch(() => undefined);
    };
    addEventListener(APP_NAVIGATION_EVENT, send);
    addEventListener("popstate", send);
    const focus = () => { focused = true; };
    const blur = () => { focused = false; flushEngagement(); };
    const visibility = () => { if (document.hidden) flushEngagement(); };
    const tick = window.setInterval(() => {
      if (!document.hidden && focused) activeSeconds += 1;
      if (activeSeconds >= 30) flushEngagement();
    }, 1_000);
    addEventListener("focus", focus);
    addEventListener("blur", blur);
    addEventListener("pagehide", flushEngagement);
    document.addEventListener("visibilitychange", visibility);
    send();
    return () => {
      flushEngagement();
      clearInterval(tick);
      removeEventListener(APP_NAVIGATION_EVENT, send);
      removeEventListener("popstate", send);
      removeEventListener("focus", focus);
      removeEventListener("blur", blur);
      removeEventListener("pagehide", flushEngagement);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return null;
}
