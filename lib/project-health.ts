import {
  evidence,
  appearanceImages,
  images,
  itemEvidence,
  itemRecipe,
  items,
  publishableItems,
  publishableStats,
  recipes,
  sourceFor,
  sources,
  stats,
  talismans,
} from "./catalog.ts";
import abilityDetailRows from "../data/ability-details.json" with { type: "json" };
import abilityMediaRows from "../data/ability-media.json" with { type: "json" };
import abilityVariantRows from "../data/ability-variants.json" with { type: "json" };
import { potionRecipes } from "./potion-recipes.ts";
import { SITE_RELEASE } from "./site-release.ts";
import { talismanRecipes } from "./talisman-recipes.ts";
import {
  coveredItemVisualFamilyIds,
  itemVisualFamilyInventory,
  potionVisualFamilies,
  talismanVisualFamilies,
} from "./visual-families.ts";

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
const itemFamilyInventory = itemVisualFamilyInventory(publishableItems);
const coveredItemFamilies = coveredItemVisualFamilyIds({
  items: publishableItems,
  images,
  appearanceImages,
});
const coveredTalismanFamilies = talismanVisualFamilies.filter(
  (family) => family.status === "verified" && Boolean(family.assetRef),
);
const coveredPotionFamilies = potionVisualFamilies.filter(
  (family) => family.status === "verified" && Boolean(family.assetRef),
);
const claimPassesTrustPolicy = (claim: (typeof evidence)[number]) =>
  claim.status === "cross_verified"
  || sourceFor(claim.sourceId)?.requiresCrossVerification === false;
const itemPassesTrustPolicy = (itemId: string) =>
  ["name", "class", "slot"].every((field) =>
    itemEvidence(itemId, field).some(claimPassesTrustPolicy),
  );
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
  appearanceImages.every((asset) => sourceIds.has(asset.sourceId)),
  itemFamilyInventory.every(({ items: familyItems }) => familyItems.length > 0),
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
  ...appearanceImages.map((image) => image.checkedAt),
  ...talismans.map((talisman) => talisman.lastChecked),
  ...talismanRecipes.map((recipe) => recipe.lastChecked),
  ...potionRecipes.map((recipe) => recipe.lastChecked),
  ...abilityDetailRows.map((detail) => detail.lastChecked),
  ...abilityVariantRows.map((variant) => variant.lastChecked),
  ...abilityMediaRows.map((media) => media.checkedAt),
].filter((date): date is string => typeof date === "string" && date.length > 0);
const latestAuditMs = Date.parse(SITE_RELEASE.releasedOn);
const freshnessWindowMs = 30 * 24 * 60 * 60 * 1000;
const freshRecords = auditRecords.filter(
  (date) => {
    const age = latestAuditMs - Date.parse(date);
    return age >= 0 && age <= freshnessWindowMs;
  },
).length;

const rawMetrics = [
  {
    id: "evidence" as const,
    label: "Güven politikasını geçen eşya",
    shortLabel: "Kanıt",
    value: publishableItems.filter((item) => itemPassesTrustPolicy(item.id)).length,
    total: publishableItems.length,
    weight: 25,
    detail: "Ad, sınıf ve yuva alanlarının her biri ya çapraz doğrulanmış ya da ikinci teyit istemeyen İKV ana kaynağına bağlıdır.",
    action: "Eksik temel alanı bağımsız kaynakla doğrula veya İKV ana kaynak kaydına bağla.",
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
    detail: "Eşyanın üretim formülü, düşme yeri/boss veya açık elde etme yöntemi bulunan kayıtlar. Reçete kâğıdının nereden alındığı ayrı ölçülür.",
    action: "Eksik kayıtlara bölge, boss ya da reçete kaynağı bağla.",
  },
  {
    id: "media" as const,
    label: "Görsel ailesi kapsamı",
    shortLabel: "Medya",
    value:
      itemFamilyInventory.filter(({ family }) => coveredItemFamilies.has(family.id)).length
      + coveredTalismanFamilies.length
      + coveredPotionFamilies.length,
    total: itemFamilyInventory.length + talismanVisualFamilies.length + potionVisualFamilies.length,
    weight: 20,
    detail: "Eşya, tılsım ve iksirlerde aynı gövdeyi paylaşan kayıtlar tek görünüş ailesi sayılır; efsun ve değerler görselden ayrı tutulur.",
    action: "Her kayıt yerine yalnız eksik eşya gövdesi veya tılsım/iksir renk ailesi için bir doğrulanmış oyun içi görsel topla.",
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
    detail: "Eşya, özellik, reçete, tılsım, yetenek, kanıt, kaynak ve görsellerin canlı sürüm tarihine göre 30 günlük penceresi.",
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
