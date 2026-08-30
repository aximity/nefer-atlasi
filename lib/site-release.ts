export const SITE_RELEASE = {
  version: "0.68.3",
  channel: "BETA",
  milestone: "M14.1",
  releasedOn: "2026-08-30",
  releasedAt: "30 Ağustos 2026",
  title: "Çakışmasız Ticaret Arşivi",
  summary:
    "WhatsApp ticaret arşivi 30 Ağustos'a uzatıldı; örtüşen dışa aktarımlar tekilleştirildi ve fiyat–adet eşleştirmesi daha güvenli hâle getirildi.",
  changes: [
    "21–30 Ağustos aralığındaki 3.946 tekil mesajdan 451 anonim alış–satış sinyali çıkarıldı.",
    "Örtüşen eski ve yeni WhatsApp dışa aktarımları mesaj ve günlük kaynak düzeyinde tekilleştirildi.",
    "79 günlük fiyat kesiti, alınır–satılık ve TL–Akçe ayrımı korunarak yayımlandı.",
    "‘200'den’, ‘akçeden’ ve çok ürünlü ilanlarda fiyatın doğru ürüne bağlanması iyileştirildi.",
    "İlan adedinin fiyatı yanlışlıkla bölmesi ve yakındaki başka ürünün fiyatının taşınması engellendi.",
    "Ad, telefon ve ham sohbet saklanmadan günlük anonim agregalar gelecekteki artımlı güncellemelere hazırlandı.",
  ],
} as const;
