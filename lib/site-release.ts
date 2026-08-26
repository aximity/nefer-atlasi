export const SITE_RELEASE = {
  version: "0.21.0",
  channel: "BETA",
  milestone: "M21",
  releasedAt: "26 Ağustos 2026",
  title: "Üretim Ağı",
  summary:
    "Maden, toplayıcılık çıktısı ve şaheser reçeteleri çift yönlü bir üretim ağı üzerinde birleştirildi.",
  changes: [
    "Maden modülündeki Kaynaklar sekmesi, görünür Üretim Ağı çalışma alanına dönüştürüldü.",
    "Her 1., 2. ve 3. çıktı ayrı ayrı açılarak kullanıldığı şaheserleri ve reçete miktarlarını gösteriyor.",
    "Masaüstünde hızlı kullanım önizlemesi, mobilde dokunmalı ayrıntı paneli eklendi.",
    "Şaheser adıyla arama yapıldığında ilgili maden zincirleri de bulunuyor.",
    "Eşya ayrıntısındaki reçete malzemeleri Üretim Ağına geri bağlandı.",
    "Kaynağı olmayan kullanım iddiaları kesin bilgi gibi gösterilmiyor; katkı bekliyor etiketi korunuyor.",
  ],
} as const;
