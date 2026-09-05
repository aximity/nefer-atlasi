"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { sourceFor, talismans, type CharacterClass } from "../lib/catalog";
import { playerReportsFor, talismanProduction, tierRuleFor, vendorMentionsFor } from "../lib/talisman-production";
import { talismanRecipeFor } from "../lib/talisman-recipes";
import { talismanIconFor } from "../lib/talisman-icons";
import { talismanVisualFamilyFor } from "../lib/visual-families";
import { useCharacter } from "./character-context";

type TierFilter = "Tümü" | "I" | "II" | "III" | "Özel";
type ColorFilter = "Tümü" | "Kırmızı" | "Mavi";
const normalize = (value: string) => value.toLocaleLowerCase("tr-TR").trim();

export default function TalismanProductionAtlas() {
  const { klass, talismanId, setClass, setTalismanId } = useCharacter();
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<TierFilter>("Tümü");
  const [color, setColor] = useState<ColorFilter>("Tümü");

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
  const selected = visible.find((row) => row.id === talismanId) ?? visible[0];
  const rule = selected ? tierRuleFor(selected) : null;
  const vendorMentions = selected ? vendorMentionsFor(selected) : [];
  const playerReport = selected ? playerReportsFor(selected)[0] : undefined;
  const vendor = talismanProduction.vendors[0];
  const vendorSource = sourceFor(vendor.sourceId);
  const serverReference = talismanProduction.serverReferences[0];
  const serverReferenceSource = sourceFor(serverReference.sourceId);
  const effectSource = selected ? sourceFor(selected.sourceId) : null;
  const recipe = selected ? talismanRecipeFor(selected.id) : null;
  const visualFamily = selected ? talismanVisualFamilyFor(selected) : null;
  const talismanIcon = selected ? talismanIconFor(selected) : null;
  const normalIkvAcquisition = vendorMentions.length > 0
    ? `Gönül · Büyük Hol. ${vendorMentions[0].scopeNote}`
    : selected?.tier === 1
      ? "Bazı I. kademe tılsımlar düşer, bazıları oyun parasıyla alınır; bu adın kesin kaynağı yayımlanmamış."
      : rule?.note ?? "";
  const chooseClass = (value: CharacterClass) => {
    setClass(value);
    const url = new URL(location.href);
    url.searchParams.delete("talisman");
    history.replaceState(null, "", url);
  };
  const chooseTalisman = (value: string) => {
    setTalismanId(value);
    const url = new URL(location.href);
    url.searchParams.set("talisman", value);
    history.replaceState(null, "", url);
  };

  return <section className="talismanProduction" aria-labelledby="talisman-production-title">
    <header className="talismanProductionHead">
      <div><small>TILSIM ATLASI</small><h3 id="talisman-production-title">Tılsımını seç.</h3><p>Bu ekranda yalnız etki ve edinme bilgisi var. Reçete ayrıntısı ayrı katalogda açılır.</p></div>
    </header>

    <div className="talismanAtlasGrid">
      <section className="talismanPicker">
        <header><span><small>TILSIM SEÇ</small><h4>{klass}</h4></span><b>{visible.length} kayıt</b></header>
        <div className="talismanClassFilter" aria-label="Tılsım sınıfı">{(["Savaşçı", "Büyücü", "Şifacı"] as CharacterClass[]).map((value) => <button type="button" className={klass === value ? "on" : ""} onClick={() => chooseClass(value)} key={value}>{value}</button>)}</div>
        <input aria-label="Tılsım ara" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tılsım adı ara…" />
        <details className="talismanFilterDisclosure"><summary>Renk ve kademe filtreleri <i>+</i></summary><div className="talismanFilters">
          <div>{(["Tümü", "Kırmızı", "Mavi"] as ColorFilter[]).map((value) => <button type="button" className={color === value ? "on" : ""} onClick={() => setColor(value)} key={value}>{value}</button>)}</div>
          <div>{(["Tümü", "I", "II", "III", "Özel"] as TierFilter[]).map((value) => <button type="button" className={tier === value ? "on" : ""} onClick={() => setTier(value)} key={value}>{value}</button>)}</div>
        </div></details>
        {visible.length > 0 && <select aria-label="Tılsım seç" value={selected?.id ?? ""} onChange={(event) => chooseTalisman(event.target.value)}>
          {visible.map((row) => <option value={row.id} key={row.id}>{row.name} · {row.color}</option>)}
        </select>}
        {visible.length === 0 && <p className="talismanEmpty">Bu filtrede tılsım yok.</p>}
      </section>

      {selected && rule && visualFamily && <section className="talismanRecipeCard">
        <header><span><small>{selected.class} · {selected.color} · {rule.label}</small><h4>{selected.name}</h4></span></header>

        <div className={`talismanVisualRule ${selected.color === "Kırmızı" ? "red" : "blue"}`}>
          {talismanIcon && <Image unoptimized src={talismanIcon.src} alt="" width={32} height={32} />}
          <span><small>ORTAK TILSIM GÖRÜNÜŞÜ</small><b>{visualFamily.label}</b></span>
          <p>Bu sınıf ve renk için doğrulanan oyun ikonu kullanılır; kademe ve etki seçili tılsıma aittir.</p>
        </div>

        <div className="talismanFacts">
          <article><small>ETKİ</small><b>{selected.series}</b><p>{selected.effectText}</p></article>
          <article>
            <small>ELDE ETME</small>
            <b>{playerReport ? `KÖ bildirimi · ${playerReport.npc} · ${playerReport.priceLabel}` : vendorMentions.length > 0 ? "Normal İKV · Gönül · Büyük Hol" : rule.acquisition}</b>
            <p>{playerReport ? "Oyuncu bildirimi; açık dükkân görüntüsüyle doğrulama bekliyor. Normal İKV kaydı aşağıda ayrı gösterilir." : normalIkvAcquisition}</p>
          </article>
        </div>

        <details className="talismanEvidence"><summary>Kaynak ve doğrulama ayrıntısı <i>+</i></summary><div>
          <p><b>Normal İKV:</b> {normalIkvAcquisition}</p>
          <p><b>Kıyametin Öncüleri:</b> {playerReport ? `${playerReport.claim} Bu bildirim henüz açık oyun içi görüntüyle doğrulanmadı.` : "Bu tılsım için adlandırılmış NPC veya drop kaydı henüz doğrulanmadı."}</p>
          {(effectSource || serverReferenceSource || (vendorMentions.length > 0 && vendorSource)) && <a href="/kaynaklar#tilsimlar">Tılsım kaynaklarını kategori içinde gör →</a>}
        </div></details>

        <footer><a className="primaryRecipeLink" href={recipe ? `/?module=recipes&kind=talisman&recipe=${selected.id}#recipes` : "/?module=recipes&kind=talisman#recipes"}>{recipe ? "Bu tılsımın reçetesini aç" : "Tılsım reçetelerine git"} →</a></footer>
      </section>}
    </div>
  </section>;
}
