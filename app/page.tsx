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
import GlobalSearch from "./global-search";
import GroupRegions from "./group-regions";
import {
  ComparePanel,
  ItemCard,
  ItemModal,
} from "./item-explorer-parts";
import Title from "./section-title";
import { SiteHeader, SiteMenu } from "./site-navigation";
import { moduleTabs, quickModuleIds, type MainModule } from "./site-modules";
import { useEffect, useRef, useState } from "react";
import {
  items,
  publishableItems,
  talismans,
  type Item,
  type CharacterClass,
} from "../lib/catalog";
import { SITE_RELEASE } from "../lib/site-release";
import { quests } from "../lib/quest-catalog";
import abilityRows from "../data/abilities.json";
import abilityVariantRows from "../data/ability-variants.json";
import {
  itemVisualFamilyInventory,
} from "../lib/visual-families";
import { APP_NAVIGATION_EVENT, ROUTE_DETAIL_PARAMS } from "../lib/navigation";
const classes: CharacterClass[] = ["Savaşçı", "Büyücü", "Şifacı"];
const itemFamilyInventory = itemVisualFamilyInventory(publishableItems);
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
    [searchOpen, setSearchOpen] = useState(false),
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
  const openModule = (id: MainModule, searchParams?: Record<string, string>) => {
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
      <SiteHeader menuOpen={moreOpen} onOpenSearch={() => setSearchOpen(true)} onToggleMenu={() => setMoreOpen((open) => !open)} />
      {moreOpen && <SiteMenu activeModule={activeModule} onClose={() => setMoreOpen(false)} onOpenModule={openModule} />}

      {activeModule === null ? <>
        <section className="homeGateway" id="top">
          <div><small>KÖ BİLGİ PLATFORMU</small><h1>Ne arıyorsun?</h1><p>Önce bilgiyi seç. Ayrıntılar yalnız açtığında görünür.</p></div>
          <button className="gatewaySearch" type="button" onClick={() => setSearchOpen(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/></svg><span><b>Atlas’ta ara</b><small>Eşya, tılsım, reçete, görev, maden veya boss</small></span><kbd>/</kbd></button>
          <nav className="gatewayChoices" id="modules" aria-label="Hızlı bölümler">{quickModuleIds.map((id) => { const item = moduleTabs.find((row) => row.id === id)!; return <button type="button" onClick={() => openModule(id)} key={id}><span><b>{item.label}</b><small>{item.summary}</small></span><i>→</i></button>; })}</nav>
          <button className="gatewayMore" type="button" onClick={() => setMoreOpen(true)}>Diğer araçları ve proje bölümlerini aç</button>
        </section>
        <AdSlot placement="home_top" />
      </> : <nav className="moduleContext" id="modules" aria-label="Açık bölüm"><button type="button" onClick={goHome}>← Ana sayfa</button><b>{moduleTabs.find((item) => item.id === activeModule)?.label}</b><button type="button" onClick={() => setMoreOpen(true)}>Diğer bölümler</button></nav>}
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
      {searchOpen && (
        <GlobalSearch
          onClose={() => setSearchOpen(false)}
          onOpenModule={openModule}
          onOpenItem={(item) => {
            setQuery(item.name);
            setClassFilter(item.class === "Tüm Sınıflar" ? "Tümü" : item.class);
            setSlotFilter(item.slot);
            setDetail(item);
            openModule("items", { item: item.id });
          }}
          onOpenQuest={(title, id) => { setQuestSearchSeed(title); openModule("quests", { quest: id }); }}
          onOpenAbility={(nextClass, focusId, id) => { setClass(nextClass); setAbilitySearchSeed(focusId); openModule("skills", { ability: id }); }}
          onOpenRegion={(region, boss) => { setRegionSearchSeed(`${region}|||${boss}`); openModule("group-regions", { region, ...(boss ? { boss } : {}) }); }}
          onOpenTalisman={(nextClass, id) => { setClass(nextClass); setTalismanId(id); openModule("engine", { talisman: id }); }}
        />
      )}
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
