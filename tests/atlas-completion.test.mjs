import assert from "node:assert/strict";
import test from "node:test";
import { buildAtlasCompletionQueue, completionSummary, filterCompletionRecords } from "../lib/atlas-completion.mjs";

const graph = {
  itemNodes: [
    { id: "item:a", key: "a", type: "item", name: "Eksik Asa", subtitle: "Büyücü · Silah", verificationStatus: "single_source", item: {}, recipe: null, region: null, boss: null },
    { id: "item:b", key: "b", type: "item", name: "Çelişkili Ceket", subtitle: "Savaşçı · Ceket", verificationStatus: "conflicted", item: { acquisition: "Boss ganimeti" }, recipe: null, region: null, boss: null },
  ],
  materialNodes: [
    { id: "material:bilinmeyen", key: "bilinmeyen", type: "material", name: "Bilinmeyen Parça", source: null, uses: [{ itemId: "a" }] },
  ],
};

test("tamamlama kuyruğu eksikleri uydurmadan ayrı işlere böler", () => {
  const records = buildAtlasCompletionQueue({ graph, images: [], statsForItem: () => [] });
  const summary = completionSummary(records);
  assert.equal(summary.critical, 1);
  assert.equal(summary.conflicts, 1);
  assert.equal(summary.acquisition, 1);
  assert.equal(summary.materialSources, 1);
  assert.ok(records.some((record) => record.kind === "media" && record.name === "Eksik Asa"));
});

test("tamamlama kuyruğu tür ve Türkçe aramayla süzülür", () => {
  const records = buildAtlasCompletionQueue({ graph, images: [], statsForItem: () => [] });
  assert.equal(filterCompletionRecords(records, { kind: "material_source" }).length, 1);
  assert.equal(filterCompletionRecords(records, { query: "çelişkili" })[0].name, "Çelişkili Ceket");
});

test("kısmi materyal referansı açığı kapatmadan kuyruk ayrıntısını zenginleştirir", () => {
  const records = buildAtlasCompletionQueue({
    graph,
    statsForItem: () => [],
    referenceForMaterial: (name) => name === "Bilinmeyen Parça" ? { label: "Katalog kaydı", note: "Yöntem ayrıştırılmıyor." } : null,
  });
  const materialRecord = records.find((record) => record.kind === "material_source");
  assert.match(materialRecord?.detail ?? "", /Katalog kaydı/);
  assert.equal(completionSummary(records).materialSources, 1);
});

test("aynı gövdeyi paylaşan eşyalar görsel kuyruğunda tek iş olur", () => {
  const sharedGraph = {
    itemNodes: [
      { id: "item:a", key: "a", type: "item", name: "Birinci Balyoz", subtitle: "Savaşçı · Silah", verificationStatus: "cross_verified", item: { visualFamily: "balyoz" }, recipe: {}, region: null, boss: null },
      { id: "item:b", key: "b", type: "item", name: "İkinci Balyoz", subtitle: "Savaşçı · Silah", verificationStatus: "cross_verified", item: { visualFamily: "balyoz" }, recipe: {}, region: null, boss: null },
    ],
    materialNodes: [],
  };
  const records = buildAtlasCompletionQueue({
    graph: sharedGraph,
    visualFamilyForItem: () => ({ id: "item:type:balyoz", label: "Balyoz" }),
    statsForItem: () => [{ value: 1 }],
  });
  assert.equal(completionSummary(records).media, 1);
  assert.match(records.find((record) => record.kind === "media")?.subtitle ?? "", /2 eşya/);
});

test("tekil eşya ikonu tam görünüş ailesini kapatmaz", () => {
  const iconGraph = {
    itemNodes: [
      { id: "item:a", key: "a", type: "item", name: "Örnek Asa", subtitle: "Büyücü · Silah", verificationStatus: "cross_verified", item: { visualFamily: "asa" }, recipe: {}, region: null, boss: null },
    ],
    materialNodes: [],
  };
  const records = buildAtlasCompletionQueue({
    graph: iconGraph,
    images: [{ id: "icon:a", itemId: "a", assetScope: "item_icon", nameAndAppearanceTogether: false }],
    visualFamilyForItem: () => ({ id: "item:type:asa", label: "Asa" }),
    statsForItem: () => [{ value: 1 }],
  });
  assert.equal(completionSummary(records).media, 1);
});

test("tılsım ve iksir ortak görselleri eşya kuyruğundan ayrı görünür", () => {
  const records = buildAtlasCompletionQueue({
    graph: { itemNodes: [], materialNodes: [] },
    additionalVisualFamilies: [
      { id: "talisman:red", kind: "talisman", label: "Kırmızı tılsım", note: "Ortak gövde." },
      { id: "potion:health", kind: "potion", label: "Can iksiri", note: "Kırmızı şişe.", sizeRule: "Seviyeyle boyut değişir." },
    ],
  });
  assert.equal(completionSummary(records).media, 2);
  assert.ok(records.every((record) => record.priority === "high" && record.entityType === "visual"));
  assert.match(records.find((record) => record.name === "Can iksiri")?.detail ?? "", /Seviyeyle boyut/);
});

test("ortak görsel kartı yalnız kendi ailesindeki kayıt sayısını gösterir", () => {
  const records = buildAtlasCompletionQueue({
    graph: { itemNodes: [], materialNodes: [] },
    additionalVisualFamilies: [
      { id: "potion:health", kind: "potion", label: "Can iksiri", note: "Kırmızı şişe." },
    ],
    visualFamilyRecordCount: () => 10,
  });
  assert.match(records[0].subtitle, /^10 iksir/);
  assert.doesNotMatch(records[0].subtitle, /246/);
});

test("oyuncu bildirimiyle eşleşen hazır tılsım kaynak boşluğu değil doğrulama işi olur", () => {
  const records = buildAtlasCompletionQueue({
    graph: {
      itemNodes: [],
      materialNodes: [{
        id: "material:buz-bilgisi-i",
        key: "buz-bilgisi-i",
        type: "material",
        name: "Buz Bilgisi (I) · Mavi tılsım",
        uses: [{ itemId: "buz-bilgisi-ii" }],
        source: {
          kind: "talisman_acquisition",
          npc: "Gönül",
          region: "Büyük Hol",
          evidenceNeeded: "Dükkân görüntüsü gerekli.",
        },
      }],
    },
  });
  const summary = completionSummary(records);
  assert.equal(summary.materialSources, 0);
  assert.equal(summary.verification, 1);
  assert.equal(records[0].priority, "high");
});

test("canlı boss kategorisi kaynak açığını kapatır ama ikinci teyit işi açar", () => {
  const records = buildAtlasCompletionQueue({
    graph: {
      itemNodes: [],
      materialNodes: [{
        id: "material:antimon",
        key: "antimon",
        name: "Antimon",
        uses: [{ itemId: "asa" }],
        source: { kind: "creature_drop", verification: "Oyuncu bilgisi", source: "https://example.test", enemy: "Bosslar" },
      }],
    },
  });
  assert.equal(completionSummary(records).materialSources, 0);
  assert.equal(completionSummary(records).verification, 1);
  assert.match(records[0].detail, /Boss Droplar/);
});

test("ana kaynak politikası ikinci teyit işini callback ile kapatır", () => {
  const trustedGraph = {
    itemNodes: [{ id: "item:wiki", key: "wiki", type: "item", name: "Wiki Eşyası", subtitle: "Tüm Sınıflar · Gözlük", verificationStatus: "single_source", item: {}, recipe: {}, region: null, boss: null }],
    materialNodes: [],
  };
  const records = buildAtlasCompletionQueue({
    graph: trustedGraph,
    statsForItem: () => [{ value: 1 }],
    coveredVisualFamilyIds: ["item:wiki"],
    visualFamilyForItem: () => ({ id: "item:wiki", label: "Wiki Eşyası" }),
    needsVerificationForItem: () => false,
  });
  assert.equal(completionSummary(records).verification, 0);
});
