const DAY = 24 * 60 * 60 * 1000;

function normalizeName(value) {
  return String(value || "").trim().toLocaleLowerCase("tr-TR");
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function weightedValues(rows) {
  return rows.flatMap((row) => Array.from(
    { length: Math.max(1, Math.min(50, row.sourceCount)) },
    () => row.unitPrice,
  ));
}

function sampleCount(rows) {
  return rows.reduce((total, row) => total + Math.max(1, Math.min(50, row.sourceCount)), 0);
}

function evidence(count) {
  if (count >= 10) return { level: 4, label: "Güçlü örneklem", nextAt: null };
  if (count >= 5) return { level: 3, label: "Gelişen örneklem", nextAt: 10 };
  if (count >= 2) return { level: 2, label: "Ön sinyal", nextAt: 5 };
  return { level: 1, label: "Tek gözlem", nextAt: 2 };
}

export function normalizeMarketObservations(rows) {
  return (Array.isArray(rows) ? rows : []).flatMap((row) => {
    if (row?.type !== "market_price" || !row.details) return [];
    const quantity = Number(row.details.quantity);
    const listedTotal = Number(row.details.price);
    const settled = row.details.settledPrice;
    const settledTotal = settled == null ? null : Number(settled);
    const currency = row.details.currency;
    const listingType = row.details.listingType;
    if (!row.subject || !row.observedAt || !["Oyun parası", "TL"].includes(currency)) return [];
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(listedTotal) || listedTotal <= 0) return [];
    const isSale = listingType === "Gerçekleşen satış" || (Number.isFinite(settledTotal) && settledTotal > 0);
    const effectiveTotal = Number.isFinite(settledTotal) && settledTotal > 0 ? settledTotal : listedTotal;
    const listedMin = Number(row.details.priceMin);
    const listedMax = Number(row.details.priceMax);
    return [{
      id: row.id,
      subject: String(row.subject).trim(),
      subjectKey: normalizeName(row.subject),
      server: row.server,
      observedAt: row.observedAt,
      currency,
      quantity,
      unitPrice: effectiveTotal / quantity,
      unitPriceMin: Number.isFinite(listedMin) && listedMin > 0 ? listedMin / quantity : effectiveTotal / quantity,
      unitPriceMax: Number.isFinite(listedMax) && listedMax > 0 ? listedMax / quantity : effectiveTotal / quantity,
      kind: isSale ? "Satış" : "İlan",
      tradeDirection: row.details.tradeDirection === "Alınır" ? "Alınır" : "Satılık",
      channel: row.details.channel || "Belirsiz",
      sourceCount: Math.max(1, Number(row.sourceCount) || 1),
    }];
  });
}

export function summarizeMarket(rows, { currency = "Oyun parası", mode = "Tümü", direction = "Satılık", now = Date.now() } = {}) {
  const observations = normalizeMarketObservations(rows).filter((row) =>
    row.currency === currency
      && (mode === "Tümü" || row.kind === mode)
      && (direction === "Tümü" || row.tradeDirection === direction),
  );
  const groups = new Map();
  for (const row of observations) {
    if (!groups.has(row.subjectKey)) groups.set(row.subjectKey, []);
    groups.get(row.subjectKey).push(row);
  }
  return [...groups.values()].map((group) => {
    const recent = (days) => group.filter((row) => {
      const value = new Date(`${row.observedAt}T12:00:00Z`).getTime();
      return Number.isFinite(value) && now - value <= days * DAY && value <= now + DAY;
    });
    const seven = recent(7);
    const thirty = recent(30);
    const latest = [...group].sort((a, b) => b.observedAt.localeCompare(a.observedAt))[0];
    const sevenSamples = sampleCount(seven);
    const thirtySamples = sampleCount(thirty);
    const totalSamples = sampleCount(group);
    return {
      subject: latest.subject,
      currency,
      direction,
      sevenDayMedian: median(weightedValues(seven)),
      sevenDayMin: seven.length ? Math.min(...seven.map((row) => row.unitPriceMin)) : null,
      sevenDayMax: seven.length ? Math.max(...seven.map((row) => row.unitPriceMax)) : null,
      sevenDayCount: sevenSamples,
      thirtyDayMedian: median(weightedValues(thirty)),
      thirtyDayCount: thirtySamples,
      allTimeMedian: median(weightedValues(group)),
      totalCount: totalSamples,
      recordCount: group.length,
      saleCount: sampleCount(group.filter((row) => row.kind === "Satış")),
      listingCount: sampleCount(group.filter((row) => row.kind === "İlan")),
      latestAt: latest.observedAt,
      channels: [...new Set(group.map((row) => row.channel))],
      evidence: evidence(thirtySamples || totalSamples),
    };
  }).sort((a, b) => b.totalCount - a.totalCount || a.subject.localeCompare(b.subject, "tr"));
}

export function summarizeMarketSignals(signals) {
  const rows = (Array.isArray(signals) ? signals : []).map((row) => ({
    subject: String(row?.subject || "").trim(),
    buySignals: Math.max(0, Number(row?.buySignals) || 0),
    sellSignals: Math.max(0, Number(row?.sellSignals) || 0),
  })).filter((row) => row.subject && row.buySignals + row.sellSignals > 0);
  const top = (score) => [...rows].sort((left, right) => score(right) - score(left) || left.subject.localeCompare(right.subject, "tr"))[0] ?? null;
  return {
    mostWanted: top((row) => row.buySignals),
    mostOffered: top((row) => row.sellSignals),
    demandGap: top((row) => row.buySignals - row.sellSignals),
    mostActive: top((row) => row.buySignals + row.sellSignals),
  };
}
