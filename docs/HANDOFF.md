# Nefer Atlası — Oturum Devri

Tarih: 5 Eylül 2026

## Mevcut durum

- Aktif dal: `recovery/full-source-integration`
- Canlı sürüm: `v0.76.0` / `M76`
- Canlı adres: https://ikv-esya-rehberi.gdyon.chatgpt.site/
- Son yayımlanan uygulama commit'i: `fbbaa83f2ee6877a6971cc0051007c4c9ee70207`
- Genel erişim korunuyor; yönetim yetkisi yalnız site sahibinde.

## Bugün tamamlananlar

### M75 — Atlas gezinme denetleyicisi

- URL’den durum yükleme, geri/ileri hareketi ve uygulama içi gezinme tek denetleyicide toplandı.
- Eşya, görev, yetenek, bölge, tılsım ve build derin bağlantıları korundu.
- Genel arama sonuçları ortak kayıt odak akışına bağlandı.

### M76 — Bağımsız modül sahnesi

- On beş çalışma yüzeyinin render eşlemesi `module-surface.tsx` sınırına taşındı.
- Modüllere özel başlangıç kayıtları, yenileme anahtarları ve karakter bağlamı korundu.
- Bölge ganimetinden açılan eşya ayrıntısı modül sahnesine alındı.
- `page.tsx` 83 satırlık site kabuğu ve akış koordinatörüne indirildi.

## Son doğrulama

- Veri doğrulama geçti.
- 230 davranış/birim testi geçti.
- 5 sunucu render testi geçti.
- Üretim derlemesi ve lint geçti.
- Canlı bölge/boss derin bağlantısı HTTP 200 döndürdü ve `v0.76.0` içerdi.

## Sıradaki iş — M77

Ana sayfa giriş alanı ile altbilgiyi sunum bileşenlerine ayır. `page.tsx` yalnız şu sorumlulukları taşısın:

- gezinme denetleyicisini başlatmak,
- menü ve genel arama görünürlüğünü koordine etmek,
- site kabuğu ile aktif modül sahnesini birleştirmek.

Mevcut koyu/altın çalışma yüzeyini, 15 modülü, genel arama davranışını ve bütün derin bağlantıları değiştirme. Yeni oyun verisi ekleme.

## M77 kabul kapısı

- Ana giriş alanı ve altbilgi bağımsız sunum bileşenlerinde yaşar.
- `page.tsx` içinde ürün metni veya modül render eşlemesi kalmaz.
- Klavye `/` ve `Escape` davranışı korunur.
- Mobil 360 px yapısı ve mevcut semantik sınıflar değişmez.
- Veri doğrulama, tam test, render, build ve lint kapıları geçer.
- `SITE_RELEASE`, yol haritası ve değişiklik günlüğü M77’ye güncellenir.

## Başlangıç sırası

1. `AGENTS.md` ve `docs/PROJECT_OS.md` kurallarını yeniden oku.
2. Bu handoff ile `docs/ROADMAP.md` üst bölümünü karşılaştır.
3. `app/page.tsx`, `app/site-navigation.tsx` ve `app/module-surface.tsx` sınırlarını incele.
4. Önce M77 sınır testini yaz, ardından sunum bileşenlerini çıkar.
5. Yerel derin bağlantıyı aç; tam doğrulamadan sonra commit ve mevcut siteye yayın yap.
