import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("eşya kataloğu bütün etkileşim durumunu kendi sınırında tutar", () => {
  const page = read("../app/page.tsx");
  const surface = read("../app/module-surface.tsx");
  const explorer = read("../app/item-explorer.tsx");
  assert.match(surface, /from "\.\/item-explorer"/);
  assert.doesNotMatch(page, /from "\.\/item-explorer"/);
  assert.doesNotMatch(page, /\[query, setQuery\]|\[classFilter, setClassFilter\]|\[slotFilter, setSlotFilter\]|\[compareIds, setCompareIds\]/);
  for (const state of ["query", "classFilter", "slotFilter", "itemVisibleLimit", "compareIds", "detail", "notice"]) {
    assert.match(explorer, new RegExp(`\\[${state}, set`));
  }
  assert.match(explorer, /ComparePanel/);
  assert.match(explorer, /ItemModal/);
  assert.match(explorer, /Bu filtrelerle eşleşen kaynaklı eşya yok/);
});

test("ana koordinatör URL ayrıştırmasını yönlendirme katmanına bırakır", () => {
  const page = read("../app/page.tsx");
  const navigation = read("../app/use-atlas-navigation.ts");
  const routing = read("../app/atlas-routing.ts");
  assert.match(navigation, /readAtlasRoute\(location\.href\)/);
  assert.match(navigation, /moduleHref\(location\.href/);
  assert.doesNotMatch(page, /new URLSearchParams\(location\.search\)|ROUTE_DETAIL_PARAMS|readAtlasRoute|moduleHref/);
  assert.match(routing, /export function readAtlasRoute/);
  assert.match(routing, /export function moduleHref/);
});
