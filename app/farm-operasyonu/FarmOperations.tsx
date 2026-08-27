"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateFarmSession,
  compareBoosterProfiles,
  summarizeFarmSessions,
} from "../../lib/farm-core.mjs";
import {
  groupRoutePerformance,
  projectRoutePerformance,
  summarizeMaterialPrices,
} from "../../lib/farm-analytics.mjs";
import { routeSessionDefaults } from "../../lib/route-core.mjs";
import ProductionPlanner from "./ProductionPlanner";

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
  routeTemplateId: string | null;
  submittedContributionId: string | null;
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
type RoutePoint = { id?: string; pointType: string; label: string; materialHint: string | null; xPermille: number; yPermille: number; notes: string | null };
type FarmRoute = { id: string; server: string; region: string; routeName: string; profession: string; defaultBooster: string; expectedMinutes: number; notes: string | null; status: string; hasMap: boolean; points: RoutePoint[] };
type DraftPoint = { pointType: string; label: string; materialHint: string; xPermille: number; yPermille: number; notes: string };
type Tab = "Özet" | "Yeni Tur" | "Rotalar" | "Üretim" | "Karar" | "Kayıtlar";
type AnalysisMetric = "game" | "tl" | "items";

const regions = ["Büyük Hol", "Eminönü", "Antrepo", "Labirent", "Meteor Bölgesi", "Sivri Ada", "Yeraltı", "Topkapı Sarayı"];
const materials = ["Xenotim", "Jadeit", "Yeşim Taşı", "Monazit", "Gadolinyum", "Osmiridyum", "Osmiyum", "İridyum", "Altın", "Saf Altın", "Krizoberil", "Alexandrite"];
const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};
const emptyYield = (): DraftYield => ({ material: "", grade: "Normal", quantity: "1", unitGamePrice: "", unitTlPrice: "" });
const freshForm = () => ({
  routeTemplateId: "",
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
const freshRoute = () => ({ server: "Kıyamet Öncüleri", region: "Büyük Hol", routeName: "Lojman rotası", profession: "Sarraf", defaultBooster: "Yok", expectedMinutes: "30", notes: "", points: [] as DraftPoint[] });

export default function FarmOperations({ adminName, signOutHref }: { adminName: string; signOutHref: string }) {
  const [tab, setTab] = useState<Tab>("Özet");
  const [sessions, setSessions] = useState<FarmSession[]>([]);
  const [routes, setRoutes] = useState<FarmRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [period, setPeriod] = useState("30");
  const [region, setRegion] = useState("Tümü");
  const [route, setRoute] = useState("Tümü");
  const [material, setMaterial] = useState("Tümü");
  const [analysisRoute, setAnalysisRoute] = useState("");
  const [analysisMetric, setAnalysisMetric] = useState<AnalysisMetric>("items");
  const [projectionMinutes, setProjectionMinutes] = useState("120");
  const [form, setForm] = useState(freshForm);
  const [routeForm, setRouteForm] = useState(freshRoute);
  const [routeFile, setRouteFile] = useState<File | null>(null);
  const [routePreview, setRoutePreview] = useState("");
  const [pointTool, setPointTool] = useState("Damar");
  const [routeSaving, setRouteSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState("");
  const [filterAnchor] = useState(today);

  useEffect(() => {
    let activeRequest = true;
    const run = async () => {
      try {
        const [sessionResponse, routeResponse] = await Promise.all([
          fetch("/api/admin/farm-sessions"),
          fetch("/api/admin/farm-routes"),
        ]);
        const result = (await sessionResponse.json()) as { sessions?: FarmSession[]; error?: string };
        const routeResult = (await routeResponse.json()) as { routes?: FarmRoute[]; error?: string };
        if (!sessionResponse.ok) throw new Error(result.error || "Kayıtlar yüklenemedi.");
        if (!routeResponse.ok) throw new Error(routeResult.error || "Rotalar yüklenemedi.");
        if (activeRequest) { setSessions(result.sessions ?? []); setRoutes(routeResult.routes ?? []); }
      } catch (requestError) {
        if (activeRequest) setError(requestError instanceof Error ? requestError.message : "Kayıtlar yüklenemedi.");
      } finally {
        if (activeRequest) setLoading(false);
      }
    };
    void run();
    return () => { activeRequest = false; };
  }, []);

  useEffect(() => () => { if (routePreview) URL.revokeObjectURL(routePreview); }, [routePreview]);

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
  const boosters = useMemo(() => route === "Tümü" ? [] : compareBoosterProfiles(filtered) as Record<string, number | string>[], [filtered, route]);
  const prices = useMemo(() => filtered.flatMap((session) => session.yields.flatMap((row) => [
    row.unitGamePrice == null ? null : { material: row.material, currency: "Oyun parası", value: row.unitGamePrice, date: session.observedAt },
    row.unitTlKurus == null ? null : { material: row.material, currency: "TL", value: row.unitTlKurus / 100, date: session.observedAt },
  ].filter(Boolean) as {material:string;currency:string;value:number;date:string}[])).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8), [filtered]);
  const analysisBase = useMemo(() => {
    const anchor = new Date(`${filterAnchor}T12:00:00Z`).getTime();
    const cutoff = period === "all" ? "" : new Date(anchor - Number(period) * 86_400_000).toISOString().slice(0, 10);
    return active.filter((session) =>
      (!cutoff || session.observedAt >= cutoff) &&
      (region === "Tümü" || session.region === region) &&
      (material === "Tümü" || session.yields.some((row) => row.material === material)),
    );
  }, [active, filterAnchor, material, period, region]);
  const routePerformance = useMemo(() => {
    const rows = groupRoutePerformance(analysisBase);
    const metric = analysisMetric === "game" ? "gamePerHour" : analysisMetric === "tl" ? "tlKurusPerHour" : "itemsPerHour";
    return [...rows].sort((a, b) => Number(b[metric]) - Number(a[metric]));
  }, [analysisBase, analysisMetric]);
  const selectedPerformance = routePerformance.find((row) => row.key === analysisRoute) ?? routePerformance[0] ?? null;
  const projection = selectedPerformance ? projectRoutePerformance(selectedPerformance, Number(projectionMinutes)) : null;
  const selectedTemplate = selectedPerformance && typeof selectedPerformance.routeTemplateId === "string"
    ? routes.find((row) => row.id === selectedPerformance.routeTemplateId && row.status === "active") ?? null
    : null;
  const materialPrices = useMemo(() => summarizeMaterialPrices(analysisBase)
    .filter((row) => material === "Tümü" || row.material === material)
    .sort((a,b)=>a.material.localeCompare(b.material,"tr")), [analysisBase, material]);

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
  const chooseRouteFile = (file: File | null) => {
    if (routePreview) URL.revokeObjectURL(routePreview);
    setRouteFile(file);
    setRoutePreview(file ? URL.createObjectURL(file) : "");
    setRouteForm((current) => ({ ...current, points: [] }));
  };
  const placePoint = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!routePreview) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const xPermille = Math.max(0, Math.min(1000, Math.round(((event.clientX - rect.left) / rect.width) * 1000)));
    const yPermille = Math.max(0, Math.min(1000, Math.round(((event.clientY - rect.top) / rect.height) * 1000)));
    const count = routeForm.points.filter((point) => point.pointType === pointTool).length + 1;
    setRouteForm((current) => ({ ...current, points: [...current.points, { pointType: pointTool, label: `${pointTool} ${count}`, materialHint: "", xPermille, yPermille, notes: "" }] }));
  };
  const updatePoint = (index: number, key: keyof DraftPoint, value: string) => {
    setRouteForm((current) => ({ ...current, points: current.points.map((point, pointIndex) => pointIndex === index ? { ...point, [key]: value } : point) }));
  };
  const saveRoute = async () => {
    if (routeSaving) return;
    setRouteSaving(true); setError(""); setSuccess("");
    try {
      if (!routeFile) throw new Error("Rota için bir ekran görüntüsü ekle.");
      const body = new FormData();
      body.set("map", routeFile);
      body.set("payload", JSON.stringify({ ...routeForm, expectedMinutes: Number(routeForm.expectedMinutes) }));
      const response = await fetch("/api/admin/farm-routes", { method: "POST", body });
      const result = (await response.json()) as { route?: FarmRoute; error?: string };
      if (!response.ok || !result.route) throw new Error(result.error || "Rota kaydedilemedi.");
      setRoutes((current) => [result.route!, ...current]);
      setRouteForm(freshRoute()); chooseRouteFile(null);
      setSuccess("Rota şablonu ve özel haritası kaydedildi.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Rota kaydedilemedi."); }
    finally { setRouteSaving(false); }
  };
  const setRouteStatus = async (routeRow: FarmRoute) => {
    const next = routeRow.status === "active" ? "archived" : "active";
    setActing(routeRow.id); setError("");
    try {
      const response = await fetch("/api/admin/farm-routes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: routeRow.id, status: next }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Rota güncellenemedi.");
      setRoutes((current) => current.map((row) => row.id === routeRow.id ? { ...row, status: next } : row));
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Rota güncellenemedi."); }
    finally { setActing(""); }
  };
  const startRoute = (routeRow: FarmRoute) => {
    const defaults = routeSessionDefaults(routeRow) as Record<string, string>;
    setForm((current) => ({ ...current, ...defaults, observedAt: today(), yields: [emptyYield()] }));
    setTab("Yeni Tur"); setError(""); setSuccess(`${routeRow.routeName} şablonu yeni tura aktarıldı.`);
  };
  const submitReview = async (session: FarmSession) => {
    setActing(session.id); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/admin/farm-sessions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: session.id, action: "submit_review" }) });
      const result = (await response.json()) as { submittedContributionId?: string; error?: string };
      if (!response.ok || !result.submittedContributionId) throw new Error(result.error || "Kayıt kuyruğa gönderilemedi.");
      setSessions((current) => current.map((row) => row.id === session.id ? { ...row, submittedContributionId: result.submittedContributionId! } : row));
      setSuccess("Farm gözlemi taslak olarak doğrulama kuyruğuna gönderildi; yayın için bağımsız ikinci kaynak gerekiyor.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Kayıt kuyruğa gönderilemedi."); }
    finally { setActing(""); }
  };

  return <main className="farmOps">
    <header className="farmTopbar">
      <Link href="/" className="farmBrand"><i>N</i><span><b>NEFER ATLASI</b><small>SAHA OPERASYONU</small></span></Link>
      <div><span><small>SAHA EDİTÖRÜ</small><b>{adminName}</b></span><Link href="/katki-inceleme">Editör Masası</Link><a href={signOutHref}>Çıkış</a></div>
    </header>
    <section className="farmHero">
      <div><p>M11 · SAHA KARAR MASASI</p><h1>Veriyi karşılaştır.<br/><em>Rotanı bilinçli seç.</em></h1><span>Sıralamalar yalnız kaydedilmiş turlardan çıkar; TL ile oyun parası ayrı tutulur.</span></div>
      <div className="farmHeroStats"><Metric label="Etkin tur" value={String(summary.sessionCount ?? 0)}/><Metric label="Toplam süre" value={durationLabel(Number(summary.durationMinutes ?? 0))}/><Metric label="Toplanan" value={fmt(Number(summary.totalQuantity ?? 0))}/><Metric label="Güven" value={String(summary.confidence ?? "Tek tur")}/></div>
    </section>
    <nav className="farmTabs">{(["Özet","Yeni Tur","Rotalar","Üretim","Karar","Kayıtlar"] as Tab[]).map((item) => <button className={tab === item ? "on" : ""} onClick={() => { setTab(item); setError(""); setSuccess(""); }} key={item}>{item}</button>)}</nav>
    {error && <p className="farmMessage error">{error}</p>}{success && <p className="farmMessage success">{success}</p>}
    {tab === "Özet" && <section className="farmDashboard">
      <div className="farmFilters"><select aria-label="Dönem" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="7">Son 7 gün</option><option value="30">Son 30 gün</option><option value="all">Tüm dönem</option></select><select aria-label="Bölge" value={region} onChange={(event) => setRegion(event.target.value)}><option>Tümü</option>{regionOptions.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Rota" value={route} onChange={(event) => setRoute(event.target.value)}><option>Tümü</option>{routeOptions.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Maden" value={material} onChange={(event) => setMaterial(event.target.value)}><option>Tümü</option>{materialOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
      {loading ? <div className="farmEmpty">Farm kayıtları yükleniyor…</div> : filtered.length === 0 ? <div className="farmEmpty"><i>◇</i><b>İlk ölçümlü turunu kaydet</b><span>Süre, damar ve çıkan maden olmadan verim tahmini yapılmaz.</span><button onClick={() => setTab("Yeni Tur")}>Tur ekle</button></div> : <>
        <div className="farmKpis"><Metric label="Adet / saat" value={decimal(Number(summary.itemsPerHour ?? 0))}/><Metric label="Net oyun parası / saat" value={fmt(Number(summary.gamePerHour ?? 0))}/><Metric label="Net TL / saat" value={money(Number(summary.tlKurusPerHour ?? 0) / 100)}/><Metric label="Toplam damar" value={fmt(Number(summary.nodeCount ?? 0))}/></div>
        <div className="farmPanels"><article><PanelHead eyebrow="ARTIRICI TESTİ" title="Aynı rotada karşılaştır"/><div className="boosterCompare">{route === "Tümü" ? <p className="boosterGuard">Farklı rotaları karıştırmamak için önce üstte tek bir rota seç.</p> : boosters.map((row) => <div key={String(row.boosterProfile)}><span><b>{row.boosterProfile}</b><small>{row.sessionCount} tur · {row.confidence}</small></span><strong>{decimal(Number(row.itemsPerHour))}<small>adet/saat</small></strong><em>{fmt(Number(row.gamePerHour))}<small>oyun parası/saat</small></em></div>)}</div><p className="farmCaution">Artırıcı sonucu ancak aynı rota, benzer süre ve yeterli tur sayısıyla anlamlıdır. Bu tablo nedensellik iddiası değildir.</p></article><article><PanelHead eyebrow="FİYAT DEFTERİ" title="Son birim gözlemleri"/><div className="priceLedger">{prices.length ? prices.map((row, index) => <div key={`${row.material}-${row.currency}-${row.date}-${index}`}><span><b>{row.material}</b><small>{row.date}</small></span><em>{row.currency}</em><strong>{row.currency === "TL" ? money(row.value) : fmt(row.value)}</strong></div>) : <p>Fiyat girilen maden satırı yok.</p>}</div></article></div>
        <SessionCards sessions={filtered.slice(0, 6)} onStatus={setStatus} onReview={submitReview} acting={acting}/>
      </>}
    </section>}
    {tab === "Yeni Tur" && <section className="farmForm"><header><p>ÖLÇÜMLÜ SAHA KAYDI</p><h2>Yeni farm turu</h2><span>Bir turu bir rota ve tek artırıcı profiliyle kaydet. Fiyat bilmiyorsan boş bırak.</span></header><div className="farmFormGrid">
      <FormField label="Sunucu"><input value={form.server} onChange={(e) => setForm({...form,server:e.target.value})}/></FormField><FormField label="Tarih"><input type="date" value={form.observedAt} onChange={(e) => setForm({...form,observedAt:e.target.value})}/></FormField><FormField label="Bölge"><input list="farm-regions" value={form.region} onChange={(e) => setForm({...form,region:e.target.value})}/><datalist id="farm-regions">{regions.map((item)=><option key={item} value={item}/>)}</datalist></FormField><FormField label="Rota adı"><input value={form.routeName} onChange={(e) => setForm({...form,routeName:e.target.value})}/></FormField><FormField label="Meslek"><select value={form.profession} onChange={(e) => setForm({...form,profession:e.target.value})}><option>Madenci</option><option>Sarraf</option><option>Lokman</option></select></FormField><FormField label="Artırıcı"><select value={form.boosterProfile} onChange={(e) => setForm({...form,boosterProfile:e.target.value})}><option>Yok</option><option>Kişisel</option><option>Lonca</option><option>Kişisel + Lonca</option></select></FormField><FormField label="Süre (dakika)"><input type="number" min="1" max="720" value={form.durationMinutes} onChange={(e) => setForm({...form,durationMinutes:e.target.value})}/></FormField><FormField label="Toplanan damar"><input type="number" min="1" value={form.nodeCount} onChange={(e) => setForm({...form,nodeCount:e.target.value})}/></FormField><FormField label="Oyun parası maliyeti"><input type="number" min="0" placeholder="İsteğe bağlı" value={form.gameCost} onChange={(e) => setForm({...form,gameCost:e.target.value})}/></FormField><FormField label="TL maliyeti"><input type="number" min="0" step="0.01" placeholder="İsteğe bağlı" value={form.tlCost} onChange={(e) => setForm({...form,tlCost:e.target.value})}/></FormField></div>
      <div className="yieldEditor"><div><span><small>ÇIKTI SATIRLARI</small><b>Maden, kalite, adet ve gözlenen fiyat</b></span><button onClick={() => setForm((current) => ({...current,yields:[...current.yields,emptyYield()]}))}>+ Satır ekle</button></div>{form.yields.map((row,index)=><article key={index}><FormField label="Maden"><input list="farm-materials" value={row.material} onChange={(e)=>updateYield(index,"material",e.target.value)}/></FormField><FormField label="Kalite"><select value={row.grade} onChange={(e)=>updateYield(index,"grade",e.target.value)}><option>Normal</option><option>Saf</option><option>Nadir</option></select></FormField><FormField label="Adet"><input type="number" min="1" value={row.quantity} onChange={(e)=>updateYield(index,"quantity",e.target.value)}/></FormField><FormField label="Birim oyun parası"><input type="number" min="0" placeholder="Bilinmiyorsa boş" value={row.unitGamePrice} onChange={(e)=>updateYield(index,"unitGamePrice",e.target.value)}/></FormField><FormField label="Birim TL"><input type="number" min="0" step="0.01" placeholder="Bilinmiyorsa boş" value={row.unitTlPrice} onChange={(e)=>updateYield(index,"unitTlPrice",e.target.value)}/></FormField><button aria-label="Satırı kaldır" disabled={form.yields.length === 1} onClick={() => setForm((current)=>({...current,yields:current.yields.filter((_,i)=>i!==index)}))}>×</button></article>)}<datalist id="farm-materials">{materials.map((item)=><option key={item} value={item}/>)}</datalist></div>
      <FormField label="Saha notu"><textarea maxLength={1500} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Yoğunluk, bekleme, rekabet, rota sapması veya gözlem…"/></FormField><div className="farmFormNotice"><b>Hesap ilkesi</b><span>Fiyatı olmayan çıktı adet/saat hesabına girer; parasal değere girmez. TL ile oyun parası asla birbirine dönüştürülmez.</span></div><div className="farmFormActions"><button onClick={() => setTab("Özet")}>Vazgeç</button><button disabled={saving} onClick={() => void submit()}>{saving ? "Kaydediliyor…" : "Turu kaydet"}</button></div>
    </section>}
    {tab === "Rotalar" && <section className="routeWorkspace">
      <div className="routeBuilder"><header><p>ÖZEL ROTA ŞABLONU</p><h2>Ekran görüntüsünü işaretle</h2><span>Başlangıç, damar, bekleme ve tehlike noktalarını görsel üzerinde sırala.</span></header>
        <div className="routeMeta"><FormField label="Sunucu"><input value={routeForm.server} onChange={(e)=>setRouteForm({...routeForm,server:e.target.value})}/></FormField><FormField label="Bölge"><input list="farm-regions" value={routeForm.region} onChange={(e)=>setRouteForm({...routeForm,region:e.target.value})}/></FormField><FormField label="Rota adı"><input value={routeForm.routeName} onChange={(e)=>setRouteForm({...routeForm,routeName:e.target.value})}/></FormField><FormField label="Meslek"><select value={routeForm.profession} onChange={(e)=>setRouteForm({...routeForm,profession:e.target.value})}><option>Madenci</option><option>Sarraf</option><option>Lokman</option></select></FormField><FormField label="Varsayılan artırıcı"><select value={routeForm.defaultBooster} onChange={(e)=>setRouteForm({...routeForm,defaultBooster:e.target.value})}><option>Yok</option><option>Kişisel</option><option>Lonca</option><option>Kişisel + Lonca</option></select></FormField><FormField label="Beklenen süre"><input type="number" min="1" max="720" value={routeForm.expectedMinutes} onChange={(e)=>setRouteForm({...routeForm,expectedMinutes:e.target.value})}/></FormField></div>
        <div className="routeUpload"><label><b>Rota ekran görüntüsü</b><span>JPEG, PNG veya WebP · en fazla 5 MB · herkese açık yayınlanmaz</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e)=>chooseRouteFile(e.target.files?.[0] ?? null)}/></label><div className="pointTools">{["Başlangıç","Damar","Bekleme","Tehlike"].map((tool)=><button key={tool} className={pointTool===tool?"on":""} onClick={()=>setPointTool(tool)}>{tool}</button>)}</div></div>
        {routePreview ? <div className="routeCanvas" onClick={placePoint} role="button" tabIndex={0} aria-label="Haritaya işaret ekle"><img src={routePreview} alt="Yüklenecek rota önizlemesi"/>{routeForm.points.map((point,index)=><i className={`point point-${point.pointType.toLocaleLowerCase("tr-TR")}`} style={{left:`${point.xPermille/10}%`,top:`${point.yPermille/10}%`}} key={`${point.xPermille}-${point.yPermille}-${index}`}>{index+1}</i>)}</div> : <div className="routeCanvas empty"><b>Bir ekran görüntüsü seç</b><span>Görsel tam sığdırılır; sonra dokunarak işaret eklersin.</span></div>}
        <div className="pointList">{routeForm.points.map((point,index)=><article key={index}><b>{index+1}</b><select value={point.pointType} onChange={(e)=>updatePoint(index,"pointType",e.target.value)}><option>Başlangıç</option><option>Damar</option><option>Bekleme</option><option>Tehlike</option></select><input aria-label="İşaret etiketi" value={point.label} onChange={(e)=>updatePoint(index,"label",e.target.value)} placeholder="Etiket"/><input aria-label="Maden ipucu" value={point.materialHint} onChange={(e)=>updatePoint(index,"materialHint",e.target.value)} placeholder="Maden ipucu"/><button aria-label="İşareti kaldır" onClick={()=>setRouteForm((current)=>({...current,points:current.points.filter((_,i)=>i!==index)}))}>×</button></article>)}</div>
        <FormField label="Rota notu"><textarea maxLength={1500} value={routeForm.notes} onChange={(e)=>setRouteForm({...routeForm,notes:e.target.value})} placeholder="Yoğun saat, güvenli bekleme, rakip rota veya saha uyarısı…"/></FormField><div className="farmFormActions"><button onClick={()=>{setRouteForm(freshRoute());chooseRouteFile(null)}}>Temizle</button><button disabled={routeSaving} onClick={()=>void saveRoute()}>{routeSaving?"Kaydediliyor…":`Rotayı kaydet · ${routeForm.points.length} işaret`}</button></div>
      </div>
      <div className="savedRoutes"><header><p>KAYITLI ROTALAR</p><h2>Tek dokunuşla yeni tur</h2></header>{routes.length ? routes.map((routeRow)=><article className={routeRow.status==="archived"?"archived":""} key={routeRow.id}><div className="savedRouteMap"><img src={`/api/admin/farm-routes/map?id=${routeRow.id}`} alt={`${routeRow.routeName} saha haritası`}/>{routeRow.points.map((point,index)=><i className={`point point-${point.pointType.toLocaleLowerCase("tr-TR")}`} style={{left:`${point.xPermille/10}%`,top:`${point.yPermille/10}%`}} title={`${point.label}${point.materialHint?` · ${point.materialHint}`:""}`} key={point.id??index}>{index+1}</i>)}</div><div className="savedRouteBody"><span><small>{routeRow.region} · {routeRow.profession}</small><h3>{routeRow.routeName}</h3></span><div><b>{routeRow.expectedMinutes} dk</b><b>{routeRow.points.filter((point)=>point.pointType==="Damar").length} damar</b><b>{routeRow.defaultBooster}</b></div>{routeRow.notes&&<p>{routeRow.notes}</p>}<footer><button disabled={routeRow.status!=="active"} onClick={()=>startRoute(routeRow)}>Rotayı başlat</button><button disabled={acting===routeRow.id} onClick={()=>void setRouteStatus(routeRow)}>{routeRow.status==="archived"?"Geri yükle":"Arşivle"}</button></footer></div></article>) : <div className="farmEmpty">Henüz rota şablonu yok.</div>}</div>
    </section>}
    {tab === "Üretim" && <ProductionPlanner />}
    {tab === "Karar" && <section className="decisionWorkspace">
      <header className="decisionHead"><div><p>SAHA KARAR MASASI</p><h2>Rotaları eşit ölçekte karşılaştır</h2><span>Sonuç; seçilen dönem, bölge ve maden filtresindeki gerçek tur kayıtlarının süre ağırlıklı ortalamasıdır.</span></div><div className="decisionFilters"><select aria-label="Analiz dönemi" value={period} onChange={(e)=>setPeriod(e.target.value)}><option value="7">Son 7 gün</option><option value="30">Son 30 gün</option><option value="all">Tüm dönem</option></select><select aria-label="Analiz bölgesi" value={region} onChange={(e)=>setRegion(e.target.value)}><option>Tümü</option>{regionOptions.map((item)=><option key={item}>{item}</option>)}</select><select aria-label="Analiz madeni" value={material} onChange={(e)=>setMaterial(e.target.value)}><option>Tümü</option>{materialOptions.map((item)=><option key={item}>{item}</option>)}</select></div></header>
      {loading ? <div className="farmEmpty">Saha verileri hazırlanıyor…</div> : routePerformance.length === 0 ? <div className="farmEmpty"><i>◇</i><b>Karşılaştırılabilir tur yok</b><span>Önce aynı rota için süre ve çıktı içeren en az bir tur kaydet.</span><button onClick={()=>setTab("Yeni Tur")}>Tur ekle</button></div> : <>
        <div className="decisionMetric"><span>Sıralama ölçütü</span><div><button className={analysisMetric==="items"?"on":""} onClick={()=>setAnalysisMetric("items")}>Adet / saat</button><button className={analysisMetric==="game"?"on":""} onClick={()=>setAnalysisMetric("game")}>Oyun parası / saat</button><button className={analysisMetric==="tl"?"on":""} onClick={()=>setAnalysisMetric("tl")}>TL / saat</button></div><small>Para birimleri birbirine çevrilmez; seçtiğin sütun kendi içinde sıralanır.</small></div>
        <div className="decisionGrid"><div className="routeRanking">{routePerformance.map((row,index)=><button className={(selectedPerformance?.key===row.key?"on ":"")+`evidence-${row.evidence.level}`} onClick={()=>setAnalysisRoute(row.key)} key={row.key}><i>{index+1}</i><span><small>{row.region} · {row.lastObservedAt}</small><b>{row.routeName}</b><em>{row.sessionCount} tur · {row.evidence.label}</em></span><strong>{analysisMetric==="game"?fmt(row.gamePerHour):analysisMetric==="tl"?money(row.tlKurusPerHour/100):decimal(row.itemsPerHour)}<small>{analysisMetric==="game"?"oyun/saat":analysisMetric==="tl"?"TL/saat":"adet/saat"}</small></strong></button>)}</div>
          {selectedPerformance && projection && <article className="routeDecision"><header><span><small>SEÇİLİ ROTA</small><h3>{selectedPerformance.routeName}</h3><p>{selectedPerformance.region} · {selectedPerformance.sessionCount} kayıtlı tur</p></span><b className={`evidenceBadge level-${selectedPerformance.evidence.level}`}>{selectedPerformance.evidence.label}</b></header><div className="routeDecisionStats"><span><small>Adet / saat</small><b>{decimal(selectedPerformance.itemsPerHour)}</b></span><span><small>Damar / saat</small><b>{decimal(selectedPerformance.nodesPerHour)}</b></span><span><small>Oyun / saat</small><b>{fmt(selectedPerformance.gamePerHour)}</b></span><span><small>TL / saat</small><b>{money(selectedPerformance.tlKurusPerHour/100)}</b></span></div><div className="coverageBars"><Coverage label="Oyun fiyat kapsamı" value={selectedPerformance.gameCoverage}/><Coverage label="TL fiyat kapsamı" value={selectedPerformance.tlCoverage}/></div>{selectedPerformance.evidence.nextAt ? <p className="decisionCaution">Bu sonuç kesin sıralama değildir. Sonraki güven seviyesi için aynı koşullarda {selectedPerformance.evidence.nextAt-selectedPerformance.sessionCount} tur daha kaydet.</p> : <p className="decisionCaution strong">10+ tur güçlü örneklem sağlar; yine de yoğunluk, rekabet ve artırıcı değişimini ayrıca değerlendir.</p>}<div className="projection"><header><span><small>GÖZLENEN ORTALAMADAN PROJEKSİYON</small><b>{durationLabel(projection.minutes)} farm yaparsan</b></span><label><span>Dakika</span><input type="number" min="1" max="720" value={projectionMinutes} onChange={(e)=>setProjectionMinutes(e.target.value)}/></label></header><div><span><small>Tahmini adet</small><b>{decimal(projection.items)}</b></span><span><small>Tahmini damar</small><b>{decimal(projection.nodes)}</b></span><span><small>Tahmini oyun parası</small><b>{fmt(projection.game)}</b></span><span><small>Tahmini TL</small><b>{money(projection.tlKurus/100)}</b></span></div><p>Bu bir garanti değil; yalnız seçilen rotanın kayıtlı saatlik ortalamasının süreye uygulanmış hâlidir.</p></div>{selectedTemplate&&<button className="decisionStart" onClick={()=>startRoute(selectedTemplate)}>Bu rotayla yeni tur başlat</button>}</article>}
        </div>
        <section className="marketEvidence"><header><div><p>FİYAT KANIT TABLOSU</p><h3>Son gözlem ve medyan</h3></div><span>{materialPrices.length} maden · oyun parası ve TL ayrı</span></header><div>{materialPrices.map((row)=><article key={row.material}><b>{row.material}</b><PriceCell label="Oyun parası" stats={row.game} currency="game"/><PriceCell label="Reel değer" stats={row.tlKurus} currency="tl"/></article>)}</div><p>Medyan uç fiyatların etkisini azaltır. Gözlem sayısı azsa sonuç piyasa fiyatı değil, yalnız kayıtlı örnek olarak okunmalıdır.</p></section>
      </>}
    </section>}
    {tab === "Kayıtlar" && <section className="farmRecords"><header><div><p>SAHA ARŞİVİ</p><h2>Tüm turlar</h2></div><span>{active.length} etkin · {sessions.length-active.length} arşiv</span></header>{sessions.length ? <SessionCards sessions={sessions} onStatus={setStatus} onReview={submitReview} acting={acting}/> : <div className="farmEmpty">Henüz kayıt yok.</div>}</section>}
  </main>;
}

function Metric({label,value}:{label:string;value:string}){return <article><small>{label}</small><strong>{value}</strong></article>}
function PanelHead({eyebrow,title}:{eyebrow:string;title:string}){return <header className="farmPanelHead"><span>{eyebrow}</span><h3>{title}</h3></header>}
function FormField({label,children}:{label:string;children:React.ReactNode}){return <label className="farmField"><span>{label}</span>{children}</label>}
function Coverage({label,value}:{label:string;value:number}){const safe=Math.max(0,Math.min(1,value||0));return <div><span><b>{label}</b><em>%{Math.round(safe*100)}</em></span><i><b style={{width:`${safe*100}%`}}/></i></div>}
type PriceStats={count:number;latest:number;latestAt:string;median:number;min:number;max:number};
function PriceCell({label,stats,currency}:{label:string;stats:PriceStats|null;currency:"game"|"tl"}){const price=(value:number)=>currency==="tl"?money(value/100):fmt(value);return <span className="priceCell"><small>{label}</small>{stats?<><b>{price(stats.latest)}</b><em>{stats.latestAt} · {stats.count} gözlem</em><i>Medyan {price(stats.median)} · {price(stats.min)}–{price(stats.max)}</i></>:<><b>Veri yok</b><em>Fiyat girilmemiş</em></>}</span>}
function SessionCards({sessions,onStatus,onReview,acting}:{sessions:FarmSession[];onStatus:(session:FarmSession)=>Promise<void>;onReview:(session:FarmSession)=>Promise<void>;acting:string}){return <div className="sessionCards">{sessions.map((session)=>{const metrics = calculateFarmSession(session) as Record<string,number>;return <article className={session.status === "archived" ? "archived" : ""} key={session.id}><header><span><small>{session.observedAt} · {session.profession}</small><h4>{session.routeName}</h4><p>{session.region} · {session.server}</p></span><b>{session.boosterProfile}</b></header><div className="sessionNumbers"><span><small>Süre</small><b>{session.durationMinutes} dk</b></span><span><small>Damar</small><b>{session.nodeCount}</b></span><span><small>Adet/saat</small><b>{decimal(metrics.itemsPerHour)}</b></span><span><small>Oyun/saat</small><b>{fmt(metrics.gamePerHour)}</b></span></div><div className="sessionYields">{session.yields.map((row)=><span key={row.id}><b>{row.material}</b><small>{row.grade} · {row.quantity} adet</small></span>)}</div>{session.notes && <p>{session.notes}</p>}<footer><small>{session.submittedContributionId?"Doğrulama kuyruğunda":`Fiyat kapsamı: oyun %${Math.round(metrics.gameCoverage*100)} · TL %${Math.round(metrics.tlCoverage*100)}`}</small><span>{session.status==="active"&&!session.submittedContributionId&&<button disabled={acting===session.id} onClick={()=>void onReview(session)}>Doğrulamaya gönder</button>}<button disabled={acting===session.id} onClick={()=>void onStatus(session)}>{session.status === "archived" ? "Geri yükle" : "Arşivle"}</button></span></footer></article>})}</div>}
const fmt=(value:number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(Number.isFinite(value)?value:0);
const decimal=(value:number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:1}).format(Number.isFinite(value)?value:0);
const money=(value:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:2}).format(Number.isFinite(value)?value:0);
const durationLabel=(minutes:number)=>minutes>=60?`${Math.floor(minutes/60)} sa ${minutes%60} dk`:`${minutes} dk`;
