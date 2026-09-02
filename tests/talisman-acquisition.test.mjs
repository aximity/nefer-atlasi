import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import {applyTalisman} from "../lib/planner-core.mjs";
import {acquisitionFor, talismanAcquisitionView, talismanProductionChain} from "../lib/talisman-acquisition.mjs";

const read = async (name) => JSON.parse(await readFile(new URL(`../data/${name}`, import.meta.url), "utf8"));
const acquisitions = await read("talisman-acquisitions.json"), talismans = await read("talismans.json");

test("179 tılsımın edinim coverage sözleşmesi 119 reçete ve 60 unknown olarak korunur", () => {
  assert.equal(acquisitions.length, 179);
  assert.equal(acquisitions.filter((row) => row.acquisitionType === "RECIPE_CRAFT").length, 119);
  const unknownTalismans = acquisitions
    .filter((row) => row.acquisitionType === "UNKNOWN")
    .map((row) => talismans.find((talisman) => talisman.id === row.talismanId));
  assert.equal(unknownTalismans.length, 60);
  assert.deepEqual(Object.fromEntries(["Büyücü","Savaşçı","Şifacı"].map((className) => [className,unknownTalismans.filter((row) => row.class === className).length])), {"Büyücü":20,"Savaşçı":20,"Şifacı":20});
  assert.deepEqual({tier1:unknownTalismans.filter((row) => row.tier === 1).length,tier3:unknownTalismans.filter((row) => row.tier === 3).length,special:unknownTalismans.filter((row) => row.tier === null).length}, {tier1:55,tier3:1,special:4});
  assert.deepEqual(Object.fromEntries(["Büyücü","Savaşçı","Şifacı"].map((className) => [className,new Set(unknownTalismans.filter((row) => row.class === className).map((row) => row.series)).size])), {"Büyücü":18,"Savaşçı":19,"Şifacı":18});
  assert.equal(acquisitions.some((row) => row.acquisitionType === "NPC_PURCHASE" || row.acquisitionType === "ENEMY_DROP"), false);
});

test("kaynak tablosunda bulunmayan Meditasyon 2 III reçete gibi yayımlanmaz", () => {
  const row = acquisitionFor("mage-meditasyon-2-blue-3", acquisitions);
  assert.equal(row.acquisitionType, "UNKNOWN");
  assert.equal(row.sourceId, null);
  assert.equal(row.recipe, undefined);
});

test("II. ve III. kademe edinimleri önceki kademeye bağlı reçetedir", () => {
  const tier2 = acquisitionFor("mage-ates-bilgisi-red-2", acquisitions), tier3 = acquisitionFor("mage-ates-bilgisi-red-3", acquisitions);
  assert.deepEqual(tier2.recipe, {kind:"tier_upgrade",predecessorTalismanId:"mage-ates-bilgisi-red-1",predecessorQuantity:3});
  assert.deepEqual(tier3.recipe, {kind:"tier_upgrade",predecessorTalismanId:"mage-ates-bilgisi-red-2",predecessorQuantity:3});
  assert.equal(tier2.verificationStatus, "single_source");
  assert.equal(tier3.verificationStatus, "single_source");
});

test("kaynaklandırılmış özel tılsım doğrudan reçete edinimini taşır", () => {
  const special = acquisitionFor("healer-gazap-blue-special", acquisitions);
  assert.equal(special.acquisitionType, "RECIPE_CRAFT");
  assert.deepEqual(special.recipe, {kind:"direct"});
  assert.equal(special.sourceId, "fandom-healer-talisman-recipes");
});

test("UNKNOWN edinim sade fallback üretir ve NPC/drop ayrıntısı uydurmaz", () => {
  const unknown = acquisitionFor("healer-ruh-kalkani-blue-special", acquisitions), view = talismanAcquisitionView(unknown.talismanId, acquisitions, talismans);
  assert.equal(view.label, "Edinim bilgisi doğrulanıyor");
  assert.equal(view.canOpenRecipe, false);
  assert.equal(view.recipeTarget, null);
  assert.equal(unknown.sourceId, null);
  assert.equal(unknown.locator, null);
  assert.equal(unknown.npc, undefined);
  assert.equal(unknown.enemy, undefined);
});

test("III → II → I üretim zinciri kullanıcı sırasıyla izlenebilir", () => {
  const chain = talismanProductionChain("mage-ates-bilgisi-red-3", acquisitions, talismans);
  assert.deepEqual(chain.map((row) => row.tier), [3, 2, 1]);
  assert.deepEqual(chain.map((row) => row.id), ["mage-ates-bilgisi-red-3", "mage-ates-bilgisi-red-2", "mage-ates-bilgisi-red-1"]);
});

test("reçete edinimi dahili tılsım detay hedefi üretir", () => {
  const view = talismanAcquisitionView("mage-ates-bilgisi-red-3", acquisitions, talismans);
  assert.equal(view.label, "Reçeteyle üretilir");
  assert.equal(view.recipeTarget, "#talisman-recipe-mage-ates-bilgisi-red-3");
  assert.equal(view.canOpenRecipe, true);
});

test("edinim modeli mevcut tılsım hesap davranışını değiştirmez", () => {
  const talisman = talismans.find((row) => row.id === "mage-ates-bilgisi-red-1");
  assert.deepEqual(applyTalisman({"Büyü Hasarı (Ateş)":100}, talisman), {"Büyü Hasarı (Ateş)":100,"Tılsımlı Ateş Büyü Hasarı":110});
});
