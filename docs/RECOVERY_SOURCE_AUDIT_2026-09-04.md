# Recovery source audit — 2026-09-04

## Bulgu

ChatGPT Sites kaynak deposunun `main` dalında, daha önce ürün snapshot'ı kabul edilen
`903f097d5c140127a3215457814dd3fed029ae50` commit'inden sonra 100 ek commit bulundu.
Uzak uçtaki son doğrulanan commit:

- `9b5f65cd2ed1a3ec34d6f0259f42039c8b7a7126`
- `30 Ağustos KÖ güncellemesini işle`

Bu kaynak yalnız dağıtım çıktısı değildir. Fotoğrafla stok tanıma, pazar sinyalleri,
katkı/moderasyon, analytics, etkinlik, grup ve lonca akışları, üretim ağı, görev atlası,
maden rotaları ve D1/R2 kalıcılığı gibi tarihsel modüllerin gerçek kaynak kodunu içerir.

## Güvenlik kararı

Daha dar GitHub recovery dalı Sites kaynağının üzerine zorla gönderilmedi. Tam kaynak ayrı
`recovery/full-source-integration` dalında korundu ve yeni canlı maden gözlemi sözleşmesi
bu tabanın mevcut D1/R2 mimarisine taşındı.

## Doğrulama

Tam kaynak tek başına temiz kurulumdan sonra 187 birim ve 5 render testini geçti.
Maden gözlemi entegrasyonu sonrasında birleşik kapı 213 birim ve 5 render testini,
production build'i ve ESLint taramasını geçti.

## Sonraki kabul kapısı

Birleşik commit Sites kaynak deposuna fast-forward gönderilmeli; paketlenen aynı commit
yayınlanmalı; D1 `DB` binding'i, `0009` migration'ı ve anonim GET/kimliksiz POST çalışma
zamanı davranışı üretim URL'sinde doğrulanmalıdır. Harita üzerindeki kullanıcı akışı ayrı
bir sonraki ürün dilimidir.
