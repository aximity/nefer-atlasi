export const SITE_RELEASE = {
  version: "0.65.0",
  channel: "BETA",
  milestone: "M65",
  releasedOn: "2026-08-29",
  releasedAt: "29 Ağustos 2026",
  title: "Kanıt Görevleri ve Akıllı Bildirim",
  summary:
    "Atlas Tamamlama Merkezi'ndeki her açık iş artık kanıt gereksinimi doldurulmuş katkı formuna ve güvenli görsel yüklemeye bağlanıyor.",
  changes: [
    "Her açık iş konu, mevcut eksik ve gereken kanıt türüyle katkı formunu otomatik dolduruyor.",
    "Site geri bildirimine isteğe bağlı, en çok 5 MB PNG, JPG veya WebP oyun içi kanıt yükleme eklendi.",
    "Yüklenen kanıt atlas verisini otomatik değiştirmiyor; özel inceleme kuyruğunda doğrulama bekliyor.",
    "İksir görsel ailesi kartlarındaki bozuk reçete parametresi düzeltilerek ilgili iksir kataloğuna bağlandı.",
  ],
} as const;
