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

test("Çemberlitaş sürüm notlarındaki üç yaratık ganimeti bölge uydurulmadan bağlanır", () => {
  for (const [name, enemy] of [
    ["Likit Kristal", "Gecenin Takipçisi, Buz Büyücüsü veya Bekçi Kobra"],
    ["Klorotoksin", "Gümüş Akrep"],
    ["Sürüngen Pulu", "Fare Adam Terbiyeci veya Şah Kobra"],
  ]) {
    const source = materialSourceFor(name);
    assert.equal(source?.kind, "creature_drop");
    assert.equal(source?.enemy, enemy);
    assert.equal(source?.region, null);
    assert.equal(source?.verification, "Kaynaklı kayıt");
  }
});

test("Sığınak rehberindeki ortak materyaller bölge kaynağına bağlanır", () => {
  for (const name of ["Motorin", "Niobyum"]) {
    const source = materialSourceFor(name);
    assert.equal(source?.kind, "creature_drop");
    assert.equal(source?.region, "Sığınaklar");
    assert.equal(source?.enemy, "Sığınaklar bossları");
    assert.equal(source?.verification, "Kaynaklı kayıt");
  }
});

test("görev ganimetleri görev adı, seviye ve adetle bağlanır", () => {
  const expected = {
    "Liderlik Sembolü": ["Solucan’ı Ezmek", 42, 1],
    "Dev Komodo Dişi": ["Midedeki Pusula", 46, 1],
    "İpek": ["Hidranın Sırrı", 47, 3],
    "Hidra Pençesi": ["Yeşil Hidra Tehlike", 47, 1],
    "Kadim Hidra Pençesi": ["Kadim Tehlike", 47, 1],
  };
  for (const [name, [quest, level, quantity]] of Object.entries(expected)) {
    const source = materialSourceFor(name);
    assert.equal(source?.kind, "quest_reward");
    assert.equal(source?.quest, quest);
    assert.equal(source?.level, level);
    assert.equal(source?.quantity, quantity);
    assert.equal(source?.verification, "Kaynaklı kayıt");
  }
});

test("iksir ara malzemeleri üretim zincirine bağlanır", () => {
  const expected = {
    "Ok Sertleştirici": ["Sarraf", 9, "Obsidyen", 8],
    "Bahçe Karışımı": ["Kimyacı", 11, "Ceviz Yaprağı", 6],
    "Sema Karışımı": ["Kimyacı", 15, "Ökse Otu", 6],
    "Ametist-Lapis": ["Sarraf", 17, "Ametist", 2],
    "Elmas Asa Kristali": ["Sarraf", 25, "Elmas", 5],
    "Sinek Karışımı": ["Kimyacı", 32, "Mantar", 3],
    KSH: ["Kimyacı", 36, "Isırgan Otu", 10],
    "Gök Birleşik": ["Silahtar", 36, "Altın", 10],
    "Göz Taşı": ["Zırhçı", 36, "Kan Taşı", 10],
  };
  for (const [name, [profession, level, material, quantity]] of Object.entries(expected)) {
    const source = materialSourceFor(name);
    assert.equal(source?.kind, "crafted");
    assert.equal(source?.profession, profession);
    assert.equal(source?.level, level);
    assert.deepEqual(source?.materials[0], { name: material, quantity });
  }
});

test("Açık Pembe Ametist doğru yazımla Ametist kaynağına döner", () => {
  const source = materialSourceFor("Açık Pembe Ametist");
  assert.equal(source?.kind, "gathering");
  assert.equal(source?.base, "Ametist");
  assert.equal(source?.output, 2);
});
