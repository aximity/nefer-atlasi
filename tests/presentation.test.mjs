import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { displayUnit, formatDisplayValue, humanizeIdentifier } from "../lib/presentation.mjs";

test("ham oyun birimi kullanıcıya teknik adla gösterilmez", () => {
  assert.equal(displayUnit("raw_game_value"), "");
  assert.equal(displayUnit("puan"), "");
  assert.equal(displayUnit("percent"), "%");
});

test("bilinmeyen teknik alan adları okunabilir metne dönüşür", () => {
  assert.equal(humanizeIdentifier("verification_status"), "Doğrulama durumu");
  assert.equal(humanizeIdentifier("ability_media"), "Yetenek medyası");
  assert.equal(humanizeIdentifier("sourceCount"), "Kaynak sayısı");
  assert.equal(formatDisplayValue({ sourceCount: 2 }), "Kaynak sayısı: 2");
});

test("kaynak kartları odaklı kırpım kullanırken tam kanıtı korur", () => {
  const component = readFileSync(new URL("../app/SkillGuides.tsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = readFileSync(new URL("../app/skills.css", import.meta.url), "utf8");
  const images = JSON.parse(readFileSync(new URL("../data/images.json", import.meta.url), "utf8"));
  const appearanceImages = JSON.parse(readFileSync(new URL("../data/appearance-images.json", import.meta.url), "utf8"));
  const appearanceQueue = JSON.parse(readFileSync(new URL("../data/appearance-media-queue.json", import.meta.url), "utf8"));
  const farmOperations = readFileSync(new URL("../app/farm-operasyonu/FarmOperations.tsx", import.meta.url), "utf8");
  const productionPlanner = readFileSync(new URL("../app/farm-operasyonu/ProductionPlanner.tsx", import.meta.url), "utf8");
  const sustainability = readFileSync(new URL("../app/SustainabilityHub.tsx", import.meta.url), "utf8");
  const releaseCenter = readFileSync(new URL("../app/ReleaseCenter.tsx", import.meta.url), "utf8");
  const talismanAtlas = readFileSync(new URL("../app/TalismanProductionAtlas.tsx", import.meta.url), "utf8");

  assert.match(component, /previewFocus/);
  assert.match(component, /--guide-focus/);
  assert.match(component, /KAYNAK KIRPIMI/);
  assert.match(styles, /object-position:var\(--guide-focus/);
  assert.equal(images.find((image) => image.itemId === "alternator-kolye")?.url, "/items/alternator-kolye-verified.webp");
  assert.equal(appearanceImages.find((image) => image.appearanceFamily === "bicak-sirti")?.scope, "set_appearance");
  assert.equal(appearanceQueue.length, 11);
  assert.equal(new Set(appearanceQueue.map((row) => `${row.class}|${row.appearanceFamily}`)).size, 11);
  assert.match(page, /SET GÖRÜNÜŞ REFERANSI · WIKI/);
  assert.match(page, /TEKİL PARÇA KANITI DEĞİL/);
  assert.match(farmOperations, /"Üretim"/);
  assert.match(productionPlanner, /Favorilere ekle/);
  assert.match(productionPlanner, /Üretecek kişi/);
  assert.match(productionPlanner, /Tahmin yürütülmedi/);
  assert.match(sustainability, /KAYNAK → İKV UYARLAMASI/);
  assert.match(page, /Sürdürülebilirlik/);
  assert.match(page, /ReleaseCenter/);
  assert.match(releaseCenter, /Nefer Atlası ne yapar\?/);
  assert.match(releaseCenter, /Yenilikler/);
  assert.match(releaseCenter, /nefer-intro-seen-v1/);
  assert.doesNotMatch(page, /Yetenek puanı dağıt →/);
  assert.doesNotMatch(page, /function TalismanResult/);
  assert.match(talismanAtlas, /NEDİR\?/);
  assert.match(talismanAtlas, /NE İŞE YARAR\?/);
  assert.match(talismanAtlas, /NEREDEN ELDE EDİLİR\?/);
  assert.match(talismanAtlas, /REÇETE İÇERİĞİ/);
});
