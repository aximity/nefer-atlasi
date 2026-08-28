"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { talismans } from "../../lib/catalog";
import { buildProductionPlans, productionDraftImpact, productionSummary } from "../../lib/production-planner.mjs";
import { potionRecipes } from "../../lib/potion-recipes";
import { materialIconFor } from "../../lib/material-icons";
import { productionItemById, productionItems, productionMaterialNames, productionMaterialSourceFor, productionRecipes } from "../../lib/production-catalog";

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
  talismanGoals: "nefer-talisman-production-favorites-v1",
  potionGoals: "nefer-potion-production-favorites-v1",
};
const readStored = (key: string): unknown => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};
const readStringList = (key: string) => {
  const value = readStored(key);
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
};
const readNumberRecord = (key: string) => {
  const value = readStored(key);
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]) && entry[1] >= 0));
};
const readStringRecord = (key: string) => {
  const value = readStored(key);
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
};
const fmt = (value: number) => new Intl.NumberFormat("tr-TR").format(value);
const normalizeSearch = (value: string) => value.toLocaleLowerCase("tr-TR").trim();
const talismanIds = new Set(talismans.map((row) => row.id));
const potionIds = new Set(potionRecipes.map((row) => row.itemId));
function sourceText(materialName: string) {
  const source = productionMaterialSourceFor(materialName);
  if (!source) return { label: "Kaynak eşleşmesi bekliyor", detail: "Tahmin yürütülmedi; katkı kanıtıyla doğrulanmalı.", known: false };
  if (source.kind === "gathering") {
    const output = source.output === 1 ? "ana ürün" : source.output === 2 ? "ikinci ürün" : "nadir ürün";
    return { label: `${source.region} · ${source.profession}`, detail: `${source.base} kaynağından ${output}; ${source.points} meslek puanı eşiği.`, known: true };
  }
  if (source.kind === "crafted") {
    return {
      label: `${source.profession} üretimi · Sv. ${source.level}`,
      detail: `Gerekli: ${source.materials.map((row) => `${row.name} ×${row.quantity}`).join(" + ")}.`,
      known: true,
    };
  }
  if (source.kind === "quest_reward") {
    return {
      label: `${source.quest} · Sv. ${source.level}`,
      detail: `${source.classScope} görev ödülü${source.quantity === null ? "; adet kaynakta belirtilmiyor" : ` · ×${source.quantity}`}.`,
      known: true,
    };
  }
  if (source.kind === "talisman_craft") {
    return {
      label: `${source.class} · ${source.color} · ${source.tier}. kademe tılsım üretimi`,
      detail: `Gerekli: ${source.materials.map((row) => `${row.name} ×${row.quantity}`).join(" + ")}.`,
      known: true,
    };
  }
  if (source.kind === "talisman_acquisition") {
    return {
      label: `${source.npc} · ${source.region} · ${source.priceLabel}`,
      detail: `${source.verification}. Reçete uydurulmadı; hazır edinim kaydı kullanılıyor.`,
      known: false,
    };
  }
  return { label: `${source.region ?? "Bölge doğrulanıyor"} · ${source.enemy}`, detail: `${source.verification}. ${source.usage}`, known: true };
}

function sourceArea(source: NonNullable<ReturnType<typeof productionMaterialSourceFor>>) {
  if (source.kind === "crafted") return `${source.profession} tezgâhı`;
  if (source.kind === "quest_reward") return `Görev · Sv. ${source.level}`;
  if (source.kind === "talisman_craft") return "Tılsım üretimi";
  if (source.kind === "talisman_acquisition") return `${source.npc} · ${source.region}`;
  return source.region ?? "Bölge doğrulanıyor";
}

export default function ProductionPlanner() {
  const [stock, setStock] = useState<Stock>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [targets, setTargets] = useState<Targets>({});
  const [owners, setOwners] = useState<Owners>({});
  const [talismanGoals, setTalismanGoals] = useState<string[]>([]);
  const [potionGoals, setPotionGoals] = useState<string[]>([]);
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PlanFilter>("Tümü");
  const [visibleLimit, setVisibleLimit] = useState(12);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoMaterial, setPhotoMaterial] = useState("");
  const [photoQuery, setPhotoQuery] = useState("");
  const [photoQuantity, setPhotoQuantity] = useState("1");
  const [photoDraft, setPhotoDraft] = useState<Stock>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setStock(readNumberRecord(keys.stock));
      setFavorites(readStringList(keys.favorites));
      setTargets(readNumberRecord(keys.targets));
      setOwners(readStringRecord(keys.owners));
      setTalismanGoals(readStringList(keys.talismanGoals));
      setPotionGoals(readStringList(keys.potionGoals));
      setHydrated(true);
    });
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.stock, JSON.stringify(stock)); }, [hydrated, stock]);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.favorites, JSON.stringify(favorites)); }, [favorites, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.targets, JSON.stringify(targets)); }, [hydrated, targets]);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.owners, JSON.stringify(owners)); }, [hydrated, owners]);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.talismanGoals, JSON.stringify(talismanGoals)); }, [hydrated, talismanGoals]);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.potionGoals, JSON.stringify(potionGoals)); }, [hydrated, potionGoals]);
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  const itemById = productionItemById;
  const talismanGoalRows = useMemo(() => talismanGoals.map((id) => talismans.find((row) => row.id === id)).filter((row) => Boolean(row)), [talismanGoals]);
  const potionGoalRows = useMemo(() => potionGoals.map((id) => potionRecipes.find((row) => row.itemId === id)).filter((row) => Boolean(row)), [potionGoals]);
  const materialOptions = productionMaterialNames;
  const photoMatches = useMemo(() => {
    const needle = normalizeSearch(photoQuery);
    return materialOptions.filter((name) => (!needle ? Boolean(materialIconFor(name)) : normalizeSearch(name).includes(needle))).slice(0, 48);
  }, [materialOptions, photoQuery]);
  const plans = useMemo(() => buildProductionPlans({ recipes: productionRecipes, items: productionItems, stock, targets }) as ProductionPlan[], [stock, targets]);
  const favoriteIds = useMemo(() => [...new Set([...favorites, ...talismanGoals, ...potionGoals])], [favorites, potionGoals, talismanGoals]);
  const summary = useMemo(() => productionSummary(plans, favoriteIds), [favoriteIds, plans]);
  const planByItemId = useMemo(() => new Map(plans.map((plan) => [plan.recipe.itemId, plan])), [plans]);
  const photoImpact = useMemo(() => Object.keys(photoDraft).length ? productionDraftImpact({
    recipes: productionRecipes,
    items: productionItems,
    stock,
    draft: photoDraft,
    targets,
    favoriteIds,
  }) : null, [favoriteIds, photoDraft, stock, targets]);
  const visible = useMemo(() => {
    const needle = normalizeSearch(query);
    return plans
      .filter((plan) => {
        const item = itemById.get(plan.recipe.itemId);
        const matches = !needle || normalizeSearch(`${item?.name ?? plan.recipe.itemId} ${item?.class ?? ""} ${item?.slot ?? ""} ${plan.recipe.materials.map((row) => row.name).join(" ")}`).includes(needle);
        if (!matches) return false;
        if (filter === "Üretilebilir") return plan.status === "ready";
        if (filter === "Yakın") return plan.status === "near";
        if (filter === "Favoriler") return favoriteIds.includes(plan.recipe.itemId);
        return true;
      })
      .sort((a, b) => Number(favoriteIds.includes(b.recipe.itemId)) - Number(favoriteIds.includes(a.recipe.itemId)) || b.completion - a.completion);
  }, [favoriteIds, filter, itemById, plans, query]);
  const routePriority = useMemo(() => {
    const regions = new Map<string, number>();
    plans.filter((plan) => favoriteIds.includes(plan.recipe.itemId)).flatMap((plan) => plan.missing).forEach((row) => {
      const source = productionMaterialSourceFor(row.name);
      if (source) {
        const area = sourceArea(source);
        regions.set(area, (regions.get(area) ?? 0) + row.missing);
      }
    });
    return [...regions.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [favoriteIds, plans]);
  const visibleRows = visible.slice(0, visibleLimit);
  const closestPlan = Object.keys(stock).length > 0 ? summary.closest : null;
  const photoRecommendation = photoImpact?.recommended ?? null;
  const photoRecommendationItem = photoRecommendation ? itemById.get(photoRecommendation.recipe.itemId) : null;
  const photoRecommendationKind = photoRecommendation ? talismanIds.has(photoRecommendation.recipe.itemId) ? "talisman" : potionIds.has(photoRecommendation.recipe.itemId) ? "potion" : "item" : "item";

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
  const addPhotoDraft = () => {
    const amount = Math.max(0, Math.floor(Number(photoQuantity)));
    if (!photoMaterial || !amount) return;
    setPhotoDraft((current) => ({ ...current, [photoMaterial]: (current[photoMaterial] ?? 0) + amount }));
    setPhotoQuantity("1");
  };
  const confirmPhotoDraft = () => {
    setStock((current) => {
      const next = { ...current };
      for (const [name, amount] of Object.entries(photoDraft)) next[name] = (next[name] ?? 0) + amount;
      return next;
    });
    setPhotoDraft({});
  };
  const togglePlanFavorite = (itemId: string) => {
    if (talismanIds.has(itemId)) {
      setTalismanGoals((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
    } else if (potionIds.has(itemId)) {
      setPotionGoals((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
    } else {
      setFavorites((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
    }
  };

  return <section className="productionWorkspace" id="production-planner">
    <header className="productionHead">
      <div><p>M34 · ÜRETİM TAKİP MASASI</p><h2>Stoktan reçeteye, eksikten rotaya.</h2><span>Favori üretimi seç; eldeki malzemeyi gir; eksik miktarı, edinme kaynağını ve sorumlu kişiyi tek yerde izle.</span></div>
      <div className="productionHeadStats"><article><small>ÜRETİLEBİLİR</small><b>{summary.ready}</b><span>reçete</span></article><article><small>FAVORİ</small><b>{summary.favorites}</b><span>hedef</span></article><article><small>STOK</small><b>{Object.keys(stock).length}</b><span>malzeme türü</span></article></div>
    </header>

    <div className="productionInputGrid">
      <section className="stockEditor">
        <header><div><small>01 · ENVANTER</small><h3>Malzeme girişi</h3></div><span>{Object.keys(stock).length} tür</span></header>
        <div className="stockAdd"><label><span>Malzeme</span><select value={material} onChange={(event) => setMaterial(event.target.value)}><option value="">Seç…</option>{materialOptions.map((name) => <option key={name}>{name}</option>)}</select></label><label><span>Adet</span><input inputMode="numeric" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value.replace(/\D/g, ""))}/></label><button type="button" onClick={addStock}>Stoka ekle</button></div>
        <div className="stockRows">{Object.entries(stock).sort(([a], [b]) => a.localeCompare(b, "tr")).map(([name, amount]) => { const icon = materialIconFor(name); return <label key={name}>{icon ? <Image src={icon.path} alt="" width={28} height={28}/> : <i aria-hidden="true">{name.slice(0, 2)}</i>}<span>{name}</span><input aria-label={`${name} adedi`} inputMode="numeric" value={amount} onChange={(event) => setStockQuantity(name, Number(event.target.value))}/><button type="button" aria-label={`${name} stoktan çıkar`} onClick={() => setStockQuantity(name, 0)}>×</button></label>; })}{Object.keys(stock).length === 0 && <p>Henüz stok girilmedi. Reçeteler eksik miktar üzerinden listeleniyor.</p>}</div>
      </section>
      <section className="stockPhoto">
        <header><div><small>02 · FOTOĞRAF REFERANSI</small><h3>Çantayı yanında tut</h3></div></header>
        <div className={photoPreview ? "photoStage hasPhoto" : "photoStage"}>{photoPreview ? <Image unoptimized fill sizes="(max-width: 1050px) 100vw, 35vw" src={photoPreview} alt="Malzeme girişi için seçilen çanta fotoğrafı"/> : <span><b>Çanta görüntüsü</b><small>Galeriden seç veya kamerayla şimdi çek.</small></span>}</div>
        <div className="photoInputActions">
          <label><span>Galeriden seç</span><input className="photoFileInput" type="file" accept="image/*" aria-label="Galeriden çanta fotoğrafı seç" onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)}/></label>
          <label><span>Şimdi fotoğraf çek</span><input className="photoFileInput" type="file" accept="image/*" capture="environment" aria-label="Kamerayla çanta fotoğrafı çek" onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)}/></label>
        </div>
        <p>Fotoğraf otomatik olarak stok değiştirmez. Görseldeki ikona en çok benzeyen malzemeyi seçip adedi onayla; görüntü yalnız bu cihazda kalır.</p>
        {photoPreview && <div className="photoVisualPicker"><label><span>İkon veya malzeme ara</span><input value={photoQuery} onChange={(event) => setPhotoQuery(event.target.value)} placeholder="Örn. Jadeit, Saf Bakır…"/></label><div>{photoMatches.map((name) => { const icon = materialIconFor(name); return <button type="button" className={photoMaterial === name ? "selected" : ""} onClick={() => setPhotoMaterial(name)} key={name}>{icon ? <Image src={icon.path} alt="" width={34} height={34}/> : <i aria-hidden="true">{name.slice(0, 2)}</i>}<span>{name}</span></button>; })}</div></div>}
        {photoPreview && <div className="photoDraftEditor"><div><strong>{photoMaterial || "Önce bir ikon seç"}</strong><input aria-label="Fotoğraftaki adet" inputMode="numeric" value={photoQuantity} onChange={(event) => setPhotoQuantity(event.target.value.replace(/\D/g, ""))}/><button type="button" disabled={!photoMaterial} onClick={addPhotoDraft}>Taslağa ekle</button></div><ul>{Object.entries(photoDraft).map(([name, amount]) => { const icon = materialIconFor(name); return <li key={name}>{icon && <Image src={icon.path} alt="" width={24} height={24}/>}<span>{name}</span><b>×{amount}</b><button type="button" aria-label={`${name} fotoğraf taslağından çıkar`} onClick={() => setPhotoDraft((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== name)))}>×</button></li>; })}</ul>{photoRecommendation && <aside className="photoRecommendation"><small>TASLAĞA GÖRE EN YAKIN ÜRETİM</small><b>{photoRecommendationItem?.name ?? photoRecommendation.recipe.itemId}</b><span>{photoImpact?.newlyReadyCount ? `${photoImpact.newlyReadyCount} reçete yeni stokla üretilebilir olacak.` : `%${photoRecommendation.completion} tamam · ${photoRecommendation.missing.length} eksik malzeme kalacak.`}</span><a href={`/?module=recipes&kind=${photoRecommendationKind}&recipe=${photoRecommendation.recipe.itemId}#recipes`}>Reçeteyi sitede aç →</a></aside>}{Object.keys(photoDraft).length > 0 && <button type="button" className="confirmPhotoDraft" onClick={confirmPhotoDraft}>Taslağı onayla ve stoka işle</button>}</div>}
      </section>
    </div>

    <section className="productionTalismanGoals">
      <header><span><small>TILSIM ÜRETİM HEDEFLERİ</small><h3>Reçetelerden seçilenler</h3></span><b>{talismanGoalRows.length} hedef</b></header>
      <p>Favoriye aldığın tılsımlar stok hesabında öncelik kazanır; eksik malzeme ve en yakın üretim otomatik hesaplanır.</p>
      <div>{talismanGoalRows.map((row) => {
        if (!row) return null;
        const plan = planByItemId.get(row.id);
        return <article key={row.id}><span><small>{row.class} · {row.color} · {row.tier === null ? "Özel" : `${row.tier}. kademe`}</small><b>{row.name}</b></span><em>{plan ? plan.status === "ready" ? "Üretilebilir" : `%${plan.completion} tamam · ${plan.missing.length} eksik` : "Kaynakta reçete yok"}</em><button type="button" aria-label={`${row.name} tılsım hedefini kaldır`} onClick={() => setTalismanGoals((current) => current.filter((id) => id !== row.id))}>×</button></article>;
      })}{talismanGoalRows.length === 0 && <span className="emptyTalismanGoals">Reçeteler kataloğunda bir tılsımı yıldızlayarak hedef ekleyebilirsin.</span>}</div>
      <Link href="/?module=recipes&kind=talisman#recipes">Tılsım reçetelerini aç →</Link>
    </section>

    <section className="productionTalismanGoals">
      <header><span><small>İKSİR ÜRETİM HEDEFLERİ</small><h3>Favoriye alınan iksirler</h3></span><b>{potionGoalRows.length} hedef</b></header>
      <p>Favori iksirler stok hesabında tılsım ve eşyalardan ayrı kaybolmaz; hedef adet, eksik malzeme ve en yakın üretim birlikte hesaplanır.</p>
      <div>{potionGoalRows.map((row) => {
        if (!row) return null;
        const plan = planByItemId.get(row.itemId);
        return <article key={row.itemId}><span><small>Sv. {row.level} · {row.category}</small><b>{row.name}</b></span><em>{plan ? plan.status === "ready" ? "Üretilebilir" : `%${plan.completion} tamam · ${plan.missing.length} eksik` : "Kaynakta reçete yok"}</em><button type="button" aria-label={`${row.name} iksir hedefini kaldır`} onClick={() => setPotionGoals((current) => current.filter((id) => id !== row.itemId))}>×</button></article>;
      })}{potionGoalRows.length === 0 && <span className="emptyTalismanGoals">Reçeteler kataloğunda bir iksiri yıldızlayarak hedef ekleyebilirsin.</span>}</div>
      <Link href="/?module=recipes&kind=potion#recipes">İksir reçetelerini aç →</Link>
    </section>

    <section className="productionAdvice">
      <div><small>SIRADAKİ EN YAKIN HEDEF</small><b>{closestPlan ? itemById.get(closestPlan.recipe.itemId)?.name ?? closestPlan.recipe.itemId : summary.ready ? "Seçili reçeteler üretime hazır" : "Stok girdikçe öneri oluşacak"}</b><span>{closestPlan ? `%${closestPlan.completion} tamam · ${closestPlan.missing.length} eksik malzeme` : "Favoriler varsa önce onlar değerlendirilir."}</span></div>
      <div><small>SONRAKİ ADIM</small><b>{routePriority ? `${routePriority} öncelikli` : "Önce favori reçete seç"}</b><span>{routePriority ? "Favori hedeflerdeki kaynaklı eksikler bu rota veya üretim tezgâhında yoğunlaşıyor." : "Öneri yalnız kaynak eşleşmesi olan favori eksiklerden çıkar."}</span></div>
      <div><small>DOĞRULAMA KURALI</small><b>Tahmin yok</b><span>Kaynağı bilinmeyen malzeme açıkça işaretlenir; oyuncu bilgisi kaynaklı kayıttan ayrılır.</span></div>
    </section>

    <div className="productionToolbar"><div>{(["Tümü", "Üretilebilir", "Yakın", "Favoriler"] as PlanFilter[]).map((name) => <button type="button" className={filter === name ? "on" : ""} onClick={() => { setFilter(name); setVisibleLimit(12); }} key={name}>{name}</button>)}</div><input aria-label="Reçete veya malzeme ara" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleLimit(12); }} placeholder="Reçete veya malzeme ara…"/><span>{visibleRows.length}/{visible.length} reçete</span></div>

    <div className="productionCards">{visibleRows.map((plan) => {
      const item = itemById.get(plan.recipe.itemId);
      const favorite = favoriteIds.includes(plan.recipe.itemId);
      const recipeKind = talismanIds.has(plan.recipe.itemId) ? "talisman" : potionIds.has(plan.recipe.itemId) ? "potion" : "item";
      return <article className={`productionCard ${plan.status}`} key={plan.recipe.id}>
        <header><button type="button" className={favorite ? "favorite on" : "favorite"} aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"} onClick={() => togglePlanFavorite(plan.recipe.itemId)}>{favorite ? "★" : "☆"}</button><span><small>{item?.class ?? "Sınıf bekliyor"} · {item?.slot ?? "Yuva bekliyor"}</small><h3>{item?.name ?? plan.recipe.itemId}</h3></span><b className={`planStatus ${plan.status}`}>{plan.status === "ready" ? "Üretilebilir" : plan.status === "near" ? "Yakın" : "Eksik"}</b></header>
        <div className="planControls"><label><span>Hedef</span><input aria-label={`${item?.name ?? plan.recipe.itemId} hedef adedi`} inputMode="numeric" min="1" value={plan.target} onChange={(event) => setTargets((current) => ({ ...current, [plan.recipe.itemId]: Math.max(1, Number(event.target.value) || 1) }))}/></label><label><span>Üretecek kişi</span><input value={owners[plan.recipe.itemId] ?? ""} onChange={(event) => setOwners((current) => ({ ...current, [plan.recipe.itemId]: event.target.value }))} placeholder="İsim / ekip…"/></label><span><small>Stoktan çıkabilecek</small><b>{plan.craftableCount} adet</b></span></div>
        <div className="planProgress"><span><b style={{ width: `${plan.completion}%` }}/></span><em>%{plan.completion}</em></div>
        <div className="materialChecklist">{plan.materials.map((row) => {
          const origin = sourceText(row.name);
          const icon = materialIconFor(row.name);
          return <details className={row.missing ? "missing" : "covered"} key={row.name}><summary>{icon ? <Image src={icon.path} alt="" width={30} height={30}/> : <i>{row.missing ? "−" : "✓"}</i>}<span><b>{row.name}</b><small>{fmt(row.owned)} / {fmt(row.required)} elde</small></span><strong>{row.missing ? `${fmt(row.missing)} eksik` : "tamam"}</strong></summary>{row.missing > 0 && <p className={origin.known ? "known" : "unknown"}><b>{origin.label}</b><span>{origin.detail}</span></p>}</details>;
        })}</div>
        <footer><span>{owners[plan.recipe.itemId] ? `Sorumlu: ${owners[plan.recipe.itemId]}` : "Sorumlu atanmadı"}</span><a href={`/?module=recipes&kind=${recipeKind}&recipe=${plan.recipe.itemId}#recipes`}>Reçeteyi sitede aç →</a></footer>
      </article>;
    })}{visible.length === 0 && <div className="productionEmpty">Bu filtrede reçete yok. Stok, arama veya favori seçimini değiştir.</div>}{visibleRows.length < visible.length && <button className="productionMore" type="button" onClick={() => setVisibleLimit((value) => value + 12)}>12 reçete daha göster <span>{visible.length - visibleRows.length} kaldı</span></button>}</div>
  </section>;
}
