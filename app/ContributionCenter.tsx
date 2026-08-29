"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

const CLIENT_KEY = "nefer-atlasi-anonymous-client-v1";
const DRAFT_KEY = "nefer-atlasi-feedback-draft-v1";
const MARKET_DRAFT_KEY = "nefer-atlasi-market-draft-v1";

type ContributionMode = "site_feedback" | "market_price";
type MarketDraft = {
  subject: string;
  tradeDirection: "Satılık" | "Alınır";
  listingType: "İlan" | "Gerçekleşen satış";
  quantity: string;
  currency: "Oyun parası" | "TL";
  price: string;
  settledPrice: string;
  channel: "Oyun içi sohbet" | "Discord" | "WhatsApp" | "Facebook" | "Özel takas";
  sourceUrl: string;
};

const emptyMarketDraft: MarketDraft = {
  subject: "",
  tradeDirection: "Satılık",
  listingType: "İlan",
  quantity: "1",
  currency: "Oyun parası",
  price: "",
  settledPrice: "",
  channel: "WhatsApp",
  sourceUrl: "",
};

const localDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const makeClientToken = () => Array.from(
  crypto.getRandomValues(new Uint8Array(32)),
  (byte) => byte.toString(16).padStart(2, "0"),
).join("");

export default function ContributionCenter() {
  const [mode, setMode] = useState<ContributionMode>("site_feedback");
  const [subject, setSubject] = useState("");
  const [comment, setComment] = useState("");
  const [market, setMarket] = useState<MarketDraft>(emptyMarketDraft);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [website, setWebsite] = useState("");
  const [clientToken, setClientToken] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      let token = localStorage.getItem(CLIENT_KEY) ?? "";
      if (!/^[A-Za-z0-9_-]{20,128}$/.test(token)) {
        token = makeClientToken();
        localStorage.setItem(CLIENT_KEY, token);
      }
      setClientToken(token);
      const query = new URLSearchParams(location.search);
      const requestedMode = query.get("kind") === "market_price" ? "market_price" : "site_feedback";
      setMode(requestedMode);
      const draft = localStorage.getItem(requestedMode === "market_price" ? MARKET_DRAFT_KEY : DRAFT_KEY);
      if (draft && requestedMode === "site_feedback") {
        try {
          const saved = JSON.parse(draft) as { subject?: string; comment?: string };
          setSubject(saved.subject ?? "");
          setComment(saved.comment ?? "");
        } catch {
          localStorage.removeItem(DRAFT_KEY);
        }
      } else if (draft) {
        try {
          const saved = JSON.parse(draft) as Partial<MarketDraft>;
          setMarket({
            ...emptyMarketDraft,
            subject: typeof saved.subject === "string" ? saved.subject : "",
            tradeDirection: saved.tradeDirection === "Alınır" ? "Alınır" : "Satılık",
            listingType: saved.listingType === "Gerçekleşen satış" ? "Gerçekleşen satış" : "İlan",
            quantity: typeof saved.quantity === "string" ? saved.quantity : "1",
            currency: saved.currency === "TL" ? "TL" : "Oyun parası",
            price: typeof saved.price === "string" ? saved.price : "",
            settledPrice: typeof saved.settledPrice === "string" ? saved.settledPrice : "",
            channel: ["Oyun içi sohbet", "Discord", "WhatsApp", "Facebook", "Özel takas"].includes(saved.channel ?? "") ? saved.channel as MarketDraft["channel"] : "WhatsApp",
            sourceUrl: typeof saved.sourceUrl === "string" ? saved.sourceUrl : "",
          });
        } catch {
          localStorage.removeItem(MARKET_DRAFT_KEY);
        }
      }
      if (requestedMode === "site_feedback") {
        const requestedSubject = query.get("subject")?.trim().slice(0, 120);
        const requestedComment = query.get("comment")?.trim().slice(0, 2000);
        if (requestedSubject) setSubject(requestedSubject);
        if (requestedComment) setComment(requestedComment);
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || sent) return;
    if (mode === "market_price") localStorage.setItem(MARKET_DRAFT_KEY, JSON.stringify(market));
    else localStorage.setItem(DRAFT_KEY, JSON.stringify({ subject, comment }));
  }, [comment, hydrated, market, mode, sent, subject]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !clientToken) return;
    const marketQuantity = Number(market.quantity);
    const marketPrice = Number(market.price);
    const marketSettledPrice = market.settledPrice ? Number(market.settledPrice) : null;
    if (mode === "site_feedback" && (subject.trim().length < 2 || comment.trim().length < 3)) {
      setError("Konu ve kısa bir açıklama yazman yeterli.");
      return;
    }
    if (mode === "market_price" && (market.subject.trim().length < 2 || !Number.isFinite(marketQuantity) || marketQuantity <= 0 || !Number.isFinite(marketPrice) || marketPrice <= 0)) {
      setError("Ürün adı, miktar ve toplam fiyatı geçerli biçimde gir.");
      return;
    }
    if (mode === "market_price" && !evidenceFile && !market.sourceUrl.trim()) {
      setError("Fiyat kaydı için bir ekran görüntüsü veya kaynak bağlantısı ekle.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const body = new FormData();
      body.set("payload", JSON.stringify({
        kind: mode,
        common: {
          server: "Kıyamet Öncüleri",
          observedAt: localDate(),
          alias: "",
          contact: "",
          notes: "",
          sourceUrl: mode === "market_price" ? market.sourceUrl : "",
          secondarySourceUrl: "",
          declaration: true,
          clientToken,
          startedAt,
          website,
        },
        details: mode === "market_price" ? {
          subject: market.subject,
          tradeDirection: market.tradeDirection,
          listingType: market.listingType,
          quantity: marketQuantity,
          currency: market.currency,
          price: marketPrice,
          channel: market.channel,
          settledPrice: marketSettledPrice,
        } : { subject, comment },
      }));
      if (evidenceFile) body.set("file", evidenceFile);
      const response = await fetch("/api/contributions", { method: "POST", body });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Yorum gönderilemedi.");
      localStorage.removeItem(mode === "market_price" ? MARKET_DRAFT_KEY : DRAFT_KEY);
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Yorum gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubject("");
    setComment("");
    setMarket(emptyMarketDraft);
    setEvidenceFile(null);
    setSent(false);
    setError("");
    setStartedAt(Date.now());
  };

  return (
    <section className="contributionCenter" id="contribute">
      <div className="simpleContribution">
        <header>
          <p className="eyebrow">{mode === "market_price" ? "PAZAR GÖZLEMİ" : "GERİ BİLDİRİM"}</p>
          <h2>{mode === "market_price" ? "Gördüğün fiyatı kaydet." : "Bir şey yanlışsa söyle."}</h2>
          <p>{mode === "market_price" ? "Alınır ve satılık yönünü, ilanla gerçekleşen satışı ve TL ile oyun parasını birbirine karıştırmadan kaydet. Kayıt incelenmeden pazar medyanına girmez." : "Konu ve kısa açıklama yaz. Varsa oyun içi ekran görüntüsünü ekle; kayıt doğrulanmadan atlas verisine girmez."}</p>
        </header>

        {sent ? (
          <div className="simpleContributionSuccess" role="status">
            <i>✓</i>
            <div><b>{mode === "market_price" ? "Fiyat gözlemin gönderildi." : "Yorumun gönderildi."}</b><span>{mode === "market_price" ? "İnceleme ve kanıt kontrolünden sonra pazar kesitine eklenebilir." : "İncelendikten sonra gerekli değişiklik siteye yansıyacak."}</span></div>
            <button type="button" onClick={reset}>{mode === "market_price" ? "Başka fiyat gir" : "Başka yorum gönder"}</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            {mode === "market_price" ? <>
              <label><span>Ürün, eşya veya malzeme</span><input value={market.subject} onChange={(event) => { setMarket((current) => ({ ...current, subject: event.target.value })); setError(""); }} maxLength={120} placeholder="Örn. Xenotim" required /></label>
              <div className="marketContributionGrid">
                <label><span>Yön</span><select value={market.tradeDirection} onChange={(event) => setMarket((current) => ({ ...current, tradeDirection: event.target.value as MarketDraft["tradeDirection"] }))}><option>Satılık</option><option>Alınır</option></select></label>
                <label><span>Kayıt türü</span><select value={market.listingType} onChange={(event) => setMarket((current) => ({ ...current, listingType: event.target.value as MarketDraft["listingType"] }))}><option>İlan</option><option>Gerçekleşen satış</option></select></label>
                <label><span>Miktar</span><input type="number" min="0.01" step="0.01" inputMode="decimal" value={market.quantity} onChange={(event) => setMarket((current) => ({ ...current, quantity: event.target.value }))} required /></label>
                <label><span>Para birimi</span><select value={market.currency} onChange={(event) => setMarket((current) => ({ ...current, currency: event.target.value as MarketDraft["currency"] }))}><option>Oyun parası</option><option>TL</option></select></label>
                <label><span>Toplam ilan / teklif fiyatı</span><input type="number" min="0.01" step="0.01" inputMode="decimal" value={market.price} onChange={(event) => setMarket((current) => ({ ...current, price: event.target.value }))} required /></label>
                <label><span>Gerçekleşen toplam fiyat (isteğe bağlı)</span><input type="number" min="0.01" step="0.01" inputMode="decimal" value={market.settledPrice} onChange={(event) => setMarket((current) => ({ ...current, settledPrice: event.target.value }))} /></label>
                <label><span>Kanal</span><select value={market.channel} onChange={(event) => setMarket((current) => ({ ...current, channel: event.target.value as MarketDraft["channel"] }))}>{["Oyun içi sohbet", "Discord", "WhatsApp", "Facebook", "Özel takas"].map((channel) => <option key={channel}>{channel}</option>)}</select></label>
                <label><span>Kaynak bağlantısı (görsel yoksa zorunlu)</span><input type="url" value={market.sourceUrl} onChange={(event) => setMarket((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder="https://…" /></label>
              </div>
              <label><span>Ekran görüntüsü (PNG, JPG veya WebP · en çok 5 MB)</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setEvidenceFile(event.target.files?.[0] ?? null); setError(""); }} /></label>
              <p className="marketEvidenceNote">Görselde ad, telefon veya özel sohbet bilgisi varsa yüklemeden önce kırp. Dosya yalnız inceleme kuyruğuna gider.</p>
            </> : <>
              <label><span>Konu</span><input value={subject} onChange={(event) => { setSubject(event.target.value); setError(""); }} maxLength={120} placeholder="Örn. Bilgi Tılsımı fiyatı" required /></label>
              <label><span>Neyin yanlış veya değişmesi gerekiyor?</span><textarea value={comment} onChange={(event) => { setComment(event.target.value); setError(""); }} maxLength={2000} placeholder="Kısaca yazman yeterli…" required /></label>
              <label><span>Oyun içi kanıt (isteğe bağlı · PNG, JPG veya WebP · en çok 5 MB)</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setEvidenceFile(event.target.files?.[0] ?? null); setError(""); }} /></label>
              <p className="marketEvidenceNote">Görselde özel sohbet veya kişisel bilgi varsa yüklemeden önce kırp. Dosya yalnız inceleme kuyruğuna gider.</p>
            </>}
            <label className="honeypot" aria-hidden="true">
              Website
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
            </label>
            {error && <p className="simpleContributionError" role="alert">{error}</p>}
            <button type="submit" disabled={submitting || !clientToken}>{submitting ? "Gönderiliyor…" : mode === "market_price" ? "Fiyat gözlemini gönder" : "Yorumu gönder"}</button>
          </form>
        )}
      </div>
    </section>
  );
}
