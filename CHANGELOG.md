# Changelog

Bu dosya yalnız mevcut Git geçmişi veya çalışma ağacındaki gerçek değişikliklerle doğrulanabilen kayıtları içerir.

## [Unreleased]

- Canonical stat sayılarını değiştirmeyen merkezi storage-scale/formatlama sözleşmesi eklendi; uyumsuz veya bilinmeyen scale toplamları build ve tılsım akışında güvenli biçimde bloke edildi. Exact stat dönüşüm formülleri tamamlanmış kabul edilmedi.
- Stat scale sözleşmesi validator'a ve gerçek davranış testlerine bağlandı; kullanıcı arayüzü kanıtlanmamış dönüşümlerde teknik scale adı veya tahmini birim göstermiyor.
- Recovery Manifest v1, 30 tarihsel kayıt ve sıfır `RECOVERED` maddeyle oluşturuldu; bu kayıtlar mevcut ürün özelliği kabul edilmedi.
- Recovery statü modeli, kanıt sınıflandırması, önceliklendirme, uygulama sırası ve `RECOVERED` kalite kapıları belgelendi.
- Project State ve Next Steps, `068af74` code baseline sonrası recovery phase için güncellendi.
- `068af74` commit'i code baseline olarak kabul edildi; ürün kaynak snapshot'ı `903f097` olarak kaydedildi.
- Temiz dependency kurulumu, veri doğrulama, lint, 25 unit test, production build ve 1 rendered-HTML testi çalıştırıldı.
- Proje hafızası için `AGENTS.md`, `PROJECT_STATE.md`, `CHANGELOG.md` ve `NEXT_STEPS.md` eklendi.
- Yerelde bulunmayan eski ChatGPT özellikleri recovery backlog olarak ayrıldı.

## 2026-08-24

- `903f097` — Cemberlitas ganimetlerini grup bolgelerine ekle.
- `b9d2a60` — Grup bolgeleri ganimet sekmesini ekle.

## 2026-08-23

- `dc4746c` — Tılsım kataloğunu tüm sınıf ve kademelerle tamamla.
- `3854f39` — Kaynaklı grup bölgesi yüzük hesaplamalarını ekle.
- `554e320` — Oyuncuya dönük arayüz terminolojisini yerelleştir.
- `19e0dec` — Üç bölge için üç sınıf ganimet kapsamını tamamla.
- `b185072` — Kaynaklı takı ve gözlük kataloğunu ekle.
- `77c4b9f` — Efsun kademelerini ve yetenek kataloğunu genişlet.
- `72d3731` — Kaynaklı efsun resolver'ını ekle.
- `761e2da` — Doğrulanmış aksesuar ve yetenek simülatörünü ekle.
- `d2ea595` — Placeholder planlamayı eyleme dönük raporlarla değiştir.
- `3916501` — Eşya karşılaştırma ve akıllı filtreleri ekle.
- `3d7c57e` — Sınıfa özel tılsım motorunu ekle.
- `85865b8` — Build paylaşımı ve Gazap hesaplarını sağlamlaştır.

## 2026-08-22

- `7de87ca` — Tüm sınıf ekipman ailelerini tamamla.
- `75977ce` — Doğrulanmış build planlayıcıyı M4'e kadar tamamla.
- `f1a8aeb` — Doğrulanmış M1 eşya veri çekirdeğini ekle.
- `d65f3ba` — Proje işletim sistemi ve araştırma kaydını ekle.
- `89217c6` — Doğrulanmış İKV ekipman planlayıcısını oluştur.
- `0ae7653` — Gerçek ekipman yuvaları ve klan gözlüğü katmanını ekle.
- `d331675` — Build rota sayacı ve hibrit build altyapısını ekle.
- `833cec7` — Build oluşturucu ve çift katmanlı renk sistemini ekle.
- `7a8077c` — İKV efsun ve şaheser renk sistemini ekle.
- `59d6508` — Eşya bazlı doğrulanmış görsel kuralını ekle.
- `74f68b5` — Görselleri ve eşya kataloğunu genişlet.
- `9d7485e` — Responsive arayüz tasarımını ekle.
- `c6a43ee` — Mobil görsel taşmasını düzelt.
- `a1a2150` — Gerçek Çemberlitaş eşya verilerini ekle.
- `fc8bb78` — Sosyal paylaşım kartını ekle.
- `50420ec` — İlk eşya rehberi prototipini oluştur.
