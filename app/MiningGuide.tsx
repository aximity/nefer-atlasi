"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildRespawnEstimate,
  formatTimerDuration,
  timerState,
} from "../lib/mining-timer.mjs";
import { items, recipes } from "../lib/catalog";

type View = "Sayaçlar" | "Pazar" | "Kaynaklar" | "Gözlemler" | "Artırıcılar";
type Profession = "Madenci" | "Sarraf" | "Lokman";
type Timer = { id: string; region: string; material: string; startedAt: number; nextCheckAt: number; reminderMinutes: number };
type Observation = { id: string; region: string; material: string; result: "found" | "empty"; elapsedMinutes: number; observedAt: number };

const STORAGE_KEY = "nefer-atlasi:mining-timers:v1";
const regionSuggestions = ["Eminönü", "Antrepo", "Labirent", "Meteor Bölgesi", "Sivri Ada", "Yeraltı", "Büyük Hol", "Topkapı Sarayı"];

const materials = [
  { name: "Xenotim", kind: "Reçete malzemesi", demand: "Birden çok sınıfın tılsım reçetesinde geçiyor", game: "Veri bekleniyor", real: "150–200 TL", trend: "↓", status: "Büyük Hol · Lojman / oyuncu saha bilgisi", tone: "violet" },
  { name: "Kondrit", kind: "Reçete malzemesi", demand: "II–III kademe tılsım reçetelerinde geçiyor", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "Toplayıcı türü ve bölgesi teyit bekliyor", tone: "amber" },
  { name: "Gadolinyum", kind: "Madenci çıktısı", demand: "Monazit kaynağının ikinci çıktısı", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "45 toplama puanı · kaynaklı", tone: "cyan" },
  { name: "Jadeit", kind: "Sarraf çıktısı", demand: "Yeşim Taşı kaynağının ikinci çıktısı", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "Büyük Hol · Lojman / oyuncu saha bilgisi", tone: "green" },
  { name: "Saf Altın", kind: "Madenci çıktısı", demand: "Altın kaynağının ikinci çıktısı", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "23 toplama puanı · kaynaklı", tone: "gold" },
];

const collectionRows: { profession: Profession; base: string; second?: string; third?: string; points: number }[] = [
  { profession: "Madenci", base: "Bakır", second: "Saf Bakır", points: 1 },
  { profession: "Madenci", base: "Kalay", second: "Saf Kalay", points: 3 },
  { profession: "Madenci", base: "Kurşun", second: "Saf Kurşun", points: 5 },
  { profession: "Madenci", base: "Demir", second: "Saf Demir", points: 7 },
  { profession: "Madenci", base: "Nikel", second: "Saf Nikel", points: 10 },
  { profession: "Madenci", base: "Krom", second: "Saf Krom", points: 18 },
  { profession: "Madenci", base: "Gümüş", second: "Saf Gümüş", points: 20 },
  { profession: "Madenci", base: "Altın", second: "Saf Altın", points: 23 },
  { profession: "Madenci", base: "Tungsten", second: "Saf Tungsten", third: "Şelit", points: 30 },
  { profession: "Madenci", base: "Platin", second: "Saf Platin", points: 36 },
  { profession: "Madenci", base: "Titanyum", second: "Saf Titanyum", points: 40 },
  { profession: "Madenci", base: "Osmiridyum", second: "Osmiyum", third: "İridyum", points: 45 },
  { profession: "Madenci", base: "Monazit", second: "Gadolinyum", points: 45 },
  { profession: "Sarraf", base: "Kuvars", points: 1 },
  { profession: "Sarraf", base: "Obsidyen", points: 1 },
  { profession: "Sarraf", base: "Kan Taşı", points: 5 },
  { profession: "Sarraf", base: "Açık Mavi Lapis", second: "Koyu Mavi Lapis", points: 8 },
  { profession: "Sarraf", base: "Turkuaz", points: 10 },
  { profession: "Sarraf", base: "Ametist", second: "Açık Pempe Ametist", third: "Sibiryalı", points: 15 },
  { profession: "Sarraf", base: "Kalsedon", second: "Kripraz", third: "Akik", points: 21 },
  { profession: "Sarraf", base: "Elmas", second: "Yeşil Elmas", third: "Menekşe Elmas", points: 23 },
  { profession: "Sarraf", base: "Mavi Safir", second: "Turuncu Safir", points: 33 },
  { profession: "Sarraf", base: "Beril", second: "Yeşil Zümrüt", third: "Kızıl Zümrüt", points: 37 },
  { profession: "Sarraf", base: "Topaz", second: "Mavi Topaz", points: 40 },
  { profession: "Sarraf", base: "Krizoberil", second: "Alexandrite", points: 45 },
  { profession: "Sarraf", base: "Yeşim Taşı", second: "Jadeit", points: 45 },
  { profession: "Lokman", base: "Meşe Odunu", second: "Budaksız Meşe", points: 1 },
  { profession: "Lokman", base: "Ceviz Yaprağı", second: "Ceviz", points: 3 },
  { profession: "Lokman", base: "Isırgan Otu", second: "Isırgan Tohumu", points: 5 },
  { profession: "Lokman", base: "Ökse Otu", second: "Ökse Meyvesi", points: 7 },
  { profession: "Lokman", base: "Adaçayı Yaprağı", second: "Ada Sürgünü", points: 12 },
  { profession: "Lokman", base: "Akçaağaç Odunu", second: "Zamk", points: 17 },
  { profession: "Lokman", base: "Koni Yaprağı", second: "Koni Çiçeği", points: 20 },
  { profession: "Lokman", base: "Civan Perçemi", second: "Civan Çiçeği", points: 23 },
  { profession: "Lokman", base: "Mantar", second: "Sinek Mantarı", third: "Ganoderma", points: 30 },
  { profession: "Lokman", base: "Şerbetçi Otu", points: 36 },
  { profession: "Lokman", base: "Abanoz Odunu", second: "Budaksız Abanoz", points: 40 },
  { profession: "Lokman", base: "Çıban Otu", second: "Çıban Çiçeği", third: "Dört Yapraklı Yonca", points: 45 },
  { profession: "Lokman", base: "Çiğdem", second: "Safran", points: 45 },
];

const aboveCapRows = [
  { profession: "Madenci", chain: "Euksenit → Skandiyum → Yttrium", points: 50 },
  { profession: "Madenci", chain: "Lantan → Turyum → Erbium", points: 55 },
  { profession: "Sarraf", chain: "Fluorit → Mavi John → Taaffeite", points: 50 },
  { profession: "Sarraf", chain: "Bor → Ludwigite → Painite", points: 55 },
  { profession: "Lokman", chain: "Papatya → Anthemis → Sevgi Çiçeği", points: 50 },
  { profession: "Lokman", chain: "Kardelen → Narin Kardelen → İstanbul Kardeleni", points: 55 },
];

const historicalRegions: Record<Profession, Record<string, string>> = {
  Madenci: {
    Bakır: "Eminönü", Kalay: "Eminönü", Kurşun: "Eminönü", Demir: "Eminönü", Nikel: "Eminönü", Krom: "Eminönü", Gümüş: "Eminönü", Altın: "Eminönü",
    Tungsten: "Meteor Bölgesi", Platin: "Meteor Bölgesi", Titanyum: "Yeraltı", Osmiridyum: "Yeraltı",
  },
  Sarraf: {
    Kuvars: "Eminönü", Obsidyen: "Eminönü", "Kan Taşı": "Eminönü", "Açık Mavi Lapis": "Eminönü", Turkuaz: "Eminönü", Ametist: "Eminönü", Kalsedon: "Eminönü", Elmas: "Eminönü",
    "Mavi Safir": "Meteor Bölgesi", Beril: "Meteor Bölgesi", Topaz: "Yeraltı", Krizoberil: "Yeraltı", "Yeşim Taşı": "Büyük Hol · Lojman",
  },
  Lokman: {
    "Meşe Odunu": "Eminönü", "Ceviz Yaprağı": "Eminönü", "Isırgan Otu": "Eminönü", "Ökse Otu": "Eminönü", "Adaçayı Yaprağı": "Eminönü", "Akçaağaç Odunu": "Eminönü", "Koni Yaprağı": "Eminönü", "Civan Perçemi": "Eminönü",
    Mantar: "Meteor Bölgesi", "Şerbetçi Otu": "Meteor Bölgesi", "Abanoz Odunu": "Yeraltı", "Çıban Otu": "Yeraltı",
  },
};

const potionExamples: Record<string, string[]> = {
  "Meşe Odunu": ["Kedi İyileştiren", "Zırh Artırıcı", "Buz Hasarı Veren", "Zehir Hasarı Artırıcı"],
  "Ceviz Yaprağı": ["Kedi İyileştiren", "Kritik Artırıcı", "Elektrik Hasarı Artırıcı", "Asit Direnci Artırıcı"],
  "Isırgan Otu": ["Koç İyileştiren", "İğne Deliği Misali", "Kutup Esintili", "Plastik Emsali"],
  "Ökse Otu": ["Koç İyileştiren", "Fareadam Menşeili", "Çekiç Başlı", "Erciyes Modeli"],
  "Adaçayı Yaprağı": ["Eski Köprü Usulü", "Horoz Gagası Misali", "Çamlıca Menşeili", "Bakırköy Usulü"],
  "Koni Yaprağı": ["Aygır İyileştiren", "Epe Ucu Misali", "Faraday Modeli", "Oğuz Bey İcadı"],
  "Civan Perçemi": ["Aygır İyileştiren", "Yılan Isırığı Emsali", "Vatoz Emsali", "Şimal Usulü"],
  Mantar: ["Timsah Derisi Emsali", "Karayel Etkili", "Toprak Modeli", "Aktar Şevket İcadı"],
  "Şerbetçi Otu": ["Demirci Dilek Modeli", "Buz Kristali Modeli", "Derviş Hasan Usulü", "Beygir Emsali"],
  "Abanoz Odunu": ["Fil İyileştiren", "Karacin Modeli", "Karakürk Emsali"],
  "Çıban Otu": ["Solucan Modeli", "Halit Girmenç İcadı", "Ruh Çalan Emsali", "Nötron Yıldızı Emsali"],
};

const itemNameById = new Map(items.map((item) => [item.id, item.name]));

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
  const shown = useMemo(() => materials.filter((item) => item.name.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))), [query]);
  const collectionShown = useMemo(() => collectionRows.filter((item) => {
    const region = historicalRegions[item.profession][item.base] ?? "Saha teyidi bekliyor";
    return item.profession === profession
      && (collectionRegion === "Tümü" || region === collectionRegion)
      && [item.base, item.second, item.third].filter(Boolean).join(" ").toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"));
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

  function recipeUsage(row: (typeof collectionRows)[number]) {
    const names = [row.base, row.second, row.third].filter(Boolean) as string[];
    const equipment = recipes
      .filter((recipe) => recipe.materials.some((material) => names.some((name) => name.toLocaleLowerCase("tr") === material.name.toLocaleLowerCase("tr"))))
      .map((recipe) => itemNameById.get(recipe.itemId) ?? recipe.itemId);
    return {
      equipment: [...new Set(equipment)],
      potions: potionExamples[row.base] ?? [],
    };
  }

  return <section className="mining" id="mining">
    <div className="mining-hero">
      <div className="mining-kicker"><span>YENİ MODÜL</span> MADEN &amp; PAZAR TAKİBİ</div>
      <div className="mining-title">
        <div><h2>Çıkış rastgele.<br/><em>Süren ölçülebilir.</em></h2><p>Sabit nokta vaadi vermeden kontrol zamanını takip et, boş ve başarılı kontrolleri kaydet, yeniden çıkış aralığını gerçek gözlemlerle öğren.</p><a className="farm-ops-link" href="/farm-operasyonu">Saha Operasyonunu aç <span>↗</span></a></div>
        <div className="ore-orbit" aria-hidden="true"><span/><i>Xe</i><small>XENOTİM</small></div>
      </div>
      <div className="market-pulse">
        <div><small>TAKİPTEKİ MALZEME</small><strong>Xenotim</strong></div>
        <div><small>İLK ÇIKIŞ GÖZLEMİ</small><strong>≈ 400 TL</strong></div>
        <div><small>AĞUSTOS 2026 GÖZLEMİ</small><strong>150–200 TL</strong></div>
        <div className="pulse-down"><small>YÖN</small><strong>↓ Arz baskısı</strong></div>
      </div>
      <p className="market-disclaimer">Fiyatlar satıcı ilanı değildir. Reel para alanı yalnızca tarihli kullanıcı piyasa gözlemlerini arşivler; güvenli veya resmî ticaret garantisi vermez.</p>
    </div>

    <div className="mining-shell">
      <div className="mining-tabs" role="tablist">{(["Sayaçlar","Pazar","Kaynaklar","Gözlemler","Artırıcılar"] as View[]).map(x=><button key={x} className={view===x?"active":""} onClick={()=>{setView(x);setQuery("");}}>{x}</button>)}</div>

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

      {view === "Pazar" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>CANLI VERİ İSKELETİ</span><h3>Maden değer defteri</h3></div><label><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Malzeme ara"/></label></div>
        <div className="mineral-grid">{shown.map(item=><article className={`mineral-card ${item.tone}`} key={item.name}>
          <div className="mineral-top"><span className="mineral-gem">◆</span><span className="price-trend">{item.trend}</span></div>
          <small>{item.kind}</small><h4>{item.name}</h4><p>{item.demand}</p>
          <dl><div><dt>Oyun parası</dt><dd>{item.game}</dd></div><div><dt>Reel gözlem</dt><dd>{item.real}</dd></div></dl>
          <footer><i/> {item.status}</footer>
        </article>)}</div>
        <div className="value-logic"><div><span>01</span><h4>Reçete talebi</h4><p>Bir malzeme farklı sınıfların çok sayıda tılsım veya şaheser reçetesinde geçiyorsa sürekli talep görür.</p></div><div><span>02</span><h4>Erişim ve çekim</h4><p>Bölge erişimi, kaynak yoğunluğu, toplama puanı ve saf/nadir çekim olasılığı arzı belirler.</p></div><div><span>03</span><h4>Pazar baskısı</h4><p>Yoğun farm, rota tekeli ve stokların pazara aynı anda girmesi fiyatı aşağı çekebilir.</p></div></div>
      </div>}

      {view === "Kaynaklar" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>49 SEVİYE KAPSAM DENETİMİ</span><h3>Toplayıcılık kataloğu</h3></div><a href={sources.professions} target="_blank" rel="noreferrer">Ad tablosu ↗</a></div>
        <div className="collection-tools">
          <div>{(["Madenci","Sarraf","Lokman"] as Profession[]).map(x=><button key={x} className={profession===x?"active":""} onClick={()=>{setProfession(x);setCollectionRegion("Tümü");}}>{x}</button>)}</div>
          <select aria-label="Bölge filtresi" value={collectionRegion} onChange={(event)=>setCollectionRegion(event.target.value)}><option>Tümü</option><option>Eminönü</option><option>Meteor Bölgesi</option><option>Yeraltı</option><option>Büyük Hol · Lojman</option><option>Saha teyidi bekliyor</option></select>
          <label><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Kaynak veya çıktı ara"/></label>
        </div>
        <p className="schematic-note">Madenci, Sarraf ve Lokman ile 1./2./3. çıktı zincirleri kaynak tablosundan alındı. Bölge eşleşmeleri 2010 tarihli saha rehberidir; Kıyametin Öncüleri’nde oyuncu kaydı gelene kadar “tarihî kaynak” olarak gösterilir.</p>
        <div className="catalog-sources"><a href={sources.officialJobs} target="_blank" rel="noreferrer">Resmî meslek tanımları ↗</a><a href={sources.historicalRegions} target="_blank" rel="noreferrer">Bölge ve çıktı rehberi ↗</a><a href={sources.potionRecipes} target="_blank" rel="noreferrer">İksir reçeteleri ↗</a></div>
        <div className="collection-list">{collectionShown.map(item=>{
          const usage = recipeUsage(item);
          const region = historicalRegions[item.profession][item.base] ?? "Saha teyidi bekliyor";
          return <article key={`${item.profession}-${item.base}`}>
            <div><small>{item.profession}</small><h4>{item.base}</h4></div>
            <div className="output-chain"><span><small>1. ÇIKTI</small>{item.base}</span>{item.second&&<><i>→</i><span><small>2. ÇIKTI</small>{item.second}</span></>}{item.third&&<><i>→</i><span><small>3. ÇIKTI</small>{item.third}</span></>}</div>
            <div className="point-pill"><b>{item.points}</b><small>puan</small></div>
            <div className="collection-region"><span>BÖLGE</span><b>{region}</b><small>{region === "Saha teyidi bekliyor" ? "Bölge kaydı bulunamadı" : item.base === "Yeşim Taşı" ? "Oyuncu saha bilgisi" : "Tarihî kaynak · KÖ teyidi bekliyor"}</small></div>
            <div className="recipe-usage"><span>REÇETE KULLANIMI</span>{usage.equipment.length>0&&<p><b>Ekipman:</b> {usage.equipment.slice(0,4).join(" · ")}{usage.equipment.length>4?` · +${usage.equipment.length-4} kayıt`:""}</p>}{usage.potions.length>0&&<p><b>İksir örnekleri:</b> {usage.potions.join(" · ")}</p>}{usage.equipment.length===0&&usage.potions.length===0&&<p>Taranan reçete kataloğunda kullanım kaydı bulunamadı; katkı bekleniyor.</p>}</div>
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
          <article><div className="booster-icon">60</div><div><small>KİŞİSEL · RESMÎ İKV DUYURUSU</small><h4>Maden Şans Artırıcı %60</h4><p>Resmî İKV duyurusunda ürün %60 olarak listeleniyor. İki torba, saf/nadir çekim ve KÖ sunucusundaki tam formül henüz kaynakla doğrulanmadı.</p></div><span className="stack-badge">KÖ TESTİ BEKLİYOR</span></article>
          <article><div className="booster-icon guild">60</div><div><small>LONCA · RESMÎ İKV DUYURUSU</small><h4>Lonca Madenci Şans Artırıcı %60</h4><p>Resmî İKV duyurusunda ürün %60 olarak listeleniyor. Kişisel artırıcıyla KÖ sunucusunda nasıl birleştiği saha testi yapılmadan kesin kabul edilmeyecek.</p></div><span className="stack-badge">KÖ TESTİ BEKLİYOR</span></article>
          <article className="booster-result"><div className="booster-icon result">+</div><div><small>FARM PLANI</small><h4>Önce test turu, sonra uzun farm</h4><p>Artırıcısız ve artırıcılı eşit sayıda tur kaydet. Torba, saf ve nadir sonuçlarını ayrı say; kârlılığı yalnız satış fiyatıyla değil saat başına çıktıyla ölç.</p></div></article>
        </div>
        <div className="source-strip"><span>Kaynak durumu</span><a href={sources.personalBooster} target="_blank" rel="noreferrer">Kişisel %60 duyurusu</a><a href={sources.guildBooster} target="_blank" rel="noreferrer">Lonca %60 duyurusu</a><a href={sources.officialJobs} target="_blank" rel="noreferrer">Resmî meslekler</a><a href={sources.historicalRegions} target="_blank" rel="noreferrer">Tarihî bölge rehberi</a><a href={sources.professions} target="_blank" rel="noreferrer">Toplayıcılık tablosu</a><a href={sources.potionRecipes} target="_blank" rel="noreferrer">İksir reçeteleri</a><a href={sources.recipes} target="_blank" rel="noreferrer">Tılsım reçeteleri</a></div>
      </div>}
    </div>
  </section>;
}
