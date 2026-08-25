const directLabels = {
  raw_game_value: "puan",
  single_source: "Tek kaynak",
  cross_verified: "Çapraz doğrulandı",
  item_evidence: "Eşya kanıtı",
  mining_run: "Maden turu",
  market_price: "Pazar fiyatı",
  ability_media: "Yetenek medyası",
  static_catalog: "Ana katalog",
};

const wordLabels = {
  verification: "doğrulama",
  publication: "yayın",
  status: "durumu",
  source: "kaynak",
  count: "sayısı",
  item: "eşya",
  game: "oyun",
  value: "değeri",
  raw: "ham",
};

export function displayUnit(unit) {
  if (!unit || unit === "puan" || unit === "raw_game_value") return "";
  if (unit === "percent") return "%";
  if (unit === "second") return "saniye";
  return humanizeIdentifier(unit);
}

export function humanizeIdentifier(value) {
  const input = String(value || "").trim();
  if (!input) return "Belirtilmedi";
  if (directLabels[input]) return directLabels[input];
  const words = input
    .replace(/([a-zçğıöşü])([A-ZÇĞİÖŞÜ])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => wordLabels[word.toLocaleLowerCase("tr-TR")] || word)
    .join(" ");
  return words.charAt(0).toLocaleUpperCase("tr-TR") + words.slice(1);
}

export function formatDisplayValue(value) {
  if (typeof value === "boolean") return value ? "Evet" : "Hayır";
  if (value === null || value === undefined || value === "") return "Belirtilmedi";
  if (Array.isArray(value)) return value.map(formatDisplayValue).join(", ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, entry]) => `${humanizeIdentifier(key)}: ${formatDisplayValue(entry)}`)
      .join(" · ");
  }
  return humanizeIdentifier(String(value));
}
