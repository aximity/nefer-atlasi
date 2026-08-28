import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { indexedPotionCount, potionIngredientIndex, potionRecipeSourceId, potionRecipeSourcePolicy } from "../lib/potion-index.ts";
import { potionRecipes } from "../lib/potion-recipes.ts";
import { applyPrimaryGameSourcePolicy, isPrimaryGameSource, policyStatusLabel } from "../lib/source-policy.mjs";

const sourceRows = JSON.parse(readFileSync(new URL("../data/sources.json", import.meta.url), "utf8"));

test("iksir malzeme dizini tam reçete kümesinden türetilir", () => {
  assert.equal(Object.keys(potionIngredientIndex).length, 49);
  assert.equal(indexedPotionCount, 246);
  assert.equal(potionRecipeSourceId, "fandom-potion-recipes-20260826");
  assert.equal(potionRecipeSourcePolicy.authority, "primary_game_reference");
  assert.equal(potionRecipeSourcePolicy.requiresCrossVerification, false);
  for (const [ingredient, names] of Object.entries(potionIngredientIndex)) {
    assert.ok(ingredient.length > 0);
    assert.ok(names.length > 0);
    assert.equal(new Set(names).size, names.length);
  }
});

test("İKV Wiki kaynaklarının tamamı genel ana oyun referansıdır", () => {
  const sources = sourceRows.map(applyPrimaryGameSourcePolicy);
  const wikiSources = sources.filter((source) => source.type === "fandom");
  assert.equal(wikiSources.length, 23);
  assert.ok(wikiSources.every((source) => source.authority === "primary_game_reference"));
  assert.ok(wikiSources.every((source) => source.requiresCrossVerification === false));
  assert.ok(isPrimaryGameSource(sources.find((source) => source.id === "fandom-all-enchants")));
  assert.equal(policyStatusLabel("single_source", [sources.find((source) => source.id === "fandom-all-enchants")]), "İKV Wiki · ana kaynak");
  assert.equal(policyStatusLabel("single_source", [sources.find((source) => source.id === "maxigame-cemberlitas-2015")]), "Tek kaynak · teyit bekliyor");
  assert.equal(sources.find((source) => source.id === potionRecipeSourceId)?.authority, "primary_game_reference");
  assert.equal(sources.find((source) => source.id === "fandom-materials-20260828")?.authority, "primary_game_reference");
});

test("İKV Wiki iksir reçeteleri tam malzeme ve adetlerle üretime hazırdır", () => {
  assert.equal(potionRecipes.length, 246);
  assert.equal(new Set(potionRecipes.map((recipe) => recipe.itemId)).size, potionRecipes.length);
  assert.ok(potionRecipes.every((recipe) => recipe.level > 0 && recipe.category && recipe.materials.length > 0));
  assert.ok(potionRecipes.every((recipe) => recipe.materials.every((material) => material.name && material.quantity > 0)));
  assert.deepEqual(potionRecipes.find((recipe) => recipe.name === "Kedi İyileştiren İksir")?.materials, [{ name: "Ceviz Yaprağı", quantity: 1 }, { name: "Meşe Odunu", quantity: 1 }]);
  assert.deepEqual(potionRecipes.find((recipe) => recipe.name === "Antilop Emsali İksir")?.materials, [{ name: "Saf Bakır", quantity: 1 }, { name: "Budaksız Meşe", quantity: 1 }, { name: "Kan Taşı", quantity: 2 }, { name: "Ceviz", quantity: 1 }]);
  assert.deepEqual(potionRecipes.find((recipe) => recipe.name === "Kangal Kudretlendiren İksir")?.materials, [{ name: "Sinek Karışımı", quantity: 1 }, { name: "Ceviz", quantity: 1 }, { name: "Ceviz Yaprağı", quantity: 7 }]);
  assert.ok(potionRecipes.some((recipe) => recipe.name === "Elektrik Hasarı Veren İksir" && recipe.level === 1));
  assert.equal(potionRecipes.filter((recipe) => recipe.name === "GB Modeli İksir").length, 2);
});
