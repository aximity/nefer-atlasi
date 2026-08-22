# İKV Rehberi — Proje İşletim Sistemi

Bu klasör projenin ikinci beynidir. Kod ne yaptığımızı, bu belgeler neden yaptığımızı ve sırada ne olduğunu kaydeder.

## Her oturumun çalışma döngüsü

1. `ROADMAP.md` içinden tek bir aktif çıktı seç.
2. İlgili iddia için kaynak bul; önce resmi kaynak, sonra bağımsız topluluk arşivi.
3. Bulguyu `RESEARCH_LOG.md` içine kaynak, tarih ve güven seviyesiyle yaz.
4. Çelişki varsa veri ekleme; `DATA_QUALITY.md` kuyruğuna taşı.
5. Uygula; kod ve veri değişikliklerini birbirinden ayır.
6. Derleme, ürün testi ve mobil/masaüstü kontrolünü tamamla.
7. `CHANGELOG.md` ve gerekiyorsa `DECISIONS.md` kaydını güncelle.

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

## Haftalık ritim

- Araştırma: kanıt toplama ve çelişki çözme
- Veri: normalize etme ve kaynak bağlama
- Ürün: tek dikey özellik dilimi
- Kalite: responsive, erişilebilirlik, hesap doğruluğu
- Kapanış: kayıtları güncelleme ve sonraki tek hedefi seçme
