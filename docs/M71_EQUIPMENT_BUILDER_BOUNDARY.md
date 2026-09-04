# M71 — Donanım planlayıcı modül sınırı

## Oyuncu ihtiyacı

Oyuncu sınıf ve hedeflerine göre donanım seçerken paylaşma, cihazda saklama ve geri yükleme davranışlarını diğer atlas modüllerinden bağımsız kullanabilmeli.

## Kapsam

- Dahil: Donanım planlayıcının durumunu, hesaplarını, URL paylaşımını ve cihaz kaydını bağımsız bileşene taşımak.
- Dahil: Sınıf değişimini Tılsım ve Yetenek modülleriyle uyumlu tutmak.
- Dahil: Geçersiz/eski paylaşım kodunda güvenli hata göstermek.
- Dahil değil: Puanlama kuralı, oyun verisi, görünüm, renk veya metinleri değiştirmek.

## Veri ve kaynak

- Kaynak kimliği: Mevcut canonical eşya/özellik kataloğu ve `build-codec` sözleşmesi.
- Güven durumu: Mimari düzenleme; yeni oyun iddiası eklenmez.
- Çelişki / bilinmeyen: Öneri puanı meta veya başarı garantisi değildir.

## Kabul koşulları

- [x] Sınıf, ana hedef, ikincil hedef ve sekiz yuva seçimi korunur.
- [x] Hedefe göre öneri, yalnız eksikleri tamamlama ve toplam hesapları korunur.
- [x] Bağlantı paylaşımı ile cihazda kaydet/yükle akışları korunur.
- [x] Donanım durumu ana sayfa koordinatöründe tutulmaz.
- [x] Ana koordinatör 550 satırın altına iner.
- [x] 360 px düzeni, klavye ve dokunma davranışı gerilemez.
- [x] Veri doğrulama, davranış testleri, render testi, build ve lint geçer.

## Geri dönüş noktası

`M71` refactor commit'i tek başına geri alınabilir; M70 recovery tabanı ve canlı veri katmanları değişmez.
