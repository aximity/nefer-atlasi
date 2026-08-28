export const SITE_RELEASE = {
  version: "0.61.0",
  channel: "BETA",
  milestone: "M61",
  releasedAt: "29 Ağustos 2026",
  title: "Maden Görseli Teslim Güvencesi",
  summary:
    "Maden ve malzeme ikonları yayın sunucusundaki ayrı dosya isteğine bağlı kalmadan, özgün oyun görseli korunarak sayfaya gömüldü.",
  changes: [
    "95 gerçek malzeme ikonu doğrudan sayfa paketine bağlandı; bozuk görsel isteği ortadan kaldırıldı.",
    "Reçeteler, maden rehberi, stok girişi ve fotoğraf taslağı aynı güvenli ikon kaynağını kullanıyor.",
    "Özgün dosya yolu ve kaynak kimliği korunuyor; görseller yeniden üretilmedi veya değiştirilmedi.",
    "İkon teslimi için otomatik test eklendi.",
  ],
} as const;
