"use client";
import EndgameLab from "./EndgameLab";
import MiningGuide from "./MiningGuide";
import SkillGuides from "./SkillGuides";
import AdSlot from "./AdSlot";
import ProjectScorecard from "./ProjectScorecard";
import ContributionCenter from "./ContributionCenter";
import ConnectedAtlas from "./ConnectedAtlas";
import QuestAtlas from "./QuestAtlas";
import IssueDesk from "./IssueDesk";
import EconomyWorkshop from "./EconomyWorkshop";
import SustainabilityHub from "./SustainabilityHub";
import ReleaseCenter from "./ReleaseCenter";
import TalismanProductionAtlas from "./TalismanProductionAtlas";
import RecipeCatalog from "./RecipeCatalog";
import EquipmentBuilder from "./equipment-builder";
import GroupRegions from "./group-regions";
import {
  ComparePanel,
  ItemCard,
  ItemModal,
} from "./item-explorer-parts";
import Title from "./section-title";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  items,
  publishableItems,
  recipes,
  talismans,
  publishableStats,
  itemRecipe,
  talismanAcquisition,
  type Item,
  type CharacterClass,
} from "../lib/catalog";
import { SITE_RELEASE } from "../lib/site-release";
import { quests } from "../lib/quest-catalog";
import abilityRows from "../data/abilities.json";
import abilityVariantRows from "../data/ability-variants.json";
import { gatheringRegionFor, gatheringRows } from "../lib/gathering-catalog";
import {
  GROUP_REGION_DEFINITIONS,
} from "../lib/group-region-loot.mjs";
import { craftedMaterialRecipes, craftedMaterialSources, creatureDropSources } from "../lib/material-sources";
import { talismanRecipes } from "../lib/talisman-recipes";
import { potionRecipes } from "../lib/potion-recipes";
import {
  itemVisualFamilyInventory,
} from "../lib/visual-families";
import { APP_NAVIGATION_EVENT, ROUTE_DETAIL_PARAMS } from "../lib/navigation";
const classes: CharacterClass[] = ["Savaşçı", "Büyücü", "Şifacı"];
const itemFamilyInventory = itemVisualFamilyInventory(publishableItems);
const moduleTabs = [
  { id: "builder", label: "Donanım", summary: "Eşya seç, toplam özelliklerini gör.", keywords: "build set zırh silah" },
  { id: "skills", label: "Yetenek", summary: "Seviyene göre yetenek puanı dağıt.", keywords: "skill simülasyon puan" },
  { id: "engine", label: "Tılsım", summary: "Tılsım etkisini ve edinme yolunu incele.", keywords: "kademe reçete büyük hol" },
  { id: "recipes", label: "Reçeteler", summary: "Eşya, tılsım ve iksir reçetelerini ayır.", keywords: "tarif üretim malzeme iksir" },
  { id: "group-regions", label: "Bölgeler", summary: "Boss ve bölge ganimetlerini gör.", keywords: "gaffar semiha stuart çemberlitaş migrat sığınak" },
  { id: "quests", label: "Görevler", summary: "Seviyene uygun görev zincirini bul.", keywords: "npc ödül görev zinciri" },
  { id: "items", label: "Eşyalar", summary: "Eşya kataloğunda ara ve karşılaştır.", keywords: "item drop ganimet" },
  { id: "atlas", label: "Atlas", summary: "Eşya, reçete, boss ve malzeme bağlarını izle.", keywords: "bağlantı kaynak tarif" },
  { id: "endgame", label: "Endgame", summary: "Yükseltme ve son oyun hazırlığını incele.", keywords: "grup bölgesi strateji yükseltme + basma kozmik dönüşüm taşı malahit gökmeran gök tapınağı" },
  { id: "mining", label: "Maden", summary: "Maden kaynaklarını ve kullanım alanlarını bul.", keywords: "madenci sarraf lokman cevher" },
  { id: "economy", label: "Ekonomi", summary: "Maden, çöp ve para döngülerini incele.", keywords: "döngü pazar para çöp üretim" },
  { id: "sustainability", label: "Sürdürülebilirlik", summary: "Ekonomi, etkinlik ve kaynak uyarlamalarını izle.", keywords: "sürdürülebilirlik ekonomi etkinlik takvim maden para kaynak" },
  { id: "issues", label: "Sorunlar", summary: "Oyun sorunlarını ve çözüm önerilerini gör.", keywords: "şikayet öneri lag bağlantı" },
  { id: "health", label: "Proje durumu", summary: "Son sürümü, görsel kapsamı ve açık işleri izle.", keywords: "durum gelişim kapsam kalite görsel eksik" },
  { id: "contribute", label: "Geri bildirim", summary: "Yanlış veya eksik bilgiyi metinle bildir.", keywords: "yorum düzelt geri bildirim" },
] as const;
type MainModule = (typeof moduleTabs)[number]["id"];
const searchFilters = ["Tümü", "Bölümler", "Eşyalar", "Reçeteler", "Görevler", "Yetenekler", "Madenler", "Bölgeler", "Tılsımlar"] as const;
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
const quickModuleIds: MainModule[] = ["items", "engine", "recipes", "quests"];
const moduleGroups: { label: string; note: string; ids: MainModule[] }[] = [
  { label: "Bilgi", note: "Aradığın kaydı bul", ids: ["items", "engine", "recipes", "quests", "skills", "group-regions"] },
  { label: "Araçlar", note: "Planla ve karşılaştır", ids: ["builder", "atlas", "mining", "endgame"] },
  { label: "Proje", note: "Arka plan ve katkı", ids: ["economy", "sustainability", "issues", "health", "contribute"] },
];
type ModuleGroupLabel = "Bilgi" | "Araçlar" | "Proje";
export default function Home() {
  const [klass, setKlass] = useState<CharacterClass>("Büyücü"),
    [talismanId, setTalismanId] = useState(""),
    [, setTalismanPath] = useState("Tümü"),
    [query, setQuery] = useState(""),
    [classFilter, setClassFilter] = useState("Tümü"),
    [slotFilter, setSlotFilter] = useState("Tümü"),
    [itemVisibleLimit, setItemVisibleLimit] = useState(24),
    [compareIds, setCompareIds] = useState<string[]>([]),
    [detail, setDetail] = useState<Item | null>(null),
    [activeModule, setActiveModule] = useState<MainModule | null>(null),
    [moreOpen, setMoreOpen] = useState(false),
    [menuGroup, setMenuGroup] = useState<ModuleGroupLabel>("Bilgi"),
    [searchOpen, setSearchOpen] = useState(false),
    [globalQuery, setGlobalQuery] = useState(""),
    [searchFilter, setSearchFilter] = useState<SearchFilter>("Tümü"),
    [questSearchSeed, setQuestSearchSeed] = useState(""),
    [abilitySearchSeed, setAbilitySearchSeed] = useState(""),
    [regionSearchSeed, setRegionSearchSeed] = useState(""),
    [recipeRevision, setRecipeRevision] = useState(0),
    [atlasRevision, setAtlasRevision] = useState(0),
    [miningRevision, setMiningRevision] = useState(0),
    [builderSeed, setBuilderSeed] = useState({ revision: 0, code: "" }),
    [notice, setNotice] = useState("");
  const klassRef = useRef(klass);
  useEffect(() => { klassRef.current = klass; }, [klass]);
  const setClass = (next: CharacterClass) => {
    setKlass(next);
    setTalismanId("");
    setTalismanPath("Tümü");
  };
  useEffect(() => {
    const hydrate = () => {
      const params = new URLSearchParams(location.search);
      const requestedModule = params.get("module");
      const nextModule = requestedModule && moduleTabs.some((item) => item.id === requestedModule)
        ? requestedModule as MainModule
        : null;
      setActiveModule(nextModule);
      const requestedItem = params.get("item");
      setDetail(nextModule === "items" && requestedItem ? items.find((item) => item.id === requestedItem) ?? null : null);
      const requestedTalisman = params.get("talisman");
      if (nextModule === "engine" && requestedTalisman) {
        const talisman = talismans.find((item) => item.id === requestedTalisman);
        if (talisman) {
          if (klassRef.current !== talisman.class) setClass(talisman.class);
          setTalismanId(talisman.id);
        } else setTalismanId("");
      } else if (nextModule === "engine") setTalismanId("");
      const requestedQuest = params.get("quest");
      if (nextModule === "quests" && requestedQuest) {
        const quest = quests.find((item) => item.id === requestedQuest);
        setQuestSearchSeed(quest?.title ?? "");
      } else if (nextModule === "quests") setQuestSearchSeed("");
      const requestedAbility = params.get("ability");
      if (nextModule === "skills" && requestedAbility) {
        const ability = abilityRows.find((item) => item.id === requestedAbility)
          ?? abilityVariantRows.find((item) => item.id === requestedAbility);
        if (ability) {
          if (klassRef.current !== ability.class) setClass(ability.class as CharacterClass);
          setAbilitySearchSeed(ability.id);
        } else setAbilitySearchSeed("");
      } else if (nextModule === "skills") setAbilitySearchSeed("");
      const requestedRegion = params.get("region");
      if (nextModule === "group-regions" && requestedRegion) setRegionSearchSeed(`${requestedRegion}|||${params.get("boss") ?? ""}`);
      else if (nextModule === "group-regions") setRegionSearchSeed("");
      const saved = params.get("build");
      if (nextModule === "builder") setBuilderSeed((current) => ({ revision: current.revision + 1, code: saved ?? "" }));
      let targetId = location.hash.slice(1);
      try { targetId = decodeURIComponent(targetId); } catch { /* Ignore malformed hashes. */ }
      if (targetId) requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView()));
    };
    queueMicrotask(hydrate);
    addEventListener(APP_NAVIGATION_EVENT, hydrate);
    addEventListener("popstate", hydrate);
    return () => {
      removeEventListener(APP_NAVIGATION_EVENT, hydrate);
      removeEventListener("popstate", hydrate);
    };
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
        setDetail(null);
        const url = new URL(location.href);
        if (url.searchParams.has("item")) {
          url.searchParams.delete("item");
          history.replaceState(null, "", url);
        }
      }
    };
    addEventListener("keydown", openSearch);
    return () => removeEventListener("keydown", openSearch);
  }, []);
  const openSiteMenu = () => {
      const activeGroup = activeModule
        ? moduleGroups.find((group) => group.ids.includes(activeModule))
        : null;
      setMenuGroup(activeGroup?.label ?? "Bilgi");
      setMoreOpen(true);
    },
    openModule = (id: MainModule, searchParams?: Record<string, string>) => {
      setActiveModule(id);
      if (id === "recipes") setRecipeRevision((value) => value + 1);
      if (id === "atlas") setAtlasRevision((value) => value + 1);
      if (id === "mining") setMiningRevision((value) => value + 1);
      setMoreOpen(false);
      setSearchOpen(false);
      const url = new URL(location.href);
      url.searchParams.set("module", id);
      ROUTE_DETAIL_PARAMS.forEach((key) => url.searchParams.delete(key));
      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value));
      }
      url.hash = id;
      if (url.href === location.href) history.replaceState(null, "", url);
      else history.pushState(null, "", url);
    },
    goHome = () => {
      setActiveModule(null);
      setMoreOpen(false);
      setSearchOpen(false);
      if (`${location.pathname}${location.search}${location.hash}` === location.pathname) history.replaceState(null, "", location.pathname);
      else history.pushState(null, "", location.pathname);
    },
    normalizedGlobalQuery = normalizeSearch(globalQuery),
    globalModuleResults = normalizedGlobalQuery
      ? moduleTabs.filter((item) => matchesSearch(`${item.label} ${item.summary} ${item.keywords}`, globalQuery)).slice(0, 8)
      : moduleTabs.filter((item) => quickModuleIds.includes(item.id)),
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
    globalRecipeResults = normalizedGlobalQuery
      ? [
          ...recipes.map((recipe) => {
            const item = publishableItems.find((row) => row.id === recipe.itemId);
            return { id: recipe.itemId, kind: "item" as const, name: item?.name ?? recipe.itemId, description: `${item?.class ?? ""} · Eşya · ${recipe.materials.length} malzeme`, search: recipe.materials.map((material) => material.name).join(" ") };
          }),
          ...craftedMaterialRecipes.map((recipe, index) => {
            const item = craftedMaterialSources[index];
            return { id: recipe.itemId, kind: "item" as const, name: item?.name ?? recipe.itemId, description: `${item?.profession ?? ""} · Ara malzeme · ${recipe.materials.length} girdi`, search: recipe.materials.map((material) => material.name).join(" ") };
          }),
          ...talismanRecipes.map((recipe) => {
            const item = talismans.find((row) => row.id === recipe.itemId);
            return { id: recipe.itemId, kind: "talisman" as const, name: item?.name ?? recipe.itemId, description: `${item?.class ?? ""} · Tılsım · ${recipe.materials.length} malzeme`, search: recipe.materials.map((material) => material.name).join(" ") };
          }),
          ...potionRecipes.map((recipe) => ({
            id: recipe.itemId,
            kind: "potion" as const,
            name: recipe.name,
            description: `Sv. ${recipe.level} · ${recipe.category} · ${recipe.materials.length} malzeme`,
            search: recipe.materials.map((material) => material.name).join(" "),
          })),
        ].filter((item) => matchesSearch(`${item.name} ${item.description} ${item.search}`, globalQuery)).slice(0, 8)
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
      (categoryVisible("Reçeteler") ? globalRecipeResults.length : 0) +
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
    visibleItems = filtered.slice(0, itemVisibleLimit),
    compareItems = compareIds
      .map((id) => items.find((i) => i.id === id))
      .filter((item): item is Item => Boolean(item)),
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
        <Link className="brand" href="/" aria-label="Nefer Atlası ana sayfa">
          <b className="brandMark">N</b>
          <span className="brandName">
            <strong>NEFER ATLASI</strong>
            <small>KÖ BİLGİ PLATFORMU</small>
          </span>
        </Link>
        <nav className="top-status" aria-label="Açık modül">
          <button className="globalSearchTrigger" type="button" onClick={() => setSearchOpen(true)} aria-label="Atlas genelinde ara">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/></svg>
            <b>Atlas’ta ara</b>
            <small aria-hidden="true">/</small>
          </button>
          <button className="siteMenuTrigger" type="button" aria-expanded={moreOpen} onClick={() => moreOpen ? setMoreOpen(false) : openSiteMenu()}>Menü <i aria-hidden="true">{moreOpen ? "×" : "+"}</i></button>
        </nav>
      </header>
      {moreOpen && <div className="siteMenuOverlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setMoreOpen(false)}><aside className="siteMenu" role="dialog" aria-modal="true" aria-label="Site menüsü"><header><span><small>NEFER ATLASI</small><h2>Bölümler</h2></span><button type="button" onClick={() => setMoreOpen(false)} aria-label="Menüyü kapat">×</button></header><nav className="siteMenuGroups" aria-label="Bölüm grupları">{moduleGroups.map((group) => <button type="button" key={group.label} className={menuGroup === group.label ? "active" : ""} aria-pressed={menuGroup === group.label} onClick={() => setMenuGroup(group.label)}><span>{group.label}</span><small>{group.ids.length}</small></button>)}</nav><div className="siteMenuPanel">{moduleGroups.filter((group) => group.label === menuGroup).map((group) => <section key={group.label}><header><b>{group.label}</b><small>{group.note} · {group.ids.length} bölüm</small></header>{group.ids.map((id) => { const item = moduleTabs.find((row) => row.id === id); return item && <button type="button" key={id} className={activeModule === id ? "active" : ""} onClick={() => openModule(id)}><span><b>{item.label}</b><small>{item.summary}</small></span><i>→</i></button>; })}</section>)}</div><footer><a href="/uretim">Üretim takibi</a><a href="/rehber">Kullanım rehberi</a><a href="https://kiyametoyun.net/" target="_blank" rel="noreferrer">Oyuna git ↗</a></footer></aside></div>}

      {activeModule === null ? <>
        <section className="homeGateway" id="top">
          <div><small>KÖ BİLGİ PLATFORMU</small><h1>Ne arıyorsun?</h1><p>Önce bilgiyi seç. Ayrıntılar yalnız açtığında görünür.</p></div>
          <button className="gatewaySearch" type="button" onClick={() => setSearchOpen(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/></svg><span><b>Atlas’ta ara</b><small>Eşya, tılsım, reçete, görev, maden veya boss</small></span><kbd>/</kbd></button>
          <nav className="gatewayChoices" id="modules" aria-label="Hızlı bölümler">{quickModuleIds.map((id) => { const item = moduleTabs.find((row) => row.id === id)!; return <button type="button" onClick={() => openModule(id)} key={id}><span><b>{item.label}</b><small>{item.summary}</small></span><i>→</i></button>; })}</nav>
          <button className="gatewayMore" type="button" onClick={openSiteMenu}>Diğer araçları ve proje bölümlerini aç</button>
        </section>
        <AdSlot placement="home_top" />
      </> : <nav className="moduleContext" id="modules" aria-label="Açık bölüm"><button type="button" onClick={goHome}>← Ana sayfa</button><b>{moduleTabs.find((item) => item.id === activeModule)?.label}</b><button type="button" onClick={openSiteMenu}>Diğer bölümler</button></nav>}
      {activeModule === "builder" && (
        <EquipmentBuilder
          key={builderSeed.revision}
          initialClass={klass}
          initialTalismanId={talismanId}
          initialBuildCode={builderSeed.code}
          onClassChange={setKlass}
          onTalismanChange={setTalismanId}
        />
      )}
      {activeModule === "engine" && <section className="engine" id="engine">
        <Title
          eyebrow="TILSIM REHBERİ"
          title="Ne işe yarar, nereden elde edilir?"
        >
          <span className="count">{talismans.length} tılsım · etki ve edinme bilgisi</span>
        </Title>
        <TalismanProductionAtlas klass={klass} initialTalismanId={talismanId} onClassChange={setClass} />
      </section>}
      {activeModule === "recipes" && <RecipeCatalog key={recipeRevision} />}
      {activeModule === "group-regions" && <GroupRegions key={regionSearchSeed} initialRegionName={regionSearchSeed.split("|||")[0]} initialBossName={regionSearchSeed.split("|||")[1]} onOpen={setDetail} />}
      {activeModule === "quests" && <QuestAtlas key={questSearchSeed} initialQuery={questSearchSeed} />}
      {activeModule === "endgame" && <EndgameLab />}
      {activeModule === "mining" && <MiningGuide key={miningRevision} />}
      {activeModule === "economy" && <EconomyWorkshop />}
      {activeModule === "sustainability" && <SustainabilityHub />}
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
              onChange={(e) => { setQuery(e.target.value); setItemVisibleLimit(24); }}
              placeholder="Eşya, sınıf veya yuva…"
            />
            <select
              aria-label="Sınıfa göre filtrele"
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setItemVisibleLimit(24);
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
                setItemVisibleLimit(24);
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
        <details className="catalogAuditDisclosure"><summary>Doğrulama notunu aç <i>+</i></summary><p><b>“Tek kaynak” etiketi kesin bilgi anlamına gelmez.</b> Bu kayıtlar ikinci bağımsız kaynak veya aynı eşya adını gösteren oyun içi ekran görüntüsü gelene kadar teyit bekler; çelişkili değerler hesaplara alınmaz. Çemberlitaş adları resmî eşya listeleriyle, Sığınaklar ve Migrat adları sınıf ganimet tablolarıyla karşılaştırıldı. “Farabi Modeli Farabi Modeli” gibi tekrarlar kaynakta çift efsunu ifade ettiği için otomatik olarak silinmez.</p></details>
        <p className="visualFamilyPolicy"><b>Tekrarsız görsel sistemi:</b> {publishableItems.length} eşya, {itemFamilyInventory.length} görünüş ailesine bağlandı. Her gövde için bir görsel yeterli; efsun ve özellikler eşya kaydında ayrı kalır.</p>
        <p className="resultCount">
          {visibleItems.length}/{filtered.length} eşya gösteriliyor · Aynı sınıf ve yuvadan iki eşyayı
          karşılaştırabilirsin.
        </p>
        {notice && <p className="notice">{notice}</p>}
        {compareItems.length > 0 && (
          <ComparePanel items={compareItems} clear={() => setCompareIds([])} />
        )}
        <div className="cards">
          {visibleItems.map((item) => (
            <ItemCard
              item={item}
              compared={compareIds.includes(item.id)}
              onCompare={toggleCompare}
              onOpen={setDetail}
              key={item.id}
            />
          ))}
        </div>
        {visibleItems.length < filtered.length && <button className="catalogMore" type="button" onClick={() => setItemVisibleLimit((value) => value + 24)}>24 eşya daha göster <span>{filtered.length - visibleItems.length} kaldı</span></button>}
        {filtered.length === 0 && (
          <p className="emptyResult">
            Bu filtrelerle eşleşen kaynaklı eşya yok.
          </p>
        )}
      </section>}
      {activeModule === "atlas" && <ConnectedAtlas key={atlasRevision} />}
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
            {categoryVisible("Reçeteler") && globalRecipeResults.length > 0 && <section><h3>Reçeteler</h3>{globalRecipeResults.map((item) => <button type="button" key={`${item.kind}-${item.id}`} onClick={() => openModule("recipes", { kind: item.kind, recipe: item.id })}><span><b>{item.name}</b><small>{item.description}</small></span><i>→</i></button>)}</section>}
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
      {activeModule !== null && <AdSlot placement="home_inline" />}
      <footer className="siteFooter">
        <div>
          <b>NEFER ATLASI</b>
          <span>{SITE_RELEASE.channel} v{SITE_RELEASE.version} · {SITE_RELEASE.releasedAt}</span>
          <span>Bağımsız Kıyametin Öncüleri topluluk projesi · resmî değildir.</span>
        </div>
        <p>Kaynak yoksa kesin bilgi yok. Ayrıntı ve doğrulama, yalnız ilgili kaydı açtığında gösterilir.</p>
        <details className="footerDetails"><summary>Bağlantılar ve yönetim <i>+</i></summary><div className="footerTools"><a href="https://kiyametoyun.net/" target="_blank" rel="noreferrer">Güncel Oyun Portalı</a><a href="/uretim">Üretim Takibi</a><a href="/kaynaklar">Kaynaklar</a><a href="/rehber">Kullanım Rehberi</a><a href="/gizlilik">Gizlilik</a><a href="/farm-operasyonu">Editör: Saha Operasyonu</a><a href="/katki-inceleme">Editör Masası</a><a href="/istatistik/giris">Yönetici Girişi</a><ReleaseCenter inline /></div></details>
      </footer>
      {detail && <ItemModal item={detail} close={() => {
        setDetail(null);
        const url = new URL(location.href);
        url.searchParams.delete("item");
        history.replaceState(null, "", url);
      }} />}
    </main>
  );
}
