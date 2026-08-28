export const SITE_RELEASE = {
  version: "0.49.0",
  channel: "BETA",
  milestone: "M49",
  releasedAt: "28 Ağustos 2026",
  title: "Çemberlitaş Hesap Güvenliği",
  summary:
    "Çift yazılan Çemberlitaş özellikleri doğru toplamla hesaplamaya alındı; eşyada bulunmayan özellik satırları kaldırıldı.",
  changes: [
    "11 çelişkili Çemberlitaş özellik kaydı kaynak satırlarıyla yeniden denetlendi ve çelişkili kayıt sayısı sıfıra indirildi.",
    "Aynı eşyada iki kez bulunan 150.000 hasar, 224.000 iyileştirme, 383.000 iyileştirme ve 477.000 enerji satırları hesap toplamı olarak birleştirildi.",
    "Ceket ve amplifikatörlere yanlışlıkla bağlanan Maksimum Kudret satırları ile Taş Kanat Ceket'teki yanlış Savunma satırı kaldırıldı.",
    "Build toplamları artık Kıyamet, Sıfır Kelvin, Transformatör, Cehennem, Mevlana ve Taş Kanat parçalarını doğru değerle hesaplıyor.",
    "Yeni veri kapısı, çözülen 11 toplamı ve kaldırılan 10 yanlış satırı otomatik olarak denetliyor.",
  ],
} as const;
