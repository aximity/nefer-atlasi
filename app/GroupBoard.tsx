"use client";

import { useEffect, useMemo, useState } from "react";
import { GROUP_CATEGORIES, GROUP_CHANNELS, GROUP_REGIONS, GROUP_ROLES, parseAnnouncementText } from "../lib/group-board-core.mjs";

type BoardRow = { id: string; server: string; category: string; region: string; title: string; roles: string[]; leaderAlias: string; channel: string; startAt: string; expiresAt: string; createdAt: string };
type Draft = { server: string; category: string; region: string; title: string; roles: string[]; leaderAlias: string; channel: string; date: string; time: string; durationMinutes: string; website: string };

const CLIENT_KEY = "nefer-atlasi:group-board-client:v1";
const RECEIPTS_KEY = "nefer-atlasi:group-board-receipts:v1";

function tomorrowInIstanbul() {
  const now = new Date(Date.now() + 24 * 60 * 60_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

const freshDraft = (): Draft => ({ server: "Kıyametin Öncüleri", category: "Grup bölgesi", region: "Büyük Hol", title: "Büyük Hol grup turu", roles: ["Tank", "Şifacı"], leaderAlias: "", channel: "Oyun içi", date: tomorrowInIstanbul(), time: "21:00", durationMinutes: "90", website: "" });

export default function GroupBoard() {
  const [rows, setRows] = useState<BoardRow[]>([]);
  const [draft, setDraft] = useState<Draft>(freshDraft);
  const [raw, setRaw] = useState("");
  const [filter, setFilter] = useState("Tümü");
  const [mode, setMode] = useState<"Pano" | "İlan Aç">("Pano");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clientToken, setClientToken] = useState("");
  const [receipts, setReceipts] = useState<Record<string, string>>({});

  async function loadRows() {
    try {
      const response = await fetch(`/api/group-board?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch { setNotice("İlan panosu şu an okunamadı."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      let token = localStorage.getItem(CLIENT_KEY) || "";
      if (!/^[A-Za-z0-9_-]{20,128}$/.test(token)) {
        token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
        localStorage.setItem(CLIENT_KEY, token);
      }
      setClientToken(token);
      try { setReceipts(JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "{}")); } catch { localStorage.removeItem(RECEIPTS_KEY); }
      void loadRows();
    }, 0);
    return () => window.clearTimeout(initialize);
  }, []);

  const filtered = useMemo(() => rows.filter((row) => filter === "Tümü" || row.category === filter), [filter, rows]);

  function parseRaw() {
    if (!raw.trim()) return setNotice("Önce WhatsApp, Discord veya oyun sohbeti duyurusunu yapıştır.");
    const parsed = parseAnnouncementText(raw);
    setDraft((current) => ({ ...current, ...parsed, region: parsed.region || current.region, time: parsed.time || current.time, roles: parsed.roles.length ? parsed.roles : current.roles, title: `${parsed.region || current.region} ${parsed.category} ilanı` }));
    setNotice("Bulabildiğim bölge, saat, kanal ve rolleri forma aktardım. Yayımlamadan önce kontrol et.");
  }

  function toggleRole(role: string) {
    setDraft((current) => ({ ...current, roles: current.roles.includes(role) ? current.roles.filter((item) => item !== role) : [...current.roles, role] }));
  }

  async function submit() {
    if (!clientToken) return;
    setSubmitting(true); setNotice("");
    try {
      const response = await fetch("/api/group-board", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, durationMinutes: Number(draft.durationMinutes), clientToken }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "İlan yayımlanamadı.");
      const next = { ...receipts, [data.id]: data.receipt };
      setReceipts(next); localStorage.setItem(RECEIPTS_KEY, JSON.stringify(next));
      setNotice(data.message); setMode("Pano"); setRaw(""); setDraft(freshDraft());
      await loadRows();
    } catch (error) { setNotice(error instanceof Error ? error.message : "İlan yayımlanamadı."); }
    finally { setSubmitting(false); }
  }

  async function cancel(row: BoardRow) {
    const receipt = receipts[row.id];
    if (!receipt) return;
    const response = await fetch("/api/group-board", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receipt }) });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error || "İlan kapatılamadı.");
    const next = { ...receipts }; delete next[row.id]; setReceipts(next); localStorage.setItem(RECEIPTS_KEY, JSON.stringify(next));
    setNotice(data.message); await loadRows();
  }

  async function copyAnnouncement(row: BoardRow) {
    const start = new Date(row.startAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    await navigator.clipboard.writeText(`${row.title}\n${row.server} · ${row.region}\n${start} · Aranan: ${row.roles.join(", ")}\nLider: ${row.leaderAlias} · ${row.channel}\n${window.location.origin}/?module=endgame&panel=Takvim#endgame`);
    setNotice("Paylaşılabilir duyuru kopyalandı.");
  }

  return <div className="eg-panel group-board">
    <div className="panel-intro"><div><small>M15 · SÜRELİ GRUP VE ETKİNLİK PANOSU</small><h3>Sohbet kaybolur; yapılandırılmış ilan kalır.</h3></div><p>Duyuruyu yapıştır, alanları kontrol et ve yayımla. İlanlar en fazla 72 saat sonrasına açılır; süre dolunca panodan otomatik kalkar.</p></div>
    <div className="group-board-tabs"><button className={mode === "Pano" ? "active" : ""} onClick={() => setMode("Pano")}>Aktif ilanlar <b>{rows.length}</b></button><button className={mode === "İlan Aç" ? "active" : ""} onClick={() => setMode("İlan Aç")}>+ İlan aç</button></div>
    {notice && <p className="group-board-notice" role="status">{notice}</p>}

    {mode === "Pano" ? <>
      <div className="group-board-filter"><span>FİLTRE</span>{["Tümü", ...GROUP_CATEGORIES].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
      {loading ? <div className="board-empty"><i>◇</i><b>İlanlar yükleniyor</b></div> : filtered.length === 0 ? <div className="board-empty"><i>◇</i><b>Aktif ilan yok</b><span>İlk yapılandırılmış duyuruyu açabilir veya WhatsApp/Discord metnini forma aktarabilirsin.</span><button onClick={() => setMode("İlan Aç")}>İlan aç</button></div> : <div className="group-card-grid">{filtered.map((row) => <article key={row.id}>
        <header><span>{row.category}</span><time>{new Date(row.startAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</time></header>
        <h4>{row.title}</h4><p>{row.region} · {row.server}</p>
        <div className="group-role-list">{row.roles.map((role) => <span key={role}>{role}</span>)}</div>
        <dl><div><dt>Lider</dt><dd>{row.leaderAlias}</dd></div><div><dt>Duyuru kanalı</dt><dd>{row.channel}</dd></div></dl>
        <footer><button onClick={() => copyAnnouncement(row)}>Duyuruyu kopyala</button>{receipts[row.id] && <button className="cancel" onClick={() => cancel(row)}>İlanımı kapat</button>}</footer>
      </article>)}</div>}
    </> : <div className="group-compose">
      <section className="announcement-import"><header><span>01 · METİNDEN AKTAR</span><b>WhatsApp, Discord veya oyun sohbeti duyurusu</b></header><textarea value={raw} onChange={(event) => setRaw(event.target.value)} placeholder="Örn. Saat 21.30 Büyük Hol tılsım farmı için tank ve şifacı aranıyor. Discord."/><button onClick={parseRaw}>Duyuruyu alanlara ayır</button><p>Site sohbetlerini otomatik okumaz. Yalnız senin yapıştırdığın metin cihazında ayrıştırılır; ham sohbet metni sunucuya gönderilmez.</p></section>
      <section className="group-form"><header><span>02 · KONTROL ET VE YAYIMLA</span><b>Yapılandırılmış ilan</b></header>
        <div className="group-fields"><label><span>Başlık</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })}/></label><label><span>Bölge</span><select value={draft.region} onChange={(event) => setDraft({ ...draft, region: event.target.value })}>{GROUP_REGIONS.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Tür</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{GROUP_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Liderin oyun içi adı</span><input value={draft.leaderAlias} onChange={(event) => setDraft({ ...draft, leaderAlias: event.target.value })} placeholder="Telefon veya bağlantı yazma"/></label><label><span>Tarih</span><input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })}/></label><label><span>Saat</span><input type="time" value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })}/></label><label><span>İlan süresi</span><select value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: event.target.value })}><option value="60">60 dakika</option><option value="90">90 dakika</option><option value="120">2 saat</option><option value="180">3 saat</option><option value="360">6 saat</option></select></label><label><span>Duyuru kanalı</span><select value={draft.channel} onChange={(event) => setDraft({ ...draft, channel: event.target.value })}>{GROUP_CHANNELS.map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <div className="role-picker"><span>ARANAN ROLLER</span>{GROUP_ROLES.map((role) => <button key={role} className={draft.roles.includes(role) ? "active" : ""} onClick={() => toggleRole(role)}>{role}</button>)}</div>
        <input className="group-honeypot" tabIndex={-1} autoComplete="off" value={draft.website} onChange={(event) => setDraft({ ...draft, website: event.target.value })} aria-hidden="true"/>
        <button className="publish-group" disabled={submitting || !clientToken} onClick={submit}>{submitting ? "Yayımlanıyor…" : "Süreli ilanı yayımla"}</button>
      </section>
    </div>}
    <div className="group-guardrails"><span>GİZLİLİK VE YÜK KURALI</span><p>Telefon, özel grup bağlantısı ve ham sohbet metni yayımlanmaz. Katılımcı sayısı uydurulmaz. İlanın dünya nesnesi veya sürekli sohbet mesajı olmadığı için oyun sunucusuna yük bindirmez.</p></div>
  </div>;
}
