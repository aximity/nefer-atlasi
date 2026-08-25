import assert from "node:assert/strict";
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
