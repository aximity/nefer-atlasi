export const SITE_RELEASE = {
  version: "0.68.4",
  channel: "BETA",
  milestone: "M68.4",
  releasedOn: "2026-08-30",
  releasedAt: "30 Ağustos 2026",
  title: "Yükseltme Karar Merkezi",
  summary:
    "+ basma, Kozmik Yükseltme ve bağlı KÖ içerikleri önem, kanıt durumu ve kapatma gereksinimleriyle tek güvenli akışta toplandı.",
  changes: [
    "+ basma ve Kozmik Yükseltme, yüksek maliyet ve tekrar sıklığı nedeniyle P0 aktif iş olarak öne alındı.",
    "Dönüşüm Taşı, Malahit Taşı ve Gökmeran aynı yükseltme bağımlılık zincirinde ayrı kanıt görevlerine bağlandı.",
    "Malahit pazar sinyali sabit metin yerine 21–30 Ağustos anonim ticaret arşivinden canlı hesaplanıyor.",
    "Gökmeran'ın reçine ilişkisi çelişkili; Gök Tapınağı görev zinciri tam metin yayımlanana kadar açık tutuluyor.",
    "Normal İKV'nin 2015 yükseltme sistemi KÖ için mekanik kanıt sayılmıyor.",
    "Her pahalı yükseltme kaydı için önce, onay ve sonuç görüntülerinden oluşan üç aşamalı kanıt kapısı eklendi.",
  ],
} as const;
