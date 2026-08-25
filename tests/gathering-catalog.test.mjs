import assert from "node:assert/strict";
import test from "node:test";
import {
  gatheringRows,
  gatheringSourceFor,
} from "../lib/gathering-catalog.ts";
import { materialSourceFor } from "../lib/material-sources.ts";

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

test("yaratık ganimetleri toplayıcılık çıktısı gibi gösterilmez", () => {
  assert.equal(gatheringSourceFor("Xenotim"), null);
  for (const [name, region, enemy] of [
    ["Xenotim", "Büyük Hol", "Saklı Tür"],
    ["Örümcek Salgısı", "Büyük Hol", "Örümcekler"],
    ["Peptit Kolorotoksin", "Büyük Hol", "Akrepler"],
    ["Erg Tozu", "Zihin Tapınağı", "Bölge yaratıkları"],
    ["Erg Kalıntısı", "Zihin Tapınağı", "Bölge yaratıkları"],
  ]) {
    const source = materialSourceFor(name);
    assert.equal(source?.kind, "creature_drop");
    assert.equal(source?.region, region);
    assert.equal(source?.enemy, enemy);
  }
});
