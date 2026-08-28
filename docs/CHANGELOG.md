# Değişiklik Günlüğü

# v0.50.0 — Kesin Efsun Eşleşmeleri

- Sığınaklar ve Migrat ganimetlerindeki 45 özellik açığı, doğrulanmış efsun sözlüğüne karşı yeniden denetlendi.
- Eşya adında birebir bulunan Cansiperhane, Bilge Kağan Modeli, Azat Efendi İcadı, Yücelen Ekolü, Farabi Modeli ve Solucan Modeli değerleri sekiz eşyaya bağlandı.
- Üç sınıfın Maraton/Cansiperhane ayakkabıları 10.000 Kritik Zırhı; Bilge Kağan asası 93.000 Buz Büyü Hasarı; Azat pantolonu 93.000 Elektrik Büyü Hasarı ile hesaplanabilir oldu.
- Farabi/Solucan ve Yücelen/Solucan pantolonlarının iki ayrı efsunu iki özellik satırı olarak korundu.
- Açık özellikli grup eşyası sayısı 45'ten 37'ye düştü; Fevzi Bey Modeli/İcadı ve Tarshass/Tarsharss gibi yakın ama birebir olmayan adlar tahminle eşleştirilmedi.

# v0.49.0 — Çemberlitaş Hesap Güvenliği

- Yanlış hesaplama riski taşıyan 11 çelişkili Çemberlitaş özellik kaydı kaynak satırlarıyla yeniden denetlendi; açık çelişki sayısı sıfıra indi.
- Aynı eşyada iki ayrı satır olarak bulunan özellikler hesap için tek toplamda birleştirildi: 2×150.000 hasar, 2×224.000 iyileştirme, 2×383.000 iyileştirme ve 2×477.000 enerji.
- Kıyafet ve amplifikatörlerde bulunmadığı hâlde eklenmiş dokuz Maksimum Kudret satırı ile Taş Kanat Ceket'teki yanlış Savunma satırı kaldırıldı.
- Kıyamet, Sıfır Kelvin, Transformatör ve Cehennem ceket/amplifikatörleri 300.000 ilgili büyü hasarı; Mevlana Ceket 448.000 iyileştirme; Mevlana Asa 766.000 iyileştirme; Taş Kanat Ceket 954.000 enerjiyle hesaplanıyor.
- Otomatik veri testi çözülen toplamları, kaldırılan yanlış satırları ve açık çelişki sayısını yayın kapısında denetliyor.

# v0.48.0 — Tılsım Edinimi ve Fotoğraf Önerisi

- Gönül kaydı veya KÖ oyuncu bildirimiyle adı ve rengi eşleşen 10 benzersiz I. kademe tılsım girdisi, reçete uydurulmadan hazır edinim kaynağına bağlandı.
- Oyuncu bilgisine dayanan edinimler üretim planı ve Bağlantılı Atlas'ta NPC, bölge, fiyat durumu ve gereken görsel kanıtla gösteriliyor.
- Açık malzeme kaynağı sayısı 78'den 68'e indi; kanıtsız kalan 43 I. kademe tılsım ve 25 temel malzeme tahminsiz açık kayıt olarak korundu.
- Fotoğraf panelindeki ikon/adet taslağı, stoku değiştirmeden önce en yakın üretimi veya yeni üretilebilir reçete sayısını gösteriyor.
- Fotoğraf otomatik stok değiştirmiyor; görüntü cihazda, son onay kullanıcıda kalıyor.

# v0.47.0 — Site İçi Reçete ve Kaynak Akışı

- Üretim kartlarındaki reçete eylemleri dış Wiki sayfası yerine Nefer Atlası'nın eşya, tılsım veya iksir reçetesini açıyor.
- Tılsım kartından tılsım bilgisine ve tılsım ekranından ilgili reçeteye giden bağlantılar tam sayfa iç geçişe dönüştürülerek çalışmayan durum giderildi.
- İKV Wiki ve oyun içi kanıt bağlantıları; eşya, tılsım, iksir, materyal, görev ve yetenek kategorileriyle `/kaynaklar` sayfasında toplandı.
- Reçete ekranındaki dış kaynak düğmeleri kaldırıldı; kaynak dizinine tek, sade geçiş bırakıldı.
- Fotoğraf girişi “Galeriden seç” ve “Şimdi fotoğraf çek” olarak iki ayrı eyleme bölündü.
- Fotoğraf yardımcı alanındaki ikon araması ve adet girişini görünmez yapan geniş dosya-input stili sınırlandırıldı.
- Reçeteler sabit olduğu için haftalık tılsım reçetesi değişiklik takibi kapatıldı.

# v0.46.0 — Ortak Üretim ve Görsel Ağı

- 67 eşya, 120 tılsım, 246 iksir ve 9 ara malzeme reçetesi tek üretim kataloğunda birleştirildi; stok ve kullanım hesapları toplam 442 reçeteyi okuyor.
- Wiki reçete görünümündeki 48 doğrulanmış malzeme ikonu reçete kartlarına, stok satırlarına, maden çıktılarına ve üretim eksiklerine eklendi.
- Fotoğraflı stok girişi, yüklenen çanta görselinin yanında ikon arama ve dokunarak taslak oluşturma akışına dönüştürüldü; görüntü cihazda kalıyor ve stok otomatik değiştirilmeden kullanıcı onayı bekleniyor.
- Maden üretim ağı yalnız şaheserleri saymak yerine eşya, tılsım, iksir ve ara malzeme kullanımlarını aynı kartta gösteriyor.
- Bağlantılı Atlas, ara malzemeleri “kaynak yok” saymak yerine meslek/seviye reçetesiyle açıklıyor ve eşya dışındaki üretim hedeflerine çalışan bağlantı veriyor.
- Üst kademe tılsımlarda girdi olan 106 önceki kademe kaydının üretilebilir 53'ü kendi reçetesine bağlandı; edinme yolu doğrulanmayan 53 birinci kademe tılsım açık bırakıldı.
- Karbon için güvenilir ikon veya edinme kaynağı bulunmadığından görsel ve kaynak tahmini yapılmadı.

# v0.45.0 — Ara Malzeme Zinciri

- İksirlerde geçen dokuz üretilen ara malzeme meslek, seviye ve alt girdileriyle kaynak sistemine bağlandı.
- Ara malzemeler üretim takip ekranında bağımsız hedef olarak aranabilir ve favorilenebilir hâle geldi.
- Eksik ara malzeme açıldığında gerekli temel maden/bitkiler doğrudan gösteriliyor.
- “Açık Pempe Ametist” yazım hatası “Açık Pembe Ametist” olarak düzeltildi ve eşleşmeyen kaynak kaydı onarıldı.
- 49 benzersiz iksir girdisinin 48'i kaynaklıdır; doğrulanmış edinme/üretim kaydı bulunamayan Karbon için tahmin üretilmedi.
- İki tılsım ve üç iksir ortak görsel ailesi, eşya görsellerinden ayrı ve yüksek öncelikli tamamlama işleri olarak görünür hâle getirildi.

## 2026-08-27 — Yenilikler düğmesi ve hızlı tanıtım

- Ekranın köşesine okunmamış sürümü “Yeni” işaretiyle belirten kalıcı Yenilikler düğmesi eklendi.
- Güncel değişiklikler ile önceki önemli sürümler aynı açılır panelde kronolojik olarak gösteriliyor.
- İlk ziyarette arama, karar verme ve planlama akışını üç kısa adımda anlatan engellemesiz tanıtım eklendi.
- Tanıtım kapatıldıktan sonra kendiliğinden tekrar açılmıyor; Yenilikler panelinden istenirse yeniden gösterilebiliyor.
- Detaylı kullanım rehberi korunurken temel işlevleri anlamak için ayrı sayfa açma zorunluluğu kaldırıldı.

## 2026-08-27 — Üretim takip masası ve sürdürülebilirlik merkezi

- Saha Operasyonu'na cihazda saklanan stok, favori reçete, hedef adet, fotoğraf referansı ve üretici/sorumlu takibi eklendi.
- Reçete motoru eldeki malzemelerle üretilebilenleri, hedefe göre eksik miktarları ve stoktan çıkabilecek adedi hesaplıyor.
- Kaynağı eşleşen eksikler bölge, meslek veya yaratıkla açıklanıyor; eşleşmeyen malzemelerde tahmin yürütülmüyor.
- Ana gezinmeye Sürdürülebilirlik sekmesi eklendi; ekonomi, etkinlik önerileri, maden/para döngüsü ve kaynak→İKV uyarlaması tek çalışma alanında birleştirildi.
- Etkinlik fikirleri resmî duyuru gibi gösterilmiyor; tarihsiz öneri ile doğrulanmış takvim kaydı açıkça ayrılıyor.
- Yeni Fandom ekran görüntüsünden yalnız Bıçak Sırtı karakter görseli referans alındı; sayfadaki metin ve diğer bilgiler içeri aktarılmadı.

## 2026-08-27 — Wiki set görünüşleri ve görsel edinim kuyruğu

- Bıçak Sırtı set renderı, paylaşılan Fandom sayfa görüntüsünden kaynaklanan bir “set görünüş referansı” olarak eklendi.
- Aynı set renderı altı farklı Bıçak Sırtı parçasında kullanılabilse de doğrulanmış tekil eşya görseli sayacına eklenmedi.
- Kart, ayrıntı paneli ve Bağlantılı Atlas üzerinde tekil parça kanıtı ile set referansı açık etiketlerle ayrıldı.
- Savaşçı, Büyücü ve Şifacı için 11 görünüş ailesi ve 67 Çemberlitaş eşyasını kapsayan görsel edinim kuyruğu kuruldu.
- Özgün Wiki dosya sayfası, başlık eşleşmesi ve kullanım lisansı doğrulanmayan görseller yayımdan uzak tutuldu.

## 2026-08-27 — Görsel kalite ve kanıt kırpımları

- Dokuz bölge dizilimi görselinin kart içi odak noktası ayrı ayrı ayarlandı; ekran dışındaki tavan, çerçeve ve görev çubuğu kart önizlemelerinde geri plana alındı.
- Kart önizlemelerine premium iç çerçeve, kontrollü kontrast, vignette ve açık “kaynak kırpımı” etiketi eklendi.
- Tam kaynak fotoğrafı modal içinde değişmeden korunarak kanıt ile sunum kırpımı birbirinden ayrıldı.
- Alternatör Kolye görseli eşya adı, simgesi ve özellik tooltipi korunarak kişisel karakter ekranının gereksiz bölümlerinden kırpıldı ve WebP olarak küçültüldü.
- İnternet taramasında bulunan resmî konsept ve set görselleri bağlamsal olarak yararlı olsa da eşya adı + görünüş kapısını geçmediği için tekil eşya kayıtlarına bağlanmadı.

## 2026-08-26 — Görev geçmişi ve masaüstü okunabilirlik

- Görev ayrıntısındaki gerçek zorunlu ön koşullar ile daha düşük seviyede kaçırılmış olabilecek görevler birbirinden ayrıldı.
- Meteor Yolu gibi bağımsız başlayan görevlerde sahte bir zincir kurulmadan, yakın önceki seviye görevlerine NPC ve konum bilgisiyle erişim eklendi.
- Teşkilat İstihbarat'a Katılış konumu “Eminönü · Teşkilat karargâhı” olarak düzeltildi.
- Mobil ölçüler korunurken masaüstü metin, form, buton ve yardımcı yazıları bir kademe büyütüldü.
- Koyu lacivert ve altın tema korunarak başlık ve arayüz fontları daha rafine sistem yazı ailelerine geçirildi.

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
# v0.41.2 — İksir Kaynak Kuralı

- İKV Wiki İksir Reçeteleri sayfası ana oyun referansı olarak tanımlandı.
- İksir sekmesindeki çapraz teyit bekleme dili kaldırıldı.
- Mevcut iksir/malzeme dizini korunurken aktarılmamış adetlerin tam reçete gibi gösterilmesi engellendi.
# v0.42.0 — Wiki Ana Kaynak Sistemi

- İKV Wiki tüm oyun verileri için genel birincil kaynak yapıldı.
- Projedeki 22 Wiki kaydı aynı güven politikasına bağlandı.
- Eşya, Atlas, maden–reçete ve kullanım rehberi etiketleri güncellendi.
- Wiki dışı oyuncu/pazar/KÖ canlı verileri ve görsel lisansı ayrı tutuldu.
# v0.43.0 — Tam İksir Üretimi

- İlk 79 iksir reçetesi seviye, tür, malzeme ve adetleriyle yapılandırıldı.
- İksir dizini gerçek açılır reçete kartlarına dönüştürüldü.
- İksir favorileri üretim takibi ve stok hesabına bağlandı.
- Can, kudret ve destek görsel aileleri korundu.

# v0.44.0 — Eksiksiz İksir Atlası

- Wiki'den derlenen 28 kategorideki 246 reçetenin tamamı üretim modeline alındı.
- Önceki aktarımda atlanan üçüncü ve sonraki malzeme satırları tamamlandı.
- Doğrudan hasar, büyü hasarı ve direnç serilerinin düşük seviyeleri eklendi.
- Malzeme dizini 49 benzersiz malzemeyi tam reçete kümesinden otomatik üretir hâle getirildi.
- İksir favorileri üretim ekranında ayrı ve kaldırılabilir hedef listesine bağlandı.
