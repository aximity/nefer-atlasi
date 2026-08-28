import assert from "node:assert/strict";
import test from "node:test";
import { atlasCoverage, buildAtlasGraph, searchAtlasNodes } from "../lib/atlas-graph.mjs";

const items = [
  { id: "asa", name: "Örnek Asa", class: "Büyücü", slot: "Silah", publicationStatus: "single_source", region: "Büyük Hol", boss: "Örnek Boss" },
  { id: "ceket", name: "Örnek Ceket", class: "Savaşçı", slot: "Ceket", publicationStatus: "single_source" },
];
const recipes = [
  { id: "recipe-asa", itemId: "asa", sourceId: "source-1", verificationStatus: "single_source", materials: [{ name: "Jadeit", quantity: 3 }, { name: "Bilinmeyen Parça", quantity: 2 }] },
  { id: "recipe-ceket", itemId: "ceket", sourceId: "maxigame-cemberlitas-2015", verificationStatus: "single_source", materials: [{ name: "Jadeit", quantity: 1 }] },
];
const sourceForMaterial = (name) => name === "Jadeit" ? { kind: "gathering", profession: "Sarraf", base: "Yeşim Taşı", output: 2, region: "Büyük Hol" } : null;

test("eşya, boss, reçete, malzeme ve bölge çift yönlü bağlanır", () => {
  const graph = buildAtlasGraph({ items, recipes, materialSourceFor: sourceForMaterial });
  const jadeit = graph.materialNodes.find((node) => node.name === "Jadeit");
  assert.equal(jadeit.region, "Büyük Hol");
  assert.deepEqual(jadeit.uses.map((use) => use.itemId).sort(), ["asa", "ceket"]);
  assert.equal(graph.bossNodes.find((node) => node.name === "Örnek Boss").itemIds[0], "asa");
  assert.ok(graph.regionNodes.find((node) => node.name === "Büyük Hol").materialKeys.includes("jadeit"));
});

test("kaynağı bilinmeyen malzemeye sahte bölge atanmaz", () => {
  const graph = buildAtlasGraph({ items, recipes, materialSourceFor: sourceForMaterial });
  const unknown = graph.materialNodes.find((node) => node.name === "Bilinmeyen Parça");
  assert.equal(unknown.region, null);
  assert.equal(unknown.source, null);
  assert.equal(atlasCoverage(graph).unknownMaterialCount, 1);
});

test("arama kayıt türünü ve Türkçe adı birlikte süzer", () => {
  const graph = buildAtlasGraph({ items, recipes, materialSourceFor: sourceForMaterial });
  assert.deepEqual(searchAtlasNodes(graph.nodes, "jadeit", "material").map((node) => node.name), ["Jadeit"]);
  assert.equal(searchAtlasNodes(graph.nodes, "büyük hol", "region")[0].name, "Büyük Hol");
});

test("Çemberlitaş eşyası Gaffar varsayımı yerine yuva kaynağına bağlanır", () => {
  const graph = buildAtlasGraph({ items, recipes, materialSourceFor: sourceForMaterial });
  const ceket = graph.itemNodes.find((node) => node.key === "ceket");
  assert.deepEqual(ceket.bosses, ["Gaffar Bey"]);
  assert.equal(graph.bossNodes.find((node) => node.name === "Gaffar Bey").itemIds.includes("ceket"), true);
  assert.equal(graph.regionNodes.find((node) => node.name === "Çemberlitaş").bosses.length, 6);
});

test("Atlas malzeme kullanımını tılsım ve iksir reçetelerinden de alır", () => {
  const linkedItems = [...items, { id: "potion-1", name: "Örnek İksir", kind: "potion", class: "Tüm Sınıflar", slot: "İksir" }];
  const linkedRecipes = [...recipes, { id: "recipe-potion", itemId: "potion-1", sourceId: "wiki", verificationStatus: "single_source", materials: [{ name: "Jadeit", quantity: 7 }] }];
  const graph = buildAtlasGraph({ items, recipes, linkedItems, linkedRecipes, materialSourceFor: sourceForMaterial });
  const jadeit = graph.materialNodes.find((node) => node.name === "Jadeit");
  assert.ok(jadeit.uses.some((use) => use.itemId === "potion-1" && use.itemKind === "potion"));
  assert.equal(graph.itemNodes.some((node) => node.key === "potion-1"), false);
});

test("üretilen ara malzeme kaynak yok yerine meslek ve seviye gösterir", () => {
  const craftedSource = (name) => name === "Karışım" ? { kind: "crafted", profession: "Kimyacı", level: 11, materials: [] } : null;
  const graph = buildAtlasGraph({ items: [items[0]], recipes: [{ ...recipes[0], materials: [{ name: "Karışım", quantity: 1 }] }], materialSourceFor: craftedSource });
  assert.equal(graph.materialNodes[0].subtitle, "Kimyacı üretimi · Sv. 11");
});
