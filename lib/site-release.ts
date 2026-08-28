export const SITE_RELEASE = {
  version: "0.44.0",
  channel: "BETA",
  milestone: "M44",
  releasedAt: "28 Ağustos 2026",
  title: "Eksiksiz İksir Atlası",
  summary:
    "İKV Wiki'den derlenen 28 kategorideki 246 iksir reçetesi tüm malzeme satırlarıyla kataloğa, aramaya ve üretim takibine bağlandı.",
  changes: [
    "Önceki 79 kayıtlık kısmi aktarım 246 reçetelik tam kategori kapsamına çıkarıldı.",
    "Atlanan üçüncü ve sonraki malzeme satırları reçete ve stok hesabına eklendi.",
    "Doğrudan hasar, büyü hasarı ve direnç iksirlerinin düşük seviye serileri tamamlandı.",
    "İksir favorileri üretim ekranında ayrı hedef listesi olarak görünür hâle getirildi.",
  ],
} as const;
