# Discord Update Intake

Bu katman, Kıyametin Öncüleri Discord güncelleme mesajlarını canonical oyun verisinden ayrı bir araştırma kuyruğuna alır. Gerçek Discord bağlantısı veya canonical uygulama bu foundation kapsamında değildir.

## Sınırlar

`Discord bot → normalizeDiscordOfficialUpdate → update intake → structured claims → review/evidence → canonical application`

- Adapter yalnız guild, channel, message ID, yayın zamanı, permalink, ham metin, sınırlı attachment metadata ve ingestion zamanını geçirir.
- Yazar, üye profili, telefon, e-posta veya gereksiz kişisel veri saklanmaz.
- Aynı `guild/channel/messageId` ikinci kez gelirse mevcut kayıt döner; yeni kayıt ve claim üretilmez.
- Bir mesaj birden fazla claim üretebilir. Parse edilen claimler `NEEDS_VERIFICATION` başlar; intake katmanı canonical veri yazmaz.
- `TEMPORARY` kampanya ve etkinlik claimleri kalıcı oyun kuralına dönüştürülemez. `UNKNOWN` sınıfı inceleme tamamlanana kadar korunur.

## Güvenlik ve gerçek bağlantı

- Yalnız Discord bot/application hesabı desteklenir. User token ve self-bot kesinlikle desteklenmez.
- Bot token repository'ye, fixture'a veya loglara yazılmaz; deployment secret ya da `.env` üzerinden `DISCORD_BOT_TOKEN` olarak sağlanır.
- Minimum izin yaklaşımı kullanılır: yalnız gerekli sunucuda `View Channels` ve `Read Message History`; mesaj metni gerekiyorsa Discord tarafında gerekli Message Content intent. `Administrator`, mesaj yazma, kanal yönetme veya üye yönetme izni verilmez.
- Adapter auth bilgisi kabul etmez. Bot bağlantı katmanı tokenı loglamadan yalnız normalize edilebilir mesaj payload'unu intake katmanına verir.

## Fixture sınırı

`tests/fixtures/discord-official-update.json`, kullanıcının bu görevde verdiği yedi ifadeden oluşturulmuş sentetik bir `USER_PROVIDED_SUMMARY` fixture'ıdır; özgün Discord mesajı veya canonical oyun kanıtı değildir. Permalink bu nedenle `null` tutulur.
