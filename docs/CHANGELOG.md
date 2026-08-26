# Değişiklik Günlüğü

## 2026-08-26 — Özel Trafik Merkezi ve Reklam Hazırlığı

- Birinci taraf trafik ölçümü; sayfa görüntüleme, günlük tekil ziyaretçi, yönlendiren alan adı ve cihaz türünü toplulaştırılmış olarak kaydetmeye başladı.
- Ham IP veritabanına yazılmıyor; günlük ziyaretçi kimliği gizli anahtarla tek yönlü ve günle sınırlı üretiliyor. Botlar, yönetim ekranları ve tarayıcının izlememe isteği sayımdan çıkarılıyor.
- `/istatistik` ekranı yalnız site sahibine verilen erişim anahtarıyla açılıyor; ChatGPT hesabı gerektirmiyor, oturum HttpOnly çerezle korunuyor ve hatalı girişler hız sınırına tabi.
- 7, 30 ve 90 günlük görüntüleme/tekil ziyaretçi, günlük hareket, popüler sayfalar, kaynaklar ve cihazlar aynı özel panelde gösteriliyor.
- AdSense alanları, `ads.txt` ve izin katmanı hazırlandı; yayıncı kimlikleri eklenene kadar reklam veya izin penceresi ziyaretçiye gösterilmiyor.
- Gizlilik açıklaması eklendi ve ana site altbilgisine bağlandı.

## 2026-08-26 — Akıllı Arama ve Genel Yerleşim Düzeltmesi

- On üç modülün aynı anda göründüğü yatay çubuk kaldırıldı; Donanım, Yetenek, Görevler ve Eşyalar ana kısayol olarak bırakıldı.
- Kalan bölümler kısa açıklamalarıyla “Tümü” menüsünde toplandı; içerik veya işlev silinmedi.
- Başlığa her ekranda görünen arama kutusu ve masaüstünde `/` kısayolu eklendi; sonuçlar sekiz içerik türüne göre filtrelenebiliyor.
- Türkçe karakter farklarını tolere eden çok sözcüklü arama; modül, eşya, görev, yetenek, maden, bölge/boss ve tılsım kayıtlarını tarıyor.
- Sonuçlar yalnız sekmeye götürmüyor: eşyanın ayrıntısını, görev aramasını, yeteneğin sınıf/kartını, maden kaynağını, ilgili bölgeyi veya tılsım kaydını doğrudan hazırlıyor.
- Mobil ve masaüstünde gövde metni, butonlar, alanlar ve mikro etiketler için asgari okunabilir yazı ölçüsü yükseltildi.
- Genel `header` ve `nav` stilleri site kabuğuna sınırlandı; iç kart başlıklarının yapışkan başlık gibi davranıp metinleri üst üste bindirmesi engellendi.

## 2026-08-26 — Bağımsız Yetenek Simülatörü

- Build sekmesi Donanım olarak netleştirildi; yetenek puanı dağıtımı Tılsım bölümünden çıkarılıp hemen yanındaki bağımsız Yetenek sekmesine taşındı.
- Sınıf, 1–49 seviye, isteğe bağlı +5 hak, toplam/kalan puan ve seviye kilidi aynı çalışma alanında birleştirildi.
- Her yetenek için artı/eksi ve 0/5/10/15 hızlı eşikleri; seçilen puanda etkin sonuç, sonraki eşik ve oyun içi kanıt bağlantısı eklendi.
- KÖ savaşçısında Kanatma yerine Boz Ayı gösteriliyor; iki kayıt aynı puan yuvası gibi modellenmeye devam ediyor.
- Planı cihazda kaydetme, yükleme ve bağlantıyla paylaşma eklendi; seviye alanı tamamen silinip yeniden yazılabilir hâle getirildi.
- Tılsım ekranı; yetenek puanı dağıtmadığı, yalnız tılsım etkisi, kademe, edinme yolu ve hesaplanabilir önce/sonra sonucunu gösterdiği açıkça anlatılacak biçimde sadeleştirildi.

## 2026-08-26 — Ekonomi Döngü Atölyesi

- Çöp eşya, maden ve oyun parasını aynı tarifte tüketen sekiz tasarım önerisi eklendi.
- Hurdacı Fişi, Ham Alaşım ve Boyahane savaş gücü vermeyen ilk pilot paketi olarak öne çıkarıldı.
- Kostüm, boya, silah izi, iksir, şehir ıslahı ve haftalık hurda sözleşmeleri için girdi, çıktı, suistimal kilidi ve başarı ölçüsü tanımlandı.
- Katılımcı ve kişi başı harcama varsayımıyla haftalık/dört haftalık para çıkışı senaryosu eklendi; sonuç gerçek sunucu verisi olarak sunulmuyor.

## 2026-08-26 — Görev devam bulucu ve ekonomi gözlemleri

- Zincir görevler ve açıklamalı görev listesi temel alınarak katalog 83'ten 101 göreve çıkarıldı; Labirent hattındaki 21–22 seviye kayıtları kaynakla hizalandı.
- “Nereden devam edeceğim?” aracı eklendi: oyuncu son tamamladığı görevi seçtiğinde yalnız o görevin bağlantılı ön koşulları cihaz ilerlemesine işleniyor.
- Paylaşılan sohbetten telefon numarası ve kişisel ad yayımlanmadan ilerleme temposu, materyal talebi, tekel baskısı ve etkinlik ekonomisi gözlemleri çıkarıldı.
- Çözüm yaklaşımı salt zorluk artırmak yerine emek–ödül değeri, alt seviye materyaller için kalıcı tüketim, alternatif erişim ve ölçülebilir içerik ömrüne bağlandı.

## 2026-08-26 — Sorun ve Çözüm Masası

- Site bağlantıya sahip herkesin görüntüleyebileceği erişime açıldı; düzenleme ve yayımlama yetkisi sahibinde kaldı.
- Sekiz güncel oyuncu sorunu P0/P1/P2 ve konu başlıklarıyla sınıflandırıldı.
- Her kayda oyuncu etkisi, tekrar planı, teknik çıkarım, kısa/orta/uzun vadeli çözüm ve başarı ölçüsü eklendi.
- Grup bulma, ağ eşitleme ve sohbet denetimi önerileri ilgili resmî mühendislik belgelerine bağlandı; ölçülmemiş düşüş oranı kesin bilgi olarak yayımlanmadı.

## 2026-08-26 — Üç sınıfta 45/45 yetenek kapsamı

- Zihin Saldırısı oyun içi tooltip ayrıntıları ve kırpılmış kanıt görüntüsüyle eklendi.
- Büyücü yetenek kapsamı 15/15'e, üç sınıfın toplam kapsamı 45/45'e ulaştı.
- Oyuncu görüntüleri dekoratif ana görsel yerine, gerektiğinde açılan kaynak kanıtı olarak kullanılmaya devam ediyor.
- Sonraki çalışma “Sorun, şikâyet ve çözüm önerileri” modülü olarak yol haritasına alındı.

## 2026-08-26 — Savaşçı 15/15 ve büyücü 14/15

- Kullanıcı düzeltmesiyle KÖ'de Boz Ayı'nın Kanatma yuvasının karşılığı olduğu kesinleştirildi; Kanatma eksik listesinden çıkarıldı.
- Savaşçı kapsam hesabı 14 temel tooltip + 1 doğrulanmış yer değiştirme varyantıyla 15/15 olarak düzeltildi.
- On yeni büyücü yeteneği oyun içi tooltip ayrıntıları ve kırpılmış kanıt görüntüleriyle eklendi.
- Büyücü kapsamı 14/15'e ulaştı; yalnız Zihin Saldırısı görüntüsü bekleniyor.

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
