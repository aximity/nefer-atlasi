export const SITE_RELEASE = {
  version: "0.39.0",
  channel: "BETA",
  milestone: "M39",
  releasedAt: "28 Ağustos 2026",
  title: "Tılsım Üretim Asistanı",
  summary:
    "Büyücü, Savaşçı ve Şifacı tılsım reçeteleri üretim planlayıcısına bağlandı; favoriler, stok durumu ve en yakın üretim tek ekranda buluştu.",
  changes: [
    "Üç sınıfın kaynakta listelenen II, III ve özel tılsım reçeteleri malzeme adetleriyle atlas kartlarına eklendi.",
    "Tılsım favorileri ortak stok hesabına katıldı; üretilebilir ve en yakın hedefler eksik malzemeye göre sıralanıyor.",
    "Çanta fotoğrafını cihazda referans tutup görülen malzemeleri taslakta toplama ve manuel onayla stoka işleme akışı eklendi.",
  ],
} as const;
