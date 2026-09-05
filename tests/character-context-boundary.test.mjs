import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("karakter sınıfı ve tılsım seçimi ortak bağlamda yaşar", () => {
  const page = read("../app/page.tsx");
  const navigation = read("../app/use-atlas-navigation.ts");
  const context = read("../app/character-context.tsx");
  assert.match(page, /<CharacterProvider><HomeContent \/><\/CharacterProvider>/);
  assert.match(navigation, /useCharacter\(\)/);
  assert.doesNotMatch(page, /useState<CharacterClass>|talismans\.find/);
  assert.match(context, /useState<CharacterClass>\("Büyücü"\)/);
  assert.match(context, /const \[talismanId, setTalismanState\]/);
  assert.match(context, /export function useCharacter/);
  assert.match(context, /talismans\.find/);
});

test("tılsım çalışma yüzeyi bağlamı doğrudan kullanır", () => {
  const atlas = read("../app/TalismanProductionAtlas.tsx");
  const guide = read("../app/talisman-guide.tsx");
  assert.match(atlas, /useCharacter\(\)/);
  assert.doesNotMatch(atlas, /initialTalismanId|onClassChange|\[selectedId, setSelectedId\]/);
  assert.match(guide, /<TalismanProductionAtlas \/>/);
  assert.match(guide, /179|talismans\.length/);
});
