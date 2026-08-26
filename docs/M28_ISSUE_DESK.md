# M28 · Sorun ve Çözüm Masası mikro şartnamesi

## Oyuncu ihtiyacı

Oyuncu, KÖ’de yaşadığı sorunun yalnız şikâyet olarak kalmadan etkisi, tekrar adımı, olası teknik açıklaması ve ölçülebilir çözüm yolu ile birlikte değerlendirilmesini istiyor.

## Kapsam

- Dahil: Maden tükendi hatası; grup bölgesi gecikmesi ve kopması; ölü yaratığın ayakta kalması; sohbet kirliliği; grup bulamama; tank/şifacı açığı; masraf–ödül dengesizliği bildirimi.
- Dahil: P0/P1/P2 ve konu filtresi; oyuncu bildirimi, teknik çıkarım ve çözüm önerisinin ayrı sunulması; kısa/orta/uzun vade; başarı ölçüsü ve dış mühendislik örnekleri.
- Dahil değil: Telemetri olmadan hata nedenini doğrulanmış saymak; ölçülmemiş düşüş oranı yayımlamak; herkese açık yazma veya moderasyonsuz şikâyet formu.

## Veri ve kaynak

- Kaynak kimliği: Kullanıcının 26 Ağustos 2026 tarihli açık bildirimi; `playfab-matchmaking-2026`, `epic-network-replication-2026`, `discord-automod-2026`, `valorant-network-stability-2026`, `bungie-disconnect-codes-2026`.
- Güven durumu: Sorunlar oyuncu bildirimi; teknik nedenler çıkarım; dış kaynaklar yalnız çözüm tasarımına dayanak.
- Çelişki / bilinmeyen: Sunucu günlüğü, gerçek düşüş oranı, rol bazlı bekleme ve sarf maliyeti henüz yok.

## Kabul koşulları

- [x] Sekiz sorun etki alanı ve öncelikle sınıflanır.
- [x] Her kayıtta tekrar planı, oyuncu etkisi, teknik çıkarım, üç çözüm ufku ve ölçü bulunur.
- [x] Oyuncu bildirimi doğrulanmış kök neden gibi gösterilmez.
- [x] 360 px mobil düzeninde kart başlığı ve uzun Türkçe metin üst üste binmez.
- [x] Filtreler klavye ve dokunmayla kullanılabilir; ayrıntılar doğal `details` denetimiyle açılır.
- [x] Veri doğrulama, birim testleri ve üretim derlemesi geçer.

## Geri dönüş noktası

Sorunlar sekmesi, `IssueDesk` bileşeni ve `issues.json` birbirinden bağımsız kaldırılabilir; mevcut Endgame, katkı ve grup panosu akışları değişmeden kalır.
