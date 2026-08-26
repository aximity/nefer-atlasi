# Değişiklik Günlüğü

## 2026-08-26 — Savaşçı 14/15 ve büyücü yetenekleri paket 1

- Zihin Toplama, Sarsılmaz, Süpürme Vuruşu, Hedef Saptırma ve Ağır Vuruş oyun içi tooltip ayrıntılarıyla eklendi.
- Meteorit, Konsantrasyon, Fiziksel Bilgi ve Buz Oku ile büyücü yetenek kapsamı 4/15 başladı.
- Tekrarlı Savaş Narası görüntüsü ikinci kaynak veya ikinci yetenek kaydı oluşturulmadan ayıklandı.
- Yetenek sözlüğü Savaşçı 14/15 + 1 varyant, Büyücü 4/15 ve Şifacı 15/15 kapsamını gösteriyor.

## 2026-08-26 — Savaşçı yetenekleri paket 1

- Dokuz temel savaşçı yeteneğinin oyun içi tooltip ayrıntıları ve kanıt görüntüleri eklendi.
- Boz Ayı, Kanatma'nın yerine geçen ve aynı puanları kullanan doğrulanmış varyant olarak modellendi.
- Yetenek sözlüğü sınıf seçicili hâle getirildi; Savaşçı 9/15 + 1 varyant, Şifacı 15/15 olarak gösteriliyor.
- Eksik altı temel savaşçı yeteneği, tahmin edilmeden görsel bekleme listesinde bırakıldı.

## 2026-08-26 — Şifacı yetenek kapsamı 15/15

- Element Direnç Alanı, Gazap, Çağrı, Can Kurtaran ve İyileştirme Çemberi oyun içi tooltip verileri eklendi.
- Beş yeni kayıt kırpılmış kanıt görüntüleri ve Kıyametin Öncüleri rehberiyle çapraz doğrulandı.
- Yetenek sözlüğü 15/15 tamamlandı; bekleme kutusu otomatik tamamlanma durumuna geçirildi.
- Site sahibine özel erişim kararı M25 doğrulama sürecinde korunacak şekilde yol haritasına işlendi.

## 2026-08-26 — Şifacı Yetenek Sözlüğü ve proje kalite omurgası

- On şifacı yeteneğinin oyun içi hedef, etki, süre, yenilenme ve puan eşikleri kaynak görüntüleriyle eklendi.
- Yetenek sekmesine mobil uyumlu, açılır ayrıntı kartları ve kaynak görüntüsü bağlantıları eklendi.
- Kalan beş şifacı yeteneği eksik veri gizlenmeden “sonraki görsel paketi” olarak işaretlendi.
- `AGENTS.md`, özellik/hata/kanıt şablonları ve görsel paket kararlarıyla mikro şartname tabanlı çalışma düzeni kuruldu.

## 2026-08-25 — Nefer Atlası, şeffaf kalite ve istemci pilotları

- Proje kapsamı eşya rehberinin ötesine geçtiği için marka “Nefer Atlası” olarak yenilendi; başlık, favicon ve sosyal paylaşım kartı güncellendi.
- Yetenek modeli 45 temel yetenek kuralına bağlandı. Boz Ayı, Kanatma'nın yerine geçen ve aynı puanı kullanan varyant olarak ayrıştırıldı.
- Yinelenen kanıt kimlikleri kaynak kimliğiyle ayrıldı; `server_guide` kaynak türü veri doğrulayıcısına eklendi.
- Gelişim sekmesinde kanıt, özellik, elde etme, medya, bütünlük ve güncellikten otomatik hesaplanan proje puan kartı açıldı.
- Savaşçı, Büyücü ve Şifacı için üç yeteneklik medya pilotu kuruldu; gerçek klip gelene kadar dosyasız bekleme durumu zorunlu kılındı.
- Endgame → Sorunlar → İstemci altında yeni paket göndermeyen, 30 saniyelik yerel özet ve güven seviyeli kopma makbuzu öneren Bağlantı Merkezi tasarlandı.
- Yetenek rehberi görselleri Next Image ile responsive hâle getirildi; lint uyarıları temizlendi.

## 2026-08-23 — M4.1 doğruluk ve güvenlik

- Türkçe karakterleri kayıpsız taşıyan sürümlü Base64URL build bağlantıları eklendi.
- URL ve cihaz kayıtları sınıf, eşya, hedef, bağlam, tılsım ve puan sınırlarına göre doğrulanıyor.
- Gazap 2 yalnız Gazap yeteneğinden gelen taban kritik ihtimalini çarpıyor; ekipman kritiğini değiştirmiyor.
- Lint, TypeScript ve üretim derleme komutları Windows ve Unix ortamlarında çalışacak hale getirildi.
- M3 tılsım seçimi Savaşçı, Büyücü ve Şifacı için sınıfa özel hale getirildi; ilk doğrudan hesaplanabilir seriler resmî tablolardan eklendi.
- Katalogda sınıf/yuva filtreleri, aynı sınıf ve yuvadaki iki eşyayı özellik bazında karşılaştırma ve buildin yalnız eksik yuvalarını tamamlama araçları eklendi.
- İşlev üretmeyen genel yetenek kaydırıcıları kaldırıldı; M3 önce/sonra tılsım etki raporuna, M4 ise hazır/dikkat/eksik saha kontrol listesine dönüştürüldü.

## 2026-08-22

- Sekiz ekipman yuvalı build şeması kuruldu.
- Ana/hibrit hedef, mod, bölge, rakip ve tılsım seçimleri eklendi.
- Gazap 1/2 kademeleri hesap modeline eklendi.
- Doğrulanmamış görseller kaldırıldı.
- Türkçe karakter bozulmaları giderildi.
- Kaynak ve veri çelişkisi görünümü eklendi.
- Proje işletim sistemi ve ikinci beyin belgeleri başlatıldı.
- M1 veri sözleşmesi için kaynak, reçete, çelişki ve çapraz doğrulama testleri eklendi.
- Sunucu çıktısı testi M1 kanıtlı veri görünümüne güncellendi.
- Seviye, nadirlik ve görünüş ailesi alanları resmi/topluluk kaynaklarına bağlandı.
- M1 çıkış kapısı tüm yayımlanan eşya alanlarını kapsayacak biçimde doğrulayıcıya eklendi.
- Her yuva için sınıf uyumlu bağımsız eşya seçimi, hedef önerisi ve build puanlaması eklendi.
- URL paylaşımı ile cihazda build kaydetme/yükleme eklendi.
- Gazap tabanı, tılsım çarpanı ve 15 puanlık yetenek dağılımı ayrıştırıldı.
- Çemberlitaş bölge/boss bağlamı, rakip direnç çıkarımı ve teorik kombinasyon sayacı eklendi.
- Üç sınıfın 11 Çemberlitaş set ailesi 67 eşya kaydıyla tamamlandı.
- Savaşçı ve Şifacı için Zırh, Büyücü için Amplifikatör yuvası eklendi.
- Büyücü fiziksel, Savaşçı ateş, Şifacı iyileştirme/asit/zehir hedefleri gerçek setlerle dolduruldu.
