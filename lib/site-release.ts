export const SITE_RELEASE = {
  version: "0.32.0",
  channel: "BETA",
  milestone: "M31",
  releasedAt: "26 Ağustos 2026",
  title: "Bağımsız Yetenek Simülatörü",
  summary:
    "Yetenek puanı dağıtımı Tılsım bölümünden ayrıldı; seviye bütçesi, 0–15 eşikleri, etkin sonuçlar ve paylaşılabilir plan tek ekranda birleştirildi.",
  changes: [
    "Build sekmesi Donanım olarak netleştirildi; Yetenek hemen yanına taşındı ve simülatör ilk çalışma alanı yapıldı.",
    "1–49 seviye, isteğe bağlı +5 hak, kalan puan ve kilitli yetenek hesabı eklendi.",
    "Her yetenekte 0/5/10/15 hızlı dağıtım, artı/eksi ayarı, etkin sonuç ve sonraki eşik gösteriliyor.",
    "Boz Ayı KÖ'de Kanatma yuvasının karşılığı olarak gösteriliyor; plan kaydetme, yükleme ve bağlantıyla paylaşma eklendi.",
    "Tılsım bölümü yalnız tılsım etkisi, kademe ve edinme yolunu anlatacak şekilde ayrıştırıldı.",
  ],
} as const;
