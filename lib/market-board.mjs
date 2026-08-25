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
    return [{
      id: row.id,
      subject: String(row.subject).trim(),
      subjectKey: normalizeName(row.subject),
      server: row.server,
      observedAt: row.observedAt,
      currency,
      quantity,
      unitPrice: effectiveTotal / quantity,
      kind: isSale ? "Satış" : "İlan",
      channel: row.details.channel || "Belirsiz",
      sourceCount: Number(row.sourceCount) || 0,
    }];
  });
}

export function summarizeMarket(rows, { currency = "Oyun parası", mode = "Tümü", now = Date.now() } = {}) {
  const observations = normalizeMarketObservations(rows).filter((row) =>
    row.currency === currency && (mode === "Tümü" || row.kind === mode),
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
    return {
      subject: latest.subject,
      currency,
      sevenDayMedian: median(seven.map((row) => row.unitPrice)),
      sevenDayCount: seven.length,
      thirtyDayMedian: median(thirty.map((row) => row.unitPrice)),
      thirtyDayCount: thirty.length,
      allTimeMedian: median(group.map((row) => row.unitPrice)),
      totalCount: group.length,
      saleCount: group.filter((row) => row.kind === "Satış").length,
      listingCount: group.filter((row) => row.kind === "İlan").length,
      latestAt: latest.observedAt,
      channels: [...new Set(group.map((row) => row.channel))],
      evidence: evidence(thirty.length || group.length),
    };
  }).sort((a, b) => b.totalCount - a.totalCount || a.subject.localeCompare(b.subject, "tr"));
}
