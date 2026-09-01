# Nefer Atlası Next Steps

Bu dosya yalnız açık ve gerçekten yapılacak işleri içerir. Bir madde kod, veri, kullanıcı akışı ve gerekli doğrulamalar tamamlanmadan bitmiş sayılmaz.

## Baseline Gate

- [x] Temiz `npm ci` çalıştır.
- [x] `npm run validate:data` çalıştır.
- [x] `npm run lint` çalıştır.
- [x] `npm run test:unit` çalıştır.
- [x] Production build al.
- [x] Build sonrası rendered-HTML testini çalıştır.
- [x] Birleşik `npm test` kalite kapısını doğrula.

Son doğrulama: 2026-09-01 — 26/26 test, validator PASS, lint PASS, build PASS.

## P0

Aktif P0 bulunmuyor. Yeni bir P0 ancak uygulamayı, veri bütünlüğünü veya güvenliği ciddi biçimde bozan doğrulanmış bir sorun için açılmalıdır.

## P1

- [ ] `raw_game_value`, `scaled_1000` ve `puan` için açık normalize/display sözleşmesi oluştur; UI değerlerini testlerle doğrula.
- [ ] 11 `CONFLICTED` eşya/stat kaydını alan bazında incele; kanıt bulunmadan statüyü yükseltme.
- [ ] Uygulama, package ve metadata kimliğini Nefer Atlası kararıyla hizala; eski ChatGPT Sites domainini kontrollü biçimde kaldır veya güncelle.
- [ ] GitHub CI kur: temiz install, veri validatorü, lint, unit testler, production build ve rendered-HTML testi zorunlu kapı olsun.
- [ ] Tek kaynaklı veriler için kullanıcıya dönük `SINGLE_SOURCE` ifadesini ve riskini açıklaştır.

## P2

- [ ] Doğrulanmış ekran görüntüleriyle görsel kapsamını artır; placeholder veya tahmini görsel kullanma.
- [ ] Tılsım sistemindeki 149 bilgilendirici kaydın hangilerinin güvenilir biçimde hesaplanabileceğini araştır.
- [ ] Yetenek ekranını gerçek etkiler doğrulanana kadar doğru biçimde “puan planlayıcı” olarak konumlandır.
- [ ] Efsun çözümleyiciyi gerçek kullanıcı akışına bağlama veya kapsam dışı bırakma kararı ver.
- [ ] `package-lock.json` starter kök adı ve aktif olmayan ChatGPT/D1 starter kalıntılarını ayrı değişikliklerle değerlendir.
- [ ] Vinext'in `/` rotası için verdiği `Unknown` sınıflandırma uyarısının deploy etkisini doğrula.

## P3

- [ ] Kullanılmayan starter SVG ve `examples/d1` dosyalarını kanıtlı kullanım denetiminden sonra değerlendir.
- [ ] Ana sayfadaki büyük bileşenleri davranış değiştirmeden daha sürdürülebilir sınırlarla ayırmayı planla.
- [ ] README kurulum, platform farkları, doğrulama komutları ve veri güven modelini belgeleyerek genişlet.
- [ ] Eski `chatgpt-origin` remote'u ve ignored deploy arşivleri için saklama politikası belirle.

## Recovery Backlog

Bu maddeler mevcut baseline kodunda bulunmuyor. Eski sohbetlerde anılmış olmaları uygulanmış veya doğrulanmış oldukları anlamına gelmez.

- [ ] Madenler.
- [ ] Görevler.
- [ ] Ticaret.
- [ ] Etkinlik/takvim.
- [ ] Tier list.
- [ ] Fotoğrafla malzeme tanıma.
- [ ] Admin araçları.
- [ ] Analytics.
- [ ] Daha gelişmiş tılsım sistemi.
- [ ] Daha gelişmiş yetenek sistemi.

Her recovery maddesi uygulanmadan önce ürün kapsamı, veri kaynakları, kullanıcı akışı ve test planı ayrı olarak doğrulanmalıdır.
