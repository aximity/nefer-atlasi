"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { sourceFor, talismans, type CharacterClass, type Talisman } from "../lib/catalog";
import { previousTierFor, talismanProduction, tierRuleFor, vendorMentionsFor } from "../lib/talisman-production";

type TierFilter = "Tümü" | "I" | "II" | "III" | "Özel";
type ColorFilter = "Tümü" | "Kırmızı" | "Mavi";
const favoriteKey = "nefer-talisman-production-favorites-v1";
const normalize = (value: string) => value.toLocaleLowerCase("tr-TR").trim();
const readFavorites = () => {
  try {
    const value = localStorage.getItem(favoriteKey);
    return value ? JSON.parse(value) as string[] : [];
  } catch {
    return [];
  }
};

export default function TalismanProductionAtlas({ klass }: { klass: CharacterClass }) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<TierFilter>("Tümü");
  const [color, setColor] = useState<ColorFilter>("Tümü");
  const [selectedId, setSelectedId] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setFavorites(readFavorites());
      setHydrated(true);
    });
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(favoriteKey, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const classRows = useMemo(() => talismans.filter((row) => row.class === klass), [klass]);
  const visible = useMemo(() => {
    const needle = normalize(query);
    return classRows.filter((row) => {
      const tierLabel = row.tier === null ? "Özel" : ["", "I", "II", "III"][row.tier];
      return (!needle || normalize(`${row.name} ${row.series} ${row.color}`).includes(needle))
        && (color === "Tümü" || row.color === color)
        && (tier === "Tümü" || tierLabel === tier);
    });
  }, [classRows, color, query, tier]);
  const selected = classRows.find((row) => row.id === selectedId) ?? visible[0] ?? classRows[0];
  const rule = selected ? tierRuleFor(selected) : null;
  const previous = selected ? previousTierFor(selected, talismans) : null;
  const vendorMentions = selected ? vendorMentionsFor(selected) : [];
  const favorite = selected ? favorites.includes(selected.id) : false;
  const vendor = talismanProduction.vendors[0];
  const vendorSource = sourceFor(vendor.sourceId);

  const toggleFavorite = (row: Talisman) => setFavorites((current) =>
    current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id],
  );

  return <section className="talismanProduction" aria-labelledby="talisman-production-title">
    <header className="talismanProductionHead">
      <div><small>M35 · TILSIM ÜRETİM ATLASI</small><h3 id="talisman-production-title">Reçeteden hedefe, bilineni bilinmeyenden ayır.</h3><p>Tılsımı seç; edinme kademesini, önceki tılsım gereksinimini, doğrulanmış satıcı bilgisini ve reçete kapsamını tek yerde gör.</p></div>
      <div className="talismanProductionStats"><span><b>{talismans.length}</b><small>tılsım</small></span><span><b>{vendor.namedOffers.length}</b><small>adı doğrulanan satış</small></span><span className="pending"><b>0</b><small>tam malzeme reçetesi</small></span></div>
    </header>

    <div className="talismanFlow" aria-label="Tılsım edinme akışı">
      <article><i>1</i><span><b>I. kademeyi edin</b><small>Büyük Hol düşümü; adı doğrulanan iki satış ayrıca işaretlenir.</small></span></article>
      <article><i>2</i><span><b>Reçeteyi bul</b><small>II–III ve özel tılsımlar reçete ister. Reçetenin satıcısı henüz kesinleştirilmedi.</small></span></article>
      <article><i>3</i><span><b>Malzemeyi doğrula</b><small>Kesin miktarlar kaynaklanmadan stok hesabına veya üretilebilir sonucuna girmez.</small></span></article>
    </div>

    <div className="talismanAtlasGrid">
      <section className="talismanPicker">
        <header><span><small>HEDEF SEÇİMİ</small><h4>{klass}</h4></span><b>{visible.length} kayıt</b></header>
        <input aria-label="Tılsım üretim atlasında ara" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tılsım veya seri ara…" />
        <div className="talismanFilters">
          <div>{(["Tümü", "Kırmızı", "Mavi"] as ColorFilter[]).map((value) => <button type="button" className={color === value ? "on" : ""} onClick={() => setColor(value)} key={value}>{value}</button>)}</div>
          <div>{(["Tümü", "I", "II", "III", "Özel"] as TierFilter[]).map((value) => <button type="button" className={tier === value ? "on" : ""} onClick={() => setTier(value)} key={value}>{value}</button>)}</div>
        </div>
        <select aria-label="Üretim hedefi tılsım" value={selected?.id ?? ""} onChange={(event) => setSelectedId(event.target.value)}>
          {visible.map((row) => <option value={row.id} key={row.id}>{favorites.includes(row.id) ? "★ " : ""}{row.name} · {row.color}</option>)}
        </select>
        {visible.length === 0 && <p className="talismanEmpty">Bu filtrede tılsım yok.</p>}
        <div className="talismanFavoriteSummary"><b>{favorites.length} üretim hedefi</b><span>Bu cihazda saklanır; doğrulanmamış malzemeler eksik hesabına katılmaz.</span></div>
      </section>

      {selected && rule && <section className="talismanRecipeCard">
        <header><button type="button" className={favorite ? "favorite on" : "favorite"} onClick={() => toggleFavorite(selected)} aria-label={favorite ? "Üretim hedeflerinden çıkar" : "Üretim hedeflerine ekle"}>{favorite ? "★" : "☆"}</button><span><small>{selected.class} · {selected.color} · {rule.label}</small><h4>{selected.name}</h4></span><b className={rule.recipeRequired ? "recipe" : "drop"}>{rule.acquisition}</b></header>
        <div className="talismanRecipeSteps">
          <article className="known"><small>ÖN KOŞUL</small><b>{previous ? previous.name : selected.tier === 1 ? "Önceki kademe yok" : "Kaynak bekliyor"}</b><span>{previous ? "Aynı sınıf, seri ve renkte bir önceki kademe." : selected.tier === 1 ? "Doğrudan edinim aşaması." : "Özel tılsım koşulu doğrulanmadı."}</span></article>
          <article className={vendorMentions.length ? "known" : "pending"}><small>NPC / SATIŞ</small><b>{vendorMentions.length ? `${vendor.name} duyurusunda aynı ad var` : "Doğrulama bekliyor"}</b><span>{vendorMentions.length ? "Kaynak sınıf varyantını ayırmadığı için eşleşme ad düzeyindedir." : "Kesin NPC ataması yapılmadı."}</span></article>
          <article className="pending"><small>MALZEMELER</small><b>Tam reçete bekliyor</b><span>Adet ve kaynak kanıtı olmadan tahmin gösterilmez.</span></article>
        </div>
        <p className="talismanRuleNote">{rule.note}</p>
        <footer><button type="button" onClick={() => toggleFavorite(selected)}>{favorite ? "Üretim hedefinden çıkar" : "Üretim hedeflerine ekle"}</button><Link href="/farm-operasyonu#production-planner">Üretim Takibi’ni aç →</Link></footer>
      </section>}
    </div>

    <aside className="talismanVendorCard">
      <span><small>DOĞRULANMIŞ NPC KAYDI</small><b>{vendor.name} · {vendor.kind}</b><em>{vendor.region} · {vendor.role}</em></span>
      <p><strong>İsimle geçenler:</strong> {vendor.namedOffers.join(" ve ")}. {vendor.scopeNote}</p>
      {vendorSource && <a href={vendorSource.url} target="_blank" rel="noreferrer">Resmî duyuruyu aç ↗</a>}
    </aside>
  </section>;
}
