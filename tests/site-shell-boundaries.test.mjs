import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { moduleGroups, moduleTabs } from "../app/site-modules.ts";
import { matchesSearch, normalizeSearch } from "../lib/search.ts";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("on beş modül üç gezinme grubunda birer kez yer alır", () => {
  const groupedIds = moduleGroups.flatMap((group) => group.ids);
  assert.equal(moduleTabs.length, 15);
  assert.deepEqual(moduleGroups.map((group) => group.label), ["Bilgi", "Araçlar", "Proje"]);
  assert.equal(groupedIds.length, 15);
  assert.equal(new Set(groupedIds).size, 15);
  assert.deepEqual(new Set(groupedIds), new Set(moduleTabs.map((module) => module.id)));
});

test("genel arama Türkçe karakterleri ve çok kelimeli sorguyu korur", () => {
  assert.equal(normalizeSearch("  Çemberlitaş Şifacı  "), "cemberlitas sifaci");
  assert.equal(matchesSearch("Gaffar Büyücü Asa", "gaffar asa"), true);
  assert.equal(matchesSearch("Gaffar Büyücü Asa", "gaffar kılıç"), false);
});

test("arama ve menü ana koordinatör dışında kendi sınırlarında yaşar", () => {
  const page = read("../app/page.tsx");
  const search = read("../app/global-search.tsx");
  const navigation = read("../app/site-navigation.tsx");
  assert.doesNotMatch(page, /globalSearchResults|moduleGroups\.filter|normalizeSearch|matchesSearch/);
  for (const category of ["Bölümler", "Eşyalar", "Reçeteler", "Görevler", "Yetenekler", "Madenler", "Bölgeler", "Tılsımlar"]) assert.match(search, new RegExp(category));
  assert.match(search, /Bu filtrede sonuç bulunamadı/);
  assert.match(navigation, /Bölüm grupları/);
  assert.match(navigation, /moduleGroups\.filter/);
});
