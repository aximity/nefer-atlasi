"use client";
import EndgameLab from "./EndgameLab";
import MiningGuide from "./MiningGuide";
import SkillGuides from "./SkillGuides";
import ProjectScorecard from "./ProjectScorecard";
import ContributionCenter from "./ContributionCenter";
import ConnectedAtlas from "./ConnectedAtlas";
import QuestAtlas from "./QuestAtlas";
import IssueDesk from "./IssueDesk";
import EconomyWorkshop from "./EconomyWorkshop";
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
  talismanAcquisition,
  type Item,
  type CharacterClass,
  type TalismanAcquisition,
} from "../lib/catalog";
import { materialSourceFor } from "../lib/material-sources";
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
import { SITE_RELEASE } from "../lib/site-release";
import { quests } from "../lib/quest-catalog";
import abilityRows from "../data/abilities.json";
import abilityVariantRows from "../data/ability-variants.json";
import { gatheringRegionFor, gatheringRows } from "../lib/gathering-catalog";
import {
  GROUP_REGION_DEFINITIONS,
  cemberlitasBossesFor,
  cemberlitasLootSourceIdFor,
  isCemberlitasRecipe,
} from "../lib/group-region-loot.mjs";
import { creatureDropSources } from "../lib/material-sources";
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
  { id: "builder", label: "Donanım", summary: "Eşya seç, toplam özelliklerini gör.", keywords: "build set zırh silah" },
  { id: "skills", label: "Yetenek", summary: "Seviyene göre yetenek puanı dağıt.", keywords: "skill simülasyon puan" },
  { id: "engine", label: "Tılsım", summary: "Tılsım etkisini ve edinme yolunu incele.", keywords: "kademe reçete büyük hol" },
  { id: "group-regions", label: "Bölgeler", summary: "Boss ve bölge ganimetlerini gör.", keywords: "gaffar semiha stuart çemberlitaş migrat sığınak" },
  { id: "quests", label: "Görevler", summary: "Seviyene uygun görev zincirini bul.", keywords: "npc ödül görev zinciri" },
  { id: "items", label: "Eşyalar", summary: "Eşya kataloğunda ara ve karşılaştır.", keywords: "item drop ganimet" },
  { id: "atlas", label: "Atlas", summary: "Eşya, reçete, boss ve malzeme bağlarını izle.", keywords: "bağlantı kaynak tarif" },
  { id: "endgame", label: "Endgame", summary: "Son oyun hazırlığını ve stratejiyi incele.", keywords: "grup bölgesi strateji" },
  { id: "mining", label: "Maden", summary: "Maden kaynaklarını ve kullanım alanlarını bul.", keywords: "madenci sarraf lokman cevher" },
  { id: "economy", label: "Ekonomi", summary: "Maden, çöp ve para döngülerini incele.", keywords: "döngü pazar para çöp üretim" },
  { id: "issues", label: "Sorunlar", summary: "Oyun sorunlarını ve çözüm önerilerini gör.", keywords: "şikayet öneri lag bağlantı" },
  { id: "health", label: "Gelişim", summary: "Projenin veri ve kalite durumunu izle.", keywords: "durum kapsam kalite" },
  { id: "contribute", label: "Katkı", summary: "Yeni bilgi ve kanıt gönder.", keywords: "ekle düzelt kanıt görsel" },
] as const;
type MainModule = (typeof moduleTabs)[number]["id"];
const searchFilters = ["Tümü", "Bölümler", "Eşyalar", "Görevler", "Yetenekler", "Madenler", "Bölgeler", "Tılsımlar"] as const;
type SearchFilter = (typeof searchFilters)[number];
const normalizeSearch = (value: string) => value
  .normalize("NFD")
  .replace(/\p{Diacritic}/gu, "")
  .replace(/ı/g, "i")
  .toLocaleLowerCase("tr-TR")
  .trim();
const matchesSearch = (haystack: string, query: string) => {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const normalizedHaystack = normalizeSearch(haystack);
  return words.every((word) => normalizedHaystack.includes(word));
};
const primaryModuleIds: MainModule[] = ["builder", "skills", "quests", "items"];
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
    [talismanPath, setTalismanPath] = useState<"Tümü" | TalismanAcquisition>("Tümü"),
    [wrathBase, setWrathBase] = useState(false),
    [wrathCriticalBase, setWrathCriticalBase] = useState(0),
    [abilities, setAbilities] = useState(emptyAbilities),
    [query, setQuery] = useState(""),
    [classFilter, setClassFilter] = useState("Tümü"),
    [slotFilter, setSlotFilter] = useState("Tümü"),
    [compareIds, setCompareIds] = useState<string[]>([]),
    [detail, setDetail] = useState<Item | null>(null),
    [activeModule, setActiveModule] = useState<MainModule>("builder"),
    [moreOpen, setMoreOpen] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [globalQuery, setGlobalQuery] = useState(""),
    [searchFilter, setSearchFilter] = useState<SearchFilter>("Tümü"),
    [questSearchSeed, setQuestSearchSeed] = useState(""),
    [abilitySearchSeed, setAbilitySearchSeed] = useState(""),
    [regionSearchSeed, setRegionSearchSeed] = useState(""),
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
      const params = new URLSearchParams(location.search);
      const requestedModule = params.get("module");
      if (requestedModule && moduleTabs.some((item) => item.id === requestedModule)) {
        setActiveModule(requestedModule as MainModule);
      }
      const requestedItem = params.get("item");
      if (requestedItem) setDetail(items.find((item) => item.id === requestedItem) ?? null);
      const saved = params.get("build");
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
  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMoreOpen(false);
      }
    };
    addEventListener("keydown", openSearch);
    return () => removeEventListener("keydown", openSearch);
  }, []);
  const baseTotals = useMemo(
      () => buildTotals(selection),
      [selection],
    ) as Record<string, number>,
    classTalismans = talismans.filter((t) => t.class === klass),
    visibleTalismans = classTalismans.filter((t) => talismanPath === "Tümü" || talismanAcquisition(t) === talismanPath),
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
      setTalismanPath("Tümü");
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
  const openModule = (id: MainModule, searchParams?: Record<string, string>) => {
      setActiveModule(id);
      setMoreOpen(false);
      setSearchOpen(false);
      const url = new URL(location.href);
      url.searchParams.set("module", id);
      if (searchParams) {
        ["item", "quest", "ability", "material", "view", "region", "boss", "node", "talisman"].forEach((key) => url.searchParams.delete(key));
        Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value));
      }
      history.replaceState(null, "", url);
      requestAnimationFrame(() => document.getElementById("modules")?.scrollIntoView());
    },
    normalizedGlobalQuery = normalizeSearch(globalQuery),
    globalModuleResults = normalizedGlobalQuery
      ? moduleTabs.filter((item) => matchesSearch(`${item.label} ${item.summary} ${item.keywords}`, globalQuery)).slice(0, 8)
      : moduleTabs.filter((item) => primaryModuleIds.includes(item.id)),
    globalItemResults = normalizedGlobalQuery
      ? publishableItems.filter((item) => {
          const recipe = itemRecipe(item.id);
          return matchesSearch([
            item.name, item.class, item.slot, item.region, item.boss, item.acquisition,
            ...publishableStats(item.id).map((stat) => stat.attribute),
            ...(recipe?.materials.map((material) => material.name) ?? []),
          ].filter(Boolean).join(" "), globalQuery);
        }).slice(0, 8)
      : [],
    globalTalismanResults = normalizedGlobalQuery
      ? talismans.filter((item) => matchesSearch(`${item.name} ${item.class} ${item.color} ${item.series} ${item.effectText} ${talismanAcquisition(item)}`, globalQuery)).slice(0, 8)
      : [],
    globalQuestResults = normalizedGlobalQuery
      ? quests.filter((item) => matchesSearch([
          item.title, String(item.level), `seviye ${item.level} görev`, item.giver, item.location, item.region, item.track, item.objective, item.note,
          ...Object.values(item.reward ?? {}),
        ].filter(Boolean).join(" "), globalQuery)).slice(0, 8)
      : [],
    globalAbilityResults = normalizedGlobalQuery
      ? [
          ...abilityRows.map((item) => ({ id: item.id, focusId: item.id, name: item.name, class: item.class, level: item.unlockLevel, description: item.roles.join(" · ") })),
          ...abilityVariantRows.map((item) => {
            const replaced = abilityRows.find((ability) => ability.id === item.replacesAbilityId);
            return { id: item.id, focusId: item.id, name: item.name, class: item.class, level: replaced?.unlockLevel ?? 20, description: `${replaced?.name ?? "Temel yetenek"} yerine geçen KÖ varyantı` };
          }),
        ].filter((item) => matchesSearch(`${item.name} ${item.class} ${item.level} ${item.description}`, globalQuery)).slice(0, 8)
      : [],
    globalMaterialResults = normalizedGlobalQuery
      ? [
          ...gatheringRows.flatMap((row) => [row.base, row.second, row.third].filter(Boolean).map((name) => ({
            id: `${row.profession}-${name}`,
            name: String(name),
            description: `${row.profession} · ${gatheringRegionFor(row)} · ${row.points} puan`,
            target: "mining" as const,
          }))),
          ...creatureDropSources.map((item) => ({
            id: `drop-${item.name}`,
            name: item.name,
            description: `${item.region} · ${item.enemy} · ${item.usage}`,
            aliases: item.aliases?.join(" ") ?? "",
            target: "atlas" as const,
          })),
        ].filter((item) => matchesSearch(`${item.name} ${item.description} ${"aliases" in item ? item.aliases : ""}`, globalQuery)).slice(0, 8)
      : [],
    globalRegionResults = normalizedGlobalQuery
      ? GROUP_REGION_DEFINITIONS.flatMap((region) => [
          { id: `region-${region.name}`, name: region.name, region: region.name, boss: "", description: `${region.bossCount} boss · ${region.encounterCount} karşılaşma` },
          ...region.bosses.map((boss) => ({ id: `boss-${region.name}-${boss}`, name: boss, region: region.name, boss, description: `${region.name} bossu` })),
        ]).filter((item) => matchesSearch(`${item.name} ${item.region} ${item.description}`, globalQuery)).slice(0, 8)
      : [],
    categoryVisible = (category: SearchFilter) => searchFilter === "Tümü" || searchFilter === category,
    globalResultCount =
      (categoryVisible("Bölümler") ? globalModuleResults.length : 0) +
      (categoryVisible("Eşyalar") ? globalItemResults.length : 0) +
      (categoryVisible("Görevler") ? globalQuestResults.length : 0) +
      (categoryVisible("Yetenekler") ? globalAbilityResults.length : 0) +
      (categoryVisible("Madenler") ? globalMaterialResults.length : 0) +
      (categoryVisible("Bölgeler") ? globalRegionResults.length : 0) +
      (categoryVisible("Tılsımlar") ? globalTalismanResults.length : 0),
    filtered = publishableItems.filter(
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
      <header className="siteHeader">
        <a className="brand" href="#top" aria-label="Nefer Atlası ana sayfa">
          <b className="brandMark">N</b>
          <span className="brandName">
            <strong>NEFER ATLASI</strong>
            <small>KÖ BİLGİ PLATFORMU</small>
          </span>
        </a>
        <nav className="top-status" aria-label="Açık modül">
          <span>{moduleTabs.find((item) => item.id === activeModule)?.label}</span>
          <button className="globalSearchTrigger" type="button" onClick={() => setSearchOpen(true)} aria-label="Atlas genelinde ara">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/></svg>
            <b>Atlas’ta ara</b>
            <small aria-hidden="true">/</small>
          </button>
          <a href="https://kiyametoyun.net/" target="_blank" rel="noreferrer">Oyuna git ↗</a>
          <a href="/rehber">Rehber</a>
          <i>{SITE_RELEASE.channel} v{SITE_RELEASE.version}</i>
        </nav>
      </header>
      <section className="hero" id="top">
        <div>
          <p className="eyebrow">KÖ BİLGİ · STRATEJİ · EKONOMİ PLATFORMU</p>
          <h1>
            Bilgiyi doğrula.
            <br />
            <em>Stratejini kur.</em>
          </h1>
          <p>
            Eşyaları, buildleri, yetenekleri, bölgeleri, madenleri ve pazar
            verisini aynı kaynak zincirinde incele; karşılaşmaya hazırlan.
          </p>
          <div className="heroActions">
            <a href="/rehber">Nasıl kullanılır?</a>
            <button onClick={() => document.getElementById("modules")?.scrollIntoView()}>Modülleri aç</button>
          </div>
        </div>
        <aside>
          <small>GENİŞLEYEN KÖ KATALOĞU</small>
          <strong>{publishableItems.length}</strong>
          <span>kaynaklı eşya kaydı</span>
          <p>
            Çemberlitaş setleri · Sığınak ve Migrat takıları · sınıfa özel
            yuvalar
          </p>
        </aside>
      </section>
      <nav className="moduleTabs" id="modules" aria-label="Nefer Atlası ana bölümleri">
        <div className="modulePrimary" role="tablist">
        {moduleTabs.filter((item) => primaryModuleIds.includes(item.id)).map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeModule === item.id}
            className={activeModule === item.id ? "active" : ""}
            onClick={() => openModule(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
        </div>
        <div className="moduleMore">
          <button type="button" className={!primaryModuleIds.includes(activeModule) ? "active" : ""} aria-expanded={moreOpen} onClick={() => setMoreOpen((value) => !value)}>
            <span>{primaryModuleIds.includes(activeModule) ? "Tümü" : moduleTabs.find((item) => item.id === activeModule)?.label}</span>
            <small aria-hidden="true">{moreOpen ? "×" : "+"}</small>
          </button>
          {moreOpen && <div className="moduleMenu">
            <header><b>Tüm bölümler</b><span>Aradığın aracı seç</span></header>
            {moduleTabs.filter((item) => !primaryModuleIds.includes(item.id)).map((item) => (
              <button type="button" key={item.id} className={activeModule === item.id ? "active" : ""} onClick={() => openModule(item.id)}>
                <span><b>{item.label}</b><small>{item.summary}</small></span><i>→</i>
              </button>
            ))}
          </div>}
        </div>
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
              Puanlama yalnız yayımdaki özellik adlarının hedeflerle eşleşmesini
              ölçer. Tek kaynaklı kayıtlar teyit bekler; sonuç en iyi seçim veya
              başarı garantisi değildir.
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
          eyebrow="M3 · TILSIM ATLASI"
          title="Tılsım hangi yeteneği nasıl değiştiriyor?"
        >
          <span className="count">{talismans.length} sınıf ve kademe kaydı · etki ve elde etme yolu</span>
        </Title>
        <div className="talismanPurpose">
          <article>
            <small>TILSIM NEDİR?</small>
            <b>Yetenek değiştiricisidir.</b>
            <p>Belirli bir yeteneğin hasarını, kritiğini veya çalışma biçimini kendi resmî açıklamasındaki kurala göre geliştirir.</p>
          </article>
          <article>
            <small>BU EKRAN NE YAPAR?</small>
            <b>Etkisini ve edinme yolunu gösterir.</b>
            <p>Kademe, renk, bağlı yetenek, Büyük Hol düşümü veya reçete üretimi ve hesaplanabilen önce/sonra sonucunu gösterir.</p>
          </article>
          <article>
            <small>NE YAPMAZ?</small>
            <b>Yetenek puanı dağıtmaz.</b>
            <p>Puan planı ayrı Yetenek ekranındadır. Tılsım hesabı, seçili donanımda ilgili taban özellik yoksa sonuç uydurmaz.</p>
            <button onClick={() => {
              setActiveModule("skills");
              const url = new URL(location.href);
              url.searchParams.set("module", "skills");
              history.replaceState(null, "", url);
            }}>Yetenek puanı dağıt →</button>
          </article>
        </div>
        <div className="engineGrid">
          <article>
            <h3>{klass} tılsımı</h3>
            <div className="talismanPaths" aria-label="Tılsım elde etme yolu">
              {(["Tümü", "Büyük Hol düşümü", "Reçeteyle üretim", "Yalnız reçeteyle üretim"] as const).map((path) => (
                <button className={talismanPath === path ? "on" : ""} onClick={() => { setTalismanPath(path); setTalismanId(""); }} key={path}>{path}</button>
              ))}
            </div>
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
                  {visibleTalismans.filter((t) => t.color === color).map((t) => (
                    <option value={t.id} key={t.id}>
                      {t.name}{t.tier === null ? " · Özel" : ""} · {talismanAcquisition(t)}
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
              {classTalismans.length} özgün oyun kaydı · I. kademe Büyük Hol düşümü; II–III. kademe ve kademesiz özel tılsımlar reçete üretimiyle edinilir. Filtrede {visibleTalismans.length} kayıt gösteriliyor.
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
      </section>}
      {activeModule === "group-regions" && <GroupRegions key={regionSearchSeed} initialRegionName={regionSearchSeed.split("|||")[0]} onOpen={setDetail} />}
      {activeModule === "quests" && <QuestAtlas key={questSearchSeed} initialQuery={questSearchSeed} />}
      {activeModule === "endgame" && <EndgameLab />}
      {activeModule === "mining" && <MiningGuide />}
      {activeModule === "economy" && <EconomyWorkshop />}
      {activeModule === "skills" && <SkillGuides key={abilitySearchSeed} klass={klass} initialAbilityId={abilitySearchSeed} onClassChange={setClass} />}
      {activeModule === "issues" && <IssueDesk />}
      {activeModule === "health" && <ProjectScorecard />}
      {activeModule === "contribute" && <ContributionCenter />}
      {activeModule === "items" && <section className="catalog" id="items">
        <Title eyebrow="KAYNAK DURUMLU EŞYA KATALOĞU" title="Eşya rehberi">
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
        <p className="catalogAudit">
          <b>Doğrulama notu:</b> “Tek kaynak” etiketi kesin bilgi anlamına gelmez.
          Bu kayıtlar ikinci bağımsız kaynak veya aynı eşya adını gösteren oyun içi
          ekran görüntüsü gelene kadar teyit bekler; çelişkili değerler hesaplara alınmaz.
          Çemberlitaş adları resmî eşya listeleriyle, Sığınaklar ve Migrat adları sınıf
          ganimet tablolarıyla karşılaştırıldı. “Farabi Modeli Farabi Modeli” gibi tekrarlar
          kaynakta çift efsunu ifade ettiği için otomatik olarak silinmez.
        </p>
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
            Bu filtrelerle eşleşen kaynaklı eşya yok.
          </p>
        )}
      </section>}
      {activeModule === "atlas" && <ConnectedAtlas />}
      {searchOpen && <div className="globalSearchOverlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSearchOpen(false)}>
        <section className="globalSearch" role="dialog" aria-modal="true" aria-label="Atlas genelinde ara">
          <header>
            <label>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/></svg>
              <input autoFocus value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)} placeholder="Ne arıyorsun? Örn. Gaffar asa…" />
            </label>
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Aramayı kapat">×</button>
          </header>
          <div className="globalSearchFilters" aria-label="Arama türü">
            {searchFilters.map((filter) => <button type="button" key={filter} className={searchFilter === filter ? "active" : ""} onClick={() => setSearchFilter(filter)}>{filter}</button>)}
          </div>
          <p className="globalSearchHint">Birden fazla kelimeyi birlikte süzer: “Gaffar asa”, “20 seviye görev” veya “Büyük Hol maden”.</p>
          <div className="globalSearchResults">
            {categoryVisible("Bölümler") && globalModuleResults.length > 0 && <section><h3>Bölümler</h3>{globalModuleResults.map((item) => <button type="button" key={item.id} onClick={() => openModule(item.id)}><span><b>{item.label}</b><small>{item.summary}</small></span><i>→</i></button>)}</section>}
            {categoryVisible("Eşyalar") && globalItemResults.length > 0 && <section><h3>Eşyalar</h3>{globalItemResults.map((item) => <button type="button" key={item.id} onClick={() => { setQuery(item.name); setClassFilter(item.class === "Tüm Sınıflar" ? "Tümü" : item.class); setSlotFilter(item.slot); setDetail(item); openModule("items", { item: item.id }); }}><span><b>{item.name}</b><small>{item.class} · {item.slot}{item.boss ? ` · ${item.boss}` : ""}</small></span><i>↗</i></button>)}</section>}
            {categoryVisible("Görevler") && globalQuestResults.length > 0 && <section><h3>Görevler</h3>{globalQuestResults.map((item) => <button type="button" key={item.id} onClick={() => { setQuestSearchSeed(item.title); openModule("quests", { quest: item.id }); }}><span><b>{item.title}</b><small>Sv. {item.level} · {item.giver} · {item.location}</small></span><i>→</i></button>)}</section>}
            {categoryVisible("Yetenekler") && globalAbilityResults.length > 0 && <section><h3>Yetenekler</h3>{globalAbilityResults.map((item) => <button type="button" key={item.id} onClick={() => { setClass(item.class as CharacterClass); setAbilitySearchSeed(item.focusId); openModule("skills", { ability: item.id }); }}><span><b>{item.name}</b><small>{item.class} · Sv. {item.level} · {item.description}</small></span><i>→</i></button>)}</section>}
            {categoryVisible("Madenler") && globalMaterialResults.length > 0 && <section><h3>Maden ve materyaller</h3>{globalMaterialResults.map((item) => <button type="button" key={item.id} onClick={() => item.target === "mining" ? openModule("mining", { view: "Kaynaklar", material: item.name }) : openModule("atlas", { node: `material:${item.name.toLocaleLowerCase("tr-TR")}` })}><span><b>{item.name}</b><small>{item.description}</small></span><i>→</i></button>)}</section>}
            {categoryVisible("Bölgeler") && globalRegionResults.length > 0 && <section><h3>Bölgeler ve bosslar</h3>{globalRegionResults.map((item) => <button type="button" key={item.id} onClick={() => { setRegionSearchSeed(`${item.region}|||${item.boss}`); openModule("group-regions", { region: item.region, ...(item.boss ? { boss: item.boss } : {}) }); }}><span><b>{item.name}</b><small>{item.description}</small></span><i>→</i></button>)}</section>}
            {categoryVisible("Tılsımlar") && globalTalismanResults.length > 0 && <section><h3>Tılsımlar</h3>{globalTalismanResults.map((item) => <button type="button" key={item.id} onClick={() => { setClass(item.class); setTalismanId(item.id); openModule("engine", { talisman: item.id }); }}><span><b>{item.name}</b><small>{item.class} · {item.color} · {talismanAcquisition(item)}</small></span><i>→</i></button>)}</section>}
            {normalizedGlobalQuery && globalResultCount === 0 && <div className="globalSearchEmpty"><b>Bu filtrede sonuç bulunamadı.</b><span>“Tümü”nü seç veya daha kısa bir kelime dene.</span></div>}
          </div>
          <footer><span><kbd>/</kbd> ile aç</span><span><kbd>Esc</kbd> ile kapat</span></footer>
        </section>
      </div>}
      <footer className="siteFooter">
        <div>
          <b>NEFER ATLASI</b>
          <span>{SITE_RELEASE.channel} v{SITE_RELEASE.version} · {SITE_RELEASE.releasedAt}</span>
          <span>Bağımsız Kıyametin Öncüleri topluluk projesi · resmî değildir.</span>
        </div>
        <p>
          Kaynak yoksa kesin bilgi yok. Tek kaynak teyit bekler; çelişki saklanmaz;
          eşya adıyla görünüşü aynı kanıtta değilse görsel bağlanmaz.
        </p>
        <span className="footerTools"><a href="https://kiyametoyun.net/" target="_blank" rel="noreferrer">Güncel Oyun Portalı</a><a href="/rehber">Kullanım Rehberi</a><a href="/farm-operasyonu">Saha Operasyonu</a><a href="/katki-inceleme">Editör Masası</a></span>
      </footer>
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
        <h4>Çelişkili özellikler hesap dışı</h4>
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
      <p className="talismanPathLine"><b>Elde etme:</b> {talismanAcquisition(tal)}{tal.tier === 2 || tal.tier === 3 ? " · önceki kademeden üretim" : ""}</p>
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
function GroupRegions({ onOpen, initialRegionName = "" }: { onOpen: (item: Item) => void; initialRegionName?: string }) {
  const cemberlitasLoot = publishableItems
      .filter(
        (item) => isCemberlitasRecipe(itemRecipe(item.id)),
      )
      .map((item) => ({
        ...item,
        region: "Çemberlitaş",
        bosses: cemberlitasBossesFor(item),
        acquisition: itemRecipe(item.id)?.method,
      })),
    loot = [
      ...cemberlitasLoot,
      ...publishableItems
        .filter((item) => item.region && item.boss)
        .map((item) => ({ ...item, region: item.region as string, bosses: [item.boss as string] })),
    ],
    regions = GROUP_REGION_DEFINITIONS.filter((region) => loot.some((item) => item.region === region.name)),
    [activeRegion, setActiveRegion] = useState(
      regions.find((region) => region.name === initialRegionName) ?? regions[0] ?? GROUP_REGION_DEFINITIONS[0],
    ),
    [activeClass, setActiveClass] = useState("Tümü"),
    visible = loot.filter(
      (item) =>
        item.region === activeRegion.name &&
        (activeClass === "Tümü" || item.class === activeClass),
    );

  return (
    <section className="groupRegions" id="group-regions">
      <Title
        eyebrow="M4 · GRUP BÖLGELERİ GANİMET ARŞİVİ"
        title="Hangi boss ne atıyor?"
      >
        <span className="count">{loot.length} kaynaklı ganimet ve üretim kaydı</span>
      </Title>
      <div className="regionTabs" role="tablist" aria-label="Grup bölgesi seç">
        {regions.map((region) => (
          <button
            role="tab"
            aria-selected={activeRegion.name === region.name}
            className={activeRegion.name === region.name ? "on" : ""}
            onClick={() => setActiveRegion(region)}
            key={region.name}
          >
            <span>{region.name}</span>
            <small>
              {loot.filter((item) => item.region === region.name).length} eşya · {region.bossCount} boss
              {region.encounterCount !== region.bossCount ? ` · ${region.encounterCount} karşılaşma` : ""}
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
        {activeRegion.bossGroups.map((boss, bossIndex) => {
          const drops = visible.filter((item) => item.bosses.some((itemBoss) => boss.lootBosses.includes(itemBoss)));
          return (
            <article className="bossLoot" key={boss.name}>
              <header>
                <div className="bossMark">{String(bossIndex + 1).padStart(2, "0")}</div>
                <div>
                  <small>{boss.stage}{boss.encounters > 1 ? ` · ${boss.encounters} KARŞILAŞMA` : ""}</small>
                  <h3>{boss.name}</h3>
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
                {!drops.length && <p className="bossLootEmpty">Bu boss için kaynakta eşya ganimeti listelenmiyor.</p>}
              </div>
            </article>
          );
        })}
      </div>
      {!activeRegion.bossGroups.length && (
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
    visual = images.find((image) => image.itemId === item.id),
    recipe = itemRecipe(item.id),
    cemberlitasOrigin = isCemberlitasRecipe(recipe),
    cemberlitasBosses = cemberlitasOrigin ? cemberlitasBossesFor(item) : [];
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
              {!item.region && cemberlitasOrigin && (
                <div className="acquisition">Ganimet/üretim: Çemberlitaş · {cemberlitasBosses.join(", ")} · {recipe.materials.length} malzeme</div>
              )}
            </>
          ) : (
            <div className="lootFact">
              <b>
                {item.region} · {item.boss}
              </b>
              <span>
                Tek kaynakta ganimet olarak listeleniyor; efsun değerleri henüz kaynaklanmadı.
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
    recipeSource = recipe ? sourceFor(recipe.sourceId) : undefined,
    visual = images.find((image) => image.itemId === item.id),
    cemberlitasOrigin = isCemberlitasRecipe(recipe),
    cemberlitasBosses = cemberlitasOrigin ? cemberlitasBossesFor(item) : [],
    lootSource = cemberlitasOrigin ? sourceFor(cemberlitasLootSourceIdFor(item) ?? "") : undefined;
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
          {(item.region || cemberlitasOrigin) && (
            <div>
              <dt>Ganimet</dt>
              <dd>
                {item.region ?? "Çemberlitaş"} · {item.boss ?? cemberlitasBosses.join(", ")}
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
                <dd className="recipeMaterialList">
                  {recipe.materials.map((material) => {
                    const materialSource = materialSourceFor(material.name);
                    return <span key={material.name}>
                      <b>{material.name} ×{material.quantity}</b>
                      {materialSource?.kind === "gathering"
                        ? <small>{materialSource.profession} · {materialSource.base} kaynağının {materialSource.output}. çıktısı · {materialSource.region} · <a href={`/?module=mining&view=Kaynaklar&material=${encodeURIComponent(material.name)}#mining`}>Üretim Ağında aç ↗</a></small>
                        : materialSource?.kind === "creature_drop"
                          ? <small>{materialSource.region} · {materialSource.enemy} ganimeti · {materialSource.verification} · <a href={`/?module=mining&view=Kaynaklar&material=${encodeURIComponent(material.name)}#mining`}>Üretim Ağında aç ↗</a></small>
                          : <small>Kaynak eşleşmesi henüz yok</small>}
                      <a href={`/?module=atlas&node=${encodeURIComponent(`material:${material.name.toLocaleLowerCase("tr-TR")}`)}#atlas`}>bağlantılı atlas ↗</a>
                    </span>;
                  })}
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
        {recipeSource && recipeSource.id !== source?.id && (
          <a className="sourceLink secondary" href={recipeSource.url} target="_blank" rel="noreferrer">Reçete kaynağı · {recipeSource.title} ↗</a>
        )}
        {lootSource && lootSource.id !== source?.id && (
          <a className="sourceLink secondary" href={lootSource.url} target="_blank" rel="noreferrer">Ganimet kaynağı · {lootSource.title} ↗</a>
        )}
        <a className="sourceLink secondary" href={`/?module=atlas&node=${encodeURIComponent(`item:${item.id}`)}#atlas`}>Eşyanın bağlantılı atlasını aç ↗</a>
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
