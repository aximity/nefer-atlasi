export const STORAGE_SCALES = Object.freeze([
  "raw_game_value",
  "scaled_1000",
  "scaled_10000",
  "puan",
  "unknown",
]);

const supportedScales = new Set(STORAGE_SCALES);
const publishableStatuses = new Set(["single_source", "cross_verified"]);
const verificationText = "Doğrulama gerekiyor";

export function isSupportedStorageScale(scale) {
  return supportedScales.has(scale);
}

export function statValueModel(stat) {
  const storageScale = isSupportedStorageScale(stat.unit) ? stat.unit : "unknown";
  const calculationScale = storageScale === "unknown" ? null : storageScale;
  const displayIsIdentity = storageScale === "raw_game_value" || storageScale === "puan";
  return {
    rawValue: stat.value,
    storageScale,
    calculationScale,
    displayValue: displayIsIdentity ? stat.value : null,
    displayIsIdentity,
  };
}

export function formatStatValue(stat, locale = "tr-TR") {
  const model = statValueModel(stat);
  if (model.displayValue === null) return verificationText;
  return new Intl.NumberFormat(locale).format(model.displayValue);
}

export function summarizeCompatibleStats(stats) {
  const grouped = new Map();
  for (const stat of stats) {
    const rows = grouped.get(stat.attribute) ?? [];
    rows.push(stat);
    grouped.set(stat.attribute, rows);
  }

  const values = {}, scales = {}, incompatible = [];
  for (const [attribute, rows] of grouped) {
    const calculationScales = new Set(
      rows.map((stat) => statValueModel(stat).calculationScale),
    );
    if (calculationScales.has(null) || calculationScales.size !== 1) {
      incompatible.push(attribute);
      continue;
    }
    const [scale] = calculationScales;
    values[attribute] = rows.reduce((sum, stat) => sum + stat.value, 0);
    scales[attribute] = scale;
  }
  return { values, scales, incompatible };
}

export function sumPublishedStats(itemIds, stats) {
  const selected = new Set(itemIds);
  return summarizeCompatibleStats(
    stats.filter(
      (stat) =>
        selected.has(stat.itemId) &&
        publishableStatuses.has(stat.verificationStatus),
    ),
  );
}
