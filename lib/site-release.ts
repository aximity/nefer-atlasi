export const SITE_RELEASE = {
  version: "0.36.2",
  channel: "BETA",
  milestone: "M36",
  releasedAt: "27 Ağustos 2026",
  title: "KÖ Doğrulama Kapısı",
  summary:
    "KÖ ile normal İKV bilgisi ayrıldı; Bilgi Tılsımı bildirimi açık doğrulama etiketiyle eklendi ve katkı formu iki alana indirildi.",
  changes: [
    "Bilgi Tılsımlarının Gönül'de 10 M olduğu bildirimi KÖ oyuncu kaydı ve doğrulama uyarısıyla eklendi.",
    "Normal İKV'deki Hol, Gönül ve kademe bilgileri KÖ için kesin bilgi gibi gösterilmiyor.",
    "Reçete malzemesi, adet ve edinme kaynağı doğrulanmadığında açıkça teyit bekliyor deniyor.",
    "Katkı ekranı yalnız konu, düzeltme yorumu ve gönder düğmesine indirildi.",
  ],
} as const;
