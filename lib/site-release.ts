export const SITE_RELEASE = {
  version: "0.76.0",
  channel: "BETA",
  milestone: "M76",
  releasedOn: "2026-09-05",
  releasedAt: "5 Eylül 2026",
  title: "Bağımsız Modül Sahnesi",
  summary:
    "On beş çalışma yüzeyinin render eşlemesi bağımsız modül sahnesinde toplandı; ana sayfa yalnız kabuk ve giriş akışını yönetiyor.",
  changes: [
    "Bilgi, araç ve proje gruplarındaki on beş modül tek, eksiksiz sahne eşlemesinden açılıyor.",
    "Modüllere özel başlangıç kayıtları, yenileme anahtarları ve karakter bağlamı korunuyor.",
    "Bölge ganimetinden açılan eşya ayrıntısı modül sahnesinin kendi sınırında gösteriliyor.",
    "Ana koordinatör 90 satırın altına indirildi; mevcut arama ve derin bağlantılar korundu.",
  ],
} as const;
