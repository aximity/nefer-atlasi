import visualFamilyRows from "../data/visual-families.json" with { type: "json" };
import type { CharacterClass, Item, Talisman } from "./catalog";

export type VisualFamilyKind = "item" | "talisman" | "potion";
export type VisualFamilyScope = "set_appearance" | "shared_item_type" | "shared_talisman_type" | "shared_potion_type" | "single_item";
export type VisualFamilyStatus = "verified" | "user_defined" | "awaiting_capture";
export type PotionVisualCategory = "health" | "power" | "support";

export interface VisualFamily {
  id: string;
  kind: VisualFamilyKind;
  scope: VisualFamilyScope;
  label: string;
  class?: CharacterClass;
  appearanceFamily?: string;
  slots?: string[];
  nameSuffixes?: string[];
  color?: "Kırmızı" | "Mavi" | "Turkuaz";
  category?: PotionVisualCategory;
  assetRef?: string;
  status: VisualFamilyStatus;
  sizeRule?: string;
  note: string;
}

export const visualFamilies = visualFamilyRows as VisualFamily[];
export const itemVisualFamilies = visualFamilies.filter((row) => row.kind === "item");
export const talismanVisualFamilies = visualFamilies.filter((row) => row.kind === "talisman");
export const potionVisualFamilies = visualFamilies.filter((row) => row.kind === "potion");

const fallbackFamily = (item: Item): VisualFamily => ({
  id: `item:single:${item.id}`,
  kind: "item",
  scope: "single_item",
  label: item.name,
  status: "awaiting_capture",
  note: "Ortak gövde eşlemesi henüz doğrulanmadı; bu kayıt başka bir görselle otomatik eşleştirilmez.",
});

export function itemVisualFamilyFor(item: Item): VisualFamily {
  const setFamily = itemVisualFamilies.find((row) => row.scope === "set_appearance" && row.class === item.class && row.appearanceFamily === item.appearanceFamily);
  if (setFamily) return setFamily;
  const typedFamily = itemVisualFamilies.find((row) => row.scope === "shared_item_type" && (
    row.nameSuffixes?.some((suffix) => item.name.endsWith(suffix)) || row.slots?.includes(item.slot)
  ));
  return typedFamily ?? fallbackFamily(item);
}

export function talismanVisualFamilyFor(talisman: Pick<Talisman, "class" | "color">): VisualFamily {
  const family = talismanVisualFamilies.find((row) => row.class === talisman.class && row.color === talisman.color);
  if (!family) throw new Error(`Tılsım görünüş ailesi bulunamadı: ${talisman.class} · ${talisman.color}`);
  return family;
}

export function potionVisualFamilyFor(category: PotionVisualCategory): VisualFamily {
  const family = potionVisualFamilies.find((row) => row.category === category);
  if (!family) throw new Error(`İksir görünüş ailesi bulunamadı: ${category}`);
  return family;
}

export function itemVisualFamilyInventory(rows: Item[]) {
  const inventory = new Map<string, { family: VisualFamily; items: Item[] }>();
  for (const item of rows) {
    const family = itemVisualFamilyFor(item);
    const current = inventory.get(family.id);
    if (current) current.items.push(item);
    else inventory.set(family.id, { family, items: [item] });
  }
  return [...inventory.values()];
}

export function coveredItemVisualFamilyIds({
  items,
  images,
  appearanceImages,
}: {
  items: Item[];
  images: { id: string; itemId: string; nameAndAppearanceTogether?: boolean }[];
  appearanceImages: { id: string; appearanceFamily: string; class: CharacterClass }[];
}) {
  const itemById = new Map(items.map((item) => [item.id, item]));
  const availableAssetIds = new Set([...images.filter((image) => image.nameAndAppearanceTogether === true).map((image) => image.id), ...appearanceImages.map((image) => image.id)]);
  const covered = new Set(itemVisualFamilies.filter((family) => family.assetRef && availableAssetIds.has(family.assetRef)).map((family) => family.id));
  for (const image of images) {
    if (image.nameAndAppearanceTogether !== true) continue;
    const item = itemById.get(image.itemId);
    if (item) covered.add(itemVisualFamilyFor(item).id);
  }
  for (const image of appearanceImages) {
    const family = itemVisualFamilies.find((row) => row.scope === "set_appearance" && row.class === image.class && row.appearanceFamily === image.appearanceFamily);
    if (family) covered.add(family.id);
  }
  return covered;
}

export const isSharedItemVisualFamily = (family: VisualFamily) => family.scope === "shared_item_type";
