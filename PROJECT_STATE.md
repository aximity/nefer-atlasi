# Nefer Atlası Project State

Son güncelleme: 2026-09-01

## Code Baseline

- Ana kaynak: `https://github.com/aximity/nefer-atlasi`
- Branch: `main`
- Code baseline commit: `068af74088dd7eb323717d93f48072e2b3aac703`
- Commit mesajı: `chore: establish Nefer Atlasi project baseline`
- Ürün kaynak snapshot'ı: `903f097d5c140127a3215457814dd3fed029ae50` (`Cemberlitas ganimetlerini grup bolgelerine ekle`).
- Recovery sonucu: Yerel makinede ürün kaynak snapshot'ından daha yeni veya daha kapsamlı kaynak kod bulunmadı; `068af74` proje hafızası baseline'ını ekler.
- Eski ChatGPT çalışma geçmişindeki ek özellik iddiaları mevcut kod kabul edilmez; yalnız recovery backlog olarak izlenir.

## Recovery Status

- Code baseline: `068af74088dd7eb323717d93f48072e2b3aac703`.
- Recovery Manifest v1: 30 kayıt.
- `RECOVERED`: 2 (`REC-024`, `REC-030`).
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

2026-09-01 tarihinde temiz dependency kurulumundan sonra:

| Kontrol | Sonuç | Gerçek çıktı |
|---|---|---|
| `npm ci` | PASS | Kurulum tamamlandı; `@esbuild-kit/esm-loader` için deprecated transitive dependency uyarısı verdi. |
| `npm run validate:data` | PASS | 129 eşya, 237 özellik, 67 reçete, 910 kanıt, 179 tılsım, 167 ham efsun satırı, 45 yetenek, 1 yükseltme, 4 materyal edinimi, 3 tılsım edinim kuralı ve 1 oyun mekaniği kuralı. |
| `npm run lint` | PASS | ESLint hata üretmedi. |
| `npm run test:unit` | PASS | 38/38 geçti; 0 fail, 0 skipped. |
| `npm run build` | PASS | Vinext'in beş build aşaması tamamlandı. `/` rotası için statik sınıflandırma uyarısı var. |
| Rendered HTML testi | PASS | 1/1 geçti. |
| `npm test` birleşik kapısı | PASS | Validator, 38 unit test, build ve 1 rendered test birlikte geçti. |

Toplam bağımsız test: **39**. Bu sayı 38 unit + 1 rendered-HTML testinden oluşur.

## Working Modules

- Eşya kataloğu: arama, sınıf/yuva filtresi, detay ve aynı sınıf/yuva karşılaştırması.
- Reçeteler: 67 reçete, malzeme satırları ve eşya detay bağlantısı.
- Build planlayıcı: sınıf uyumlu dokuz yuva, hedef puanlama, toplamlar, URL paylaşımı ve cihazda kayıt/yükleme.
- Grup bölgesi ganimetleri: Sığınaklar, Migrat ve Çemberlitaş kayıtları.
- Kaynak/evidence gösterimi: eşya alanlarını kaynak kayıtlarına bağlayan model.

`WORKING`, akışın koda ve kullanıcı arayüzüne bağlı olduğunu ifade eder; oyun verisinin tamamının `VERIFIED` olduğu anlamına gelmez.

## Partial Modules

- Tılsım sistemi: 179 kayıt UI'a bağlıdır; 24 stat multiplier, 3 damage multiplier ve 3 critical multiplier hesaplanır. 149 kayıt yalnız bilgilendiricidir.
- Yetenek planlayıcı: 45 yetenek, 80 puan bütçesi ve yetenek başına 15 puan sınırı vardır; puanların oyun içi etkisini hesaplamaz.
- Öneriler: kanıtlı stat adlarıyla hedef eşleşmesi yapar; meta, kullanım veya başarı oranı önerisi değildir.
- Kaynaklar: item/evidence akışına bağlıdır; ayrı kaynak tarayıcısı yoktur.
- Efsun çözümleyici: resolver ve testleri vardır; `EnchantAnalyzer` ana kullanıcı akışına bağlı değildir.
- Stat değer altyapısı: canonical ham sayıları korur, desteklenen storage scale sözleşmesini doğrular ve aynı attribute içindeki uyumsuz/bilinmeyen scale değerlerini build ile tılsım hesabından güvenli biçimde dışlar. Exact `scaled_1000` / `scaled_10000` display dönüşümü henüz doğrulanmamıştır.
- Veri foundation: Mevlana Asa için base/upgraded state ayrımı, dört kaynaklandırılmış materyal edinimi, kapsamı genellenmeyen üç tılsım edinim kuralı ve resmî Mavi Gazap/İyileştirme kuralı modellenmiştir; henüz ayrı kullanıcı arayüzüne bağlı değildir.

## Not Found in Current Code

- Madenler modülü.
- Görevler modülü.
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
- 179 tılsım: tamamı `SINGLE_SOURCE`.
- 910 evidence: 775 `SINGLE_SOURCE`, 134 `VERIFIED`/`cross_verified`, 1 `UNKNOWN`/`draft`; bunların 3'ü Mevlana Asa için `USER_GAME_EVIDENCE` claim'idir.
- 45 yetenek: 44 `VERIFIED`/`cross_verified`, 1 `SINGLE_SOURCE`.
- 1 kaynaklandırılmış item upgrade kaydı: Mevlana Asa için 4 base → upgraded contribution; genel `×2` formülü yoktur.
- 4 `SINGLE_SOURCE` materyal edinimi, 3 `SINGLE_SOURCE` genel tılsım edinim kuralı ve 1 `SINGLE_SOURCE` gameplay kuralı.
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
