export const SITE_RELEASE = {
  version: "0.71.0",
  channel: "BETA",
  milestone: "M71",
  releasedOn: "2026-09-04",
  releasedAt: "4 Eylül 2026",
  title: "Donanım Planlayıcı Modül Sınırı",
  summary:
    "Donanım planlayıcının seçim, hesap, paylaşım ve cihaz kaydı kendi modülüne taşındı; mevcut atlas kapsamı ve görünümü korundu.",
  changes: [
    "Donanım seçimi ve toplam hesapları ana sayfa koordinatöründen ayrıldı.",
    "Plan bağlantısı paylaşma ile cihazda kaydetme ve yükleme akışları bağımsız modülde korundu.",
    "Sınıf seçimi Tılsım ve Yetenek çalışma yüzeyleriyle uyumlu kalmaya devam ediyor.",
    "Uyumsuz eşya karşılaştırma uyarısı ilgili Eşyalar yüzeyinde görünür hâle getirildi.",
  ],
} as const;
