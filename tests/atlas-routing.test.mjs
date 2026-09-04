import assert from "node:assert/strict";
import test from "node:test";

import { homeHref, moduleHref, readAtlasRoute, withoutItemHref } from "../app/atlas-routing.ts";

test("atlas rotası geçerli modülü ve kayıt ayrıntılarını okur", () => {
  const route = readAtlasRoute("https://atlas.test/?module=group-regions&region=Sığınaklar&boss=Gaffar#group-regions");
  assert.equal(route.module, "group-regions");
  assert.equal(route.regionName, "Sığınaklar");
  assert.equal(route.bossName, "Gaffar");
  assert.equal(route.hashTarget, "group-regions");
  assert.equal(readAtlasRoute("https://atlas.test/?module=bilinmeyen").module, null);
});

test("modül bağlantısı eski ayrıntıyı temizler ve yeni ayrıntıyı korur", () => {
  const href = moduleHref("https://atlas.test/?module=items&item=eski&quest=q1#items", "skills", { ability: "ates-cemberi" });
  const url = new URL(href);
  assert.equal(url.searchParams.get("module"), "skills");
  assert.equal(url.searchParams.get("ability"), "ates-cemberi");
  assert.equal(url.searchParams.has("item"), false);
  assert.equal(url.searchParams.has("quest"), false);
  assert.equal(url.hash, "#skills");
});

test("ana sayfa ve eşya kapatma bağlantıları güvenli biçimde sadeleşir", () => {
  assert.equal(homeHref("https://atlas.test/?module=items&item=x#items"), "https://atlas.test/");
  assert.equal(withoutItemHref("https://atlas.test/?module=items&item=x#items"), "https://atlas.test/?module=items#items");
});
