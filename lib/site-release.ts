export const SITE_RELEASE = {
  version: "0.74.0",
  channel: "BETA",
  milestone: "M74",
  releasedOn: "2026-09-05",
  releasedAt: "5 Eylül 2026",
  title: "Karakter Bağlamı ve Tılsım Rehberi Sınırı",
  summary:
    "Sınıf ve tılsım seçimi tek karakter bağlamında toplandı; Tılsım Rehberi bağımsız çalışma yüzeyine taşındı.",
  changes: [
    "Donanım, Yetenek ve Tılsım modülleri aynı sınıf bağlamını kullanıyor.",
    "Tılsım seçimi tek doğruluk kaynağına indirildi ve geçersiz kimlikler güvenle temizleniyor.",
    "Tılsım Rehberi başlığı ile çalışma yüzeyi ana koordinatörden ayrıldı.",
    "Ana koordinatör 200 satırın altına indirildi; tılsım ve build derin bağlantıları korundu.",
  ],
} as const;
