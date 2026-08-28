export const SITE_RELEASE = {
  version: "0.38.0",
  channel: "BETA",
  milestone: "M38",
  releasedAt: "28 Ağustos 2026",
  title: "Pazar Nabzı Güncellemesi",
  summary:
    "WhatsApp ticaret arşivi 28 Ağustos'a kadar yenilendi; alış-satış sinyalleri, anonim fiyat kesitleri ve gözlenen fiyat aralıkları pazar ekranına işlendi.",
  changes: [
    "2.719 mesajdan 372 anonim ticaret sinyali ve 28 günlük fiyat kesiti çıkarıldı.",
    "Alınır ve satılık ilanlar ayrı sayıldı; ürün bazında talep, arz veya dengeli görünüm etiketi eklendi.",
    "Fiyat kartlarında medyanın yanında gözlenen en düşük–en yüksek aralık gösterilmeye başlandı.",
  ],
} as const;
