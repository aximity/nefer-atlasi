# Canlı maden gözlemleri sözleşmesi

## Amaç

Sabit maden noktalarını oyun gerçeği gibi yayımlamak yerine, oyuncuların yaklaşık konum bildirimlerini zaman ve bağımsız sinyallerle ayrı bir topluluk veri sınıfında tutmak.

İlk hedef akış:

`haritayı aç → girişli oyuncu yaklaşık gözlem bildirsin → ikinci oyuncu doğrulasın/yanlışlasın → süre dolunca canlı görünümden çıksın`

## Kanıt ve veri ayrımı

- `gathering-sources.json`, kaynaklandırılmış oyun kataloğudur: meslek, kaynak düğümü, gereken puan ve çıktı kademeleri.
- Canlı gözlem, doğrulanmış spawn noktası değildir. `community_observation` sınıfında ve `approximate` hassasiyetinde kalır.
- Lojman, Zihin Tapınağı, Erg Tozu ve Erg Kalıntısı için erişilebilir kaynaklarda item-level konum ilişkisi bulunamadı. Canonical konum üretilmez.
- Toplayıcılık kaynağı süre veya yeniden doğma oranı vermiyor. Görünürlük süresi ürün politikasıdır; oyun içi yeniden doğma süresi değildir.
- Genel kaynaklar saf/nadir çıktı olasılığının değişebildiğini destekliyor, fakat sabit oran vermiyor. Yüzde veya tahmini şans gösterilmez.

## Olay defteri

- `mine_observation_reported`: bildirici, bölge, kaynak türü, normalize yaklaşık `x/y`, bildirim ve görünürlük bitiş zamanı.
- `mine_observation_signaled`: bağımsız oyuncunun `confirm` veya `reject` sinyali.
- Idempotency anahtarı aynı isteğin ikinci olay üretmesini engeller.
- Bildirici kendi gözlemini doğrulayamaz; aynı oyuncu aynı gözleme ikinci sinyal bırakamaz.
- Süre dolması olayı silmez; yalnız türetilmiş canlı görünümden çıkarır.
- Ham güven puanı formülü kararlaştırılmadı. Çekirdek yalnız bağımsız doğrulama/yanlışlama sayılarını taşır.

## Uygulama sınırı

Bu dilim saf ve deterministik domain çekirdeğidir. Kalıcı D1 şeması, server-side kimlik/rate-limit, harita varlığı ve kullanıcı arayüzü henüz bağlı değildir. Üretim TTL değeri seçilmeden önce gözlem örneklemi ve ürün politikası ayrıca onaylanmalıdır.

## Araştırma izi

- [Toplayıcılık tablosu](https://istanbulkiyametvakti.fandom.com/tr/wiki/Toplay%C4%B1c%C4%B1l%C4%B1k) — kaynak/çıktı kademeleri ve gereken puan; erişim 2026-09-04.
- [Meslekler](https://istanbulkiyametvakti.fandom.com/tr/wiki/Meslekler) — Madenci, Sarraf ve Lokman rollerinin genel tanımı; erişim 2026-09-04.
- [Dükkan](https://istanbulkiyametvakti.fandom.com/tr/wiki/D%C3%BCkkan) — saf ve nadir maden çekme olasılığının artırılabildiği genel iddia; sabit oran veya kaynak-bazlı yüzde içermez; erişim 2026-09-04.
- Fandom API ve genel web taramasında `Lojman`, `Zihin Tapınağı`, `Erg Tozu` ve `Erg Kalıntısı` için güvenli item-level edinim/konum kaydı bulunamadı; bu negatif sonuç canonical veri değildir, yalnız eksik kanıt kaydıdır.
