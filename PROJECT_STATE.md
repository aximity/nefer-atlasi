# Nefer Atlası Project State

Son güncelleme: 2026-09-01

## Code Baseline

- Ana kaynak: `https://github.com/aximity/nefer-atlasi`
- Branch: `main`
- Baseline commit: `903f097d5c140127a3215457814dd3fed029ae50`
- Commit mesajı: `Cemberlitas ganimetlerini grup bolgelerine ekle`
- Recovery sonucu: Yerel makinede bu commit'ten daha yeni veya daha kapsamlı kaynak kod bulunmadı.
- Eski ChatGPT çalışma geçmişindeki ek özellik iddiaları mevcut kod kabul edilmez; yalnız recovery backlog olarak izlenir.

## Stack

- Node.js `>=22.13.0`; baseline doğrulaması Node.js `v24.14.0` ile yapıldı.
- npm ve lockfile v3 (`package-lock.json`).
- React `19.2.6`, React DOM `19.2.6`.
- Next.js `16.2.6` App Router.
- Vinext `0.0.50`, Vite `8.0.13`.
- Cloudflare Worker ve Wrangler `4.92.0`.
- Drizzle ORM `0.45.2`; gerçek uygulama şeması şu anda boş.
- Node yerleşik test runner'ı ve ESLint `9.39.4`.

## Production Verification

2026-09-01 tarihinde temiz dependency kurulumundan sonra:

| Kontrol | Sonuç | Gerçek çıktı |
|---|---|---|
| `npm ci` | PASS | Kurulum tamamlandı; `@esbuild-kit/esm-loader` için deprecated transitive dependency uyarısı verdi. |
| `npm run validate:data` | PASS | 129 eşya, 236 özellik, 67 reçete, 886 kanıt, 179 tılsım, 167 ham efsun satırı, 45 yetenek. |
| `npm run lint` | PASS | ESLint hata üretmedi. |
| `npm run test:unit` | PASS | 25/25 geçti; 0 fail, 0 skipped. |
| `npm run build` | PASS | Vinext'in beş build aşaması tamamlandı. `/` rotası için statik sınıflandırma uyarısı var. |
| Rendered HTML testi | PASS | 1/1 geçti. |
| `npm test` birleşik kapısı | PASS | Validator, 25 unit test, build ve 1 rendered test birlikte geçti. |

Toplam bağımsız test: **26**. Bu sayı 25 unit + 1 rendered-HTML testinden oluşur.

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

- 129 eşya: 118 `SINGLE_SOURCE`, 11 `CONFLICTED`.
- 236 özellik/stat: 225 `SINGLE_SOURCE`, 11 `CONFLICTED`.
- 67 reçete: tamamı `SINGLE_SOURCE`.
- 179 tılsım: tamamı `SINGLE_SOURCE`.
- 886 evidence: 740 `SINGLE_SOURCE`, 134 `VERIFIED`/`cross_verified`, 11 `CONFLICTED`, 1 `UNKNOWN`/`draft`.
- 45 yetenek: 44 `VERIFIED`/`cross_verified`, 1 `SINGLE_SOURCE`.
- Duplicate ID: 0.
- Orphan ilişki: 0.
- Eksik eşya ID: 0.
- 221 stat `raw_game_value`, 14 stat `puan`, 1 stat `scaled_1000` birimindedir.

## Asset State

- Doğrulanmış eşya görseli: 1.
- Görsel kapsamı: 1/129, yaklaşık `%0,78`.
- Kayıtlı kırık görsel yolu: 0.
- Görseli bulunmayan eşya: 128.
- Doğrulanmamış eşyalara sahte veya tahmini görsel gösterilmez.

## Known P1 Issues

- `raw_game_value` ve `scaled_1000` değerleri kullanıcı ölçeğine dönüştürülmeden UI'da gösteriliyor.
- 11 conflicted eşya/stat kaydı çözülmemiş durumda.
- Veri kümesinin büyük bölümü yalnız tek kaynağa dayanıyor.
- Nefer Atlası repository kimliği ile uygulamadaki `İKV Eşya Rehberi` package, başlık ve eski ChatGPT Sites metadata kimliği uyumsuz.
- CI kalite kapısı bulunmuyor.

## Known P2 Issues

- Tılsım kayıtlarının 149'u hesaplanabilir etki üretmiyor.
- Yetenek planlayıcı gerçek etki simülasyonu yapmıyor.
- Görsel kapsamı çok düşük.
- `package-lock.json` kök adı hâlâ `site-creator-vinext-starter`.
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
