export const SITE_RELEASE = {
  version: "0.66.0",
  channel: "BETA",
  milestone: "M66",
  releasedOn: "2026-08-29",
  releasedAt: "29 Ağustos 2026",
  title: "Fotoğraftan Otomatik Çanta Okuma",
  summary:
    "Çanta fotoğrafı artık cihazda analiz edilerek malzeme ikonlarını ve okunabilen adetleri onaylanabilir stok taslağına dönüştürüyor.",
  changes: [
    "Fotoğraf yüklenir yüklenmez çanta ızgarası ve doğrulanmış malzeme ikonları cihaz içinde otomatik karşılaştırılıyor.",
    "Tanınan malzeme ve adetler güven oranı, adet uyarısı ve düzenlenebilir onay listesiyle gösteriliyor.",
    "Manuel ikon kataloğu ana adım olmaktan çıkarıldı; yalnız eksik veya yanlış sonucu düzeltmek için açılıyor.",
    "Onaylanan stoktan en yakın üç ila beş eşya, tılsım veya iksir üretim adayı hesaplanıyor.",
  ],
} as const;
