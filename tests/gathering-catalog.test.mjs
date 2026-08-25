import assert from "node:assert/strict";
import test from "node:test";
import {
  gatheringRows,
  gatheringSourceFor,
} from "../lib/gathering-catalog.ts";

test("Büyük Hol üç toplayıcı mesleğinin 45 puanlık kaynaklarını kapsar", () => {
  for (const [material, profession] of [["Monazit", "Madenci"], ["Yeşim Taşı", "Sarraf"], ["Çiğdem", "Lokman"]]) {
    const source = gatheringSourceFor(material);
    assert.equal(source?.profession, profession);
    assert.equal(source?.region, "Büyük Hol");
  }
});

test("reçete malzemesi ikinci ve üçüncü çıktısından ana kaynağa döner", () => {
  assert.deepEqual(
    Object.fromEntries(["Gadolinyum", "Jadeit", "Safran"].map((name) => [name, gatheringSourceFor(name)?.base])),
    { Gadolinyum: "Monazit", Jadeit: "Yeşim Taşı", Safran: "Çiğdem" },
  );
  const ganoderma = gatheringSourceFor("Ganoderma");
  assert.equal(ganoderma?.output, 3);
  assert.equal(ganoderma?.base, "Mantar");
  assert.ok(gatheringRows.length >= 39);
});

test("toplayıcılık dışı üretim malzemesine sahte bölge atanmaz", () => {
  assert.equal(gatheringSourceFor("Peptit Kolorotoksin"), null);
});
