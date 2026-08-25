"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateFarmSession,
  compareBoosterProfiles,
  summarizeFarmSessions,
} from "../../lib/farm-core.mjs";

type YieldRow = {
  id: string;
  sessionId?: string;
  material: string;
  grade: string;
  quantity: number;
  unitGamePrice: number | null;
  unitTlKurus: number | null;
};
type FarmSession = {
  id: string;
  server: string;
  region: string;
  routeName: string;
  profession: string;
  observedAt: string;
  durationMinutes: number;
  nodeCount: number;
  boosterProfile: string;
  gameCost: number;
  tlCostKurus: number;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  yields: YieldRow[];
  metrics: Record<string, number>;
};
type DraftYield = {
  material: string;
  grade: string;
  quantity: string;
  unitGamePrice: string;
  unitTlPrice: string;
};
type Tab = "Özet" | "Yeni Tur" | "Kayıtlar";

const regions = ["Büyük Hol", "Eminönü", "Antrepo", "Labirent", "Meteor Bölgesi", "Sivri Ada", "Yeraltı", "Topkapı Sarayı"];
const materials = ["Xenotim", "Jadeit", "Yeşim Taşı", "Monazit", "Gadolinyum", "Osmiridyum", "Osmiyum", "İridyum", "Altın", "Saf Altın", "Krizoberil", "Alexandrite"];
const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};
const emptyYield = (): DraftYield => ({ material: "", grade: "Normal", quantity: "1", unitGamePrice: "", unitTlPrice: "" });
const freshForm = () => ({
  server: "Kıyamet Öncüleri",
  region: "Büyük Hol",
  routeName: "Lojman rotası",
  profession: "Sarraf",
  observedAt: today(),
  durationMinutes: "30",
  nodeCount: "1",
  boosterProfile: "Yok",
  gameCost: "",
  tlCost: "",
  notes: "",
  yields: [emptyYield()],
});

export default function FarmOperations({ adminName, signOutHref }: { adminName: string; signOutHref: string }) {
  const [tab, setTab] = useState<Tab>("Özet");
  const [sessions, setSessions] = useState<FarmSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [period, setPeriod] = useState("30");
  const [region, setRegion] = useState("Tümü");
  const [route, setRoute] = useState("Tümü");
  const [material, setMaterial] = useState("Tümü");
  const [form, setForm] = useState(freshForm);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState("");
  const [filterAnchor] = useState(today);

  useEffect(() => {
    let activeRequest = true;
    const run = async () => {
      try {
        const response = await fetch("/api/admin/farm-sessions");
        const result = (await response.json()) as { sessions?: FarmSession[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Kayıtlar yüklenemedi.");
        if (activeRequest) setSessions(result.sessions ?? []);
      } catch (requestError) {
        if (activeRequest) setError(requestError instanceof Error ? requestError.message : "Kayıtlar yüklenemedi.");
      } finally {
        if (activeRequest) setLoading(false);
      }
    };
    void run();
    return () => { activeRequest = false; };
  }, []);

  const active = useMemo(() => sessions.filter((session) => session.status === "active"), [sessions]);
  const regionOptions = useMemo(() => [...new Set(active.map((session) => session.region))], [active]);
  const routeOptions = useMemo(() => [...new Set(active.map((session) => session.routeName))], [active]);
  const materialOptions = useMemo(() => [...new Set(active.flatMap((session) => session.yields.map((row) => row.material)))], [active]);
  const filtered = useMemo(() => {
    const anchor = new Date(`${filterAnchor}T12:00:00Z`).getTime();
    const cutoff = period === "all" ? "" : new Date(anchor - Number(period) * 86_400_000).toISOString().slice(0, 10);
    return active.filter((session) =>
      (!cutoff || session.observedAt >= cutoff) &&
      (region === "Tümü" || session.region === region) &&
      (route === "Tümü" || session.routeName === route) &&
      (material === "Tümü" || session.yields.some((row) => row.material === material)),
    );
  }, [active, filterAnchor, material, period, region, route]);
  const summary = useMemo(() => summarizeFarmSessions(filtered) as Record<string, number | string>, [filtered]);
  const boosters = useMemo(() => compareBoosterProfiles(filtered) as Record<string, number | string>[], [filtered]);
  const prices = useMemo(() => filtered.flatMap((session) => session.yields.flatMap((row) => [
    row.unitGamePrice == null ? null : { material: row.material, currency: "Oyun parası", value: row.unitGamePrice, date: session.observedAt },
    row.unitTlKurus == null ? null : { material: row.material, currency: "TL", value: row.unitTlKurus / 100, date: session.observedAt },
  ].filter(Boolean) as {material:string;currency:string;value:number;date:string}[])).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8), [filtered]);

  const updateYield = (index: number, key: keyof DraftYield, value: string) => {
    setForm((current) => ({ ...current, yields: current.yields.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row) }));
  };
  const submit = async () => {
    if (saving) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        nodeCount: Number(form.nodeCount),
        gameCost: form.gameCost === "" ? null : Number(form.gameCost),
        tlCost: form.tlCost === "" ? null : Number(form.tlCost),
        yields: form.yields.map((row) => ({
          ...row,
          quantity: Number(row.quantity),
          unitGamePrice: row.unitGamePrice === "" ? null : Number(row.unitGamePrice),
          unitTlPrice: row.unitTlPrice === "" ? null : Number(row.unitTlPrice),
        })),
      };
      const response = await fetch("/api/admin/farm-sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = (await response.json()) as { session?: FarmSession; error?: string };
      if (!response.ok || !result.session) throw new Error(result.error || "Tur kaydedilemedi.");
      setSessions((current) => [result.session!, ...current]);
      setForm(freshForm());
      setSuccess("Tur kaydedildi; özet ve karşılaştırmalar güncellendi.");
      setTab("Özet");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Tur kaydedilemedi.");
    } finally { setSaving(false); }
  };
  const setStatus = async (session: FarmSession) => {
    const next = session.status === "active" ? "archived" : "active";
    setActing(session.id); setError("");
    try {
      const response = await fetch("/api/admin/farm-sessions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: session.id, status: next }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Kayıt güncellenemedi.");
      setSessions((current) => current.map((row) => row.id === session.id ? { ...row, status: next } : row));
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Kayıt güncellenemedi."); }
    finally { setActing(""); }
  };

  return <main className="farmOps">
    <header className="farmTopbar">
      <Link href="/" className="farmBrand"><i>N</i><span><b>NEFER ATLASI</b><small>SAHA OPERASYONU</small></span></Link>
      <div><span><small>SAHA EDİTÖRÜ</small><b>{adminName}</b></span><Link href="/katki-inceleme">Editör Masası</Link><a href={signOutHref}>Çıkış</a></div>
    </header>
    <section className="farmHero">
      <div><p>M9 · MADEN FARM DEFTERİ</p><h1>Turu kaydet.<br/><em>Verimi kanıtla.</em></h1><span>Oyun parası ile TL birbirine çevrilmez; sonuçlar ayrı hesaplanır.</span></div>
      <div className="farmHeroStats"><Metric label="Etkin tur" value={String(summary.sessionCount ?? 0)}/><Metric label="Toplam süre" value={durationLabel(Number(summary.durationMinutes ?? 0))}/><Metric label="Toplanan" value={fmt(Number(summary.totalQuantity ?? 0))}/><Metric label="Güven" value={String(summary.confidence ?? "Tek tur")}/></div>
    </section>
    <nav className="farmTabs">{(["Özet","Yeni Tur","Kayıtlar"] as Tab[]).map((item) => <button className={tab === item ? "on" : ""} onClick={() => { setTab(item); setError(""); setSuccess(""); }} key={item}>{item}</button>)}</nav>
    {error && <p className="farmMessage error">{error}</p>}{success && <p className="farmMessage success">{success}</p>}
    {tab === "Özet" && <section className="farmDashboard">
      <div className="farmFilters"><select aria-label="Dönem" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="7">Son 7 gün</option><option value="30">Son 30 gün</option><option value="all">Tüm dönem</option></select><select aria-label="Bölge" value={region} onChange={(event) => setRegion(event.target.value)}><option>Tümü</option>{regionOptions.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Rota" value={route} onChange={(event) => setRoute(event.target.value)}><option>Tümü</option>{routeOptions.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Maden" value={material} onChange={(event) => setMaterial(event.target.value)}><option>Tümü</option>{materialOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
      {loading ? <div className="farmEmpty">Farm kayıtları yükleniyor…</div> : filtered.length === 0 ? <div className="farmEmpty"><i>◇</i><b>İlk ölçümlü turunu kaydet</b><span>Süre, damar ve çıkan maden olmadan verim tahmini yapılmaz.</span><button onClick={() => setTab("Yeni Tur")}>Tur ekle</button></div> : <>
        <div className="farmKpis"><Metric label="Adet / saat" value={decimal(Number(summary.itemsPerHour ?? 0))}/><Metric label="Net oyun parası / saat" value={fmt(Number(summary.gamePerHour ?? 0))}/><Metric label="Net TL / saat" value={money(Number(summary.tlKurusPerHour ?? 0) / 100)}/><Metric label="Toplam damar" value={fmt(Number(summary.nodeCount ?? 0))}/></div>
        <div className="farmPanels"><article><PanelHead eyebrow="ARTIRICI TESTİ" title="Eşit şartta karşılaştır"/><div className="boosterCompare">{boosters.map((row) => <div key={String(row.boosterProfile)}><span><b>{row.boosterProfile}</b><small>{row.sessionCount} tur · {row.confidence}</small></span><strong>{decimal(Number(row.itemsPerHour))}<small>adet/saat</small></strong><em>{fmt(Number(row.gamePerHour))}<small>oyun parası/saat</small></em></div>)}</div><p className="farmCaution">Artırıcı sonucu ancak aynı rota, benzer süre ve yeterli tur sayısıyla anlamlıdır. Bu tablo nedensellik iddiası değildir.</p></article><article><PanelHead eyebrow="FİYAT DEFTERİ" title="Son birim gözlemleri"/><div className="priceLedger">{prices.length ? prices.map((row, index) => <div key={`${row.material}-${row.currency}-${row.date}-${index}`}><span><b>{row.material}</b><small>{row.date}</small></span><em>{row.currency}</em><strong>{row.currency === "TL" ? money(row.value) : fmt(row.value)}</strong></div>) : <p>Fiyat girilen maden satırı yok.</p>}</div></article></div>
        <SessionCards sessions={filtered.slice(0, 6)} onStatus={setStatus} acting={acting}/>
      </>}
    </section>}
    {tab === "Yeni Tur" && <section className="farmForm"><header><p>ÖLÇÜMLÜ SAHA KAYDI</p><h2>Yeni farm turu</h2><span>Bir turu bir rota ve tek artırıcı profiliyle kaydet. Fiyat bilmiyorsan boş bırak.</span></header><div className="farmFormGrid">
      <FormField label="Sunucu"><input value={form.server} onChange={(e) => setForm({...form,server:e.target.value})}/></FormField><FormField label="Tarih"><input type="date" value={form.observedAt} onChange={(e) => setForm({...form,observedAt:e.target.value})}/></FormField><FormField label="Bölge"><input list="farm-regions" value={form.region} onChange={(e) => setForm({...form,region:e.target.value})}/><datalist id="farm-regions">{regions.map((item)=><option key={item} value={item}/>)}</datalist></FormField><FormField label="Rota adı"><input value={form.routeName} onChange={(e) => setForm({...form,routeName:e.target.value})}/></FormField><FormField label="Meslek"><select value={form.profession} onChange={(e) => setForm({...form,profession:e.target.value})}><option>Madenci</option><option>Sarraf</option></select></FormField><FormField label="Artırıcı"><select value={form.boosterProfile} onChange={(e) => setForm({...form,boosterProfile:e.target.value})}><option>Yok</option><option>Kişisel</option><option>Lonca</option><option>Kişisel + Lonca</option></select></FormField><FormField label="Süre (dakika)"><input type="number" min="1" max="720" value={form.durationMinutes} onChange={(e) => setForm({...form,durationMinutes:e.target.value})}/></FormField><FormField label="Toplanan damar"><input type="number" min="1" value={form.nodeCount} onChange={(e) => setForm({...form,nodeCount:e.target.value})}/></FormField><FormField label="Oyun parası maliyeti"><input type="number" min="0" placeholder="İsteğe bağlı" value={form.gameCost} onChange={(e) => setForm({...form,gameCost:e.target.value})}/></FormField><FormField label="TL maliyeti"><input type="number" min="0" step="0.01" placeholder="İsteğe bağlı" value={form.tlCost} onChange={(e) => setForm({...form,tlCost:e.target.value})}/></FormField></div>
      <div className="yieldEditor"><div><span><small>ÇIKTI SATIRLARI</small><b>Maden, kalite, adet ve gözlenen fiyat</b></span><button onClick={() => setForm((current) => ({...current,yields:[...current.yields,emptyYield()]}))}>+ Satır ekle</button></div>{form.yields.map((row,index)=><article key={index}><FormField label="Maden"><input list="farm-materials" value={row.material} onChange={(e)=>updateYield(index,"material",e.target.value)}/></FormField><FormField label="Kalite"><select value={row.grade} onChange={(e)=>updateYield(index,"grade",e.target.value)}><option>Normal</option><option>Saf</option><option>Nadir</option></select></FormField><FormField label="Adet"><input type="number" min="1" value={row.quantity} onChange={(e)=>updateYield(index,"quantity",e.target.value)}/></FormField><FormField label="Birim oyun parası"><input type="number" min="0" placeholder="Bilinmiyorsa boş" value={row.unitGamePrice} onChange={(e)=>updateYield(index,"unitGamePrice",e.target.value)}/></FormField><FormField label="Birim TL"><input type="number" min="0" step="0.01" placeholder="Bilinmiyorsa boş" value={row.unitTlPrice} onChange={(e)=>updateYield(index,"unitTlPrice",e.target.value)}/></FormField><button aria-label="Satırı kaldır" disabled={form.yields.length === 1} onClick={() => setForm((current)=>({...current,yields:current.yields.filter((_,i)=>i!==index)}))}>×</button></article>)}<datalist id="farm-materials">{materials.map((item)=><option key={item} value={item}/>)}</datalist></div>
      <FormField label="Saha notu"><textarea maxLength={1500} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Yoğunluk, bekleme, rekabet, rota sapması veya gözlem…"/></FormField><div className="farmFormNotice"><b>Hesap ilkesi</b><span>Fiyatı olmayan çıktı adet/saat hesabına girer; parasal değere girmez. TL ile oyun parası asla birbirine dönüştürülmez.</span></div><div className="farmFormActions"><button onClick={() => setTab("Özet")}>Vazgeç</button><button disabled={saving} onClick={() => void submit()}>{saving ? "Kaydediliyor…" : "Turu kaydet"}</button></div>
    </section>}
    {tab === "Kayıtlar" && <section className="farmRecords"><header><div><p>SAHA ARŞİVİ</p><h2>Tüm turlar</h2></div><span>{active.length} etkin · {sessions.length-active.length} arşiv</span></header>{sessions.length ? <SessionCards sessions={sessions} onStatus={setStatus} acting={acting}/> : <div className="farmEmpty">Henüz kayıt yok.</div>}</section>}
  </main>;
}

function Metric({label,value}:{label:string;value:string}){return <article><small>{label}</small><strong>{value}</strong></article>}
function PanelHead({eyebrow,title}:{eyebrow:string;title:string}){return <header className="farmPanelHead"><span>{eyebrow}</span><h3>{title}</h3></header>}
function FormField({label,children}:{label:string;children:React.ReactNode}){return <label className="farmField"><span>{label}</span>{children}</label>}
function SessionCards({sessions,onStatus,acting}:{sessions:FarmSession[];onStatus:(session:FarmSession)=>Promise<void>;acting:string}){return <div className="sessionCards">{sessions.map((session)=>{const metrics = calculateFarmSession(session) as Record<string,number>;return <article className={session.status === "archived" ? "archived" : ""} key={session.id}><header><span><small>{session.observedAt} · {session.profession}</small><h4>{session.routeName}</h4><p>{session.region} · {session.server}</p></span><b>{session.boosterProfile}</b></header><div className="sessionNumbers"><span><small>Süre</small><b>{session.durationMinutes} dk</b></span><span><small>Damar</small><b>{session.nodeCount}</b></span><span><small>Adet/saat</small><b>{decimal(metrics.itemsPerHour)}</b></span><span><small>Oyun/saat</small><b>{fmt(metrics.gamePerHour)}</b></span></div><div className="sessionYields">{session.yields.map((row)=><span key={row.id}><b>{row.material}</b><small>{row.grade} · {row.quantity} adet</small></span>)}</div>{session.notes && <p>{session.notes}</p>}<footer><small>Fiyat kapsamı: oyun %{Math.round(metrics.gameCoverage*100)} · TL %{Math.round(metrics.tlCoverage*100)}</small><button disabled={acting===session.id} onClick={()=>void onStatus(session)}>{session.status === "archived" ? "Geri yükle" : "Arşivle"}</button></footer></article>})}</div>}
const fmt=(value:number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(Number.isFinite(value)?value:0);
const decimal=(value:number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:1}).format(Number.isFinite(value)?value:0);
const money=(value:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:2}).format(Number.isFinite(value)?value:0);
const durationLabel=(minutes:number)=>minutes>=60?`${Math.floor(minutes/60)} sa ${minutes%60} dk`:`${minutes} dk`;
