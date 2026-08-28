export const SITE_RELEASE = {
  version: "0.41.1",
  channel: "BETA",
  milestone: "M41",
  releasedAt: "28 Ağustos 2026",
  title: "Yönlendirme ve Pazar Onarımı",
  summary:
    "Ana sayfadaki modüller URL ile sürekli eşitlendi; kırık derin bağlantılar, geri–ileri gezinme ve fiyat gözlemi akışı çalışır hâle getirildi.",
  changes: [
    "Tılsımdan reçeteye, reçeteden eşya veya tılsıma ve Atlas içindeki modül geçişleri ortak yönlendirme katmanına bağlandı.",
    "Tarayıcı Geri/İleri düğmeleri, eski sorgu parametrelerinin temizliği ve eşya penceresinin Esc ile kapanması düzeltildi.",
    "Fiyat gözlemi bağlantısı; yön, ilan/satış, miktar, para birimi, fiyat, kanal ve görsel ya da bağlantı kanıtı alanları olan gerçek forma dönüştürüldü.",
    "Boss ve bölge Atlas kayıtlarının yanlış maden filtresine gitmesi önlendi; eski yerel üretim verileri güvenli biçimde okunuyor.",
  ],
} as const;
