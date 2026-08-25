import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMiningContributionPayload,
  routeSessionDefaults,
  validateRouteTemplate,
} from "../lib/route-core.mjs";

const route = {
  server: "Kıyamet Öncüleri",
  region: "Büyük Hol",
  routeName: "Lojman halkası",
  profession: "Sarraf",
  defaultBooster: "Lonca",
  expectedMinutes: 28,
  notes: "Saha gözlemi",
  points: [
    { pointType: "Başlangıç", label: "Kapı", materialHint: "", xPermille: 0, yPermille: 1000, notes: "" },
    { pointType: "Damar", label: "Birinci damar", materialHint: "Jadeit", xPermille: 425, yPermille: 330, notes: "" },
    { pointType: "Damar", label: "İkinci damar", materialHint: "Xenotim", xPermille: 800, yPermille: 120, notes: "" },
  ],
};

test("rota şablonu normalize edilmiş görsel koordinatlarını kabul eder", () => {
  const result = validateRouteTemplate(route);
  assert.equal(result.points[0].xPermille, 0);
  assert.equal(result.points[0].yPermille, 1000);
  assert.equal(result.points[1].materialHint, "Jadeit");
});

test("rota şablonu görsel sınırı dışındaki ve bilinmeyen işaretleri reddeder", () => {
  assert.throws(
    () => validateRouteTemplate({ ...route, points: [{ ...route.points[0], xPermille: 1001 }] }),
    /aralığ/,
  );
  assert.throws(
    () => validateRouteTemplate({ ...route, points: [{ ...route.points[0], pointType: "Işınlanma" }] }),
    /İşaret türü/,
  );
});

test("rota başlatma varsayılanları yalnız damar işaretlerini sayar", () => {
  const defaults = routeSessionDefaults({ id: "11111111-1111-1111-1111-111111111111", ...route });
  assert.equal(defaults.nodeCount, "2");
  assert.equal(defaults.durationMinutes, "28");
  assert.equal(defaults.routeTemplateId, "11111111-1111-1111-1111-111111111111");
});

test("farm turu inceleme kuyruğu için tek kaynaklı maden gözlemine dönüşür", () => {
  const payload = buildMiningContributionPayload({
    id: "22222222-2222-2222-2222-222222222222",
    server: "Kıyamet Öncüleri",
    region: "Büyük Hol",
    routeName: "Lojman halkası",
    observedAt: "2026-08-25",
    durationMinutes: 30,
    nodeCount: 8,
    boosterProfile: "Lonca",
    notes: "Kalabalıktı",
    yields: [
      { material: "Jadeit", grade: "Normal", quantity: 3 },
      { material: "Xenotim", grade: "Nadir", quantity: 1 },
    ],
  }, "Saha Editörü");
  assert.equal(payload.kind, "mining_run");
  assert.equal(payload.details.runCount, 1);
  assert.equal(payload.details.subject, "Jadeit + Xenotim");
  assert.equal(payload.common.sourceUrl, "");
  assert.equal(payload.farmSessionId, "22222222-2222-2222-2222-222222222222");
});
