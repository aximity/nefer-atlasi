export const SITE_RELEASE = {
  version: "0.48.0",
  channel: "BETA",
  milestone: "M48",
  releasedAt: "28 Ağustos 2026",
  title: "Tılsım Edinimi ve Fotoğraf Önerisi",
  summary:
    "Kaynaklı I. kademe tılsımlar hazır edinim olarak üretim zincirine bağlandı; fotoğraf taslağı en yakın üretimi stok onayından önce gösteriyor.",
  changes: [
    "Gönül kaydı veya KÖ oyuncu bildirimiyle adı ve rengi eşleşen 10 I. kademe tılsım, sahte reçete eklenmeden hazır edinim kaynağına bağlandı.",
    "Oyuncu bilgisine dayanan hazır tılsımlar üretim planında NPC ve bölgeyi gösteriyor; dükkân görüntüsü gelene kadar doğrulama bekliyor etiketi taşıyor.",
    "Açık malzeme kaynağı sayısı 78'den 68'e indi; kanıtsız kalan 43 I. kademe tılsım ve 25 temel malzeme tahminsiz bırakıldı.",
    "Fotoğraftan seçilen ikon ve adet taslağı, stok değiştirilmeden önce en yakın üretimi veya yeni üretilebilir reçete sayısını hesaplıyor.",
    "Fotoğraf görüntüsü cihazda kalıyor; malzeme seçimi ve stok onayı kullanıcı kontrolünde tutuluyor.",
  ],
} as const;
