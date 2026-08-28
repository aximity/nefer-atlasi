export const SITE_RELEASE = {
  version: "0.55.0",
  channel: "BETA",
  milestone: "M55",
  releasedAt: "28 Ağustos 2026",
  title: "Görev Ödülü Kaynakları",
  summary:
    "Beş açık malzeme, görev adı, seviye ve adet bilgisiyle üretim zincirindeki doğrulanmış görev ödüllerine bağlandı.",
  changes: [
    "Liderlik Sembolü, Dev Komodo Dişi, İpek, Hidra Pençesi ve Kadim Hidra Pençesi doğrudan görev ödülü olarak sınıflandırıldı.",
    "Her kayıtta görev adı, görev seviyesi, verilen adet ve üç sınıf kapsamı gösteriliyor.",
    "Üretim planlayıcısı bu malzemeleri artık yanlış bir bölge tahmini yerine ilgili göreve yönlendiriyor.",
    "Malzeme kaynağı açığı 18'den 13'e, Atlas Tamamlama Merkezi'ndeki toplam açık iş 72'den 67'ye indi.",
  ],
} as const;
