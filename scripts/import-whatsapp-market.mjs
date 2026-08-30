#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const outputPath = args.at(-1)?.toLocaleLowerCase("tr-TR").endsWith(".json") ? args.pop() : null;
const inputPaths = args;

if (!inputPaths.length) {
  console.error("Kullanım: node scripts/import-whatsapp-market.mjs <sohbet.txt> [önceki-sohbet.txt ...] [çıktı.json]");
  process.exit(1);
}

const products = [
  { name: "Xenotim", aliases: ["xenotim", "xenitom", "exontim", "xeno"] },
  { name: "Jadeit", aliases: ["jadeit", "jade"] },
  { name: "Peptit Kolorotoksin", aliases: ["peptit kolorotoksin", "peptit", "pepti", "pep"] },
  { name: "Salgı", aliases: ["salgi", "salgı"] },
  { name: "Safran", aliases: ["safran"] },
  { name: "Ganoderma", aliases: ["ganoderma", "gano", "gado"] },
  { name: "Malahit Taşı", aliases: ["malahit tasi", "malahit taşı", "malehit tasi", "malehit taşı", "malahit"] },
  { name: "Erg Tozu", aliases: ["erge tozu", "erg tozu"] },
  { name: "Erg Kalıntısı", aliases: ["erg kalintisi", "erg kalıntısı", "kalinti", "kalıntı"] },
  { name: "Kömürleşmiş Reçine", aliases: ["komurlesmis recine", "kömürleşmiş reçine"] },
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

const marketText = (value) => fold(value)
  .replace(/(\d+)x(?=[a-z])/g, "$1 x ")
  .replace(/x(\d+)(?=[a-z])/g, "x $1 ")
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

function dedupeMessages(messages) {
  return [...new Map(messages.map((message) => [
    [message.date, message.time, message.author, message.text.replace(/\s+/g, " ").trim()].join("|"),
    message,
  ])).values()].sort((left, right) =>
    left.date.localeCompare(right.date)
      || left.time.localeCompare(right.time)
      || left.author.localeCompare(right.author, "tr"),
  );
}

function productHits(text) {
  const padded = ` ${marketText(text)} `;
  const candidates = normalizedProducts.flatMap((product) => {
    const hit = product.aliases
      .map((alias) => ({ alias, index: padded.indexOf(` ${alias} `) }))
      .filter((entry) => entry.index >= 0)
      .sort((a, b) => a.index - b.index || b.alias.length - a.alias.length)[0];
    return hit ? [{ name: product.name, alias: hit.alias, index: hit.index, end: hit.index + hit.alias.length + 2 }] : [];
  }).sort((a, b) => a.index - b.index || b.alias.length - a.alias.length);

  return candidates.filter((candidate, index) => !candidates.some((other, otherIndex) =>
    otherIndex < index && candidate.index >= other.index && candidate.end <= other.end,
  ));
}

function directionAt(text, productIndex) {
  const padded = ` ${marketText(text)} `;
  const words = [
    { direction: "Satılık", values: ["satilir", "satilik", "satili", "satilie", "satiyorum"] },
    { direction: "Alınır", values: ["alinir", "alnr", "aranir", "lazim", "alim", "aliniyor"] },
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
  const padded = ` ${marketText(text)} `;
  const regex = /(\d+(?:[.,]\d+)?)\s*(k|bin)?\s*(?:(₺|tl|lira|akce)\s*(den|dan|ten|tan)?|(den|dan|ten|tan))(?=\s|$)/g;
  return [...padded.matchAll(regex)].flatMap((match) => {
    const amount = parseAmount(match[1], match[2]);
    if (amount == null) return [];
    const marker = match[3];
    return [{
      amount,
      currency: marker === "akce" ? "Oyun parası" : "TL",
      index: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
      raw: match[0],
      unitMarked: Boolean(match[4] || match[5]),
    }];
  });
}

function quantityFor(text, hit, productCount) {
  const padded = ` ${marketText(text)} `;
  const escaped = hit.alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`(?:x\\s*(\\d+)|(\\d+)\\s*x)\\s*${escaped}`),
    new RegExp(`(\\d+)\\s*adet\\s*${escaped}`),
    new RegExp(`(\\d+)\\s+${escaped}`),
    new RegExp(`${escaped}\\s*(?:x\\s*(\\d+)|(\\d+)\\s*x|(\\d+)\\s*adet)`),
  ];
  for (const pattern of patterns) {
    const match = padded.match(pattern);
    const amount = match ? Number(match.slice(1).find(Boolean)) : 0;
    if (Number.isInteger(amount) && amount > 0 && amount <= 500) return amount;
  }
  if (productCount === 1) {
    const match = padded.match(/(?:x\s*)?(\d+)\s*adet\b/);
    const amount = match ? Number(match[1]) : 0;
    if (Number.isInteger(amount) && amount > 0 && amount <= 500) return amount;
  }
  return 1;
}

function spanDistance(left, right) {
  if (left.end < right.index) return right.index - left.end;
  if (right.end < left.index) return left.index - right.end;
  return 0;
}

function contiguousEdgeGroup(text, hits, edge) {
  if (hits.length < 2) return hits;
  const sorted = [...hits].sort((a, b) => a.index - b.index);
  if (edge === "left") {
    const group = [sorted.at(-1)];
    for (let index = sorted.length - 2; index >= 0; index -= 1) {
      const between = text.slice(sorted[index].end, group[0].index);
      if (/\d/.test(between)) break;
      group.unshift(sorted[index]);
    }
    return group;
  }
  const group = [sorted[0]];
  for (let index = 1; index < sorted.length; index += 1) {
    const between = text.slice(group.at(-1).end, sorted[index].index);
    if (/\d/.test(between)) break;
    group.push(sorted[index]);
  }
  return group;
}

function priceAssignments(text, hits, prices) {
  const padded = ` ${marketText(text)} `;
  const sortedHits = [...hits].sort((a, b) => a.index - b.index);
  const sortedPrices = [...prices].sort((a, b) => a.index - b.index);
  const assigned = new Map();
  sortedPrices.forEach((candidate, index) => {
    const previousEnd = sortedPrices[index - 1]?.end ?? 0;
    const nextIndex = sortedPrices[index + 1]?.index ?? Number.POSITIVE_INFINITY;
    const left = sortedHits.filter((hit) => !assigned.has(hit.name) && hit.index >= previousEnd && hit.end <= candidate.index);
    const right = sortedHits.filter((hit) => !assigned.has(hit.name) && hit.index >= candidate.end && hit.index < nextIndex);
    const selected = left.length
      ? contiguousEdgeGroup(padded, left, "left")
      : contiguousEdgeGroup(padded, right, "right");
    for (const hit of selected) assigned.set(hit.name, candidate);
  });
  return assigned;
}

function explicitUnitPrice(hit, allHits, candidate, priceCount) {
  const distance = spanDistance(hit, candidate);
  if (allHits.length === 1) return true;
  if (distance > 34) return false;
  return candidate.unitMarked || priceCount >= allHits.length;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function summarizeSignals(dailySignals) {
  const groups = new Map();
  for (const row of dailySignals) {
    if (!groups.has(row.subject)) groups.set(row.subject, []);
    groups.get(row.subject).push(row);
  }
  return [...groups.entries()].map(([subject, rows]) => ({
    subject,
    buySignals: rows.reduce((sum, row) => sum + row.buySignals, 0),
    sellSignals: rows.reduce((sum, row) => sum + row.sellSignals, 0),
    activeDays: rows.length,
    dailyParticipantSignals: rows.reduce((sum, row) => sum + row.participantCount, 0),
    lastSeenAt: rows.map((row) => row.date).sort().at(-1),
  })).sort((a, b) => (b.buySignals + b.sellSignals) - (a.buySignals + a.sellSignals));
}

function buildArchive(messages) {
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
      const normalizedLine = ` ${marketText(pricedLine?.line ?? "")} `;
      const inferredQuantity = pricedLine ? quantityFor(pricedLine.line, pricedLine.lineHit, pricedLine.lineHits.length) : 1;
      const inferredListing = Boolean(pricedLine)
        && !/(?:\?| kac | nedir | ne kadar | piyasasi | piyasa | cekilis | odul | kazanan | silindi | neden | satilmistir | satildi )/.test(normalizedLine)
        && (inferredQuantity > 1 || /(?:\bx\s*\d+\b|\badet\b|\btane\b|\bson\b|\btoplu\b|\btekli\b|\bpazarlik\b)/.test(normalizedLine));
      const direction = directionAt(message.text, hit.index) ?? (inferredListing ? "Satılık" : null);
      if (!direction) continue;
      const signal = {
        date: message.date,
        time: message.time,
        author: message.author,
        subject: hit.name,
        direction,
      };
      signalRows.push(signal);
      if (!pricedLine) continue;
      const { line, lineHit, lineHits, linePrices } = pricedLine;
      const nearest = priceAssignments(line, lineHits, linePrices).get(lineHit.name);
      if (!nearest) continue;
      if (!explicitUnitPrice(lineHit, lineHits, nearest, linePrices.length)) continue;
      const quantity = quantityFor(line, lineHit, lineHits.length);
      const padded = ` ${marketText(line)} `;
      const around = padded.slice(Math.max(0, nearest.index - 22), nearest.end + 22);
      const unitMarked = nearest.unitMarked || /(?:tane|tsne|birim|son fiyat)\s*\d|\d[^ ]*\s*(?:tl|₺|lira|akce)\s*(?:tane|tsne|birim)\b/.test(around);
      const unitPrice = unitMarked || quantity === 1 ? nearest.amount : nearest.amount / quantity;
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) continue;
      pricedRows.push({ ...signal, currency: nearest.currency, unitPrice });
    }
  }

  const dedupedSignals = [...new Map(signalRows.map((row) => [
    [row.date, row.author, row.subject, row.direction].join("|"),
    row,
  ])).values()];
  const dedupedPrices = [...new Map(pricedRows.map((row) => [
    [row.date, row.author, row.subject, row.direction, row.currency].join("|"),
    row,
  ])).values()];

  const dailySignalGroups = new Map();
  for (const row of dedupedSignals) {
    const key = [row.date, row.subject].join("|");
    if (!dailySignalGroups.has(key)) dailySignalGroups.set(key, []);
    dailySignalGroups.get(key).push(row);
  }
  const dailySignals = [...dailySignalGroups.entries()].map(([key, rows]) => {
    const [date, subject] = key.split("|");
    return {
      date,
      subject,
      buySignals: rows.filter((row) => row.direction === "Alınır").length,
      sellSignals: rows.filter((row) => row.direction === "Satılık").length,
      participantCount: new Set(rows.map((row) => row.author)).size,
    };
  }).sort((a, b) => a.date.localeCompare(b.date) || a.subject.localeCompare(b.subject, "tr"));

  const priceGroups = new Map();
  for (const row of dedupedPrices) {
    const key = [row.date, row.subject, row.direction, row.currency].join("|");
    if (!priceGroups.has(key)) priceGroups.set(key, []);
    priceGroups.get(key).push(row);
  }
  const priceObservations = [...priceGroups.entries()].map(([key, rows]) => {
    const [observedAt, subject, tradeDirection, currency] = key.split("|");
    const values = rows.map((row) => row.unitPrice);
    return {
      type: "market_price",
      subject,
      server: "Kıyametin Öncüleri",
      observedAt,
      sourceCount: rows.length,
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

  const messageDays = new Map();
  for (const message of messages) messageDays.set(message.date, (messageDays.get(message.date) ?? 0) + 1);
  const dailyCoverage = [...messageDays.entries()].map(([date, messageCount]) => ({
    date,
    messageCount,
    tradeSignalCount: dedupedSignals.filter((row) => row.date === date).length,
    pricedMessageCount: dedupedPrices.filter((row) => row.date === date).length,
  })).sort((a, b) => a.date.localeCompare(b.date));

  return { dailyCoverage, dailySignals, priceObservations };
}

function mergeArchive(existing, incoming) {
  if (!Array.isArray(existing?.dailyCoverage) || !Array.isArray(existing?.dailySignals)) return incoming;
  const selectedSource = new Map(existing.dailyCoverage.map((row) => [row.date, { source: "existing", count: row.messageCount }]));
  for (const row of incoming.dailyCoverage) {
    const current = selectedSource.get(row.date);
    if (!current || row.messageCount >= current.count) selectedSource.set(row.date, { source: "incoming", count: row.messageCount });
  }
  const keep = (row, source) => selectedSource.get(row.date ?? row.observedAt)?.source === source;
  return {
    dailyCoverage: [...existing.dailyCoverage.filter((row) => keep(row, "existing")), ...incoming.dailyCoverage.filter((row) => keep(row, "incoming"))]
      .sort((a, b) => a.date.localeCompare(b.date)),
    dailySignals: [...existing.dailySignals.filter((row) => keep(row, "existing")), ...incoming.dailySignals.filter((row) => keep(row, "incoming"))]
      .sort((a, b) => a.date.localeCompare(b.date) || a.subject.localeCompare(b.subject, "tr")),
    priceObservations: [...(existing.priceObservations ?? []).filter((row) => keep(row, "existing")), ...incoming.priceObservations.filter((row) => keep(row, "incoming"))]
      .sort((a, b) => a.observedAt.localeCompare(b.observedAt) || a.subject.localeCompare(b.subject, "tr")),
  };
}

const rawArchives = await Promise.all(inputPaths.map((inputPath) => readFile(resolve(inputPath), "utf8")));
const messages = dedupeMessages(rawArchives.flatMap(parseMessages));
const incoming = buildArchive(messages);
let existing = null;
if (outputPath) {
  try { existing = JSON.parse(await readFile(resolve(outputPath), "utf8")); } catch { /* İlk içe aktarma. */ }
}
const merged = mergeArchive(existing, incoming);
const dates = merged.dailyCoverage.map((row) => row.date);
const priceObservations = merged.priceObservations.map((row, index) => ({
  id: `wa-${String(index + 1).padStart(3, "0")}`,
  ...Object.fromEntries(Object.entries(row).filter(([key]) => key !== "id")),
}));
const payload = {
  metadata: {
    sourceLabel: "Kıyametin Öncüleri · İstanbul (Ticaret) WhatsApp arşivi",
    coverageStart: dates[0] ?? null,
    coverageEnd: dates.at(-1) ?? null,
    messageCount: merged.dailyCoverage.reduce((sum, row) => sum + row.messageCount, 0),
    tradeMessageCount: merged.dailyCoverage.reduce((sum, row) => sum + row.tradeSignalCount, 0),
    pricedMessageCount: merged.dailyCoverage.reduce((sum, row) => sum + row.pricedMessageCount, 0),
    priceObservationCount: priceObservations.length,
    privacy: "Kişi adları, telefon numaraları, sohbet metinleri ve iletişim bilgileri yayımlanmaz.",
    methodology: "Çakışan dışa aktarımlar tekilleştirilir; aynı kişinin aynı gün aynı ürün ve yöndeki tekrarları tek sinyal, fiyatlar günlük anonim medyan olarak tutulur.",
  },
  dailyCoverage: merged.dailyCoverage,
  priceObservations,
  dailySignals: merged.dailySignals,
  signals: summarizeSignals(merged.dailySignals),
};

const serialized = `${JSON.stringify(payload, null, 2)}\n`;
if (outputPath) {
  await writeFile(resolve(outputPath), serialized, "utf8");
  console.log(`${payload.metadata.messageCount} tekil mesajdan ${priceObservations.length} anonim fiyat kesiti ve ${payload.signals.length} ürün sinyali yazıldı: ${outputPath}`);
} else {
  process.stdout.write(serialized);
}
