export const SITE_RELEASE = {
  version: "0.36.1",
  channel: "BETA",
  milestone: "M35",
  releasedAt: "27 Ağustos 2026",
  title: "Sade Tılsım Rehberi",
  summary:
    "Tılsım ekranı yalnız gerekli dört bilgiye indirildi: ne olduğu, kullanım amacı, edinme yolu ve reçete içeriği.",
  changes: [
    "Yetenek puanı yönlendirmesi ve önce/sonra hesaplama kartları Tılsım bölümünden kaldırıldı.",
    "Seçilen tılsımın resmî kullanım açıklaması doğrudan gösteriliyor.",
    "Edinme yolu ve doğrulanmış NPC bağlantısı tek kartta sadeleştirildi.",
    "Reçetede bilinen önceki kademe gösteriliyor; doğrulanmayan diğer malzeme ve adetler tahmin edilmiyor.",
    "Favoriye ekleme ve Üretim Takibi bağlantısı korunuyor.",
  ],
} as const;
