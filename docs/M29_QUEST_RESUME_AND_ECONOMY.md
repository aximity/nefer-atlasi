# M29 · Görev devam bulucu ve ekonomi gözlemleri mikro şartnamesi

## Oyuncu ihtiyacı

Oyuncu, yeni hesapta hangi zincirde kaldığını tek tek eski görevleri taramadan bulmak; sıradaki NPC, konum, hedef ve ödülü seviyesine uygun görmek istiyor. Paylaşılan topluluk konuşmasındaki ekonomi eleştirileri de kimlik bilgileri yayımlanmadan karar kaydına dönüşmelidir.

## Kapsam

- Dahil: Zincir ve açıklamalı görev kaynaklarından 101 görevlik katalog; son tamamlanan görevi seçme; yalnız bağlantılı ön koşulları işleme; mevcut seviye ve önceki iki seviyeyi gösterme.
- Dahil: İlerleme temposu, alt seviye materyal talebi, tekel baskısı ve etkinlik ekonomisi için oyuncu gözlemi, etki, tekrar planı, çözüm ve ölçü.
- Dahil değil: Sunucu verisi olmadan gerçek düşüş oranı, fiyat endeksi veya ideal farm süresi iddiası; telefon numarası veya kişi adı; zorunlu gear score kapısı.

## Veri ve kaynak

- Görev zincirleri: `fandom-quest-chains-20260826`
- Görev açıklamaları: `fandom-explained-quests-20260826`
- Ekonomi çözüm örnekleri: `albion-lower-tier-sink`, `eve-economic-report-2026`, `wow-item-level-gate`
- Oyuncu gözlemi: Kullanıcının 26 Ağustos 2026 tarihinde paylaştığı WhatsApp konuşmasının anonimleştirilmiş özeti.
- Güven sınırı: Fandom kayıtları KÖ sunucusunda teyit edilmeyi sürdürür; ekonomi konuşması görüş/gözlem katmanındadır.

## Kabul koşulları

- [x] Katalog en az 100 benzersiz, geçerli görev kaydı içerir.
- [x] Tüm görev bağımlılıkları mevcut bir kayda bağlanır ve kendine işaret etmez.
- [x] Son görev seçimi yalnız transitive ön koşulları ve seçilen görevi tamamlar.
- [x] Seviye 20 girildiğinde 1. seviye görev görünmez; alan silinip yeniden yazılabilir.
- [x] Labirent hattında kaynakta görülen 21–22 seviyeleri korunur.
- [x] Oyuncu sohbetinden telefon numarası ve kişi adı site verisine girmez.
- [x] Ekonomi önerileri başarı ölçüsü ve dış çözüm dayanağıyla yayımlanır.

## Geri dönüş noktası

`questPathThrough` ve Görev Atlası devam bulucu kaldırıldığında manuel cihaz ilerlemesi çalışmaya devam eder. Dört ekonomi kaydı `issues.json` içinden bağımsız kaldırılabilir; önceki sekiz sorun kaydı etkilenmez.
