export const SITE_RELEASE = {
  version: "0.66.4",
  channel: "BETA",
  milestone: "M66",
  releasedOn: "2026-08-29",
  releasedAt: "29 Ağustos 2026",
  title: "Gerçek Fotoğraf Izgara Düzeltmesi",
  summary:
    "Çanta fotoğrafı artık cihazda analiz edilerek malzeme ikonlarını ve okunabilen adetleri onaylanabilir stok taslağına dönüştürüyor.",
  changes: [
    "Telefonla çekilmiş özgün 8×8 banka fotoğrafında parlak ikon kenarlarının sahte ızgara sayılması engellendi.",
    "Gri-ton kenar ritmi artık parlak renk çizgilerinden önce değerlendirilerek gerçek hücre sınırları seçiliyor.",
    "Eksik son sınır yalnız beklenen konumda yeterli kenar kanıtı varsa tamamlanıyor; zayıf hayalî dış sınırlar budanıyor.",
    "Yarım hücre kaydıran katalog hizalaması kaldırıldı; ikonlar doğrudan bulunan hücre sınırları içinde karşılaştırılıyor.",
    "Kamera parlaklığında runner-up'tan belirgin ayrılmayan benzer maden ve taş ikonları yanlış adla taslağa alınmıyor.",
    "Zayıf veya birbirine yakın ikon eşleşmeleri artık malzeme adı olarak onay taslağına alınmıyor.",
    "Adet okuyucu yalnız hücrenin sol üstündeki saf rakam alanını kabul ediyor; ikon ve araç ipucu rakamlarını dışarıda bırakıyor.",
    "Net ekran görüntülerindeki yumuşak, kesintili veya kısmen örtülü çanta çizgileri hücre ritmine göre de algılanıyor.",
    "Fotoğraf yüklenir yüklenmez çanta ızgarası ve doğrulanmış malzeme ikonları cihaz içinde otomatik karşılaştırılıyor.",
    "Tanınan malzeme ve adetler güven oranı, adet uyarısı ve düzenlenebilir onay listesiyle gösteriliyor.",
    "Manuel ikon kataloğu ana adım olmaktan çıkarıldı; yalnız eksik veya yanlış sonucu düzeltmek için açılıyor.",
    "Onaylanan stoktan en yakın üç ila beş eşya, tılsım veya iksir üretim adayı hesaplanıyor.",
  ],
} as const;
