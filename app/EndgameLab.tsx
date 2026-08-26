"use client";

import { useEffect, useState } from "react";
import CommunityEvents from "./CommunityEvents";
import GuildLogistics from "./GuildLogistics";

type Panel = "Durum" | "Sorunlar" | "Takvim" | "Lonca" | "Pazar" | "Roller" | "Veri" | "Premium" | "Yol haritası";
type IssueId = "repeat" | "group" | "economy" | "anka" | "client";

const sourceLinks = {
  guide: "https://kiyametoyun.net/rehber",
  home: "https://kiyametoyun.net/",
  craftBag:
    "https://help.elderscrollsonline.com/app/answers/detail/a_id/34329/~/what-is-a-craft-bag-in-the-elder-scrolls-online",
  accountBank:
    "https://worldofwarcraft.blizzard.com/en-gb/news/24115313/get-the-band-together-for-warbands",
  partyFinder: "https://na.finalfantasyxiv.com/game_manual/pp/",
  armory: "https://www.elderscrollsonline.com/en-us/updates",
  weeklyObjectives: "https://www.guildwars2.com/en-gb/secrets-of-the-obscure/",
  weeklyChoice: "https://worldofwarcraft.blizzard.com/en-us/news/23778646/",
  ikvPlus: "https://istanbuloyun.com/PlusPackage.aspx",
  ikvChatProduct: "https://www.istanbuloyun.com/News.aspx?NewsId=567",
  bdoMarket: "https://www.world.blackdesertm.com/Ocean/Wiki?wikiNo=2",
  gw2Market: "https://help.guildwars2.com/hc/en-us/articles/222384087-Missing-Gold",
  wowAuction: "https://worldofwarcraft.blizzard.com/en-us/news/23236723/visions-of-nzoth-auction-house-update-preview",
  wowCrafting: "https://worldofwarcraft.blizzard.com/en-us/news/23876529",
  ffxivParty: "https://na.finalfantasyxiv.com/game_manual/pp/",
  esoGroup: "https://help.elderscrollsonline.com/app/answers/detail/a_id/63691/~/how-do-i-use-the-new-group-finder-introduced-in-update-40",
  gw2LfgPolicy: "https://help.guildwars2.com/hc/en-us/articles/360025563714-Policy-Looking-For-Group-LFG-Tool",
  valorantNetwork:
    "https://playvalorant.com/en-us/news/game-updates/valorant-game-and-network-instability-basics/",
  fortnitePacketLoss:
    "https://www.epicgames.com/help/c-202300000001636/c-202300000001719/how-can-i-check-if-i-have-packet-loss-while-playing-fortnite-a202300000012783?lang=en-US",
  destinyDisconnect:
    "https://help.bungie.net/hc/en-us/articles/360049496971-Error-Codes-Disconnected-From-Destiny",
  eveLogLite:
    "https://support.eveonline.com/hc/en-us/articles/5885024878236-LogLite-tool",
  esoPathping:
    "https://help.elderscrollsonline.com/app/answers/detail/a_id/37818/~/how-do-i-read-my-pathping-results",
};

type IdeaDepth = {
  foundation: string;
  load: string;
  risk: string;
  metric: string;
  sourceLabel: string;
  source?: string;
};

const problems: Array<{
  id: IssueId;
  short: string;
  title: string;
  observation: string;
  guardrail: string;
  ideas: Array<{ name: string; basis: string; pilot: string }>;
}> = [
  {
    id: "repeat",
    short: "Tekrar",
    title: "Endgame aynı içeriğe dönüyor",
    observation:
      "Yeni bölge üretmeden de mevcut Sığınak, Migrat ve Çemberlitaş tekrar oynanabilir hâle getirilebilir.",
    guardrail:
      "Ödül gücü sürekli yükselmemeli; çeşitlilik mekanik, rota ve hedef üzerinden gelmeli.",
    ideas: [
      {
        name: "Haftalık bölge mutasyonu",
        basis: "Her hafta tek bir mekanik değişir: konum, direnç, ek saldırı veya süre hedefi.",
        pilot: "Önce tek bölgede 4 haftalık rotasyon.",
      },
      {
        name: "Bölge sözleşmeleri",
        basis: "Oyuncuya öldürme dışında koruma, süre, kayıpsız tamamlama veya rol hedefi verir.",
        pilot: "Haftada üç görev; kozmetik ve üretim ödülü.",
      },
      {
        name: "Kademeli zorluk",
        basis: "Aynı harita için normal, uzman ve meydan okuma kuralları içerik ömrünü uzatır.",
        pilot: "Can şişirmek yerine bir yeni mekanik ekle.",
      },
      {
        name: "Eski bölge rotasyonu",
        basis: "Haftanın bölgesine fazladan jeton vererek oyuncu nüfusunu tek noktada toplar.",
        pilot: "Ödül farkını küçük tut; zorunluluk yaratma.",
      },
      {
        name: "Takım rekorları",
        basis: "Süre, kayıpsız bitiriş ve farklı sınıf bileşimi yeni hedef üretir.",
        pilot: "Güç ödülü yok; unvan, görünüm ve arşiv kaydı.",
      },
    ],
  },
  {
    id: "group",
    short: "Grup",
    title: "Grup kurmak içerikten uzun sürebiliyor",
    observation:
      "Rol ihtiyacı görünür değilse oyuncu sohbet takibi yapar, eksik rolü geç fark eder ve grup dağılır.",
    guardrail:
      "Otomatik eşleştirme şart değil; ilk sürüm yalnız ilan, rol ve hazır kontrolü olabilir.",
    ideas: [
      {
        name: "Rol bazlı grup ilanı",
        basis: "Bölge, hedef, sınıf, rol ve saat tek ilanda görünür.",
        pilot: "Sadece üç grup bölgesiyle başla.",
      },
      {
        name: "Hazır kontrolü",
        basis: "Lider tek tuşla hazır, eksik eşya ve bağlantı durumunu görür.",
        pilot: "İlk sürüm yalnız hazır / değil sinyali.",
      },
      {
        name: "Grup şablonları",
        basis: "Lider sık kullandığı tank, şifa, hasar ve direnç kırma dağılımını kaydeder.",
        pilot: "Üç ücretsiz şablon yeterli.",
      },
      {
        name: "Yedek oyuncu kuyruğu",
        basis: "Ayrılan oyuncunun rolüne uygun gönüllü yedek çağrılır.",
        pilot: "Otomatik ışınlama olmadan bildirim sistemi.",
      },
      {
        name: "Grup kurma veri pilotu",
        basis: "Bölge, eksik rol, bekleme süresi ve sonucun gönüllü kaydı gerçek darboğazı gösterir.",
        pilot: "Discord yönlendirmesi + tek standart site formu.",
      },
      {
        name: "Topluluk etkinlik takvimi",
        basis: "Bölge, amaç, saat ve eksik rolleri tek davette birleştirerek dağınık kanallardaki oyuncuları aynı zaman aralığında toplar.",
        pilot: "Önce site üzerinde paylaşılabilir davet ve takvime ekleme; oyun sunucusuna yük yok.",
      },
    ],
  },
  {
    id: "economy",
    short: "Ekonomi",
    title: "Farm tekeli ve belirsiz fiyat güveni azaltıyor",
    observation:
      "Sorun yalnız düşük fiyat değildir; az sayıda rota, fiyat geçmişinin olmaması ve malzeme talebinin dar kalmasıdır.",
    guardrail:
      "Yönetici fiyat belirlememeli ve otomatik satın alma eklenmemeli; sistem bilgi ve alternatif üretmeli.",
    ideas: [
      {
        name: "Gerçekleşen fiyat geçmişi",
        basis: "İlan değil, tamamlanan satışların medyanı ve adedi gösterilir.",
        pilot: "Önce en çok işlem gören 20 malzeme.",
      },
      {
        name: "Dağıtılmış maden noktaları",
        basis: "Aynı kaynağın birden fazla rotada bulunması tek noktayı tutmayı zorlaştırır.",
        pilot: "Konumları haftalık değil, kontrollü havuzdan seç.",
      },
      {
        name: "Üretim siparişi panosu",
        basis: "Alıcı malzeme ve ücret koyar; üretici hizmet verir. Talep görünür olur.",
        pilot: "Bağlayıcı olmayan ilan panosuyla başla.",
      },
      {
        name: "Alternatif jeton yolu",
        basis: "Darboğaz malzemesi sınırlı haftalık jetonla alınabilir; farm değerini yok etmez.",
        pilot: "Haftalık düşük limit ve piyasa izleme.",
      },
      {
        name: "Kalıcı malzeme tüketimi",
        basis: "Lonca dekoru, görünüm ve etkinlik katkısı stok fazlasını savaş gücü satmadan eritir.",
        pilot: "Tek bir lonca projesiyle talebi ölç.",
      },
    ],
  },
  {
    id: "anka",
    short: "Anka",
    title: "Anka tıklamayı azaltıyor, sistemi tamamlamıyor",
    observation:
      "Otomatik çanta toplama gerekli bir konfor iyileştirmesi; değer, hangi çantanın toplandığı ve sonrasında ne kadar işlem gerektiğiyle ölçülmeli.",
    guardrail:
      "Pet ganimet şansını, düşen adedi, hareket hızını veya savaş gücünü artırmamalı.",
    ideas: [
      {
        name: "Gelişmiş ganimet filtresi",
        basis: "Tür, nadirlik ve beyaz listeye göre toplar; çöpleri çantaya doldurmaz.",
        pilot: "Filtre kapalıyken mevcut davranış korunur.",
      },
      {
        name: "Dolu çanta güvenliği",
        basis: "Kritik eşya yerdeyken uyarır, düşük öncelikli toplamayı durdurur.",
        pilot: "Silme veya satma otomasyonu olmadan.",
      },
      {
        name: "Otomatik istifleme",
        basis: "Aynı malzemeleri birleştirir ve maden / üretim / görev olarak ayırır.",
        pilot: "Yalnız mevcut çanta kuralları içinde.",
      },
      {
        name: "Hesap ortaklı malzeme çantası",
        basis: "Karakterler arası aktarma yükünü azaltır; üretim doğrudan buradan okuyabilir.",
        pilot: "Önce sınırlı malzeme kategorisi.",
      },
      {
        name: "Tur özeti",
        basis: "Süre, toplanan adet ve nadir çıktı raporu farm verimini görünür kılar.",
        pilot: "Kişisel veri; konum ve doğma zamanı paylaşmaz.",
      },
    ],
  },
  {
    id: "client",
    short: "İstemci",
    title: "Eski istemci temel sürtünmeler üretiyor",
    observation:
      "Büyük motor yenilemesi uzun ve risklidir. Önce oyuncunun her gün karşılaştığı küçük kayıplar hedeflenmeli.",
    guardrail:
      "Her iyileştirme ayrı açılıp kapatılabilmeli ve eski arayüz davranışı geri alınabilmeli.",
    ideas: [
      {
        name: "Arayüz ölçekleme",
        basis: "Metin, çanta ve yetenek paneli farklı ekranlarda okunur kalır.",
        pilot: "Yüzde 80 / 100 / 120 seçenekleri.",
      },
      {
        name: "Tuş profilleri",
        basis: "PvE, PvP ve farm için ayarlar kaydedilir; yeniden kurulum azalır.",
        pilot: "Üç yerel profil.",
      },
      {
        name: "Eşya karşılaştırma",
        basis: "Takılı ve seçilen eşyanın farkları aynı pencerede renkli gösterilir.",
        pilot: "Yalnız doğrulanmış sayısal alanlar.",
      },
      {
        name: "Çökme sonrası ganimet koruması",
        basis: "Hak edilmiş fakat alınamamış ödül geçici teslim kutusuna gider.",
        pilot: "Sadece grup bölgesi son sandığı.",
      },
      {
        name: "Bağlantı Merkezi",
        basis: "RTT, dalgalanma, FPS ve kopma makbuzu görünür olur; kesin neden yalnız protokol kanıtı varsa söylenir.",
        pilot: "Mevcut heartbeat verisinden saniyede en fazla bir yerel özet.",
      },
    ],
  },
];

const ideaDepth: Record<string, IdeaDepth> = {
  "Haftalık bölge mutasyonu": {
    foundation: "Can ve hasar şişirmek yerine tek bir okunabilir kuralı haftalık değiştirir.",
    load: "Düşük–orta · örnek açılırken tek yapılandırma okunur.",
    risk: "Aynı hafta tek zorunlu rota oluşabilir; ödül farkı küçük tutulmalı.",
    metric: "Bölge tekrar oranı, başarısız deneme ve tamamlama süresi.",
    sourceLabel: "GW2 haftalık hedef yaklaşımı",
    source: sourceLinks.weeklyObjectives,
  },
  "Bölge sözleşmeleri": {
    foundation: "Öldürme dışında koruma, süre ve kayıpsız bitiriş gibi açık hedefler verir.",
    load: "Orta · oyuncu başına birkaç ilerleme sayacı yazılır.",
    risk: "Günlük görev hissine dönüşmemesi için az ve seçilebilir olmalı.",
    metric: "Seçilen sözleşme dağılımı ve haftalık bitirme oranı.",
    sourceLabel: "WoW haftalık ödül seçimi",
    source: sourceLinks.weeklyChoice,
  },
  "Kademeli zorluk": {
    foundation: "Aynı bölgeyi farklı mekanik katmanlarıyla yeniden kullanır; yeni harita gerektirmez.",
    load: "Orta · ayrı yaratık kopyası yerine örnek kural bayrakları kullanılır.",
    risk: "Yalnız can artışı yaparsa savaş uzar, oynanış derinleşmez.",
    metric: "Kademe seçimi, terk oranı ve ödül başına süre.",
    sourceLabel: "KÖ için mekanik pilot çıkarımı",
  },
  "Eski bölge rotasyonu": {
    foundation: "Haftanın bölgesini görünür yapıp küçük ek ödülle nüfusu toplar.",
    load: "Düşük · haftalık takvim ve ödül çarpanı.",
    risk: "Tek bölgeyi mecbur kılmamalı; alternatif rotalar açık kalmalı.",
    metric: "Bölgeler arası oyuncu dağılımı ve grup dolma süresi.",
    sourceLabel: "GW2 rotasyon mantığı",
    source: sourceLinks.weeklyObjectives,
  },
  "Takım rekorları": {
    foundation: "Güç yerine süre, kayıpsız bitiriş ve farklı sınıf bileşimini arşivler.",
    load: "Düşük · bitişte tek özet kayıt, liste önbellekten okunur.",
    risk: "Hileli veya eksik koşullu kayıtlar moderasyon gerektirir.",
    metric: "Katılan takım sayısı ve farklı kompozisyon adedi.",
    sourceLabel: "KÖ geri alınabilir pilotu",
  },
  "Rol bazlı grup ilanı": {
    foundation: "Bölge, amaç, eksik sınıf/rol ve saat tek ilan kaydında tutulur.",
    load: "Düşük · sohbet mesajı akışı yerine süreli tek ilan kaydı.",
    risk: "Aşırı filtre küçük oyuncu kitlesini bölebilir; temel alanlarla başlanmalı.",
    metric: "İlan açılışı–giriş süresi ve dolmadan kapanan ilan oranı.",
    sourceLabel: "FFXIV Party Finder",
    source: sourceLinks.ffxivParty,
  },
  "Hazır kontrolü": {
    foundation: "Lider grup üyelerinden yalnız hazır/değil cevabı ister; ekipman denetlemez.",
    load: "Çok düşük · kısa ömürlü grup durumu.",
    risk: "Otomatik eşya şartı dışlayıcı olabilir; ilk sürümde bulunmamalı.",
    metric: "Giriş öncesi bekleme ve hazır olmayan oyuncu nedeniyle iptal.",
    sourceLabel: "FFXIV hazır kontrolü ve parti sistemi",
    source: sourceLinks.ffxivParty,
  },
  "Grup şablonları": {
    foundation: "Lider sık kullandığı rol dağılımını istemci tarafında kaydeder.",
    load: "Yok denecek kadar az · ilk pilot yerel ayar dosyası olabilir.",
    risk: "Şablon meta zorunluluğu gibi gösterilmemeli.",
    metric: "Tekrar kullanılan şablon ve ilan açma süresi.",
    sourceLabel: "ESO ilan ölçütleri",
    source: sourceLinks.esoGroup,
  },
  "Yedek oyuncu kuyruğu": {
    foundation: "Ayrılan rol için çevrim içi gönüllülere bildirim verir; otomatik ışınlama yapmaz.",
    load: "Düşük–orta · ilan başına sınırlı bildirim ve kısa TTL.",
    risk: "Bildirim spamı; oyuncu başına bekleme ve sessize alma gerekir.",
    metric: "Yedek bulma süresi ve yarıda kalan koşu oranı.",
    sourceLabel: "ESO Group Finder",
    source: sourceLinks.esoGroup,
  },
  "Grup kurma veri pilotu": {
    foundation: "Önce gerçek bekleme, eksik rol ve sonuç verisi toplanır; oyun koduna dokunulmaz.",
    load: "Oyun sunucusunda sıfır · site formu ve moderasyon kuyruğu.",
    risk: "Gönüllü veri yanlı olabilir; sonuçlar kesin meta diye sunulmamalı.",
    metric: "Haftalık nitelikli kayıt ve tekrar eden katkıcı sayısı.",
    sourceLabel: "Topluluk veri pilotu",
  },
  "Topluluk etkinlik takvimi": {
    foundation: "Sohbette tekrarlanan ilanı yapılandırılmış bölge, amaç, saat ve eksik rol kaydına çevirir.",
    load: "Oyun sunucusunda sıfır · ilk pilot yalnız site bağlantısı ve standart .ics dosyası üretir.",
    risk: "Eski, yinelenen veya yanıltıcı ilanlar; süre sonu, raporlama ve resmî/topluluk etiketi zorunlu olmalı.",
    metric: "Davet açılışı, takvime ekleme, planlanan başlangıçta kurulan grup ve dolma süresi.",
    sourceLabel: "Nefer Atlası topluluk koordinasyon pilotu",
  },
  "Gerçekleşen fiyat geçmişi": {
    foundation: "İlan fiyatını değil tamamlanmış işlemin medyanı, adedi ve tarihini gösterir.",
    load: "Düşük · satışta olay kaydı, günlük toplu özet ve önbellek.",
    risk: "Az işlemli üründe yanıltıcı değer; minimum hacim eşiği gerekir.",
    metric: "İlan–satış farkı, işlem süresi ve fiyat oynaklığı.",
    sourceLabel: "GW2 Trading Post emanet modeli",
    source: sourceLinks.gw2Market,
  },
  "Dağıtılmış maden noktaları": {
    foundation: "Aynı kaynağı kontrollü birkaç rota havuzuna dağıtarak fiziksel tekeli azaltır.",
    load: "Orta · mevcut doğma yöneticisine sınırlı rota havuzu eklenir.",
    risk: "Arzı aşırı artırıp fiyatı çökertmemeli; önce küçük örneklem.",
    metric: "Rota yoğunluğu, saatlik çıktı ve fiyat değişimi.",
    sourceLabel: "KÖ saha verisi gerektiren pilot",
  },
  "Üretim siparişi panosu": {
    foundation: "Alıcı reçete, malzeme ve teklif bırakır; üretici çevrim dışıyken de siparişi görebilir.",
    load: "Orta · süreli sipariş, emanet ve atomik teslim işlemi.",
    risk: "Eksik malzeme ve kalite anlaşmazlığı; şema katı olmalı.",
    metric: "Sipariş dolma süresi, iptal ve başarıyla teslim oranı.",
    sourceLabel: "WoW Crafting Orders",
    source: sourceLinks.wowCrafting,
  },
  "Alternatif jeton yolu": {
    foundation: "Darboğaz malzemesine düşük haftalık sınırla garanti ilerleme sağlar.",
    load: "Düşük · hesap başına haftalık sayaç ve NPC alışverişi.",
    risk: "Farmı anlamsızlaştırmamalı; tavan piyasa verisine göre ayarlanmalı.",
    metric: "Jeton kullanımı, maden fiyatı ve farm katılımı.",
    sourceLabel: "KÖ ekonomi pilotu",
  },
  "Kalıcı malzeme tüketimi": {
    foundation: "Lonca dekoru ve kozmetik hedefler stok fazlasını güç satmadan tüketir.",
    load: "Düşük · mevcut envanter eksiltme ve proje sayacı.",
    risk: "Zorunlu lonca vergisine dönüşmemeli; gönüllü ve görünür olmalı.",
    metric: "Tüketilen stok, katılımcı sayısı ve fiyat dengesi.",
    sourceLabel: "KÖ kozmetik tüketim önerisi",
  },
  "Gelişmiş ganimet filtresi": {
    foundation: "Anka yalnız sunucunun zaten düşürdüğü çantaları tür, nadirlik ve beyaz listeye göre toplar.",
    load: "Çok düşük · tercih istemcide, sunucuya yalnız normal toplama isteği gider.",
    risk: "Yanlış filtre değerli eşyayı bırakabilir; güvenli varsayılan ve uyarı gerekir.",
    metric: "Tur başına gereksiz eşya, manuel tıklama ve filtre geri alma sayısı.",
    sourceLabel: "WoW alan yağması yaklaşımı",
    source: "https://worldofwarcraft.blizzard.com/ko-kr/news/9861870",
  },
  "Dolu çanta güvenliği": {
    foundation: "Kritik eşya yerdeyken kapasite uyarısı verir; otomatik silme veya satma yapmaz.",
    load: "Çok düşük · mevcut çanta kapasitesi ve eşya sınıfı kontrolü.",
    risk: "Yanlış nadirlik sınıfı; kullanıcı beyaz listesi öncelikli olmalı.",
    metric: "Dolu çanta nedeniyle kaçan yüksek değerli eşya bildirimi.",
    sourceLabel: "KÖ güvenli QoL pilotu",
  },
  "Otomatik istifleme": {
    foundation: "Toplama tamamlanınca aynı kimlikteki malzemeleri mevcut yığın sınırında birleştirir.",
    load: "Düşük · her eşya yerine tur sonunda toplu envanter işlemi.",
    risk: "Bağlı/bağsız veya farklı özellikli eşyalar asla birleşmemeli.",
    metric: "Boşalan yuva, envanter işlem sayısı ve hata kaydı.",
    sourceLabel: "BDO pazar deposu istifleme örneği",
    source: sourceLinks.bdoMarket,
  },
  "Hesap ortaklı malzeme çantası": {
    foundation: "Yalnız üretim malzemelerini hesap düzeyinde tutar; üretim buradan okuyabilir.",
    load: "Orta–yüksek · eşzamanlı karakter erişimi ve atomik kayıt gerekir.",
    risk: "Çoğaltma açığı en kritik risk; ilk Anka geliştirmesi olmamalı.",
    metric: "Karakterler arası aktarım, üretim süresi ve tutarsızlık hatası.",
    sourceLabel: "ESO Craft Bag",
    source: sourceLinks.craftBag,
  },
  "Tur özeti": {
    foundation: "Süre ve toplanan adetleri yerel oturumda sayar; doğma koordinatı paylaşmaz.",
    load: "Yok denecek kadar az · varsayılan olarak istemci tarafında.",
    risk: "Kesin düşme oranı sanılmamalı; örneklem büyüklüğü gösterilmeli.",
    metric: "Özeti açan oyuncu ve paylaşılan doğrulanabilir tur sayısı.",
    sourceLabel: "KÖ veri toplama pilotu",
  },
  "Arayüz ölçekleme": {
    foundation: "Metin ve panel ölçüsünü sabit üç profil ile değiştirir; oyun mantığına dokunmaz.",
    load: "Yok · yalnız istemci çizimi.",
    risk: "Taşma ve tıklama alanı hataları; ekran oranı matrisiyle test edilmeli.",
    metric: "Profil kullanımı ve arayüz taşma hatası.",
    sourceLabel: "FFXIV UI özelleştirme rehberi",
    source: "https://na.finalfantasyxiv.com/uiguide/",
  },
  "Tuş profilleri": {
    foundation: "PvE, PvP ve farm için yerel tuş dizilerini kaydeder; sunucu verisi istemez.",
    load: "Yok · yerel ayar dosyası.",
    risk: "Bozuk profil oyuncuyu kilitlememeli; varsayılana dön düğmesi şart.",
    metric: "Profil değişimi ve ayar sıfırlama ihtiyacı.",
    sourceLabel: "KÖ istemci QoL pilotu",
  },
  "Eşya karşılaştırma": {
    foundation: "Takılı ve seçilen eşyadaki aynı özellikleri istemcide fark olarak renklendirir.",
    load: "Yok · zaten gelen eşya verisinin yerel karşılaştırması.",
    risk: "Efsun birimleri normalize edilmeden toplam puan üretmemeli.",
    metric: "Karşılaştırma açılışı ve yanlış değer bildirimi.",
    sourceLabel: "KÖ kaynaklı alanlarla sınırlı pilot",
  },
  "Çökme sonrası ganimet koruması": {
    foundation: "Yalnız kazanımı sunucuda kesinleşmiş son sandık ödülünü süreli emanete alır.",
    load: "Orta–yüksek · idempotent ödül kaydı ve teslim kuyruğu.",
    risk: "Çoğaltma ve sahte hak iddiası; işlem kimliği olmadan yapılmamalı.",
    metric: "Kurtarılan ödül, mükerrer teslim ve destek talebi.",
    sourceLabel: "KÖ için ileri aşama güvenlik özelliği",
  },
  "Bağlantı Merkezi": {
    foundation: "Mevcut yanıt sürelerinden RTT ve dalgalanma üretir; kopmada kullanıcıya zaman damgalı, güven seviyeli bir makbuz verir.",
    load: "Çok düşük · yeni yüksek frekanslı paket yok; 30 saniyelik halka tampon yalnız RAM'de.",
    risk: "Sıra numarası yoksa paket kaybı hesaplanamaz; arayüz yalnız yanıt kaçırma veya zaman aşımı demeli.",
    metric: "Tanı kaydıyla çözülen destek talebi, yanlış kesin neden oranı ve istemci ek yükü.",
    sourceLabel: "VALORANT ağ kararlılığı yaklaşımı",
    source: sourceLinks.valorantNetwork,
  },
};

const marketBenchmarks = [
  { name: "Black Desert", use: "Merkezî pazar deposu, anlık satın alma ve ön sipariş", avoid: "Dar fiyat bantlarını küçük KÖ ekonomisine aynen kopyalama", url: sourceLinks.bdoMarket },
  { name: "Guild Wars 2", use: "Satış emanet sistemi, alış emri ve ayrılmış para", avoid: "KÖ hacmi ölçülmeden sabit yüksek kesinti oranı", url: sourceLinks.gw2Market },
  { name: "World of Warcraft", use: "Malzemeleri tek emir defterinde adet ve birim fiyatla birleştirme", avoid: "Ekipman ile yığınlanabilir malzemeyi aynı arama akışına sıkıştırma", url: sourceLinks.wowAuction },
  { name: "WoW Crafting Orders", use: "Alıcı malzeme koyar, üretici çevrim dışı siparişi tamamlar", avoid: "Kalite/efsun koşulu tanımlanmadan serbest metin anlaşması", url: sourceLinks.wowCrafting },
];

const marketCore = [
  { title: "Merkezî emir defteri", text: "Satış emri ve alış emri fiyat–zaman önceliğiyle eşleşir; satıcı karakterin çevrim içi kalması gerekmez." },
  { title: "Emanet kasa", text: "Listelenen eşya ve alış emrindeki para sunucu tarafında kilitlenir; çift harcama ve sahte satış engellenir." },
  { title: "İki ayrı ürün akışı", text: "Maden/malzeme adet ve birim fiyatla; ekipman ise tam ad, yuva, sınıf, seviye, renk ve efsunla aranır." },
  { title: "Gerçek fiyat geçmişi", text: "7/30 günlük medyan, işlem adedi ve son satış zamanı gösterilir; satılmamış ilan fiyatı piyasa değeri sayılmaz." },
  { title: "Üretim siparişi", text: "Alıcı reçete ve malzemeyi seçer, Silahtar/Zırhçı/Kimyager işi kabul eder; sonuç emanet üzerinden teslim edilir." },
  { title: "Ayrı grup panosu", text: "Pazar ilanı ile grup ilanı kesin biçimde ayrılır; sohbet yalnız iletişim için kalır." },
];

const marketLoadRules = [
  "Dünyada tezgâh, pazar karakteri veya sürekli açık dükkân nesnesi oluşturma.",
  "Arama sonuçlarını sayfala, 250–400 ms geciktir ve kısa süre önbellekten sun.",
  "Fiyat geçmişini her sorguda hesaplama; satış olaylarından saatlik/günlük özet üret.",
  "Eşleşmeyi dünya hareket döngüsünde değil ayrı işlem kuyruğunda yap.",
  "Her listeleme ve teslim için tek işlem kimliği, denetim kaydı ve tekrar çalıştırma koruması kullan.",
  "Hesap başına ilan sınırı, arama hız sınırı ve süre sonu temizliği uygula.",
];

const paidIdeas = [
  {
    name: "Malzeme çantası",
    value: "Çok yüksek",
    risk: "Çok düşük",
    rule: "Güç vermez; yalnız hesap ortaklı saklama ve üretim erişimi sağlar.",
  },
  {
    name: "Teçhizat sayfaları",
    value: "Yüksek",
    risk: "Düşük",
    rule: "Sekiz yuvayı kaydeder; yalnız güvenli bölgede değişir.",
  },
  {
    name: "Saha defteri",
    value: "Yüksek",
    risk: "Yok",
    rule: "Oyuncunun kendi rota, süre ve fiyat notlarını düzenler.",
  },
  {
    name: "Lonca lojistik masası",
    value: "Çok yüksek",
    risk: "Yok",
    rule: "Takvim, rol, masraf ve ortak hedefi bir araya getirir.",
  },
  {
    name: "Pazar favorileri",
    value: "Orta",
    risk: "Düşük",
    rule: "Yalnız fiyat geçmişi ve bildirim; otomatik alım yapmaz.",
  },
];

const roleRows = [
  {
    label: "Temel roller",
    tone: "required",
    items: ["Tank Savaşçı", "Şifa Şifacısı", "Direnç Kırma Büyücüsü"],
    why: "Grubun hayatta kalması ve mekanikleri tamamlaması için ilk test edilecek omurga.",
  },
  {
    label: "Hızlandırıcı roller",
    tone: "support",
    items: ["Yıldırım Hasar", "Kontrol Büyücüsü", "Asit–Gazap Şifacısı"],
    why: "Kesim süresi, güvenlik ve takım uyumuna katkısı ölçülmeli.",
  },
  {
    label: "Duruma bağlı",
    tone: "situational",
    items: ["Ofansif Savaşçı", "Zehir–Çağrı Şifacısı", "Saf PvP dizilimleri"],
    why: "Bölge, ekipman ve takım stratejisine göre değer kazanabilir.",
  },
];

const dataChannels = [
  {
    name: "Discord",
    role: "Önerilen pilot kanalı",
    text: "Konu başlığı, sabit form bağlantısı, ekran görüntüsü ve moderatör akışı için en düzenli başlangıç noktası.",
    verdict: "ANA GİRİŞ",
  },
  {
    name: "Site formu",
    role: "Tek veri standardı",
    text: "Bütün kanallar aynı forma yönlenir; alan adları, tarih, sunucu ve kanıt seviyesi burada tek biçime çevrilir.",
    verdict: "KAYNAK KAYIT",
  },
  {
    name: "WhatsApp / Telegram",
    role: "Erişim ve duyuru",
    text: "Oyuncuya ulaşmak için kullanılır; serbest sohbet doğrudan veri tabanına aktarılmaz, standart forma yönlendirilir.",
    verdict: "YÖNLENDİRME",
  },
];

const contributionFields = [
  "Sunucu + tarih",
  "Bölge + alt rota",
  "Maden / eşya tam adı",
  "Kaynak, yaratık veya boss",
  "Normal / saf / nadir çıktı",
  "Tur süresi + adet",
  "Kişisel / lonca artırıcı",
  "Ekran görüntüsü veya video",
];

export default function EndgameLab() {
  const [panel, setPanel] = useState<Panel>("Durum");
  const [issue, setIssue] = useState<IssueId>("repeat");
  const activeProblem = problems.find((item) => item.id === issue) ?? problems[0];

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      const requested = new URLSearchParams(window.location.search).get("panel");
      if (requested === "Takvim" || requested === "Lonca") setPanel(requested);
    }, 0);
    return () => window.clearTimeout(initialize);
  }, []);

  return (
    <section className="endgame" id="endgame">
      <div className="endgame-shell">
        <header className="endgame-head">
          <div>
            <p className="eg-kicker">
              <span>YÖNETİCİ RAPORU</span> ENDGAME LABORATUVARI
            </p>
            <h2>
              Varsayımı ayır.
              <br />
              <em>Çözümü test et.</em>
            </h2>
          </div>
          <div className="server-scope">
            <small>AKTİF KAPSAM</small>
            <strong>Kıyametin Öncüleri</strong>
            <div>
              <span>49 SEVİYE</span>
              <span>16 BÖLGE</span>
              <span className="scope-off">KARAKÖY YOK</span>
            </div>
            <p>
              Sunucu kapsamı kaynaklıdır. Anka değerlendirmesi oyuncu gözlemidir;
              rol ve ürün önerileri doğrulanması gereken tasarım hipotezleridir.
            </p>
          </div>
        </header>

        <div className="evidence-strip" aria-label="Kanıt düzeyi">
          <div>
            <small>SUNUCU KAPSAMI</small>
            <b>Kaynaklı</b>
          </div>
          <div>
            <small>ANKA</small>
            <b>Oyuncu gözlemi</b>
          </div>
          <div>
            <small>ROL MATRİSİ</small>
            <b>Test hipotezi</b>
          </div>
          <div>
            <small>FİYATLANDIRMA</small>
            <b>Pilot gerekli</b>
          </div>
        </div>

        <nav className="eg-tabs" role="tablist" aria-label="Endgame raporu bölümleri">
          {(["Durum", "Sorunlar", "Takvim", "Lonca", "Pazar", "Roller", "Veri", "Premium", "Yol haritası"] as Panel[]).map(
            (item) => (
              <button
                key={item}
                role="tab"
                aria-selected={panel === item}
                className={panel === item ? "active" : ""}
                onClick={() => setPanel(item)}
              >
                {item}
              </button>
            ),
          )}
        </nav>

        {panel === "Durum" && (
          <div className="eg-panel simulation-panel">
            <div className="panel-intro">
              <div>
                <small>MEVCUT OYUNCU DÖNGÜSÜ</small>
                <h3>49’dan sonra oyuncu ne yapıyor?</h3>
              </div>
              <p>
                Sistemlerin temeli güçlü. Sorun; grup bekleme, tekrar, envanter
                sürtünmesi ve belirsiz ilerlemenin yeni build denemesini gölgede
                bırakabilmesi.
              </p>
            </div>
            <div className="loop-line">
              <article><span>01</span><i>SV</i><h4>49. seviye</h4><p>Görev ve geçiş ekipmanı</p></article>
              <article><span>02</span><i>GB</i><h4>Grup bölgeleri</h4><p>Sığınak · Migrat · Çemberlitaş</p></article>
              <article><span>03</span><i>TL</i><h4>Tılsım &amp; build</h4><p>Rolü uzmanlaştırma</p></article>
              <article><span>04</span><i>FR</i><h4>Farm &amp; üretim</h4><p>Ekonomi ve malzeme</p></article>
              <article><span>05</span><i>Pv</i><h4>Lonca &amp; PvP</h4><p>Sosyal endgame</p></article>
            </div>
            <div className="decision-rule">
              <b>Karar kuralı</b>
              <p>
                Önce düşük motor bağımlılığı olan özellik denenir. Oyuncu süresi,
                grup kurma ve tekrar oynama iyileşmiyorsa büyük yatırım yapılmaz.
              </p>
            </div>
            <div className="source-note">
              <span>Sunucu kaynakları</span>
              <a href={sourceLinks.guide} target="_blank" rel="noreferrer">Rehber ↗</a>
              <a href={sourceLinks.home} target="_blank" rel="noreferrer">Ana sayfa ↗</a>
            </div>
          </div>
        )}

        {panel === "Sorunlar" && (
          <div className="eg-panel problems-panel">
            <div className="panel-intro">
              <div>
                <small>5 SORUN · HER BİRİNE EN AZ 5 ALTERNATİF</small>
                <h3>Tek fikre bağımlı kalma.</h3>
              </div>
              <p>
                Her öneri küçük pilotla denenebilir, geri alınabilir ve güç
                satmadan oyuncu değerini artıracak şekilde sınırlandırılmıştır.
              </p>
            </div>
            <div className="problem-tabs" role="tablist" aria-label="Sorun seç">
              {problems.map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={issue === item.id}
                  className={issue === item.id ? "active" : ""}
                  onClick={() => setIssue(item.id)}
                >
                  {item.short}
                </button>
              ))}
            </div>
            <div className="problem-summary">
              <div>
                <small>MEVCUT SORUN</small>
                <h4>{activeProblem.title}</h4>
                <p>{activeProblem.observation}</p>
              </div>
              <aside>
                <small>KIRMIZI ÇİZGİ</small>
                <p>{activeProblem.guardrail}</p>
              </aside>
            </div>
            <div className="solution-grid">
              {activeProblem.ideas.map((idea, index) => {
                const depth = ideaDepth[idea.name];
                return <article key={idea.name}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h4>{idea.name}</h4>
                  <p>{idea.basis}</p>
                  <small>PİLOT</small>
                  <b>{idea.pilot}</b>
                  {depth && <details className="idea-depth">
                    <summary>Dayanak ve teknik ayrıntı</summary>
                    <dl>
                      <div><dt>Temel</dt><dd>{depth.foundation}</dd></div>
                      <div><dt>Sunucu maliyeti</dt><dd>{depth.load}</dd></div>
                      <div><dt>Risk / sınır</dt><dd>{depth.risk}</dd></div>
                      <div><dt>Başarı ölçütü</dt><dd>{depth.metric}</dd></div>
                    </dl>
                    {depth.source ? <a href={depth.source} target="_blank" rel="noreferrer">{depth.sourceLabel} ↗</a> : <em>{depth.sourceLabel}</em>}
                  </details>}
                </article>;
              })}
            </div>
            {activeProblem.id === "client" && <ConnectionCenterProposal />}
            <div className="benchmark-links">
              <span>Dayanak örnekleri</span>
              <a href={sourceLinks.partyFinder} target="_blank" rel="noreferrer">FFXIV grup bulucu</a>
              <a href={sourceLinks.weeklyObjectives} target="_blank" rel="noreferrer">GW2 haftalık hedefler</a>
              <a href={sourceLinks.weeklyChoice} target="_blank" rel="noreferrer">WoW ödül seçimi</a>
            </div>
          </div>
        )}

        {panel === "Takvim" && <CommunityEvents />}

        {panel === "Lonca" && <GuildLogistics />}

        {panel === "Pazar" && (
          <div className="eg-panel market-design-panel">
            <div className="panel-intro">
              <div>
                <small>KÖ İÇİN MERKEZÎ PAZAR TASARIMI</small>
                <h3>Tezgâh değil, Teşkilat Pazar Defteri.</h3>
              </div>
              <p>
                Metin2/Karahan tipi fiziksel dükkânlar kalabalık nesne ve görüntü
                üretir. KÖ için çevrim dışı çalışan emir defteri; sohbet, oyuncu
                konumu ve dünya çiziminden bağımsız daha düşük sürtünmeli temeldir.
              </p>
            </div>
            <div className="market-scope-note">
              <div><small>MEVCUT DURUM · OYUNCU GÖZLEMİ</small><b>WhatsApp, Facebook, Discord ve genel sohbet ilanı</b></div>
              <p>Resmî Plus sayfası bölge, klan ve lonca kanallarına yazmayı ayrıcalık olarak listeliyor; ayrıca genel sohbet yazma ürünü bulunuyor. Pazar ve grup aramanın yapılandırılmış panoya taşınması sohbeti iletişime geri verir.</p>
              <div className="scope-links"><a href={sourceLinks.ikvPlus} target="_blank" rel="noreferrer">Özgün oyunun Plus sistemi ↗</a><a href={sourceLinks.ikvChatProduct} target="_blank" rel="noreferrer">Genel sohbet ürünü ↗</a></div>
            </div>
            <div className="market-verdict">
              <span>ÖNERİLEN ÇEKİRDEK</span>
              <h4>BDO depo/emir + GW2 emanet + WoW malzeme birleştirme</h4>
              <p>Çalışan parçalar uyarlanır; BDO’nun katı fiyat bantları ve yüksek hacimli oyunlara özgü karmaşıklığı aynen taşınmaz. KÖ’nün küçük ekonomisinde fiyatı yönetici değil, tamamlanmış işlem verisi görünür kılar.</p>
            </div>
            <div className="market-core-grid">{marketCore.map((item,index)=><article key={item.title}><span>{String(index+1).padStart(2,"0")}</span><h4>{item.title}</h4><p>{item.text}</p></article>)}</div>
            <div className="market-compare">
              <header><small>ÇALIŞAN SİSTEMLERDEN AL · KÖRÜ KÖRÜNE KOPYALAMA</small><h4>Kaynaklı örnek matrisi</h4></header>
              <div>{marketBenchmarks.map(item=><article key={item.name}><h5>{item.name}</h5><p><b>Al:</b> {item.use}</p><p><b>Alma:</b> {item.avoid}</p><a href={item.url} target="_blank" rel="noreferrer">Resmî kaynak ↗</a></article>)}</div>
            </div>
            <div className="market-architecture">
              <div><small>SUNUCUYU RAHATLATAN MİMARİ</small><h4>Dünya döngüsünden ayrılmış işlem servisi</h4><p>64-bit geçiş yönetici duyurusu olarak not edildi; bağlantısı gelene kadar bağımsız kaynak sayılmıyor. Daha geniş bellek alanı yararlı olabilir fakat pahalı arama, kilit ve yazma işlemlerini kendiliğinden ucuzlatmaz.</p></div>
              <ol>{marketLoadRules.map((rule,index)=><li key={rule}><span>{String(index+1).padStart(2,"0")}</span>{rule}</li>)}</ol>
            </div>
            <div className="market-pilot">
              <article><span>FAZ 1 · 4–6 HAFTA</span><h4>Salt okunur fiyat panosu</h4><p>20 malzeme, gönüllü/veri içe aktarımı, medyan ve işlem adedi. Oyun ekonomisine müdahale etmez.</p><b>Risk: düşük</b></article>
              <article><span>FAZ 2 · KAPALI TEST</span><h4>Emanetli 20 ürün</h4><p>Satış ilanı, alış emri, süre sonu ve teslim kutusu. Yalnız test hesaplarıyla yük ve çoğaltma deneyi.</p><b>Başarı: sıfır mükerrer teslim</b></article>
              <article><span>FAZ 3 · SINIRLI CANLI</span><h4>Malzeme pazarı</h4><p>Önce yığınlanabilir maden ve üretim girdileri; ekipman/efsun araması güven oluşunca açılır.</p><b>Başarı: sohbet ilanında düşüş</b></article>
            </div>
            <div className="market-group-bridge">
              <div><small>AYNI MENÜ, AYRI DEFTER</small><h4>Grup ilanı pazara karışmamalı</h4></div>
              <p>FFXIV görev–amaç–rol ölçütlerini, ESO’nun “kuyruk değil ilan” yaklaşımını temel al. GW2’nin LFG politikası gibi eşya satışı ile grup aramayı kesin olarak ayır.</p>
              <div><a href={sourceLinks.ffxivParty} target="_blank" rel="noreferrer">FFXIV ↗</a><a href={sourceLinks.esoGroup} target="_blank" rel="noreferrer">ESO ↗</a><a href={sourceLinks.gw2LfgPolicy} target="_blank" rel="noreferrer">GW2 politika ↗</a></div>
            </div>
          </div>
        )}

        {panel === "Roller" && (
          <div className="eg-panel tier-panel">
            <div className="panel-intro">
              <div>
                <small>HARF NOTU YERİNE ROL MATRİSİ</small>
                <h3>Önce ölç, sonra tier list yayınla.</h3>
              </div>
              <p>
                S/A/B notları savaş kaydı olmadan kesinlik taklidi yapar. Bu
                nedenle roller şimdilik test önceliğine göre gruplandı.
              </p>
            </div>
            <div className="role-stack">
              {roleRows.map((row) => (
                <article className={row.tone} key={row.label}>
                  <strong>{row.label}</strong>
                  <div>{row.items.map((item) => <span key={item}>{item}</span>)}</div>
                  <p>{row.why}</p>
                </article>
              ))}
            </div>
            <div className="metric-grid">
              {["Tamamlama oranı", "Ortalama süre", "Ölüm / düşme", "Rol dolma süresi", "Build dağılımı"].map(
                (metric) => <span key={metric}>{metric}</span>,
              )}
            </div>
            <div className="tier-warning">
              <b>Yayın şartı:</b> En çok kullanılan build ve karşı sınıf önerileri,
              anonim gerçek kullanım verisi oluşmadan “meta” etiketi alamaz.
            </div>
          </div>
        )}

        {panel === "Veri" && (
          <div className="eg-panel data-panel">
            <div className="panel-intro">
              <div>
                <small>TOPLULUK KATKISI · ÖNCE PİLOT</small>
                <h3>Sohbeti değil, kanıtlı kaydı topla.</h3>
              </div>
              <p>
                Oyun istemcisinin belleğini veya ağ trafiğini okumadan; gönüllü
                formlar, ekran görüntüleri ve moderatör kontrolüyle güvenli bir
                veri havuzu kurulabilir.
              </p>
            </div>
            <div className="data-channel-grid">
              {dataChannels.map((channel, index) => (
                <article key={channel.name}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>{channel.role}</small>
                  <h4>{channel.name}</h4>
                  <p>{channel.text}</p>
                  <b>{channel.verdict}</b>
                </article>
              ))}
            </div>
            <div className="data-schema">
              <div>
                <small>HER KAYITTA AYNI ALANLAR</small>
                <h4>Maden, eşya ve grup verisi şeması</h4>
                <p>Oyuncu adı zorunlu değildir. Kişisel mesajlar ve telefon numaraları veri tabanına alınmaz.</p>
              </div>
              <div>{contributionFields.map((field) => <span key={field}>{field}</span>)}</div>
            </div>
            <div className="evidence-ladder">
              <article><b>GÖZLEM</b><span>Tek oyuncu bildirimi</span><small>Yayınlanabilir; açık uyarıyla</small></article>
              <article><b>TOPLULUK TEYİDİ</b><span>İki bağımsız oyuncu veya kanıt</span><small>Güven seviyesi yükselir</small></article>
              <article><b>DOĞRULANMIŞ</b><span>Oyun içi görüntü + kaynak eşleşmesi</span><small>Hesap ve rehberlerde kullanılabilir</small></article>
            </div>
            <div className="data-guardrail">
              <b>İlk pilot:</b>
              <p>Yalnız Büyük Hol / Lojman madenleri ve üç grup bölgesiyle başla. Otomatik oyun botu, paket okuma veya bellek tarama kullanma; ham bildirimi moderasyon görmeden kesin bilgiye dönüştürme.</p>
            </div>
          </div>
        )}

        {panel === "Premium" && (
          <div className="eg-panel qol-panel">
            <div className="anka-review">
              <div className="anka-mark">A</div>
              <div>
                <small>MEVCUT YARDIMCI · OYUNCU GÖZLEMİ</small>
                <h3>Anka doğru temel, tamamlanmamış değer.</h3>
                <p>
                  Otomatik toplama manuel tıklamayı azaltır. Ücretli değer,
                  filtreden malzeme düzenine kadar tüm farm zincirini kısaltırsa
                  oluşur.
                </p>
              </div>
              <div className="anka-verdict">
                <small>KARAR</small>
                <b>GEREKLİ QoL</b>
                <span>Tek başına paket değil</span>
              </div>
            </div>
            <div className="qol-principle">
              <b>Ödeme ilkesi</b>
              <p>
                Para daha yüksek hasar, ganimet şansı veya ayrıcalıklı maden
                noktası değil; daha az menü ve daha iyi organizasyon satmalı.
              </p>
            </div>
            <div className="premium-grid">
              {paidIdeas.map((idea, index) => (
                <article key={idea.name}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h4>{idea.name}</h4>
                  <p>{idea.rule}</p>
                  <dl>
                    <div><dt>Oyuncu değeri</dt><dd>{idea.value}</dd></div>
                    <div><dt>P2W riski</dt><dd>{idea.risk}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="price-pilot">
              <div>
                <small>FİYAT KARARI</small>
                <h3>Rakamı tahmin etme; paketi pilotla.</h3>
              </div>
              <p>
                Önce özellikleri ayrı ayrı ölç, ardından kalıcı paket ile isteğe
                bağlı üyelik seçeneklerini oyuncuya göster. Satın alma niyeti,
                kullanım oranı ve bırakma oranı görülmeden kesin Akçe fiyatı
                önermiyoruz.
              </p>
            </div>
            <div className="benchmark-links">
              <span>Resmî model örnekleri</span>
              <a href={sourceLinks.craftBag} target="_blank" rel="noreferrer">ESO malzeme çantası</a>
              <a href={sourceLinks.armory} target="_blank" rel="noreferrer">ESO Armory</a>
              <a href={sourceLinks.accountBank} target="_blank" rel="noreferrer">WoW hesap bankası</a>
            </div>
          </div>
        )}

        {panel === "Yol haritası" && (
          <div className="eg-panel roadmap-panel">
            <div className="panel-intro">
              <div>
                <small>ÖLÇÜLEBİLİR VE GERİ ALINABİLİR</small>
                <h3>Önce sürtünmeyi azalt, sonra içerik büyüt.</h3>
              </div>
              <p>
                Her faz bağımsız yayınlanır. Bir önceki faz ölçülebilir fayda
                göstermiyorsa sonraki yatırım otomatik kabul edilmez.
              </p>
            </div>
            <div className="roadmap compact">
              <article>
                <span>0–6 HAFTA</span>
                <h4>Görünürlük</h4>
                <ul>
                  <li>Anka filtresi ve dolu çanta uyarısı</li>
                  <li>Rol bazlı grup ilanı</li>
                  <li>Topluluk etkinlik takvimi pilotu</li>
                  <li>20 malzemelik salt okunur fiyat panosu</li>
                  <li>Anonim temel telemetri + eşya karşılaştırma</li>
                </ul>
                <b>P0</b>
              </article>
              <article>
                <span>2–4 AY</span>
                <h4>Lojistik</h4>
                <ul>
                  <li>Malzeme çantası pilotu</li>
                  <li>Teçhizat sayfaları</li>
                  <li>20 ürünle emanetli pazar kapalı testi</li>
                  <li>Fiyat geçmişi + grup kurma veri pilotu</li>
                </ul>
                <b>P1</b>
              </article>
              <article>
                <span>4–8 AY</span>
                <h4>Endgame deneyi</h4>
                <ul>
                  <li>Tek bölgede haftalık mutasyon</li>
                  <li>Garanti ilerleme jetonu</li>
                  <li>Üretim siparişi panosu prototipi</li>
                  <li>Lonca seferi + kozmetik takım rekorları</li>
                </ul>
                <b>P2</b>
              </article>
            </div>
            <div className="success-metrics">
              <div><small>BAŞARI KAPISI</small><h4>Beş metrik iyileşmeden büyütme.</h4></div>
              <ul>
                <li><b>Grup süresi</b><span>İlan → giriş</span></li>
                <li><b>Tekrar oynama</b><span>Haftalık dönüş</span></li>
                <li><b>Build çeşitliliği</b><span>Kullanılan rol</span></li>
                <li><b>Pazar sağlığı</b><span>Fiyat + işlem adedi</span></li>
                <li><b>Oyuncu dönüşü</b><span>7 / 30 gün</span></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ConnectionCenterProposal() {
  const confidenceRows = [
    ["Kesin", "Sunucu açık bakım, kapatma veya oturum kodu gönderdi."],
    ["Güçlü belirti", "Belirli süre yanıt alınamadı; zaman aşımı gözlendi."],
    ["Olası", "İşletim sistemi yerel bağlantı kaybı bildirdi."],
    ["Bilinmiyor", "Yerel veri nedeni güvenle ayırmaya yetmiyor."],
  ];
  const guardrails = [
    "Yeni yüksek frekanslı ping paketi gönderme; mümkünse mevcut heartbeat yanıtını kullan.",
    "Göstergeyi saniyede en fazla bir kez yenile; son 30 saniyeyi yalnız RAM'de tut.",
    "Protokolde sıra bilgisi yoksa ‘paket kaybı’ değil ‘yanıt kaçırma / zaman aşımı’ de.",
    "Kopmada yalnız tek küçük olay özeti üret; sürekli telemetri veya veritabanı yazımı yapma.",
    "IP, MAC, sohbet, karakter mesajı ve konum geçmişi kaydetme; paylaşımı oyuncu başlatsın.",
  ];

  return (
    <section className="connection-center" aria-labelledby="connection-center-title">
      <header className="connection-head">
        <div>
          <small>İSTEMCİ PİLOTU · YENİDEN BAĞLANMA DEĞİL, GÖRÜNÜRLÜK</small>
          <h4 id="connection-center-title">Bağlantı Merkezi</h4>
        </div>
        <p>
          Oyunda bulunan beş dakikalık grup/örnek geri dönüşü korunur. Bu öneri
          onun yerine geçmez; kopmadan önce ne görüldüğünü açıklanabilir hâle getirir.
        </p>
      </header>

      <div className="connection-layout">
        <article className="connection-preview">
          <div className="connection-preview-title">
            <span>ÖRNEK ARAYÜZ</span><b>Yalnız yerel ölçüm</b>
          </div>
          <div className="connection-live-status">
            <div><small>RTT</small><strong>— ms</strong></div>
            <div><small>DALGALANMA</small><strong>— ms</strong></div>
            <div><small>FPS</small><strong>—</strong></div>
          </div>
          <div className="connection-states">
            <span className="good">İyi</span>
            <span className="wave">Dalgalı</span>
            <span className="lost">Yanıt yok</span>
          </div>
          <div className="connection-receipt">
            <small>KOPMA MAKBUZU</small>
            <dl>
              <div><dt>Saat / bölge</dt><dd>—</dd></div>
              <div><dt>Gözlenen olay</dt><dd>Yanıt zaman aşımına uğradı</dd></div>
              <div><dt>Güven</dt><dd>Güçlü belirti</dd></div>
            </dl>
            <span>Oyuncu isterse “tanı kaydını kopyala” ile paylaşır.</span>
          </div>
        </article>

        <div className="connection-diagnosis">
          <article>
            <small>NEDEN DİLİ</small>
            <h5>Kesin hüküm değil, kanıt seviyesi</h5>
            <div className="connection-confidence">
              {confidenceRows.map(([label, text]) => (
                <div key={label}><b>{label}</b><span>{text}</span></div>
              ))}
            </div>
          </article>
          <article>
            <small>SUNUCU MALİYETİ KORUMASI</small>
            <h5>Beş teknik kırmızı çizgi</h5>
            <ol className="connection-guardrail">
              {guardrails.map((rule) => <li key={rule}>{rule}</li>)}
            </ol>
          </article>
        </div>
      </div>

      <div className="connection-pilot">
        <article><span>F0</span><b>Yerel üst katman</b><p>RTT ve FPS, saniyede en fazla bir görsel güncelleme.</p></article>
        <article><span>F1</span><b>30 sn halka tampon</b><p>Disk veya veri tabanı yok; istemci kapanınca veri silinir.</p></article>
        <article><span>F2</span><b>Kopma makbuzu</b><p>Açık sunucu kodu varsa kesin; yoksa gözlenen belirti.</p></article>
        <article><span>F3</span><b>İsteğe bağlı paylaşım</b><p>Küçük metin çıktısı; otomatik yükleme ve kişisel ağ verisi yok.</p></article>
      </div>

      <div className="connection-sources">
        <span>Resmî uygulama ve tanı örnekleri</span>
        <a href={sourceLinks.valorantNetwork} target="_blank" rel="noreferrer">VALORANT ağ kararlılığı ↗</a>
        <a href={sourceLinks.fortnitePacketLoss} target="_blank" rel="noreferrer">Fortnite ağ göstergesi ↗</a>
        <a href={sourceLinks.destinyDisconnect} target="_blank" rel="noreferrer">Destiny hata kodları ↗</a>
        <a href={sourceLinks.eveLogLite} target="_blank" rel="noreferrer">EVE LogLite ↗</a>
        <a href={sourceLinks.esoPathping} target="_blank" rel="noreferrer">ESO pathping ↗</a>
      </div>
    </section>
  );
}
