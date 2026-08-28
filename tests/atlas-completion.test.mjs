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
  assert.equal(summary.acquisition, 1);
  assert.equal(summary.materialSources, 1);
  assert.ok(records.some((record) => record.kind === "media" && record.name === "Eksik Asa"));
});

test("tamamlama kuyruğu tür ve Türkçe aramayla süzülür", () => {
  const records = buildAtlasCompletionQueue({ graph, images: [], statsForItem: () => [] });
  assert.equal(filterCompletionRecords(records, { kind: "material_source" }).length, 1);
  assert.equal(filterCompletionRecords(records, { query: "çelişkili" })[0].name, "Çelişkili Ceket");
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
