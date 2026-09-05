"use client";
import AdSlot from "./AdSlot";
import { HomeGateway, ModuleContext, SiteFooter } from "./site-shell";
import GlobalSearch from "./global-search";
import { CharacterProvider } from "./character-context";
import AtlasModuleSurface from "./module-surface";
import { useAtlasNavigation } from "./use-atlas-navigation";
import { SiteHeader, SiteMenu } from "./site-navigation";
import { type MainModule } from "./site-modules";
import { useEffect, useState } from "react";
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
        <HomeGateway onOpenSearch={() => setSearchOpen(true)} onOpenModule={openModule} onOpenMenu={() => setMoreOpen(true)} />
        <AdSlot placement="home_top" />
      </> : <ModuleContext activeModule={activeModule} onGoHome={goHome} onOpenMenu={() => setMoreOpen(true)} />}
      <AtlasModuleSurface navigation={navigation} />
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
      <SiteFooter />
    </main>
  );
}

export default function Home() {
  return <CharacterProvider><HomeContent /></CharacterProvider>;
}
