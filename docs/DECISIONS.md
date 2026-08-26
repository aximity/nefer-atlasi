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
