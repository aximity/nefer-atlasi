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

Son doğrulama: 2026-09-02 — 71/71 unit ve 1/1 rendered-HTML testi, validator PASS, lint PASS, build PASS.

## Recovery Manifest Population

- [x] Recovery Manifest v1 populated: 31 records.
- [x] Evidence Packs 001–002 içindeki kaynak mesaj, çıktı, kullanıcı testi ve bilinen hata kanıtlarını benzersiz recovery kayıtlarıyla eşleştir.
- [x] Her kayıt için mevcut GitHub kapsamını ayır; kanıt yetersizse `NEEDS_VERIFICATION` durumunu koru.

Yeni tarihsel kanıt geldikçe manifest genişletilebilir. Bir madde implementasyona alınmadan önce `AGENTS.md` Recovery Protocol uygulanmalıdır.

## Recovery Implementation Order

Bu sıra başlangıç planıdır; dependency veya veri doğruluğu gereksinimi ortaya çıkarsa `AGENTS.md` kurallarına göre değiştirilebilir.

### Phase 1 — Baseline correctness

- [x] Canonical sayıları koruyan stat storage-scale, güvenli formatter ve calculation compatibility temelini kur.
- [ ] `raw_game_value`, `scaled_1000`, `scaled_10000` ve `puan` için exact oyun içi display dönüşümlerini kaynak kanıtıyla belirle.
- [x] REC-024 conflicted kayıtlarını batch web araştırması, contribution provenance, hesap ve validator testleriyle çöz.
- [x] REC-030 Nefer Atlası görünür ürün, package/lockfile ve metadata kimlik uyumu.
- [x] GitHub Actions CI workflow'unu `main` push ve pull request'ler için kur.
- [x] İlk GitHub-hosted CI çalışmasının başarılı olduğunu doğrula.

### Phase 2 — Existing systems completion

- [x] Discord resmî güncelleme intake sözleşmesini, normalize adapter sınırını, duplicate korumasını ve review-gated claim parserını kur.
- [ ] Bot application oluşturup minimum izinlerle salt-okunur Discord bağlantı adapterını ayrı görevde ekle; tokenı deployment secret üzerinden sağla.
- [ ] Intake kayıtları için kalıcı storage adapterı ve insan review arayüzü tasarla; canonical application ayrı ve explicit kalsın.
- [x] REC-031 genel tılsım edinim altyapısı: kaynak auditinden sonra 119 reçeteli edinim, 60 güvenli fallback ve dahili II/III kademe zinciri.
- [ ] REC-003 Gönül/Mecnun edinim modeli; batch audit 60 `UNKNOWN` kaydı 55 I. kademe + 4 kademesiz özel + REC-004'e ait 1 III. kademe olarak ayırdı. Fandom genel kuralı item-level liste vermiyor; NPC, tılsım adı ve fiyat kanıtı hâlâ açık.
- [ ] REC-004 reçete/üretim çekirdeği; 67 ekipman ve 119 tılsım reçetesi ayrı modellerle doğrulanıyor, tarihsel çekirdek kapsam farkı hâlâ açık.
- [ ] REC-021 dahili tılsım reçete navigasyonu; 119 kaynaklı reçetede malzeme/miktar ve zincir çalışıyor, 60 edinim/reçete hâlâ `UNKNOWN`.
- [ ] Gönül/Mecnun/Topkapı için web dışı oyun içi envanter kanıtı ara; mümkünse tarihli ekran görüntüsü veya video ile tılsım adı, edinim türü, NPC ve fiyatı birlikte doğrula. Kanıtlanana kadar 60 kaydı `UNKNOWN` tut.
- [ ] REC-025 malzeme edinim kaynakları; Jadeit ve Gadolinyum meslek edinimleri doğrulandı, Kondrit için item-level yöntem/NPC kanıtı hâlâ açık. Kanıtlanmayan NPC/drop/lokasyon ayrıntısı üretme.
- [x] REC-025 için altı kaynaklandırılmış materyal edinimini validator ve tılsım reçete kullanıcı akışına bağla; 7 canonical reçete materyalinden yalnız Kondrit açık.
- [ ] REC-008 gerçek yetenek kuralları.

### Phase 3 — Lost high-value user features

- [ ] REC-006 kalan coverage: 258 konum, 265 ödül, 1 objective ve 48 görev seviyesi alanını yalnız batch kaynak kanıtıyla tamamla; 1–49 katalog ve historical seviye 29 regression davranışını koru.
- [ ] REC-009 fotoğrafla malzeme tanıma.
- [ ] REC-010 stoktan en yakın üretim önerisi.
- [ ] REC-007 / REC-026 build önerileri.

### Phase 4 — Content and UX expansion

- [ ] Görsel kapsamı.
- [ ] REC-013 kaynak tarayıcısı.
- [ ] REC-014 global arama.
- [ ] REC-015 UI sadeleştirme.
- [ ] REC-012 grup bölgesi kapsamı.
- [ ] REC-005 maden sistemi.

### Phase 5 — Newer product modules

- [ ] REC-011 ticaret.
- [ ] REC-029 katkı sistemi.
- [ ] REC-016 admin.
- [ ] REC-017 analytics.
- [ ] REC-018 etkinlik/takvim.
- [ ] REC-019 tier list.

## P0

Aktif P0 bulunmuyor. Yeni bir P0 ancak uygulamayı, veri bütünlüğünü veya güvenliği ciddi biçimde bozan doğrulanmış bir sorun için açılmalıdır.

## P1

- [x] Tahmini dönüşüm yapmayan stat scale/formatlama sözleşmesini ve uyumsuz toplam korumasını oluştur.
- [ ] `raw_game_value`, `scaled_1000`, `scaled_10000` ve `puan` için exact normalize/display formüllerini kaynakla doğrula; yalnız kanıtlanan UI değerlerini testle sabitle.
- [x] 11 `CONFLICTED` eşya/stat kaydını Fandom, resmî İKV ve destekleyici arşivlerle çöz; aynı-stat katkılarını ayrı canonical satırlarda koru.
- [x] Uygulama, package ve metadata kimliğini Nefer Atlası kararıyla hizala; doğrulanmamış eski ChatGPT Sites domainini aktif metadata'dan kaldır.
- [x] GitHub CI kur: temiz install, veri validatorü, lint, unit testler, production build ve rendered-HTML testi zorunlu kapı olsun.
- [x] İlk GitHub-hosted CI çalışmasının geçtiğini doğrula.
- [ ] Gerekli branch protection ayarını ayrı repository yönetim adımı olarak değerlendir.
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

## HOST-001 — Production Hosting & Custom Domain

- [ ] `neferatlasi.com` availability/ownership ve `neferatlasi.net` brand-protection durumunu doğrula; gerekirse alternatif domainleri değerlendir.
- [ ] Mevcut Cloudflare deployment, production/preview ayrımı, secrets/environment ve GitHub Actions deployment güvenliğini audit et.
- [ ] Custom domain, DNS, HTTPS, `www` → canonical domain yönlendirmesi ve mümkünse legacy `chatgpt.site` migration/redirect planını hazırla.
- [ ] Rollback strategy, health/smoke check, canonical URL, sitemap/robots ve OpenGraph metadata kapsamını doğrula.
- [ ] Analytics/admin endpoint exposure audit yap.

Bu iş yalnız plan/backlog kaydıdır; bu milestone'da domain satın alma veya DNS değişikliği yapılmayacaktır.

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
