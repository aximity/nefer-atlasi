export const SITE_RELEASE = {
  version: "0.34.0",
  channel: "BETA",
  milestone: "M32.2",
  releasedAt: "26 Ağustos 2026",
  title: "Özel Trafik Merkezi ve Reklam Hazırlığı",
  summary:
    "Gizlilik odaklı birinci taraf trafik ölçümü, yalnız sahibin erişebildiği parola korumalı istatistik paneli ve gelecekte etkinleştirilebilecek izinli reklam altyapısı eklendi.",
  changes: [
    "Sayfa görüntüleme, günlük tekil ziyaretçi, trafik kaynağı ve cihaz türü anonim olarak ölçülüyor.",
    "Trafik paneli ChatGPT girişi yerine güçlü erişim anahtarı ve güvenli oturum çereziyle korunuyor.",
    "Hatalı girişler on beş dakikalık hız sınırına bağlandı; yönetim trafiği ve bilinen botlar sayımdan çıkarıldı.",
    "AdSense alanları, ads.txt ve reklam izni katmanı yayıncı kimlikleri eklenene kadar görünmez ve kapalı tutuluyor.",
    "Gizlilik sayfası ham IP saklanmadığını ve reklamların yalnız açık izinle çalışacağını açıklıyor.",
  ],
} as const;
