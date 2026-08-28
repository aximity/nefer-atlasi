import assert from "node:assert/strict";
import test from "node:test";
import { indexedPotionCount, potionIngredientIndex, potionRecipeSourceId } from "../lib/potion-index.ts";

test("iksir dizini eksik adetleri reçete gibi göstermeden kaynak ilişkisini korur", () => {
  assert.equal(Object.keys(potionIngredientIndex).length, 11);
  assert.equal(indexedPotionCount, 40);
  assert.equal(potionRecipeSourceId, "fandom-potion-recipes-20260826");
  for (const [ingredient, names] of Object.entries(potionIngredientIndex)) {
    assert.ok(ingredient.length > 0);
    assert.ok(names.length > 0);
    assert.equal(new Set(names).size, names.length);
  }
});
