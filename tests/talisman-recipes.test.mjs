import assert from "node:assert/strict";
import test from "node:test";

import { talismanRecipeFor, talismanRecipes } from "../lib/talisman-recipes.ts";

const quantities = (recipe) => Object.fromEntries(recipe.materials.map((material) => [material.name, material.quantity]));

test("ikinci kademe tılsım reçetesi önceki tılsımı ve kaynak tablosundaki malzemeleri bağlar", () => {
  const recipe = talismanRecipeFor("mage-buz-oku-1-blue-2");
  assert.ok(recipe);
  assert.equal(recipe.sourceId, "fandom-mage-talisman-recipes");
  assert.deepEqual(quantities(recipe), {
    "Buz Oku 1 (I) · Mavi tılsım": 3,
    Kondrit: 6,
    Jadeit: 8,
    "Peptit Kolorotoksin": 4,
    "Örümcek Salgısı": 4,
    Xenotim: 8,
  });
});

test("özel tılsım reçetesi yüksek adetli malzeme şablonunu korur", () => {
  const recipe = talismanRecipeFor("healer-can-kurtaran-red-special");
  assert.ok(recipe);
  assert.deepEqual(quantities(recipe), {
    Kondrit: 18,
    Jadeit: 24,
    "Peptit Kolorotoksin": 12,
    "Örümcek Salgısı": 12,
    Xenotim: 24,
  });
});

test("birinci kademe ve kaynak tablosunda olmayan özel tılsımlar için reçete uydurulmaz", () => {
  assert.equal(talismanRecipeFor("mage-buz-oku-1-blue-1"), undefined);
  assert.ok(talismanRecipes.every((recipe) => recipe.verificationStatus === "single_source"));
});
