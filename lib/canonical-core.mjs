const TYPE_BY_KIND = {
  item_evidence: "item",
  mining_run: "mining_route",
  market_price: "market_observation",
  ability_media: "ability_media",
};

export function canonicalSlug(value) {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function compact(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== "" && value != null),
  );
}

export function contributionToCanonical(contribution) {
  const kind = contribution.type;
  const details = contribution.payload?.details ?? {};
  const entityType = TYPE_BY_KIND[kind];
  if (!entityType) throw new Error("Bu katkı türü ana veri katmanına bağlanamaz.");
  const subject = String(contribution.subject ?? details.subject ?? "").trim();
  if (!subject) throw new Error("Ana kayıt için başlık eksik.");
  const shared = {
    name: subject,
    server: contribution.server,
    observedAt: contribution.observedAt,
    verificationStatus: "cross_verified",
    provenance: "community_contribution",
  };
  let data;
  let keyParts;
  if (kind === "item_evidence") {
    data = compact({
      ...shared,
      className: details.className,
      slot: details.slot,
      levelTier: details.levelTier,
      acquisitionPlace: details.acquisitionPlace,
      rarity: details.rarity,
      statLines: details.statLines,
      appearanceProof: details.appearanceProof === true,
    });
    keyParts = [subject, details.className, details.slot];
  } else if (kind === "mining_run") {
    data = compact({
      ...shared,
      region: details.region,
      routeMinutes: details.routeMinutes,
      nodeCount: details.nodeCount,
      runCount: details.runCount,
      yields: details.yields,
      boosters: details.boosters,
    });
    keyParts = [subject, contribution.server, details.region];
  } else if (kind === "market_price") {
    data = compact({
      ...shared,
      tradeDirection: details.tradeDirection,
      listingType: details.listingType,
      quantity: details.quantity,
      currency: details.currency,
      price: details.price,
      channel: details.channel,
      settledPrice: details.settledPrice,
    });
    keyParts = [
      subject,
      contribution.server,
      contribution.observedAt,
      details.currency,
      details.tradeDirection,
      details.listingType,
    ];
  } else {
    data = compact({
      ...shared,
      className: details.className,
      captureContext: details.captureContext,
      abilityPoints: details.abilityPoints,
    });
    keyParts = [subject, details.className, details.captureContext];
  }
  return {
    entityType,
    entityKey: keyParts.map(canonicalSlug).filter(Boolean).join("--").slice(0, 240),
    displayName: subject,
    data,
  };
}

export function diffCanonical(current, proposed) {
  const keys = [...new Set([...Object.keys(current ?? {}), ...Object.keys(proposed ?? {})])];
  return keys
    .filter((key) => JSON.stringify(current?.[key]) !== JSON.stringify(proposed?.[key]))
    .map((key) => ({
      field: key,
      before: current?.[key] ?? null,
      after: proposed?.[key] ?? null,
    }));
}

export function assertMergeAllowed(contribution, { confirmed, expectedVersion, currentVersion }) {
  if (contribution.verificationStatus !== "cross_verified") {
    throw new Error("Birleştirme için katkı çapraz doğrulanmış olmalıdır.");
  }
  if (contribution.publicationStatus !== "published") {
    throw new Error("Birleştirme için katkı önce yayımlanmalıdır.");
  }
  if (!confirmed) throw new Error("Fark önizlemesini onaylamalısın.");
  if (Number(expectedVersion) !== Number(currentVersion)) {
    throw new Error("Ana kayıt değişti. Güncel farkı yeniden yükle.");
  }
}

export function publicCanonicalRecord(row) {
  const data = typeof row.data === "object" && row.data ? row.data : {};
  return {
    id: row.id,
    entityType: row.entityType,
    entityKey: row.entityKey,
    displayName: row.displayName,
    version: Number(row.version),
    updatedAt: row.updatedAt,
    data,
  };
}
