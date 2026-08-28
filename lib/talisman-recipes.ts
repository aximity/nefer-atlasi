import talismanRows from "../data/talismans.json" with { type: "json" };
import type { Talisman } from "./catalog";

const talismans = talismanRows as Talisman[];

export interface TalismanRecipeMaterial {
  kind: "material" | "talisman";
  name: string;
  quantity: number;
  talismanId?: string;
}

export interface TalismanRecipe {
  id: string;
  talismanId: string;
  itemId: string;
  method: "Tılsım üretimi";
  materials: TalismanRecipeMaterial[];
  sourceId: string;
  verificationStatus: "single_source";
  lastChecked: string;
}

const recipeGemByKey: Record<string, "Jadeit" | "Safran" | "Gadolinyum"> = {
  "Büyücü|Buz Oku 1|Mavi": "Jadeit",
  "Büyücü|Buz Oku 2|Mavi": "Gadolinyum",
  "Büyücü|Buz Oku 3|Mavi": "Gadolinyum",
  "Büyücü|Meteorit|Mavi": "Jadeit",
  "Büyücü|Direnç Kırma Alanı|Mavi": "Gadolinyum",
  "Büyücü|Konsantrasyon 1|Mavi": "Gadolinyum",
  "Büyücü|Meditasyon 1|Mavi": "Safran",
  "Büyücü|Meditasyon 2|Mavi": "Gadolinyum",
  "Büyücü|Ateş Bilgisi|Kırmızı": "Safran",
  "Büyücü|Buz Bilgisi|Kırmızı": "Jadeit",
  "Büyücü|Elektrik Bilgisi|Kırmızı": "Jadeit",
  "Büyücü|Fiziksel Bilgi|Kırmızı": "Jadeit",
  "Büyücü|Meteorit 2|Kırmızı": "Safran",
  "Büyücü|Yıldırım 1|Kırmızı": "Gadolinyum",
  "Büyücü|Ateş Çemberi 1|Kırmızı": "Safran",
  "Büyücü|Direnç Kırma Alanı|Kırmızı": "Safran",
  "Büyücü|Büyü Bozma|Kırmızı": "Jadeit",
  "Büyücü|Konsantrasyon|Kırmızı": "Safran",
  "Büyücü|Tesla Küresi|Kırmızı": "Safran",

  "Savaşçı|Ofansif Dövüşme|Mavi": "Gadolinyum",
  "Savaşçı|Kışkırtma 1|Mavi": "Jadeit",
  "Savaşçı|Kışkırtma 2|Mavi": "Safran",
  "Savaşçı|Dikkat Dağıtma|Mavi": "Gadolinyum",
  "Savaşçı|Sakınma|Mavi": "Gadolinyum",
  "Savaşçı|Zihin Toplama|Mavi": "Safran",
  "Savaşçı|Savaş Narası|Mavi": "Gadolinyum",
  "Savaşçı|Ofansif Dövüşme 1|Kırmızı": "Jadeit",
  "Savaşçı|Ofansif Dövüşme 2|Kırmızı": "Safran",
  "Savaşçı|Sert Vuruş 1|Kırmızı": "Jadeit",
  "Savaşçı|Sert Vuruş 2|Kırmızı": "Safran",
  "Savaşçı|Defansif Dövüşme 1|Kırmızı": "Gadolinyum",
  "Savaşçı|Defansif Dövüşme 2|Kırmızı": "Jadeit",
  "Savaşçı|Durdurma 1|Kırmızı": "Jadeit",
  "Savaşçı|Durdurma 2|Kırmızı": "Safran",
  "Savaşçı|Depar|Kırmızı": "Gadolinyum",
  "Savaşçı|Kanatma|Kırmızı": "Jadeit",
  "Savaşçı|Süpürme Saldırısı 1|Kırmızı": "Safran",
  "Savaşçı|Hedef Saptırma|Kırmızı": "Jadeit",

  "Şifacı|Meditasyon 1|Mavi": "Safran",
  "Şifacı|Meditasyon 2|Mavi": "Gadolinyum",
  "Şifacı|Büyü Bozma|Mavi": "Safran",
  "Şifacı|Asit Bilgisi|Mavi": "Safran",
  "Şifacı|Zehirleme|Mavi": "Jadeit",
  "Şifacı|Asit Bilgisi|Kırmızı": "Jadeit",
  "Şifacı|Asit Saldırısı 1|Kırmızı": "Gadolinyum",
  "Şifacı|Asit Saldırısı 2|Kırmızı": "Jadeit",
  "Şifacı|Gazap 1|Kırmızı": "Safran",
  "Şifacı|Gazap 2|Kırmızı": "Gadolinyum",
  "Şifacı|Zehirleme 1|Kırmızı": "Jadeit",
  "Şifacı|Zehirleme 2|Kırmızı": "Safran",
  "Şifacı|Çağrı|Kırmızı": "Jadeit",
  "Şifacı|İyileştirme Çemberi 1|Kırmızı": "Gadolinyum",
  "Şifacı|İyileştirme Çemberi 2|Kırmızı": "Jadeit",
  "Şifacı|Şifa Bilgisi|Kırmızı": "Jadeit",
  "Şifacı|Ruh Kalkanı|Kırmızı": "Gadolinyum",
};

const specialGemByKey: Record<string, "Jadeit" | "Gadolinyum"> = {
  "Büyücü|Kutup Rüzgarı|Mavi": "Jadeit",
  "Büyücü|Meteorit 1|Kırmızı": "Jadeit",
  "Büyücü|Yıldırım 2|Kırmızı": "Jadeit",
  "Büyücü|Ateş Çemberi 2|Kırmızı": "Gadolinyum",
  "Savaşçı|Ağır Vuruş|Kırmızı": "Jadeit",
  "Savaşçı|Süpürme Saldırısı 2|Kırmızı": "Gadolinyum",
  "Savaşçı|Defansif Dövüşme 2|Mavi": "Jadeit",
  "Şifacı|Gazap|Mavi": "Jadeit",
  "Şifacı|İyileştirme|Kırmızı": "Jadeit",
  "Şifacı|Can Kurtaran|Kırmızı": "Jadeit",
};

const sourceByClass = {
  Büyücü: "fandom-mage-talisman-recipes",
  Savaşçı: "fandom-warrior-talisman-recipes",
  Şifacı: "fandom-healer-talisman-recipes",
} as const;

const keyFor = (row: Talisman) => `${row.class}|${row.series}|${row.color}`;

export function talismanMaterialName(row: Pick<Talisman, "name" | "class" | "color">) {
  return `${row.name} · ${row.class} · ${row.color} tılsım`;
}

function previousTierMaterial(row: Talisman) {
  if (row.tier === null || row.tier <= 1) return null;
  const previous = talismans.find((candidate) =>
    candidate.class === row.class
    && candidate.series === row.series
    && candidate.color === row.color
    && candidate.tier === row.tier! - 1,
  );
  return previous ? {
    kind: "talisman" as const,
    name: talismanMaterialName(previous),
    quantity: 3,
    talismanId: previous.id,
  } : null;
}

function recipeFor(row: Talisman): TalismanRecipe | null {
  const key = keyFor(row);
  const common = [
    { kind: "material" as const, name: "Kondrit", quantity: 6 },
    { kind: "material" as const, name: recipeGemByKey[key], quantity: 8 },
    { kind: "material" as const, name: "Peptit Kolorotoksin", quantity: 4 },
    { kind: "material" as const, name: "Örümcek Salgısı", quantity: 4 },
    { kind: "material" as const, name: "Xenotim", quantity: 8 },
  ];
  let materials: TalismanRecipeMaterial[] | null = null;
  if (row.tier === 2 || row.tier === 3) {
    const previous = previousTierMaterial(row);
    if (previous && recipeGemByKey[key]) materials = [previous, ...common];
  } else if (row.tier === null && specialGemByKey[key]) {
    materials = [
      { kind: "material", name: "Kondrit", quantity: 18 },
      { kind: "material", name: specialGemByKey[key], quantity: 24 },
      { kind: "material", name: "Peptit Kolorotoksin", quantity: key === "Savaşçı|Defansif Dövüşme 2|Mavi" ? 4 : 12 },
      { kind: "material", name: "Örümcek Salgısı", quantity: 12 },
      { kind: "material", name: "Xenotim", quantity: 24 },
    ];
  }
  if (!materials) return null;
  return {
    id: `talisman-recipe-${row.id}`,
    talismanId: row.id,
    itemId: row.id,
    method: "Tılsım üretimi",
    materials,
    sourceId: sourceByClass[row.class],
    verificationStatus: "single_source",
    lastChecked: "2026-08-28",
  };
}

export const talismanRecipes = talismans.flatMap((row) => {
  const recipe = recipeFor(row);
  return recipe ? [recipe] : [];
});

export function talismanRecipeFor(talismanId: string) {
  return talismanRecipes.find((recipe) => recipe.talismanId === talismanId);
}
