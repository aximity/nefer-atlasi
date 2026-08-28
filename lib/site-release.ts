export const SITE_RELEASE = {
  version: "0.57.0",
  channel: "BETA",
  milestone: "M57",
  releasedAt: "28 Ağustos 2026",
  title: "Malzeme İkonları Canlıda",
  summary:
    "Ana eşya reçetelerindeki 47 eksik malzeme ikonu oyun görselleriyle tamamlandı; canlı sitedeki iki harfli yedekler kaldırıldı.",
  changes: [
    "47 eksik ana reçete malzemesine oyundaki 30 × 30 piksel ikonları eklendi.",
    "Akik, Saf Tungsten, Taşkanat Derisi ve diğer ana malzemeler artık ad kısaltması yerine görselle gösteriliyor.",
    "İkon kaynağı veri envanterine eklendi ve her ana reçete malzemesinin görsel eşleşmesi testle güvenceye alındı.",
    "Toplam yerel malzeme ikonu sayısı 48'den 95'e çıktı.",
  ],
} as const;
