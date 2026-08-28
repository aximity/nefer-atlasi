import productionRows from "../data/talisman-production.json" with { type: "json" };
import recipeAcquisitionRows from "../data/talisman-recipe-acquisition.json" with { type: "json" };
import type { Talisman } from "./catalog";

export type TalismanTierKey = 1 | 2 | 3 | "special";

export interface TalismanTierRule {
  tier: TalismanTierKey;
  label: string;
  acquisition: string;
  recipeRequired: boolean;
  materialsStatus: "awaiting_verification" | "source_matched";
  note: string;
  sourceIds: string[];
}

export interface TalismanVendor {
  id: string;
  name: string;
  kind: string;
  region: string;
  role: string;
  namedOffers: string[];
  scopeNote: string;
  serverScope: "normal_ikv";
  sourceId: string;
  status: "single_source";
  lastChecked: string;
}

export interface TalismanServerReference {
  id: string;
  server: "Kıyametin Öncüleri";
  claim: string;
  scopeNote: string;
  sourceId: string;
  status: "single_source";
  lastChecked: string;
}

export interface TalismanPlayerReport {
  id: string;
  server: "Kıyametin Öncüleri";
  talismanIds: string[];
  itemKind: "Hazır tılsım";
  claim: string;
  npc: string;
  price: number | null;
  priceLabel: string;
  status: "needs_verification";
  evidenceNeeded: string;
  reportedAt: string;
}

export interface TalismanRecipeAcquisition {
  id: string;
  talismanIds: string[];
  serverScope: "normal_ikv";
  status: "exact" | "ambiguous_name";
  method: string;
  location: string;
  detail: string;
  sourceId: string;
  lastChecked: string;
}

export const talismanProduction = productionRows as {
  tierRules: TalismanTierRule[];
  vendors: TalismanVendor[];
  serverReferences: TalismanServerReference[];
  playerReports: TalismanPlayerReport[];
};

export const talismanRecipeAcquisitions = recipeAcquisitionRows as TalismanRecipeAcquisition[];

export function tierRuleFor(talisman: Talisman) {
  const key: TalismanTierKey = talisman.tier ?? "special";
  return talismanProduction.tierRules.find((rule) => rule.tier === key);
}

export function previousTierFor(talisman: Talisman, rows: Talisman[]) {
  if (talisman.tier === null || talisman.tier <= 1) return null;
  return rows.find((candidate) =>
    candidate.class === talisman.class
    && candidate.series === talisman.series
    && candidate.color === talisman.color
    && candidate.tier === talisman.tier! - 1,
  ) ?? null;
}

export function vendorMentionsFor(talisman: Talisman) {
  return talismanProduction.vendors.filter((vendor) => vendor.namedOffers.includes(talisman.name));
}

export function playerReportsFor(talisman: Talisman) {
  if (talisman.tier !== 1) return [];
  return talismanProduction.playerReports.filter((report) => report.talismanIds.includes(talisman.id));
}

export function talismanRecipeAcquisitionFor(talismanId: string) {
  return talismanRecipeAcquisitions.find((row) => row.talismanIds.includes(talismanId)) ?? null;
}

const exactRecipeAcquisitionCount = new Set(talismanRecipeAcquisitions.filter((row) => row.status === "exact").flatMap((row) => row.talismanIds)).size;
const ambiguousRecipeAcquisitionClaims = talismanRecipeAcquisitions.filter((row) => row.status === "ambiguous_name").length;

export const talismanRecipeAcquisitionStats = {
  recipeCount: 120,
  exactRecipeCount: exactRecipeAcquisitionCount,
  ambiguousClaims: ambiguousRecipeAcquisitionClaims,
  unknownRecipeCount: 120 - exactRecipeAcquisitionCount - ambiguousRecipeAcquisitionClaims,
} as const;

export const talismanRecipeAcquisitionPolicy = {
  normalIkv: {
    label: "Normal İKV",
    method: "13 reçete kimlikle eşleşti",
    detail: "Gönül genel reçete ve tılsım satıcısıdır; fakat 120 reçetenin tamamını sattığını gösteren bir envanter yok. Yalnız ad ve kademe eşleşmesi bulunan reçeteler kesin konumla gösterilir.",
    sourceId: "community-ikv-talisman-update-2013",
  },
  ko: {
    label: "Kıyametin Öncüleri",
    method: "NPC'den reçete öğrenme",
    detail: "KÖ rehberi meslek reçetelerinin NPC'lerden öğrenildiğini söylüyor; bu tılsımın hangi NPC'den öğrenildiği henüz doğrulanmadı.",
    sourceId: "kiyametin-onculeri-guide",
  },
  drop: {
    label: "Reçete drobu",
    method: "Doğrulanmış drop kaydı yok",
    detail: "Genel meslek sistemi reçetelerin satıcı, görev veya yaratık kaynaklı olabileceğini söyler; bu reçeteyi belirli bir yaratık ya da bossa bağlayan kanıt yoksa drop yeri tahmin edilmez.",
    sourceId: "official-ikv-jobs-2013",
  },
} as const;
