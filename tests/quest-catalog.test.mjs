import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  questById,
  questPathThrough,
  quests,
  questTracks,
  rewardFor,
  unlockedBy,
} from "../lib/quest-catalog.ts";
import { parseQuestLevel, questLevelWindow, questMatchesLevel } from "../lib/quest-level.ts";

test("quest catalog has unique, complete records", () => {
  assert.ok(quests.length >= 100);
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

test("level input can be cleared and accepts only levels 1 through 49", () => {
  assert.equal(parseQuestLevel(""), null);
  assert.equal(parseQuestLevel("0"), null);
  assert.equal(parseQuestLevel("20"), 20);
  assert.equal(parseQuestLevel("49"), 49);
  assert.equal(parseQuestLevel("50"), null);
  assert.equal(parseQuestLevel("2a"), null);
});

test("level 20 shows only the current three-level window", () => {
  assert.deepEqual(questLevelWindow(20), { min: 18, max: 20 });
  assert.equal(questMatchesLevel(1, 20), false);
  assert.equal(questMatchesLevel(17, 20), false);
  assert.equal(questMatchesLevel(18, 20), true);
  assert.equal(questMatchesLevel(20, 20), true);
  assert.equal(questMatchesLevel(21, 20), false);
});

test("a remembered quest checkpoint completes only its connected prerequisite path", () => {
  const path = questPathThrough("gizemli-kisilik");
  assert.deepEqual([...path], ["arzuhalci-ile-tanisma", "eski-bir-kitap", "isimsiz-ve-yazarsiz", "akrep-orumcek-notlari", "mezarlik-parsomenleri", "cetecilere-merhaba", "gizemli-kisilik"]);
  assert.equal(path.has("teskilata-katilis"), false);
  assert.equal(path.has("teskilat-fa-darbesi"), false);
});

test("explained quest source levels are preserved for the Labirent chain", () => {
  assert.equal(questById.get("fotografci")?.level, 21);
  assert.equal(questById.get("kitabe")?.level, 21);
  assert.equal(questById.get("philotheosun-salonu")?.level, 22);
  assert.equal(questById.get("tilsim-gorevi")?.level, 22);
  assert.equal(questById.get("akil-oyunlari")?.level, 22);
});

test("quest headers opt out of the global sticky header layout", () => {
  const css = readFileSync(new URL("../app/quest-atlas.css", import.meta.url), "utf8");
  assert.match(css, /\.questHero\{[^}]*position:static/);
  assert.match(css, /\.questCard>header\{[^}]*position:static/);
  assert.match(css, /\.questSheet>header\{[^}]*position:static/);
});
