"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GUILD_BOOSTER_SCOPES,
  GUILD_BOOSTER_STATUSES,
  GUILD_EXPENSE_CATEGORIES,
  GUILD_GOAL_CATEGORIES,
  GUILD_ROLES,
} from "../lib/guild-logistics-core.mjs";

type GoalDraft = { title: string; category: string; targetAmount: string; unit: string; assignedRole: string };
type Goal = { id: string; title: string; category: string; targetAmount: number; unit: string; assignedRole: string; progress: { collected: number; remaining: number; percent: number } };
type Contribution = { id: string; goalId: string; contributorAlias: string; amount: number; note: string | null; createdAt: string };
type Expense = { id: string; title: string; category: string; gameAmount: number; note: string | null };
type Booster = { id: string; title: string; scope: string; quantity: number; status: string; sponsorAlias: string | null; note: string | null };
type Board = { id: string; publicCode: string; guildName: string; server: string; weekStart: string; note: string | null; status: string; goals: Goal[]; contributions: Contribution[]; expenses: Expense[]; boosters: Booster[]; totals: { gameExpense: number; contributionCount: number; completedGoals: number } };

const CLIENT_KEY = "nefer-atlasi:guild-client:v1";
const MANAGER_KEY = "nefer-atlasi:guild-managers:v1";
const unitFor = (category: string) => category === "Oyun parası" ? "oyun parası" : category === "Farm turu" ? "tur" : category === "Grup bölgesi" ? "kişi" : category === "Hazırlık" ? "görev" : "adet";
const goalDraft = (title = "", category = "Malzeme"): GoalDraft => ({ title, category, targetAmount: "1", unit: unitFor(category), assignedRole: "Tüm lonca" });

function mondayDate() {
  const date = new Date();
  const day = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Istanbul", weekday: "short" }).format(date);
  const index = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(day);
  date.setUTCDate(date.getUTCDate() - Math.max(0, index));
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export default function GuildLogistics() {
  const [mode, setMode] = useState<"Aç" | "Oluştur">("Aç");
  const [code, setCode] = useState("");
  const [board, setBoard] = useState<Board | null>(null);
  const [clientToken, setClientToken] = useState("");
  const [managerTokens, setManagerTokens] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [weekStart, setWeekStart] = useState(mondayDate);
  const [boardNote, setBoardNote] = useState("");
  const [goals, setGoals] = useState<GoalDraft[]>([
    { ...goalDraft("Haftalık malzeme hedefi"), targetAmount: "50", assignedRole: "Farm ekibi" },
    { ...goalDraft("Artırıcı bütçesi", "Oyun parası"), targetAmount: "500000" },
  ]);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [alias, setAlias] = useState("");
  const [contributionAmount, setContributionAmount] = useState("1");
  const [contributionNote, setContributionNote] = useState("");
  const [lastReceipt, setLastReceipt] = useState("");
  const [manageView, setManageView] = useState<"Hedef" | "Gider" | "Artırıcı">("Hedef");
  const [newGoal, setNewGoal] = useState<GoalDraft>(goalDraft());
  const [expense, setExpense] = useState({ title: "", category: "Artırıcı", gameAmount: "", note: "" });
  const [booster, setBooster] = useState({ title: "", scope: "Grup bölgesi", quantity: "1", status: "Planlandı", sponsorAlias: "", note: "" });

  const managerToken = board ? managerTokens[board.publicCode] || "" : "";
  const selected = board?.goals.find((goal) => goal.id === selectedGoal) || null;
  const weeklyEnd = useMemo(() => {
    if (!board) return "";
    const end = new Date(`${board.weekStart}T00:00:00+03:00`);
    end.setDate(end.getDate() + 6);
    return end.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "short" });
  }, [board]);

  const loadBoard = useCallback(async (requested: string) => {
    const normalized = requested.trim().toUpperCase();
    if (!normalized) return setNotice("Lonca planı kodunu gir.");
    setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/guild-logistics?code=${encodeURIComponent(normalized)}&t=${Date.now()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Plan açılamadı.");
      setBoard(data.board); setCode(data.board.publicCode); setSelectedGoal(data.board.goals[0]?.id || "");
      const url = new URL(location.href); url.searchParams.set("module", "endgame"); url.searchParams.set("panel", "Lonca"); url.searchParams.set("guild", data.board.publicCode); history.replaceState(null, "", url);
    } catch (error) { setBoard(null); setNotice(error instanceof Error ? error.message : "Plan açılamadı."); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      let token = localStorage.getItem(CLIENT_KEY) || "";
      if (!/^[A-Za-z0-9_-]{20,128}$/.test(token)) {
        token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
        localStorage.setItem(CLIENT_KEY, token);
      }
      setClientToken(token);
      try { setManagerTokens(JSON.parse(localStorage.getItem(MANAGER_KEY) || "{}")); } catch { localStorage.removeItem(MANAGER_KEY); }
      const requested = new URLSearchParams(location.search).get("guild");
      if (requested) { setCode(requested.toUpperCase()); void loadBoard(requested); }
    }, 0);
    return () => window.clearTimeout(initialize);
  }, [loadBoard]);

  async function createBoard() {
    if (!clientToken) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/guild-logistics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guildName, server: "Kıyametin Öncüleri", weekStart, note: boardNote, goals: goals.map((goal) => ({ ...goal, targetAmount: Number(goal.targetAmount) })), clientToken, website: "" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Plan oluşturulamadı.");
      const next = { ...managerTokens, [data.publicCode]: data.managerToken };
      setManagerTokens(next); localStorage.setItem(MANAGER_KEY, JSON.stringify(next));
      setBoard(data.board); setCode(data.publicCode); setSelectedGoal(data.board.goals[0]?.id || ""); setMode("Aç");
      const url = new URL(location.href); url.searchParams.set("module", "endgame"); url.searchParams.set("panel", "Lonca"); url.searchParams.set("guild", data.publicCode); history.replaceState(null, "", url);
      setNotice("Plan açıldı. Yönetim anahtarı bu cihazda saklandı; paylaşım bağlantısında yer almıyor.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Plan oluşturulamadı."); }
    finally { setBusy(false); }
  }

  async function addContribution() {
    if (!board || !selected || !clientToken) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/guild-logistics/contributions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: board.publicCode, goalId: selected.id, contributorAlias: alias, amount: Number(contributionAmount), note: contributionNote, clientToken, website: "" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Katkı işlenemedi.");
      setBoard(data.board); setLastReceipt(data.receipt); setContributionNote(""); setNotice(data.message);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Katkı işlenemedi."); }
    finally { setBusy(false); }
  }

  async function retractLast() {
    if (!lastReceipt || !board) return;
    setBusy(true);
    const response = await fetch("/api/guild-logistics/contributions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receipt: lastReceipt }) });
    const data = await response.json();
    if (response.ok) { setLastReceipt(""); setNotice(data.message); await loadBoard(board.publicCode); }
    else setNotice(data.error || "Katkı geri çekilemedi.");
    setBusy(false);
  }

  async function manage(payload: Record<string, unknown>) {
    if (!board || !managerToken) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/guild-logistics/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: board.publicCode, managerToken, ...payload }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Plan güncellenemedi.");
      setBoard(data.board); setNotice(data.message);
      if (payload.action === "add-goal") setNewGoal(goalDraft());
      if (payload.action === "add-expense") setExpense({ title: "", category: "Artırıcı", gameAmount: "", note: "" });
      if (payload.action === "add-booster") setBooster({ title: "", scope: "Grup bölgesi", quantity: "1", status: "Planlandı", sponsorAlias: "", note: "" });
    } catch (error) { setNotice(error instanceof Error ? error.message : "Plan güncellenemedi."); }
    finally { setBusy(false); }
  }

  async function shareBoard() {
    if (!board) return;
    const url = `${location.origin}${location.pathname}?module=endgame&panel=Lonca&guild=${board.publicCode}#endgame`;
    await navigator.clipboard.writeText(`${board.guildName} haftalık lonca planı\n${url}`);
    setNotice("Lonca planı bağlantısı kopyalandı. Yönetim anahtarı paylaşılmadı.");
  }

  if (!board) return <div className="eg-panel guild-logistics">
    <div className="panel-intro"><div><small>M17 · LONCA LOJİSTİK MASASI</small><h3>Hedef, katkı ve gider aynı defterde.</h3></div><p>Haftalık planı aç; malzeme, oyun parası, farm ve grup hedeflerini takip et. Gerçek para, telefon ve özel grup bağlantısı tutulmaz.</p></div>
    <div className="guild-entry-tabs"><button className={mode === "Aç" ? "active" : ""} onClick={() => setMode("Aç")}>Planı aç</button><button className={mode === "Oluştur" ? "active" : ""} onClick={() => setMode("Oluştur")}>Yeni plan</button></div>
    {notice && <p className="guild-notice" role="status">{notice}</p>}
    {mode === "Aç" ? <section className="guild-lookup"><div><span>PAYLAŞIM KODU</span><h4>Loncanın haftalık masasına katıl.</h4><p>Kod yalnız planı görüntüler ve katkı işlemeyi sağlar; yönetim yetkisi vermez.</p></div><label><span>Lonca planı kodu</span><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="NA-LONCA-ABC234"/><button disabled={busy} onClick={() => loadBoard(code)}>{busy ? "Açılıyor…" : "Planı aç"}</button></label></section> : <section className="guild-create">
      <div className="guild-create-fields"><label><span>Lonca adı</span><input value={guildName} onChange={(event) => setGuildName(event.target.value)} placeholder="Oyun içindeki lonca adı"/></label><label><span>Hafta başlangıcı</span><input type="date" value={weekStart} onChange={(event) => setWeekStart(event.target.value)}/></label><label className="wide"><span>Haftalık not</span><input value={boardNote} onChange={(event) => setBoardNote(event.target.value)} placeholder="Örn. Öncelik Büyük Hol ve artırıcı hazırlığı"/></label></div>
      <header><span>BAŞLANGIÇ HEDEFLERİ</span><button onClick={() => goals.length < 8 && setGoals([...goals, goalDraft()])}>+ Hedef</button></header>
      <div className="guild-goal-edit-list">{goals.map((goal, index) => <article key={index}><b>{String(index + 1).padStart(2, "0")}</b><input value={goal.title} onChange={(event) => setGoals(goals.map((item, i) => i === index ? { ...item, title: event.target.value } : item))} placeholder="Hedef adı"/><select value={goal.category} onChange={(event) => setGoals(goals.map((item, i) => i === index ? { ...item, category: event.target.value, unit: unitFor(event.target.value) } : item))}>{GUILD_GOAL_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select><input type="number" min="1" value={goal.targetAmount} onChange={(event) => setGoals(goals.map((item, i) => i === index ? { ...item, targetAmount: event.target.value } : item))}/><span>{goal.unit}</span><select value={goal.assignedRole} onChange={(event) => setGoals(goals.map((item, i) => i === index ? { ...item, assignedRole: event.target.value } : item))}>{GUILD_ROLES.map((item) => <option key={item}>{item}</option>)}</select>{goals.length > 1 && <button aria-label="Hedefi kaldır" onClick={() => setGoals(goals.filter((_, i) => i !== index))}>×</button>}</article>)}</div>
      <button className="guild-primary" disabled={busy || !clientToken} onClick={createBoard}>{busy ? "Oluşturuluyor…" : "Haftalık masayı aç"}</button>
    </section>}
    <div className="guild-guardrail"><b>Şeffaflık kuralı</b><p>Katkılar oyun içi takiptir; otomatik tahsilat veya ödeme sistemi değildir. Oyun parası ile gerçek para aynı yerde gösterilmez.</p></div>
  </div>;

  return <div className="eg-panel guild-logistics">
    <div className="guild-board-head"><div><small>{board.status === "active" ? "AKTİF HAFTALIK PLAN" : "KAPATILMIŞ PLAN"}</small><h3>{board.guildName}</h3><p>{board.server} · {new Date(`${board.weekStart}T12:00:00+03:00`).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}–{weeklyEnd}</p></div><div className="guild-head-actions"><code>{board.publicCode}</code><button onClick={shareBoard}>Paylaş</button><button className="quiet" onClick={() => { setBoard(null); setCode(""); }}>Başka plan</button></div></div>
    {board.note && <p className="guild-board-note">{board.note}</p>}
    {notice && <p className="guild-notice" role="status">{notice}</p>}
    <div className="guild-kpis"><article><small>HEDEF</small><b>{board.totals.completedGoals}/{board.goals.length}</b><span>tamamlandı</span></article><article><small>KATKI</small><b>{board.totals.contributionCount}</b><span>işlem</span></article><article><small>GİDER</small><b>{new Intl.NumberFormat("tr-TR").format(board.totals.gameExpense)}</b><span>oyun parası</span></article><article><small>ARTIRICI</small><b>{board.boosters.filter((item) => item.status === "Aktif").length}</b><span>aktif</span></article></div>
    <div className="guild-workspace">
      <section className="guild-goals"><header><span>HAFTALIK HEDEFLER</span><b>{board.goals.length} kayıt</b></header>{board.goals.map((goal) => <article key={goal.id} className={selectedGoal === goal.id ? "selected" : ""} onClick={() => setSelectedGoal(goal.id)}><div><small>{goal.category} · {goal.assignedRole}</small><h4>{goal.title}</h4></div><b>{goal.progress.percent}%</b><div className="guild-progress"><i style={{ width: `${goal.progress.percent}%` }}/></div><footer><span>{new Intl.NumberFormat("tr-TR").format(goal.progress.collected)} / {new Intl.NumberFormat("tr-TR").format(goal.targetAmount)} {goal.unit}</span><button onClick={(event) => { event.stopPropagation(); setSelectedGoal(goal.id); }}>Katkı işle</button></footer></article>)}</section>
      <aside className="guild-contribute"><small>KATKI İŞLE</small><h4>{selected?.title || "Hedef seç"}</h4><p>Oyun içi adın ve katkı miktarın lonca planında görünür.</p><label><span>Oyun içi ad</span><input value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="Karakter adı"/></label><label><span>Miktar {selected ? `· ${selected.unit}` : ""}</span><input type="number" min="1" value={contributionAmount} onChange={(event) => setContributionAmount(event.target.value)}/></label><label><span>Kısa not · isteğe bağlı</span><input value={contributionNote} onChange={(event) => setContributionNote(event.target.value)} placeholder="Örn. 2 tur Büyük Hol"/></label><button className="guild-primary" disabled={busy || !selected || board.status !== "active"} onClick={addContribution}>Katkıyı kaydet</button>{lastReceipt && <button className="guild-retract" disabled={busy} onClick={retractLast}>Son katkımı geri çek</button>}</aside>
    </div>
    <div className="guild-ledgers"><section><header><span>ARTIRICI DEFTERİ</span><b>{board.boosters.length}</b></header>{board.boosters.length ? board.boosters.map((item) => <article key={item.id}><div><small>{item.scope}</small><b>{item.title}</b><span>{item.quantity} adet{item.sponsorAlias ? ` · ${item.sponsorAlias}` : ""}</span></div><em className={`status-${item.status.toLocaleLowerCase("tr-TR")}`}>{item.status}</em>{managerToken && item.status !== "Tükendi" && <select value={item.status} onChange={(event) => manage({ action: "set-booster-status", boosterId: item.id, status: event.target.value })}>{GUILD_BOOSTER_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>}</article>) : <p>Henüz artırıcı kaydı yok.</p>}</section><section><header><span>GİDER DEFTERİ</span><b>{board.expenses.length}</b></header>{board.expenses.length ? board.expenses.map((item) => <article key={item.id}><div><small>{item.category}</small><b>{item.title}</b>{item.note && <span>{item.note}</span>}</div><strong>{new Intl.NumberFormat("tr-TR").format(item.gameAmount)}<small> oyun parası</small></strong></article>) : <p>Henüz gider kaydı yok.</p>}</section></div>
    <section className="guild-contribution-log"><header><span>SON KATKILAR</span><b>{board.contributions.length}</b></header>{board.contributions.length ? <div>{[...board.contributions].reverse().slice(0, 12).map((item) => <article key={item.id}><b>{item.contributorAlias}</b><span>{board.goals.find((goal) => goal.id === item.goalId)?.title}</span><strong>+{new Intl.NumberFormat("tr-TR").format(item.amount)}</strong></article>)}</div> : <p>Bu hafta henüz katkı işlenmedi.</p>}</section>
    {managerToken && board.status === "active" && <section className="guild-manager"><header><div><small>BU CİHAZDA YÖNETİM YETKİSİ VAR</small><h4>Masayı güncelle</h4></div><nav>{(["Hedef", "Gider", "Artırıcı"] as const).map((item) => <button key={item} className={manageView === item ? "active" : ""} onClick={() => setManageView(item)}>{item}</button>)}</nav></header>{manageView === "Hedef" ? <div className="guild-manager-form"><input value={newGoal.title} onChange={(event) => setNewGoal({ ...newGoal, title: event.target.value })} placeholder="Yeni hedef adı"/><select value={newGoal.category} onChange={(event) => setNewGoal({ ...newGoal, category: event.target.value, unit: unitFor(event.target.value) })}>{GUILD_GOAL_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select><input type="number" min="1" value={newGoal.targetAmount} onChange={(event) => setNewGoal({ ...newGoal, targetAmount: event.target.value })}/><select value={newGoal.assignedRole} onChange={(event) => setNewGoal({ ...newGoal, assignedRole: event.target.value })}>{GUILD_ROLES.map((item) => <option key={item}>{item}</option>)}</select><button onClick={() => manage({ action: "add-goal", goal: { ...newGoal, targetAmount: Number(newGoal.targetAmount) } })}>Hedef ekle</button></div> : manageView === "Gider" ? <div className="guild-manager-form"><input value={expense.title} onChange={(event) => setExpense({ ...expense, title: event.target.value })} placeholder="Gider adı"/><select value={expense.category} onChange={(event) => setExpense({ ...expense, category: event.target.value })}>{GUILD_EXPENSE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select><input type="number" min="1" value={expense.gameAmount} onChange={(event) => setExpense({ ...expense, gameAmount: event.target.value })} placeholder="Oyun parası"/><input value={expense.note} onChange={(event) => setExpense({ ...expense, note: event.target.value })} placeholder="Kısa not"/><button onClick={() => manage({ action: "add-expense", ...expense, gameAmount: Number(expense.gameAmount) })}>Gider ekle</button></div> : <div className="guild-manager-form booster"><input value={booster.title} onChange={(event) => setBooster({ ...booster, title: event.target.value })} placeholder="Artırıcı adı"/><select value={booster.scope} onChange={(event) => setBooster({ ...booster, scope: event.target.value })}>{GUILD_BOOSTER_SCOPES.map((item) => <option key={item}>{item}</option>)}</select><input type="number" min="1" value={booster.quantity} onChange={(event) => setBooster({ ...booster, quantity: event.target.value })}/><select value={booster.status} onChange={(event) => setBooster({ ...booster, status: event.target.value })}>{GUILD_BOOSTER_STATUSES.map((item) => <option key={item}>{item}</option>)}</select><input value={booster.sponsorAlias} onChange={(event) => setBooster({ ...booster, sponsorAlias: event.target.value })} placeholder="Sağlayan oyuncu · isteğe bağlı"/><button onClick={() => manage({ action: "add-booster", ...booster, quantity: Number(booster.quantity) })}>Artırıcı ekle</button></div>}<button className="guild-close" onClick={() => confirm("Bu haftalık planı katkıya kapatmak istiyor musun?") && manage({ action: "close-board" })}>Haftalık planı kapat</button></section>}
    <div className="guild-guardrail"><b>Güvenlik ve adalet</b><p>Bu masa otomatik aidat toplamaz, gerçek para kaydetmez ve katkıyı oyun verisi diye doğrulamaz. Amaç dağılımı görünür kılmak; lonca üyesini borçlandırmak değil.</p></div>
  </div>;
}
