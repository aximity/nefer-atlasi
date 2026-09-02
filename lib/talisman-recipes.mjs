export function talismanRecipeFor(talismanId, recipes) {
  return recipes.find((recipe) => recipe.talismanId === talismanId);
}

const MATERIAL_ALIASES = new Map([
  ["peptit kolorotoksin", "Peptit Klorotoksin"],
]);

export function canonicalMaterialName(name) {
  if (typeof name !== "string") return null;
  const normalized = name.normalize("NFC").trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  return MATERIAL_ALIASES.get(normalized.toLocaleLowerCase("tr-TR")) ?? normalized;
}

function acquisitionLabel(acquisition) {
  if (!acquisition) return "Edinim bilgisi doğrulanıyor";
  if (acquisition.acquisitionType === "enemy_drop")
    return [acquisition.region, acquisition.sourceEntity].filter(Boolean).join(" · ");
  if (acquisition.acquisitionType === "profession_gathering")
    return [acquisition.profession, acquisition.sourceEntity].filter(Boolean).join(" · ");
  return "Edinim bilgisi doğrulanıyor";
}

export function talismanRecipeIngredients(recipe, talismans, materialAcquisitions) {
  if (!recipe) return [];
  const talismanById = new Map(talismans.map((talisman) => [talisman.id, talisman]));
  const acquisitionByMaterial = new Map(materialAcquisitions.map((row) => [canonicalMaterialName(row.material), row]));
  return recipe.ingredients.map((ingredient) => {
    if (ingredient.kind === "talisman") return {
      kind: "talisman",
      name: talismanById.get(ingredient.talismanId)?.name ?? "Tılsım bilgisi doğrulanıyor",
      quantity: ingredient.quantity,
      acquisition: null,
    };
    const name = canonicalMaterialName(ingredient.name) ?? ingredient.name;
    const acquisition = acquisitionByMaterial.get(name);
    return {
      kind: "material",
      name,
      quantity: ingredient.quantity,
      acquisition: acquisitionLabel(acquisition),
    };
  });
}
