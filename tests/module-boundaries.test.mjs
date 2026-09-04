import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("ana koordinatör recovered çalışma yüzeylerini ayrı modüllere bırakır", () => {
  const page = read("../app/page.tsx");
  const lines = page.split(/\r?\n/).length;

  assert.ok(lines < 800, `ana koordinatör ${lines} satır; 800 altında olmalı`);
  assert.doesNotMatch(page, /function (GroupRegions|ItemCard|ComparePanel|ItemModal|Field|Title)/);
  assert.match(page, /from "\.\/group-regions"/);
  assert.match(page, /from "\.\/item-explorer-parts"/);
  assert.match(page, /from "\.\/section-title"/);
});

test("ayrılan modüller gerçek kullanıcı yüzeylerini dışa açar", () => {
  assert.match(read("../app/group-regions.tsx"), /export default function GroupRegions/);
  const itemParts = read("../app/item-explorer-parts.tsx");
  assert.match(itemParts, /export function ItemCard/);
  assert.match(itemParts, /export function ComparePanel/);
  assert.match(itemParts, /export function ItemModal/);
});
