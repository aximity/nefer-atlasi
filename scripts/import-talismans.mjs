import fs from "node:fs";
import path from "node:path";

const [warriorPath, magePath, healerPath] = process.argv.slice(2);
if (!warriorPath || !magePath || !healerPath) {
  console.error("Kullanım: node scripts/import-talismans.mjs <savaşçı.html> <büyücü.html> <şifacı.html>");
  process.exit(1);
}

const classes = [
  ["Savaşçı", warriorPath, "ikv-warrior-talismans", "warrior"],
  ["Büyücü", magePath, "ikv-mage-talismans", "mage"],
  ["Şifacı", healerPath, "ikv-healer-talismans", "healer"],
];
const roman = { I: 1, II: 2, III: 3 };
const decode = (value) => value
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, " ")
  .trim();
const slug = (value) => value.toLocaleLowerCase("tr-TR")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function calculationFor(klass, series, color) {
  const mageAttributes = {
    "Ateş Bilgisi": ["Büyü Hasarı (Ateş)", "Büyü Hasarı (Hepsi)", "Tılsımlı Ateş Büyü Hasarı"],
    "Buz Bilgisi": ["Büyü Hasarı (Buz)", "Büyü Hasarı (Hepsi)", "Tılsımlı Buz Büyü Hasarı"],
    "Elektrik Bilgisi": ["Büyü Hasarı (Elektrik)", "Büyü Hasarı (Hepsi)", "Tılsımlı Elektrik Büyü Hasarı"],
    "Fiziksel Bilgi": ["Büyü Hasarı (Fiziksel)", "Büyü Hasarı (Hepsi)", "Tılsımlı Fiziksel Büyü Hasarı"],
  };
  if (klass === "Büyücü" && color === "Kırmızı" && mageAttributes[series]) {
    const [first, all, outputAttribute] = mageAttributes[series];
    return { effect: "stat_multiplier", targetAttributes: [first, all], outputAttribute };
  }
  if (klass === "Savaşçı" && series === "Ofansif Dövüşme" && color === "Mavi")
    return { effect: "stat_multiplier", targetAttributes: ["Saldırı"], outputAttribute: "Tılsımlı Saldırı" };
  if (klass === "Şifacı" && color === "Kırmızı") {
    if (series === "Gazap 1") return { effect: "damage_multiplier", requiresBase: "Gazap" };
    if (series === "Gazap 2") return { effect: "critical_multiplier", requiresBase: "Gazap" };
    const healerAttributes = {
      "Asit Bilgisi": ["Büyü Hasarı (Asit)", "Büyü Hasarı (Hepsi)", "Tılsımlı Asit Büyü Hasarı"],
      "Şifa Bilgisi": ["İyileştirme Büyüleri", null, "Tılsımlı İyileştirme"],
      "Zehirleme 1": ["Büyü Hasarı (Zehir)", "Büyü Hasarı (Hepsi)", "Tılsımlı Zehir Büyü Hasarı"],
    };
    if (healerAttributes[series]) {
      const [first, all, outputAttribute] = healerAttributes[series];
      return { effect: "stat_multiplier", targetAttributes: [first, all].filter(Boolean), outputAttribute };
    }
  }
  return { effect: "informational" };
}

const rows = [];
for (const [klass, file, sourceId, prefix] of classes) {
  const html = fs.readFileSync(file, "utf8");
  const matches = [...html.matchAll(/<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/gi)];
  for (const match of matches) {
    const name = decode(match[1]), effectText = decode(match[2]), color = decode(match[3]);
    if (!name || !effectText || !["Kırmızı", "Mavi"].includes(color)) continue;
    const tierMatch = name.match(/\s+\((I{1,3})\)$/);
    const tier = tierMatch ? roman[tierMatch[1]] : null;
    const series = tierMatch ? name.slice(0, tierMatch.index) : name;
    const numberMatch = effectText.match(/(?:%\s*)?(\d+(?:[.,]\d+)?)/);
    const value = numberMatch ? Number(numberMatch[1].replace(",", ".")) : null;
    rows.push({
      id: `${prefix}-${slug(series)}-${color === "Kırmızı" ? "red" : "blue"}-${tier ?? "special"}`,
      name, class: klass, color, series, tier,
      ...calculationFor(klass, series, color),
      effectText, value,
      unit: effectText.includes("%") ? "percent" : effectText.includes("saniye") ? "second" : null,
      status: "single_source", sourceId, verificationSourceIds: [`fandom-${prefix}-talismans`],
      lastChecked: "2026-08-23",
    });
  }
}

rows.sort((a, b) => a.class.localeCompare(b.class, "tr") || a.color.localeCompare(b.color, "tr") || a.series.localeCompare(b.series, "tr") || (a.tier ?? 0) - (b.tier ?? 0));
fs.writeFileSync(path.resolve("data/talismans.json"), JSON.stringify(rows, null, 2) + "\n", "utf8");
console.log(`${rows.length} resmî tılsım satırı aktarıldı.`);
