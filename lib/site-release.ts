export const SITE_RELEASE = {
  version: "0.19.0",
  channel: "BETA",
  milestone: "M19",
  releasedAt: "25 Ağustos 2026",
  title: "Atlas Tamamlama Merkezi",
  summary:
    "Kullanıcıya sızan teknik birimler temizlendi; eksik, çelişkili ve teyit bekleyen Atlas bağlantıları kanıt toplama kuyruğuna dönüştürüldü.",
  changes: [
    "İngilizce geliştirici birimleri bütün özellik kayıtlarından ve kullanıcıya açık gösterim yollarından kaldırıldı.",
    "Çelişki, elde etme, özellik, malzeme kaynağı, görsel ve ikinci teyit eksikleri ayrı kuyruklarda gösteriliyor.",
    "Her açık iş doğrudan ilgili Atlas kaydına ve kanıt gönderme akışına bağlandı.",
    "Mobilde ekranı uzatmamak için sonuçlar filtrelenebilir ve ilk 18 kayıtla sınırlı tutuldu.",
  ],
} as const;
