export const SITE_RELEASE = {
  version: "0.16.0",
  channel: "BETA",
  milestone: "M16",
  releasedAt: "25 Ağustos 2026",
  title: "Grup ihtiyacı analizi",
  summary:
    "Topluluk ilanlarını rol, bölge, etkinlik türü ve saat yoğunluğuna dönüştüren gizlilik korumalı analiz açıldı.",
  changes: [
    "Son 7 ve 30 günlük ilan hacmi örneklem seviyesiyle birlikte gösteriliyor.",
    "Aranan roller, yoğun bölgeler, etkinlik türleri ve UTC+3 başlangıç saatleri analiz ediliyor.",
    "Üç kayıttan az başlıklar oyuncu hareketini ele vermemek için tek tek gösterilmiyor.",
    "İptal edilen ilanlar analize girmiyor; lider adı ve iletişim verisi istatistiğe taşınmıyor.",
  ],
} as const;
