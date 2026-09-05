import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("rota yükleme ve modül odakları gezinme denetleyicisinde yaşar", () => {
  const page = read("../app/page.tsx");
  const controller = read("../app/use-atlas-navigation.ts");
  assert.match(page, /useAtlasNavigation\(\)/);
  assert.doesNotMatch(page, /readAtlasRoute|APP_NAVIGATION_EVENT|addEventListener\("popstate"|abilityRows|quests\.find/);
  assert.match(controller, /readAtlasRoute\(location\.href\)/);
  assert.match(controller, /addEventListener\(APP_NAVIGATION_EVENT, hydrate\)/);
  assert.match(controller, /addEventListener\("popstate", hydrate\)/);
  for (const seed of ["questSearchSeed", "abilitySearchSeed", "regionSearchSeed", "builderSeed", "itemSeed"]) {
    assert.match(controller, new RegExp(`\\[${seed}, set`));
  }
});

test("genel arama sonuçları odak ve adresi tek denetleyiciyle günceller", () => {
  const controller = read("../app/use-atlas-navigation.ts");
  for (const handler of ["openItem", "openQuest", "openAbility", "openRegion", "openTalismanResult"]) {
    assert.match(controller, new RegExp(`const ${handler} = useCallback`));
  }
  assert.match(controller, /moduleHref\(location\.href/);
  assert.match(controller, /homeHref\(location\.href\)/);
  assert.match(controller, /withoutItemHref\(location\.href\)/);
});
