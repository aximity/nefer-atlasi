import assert from "node:assert/strict";
import test from "node:test";
import { buildProductionPlans, normalizeProductionStock, productionSummary } from "../lib/production-planner.mjs";

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
