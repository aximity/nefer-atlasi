export const SITE_RELEASE = {
  version: "0.13.0",
  channel: "BETA",
  milestone: "M13",
  releasedAt: "25 Ağustos 2026",
  title: "Maden zamanlayıcısı ve süre gözlemleri",
  summary:
    "Maden modülü sabit konum yaklaşımından çıkarıldı; kişisel sayaçlar ve başarılı gözlemlerden oluşan tahmin aralıkları eklendi.",
  changes: [
    "Aynı anda birden fazla maden için cihazda saklanan kontrol sayacı eklendi.",
    "Boş ve başarılı kontrolleri ayıran yerel gözlem defteri oluşturuldu.",
    "Tek ölçümün kesin süre gibi sunulması engellendi; tahmin aralığı için en az iki başarılı ölçüm şartı getirildi.",
    "Canlı maden noktası paylaşmadan tekel riskini azaltan süre odaklı yaklaşım benimsendi.",
  ],
} as const;
