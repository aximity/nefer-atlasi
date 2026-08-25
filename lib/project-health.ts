import {
  evidence,
  images,
  itemEvidence,
  itemRecipe,
  items,
  publishableItems,
  publishableStats,
  recipes,
  sources,
  stats,
} from "./catalog";

export type HealthState = "Güçlü" | "Gelişiyor" | "Veri bekliyor";

export interface HealthMetric {
  id: "evidence" | "stats" | "acquisition" | "media" | "integrity" | "freshness";
  label: string;
  shortLabel: string;
  value: number;
  total: number;
  percent: number;
  weight: number;
  state: HealthState;
  detail: string;
  action: string;
}

const percent = (value: number, total: number) =>
  total ? Math.round((value / total) * 1000) / 10 : 0;

export const healthState = (value: number): HealthState =>
  value >= 75 ? "Güçlü" : value >= 45 ? "Gelişiyor" : "Veri bekliyor";

const itemIds = new Set(items.map((item) => item.id));
const sourceIds = new Set(sources.map((source) => source.id));
const integrityChecks = [
  itemIds.size === items.length,
  sourceIds.size === sources.length,
  new Set(evidence.map((claim) => claim.id)).size === evidence.length,
  evidence.every(
    (claim) => itemIds.has(claim.itemId) && sourceIds.has(claim.sourceId),
  ),
  images.every(
    (asset) => itemIds.has(asset.itemId) && sourceIds.has(asset.sourceId),
  ),
  publishableItems.every((item) =>
    ["name", "class", "slot"].every((field) =>
      itemEvidence(item.id, field).some(
        (claim) =>
          claim.status === "single_source" || claim.status === "cross_verified",
      ),
    ),
  ),
];

const auditRecords = [
  ...items.map((item) => item.lastChecked),
  ...stats.map((stat) => stat.lastChecked),
  ...recipes.map((recipe) => recipe.lastChecked),
  ...evidence.map((claim) => claim.checkedAt),
  ...sources.map((source) => source.accessedAt),
  ...images.map((image) => image.checkedAt),
].filter(Boolean);
const latestAuditMs = Math.max(...auditRecords.map((date) => Date.parse(date)));
const freshnessWindowMs = 30 * 24 * 60 * 60 * 1000;
const freshRecords = auditRecords.filter(
  (date) => latestAuditMs - Date.parse(date) <= freshnessWindowMs,
).length;

const rawMetrics = [
  {
    id: "evidence" as const,
    label: "Çapraz doğrulanmış eşya",
    shortLabel: "Kanıt",
    value: publishableItems.filter((item) =>
      itemEvidence(item.id).some((claim) => claim.status === "cross_verified"),
    ).length,
    total: publishableItems.length,
    weight: 25,
    detail: "En az bir alanı iki bağımsız kaynak grubuyla doğrulanan kayıtlar.",
    action: "İkinci bağımsız kaynak veya eşya adını da gösteren oyun içi kanıt ekle.",
  },
  {
    id: "stats" as const,
    label: "Hesaplanabilir özellik",
    shortLabel: "Özellik",
    value: publishableItems.filter((item) => publishableStats(item.id).length > 0)
      .length,
    total: publishableItems.length,
    weight: 20,
    detail: "Build hesabına girebilen, pozitif ve kaynak durumlu özellik kaydı.",
    action: "Önce sık kullanılan ama özellik değeri eksik eşyaları tamamla.",
  },
  {
    id: "acquisition" as const,
    label: "Elde etme bilgisi",
    shortLabel: "Elde etme",
    value: publishableItems.filter(
      (item) =>
        Boolean(itemRecipe(item.id)) ||
        Boolean(item.acquisition) ||
        Boolean(item.region && item.boss),
    ).length,
    total: publishableItems.length,
    weight: 15,
    detail: "Reçete, düşme yeri/boss veya açık elde etme yöntemi bulunan kayıtlar.",
    action: "Eksik kayıtlara bölge, boss ya da reçete kaynağı bağla.",
  },
  {
    id: "media" as const,
    label: "Doğrulanmış görsel",
    shortLabel: "Medya",
    value: publishableItems.filter((item) =>
      images.some(
        (asset) =>
          asset.itemId === item.id && asset.nameAndAppearanceTogether === true,
      ),
    ).length,
    total: publishableItems.length,
    weight: 20,
    detail: "Eşya adı ile görünüşü aynı kanıtta görülen ve tek eşyaya bağlı medya.",
    action: "Aynı görseli çoğaltma; ad + görünüşü birlikte gösteren özgün kayıt topla.",
  },
  {
    id: "integrity" as const,
    label: "Veri bütünlüğü kapıları",
    shortLabel: "Bütünlük",
    value: integrityChecks.filter(Boolean).length,
    total: integrityChecks.length,
    weight: 15,
    detail: "Kimlik tekilliği, kaynak bağları ve yayımlama alanları için otomatik kapılar.",
    action: "Kırık kimlik veya kaynak bağını yayın öncesi otomatik testte durdur.",
  },
  {
    id: "freshness" as const,
    label: "Son 30 gün içinde denetlenen",
    shortLabel: "Güncellik",
    value: freshRecords,
    total: auditRecords.length,
    weight: 5,
    detail: "Eşya, özellik, reçete, kanıt, kaynak ve görsellerin en yeni denetime göre 30 günlük penceresi.",
    action: "Eski kayıtları öncelik sırasıyla yeniden kontrol et.",
  },
];

export const projectHealthMetrics: HealthMetric[] = rawMetrics.map((metric) => {
  const score = percent(metric.value, metric.total);
  return { ...metric, percent: score, state: healthState(score) };
});

export const projectHealthScore = Math.round(
  projectHealthMetrics.reduce(
    (sum, metric) => sum + metric.percent * (metric.weight / 100),
    0,
  ),
);

export const projectHealthState = healthState(projectHealthScore);
export const projectHealthPriorities = [...projectHealthMetrics]
  .sort((a, b) => a.percent - b.percent || b.weight - a.weight)
  .slice(0, 3);
export const projectHealthAuditDate = new Date(latestAuditMs).toLocaleDateString(
  "tr-TR",
  { day: "numeric", month: "long", year: "numeric" },
);

export const projectHealthTotals = {
  items: publishableItems.length,
  sources: sources.length,
  claims: evidence.length,
};
