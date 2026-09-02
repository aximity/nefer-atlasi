# Nefer Atlası Project State

Son güncelleme: 2026-09-02

## Code Baseline

- Ana kaynak: `https://github.com/aximity/nefer-atlasi`
- Branch: `main`
- Son güvenli commit: `0fce8d4f6db1ecf64e008ed2f0f7bf3b2d4d8873`
- Commit mesajı: `docs: audit talisman acquisition gaps`
- Ürün kaynak snapshot'ı: `903f097d5c140127a3215457814dd3fed029ae50` (`Cemberlitas ganimetlerini grup bolgelerine ekle`).
- Recovery sonucu: Yerel makinede ürün kaynak snapshot'ından daha yeni veya daha kapsamlı kaynak kod bulunmadı; `068af74` proje hafızası baseline'ını ekler.
- Eski ChatGPT çalışma geçmişindeki ek özellik iddiaları mevcut kod kabul edilmez; yalnız recovery backlog olarak izlenir.

## Recovery Status

- Son güvenli baseline: `0fce8d4f6db1ecf64e008ed2f0f7bf3b2d4d8873`.
- Recovery Manifest v1: 31 kayıt.
- `RECOVERED`: 3 (`REC-024`, `REC-030`, `REC-031`).
- Eski ChatGPT Çalışması'nda bu baseline'dan daha ileri geliştirme geçmişi bulunduğu kullanıcı tarafından bildirildi.
- Bu geliştirmelerin kaynak kodu mevcut GitHub repository'sinde bulunmuyor.
- Historical özellikler ve eski çalışma geçmişindeki bir “tamamlandı” iddiası, mevcut GitHub davranışı veya uygulanmış/doğrulanmış özellik kanıtı değildir.
- `RECOVERY_MANIFEST.md`, bu çalışmaların kanıtlarla çıkarılması, sınıflandırılması ve kontrollü biçimde yeniden kazanılması için ana kayıttır.
- Recovery maddeleri gerekli uygulama ve doğrulama kapılarından geçmeden `RECOVERED` veya mevcut ürün özelliği kabul edilmez.

## Stack

- Aktif ürün kimliği: `Nefer Atlası`; npm package adı: `nefer-atlasi`.
- Node.js `>=22.13.0`; baseline doğrulaması Node.js `v24.14.0` ile yapıldı.
- npm ve lockfile v3 (`package-lock.json`).
- React `19.2.6`, React DOM `19.2.6`.
- Next.js `16.2.6` App Router.
- Vinext `0.0.50`, Vite `8.0.13`.
- Cloudflare Worker ve Wrangler `4.92.0`.
- Drizzle ORM `0.45.2`; gerçek uygulama şeması şu anda boş.
- Node yerleşik test runner'ı ve ESLint `9.39.4`.
- GitHub Actions CI, `main` push ve pull request'lerde Node.js 22 üzerinde temiz kurulum, lint ve birleşik `npm test` kalite kapısını çalıştırır.

## Production Verification

2026-09-02 REC-006A çalışma ağacında:

| Kontrol | Sonuç | Gerçek çıktı |
|---|---|---|
| `npm ci` | PASS | Kurulum tamamlandı; `@esbuild-kit/esm-loader` için deprecated transitive dependency uyarısı verdi. |
| `npm run validate:data` | PASS | 129 eşya, 237 özellik, 67 ekipman reçetesi, 119 tılsım reçetesi, 265 görev, 910 eşya kanıtı, 179 tılsım, 179 tılsım edinimi, 167 ham efsun satırı, 45 yetenek, 1 yükseltme, 6 materyal edinimi, 3 tılsım edinim kuralı ve 1 oyun mekaniği kuralı. |
| `npm run lint` | PASS | ESLint hata üretmedi. |
| `npm run test:unit` | PASS | 74/74 geçti; 0 fail, 0 skipped. |
| `npm run build` | PASS | Vinext'in beş build aşaması tamamlandı. `/` rotası için statik sınıflandırma uyarısı var. |
| Rendered HTML testi | PASS | 1/1 geçti. |
| `npm test` birleşik kapısı | PASS | Validator, 74 unit test, production build ve 1 rendered test birlikte geçti. |

Toplam bağımsız test: **75**. Bu sayı 74 unit + 1 rendered-HTML testinden oluşur.

## Working Modules

- Eşya kataloğu: arama, sınıf/yuva filtresi, detay ve aynı sınıf/yuva karşılaştırması.
- Reçeteler: 67 reçete, malzeme satırları ve eşya detay bağlantısı.
- Build planlayıcı: sınıf uyumlu dokuz yuva, hedef puanlama, toplamlar, URL paylaşımı ve cihazda kayıt/yükleme.
- Grup bölgesi ganimetleri: Sığınaklar, Migrat ve Çemberlitaş kayıtları.
- Kaynak/evidence gösterimi: eşya alanlarını kaynak kayıtlarına bağlayan model.

`WORKING`, akışın koda ve kullanıcı arayüzüne bağlı olduğunu ifade eder; oyun verisinin tamamının `VERIFIED` olduğu anlamına gelmez.

## Partial Modules

- Tılsım sistemi: 179 kayıt UI'a bağlıdır; 24 stat multiplier, 3 damage multiplier ve 3 critical multiplier hesaplanır. Edinim görünümü 119 kaynaklandırılmış `RECIPE_CRAFT` kaydını (109 kademe yükseltme ve 10 özel reçete) reçete sonucu, gereken malzeme/miktar, önceki kademe ve dahili üretim zincirine bağlar. REC-003 batch auditindeki 60 `UNKNOWN`; her sınıfta 20 kayıt olmak üzere 55 I. kademe, 4 kademesiz özel tılsım ve REC-004 kapsamındaki Büyücü Meditasyon 2 (III) kaydından oluşur. Item-level Gönül/Mecnun kanıtı bulunmadığından NPC/drop ayrıntısı türetilmemiştir. 149 tılsım etkisi yalnız bilgilendiricidir.
- Yetenek planlayıcı: 45 yetenek, 80 puan bütçesi ve yetenek başına 15 puan sınırı vardır; puanların oyun içi etkisini hesaplamaz.
- Öneriler: kanıtlı stat adlarıyla hedef eşleşmesi yapar; meta, kullanım veya başarı oranı önerisi değildir.
- Kaynaklar: item/evidence akışına bağlıdır; ayrı kaynak tarayıcısı yoktur.
- Efsun çözümleyici: resolver ve testleri vardır; `EnchantAnalyzer` ana kullanıcı akışına bağlı değildir.
- Stat değer altyapısı: canonical ham sayıları korur, desteklenen storage scale sözleşmesini doğrular ve aynı attribute içindeki uyumsuz/bilinmeyen scale değerlerini build ile tılsım hesabından güvenli biçimde dışlar. Exact `scaled_1000` / `scaled_10000` display dönüşümü henüz doğrulanmamıştır.
- Veri foundation: Mevlana Asa için base/upgraded state ayrımı, altı kaynaklandırılmış materyal edinimi, kapsamı genellenmeyen üç tılsım edinim kuralı ve resmî Mavi Gazap/İyileştirme kuralı modellenmiştir. Altı materyal edinimi tılsım reçete görünümüne bağlıdır; diğer veri foundation kayıtlarının ayrı kullanıcı akışları yoktur.
- Discord update intake foundation: `DISCORD_OFFICIAL_UPDATE` provenance, çoklu claim ayrıştırma, kalıcılık/durum sözleşmesi ve duplicate koruması canonical veriden ayrı modellenmiştir. Gerçek Discord bot bağlantısı, kalıcı queue adapterı ve canonical application akışı henüz yoktur.
- Görev sistemi: Fandom zincir/kısıtlama tablosu ile resmî İKV görev tablosu batch işlenerek 1–49 aralığında 265 canonical görev ana sayfaya bağlandı. `level`, görev adındaki `[n]` görev seviyesidir; `minLevel`, resmî tablonun ayrı `Seviye Gereksinimi` hücresidir ve kaynak hücresi boşsa `null` kalır. REC-006A semantik düzeltmesi 115 `level`, 135 `minLevel`, toplam 160 benzersiz kaydı etkiledi. Kullanıcı seviyesi ve tamamlanan prerequisite kayıtları erişilebilir/önceki görev gerekli/henüz açılmadı durumlarını ayrı belirler. `location` yalnız görevi veren NPC'nin doğrulanmış konumudur; hedef/aksiyon bölgesi değildir. Konum ve ödül kapsamı büyük ölçüde eksik olduğu için `PARTIAL` korunur.

## Not Found in Current Code

- Madenler modülü.
- Ticaret sistemi.
- Etkinlik/takvim.
- Tier list.
- Fotoğrafla malzeme tanıma veya image recognition akışı.
- Yönetici paneli/araçları.
- Ürün analytics sistemi.

## Data State

- 129 eşya: tamamı `SINGLE_SOURCE`; REC-024 kapsamındaki 11 eşya web kanıtıyla çözüldü.
- 237 özellik/stat: tamamı `SINGLE_SOURCE`; 11 aynı-stat çifti 22 ayrı canonical katkı satırı olarak korunuyor.
- 67 reçete: tamamı `SINGLE_SOURCE`.
- 179 tılsım: tamamı `SINGLE_SOURCE`; ayrıca 119 `RECIPE_CRAFT` ve 60 `UNKNOWN` edinim kaydı vardır. `UNKNOWN` dağılımı Büyücü/Savaşçı/Şifacı için 20/20/20; kademe dağılımı 55 I. kademe, 1 III. kademe ve 4 kademesiz özeldir. Sınıf başına benzersiz aile sayısı 18/19/18'dir. Gönül Fandom sayfası kullanılabilir envanter içermiyor, Mecnun için indekslenmiş kaynak yok ve genel sistem sayfası yalnız bazı I. kademelerin satın alındığını/bazılarının düştüğünü söylüyor; bu yüzden 0 item-level `NPC_PURCHASE`, 0 `ENEMY_DROP` korunur. Reçete auditinde 119 tam reçete, 704 bileşen satırı ve 7 canonical materyal vardır; REC-004'e ait eksik Meditasyon 2 (III) bu edinim auditinden ayrıdır.
- 910 evidence: 775 `SINGLE_SOURCE`, 134 `VERIFIED`/`cross_verified`, 1 `UNKNOWN`/`draft`; bunların 3'ü Mevlana Asa için `USER_GAME_EVIDENCE` claim'idir.
- 45 yetenek: 44 `VERIFIED`/`cross_verified`, 1 `SINGLE_SOURCE`.
- 1 kaynaklandırılmış item upgrade kaydı: Mevlana Asa için 4 base → upgraded contribution; genel `×2` formülü yoktur.
- 6 `SINGLE_SOURCE` materyal edinimi, 3 `SINGLE_SOURCE` genel tılsım edinim kuralı ve 1 `SINGLE_SOURCE` gameplay kuralı. Tılsım reçetelerindeki Xenotim, Peptit Klorotoksin, Örümcek Salgısı, Safran, Jadeit ve Gadolinyum edinime bağlıdır; 7 canonical reçete materyalinden yalnız Kondrit edinimi `UNKNOWN` kalır.
- 265 görev: 265/265 görev seviyesi; `minLevel` için 212 bilinen, 51 resmî olarak belirtilmemiş ve 2 çözümlenmemiş kayıt; 229 NPC, görevi veren NPC'ye ait 7 konum, 264 objective ve 225 prerequisite ilişkili görev. Fandom zincirinde bulunup resmî tabloda karşılığı olmayan `Amplifikatör Elması` ve `Tepegözler` iki çözümlenmemiş `minLevel` kaydıdır; değer tahmin edilmez. Böylece resmî boş hücreler veri eksiği sayılmaz. 36 otomatik görevde NPC yoktur; 258 NPC konumu, 1 objective ve 265 ödül doğrulama bekler. `Huzursuzluğum` objective'i kaynakta `...` olduğu için `UNKNOWN` kalır.
- Duplicate ID: 0.
- Orphan ilişki: 0.
- Eksik eşya ID: 0.
- 222 stat `raw_game_value`, 14 stat `puan`, 1 stat `scaled_1000` birimindedir.

## Asset State

- Doğrulanmış eşya görseli: 1.
- Görsel kapsamı: 1/129, yaklaşık `%0,78`.
- Kayıtlı kırık görsel yolu: 0.
- Görseli bulunmayan eşya: 128.
- Doğrulanmamış eşyalara sahte veya tahmini görsel gösterilmez.

## Known P1 Issues

- `raw_game_value`, `scaled_1000`, `scaled_10000` ve `puan` için exact oyun içi display dönüşümleri doğrulanmamış durumda. Güvenli formatter tahmini dönüşüm yapmaz; kanıtlanmamış scaled değerlerde ve uyumsuz toplamda “Doğrulama gerekiyor” gösterir.
- REC-024 çözüldü: 11 eşyanın duplicate stat katkıları kaynak satırı bazında korunuyor; kanıtsız Savunma/Maksimum Kudret türetmeleri canonical veriden çıkarıldı. Mevlana Ceket kanıt güveni `medium`, diğer 10 kayıt `high` olarak tutuluyor.
- Veri kümesinin büyük bölümü yalnız tek kaynağa dayanıyor.
- REC-030 ile görünür başlıklar, README, aktif metadata ve package/lockfile kimliği `Nefer Atlası` altında hizalandı. Doğrulanmış production domain olmadığı için metadata içinde domain yayınlanmıyor.
- GitHub-hosted CI ilk `main` çalışmasını başarıyla tamamladı; branch protection ayarı repository yönetim işi olarak ayrıdır.

## Known P2 Issues

- Tılsım kayıtlarının 149'u hesaplanabilir etki üretmiyor.
- Yetenek planlayıcı gerçek etki simülasyonu yapmıyor.
- Görsel kapsamı çok düşük.
- `chatgpt-auth.ts`, boş D1 katmanı ve bazı starter asset/örnekleri aktif ürün akışına bağlı değil.
- Efsun çözümleyici kullanıcı akışına bağlı değil.
- Vinext build, `/` rotasını `Unknown` olarak sınıflandırdığına dair uyarı veriyor.

## Recovery Backlog

Aşağıdakiler eski ChatGPT proje geçmişinde anılmış, ancak baseline kaynak kodunda çalışan özellik olarak bulunmamıştır:

- Madenler.
- Görevler.
- Ticaret.
- Etkinlik/takvim.
- Tier list.
- Fotoğrafla malzeme tanıma.
- Admin araçları.
- Analytics.
- Daha gelişmiş tılsım sistemi.
- Daha gelişmiş yetenek sistemi.

Bu liste geçmiş bağlamını korur; hiçbir madde tamamlanmış kabul edilmez.
