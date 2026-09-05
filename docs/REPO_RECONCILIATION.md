# Repo ve kayıt uzlaştırması — 2026-09-05

## Esas çalışma noktası

- Kök: `C:\Users\stare\Desktop\kodlama\nefer-atlasi-recovered`
- Dal: `recovery/full-source-integration`
- İnceleme başlangıcı HEAD: `7d2073329236e53ebd036f268451c360592c5432`
- Son yayımlanan uygulama: M77 / `f623269d1e53b570b77be6fd5600cfc23f212847`
- Görev sırası: `docs/ROADMAP.md`; devir: `docs/HANDOFF.md`.

## Git kanıtı

GitHub `origin/main` uzak uçtan `git ls-remote` ile doğrulandı:
`c1e98a253a69d3b32d8aaa4b499e3d306b9a5013`. Bu uç yerel `origin/main` ile eşleşiyor.
GitHub'da `recovery/full-source-integration` adlı dal sorguda dönmedi.

Ortak ata `903f097d5c140127a3215457814dd3fed029ae50`.
`origin/main...HEAD` farkı 15/112; yerel eski `main...HEAD` farkı 35/112.
Eski main ayrı `ikv-esya-rehberi` worktree'sinde duruyor. Bu dallar basitçe biri diğerinin gerisinde değildir.

Sites'a M77 ve handoff push'u önceki oturumda başarılıydı. Bu incelemede kimliksiz
`ls-remote chatgpt-origin` authentication hatası verdi; bu sonuç yeni uzak HEAD teyidi değildir.

## Açık somut işler

1. **CI:** GitHub main `.github/workflows/ci.yml` içeriyor; recovered dalında `.github` workflow'u yok. Güncel Linux kurulum/build sözleşmesiyle uyumlandırılıp gerçek CI çalışmasıyla doğrulanmalı. Yerel test başarısı CI başarısı sayılmaz.
2. **İçerik farkı:** GitHub'a özgü 15 commit ve eski yerel main'deki ek 20 commit; eşdeğer, taşınmış, eksik veya çelişkili olarak incelenmeli. `data/quests.json` eski dalda var; güncel dal `lib/quest-catalog.ts` kullanıyor. Yol farkı tek başına veri kaybı kanıtı değildir.
3. **GitHub yedeği:** Recovered dal henüz GitHub'da görünmüyor. İçerik/yayın kapsamı denetimi ardından ayrı dal olarak korunmalı; main zorla değiştirilmemeli.
4. **Merkez:** `projects/` yalnız `gdyon-v3.json`, `merkez.json`, `sarraf.json` içeriyor. Atlas manifesti/bağlantısı kurulu değil; mevcut kimlik doğrulama sözleşmesiyle eklenmeli.
5. **SecondBrain:** Ağustos kartı ve backlog uzlaştırıldı; diğer projelere ait eski notlar korunuyor. Vault önceden kirli olduğundan toplu commit veya uzak yayın yapılmadı.

## Disiplin değerlendirmesi

Repo ve ürün çekirdeği mevcut. Kayıt sürekliliği düzeltiliyor; CI, GitHub yedeği ve Merkez kaydı kapanmadan altyapı bütünüyle tamamlandı sayılmaz.
M78 davranış doğrulaması, ardından mobil/performance ölçümü ve oyuncuya dönük veri/özellik açıkları sıradadır.

## İçerik incelemesi — ilk bulgular

GitHub oturumu `aximity` hesabında yetkili; repository PUBLIC. Ayrı recovered dalı
yedeklenecek, `main` değiştirilmeyecek. HEAD taramasında yüksek kesinlikli GitHub/OpenAI
token ve private-key kalıbı bulunmadı; bu sınırlı kontrol kapsamlı sır taraması değildir.
Git geçmişinde `.env`, private-key ve DB dosya adı sorguları kayıt döndürmedi; `.env.example` takip ediliyor.

| Eski değişiklik | Güncel karşılık / eksik | Durum |
|---|---|---|
| `bda58be` CI | `.github/workflows/ci.yml` geri eklendi; main ve recovered push'larında npm ci, lint, test/build/render | Gerçek GitHub çalışması bekleniyor |
| `32a8e37`, `a27b24e`, `c1e98a2` görevler | Eski JSON 265 kayıt, güncel `lib/quest-catalog.ts` 101 kayıt; eski şema ayrıca minLevel ve kayıt başına evidence içeriyor | Öncelikli birleştirme denetimi |
| `acfa593` özellik ölçekleri | Eski `stat-values.mjs` farklı unit ölçeklerini toplamaz; güncel `sumPublishedStats` yalnız attribute bazında toplar | Koruma eksik; kaynak birimleri ayrıca incelenmeli |
| `c730182` Discord intake | Eski adapter ve intake dosyaları güncel dalda yok; server-updates verisi eşdeğer işlev sayılmaz | Taşıma adayı; bot bağlantısı değildir |
| `1946c0a`, `65009ca`, `0fce8d4` tılsım edinimi | Güncel tılsım üretim/edinim verileri farklı şemada | Alan/kanıt eşdeğerliği henüz doğrulanmadı |
| `05eff04`, `ebce0f2` malzeme ve oyun kuralları | Güncel kaynak çözümleyicileri farklı yapıda | Alan/kanıt eşdeğerliği henüz doğrulanmadı |
| `b87fb32` REC-024 | Güncel dalın bağımsız özellik düzeltmeleri mevcut | Sayısal değer/kanıt karşılaştırması açık |
| `068af74`, `661a1c9`, `0e53581` temel, kimlik, kayıt | AGENTS, docs, Nefer Atlası kimliği mevcut | Yapısal karşılık var; birebir belge birleştirmesi değil |

Görev adı normalizasyonunda eski 160 satır güncel adlarla eşleşmedi. Eski katalogda
tekrarlı adlar olduğundan bu sayı 160 benzersiz kayıp görev anlamına gelmez. Örnekler:
Sahil Temizliği, Salgın hastalık, Kırmızı Tehlike, Kazmalar Hakkında.

Öncelik sırası: CI/yedek → görev ve hesap korumaları için kanıtlı uzlaştırma → Merkez
bağlantısı → M78 davranış doğrulaması. Eski yerel main'in ek 20 commit'i için ayrıntılı
eşdeğerlik incelemesi ayrıca açık; bu tablo tam recovery kapanışı değildir.
