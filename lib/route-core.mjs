export const ROUTE_POINT_TYPES = ["Başlangıç", "Damar", "Bekleme", "Tehlike"];
export const ROUTE_PROFESSIONS = ["Madenci", "Sarraf"];
export const ROUTE_BOOSTERS = ["Yok", "Kişisel", "Lonca", "Kişisel + Lonca"];

function cleanText(value, field, min, max, optional = false) {
  if (optional && (value == null || value === "")) return "";
  if (typeof value !== "string") throw new Error(`${field} metin olmalıdır.`);
  const result = value.trim().replace(/\u0000/g, "");
  if (result.length < min || result.length > max) {
    throw new Error(`${field} uzunluğu geçersiz.`);
  }
  return result;
}

function integer(value, field, min, max) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${field} tam sayı olmalıdır.`);
  }
  if (value < min || value > max) throw new Error(`${field} izin verilen aralığın dışında.`);
  return value;
}

export function validateRouteTemplate(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Geçersiz rota şablonu.");
  }
  const profession = cleanText(raw.profession, "Meslek", 2, 20);
  if (!ROUTE_PROFESSIONS.includes(profession)) throw new Error("Meslek seçimi geçersiz.");
  const defaultBooster = cleanText(raw.defaultBooster, "Artırıcı", 2, 30);
  if (!ROUTE_BOOSTERS.includes(defaultBooster)) throw new Error("Artırıcı seçimi geçersiz.");
  if (!Array.isArray(raw.points) || raw.points.length < 1 || raw.points.length > 100) {
    throw new Error("Bir rotada 1–100 işaret olmalıdır.");
  }
  const points = raw.points.map((point, index) => {
    if (!point || typeof point !== "object" || Array.isArray(point)) {
      throw new Error(`${index + 1}. rota işareti geçersiz.`);
    }
    const pointType = cleanText(point.pointType, "İşaret türü", 3, 20);
    if (!ROUTE_POINT_TYPES.includes(pointType)) throw new Error("İşaret türü geçersiz.");
    return {
      orderIndex: index,
      pointType,
      label: cleanText(point.label, "İşaret etiketi", 1, 80),
      materialHint: cleanText(point.materialHint, "Maden ipucu", 0, 80, true),
      xPermille: integer(point.xPermille, "Yatay konum", 0, 1000),
      yPermille: integer(point.yPermille, "Dikey konum", 0, 1000),
      notes: cleanText(point.notes, "İşaret notu", 0, 240, true),
    };
  });
  return {
    server: cleanText(raw.server, "Sunucu", 2, 80),
    region: cleanText(raw.region, "Bölge", 2, 120),
    routeName: cleanText(raw.routeName, "Rota adı", 2, 120),
    profession,
    defaultBooster,
    expectedMinutes: integer(raw.expectedMinutes, "Beklenen süre", 1, 720),
    notes: cleanText(raw.notes, "Rota notu", 0, 1500, true),
    points,
  };
}

export function routeSessionDefaults(route) {
  const nodeCount = Array.isArray(route.points)
    ? route.points.filter((point) => point.pointType === "Damar").length
    : 0;
  return {
    routeTemplateId: route.id,
    server: route.server,
    region: route.region,
    routeName: route.routeName,
    profession: route.profession,
    durationMinutes: String(route.expectedMinutes),
    nodeCount: String(Math.max(1, nodeCount)),
    boosterProfile: route.defaultBooster,
    notes: route.notes || "",
  };
}

export function buildMiningContributionPayload(session, actorLabel) {
  if (!session || !Array.isArray(session.yields) || session.yields.length < 1) {
    throw new Error("Doğrulamaya gönderilecek tur çıktısı bulunamadı.");
  }
  const uniqueMaterials = [...new Set(session.yields.map((row) => String(row.material).trim()).filter(Boolean))];
  if (!uniqueMaterials.length) throw new Error("Doğrulamaya gönderilecek maden adı bulunamadı.");
  const subject = uniqueMaterials.slice(0, 3).join(" + ").slice(0, 120);
  return {
    kind: "mining_run",
    common: {
      server: session.server,
      observedAt: session.observedAt,
      alias: String(actorLabel || "Saha editörü").slice(0, 40),
      notes: [`Saha Operasyonu: ${session.routeName}.`, session.notes || ""].join(" ").trim().slice(0, 2000),
      sourceUrl: "",
      secondarySourceUrl: "",
    },
    details: {
      subject,
      region: session.region,
      routeMinutes: session.durationMinutes,
      nodeCount: session.nodeCount,
      runCount: 1,
      yields: session.yields.map((row) => `${row.material} (${row.grade}): ${row.quantity}`).join("; ").slice(0, 1000),
      boosters: session.boosterProfile,
    },
    farmSessionId: session.id,
  };
}
