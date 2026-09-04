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
import ItemExplorer from "./item-explorer";
import { ItemModal } from "./item-explorer-parts";
import Title from "./section-title";
import { SiteHeader, SiteMenu } from "./site-navigation";
import { moduleTabs, quickModuleIds, type MainModule } from "./site-modules";
import { homeHref, moduleHref, readAtlasRoute, withoutItemHref } from "./atlas-routing";
import { useEffect, useRef, useState } from "react";
import {
  talismans,
  type Item,
  type CharacterClass,
} from "../lib/catalog";
import { SITE_RELEASE } from "../lib/site-release";
import { quests } from "../lib/quest-catalog";
import abilityRows from "../data/abilities.json";
import abilityVariantRows from "../data/ability-variants.json";
import { APP_NAVIGATION_EVENT } from "../lib/navigation";
export default function Home() {
  const [klass, setKlass] = useState<CharacterClass>("Büyücü"),
    [talismanId, setTalismanId] = useState(""),
    [, setTalismanPath] = useState("Tümü"),
    [externalDetail, setExternalDetail] = useState<Item | null>(null),
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
    [itemSeed, setItemSeed] = useState({ revision: 0, id: "", focus: false });
  const klassRef = useRef(klass);
  useEffect(() => { klassRef.current = klass; }, [klass]);
  const setClass = (next: CharacterClass) => {
    setKlass(next);
    setTalismanId("");
    setTalismanPath("Tümü");
  };
  useEffect(() => {
    const hydrate = () => {
      const route = readAtlasRoute(location.href);
      const nextModule = route.module;
      setActiveModule(nextModule);
      setExternalDetail(null);
      if (nextModule === "items") setItemSeed((current) => ({ revision: current.revision + 1, id: route.itemId, focus: false }));
      if (nextModule === "engine" && route.talismanId) {
        const talisman = talismans.find((item) => item.id === route.talismanId);
        if (talisman) {
          if (klassRef.current !== talisman.class) setClass(talisman.class);
          setTalismanId(talisman.id);
        } else setTalismanId("");
      } else if (nextModule === "engine") setTalismanId("");
      if (nextModule === "quests" && route.questId) {
        const quest = quests.find((item) => item.id === route.questId);
        setQuestSearchSeed(quest?.title ?? "");
      } else if (nextModule === "quests") setQuestSearchSeed("");
      if (nextModule === "skills" && route.abilityId) {
        const ability = abilityRows.find((item) => item.id === route.abilityId)
          ?? abilityVariantRows.find((item) => item.id === route.abilityId);
        if (ability) {
          if (klassRef.current !== ability.class) setClass(ability.class as CharacterClass);
          setAbilitySearchSeed(ability.id);
        } else setAbilitySearchSeed("");
      } else if (nextModule === "skills") setAbilitySearchSeed("");
      if (nextModule === "group-regions" && route.regionName) setRegionSearchSeed(`${route.regionName}|||${route.bossName}`);
      else if (nextModule === "group-regions") setRegionSearchSeed("");
      if (nextModule === "builder") setBuilderSeed((current) => ({ revision: current.revision + 1, code: route.buildCode }));
      if (route.hashTarget) requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(route.hashTarget)?.scrollIntoView()));
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
        setExternalDetail(null);
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
      const nextHref = moduleHref(location.href, id, searchParams);
      if (nextHref === location.href) history.replaceState(null, "", nextHref);
      else history.pushState(null, "", nextHref);
    },
    goHome = () => {
      setActiveModule(null);
      setMoreOpen(false);
      setSearchOpen(false);
      const nextHref = homeHref(location.href);
      if (nextHref === location.href) history.replaceState(null, "", nextHref);
      else history.pushState(null, "", nextHref);
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
      {activeModule === "group-regions" && <GroupRegions key={regionSearchSeed} initialRegionName={regionSearchSeed.split("|||")[0]} initialBossName={regionSearchSeed.split("|||")[1]} onOpen={setExternalDetail} />}
      {activeModule === "quests" && <QuestAtlas key={questSearchSeed} initialQuery={questSearchSeed} />}
      {activeModule === "endgame" && <EndgameLab />}
      {activeModule === "mining" && <MiningGuide key={miningRevision} />}
      {activeModule === "economy" && <EconomyWorkshop />}
      {activeModule === "sustainability" && <SustainabilityHub />}
      {activeModule === "skills" && <SkillGuides key={abilitySearchSeed} klass={klass} initialAbilityId={abilitySearchSeed} onClassChange={setClass} />}
      {activeModule === "issues" && <IssueDesk />}
      {activeModule === "health" && <ProjectScorecard />}
      {activeModule === "contribute" && <ContributionCenter />}
      {activeModule === "items" && <ItemExplorer key={itemSeed.revision} initialItemId={itemSeed.id} focusInitialItem={itemSeed.focus} onCloseItem={() => history.replaceState(null, "", withoutItemHref(location.href))} />}
      {activeModule === "atlas" && <ConnectedAtlas key={atlasRevision} />}
      {searchOpen && (
        <GlobalSearch
          onClose={() => setSearchOpen(false)}
          onOpenModule={openModule}
          onOpenItem={(item) => {
            setItemSeed((current) => ({ revision: current.revision + 1, id: item.id, focus: true }));
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
      {externalDetail && <ItemModal item={externalDetail} close={() => setExternalDetail(null)} />}
    </main>
  );
}
