# Veri Kalitesi

| Durum | Arayüz | Kullanım |
|---|---|---|
| Taslak | Gösterilmez | Kaynak taraması sürüyor |
| Tek kaynak | Kaynak etiketiyle | Bir arşiv destekliyor |
| Çapraz doğrulandı | Doğrulandı etiketi | İki bağımsız kaynak uyuşuyor |
| Çelişkili | Uyarı veya gizli | Kaynaklar uyuşmuyor |

## Görsel kapıları

- Eşya adı ve görünüş aynı kanıtta olmalı.
- Set görseli tekil eşya görseli olarak kaydedilmez.
- Video küçük resmi kanıt değildir.
- Görsel URL, kaynak türü ve tarih olmadan yayımlanmaz.

## Araştırma ve kaynak politikası

Kaynak sırası: İKV Fandom → resmî İKV kaynakları → bağımsız forum/arşiv/topluluk → video → kullanıcı oyun içi ekran görüntüsü. Bu sıra araştırma başlangıcını belirler; bir kaynağın otoritesi, başka bir kaynaktan kopyalanmış metni bağımsız cross-check yapmaz.

- Çoklu kayıt araştırmaları Fandom kategori/liste sayfalarından başlanarak batch yürütülür.
- Akış: `DISCOVER → BATCH COLLECT → CROSS-CHECK → RECONCILE → EVIDENCE → VALIDATE`.
- URL, sayfa içi locator, erişim tarihi, bağımsızlık grubu ve güven durumu evidence kaydında korunur.
- Snippet tek başına kanıt sayılmaz; mümkün olduğunda kaynak içeriği veya görseli açılır.
- Kaynakta doğrudan bulunan alan ile aile deseninden çıkarılan alan birbirinden ayrılır.
- Eksik bir alan komşu eşyadan kopyalanamaz ve kaynakta varmış gibi `single_source` işaretlenemez.
- Fandom'da bulunmayan bilgi otomatik olarak yanlış değildir. Tek kaynak `single_source`, iki bağımsız güvenilir ve uyuşan kaynak `cross_verified`, gerçek uyuşmazlık `conflicted` olarak kalır.
- Manuel kullanıcı kanıtı ancak web araştırması yetersiz, erişilemez, gerçekten çelişkili veya sürüme özgü olduğunda istenir.

## Açık sorunlar

- REC-024 araştırması, 11 eşyanın aynı-stat satırlarının Fandom ve erişilebilen resmî İKV sayfalarında ayrı katkılar olarak tekrarlandığını doğruladı; bu katkılar artık ayrı canonical satırlarda tutuluyor.
- Pattern ile eklenmiş Taş Kanat Ceket Savunma ve dokuz Maksimum Kudret alanı kaynakta bulunmadığı için kaldırıldı.
- Gözlük, yüzük ve kolye kayıtları henüz doğrulanmadı.
- 67 Çemberlitaş şaheser kaydı modele alındı; gerçek duplicate katkılar `contributionGroup`, sıralı `contributionIndex`, evidence bağlantısı ve confidence ile korunuyor.
- Mevcut kayıtların tamamı ikinci bağımsız kaynak bekliyor.

## Kaynaklandırılmış foundation modelleri

- Item upgrade kayıtları canonical base statı değiştirmez; her contribution `baseStatId`, `baseValue` ve yalnız kaynakta yayımlanan `upgradedValue` ile ayrı tutulur. Global çarpan türetilmez.
- Materyal edinimleri düşman dropu ile meslek/toplayıcılık ilişkisini ayrı `acquisitionType` değerleriyle taşır ve tek kaynaklı kayıtlar `single_source` kalır.
- Genel tılsım edinim kuralındaki `some` kapsamı kesin NPC, tılsım veya düşman listesine genişletilemez.
- `USER_GAME_EVIDENCE` claim'i kullanıcı tarafından sağlanan tooltip satırını canonical alana bağlayabilir; binary artifact repository'de yoksa kaynak kaydı bunu açıkça belirtmelidir ve sahte dosya yolu üretilemez.
