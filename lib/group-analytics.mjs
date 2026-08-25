const DAY = 24 * 60 * 60 * 1000;

function evidence(total) {
  if (total >= 30) return { level: 4, label: "Güçlü örneklem", nextAt: null };
  if (total >= 10) return { level: 3, label: "Gelişen örneklem", nextAt: 30 };
  if (total >= 3) return { level: 2, label: "Erken sinyal", nextAt: 10 };
  return { level: 1, label: "Veri yetersiz", nextAt: 3 };
}

function counts(values) {
  const map = new Map();
  for (const value of values.filter(Boolean)) map.set(value, (map.get(value) || 0) + 1);
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr"));
}

function protectBuckets(rows, threshold = 3) {
  return { visible: rows.filter((row) => row.count >= threshold), suppressed: rows.filter((row) => row.count < threshold).length };
}

export function summarizeGroupDemand(rows, { now = Date.now(), bucketThreshold = 3 } = {}) {
  const valid = (Array.isArray(rows) ? rows : []).filter((row) => {
    const start = new Date(row.startAt).getTime();
    return Number.isFinite(start) && start >= now - 30 * DAY && start <= now + 72 * 60 * 60_000 && row.status !== "cancelled";
  });
  const sevenDay = valid.filter((row) => new Date(row.startAt).getTime() >= now - 7 * DAY);
  const hours = valid.map((row) => {
    const value = new Date(new Date(row.startAt).getTime() + 3 * 60 * 60_000).getUTCHours();
    const start = Math.floor(value / 2) * 2;
    return `${String(start).padStart(2, "0")}:00–${String((start + 2) % 24).padStart(2, "0")}:00`;
  });
  return {
    total30: valid.length,
    total7: sevenDay.length,
    evidence: evidence(valid.length),
    roles: protectBuckets(counts(valid.flatMap((row) => Array.isArray(row.roles) ? row.roles : [])), bucketThreshold),
    regions: protectBuckets(counts(valid.map((row) => row.region)), bucketThreshold),
    categories: protectBuckets(counts(valid.map((row) => row.category)), bucketThreshold),
    hours: protectBuckets(counts(hours), bucketThreshold),
  };
}
