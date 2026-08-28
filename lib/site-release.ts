export const SITE_RELEASE = {
  version: "0.62.0",
  channel: "BETA",
  milestone: "M62",
  releasedAt: "29 Ağustos 2026",
  title: "Tılsım Reçete ve Edinim Haritası",
  summary:
    "Tılsım reçeteleri sınıf ve renk kimliğiyle yeniden bağlandı; gerçek oyun ikonları, malzeme kaynakları ve doğrulanabilen reçete edinim yerleri aynı kartta toplandı.",
  changes: [
    "710 tılsım reçetesi girdisinin tamamı 7 gerçek malzeme ve 6 sınıf/renk tılsım ikonuna bağlandı.",
    "110 önceki kademe tılsım görünen ad yerine kesin kimlikle bağlandı; aynı adlı sınıf varyantlarının birleşmesi önlendi.",
    "13 reçetenin kesin normal İKV kaynağı, 2 ad-çakışmalı kayıt ve 105 doğrulanmamış edinim kaydı birbirinden ayrıldı.",
    "KÖ oyuncu bildirimlerinin II–III. kademelere sızması engellendi; normal İKV, KÖ ve reçete drobu ayrı kanıt alanlarında gösterildi.",
  ],
} as const;
