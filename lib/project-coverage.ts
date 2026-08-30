import abilityDetailsRows from "../data/ability-details.json" with { type: "json" };
import abilityMediaRows from "../data/ability-media.json" with { type: "json" };
import abilityVariantRows from "../data/ability-variants.json" with { type: "json" };
import abilityRows from "../data/abilities.json" with { type: "json" };
import materialIconRows from "../data/material-icons.json" with { type: "json" };
import progressionGapRows from "../data/progression-gaps.json" with { type: "json" };
import {
  appearanceImages,
  images,
  publishableItems,
  recipes,
  talismans,
} from "./catalog.ts";
import { gatheringRows } from "./gathering-catalog.ts";
import { productionRecipes } from "./production-catalog.ts";
import { potionRecipes } from "./potion-recipes.ts";
import {
  talismanRecipeAcquisitionStats,
} from "./talisman-production.ts";
import { talismanRecipes } from "./talisman-recipes.ts";
import {
  coveredItemVisualFamilyIds,
  itemVisualFamilyInventory,
  potionVisualFamilies,
  talismanVisualFamilies,
} from "./visual-families.ts";

export type CoverageState = "Tamamlandı" | "Sürüyor" | "Bekliyor";

export interface ProjectVisualCoverage {
  id:
    | "gathering_icons"
    | "recipe_material_icons"
    | "item_recipe_icons"
    | "item_appearances"
    | "talisman_icons"
    | "potion_bottles"
    | "ability_evidence"
    | "ability_media";
  label: string;
  eyebrow: string;
  value: number;
  total: number;
  percent: number;
  state: CoverageState;
  recordScope: string;
  detail: string;
  missing: string[];
  href: string;
  affectedRecords: number;
}

const normalize = (value: string) => value.trim().toLocaleLowerCase("tr-TR");
const unique = (values: string[]) => [...new Set(values)];
const materialIconNames = new Set(materialIconRows.map((row) => normalize(row.name)));
const hasMaterialIcon = (name: string) => materialIconNames.has(normalize(name));
const percent = (value: number, total: number) =>
  total ? Math.round((value / total) * 1000) / 10 : 0;
const stateFor = (value: number, total: number): CoverageState =>
  value === total ? "Tamamlandı" : value > 0 ? "Sürüyor" : "Bekliyor";

const gatheringOutputs = unique(
  gatheringRows.flatMap((row) =>
    [row.base, row.second, row.third].filter((name): name is string => Boolean(name)),
  ),
).sort((a, b) => a.localeCompare(b, "tr"));
const missingGatheringIcons = gatheringOutputs.filter((name) => !hasMaterialIcon(name));

const recipeMaterialNames = unique(
  productionRecipes.flatMap((recipe) =>
    recipe.materials
      .filter((material) => !("kind" in material && material.kind === "talisman"))
      .map((material) => material.name),
  ),
).sort((a, b) => a.localeCompare(b, "tr"));
const missingRecipeMaterialIcons = recipeMaterialNames.filter((name) => !hasMaterialIcon(name));

const itemById = new Map(publishableItems.map((item) => [item.id, item]));
const itemIconIds = new Set(
  images.filter((image) => image.assetScope === "item_icon").map((image) => image.itemId),
);
const missingItemRecipeIcons = recipes
  .filter((recipe) => !itemIconIds.has(recipe.itemId))
  .map((recipe) => itemById.get(recipe.itemId)?.name ?? recipe.itemId)
  .sort((a, b) => a.localeCompare(b, "tr"));

const itemFamilyInventory = itemVisualFamilyInventory(publishableItems);
const coveredItemFamilies = coveredItemVisualFamilyIds({
  items: publishableItems,
  images,
  appearanceImages,
});
const missingItemFamilies = itemFamilyInventory
  .filter(({ family }) => !coveredItemFamilies.has(family.id))
  .sort((a, b) => b.items.length - a.items.length || a.family.label.localeCompare(b.family.label, "tr"));
const missingItemAppearanceLabels = missingItemFamilies.map(
  ({ family, items: familyItems }) => `${family.label} · ${familyItems.length} eşya`,
);
const missingItemAppearanceRecords = missingItemFamilies.flatMap(({ items: familyItems }) => familyItems).length;

const coveredTalismanFamilies = talismanVisualFamilies.filter(
  (family) => family.status === "verified" && Boolean(family.assetRef),
);
const coveredPotionFamilies = potionVisualFamilies.filter(
  (family) => family.status === "verified" && Boolean(family.assetRef),
);
const talismanRecipeIds = new Set(talismanRecipes.map((recipe) => recipe.talismanId));
const missingSpecialTalismanRecipes = talismans
  .filter((talisman) => talisman.tier === null && !talismanRecipeIds.has(talisman.id))
  .map((talisman) => `${talisman.name} · ${talisman.class} · ${talisman.color}`)
  .sort((a, b) => a.localeCompare(b, "tr"));

const abilityById = new Map(abilityRows.map((ability) => [ability.id, ability]));
const abilityReferenceIds = new Set([
  ...abilityDetailsRows.map((detail) => detail.abilityId),
  ...abilityVariantRows.map((variant) => variant.replacesAbilityId),
]);
const missingAbilityEvidence = abilityRows
  .filter((ability) => !abilityReferenceIds.has(ability.id))
  .map((ability) => ability.name)
  .sort((a, b) => a.localeCompare(b, "tr"));
const publishedAbilityMedia = abilityMediaRows.filter(
  (media) => media.status !== "awaiting_capture" && media.sources.length > 0,
);
const missingAbilityMedia = abilityMediaRows
  .filter((media) => media.status === "awaiting_capture" || media.sources.length === 0)
  .map((media) => abilityById.get(media.abilityId)?.name ?? media.abilityId)
  .sort((a, b) => a.localeCompare(b, "tr"));

const metric = (
  row: Omit<ProjectVisualCoverage, "percent" | "state">,
): ProjectVisualCoverage => ({
  ...row,
  percent: percent(row.value, row.total),
  state: stateFor(row.value, row.total),
});

export const projectVisualCoverage: ProjectVisualCoverage[] = [
  metric({
    id: "gathering_icons",
    label: "Maden ve toplayıcılık ikonları",
    eyebrow: "MADEN · SARRAF · LOKMAN",
    value: gatheringOutputs.length - missingGatheringIcons.length,
    total: gatheringOutputs.length,
    recordScope: `${gatheringRows.length} kaynak düğümündeki ${gatheringOutputs.length} çıktı`,
    detail: "Maden ekranı, reçete ve stok aynı gerçek oyun ikonu sözlüğünü kullanır. Eksik bir çıktı burada kapanınca bağlı bütün yüzeyler birlikte güncellenir.",
    missing: missingGatheringIcons,
    href: "/?module=mining#mining",
    affectedRecords: missingGatheringIcons.length,
  }),
  metric({
    id: "recipe_material_icons",
    label: "Reçete malzeme ikonları",
    eyebrow: `${productionRecipes.length} REÇETELİK ORTAK AĞ`,
    value: recipeMaterialNames.length - missingRecipeMaterialIcons.length,
    total: recipeMaterialNames.length,
    recordScope: `${recipeMaterialNames.length} benzersiz gerçek malzeme`,
    detail: "Eşya, tılsım, iksir ve ara üretim girdileri birlikte denetlenir. Önceki kademe tılsımlar malzeme değil, kendi sınıf/renk tılsım ikonuyla çözülür.",
    missing: missingRecipeMaterialIcons,
    href: "/?module=recipes#recipes",
    affectedRecords: productionRecipes.filter((recipe) =>
      recipe.materials.some((material) => missingRecipeMaterialIcons.includes(material.name)),
    ).length,
  }),
  metric({
    id: "item_recipe_icons",
    label: "Eşya reçetesi çıktı ikonları",
    eyebrow: "ENVANTER SİMGESİ",
    value: recipes.filter((recipe) => itemIconIds.has(recipe.itemId)).length,
    total: recipes.length,
    recordScope: `${recipes.length} ekipman reçetesi`,
    detail: "Bu sayı eşyanın küçük envanter/reçete simgesini ölçer; karakter üzerindeki tam görünüşten ayrı tutulur.",
    missing: missingItemRecipeIcons,
    href: "/?module=recipes&kind=item#recipes",
    affectedRecords: missingItemRecipeIcons.length,
  }),
  metric({
    id: "item_appearances",
    label: "Eşya görünüş aileleri",
    eyebrow: "ORTAK GÖVDE",
    value: itemFamilyInventory.length - missingItemFamilies.length,
    total: itemFamilyInventory.length,
    recordScope: `${publishableItems.length} eşya · ${itemFamilyInventory.length} ortak aile`,
    detail: "Aynı gövdeyi paylaşan efsunlu eşyalar için tek doğrulanmış görünüş yeterlidir; özellik ve efsun metni görselden ayrı kalır.",
    missing: missingItemAppearanceLabels,
    href: "/?module=items#items",
    affectedRecords: missingItemAppearanceRecords,
  }),
  metric({
    id: "talisman_icons",
    label: "Tılsım ikon aileleri",
    eyebrow: "SINIF · RENK",
    value: coveredTalismanFamilies.length,
    total: talismanVisualFamilies.length,
    recordScope: `${talismans.length}/${talismans.length} tılsım kapsanıyor`,
    detail: `Üç sınıfın kırmızı ve mavi gerçek oyun ikonları; katalogda ve ${talismanRecipes.flatMap((recipe) => recipe.materials).length} reçete girdisinde aynı kesin kimlikle kullanılır.`,
    missing: talismanVisualFamilies
      .filter((family) => !coveredTalismanFamilies.some((covered) => covered.id === family.id))
      .map((family) => family.label),
    href: "/?module=engine#engine",
    affectedRecords: 0,
  }),
  metric({
    id: "potion_bottles",
    label: "İksir şişe aileleri",
    eyebrow: "KIRMIZI · MAVİ · TURKUAZ",
    value: coveredPotionFamilies.length,
    total: potionVisualFamilies.length,
    recordScope: `${potionRecipes.length} iksir üç ortak şişeyle kapsanacak`,
    detail: "Can, kudret ve destek iksirleri için üç gerçek oyun şişesi yeterlidir; seviye yalnız ölçeği, etki ise metni değiştirir.",
    missing: potionVisualFamilies
      .filter((family) => !coveredPotionFamilies.some((covered) => covered.id === family.id))
      .map((family) => family.label),
    href: "/?module=recipes&kind=potion#recipes",
    affectedRecords: potionRecipes.length,
  }),
  metric({
    id: "ability_evidence",
    label: "Yetenek kanıt görselleri",
    eyebrow: "TOOLTIP KANITI",
    value: abilityRows.length - missingAbilityEvidence.length,
    total: abilityRows.length,
    recordScope: `${abilityRows.length}/${abilityRows.length} temel yetenek kapsanıyor`,
    detail: "44 temel tooltip ve Kanatma yuvasındaki doğrulanmış Boz Ayı varyantı, üç sınıfın 45 yetenek yuvasını tamamlar.",
    missing: missingAbilityEvidence,
    href: "/?module=skills#skills",
    affectedRecords: 0,
  }),
  metric({
    id: "ability_media",
    label: "Yetenek hareket medyası",
    eyebrow: "WEBM / MP4 PİLOTU",
    value: publishedAbilityMedia.length,
    total: abilityMediaRows.length,
    recordScope: `${abilityMediaRows.length} sınıflar arası pilot kayıt`,
    detail: "Yapay veya eşleşmeyen video kullanılmaz. Kısa gerçek oyun içi klip; sunucu, tarih ve izin bilgisiyle yayımlanır.",
    missing: missingAbilityMedia,
    href: "/?module=skills#skills",
    affectedRecords: missingAbilityMedia.length,
  }),
];

const gatheringMissingKeys = new Set(missingGatheringIcons.map(normalize));
export const projectCrossModuleVisualGaps = missingRecipeMaterialIcons
  .filter((name) => gatheringMissingKeys.has(normalize(name)))
  .sort((a, b) => a.localeCompare(b, "tr"));

const openAssetIds = new Set([
  ...unique([...missingGatheringIcons, ...missingRecipeMaterialIcons]).map((name) => `material:${normalize(name)}`),
  ...recipes.filter((recipe) => !itemIconIds.has(recipe.itemId)).map((recipe) => `item-icon:${recipe.itemId}`),
  ...missingItemFamilies.map(({ family }) => `appearance:${family.id}`),
  ...potionVisualFamilies
    .filter((family) => !coveredPotionFamilies.some((covered) => covered.id === family.id))
    .map((family) => `potion:${family.id}`),
  ...abilityMediaRows
    .filter((media) => media.status === "awaiting_capture" || media.sources.length === 0)
    .map((media) => `ability-media:${media.id}`),
]);
const abilityEvidenceImages = new Set([
  ...abilityDetailsRows.map((detail) => detail.evidenceImage),
  ...abilityVariantRows.map((variant) => variant.evidenceImage),
]);

export const projectVisualTotals = {
  verifiedAssets:
    materialIconRows.length
    + itemIconIds.size
    + coveredItemFamilies.size
    + coveredTalismanFamilies.length
    + abilityEvidenceImages.size,
  openAssetTasks: openAssetIds.size,
  completedAreas: projectVisualCoverage.filter((row) => row.state === "Tamamlandı").length,
  areas: projectVisualCoverage.length,
} as const;

export const projectVisualPriorities = projectVisualCoverage
  .filter((row) => row.state !== "Tamamlandı")
  .sort((a, b) => {
    const aLeverage = a.missing.length ? a.affectedRecords / a.missing.length : 0;
    const bLeverage = b.missing.length ? b.affectedRecords / b.missing.length : 0;
    return bLeverage - aLeverage || b.affectedRecords - a.affectedRecords || a.label.localeCompare(b.label, "tr");
  });

export const projectLiveFacts = {
  productionRecipes: productionRecipes.length,
  exactRecipeSources: talismanRecipeAcquisitionStats.exactRecipeCount,
  recipesWithoutExactSource:
    productionRecipes.length - talismanRecipeAcquisitionStats.exactRecipeCount,
  nonTalismanRecipesWithoutAcquisition:
    productionRecipes.length - talismanRecipes.length,
  visualFamiliesCovered:
    coveredItemFamilies.size + coveredTalismanFamilies.length + coveredPotionFamilies.length,
  visualFamiliesTotal:
    itemFamilyInventory.length + talismanVisualFamilies.length + potionVisualFamilies.length,
  talismanRecipes: talismanRecipes.length,
  exactTalismanRecipeSources: talismanRecipeAcquisitionStats.exactRecipeCount,
  ambiguousTalismanRecipes: talismanRecipeAcquisitionStats.ambiguousRecipeCount,
  talismanRecipesWithoutAcquisition: talismanRecipeAcquisitionStats.withoutAcquisitionCount,
  talismanRecipesWithoutExactSource: talismanRecipeAcquisitionStats.withoutExactSourceCount,
  missingSpecialTalismanRecipeCount: missingSpecialTalismanRecipes.length,
  missingSpecialTalismanRecipes,
  progressionGapCount: progressionGapRows.length,
  p0ProgressionGapCount: progressionGapRows.filter((row) => row.priority === "P0").length,
  conflictedProgressionGaps: progressionGapRows.filter((row) => row.status === "conflicted").map((row) => row.label),
} as const;

export const projectSystemicAuditAreas = [
  { id: "catalog", label: "Katalog", detail: "Ad, kimlik, sınıf, tür ve görünüş ailesi" },
  { id: "recipe", label: "Reçete", detail: "Girdi, adet, çıktı ikonu ve edinim kaynağı" },
  { id: "gathering", label: "Maden", detail: "Kaynak düğümü, çıktı ve gerçek oyun ikonu" },
  { id: "planner", label: "Üretim", detail: "Stok, fotoğraf taslağı ve eksik miktar hesabı" },
  { id: "search", label: "Arama", detail: "Derin bağlantı ve doğru kayıt eşleşmesi" },
  { id: "tests", label: "Yayın kapısı", detail: "Çapraz modül regresyonu ve kırık varlık kontrolü" },
] as const;
