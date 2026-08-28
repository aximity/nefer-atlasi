import assert from "node:assert/strict";
import test from "node:test";
import { materialIconFor, materialIcons } from "../lib/material-icons.ts";
import { recipes } from "../lib/catalog.ts";
import { potionRecipes } from "../lib/potion-recipes.ts";
import { productionItems, productionMaterialNames, productionMaterialSourceFor, productionRecipes, productionUsesForMaterial } from "../lib/production-catalog.ts";

test("ortak üretim kataloğu dört reçete türünü tek ağda toplar", () => {
  assert.equal(productionRecipes.length, 442);
  assert.ok(productionItems.every((item) => ["item", "talisman", "potion", "material"].includes(item.kind)));
  assert.ok(productionMaterialNames.includes("Jadeit"));
  assert.ok(productionMaterialNames.includes("Ceviz Yaprağı"));
  assert.ok(productionUsesForMaterial("Jadeit").some((usage) => usage.kind === "talisman"));
  assert.ok(productionUsesForMaterial("Ceviz Yaprağı").some((usage) => usage.kind === "potion"));
  assert.ok(productionUsesForMaterial("Ceviz Yaprağı").some((usage) => usage.kind === "material"));
  const previousTierTalismans = productionMaterialNames.filter((name) => name.endsWith(" tılsım"));
  assert.equal(previousTierTalismans.length, 106);
  assert.equal(previousTierTalismans.filter((name) => productionMaterialSourceFor(name)?.kind === "talisman_craft").length, 53);
  assert.equal(previousTierTalismans.filter((name) => productionMaterialSourceFor(name)?.kind === "talisman_acquisition").length, 10);
  assert.equal(previousTierTalismans.filter((name) => !productionMaterialSourceFor(name)).length, 43);
});

test("Wiki malzeme ikonları tahminsiz ve ölçülebilir kapsama sahiptir", () => {
  const potionMaterials = [...new Set(potionRecipes.flatMap((recipe) => recipe.materials.map((material) => material.name)))];
  const missing = potionMaterials.filter((name) => !materialIconFor(name));
  assert.equal(materialIcons.length, 95);
  assert.deepEqual(missing, ["Karbon"]);
  assert.equal(materialIconFor("Saf Bakır")?.path, "/materials/saf-bakir.png");
});

test("ana eşya reçetelerindeki her malzeme gerçek bir ikona sahiptir", () => {
  const recipeMaterials = [...new Set(recipes.flatMap((recipe) => recipe.materials.map((material) => material.name)))];
  const missing = recipeMaterials.filter((name) => !materialIconFor(name));
  assert.deepEqual(missing, []);
  assert.equal(materialIconFor("Akik")?.path, "/materials/akik.png");
  assert.equal(materialIconFor("Taşkanat Derisi")?.path, "/materials/taskanat-derisi.png");
});
