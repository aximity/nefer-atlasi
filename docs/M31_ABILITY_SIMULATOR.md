# M31 · Bağımsız Yetenek Simülatörü mikro şartnamesi

## Sorun

Yetenek puanı aracı Tılsım sekmesinin altında kaldığı için kullanıcı onu bağımsız bir simülatör olarak bulamıyor; mevcut görünüm yalnız kaydırıcı sunuyor ve seçilen puanın etkisini açıklamıyordu.

## Kabul ölçütleri

- Ekipman planı Donanım adıyla ayrılır; Yetenek hemen yanında ayrı bir ana sekmedir.
- Savaşçı, Büyücü ve Şifacı arasında geçiş yapılabilir.
- 1–49 seviye alanı tamamen silinebilir ve yeniden yazılabilir.
- Puan bütçesi `(seviye - 1) × 2` ve isteğe bağlı +5 hakla hesaplanır.
- Seviye düşürülünce kilitlenen veya bütçeyi aşan puanlar güvenli biçimde geri alınır.
- Her yetenek 0–15 arasında ayarlanır; etkin sonuç ve sonraki eşik kaynak metninden gösterilir.
- KÖ savaşçısında Kanatma yerine Boz Ayı görünür ve aynı puan yuvasını kullanır.
- Plan cihazda saklanabilir ve bağlantıyla paylaşılabilir.
- Tılsım ekranı puan dağıtmadığını açıkça söyler.

## Doğruluk sınırı

Simülatör puan bütçesini ve tooltip eşiklerini gösterir. Nihai hasar veya iyileştirme sonucu; eşya, direnç, hedef, sunucu ayarı ve grup koşuluna bağlı olduğundan kaynak olmadan sayısal DPS/HPS sonucu üretmez.
