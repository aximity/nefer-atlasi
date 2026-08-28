export const SITE_RELEASE = {
  version: "0.47.0",
  channel: "BETA",
  milestone: "M47",
  releasedAt: "28 Ağustos 2026",
  title: "Site İçi Reçete ve Kaynak Akışı",
  summary:
    "Reçeteler site içinde açılıyor, İKV Wiki bağlantıları kategori bazlı kaynak dizininde tutuluyor; galeri ve anlık kamera girişi ayrıldı.",
  changes: [
    "Üretim kartlarındaki Reçeteyi aç eylemi dış Wiki yerine Nefer Atlası'ndaki ilgili eşya, tılsım veya iksir reçetesine gidiyor.",
    "Tılsımı aç ve Bu tılsımın reçetesini aç geçişleri tam sayfa iç bağlantıyla güvenilir hâle getirildi.",
    "İKV Wiki ve oyun içi kanıtlar; eşya, tılsım, iksir, materyal, görev ve yetenek kategorileriyle Kaynaklar sayfasında toplandı.",
    "Fotoğraf girişi Galeriden seç ve Şimdi fotoğraf çek olarak ayrıldı; ikon arama ve adet alanlarını örten eski dosya alanı düzeltildi.",
    "Sabit reçeteler için haftalık tılsım reçetesi takibi kapatıldı.",
  ],
} as const;
