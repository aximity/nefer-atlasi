import { publishableItems, recipes, sourceFor, talismans, type Recipe } from "./catalog.ts";
import { craftedMaterialRecipes, craftedMaterialSources, materialSourceFor } from "./material-sources.ts";
import { potionRecipes } from "./potion-recipes.ts";
import { playerReportsFor, vendorMentionsFor } from "./talisman-production.ts";
import { talismanMaterialName, talismanRecipes } from "./talisman-recipes.ts";

export type ProductionKind = "item" | "talisman" | "potion" | "material";

export type ProductionItem = {
  id: string;
  name: string;
  class: string;
  slot: string;
  kind: ProductionKind;
};

export type ProductionRecipe = Recipe & { name?: string; level?: number; category?: string };

const normalize = (value: string) => value.trim().toLocaleLowerCase("tr-TR");
const materialItemId = (name: string) => `material-${normalize(name).replace(/[^a-z0-9çğıöşü]+/g, "-")}`;
const talismanMaterialByName = new Map(talismans.map((row) => [normalize(talismanMaterialName(row)), row]));

export const productionItems: ProductionItem[] = [
  ...publishableItems.map((row) => ({ id: row.id, name: row.name, class: row.class, slot: row.slot, kind: "item" as const })),
  ...talismans.map((row) => ({ id: row.id, name: row.name, class: row.class, slot: `Tılsım · ${row.color}`, kind: "talisman" as const })),
  ...potionRecipes.map((row) => ({ id: row.itemId, name: row.name, class: "Tüm Sınıflar", slot: `İksir · Sv. ${row.level} · ${row.category}`, kind: "potion" as const })),
  ...craftedMaterialSources.map((row) => ({ id: materialItemId(row.name), name: row.name, class: "Tüm Sınıflar", slot: `Ara malzeme · ${row.profession} · Sv. ${row.level}`, kind: "material" as const })),
];

export const productionRecipes: ProductionRecipe[] = [
  ...recipes,
  ...talismanRecipes,
  ...potionRecipes,
  ...craftedMaterialRecipes,
];

export const productionItemById = new Map(productionItems.map((item) => [item.id, item]));

export function productionHrefFor(itemId: string) {
  const item = productionItemById.get(itemId);
  if (!item) return "/uretim#production-planner";
  if (item.kind === "item") return `/?module=items&item=${encodeURIComponent(item.id)}#items`;
  if (item.kind === "talisman") return `/?module=engine&talisman=${encodeURIComponent(item.id)}#engine`;
  if (item.kind === "potion") return `/?module=recipes&kind=potion&recipe=${encodeURIComponent(item.id)}#recipes`;
  return `/?module=atlas&node=${encodeURIComponent(`material:${normalize(item.name)}`)}#atlas`;
}

export type ProductionUse = {
  itemId: string;
  itemName: string;
  itemClass: string;
  slot: string;
  kind: ProductionKind;
  href: string;
  quantity: number;
  recipe: ProductionRecipe;
};

export function productionUsesForMaterial(materialName: string): ProductionUse[] {
  const wanted = normalize(materialName);
  return productionRecipes.flatMap((recipe) => {
    const material = recipe.materials.find((entry) => normalize(entry.name) === wanted);
    const item = productionItemById.get(recipe.itemId);
    if (!material || !item) return [];
    return [{
      itemId: item.id,
      itemName: item.name,
      itemClass: item.class,
      slot: item.slot,
      kind: item.kind,
      href: productionHrefFor(item.id),
      quantity: material.quantity,
      recipe,
    }];
  }).sort((a, b) => a.kind.localeCompare(b.kind, "tr") || a.itemName.localeCompare(b.itemName, "tr"));
}

export const productionMaterialNames = [...new Set(productionRecipes.flatMap((recipe) => recipe.materials.map((row) => row.name)))].sort((a, b) => a.localeCompare(b, "tr"));

export function productionMaterialSourceFor(materialName: string) {
  const direct = materialSourceFor(materialName);
  if (direct) return direct;
  const talisman = talismanMaterialByName.get(normalize(materialName));
  const recipe = talisman && talismanRecipes.find((row) => row.itemId === talisman.id);
  if (!talisman) return null;
  if (recipe) {
    return {
      kind: "talisman_craft" as const,
      name: materialName,
      class: talisman.class,
      color: talisman.color,
      tier: talisman.tier,
      materials: recipe.materials,
      verification: "Kaynaklı kayıt" as const,
      source: sourceFor(recipe.sourceId)?.url ?? null,
    };
  }
  if (talisman.tier !== 1) return null;
  const playerReport = playerReportsFor(talisman)[0];
  const vendor = vendorMentionsFor(talisman)[0];
  if (!playerReport && !vendor) return null;
  if (!playerReport && vendor) {
    return {
      kind: "talisman_acquisition" as const,
      name: materialName,
      talismanId: talisman.id,
      class: talisman.class,
      color: talisman.color,
      tier: talisman.tier,
      npc: vendor.name,
      region: vendor.region,
      priceLabel: "Fiyat kaynakta belirtilmiyor",
      serverScope: "normal_ikv" as const,
      verification: "Kaynaklı kayıt" as const,
      evidenceNeeded: null,
      source: sourceFor(vendor.sourceId)?.url ?? null,
    };
  }
  return {
    kind: "talisman_acquisition" as const,
    name: materialName,
    talismanId: talisman.id,
    class: talisman.class,
    color: talisman.color,
    tier: talisman.tier,
    npc: playerReport?.npc ?? vendor?.name ?? "Gönül",
    region: vendor?.region ?? "Büyük Hol",
    priceLabel: playerReport?.priceLabel ?? "Fiyat doğrulanıyor",
    serverScope: vendor ? "normal_ikv_and_ko_report" as const : "kiyametin_onculeri_report" as const,
    verification: "KÖ oyuncu bildirimi · dükkân görüntüsü bekliyor" as const,
    evidenceNeeded: playerReport?.evidenceNeeded ?? "Gönül dükkânında tılsım adını ve fiyatını gösteren KÖ oyun içi görüntüsü.",
    source: vendor ? sourceFor(vendor.sourceId)?.url ?? null : null,
  };
}
