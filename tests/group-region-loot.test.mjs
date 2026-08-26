import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  GROUP_REGION_DEFINITIONS,
  cemberlitasBossesFor,
  cemberlitasLootSourceIdFor,
} from "../lib/group-region-loot.mjs";

const items = JSON.parse(fs.readFileSync(new URL("../data/items.json", import.meta.url), "utf8"));
const recipes = JSON.parse(fs.readFileSync(new URL("../data/recipes.json", import.meta.url), "utf8"));
const cemberlitasItemIds = new Set(recipes.filter((recipe) => recipe.sourceId === "maxigame-cemberlitas-2015").map((recipe) => recipe.itemId));

test("Çemberlitaş altı boss ve yedi karşılaşma olarak modellenir", () => {
  const region = GROUP_REGION_DEFINITIONS.find((entry) => entry.name === "Çemberlitaş");
  assert.equal(region.bossCount, 6);
  assert.equal(region.encounterCount, 7);
  assert.equal(region.bosses.length, 6);
  assert.equal(region.bossGroups.find((boss) => boss.name === "Semiha Hanım")?.encounters, 2);
});

test("Çemberlitaş yuvaları Wiki boss dağılımını izler", () => {
  for (const item of items.filter((row) => cemberlitasItemIds.has(row.id))) {
    const bosses = cemberlitasBossesFor(item);
    assert.ok(bosses.length > 0, `${item.id} için boss yok`);
    if (item.slot === "Ceket" || item.slot === "Silah") assert.deepEqual(bosses, ["Gaffar Bey"]);
    if (item.slot === "Ayakkabı") assert.deepEqual(bosses, ["GBM-X"]);
    if (item.slot === "Eldiven") assert.deepEqual(bosses, ["Stuart Efendi"]);
    if (item.slot === "Pantolon") assert.deepEqual(bosses, ["Semiha Hanım"]);
    if ((item.class === "Savaşçı" || item.class === "Şifacı") && item.slot === "Zırh") {
      assert.deepEqual(bosses, ["Yol Savaşçısı", "GBM-X", "Stuart Efendi", "Semiha Hanım"]);
    }
    if (item.class === "Büyücü" && item.slot === "Amplifikatör") {
      assert.deepEqual(bosses, ["Yol Savaşçısı", "GBM-X", "Stuart Efendi", "Semiha Hanım"]);
    }
    assert.ok(cemberlitasLootSourceIdFor(item)?.startsWith("fandom-"));
  }
});

test("Sığınaklar Zahir'i, Migrat iki bossu eksiksiz sayar", () => {
  const shelters = GROUP_REGION_DEFINITIONS.find((entry) => entry.name === "Sığınaklar");
  const migrat = GROUP_REGION_DEFINITIONS.find((entry) => entry.name === "Migrat");
  assert.deepEqual(shelters.bosses, ["Düşünen Adam", "Motorin", "Kenan", "Zahir"]);
  assert.equal(shelters.encounterCount, 3);
  assert.deepEqual(migrat.bosses, ["Centurion", "Junon"]);
});
