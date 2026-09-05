import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("ana koordinatör recovered çalışma yüzeylerini ayrı modüllere bırakır", () => {
  const page = read("../app/page.tsx");
  const surface = read("../app/module-surface.tsx");
  const lines = page.split(/\r?\n/).length;

  assert.ok(lines < 90, `ana koordinatör ${lines} satır; 90 altında olmalı`);
  assert.doesNotMatch(page, /function (GroupRegions|ItemCard|ComparePanel|ItemModal|Field|Title)/);
  assert.match(page, /from "\.\/module-surface"/);
  assert.doesNotMatch(page, /from "\.\/(group-regions|item-explorer|talisman-guide|equipment-builder)"/);
  assert.match(surface, /from "\.\/group-regions"/);
  assert.match(surface, /from "\.\/item-explorer"/);
  assert.match(read("../app/use-atlas-navigation.ts"), /from "\.\/atlas-routing"/);
  assert.match(page, /from "\.\/character-context"/);
  assert.match(surface, /from "\.\/talisman-guide"/);
  assert.match(page, /from "\.\/use-atlas-navigation"/);
  assert.match(read("../app/talisman-guide.tsx"), /from "\.\/section-title"/);
  assert.match(surface, /from "\.\/equipment-builder"/);
  assert.match(page, /from "\.\/global-search"/);
  assert.match(page, /from "\.\/site-navigation"/);
  assert.match(page, /<AtlasModuleSurface navigation=\{navigation\} \/>/);
  assert.doesNotMatch(page, /suggestedSelection|buildTotals|encodeBuild|decodeBuild|function Totals/);
});

test("ayrılan modüller gerçek kullanıcı yüzeylerini dışa açar", () => {
  assert.match(read("../app/group-regions.tsx"), /export default function GroupRegions/);
  const itemParts = read("../app/item-explorer-parts.tsx");
  assert.match(itemParts, /export function ItemCard/);
  assert.match(itemParts, /export function ComparePanel/);
  assert.match(itemParts, /export function ItemModal/);
  const builder = read("../app/equipment-builder.tsx");
  assert.match(builder, /export default function EquipmentBuilder/);
  assert.match(builder, /Hedefe göre öner/);
  assert.match(builder, /Yalnız eksikleri tamamla/);
});

test("modül sahnesi on beş çalışma yüzeyini tek ve tam eşlemede tutar", () => {
  const surface = read("../app/module-surface.tsx");
  const moduleCases = [...surface.matchAll(/case "([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(moduleCases.toSorted(), ["atlas", "builder", "contribute", "economy", "endgame", "engine", "group-regions", "health", "issues", "items", "mining", "quests", "recipes", "skills", "sustainability"]);
  assert.match(surface, /navigation\.externalDetail/);
  assert.match(surface, /navigation\.setExternalDetail\(null\)/);
});
