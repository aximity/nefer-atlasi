# M74 — Karakter bağlamı ve Tılsım Rehberi sınırı

## Oyuncu ihtiyacı

Oyuncu Donanım, Yetenek ve Tılsım araçları arasında geçerken seçtiği sınıfın tutarlı kalmasını ve bağlantıyla açılan tılsımın doğru sınıfla birlikte yüklenmesini bekler.

## Kapsam

- Dahil: Sınıf ve seçili tılsım durumunu paylaşılan karakter bağlamında toplamak.
- Dahil: Geçerli tılsım kimliğinden sınıfı güvenli biçimde çözmek; geçersiz kimliği temizlemek.
- Dahil: Tılsım Rehberi başlığı ile çalışma yüzeyini bağımsız modüle taşımak.
- Dahil: Donanım planı yükleme, Yetenek araması ve Tılsım derin bağlantısındaki sınıf uyumunu korumak.
- Dahil değil: Tılsım verisi, reçete, etki hesabı, görsel tasarım veya doğrulama düzeyi değiştirmek.

## Veri ve kaynak

- Kaynak kimliği: Mevcut canonical tılsım kataloğu ve build/rota parametreleri.
- Güven durumu: Mimari düzenleme; yeni oyun iddiası eklenmez.
- Çelişki / bilinmeyen: Bağlantıyla açılan kayıt doğrulama seviyesini yükseltmez.

## Kabul koşulları

- [x] Donanım, Yetenek ve Tılsım yüzeyleri aynı karakter sınıfı bağlamını kullanır.
- [x] Sınıf değişince önceki sınıfa ait tılsım seçimi temizlenir.
- [x] Geçerli tılsım bağlantısı doğru sınıf ve tılsımı birlikte açar.
- [x] Geçersiz tılsım bağlantısı hata üretmeden seçimi temizler.
- [x] Tılsım arama, renk/kademe filtreleri ve boş durum korunur.
- [x] Ana koordinatör 200 satırın altına iner.
- [x] 360 px düzeni, uzun Türkçe metin, klavye ve dokunma davranışı gerilemez.
- [x] Veri doğrulama, davranış testleri, render testi, build ve lint geçer.

## Geri dönüş noktası

`M74` refactor commit'i tek başına geri alınabilir; M70–M73 modül sınırları ve oyun verisi değişmez.
