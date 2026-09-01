# Nefer Atlası Codex Çalışma Sözleşmesi

Bu repository, Nefer Atlası'nın kod için ana gerçeklik kaynağıdır. Çalışmaya başlamadan önce `PROJECT_STATE.md`, `NEXT_STEPS.md` ve ilgili veri/ürün belgelerini oku. Mevcut durumu bu dosyalardan ve koddan doğrula; eski sohbet iddialarını uygulanmış özellik kanıtı sayma.

## Ürün ve veri kuralları

- Placeholder özellik üretme.
- Sahte, mock veya tahmini oyun verisi ekleme.
- Bir UI elementi gerçek kullanıcı akışına bağlı değilse onu `WORKING` kabul etme.
- Doğrulanmamış oyun bilgisini doğrulanmış gerçek gibi gösterme.
- Veri güven durumlarını koru ve kullanıcıya dürüstçe yansıt:
  - `VERIFIED`: bağımsız kanıt kapılarını geçen bilgi.
  - `SINGLE_SOURCE`: yalnız tek kaynağa dayanan bilgi.
  - `CONFLICTED`: kaynakları veya alanları çelişen bilgi.
  - `UNKNOWN`: doğrulanamayan ya da henüz modellenmeyen bilgi.
- Repository'deki `cross_verified`, `single_source`, `conflicted` ve `draft` değerlerini bu sözleşmeyle tutarlı biçimde yorumla; statü dönüşümlerini kanıtsız yapma.
- Kullanıcı açıkça istemeden mevcut çalışan özellikleri silme veya davranışlarını daraltma.
- Yeni bir özellik gerçek kullanıcı akışına bağlanmadan, gerekli veri kaynağı ve testleri olmadan tamamlandı sayılmaz.
- Test sayısını, kalite metriğini, veri kapsamını veya doğrulama sonucunu uydurma.
- Yalnız gerçekten çalıştırılan komutların gerçek çıktılarını raporla.

## Değişiklik disiplini

- Büyük değişikliklerden önce mevcut testleri çalıştır ve başlangıç durumunu kaydet.
- Değişiklikten sonra en az ilgili testleri ve `npm run validate:data` komutunu çalıştır.
- Ürün davranışını etkileyen değişikliklerde lint, build ve rendered-HTML testini de çalıştır.
- Komut adlarını tahmin etme; `package.json` içindeki gerçek scriptleri kullan.
- Bir kontrol başarısız olursa sonucu gizleme ve başka bir kontrolün başarısını onun yerine koyma.
- Generated build çıktısını kaynak kod veya kurtarılabilir ana sürüm olarak değerlendirme.
- Commit oluşturmadan önce `git status`, `git diff --check` ve ilgili doğrulama sonuçlarını incele.

## Proje hafızası

- `PROJECT_STATE.md`, mevcut ürün durumunun ana özetidir.
- `CHANGELOG.md`, Git geçmişinden veya gerçek değişikliklerden doğrulanabilen geçmişi tutar.
- `NEXT_STEPS.md`, yalnız gerçekten yapılacak açık işleri ve recovery backlog'unu tutar.
- `RECOVERY_MANIFEST.md`, eski ChatGPT çalışma geçmişi ile code baseline arasındaki kayıp geliştirme iddialarının ana kaydıdır.
- Eski ChatGPT çalışma geçmişinde yapıldığı söylenen fakat mevcut kodda bulunmayan özellikler `WORKING` değildir; yalnız `RECOVERY BACKLOG` altında tutulur.

## Recovery Protocol

Eski ChatGPT mesajında bir iş için “tamamlandı” yazması tek başına `RECOVERED` kanıtı değildir. Recovery statüleri `RECOVERY_MANIFEST.md` içinde tanımlandığı anlamlarıyla kullanılmalı ve birbirine karıştırılmamalıdır.

Bir recovery maddesi `RECOVERED` yapılmadan önce:

1. Eski davranış veya istek açık şekilde tanımlanmalı.
2. Mevcut GitHub koduyla çakışma analizi yapılmalı.
3. Gerekli oyun verisi doğrulanmalı.
4. Özellik gerçekten uygulanmalı.
5. Gerçek kullanıcı akışına bağlanmalı.
6. İlgili testler eklenmeli ve çalıştırılmalı.
7. Veri etkileniyorsa `npm run validate:data` geçmeli.
8. `npm run lint` geçmeli.
9. `npm run build` geçmeli.
10. Kullanıcı testi gerekiyorsa tamamlanmalı ve sonucu kaydedilmeli.
11. `PROJECT_STATE.md` güncellenmeli.
12. `CHANGELOG.md` güncellenmeli.
13. `NEXT_STEPS.md` güncellenmeli.
14. Ancak bütün gerekli kapılar kanıtlandıktan sonra recovery statüsü `RECOVERED` yapılmalı.

Kanıt eksikse ayrıntı uydurma; maddeyi `NEEDS_VERIFICATION` durumunda tut. Recovery çalışması mevcut çalışan özelliği sessizce değiştiremez veya doğrulanmamış oyun verisini gerçekmiş gibi yayınlayamaz.

## Context Health Protocol

Her büyük geliştirme milestone'u sonunda:

1. `PROJECT_STATE.md` güncelliğini kontrol et.
2. `CHANGELOG.md` dosyasını gerçek değişikliklerle güncelle.
3. `NEXT_STEPS.md` dosyasını tamamlanan ve yeni açılan işlere göre güncelle.
4. Gerçek test, validation, lint ve build sonuçlarını kaydet.
5. `git status` ile çalışma ağacını kontrol et.

ChatGPT/Codex çalışma oturumu aşırı büyürse yeni oturuma geçmek güvenli olmalıdır. Context durumunu doğrudan ölçebilen güvenilir bir mekanizma yoksa token/context yüzdesi veya sahte eşik raporlama ve ölçtüğünü iddia etme.

Context health değerlendirmesi yalnız şu operasyonel sinyalleri kullanabilir:

- Tekrar eden bağlam kaybı.
- Çok uzun geçmiş bağımlılığı.
- Tool veya network hatalarının artması.
- Eski kararların yeniden açıklanma ihtiyacı.
- `PROJECT_STATE.md` ile konuşma arasında drift oluşması.

Bu sinyaller tek başına “context doldu” kanıtı değildir. Yeni oturuma geçiş gerektiğinde çalışma `PROJECT_STATE.md`, `NEXT_STEPS.md`, `RECOVERY_MANIFEST.md` ve son Git commit üzerinden güvenli biçimde sürdürülebilmelidir.
