import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { publishableItems } from "../lib/catalog.ts";
import { itemVisualAssetFor } from "../lib/item-visuals.ts";
import {
  projectCrossModuleVisualGaps,
  projectLiveFacts,
  projectSystemicAuditAreas,
  projectVisualCoverage,
  projectVisualPriorities,
  projectVisualTotals,
} from "../lib/project-coverage.ts";
import { projectHealthMetrics, projectHealthScore } from "../lib/project-health.ts";
import { SITE_RELEASE } from "../lib/site-release.ts";
import { talismanRecipeAcquisitionStats } from "../lib/talisman-production.ts";

const byId = new Map(projectVisualCoverage.map((row) => [row.id, row]));

test("canlı görsel haritası sekiz kapsamı veriden türetir", () => {
  assert.deepEqual(
    projectVisualCoverage.map((row) => [row.id, row.value, row.total]),
    [
      ["gathering_icons", 66, 81],
      ["recipe_material_icons", 102, 105],
      ["item_recipe_icons", 12, 67],
      ["item_appearances", 2, 23],
      ["talisman_icons", 6, 6],
      ["potion_bottles", 0, 3],
      ["ability_evidence", 45, 45],
      ["ability_media", 0, 3],
    ],
  );
  assert.deepEqual(byId.get("recipe_material_icons")?.missing, ["Açık Mavi Lapis", "Elmas", "Karbon"]);
  assert.deepEqual(projectCrossModuleVisualGaps, ["Açık Mavi Lapis", "Elmas"]);
  assert.equal(projectVisualPriorities[0].id, "potion_bottles");
  assert.deepEqual(projectVisualTotals, { verifiedAssets: 167, openAssetTasks: 98, completedAreas: 2, areas: 8 });
});

test("genel durum reçete claimi ile etkilenen reçete sayısını karıştırmaz", () => {
  assert.deepEqual(talismanRecipeAcquisitionStats, {
    recipeCount: 120,
    exactRecipeCount: 13,
    ambiguousClaims: 2,
    ambiguousRecipeCount: 4,
    withoutAcquisitionCount: 103,
    withoutExactSourceCount: 107,
  });
  assert.equal(projectLiveFacts.productionRecipes, 442);
  assert.equal(projectLiveFacts.exactRecipeSources, 13);
  assert.equal(projectLiveFacts.recipesWithoutExactSource, 429);
  assert.equal(projectLiveFacts.nonTalismanRecipesWithoutAcquisition, 322);
  assert.equal(projectLiveFacts.missingSpecialTalismanRecipeCount, 4);
  assert.equal(projectLiveFacts.missingSpecialTalismanRecipes.length, 4);
});

test("sağlık puanı tılsım ailelerini ve İKV ana kaynak politikasını sayar", () => {
  const media = projectHealthMetrics.find((row) => row.id === "media");
  const evidence = projectHealthMetrics.find((row) => row.id === "evidence");
  assert.deepEqual([media?.value, media?.total, media?.percent], [8, 32, 25]);
  assert.deepEqual([evidence?.value, evidence?.total], [129, 129]);
  assert.equal(projectHealthScore, 82);
});

test("ortak eşya görünüşü kart ve Atlas için aynı çözücüden gelir", () => {
  const alternator = publishableItems.find((item) => item.id === "alternator-kolye");
  const anotherNecklace = publishableItems.find((item) => item.slot === "Kolye" && item.id !== "alternator-kolye");
  const bicakJacket = publishableItems.find((item) => item.id === "bicak-sirti-ceket");
  const bicakSword = publishableItems.find((item) => item.id === "bicak-sirti-kilic");
  assert.equal(itemVisualAssetFor(alternator)?.kind, "item_appearance");
  assert.equal(itemVisualAssetFor(anotherNecklace)?.kind, "shared_item_type");
  assert.equal(itemVisualAssetFor(anotherNecklace)?.assetId, "img-alternator-kolye");
  assert.equal(itemVisualAssetFor(bicakJacket)?.kind, "set_appearance");
  assert.equal(itemVisualAssetFor(bicakSword)?.kind, "item_icon");
  assert.equal(publishableItems.filter((item) => itemVisualAssetFor(item)).length, 26);
});

test("malzeme ikonlarının kaynak kimliği katalogda gerçekten bulunur", () => {
  const icons = JSON.parse(readFileSync(new URL("../data/material-icons.json", import.meta.url), "utf8"));
  const sources = JSON.parse(readFileSync(new URL("../data/sources.json", import.meta.url), "utf8"));
  const sourceIds = new Set(sources.map((source) => source.id));
  assert.equal(icons.length, 102);
  assert.ok(icons.every((icon) => sourceIds.has(icon.sourceId)));
  assert.equal(icons.filter((icon) => icon.sourceId === "fandom-potion-recipes-20260826").length, 48);
});

test("proje durumu sürüm ve çapraz denetim standardını yayımlar", () => {
  assert.equal(SITE_RELEASE.version, "0.64.0");
  assert.equal(SITE_RELEASE.milestone, "M64");
  assert.equal(SITE_RELEASE.releasedOn, "2026-08-29");
  assert.deepEqual(projectSystemicAuditAreas.map((area) => area.id), ["catalog", "recipe", "gathering", "planner", "search", "tests"]);
  const scorecard = readFileSync(new URL("../app/ProjectScorecard.tsx", import.meta.url), "utf8");
  const completion = readFileSync(new URL("../app/AtlasCompletionCenter.tsx", import.meta.url), "utf8");
  assert.match(scorecard, /SITE_RELEASE\.changes\.map/);
  assert.match(scorecard, /Görsel harita/);
  assert.match(completion, /SITE_RELEASE\.milestone/);
  assert.doesNotMatch(completion, /M19/);
});
