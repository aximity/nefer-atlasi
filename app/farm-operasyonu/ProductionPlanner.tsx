"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { publishableItems, recipes, sourceFor } from "../../lib/catalog";
import { materialSourceFor } from "../../lib/material-sources";
import { buildProductionPlans, productionSummary } from "../../lib/production-planner.mjs";

type Stock = Record<string, number>;
type Targets = Record<string, number>;
type Owners = Record<string, string>;
type PlanFilter = "Tümü" | "Üretilebilir" | "Yakın" | "Favoriler";
type ProductionPlan = ReturnType<typeof buildProductionPlans>[number];

const keys = {
  stock: "nefer-production-stock-v1",
  favorites: "nefer-production-favorites-v1",
  targets: "nefer-production-targets-v1",
  owners: "nefer-production-owners-v1",
};
const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
};
const fmt = (value: number) => new Intl.NumberFormat("tr-TR").format(value);
const normalizeSearch = (value: string) => value.toLocaleLowerCase("tr-TR").trim();

function sourceText(materialName: string) {
  const source = materialSourceFor(materialName);
  if (!source) return { label: "Kaynak eşleşmesi bekliyor", detail: "Tahmin yürütülmedi; katkı kanıtıyla doğrulanmalı.", known: false };
  if (source.kind === "gathering") {
    const output = source.output === 1 ? "ana ürün" : source.output === 2 ? "ikinci ürün" : "nadir ürün";
    return { label: `${source.region} · ${source.profession}`, detail: `${source.base} kaynağından ${output}; ${source.points} meslek puanı eşiği.`, known: true };
  }
  return { label: `${source.region} · ${source.enemy}`, detail: `${source.verification}. ${source.usage}`, known: true };
}

export default function ProductionPlanner() {
  const [stock, setStock] = useState<Stock>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [targets, setTargets] = useState<Targets>({});
  const [owners, setOwners] = useState<Owners>({});
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PlanFilter>("Tümü");
  const [photoPreview, setPhotoPreview] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setStock(readStored(keys.stock, {}));
      setFavorites(readStored(keys.favorites, []));
      setTargets(readStored(keys.targets, {}));
      setOwners(readStored(keys.owners, {}));
      setHydrated(true);
    });
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.stock, JSON.stringify(stock)); }, [hydrated, stock]);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.favorites, JSON.stringify(favorites)); }, [favorites, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.targets, JSON.stringify(targets)); }, [hydrated, targets]);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.owners, JSON.stringify(owners)); }, [hydrated, owners]);
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  const itemById = useMemo(() => new Map(publishableItems.map((item) => [item.id, item])), []);
  const materialOptions = useMemo(() => [...new Set(recipes.flatMap((recipe) => recipe.materials.map((row) => row.name)))].sort((a, b) => a.localeCompare(b, "tr")), []);
  const plans = useMemo(() => buildProductionPlans({ recipes, items: publishableItems, stock, targets }) as ProductionPlan[], [stock, targets]);
  const summary = useMemo(() => productionSummary(plans, favorites), [favorites, plans]);
  const visible = useMemo(() => {
    const needle = normalizeSearch(query);
    return plans
      .filter((plan) => {
        const item = itemById.get(plan.recipe.itemId);
        const matches = !needle || normalizeSearch(`${item?.name ?? plan.recipe.itemId} ${item?.class ?? ""} ${item?.slot ?? ""} ${plan.recipe.materials.map((row) => row.name).join(" ")}`).includes(needle);
        if (!matches) return false;
        if (filter === "Üretilebilir") return plan.status === "ready";
        if (filter === "Yakın") return plan.status === "near";
        if (filter === "Favoriler") return favorites.includes(plan.recipe.itemId);
        return true;
      })
      .sort((a, b) => Number(favorites.includes(b.recipe.itemId)) - Number(favorites.includes(a.recipe.itemId)) || b.completion - a.completion);
  }, [favorites, filter, itemById, plans, query]);
  const unknownMissing = useMemo(() => plans.flatMap((plan) => plan.missing).filter((row) => !materialSourceFor(row.name)).length, [plans]);
  const routePriority = useMemo(() => {
    const regions = new Map<string, number>();
    plans.filter((plan) => favorites.includes(plan.recipe.itemId)).flatMap((plan) => plan.missing).forEach((row) => {
      const source = materialSourceFor(row.name);
      if (source) regions.set(source.region, (regions.get(source.region) ?? 0) + row.missing);
    });
    return [...regions.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [favorites, plans]);

  const addStock = () => {
    const amount = Math.max(0, Math.floor(Number(quantity)));
    if (!material || !amount) return;
    setStock((current) => ({ ...current, [material]: (current[material] ?? 0) + amount }));
    setQuantity("1");
  };
  const setStockQuantity = (name: string, next: number) => {
    setStock((current) => {
      const updated = { ...current };
      if (next > 0) updated[name] = Math.floor(next);
      else delete updated[name];
      return updated;
    });
  };
  const choosePhoto = (file: File | null) => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : "");
  };

  return <section className="productionWorkspace" id="production-planner">
    <header className="productionHead">
      <div><p>M34 · ÜRETİM TAKİP MASASI</p><h2>Stoktan reçeteye, eksikten rotaya.</h2><span>Favori üretimi seç; eldeki malzemeyi gir; eksik miktarı, edinme kaynağını ve sorumlu kişiyi tek yerde izle.</span></div>
      <div className="productionHeadStats"><article><small>ÜRETİLEBİLİR</small><b>{summary.ready}</b><span>reçete</span></article><article><small>FAVORİ</small><b>{summary.favorites}</b><span>hedef</span></article><article><small>KAYNAĞI EKSİK</small><b>{unknownMissing}</b><span>malzeme satırı</span></article></div>
    </header>

    <div className="productionInputGrid">
      <section className="stockEditor">
        <header><div><small>01 · ENVANTER</small><h3>Malzeme girişi</h3></div><span>{Object.keys(stock).length} tür</span></header>
        <div className="stockAdd"><label><span>Malzeme</span><select value={material} onChange={(event) => setMaterial(event.target.value)}><option value="">Seç…</option>{materialOptions.map((name) => <option key={name}>{name}</option>)}</select></label><label><span>Adet</span><input inputMode="numeric" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value.replace(/\D/g, ""))}/></label><button type="button" onClick={addStock}>Stoka ekle</button></div>
        <div className="stockRows">{Object.entries(stock).sort(([a], [b]) => a.localeCompare(b, "tr")).map(([name, amount]) => <label key={name}><span>{name}</span><input aria-label={`${name} adedi`} inputMode="numeric" value={amount} onChange={(event) => setStockQuantity(name, Number(event.target.value))}/><button type="button" aria-label={`${name} stoktan çıkar`} onClick={() => setStockQuantity(name, 0)}>×</button></label>)}{Object.keys(stock).length === 0 && <p>Henüz stok girilmedi. Reçeteler eksik miktar üzerinden listeleniyor.</p>}</div>
      </section>
      <section className="stockPhoto">
        <header><div><small>02 · FOTOĞRAF REFERANSI</small><h3>Çantayı yanında tut</h3></div></header>
        <label className={photoPreview ? "hasPhoto" : ""}>{photoPreview ? <Image unoptimized fill sizes="(max-width: 1050px) 100vw, 35vw" src={photoPreview} alt="Malzeme girişi için seçilen çanta fotoğrafı"/> : <span><b>Fotoğraf seç veya çek</b><small>Çanta ekranı yalnız bu cihazda önizlenir.</small></span>}<input type="file" accept="image/*" capture="environment" onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)}/></label>
        <p>Otomatik okuma doğrulanmadan stok değiştirilmez. Fotoğrafa bakıp adetleri manuel onayla; görüntü sunucuya gönderilmez.</p>
      </section>
    </div>

    <section className="productionAdvice">
      <div><small>SIRADAKİ EN YAKIN HEDEF</small><b>{summary.closest ? itemById.get(summary.closest.recipe.itemId)?.name ?? summary.closest.recipe.itemId : summary.ready ? "Seçili reçeteler üretime hazır" : "Stok girdikçe öneri oluşacak"}</b><span>{summary.closest ? `%${summary.closest.completion} tamam · ${summary.closest.missing.length} eksik malzeme` : "Favoriler varsa önce onlar değerlendirilir."}</span></div>
      <div><small>SAHA ÖNERİSİ</small><b>{routePriority ? `${routePriority} rotasını değerlendir` : "Önce favori reçete seç"}</b><span>{routePriority ? "Favori hedeflerdeki kaynaklı eksikler bu bölgede yoğunlaşıyor." : "Rota önerisi yalnız kaynak eşleşmesi olan favori eksiklerden çıkar."}</span></div>
      <div><small>DOĞRULAMA KURALI</small><b>Tahmin yok</b><span>Kaynağı bilinmeyen malzeme açıkça işaretlenir; oyuncu bilgisi kaynaklı kayıttan ayrılır.</span></div>
    </section>

    <div className="productionToolbar"><div>{(["Tümü", "Üretilebilir", "Yakın", "Favoriler"] as PlanFilter[]).map((name) => <button type="button" className={filter === name ? "on" : ""} onClick={() => setFilter(name)} key={name}>{name}</button>)}</div><input aria-label="Reçete veya malzeme ara" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Reçete veya malzeme ara…"/><span>{visible.length} reçete</span></div>

    <div className="productionCards">{visible.map((plan) => {
      const item = itemById.get(plan.recipe.itemId);
      const favorite = favorites.includes(plan.recipe.itemId);
      const recipeSource = sourceFor(plan.recipe.sourceId);
      return <article className={`productionCard ${plan.status}`} key={plan.recipe.id}>
        <header><button type="button" className={favorite ? "favorite on" : "favorite"} aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"} onClick={() => setFavorites((current) => favorite ? current.filter((id) => id !== plan.recipe.itemId) : [...current, plan.recipe.itemId])}>{favorite ? "★" : "☆"}</button><span><small>{item?.class ?? "Sınıf bekliyor"} · {item?.slot ?? "Yuva bekliyor"}</small><h3>{item?.name ?? plan.recipe.itemId}</h3></span><b className={`planStatus ${plan.status}`}>{plan.status === "ready" ? "Üretilebilir" : plan.status === "near" ? "Yakın" : "Eksik"}</b></header>
        <div className="planControls"><label><span>Hedef</span><input aria-label={`${item?.name ?? plan.recipe.itemId} hedef adedi`} inputMode="numeric" min="1" value={plan.target} onChange={(event) => setTargets((current) => ({ ...current, [plan.recipe.itemId]: Math.max(1, Number(event.target.value) || 1) }))}/></label><label><span>Üretecek kişi</span><input value={owners[plan.recipe.itemId] ?? ""} onChange={(event) => setOwners((current) => ({ ...current, [plan.recipe.itemId]: event.target.value }))} placeholder="İsim / ekip…"/></label><span><small>Stoktan çıkabilecek</small><b>{plan.craftableCount} adet</b></span></div>
        <div className="planProgress"><span><b style={{ width: `${plan.completion}%` }}/></span><em>%{plan.completion}</em></div>
        <div className="materialChecklist">{plan.materials.map((row) => {
          const origin = sourceText(row.name);
          return <details className={row.missing ? "missing" : "covered"} key={row.name}><summary><i>{row.missing ? "−" : "✓"}</i><span><b>{row.name}</b><small>{fmt(row.owned)} / {fmt(row.required)} elde</small></span><strong>{row.missing ? `${fmt(row.missing)} eksik` : "tamam"}</strong></summary>{row.missing > 0 && <p className={origin.known ? "known" : "unknown"}><b>{origin.label}</b><span>{origin.detail}</span></p>}</details>;
        })}</div>
        <footer><span>{owners[plan.recipe.itemId] ? `Sorumlu: ${owners[plan.recipe.itemId]}` : "Sorumlu atanmadı"}</span>{recipeSource ? <a href={recipeSource.url} target="_blank" rel="noreferrer">Reçete kaynağı ↗</a> : <span>Kaynak bekliyor</span>}</footer>
      </article>;
    })}{visible.length === 0 && <div className="productionEmpty">Bu filtrede reçete yok. Stok, arama veya favori seçimini değiştir.</div>}</div>
  </section>;
}
