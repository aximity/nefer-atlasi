"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

const CLIENT_KEY = "nefer-atlasi-anonymous-client-v1";
const DRAFT_KEY = "nefer-atlasi-feedback-draft-v1";

const localDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export default function ContributionCenter() {
  const [subject, setSubject] = useState("");
  const [comment, setComment] = useState("");
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
        token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
        localStorage.setItem(CLIENT_KEY, token);
      }
      setClientToken(token);
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          const saved = JSON.parse(draft) as { subject?: string; comment?: string };
          setSubject(saved.subject ?? "");
          setComment(saved.comment ?? "");
        } catch {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || sent) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ subject, comment }));
  }, [comment, hydrated, sent, subject]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !clientToken) return;
    if (subject.trim().length < 2 || comment.trim().length < 3) {
      setError("Konu ve kısa bir açıklama yazman yeterli.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const body = new FormData();
      body.set("payload", JSON.stringify({
        kind: "site_feedback",
        common: {
          server: "Kıyamet Öncüleri",
          observedAt: localDate(),
          alias: "",
          contact: "",
          notes: "",
          sourceUrl: "",
          secondarySourceUrl: "",
          declaration: true,
          clientToken,
          startedAt,
          website,
        },
        details: { subject, comment },
      }));
      const response = await fetch("/api/contributions", { method: "POST", body });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Yorum gönderilemedi.");
      localStorage.removeItem(DRAFT_KEY);
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
    setSent(false);
    setError("");
    setStartedAt(Date.now());
  };

  return (
    <section className="contributionCenter" id="contribute">
      <div className="simpleContribution">
        <header>
          <p className="eyebrow">GERİ BİLDİRİM</p>
          <h2>Bir şey yanlışsa söyle.</h2>
          <p>Konu ve kısa açıklama yaz. Bu form dosya veya kanıt yüklemez; bildirimi inceleyip gerekli düzeltmeyi yaparız.</p>
        </header>

        {sent ? (
          <div className="simpleContributionSuccess" role="status">
            <i>✓</i>
            <div><b>Yorumun gönderildi.</b><span>İncelendikten sonra gerekli değişiklik siteye yansıyacak.</span></div>
            <button type="button" onClick={reset}>Başka yorum gönder</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              <span>Konu</span>
              <input value={subject} onChange={(event) => { setSubject(event.target.value); setError(""); }} maxLength={120} placeholder="Örn. Bilgi Tılsımı fiyatı" required />
            </label>
            <label>
              <span>Neyin yanlış veya değişmesi gerekiyor?</span>
              <textarea value={comment} onChange={(event) => { setComment(event.target.value); setError(""); }} maxLength={2000} placeholder="Kısaca yazman yeterli…" required />
            </label>
            <label className="honeypot" aria-hidden="true">
              Website
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
            </label>
            {error && <p className="simpleContributionError" role="alert">{error}</p>}
            <button type="submit" disabled={submitting || !clientToken}>{submitting ? "Gönderiliyor…" : "Yorumu gönder"}</button>
          </form>
        )}
      </div>
    </section>
  );
}
