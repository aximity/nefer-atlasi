import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { sources, talismans } from "../lib/catalog.ts";
import { materialIconFor, materialIcons } from "../lib/material-icons.ts";
import { materialSourceFor } from "../lib/material-sources.ts";
import { productionHrefFor } from "../lib/production-catalog.ts";
import {
  playerReportsFor,
  talismanProduction,
  talismanRecipeAcquisitionFor,
  talismanRecipeAcquisitionPolicy,
  talismanRecipeAcquisitionStats,
} from "../lib/talisman-production.ts";
import { talismanRecipes } from "../lib/talisman-recipes.ts";
import { talismanRecipeMaterialGuideFor } from "../lib/talisman-recipe-guide.ts";
import { talismanVisualFamilies, talismanVisualFamilyFor } from "../lib/visual-families.ts";

const talismanById = new Map(talismans.map((row) => [row.id, row]));
const publicRoot = fileURLToPath(new URL("../public/", import.meta.url));
const talismanIcons = JSON.parse(readFileSync(new URL("../data/talisman-icons.json", import.meta.url), "utf8"));
const expectedReportIds = [
  "healer-buyu-bozma-blue-1",
  "mage-buyu-bozma-red-1",
  "mage-buz-bilgisi-red-1",
  "mage-elektrik-bilgisi-red-1",
  "mage-fiziksel-bilgi-red-1",
];

test("tılsım sistemi 179 kayıt, 120 reçete ve 710 girdi kapsamını korur", () => {
  assert.equal(talismans.length, 179);
  assert.equal(talismanRecipes.length, 120);
  assert.equal(talismanRecipes.flatMap((recipe) => recipe.materials).length, 710);
  assert.deepEqual(
    Object.fromEntries([...Map.groupBy(talismans, (row) => String(row.tier ?? "special"))].map(([tier, rows]) => [tier, rows.length])),
    { 1: 55, 2: 55, 3: 55, special: 14 },
  );
});

test("110 önceki kademe girdisi görünen adla değil exact tılsım kimliğiyle bağlanır", () => {
  const previousTierRows = talismanRecipes.flatMap((recipe) => recipe.materials
    .filter((material) => material.kind === "talisman")
    .map((material) => ({ recipe, material })));
  assert.equal(previousTierRows.length, 110);
  assert.equal(new Set(previousTierRows.map(({ material }) => material.talismanId)).size, 110);
  assert.equal(new Set(previousTierRows.map(({ material }) => material.name)).size, 110);

  for (const { recipe, material } of previousTierRows) {
    assert.ok(material.talismanId);
    const owner = talismanById.get(recipe.itemId);
    const previous = talismanById.get(material.talismanId);
    assert.ok(owner && previous);
    assert.equal(previous.class, owner.class);
    assert.equal(previous.series, owner.series);
    assert.equal(previous.color, owner.color);
    assert.equal(previous.tier, owner.tier - 1);
    assert.match(material.name, new RegExp(`· ${owner.class} · ${owner.color} tılsım$`));
  }
});

test("710 reçete girdisinin tamamı gerçek malzeme veya sınıf-renk tılsım ikonuna çözülür", () => {
  assert.equal(materialIcons.length, 102);
  assert.equal(talismanVisualFamilies.length, 6);
  assert.equal(talismanIcons.length, 6);
  assert.equal(new Set(talismanIcons.map((row) => row.familyId)).size, 6);
  assert.equal(new Set(talismanIcons.map((row) => row.path)).size, 6);
  for (const icon of talismanIcons) {
    const file = readFileSync(`${publicRoot}${icon.path}`);
    assert.equal(createHash("sha256").update(file).digest("hex"), icon.sha256);
  }

  const usages = talismanRecipes.flatMap((recipe) => recipe.materials);
  let resolved = 0;
  for (const material of usages) {
    if (material.kind === "material") {
      const icon = materialIconFor(material.name);
      assert.ok(icon, `${material.name} malzeme ikonu eksik`);
      assert.ok(existsSync(`${publicRoot}${icon.path}`), `${icon.path} dosyası eksik`);
      resolved += 1;
      continue;
    }
    const talisman = talismanById.get(material.talismanId);
    assert.ok(talisman, `${material.talismanId} önceki kademe tılsımı eksik`);
    const family = talismanVisualFamilyFor(talisman);
    assert.equal(family.status, "verified");
    assert.ok(family.assetRef);
    assert.ok(existsSync(`${publicRoot}${family.assetRef}`), `${family.assetRef} dosyası eksik`);
    assert.ok(talismanIcons.some((icon) => icon.familyId === family.id && icon.path === family.assetRef));
    resolved += 1;
  }
  assert.equal(resolved, 710);
});

test("710 reçete girdisinin tamamı normal İKV kaynağına bağlanır ve KÖ kanıtını ayrı tutar", () => {
  const guides = talismanRecipes.flatMap((recipe) => recipe.materials.map(talismanRecipeMaterialGuideFor));
  assert.equal(guides.length, 710);
  assert.equal(guides.filter((guide) => guide.kind === "talisman").length, 110);
  assert.equal(guides.filter((guide) => guide.kind === "gathering").length, 120);
  assert.equal(guides.filter((guide) => guide.kind === "creature_drop").length, 480);
  assert.equal(guides.filter((guide) => guide.kind === "unresolved").length, 0);
  assert.ok(guides.every((guide) => guide.label && guide.detail && guide.href));
  assert.ok(guides.every((guide) => guide.evidence.normalIkv.status === "source_matched"));
  assert.ok(guides.every((guide) => guide.evidence.kiyametinOnculeri.status === "needs_verification"));
});

test("KÖ oyuncu bildirimleri yalnız açıkça belirtilen beş I. kademe kimliğine uygulanır", () => {
  const reportIds = [...new Set(talismanProduction.playerReports.flatMap((report) => report.talismanIds))].sort();
  assert.deepEqual(reportIds, expectedReportIds);
  assert.ok(reportIds.every((id) => talismanById.get(id)?.tier === 1));
  assert.deepEqual(talismans.filter((row) => playerReportsFor(row).length > 0).map((row) => row.id).sort(), expectedReportIds);
  assert.equal(talismans.filter((row) => row.tier !== 1 && playerReportsFor(row).length > 0).length, 0);
});

test("reçete edinim politikası normal İKV, KÖ ve drop iddialarını birbirine karıştırmaz", () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  assert.equal(talismanRecipeAcquisitionStats.recipeCount, 120);
  assert.equal(talismanRecipeAcquisitionStats.exactRecipeCount, 13);
  assert.equal(talismanRecipeAcquisitionStats.ambiguousClaims, 2);
  assert.equal(talismanRecipeAcquisitionStats.ambiguousRecipeCount, 4);
  assert.equal(talismanRecipeAcquisitionStats.withoutAcquisitionCount, 103);
  assert.equal(talismanRecipeAcquisitionStats.withoutExactSourceCount, 107);
  assert.equal(talismanRecipeAcquisitionPolicy.normalIkv.sourceId, "community-ikv-talisman-update-2013");
  assert.equal(talismanRecipeAcquisitionPolicy.ko.sourceId, "kiyametin-onculeri-guide");
  assert.equal(talismanRecipeAcquisitionPolicy.drop.sourceId, "official-ikv-jobs-2013");
  assert.ok(sourceIds.has(talismanRecipeAcquisitionPolicy.normalIkv.sourceId));
  assert.ok(sourceIds.has(talismanRecipeAcquisitionPolicy.ko.sourceId));
  assert.ok(sourceIds.has(talismanRecipeAcquisitionPolicy.drop.sourceId));
  assert.match(talismanRecipeAcquisitionPolicy.normalIkv.detail, /120 reçetenin tamamını.*envanter yok/i);
  assert.match(talismanRecipeAcquisitionPolicy.ko.detail, /hangi NPC.*doğrulanmadı/i);
  assert.equal(talismanRecipeAcquisitionPolicy.drop.method, "Doğrulanmış drop kaydı yok");
  assert.equal(talismanRecipeAcquisitionFor("warrior-kanatma-red-2")?.status, "exact");
  assert.equal(talismanRecipeAcquisitionFor("mage-buyu-bozma-red-2")?.status, "ambiguous_name");
  assert.equal(talismanRecipeAcquisitionFor("mage-buz-oku-1-blue-2"), null);

  const kondrit = materialSourceFor("Kondrit");
  assert.equal(kondrit?.kind, "creature_drop");
  assert.equal(kondrit?.region, null);
  assert.match(kondrit?.enemy ?? "", /belirtilmiyor/i);
  assert.match(kondrit?.vendor ?? "", /adı belirtilmeyen OOK/i);
  assert.equal(kondrit?.verification, "Kaynaklı kayıt");
});

test("120 tılsım reçetesinin deep-link hedefi exact tılsım kimliğini taşır", () => {
  const hrefs = talismanRecipes.map((recipe) => productionHrefFor(recipe.itemId));
  assert.equal(new Set(hrefs).size, 120);
  for (const recipe of talismanRecipes) {
    const url = new URL(productionHrefFor(recipe.itemId), "https://nefer-atlasi.invalid");
    assert.equal(url.pathname, "/");
    assert.equal(url.searchParams.get("module"), "engine");
    assert.equal(url.searchParams.get("talisman"), recipe.itemId);
    assert.equal(url.hash, "#engine");
    assert.ok(talismanById.has(recipe.itemId));
  }
});
