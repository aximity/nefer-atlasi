# M72 — Site kabuğu ve genel arama sınırları

## Oyuncu ihtiyacı

Oyuncu Atlas'ın her yerinden menüyü ve genel aramayı açıp eşya, reçete, görev, yetenek, maden, bölge, boss ve tılsım sonuçlarına ulaşabilmeli.

## Kapsam

- Dahil: Bölüm tanımlarını tek paylaşılan modül kataloğuna taşımak.
- Dahil: Üst başlık ve bölüm menüsünü bağımsız site gezinme bileşenine ayırmak.
- Dahil: Genel arama durumunu, filtrelerini ve sonuç üretimini bağımsız arama bileşenine ayırmak.
- Dahil: `/` ve `Esc` klavye davranışlarıyla mevcut derin bağlantıları korumak.
- Dahil değil: Görsel tasarım, oyun verisi, arama sıralama kuralı veya modül kapsamı değiştirmek.

## Veri ve kaynak

- Kaynak kimliği: Mevcut canonical kataloglar ve modül tanımları.
- Güven durumu: Mimari düzenleme; yeni oyun iddiası eklenmez.
- Çelişki / bilinmeyen: Arama sonucu varlığı doğrulama seviyesini yükseltmez.

## Kabul koşulları

- [x] On beş modül Bilgi, Araçlar ve Proje gruplarında korunur.
- [x] Genel arama dokuz filtre kategorisini ve mevcut sonuç türlerini korur.
- [x] Arama sonuçları doğru modül ve kayıt derin bağlantısına gider.
- [x] `/` aramayı açar, `Esc` açık katmanı kapatır.
- [x] Ana koordinatör 350 satırın altına iner.
- [x] 360 px düzeni, uzun Türkçe metin, klavye ve dokunma davranışı gerilemez.
- [x] Veri doğrulama, davranış testleri, render testi, build ve lint geçer.

## Geri dönüş noktası

`M72` refactor commit'i tek başına geri alınabilir; M70–M71 modül sınırları ve veri katmanları değişmez.
