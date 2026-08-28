export const potionRecipeSourceId = "fandom-potion-recipes-20260826";

export const potionIngredientIndex: Record<string, string[]> = {
  "Meşe Odunu": ["Kedi İyileştiren", "Zırh Artırıcı", "Buz Hasarı Veren", "Zehir Hasarı Artırıcı"],
  "Ceviz Yaprağı": ["Kedi İyileştiren", "Kritik Artırıcı", "Elektrik Hasarı Artırıcı", "Asit Direnci Artırıcı"],
  "Isırgan Otu": ["Koç İyileştiren", "İğne Deliği Misali", "Kutup Esintili", "Plastik Emsali"],
  "Ökse Otu": ["Koç İyileştiren", "Fareadam Menşeili", "Çekiç Başlı", "Erciyes Modeli"],
  "Adaçayı Yaprağı": ["Eski Köprü Usulü", "Horoz Gagası Misali", "Çamlıca Menşeili", "Bakırköy Usulü"],
  "Koni Yaprağı": ["Aygır İyileştiren", "Epe Ucu Misali", "Faraday Modeli", "Oğuz Bey İcadı"],
  "Civan Perçemi": ["Aygır İyileştiren", "Yılan Isırığı Emsali", "Vatoz Emsali", "Şimal Usulü"],
  Mantar: ["Timsah Derisi Emsali", "Karayel Etkili", "Toprak Modeli", "Aktar Şevket İcadı"],
  "Şerbetçi Otu": ["Demirci Dilek Modeli", "Buz Kristali Modeli", "Derviş Hasan Usulü", "Beygir Emsali"],
  "Abanoz Odunu": ["Fil İyileştiren", "Karacin Modeli", "Karakürk Emsali"],
  "Çıban Otu": ["Solucan Modeli", "Halit Girmenç İcadı", "Ruh Çalan Emsali", "Nötron Yıldızı Emsali"],
};

export const indexedPotionCount = new Set(Object.values(potionIngredientIndex).flat()).size;
