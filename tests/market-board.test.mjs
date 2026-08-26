import assert from "node:assert/strict";
import test from "node:test";
import { normalizeMarketObservations, summarizeMarket } from "../lib/market-board.mjs";

const row = (id, subject, date, details) => ({ id, type: "market_price", subject, server: "Kıyametin Öncüleri", observedAt: date, sourceCount: 2, details });

test("pazar kayıtları toplam fiyattan birim fiyat üretir ve satışla ilanı ayırır", () => {
  const rows = normalizeMarketObservations([
    row("1", "Xenotim", "2026-08-24", { quantity: 2, currency: "TL", price: 400, listingType: "İlan", channel: "Discord" }),
    row("2", "Xenotim", "2026-08-25", { quantity: 2, currency: "TL", price: 400, settledPrice: 300, listingType: "İlan", channel: "Özel takas" }),
  ]);
  assert.deepEqual(rows.map((item) => [item.unitPrice, item.kind]), [[200, "İlan"], [150, "Satış"]]);
});

test("pazar medyanı para birimlerini karıştırmaz ve az veriyi güçlü göstermez", () => {
  const now = new Date("2026-08-25T18:00:00Z").getTime();
  const rows = [
    row("1", "Xenotim", "2026-08-24", { quantity: 1, currency: "TL", price: 150, listingType: "Gerçekleşen satış" }),
    row("2", "Xenotim", "2026-08-25", { quantity: 1, currency: "TL", price: 200, listingType: "Gerçekleşen satış" }),
    row("3", "Xenotim", "2026-08-25", { quantity: 1, currency: "Oyun parası", price: 999999, listingType: "İlan" }),
  ];
  const [summary] = summarizeMarket(rows, { currency: "TL", mode: "Satış", now });
  assert.equal(summary.sevenDayMedian, 175);
  assert.equal(summary.totalCount, 4);
  assert.equal(summary.evidence.label, "Ön sinyal");
});

test("alım teklifi ile satılık fiyatını ayırır ve anonim kaynak ağırlığını korur", () => {
  const now = new Date("2026-08-26T18:00:00Z").getTime();
  const rows = [
    { ...row("1", "Jadeit", "2026-08-25", { quantity: 1, currency: "TL", price: 150, listingType: "İlan", tradeDirection: "Alınır" }), sourceCount: 3 },
    { ...row("2", "Jadeit", "2026-08-25", { quantity: 1, currency: "TL", price: 300, listingType: "İlan", tradeDirection: "Satılık" }), sourceCount: 2 },
  ];
  const [ask] = summarizeMarket(rows, { currency: "TL", direction: "Satılık", now });
  const [bid] = summarizeMarket(rows, { currency: "TL", direction: "Alınır", now });
  assert.equal(ask.sevenDayMedian, 300);
  assert.equal(ask.sevenDayCount, 2);
  assert.equal(bid.sevenDayMedian, 150);
  assert.equal(bid.sevenDayCount, 3);
});
