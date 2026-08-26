"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "nefer-ad-consent-v1";

export default function AdvertisingConsent() {
  const [enabled, setEnabled] = useState(false);
  const [decision, setDecision] = useState<string | null>(() => typeof window === "undefined" ? null : localStorage.getItem(CONSENT_KEY));
  useEffect(() => {
    void fetch("/api/ads/config")
      .then((response) => response.json() as Promise<{ enabled?: boolean }>)
      .then((value) => setEnabled(Boolean(value.enabled)))
      .catch(() => setEnabled(false));
  }, []);
  if (!enabled || decision) return null;
  const decide = (value: "necessary" | "ads") => {
    localStorage.setItem(CONSENT_KEY, value);
    setDecision(value);
    window.dispatchEvent(new CustomEvent("nefer:ad-consent", { detail: value }));
  };
  return (
    <aside className="consentBanner" aria-label="Reklam ve gizlilik tercihi">
      <div>
        <b>Gizlilik tercihi</b>
        <p>Atlasın çalışması için zorunlu olmayan reklam teknolojileri yalnız izninle açılır.</p>
        <a href="/gizlilik">Ayrıntıları oku</a>
      </div>
      <button type="button" onClick={() => decide("necessary")}>Yalnız gerekli</button>
      <button type="button" className="primary" onClick={() => decide("ads")}>Reklama izin ver</button>
    </aside>
  );
}
