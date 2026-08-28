import { potionRecipes, potionRecipeSourceId } from "./potion-recipes.ts";

export { potionRecipeSourceId };

export const potionRecipeSourcePolicy = {
  authority: "primary_game_reference",
  requiresCrossVerification: false,
  label: "Ana kaynak · İKV Wiki",
} as const;

const ingredientMap = new Map<string, Set<string>>();
for (const recipe of potionRecipes) {
  for (const material of recipe.materials) {
    const names = ingredientMap.get(material.name) ?? new Set<string>();
    names.add(recipe.name);
    ingredientMap.set(material.name, names);
  }
}

export const potionIngredientIndex: Record<string, string[]> = Object.fromEntries(
  [...ingredientMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "tr"))
    .map(([ingredient, names]) => [ingredient, [...names].sort((a, b) => a.localeCompare(b, "tr"))]),
);

export const indexedPotionCount = potionRecipes.length;
