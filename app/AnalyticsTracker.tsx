"use client";

import { useEffect } from "react";

const EVENT_NAME = "nefer:navigation";

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
    const send = () => {
      const path = publicLocation();
      const now = Date.now();
      if (path === lastKey && now - lastSentAt < 5_000) return;
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
    const notify = () => window.dispatchEvent(new Event(EVENT_NAME));
    const pushState = history.pushState.bind(history);
    const replaceState = history.replaceState.bind(history);
    history.pushState = (...args) => { pushState(...args); notify(); };
    history.replaceState = (...args) => { replaceState(...args); notify(); };
    addEventListener(EVENT_NAME, send);
    addEventListener("popstate", send);
    send();
    return () => {
      history.pushState = pushState;
      history.replaceState = replaceState;
      removeEventListener(EVENT_NAME, send);
      removeEventListener("popstate", send);
    };
  }, []);
  return null;
}
