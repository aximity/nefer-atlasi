import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const archivePath = new URL("../data/market-whatsapp.json", import.meta.url);

test("WhatsApp pazar arşivi yalnız anonim ve toplulaştırılmış veri taşır", async () => {
  const raw = await readFile(archivePath, "utf8");
  const archive = JSON.parse(raw);
  assert.equal(archive.metadata.coverageStart, "2026-08-21");
  assert.equal(archive.metadata.coverageEnd, "2026-08-30");
  assert.ok(archive.metadata.tradeMessageCount >= 400);
  assert.ok(archive.priceObservations.length >= 30);
  assert.ok(archive.signals.length >= 18);
  assert.ok(archive.signals.some((row) => row.subject === "Kondrit"));
  assert.ok(archive.signals.some((row) => row.subject === "Kömürleşmiş Reçine"));
  assert.equal(archive.metadata.messageCount, archive.dailyCoverage.reduce((sum, row) => sum + row.messageCount, 0));
  assert.equal(archive.metadata.tradeMessageCount, archive.dailyCoverage.reduce((sum, row) => sum + row.tradeSignalCount, 0));
  assert.ok(archive.dailySignals.every((row) => row.date && row.subject && row.participantCount > 0));
  assert.ok(archive.signals.every((row) => row.dailyParticipantSignals > 0 && !("independentParticipants" in row)));
  assert.doesNotMatch(raw, /(?:\+90|https?:\/\/|chat\.whatsapp|@\w)/i);
  assert.doesNotMatch(raw, /"(?:author|text|phone|participantId)"\s*:/i);
  assert.ok(archive.priceObservations.every((row) =>
    row.id.startsWith("wa-")
      && row.sourceCount > 0
      && ["TL", "Oyun parası"].includes(row.details.currency)
      && ["Satılık", "Alınır"].includes(row.details.tradeDirection)
      && row.details.importScope === "single_channel_anonymized_daily_aggregate"
  ));
  const suspiciousXenotim = archive.priceObservations.find((row) => row.observedAt === "2026-08-27" && row.subject === "Xenotim" && row.details.tradeDirection === "Satılık" && row.details.currency === "TL");
  assert.ok(suspiciousXenotim.details.priceMin >= 100, "ilan adedi fiyat gibi bölünmemeli");
  const jadeit = archive.priceObservations.find((row) => row.observedAt === "2026-08-27" && row.subject === "Jadeit" && row.details.tradeDirection === "Satılık" && row.details.currency === "TL");
  assert.ok(jadeit.details.priceMin >= 300, "yakındaki başka ürünün fiyatı Jadeit'e yazılmamalı");
});

test("WhatsApp güncelleme hattı ZIP'i geçici açar ve ham sohbeti projede saklamaz", async () => {
  const script = await readFile(new URL("../scripts/update-market-archive.sh", import.meta.url), "utf8");
  assert.match(script, /mktemp -d/);
  assert.match(script, /trap cleanup EXIT/);
  assert.match(script, /import-whatsapp-market\.mjs/);
  assert.match(script, /input_files=\("\$@"\)/);
  assert.match(script, /chat_files\[@\]/);
  assert.doesNotMatch(script, /cp .*data\//);
});
