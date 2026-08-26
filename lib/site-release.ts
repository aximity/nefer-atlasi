export const SITE_RELEASE = {
  version: "0.33.1",
  channel: "BETA",
  milestone: "M32.1",
  releasedAt: "26 Ağustos 2026",
  title: "Akıllı Arama ve Genel Yerleşim Düzeltmesi",
  summary:
    "Genel arama tür filtreleri ve kayıt odaklı yönlendirmelerle genişletildi; iç bölüm başlıklarının mobilde üst üste binmesine neden olan genel stil sızıntısı giderildi.",
  changes: [
    "Arama alanı başlıkta görünür bir kutuya dönüştürüldü.",
    "Bölüm, eşya, görev, yetenek, maden, bölge/boss ve tılsım filtreleri eklendi.",
    "Sonuçlar yalnız liste vermek yerine ilgili filtreyi, kaydı veya ayrıntı kartını doğrudan açıyor.",
    "Türkçe karakter farkları ve çok kelimeli aramalar birlikte destekleniyor.",
    "Genel header ve nav stilleri site çubuğuyla sınırlandırılarak bütün modüllerdeki metin çakışması önlendi.",
  ],
} as const;
