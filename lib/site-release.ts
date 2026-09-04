export const SITE_RELEASE = {
  version: "0.70.0",
  channel: "BETA",
  milestone: "M70",
  releasedOn: "2026-09-04",
  releasedAt: "4 Eylül 2026",
  title: "Tam Kaynak Recovery ve Modül Sınırları",
  summary:
    "Tam tarihsel uygulama kaynağı korundu; eşya ve grup bölgesi çalışma yüzeyleri ana koordinatörden ayrıldı, güvenli canlı maden gözlem altyapısı eklendi.",
  changes: [
    "Kayıp sanılan tam Sites kaynak geçmişi recovery tabanına alındı.",
    "Eşya kartı, karşılaştırma, ayrıntı ve grup bölgeleri bağımsız modüllere ayrıldı.",
    "Canlı maden gözlemleri kimlik, idempotency ve D1 hız sınırıyla güvenli API katmanına bağlandı.",
    "Mevcut arama, derin bağlantı ve kanıt kapsamı değiştirilmeden korundu.",
  ],
} as const;
