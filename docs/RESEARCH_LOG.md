# Araştırma Günlüğü

## 2026-08-27 — Üretim planı, sürdürülebilirlik ve görsel kapsam sınırı

- Reçete planlayıcısı mevcut 67 reçete kaydını ve kullanıcı tarafından elle onaylanan stok miktarlarını kullanır; fotoğraf yalnız cihaz içi görsel referanstır, otomatik okuma yapılmaz.
- Malzeme edinme açıklaması yalnız mevcut toplayıcılık kataloğu ve kaynaklı yaratık düşümü eşleşmelerinden gelir. Eşleşme yoksa konum tahmini üretilmez.
- Ekonomi önerilerinde Albion alt seviye eşya tüketimi, EVE ekonomi ölçümü ve İKV meslek/iksir yapısı kaynak→uyarlama→koruma sınırı olarak ayrı sütunlarda tutuldu.
- Etkinlik takvimi fikirleri ilan edilmiş sunucu etkinliği değildir; tarih ve yetkili duyuru kaynağı doğrulanmadan takvim gerçeği olarak yayımlanmaz.
- Kullanıcının yeni Fandom/Google görsel görüntüsünden yalnız Bıçak Sırtı set renderı kullanıldı. Fandom sayfasındaki metin, istatistik, reklam veya başka içerik veri setine alınmadı.

## 2026-08-27 — İnternet görsel taraması ve kalite kapısı

- Resmî İKV Çemberlitaş konsept/karakter görselleri ile topluluk eşya rehberi görselleri tarandı.
- Resmî görseller bölge atmosferini ve zırh ailelerini gösteriyor; ancak tekil eşya adı ile görünüş aynı karede bulunmadığı için `data/images.json` kayıtlarına eklenmedi.
- Arama sonuçlarında aynı adlı fakat İKV ile ilgisiz gerçek dünya ürünleri görüldü; hiçbirisi veri setine alınmadı.
- Mevcut Alternatör Kolye oyuncu görüntüsü ad + simge + tooltip kapısını geçti. Kaynak dosya korunarak kamuya açık sunum için kişisel ekran alanlarını dışlayan türetilmiş WebP kırpımı oluşturuldu.
- Dokuz dizilim görselinde metin veya piksel üretilmedi; kart odağı CSS ile belge içeriğine taşındı, modal tam kaynağı göstermeye devam ediyor.

## 2026-08-26 — Sorun ve çözüm dayanakları

- Oyuncu bildirimi: Maden tükendi hatası, grup bölgesi gecikmesi ve bağlantı hatası, ölen yaratığın ayakta kalması, sohbet kirliliği, grup bulamama, tank/şifacı açığı ve grup bölgesi masraf–ödül dengesizliği.
- Sınır: Bunlar tarihli oyuncu gözlemidir; sunucu günlüğü veya tekrar ölçümü olmadan doğrulanmış kök neden ya da ölçülmüş düşüş oranı değildir.
- PlayFab Matchmaking kuyrukları bilet, oyuncu özelliği, takım büyüklüğü ve zamanla gevşetilebilen kuralları açıklar; rol ve bekleme tabanlı grup bulma önerisine dayanak olur: https://learn.microsoft.com/en-us/xbox/playfab/multiplayer/matchmaking/
- Unreal Engine ağ fiziği belgesi sunucu otoriteli durumun istemciye ulaştırılması ve gecikme sonrası uzlaştırma yaklaşımını açıklar; eski maden görünümü ve hayalet yaratık için teknik örnektir: https://dev.epicgames.com/documentation/en-us/unreal-engine/networked-physics-overview
- Discord AutoMod spam filtresi ve otomatik mesaj engelleme yanıtlarını açıklar; sohbet tekrar filtresi, hız sınırı ve açıklayıcı geri bildirim önerisine dayanak olur: https://discord.com/safety/auto-moderation-in-discord
- VALORANT ağ kararlılığı açıklaması istemci, ağ ve sunucu belirtilerinin ayrıştırılmasına; Bungie hata kodları kopmanın kullanıcıya sınıflandırılmış bir nedenle bildirilmesine örnektir.
- Karar: Dış oyunlardaki yöntemler doğrudan kopyalanmaz; KÖ’de küçük, geri alınabilir pilot ve tanımlı başarı metriği olmadan kalıcılaştırılmaz.

## 2026-08-26 — Savaşçı paket 2 ve büyücü paket 1

- Kaynak: Kullanıcı tarafından sağlanan 10 gerçek oyun içi ekran görüntüsü.
- Tekrar denetimi: İlk görüntü daha önce işlenen Savaş Narası ile aynı tooltipi gösterdiği için yeni kayıt veya kaynak kimliği oluşturulmadı.
- Savaşçı kapsamı: Zihin Toplama, Sarsılmaz, Süpürme Vuruşu, Hedef Saptırma ve Ağır Vuruş; toplam temel kapsam 14/15'e ulaştı.
- Büyücü kapsamı: Meteorit, Konsantrasyon, Fiziksel Bilgi ve Buz Oku; toplam temel kapsam 4/15 oldu.
- İşlem: Hedef, etki, süre, yenilenme ve puan eşikleri yapılandırıldı; dokuz benzersiz kırpılmış görüntü ilgili kayıtlara bağlandı.
- Doğrulama: Yetenek adları ve açılma seviyeleri Kıyametin Öncüleri rehberiyle karşılaştırıldı; oyun içi görüntü ve rehber iki bağımsız kaynak grubu olarak tutuldu.
- Açık kapsam: Savaşçıda Kanatma; büyücüde kalan on bir temel yetenek.

## 2026-08-26 — Savaşçı yetenekleri oyun içi tooltip paketi 1

- Kaynak: Kullanıcı tarafından sağlanan 10 gerçek oyun içi ekran görüntüsü.
- Temel yetenek kapsamı: Depar, Ofansif Dövüş, Sert Vuruş, Defansif Dövüşme, Kışkırtma, Dikkat Dağıtma, Durdurma, Sakınma ve Savaş Narası.
- Varyant kapsamı: Boz Ayı; Kanatma'nın yerine geçer ve aynı yetenek puanlarını kullanır.
- İşlem: Hedef, etki, süre, yenilenme ve puan eşikleri yapılandırıldı; kırpılmış görüntüler her kayda bağlandı.
- Doğrulama: Temel yetenekler Kıyametin Öncüleri rehberiyle, Boz Ayı ilişkisi ayrıca resmî oyun rehberiyle karşılaştırıldı.
- Açık kapsam: İkinci pakette Zihin Toplama, Sarsılmaz, Süpürme Vuruşu, Hedef Saptırma ve Ağır Vuruş tamamlandı; yalnız Kanatma görüntüsü bekleniyor.

## 2026-08-26 — Şifacı yetenekleri oyun içi tooltip paketi 2

- Kaynak: Kullanıcı tarafından sağlanan 5 gerçek oyun içi ekran görüntüsü.
- Kapsam: Element Direnç Alanı, Gazap, Çağrı, Can Kurtaran ve İyileştirme Çemberi.
- İşlem: Hedef, etki, süre, yenilenme ve puan eşikleri yapılandırıldı; kırpılmış kaynak görüntüleri her kayda bağlandı.
- Doğrulama: Yetenek adı ve açılma seviyesi Kıyametin Öncüleri rehberiyle karşılaştırıldı; iki bağımsız kaynak grubu uyuştuğu için kayıtlar çapraz doğrulandı.
- Sonuç: Şifacının 15 temel yeteneğinin tamamı tarihli oyun içi görüntüye bağlıdır.

## 2026-08-26 — Şifacı yetenekleri oyun içi tooltip paketi 1

- Kaynak: Kullanıcı tarafından sağlanan 10 gerçek oyun içi ekran görüntüsü.
- Kapsam: İyileştirme, Zehirleme, Şifa Bilgisi, Can Verme, Ruh Kalkanı, Meditasyon, Asit Saldırısı, Büyü Bozma, Asit Bilgisi ve Fiziksel Direnç Alanı.
- İşlem: Hedef, etki, süre, yenilenme ve puan eşikleri yapılandırıldı; kırpılmış kaynak görüntüleri her kayda bağlandı.
- Doğrulama: Yetenek adı ve açılma seviyesi Kıyametin Öncüleri rehberiyle karşılaştırıldı; iki bağımsız kaynak grubu uyuştuğu için bu 10 kayıt çapraz doğrulandı.
- Açık kapsam: Bu beş kayıt ikinci görsel paketinde tamamlandı.

## 2026-08-25 — Yetenek sayısı, Boz Ayı ve ad çelişkisi

- İddia: Resmî sınıf sayfası her sınıfta 1/10/20/30/40 seviyelerinde üçer yetenek, toplam 15 temel yetenek listeler.
- Kaynak: https://www.istanbuloyun.com/Classes.aspx
- Tür: Resmî İKV sınıf rehberi
- İddia: Resmî oyun rehberi Boz Ayı'yı Kanatma'nın yerine geçen ve aynı puanı kullanan seçenek olarak açıklar.
- Kaynak: https://download.istanbuloyun.com/ikv_oyun_rehberi.pdf — sayfa 17
- Tür: Resmî İKV oyun rehberi
- Karar: Boz Ayı ayrı 16. yetenek değil, `warrior-bleed` tabanına bağlı varyant olarak modellenir.
- Çelişki: Resmî sınıf sayfası “Süpürme Saldırısı”, Karaköy ses duyurusu “Süpürme Vuruşu” adını kullanır. Tek ad kesinleştirilene kadar iki adın aynı yeteneği işaret ettiği not edilir.
- Kaynaklar: https://www.istanbuloyun.com/Classes.aspx, https://www.istanbuloyun.com/News.aspx?NewsId=479

## 2026-08-25 — Bağlantı tanısı için çalışan örnekler

- VALORANT ağ kararlılığı açıklaması gecikme ve bağlantı dalgalanmasının ayrıştırılmasına örnektir: https://playvalorant.com/en-us/news/game-updates/valorant-game-and-network-instability-basics/
- Fortnite istemci ağ göstergesi paket kaybı görünürlüğüne örnektir: https://www.epicgames.com/help/c-202300000001636/c-202300000001719/how-can-i-check-if-i-have-packet-loss-while-playing-fortnite-a202300000012783?lang=en-US
- Destiny hata kodları kopma nedenini açık kodlarla sınıflandırmaya örnektir: https://help.bungie.net/hc/en-us/articles/360049496971-Error-Codes-Disconnected-From-Destiny
- EVE LogLite ve ESO pathping, kullanıcının isteğe bağlı paylaşabileceği tanı çıktısına örnektir: https://support.eveonline.com/hc/en-us/articles/5885024878236-LogLite-tool, https://help.elderscrollsonline.com/app/answers/detail/a_id/37818/~/how-do-i-read-my-pathping-results
- Sınır: İKV protokolünde açık sıra/teslim bilgisi yoksa “paket kaybı” hesaplanmış gibi gösterilmez; yalnız zaman aşımı veya yanıt kaçırma gözlemi yayımlanır.

## 2026-08-22 — Şaheser seviyesi ve sınıflandırması

- İddia: Resmi İKV duyurusu üretici ve toplayıcılar için eklenen Şaheser eşya reçetelerini 49 seviye olarak tanımlar.
- Kaynak: https://www.istanbuloyun.com/News.aspx?NewsId=19
- Tür: Resmi İKV duyurusu
- Güven: Tek kaynak
- İddia: Çemberlitaş arşivi kayıtları sınıf bazlı “Şaheser Reçeteleri” ve set ailesi başlıkları altında listeler.
- Kaynak: https://www.maxigamerz.com/konu/istanbul-kiyamet-vakti-ikv-cemberlitas-saheserlerinin-recete-detaylari.240307/
- Tür: Topluluk forum arşivi
- Güven: Nadirlik için resmi duyuruyla çapraz doğrulandı; görünüş ailesi için tek kaynak

## 2026-08-22 — Yetenek, tılsım ve Çemberlitaş kuralları

- İddia: Bir yeteneğe en fazla 15 puan yatırılabilir.
- Kaynak: https://istanbuloyun.com/AbilitySystem.aspx
- Tür: Resmi İKV rehberi
- Güven: Tek kaynak
- İddia: Gazap tılsımları Şifacı sınıfına ait, kırmızı renkli ve Gazap taban etkisine bağlı kademeli çarpanlardır.
- Kaynak: https://istanbuloyun.com/BuyukHolHealer.aspx
- Tür: Resmi İKV tılsım tablosu
- Güven: MaxiGame arşiviyle çapraz doğrulandı
- İddia: Çemberlitaş bir Grup Bölgesi'dir; Savaşçılar burada Depar kullanamaz.
- Kaynak: https://www.istanbuloyun.com/cemberlitasSoruCevap.aspx
- Tür: Resmi İKV Soru-Cevap
- Güven: Tek kaynak

## 2026-08-22 — Çemberlitaş şaheserleri

- İddia: Şaheserler bosslardan düşebilir veya bosslardan düşen reçetelerle üretilebilir.
- Kaynak: https://www.maxigamerz.com/konu/istanbul-kiyamet-vakti-ikv-cemberlitas-saheserlerinin-recete-detaylari.240307/
- Tür: Topluluk forum arşivi
- Güven: Tek kaynak
- Sonraki işlem: İkinci bağımsız arşivle parça bazında karşılaştır.

## 2026-08-22 — Gazap tılsımları

- İddia: Gazap 1 kademeleri asit, zehir ve maksimum hasar etkilerini %50/%100/%150 artırır.
- İddia: Gazap 2 kademeleri Gazaptan gelen kritik ihtimalini %50/%100/%150 artırır.
- Kaynak: https://www.maxigamerz.com/konu/istanbul-kiyamet-vakti-ikv-buyuk-hol-tilsimlari-rehberi.240285/
- Tür: Topluluk forum arşivi
- Güven: Tek kaynak
- Sonraki işlem: Oyun içi tooltip veya ikinci arşivle çapraz doğrula.

## 2026-08-23 — Yetenek sistemi kapsam denetimi

- İddia: Oyuncu 3 yetenekle başlar, her 10 seviyede 3 yeni yetenek açılır, her yeni seviyede 2 yetenek puanı kazanılır ve tek bir yeteneğe en fazla 15 puan yatırılabilir.
- İddia: Yetenekler birbirleriyle etkileşebilir.
- Kaynak: https://istanbuloyun.com/AbilitySystem.aspx
- Tür: Resmi İKV rehberi
- Sınır: Sayfa sınıf yeteneklerinin adlarını ve puan bazlı sayısal etkilerini yayımlamıyor; bu alanlar doğrulanana kadar hesap motoruna eklenmeyecek.

## 2026-08-23 — Üç sınıfın Büyük Hol tılsımları

- Kaynaklar: Resmi Savaşçı, Büyücü ve Şifacı Büyük Hol tılsım tabloları.
- Hesaplanan ilk kapsam: Savaşçı Ofansif Dövüşme; Büyücü Ateş/Buz/Elektrik/Fiziksel Bilgi; Şifacı Asit/Şifa Bilgisi, Zehirleme 1 ve Gazap serileri.
- Kural: Doğrudan ve sayısal özellik çarpanları hesaplanır. Süre, bekleme, koşullu kontrol ve kaynak tüketimi etkileri ayrı durum modeli kurulana kadar yalnız araştırma kapsamındadır.
- Kaynaklar: https://istanbuloyun.com/BuyukHolWarrior.aspx, https://istanbuloyun.com/BuyukHolMage.aspx, https://istanbuloyun.com/BuyukHolHealer.aspx

## 2026-08-26 — KÖ savaşçı yuva düzeltmesi ve büyücü paketi 2

- Kullanıcı doğrulaması: KÖ'de Kanatma yerine Boz Ayı bulunuyor; Boz Ayı ayrı bir 16. yetenek değil, aynı yuvanın ve puanların sunucu karşılığıdır.
- Kaynak: Kullanıcının oyun içi savaşçı ekran görüntüsü ve açık düzeltmesi.
- Sonuç: Savaşçı 15/15 tamamlandı; Kanatma artık bekleyen tooltip olarak gösterilmiyor.
- Kaynak paketi: Direnç Kırma Alanı, Buz Bilgisi, Ateş Çemberi, Meditasyon, Ateş Bilgisi, Yıldırım, Büyü Bozma, Elektrik Bilgisi, Tesla Küresi ve Kutup Rüzgarı oyun içi görüntüleri.
- Sonuç: Büyücü 14/15; yalnız Zihin Saldırısı bekliyor.

## 2026-08-26 — Zihin Saldırısı ve tam yetenek kapsamı

- Kaynak: Kullanıcının oyun içi Zihin Saldırısı tooltip görüntüsü.
- Bulgular: 40. seviyede açılır; düşmanı olasılıkla hapseder, yaratıklarda etki süresi üç katına çıkar ve 15 puanda hapsetme ihtimali %100'e ulaşır.
- Görsel kararı: Ham ekran fotoğrafı büyütülmedi; yalnız okunabilir tooltip alanı kırpılıp WebP kanıtına dönüştürüldü. Böylece yapay keskinlik ve gereksiz arayüz kalabalığı üretilmedi.
- Sonuç: Büyücü 15/15; üç sınıf toplamı 45/45.

## 2026-08-26 — Görev zincirleri ve ekonomi gözlemleri

- Görev kaynakları: https://istanbulkiyametvakti.fandom.com/tr/wiki/Zincir_G%C3%B6revler_ve_G%C3%B6rev_K%C4%B1s%C4%B1tlamalar%C4%B1 ve https://istanbulkiyametvakti.fandom.com/tr/wiki/A%C3%A7%C4%B1klamal%C4%B1_G%C3%B6rev_Listesi
- Bulgular: Açıklamalı listede Fotoğrafçı ve Kitabe 21; Philotheos'un Salonu, Tılsım ve Akıl Oyunları 22. seviye görünür. Katalog bu seviyelerle hizalandı; 18 eksik kayıt eklenerek toplam 101'e çıkarıldı.
- Ürün kararı: Son tamamlanan görev seçimi yalnız bağlı ön koşulları işler. Bu davranış bağımsız görevleri yanlışlıkla tamamlamaz.
- Oyuncu gözlemi: Üst seviye donanıma çok hızlı ulaşma, alt seviye materyal talebinin erimesi, kaynak/alan tekeli ve etkinliklerin kalıcı kullanım üretmemesi konuşmada tekrarlanan temalardır. Kişi adı ve telefon numarası kaydedilmedi.
- Dış örnekler: Albion Online'ın alt seviye eşyaları oyundan kaldırarak sürekli talep üretme açıklaması; EVE Online'ın üretim, madencilik, tüketim ve fiyat endekslerini düzenli raporlaması; World of Warcraft'ın içerik girişinde eşya seviyesi kullanması.
- Karar: KÖ için doğrudan “gear score kapısı” önerilmez. Önce gerçek direnç, görev ön koşulu ve rol hazırlığını açıklayan rehberlik skoru sınanır; sert kapı ancak yanlış dışlamaya yol açmadığı ölçülürse değerlendirilir.
- Kaynaklar: https://albiononline.com/news/video-black-market-feature, https://www.eveonline.com/news/view/monthly-economic-report-april-2026, https://worldofwarcraft.blizzard.com/en-us/news/24124661

## 2026-08-26 — Çöp eşya, maden ve para tüketim döngüsü

- İKV meslek yapısı üç üretici (Silahtar, Zırhçı, Kimyager) ile üç toplayıcıyı (Madenci, Sarraf, Lokman) birbirine bağlar; öneriler yeni bir meslek açmak yerine bu yapıyı genişletir.
- İksir reçetelerinde düşük ve orta kademe maden, taş ve bitkilerin birlikte kullanıldığı mevcut örnekler vardır. Bu nedenle yardımcı iksir önerisi oyunun üretim diline uygundur; ancak yeni güç katmanı oluşturmayacak şekilde sınırlandırılır.
- Albion Black Market örneği, alt seviye eşyaların sürekli tüketilmesinin kalıcı talep yaratabileceğini gösteren dış tasarım dayanağıdır. KÖ önerisi aynı sistemi kopyalamaz; hurdayı bağlı kozmetik girdiye dönüştürür.
- EVE aylık ekonomi raporu; maden, üretim, tüketim ve para çıkışının birlikte ölçülmesi gerektiğine dayanak olur. Site hesaplayıcısı gerçek telemetri değil, pilot varsayımı olarak etiketlenir.
- İlk uygulama sırası: Hurdacı Fişi → Ham Alaşım → Boyahane. İksir, aura ve sunucu ortak hedefi ilk dört haftalık tüketim ve fiyat verisinden sonra değerlendirilir.
- Kaynaklar: https://istanbulkiyametvakti.fandom.com/tr/wiki/Meslekler, https://istanbulkiyametvakti.fandom.com/tr/wiki/%C4%B0ksir_Re%C3%A7eteleri, https://albiononline.com/news/video-black-market-feature, https://www.eveonline.com/news/view/monthly-economic-report-april-2026

## 2026-08-27 — Fandom set görünüşleri ve kanıt kapsamı

- Kullanıcı kaynağı: `Savaşçı - Çemberlitaş Eşyaları` Fandom sayfasının mobil ekran görüntüsü.
- Doğrulanan görünür eşleşme: “Bıçak Sırtı (Maksimum Hasar)” bölüm başlığı ile tam zırhlı savaşçı renderı aynı sayfa görüntüsünde yer alıyor.
- Kapsam kararı: Bu görsel `Bıçak Sırtı` görünüş ailesinin genel set referansıdır; Ceket, Pantolon, Eldiven, Ayakkabı, Zırh veya Kılıç için ayrı ikon/tooltip kanıtı değildir.
- Ürün kararı: Set referansları kart, modal ve Atlas'ta gösterilebilir; medya sağlık puanı yalnız eşya adı ile tekil görünüşü aynı kanıtta taşıyan `images.json` kayıtlarından hesaplanmaya devam eder.
- Kuyruk: 11 görünüş ailesi ve 67 çekirdek Çemberlitaş eşyası kapsama alındı. Bıçak Sırtı `set_reference_only`; diğer aileler dosya sayfası, başlık eşleşmesi ve lisans denetimi bekliyor.
- Erişim sınırı: Bu çalışma ortamındaki tarayıcı Fandom sayfasını güvenlik politikası nedeniyle açamadı. Kullanıcı görüntüsü dışındaki dosyalar doğrudan alınmadı; Büyücü ve Şifacı sayfa yolları yayımlanabilir kaynak olarak işaretlenmedi.

## Araştırma kuyruğu

- [ ] Savaşçı, Büyücü ve Şifacı yetenek adları ile puan bazlı etkileri için oyun içi tooltip veya güvenilir arşiv kanıtı
- [ ] NotebookLM strateji çıktısındaki kaynaksız “%40 verim”, “%30 grup hızı” ve “%15 hata payı” iddialarını birincil kaynakla doğrula
- [ ] Bıçak Sırtı dışındaki 10 görünüş ailesinin set başlığını, özgün Wiki dosya sayfasını ve lisansını doğrula
- [ ] 67 Çemberlitaş eşyası için ad + tekil görünüşü aynı kanıtta gösteren ikon veya tooltip görsellerini topla
- [ ] Resmi İKV kaynaklarında ekipman yuvaları
- [ ] Klan tüccarı gözlükleri ve klan parası
- [ ] TurkMMO Çemberlitaş arşiviyle satır karşılaştırması
- [ ] Fandom Büyücü ve Şifacı Çemberlitaş eşya sayfalarının gerçek adreslerini ve dosya kaynak izlerini doğrula
- [ ] Adı ve görünüşü aynı karede bulunan video kanıtları
# 28 Ağustos 2026 — İksir reçetesi kaynak kararı

- Kaynak: `fandom-potion-recipes-20260826` — İKV Wiki, İksir Reçeteleri.
- Kullanıcı kararı: Sayfadaki iksir adı, malzeme ve adetleri oyun doğrusu kabul edilir; çapraz doğrulama aranmaz.
- Uygulama: Kaynak `primary_game_reference` olarak işaretlendi. Kaynak güveni ile siteye aktarım kapsamı ayrıldı; aktarılmayan adetler tahmin edilmedi.
# 28 Ağustos 2026 — İKV Wiki genel ana kaynak kararı

- Kapsam: Eşya, efsun, tılsım, reçete, görev, bölge, boss, maden, meslek, yetenek ve görsel kimliği.
- Kullanıcı kararı: İKV Wiki oyun doğrusu kabul edilir; eksik bilgi için kullanıcının tek tek bağlantı vermesi beklenmez.
- Uygulama: Projedeki 22 Fandom kaydı çalışma zamanında `primary_game_reference` olarak işaretlenir ve ikinci kaynak şartı aranmaz.
- Sınır: Pazar fiyatı, oyuncu bildirimi, KÖ’ye özel canlı değişiklik ve görsel kullanım lisansı ayrı kanıt türüdür.
