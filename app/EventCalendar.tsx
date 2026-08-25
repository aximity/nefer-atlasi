"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCalendarEvent, buildEventInviteUrl } from "../lib/event-calendar.mjs";

const templates = [
  { title: "Büyük Hol malzeme turu", region: "Büyük Hol", type: "Farm", roles: "Tank · Şifacı · Hasar", note: "Xenotim, Salgı ve Peptit hedefli yaratık turu" },
  { title: "Zihin Tapınağı Erg turu", region: "Zihin Tapınağı", type: "Farm", roles: "Şifacı · Hasar", note: "Erg Tozu ve Erg Kalıntısı yaratık farmı" },
  { title: "Çemberlitaş ekip turu", region: "Çemberlitaş", type: "Grup bölgesi", roles: "Tank · Şifacı · Büyücü", note: "Gaffar ve reçete bağlantılı ekipman hedefi" },
  { title: "Sığınak–Migrat rotasyonu", region: "Sığınak / Migrat", type: "Grup bölgesi", roles: "Grup ihtiyacına göre", note: "Eski bölgelerde oyuncuyu aynı saatte buluşturma" },
] as const;

const server = "Kıyametin Öncüleri";

export default function EventCalendar() {
  const [draft, setDraft] = useState({
    title: templates[0].title,
    region: templates[0].region,
    type: templates[0].type,
    roles: templates[0].roles,
    date: "",
    time: "21:00",
    durationMinutes: "90",
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const incoming = Object.fromEntries(["title", "region", "date", "time", "roles"].map((key) => [key, params.get(key)]));
      if (incoming.title || incoming.region || incoming.date) {
        setDraft((current) => ({
          ...current,
          title: incoming.title || current.title,
          region: incoming.region || current.region,
          date: incoming.date || current.date,
          time: incoming.time || current.time,
          roles: incoming.roles || current.roles,
        }));
      }
    }, 0);
    return () => window.clearTimeout(initialize);
  }, []);

  const invite = useMemo(() => {
    if (typeof window === "undefined") return "";
    return buildEventInviteUrl(window.location.origin, draft);
  }, [draft]);

  function chooseTemplate(template: (typeof templates)[number]) {
    setDraft((current) => ({ ...current, ...template }));
    setNotice(`${template.title} şablonu seçildi.`);
  }

  function downloadCalendar() {
    try {
      const content = buildCalendarEvent({ ...draft, server, id: `${draft.date}-${draft.time}-${draft.region}`, url: invite });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
      link.download = "nefer-atlasi-etkinlik.ics";
      link.click();
      URL.revokeObjectURL(link.href);
      setNotice("Takvim dosyası hazırlandı.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tarih ve saati kontrol et.");
    }
  }

  async function copyInvite() {
    if (!draft.date) {
      setNotice("Paylaşmadan önce tarihi seç.");
      return;
    }
    const text = `${draft.title}\n${server} · ${draft.region}\n${draft.date} ${draft.time} · ${draft.roles}\n${invite}`;
    await navigator.clipboard.writeText(text);
    setNotice("Davet metni ve bağlantısı kopyalandı.");
  }

  return <div className="eg-panel calendar-panel">
    <div className="panel-intro">
      <div><small>TOPLULUK ETKİNLİK PLANLAYICISI</small><h3>Aynı hedefte, aynı saatte buluş.</h3></div>
      <p>Bu ekran resmî etkinlik ilan etmez. Oyuncuların farm ve grup bölgesi planını WhatsApp, Discord veya Telegram’da tek biçimde paylaşmasını sağlar.</p>
    </div>
    <div className="calendar-safety"><b>Sunucu saati · UTC+3</b><span>Katılımcı sayısı uydurulmaz</span><span>Etkinlikler cihazında hazırlanır</span><span>Resmî takvimden ayrıdır</span></div>
    <div className="event-template-grid">{templates.map((template) => <button key={template.title} onClick={() => chooseTemplate(template)} className={draft.title === template.title ? "active" : ""}>
      <small>{template.type}</small><b>{template.title}</b><span>{template.note}</span><em>{template.region}</em>
    </button>)}</div>
    <div className="event-composer">
      <header><small>DAVET OLUŞTURUCU</small><h4>Planı doldur, bağlantıyı paylaş.</h4></header>
      <div className="event-fields">
        <label><span>Etkinlik adı</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })}/></label>
        <label><span>Bölge</span><input value={draft.region} onChange={(event) => setDraft({ ...draft, region: event.target.value })}/></label>
        <label><span>Tarih</span><input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })}/></label>
        <label><span>Saat</span><input type="time" value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })}/></label>
        <label><span>Süre</span><select value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: event.target.value })}><option value="60">60 dakika</option><option value="90">90 dakika</option><option value="120">120 dakika</option></select></label>
        <label><span>Aranan roller</span><input value={draft.roles} onChange={(event) => setDraft({ ...draft, roles: event.target.value })}/></label>
      </div>
      <div className="event-preview"><div><small>SUNUCU</small><b>{server}</b></div><div><small>PLAN</small><b>{draft.date ? `${draft.date} · ${draft.time}` : "Tarih seçilmedi"}</b></div><div><small>HEDEF</small><b>{draft.region}</b></div></div>
      <footer><button onClick={copyInvite}>Davet bağlantısını kopyala</button><button className="primary" onClick={downloadCalendar}>Takvime ekle (.ics)</button></footer>
      {notice && <p className="event-notice" role="status">{notice}</p>}
    </div>
    <div className="calendar-recommendation"><span>YÖNETİCİ PİLOTU</span><p>Oyun içi sürümde yalnız <b>bölge + amaç + başlangıç saati + eksik rol + sona erme süresi</b> saklanmalı. İlan süresi dolunca silinmeli; dünya nesnesi, canlı konum veya sürekli sohbet mesajı üretmemeli.</p></div>
  </div>;
}
