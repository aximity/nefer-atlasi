export const SITE_RELEASE = {
  version: "0.41.0",
  channel: "BETA",
  milestone: "M41",
  releasedAt: "28 Ağustos 2026",
  title: "Ortak Görünüş Aileleri",
  summary:
    "Eşya, tılsım ve iksir görselleri kayıt başına tekrarlanmak yerine ortak gövde, renk ve boyut kurallarıyla sadeleştirildi.",
  changes: [
    "129 eşya 23 görünüş ailesine bağlandı; eksik görsel kuyruğu artık her eşyayı değil ortak gövdeyi bir kez sayıyor.",
    "179 tılsım kırmızı ve mavi iki ortak görünüşe indirildi; sınıf, kademe ve etki ayrı bilgi katmanları olarak korundu.",
    "İksirler için kırmızı can, mavi kudret ve turkuaz direnç/özellik aileleri ile seviyeye bağlı boyut kuralı tanımlandı.",
  ],
} as const;
