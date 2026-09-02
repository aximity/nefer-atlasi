import test from "node:test";
import assert from "node:assert/strict";
import recipes from "../data/talisman-recipes.json" with {type:"json"};
import talismans from "../data/talismans.json" with {type:"json"};
import acquisitions from "../data/talisman-acquisitions.json" with {type:"json"};
import materialAcquisitions from "../data/material-acquisitions.json" with {type:"json"};
import equipmentRecipes from "../data/recipes.json" with {type:"json"};
import {talismanAcquisitionView} from "../lib/talisman-acquisition.mjs";
import {canonicalMaterialName, talismanRecipeFor, talismanRecipeIngredients} from "../lib/talisman-recipes.mjs";

test("tılsım edinimi dahili ve kaynaklandırılmış reçete detayına açılır", () => {
  const acquisition = talismanAcquisitionView("mage-buz-oku-1-blue-2", acquisitions, talismans);
  const recipe = talismanRecipeFor("mage-buz-oku-1-blue-2", recipes);
  assert.equal(acquisition.recipeTarget, "#talisman-recipe-mage-buz-oku-1-blue-2");
  assert.equal(recipe.sourceId, "fandom-mage-talisman-recipes");
  assert.equal("url" in recipe, false);
});

test("kaynak reçetesi doğru malzeme ve miktarları korur", () => {
  const recipe = talismanRecipeFor("mage-buz-oku-1-blue-2", recipes);
  assert.deepEqual(recipe.ingredients, [
    {kind:"talisman", talismanId:"mage-buz-oku-1-blue-1", quantity:3},
    {kind:"material", name:"Kondrit", quantity:6},
    {kind:"material", name:"Jadeit", quantity:8},
    {kind:"material", name:"Peptit Klorotoksin", quantity:4},
    {kind:"material", name:"Örümcek Salgısı", quantity:4},
    {kind:"material", name:"Xenotim", quantity:8},
  ]);
});

test("II ve III reçeteleri kaynakta geçen predecessor ×3 ilişkisini korur", () => {
  for (const recipe of recipes.filter(row => row.ingredients.some(item => item.kind === "talisman"))) {
    const acquisition = acquisitions.find(row => row.talismanId === recipe.talismanId);
    const predecessor = recipe.ingredients.filter(item => item.kind === "talisman");
    assert.equal(predecessor.length, 1);
    assert.equal(predecessor[0].talismanId, acquisition.recipe.predecessorTalismanId);
    assert.equal(predecessor[0].quantity, 3);
  }
});

test("kaynak kapsamı 109 kademe yükseltmesi ve 10 özel reçetedir", () => {
  assert.equal(acquisitions.filter(row => row.recipe?.kind === "tier_upgrade").length, 109);
  assert.equal(acquisitions.filter(row => row.recipe?.kind === "direct").length, 10);
  assert.equal(recipes.length, 119);
});

test("doğrulanmış materyal edinimleri reçete görünümüne bağlanır", () => {
  const recipe = talismanRecipeFor("mage-ates-bilgisi-red-2", recipes);
  const view = talismanRecipeIngredients(recipe, talismans, materialAcquisitions);
  assert.equal(view.find(row => row.name === "Safran").acquisition, "Lokman · Çiğdem");
  assert.equal(view.find(row => row.name === "Xenotim").acquisition, "Büyük Hol · Saklı Tür");
  assert.equal(view.find(row => row.name === "Peptit Klorotoksin").acquisition, "Büyük Hol · Akrep");
  assert.equal(view.find(row => row.name === "Örümcek Salgısı").acquisition, "Büyük Hol · Örümcek");
  const gadoliniumRecipe = talismanRecipeFor("mage-ates-cemberi-2-red-special", recipes);
  const gadoliniumView = talismanRecipeIngredients(gadoliniumRecipe, talismans, materialAcquisitions);
  assert.equal(gadoliniumView.find(row => row.name === "Gadolinyum").acquisition, "Madenci · Monazit");
});

test("edinimi bilinmeyen reçete malzemesi sade fallback gösterir", () => {
  const recipe = talismanRecipeFor("mage-buz-oku-1-blue-2", recipes);
  const view = talismanRecipeIngredients(recipe, talismans, materialAcquisitions);
  assert.equal(view.find(row => row.name === "Kondrit").acquisition, "Edinim bilgisi doğrulanıyor");
  assert.equal(view.find(row => row.name === "Jadeit").acquisition, "Sarraf · Yeşim Taşı");
});

test("doğrudan reçete predecessor veya NPC/drop ayrıntısı uydurmaz", () => {
  const recipe = talismanRecipeFor("healer-can-kurtaran-red-special", recipes);
  assert.equal(recipe.ingredients.some(row => row.kind === "talisman"), false);
  assert.equal(recipe.ingredients.some(row => "npc" in row || "enemy" in row), false);
});

test("açık alias canonical materyale eşlenir, fuzzy typo birleştirilmez", () => {
  assert.equal(canonicalMaterialName("Peptit Kolorotoksin"), "Peptit Klorotoksin");
  assert.equal(canonicalMaterialName("  örümcek   salgısı  "), "örümcek salgısı");
  assert.equal(canonicalMaterialName("Peptit Klorotoksinn"), "Peptit Klorotoksinn");
});

test("67 ekipman reçetesi tılsım reçetelerinden ayrı ve değişmeden kalır", () => {
  assert.equal(equipmentRecipes.length, 67);
  assert.equal(equipmentRecipes.some(row => "talismanId" in row), false);
  assert.equal(recipes.every(row => !("itemId" in row)), true);
});
