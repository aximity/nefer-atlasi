export const SITE_RELEASE = {
  version: "0.14.0",
  channel: "BETA",
  milestone: "M14",
  releasedAt: "25 Ağustos 2026",
  title: "Adil oyuncu pazarı",
  summary:
    "İlanı gerçekleşen satıştan ayıran, az veriyi kesin fiyat gibi göstermeyen çapraz doğrulanmış pazar nabzı açıldı.",
  changes: [
    "Gerçekleşen satış, ilan ve para birimi ayrı filtrelenebilir oldu.",
    "7/30 günlük birim fiyat medyanı, gözlem adedi ve güven seviyesi eklendi.",
    "Yalnız moderasyondan geçmiş çapraz doğrulanmış kayıtlar pazar özetine giriyor.",
    "Veri yoksa tahmini fiyat yerine açık boş durum ve öncelikli takip listesi gösteriliyor.",
  ],
} as const;
