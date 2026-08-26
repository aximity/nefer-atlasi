# Nefer Atlası çalışma kuralları

Bu depo için önce `docs/PROJECT_OS.md`, ardından aktif işin bağlı olduğu `ROADMAP.md`, `DATA_QUALITY.md` ve `DECISIONS.md` kayıtlarını oku.

## Değişiklik kapısı

- Her iş için amaç, kapsam dışı alanlar ve ölçülebilir kabul koşulları belirle.
- Oyun verisini yorumdan ayır. Kaynaksız sayı, düşüş, eşya, görev veya yetenek etkisi yayımlama.
- Tek kaynaklı bilgiyi “doğrulandı” diye etiketleme. Çapraz doğrulama için bağımsız kaynak grupları kullan.
- Kullanıcı ekran görüntüsünü kaynak kaydına, tarihe ve ilgili veri kimliğine bağla.
- Belirsiz görüntü metnini tahmin etme; çelişki veya eksik olarak kaydet.
- Ortak HTML etiketlerine geniş kapsamlı stil verme; sayfa ve bileşen sınıflarını hedefle.
- Mobilde uzun Türkçe metin, boş giriş, 360 px ekran ve dokunma alanlarını kabul koşullarına ekle.
- Veri değişikliğinde `npm run validate:data`, davranış değişikliğinde ilgili otomatik testleri çalıştır.
- Kullanıcı çalışmasını silen geri alma komutları kullanma. Küçük değişiklik ve açık geri dönüş noktaları oluştur.
- Tamamlanan işte `CHANGELOG.md`; kalıcı karar değiştiyse `DECISIONS.md`; yeni kanıtta `RESEARCH_LOG.md` güncellenir.

## Şablonlar

- Özellik: `docs/templates/FEATURE_SPEC.md`
- Hata: `docs/templates/BUG_REPORT.md`
- Oyun verisi: `docs/templates/DATA_EVIDENCE.md`

Tekrarlanan bir süreç ancak en az üç doğrulanmış kullanım sonrasında bağımsız bir skill adayı olur.
