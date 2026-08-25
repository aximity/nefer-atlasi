import test from "node:test";
import assert from "node:assert/strict";
import {
  evidenceLevel,
  groupRoutePerformance,
  projectRoutePerformance,
  routeIdentity,
  summarizeMaterialPrices,
} from "../lib/farm-analytics.mjs";

const session = (overrides = {}) => ({
  id: crypto.randomUUID(),
  routeTemplateId: "11111111-1111-1111-1111-111111111111",
  server: "Kıyamet Öncüleri",
  region: "Büyük Hol",
  routeName: "Lojman",
  observedAt: "2026-08-25",
  durationMinutes: 30,
  nodeCount: 5,
  boosterProfile: "Yok",
  gameCost: 0,
  tlCostKurus: 0,
  status: "active",
  yields: [{ material: "Jadeit", grade: "Normal", quantity: 2, unitGamePrice: 100, unitTlKurus: 15000 }],
  ...overrides,
});

test("rota kimliği mümkünse kalıcı şablon kimliğini kullanır", () => {
  assert.equal(routeIdentity(session()), "template:11111111-1111-1111-1111-111111111111");
  assert.equal(routeIdentity(session({ routeTemplateId: null })), "kıyamet öncüleri|büyük hol|lojman");
});

test("rota performansı farklı rotaları ve para birimlerini karıştırmaz", () => {
  const rows = groupRoutePerformance([
    session(),
    session({ id: crypto.randomUUID(), durationMinutes: 30, yields: [{ material: "Jadeit", grade: "Normal", quantity: 4, unitGamePrice: 200, unitTlKurus: null }] }),
    session({ id: crypto.randomUUID(), routeTemplateId: null, routeName: "Kuzey", durationMinutes: 60, yields: [{ material: "Xenotim", grade: "Nadir", quantity: 1, unitGamePrice: null, unitTlKurus: 20000 }] }),
  ]);
  assert.equal(rows.length, 2);
  const lojman = rows.find((row) => row.routeName === "Lojman");
  assert.equal(lojman.sessionCount, 2);
  assert.equal(lojman.itemsPerHour, 6);
  assert.equal(lojman.gameCoverage, 1);
  assert.ok(lojman.tlCoverage > 0 && lojman.tlCoverage < 1);
});

test("örneklem seviyesi kesin sonuç iddiasını engelleyen eşiklere sahiptir", () => {
  assert.deepEqual(evidenceLevel(1), { label: "Tek tur", level: 1, nextAt: 2 });
  assert.equal(evidenceLevel(5).label, "Gelişen örneklem");
  assert.equal(evidenceLevel(10).nextAt, null);
});

test("fiyat özeti TL ve oyun parasını ayrı medyanlarla tutar", () => {
  const result = summarizeMaterialPrices([
    session({ observedAt: "2026-08-20" }),
    session({ observedAt: "2026-08-25", yields: [{ material: "Jadeit", grade: "Normal", quantity: 1, unitGamePrice: 300, unitTlKurus: 25000 }] }),
  ])[0];
  assert.equal(result.game.median, 200);
  assert.equal(result.game.latest, 300);
  assert.equal(result.tlKurus.median, 20000);
});

test("projeksiyon yalnız gözlenen saatlik ortalamayı seçilen süreye uygular", () => {
  const projection = projectRoutePerformance({ itemsPerHour: 12, nodesPerHour: 8, gamePerHour: 1000, tlKurusPerHour: 20000 }, 90);
  assert.equal(projection.items, 18);
  assert.equal(projection.nodes, 12);
  assert.equal(projection.game, 1500);
  assert.equal(projection.tlKurus, 30000);
});
