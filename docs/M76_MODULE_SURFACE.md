# M76 — Bağımsız Modül Sahnesi

## Amaç

Ana sayfayı on beş çalışma yüzeyinin kurulum ayrıntılarından ayırmak ve bütün modül eşlemesini tek, test edilebilir bir sahnede toplamak.

## Kapsam

- Bilgi, araç ve proje gruplarındaki on beş modülün render eşlemesi
- Modüllere özel kayıt odağı, yenileme anahtarı ve karakter bağlamı
- Bölge ganimeti üzerinden açılan eşya ayrıntı penceresi
- Ana koordinatörün 90 satır altı mimari sınırı

## Kapsam dışı

- Modül içi tasarım veya veri değişiklikleri
- Yeni oyun verisi, rota ya da kullanıcı özelliği
- Mevcut koyu/altın görsel sistemin değiştirilmesi

## Kabul koşulları

- `page.tsx` hiçbir çalışma yüzeyini doğrudan import etmez.
- On beş modül kimliği sahnede birer kez eşlenir.
- Derin bağlantı girdileri ve eşya ayrıntı kapanışı korunur.
- Veri doğrulama, davranış testleri, render testleri, üretim derlemesi ve lint geçer.
