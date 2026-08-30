export const SITE_RELEASE = {
  version: "0.68.6",
  channel: "BETA",
  milestone: "M68.6",
  releasedOn: "2026-08-30",
  releasedAt: "30 Ağustos 2026",
  title: "Çalışan Gök Tapınağı Kaynağı",
  summary:
    "Mobilde açılmayan Gök Tapınağı Topluluk gönderileri temizlendi; harita ön gösterimi doğrudan video bağlantısına taşındı.",
  changes: [
    "Gök Tapınağı harita ön gösterimi Topluluk gönderisi yerine gerçek YouTube video adresine bağlandı.",
    "Mobilde kullanılamayan görev-metni gönderisi kaynak ve arayüz bağlantılarından kaldırıldı.",
    "Görev metni kesiti çalışan yeni kaynak bulunana kadar doğrulama bekliyor olarak açık tutuldu.",
    "Kaynak sağlığı testi Gök Tapınağı kartında /post/ biçimli kırık bağlantıların yeniden yayımlanmasını engelliyor.",
  ],
} as const;
