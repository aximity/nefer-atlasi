"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { sourceFor, talismans, type CharacterClass, type Talisman } from "../lib/catalog";
import { playerReportsFor, previousTierFor, talismanProduction, tierRuleFor, vendorMentionsFor } from "../lib/talisman-production";

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

export default function TalismanProductionAtlas({ klass, initialTalismanId = "" }: { klass: CharacterClass; initialTalismanId?: string }) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<TierFilter>("Tümü");
  const [color, setColor] = useState<ColorFilter>("Tümü");
  const [selectedId, setSelectedId] = useState(initialTalismanId);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setFavorites(readFavorites());
      setHydrated(true);
    });
  }, []);
  useEffect(() => {
    if (initialTalismanId) queueMicrotask(() => setSelectedId(initialTalismanId));
  }, [initialTalismanId]);
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
  const playerReport = selected ? playerReportsFor(selected)[0] : undefined;
  const favorite = selected ? favorites.includes(selected.id) : false;
  const vendor = talismanProduction.vendors[0];
  const vendorSource = sourceFor(vendor.sourceId);
  const serverReference = talismanProduction.serverReferences[0];
  const serverReferenceSource = sourceFor(serverReference.sourceId);
  const effectSource = selected ? sourceFor(selected.sourceId) : null;

  const toggleFavorite = (row: Talisman) => setFavorites((current) =>
    current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id],
  );

  return <section className="talismanProduction" aria-labelledby="talisman-production-title">
    <header className="talismanProductionHead">
      <div><small>SADE TILSIM ATLASI</small><h3 id="talisman-production-title">Tılsımını seç, gerekeni gör.</h3><p>Kullanım amacı, edinme yolu ve üretim reçetesi. Hepsi bu.</p></div>
    </header>

    <div className="talismanAtlasGrid">
      <section className="talismanPicker">
        <header><span><small>TILSIM SEÇ</small><h4>{klass}</h4></span><b>{visible.length} kayıt</b></header>
        <input aria-label="Tılsım ara" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tılsım adı ara…" />
        <div className="talismanFilters">
          <div>{(["Tümü", "Kırmızı", "Mavi"] as ColorFilter[]).map((value) => <button type="button" className={color === value ? "on" : ""} onClick={() => setColor(value)} key={value}>{value}</button>)}</div>
          <div>{(["Tümü", "I", "II", "III", "Özel"] as TierFilter[]).map((value) => <button type="button" className={tier === value ? "on" : ""} onClick={() => setTier(value)} key={value}>{value}</button>)}</div>
        </div>
        <select aria-label="Tılsım seç" value={selected?.id ?? ""} onChange={(event) => setSelectedId(event.target.value)}>
          {visible.map((row) => <option value={row.id} key={row.id}>{favorites.includes(row.id) ? "★ " : ""}{row.name} · {row.color}</option>)}
        </select>
        {visible.length === 0 && <p className="talismanEmpty">Bu filtrede tılsım yok.</p>}
      </section>

      {selected && rule && <section className="talismanRecipeCard">
        <header><button type="button" className={favorite ? "favorite on" : "favorite"} onClick={() => toggleFavorite(selected)} aria-label={favorite ? "Üretim hedeflerinden çıkar" : "Üretim hedeflerine ekle"}>{favorite ? "★" : "☆"}</button><span><small>{selected.class} · {selected.color} · {rule.label}</small><h4>{selected.name}</h4></span></header>

        <div className="talismanFacts">
          <article><small>NEDİR?</small><b>Tılsım</b><p>Karaktere takılarak belirli bir oyun etkisini güçlendiren özel eşyadır.</p></article>
          <article><small>NE İŞE YARAR?</small><b>{selected.series}</b><p>{selected.effectText}</p>{effectSource && <a href={effectSource.url} target="_blank" rel="noreferrer">Etki kaynağı ↗</a>}</article>
          <article>
            <small>NEREDEN ELDE EDİLİR?</small>
            <b>{playerReport ? `${playerReport.npc} · ${playerReport.priceLabel}` : rule.acquisition}</b>
            <span className="verificationFlag pending">DOĞRULAMA GEREKİYOR</span>
            <p>{playerReport ? `${playerReport.claim} Bu KÖ oyuncu bildirimi henüz oyun içi görüntü veya bağımsız ikinci kaynakla doğrulanmadı.` : rule.note}</p>
            {serverReferenceSource && <a href={serverReferenceSource.url} target="_blank" rel="noreferrer">KÖ sistem kaynağı ↗</a>}
            {vendorMentions.length > 0 && vendorSource && <a href={vendorSource.url} target="_blank" rel="noreferrer">Normal İKV karşılaştırması ↗</a>}
          </article>
          <article className="recipeContent">
            <small>REÇETE İÇERİĞİ</small>
            <b>{previous ? `Normal İKV referansı: ${previous.name}` : "Malzeme ve adetler doğrulanıyor"}</b>
            <span className="verificationFlag pending">KÖ TEYİDİ BEKLİYOR</span>
            <p>{previous ? "Bu kademe zinciri normal İKV kaynağından gelir. KÖ reçetesindeki malzemeler, adetler ve reçetenin Gönül'den mi yoksa Hol'den mi edinildiği kesinleşmeden yayımlanmayacak." : "KÖ için reçete gerekip gerekmediği, gereken malzemeler ve adetler henüz çapraz doğrulanmadı."}</p>
          </article>
        </div>

        <footer><button type="button" onClick={() => toggleFavorite(selected)}>{favorite ? "Üretim hedefinden çıkar" : "Üretim hedeflerine ekle"}</button><Link href="/farm-operasyonu#production-planner">Üretim Takibi →</Link></footer>
      </section>}
    </div>
  </section>;
}
