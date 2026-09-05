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
import RecipeCatalog from "./RecipeCatalog";
import EquipmentBuilder from "./equipment-builder";
import GlobalSearch from "./global-search";
import GroupRegions from "./group-regions";
import ItemExplorer from "./item-explorer";
import { ItemModal } from "./item-explorer-parts";
import TalismanGuide from "./talisman-guide";
import { CharacterProvider } from "./character-context";
import { useAtlasNavigation } from "./use-atlas-navigation";
import { SiteHeader, SiteMenu } from "./site-navigation";
import { moduleTabs, quickModuleIds, type MainModule } from "./site-modules";
import { useEffect, useState } from "react";
import { SITE_RELEASE } from "../lib/site-release";
function HomeContent() {
  const navigation = useAtlasNavigation();
  const { activeModule, setExternalDetail } = navigation;
  const [moreOpen, setMoreOpen] = useState(false), [searchOpen, setSearchOpen] = useState(false);
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
  }, [setExternalDetail]);
  const openModule = (id: MainModule, searchParams?: Record<string, string>) => {
      navigation.openModule(id, searchParams);
      setMoreOpen(false);
      setSearchOpen(false);
    },
    goHome = () => {
      navigation.goHome();
      setMoreOpen(false);
      setSearchOpen(false);
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
          key={navigation.builderSeed.revision}
          initialClass={navigation.klass}
          initialTalismanId={navigation.talismanId}
          initialBuildCode={navigation.builderSeed.code}
          onClassChange={navigation.setClass}
          onTalismanChange={navigation.setTalismanId}
        />
      )}
      {activeModule === "engine" && <TalismanGuide />}
      {activeModule === "recipes" && <RecipeCatalog key={navigation.recipeRevision} />}
      {activeModule === "group-regions" && <GroupRegions key={navigation.regionSearchSeed} initialRegionName={navigation.regionSearchSeed.split("|||")[0]} initialBossName={navigation.regionSearchSeed.split("|||")[1]} onOpen={navigation.setExternalDetail} />}
      {activeModule === "quests" && <QuestAtlas key={navigation.questSearchSeed} initialQuery={navigation.questSearchSeed} />}
      {activeModule === "endgame" && <EndgameLab />}
      {activeModule === "mining" && <MiningGuide key={navigation.miningRevision} />}
      {activeModule === "economy" && <EconomyWorkshop />}
      {activeModule === "sustainability" && <SustainabilityHub />}
      {activeModule === "skills" && <SkillGuides key={navigation.abilitySearchSeed} klass={navigation.klass} initialAbilityId={navigation.abilitySearchSeed} onClassChange={navigation.setClass} />}
      {activeModule === "issues" && <IssueDesk />}
      {activeModule === "health" && <ProjectScorecard />}
      {activeModule === "contribute" && <ContributionCenter />}
      {activeModule === "items" && <ItemExplorer key={navigation.itemSeed.revision} initialItemId={navigation.itemSeed.id} focusInitialItem={navigation.itemSeed.focus} onCloseItem={navigation.closeItem} />}
      {activeModule === "atlas" && <ConnectedAtlas key={navigation.atlasRevision} />}
      {searchOpen && (
        <GlobalSearch
          onClose={() => setSearchOpen(false)}
          onOpenModule={openModule}
          onOpenItem={(item) => { navigation.openItem(item); setSearchOpen(false); }}
          onOpenQuest={(title, id) => { navigation.openQuest(title, id); setSearchOpen(false); }}
          onOpenAbility={(klass, focusId, id) => { navigation.openAbility(klass, focusId, id); setSearchOpen(false); }}
          onOpenRegion={(region, boss) => { navigation.openRegion(region, boss); setSearchOpen(false); }}
          onOpenTalisman={(klass, id) => { navigation.openTalismanResult(klass, id); setSearchOpen(false); }}
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
      {navigation.externalDetail && <ItemModal item={navigation.externalDetail} close={() => setExternalDetail(null)} />}
    </main>
  );
}

export default function Home() {
  return <CharacterProvider><HomeContent /></CharacterProvider>;
}
