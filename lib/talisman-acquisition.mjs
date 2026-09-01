export const TALISMAN_ACQUISITION_TYPES = Object.freeze([
  "NPC_PURCHASE", "ENEMY_DROP", "RECIPE_CRAFT", "UNKNOWN",
]);

export function acquisitionFor(talismanId, acquisitions) {
  return acquisitions.find((row) => row.talismanId === talismanId);
}

export function talismanProductionChain(talismanId, acquisitions, talismans) {
  const talismanById = new Map(talismans.map((row) => [row.id, row]));
  const acquisitionById = new Map(acquisitions.map((row) => [row.talismanId, row]));
  const chain = [], visited = new Set();
  let currentId = talismanId;
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const talisman = talismanById.get(currentId);
    if (!talisman) break;
    chain.push(talisman);
    currentId = acquisitionById.get(currentId)?.recipe?.predecessorTalismanId ?? null;
  }
  return chain;
}

export function talismanAcquisitionView(talismanId, acquisitions, talismans) {
  const acquisition = acquisitionFor(talismanId, acquisitions);
  if (!acquisition || acquisition.acquisitionType === "UNKNOWN") return {
    label: "Edinim bilgisi doğrulanıyor",
    canOpenRecipe: false,
    recipeTarget: null,
    chain: [],
  };
  if (acquisition.acquisitionType === "RECIPE_CRAFT") return {
    label: "Reçeteyle üretilir",
    canOpenRecipe: true,
    recipeTarget: `#talisman-recipe-${talismanId}`,
    chain: talismanProductionChain(talismanId, acquisitions, talismans),
  };
  return {label: "Edinim bilgisi doğrulanıyor", canOpenRecipe: false, recipeTarget: null, chain: []};
}
