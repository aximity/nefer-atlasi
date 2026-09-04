"use client";

import { useState } from "react";
import abilityRows from "../data/abilities.json";
import abilityVariantRows from "../data/ability-variants.json";
import {
  itemRecipe,
  publishableItems,
  publishableStats,
  recipes,
  talismanAcquisition,
  talismans,
  type CharacterClass,
  type Item,
} from "../lib/catalog";
import { gatheringRegionFor, gatheringRows } from "../lib/gathering-catalog";
import { GROUP_REGION_DEFINITIONS } from "../lib/group-region-loot.mjs";
import { craftedMaterialRecipes, craftedMaterialSources, creatureDropSources } from "../lib/material-sources";
import { potionRecipes } from "../lib/potion-recipes";
import { quests } from "../lib/quest-catalog";
import { matchesSearch, normalizeSearch } from "../lib/search";
import { talismanRecipes } from "../lib/talisman-recipes";
import { moduleTabs, quickModuleIds, type MainModule } from "./site-modules";

const searchFilters = ["Tümü", "Bölümler", "Eşyalar", "Reçeteler", "Görevler", "Yetenekler", "Madenler", "Bölgeler", "Tılsımlar"] as const;
type SearchFilter = (typeof searchFilters)[number];

export default function GlobalSearch({
  onClose,
  onOpenModule,
  onOpenItem,
  onOpenQuest,
  onOpenAbility,
  onOpenRegion,
  onOpenTalisman,
}: {
  onClose: () => void;
  onOpenModule: (id: MainModule, params?: Record<string, string>) => void;
  onOpenItem: (item: Item) => void;
  onOpenQuest: (title: string, id: string) => void;
  onOpenAbility: (klass: CharacterClass, focusId: string, id: string) => void;
  onOpenRegion: (region: string, boss: string) => void;
  onOpenTalisman: (klass: CharacterClass, id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("Tümü");
  const normalizedQuery = normalizeSearch(query);
  const moduleResults = normalizedQuery
    ? moduleTabs.filter((item) => matchesSearch(`${item.label} ${item.summary} ${item.keywords}`, query)).slice(0, 8)
    : moduleTabs.filter((item) => quickModuleIds.includes(item.id));
  const itemResults = normalizedQuery
    ? publishableItems.filter((item) => {
        const recipe = itemRecipe(item.id);
        return matchesSearch([
          item.name, item.class, item.slot, item.region, item.boss, item.acquisition,
          ...publishableStats(item.id).map((stat) => stat.attribute),
          ...(recipe?.materials.map((material) => material.name) ?? []),
        ].filter(Boolean).join(" "), query);
      }).slice(0, 8)
    : [];
  const talismanResults = normalizedQuery
    ? talismans.filter((item) => matchesSearch(`${item.name} ${item.class} ${item.color} ${item.series} ${item.effectText} ${talismanAcquisition(item)}`, query)).slice(0, 8)
    : [];
  const recipeResults = normalizedQuery
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
        ...potionRecipes.map((recipe) => ({ id: recipe.itemId, kind: "potion" as const, name: recipe.name, description: `Sv. ${recipe.level} · ${recipe.category} · ${recipe.materials.length} malzeme`, search: recipe.materials.map((material) => material.name).join(" ") })),
      ].filter((item) => matchesSearch(`${item.name} ${item.description} ${item.search}`, query)).slice(0, 8)
    : [];
  const questResults = normalizedQuery
    ? quests.filter((item) => matchesSearch([
        item.title, String(item.level), `seviye ${item.level} görev`, item.giver, item.location, item.region, item.track, item.objective, item.note,
        ...Object.values(item.reward ?? {}),
      ].filter(Boolean).join(" "), query)).slice(0, 8)
    : [];
  const abilityResults = normalizedQuery
    ? [
        ...abilityRows.map((item) => ({ id: item.id, focusId: item.id, name: item.name, class: item.class, level: item.unlockLevel, description: item.roles.join(" · ") })),
        ...abilityVariantRows.map((item) => {
          const replaced = abilityRows.find((ability) => ability.id === item.replacesAbilityId);
          return { id: item.id, focusId: item.id, name: item.name, class: item.class, level: replaced?.unlockLevel ?? 20, description: `${replaced?.name ?? "Temel yetenek"} yerine geçen KÖ varyantı` };
        }),
      ].filter((item) => matchesSearch(`${item.name} ${item.class} ${item.level} ${item.description}`, query)).slice(0, 8)
    : [];
  const materialResults = normalizedQuery
    ? [
        ...gatheringRows.flatMap((row) => [row.base, row.second, row.third].filter(Boolean).map((name) => ({ id: `${row.profession}-${name}`, name: String(name), description: `${row.profession} · ${gatheringRegionFor(row)} · ${row.points} puan`, target: "mining" as const }))),
        ...creatureDropSources.map((item) => ({ id: `drop-${item.name}`, name: item.name, description: `${item.region} · ${item.enemy} · ${item.usage}`, aliases: item.aliases?.join(" ") ?? "", target: "atlas" as const })),
      ].filter((item) => matchesSearch(`${item.name} ${item.description} ${"aliases" in item ? item.aliases : ""}`, query)).slice(0, 8)
    : [];
  const regionResults = normalizedQuery
    ? GROUP_REGION_DEFINITIONS.flatMap((region) => [
        { id: `region-${region.name}`, name: region.name, region: region.name, boss: "", description: `${region.bossCount} boss · ${region.encounterCount} karşılaşma` },
        ...region.bosses.map((boss) => ({ id: `boss-${region.name}-${boss}`, name: boss, region: region.name, boss, description: `${region.name} bossu` })),
      ]).filter((item) => matchesSearch(`${item.name} ${item.region} ${item.description}`, query)).slice(0, 8)
    : [];
  const categoryVisible = (category: SearchFilter) => filter === "Tümü" || filter === category;
  const resultCount =
    (categoryVisible("Bölümler") ? moduleResults.length : 0) +
    (categoryVisible("Eşyalar") ? itemResults.length : 0) +
    (categoryVisible("Reçeteler") ? recipeResults.length : 0) +
    (categoryVisible("Görevler") ? questResults.length : 0) +
    (categoryVisible("Yetenekler") ? abilityResults.length : 0) +
    (categoryVisible("Madenler") ? materialResults.length : 0) +
    (categoryVisible("Bölgeler") ? regionResults.length : 0) +
    (categoryVisible("Tılsımlar") ? talismanResults.length : 0);

  return (
    <div className="globalSearchOverlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="globalSearch" role="dialog" aria-modal="true" aria-label="Atlas genelinde ara">
        <header>
          <label><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/></svg><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ne arıyorsun? Örn. Gaffar asa…" /></label>
          <button type="button" onClick={onClose} aria-label="Aramayı kapat">×</button>
        </header>
        <div className="globalSearchFilters" aria-label="Arama türü">{searchFilters.map((item) => <button type="button" key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <p className="globalSearchHint">Birden fazla kelimeyi birlikte süzer: “Gaffar asa”, “20 seviye görev” veya “Büyük Hol maden”.</p>
        <div className="globalSearchResults">
          {categoryVisible("Bölümler") && moduleResults.length > 0 && <section><h3>Bölümler</h3>{moduleResults.map((item) => <button type="button" key={item.id} onClick={() => onOpenModule(item.id)}><span><b>{item.label}</b><small>{item.summary}</small></span><i>→</i></button>)}</section>}
          {categoryVisible("Eşyalar") && itemResults.length > 0 && <section><h3>Eşyalar</h3>{itemResults.map((item) => <button type="button" key={item.id} onClick={() => onOpenItem(item)}><span><b>{item.name}</b><small>{item.class} · {item.slot}{item.boss ? ` · ${item.boss}` : ""}</small></span><i>↗</i></button>)}</section>}
          {categoryVisible("Reçeteler") && recipeResults.length > 0 && <section><h3>Reçeteler</h3>{recipeResults.map((item) => <button type="button" key={`${item.kind}-${item.id}`} onClick={() => onOpenModule("recipes", { kind: item.kind, recipe: item.id })}><span><b>{item.name}</b><small>{item.description}</small></span><i>→</i></button>)}</section>}
          {categoryVisible("Görevler") && questResults.length > 0 && <section><h3>Görevler</h3>{questResults.map((item) => <button type="button" key={item.id} onClick={() => onOpenQuest(item.title, item.id)}><span><b>{item.title}</b><small>Sv. {item.level} · {item.giver} · {item.location}</small></span><i>→</i></button>)}</section>}
          {categoryVisible("Yetenekler") && abilityResults.length > 0 && <section><h3>Yetenekler</h3>{abilityResults.map((item) => <button type="button" key={item.id} onClick={() => onOpenAbility(item.class as CharacterClass, item.focusId, item.id)}><span><b>{item.name}</b><small>{item.class} · Sv. {item.level} · {item.description}</small></span><i>→</i></button>)}</section>}
          {categoryVisible("Madenler") && materialResults.length > 0 && <section><h3>Maden ve materyaller</h3>{materialResults.map((item) => <button type="button" key={item.id} onClick={() => item.target === "mining" ? onOpenModule("mining", { view: "Kaynaklar", material: item.name }) : onOpenModule("atlas", { node: `material:${item.name.toLocaleLowerCase("tr-TR")}` })}><span><b>{item.name}</b><small>{item.description}</small></span><i>→</i></button>)}</section>}
          {categoryVisible("Bölgeler") && regionResults.length > 0 && <section><h3>Bölgeler ve bosslar</h3>{regionResults.map((item) => <button type="button" key={item.id} onClick={() => onOpenRegion(item.region, item.boss)}><span><b>{item.name}</b><small>{item.description}</small></span><i>→</i></button>)}</section>}
          {categoryVisible("Tılsımlar") && talismanResults.length > 0 && <section><h3>Tılsımlar</h3>{talismanResults.map((item) => <button type="button" key={item.id} onClick={() => onOpenTalisman(item.class, item.id)}><span><b>{item.name}</b><small>{item.class} · {item.color} · {talismanAcquisition(item)}</small></span><i>→</i></button>)}</section>}
          {normalizedQuery && resultCount === 0 && <div className="globalSearchEmpty"><b>Bu filtrede sonuç bulunamadı.</b><span>“Tümü”nü seç veya daha kısa bir kelime dene.</span></div>}
        </div>
        <footer><span><kbd>/</kbd> ile aç</span><span><kbd>Esc</kbd> ile kapat</span></footer>
      </section>
    </div>
  );
}
