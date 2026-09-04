# M73 — Eşya kataloğu ve yönlendirme sınırları

## Oyuncu ihtiyacı

Oyuncu eşya kataloğunda arama, filtreleme, karşılaştırma ve ayrıntı akışlarını kullanırken genel arama ile tarayıcı geri/ileri gezinmesinde bağlamını kaybetmemeli.

## Kapsam

- Dahil: Eşya arama, sınıf/yuva filtresi, sayfalama ve karşılaştırma durumunu bağımsız katalog modülüne taşımak.
- Dahil: Katalog içi ayrıntı penceresi ile genel aramadan odaklanan eşya akışını korumak.
- Dahil: URL okuma, modül adresi üretme, ana sayfaya dönüş ve eşya ayrıntısını kapatma kurallarını tek yönlendirme katmanına taşımak.
- Dahil: Bölge ganimetinden açılan eşya ayrıntısını mevcut bağlamında korumak.
- Dahil değil: Görsel tasarım, oyun verisi, filtre kuralı veya doğrulama durumu değiştirmek.

## Veri ve kaynak

- Kaynak kimliği: Mevcut canonical eşya katalogları ve rota parametreleri.
- Güven durumu: Mimari düzenleme; yeni oyun iddiası eklenmez.
- Çelişki / bilinmeyen: URL ile erişim bir kaydın doğrulama seviyesini değiştirmez.

## Kabul koşulları

- [x] Arama, sınıf/yuva filtreleri, 24 kayıtlık ilerleme ve boş durum korunur.
- [x] Aynı sınıf ve yuvadan iki eşya karşılaştırması ile uyumsuz seçim uyarısı korunur.
- [x] Genel arama eşya sonucunu katalogda filtreleyip ayrıntısını açar.
- [x] Bölge ganimeti ayrıntısı bölge modülünün üzerinde açılır.
- [x] Modül, eşya, tılsım, görev, yetenek, bölge/boss ve build derin bağlantıları okunur.
- [x] Geri/ileri gezinme ve `Esc` ile kapatma davranışı korunur.
- [x] Ana koordinatör 250 satırın altına iner.
- [x] 360 px düzeni, uzun Türkçe metin, klavye ve dokunma davranışı gerilemez.
- [x] Veri doğrulama, davranış testleri, render testi, build ve lint geçer.

## Geri dönüş noktası

`M73` refactor commit'i tek başına geri alınabilir; M70–M72 modül sınırları ve oyun verisi değişmez.
