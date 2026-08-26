# Nefer Atlası — Proje İşletim Sistemi

Bu klasör projenin ikinci beynidir. Kod ne yaptığımızı, bu belgeler neden yaptığımızı ve sırada ne olduğunu kaydeder.

## Her oturumun çalışma döngüsü

1. `ROADMAP.md` içinden tek bir aktif çıktı seç.
2. Uygun şablonla oyuncu ihtiyacını, kapsamı ve kabul koşullarını yaz.
3. İlgili iddia için kaynak bul; önce resmi kaynak, sonra bağımsız topluluk arşivi.
4. Bulguyu `RESEARCH_LOG.md` içine kaynak, tarih ve güven seviyesiyle yaz.
5. Çelişki varsa veri ekleme; `DATA_QUALITY.md` kuyruğuna taşı.
6. Uygula; kod ve veri değişikliklerini birbirinden ayır.
7. Otomatik test, veri doğrulama ve gerekli mobil/masaüstü kabul koşullarını tamamla.
8. `CHANGELOG.md` ve gerekiyorsa `DECISIONS.md` kaydını güncelle.

## Tek doğruluk kaynakları

- Ürün sırası: `ROADMAP.md`
- Araştırma kanıtı: `RESEARCH_LOG.md`
- Mimari/ürün kararları: `DECISIONS.md`
- Eksik ve çelişkili veri: `DATA_QUALITY.md`
- Tamamlanan işler: `CHANGELOG.md`

## Disiplin kuralları

- Aynı anda yalnız bir kilometre taşı “Aktif” olabilir.
- Kaynaksız eşya, oran, başarı istatistiği veya görsel yayımlanmaz.
- Tek kaynak “doğrulandı” değil, “tek kaynak” durumudur.
- Görsel, eşya adıyla aynı kanıtta görülmeden eşya kaydına bağlanmaz.
- Kullanım ve başarı sıralaması yalnız gerçek olay verisiyle açılır.
- Her tamamlandı iddiası yeni doğrulama çıktısına dayanır.
- Bir süreç ancak en az üç başarılı ve tekrarlanabilir kullanımdan sonra skill adayıdır.

## Haftalık ritim

- Araştırma: kanıt toplama ve çelişki çözme
- Veri: normalize etme ve kaynak bağlama
- Ürün: tek dikey özellik dilimi
- Kalite: responsive, erişilebilirlik, hesap doğruluğu
- Kapanış: kayıtları güncelleme ve sonraki tek hedefi seçme
