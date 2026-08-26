"use client";

import { useEffect, useRef, useState } from "react";

const CONSENT_KEY = "nefer-ad-consent-v1";

type AdConfig = { enabled: boolean; client?: string; slots?: Record<string, string> };

export default function AdSlot({ placement }: { placement: "home_top" | "home_inline" }) {
  const [config, setConfig] = useState<AdConfig | null>(null);
  const [allowed, setAllowed] = useState(false);
  const initialized = useRef(false);
  useEffect(() => {
    const readConsent = () => setAllowed(localStorage.getItem(CONSENT_KEY) === "ads");
    readConsent();
    const listener = () => readConsent();
    addEventListener("nefer:ad-consent", listener);
    void fetch("/api/ads/config").then((response) => response.json()).then(setConfig).catch(() => setConfig({ enabled: false }));
    return () => removeEventListener("nefer:ad-consent", listener);
  }, []);
  useEffect(() => {
    if (!allowed || !config?.enabled || !config.client || !config.slots?.[placement] || initialized.current) return;
    initialized.current = true;
    const scriptId = "nefer-adsense-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.client)}`;
      document.head.appendChild(script);
    }
    window.setTimeout(() => {
      try {
        const host = window as typeof window & { adsbygoogle?: unknown[] };
        (host.adsbygoogle ??= []).push({});
      } catch {
        initialized.current = false;
      }
    }, 0);
  }, [allowed, config, placement]);
  const slot = config?.slots?.[placement];
  if (!allowed || !config?.enabled || !config.client || !slot) return null;
  return (
    <aside className="adSlot" aria-label="Reklam">
      <small>REKLAM</small>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={config.client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
