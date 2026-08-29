import assert from "node:assert/strict";
import test from "node:test";
import { buildProductionPlans, normalizeProductionStock, productionDraftImpact, productionSummary } from "../lib/production-planner.mjs";

const recipes = [{ id: "r1", itemId: "asa", materials: [{ name: "Saf Altın", quantity: 2 }, { name: "Zamk", quantity: 3 }] }];
const items = [{ id: "asa", name: "Transformatör Asa" }];

test("stok reçeteyi karşılıyorsa üretilebilir adedi hesaplar", () => {
  const [plan] = buildProductionPlans({ recipes, items, stock: { "Saf Altın": 6, Zamk: 9 } });
  assert.equal(plan.status, "ready");
  assert.equal(plan.craftableCount, 3);
  assert.equal(plan.completion, 100);
});

test("hedef adedi eksik malzeme miktarına uygulanır", () => {
  const [plan] = buildProductionPlans({ recipes, items, stock: { "Saf Altın": 3, Zamk: 4 }, targets: { asa: 2 } });
  assert.deepEqual(plan.missing.map((row) => [row.name, row.missing]), [["Saf Altın", 1], ["Zamk", 2]]);
  assert.equal(plan.craftableCount, 1);
});

test("geçersiz stok değerlerini plan dışında bırakır ve favoriye öncelik verir", () => {
  assert.deepEqual(normalizeProductionStock({ Zamk: -1, "Saf Altın": "4", "": 9 }), { "Saf Altın": 4 });
  const plans = buildProductionPlans({ recipes: [...recipes, { id: "r2", itemId: "ceket", materials: [{ name: "İpek", quantity: 10 }] }], items, stock: { "Saf Altın": 1 } });
  assert.equal(productionSummary(plans, ["asa"]).closest?.recipe.itemId, "asa");
});

test("fotoğraf taslağı stoku değiştirmeden en yakın üretimi hesaplar", () => {
  const impact = productionDraftImpact({
    recipes,
    items,
    stock: { "Saf Altın": 2 },
    draft: { Zamk: 3 },
  });
  assert.equal(impact.recommended?.recipe.itemId, "asa");
  assert.equal(impact.recommended?.status, "ready");
  assert.equal(impact.newlyReadyCount, 1);
  assert.equal(impact.recommendations[0]?.recipe.itemId, "asa");
  assert.deepEqual(impact.mergedStock, { "Saf Altın": 2, Zamk: 3 });
});

test("fotoğraf taslağı üç ila beş anlamlı üretim adayını sıralar", () => {
  const candidateRecipes = [
    ...recipes,
    { id: "r2", itemId: "ceket", materials: [{ name: "Zamk", quantity: 4 }] },
    { id: "r3", itemId: "yuzuk", materials: [{ name: "Zamk", quantity: 5 }] },
    { id: "r4", itemId: "kolye", materials: [{ name: "Zamk", quantity: 6 }] },
    { id: "r5", itemId: "pantolon", materials: [{ name: "Zamk", quantity: 7 }] },
    { id: "r6", itemId: "eldiven", materials: [{ name: "Bambaşka", quantity: 1 }] },
  ];
  const impact = productionDraftImpact({ recipes: candidateRecipes, items, stock: { "Saf Altın": 2 }, draft: { Zamk: 3 }, favoriteIds: ["kolye"] });
  assert.ok(impact.recommendations.length >= 3 && impact.recommendations.length <= 5);
  assert.equal(impact.recommendations[0].recipe.itemId, "asa");
  assert.ok(impact.recommendations.every((plan) => plan.completion > 0));
});
