import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  coveredItemVisualFamilyIds,
  itemVisualFamilyFor,
  itemVisualFamilyInventory,
  potionVisualFamilyFor,
  talismanVisualFamilyFor,
  visualFamilies,
} from "../lib/visual-families.ts";

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"));
const items = [...read("items.json"), ...read("group-loot-items.json"), ...read("glasses-items.json")];
const images = read("images.json");
const appearanceImages = read("appearance-images.json");
const talismans = read("talismans.json");

test("129 eşya tekil görsel yerine 23 açık görünüş ailesine bağlanır", () => {
  const inventory = itemVisualFamilyInventory(items);
  assert.equal(items.length, 129);
  assert.equal(inventory.length, 23);
  assert.ok(inventory.every(({ items: familyItems }) => familyItems.length > 0));
  assert.equal(new Set(visualFamilies.map((family) => family.id)).size, visualFamilies.length);
});

test("farklı efsunlu aynı gövde tek görsel ailesini paylaşır", () => {
  const twoStaves = items.filter((item) => item.name.endsWith("Krizoberil Güneş Asa"));
  const latexPants = items.filter((item) => item.name.endsWith("Latex Pantolon"));
  assert.equal(twoStaves.length, 2);
  assert.equal(new Set(twoStaves.map((item) => itemVisualFamilyFor(item).id)).size, 1);
  assert.equal(latexPants.length, 9);
  assert.equal(new Set(latexPants.map((item) => itemVisualFamilyFor(item).id)).size, 1);
  assert.equal(itemVisualFamilyFor(twoStaves[0]).scope, "shared_item_type");
});

test("179 tılsım sınıf ve etkiden bağımsız iki renk görselini paylaşır", () => {
  assert.equal(talismans.length, 179);
  assert.deepEqual([...new Set(talismans.map((row) => talismanVisualFamilyFor(row).id))].sort(), ["talisman:blue", "talisman:red"]);
  const red = talismans.filter((row) => row.color === "Kırmızı");
  assert.equal(new Set(red.map((row) => talismanVisualFamilyFor(row).id)).size, 1);
  assert.equal(new Set(red.map((row) => row.class)).size, 3);
});

test("iksir rengi ve seviye ölçeği üç açık aile kuralında tutulur", () => {
  const health = potionVisualFamilyFor("health");
  const power = potionVisualFamilyFor("power");
  const support = potionVisualFamilyFor("support");
  assert.deepEqual([health.color, power.color, support.color], ["Kırmızı", "Mavi", "Turkuaz"]);
  assert.ok([health, power, support].every((family) => family.sizeRule?.includes("Seviye")));
  assert.equal(potionVisualFamilyFor("health").id, health.id);
});

test("mevcut tekil ve set kanıtları yalnız bağlı oldukları iki aileyi kapsar", () => {
  const covered = coveredItemVisualFamilyIds({ items, images, appearanceImages });
  assert.deepEqual([...covered].sort(), ["item:set:savasci:bicak-sirti", "item:type:kolye"]);
});
