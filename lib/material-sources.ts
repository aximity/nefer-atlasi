import { gatheringSourceFor } from "./gathering-catalog.ts";

export type CreatureDropSource = {
  kind: "creature_drop";
  name: string;
  aliases?: readonly string[];
  region: string;
  enemy: string;
  usage: string;
  verification: "Kaynaklı kayıt" | "Oyuncu bilgisi";
  source?: string;
};

export const creatureDropSources: readonly CreatureDropSource[] = [
  {
    kind: "creature_drop",
    name: "Xenotim",
    region: "Büyük Hol",
    enemy: "Saklı Tür",
    usage: "Tılsım reçetelerinde kullanılır",
    verification: "Kaynaklı kayıt",
    source: "https://istanbulkiyametvakti.fandom.com/tr/wiki/Materyaller",
  },
  {
    kind: "creature_drop",
    name: "Örümcek Salgısı",
    aliases: ["Salgı"],
    region: "Büyük Hol",
    enemy: "Örümcekler",
    usage: "Tılsım reçetelerinde kullanılır",
    verification: "Kaynaklı kayıt",
    source: "https://istanbulkiyametvakti.fandom.com/tr/wiki/Materyaller",
  },
  {
    kind: "creature_drop",
    name: "Peptit Kolorotoksin",
    aliases: ["Peptit Klorotoksin", "Peptit"],
    region: "Büyük Hol",
    enemy: "Akrepler",
    usage: "Tılsım reçetelerinde kullanılır",
    verification: "Kaynaklı kayıt",
    source: "https://istanbulkiyametvakti.fandom.com/tr/wiki/Peptit_Kolorotoksin",
  },
  {
    kind: "creature_drop",
    name: "Erg Tozu",
    region: "Zihin Tapınağı",
    enemy: "Bölge yaratıkları",
    usage: "Kullanım bağlantısı katkı bekliyor",
    verification: "Oyuncu bilgisi",
  },
  {
    kind: "creature_drop",
    name: "Erg Kalıntısı",
    region: "Zihin Tapınağı",
    enemy: "Bölge yaratıkları",
    usage: "Kullanım bağlantısı katkı bekliyor",
    verification: "Oyuncu bilgisi",
  },
] as const;

const normalize = (value: string) => value.trim().toLocaleLowerCase("tr-TR");

export function creatureDropSourceFor(materialName: string) {
  const wanted = normalize(materialName);
  return creatureDropSources.find((entry) =>
    [entry.name, ...(entry.aliases ?? [])].some((name) => normalize(name) === wanted),
  ) ?? null;
}

export function materialSourceFor(materialName: string) {
  const gathering = gatheringSourceFor(materialName);
  if (gathering) return { kind: "gathering" as const, ...gathering };
  return creatureDropSourceFor(materialName);
}
