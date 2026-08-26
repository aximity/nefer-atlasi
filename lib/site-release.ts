export const SITE_RELEASE = {
  version: "0.22.1",
  channel: "BETA",
  milestone: "M22",
  releasedAt: "26 Ağustos 2026",
  title: "Görev Atlası Mobil Düzeltmesi",
  summary:
    "Görev Atlası'nın mobil yerleşimi ve seviye seçme davranışı gerçek kullanım geri bildirimiyle düzeltildi.",
  changes: [
    "Genel başlık stili görev kartlarından ayrıldı; kart ve açıklama metinlerinin üst üste binmesi önlendi.",
    "Seviye alanı artık tamamen silinip yeniden yazılabiliyor ve 1–49 doğrulaması yapıyor.",
    "Görev listesi yalnız mevcut seviye ile önceki iki seviyenin ilgili görevlerini gösteriyor.",
    "Eski zincir görevleri listede kalabalık yaratmadan görev detayındaki ön koşullardan açılabiliyor.",
  ],
} as const;
