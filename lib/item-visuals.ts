import {
  appearanceImages,
  images,
  type Item,
} from "./catalog.ts";
import { itemVisualFamilyFor, type VisualFamily } from "./visual-families.ts";

export type ResolvedItemVisual = {
  assetId: string;
  url: string;
  sourceId: string;
  kind: "item_icon" | "item_appearance" | "set_appearance" | "shared_item_type";
  exactItem: boolean;
  family: VisualFamily;
  label: string;
  alt: string;
  width: number;
  height: number;
  unoptimized: boolean;
  focus?: string;
};

export function itemVisualAssetFor(item: Item): ResolvedItemVisual | null {
  const family = itemVisualFamilyFor(item);
  const direct = images.find((image) => image.itemId === item.id);
  if (direct) {
    const itemIcon = direct.assetScope === "item_icon";
    return {
      assetId: direct.id,
      url: direct.url,
      sourceId: direct.sourceId,
      kind: direct.assetScope,
      exactItem: true,
      family,
      label: itemIcon ? "OYUN İÇİ EŞYA İKONU · 30 × 30" : "TEKİL EŞYA GÖRSELİ · TEK KAYNAK",
      alt: `${item.name} oyun içi ${itemIcon ? "eşya ikonu" : "eşya görüntüsü"}`,
      width: itemIcon ? 30 : 1200,
      height: itemIcon ? 30 : 1600,
      unoptimized: itemIcon,
    };
  }

  if (!family.assetRef) return null;
  const sharedItem = images.find((image) => image.id === family.assetRef);
  if (sharedItem) {
    return {
      assetId: sharedItem.id,
      url: sharedItem.url,
      sourceId: sharedItem.sourceId,
      kind: "shared_item_type",
      exactItem: false,
      family,
      label: `ORTAK ${family.label.toLocaleUpperCase("tr-TR")} GÖVDESİ · EFSUN AYRI`,
      alt: `${family.label} ortak oyun içi görünüşü; ${item.name} özellikleri ayrı kayıttır`,
      width: 1200,
      height: 1600,
      unoptimized: false,
    };
  }

  const setAppearance = appearanceImages.find((image) => image.id === family.assetRef);
  if (setAppearance) {
    return {
      assetId: setAppearance.id,
      url: setAppearance.url,
      sourceId: setAppearance.sourceId,
      kind: "set_appearance",
      exactItem: false,
      family,
      label: "SET GÖRÜNÜŞ REFERANSI · TEKİL PARÇA DEĞİL",
      alt: `${setAppearance.label} set görünüşü`,
      width: 709,
      height: 1536,
      unoptimized: true,
      focus: setAppearance.focus,
    };
  }

  return null;
}
