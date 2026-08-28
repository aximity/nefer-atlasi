export const SITE_RELEASE = {
  version: "0.40.0",
  channel: "BETA",
  milestone: "M40",
  releasedAt: "28 Ağustos 2026",
  title: "Sade Bilgi Mimarisi",
  summary:
    "Ana ekran arama ve dört hızlı işe indirildi; tılsım bilgisi, reçete kataloğu ve üretim takibi birbirinden ayrılarak yalnız ihtiyaç olduğunda açılır hâle getirildi.",
  changes: [
    "Büyük açılış alanı ve düz modül kalabalığı kaldırıldı; arama, dört hızlı bölüm ve gruplu menü bırakıldı.",
    "Reçeteler; Eşya, Tılsım ve doğrulama durumu açıkça belirtilen İksir dizini olarak ayrı kataloğa taşındı.",
    "Boş yetenek medya yuvaları ile kaynaksız fiyat vitrini gizlendi; üretim takibi herkese açık, cihazda kalan ayrı akış oldu.",
  ],
} as const;
