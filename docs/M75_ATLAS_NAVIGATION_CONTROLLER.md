# M75 — Atlas gezinme denetleyicisi

## Oyuncu ihtiyacı

Oyuncu genel aramadan bir kayda gittiğinde veya tarayıcıda geri/ileri kullandığında doğru modülün doğru kayıt bağlamıyla açılmasını bekler.

## Kapsam

- Dahil: URL’den modül, eşya, tılsım, görev, yetenek, bölge/boss ve build durumunu yüklemek.
- Dahil: Tarayıcı geri/ileri hareketi ile uygulama içi gezinme olaylarını dinlemek.
- Dahil: Modül odak anahtarlarını ve yenileme sayaçlarını tek denetleyicide toplamak.
- Dahil: Genel aramadaki kayıt sonuçlarını ilgili modül ve derin bağlantıya yönlendirmek.
- Dahil: Modül değişiminde açık dış eşya ayrıntısını kapatmak.
- Dahil değil: Görsel tasarım, oyun verisi, arama sıralaması veya rota biçimini değiştirmek.

## Veri ve kaynak

- Kaynak kimliği: Mevcut canonical kataloglar, modül kataloğu ve rota parametreleri.
- Güven durumu: Mimari düzenleme; yeni oyun iddiası eklenmez.
- Çelişki / bilinmeyen: Bir kayda URL ile ulaşılması doğrulama düzeyini değiştirmez.

## Kabul koşulları

- [x] Geçersiz modül ana sayfaya güvenli biçimde düşer.
- [x] Eşya, tılsım, görev, yetenek, bölge/boss ve build bağlantıları doğru odağı yükler.
- [x] Genel arama sonucu seçildiğinde arama katmanı kapanır ve hedef modül açılır.
- [x] Geri/ileri gezinme modül ve kayıt bağlamını yeniden yükler.
- [x] Ana sayfaya dönüş ayrıntı parametrelerini temizler.
- [x] Ana koordinatör 140 satırın altına iner.
- [x] 360 px düzeni, uzun Türkçe metin, klavye ve dokunma davranışı gerilemez.
- [x] Veri doğrulama, davranış testleri, render testi, build ve lint geçer.

## Geri dönüş noktası

`M75` refactor commit'i tek başına geri alınabilir; M70–M74 modül sınırları ve oyun verisi değişmez.
