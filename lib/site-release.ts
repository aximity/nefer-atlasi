export const SITE_RELEASE = {
  version: "0.64.0",
  channel: "BETA",
  milestone: "M64",
  releasedOn: "2026-08-29",
  releasedAt: "29 Ağustos 2026",
  title: "Fotoğraftan Üretim Adayları",
  summary:
    "Çanta fotoğrafındaki doğrulanmış malzeme taslağı artık mevcut stokla birleşerek en yakın üç ila beş üretim adayını sıralıyor.",
  changes: [
    "Fotoğraf akışı dört açık adıma ayrıldı: görseli ekle, ikon ve adedi seç, üretim adaylarını gör, stoku onayla.",
    "Taslak stok otomatik değiştirmeden mevcut stokla birlikte hesaplanıyor; yüzde 50 ve üzerindeki adaylar önce gösteriliyor.",
    "En fazla beş adayda tamamlanma yüzdesi, eksik malzeme türleri ve kısa eksik listesi gösteriliyor.",
    "Her aday doğrudan Nefer Atlası içindeki ilgili eşya, tılsım veya iksir reçetesine bağlanıyor.",
  ],
} as const;
