import { calculateFarmSession, summarizeFarmSessions } from "./farm-core.mjs";

export function routeIdentity(session) {
  if (typeof session.routeTemplateId === "string" && session.routeTemplateId) {
    return `template:${session.routeTemplateId}`;
  }
  return [session.server, session.region, session.routeName]
    .map((value) => String(value || "").trim().toLocaleLowerCase("tr-TR"))
    .join("|");
}

export function evidenceLevel(sessionCount) {
  const count = Math.max(0, Number(sessionCount) || 0);
  if (count >= 10) return { label: "Güçlü örneklem", level: 4, nextAt: null };
  if (count >= 5) return { label: "Gelişen örneklem", level: 3, nextAt: 10 };
  if (count >= 2) return { label: "Ön sonuç", level: 2, nextAt: 5 };
  return { label: "Tek tur", level: 1, nextAt: 2 };
}

export function groupRoutePerformance(sessions) {
  const groups = new Map();
  for (const session of sessions) {
    if (session.status === "archived") continue;
    const key = routeIdentity(session);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(session);
  }
  return [...groups.entries()].map(([key, rows]) => {
    const summary = summarizeFarmSessions(rows);
    const coverageWeight = rows.reduce(
      (total, row) => total + calculateFarmSession(row).totalQuantity,
      0,
    );
    const weighted = rows.reduce(
      (result, row) => {
        const metrics = calculateFarmSession(row);
        result.game += metrics.gameCoverage * metrics.totalQuantity;
        result.tl += metrics.tlCoverage * metrics.totalQuantity;
        return result;
      },
      { game: 0, tl: 0 },
    );
    const first = rows[0];
    return {
      key,
      routeTemplateId: first.routeTemplateId || null,
      routeName: first.routeName,
      region: first.region,
      server: first.server,
      boosters: [...new Set(rows.map((row) => row.boosterProfile))],
      ...summary,
      nodesPerHour:
        summary.durationMinutes > 0
          ? summary.nodeCount / (summary.durationMinutes / 60)
          : 0,
      gameCoverage: coverageWeight ? weighted.game / coverageWeight : 0,
      tlCoverage: coverageWeight ? weighted.tl / coverageWeight : 0,
      evidence: evidenceLevel(summary.sessionCount),
      lastObservedAt: rows.map((row) => row.observedAt).sort().at(-1) || "",
    };
  });
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function priceStats(observations) {
  if (!observations.length) return null;
  const values = observations.map((row) => row.value);
  const latest = [...observations].sort((a, b) => b.date.localeCompare(a.date))[0];
  return {
    count: observations.length,
    latest: latest.value,
    latestAt: latest.date,
    median: median(values),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export function summarizeMaterialPrices(sessions) {
  const materials = new Map();
  for (const session of sessions) {
    if (session.status === "archived") continue;
    for (const row of session.yields || []) {
      const name = String(row.material || "").trim();
      if (!name) continue;
      if (!materials.has(name)) materials.set(name, { game: [], tl: [] });
      const target = materials.get(name);
      if (row.unitGamePrice != null) target.game.push({ value: Number(row.unitGamePrice), date: session.observedAt });
      if (row.unitTlKurus != null) target.tl.push({ value: Number(row.unitTlKurus), date: session.observedAt });
    }
  }
  return [...materials.entries()].map(([material, observations]) => ({
    material,
    game: priceStats(observations.game),
    tlKurus: priceStats(observations.tl),
  }));
}

export function projectRoutePerformance(performance, minutes) {
  const safeMinutes = Math.min(720, Math.max(1, Number(minutes) || 0));
  const hours = safeMinutes / 60;
  return {
    minutes: safeMinutes,
    items: Number(performance.itemsPerHour || 0) * hours,
    nodes: Number(performance.nodesPerHour || 0) * hours,
    game: Number(performance.gamePerHour || 0) * hours,
    tlKurus: Number(performance.tlKurusPerHour || 0) * hours,
  };
}
