export const SITE_RELEASE = {
  version: "0.15.0",
  channel: "BETA",
  milestone: "M15",
  releasedAt: "25 Ağustos 2026",
  title: "Süreli grup ve etkinlik panosu",
  summary:
    "WhatsApp, Discord ve oyun sohbeti duyurularını yapılandırılmış, süreli grup ilanına dönüştüren topluluk panosu açıldı.",
  changes: [
    "Yapıştırılan duyurudan bölge, saat, kanal, etkinlik türü ve rol ihtiyacı çıkarılıyor.",
    "Ham sohbet metni sunucuya gönderilmeden yalnız yapılandırılmış ilan alanları saklanıyor.",
    "Telefon ve özel grup bağlantıları engelleniyor; ilanlar süre dolunca otomatik kapanıyor.",
    "Oyuncu kendi ilanını cihazında saklanan tek kullanımlık anahtarla kapatabiliyor.",
  ],
} as const;
