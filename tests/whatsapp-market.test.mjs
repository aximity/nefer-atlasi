import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const archivePath = new URL("../data/market-whatsapp.json", import.meta.url);

test("WhatsApp pazar arşivi yalnız anonim ve toplulaştırılmış veri taşır", async () => {
  const raw = await readFile(archivePath, "utf8");
  const archive = JSON.parse(raw);
  assert.equal(archive.metadata.coverageStart, "2026-08-19");
  assert.equal(archive.metadata.coverageEnd, "2026-08-26");
  assert.ok(archive.metadata.tradeMessageCount >= 300);
  assert.ok(archive.priceObservations.length >= 20);
  assert.ok(archive.signals.length >= 15);
  assert.ok(archive.signals.some((row) => row.subject === "Kondrit"));
  assert.doesNotMatch(raw, /(?:\+90|https?:\/\/|chat\.whatsapp|@\w)/i);
  assert.ok(archive.priceObservations.every((row) =>
    row.id.startsWith("wa-")
      && row.sourceCount > 0
      && ["TL", "Oyun parası"].includes(row.details.currency)
      && ["Satılık", "Alınır"].includes(row.details.tradeDirection)
      && row.details.importScope === "single_channel_anonymized_daily_aggregate"
  ));
});

test("WhatsApp güncelleme hattı ZIP'i geçici açar ve ham sohbeti projede saklamaz", async () => {
  const script = await readFile(new URL("../scripts/update-market-archive.sh", import.meta.url), "utf8");
  assert.match(script, /mktemp -d/);
  assert.match(script, /trap cleanup EXIT/);
  assert.match(script, /import-whatsapp-market\.mjs/);
  assert.doesNotMatch(script, /cp .*data\//);
});
