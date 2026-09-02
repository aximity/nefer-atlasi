import test from "node:test";
import assert from "node:assert/strict";
import quests from "../data/quests.json" with {type:"json"};
import {normalizePlayerLevel, prerequisiteChain, questLocationLabel, questsForLevel} from "../lib/quest-core.mjs";

test("seviye filtresi yalnız oyuncunun seviyesine açılan görevleri getirir", () => {
  const level2 = questsForLevel(quests, "2");
  assert.equal(level2.length, 6);
  assert.equal(level2.every(quest => quest.minLevel <= 2), true);
  assert.equal(level2.some(quest => quest.questId === "quest-010-sahil-temizligi-2"), false);
});

test("seviye alanı temizlenince bütün doğrulanmış slice geri gelir", () => {
  assert.equal(questsForLevel(quests, "").length, quests.length);
  assert.equal(normalizePlayerLevel(""), null);
});

test("geçersiz ve boş seviye güvenli biçimde filtre uygulamaz", () => {
  for (const value of ["x", "2.5", "0", "60", "-1", " "]) {
    assert.equal(normalizePlayerLevel(value), null);
    assert.equal(questsForLevel(quests, value).length, quests.length);
  }
});

test("görev detayı NPC, konum ve amacı canonical kayıttan taşır", () => {
  const quest = quests.find(row => row.questId === "quest-018-anacigimin-ilaclari");
  assert.equal(quest.name, "Anacığımın İlaçları");
  assert.equal(quest.giverNpc, "Jandarma Ali");
  assert.equal(quest.location, "Mısır Çarşısı önü · Türk bayrağı altı");
  assert.match(quest.objective, /Halime Teyze/);
});

test("önceki görev zinciri yalnız açık kaynak ilişkilerini izler", () => {
  assert.deepEqual(
    prerequisiteChain("quest-010-sahil-temizligi-2", quests).map(row => row.questId),
    ["quest-008-balikciyla-tanisma", "quest-009-sahil-temizligi-1"],
  );
});

test("bilinmeyen konum sade fallback alır ve Mısır Çarşısı uydurulmaz", () => {
  const quest = quests.find(row => row.questId === "quest-019-savasin-niyeti");
  assert.equal(quest.location, null);
  assert.equal(questLocationLabel(quest), "Konum bilgisi doğrulanıyor");
  assert.doesNotMatch(questLocationLabel(quest), /Mısır Çarşısı/);
});

test("vertical slice coverage gerçek kayıtlardan hesaplanır", () => {
  assert.equal(quests.length, 12);
  assert.deepEqual([...new Set(quests.map(row => row.minLevel))], [1, 2, 3, 5, 6]);
  assert.equal(quests.filter(row => row.giverNpc).length, 11);
  assert.equal(quests.filter(row => row.location).length, 7);
  assert.equal(quests.filter(row => row.previousQuestIds.length).length, 6);
  assert.equal(quests.every(row => row.reward === null), true);
});
