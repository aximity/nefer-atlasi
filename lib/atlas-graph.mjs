import { GROUP_REGION_DEFINITIONS, cemberlitasBossesFor, isCemberlitasRecipe } from "./group-region-loot.mjs";

const normalize = (value) => String(value || "").trim().toLocaleLowerCase("tr-TR");

export function buildAtlasGraph({ items = [], recipes = [], linkedItems = items, linkedRecipes = recipes, materialSourceFor }) {
  const recipeByItem = new Map(recipes.map((recipe) => [recipe.itemId, recipe]));
  const linkedItemById = new Map(linkedItems.map((item) => [item.id, item]));
  const itemNodes = items.map((item) => {
    const recipe = recipeByItem.get(item.id) || null;
    const derivedCemberlitas = isCemberlitasRecipe(recipe);
    const bosses = item.boss ? [item.boss] : derivedCemberlitas ? cemberlitasBossesFor(item) : [];
    return {
      id: `item:${item.id}`,
      key: item.id,
      type: "item",
      name: item.name,
      subtitle: `${item.class} · ${item.slot}`,
      item,
      recipe,
      region: item.region || (derivedCemberlitas ? "Çemberlitaş" : null),
      boss: bosses.length === 1 ? bosses[0] : null,
      bosses,
      verificationStatus: item.publicationStatus,
      searchText: normalize(`${item.name} ${item.class} ${item.slot} ${item.region || ""} ${bosses.join(" ")}`),
    };
  });

  const materialUseMap = new Map();
  for (const recipe of linkedRecipes) {
    const item = linkedItemById.get(recipe.itemId);
    if (!item) continue;
    for (const material of recipe.materials || []) {
      const key = normalize(material.name);
      const current = materialUseMap.get(key) || { name: material.name, uses: [] };
      current.uses.push({ itemId: item.id, itemName: item.name, itemKind: item.kind || "item", href: item.href || null, quantity: material.quantity, recipeId: recipe.id, verificationStatus: recipe.verificationStatus });
      materialUseMap.set(key, current);
    }
  }
  const materialNodes = [...materialUseMap.entries()].map(([key, value]) => {
    const source = materialSourceFor(value.name);
    const region = source?.region || null;
    const sourceLabel = source?.kind === "gathering"
      ? `${source.profession} · ${source.base} kaynağının ${source.output}. çıktısı`
      : source?.kind === "creature_drop"
        ? `${source.enemy} ganimeti`
        : source?.kind === "quest_reward"
          ? `${source.quest} · Sv. ${source.level} görev ödülü`
        : source?.kind === "crafted"
          ? `${source.profession} üretimi · Sv. ${source.level}`
          : source?.kind === "talisman_craft"
            ? `${source.class} · ${source.color} · ${source.tier}. kademe tılsım üretimi`
        : "Kaynak eşleşmesi yok";
    return {
      id: `material:${key}`,
      key,
      type: "material",
      name: value.name,
      subtitle: sourceLabel,
      source,
      region,
      uses: value.uses,
      verificationStatus: source?.verification === "Kaynaklı kayıt" ? "single_source" : source ? "single_source" : "draft",
      searchText: normalize(`${value.name} ${sourceLabel} ${region || ""}`),
    };
  });

  const bossMap = new Map();
  for (const node of itemNodes) {
    for (const boss of node.bosses) {
      const key = normalize(`${node.region || ""}|${boss}`);
      const current = bossMap.get(key) || { boss, region: node.region, itemIds: [] };
      current.itemIds.push(node.key);
      bossMap.set(key, current);
    }
  }
  for (const region of GROUP_REGION_DEFINITIONS) {
    for (const boss of region.bosses) {
      const key = normalize(`${region.name}|${boss}`);
      if (!bossMap.has(key)) bossMap.set(key, { boss, region: region.name, itemIds: [] });
    }
  }
  const bossNodes = [...bossMap.entries()].map(([key, value]) => ({
    id: `boss:${key}`,
    key,
    type: "boss",
    name: value.boss,
    subtitle: `${value.region || "Bölge eşleşmesi yok"} · ${value.itemIds.length} eşya bağlantısı`,
    region: value.region,
    itemIds: value.itemIds,
    verificationStatus: "single_source",
    searchText: normalize(`${value.boss} ${value.region || ""}`),
  }));

  const regionMap = new Map();
  for (const node of itemNodes) {
    if (!node.region) continue;
    const key = normalize(node.region);
    const current = regionMap.get(key) || { name: node.region, itemIds: new Set(), materialKeys: new Set(), bosses: new Set() };
    current.itemIds.add(node.key);
    for (const boss of node.bosses) current.bosses.add(boss);
    regionMap.set(key, current);
  }
  for (const node of materialNodes) {
    if (!node.region) continue;
    const key = normalize(node.region);
    const current = regionMap.get(key) || { name: node.region, itemIds: new Set(), materialKeys: new Set(), bosses: new Set() };
    current.materialKeys.add(node.key);
    regionMap.set(key, current);
  }
  for (const region of GROUP_REGION_DEFINITIONS) {
    const key = normalize(region.name);
    const current = regionMap.get(key) || { name: region.name, itemIds: new Set(), materialKeys: new Set(), bosses: new Set() };
    for (const boss of region.bosses) current.bosses.add(boss);
    regionMap.set(key, current);
  }
  const regionNodes = [...regionMap.entries()].map(([key, value]) => ({
    id: `region:${key}`,
    key,
    type: "region",
    name: value.name,
    subtitle: `${value.itemIds.size} eşya · ${value.materialKeys.size} malzeme · ${value.bosses.size} boss`,
    itemIds: [...value.itemIds],
    materialKeys: [...value.materialKeys],
    bosses: [...value.bosses],
    verificationStatus: "single_source",
    searchText: normalize(`${value.name} ${[...value.bosses].join(" ")}`),
  }));

  return {
    nodes: [...itemNodes, ...materialNodes, ...bossNodes, ...regionNodes],
    itemNodes,
    materialNodes,
    bossNodes,
    regionNodes,
  };
}

export function searchAtlasNodes(nodes, query, type = "all") {
  const wanted = normalize(query);
  return nodes.filter((node) => (type === "all" || node.type === type) && (!wanted || node.searchText.includes(wanted) || normalize(node.name).includes(wanted)));
}

export function atlasCoverage(graph) {
  const recipeItems = graph.itemNodes.filter((node) => node.recipe).length;
  const sourcedMaterials = graph.materialNodes.filter((node) => node.source).length;
  const unknownMaterials = graph.materialNodes.length - sourcedMaterials;
  return {
    itemCount: graph.itemNodes.length,
    recipeItemCount: recipeItems,
    materialCount: graph.materialNodes.length,
    sourcedMaterialCount: sourcedMaterials,
    unknownMaterialCount: unknownMaterials,
    bossCount: graph.bossNodes.length,
    regionCount: graph.regionNodes.length,
  };
}
