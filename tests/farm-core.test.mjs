import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateFarmSession,
  compareBoosterProfiles,
  summarizeFarmSessions,
  validateFarmSession,
} from "../lib/farm-core.mjs";

const raw = {
  server: "Kıyamet Öncüleri",
  region: "Büyük Hol",
  routeName: "Lojman rotası",
  profession: "Sarraf",
  observedAt: "2026-08-25",
  durationMinutes: 30,
  nodeCount: 10,
  boosterProfile: "Yok",
  gameCost: 1000,
  tlCost: 10,
  notes: "Kontrollü deneme",
  yields: [
    { material: "Jadeit", grade: "Nadir", quantity: 2, unitGamePrice: 5000, unitTlPrice: 150 },
    { material: "Yeşim Taşı", grade: "Normal", quantity: 8, unitGamePrice: null, unitTlPrice: null },
  ],
};

test("farm form is normalized and TL is stored as kuruş", () => {
  const result = validateFarmSession(raw);
  assert.equal(result.tlCostKurus, 1000);
  assert.equal(result.yields[0].unitTlKurus, 15000);
  assert.equal(result.yields[1].unitGamePrice, null);
});

test("session metrics keep game currency and TL separate", () => {
  const input = validateFarmSession(raw);
  const metrics = calculateFarmSession(input);
  assert.equal(metrics.totalQuantity, 10);
  assert.equal(metrics.itemsPerHour, 20);
  assert.equal(metrics.netGame, 9000);
  assert.equal(metrics.gamePerHour, 18000);
  assert.equal(metrics.netTlKurus, 29000);
  assert.equal(metrics.tlKurusPerHour, 58000);
  assert.equal(metrics.gameCoverage, 0.2);
});

test("summary is duration-weighted and ignores archived runs", () => {
  const session = { ...validateFarmSession(raw), status: "active" };
  const archived = { ...session, status: "archived", durationMinutes: 1 };
  const summary = summarizeFarmSessions([session, archived]);
  assert.equal(summary.sessionCount, 1);
  assert.equal(summary.durationMinutes, 30);
  assert.equal(summary.confidence, "Tek tur");
});

test("booster comparison never mixes profiles", () => {
  const base = { ...validateFarmSession(raw), status: "active" };
  const result = compareBoosterProfiles([
    base,
    { ...base, boosterProfile: "Kişisel", yields: [{ ...base.yields[0], quantity: 4 }] },
  ]);
  assert.equal(result.length, 2);
  assert.equal(result.find((row) => row.boosterProfile === "Yok").sessionCount, 1);
  assert.equal(result.find((row) => row.boosterProfile === "Kişisel").totalQuantity, 4);
});

test("invalid price and empty yield are rejected", () => {
  assert.throws(() => validateFarmSession({ ...raw, yields: [] }), /1–20/);
  assert.throws(
    () => validateFarmSession({ ...raw, yields: [{ ...raw.yields[0], unitTlPrice: -1 }] }),
    /aralığın dışında/,
  );
});

test("Lokman saha oturumu kabul edilir", () => {
  const result = validateFarmSession({ ...raw, profession: "Lokman" });
  assert.equal(result.profession, "Lokman");
});
