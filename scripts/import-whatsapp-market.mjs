#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath) {
  console.error("Kullanım: node scripts/import-whatsapp-market.mjs <sohbet.txt> [çıktı.json]");
  process.exit(1);
}

const products = [
  { name: "Xenotim", aliases: ["xenotim", "xenitom", "exontim", "xeno"] },
  { name: "Jadeit", aliases: ["jadeit", "jade"] },
  { name: "Peptit Kolorotoksin", aliases: ["peptit kolorotoksin", "peptit", "pepti", "pep"] },
  { name: "Salgı", aliases: ["salgi", "salgı"] },
  { name: "Safran", aliases: ["safran"] },
  { name: "Ganoderma", aliases: ["ganoderma", "gano"] },
  { name: "Malahit Taşı", aliases: ["malahit tasi", "malahit taşı", "malehit tasi", "malehit taşı"] },
  { name: "Erg Tozu", aliases: ["erge tozu", "erg tozu"] },
  { name: "Erg Kalıntısı", aliases: ["erg kalintisi", "erg kalıntısı"] },
  { name: "Reçine", aliases: ["recine", "reçine"] },
  { name: "İridyum", aliases: ["iridyum"] },
  { name: "Mavi Topaz", aliases: ["mavi topaz"] },
  { name: "Dört Yapraklı Yonca", aliases: ["dort yaprakli yonca", "dört yapraklı yonca", "yonca"] },
  { name: "Hidrojen", aliases: ["hidrojen", "hidro"] },
  { name: "Klorotoksin", aliases: ["klorotoksin", "kloro"] },
  { name: "Menekşe Elmas", aliases: ["menekse elmas", "menekşe elmas", "menekse", "menekşe"] },
  { name: "Akik", aliases: ["akik"] },
  { name: "Kondrit", aliases: ["kondrit", "kondit"] },
];

const fold = (value) => String(value)
  .toLocaleLowerCase("tr-TR")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/ı/g, "i")
  .replace(/[^a-z0-9₺]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const normalizedProducts = products.map((product) => ({
  ...product,
  aliases: product.aliases.map(fold).sort((a, b) => b.length - a.length),
}));

function parseMessages(raw) {
  const messages = [];
  const start = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}) - ([^:]+): (.*)$/;
  let current = null;
  for (const line of raw.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    if (/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2} - .*\b(grubunu oluşturdu|gruba eklendi|gruptan ayrıldı|kişisini ekledi|kişisini çıkardı|grup bağlantısıyla katıldı|mesajı sabitledi|ayarlarını|kullanıcı adını|mesaj süresi|uçtan uca şifrelidir)\b/i.test(line)) {
      if (current) messages.push(current);
      current = null;
      continue;
    }
    const match = line.match(start);
    if (match) {
      if (current) messages.push(current);
      const [, day, month, year, hour, minute, author, text] = match;
      current = {
        date: `${year}-${month}-${day}`,
        time: `${hour}:${minute}`,
        author: author.trim(),
        text,
      };
    } else if (current) {
      current.text += `\n${line}`;
    }
  }
  if (current) messages.push(current);
  return messages;
}

function productHits(text) {
  const padded = ` ${fold(text)} `;
  return normalizedProducts.flatMap((product) => {
    const hit = product.aliases
      .map((alias) => ({ alias, index: padded.indexOf(` ${alias} `) }))
      .filter((entry) => entry.index >= 0)
      .sort((a, b) => a.index - b.index)[0];
    return hit ? [{ name: product.name, alias: hit.alias, index: hit.index }] : [];
  });
}

function directionAt(text, productIndex) {
  const padded = ` ${fold(text)} `;
  const words = [
    { direction: "Satılık", values: ["satilir", "satilik", "satili", "satilie", "verilir"] },
    { direction: "Alınır", values: ["alinir", "alnr", "aranir", "lazim"] },
  ];
  const candidates = words.flatMap((group) => group.values.flatMap((word) => {
    const matches = [];
    let from = 0;
    while (from < padded.length) {
      const index = padded.indexOf(` ${word} `, from);
      if (index < 0) break;
      matches.push({ direction: group.direction, index, distance: Math.abs(index - productIndex) });
      from = index + word.length + 1;
    }
    return matches;
  }));
  return candidates.sort((a, b) => a.distance - b.distance)[0]?.direction ?? null;
}

function parseAmount(value, scale) {
  const normalized = scale
    ? String(value).replace(",", ".")
    : String(value).replace(/\./g, "").replace(",", ".");
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) return null;
  return number * (scale ? 1000 : 1);
}

function priceCandidates(text) {
  const padded = ` ${String(text)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9₺.,]+/g, " ")} `;
  const regex = /(\d+(?:[.,]\d+)?)\s*(k|bin)?\s*(₺|tl|akce)(?=\s|$)/g;
  return [...padded.matchAll(regex)].flatMap((match) => {
    const amount = parseAmount(match[1], match[2]);
    if (amount == null) return [];
    return [{
      amount,
      currency: match[3] === "akce" ? "Oyun parası" : "TL",
      index: match.index ?? 0,
      raw: match[0],
    }];
  });
}

function quantityFor(text, hit, productCount) {
  const padded = ` ${fold(text)} `;
  const escaped = hit.alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`(?:x\\s*)?(\\d+)\\s*(?:adet\\s*)?${escaped}`),
    new RegExp(`${escaped}\\s*(?:x\\s*)?(\\d+)\\s*(?:adet)?`),
  ];
  for (const pattern of patterns) {
    const match = padded.match(pattern);
    const amount = match ? Number(match[1]) : 0;
    if (Number.isInteger(amount) && amount > 0 && amount <= 500) return amount;
  }
  if (productCount === 1) {
    const match = padded.match(/(?:x\s*)?(\d+)\s*adet\b/);
    const amount = match ? Number(match[1]) : 0;
    if (Number.isInteger(amount) && amount > 0 && amount <= 500) return amount;
  }
  return 1;
}

function explicitUnitPrice(text, hit, allHits, candidate, priceCount) {
  const padded = ` ${fold(text)} `;
  const left = padded.slice(Math.max(0, candidate.index - 18), candidate.index);
  const right = padded.slice(candidate.index + candidate.raw.length, candidate.index + candidate.raw.length + 18);
  const nearProduct = Math.abs(candidate.index - hit.index) <= 42;
  const unitMarked = /(?:tane|tsne|adet|birim|son fiyat)\s*$/.test(left)
    || /^\s*(?:den|dan|tane|tsne|adet|birim)\b/.test(right);
  if (allHits.length === 1) return true;
  return nearProduct && (unitMarked || priceCount >= allHits.length);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

const raw = await readFile(resolve(inputPath), "utf8");
const messages = parseMessages(raw);
const signalRows = [];
const pricedRows = [];

for (const message of messages) {
  if (/medya dahil edilmedi|bu mesaj silindi/i.test(message.text)) continue;
  const hits = productHits(message.text);
  if (!hits.length) continue;
  for (const hit of hits) {
    const pricedLine = message.text.split("\n").flatMap((line) => {
      const lineHits = productHits(line);
      const lineHit = lineHits.find((entry) => entry.name === hit.name);
      const linePrices = priceCandidates(line);
      return lineHit && linePrices.length ? [{ line, lineHit, lineHits, linePrices }] : [];
    })[0];
    const normalizedLine = ` ${fold(pricedLine?.line ?? "")} `;
    const inferredListing = Boolean(pricedLine)
      && !/(?:\?| kac | nedir | ne kadar | piyasasi | piyasa | cekilis | odul )/.test(normalizedLine)
      && /(?:\bx\s*\d+\b|\badet\b|\btane\b|\bson\b|\btoplu\b|\btekli\b|\bpazarlik\b)/.test(normalizedLine);
    const direction = directionAt(message.text, hit.index) ?? (inferredListing ? "Satılık" : null);
    if (!direction) continue;
    const signal = {
      date: message.date,
      author: message.author,
      subject: hit.name,
      direction,
    };
    signalRows.push(signal);
    if (!pricedLine) continue;
    const { line, lineHit, lineHits, linePrices } = pricedLine;
    const nearest = [...linePrices].sort((a, b) => Math.abs(a.index - lineHit.index) - Math.abs(b.index - lineHit.index))[0];
    if (!explicitUnitPrice(line, lineHit, lineHits, nearest, linePrices.length)) continue;
    const quantity = quantityFor(line, lineHit, lineHits.length);
    const padded = ` ${fold(line)} `;
    const around = padded.slice(Math.max(0, nearest.index - 18), nearest.index + nearest.raw.length + 18);
    const unitMarked = /(?:tane|tsne|adet|birim|son fiyat)\s*\d|\d[^ ]*\s*(?:tl|₺|akce)\s*(?:den|dan|tane|tsne|adet|birim)\b/.test(around);
    const unitPrice = unitMarked || quantity === 1 ? nearest.amount : nearest.amount / quantity;
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) continue;
    pricedRows.push({ ...signal, currency: nearest.currency, unitPrice });
  }
}

const dedupedSignals = [...new Map(signalRows.map((row) => [
  [row.date, row.author, row.subject, row.direction].join("|"),
  row,
])).values()];

const signalGroups = new Map();
for (const row of dedupedSignals) {
  if (!signalGroups.has(row.subject)) signalGroups.set(row.subject, []);
  signalGroups.get(row.subject).push(row);
}

const signals = [...signalGroups.entries()].map(([subject, rows]) => ({
  subject,
  buySignals: rows.filter((row) => row.direction === "Alınır").length,
  sellSignals: rows.filter((row) => row.direction === "Satılık").length,
  activeDays: new Set(rows.map((row) => row.date)).size,
  independentParticipants: new Set(rows.map((row) => row.author)).size,
  lastSeenAt: rows.map((row) => row.date).sort().at(-1),
})).sort((a, b) => (b.buySignals + b.sellSignals) - (a.buySignals + a.sellSignals));

const dedupedPrices = [...new Map(pricedRows.map((row) => [
  [row.date, row.author, row.subject, row.direction, row.currency, row.unitPrice].join("|"),
  row,
])).values()];
const priceGroups = new Map();
for (const row of dedupedPrices) {
  const key = [row.date, row.subject, row.direction, row.currency].join("|");
  if (!priceGroups.has(key)) priceGroups.set(key, []);
  priceGroups.get(key).push(row);
}

const priceObservations = [...priceGroups.entries()].map(([key, rows], index) => {
  const [observedAt, subject, tradeDirection, currency] = key.split("|");
  const values = rows.map((row) => row.unitPrice);
  return {
    id: `wa-${String(index + 1).padStart(3, "0")}`,
    type: "market_price",
    subject,
    server: "Kıyametin Öncüleri",
    observedAt,
    sourceCount: new Set(rows.map((row) => row.author)).size,
    details: {
      quantity: 1,
      currency,
      price: Number(median(values).toFixed(2)),
      priceMin: Number(Math.min(...values).toFixed(2)),
      priceMax: Number(Math.max(...values).toFixed(2)),
      listingType: "İlan",
      tradeDirection,
      channel: "WhatsApp ticaret grubu",
      messageCount: rows.length,
      importScope: "single_channel_anonymized_daily_aggregate",
    },
  };
}).sort((a, b) => a.observedAt.localeCompare(b.observedAt) || a.subject.localeCompare(b.subject, "tr"));

const dates = messages.map((message) => message.date).sort();
const payload = {
  metadata: {
    sourceLabel: "Kıyametin Öncüleri · İstanbul (Ticaret) WhatsApp arşivi",
    coverageStart: dates[0] ?? null,
    coverageEnd: dates.at(-1) ?? null,
    messageCount: messages.length,
    tradeMessageCount: new Set(signalRows.map((row) => `${row.date}|${row.author}|${row.subject}|${row.direction}`)).size,
    pricedMessageCount: dedupedPrices.length,
    priceObservationCount: priceObservations.length,
    privacy: "Kişi adları, telefon numaraları, sohbet metinleri ve iletişim bilgileri yayımlanmaz.",
    methodology: "Aynı kişinin aynı gün aynı ürün ve yöndeki tekrarları tek sinyal sayılır; fiyatlar günlük ve anonim medyan olarak tutulur.",
  },
  priceObservations,
  signals,
};

const serialized = `${JSON.stringify(payload, null, 2)}\n`;
if (outputPath) {
  await writeFile(resolve(outputPath), serialized, "utf8");
  console.log(`${priceObservations.length} anonim fiyat kesiti ve ${signals.length} ürün sinyali yazıldı: ${outputPath}`);
} else {
  process.stdout.write(serialized);
}
