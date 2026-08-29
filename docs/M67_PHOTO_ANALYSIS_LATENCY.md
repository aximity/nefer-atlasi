# Hata kaydı — Fotoğraf analizinde uzun duraklama

## Beklenen davranış

Fotoğraf analizinin hangi aşamada olduğu görünür olmalı; işlem telefonu uzun süre kilitlememeli ve kesin bir süre sınırında güvenli biçimde sonlanmalıdır. Düşük güvenli ama makul ikon adayları kaybolmak yerine açık isim onayı istemelidir.

## Gerçek davranış

İkon kataloğu her denemede yeniden hazırlanıyor, hücre–ikon karşılaştırmaları tek uzun ana iş parçacığında çalışıyor ve zaman aşımı bulunmuyordu. Kullanıcı yalnız “Çanta analiz ediliyor” metnini gördüğü için işlem takılmış gibi görünüyordu. Güven eşiğinin hemen altındaki adaylar onay ekranına hiç ulaşmıyordu.

## Tekrar adımları

1. Üretim Takip Masası'nda telefondan bir çanta görseli seç.
2. Otomatik analizin başlamasını bekle.
3. Aşama veya süre değişmeden uzun bekleme yaşandığını gözle.

## Ortam

- Cihaz / ekran genişliği: Android telefon / 360 px ve üstü
- Tarayıcı: Mobil Chrome
- Girilen değer: KÖ çanta veya banka ekran görüntüsü

## Kök neden

Referans ikon imzalarının yeniden hesaplanması, yoğun karşılaştırma döngüsünün tarayıcıya çizim fırsatı vermemesi ve iptal/zaman aşımı sinyali olmaması.

## Tekrarını önleyen test

- Düşük güvenli fakat makul aday `review`, güçlü aday `accept`, zayıf aday `reject` olarak sınıflandırılır.
- Tam davranış, veri doğrulama, birim testleri ve yayın derlemesiyle denetlenir.

## Kabul koşulları

- [x] Analiz aşaması, yüzde ve geçen saniye görünür.
- [x] İşlem 18 saniyede güvenli biçimde durur ve tekrar deneme sunar.
- [x] Uzun karşılaştırma döngüsü satırlar arasında tarayıcıya kontrol verir.
- [x] Referans ikon imzaları sonraki analizler için cihaz belleğinde önbelleğe alınır.
- [x] Düşük güvenli aday kullanıcı isim onayı vermeden stoka işlenemez.
- [x] Boş adet ve 360 px mobil dokunma akışı korunur.

