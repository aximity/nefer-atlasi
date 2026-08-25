export const FARM_PROFESSIONS = ["Madenci", "Sarraf"];
export const FARM_BOOSTERS = ["Yok", "Kişisel", "Lonca", "Kişisel + Lonca"];
export const FARM_GRADES = ["Normal", "Saf", "Nadir"];

function cleanText(value, field, min, max) {
  if (typeof value !== "string") throw new Error(`${field} metin olmalıdır.`);
  const result = value.trim().replace(/\u0000/g, "");
  if (result.length < min || result.length > max) {
    throw new Error(`${field} uzunluğu geçersiz.`);
  }
  return result;
}

function number(value, field, min, max, integer = false) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${field} geçerli bir sayı olmalıdır.`);
  }
  if (integer && !Number.isInteger(value)) throw new Error(`${field} tam sayı olmalıdır.`);
  if (value < min || value > max) throw new Error(`${field} izin verilen aralığın dışında.`);
  return value;
}

function optionalPrice(value, field, { decimal = false } = {}) {
  if (value === "" || value == null) return null;
  const parsed = number(value, field, 0, decimal ? 10_000_000 : 1_000_000_000_000_000);
  return decimal ? Math.round(parsed * 100) : Math.round(parsed);
}

export function validateFarmSession(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Geçersiz farm kaydı.");
  }
  const observedAt = cleanText(raw.observedAt, "Tarih", 10, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(observedAt)) throw new Error("Tarih biçimi geçersiz.");
  const parsedDate = new Date(`${observedAt}T12:00:00Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== observedAt) {
    throw new Error("Tarih geçersiz.");
  }
  if (parsedDate.getTime() > Date.now() + 86_400_000 || observedAt < "2007-01-01") {
    throw new Error("Tarih geçerli aralıkta değil.");
  }
  const profession = cleanText(raw.profession, "Meslek", 2, 20);
  if (!FARM_PROFESSIONS.includes(profession)) throw new Error("Meslek seçimi geçersiz.");
  const boosterProfile = cleanText(raw.boosterProfile, "Artırıcı", 2, 30);
  if (!FARM_BOOSTERS.includes(boosterProfile)) throw new Error("Artırıcı seçimi geçersiz.");
  if (!Array.isArray(raw.yields) || raw.yields.length < 1 || raw.yields.length > 20) {
    throw new Error("Bir farm kaydında 1–20 maden satırı olmalıdır.");
  }
  const yields = raw.yields.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`${index + 1}. maden satırı geçersiz.`);
    }
    const grade = cleanText(entry.grade, "Kalite", 3, 20);
    if (!FARM_GRADES.includes(grade)) throw new Error("Maden kalitesi geçersiz.");
    return {
      material: cleanText(entry.material, "Maden adı", 2, 80),
      grade,
      quantity: number(entry.quantity, "Miktar", 1, 1_000_000, true),
      unitGamePrice: optionalPrice(entry.unitGamePrice, "Oyun parası fiyatı"),
      unitTlKurus: optionalPrice(entry.unitTlPrice, "TL fiyatı", { decimal: true }),
    };
  });
  const routeTemplateId =
    raw.routeTemplateId == null || raw.routeTemplateId === ""
      ? null
      : cleanText(raw.routeTemplateId, "Rota şablonu", 36, 36);
  if (routeTemplateId && !/^[0-9a-f-]{36}$/i.test(routeTemplateId)) {
    throw new Error("Rota şablonu geçersiz.");
  }
  return {
    server: cleanText(raw.server, "Sunucu", 2, 80),
    region: cleanText(raw.region, "Bölge", 2, 120),
    routeName: cleanText(raw.routeName, "Rota", 2, 120),
    profession,
    observedAt,
    durationMinutes: number(raw.durationMinutes, "Süre", 1, 720, true),
    nodeCount: number(raw.nodeCount, "Damar", 1, 10_000, true),
    boosterProfile,
    gameCost: optionalPrice(raw.gameCost, "Oyun parası maliyeti") ?? 0,
    tlCostKurus: optionalPrice(raw.tlCost, "TL maliyeti", { decimal: true }) ?? 0,
    notes:
      typeof raw.notes === "string"
        ? raw.notes.trim().replace(/\u0000/g, "").slice(0, 1500)
        : "",
    routeTemplateId,
    yields,
  };
}

export function calculateFarmSession(session) {
  const durationMinutes = Number(session.durationMinutes) || 0;
  const hours = durationMinutes / 60;
  const rows = Array.isArray(session.yields) ? session.yields : [];
  const totalQuantity = rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const gamePricedQuantity = rows.reduce(
    (sum, row) => sum + (row.unitGamePrice == null ? 0 : Number(row.quantity || 0)),
    0,
  );
  const tlPricedQuantity = rows.reduce(
    (sum, row) => sum + (row.unitTlKurus == null ? 0 : Number(row.quantity || 0)),
    0,
  );
  const grossGame = rows.reduce(
    (sum, row) => sum + Number(row.quantity || 0) * Number(row.unitGamePrice || 0),
    0,
  );
  const grossTlKurus = rows.reduce(
    (sum, row) => sum + Number(row.quantity || 0) * Number(row.unitTlKurus || 0),
    0,
  );
  const netGame = grossGame - Number(session.gameCost || 0);
  const netTlKurus = grossTlKurus - Number(session.tlCostKurus || 0);
  return {
    totalQuantity,
    itemsPerHour: hours > 0 ? totalQuantity / hours : 0,
    nodesPerHour: hours > 0 ? Number(session.nodeCount || 0) / hours : 0,
    grossGame,
    netGame,
    gamePerHour: hours > 0 ? netGame / hours : 0,
    grossTlKurus,
    netTlKurus,
    tlKurusPerHour: hours > 0 ? netTlKurus / hours : 0,
    gameCoverage: totalQuantity > 0 ? gamePricedQuantity / totalQuantity : 0,
    tlCoverage: totalQuantity > 0 ? tlPricedQuantity / totalQuantity : 0,
  };
}

export function summarizeFarmSessions(sessions) {
  const active = sessions.filter((session) => session.status !== "archived");
  const computed = active.map((session) => ({
    session,
    metrics: calculateFarmSession(session),
  }));
  const durationMinutes = active.reduce((sum, row) => sum + Number(row.durationMinutes || 0), 0);
  const totalQuantity = computed.reduce((sum, row) => sum + row.metrics.totalQuantity, 0);
  const grossGame = computed.reduce((sum, row) => sum + row.metrics.grossGame, 0);
  const gameCost = active.reduce((sum, row) => sum + Number(row.gameCost || 0), 0);
  const grossTlKurus = computed.reduce((sum, row) => sum + row.metrics.grossTlKurus, 0);
  const tlCostKurus = active.reduce((sum, row) => sum + Number(row.tlCostKurus || 0), 0);
  const hours = durationMinutes / 60;
  return {
    sessionCount: active.length,
    durationMinutes,
    nodeCount: active.reduce((sum, row) => sum + Number(row.nodeCount || 0), 0),
    totalQuantity,
    itemsPerHour: hours > 0 ? totalQuantity / hours : 0,
    netGame: grossGame - gameCost,
    gamePerHour: hours > 0 ? (grossGame - gameCost) / hours : 0,
    netTlKurus: grossTlKurus - tlCostKurus,
    tlKurusPerHour: hours > 0 ? (grossTlKurus - tlCostKurus) / hours : 0,
    confidence:
      active.length >= 10
        ? "Güçlü örneklem"
        : active.length >= 5
          ? "Gelişen örneklem"
          : active.length >= 2
            ? "Ön sonuç"
            : "Tek tur",
  };
}

export function compareBoosterProfiles(sessions) {
  return FARM_BOOSTERS.map((boosterProfile) => {
    const group = sessions.filter(
      (session) => session.status !== "archived" && session.boosterProfile === boosterProfile,
    );
    return { boosterProfile, ...summarizeFarmSessions(group) };
  }).filter((row) => row.sessionCount > 0);
}
