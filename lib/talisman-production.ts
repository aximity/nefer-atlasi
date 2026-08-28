import productionRows from "../data/talisman-production.json" with { type: "json" };
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
  seriesMatch: string;
  itemKind: "Hazır tılsım";
  claim: string;
  npc: string;
  price: number | null;
  priceLabel: string;
  status: "needs_verification";
  evidenceNeeded: string;
  reportedAt: string;
}

export const talismanProduction = productionRows as {
  tierRules: TalismanTierRule[];
  vendors: TalismanVendor[];
  serverReferences: TalismanServerReference[];
  playerReports: TalismanPlayerReport[];
};

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
  return talismanProduction.playerReports.filter((report) => talisman.series.includes(report.seriesMatch));
}
