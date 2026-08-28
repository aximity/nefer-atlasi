const safeQuantity = (value, fallback = 0) => {
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : fallback;
};

export function normalizeProductionStock(stock = {}) {
  return Object.fromEntries(
    Object.entries(stock)
      .map(([name, quantity]) => [String(name).trim(), safeQuantity(quantity)])
      .filter(([name, quantity]) => name && quantity > 0),
  );
}

export function buildProductionPlans({ recipes = [], items = [], stock = {}, targets = {} }) {
  const inventory = normalizeProductionStock(stock);
  const itemById = new Map(items.map((item) => [item.id, item]));

  return recipes.map((recipe) => {
    const target = safeQuantity(targets[recipe.itemId], 1);
    const materials = recipe.materials.map((material) => {
      const perCraft = safeQuantity(material.quantity);
      const required = perCraft * target;
      const owned = inventory[material.name] ?? 0;
      return {
        ...material,
        perCraft,
        required,
        owned,
        missing: Math.max(0, required - owned),
      };
    });
    const totalRequired = materials.reduce((sum, material) => sum + material.required, 0);
    const totalCovered = materials.reduce((sum, material) => sum + Math.min(material.owned, material.required), 0);
    const missing = materials.filter((material) => material.missing > 0);
    const craftableCount = materials.length
      ? Math.min(...materials.map((material) => Math.floor(material.owned / material.perCraft)))
      : 0;
    const completion = totalRequired ? Math.round((totalCovered / totalRequired) * 100) : 0;

    return {
      recipe,
      item: itemById.get(recipe.itemId) ?? null,
      target,
      materials,
      missing,
      craftableCount,
      completion,
      status: missing.length === 0 ? "ready" : completion >= 65 ? "near" : "missing",
    };
  });
}

export function productionSummary(plans = [], favoriteIds = []) {
  const favorites = new Set(favoriteIds);
  const favoritePlans = plans.filter((plan) => favorites.has(plan.recipe.itemId));
  const candidates = favoritePlans.length ? favoritePlans : plans;
  const closest = [...candidates]
    .filter((plan) => plan.status !== "ready")
    .sort((a, b) => b.completion - a.completion || a.missing.length - b.missing.length)[0] ?? null;

  return {
    ready: plans.filter((plan) => plan.status === "ready").length,
    favorites: favoritePlans.length,
    closest,
  };
}

export function productionDraftImpact({ recipes = [], items = [], stock = {}, draft = {}, targets = {}, favoriteIds = [] }) {
  const mergedStock = { ...normalizeProductionStock(stock) };
  for (const [name, quantity] of Object.entries(normalizeProductionStock(draft))) {
    mergedStock[name] = (mergedStock[name] ?? 0) + quantity;
  }
  const before = buildProductionPlans({ recipes, items, stock, targets });
  const after = buildProductionPlans({ recipes, items, stock: mergedStock, targets });
  const beforeByItem = new Map(before.map((plan) => [plan.recipe.itemId, plan]));
  const favorites = new Set(favoriteIds);
  const newlyReady = after
    .filter((plan) => plan.status === "ready" && beforeByItem.get(plan.recipe.itemId)?.status !== "ready")
    .sort((a, b) => Number(favorites.has(b.recipe.itemId)) - Number(favorites.has(a.recipe.itemId)) || a.recipe.itemId.localeCompare(b.recipe.itemId, "tr"));
  return {
    mergedStock,
    newlyReadyCount: newlyReady.length,
    recommended: newlyReady[0] ?? productionSummary(after, favoriteIds).closest,
  };
}
