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
