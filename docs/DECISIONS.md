# Karar Kaydı

## ADR-001 — Eksik veride dürüst boş durum

Doğrulanmayan yuvada başka eşya veya görsel yerine “Veri / görsel doğrulanıyor” gösterilir.

## ADR-002 — Nadirlik ve build rengi ayrıdır

Nadirlik ad, özellik ve ana çerçeveyi; build rengi yalnız vurgu şeridi/rozetini kontrol eder.

## ADR-003 — Kanıt kayıtları içerikten ayrıdır

Kaynak ve doğrulama, eşya alanlarına gömülmez; ayrı kimliklerle bağlanır.

## ADR-004 — Hazır build ve teorik kombinasyon ayrıdır

Hazır doğrulanmış buildler ile teorik kombinasyonlar ayrı hesaplanır.

## ADR-005 — Öneri puanı meta değildir

Ana hedef eşleşmesi iki, hibrit hedef eşleşmesi bir puandır. Bu sayı yalnız kanıtlı özellik uyumunu sıralar; kullanım, başarı veya meta iddiası değildir.

## ADR-006 — Gazap tabanı ve tılsım çarpanı ayrıdır

Gazap tılsımı seçimi tek başına toplamları değiştirmez. Hesap ancak Şifacı sınıfında gerekli Gazap tabanı ayrıca etkinleştirildiğinde uygulanır.

## ADR-007 — Yetenek medyasında dürüst bekleme durumu

Bir yetenek kartına yalnız gerçek oyun içi klip bağlanır. Video yoksa başka yetenek, yapay animasyon veya rehber fotoğrafı tekrar kullanılmaz. WebM/MP4 kullanıcı kontrolüyle oynar; ses otomatik başlamaz.

## ADR-008 — Proje puanı popülerlik değildir

Gelişim puanı kanıt, hesaplanabilir özellik, elde etme bilgisi, doğrulanmış medya, veri bütünlüğü ve güncellik kapsamından türetilir. Meta gücü, oyuncu sayısı veya başarı oranı olarak yorumlanmaz.

## ADR-009 — Görsel paketleri sınırlı ama birikimlidir

Sohbet başına görsel sınırı veri kapsamını düşürmez. Her paket tarihli kaynaklara ayrılır, önceki paketlerle aynı kararlı yetenek kimliklerine bağlanır ve eksik kalan kayıtlar açıkça “görsel bekliyor” durumunda tutulur.

## ADR-010 — Skill yalnız kanıtlanmış tekrar için oluşturulur

Proje bağlamı ve tek seferlik kararlar `AGENTS.md` ile `docs/` altında kalır. Bir süreç ancak en az üç doğrulanmış kullanımda aynı biçimde işe yararsa projeler arası skill adayına dönüşür.

## ADR-011 — Genel okuma, sınırlı yönetim

Site 26 Ağustos 2026 tarihli kullanıcı isteğiyle bağlantıya sahip herkesin görüntüleyebileceği erişime açılır. Bu değişiklik düzenleme, moderasyon veya yayımlama yetkisi vermez; yönetim işlemleri yalnız yetkilendirilmiş site sahibinde kalır.

## ADR-012 — Sorun, çıkarım ve çözüm aynı kesinlikte değildir

Oyuncunun yaşadığı belirti “oyuncu bildirimi”, olası teknik neden “teknik çıkarım”, uygulanacak adım “çözüm önerisi” olarak ayrı gösterilir. Sunucu günlüğü veya tekrar ölçümü olmadan kök neden doğrulanmış sayılmaz.

## ADR-013 — Oyuncu sohbeti anonim gözleme dönüşür

Paylaşılan konuşmalardaki telefon numarası, kişi adı ve başka doğrudan tanımlayıcılar site verisine alınmaz. Yalnız ürün kararına yarayan ortak gözlem, karşı görüş, ölçüm önerisi ve çözüm ilkesi yayımlanır.

## ADR-014 — Zorluk hedef değil, emek–ödül dengesi araçtır

“Hardcore” talebi doğrudan daha uzun farm veya daha düşük oran olarak uygulanmaz. İlerleme süresi; hedef ömrü, pazar talebi, yeni oyuncu erişimi ve emeğin korunması birlikte ölçülerek düzenlenir. Eşya seviyesi benzeri skorlar önce rehberlik amacıyla sınanır; kanıt olmadan zorunlu giriş kapısına dönüşmez.

## ADR-015 — Görev devamı yalnız bağlantılı zinciri tamamlar

Oyuncu son tamamladığı görevi seçtiğinde sistem yalnız o kaydın kaynaklı ön koşullarını tamamlandı sayar. Aynı seviyedeki veya bağımsız başka görevler otomatik işaretlenmez; böylece “kaldığım yeri bul” kolaylığı yanlış ilerleme üretmez.

## ADR-016 — Ekonomi döngüsü güç satmadan tüketim üretir

Çöp eşya ve maden için ilk kullanım alanları kozmetik, görünüm, sözleşme ve ara malzemedir. Her döngü hem gerçek eşya/malzeme tüketmeli hem NPC hizmet bedeliyle oyun parasını sistemden çıkarmalıdır. İksirler yeni bir güç tavanı oluşturamaz, daha güçlü eşdeğerlerle üst üste binemez ve ayrı PvP/PvE pilotunda ölçülür.

## ADR-017 — İlk pilot üçlü ve geri alınabilirdir

Hurdacı Fişi, Ham Alaşım ve Boyahane ilk pilot paketidir. Savaş gücü vermediği, erken seviye malzemeye talep açtığı ve tarif oranları sunucu kapatılmadan değiştirilebildiği için kostüm seti, aura ve iksirden önce ölçülür.

## ADR-018 — Yetenek puanı ile tılsım etkisi ayrı araçlardır

Yetenek Simülatörü sınıf, seviye, puan bütçesi ve 0–15 yetenek eşiklerini yönetir. Tılsım Atlası yalnız seçilen tılsımın bağlı yeteneğini, kademesini, edinme yolunu ve doğrulanmış hesaplanabilir etkisini gösterir. Bir araç diğerinin içinde gizlenmez; tılsım seçmek yetenek puanı dağıtmaz.

## ADR-019 — İçerik silmeden ilk görünümü sadeleştir

Ana gezinme en sık kullanılan Donanım, Yetenek, Görevler ve Eşyalar işlerine ayrılır. Diğer modüller açıklamalı Tümü menüsünde korunur ve genel aramadan erişilebilir kalır. Böylece yeni kullanıcıya aynı anda on üç karar sunulmaz; uzman kullanıcı hiçbir aracı kaybetmez.

## ADR-020 — Genel kabuk stillerini semantik etiketlere bağlama

Yapışkan üst başlık ve ana gezinme stilleri çıplak `header` veya `nav` etiketlerine değil yalnız `.siteHeader` kabuk sınıfına uygulanır. Modüller ve kartlar erişilebilirlik için aynı semantik etiketleri kullanabildiğinden, etikete bağlı genel stiller içerik başlıklarını yanlışlıkla sabitleyip mobilde metin çakışmasına yol açar. Yeni genel yerleşim kuralları da içerik alanında taşmayı engelleyecek, ancak bileşenin kendi konumlandırmasını değiştirmeyecek şekilde sınırlandırılır.

## ADR-021 — Trafik ölçümü birinci taraf ve veri-minimumdur

Trafik ölçümü haricî bir izleyici yerine mevcut D1 üzerinde tutulur. Ham IP, tam kullanıcı aracısı, ad, e-posta veya oyun hesabı kaydedilmez. Tekil ziyaretçi hesabı gizli anahtarlı, günle sınırlı özet üzerinden yapılır; bu nedenle günler arası kişi profili çıkarılmaz. Özel trafik paneli herkese açık siteden ayrıdır, navigasyonda yayımlanmaz ve ChatGPT kimliği yerine güçlü erişim anahtarı, imzalı HttpOnly oturum ve giriş hız sınırı kullanır. Reklam kodu yalnız geçerli yayıncı ayarları ve ziyaretçi izni birlikte bulunduğunda çalışır.

## ADR-022 — İksir reçetelerinde İKV Wiki ana oyun referansıdır

Kullanıcının 28 Ağustos 2026 tarihli açık kaynak kararıyla İKV Wiki'deki İksir Reçeteleri sayfası bu proje için iksir adı, malzeme ve adetlerinde ana oyun referansıdır. Bu kapsamdaki bilgi ikinci bağımsız kaynak beklemeden yayımlanabilir. Kaynakta henüz siteye aktarılmamış alanlar tahmin edilmez; aktarım eksikliği ile kaynak güveni ayrı tutulur.

## ADR-023 — İKV Wiki tüm oyun verilerinde genel birincil kaynaktır

Kullanıcının 28 Ağustos 2026 tarihli genişletilmiş kararıyla İKV Wiki yalnız iksirlerde değil; eşya, efsun, tılsım, reçete, görev, bölge, boss, maden, meslek, yetenek ve görsel kimliğinde ana oyun referansıdır. Wiki'de bulunan bilgi ikinci bağımsız kaynak beklemeden yayımlanır. Oyuncu bildirimi, pazar fiyatı, KÖ'ye özel sunucu değişikliği ve canlı performans ölçümü Wiki kapsamına sokulmaz. Görselin neyi gösterdiği Wiki'den alınabilir; dosya lisansı ve kullanım hakkı ayrıca kaydedilir.

## ADR-024 — İstek modüler, denetim sistemiktir

Kullanıcı bir tılsım, reçete, eşya veya maden değişikliği istediğinde iş yalnız adı geçen ekranda tamamlanmış sayılmaz. Aynı kimlik, kaynak veya görsel; katalog, reçete, Atlas, maden/toplayıcılık, stok/üretim, arama, Proje Durumu ve yayın kapılarında birlikte denetlenir. Bağlı açıklar güvenilir kanıtla kapanabiliyorsa aynı çalışma kapsamında kapatılır; kanıt veya kullanım hakkı yoksa tahmin edilmeden canlı açık listesinde gösterilir. Her yayımlanabilir ilerleme `SITE_RELEASE` üzerinden Proje Durumu'na yansır ve sayaçlar sabit metin yerine veri kümelerinden türetilir.

## ADR-025 — Fotoğraf analizi süreli ve açıklanabilirdir

Fotoğraf analizi aşama, yüzde ve geçen süreyi görünür kılar; yoğun hesap sırasında tarayıcıya düzenli olarak kontrol verir ve 18 saniyede güvenli biçimde sonlanır. Referans ikon imzaları aynı oturumda yeniden kullanılabilir. Güçlü eşleşmeler doğrudan düzenlenebilir taslağa, makul fakat düşük güvenli eşleşmeler “aday” olarak açık isim onayına gider; zayıf eşleşmeler ad uydurmadan dışarıda kalır. Aday ismi ve bilinmeyen adet tamamlanmadan stok değişmez.

## ADR-026 — Adet OCR'ı kalite kapısına kadar yalnız öneridir

Sarı etiketli bir yuvada OCR'ın okuduğu sayı, güven puanı yüksek görünse bile otomatik stok değeri değildir. Kullanıcı sayıyı açıkça doğrulayana kadar yuva üretim ve stok hesabına girmez; etiketsiz tekli yuva 1 sayılır. Otomatik kabul ancak perspektif-normalize gerçek oyun görüntülerinden ayrılmış test kümesinde en az %99 etiket varlığı, en az %97 kesin adet doğruluğu ve %0,5'in altında yanlış otomatik kabul oranı birlikte sağlandıktan sonra ayrıca değerlendirilebilir. Aynı rakam şablonlarından üretilen sentetik testler bu kapının kanıtı sayılmaz.

## ADR-027 — Genel simge özgün eşya görünüşü sayılmaz

Bir kaynak birden çok zırh seti veya eşyada aynı “ceket”, “pantolon”, “ayakkabı” gibi genel simgeyi kullanıyorsa bu dosya yalnız paylaşılan tür görseli olabilir; özgün eşya ikonu ya da set görünüşü kapsamını kapatmaz. Görsel adı, oyundaki kayıt ve görünüş birebir doğrulanmadan kapsam sayacı artırılmaz. Böylece görsel zenginliği puanı, kullanıcıyı yanlış eşya görünüşüyle yanıltma pahasına yükseltilmez.

## ADR-028 — Ticaret arşivi günlük ve çakışmasız ilerler

WhatsApp dışa aktarımları birbiriyle örtüşebilir. İçe aktarma mesajları yalnız geçici işlem sırasında tekilleştirir; projede ad, telefon, yazar kimliği veya ham sohbet tutmaz. Kalıcı veri tarih–ürün–yön–para birimi düzeyinde anonim agregadır. Aynı tarih için yeni dışa aktarım daha az mesaj içeriyorsa mevcut daha dolu gün korunur; eşit veya daha doluysa gün bütünüyle yenilenir. Aynı kişinin aynı gün aynı ürün ve yöndeki tekrarları tek sinyal, fiyat değişikliklerinde son ilan tek kaynak sayılır. Bu arşiv tek kanal ilan gözlemidir; gerçekleşen satış veya doğrulanmış piyasa fiyatı değildir.
