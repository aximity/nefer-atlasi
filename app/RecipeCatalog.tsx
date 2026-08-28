"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { publishableItems, recipes, sourceFor, talismans } from "../lib/catalog";
import { potionRecipeSourcePolicy } from "../lib/potion-index";
import { potionById, potionRecipes, potionRecipeSourceId } from "../lib/potion-recipes";
import { talismanRecipes } from "../lib/talisman-recipes";
import { itemVisualFamilyFor, potionVisualFamilies, potionVisualFamilyFor, talismanVisualFamilyFor } from "../lib/visual-families";

type RecipeKind = "item" | "talisman" | "potion";
const itemFavoriteKey = "nefer-production-favorites-v1";
const talismanFavoriteKey = "nefer-talisman-production-favorites-v1";
const potionFavoriteKey = "nefer-potion-production-favorites-v1";
const normalize = (value: string) => value.toLocaleLowerCase("tr-TR").trim();

const categoryRows = [
  { id: "item" as const, label: "Eşya", count: recipes.length, note: "Şaheser ve ekipman" },
  { id: "talisman" as const, label: "Tılsım", count: talismanRecipes.length, note: "II, III ve özel" },
  { id: "potion" as const, label: "İksir", count: potionRecipes.length, note: "Tam malzeme ve adet" },
];

const readList = (key: string) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
};

export default function RecipeCatalog() {
  const [kind, setKind] = useState<RecipeKind>("item");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [itemFavorites, setItemFavorites] = useState<string[]>([]);
  const [talismanFavorites, setTalismanFavorites] = useState<string[]>([]);
  const [potionFavorites, setPotionFavorites] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(18);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(location.search);
      const requestedKind = params.get("kind");
      const requestedRecipe = params.get("recipe") ?? "";
      if (["item", "talisman", "potion"].includes(requestedKind ?? "")) setKind(requestedKind as RecipeKind);
      if (requestedRecipe && requestedKind === "potion") setQuery(requestedRecipe);
      else if (requestedRecipe) setExpandedId(requestedRecipe);
      setItemFavorites(readList(itemFavoriteKey));
      setTalismanFavorites(readList(talismanFavoriteKey));
      setPotionFavorites(readList(potionFavoriteKey));
      setHydrated(true);
    });
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(itemFavoriteKey, JSON.stringify(itemFavorites)); }, [hydrated, itemFavorites]);
  useEffect(() => { if (hydrated) localStorage.setItem(talismanFavoriteKey, JSON.stringify(talismanFavorites)); }, [hydrated, talismanFavorites]);
  useEffect(() => { if (hydrated) localStorage.setItem(potionFavoriteKey, JSON.stringify(potionFavorites)); }, [hydrated, potionFavorites]);

  const itemById = useMemo(() => new Map(publishableItems.map((item) => [item.id, item])), []);
  const talismanById = useMemo(() => new Map(talismans.map((item) => [item.id, item])), []);
  const rows = useMemo(() => {
    const needle = normalize(query);
    const sourceRows = kind === "item" ? recipes : kind === "talisman" ? talismanRecipes : potionRecipes;
    return sourceRows.filter((recipe) => {
      const item = kind === "item" ? itemById.get(recipe.itemId) : kind === "talisman" ? talismanById.get(recipe.itemId) : potionById.get(recipe.itemId);
      const meta = item && "class" in item ? item.class : item && "category" in item ? item.category : "";
      return !needle || normalize(`${item?.name ?? recipe.itemId} ${meta} ${recipe.materials.map((material) => material.name).join(" ")}`).includes(needle);
    });
  }, [itemById, kind, query, talismanById]);
  const potionSource = sourceFor(potionRecipeSourceId);
  const activeFavorites = kind === "talisman" ? talismanFavorites : kind === "potion" ? potionFavorites : itemFavorites;
  const favoriteRows = favoritesOnly ? rows.filter((recipe) => activeFavorites.includes(recipe.itemId)) : rows;
  const orderedRows = [...favoriteRows].sort((a, b) => Number(b.itemId === expandedId) - Number(a.itemId === expandedId));
  const visibleRows = orderedRows.slice(0, visibleLimit);

  const chooseKind = (next: RecipeKind) => {
    setKind(next);
    setQuery("");
    setExpandedId("");
    setFavoritesOnly(false);
    setVisibleLimit(18);
    const url = new URL(location.href);
    url.searchParams.set("kind", next);
    url.searchParams.delete("recipe");
    history.replaceState(null, "", url);
  };
  const toggleFavorite = (itemId: string) => {
    const setter = kind === "talisman" ? setTalismanFavorites : kind === "potion" ? setPotionFavorites : setItemFavorites;
    setter((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
  };

  return <section className="recipeCatalog" id="recipes" aria-labelledby="recipe-title">
    <header className="recipeHead">
      <div><small>REÇETE KATALOĞU</small><h2 id="recipe-title">Önce türü seç.</h2><p>Yalnız seçtiğin reçete açılır; malzeme listeleri ilk ekranda yığılmaz.</p></div>
      <label><span>Reçete veya malzeme ara</span><input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleLimit(18); }} placeholder="Örn. Kondrit, Kıyamet Asa…" /></label>
    </header>

    <nav className="recipeKinds" aria-label="Reçete türü">
      {categoryRows.map((category) => <button type="button" className={kind === category.id ? "active" : ""} onClick={() => chooseKind(category.id)} key={category.id}><span><b>{category.label}</b><small>{category.note}</small></span><strong>{category.count}</strong></button>)}
    </nav>

    {kind === "potion" && <section className="potionIndex potionRecipeIntro">
      <header><div><small>İKSİR REÇETELERİ</small><h3>Malzeme ve adetler hazır.</h3></div>{potionSource && <a href={potionSource.url} target="_blank" rel="noreferrer">İKV Wiki reçeteleri ↗</a>}</header>
      <p><b>{potionRecipeSourcePolicy.label}.</b> {potionRecipes.length} iksir reçetesi seviye, tür, malzeme ve adetleriyle üretim hesabına bağlandı.</p>
      <div className="potionVisualLegend" aria-label="İksir görünüş aileleri">
        {potionVisualFamilies.map((family) => <article className={family.category ?? "support"} key={family.id}><i aria-hidden="true"/><span><small>ORTAK İKSİR GÖRÜNÜŞÜ</small><b>{family.label} · {family.color}</b><em>{family.sizeRule}</em></span></article>)}
      </div>
    </section>}
    <div className="recipeList">
      <div className="recipeCount"><p>{favoriteRows.length} reçete · ayrıntı için karta tıkla</p><button type="button" className={favoritesOnly ? "active" : ""} onClick={() => { setFavoritesOnly((value) => !value); setVisibleLimit(18); }}>★ Favorilerim</button></div>
      {visibleRows.map((recipe) => {
        const equipment = kind === "item" ? itemById.get(recipe.itemId) : undefined;
        const talisman = kind === "talisman" ? talismanById.get(recipe.itemId) : undefined;
        const potion = kind === "potion" ? potionById.get(recipe.itemId) : undefined;
        const item = equipment ?? talisman ?? potion;
        const visualFamily = equipment ? itemVisualFamilyFor(equipment) : talisman ? talismanVisualFamilyFor(talisman) : potion ? potionVisualFamilyFor(potion.visualCategory) : null;
        const favorite = activeFavorites.includes(recipe.itemId);
        const source = sourceFor(recipe.sourceId);
        return <article className="recipeRow" key={recipe.id}>
          <button type="button" className={favorite ? "recipeFavorite active" : "recipeFavorite"} onClick={() => toggleFavorite(recipe.itemId)} aria-label={favorite ? `${item?.name ?? recipe.itemId} favorilerden çıkar` : `${item?.name ?? recipe.itemId} favorilere ekle`}>{favorite ? "★" : "☆"}</button>
          <details open={expandedId === recipe.itemId} onToggle={(event) => setExpandedId(event.currentTarget.open ? recipe.itemId : expandedId === recipe.itemId ? "" : expandedId)}>
            <summary><span><small>{potion ? `Sv. ${potion.level} · ${potion.category}` : `${item && "class" in item ? item.class : "Sınıf yok"} · ${equipment?.slot ?? talisman?.color ?? (kind === "item" ? "Eşya" : "Tılsım")}`}</small><b>{item?.name ?? recipe.itemId}</b></span><em>{recipe.materials.length} malzeme</em><i>+</i></summary>
            <div className="recipeBody">
              {visualFamily && <p className="recipeVisualNote"><b>Görünüş ailesi:</b> {visualFamily.label}. {equipment ? "Efsun ve özellikler eşya kaydına aittir." : talisman ? "Sınıf, kademe ve etki tılsım kaydına aittir." : "İksirin etkisi ve seviyesi metin alanında ayrılır."}</p>}
              {talisman && <p className="recipeEffectNote"><b>Etki:</b> {talisman.effectText}</p>}
              <div className="recipeMaterials">{recipe.materials.map((material) => <span key={material.name}><b>{material.name}</b><strong>×{material.quantity}</strong></span>)}</div>
              <footer>{source && <a href={source.url} target="_blank" rel="noreferrer">Reçete kaynağı ↗</a>}{kind !== "potion" && <Link href={kind === "talisman" ? `/?module=engine&talisman=${recipe.itemId}#engine` : `/?module=items&item=${recipe.itemId}#items`}>{kind === "talisman" ? "Tılsımı aç" : "Eşyayı aç"} →</Link>}<Link href="/uretim#production-planner">Üretim takibi →</Link></footer>
            </div>
          </details>
        </article>;
      })}
      {favoriteRows.length === 0 && <p className="recipeEmpty">Bu seçimle eşleşen reçete yok.</p>}
      {visibleRows.length < favoriteRows.length && <button className="recipeMore" type="button" onClick={() => setVisibleLimit((value) => value + 18)}>18 reçete daha göster <span>{favoriteRows.length - visibleRows.length} kaldı</span></button>}
    </div>
  </section>;
}
