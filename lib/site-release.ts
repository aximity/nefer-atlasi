export const SITE_RELEASE = {
  version: "0.41.2",
  channel: "BETA",
  milestone: "M41",
  releasedAt: "28 Ağustos 2026",
  title: "İksir Kaynak Kuralı",
  summary:
    "İksir reçetelerinde İKV Wiki ana oyun referansı olarak tanımlandı; ikinci kaynak teyidi zorunluluğu kaldırıldı.",
  changes: [
    "İksir sekmesi ‘İksir dizini’ yerine doğrudan ‘İksir’ olarak adlandırıldı.",
    "Kaynak kartında İKV Wiki'nin ana kaynak olduğu ve çapraz doğrulama aranmadığı açıkça gösterildi.",
    "Mevcut 40 iksir adı ile 11 malzeme bağlantısı korundu; aktarılmamış adetler tam reçete gibi gösterilmedi.",
  ],
} as const;
