const cleanText = (value = "") => value
  .replace(/<br\s*\/?\s*>/gi, " | ")
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&#39;/gi, "'")
  .replace(/&quot;/gi, '"')
  .replace(/\s+/g, " ")
  .replace(/\s*\|\s*$/, "")
  .trim();

export const questIdentityKey = (value = "") => (value ?? "")
  .toLocaleLowerCase("tr-TR")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9çğıöşü]+/g, " ")
  .trim();

export function parseOfficialQuestRows(html) {
  return [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) => [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cleanText(cell[1])))
    .filter((cells) => cells.length === 4 && /\[\d+\][.]?\s*$/.test(cells[0]))
    .map(([rawName, objective, rawMinLevel, prerequisite]) => {
      const levelMatch = rawName.match(/\[(\d+)\][.]?\s*$/);
      return {
        rawName,
        name: rawName.replace(/\s*\[\d+\][.]?\s*$/, "").trim(),
        level: Number(levelMatch[1]),
        minLevel: rawMinLevel === "" ? null : Number(rawMinLevel),
        objective: objective === "..." ? null : objective,
        prerequisite,
      };
    });
}

export function matchOfficialQuestRows(chainRows, officialRows) {
  const pools = new Map();
  for (const row of officialRows) {
    const key = `${questIdentityKey(row.name)}|${row.level}`;
    const pool = pools.get(key) ?? [];
    pool.push(row);
    pools.set(key, pool);
  }

  const matches = new Map();
  for (const row of chainRows) {
    const key = `${questIdentityKey(row.name)}|${row.level}`;
    const pool = pools.get(key) ?? [];
    const objectiveIndex = pool.findIndex((candidate) => questIdentityKey(candidate.objective) === questIdentityKey(row.objective));
    const match = objectiveIndex >= 0 ? pool.splice(objectiveIndex, 1)[0] : pool.shift() ?? null;
    matches.set(row.sourceNumber, match);
  }
  return matches;
}
