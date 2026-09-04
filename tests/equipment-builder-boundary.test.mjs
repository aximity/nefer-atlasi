import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const builder = readFileSync(new URL("../app/equipment-builder.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("donanım modülü seçim, hesap ve paylaşım durumunun sahibidir", () => {
  for (const contract of [
    "suggestedSelection",
    "buildTotals",
    "scoreBuild",
    "encodeBuild",
    "decodeBuild",
    "sanitizeBuild",
    "ikv-build",
  ]) assert.match(builder, new RegExp(contract));

  assert.doesNotMatch(page, /suggestedSelection|buildTotals|scoreBuild|encodeBuild|decodeBuild|sanitizeBuild|ikv-build/);
});

test("donanım modülü paylaşım ve bozuk kayıt geri bildirimlerini korur", () => {
  assert.match(builder, /Donanım planı bağlantısı kopyalandı/);
  assert.match(builder, /Donanım planı bu cihazda kaydedildi/);
  assert.match(builder, /Kayıtlı donanım planı yüklendi/);
  assert.match(builder, /geçersiz veya eski sürüm/);
  assert.match(builder, /onClassChange/);
  assert.match(builder, /onTalismanChange/);
});
