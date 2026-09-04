export const SITE_RELEASE = {
  version: "0.72.0",
  channel: "BETA",
  milestone: "M72",
  releasedOn: "2026-09-04",
  releasedAt: "4 Eylül 2026",
  title: "Site Kabuğu ve Genel Arama Sınırları",
  summary:
    "Üst gezinme, bölüm menüsü ve dokuz kategorili genel arama bağımsız site kabuğu modüllerine taşındı; mevcut derin bağlantılar korundu.",
  changes: [
    "On beş bölümün tanımı tek paylaşılan modül kataloğunda toplandı.",
    "Üst başlık ile Bilgi, Araçlar ve Proje menüsü ana koordinatörden ayrıldı.",
    "Eşya, reçete, görev, yetenek, maden, bölge ve tılsım araması bağımsız bileşene taşındı.",
    "Klavye kısayolları ve kayıt derin bağlantıları değiştirilmeden korundu.",
  ],
} as const;
