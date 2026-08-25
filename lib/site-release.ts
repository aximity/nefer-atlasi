export const SITE_RELEASE = {
  version: "0.19.1",
  channel: "BETA",
  milestone: "M19",
  releasedAt: "25 Ağustos 2026",
  title: "GM Öncesi Bakım",
  summary:
    "Teknik etiketler temizlendi; üç toplayıcılık mesleği saha araçlarında eşitlendi ve çelişen yetenek puanı kaynakları açıkça gösterildi.",
  changes: [
    "İngilizce geliştirici birimleri bütün özellik kayıtlarından ve kullanıcıya açık gösterim yollarından kaldırıldı.",
    "Lokman, Madenci ve Sarraf ile birlikte saha oturumu ve rota formlarında kullanılabilir hâle getirildi.",
    "49. seviye puan hesabı güncel resmî web kuralına bağlandı; eski PDF rehberindeki çelişki görünür kılındı.",
    "Çelişki, elde etme, özellik, malzeme kaynağı, görsel ve ikinci teyit eksikleri ayrı kuyruklarda gösteriliyor.",
    "Her açık iş doğrudan ilgili Atlas kaydına ve kanıt gönderme akışına bağlandı.",
    "Mobilde ekranı uzatmamak için sonuçlar filtrelenebilir ve ilk 18 kayıtla sınırlı tutuldu.",
  ],
} as const;
