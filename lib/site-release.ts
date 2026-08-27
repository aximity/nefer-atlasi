export const SITE_RELEASE = {
  version: "0.36.0",
  channel: "BETA",
  milestone: "M35",
  releasedAt: "27 Ağustos 2026",
  title: "Tılsım Üretim Atlası",
  summary:
    "Tılsımın kademesi, önceki tılsım gereksinimi, doğrulanmış NPC kaydı ve üretim hedefi aynı akışta birleştirildi.",
  changes: [
    "179 tılsım sınıf, renk ve kademe filtresiyle üretim hedefi olarak seçilebilir hale geldi.",
    "II ve III. kademe için aynı seri ve renkteki önceki tılsım otomatik bağlanıyor.",
    "Büyük Hol'deki Gönül OOK kaydı ve duyuruda isimle geçen iki tılsım resmî kaynakla gösteriliyor.",
    "Kesin malzeme veya NPC verisi bulunmayan reçeteler açıkça doğrulama bekliyor; tahmin stok hesabına katılmıyor.",
    "Favori tılsım hedefleri cihazda saklanıyor ve Saha Operasyonu üretim masasında görünür oluyor.",
  ],
} as const;
