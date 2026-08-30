import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const progression = JSON.parse(readFileSync(new URL("../data/progression-gaps.json", import.meta.url), "utf8"));
const market = JSON.parse(readFileSync(new URL("../data/market-whatsapp.json", import.meta.url), "utf8"));

test("KÖ yükseltme merkezi altı eksik alanı öncelikli ve tahminsiz tutar", () => {
  assert.deepEqual(progression.map((row) => row.id), [
    "plus-basma",
    "kozmik-yukseltme",
    "donusum-tasi",
    "malahit",
    "gokmeran",
    "gok-tapinagi-gorevleri",
  ]);
  assert.deepEqual(progression.filter((row) => row.priority === "P0").map((row) => row.id), [
    "plus-basma",
    "kozmik-yukseltme",
    "gok-tapinagi-gorevleri",
  ]);
  assert.ok(progression.every((row) => row.unknown.length >= 4));
  assert.ok(progression.every((row) => row.evidenceNeeded.length >= 3));
  assert.equal(progression.find((row) => row.id === "gokmeran")?.status, "conflicted");
  assert.equal(progression.find((row) => row.id === "gok-tapinagi-gorevleri")?.status, "release_pending");
});

test("Malahit yükseltme rehberindeki pazar varlığını canlı arşivden alır", () => {
  const malahit = market.signals.find((row) => row.subject === "Malahit Taşı");
  assert.ok(malahit);
  assert.ok(malahit.buySignals > 0);
  assert.ok(malahit.activeDays > 0);
  assert.match(progression.find((row) => row.id === "malahit")?.known ?? "", /doğrudan pazar verisinden hesaplanır/i);
});

test("arayüz normal İKV yükseltmesini KÖ kanıtı saymaz", () => {
  const source = readFileSync(new URL("../app/UpgradeGuide.tsx", import.meta.url), "utf8");
  assert.match(source, /normal İKV Silah Yükseltme rehberi yalnız karşılaştırma kaynağıdır/);
  assert.match(source, /Kıyametin Öncüleri için koşul, ücret veya bağlanma kanıtı sayılmaz/);
  assert.ok(progression.find((row) => row.id === "plus-basma")?.evidenceNeeded.includes("Başarılı ve başarısız deneme sonucu"));
});
