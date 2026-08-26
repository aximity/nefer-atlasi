import test from "node:test";
import assert from "node:assert/strict";
import {
  questById,
  quests,
  questTracks,
  rewardFor,
  unlockedBy,
} from "../lib/quest-catalog.ts";

test("quest catalog has unique, complete records", () => {
  assert.ok(quests.length >= 60);
  assert.equal(new Set(quests.map((quest) => quest.id)).size, quests.length);
  for (const quest of quests) {
    assert.ok(quest.title);
    assert.ok(quest.giver);
    assert.ok(quest.location);
    assert.ok(quest.objective);
    assert.ok(quest.level >= 1 && quest.level <= 49);
    assert.ok(questTracks.includes(quest.track));
  }
});

test("all quest dependencies resolve and never point to self", () => {
  for (const quest of quests) {
    for (const dependency of quest.dependsOn) {
      assert.notEqual(dependency, quest.id);
      assert.ok(questById.has(dependency), `${quest.id} -> ${dependency} is missing`);
      assert.ok(unlockedBy(dependency).some((candidate) => candidate.id === quest.id));
    }
  }
});

test("class rewards prefer the selected class and fall back to common rewards", () => {
  const classReward = questById.get("akil-oyunlari");
  const commonReward = questById.get("salgin-hastalik-1");
  assert.equal(rewardFor(classReward, "Büyücü"), "Anka");
  assert.equal(rewardFor(commonReward, "Şifacı"), "Zırh Artırıcı · İnce Deri Eldiven");
});
