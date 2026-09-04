# M70 — Recovered modül sınırları

## Oyuncu ihtiyacı

Nefer Atlası'nda bir işi açan oyuncu, diğer modüllerin ayrıntıları ve durumuyla karşılaşmadan yalnız seçtiği çalışma yüzeyini kullanabilmeli.

## Kapsam

- Dahil: Tam recovered kaynakta grup bölgeleri, eşya kartı, karşılaştırma, eşya ayrıntısı ve ortak bölüm başlığı bileşenlerini ana koordinatörden ayırmak.
- Dahil: Var olan tek-modül görünümü, genel arama, derin bağlantılar ve kaynak etiketlerini korumak.
- Dahil değil: Oyun verisi değiştirmek, yeni özellik eklemek, renk/marka yenilemek veya GitHub `main` dalını zorla değiştirmek.

## Veri ve kaynak

- Kaynak kimliği: Mevcut canonical katalog ve recovered Sites kaynak geçmişi.
- Güven durumu: Kod/mimari düzenleme; oyun iddiası eklenmez.
- Çelişki / bilinmeyen: Dar recovery dalındaki görünüm ile tam recovered ürünün özellik kapsamı doğrudan birbirinin yerine geçirilemez.

## Kabul koşulları

- [x] Aynı anda yalnız seçilen modül görünür.
- [x] Eşya arama, filtre, karşılaştırma ve ayrıntı davranışı korunur.
- [x] Grup bölgesi/boss derin bağlantıları korunur.
- [x] Ana koordinatör 800 satırın altına iner.
- [x] 360 px güvenlik kuralları ve klavye/dokunma davranışı gerilemez.
- [x] Veri doğrulama, davranış testleri, render testi, build ve lint geçer.

## Geri dönüş noktası

`M70` refactor commit'i tek başına geri alınabilir; D1 migration'ı ve canlı maden API'si bu değişiklikten bağımsız kalır.
