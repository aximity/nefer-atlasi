"use client";
import EndgameLab from "./EndgameLab";
import MiningGuide from "./MiningGuide";
import SkillGuides from "./SkillGuides";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  classSlots,
  contexts,
  images,
  items,
  publishableItems,
  talismans,
  itemStats,
  publishableStats,
  itemRecipe,
  itemEvidence,
  sourceFor,
  statusLabel,
  type Item,
  type CharacterClass,
} from "../lib/catalog";
import {
  applyTalisman,
  buildTotals,
  compatibleItems,
  goalsByClass,
  scoreBuild,
  suggestedSelection,
  type BuildSelection,
  type Goal,
} from "../lib/planner";
import {
  decodeBuild,
  encodeBuild,
  sanitizeBuild,
} from "../lib/build-codec.mjs";
import AbilitySimulator from "./ability-simulator";
const classes: CharacterClass[] = ["Savaşçı", "Büyücü", "Şifacı"],
  fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n),
  familyNames: Record<string, string> = {
    "bicak-sirti": "Bıçak Sırtı",
    "tas-kanat": "Taş Kanat",
    "hidra-nefesi": "Hidra Nefesi",
    kiyamet: "Kıyamet",
    "sifir-kelvin": "Sıfır Kelvin",
    transformator: "Transformatör",
    cehennem: "Cehennem",
    "ruh-doven": "Ruh Döven",
    mevlana: "Mevlana",
    hidroflorik: "Hidroflorik",
    siyanur: "Siyanür",
  };
type AbilityKey = "main" | "support" | "defense";
const moduleTabs = [
  { id: "builder", label: "Build" },
  { id: "engine", label: "Tılsım" },
  { id: "group-regions", label: "Bölgeler" },
  { id: "items", label: "Eşyalar" },
  { id: "endgame", label: "Endgame" },
  { id: "mining", label: "Maden" },
  { id: "skills", label: "Yetenek" },
] as const;
type MainModule = (typeof moduleTabs)[number]["id"];
interface BuildSnapshot {
  v: number;
  klass: CharacterClass;
  primary: Goal;
  secondary: Goal | null;
  selection: BuildSelection;
  mode: string;
  regionId: string;
  rival: CharacterClass | "Rakip yok";
  talismanId: string;
  wrathBase: boolean;
  wrathCriticalBase: number;
  abilities: Record<AbilityKey, number>;
}
const emptyAbilities: Record<AbilityKey, number> = {
    main: 0,
    support: 0,
    defense: 0,
  },
  modes = ["Grup Bölgesi", "PvE", "PvP", "Farm"],
  buildRules = {
    classes,
    goalsByClass,
    classSlots,
    itemById: Object.fromEntries(items.map((item) => [item.id, item])),
    modes,
    contextIds: contexts.map((x) => x.id),
    rivals: ["Rakip yok", ...classes],
    talismanById: Object.fromEntries(talismans.map((x) => [x.id, x])),
  };
export default function Home() {
  const [klass, setKlass] = useState<CharacterClass>("Büyücü"),
    [primary, setPrimary] = useState<Goal>("Buz"),
    [secondary, setSecondary] = useState<Goal | null>("Kritik"),
    [selection, setSelection] = useState<BuildSelection>(() =>
      suggestedSelection("Büyücü", "Buz", "Kritik"),
    );
  const [mode, setMode] = useState("Grup Bölgesi"),
    [regionId, setRegionId] = useState("cemberlitas"),
    [rival, setRival] = useState<CharacterClass | "Rakip yok">("Rakip yok"),
    [talismanId, setTalismanId] = useState(""),
    [wrathBase, setWrathBase] = useState(false),
    [wrathCriticalBase, setWrathCriticalBase] = useState(0),
    [abilities, setAbilities] = useState(emptyAbilities),
    [query, setQuery] = useState(""),
    [classFilter, setClassFilter] = useState("Tümü"),
    [slotFilter, setSlotFilter] = useState("Tümü"),
    [compareIds, setCompareIds] = useState<string[]>([]),
    [detail, setDetail] = useState<Item | null>(null),
    [activeModule, setActiveModule] = useState<MainModule>("builder"),
    [notice, setNotice] = useState("");
  const applySaved = (p: BuildSnapshot) => {
    setKlass(p.klass);
    setPrimary(p.primary);
    setSecondary(p.secondary);
    setSelection(p.selection);
    setMode(p.mode);
    setRegionId(p.regionId);
    setRival(p.rival);
    setTalismanId(p.talismanId);
    setWrathBase(p.wrathBase);
    setWrathCriticalBase(p.wrathCriticalBase);
    setAbilities(p.abilities);
  };
  useEffect(() => {
    const hydrate = () => {
      const saved = new URLSearchParams(location.search).get("build");
      if (!saved) return;
      try {
        const p = sanitizeBuild(
          decodeBuild(saved),
          buildRules,
        ) as BuildSnapshot | null;
        if (!p) throw new Error();
        applySaved(p);
      } catch {
        setNotice("Bağlantıdaki donanım planı geçersiz veya eski sürüm.");
      }
    };
    queueMicrotask(hydrate);
  }, []);
  const baseTotals = useMemo(
      () => buildTotals(selection),
      [selection],
    ) as Record<string, number>,
    classTalismans = talismans.filter((t) => t.class === klass),
    tal = classTalismans.find((t) => t.id === talismanId),
    totals = applyTalisman(
      baseTotals,
      tal ?? null,
      wrathBase,
      wrathCriticalBase,
    ),
    score = scoreBuild(selection, primary, secondary),
    payload = {
      klass,
      primary,
      secondary,
      selection,
      mode,
      regionId,
      rival,
      talismanId,
      wrathBase,
      wrathCriticalBase,
      abilities,
    };
  const setClass = (next: CharacterClass) => {
      const p = goalsByClass[next][0],
        s = goalsByClass[next][1] ?? null;
      setKlass(next);
      setPrimary(p);
      setSecondary(s);
      setSelection(suggestedSelection(next, p, s));
      setTalismanId("");
      setWrathBase(false);
      setWrathCriticalBase(0);
    },
    share = async () => {
      try {
        const url = `${location.origin}${location.pathname}?build=${encodeBuild(payload)}`;
        await navigator.clipboard.writeText(url);
        history.replaceState(null, "", url);
        setNotice("Donanım planı bağlantısı kopyalandı.");
      } catch {
        setNotice("Donanım planı bağlantısı kopyalanamadı.");
      }
    },
    save = () => {
      localStorage.setItem("ikv-build", encodeBuild(payload));
      setNotice("Donanım planı bu cihazda kaydedildi.");
    },
    load = () => {
      const raw = localStorage.getItem("ikv-build");
      if (!raw) return setNotice("Bu cihazda kayıtlı donanım planı yok.");
      try {
        const p = sanitizeBuild(
          decodeBuild(raw),
          buildRules,
        ) as BuildSnapshot | null;
        if (!p) throw new Error();
        applySaved(p);
        setNotice("Kayıtlı donanım planı yüklendi.");
      } catch {
        setNotice("Kayıtlı donanım planı geçersiz veya eski sürüm.");
      }
    };
  const filtered = publishableItems.filter(
      (i) =>
        (!query ||
          `${i.name} ${i.class} ${i.slot}`
            .toLocaleLowerCase("tr-TR")
            .includes(query.toLocaleLowerCase("tr-TR"))) &&
        (classFilter === "Tümü" || i.class === classFilter) &&
        (slotFilter === "Tümü" || i.slot === slotFilter),
    ),
    compareItems = compareIds
      .map((id) => items.find((i) => i.id === id))
      .filter((item): item is Item => Boolean(item)),
    missingSlots = classSlots[klass].filter((slot) => !selection[slot]),
    toggleCompare = (item: Item) => {
      if (compareIds.includes(item.id))
        return setCompareIds(compareIds.filter((id) => id !== item.id));
      const first = compareItems[0];
      if (first && (first.class !== item.class || first.slot !== item.slot))
        return setNotice(
          `Karşılaştırma için aynı sınıf ve yuvadan eşya seç: ${first.class} · ${first.slot}.`,
        );
      setCompareIds([...compareIds.slice(-1), item.id]);
    };
  return (
    <main>
      <header>
        <a href="#top">
          <b>İKV</b> EŞYA ARŞİVİ
        </a>
        <nav className="top-status" aria-label="Açık modül">
          <span>{moduleTabs.find((item) => item.id === activeModule)?.label}</span>
          <i>M5</i>
        </nav>
      </header>
      <section className="hero" id="top">
        <div>
          <p className="eyebrow">KANITLI DONANIM PLANLAYICI</p>
          <h1>
            Kur. Karşılaştır.
            <br />
            <em>Karşılaşmaya hazırlan.</em>
          </h1>
          <p>
            Her yuvayı bağımsız seç; hedef puanını, tılsım etkisini ve
            grup bölgelerindeki ganimetleri aynı doğrulama zincirinde gör.
          </p>
        </div>
        <aside>
          <small>GENİŞLEYEN İKV KATALOĞU</small>
          <strong>{publishableItems.length}</strong>
          <span>kaynaklı eşya kaydı</span>
          <p>
            Çemberlitaş setleri · Sığınak ve Migrat takıları · sınıfa özel
            yuvalar
          </p>
        </aside>
      </section>
      <nav className="moduleTabs" id="modules" role="tablist" aria-label="Rehber modülleri">
        {moduleTabs.map((item, index) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeModule === item.id}
            className={activeModule === item.id ? "active" : ""}
            onClick={() => setActiveModule(item.id)}
          >
            <small>{String(index + 1).padStart(2, "0")}</small>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      {activeModule === "builder" && <section className="builder" id="builder">
        <Title eyebrow="M2 · DONANIM PLANLAYICI" title="Sekiz yuvayı sen doldur">
          <div className="actions">
            <button
              onClick={() =>
                setSelection(suggestedSelection(klass, primary, secondary))
              }
            >
              Hedefe göre öner
            </button>
            <button onClick={share}>Bağlantıyı kopyala</button>
            <button onClick={save}>Kaydet</button>
            <button onClick={load}>Yükle</button>
          </div>
        </Title>
        <div className="builderbox">
          <div className="controls">
            <Field name="01 · Sınıf">
              {classes.map((x) => (
                <button
                  className={klass === x ? "on" : ""}
                  onClick={() => setClass(x)}
                  key={x}
                >
                  {x}
                </button>
              ))}
            </Field>
            <Field name="02 · Ana hedef">
              {goalsByClass[klass].map((x) => (
                <button
                  className={primary === x ? "on" : ""}
                  onClick={() => {
                    setPrimary(x);
                    if (secondary === x) setSecondary(null);
                  }}
                  key={x}
                >
                  {x}
                </button>
              ))}
            </Field>
            <Field name="03 · İkincil hedef">
              <select
                aria-label="İkincil hedef"
                value={secondary ?? ""}
                onChange={(e) =>
                  setSecondary((e.target.value || null) as Goal | null)
                }
              >
                <option value="">Yok</option>
                {goalsByClass[klass]
                  .filter((x) => x !== primary)
                  .map((x) => (
                    <option key={x}>{x}</option>
                  ))}
              </select>
            </Field>
            <p className="data-note">
              Puanlama yalnız kanıtlı özellik adlarının hedeflerle eşleşmesini
              ölçer; en iyi seçim veya başarı garantisi değildir.
            </p>
            {notice && <p className="notice">{notice}</p>}
          </div>
          <div className="board">
            <div className="summary">
              <div>
                <small>SEÇİLİ DONANIM</small>
                <h3>
                  {klass} · {primary}
                  {secondary ? ` + ${secondary}` : ""}
                </h3>
                <p>
                  {Object.values(selection).filter(Boolean).length}/
                  {classSlots[klass].length} dolu yuva · hedef puanı {score}
                </p>
              </div>
              <b>SINIF UYUMLU</b>
            </div>
            <div
              className={`buildAudit ${missingSlots.length ? "warn" : "ready"}`}
            >
              <span>
                {missingSlots.length
                  ? `${missingSlots.length} eksik yuva: ${missingSlots.join(", ")}`
                  : "Donanım planı bütün sınıf yuvalarını dolduruyor."}
              </span>
              {missingSlots.length > 0 && (
                <button
                  onClick={() =>
                    setSelection({
                      ...suggestedSelection(klass, primary, secondary),
                      ...selection,
                    })
                  }
                >
                  Yalnız eksikleri tamamla
                </button>
              )}
            </div>
            <div className="slotEditors">
              {classSlots[klass].map((slot) => (
                <label key={slot}>
                  <span>{slot}</span>
                  <select
                    value={selection[slot] ?? ""}
                    onChange={(e) =>
                      setSelection({
                        ...selection,
                        [slot]: e.target.value || undefined,
                      })
                    }
                  >
                    <option value="">Boş bırak</option>
                    {compatibleItems(klass, slot).map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <Totals totals={totals} />
          </div>
        </div>
      </section>}
      {activeModule === "engine" && <section className="engine" id="engine">
        <Title
          eyebrow="M3 · TILSIM VE YETENEK HESAPLAYICI"
          title="Tılsımı denetle, puan planını kur"
        >
          <span className="count">Sınıfa özgü · 15 puan sınırı</span>
        </Title>
        <div className="engineGrid">
          <article>
            <h3>{klass} tılsımı</h3>
            <select
              aria-label={`${klass} tılsımı`}
              value={talismanId}
              onChange={(e) => {
                setTalismanId(e.target.value);
                setWrathBase(false);
                setWrathCriticalBase(0);
              }}
            >
              <option value="">Tılsım seçilmedi</option>
              {(["Kırmızı", "Mavi"] as const).map((color) => (
                <optgroup label={`${color} tılsımlar`} key={color}>
                  {classTalismans.filter((t) => t.color === color).map((t) => (
                    <option value={t.id} key={t.id}>
                      {t.name}{t.tier === null ? " · Özel" : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {tal?.requiresBase === "Gazap" && (
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={wrathBase}
                  onChange={(e) => setWrathBase(e.target.checked)}
                />{" "}
                Gazap yeteneği aktif
              </label>
            )}
            {tal?.effect === "critical_multiplier" && (
              <label className="criticalBase">
                <span>Gazap yeteneğinden gelen taban kritik</span>
                <input
                  aria-label="Gazap taban kritik ihtimali"
                  type="number"
                  min="0"
                  value={wrathCriticalBase}
                  onChange={(e) =>
                    setWrathCriticalBase(
                      Math.max(0, Number(e.target.value) || 0),
                    )
                  }
                />
              </label>
            )}
            <p className="data-note">
              {classTalismans.length} resmî kayıt · {new Set(classTalismans.map((t) => `${t.series}|${t.color}`)).size} seri · kırmızı ve mavi birlikte.
              Kademesiz olanlar “Özel” etiketiyle ayrılır.
            </p>
          </article>
          <TalismanResult
            tal={tal ?? null}
            base={baseTotals}
            totals={totals}
            baseActive={wrathBase}
            criticalBase={wrathCriticalBase}
          />
        </div>
        <AbilitySimulator key={klass} klass={klass} />
      </section>}
      {activeModule === "group-regions" && <GroupRegions onOpen={setDetail} />}
      {activeModule === "endgame" && <EndgameLab />}
      {activeModule === "mining" && <MiningGuide />}
      {activeModule === "skills" && <SkillGuides />}
      {activeModule === "items" && <section className="catalog" id="items">
        <Title eyebrow="KANITLI EŞYA KATALOĞU" title="Eşya rehberi">
          <div className="catalogTools">
            <input
              aria-label="Eşya ara"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Eşya, sınıf veya yuva…"
            />
            <select
              aria-label="Sınıfa göre filtrele"
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCompareIds([]);
              }}
            >
              <option>Tümü</option>
              {classes.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select
              aria-label="Yuvaya göre filtrele"
              value={slotFilter}
              onChange={(e) => {
                setSlotFilter(e.target.value);
                setCompareIds([]);
              }}
            >
              <option>Tümü</option>
              {[...new Set(publishableItems.map((i) => i.slot))].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
        </Title>
        <p className="resultCount">
          {filtered.length} eşya gösteriliyor · Aynı sınıf ve yuvadan iki eşyayı
          karşılaştırabilirsin.
        </p>
        {compareItems.length > 0 && (
          <ComparePanel items={compareItems} clear={() => setCompareIds([])} />
        )}
        <div className="cards">
          {filtered.map((item) => (
            <ItemCard
              item={item}
              compared={compareIds.includes(item.id)}
              onCompare={toggleCompare}
              onOpen={setDetail}
              key={item.id}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="emptyResult">
            Bu filtrelerle eşleşen kanıtlı eşya yok.
          </p>
        )}
      </section>}
      {detail && <ItemModal item={detail} close={() => setDetail(null)} />}
    </main>
  );
}
function Totals({ totals }: { totals: Record<string, number> }) {
  return (
    <div className="mechanics">
      <article>
        <small>DONANIM TOPLAMI</small>
        {Object.entries(totals).map(([name, value]) => (
          <p key={name}>
            <b>{name}</b>
            {fmt(value)}
          </p>
        ))}
      </article>
      <article>
        <small>HESAP KURALI</small>
        <h4>Çelişkili alanlar toplama girmez</h4>
        <p>
          Her sınıfın tılsımı yalnız kendi doğrulanmış özelliğine uygulanır;
          gerekli yetenek tabanı ve tılsım çarpanı ayrı tutulur. Hedef puanı
          değer büyüklüğü değil, özellik eşleşmesidir.
        </p>
      </article>
    </div>
  );
}
function TalismanResult({
  tal,
  base,
  totals,
  baseActive,
  criticalBase,
}: {
  tal: (typeof talismans)[number] | null;
  base: Record<string, number>;
  totals: Record<string, number>;
  baseActive: boolean;
  criticalBase: number;
}) {
  if (!tal)
    return (
      <article className="effectReport empty">
        <small>ETKİ RAPORU</small>
        <h3>Önce tılsım seç</h3>
        <p>
          Seçtiğinde hangi özelliğin, kaçtan kaça çıktığını burada göreceksin.
        </p>
      </article>
    );
  const source = sourceFor(tal.sourceId);
  let rows: { name: string; before: number; after: number }[] = [];
  if (
    tal.effect === "stat_multiplier" &&
    "targetAttributes" in tal &&
    "outputAttribute" in tal
  ) {
    const before = tal.targetAttributes.reduce(
      (sum, key) => sum + (base[key] ?? 0),
      0,
    );
    rows = [
      {
        name: tal.outputAttribute,
        before,
        after: totals[tal.outputAttribute] ?? before,
      },
    ];
  } else if (tal.effect === "damage_multiplier")
    rows = Object.keys(base)
      .filter((key) => /Asit|Zehir|Maksimum Hasar/.test(key))
      .map((name) => ({
        name,
        before: base[name],
        after: totals[name] ?? base[name],
      }));
  else if (tal.effect === "critical_multiplier")
    rows = [
      {
        name: "Gazap Kritik İhtimali",
        before: criticalBase,
        after: totals["Gazap Kritik İhtimali"] ?? criticalBase,
      },
    ];
  const informational = tal.effect === "informational",
    blocked = Boolean(tal.requiresBase && !baseActive),
    noBase = !informational && (rows.length === 0 || rows.every((row) => row.before === 0));
  return (
    <article
      className={`effectReport ${blocked || noBase ? "blocked" : "active"}`}
    >
      <small>ETKİ RAPORU · {tal.color.toUpperCase()}</small>
      <h3>{tal.name}</h3>
      <p>
        <b>Bağlı yetenek:</b> {tal.series} · <b>Kademe:</b> {tal.tier ?? "Özel"}
      </p>
      <p><b>Resmî etki:</b> {tal.effectText}</p>
      {blocked ? (
        <div className="effectWarning">
          Çalışmıyor: önce {tal.requiresBase} yeteneğini etkinleştir.
        </div>
      ) : informational ? (
        <div className="effectRows">
          <div><span>Etki türü</span><b>Mekanik / koşullu</b></div>
          <p>Bu tılsım sahte bir puan toplamına çevrilmez; resmî mekanik açıklaması esas alınır.</p>
        </div>
      ) : noBase ? (
        <div className="effectWarning">
          Bu donanımda tılsımın etkileyebileceği taban özellik yok.
        </div>
      ) : (
        <div className="effectRows">
          {rows.map((row) => (
            <div key={row.name}>
              <span>{row.name}</span>
              <b>
                {fmt(row.before)} <i>→</i> {fmt(row.after)}
              </b>
            </div>
          ))}
        </div>
      )}
      {source && (
        <a
          className="evidenceLink"
          href={source.url}
          target="_blank"
          rel="noreferrer"
        >
          Resmî etki kaynağını aç ↗
        </a>
      )}
    </article>
  );
}
function GroupRegions({ onOpen }: { onOpen: (item: Item) => void }) {
  const cemberlitasLoot = publishableItems
      .filter(
        (item) =>
          itemRecipe(item.id)?.sourceId === "maxigame-cemberlitas-2015",
      )
      .map((item) => ({
        ...item,
        region: "Çemberlitaş",
        boss: "Gaffar Bey",
        acquisition: itemRecipe(item.id)?.method,
      })),
    loot = [
      ...cemberlitasLoot,
      ...publishableItems.filter((item) => item.region && item.boss),
    ],
    regions = [...new Set(loot.map((item) => item.region as string))],
    [activeRegion, setActiveRegion] = useState(regions[0] ?? ""),
    [activeClass, setActiveClass] = useState("Tümü"),
    visible = loot.filter(
      (item) =>
        item.region === activeRegion &&
        (activeClass === "Tümü" || item.class === activeClass),
    ),
    bosses = [...new Set(visible.map((item) => item.boss as string))];

  return (
    <section className="groupRegions" id="group-regions">
      <Title
        eyebrow="M4 · GRUP BÖLGELERİ GANİMET ARŞİVİ"
        title="Hangi boss ne atıyor?"
      >
        <span className="count">{loot.length} kaynaklı ganimet ve üretim kaydı</span>
      </Title>
      <div className="regionTabs" role="tablist" aria-label="Grup bölgesi seç">
        {regions.map((regionName) => (
          <button
            role="tab"
            aria-selected={activeRegion === regionName}
            className={activeRegion === regionName ? "on" : ""}
            onClick={() => setActiveRegion(regionName)}
            key={regionName}
          >
            <span>{regionName}</span>
            <small>
              {loot.filter((item) => item.region === regionName).length} eşya ·{" "}
              {new Set(loot.filter((item) => item.region === regionName).map((item) => item.boss)).size} boss
            </small>
          </button>
        ))}
      </div>
      <div className="lootClassFilter" aria-label="Sınıfa göre filtrele">
        {["Tümü", ...classes].map((className) => (
          <button
            className={activeClass === className ? "on" : ""}
            onClick={() => setActiveClass(className)}
            key={className}
          >
            {className}
          </button>
        ))}
      </div>
      <div className="bossLootGrid">
        {bosses.map((boss, bossIndex) => {
          const drops = visible.filter((item) => item.boss === boss);
          return (
            <article className="bossLoot" key={boss}>
              <header>
                <div className="bossMark">{String(bossIndex + 1).padStart(2, "0")}</div>
                <div>
                  <small>BÖLÜM SONU DÜŞMANI</small>
                  <h3>{boss}</h3>
                </div>
                <b>{drops.length} parça</b>
              </header>
              <div className="dropList">
                {drops.map((item) => (
                  <button onClick={() => onOpen(item)} key={item.id}>
                    <span>
                      <small>{item.class}</small>
                      <strong>{item.name}</strong>
                      {item.acquisition && <i>{item.acquisition}</i>}
                    </span>
                    <em>{item.slot}</em>
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
      {!bosses.length && (
        <p className="emptyResult">Bu sınıf için kayıtlı ganimet yok.</p>
      )}
    </section>
  );
}
function ItemCard({
  item,
  onOpen,
  onCompare,
  compared,
}: {
  item: Item;
  onOpen: (item: Item) => void;
  onCompare: (item: Item) => void;
  compared: boolean;
}) {
  const all = itemStats(item.id),
    usable = publishableStats(item.id),
    hasConflict = all.some((s) => s.verificationStatus === "conflicted"),
    visual = images.find((image) => image.itemId === item.id);
  return (
    <article className={`card ${visual ? "withArt" : "dataOnly"}`}>
      <button className="cardOpen" onClick={() => onOpen(item)}>
        {visual && (
          <div className="art verifiedArt">
            <Image
              src={visual.url}
              alt={`${item.name} oyun içi eşya görüntüsü`}
              width={1200}
              height={1600}
            />
            <small>OYUN İÇİ GÖRSEL · TEK KAYNAK</small>
          </div>
        )}
        <div className="copy">
          <p>
            {item.class} · {item.slot}
            <b>{item.rarity.toUpperCase()}</b>
          </p>
          <h3>{item.name}</h3>
          {usable.length > 0 ? (
            <>
              <div className="tooltip">
                {usable.map((s) => (
                  <span key={s.id}>
                    ◆ {s.attribute}: {fmt(s.value)}
                  </span>
                ))}
                {hasConflict && (
                  <span className="conflict">
                    ⚠ Çelişkili özellikler hesap dışı
                  </span>
                )}
              </div>
              {item.acquisition && (
                <div className="acquisition">{item.acquisition}</div>
              )}
              {item.region && (
                <div className="acquisition">
                  Düşme yeri: {item.region} · {item.boss}
                </div>
              )}
            </>
          ) : (
            <div className="lootFact">
              <b>
                {item.region} · {item.boss}
              </b>
              <span>
                Ganimet kaydı doğrulandı; efsun değerleri henüz kaynaklanmadı.
              </span>
            </div>
          )}
          <footer>
            ● {statusLabel[item.publicationStatus]} · {item.lastChecked}
          </footer>
        </div>
      </button>
      <button
        className={`compareButton ${compared ? "on" : ""}`}
        onClick={() => onCompare(item)}
      >
        {compared ? "Karşılaştırmadan çıkar" : "Karşılaştır"}
      </button>
    </article>
  );
}
function ComparePanel({
  items: compared,
  clear,
}: {
  items: Item[];
  clear: () => void;
}) {
  const attributes = [
    ...new Set(
      compared.flatMap((item) =>
        publishableStats(item.id).map((stat) => stat.attribute),
      ),
    ),
  ];
  return (
    <section className="comparePanel" aria-label="Eşya karşılaştırma">
      <header>
        <div>
          <small>HIZLI KARŞILAŞTIRMA</small>
          <h3>{compared.map((i) => i.name).join(" ↔ ")}</h3>
        </div>
        <button onClick={clear}>Temizle</button>
      </header>
      <div className="compareGrid">
        <b>Özellik</b>
        {compared.map((item) => (
          <b key={item.id}>{item.name}</b>
        ))}
        {attributes.map((attribute) => (
          <div className="compareRow" key={attribute}>
            <span>{attribute}</span>
            {compared.map((item) => (
              <strong key={item.id}>
                {fmt(
                  publishableStats(item.id)
                    .filter((s) => s.attribute === attribute)
                    .reduce((sum, s) => sum + s.value, 0),
                )}
              </strong>
            ))}
          </div>
        ))}
      </div>
      {compared.length < 2 && <p>Aynı sınıf ve yuvadan ikinci eşyayı seç.</p>}
    </section>
  );
}
function ItemModal({ item, close }: { item: Item; close: () => void }) {
  const recipe = itemRecipe(item.id),
    claims = itemEvidence(item.id),
    source = sourceFor(claims[0]?.sourceId),
    visual = images.find((image) => image.itemId === item.id);
  return (
    <div
      className="modal"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <article>
        <button aria-label="Kapat" className="close" onClick={close}>
          ×
        </button>
        {visual && (
          <div className="art verifiedArt">
            <Image
              src={visual.url}
              alt={`${item.name} oyun içi eşya görüntüsü`}
              width={1200}
              height={1600}
            />
          </div>
        )}
        <p className="eyebrow">
          {item.class} · {item.slot} · {item.rarity}
        </p>
        <h2>{item.name}</h2>
        <dl>
          {item.appearanceFamily && (
            <div>
              <dt>Görünüş ailesi</dt>
              <dd>
                {familyNames[item.appearanceFamily] ?? item.appearanceFamily}
              </dd>
            </div>
          )}
          <div>
            <dt>Kanıt kapsamı</dt>
            <dd>{claims.length} alan bazlı kayıt</dd>
          </div>
          {item.level && (
            <div>
              <dt>Seviye</dt>
              <dd>{item.level}</dd>
            </div>
          )}
          {item.region && (
            <div>
              <dt>Ganimet</dt>
              <dd>
                {item.region} · {item.boss}
              </dd>
            </div>
          )}
          {item.acquisition && (
            <div>
              <dt>Elde etme</dt>
              <dd>{item.acquisition}</dd>
            </div>
          )}
          {recipe && (
            <>
              <div>
                <dt>Elde etme</dt>
                <dd>{recipe.method}</dd>
              </div>
              <div>
                <dt>Malzemeler</dt>
                <dd>
                  {recipe.materials
                    .map((m) => `${m.name} ×${m.quantity}`)
                    .join(", ")}
                </dd>
              </div>
            </>
          )}
        </dl>
        {source && (
          <a
            className="sourceLink"
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            {source.title} ↗
          </a>
        )}
      </article>
    </div>
  );
}
function Field({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend>{name}</legend>
      <div>{children}</div>
    </fieldset>
  );
}
function Title({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
