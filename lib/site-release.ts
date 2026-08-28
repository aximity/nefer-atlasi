export const SITE_RELEASE = {
  version: "0.50.0",
  channel: "BETA",
  milestone: "M50",
  releasedAt: "28 Ağustos 2026",
  title: "Kesin Efsun Eşleşmeleri",
  summary:
    "Sığınaklar ve Migrat eşyalarında adı doğrulanmış efsun sözlüğüyle birebir eşleşen sekiz kayıt hesaplanabilir hâle geldi.",
  changes: [
    "Eksik özellikli 45 grup eşyası içinden adı efsun sözlüğüyle birebir eşleşen sekiz eşya doğrulanmış sayısal değere bağlandı.",
    "Cansiperhane, Bilge Kağan Modeli, Azat Efendi İcadı, Yücelen Ekolü, Farabi Modeli ve Solucan Modeli eşleşmeleri kullanıldı.",
    "İki efsun adı taşıyan Farabi/Solucan ve Yücelen/Solucan pantolonlarda iki özellik ayrı satır olarak korundu.",
    "Grup eşyalarındaki açık özellik kaydı 45'ten 37'ye indi; yakın yazımlar ve bilinmeyen özel adlar tahmin edilmedi.",
    "Yeni veri kapısı kesin değerleri ve kalan 37 açık kaydı otomatik olarak denetliyor.",
  ],
} as const;
