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

## Recovery Manifest Population

- [x] Recovery Manifest v1 populated: 30 records.
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
- [ ] CI kurulumu.

### Phase 2 — Existing systems completion

- [ ] REC-003 Gönül edinim modeli.
- [ ] REC-004 reçete/üretim çekirdeği.
- [ ] REC-021 dahili tılsım reçete navigasyonu.
- [ ] REC-025 malzeme edinim kaynakları.
- [ ] REC-008 gerçek yetenek kuralları.

### Phase 3 — Lost high-value user features

- [ ] REC-006 görev sistemi.
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
