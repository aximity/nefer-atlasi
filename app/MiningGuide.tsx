"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildRespawnEstimate,
  formatTimerDuration,
  timerState,
} from "../lib/mining-timer.mjs";
import { items, recipes, statusLabel, type Recipe } from "../lib/catalog";
import {
  gatheringRegionFor,
  gatheringRows,
  type GatheringProfession,
} from "../lib/gathering-catalog";
import { creatureDropSources } from "../lib/material-sources";
import { potionIngredientIndex } from "../lib/potion-index";
import MarketBoard from "./MarketBoard";

type View = "Sayaçlar" | "Pazar" | "Kaynaklar" | "Gözlemler" | "Artırıcılar";
type Profession = GatheringProfession;
type Timer = { id: string; region: string; material: string; startedAt: number; nextCheckAt: number; reminderMinutes: number };
type Observation = { id: string; region: string; material: string; result: "found" | "empty"; elapsedMinutes: number; observedAt: number };
type MaterialUse = {
  itemId: string;
  itemName: string;
  itemClass: string;
  slot: string;
  quantity: number;
  recipe: Recipe;
};
type SelectedMaterial = {
  name: string;
  profession: Profession;
  base: string;
  output: number;
  points: number;
  region: string;
  uses: MaterialUse[];
};

const STORAGE_KEY = "nefer-atlasi:mining-timers:v1";
const regionSuggestions = ["Eminönü", "Antrepo", "Labirent", "Meteor Bölgesi", "Sivri Ada", "Yeraltı", "Büyük Hol", "Topkapı Sarayı"];

const aboveCapRows = [
  { profession: "Madenci", chain: "Euksenit → Skandiyum → Yttrium", points: 50 },
  { profession: "Madenci", chain: "Lantan → Turyum → Erbium", points: 55 },
  { profession: "Sarraf", chain: "Fluorit → Mavi John → Taaffeite", points: 50 },
  { profession: "Sarraf", chain: "Bor → Ludwigite → Painite", points: 55 },
  { profession: "Lokman", chain: "Papatya → Anthemis → Sevgi Çiçeği", points: 50 },
  { profession: "Lokman", chain: "Kardelen → Narin Kardelen → İstanbul Kardeleni", points: 55 },
];

const itemById = new Map(items.map((item) => [item.id, item]));

const normalize = (value: string) => value.trim().toLocaleLowerCase("tr-TR");

function usesForMaterial(materialName: string): MaterialUse[] {
  const wanted = normalize(materialName);
  return recipes.flatMap((recipe) => {
    const material = recipe.materials.find((entry) => normalize(entry.name) === wanted);
    const item = itemById.get(recipe.itemId);
    if (!material || !item || item.rarity !== "Şaheser") return [];
    return [{
      itemId: item.id,
      itemName: item.name,
      itemClass: item.class,
      slot: item.slot,
      quantity: material.quantity,
      recipe,
    }];
  }).sort((a, b) => a.itemClass.localeCompare(b.itemClass, "tr") || a.itemName.localeCompare(b.itemName, "tr"));
}

const gatheringOutputs = gatheringRows.flatMap((row) =>
  [row.base, row.second, row.third].filter(Boolean).map((name, index) => ({
    name: String(name),
    output: index + 1,
    row,
    uses: usesForMaterial(String(name)),
  })),
);
const linkedOutputCount = gatheringOutputs.filter((entry) => entry.uses.length > 0).length;
const linkedMasterpieceCount = new Set(gatheringOutputs.flatMap((entry) => entry.uses.map((usage) => usage.itemId))).size;

const sources = {
  officialRegions: "https://www.istanbuloyun.com/Regions.aspx",
  officialJobs: "https://www.istanbuloyun.com/Jobs.aspx",
  professions: "https://istanbulkiyametvakti.fandom.com/tr/wiki/Toplay%C4%B1c%C4%B1l%C4%B1k",
  historicalRegions: "https://ikvblog.wordpress.com/2010/09/20/ikvnin-tum-madenleri-ve-saflari/",
  potionRecipes: "https://istanbulkiyametvakti.fandom.com/tr/wiki/%C4%B0ksir_Re%C3%A7eteleri",
  recipes: "https://istanbulkiyametvakti.fandom.com/tr/wiki/B%C3%BCy%C3%BCc%C3%BC_-_T%C4%B1ls%C4%B1m_Re%C3%A7eteleri",
  personalBooster: "https://www.istanbuloyun.com/News.aspx?NewsId=525",
  guildBooster: "https://istanbuloyun.com/News.aspx?NewsId=567",
};

export default function MiningGuide() {
  const [view, setView] = useState<View>("Sayaçlar");
  const [query, setQuery] = useState("");
  const [profession, setProfession] = useState<Profession>("Madenci");
  const [collectionRegion, setCollectionRegion] = useState("Tümü");
  const [timers, setTimers] = useState<Timer[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [now, setNow] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [timerDraft, setTimerDraft] = useState({ region: "", material: "", reminderMinutes: "10" });
  const [timerError, setTimerError] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterial | null>(null);
  const collectionShown = useMemo(() => gatheringRows.filter((item) => {
    const region = gatheringRegionFor(item);
    const names = [item.base, item.second, item.third].filter(Boolean) as string[];
    const connectedItems = names.flatMap((name) => usesForMaterial(name).map((usage) => usage.itemName));
    return item.profession === profession
      && (collectionRegion === "Tümü" || region === collectionRegion)
      && [...names, ...connectedItems].join(" ").toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"));
  }), [collectionRegion, profession, query]);
  const estimates = useMemo(() => {
    const grouped = new Map<string, Observation[]>();
    observations.forEach((row) => {
      const key = `${row.region}|||${row.material}`;
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    });
    return [...grouped.entries()].map(([key, rows]) => {
      const [region, material] = key.split("|||");
      return { region, material, ...buildRespawnEstimate(rows) };
    });
  }, [observations]);

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      setNow(Date.now());
      const requestedMaterial = new URLSearchParams(window.location.search).get("material");
      const requestedView = new URLSearchParams(window.location.search).get("view");
      if (requestedMaterial) {
        setQuery(requestedMaterial);
        setView("Kaynaklar");
        const matched = gatheringOutputs.find((entry) => normalize(entry.name) === normalize(requestedMaterial));
        if (matched) setProfession(matched.row.profession);
      }
      if (["Sayaçlar", "Pazar", "Kaynaklar", "Gözlemler", "Artırıcılar"].includes(requestedView || "")) setView(requestedView as View);
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as { timers?: Timer[]; observations?: Observation[] } | null;
        if (stored) {
          setTimers(Array.isArray(stored.timers) ? stored.timers : []);
          setObservations(Array.isArray(stored.observations) ? stored.observations : []);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setHydrated(true);
    }, 0);
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialize);
      window.clearInterval(ticker);
    };
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify({ timers, observations }));
  }, [hydrated, observations, timers]);

  useEffect(() => {
    if (!selectedMaterial) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setSelectedMaterial(null);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedMaterial]);

  function startTimer() {
    const reminderMinutes = Number(timerDraft.reminderMinutes);
    if (!timerDraft.region.trim() || !timerDraft.material.trim()) {
      setTimerError("Bölge ve maden adını yaz.");
      return;
    }
    if (!Number.isFinite(reminderMinutes) || reminderMinutes < 1 || reminderMinutes > 180) {
      setTimerError("Kontrol hatırlatıcısı 1–180 dakika arasında olmalı.");
      return;
    }
    const startedAt = now || new Date().getTime();
    setTimers((rows) => [{ id: crypto.randomUUID(), region: timerDraft.region.trim(), material: timerDraft.material.trim(), startedAt, nextCheckAt: startedAt + reminderMinutes * 60_000, reminderMinutes }, ...rows]);
    setTimerDraft((draft) => ({ ...draft, material: "" }));
    setTimerError("");
  }

  function recordCheck(timer: Timer, result: "found" | "empty") {
    const checkedAt = now || new Date().getTime();
    const elapsedMinutes = Math.max(1, Math.round((checkedAt - timer.startedAt) / 60_000));
    setObservations((rows) => [{ id: crypto.randomUUID(), region: timer.region, material: timer.material, result, elapsedMinutes, observedAt: checkedAt }, ...rows].slice(0, 250));
    setTimers((rows) => rows.map((row) => row.id === timer.id ? result === "found"
      ? { ...row, startedAt: checkedAt, nextCheckAt: checkedAt + row.reminderMinutes * 60_000 }
      : { ...row, nextCheckAt: checkedAt + row.reminderMinutes * 60_000 }
      : row));
  }

  function recipeUsage(row: (typeof gatheringRows)[number]) {
    const names = [row.base, row.second, row.third].filter(Boolean) as string[];
    const equipmentRows = names.flatMap((name) => usesForMaterial(name));
    return {
      equipment: [...new Map(equipmentRows.map((item) => [item.itemId, item])).values()],
      potions: potionIngredientIndex[row.base] ?? [],
    };
  }

  function openMaterial(row: (typeof gatheringRows)[number], name: string, output: number) {
    setSelectedMaterial({
      name,
      profession: row.profession,
      base: row.base,
      output,
      points: row.points,
      region: gatheringRegionFor(row),
      uses: usesForMaterial(name),
    });
  }

  return <section className="mining" id="mining">
    <div className="mining-hero">
      <div className="mining-kicker"><span>YENİ MODÜL</span> KAYNAK &amp; PAZAR TAKİBİ</div>
      <div className="mining-title">
        <div><h2>Çıkış rastgele.<br/><em>Süren ölçülebilir.</em></h2><p>Sabit nokta vaadi vermeden kontrol zamanını takip et, boş ve başarılı kontrolleri kaydet, yeniden çıkış aralığını gerçek gözlemlerle öğren.</p><a className="farm-ops-link" href="/uretim#production-planner">Üretim takibini aç <span>↗</span></a></div>
        <div className="ore-orbit" aria-hidden="true"><span/><i>Jd</i><small>JADEİT</small></div>
      </div>
      <button className="marketPulseOpen" type="button" onClick={() => setView("Pazar")}><span><small>PAZAR VERİSİ</small><strong>Tarihli gözlemleri aç</strong></span><i>Fiyat, para birimi ve güven düzeyi birlikte gösterilir →</i></button>
    </div>

    <div className="mining-shell">
      <div className="mining-tabs" role="tablist">{(["Sayaçlar","Pazar","Kaynaklar","Gözlemler","Artırıcılar"] as View[]).map(x=><button key={x} className={view===x?"active":""} onClick={()=>{setView(x);setQuery("");}}>{x === "Kaynaklar" ? "Üretim Ağı" : x}</button>)}</div>

      {view === "Sayaçlar" && <div className="mining-panel timer-panel">
        <div className="mining-panel-head"><div><span>CİHAZINDA ÇALIŞIR</span><h3>Maden kontrol sayaçları</h3></div><b className="privacy-pill">Konum paylaşılmaz</b></div>
        <p className="schematic-note">Bu sayaç yeniden doğmayı garanti etmez. Seçtiğin aralık yalnızca tekrar kontrol etme hatırlatıcısıdır; tahminler başarılı gözlem biriktikçe oluşur.</p>
        <div className="timer-compose">
          <label><span>Bölge</span><input list="mining-regions" value={timerDraft.region} onChange={(event)=>setTimerDraft({...timerDraft,region:event.target.value})} placeholder="Örn. Büyük Hol"/><datalist id="mining-regions">{regionSuggestions.map(region=><option value={region} key={region}/>)}</datalist></label>
          <label><span>Maden</span><input value={timerDraft.material} onChange={(event)=>setTimerDraft({...timerDraft,material:event.target.value})} placeholder="Örn. Jadeit"/></label>
          <label><span>Tekrar kontrol</span><div className="minute-input"><input type="number" min="1" max="180" value={timerDraft.reminderMinutes} onChange={(event)=>setTimerDraft({...timerDraft,reminderMinutes:event.target.value})}/><i>dk</i></div></label>
          <button onClick={startTimer}>Toplandı · sayacı başlat</button>
        </div>
        {timerError && <p className="timer-error">{timerError}</p>}
        {!hydrated ? <div className="timer-empty">Sayaçlar hazırlanıyor…</div> : timers.length === 0 ? <div className="timer-empty"><i>◷</i><b>Henüz etkin sayaç yok</b><span>Bir maden topladığında bölgeyi, maden adını ve kontrol aralığını gir.</span></div> : <div className="timer-grid">{timers.map(timer=>{
          const status = timerState(timer.nextCheckAt, now);
          const estimate = estimates.find(row=>row.region===timer.region&&row.material===timer.material);
          return <article className={`timer-card ${status}`} key={timer.id}>
            <header><span><small>{timer.region}</small><h4>{timer.material}</h4></span><button aria-label={`${timer.material} sayacını kaldır`} onClick={()=>setTimers(rows=>rows.filter(row=>row.id!==timer.id))}>×</button></header>
            <div className="timer-clock"><small>{status==="due"?"KONTROL ZAMANI":status==="soon"?"HAZIRLAN":"SONRAKİ KONTROL"}</small><strong>{status==="due"?"Şimdi":formatTimerDuration(timer.nextCheckAt-now)}</strong></div>
            <div className="timer-meta"><span><small>Döngü</small><b>{timer.reminderMinutes} dk</b></span><span><small>Başlangıç</small><b>{new Date(timer.startedAt).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</b></span><span><small>Veri</small><b>{estimate?.confidence??"Veri yok"}</b></span></div>
            {estimate?.lowerMinutes!=null&&estimate.upperMinutes!=null?<p className="estimate-window"><b>{estimate.lowerMinutes}–{estimate.upperMinutes} dk</b><span>gözlenen yeniden çıkış aralığı · {estimate.sampleCount} başarılı ölçüm</span></p>:<p className="estimate-window pending"><b>Aralık oluşmadı</b><span>En az iki başarılı ölçüm gerekli.</span></p>}
            <footer><button onClick={()=>recordCheck(timer,"empty")}>Hâlâ yok · tekrar hatırlat</button><button className="found" onClick={()=>recordCheck(timer,"found")}>Çıktı ve toplandı</button></footer>
          </article>})}</div>}
        <div className="timer-principles"><article><b>01</b><span><strong>Kesin süre yok</strong><small>Tek ölçümden kural üretilmez.</small></span></article><article><b>02</b><span><strong>Nokta paylaşılmaz</strong><small>Tekel oluşturacak canlı konum tutulmaz.</small></span></article><article><b>03</b><span><strong>Cihazda saklanır</strong><small>Kişisel sayaçların tarayıcında kalır.</small></span></article></div>
      </div>}

      {view === "Pazar" && <MarketBoard query={query} setQuery={setQuery}/>}

      {view === "Kaynaklar" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>MADEN ↔ ŞAHESER BAĞLANTILARI</span><h3>Üretim Ağı</h3></div><a href={sources.professions} target="_blank" rel="noreferrer">Ad tablosu ↗</a></div>
        <div className="production-summary" aria-label="Üretim ağı özeti">
          <article><small>TOPLAYICILIK ÇIKTISI</small><strong>{gatheringOutputs.length}</strong><span>1., 2. ve 3. çıktılar</span></article>
          <article><small>REÇETEYE BAĞLI</small><strong>{linkedOutputCount}</strong><span>şaheser kullanım kaydı olan</span></article>
          <article><small>BAĞLI ŞAHESER</small><strong>{linkedMasterpieceCount}</strong><span>maden tarafında erişilebilir</span></article>
        </div>
        <div className="collection-tools">
          <div>{(["Madenci","Sarraf","Lokman"] as Profession[]).map(x=><button key={x} className={profession===x?"active":""} onClick={()=>{setProfession(x);setCollectionRegion("Tümü");}}>{x}</button>)}</div>
          <select aria-label="Bölge filtresi" value={collectionRegion} onChange={(event)=>setCollectionRegion(event.target.value)}><option>Tümü</option><option>Eminönü</option><option>Meteor Bölgesi</option><option>Yeraltı</option><option>Büyük Hol</option><option>Bölge kaydı eksik</option></select>
          <label><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Kaynak veya çıktı ara"/></label>
        </div>
        <p className="schematic-note">Bir çıktıya dokunarak hangi şaheserlerde kullanıldığını, reçetede gereken miktarı ve eşyanın sınıfını gör. Şaheser adıyla aradığında onu üreten maden zincirleri de bulunur. KÖ bölge dağılımında Monazit, Yeşim Taşı ve Çiğdem Büyük Hol altında birlikte gösterilir.</p>
        <div className="hol-specials creature-loot"><span>YARATIK GANİMETLERİ · MADEN DEĞİL</span>{creatureDropSources.map((item)=><article key={item.name}><b>{item.name}</b><small>{item.region} · {item.enemy} · {item.usage}</small><em>{item.verification}</em>{item.source&&<a href={item.source} target="_blank" rel="noreferrer">Kaynak ↗</a>}<a href={`/?module=atlas&node=${encodeURIComponent(`material:${item.name.toLocaleLowerCase("tr-TR")}`)}#atlas`}>Atlas ↗</a></article>)}</div>
        <div className="catalog-sources"><a href={sources.officialJobs} target="_blank" rel="noreferrer">Resmî meslek tanımları ↗</a><a href={sources.historicalRegions} target="_blank" rel="noreferrer">Bölge ve çıktı rehberi ↗</a><a href={sources.potionRecipes} target="_blank" rel="noreferrer">İksir reçeteleri ↗</a></div>
        <div className="collection-list">{collectionShown.map(item=>{
          const usage = recipeUsage(item);
          const region = gatheringRegionFor(item);
          return <article key={`${item.profession}-${item.base}`}>
            <div><small>{item.profession}</small><h4>{item.base}</h4></div>
            <div className="output-chain">{[item.base,item.second,item.third].filter(Boolean).map((name,index)=>{
              const materialName = String(name);
              const uses = usesForMaterial(materialName);
              return <span className="output-node-wrap" key={materialName}>{index>0&&<i>→</i>}<button className={`output-node ${uses.length>0?"linked":"unlinked"}`} onClick={()=>openMaterial(item,materialName,index+1)} aria-label={`${materialName} üretim bağlantılarını aç`}><small>{index+1}. ÇIKTI</small><b>{materialName}</b><em>{uses.length>0?`${uses.length} şaheser`:"Kayıt bekliyor"}</em>{uses.length>0&&<span className="output-hover" role="tooltip">{uses.slice(0,3).map((usage)=><span key={usage.itemId}>{usage.itemName} · ×{usage.quantity}</span>)}{uses.length>3&&<span>+{uses.length-3} şaheser daha</span>}</span>}</button></span>;
            })}</div>
            <div className="point-pill"><b>{item.points}</b><small>puan</small></div>
            <div className="collection-region"><span>BÖLGE</span><b>{region}</b><small>{region === "Bölge kaydı eksik" ? "Bölge kaydı bulunamadı" : "KÖ bölge dağılımı"}</small></div>
            <div className="recipe-usage"><span>REÇETE KULLANIMI</span>{usage.equipment.length>0&&<p><b>Şaheser:</b> {usage.equipment.slice(0,4).map((equipment,index)=><span key={equipment.itemId}>{index>0&&" · "}<a href={`/?module=items&item=${equipment.itemId}#items`}>{equipment.itemName}</a></span>)}{usage.equipment.length>4?` · +${usage.equipment.length-4} kayıt`:""}</p>}{usage.potions.length>0&&<p><b>İksir örnekleri:</b> {usage.potions.join(" · ")}</p>}{usage.equipment.length===0&&usage.potions.length===0&&<p>Taranan reçete kataloğunda kullanım kaydı bulunamadı; katkı bekleniyor.</p>}</div>
            <div className="atlas-output-links">{[item.base,item.second,item.third].filter(Boolean).map((name)=><a key={name} href={`/?module=atlas&node=${encodeURIComponent(`material:${String(name).toLocaleLowerCase("tr-TR")}`)}#atlas`}>{name} bağlantıları ↗</a>)}</div>
          </article>;
        })}</div>
        <div className="cap-warning"><div><small>49 ÜSTÜ REFERANS</small><h4>Aktif KÖ farm listesine alınmadı</h4></div><ul>{aboveCapRows.filter(x=>x.profession===profession).map(x=><li key={x.chain}><span>{x.chain}</span><b>{x.points} puan</b></li>)}</ul></div>
        <p className="source-typo-note">Kaynak tablosundaki “Açık Pempe Ametist” yazımı aynen korunmuştur; oyun içi ekran görüntüsüyle doğru yazım teyit edilene kadar düzeltilmiş gibi gösterilmez.</p>
      </div>}

      {view === "Gözlemler" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>YEREL SÜRE DEFTERİ</span><h3>Yeniden çıkış gözlemleri</h3></div>{observations.length>0&&<button className="clear-observations" onClick={()=>setObservations([])}>Geçmişi temizle</button>}</div>
        <p className="schematic-note">Boş kontroller tahmin aralığına eklenmez; yalnız madenin henüz çıkmadığını gösterir. Başarılı ölçümler de garanti değil, gözlenen aralıktır.</p>
        {observations.length===0?<div className="timer-empty"><i>◇</i><b>Henüz süre gözlemi yok</b><span>Sayaç zamanı geldiğinde “Hâlâ yok” veya “Çıktı ve toplandı” seç.</span></div>:<>
          <div className="estimate-grid">{estimates.map(row=><article key={`${row.region}-${row.material}`}><small>{row.region}</small><h4>{row.material}</h4><strong>{row.lowerMinutes!=null&&row.upperMinutes!=null?`${row.lowerMinutes}–${row.upperMinutes} dk`:row.medianMinutes!=null?`${row.medianMinutes} dk tek ölçüm`:"Başarılı ölçüm yok"}</strong><span>{row.confidence} · {row.sampleCount} başarılı ölçüm</span></article>)}</div>
          <div className="observation-list">{observations.slice(0,20).map(row=><article key={row.id}><i className={row.result}/><span><b>{row.material}</b><small>{row.region}</small></span><strong>{row.elapsedMinutes} dk</strong><em>{row.result==="found"?"Çıktı":"Boştu"}</em><time>{new Date(row.observedAt).toLocaleString("tr-TR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</time></article>)}</div>
        </>}
        <div className="field-log"><div><small>SAHA ŞABLONU</small><h4>Dört veriyi ayır</h4></div><ol><li><b>Bölge</b><span>Yalnız geniş bölge adı</span></li><li><b>Süre</b><span>Toplama ile yeniden çıkış arası</span></li><li><b>Sonuç</b><span>Boş kontrol / başarılı toplama</span></li><li><b>Koşul</b><span>Artırıcı ve yoğunluk notu</span></li></ol></div>
      </div>}

      {view === "Artırıcılar" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>VERİM ÇARPANLARI</span><h3>Artırıcı rehberi</h3></div><a href={sources.personalBooster} target="_blank" rel="noreferrer">Resmî kaynak ↗</a></div>
        <div className="booster-stack">
          <article><div className="booster-icon">60</div><div><small>KİŞİSEL · ÖZGÜN OYUN DUYURUSU</small><h4>Maden Şans Artırıcı %60</h4><p>Özgün oyunun resmî duyurusunda ürün %60 olarak listeleniyor. İki torba, saf/nadir çekim ve KÖ sunucusundaki tam formül henüz kaynakla doğrulanmadı.</p></div><span className="stack-badge">KÖ TESTİ BEKLİYOR</span></article>
          <article><div className="booster-icon guild">60</div><div><small>LONCA · ÖZGÜN OYUN DUYURUSU</small><h4>Lonca Madenci Şans Artırıcı %60</h4><p>Özgün oyunun resmî duyurusunda ürün %60 olarak listeleniyor. Kişisel artırıcıyla KÖ sunucusunda nasıl birleştiği saha testi yapılmadan kesin kabul edilmeyecek.</p></div><span className="stack-badge">KÖ TESTİ BEKLİYOR</span></article>
          <article className="booster-result"><div className="booster-icon result">+</div><div><small>FARM PLANI</small><h4>Önce test turu, sonra uzun farm</h4><p>Artırıcısız ve artırıcılı eşit sayıda tur kaydet. Torba, saf ve nadir sonuçlarını ayrı say; kârlılığı yalnız satış fiyatıyla değil saat başına çıktıyla ölç.</p></div></article>
        </div>
        <div className="source-strip"><span>Kaynak durumu</span><a href={sources.personalBooster} target="_blank" rel="noreferrer">Kişisel %60 duyurusu</a><a href={sources.guildBooster} target="_blank" rel="noreferrer">Lonca %60 duyurusu</a><a href={sources.officialJobs} target="_blank" rel="noreferrer">Resmî meslekler</a><a href={sources.historicalRegions} target="_blank" rel="noreferrer">Tarihî bölge rehberi</a><a href={sources.professions} target="_blank" rel="noreferrer">Toplayıcılık tablosu</a><a href={sources.potionRecipes} target="_blank" rel="noreferrer">İksir reçeteleri</a><a href={sources.recipes} target="_blank" rel="noreferrer">Tılsım reçeteleri</a></div>
      </div>}
    </div>
    {selectedMaterial&&<div className="production-backdrop" onMouseDown={(event)=>event.target===event.currentTarget&&setSelectedMaterial(null)}>
      <aside className="production-sheet" role="dialog" aria-modal="true" aria-labelledby="production-sheet-title">
        <button className="production-close" aria-label="Üretim bağlantılarını kapat" onClick={()=>setSelectedMaterial(null)}>×</button>
        <div className="production-gem" aria-hidden="true">{selectedMaterial.name.slice(0,2)}</div>
        <small className="production-kicker">{selectedMaterial.profession} · {selectedMaterial.output}. ÇIKTI</small>
        <h3 id="production-sheet-title">{selectedMaterial.name}</h3>
        <p className="production-origin"><b>{selectedMaterial.region}</b><span>{selectedMaterial.base} kaynağı · {selectedMaterial.points} meslek puanı</span></p>
        <div className="production-metrics"><span><small>ŞAHESER</small><b>{selectedMaterial.uses.length}</b></span><span><small>TOPLAM GEREKSİNİM</small><b>{selectedMaterial.uses.reduce((sum,usage)=>sum+usage.quantity,0)}</b></span></div>
        <div className="production-use-list">
          <header><span>KULLANILDIĞI ŞAHESERLER</span><small>Mevcut reçete kataloğu</small></header>
          {selectedMaterial.uses.length===0?<div className="production-empty"><b>Bağlantı kaydı bulunamadı</b><span>Bu, malzemenin hiçbir yerde kullanılmadığı anlamına gelmez; doğrulanmış reçete katkısı bekleniyor.</span></div>:selectedMaterial.uses.map((usage)=><a key={usage.itemId} href={`/?module=items&item=${usage.itemId}#items`}><span><small>{usage.itemClass} · {usage.slot}</small><strong>{usage.itemName}</strong><em>{statusLabel[usage.recipe.verificationStatus]}</em></span><b>×{usage.quantity}</b></a>)}
        </div>
        <div className="production-sheet-actions"><a href={`/?module=atlas&node=${encodeURIComponent(`material:${selectedMaterial.name.toLocaleLowerCase("tr-TR")}`)}#atlas`}>Bağlantılı Atlası aç ↗</a><a href={`/?module=mining&view=Kaynaklar&material=${encodeURIComponent(selectedMaterial.name)}#mining`}>Bu madeni filtrele</a></div>
        <p className="production-caveat">Miktarlar mevcut kaynaklı reçete kataloğundan gelir. Kıyametin Öncüleri sunucusunda değişen reçeteler canlı oyun görüntüsüyle ayrıca doğrulanır.</p>
      </aside>
    </div>}
  </section>;
}
