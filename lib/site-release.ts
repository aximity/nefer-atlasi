export const SITE_RELEASE = {
  version: "0.75.0",
  channel: "BETA",
  milestone: "M75",
  releasedOn: "2026-09-05",
  releasedAt: "5 Eylül 2026",
  title: "Atlas Gezinme Denetleyicisi",
  summary:
    "URL’den durum yükleme, geri/ileri gezinme ve modül odak geçişleri tek Atlas gezinme denetleyicisinde toplandı.",
  changes: [
    "Modül ve kayıt parametreleri tek denetleyicide okunup ilgili çalışma yüzeyine uygulanıyor.",
    "Genel aramadaki eşya, görev, yetenek, bölge ve tılsım sonuçları aynı odak akışını kullanıyor.",
    "Tarayıcı geri/ileri hareketi ile uygulama içi gezinme olayları tek yaşam döngüsünde yönetiliyor.",
    "Ana koordinatör 140 satırın altına indirildi; mevcut derin bağlantılar korundu.",
  ],
} as const;
