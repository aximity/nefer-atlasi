"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import abilityRows from "../data/abilities.json";
import abilityVariantRows from "../data/ability-variants.json";
import { type CharacterClass, type Item } from "../lib/catalog";
import { APP_NAVIGATION_EVENT } from "../lib/navigation";
import { quests } from "../lib/quest-catalog";
import { homeHref, moduleHref, readAtlasRoute, withoutItemHref } from "./atlas-routing";
import { useCharacter } from "./character-context";
import { type MainModule } from "./site-modules";

export function useAtlasNavigation() {
  const { klass, talismanId, setClass, setTalismanId, openTalisman } = useCharacter();
  const [activeModule, setActiveModule] = useState<MainModule | null>(null);
  const [externalDetail, setExternalDetail] = useState<Item | null>(null);
  const [questSearchSeed, setQuestSearchSeed] = useState("");
  const [abilitySearchSeed, setAbilitySearchSeed] = useState("");
  const [regionSearchSeed, setRegionSearchSeed] = useState("");
  const [recipeRevision, setRecipeRevision] = useState(0);
  const [atlasRevision, setAtlasRevision] = useState(0);
  const [miningRevision, setMiningRevision] = useState(0);
  const [builderSeed, setBuilderSeed] = useState({ revision: 0, code: "" });
  const [itemSeed, setItemSeed] = useState({ revision: 0, id: "", focus: false });
  const klassRef = useRef(klass);
  useEffect(() => { klassRef.current = klass; }, [klass]);

  useEffect(() => {
    const hydrate = () => {
      const route = readAtlasRoute(location.href);
      const nextModule = route.module;
      setActiveModule(nextModule);
      setExternalDetail(null);
      if (nextModule === "items") setItemSeed((current) => ({ revision: current.revision + 1, id: route.itemId, focus: false }));
      if (nextModule === "engine" && route.talismanId) openTalisman(route.talismanId);
      else if (nextModule === "engine") setTalismanId("");
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
  }, [openTalisman, setClass, setTalismanId]);

  const openModule = useCallback((id: MainModule, searchParams?: Record<string, string>) => {
    setActiveModule(id);
    setExternalDetail(null);
    if (id === "recipes") setRecipeRevision((value) => value + 1);
    if (id === "atlas") setAtlasRevision((value) => value + 1);
    if (id === "mining") setMiningRevision((value) => value + 1);
    const nextHref = moduleHref(location.href, id, searchParams);
    if (nextHref === location.href) history.replaceState(null, "", nextHref);
    else history.pushState(null, "", nextHref);
  }, []);
  const goHome = useCallback(() => {
    setActiveModule(null);
    setExternalDetail(null);
    const nextHref = homeHref(location.href);
    if (nextHref === location.href) history.replaceState(null, "", nextHref);
    else history.pushState(null, "", nextHref);
  }, []);
  const openItem = useCallback((item: Item) => {
    setItemSeed((current) => ({ revision: current.revision + 1, id: item.id, focus: true }));
    openModule("items", { item: item.id });
  }, [openModule]);
  const openQuest = useCallback((title: string, id: string) => {
    setQuestSearchSeed(title);
    openModule("quests", { quest: id });
  }, [openModule]);
  const openAbility = useCallback((nextClass: CharacterClass, focusId: string, id: string) => {
    setClass(nextClass);
    setAbilitySearchSeed(focusId);
    openModule("skills", { ability: id });
  }, [openModule, setClass]);
  const openRegion = useCallback((region: string, boss: string) => {
    setRegionSearchSeed(`${region}|||${boss}`);
    openModule("group-regions", { region, ...(boss ? { boss } : {}) });
  }, [openModule]);
  const openTalismanResult = useCallback((_nextClass: CharacterClass, id: string) => {
    openTalisman(id);
    openModule("engine", { talisman: id });
  }, [openModule, openTalisman]);
  const closeItem = useCallback(() => history.replaceState(null, "", withoutItemHref(location.href)), []);

  return {
    klass, talismanId, setClass, setTalismanId,
    activeModule, externalDetail, setExternalDetail,
    questSearchSeed, abilitySearchSeed, regionSearchSeed,
    recipeRevision, atlasRevision, miningRevision, builderSeed, itemSeed,
    openModule, goHome, openItem, openQuest, openAbility, openRegion, openTalismanResult, closeItem,
  };
}

export type AtlasNavigation = ReturnType<typeof useAtlasNavigation>;
