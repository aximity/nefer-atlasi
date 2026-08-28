export const SITE_RELEASE = {
  version: "0.63.0",
  channel: "BETA",
  milestone: "M63",
  releasedOn: "2026-08-29",
  releasedAt: "29 Ağustos 2026",
  title: "Canlı Proje Durumu ve Görsel Harita",
  summary:
    "Son sürüm, tamamlanan işler, görsel kapsam ve çapraz modül açıkları artık Proje Durumu ekranında doğrudan canlı veriden hesaplanıyor.",
  changes: [
    "Görsel harita; maden, reçete malzemesi, eşya ikonu, görünüş ailesi, tılsım, iksir ve yetenek medyasını sekiz otomatik kapsam başlığında birleştirdi.",
    "Medya sağlık hesabı düzeltildi: altı doğrulanmış tılsım ailesi artık paya katılıyor ve gerçek kapsam 8/32 gösteriliyor.",
    "Tılsım reçete edinim sayımı düzeltildi: 13 kesin, 4 belirsiz aday, 103 satırsız ve kesin kaynağı bilinmeyen 107 reçete ayrı ölçülüyor.",
    "Ortak eşya görünüşü kart, ayrıntı ve Atlas'ta tek çözücüye bağlandı; 48 malzeme ikonundaki kırık kaynak kimliği ve ara malzeme arama açığı kapatıldı.",
  ],
} as const;
