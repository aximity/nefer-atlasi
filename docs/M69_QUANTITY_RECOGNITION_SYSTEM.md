# M69 — Kalıcı Adet Tanıma Sistemi

## Sorun

Mevcut yedek okuyucu, az sayıdaki rakam şablonu ve en-boy oranı kurallarıyla çalışır. Telefon çözünürlüğü, oyun arayüzü ölçeği, sıkıştırma, keskinleştirme, perspektif ve sarı yazının ikonla örtüşmesi değiştiğinde aynı rakam farklı piksel biçimlerine dönüşür. Şablonların kendisinden üretilen sentetik testler bu değişkenliği ölçmediği için yüksek görünen test sonucu gerçek fotoğraf doğruluğunu temsil etmez.

## Güvenlik ilkesi

Kalite kapıları karşılanana kadar OCR yalnız bir adet önerisi üretir. Sarı etiketli yığın kullanıcı doğrulaması olmadan stoka veya reçete hesabına girmez. Etiketsiz tekli yuva 1 kabul edilir.

## Hedef işlem hattı

1. Envanter düzlemini ve ızgarayı bul, perspektifi kare hücrelere normalize et.
2. Her hücrede sarı adet etiketi varlığını ayrı bir sınıflandırıcıyla belirle.
3. Etiket bölgesini sabit ölçekte kırp; renk, parlaklık ve kenar normalizasyonu uygula.
4. Yalnız 0–9 karakterlerini çözen küçük, cihaz içi bir modelle rakam dizisini oku.
5. Model olasılığını gerçek doğrulama kümesiyle kalibre et; sonucu kesin değer veya öneri olarak ayır.
6. İsim ve adet onaylandıktan sonra ortak stok motoruna aktar; bütün reçete türlerini aynı veriyle hesapla.

## Veri kümesi

- Farklı Android/iOS cihazları, çözünürlükler, tarayıcı yakınlaştırmaları ve oyun arayüzü ölçekleri kapsanır.
- Ham fotoğraf yerine mümkün olduğunda yalnız adet etiketi kırpımı ve doğru sayı saklanır.
- Aynı ekran görüntüsünün kırpımları eğitim, doğrulama ve test kümelerine bölünmez; görüntü bazında ayrım yapılır.
- Her sürümde rakam dağılımı, tek/çift/üç basamak ve zor örnek oranı raporlanır.
- Kullanıcı düzeltmeleri açık izin olmadan eğitim verisine dönüşmez.

## Kalite kapıları

| Ölçüm | Yayın eşiği |
|---|---:|
| Etiket varlığı duyarlılığı | ≥ %99 |
| Kesin adet doğruluğu | ≥ %97 |
| Yanlış otomatik kabul | < %0,5 |
| Ölçülmüş cihaz/ölçek grupları | Her grupta ayrı rapor |

Eşikler önce gölge modda ölçülür: sistem öneri üretir, kullanıcı doğrulaması gerçek sonuç kabul edilir ve otomatik stok değişmez. Başarısız örnekler rakam, cihaz/ölçek ve hata türüne göre kümelenerek sonraki model sürümüne girdi olur.

## Aşamalar

- M68.1: Güvenli onay; yanlış adetlerin hesaplara sızmasını durdur.
- M69.1: Perspektif-normalize kırpım ve sürümlü etiket veri kümesi.
- M69.2: Oyun-özel rakam modeli ve kalibre güven puanı.
- M69.3: Gölge mod ölçümü ve cihaz/ölçek bazlı hata raporu.
- M70: Yalnız kalite kapıları karşılanırsa sınırlı otomatik kabul.
