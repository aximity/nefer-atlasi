export const SITE_RELEASE = {
  version: "0.25.0",
  channel: "BETA",
  milestone: "M26",
  releasedAt: "26 Ağustos 2026",
  title: "Savaşçı Yetenekleri · Paket 1",
  summary:
    "Dokuz temel savaşçı yeteneği ve Kanatma'nın yerine geçen Boz Ayı varyantı oyun içi tooltip kanıtlarıyla sözlüğe eklendi.",
  changes: [
    "Depar'dan Savaş Narası'na dokuz temel savaşçı yeteneğinin hedef, süre, yenilenme ve puan eşikleri eklendi.",
    "Boz Ayı, 16. temel yetenek sayılmadan Kanatma'nın aynı puanları kullanan varyantı olarak gösterildi.",
    "Yetenek sözlüğüne Savaşçı, Büyücü ve Şifacı arasında geçiş sağlayan sınıf seçici eklendi.",
    "Her kayıt gerçek oyun içi kaynak görüntüsüne ve bağımsız rehber kaynağına bağlandı.",
  ],
} as const;
