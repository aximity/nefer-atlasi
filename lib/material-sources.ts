import { gatheringSourceFor } from "./gathering-catalog.ts";

export type ProducerProfession = "Kimyacı" | "Sarraf" | "Silahtar" | "Zırhçı";

export type MaterialReference = {
  name: string;
  label: string;
  note: string;
  source: string;
};

const CEMBERLITAS_RELEASE_NOTES = "https://oyun-ikv.tr.gg/S.ue.r.ue.m-Notlar%26%23305%3B-%5B-Oe-nemli%5D.htm";
const LEGACY_MATERIAL_CATALOG = "https://ikvblog.wordpress.com/2010/09/20/ikvnin-tum-madenleri-ve-saflari/";
const KARAKOY_GUIDE = "https://www.scribd.com/document/790954361/Karakoy-Hakknda";
const IKV_MARKET = "https://ikvpazar.com/";

export const materialReferences: readonly MaterialReference[] = [
  ...["Hidrojen", "Erg Yongası", "Ateş Boyası", "Köşk Madalyonu", "Galata Sembolü"].map((name) => ({
    name,
    label: "Resmî yeni materyal kaydı",
    note: "Çemberlitaş sürüm notunda yeni materyal olarak listeleniyor; aynı kayıt edinim yöntemini açıklamıyor.",
    source: CEMBERLITAS_RELEASE_NOTES,
  })),
  ...["Meran Mücevheri", "Örümcek Gözü"].map((name) => ({
    name,
    label: "Eski katalog sınıflandırması",
    note: "Eski katalog bunu görev sonucu verilen, görevde kullanılan veya üretilebilen materyaller grubunda gösteriyor; hangi yöntemin geçerli olduğunu ayırmıyor.",
    source: LEGACY_MATERIAL_CATALOG,
  })),
  ...["Geyik Derisi", "Kenevir Lifi", "Latex"].map((name) => ({
    name,
    label: "Eski katalog sınıflandırması",
    note: "Eski katalog bunu deriler grubunda gösteriyor; düşman, görev, bölge veya üretim yöntemi belirtmiyor.",
    source: LEGACY_MATERIAL_CATALOG,
  })),
] as const;

export type CraftedMaterialSource = {
  kind: "crafted";
  name: string;
  profession: ProducerProfession;
  level: number;
  materials: readonly { name: string; quantity: number }[];
  verification: "Kaynaklı kayıt";
  source: string;
};

const MATERIALS_WIKI = "https://istanbulkiyametvakti.fandom.com/tr/wiki/Materyaller";

export const craftedMaterialSources: readonly CraftedMaterialSource[] = [
  { kind: "crafted", name: "Ok Sertleştirici", profession: "Sarraf", level: 9, materials: [{ name: "Obsidyen", quantity: 8 }], verification: "Kaynaklı kayıt", source: MATERIALS_WIKI },
  { kind: "crafted", name: "Bahçe Karışımı", profession: "Kimyacı", level: 11, materials: [{ name: "Ceviz Yaprağı", quantity: 6 }, { name: "Isırgan Otu", quantity: 4 }], verification: "Kaynaklı kayıt", source: MATERIALS_WIKI },
  { kind: "crafted", name: "Sema Karışımı", profession: "Kimyacı", level: 15, materials: [{ name: "Ökse Otu", quantity: 6 }, { name: "Adaçayı Yaprağı", quantity: 4 }], verification: "Kaynaklı kayıt", source: MATERIALS_WIKI },
  { kind: "crafted", name: "Ametist-Lapis", profession: "Sarraf", level: 17, materials: [{ name: "Ametist", quantity: 2 }, { name: "Açık Mavi Lapis", quantity: 6 }], verification: "Kaynaklı kayıt", source: MATERIALS_WIKI },
  { kind: "crafted", name: "Elmas Asa Kristali", profession: "Sarraf", level: 25, materials: [{ name: "Elmas", quantity: 5 }, { name: "Kuvars", quantity: 6 }], verification: "Kaynaklı kayıt", source: MATERIALS_WIKI },
  { kind: "crafted", name: "Sinek Karışımı", profession: "Kimyacı", level: 32, materials: [{ name: "Mantar", quantity: 3 }, { name: "Civan Perçemi", quantity: 4 }], verification: "Kaynaklı kayıt", source: MATERIALS_WIKI },
  { kind: "crafted", name: "KSH", profession: "Kimyacı", level: 36, materials: [{ name: "Isırgan Otu", quantity: 10 }, { name: "Koni Yaprağı", quantity: 10 }], verification: "Kaynaklı kayıt", source: MATERIALS_WIKI },
  { kind: "crafted", name: "Gök Birleşik", profession: "Silahtar", level: 36, materials: [{ name: "Altın", quantity: 10 }, { name: "Obsidyen", quantity: 10 }], verification: "Kaynaklı kayıt", source: MATERIALS_WIKI },
  { kind: "crafted", name: "Göz Taşı", profession: "Zırhçı", level: 36, materials: [{ name: "Kan Taşı", quantity: 10 }, { name: "Kalsedon", quantity: 10 }], verification: "Kaynaklı kayıt", source: MATERIALS_WIKI },
] as const;

export const craftedMaterialRecipes = craftedMaterialSources.map((entry) => ({
  id: `recipe-material-${entry.name.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü]+/g, "-")}`,
  itemId: `material-${entry.name.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü]+/g, "-")}`,
  method: `${entry.profession} üretimi · Seviye ${entry.level}`,
  materials: entry.materials.map((material) => ({ ...material })),
  sourceId: "fandom-materials-20260828",
  verificationStatus: "single_source" as const,
  lastChecked: "2026-08-28",
}));

export type CreatureDropSource = {
  kind: "creature_drop";
  name: string;
  aliases?: readonly string[];
  region: string | null;
  enemy: string;
  usage: string;
  verification: "Kaynaklı kayıt" | "Oyuncu bilgisi";
  source?: string;
};

export type QuestRewardMaterialSource = {
  kind: "quest_reward";
  name: string;
  quest: string;
  level: number;
  quantity: number | null;
  classScope: string;
  verification: "Kaynaklı kayıt";
  source: string;
};

const MAXIGAMERZ_QUEST_REWARDS = "https://www.maxigamerz.com/konu/istanbul-kiyamet-vakti-ikv-gorev-ganimetleri-listesi.240301/";

export const questRewardMaterialSources: readonly QuestRewardMaterialSource[] = [
  { kind: "quest_reward", name: "Liderlik Sembolü", quest: "Solucan’ı Ezmek", level: 42, quantity: 1, classScope: "Savaşçı, Büyücü ve Şifacı", verification: "Kaynaklı kayıt", source: MAXIGAMERZ_QUEST_REWARDS },
  { kind: "quest_reward", name: "Dev Komodo Dişi", quest: "Midedeki Pusula", level: 46, quantity: 1, classScope: "Savaşçı, Büyücü ve Şifacı", verification: "Kaynaklı kayıt", source: MAXIGAMERZ_QUEST_REWARDS },
  { kind: "quest_reward", name: "İpek", quest: "Hidranın Sırrı", level: 47, quantity: 3, classScope: "Savaşçı, Büyücü ve Şifacı", verification: "Kaynaklı kayıt", source: MAXIGAMERZ_QUEST_REWARDS },
  { kind: "quest_reward", name: "Hidra Pençesi", quest: "Yeşil Hidra Tehlike", level: 47, quantity: 1, classScope: "Savaşçı ve Şifacı", verification: "Kaynaklı kayıt", source: MAXIGAMERZ_QUEST_REWARDS },
  { kind: "quest_reward", name: "Kadim Hidra Pençesi", quest: "Kadim Tehlike", level: 47, quantity: 1, classScope: "Savaşçı ve Şifacı", verification: "Kaynaklı kayıt", source: MAXIGAMERZ_QUEST_REWARDS },
] as const;

export const creatureDropSources: readonly CreatureDropSource[] = [
  ...["Antimon", "Ateş Boyası", "Erg Yongası", "Galata Sembolü", "Hidrojen", "Köşk Madalyonu", "Meran Mücevheri", "Örümcek Gözü"].map((name) => ({
    kind: "creature_drop" as const,
    name,
    region: null,
    enemy: "Bosslar (platform ayrıştırmıyor)",
    usage: "Çemberlitaş şaheser reçetelerinde kullanılır; kesin boss ve bölge ikinci kaynak bekliyor",
    verification: "Oyuncu bilgisi" as const,
    source: IKV_MARKET,
  })),
  {
    kind: "creature_drop",
    name: "Hydrargyrum",
    region: "Migrat",
    enemy: "Junon",
    usage: "Çemberlitaş şaheser reçetelerinde kullanılır",
    verification: "Kaynaklı kayıt",
    source: KARAKOY_GUIDE,
  },
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
  {
    kind: "creature_drop",
    name: "Likit Kristal",
    region: null,
    enemy: "Gecenin Takipçisi, Buz Büyücüsü veya Bekçi Kobra",
    usage: "Çemberlitaş şaheser reçetelerinde kullanılır; kaynak bölgeyi belirtmiyor",
    verification: "Kaynaklı kayıt",
    source: "https://oyun-ikv.tr.gg/S.ue.r.ue.m-Notlar%26%23305%3B-%5B-Oe-nemli%5D.htm",
  },
  {
    kind: "creature_drop",
    name: "Klorotoksin",
    region: null,
    enemy: "Gümüş Akrep",
    usage: "Çemberlitaş şaheser reçetelerinde kullanılır; kaynak bölgeyi belirtmiyor",
    verification: "Kaynaklı kayıt",
    source: "https://oyun-ikv.tr.gg/S.ue.r.ue.m-Notlar%26%23305%3B-%5B-Oe-nemli%5D.htm",
  },
  {
    kind: "creature_drop",
    name: "Sürüngen Pulu",
    region: null,
    enemy: "Fare Adam Terbiyeci veya Şah Kobra",
    usage: "Çemberlitaş şaheser reçetelerinde kullanılır; kaynak bölgeyi belirtmiyor",
    verification: "Kaynaklı kayıt",
    source: "https://oyun-ikv.tr.gg/S.ue.r.ue.m-Notlar%26%23305%3B-%5B-Oe-nemli%5D.htm",
  },
  {
    kind: "creature_drop",
    name: "Motorin",
    region: "Sığınaklar",
    enemy: "Sığınaklar bossları",
    usage: "Sığınaklar rehberinde ortak materyal olarak listelenir",
    verification: "Kaynaklı kayıt",
    source: "https://forum.shiftdelete.net/konular/istanbul-kiyamet-vakti-siginaklar.537131/",
  },
  {
    kind: "creature_drop",
    name: "Niobyum",
    region: "Sığınaklar",
    enemy: "Sığınaklar bossları",
    usage: "Sığınaklar rehberinde ortak materyal olarak listelenir",
    verification: "Kaynaklı kayıt",
    source: "https://forum.shiftdelete.net/konular/istanbul-kiyamet-vakti-siginaklar.537131/",
  },
  {
    kind: "creature_drop",
    name: "Taşkanat Derisi",
    region: "Eminönü",
    enemy: "Taş Kanat",
    usage: "2007 Taş Kanat avı duyurusunda öldürme kanıtı olarak toplanır; güncel reçetelerde kullanılır",
    verification: "Kaynaklı kayıt",
    source: "https://i-k-v-dunyasi.tr.gg/Havadisler%26Haberler.htm",
  },
] as const;

const normalize = (value: string) => value.trim().toLocaleLowerCase("tr-TR");

export function creatureDropSourceFor(materialName: string) {
  const wanted = normalize(materialName);
  return creatureDropSources.find((entry) =>
    [entry.name, ...(entry.aliases ?? [])].some((name) => normalize(name) === wanted),
  ) ?? null;
}

export function craftedMaterialSourceFor(materialName: string) {
  const wanted = normalize(materialName);
  return craftedMaterialSources.find((entry) => normalize(entry.name) === wanted) ?? null;
}

export function questRewardMaterialSourceFor(materialName: string) {
  const wanted = normalize(materialName);
  return questRewardMaterialSources.find((entry) => normalize(entry.name) === wanted) ?? null;
}

export function materialSourceFor(materialName: string) {
  const gathering = gatheringSourceFor(materialName);
  if (gathering) return { kind: "gathering" as const, ...gathering };
  const creatureDrop = creatureDropSourceFor(materialName);
  if (creatureDrop) return creatureDrop;
  const questReward = questRewardMaterialSourceFor(materialName);
  if (questReward) return questReward;
  return craftedMaterialSourceFor(materialName);
}

export function materialReferenceFor(materialName: string) {
  const wanted = normalize(materialName);
  return materialReferences.find((entry) => normalize(entry.name) === wanted) ?? null;
}
