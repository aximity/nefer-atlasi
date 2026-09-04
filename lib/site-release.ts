export const SITE_RELEASE = {
  version: "0.73.0",
  channel: "BETA",
  milestone: "M73",
  releasedOn: "2026-09-04",
  releasedAt: "4 Eylül 2026",
  title: "Eşya Kataloğu ve Yönlendirme Sınırları",
  summary:
    "Eşya arama, filtre, karşılaştırma ve ayrıntı durumu bağımsız katalog modülüne; URL okuma ve üretme kuralları ayrı yönlendirme katmanına taşındı.",
  changes: [
    "Eşya arama, sınıf ve yuva filtreleri katalog modülünde toplandı.",
    "Karşılaştırma, uyumsuz seçim uyarısı ve ayrıntı penceresi katalog sınırına taşındı.",
    "Modül, kayıt ve geri/ileri gezinme adresleri tek yönlendirme katmanından yönetiliyor.",
    "Ana koordinatör 250 satırın altına indirildi; mevcut derin bağlantılar korundu.",
  ],
} as const;
