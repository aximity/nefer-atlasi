export type QuestClass = "Savaşçı" | "Büyücü" | "Şifacı";
export type QuestTrack = "Başlangıç" | "Teşkilat" | "Arzuhalci" | "Meteor" | "Yeraltı" | "Sığınaklar" | "Migrat" | "Çemberlitaş" | "Büyük Hol";

export type Quest = {
  id: string;
  title: string;
  level: number;
  giver: string;
  location: string;
  region: string;
  objective: string;
  dependsOn: string[];
  track: QuestTrack;
  recommended?: boolean;
  timed?: string;
  reward?: Partial<Record<QuestClass | "Tümü", string>>;
  note?: string;
};

export const questSources = {
  chain: "https://istanbulkiyametvakti.fandom.com/tr/wiki/Zincir_G%C3%B6revler_ve_G%C3%B6rev_K%C4%B1s%C4%B1tlamalar%C4%B1",
  explained: "https://istanbulkiyametvakti.fandom.com/tr/wiki/A%C3%A7%C4%B1klamal%C4%B1_G%C3%B6rev_Listesi",
  warriorRewards: "https://istanbulkiyametvakti.fandom.com/tr/wiki/Sava%C5%9F%C3%A7%C4%B1_-_G%C3%B6rev_Ganimetleri",
  mageRewards: "https://istanbulkiyametvakti.fandom.com/tr/wiki/B%C3%BCy%C3%BCc%C3%BC_-_G%C3%B6rev_Ganimetleri",
  healerRewards: "https://istanbulkiyametvakti.fandom.com/tr/wiki/%C5%9Eifac%C4%B1_-_G%C3%B6rev_Ganimetleri",
};

const common = (value: string) => ({ Tümü: value });

export const quests: Quest[] = [
  { id:"teskilata-katilis", title:"Teşkilat'a Katılış", level:1, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Eminönü", objective:"Mısır Çarşısı önündeki Türk bayrağının altında bulunan Jandarma Ali ile konuş.", dependsOn:[], track:"Başlangıç", recommended:true, reward:{Savaşçı:"Yatağan · İnce Deri Ayakkabı · Kanvas Ceket",Büyücü:"Hançer · Kanvas Ceket · İnce Deri Ayakkabı",Şifacı:"Değnek · Kanvas Ceket · İnce Deri Ayakkabı"} },
  { id:"salgin-hastalik-1", title:"Salgın Hastalık I", level:1, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Eminönü", objective:"10 Fare öldür.", dependsOn:["teskilata-katilis"], track:"Başlangıç", recommended:true, reward:common("Zırh Artırıcı · İnce Deri Eldiven") },
  { id:"bankaciya-ulak", title:"Bankacıya Ulak", level:1, giver:"Jandarma Ali", location:"Mısır Çarşısı önü", region:"Eminönü", objective:"Bankacı ile konuş.", dependsOn:[], track:"Başlangıç", recommended:true, reward:common("3 Ceviz Yaprağı") },
  { id:"hesap-cuzdani", title:"Hesap Cüzdanı", level:1, giver:"Otomatik görev", location:"Bankacı", region:"Eminönü", objective:"Jandarma Ali'ye dön ve konuş.", dependsOn:["bankaciya-ulak"], track:"Başlangıç", recommended:true, note:"Otomatik görev silinirse GBM-Anı üzerinden yeniden alınabilir." },
  { id:"balikciyla-tanisma", title:"Balıkçıyla Tanışma", level:2, giver:"Jandarma Ali", location:"Mısır Çarşısı önü", region:"Eminönü", objective:"Balıkçı İdris ile konuş.", dependsOn:[], track:"Başlangıç", recommended:true },
  { id:"sahil-temizligi-1", title:"Sahil Temizliği I", level:2, giver:"Balıkçı İdris", location:"Eminönü sahili", region:"Eminönü", objective:"10 Küçük Kertenkele öldür.", dependsOn:["balikciyla-tanisma"], track:"Başlangıç", recommended:true, reward:{Savaşçı:"Tek Atar V2",Büyücü:"Keskin Hançer",Şifacı:"Çentikli Değnek"} },
  { id:"sevket-beyin-ricasi", title:"Şevket Bey'in Ricası", level:2, giver:"Aktar Şevket", location:"Mısır Çarşısı", region:"Eminönü", objective:"3 Ceviz Yaprağı bulup Aktar Şevket'e getir.", dependsOn:["salgin-hastalik-1"], track:"Başlangıç", recommended:true, reward:common("5 Kedi İyileştiren İksir") },
  { id:"sahil-temizligi-2", title:"Sahil Temizliği II", level:3, giver:"Balıkçı İdris", location:"Eminönü sahili", region:"Eminönü", objective:"10 Keme öldür.", dependsOn:["sahil-temizligi-1"], track:"Başlangıç", recommended:true, reward:common("Savunma Artırıcı Kanvaslı Deri Eldiven") },
  { id:"anacigimin-ilaclari", title:"Anacığımın İlaçları", level:3, giver:"Jandarma Ali", location:"Mısır Çarşısı önü", region:"Eminönü", objective:"Halime Teyze ile konuş.", dependsOn:[], track:"Başlangıç", recommended:true, timed:"2 dakika", reward:common("3 Ceviz") },
  { id:"savasin-niyeti", title:"Savaş'ın Niyeti", level:3, giver:"Halime Teyze", location:"Banka önü", region:"Eminönü", objective:"Savaş ile konuş.", dependsOn:["anacigimin-ilaclari"], track:"Başlangıç", recommended:true },
  { id:"lodos-muhafizina", title:"Lodos Muhafızı'na", level:3, giver:"Savaş", location:"Eminönü", region:"Eminönü", objective:"Önce Lodos Muhafızı, ardından yeniden Savaş ile konuş.", dependsOn:["savasin-niyeti"], track:"Başlangıç", recommended:true, reward:common("3 Asa Kristali · 3 Bronz · 3 Meşe Kerestesi") },
  { id:"halime-teyzeye", title:"Halime Teyze'ye", level:3, giver:"Savaş", location:"Eminönü", region:"Eminönü", objective:"Halime Teyze ile konuş.", dependsOn:["lodos-muhafizina"], track:"Başlangıç", recommended:true },
  { id:"ilk-maasin", title:"İlk Maaşın", level:3, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Eminönü", objective:"Bankacı ile konuş.", dependsOn:[], track:"Başlangıç", recommended:true },
  { id:"lufer-izgara", title:"Lüfer Izgara", level:4, giver:"Balıkçı İdris", location:"Eminönü sahili", region:"Eminönü", objective:"Önce Demirci Rüstem, sonra Balıkçı İdris ile konuş.", dependsOn:[], track:"Başlangıç", reward:common("Fare Kudretlendiren İksir · Koç İyileştiren İksir") },
  { id:"soguklar", title:"Soğuklar", level:4, giver:"Şarapçı", location:"Eminönü", region:"Eminönü", objective:"5 Keten getir.", dependsOn:[], track:"Başlangıç", reward:{Savaşçı:"Akkor Tipi Kedi Emsali Keten Pantolon",Büyücü:"Deniz Kabuklu Eski Bizans Menşeili Keten Pantolon",Şifacı:"Akkor Tipi Kedi Emsali Keten Pantolon"} },
  { id:"pis-hasereler", title:"Pis Haşereler", level:4, giver:"Bankacı", location:"Mısır Çarşısı", region:"Eminönü", objective:"10 Yeşil Örümcek öldür.", dependsOn:["ilk-maasin"], track:"Başlangıç", recommended:true },
  { id:"salgin-hastalik-2", title:"Salgın Hastalık II", level:5, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Eminönü", objective:"10 İri Fare öldür.", dependsOn:["salgin-hastalik-1"], track:"Başlangıç", recommended:true, reward:{Savaşçı:"Çekiç Başlı Bronz Yatağan",Büyücü:"Eski Bizans Menşeili İki Kuvarslı Asa",Şifacı:"Çekiç Başlı Cilalı Değnek"} },
  { id:"fahri-beyden-takim", title:"Fahri Bey'den Takım", level:5, giver:"Fahri Bey", location:"Mısır Çarşısı", region:"Eminönü", objective:"Cinlerden 10 Keten toplayıp Fahri Bey'e getir.", dependsOn:["sahil-temizligi-1"], track:"Başlangıç", recommended:true, reward:{Savaşçı:"Kritik Artırıcı Kanvaslı Deri Ceket veya Keten Pantolon",Büyücü:"Fizik Artırıcı Kanvaslı Deri Ceket veya Keten Pantolon",Şifacı:"Zırh Artırıcı Kanvaslı Deri Ceket veya Keten Pantolon"} },
  { id:"halime-teyzeden-cicek", title:"Halime Teyze'den Çiçek Siparişi", level:5, giver:"Bankacı", location:"Mısır Çarşısı", region:"Eminönü", objective:"Banka önündeki Halime Teyze ile konuş.", dependsOn:["pis-hasereler"], track:"Başlangıç", recommended:true },
  { id:"isik-hanima-teslimat", title:"Işık Hanım'a Teslimat", level:5, giver:"Otomatik görev", location:"Halime Teyze", region:"Eminönü", objective:"Işık Hanım ile konuş.", dependsOn:["halime-teyzeden-cicek"], track:"Başlangıç", recommended:true, note:"Otomatik görev silinirse GBM-Anı üzerinden yeniden alınabilir." },
  { id:"teskilat-cinlere-karsi-1", title:"Teşkilat Cinlere Karşı I", level:6, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Eminönü", objective:"Komutan ile konuş.", dependsOn:[], track:"Teşkilat", recommended:true, timed:"5 dakika" },
  { id:"teskilat-cinlere-karsi-2", title:"Teşkilat Cinlere Karşı II", level:6, giver:"Komutan", location:"Mısır Çarşısı", region:"Eminönü", objective:"Agah Efendi'ye dön.", dependsOn:["teskilat-cinlere-karsi-1"], track:"Teşkilat", recommended:true, timed:"4 dakika" },
  { id:"karisiklik-cikarma", title:"Karışıklık Çıkarma", level:6, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Antrepo", objective:"Antrepo çevresinde 5 Tüftüfçü Cin öldür.", dependsOn:["teskilat-cinlere-karsi-2"], track:"Teşkilat", recommended:true, timed:"30 dakika", reward:{Savaşçı:"Deniz Kabuklu Çekiç Başlı Koç Derisi Ayakkabı",Büyücü:"Deniz Kabuklu Eski Bizans Menşeili Koç Derisi Ayakkabı",Şifacı:"Deniz Kabuklu Eski Bizans Menşeili Koç Derisi Ayakkabı"} },
  { id:"kayip-cilt-sorgulama", title:"Kayıp Cilt Sorgulama", level:6, giver:"Sahaf Necmi", location:"Mısır Çarşısı", region:"Antrepo", objective:"Recep Dayı ile konuş.", dependsOn:[], track:"Teşkilat", timed:"10 dakika" },
  { id:"acil-mudahale", title:"Acil Müdahale", level:6, giver:"Recep Dayı", location:"Antrepo", region:"Antrepo", objective:"Recep Dayı'nın yanındaki Garr isimli cini öldür.", dependsOn:["kayip-cilt-sorgulama"], track:"Teşkilat" },
  { id:"sahaf-necmiye-donus", title:"Sahaf Necmi'ye Dönüş", level:6, giver:"Recep Dayı", location:"Antrepo", region:"Eminönü", objective:"Sahaf Necmi ile konuş.", dependsOn:["acil-mudahale"], track:"Teşkilat" },
  { id:"sarap-uzerine-sohbet", title:"Şarap Üzerine Sohbet", level:7, giver:"Şarapçı", location:"Eminönü", region:"Eminönü", objective:"Şarapçı ile yeniden konuş.", dependsOn:["soguklar"], track:"Başlangıç" },
  { id:"kalecik-karasi", title:"Kalecik Karası", level:7, giver:"Şarapçı", location:"Eminönü", region:"Antrepo", objective:"Antrepo içinde 3 Cin Avcı öldür.", dependsOn:["sarap-uzerine-sohbet"], track:"Başlangıç" },
  { id:"evin-orada-akrepler", title:"Evin Orada Akrepler Var", level:7, giver:"Umut", location:"Agah Efendi'nin yanı", region:"Eminönü", objective:"20 Kızıl Akrep öldür.", dependsOn:[], track:"Başlangıç", reward:{Savaşçı:"Kurşun Zırh / Bronz Balyoz / 8 Açık Mavi Lapis seçenekleri",Büyücü:"Kristalli Asa / 8 Açık Mavi Lapis seçenekleri",Şifacı:"Budaksız Değnek / 8 Açık Mavi Lapis seçenekleri"} },
  { id:"biraz-da-kazanc", title:"Biraz da Kazanç", level:8, giver:"Işık Hanım", location:"Eminönü", region:"Eminönü", objective:"Uçak enkazı çevresinde 10 Fare Adam öldür.", dependsOn:[], track:"Teşkilat", recommended:true },
  { id:"olum-yolu", title:"Ölüm Yolu", level:9, giver:"Işık Hanım", location:"Eminönü", region:"Eminönü", objective:"Mezarlık yanındaki Kızgın Kum'u öldür.", dependsOn:["biraz-da-kazanc"], track:"Teşkilat", recommended:true, reward:{Savaşçı:"Horoz Gagası Misali Koç Derisi Ceket veya malzeme",Büyücü:"Eski Köprülü Koç Derisi Ceket veya malzeme",Şifacı:"Kipri Misali Koç Derisi Ceket veya malzeme"} },
  { id:"kahvemi-kopuklu", title:"Kahvemi Köpüklü Severim", level:9, giver:"Sahaf Necmi", location:"Mısır Çarşısı", region:"Eminönü", objective:"Çınaraltı'ndaki Hamit Pehlivan ile konuş.", dependsOn:[], track:"Başlangıç" },
  { id:"kahve-teslimati", title:"Kahve Teslimatı", level:9, giver:"Hamit Pehlivan", location:"Çınaraltı", region:"Eminönü", objective:"Sahaf Necmi'ye dön.", dependsOn:["kahvemi-kopuklu"], track:"Başlangıç", reward:common("Fare Zehiri Emsali · Erciyes Modeli · Tacir Kapsüllü iksir seçenekleri") },
  { id:"fare-adam-yiyecek", title:"Fare Adam Yiyecek Yolları", level:9, giver:"Komutan", location:"Mısır Çarşısı", region:"Eminönü", objective:"15 İri Kertenkele öldür.", dependsOn:[], track:"Teşkilat", reward:common("5 Bahçe Karışımı · 5 Ok Sertleştirici · 5 İşlenmiş Kurşun") },
  { id:"cinlerin-buyulu-topragi", title:"Cinlerin Büyülü Toprağı", level:10, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Antrepo", objective:"Antrepo'da 10 Bekçi Cin öldür.", dependsOn:[], track:"Teşkilat", recommended:true, reward:common("3 Cin Kazması") },
  { id:"avlanan-avcilar", title:"Avlanan Avcılar", level:11, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Antrepo", objective:"Antrepo'da 10 Avcı Cin öldür.", dependsOn:["cinlerin-buyulu-topragi"], track:"Teşkilat", timed:"30 dakika", reward:{Savaşçı:"Kirpi Misali Yılan Derisi Ayakkabı",Büyücü:"Avcı Emsali Yılan Derisi Ayakkabı",Şifacı:"Kirpi Misali Yılan Derisi Ayakkabı"} },
  { id:"folklor", title:"Folklor", level:14, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Antrepo", objective:"Antrepo'da Folklor'a bağlı cinlerden biriyle konuş.", dependsOn:["avlanan-avcilar"], track:"Teşkilat", recommended:true },
  { id:"buyuk-oncu-azul", title:"Büyük Öncü Azul'u Öldürmek", level:15, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Antrepo", objective:"Antrepo'nun arka tarafındaki Büyük Öncü Azul'u öldür.", dependsOn:["folklor"], track:"Teşkilat", recommended:true, reward:{Savaşçı:"Sancak Etkili Hermann-Sermen İcadı Balta",Büyücü:"Ruh Kalkanlı Sibirya Menşeili Hava Karga",Şifacı:"Yaban Mantarlı Adalı Emsali Yakın Ay"} },
  { id:"engerek-tehdidi", title:"Engerek Tehdidi", level:16, giver:"Jandarma Ali", location:"Mısır Çarşısı önü", region:"Eminönü", objective:"Mısır Çarşısı'nın arka sokaklarında 10 Engerek öldür.", dependsOn:[], track:"Teşkilat", recommended:true },

  { id:"arzuhalci-ile-tanisma", title:"Arzuhalci ile Tanışma", level:16, giver:"Arzuhalci", location:"Çınaraltı", region:"Eminönü", objective:"Arzuhalci ile yeniden konuş.", dependsOn:[], track:"Arzuhalci", recommended:true },
  { id:"eski-bir-kitap", title:"Eski Bir Kitap", level:16, giver:"Arzuhalci", location:"Çınaraltı", region:"Eminönü", objective:"Sahaf Necmi ile konuş.", dependsOn:["arzuhalci-ile-tanisma"], track:"Arzuhalci", recommended:true },
  { id:"isimsiz-ve-yazarsiz", title:"İsimsiz ve Yazarsız", level:17, giver:"Sahaf Necmi", location:"Mısır Çarşısı", region:"Eminönü", objective:"Arzuhalci'ye dön.", dependsOn:["eski-bir-kitap"], track:"Arzuhalci", recommended:true },
  { id:"akrep-orumcek-notlari", title:"Akrepler ve Örümcekler Hakkında Notlar", level:17, giver:"Arzuhalci", location:"Çınaraltı", region:"Eminönü", objective:"Kuyumcu Agop ile konuş, ardından Arzuhalci'ye dön.", dependsOn:["isimsiz-ve-yazarsiz"], track:"Arzuhalci", recommended:true },
  { id:"mezarlik-parsomenleri", title:"Mezarlık Parşömenleri", level:18, giver:"Arzuhalci", location:"Çınaraltı", region:"Eminönü", objective:"Yasemin ile Arzuhalci arasındaki üç konuşma adımını tamamla.", dependsOn:["akrep-orumcek-notlari"], track:"Arzuhalci", recommended:true },
  { id:"arzuhalciden-jest", title:"Arzuhalci'den Jest", level:18, giver:"Arzuhalci", location:"Çınaraltı", region:"Eminönü", objective:"Işık Hanım ile konuş.", dependsOn:["mezarlik-parsomenleri"], track:"Arzuhalci", recommended:true, reward:common("Karaktor Usulü Semender Derisi Ceket · iksir seçenekleri") },
  { id:"kobra-tehdidi", title:"Kobra Tehdidi", level:17, giver:"Jandarma Ali", location:"Mısır Çarşısı önü", region:"Eminönü", objective:"Mısır Çarşısı çevresinde 10 Kobra öldür.", dependsOn:["engerek-tehdidi"], track:"Teşkilat", recommended:true },
  { id:"teskilat-fa-darbesi", title:"Teşkilat FA Darbesi", level:20, giver:"Komutan", location:"Mısır Çarşısı", region:"Eminönü", objective:"Yasemin'in yakınındaki gemi enkazı çevresinde 20 Koruyucu Fare Adam öldür.", dependsOn:[], track:"Teşkilat", recommended:true },
  { id:"cetecilere-merhaba", title:"Çetecilere Merhaba", level:20, giver:"Yasemin", location:"Mezarlık sahili", region:"Eminönü", objective:"Lodos Kalesi civarında 20 Zincir Büyücüsü öldür.", dependsOn:["mezarlik-parsomenleri"], track:"Arzuhalci", recommended:true },
  { id:"gizemli-kisilik", title:"Gizemli Kişilik", level:20, giver:"Elebaşı", location:"Lodos Kalesi civarı", region:"Eminönü", objective:"Arzuhalci ile konuş.", dependsOn:["cetecilere-merhaba"], track:"Arzuhalci", recommended:true },
  { id:"ruh-taslari-hakkinda", title:"Ruh Taşları Hakkında", level:21, giver:"Arzuhalci", location:"Çınaraltı", region:"Labirent", objective:"Arzuhalci ile yeniden konuş ve Ruh Taşı kullanımını öğren.", dependsOn:["gizemli-kisilik"], track:"Arzuhalci", recommended:true },
  { id:"fotografci", title:"Fotoğrafçı", level:21, giver:"Arzuhalci", location:"Çınaraltı", region:"Labirent", objective:"Labirent girişine yakın Ruh Taşı'nı bul ve Arzuhalci'ye dön.", dependsOn:["ruh-taslari-hakkinda"], track:"Arzuhalci", recommended:true },
  { id:"kitabe", title:"Kitabe", level:21, giver:"Arzuhalci", location:"Çınaraltı", region:"Labirent", objective:"Labirent'teki Kitabe'nin kopyasını çıkar ve Arzuhalci'ye dön.", dependsOn:["fotografci"], track:"Arzuhalci", recommended:true },
  { id:"philotheosun-salonu", title:"Philotheos'un Salonu", level:22, giver:"Arzuhalci", location:"Çınaraltı", region:"Labirent", objective:"Philotheos'un salonunu bul.", dependsOn:["kitabe"], track:"Arzuhalci", recommended:true },
  { id:"tilsim-gorevi", title:"Tılsım", level:22, giver:"Arzuhalci", location:"Çınaraltı", region:"Labirent", objective:"Philotheos'u öldür ve Arzuhalci'ye dön.", dependsOn:["philotheosun-salonu"], track:"Arzuhalci", recommended:true },
  { id:"akil-oyunlari", title:"Akıl Oyunları", level:22, giver:"Arzuhalci", location:"Çınaraltı", region:"Eminönü", objective:"Işık Hanım ile konuş.", dependsOn:["tilsim-gorevi"], track:"Arzuhalci", reward:{Savaşçı:"Islık Çalan",Büyücü:"Anka",Şifacı:"İnat Kıran"} },
  { id:"suikast-planlari", title:"Suikast Planları", level:23, giver:"Komutan", location:"Mısır Çarşısı", region:"Eminönü", objective:"Gemi enkazı çevresinde 15 Tetikçi Fare Adam öldür.", dependsOn:["teskilat-fa-darbesi"], track:"Teşkilat", recommended:true },
  { id:"kadim-iscilik", title:"Kadim İşçilik", level:23, giver:"Demirci Rüstem", location:"Mısır Çarşısı", region:"Labirent", objective:"Labirentteki mızrak odalarından 10 Antik Mızrak bulup Demirci Rüstem'e getir.", dependsOn:["ruh-taslari-hakkinda"], track:"Arzuhalci" },
  { id:"kuklacinin-secilmisi", title:"Kuklacının Seçilmişi", level:25, giver:"Komutan", location:"Mısır Çarşısı", region:"Eminönü", objective:"Kuklacı'nın Seçilmişi'ni öldür.", dependsOn:["suikast-planlari"], track:"Teşkilat", recommended:true },
  { id:"giyim-ihtiyaclari", title:"Giyim İhtiyaçları", level:25, giver:"Fahri Bey", location:"Mısır Çarşısı", region:"Eminönü", objective:"60 Semender Derisi getir.", dependsOn:["fahri-beyden-takim"], track:"Başlangıç" },
  { id:"guclu-zehir", title:"Güçlü Zehir", level:27, giver:"Aktar Şevket", location:"Mısır Çarşısı", region:"Labirent", objective:"Labirent içinde 20 Kan Örümceği öldür.", dependsOn:["sevket-beyin-ricasi"], track:"Arzuhalci" },
  { id:"daha-guclu-zehir", title:"Daha Güçlü Zehir", level:27, giver:"Aktar Şevket", location:"Mısır Çarşısı", region:"Labirent", objective:"Labirent içinde 20 Gölge Akrep öldür.", dependsOn:["guclu-zehir"], track:"Arzuhalci" },

  { id:"meteor-yolu", title:"Meteor Yolu", level:29, giver:"Agah Efendi", location:"Yeni Cami avlusu", region:"Meteor Bölgesi", objective:"Komutan ile konuş.", dependsOn:[], track:"Meteor", recommended:true },
  { id:"istihbarata-katilis", title:"Teşkilat İstihbarat'a Katılış", level:29, giver:"Komutan", location:"Mısır Çarşısı", region:"Meteor Bölgesi", objective:"İstihbarat Subayı ile konuş.", dependsOn:["meteor-yolu"], track:"Meteor", recommended:true },
  { id:"kesif-gorevleri", title:"Keşif Görevleri I–V", level:29, giver:"İstihbarat Subayı", location:"Meteor Bölgesi girişi", region:"Meteor Bölgesi", objective:"Krater, Çeteci Mağaraları, Küçük Tüneller, Arz merkezi ve Yeni Bab-ı Ali'yi keşfet.", dependsOn:["istihbarata-katilis"], track:"Meteor", recommended:true },
  { id:"yeni-babialiye-mektup", title:"Yeni Bab-ı Ali'ye Mektup", level:30, giver:"İstihbarat Subayı", location:"Meteor Bölgesi", region:"Meteor Bölgesi", objective:"Yeni Bab-ı Ali'deki Mebrure Hanım ile konuş.", dependsOn:["kesif-gorevleri"], track:"Meteor", recommended:true },
  { id:"mebrure-ile-tanisma", title:"Mebrure ile Tanışma", level:30, giver:"Mebrure Hanım", location:"Yeni Bab-ı Ali", region:"Meteor Bölgesi", objective:"Bab-ı Ali Komutanı ile konuş.", dependsOn:["yeni-babialiye-mektup"], track:"Meteor", recommended:true },
  { id:"babiali-guvenlik-1", title:"Yeni Bab-ı Ali Güvenliği I", level:30, giver:"Bab-ı Ali Komutanı", location:"Yeni Bab-ı Ali", region:"Meteor Bölgesi", objective:"20 Başıboş Yağmacı öldür.", dependsOn:["mebrure-ile-tanisma"], track:"Meteor", recommended:true, reward:common("5 Aslan İyileştiren İksir") },
  { id:"babiali-guvenlik-2", title:"Yeni Bab-ı Ali Güvenliği II", level:30, giver:"Bab-ı Ali Komutanı", location:"Yeni Bab-ı Ali", region:"Meteor Bölgesi", objective:"20 Başıboş Tüftüfçü öldür.", dependsOn:["babiali-guvenlik-1"], track:"Meteor", recommended:true, reward:common("5 Kangal Kudretlendiren İksir") },
  { id:"basi-bos", title:"Başı Boş", level:30, giver:"Bab-ı Ali Komutanı", location:"Yeni Bab-ı Ali", region:"Meteor Bölgesi", objective:"Boş'u öldür.", dependsOn:["babiali-guvenlik-2"], track:"Meteor", reward:{Savaşçı:"Rus Ruleti Manda Derisi Ayakkabı",Büyücü:"Büyü Kritik Artırıcı Manda Derisi Ayakkabı",Şifacı:"Büyü Kritik Artırıcı Manda Derisi Ayakkabı"} },

  { id:"mebrurenin-daveti", title:"Mebrure'nin Daveti", level:39, giver:"Mebrure Hanım", location:"Yeni Bab-ı Ali", region:"Yeraltı", objective:"Kan Pençe ile konuş.", dependsOn:[], track:"Yeraltı", recommended:true },
  { id:"domuzla-tanisma", title:"Domuz'la Tanışma", level:39, giver:"Domuz", location:"Yeraltı", region:"Yeraltı", objective:"Topal ile konuş.", dependsOn:["mebrurenin-daveti"], track:"Yeraltı", recommended:true },
  { id:"topalin-hazirliklari", title:"Topal'ın Hazırlıkları", level:39, giver:"Topal", location:"Yeraltı", region:"Yeraltı", objective:"10 Yeraltı Mantarı topla.", dependsOn:["domuzla-tanisma"], track:"Yeraltı", recommended:true, reward:{Savaşçı:"Grönland Usulü Tungsten Papağan",Büyücü:"Nitrojen Tipi Platin Engerek Diş",Şifacı:"Borgia Modeli Safir Akrep"} },
  { id:"topal-ilk-darbe", title:"Topal İlk Darbeyi Vuruyor", level:42, giver:"Topal", location:"Yeraltı", region:"Yeraltı", objective:"25 Kara Cin öldür.", dependsOn:["topalin-hazirliklari"], track:"Yeraltı", timed:"30 dakika", recommended:true },
  { id:"kan-pencenin-tavsiyesi", title:"Kan Pençe'nin Tavsiyesi", level:42, giver:"Kan Pençe", location:"Yeraltı", region:"Yeraltı", objective:"20 Bombacı öldür.", dependsOn:["topalin-hazirliklari"], track:"Yeraltı", recommended:true, reward:common("Karacin Modeli Kenevir Lifi Ayakkabı") },
  { id:"solucani-ezmek", title:"Solucan'ı Ezmek", level:42, giver:"Topal", location:"Yeraltı", region:"Yeraltı", objective:"Solucan'ı öldür.", dependsOn:["topal-ilk-darbe","kan-pencenin-tavsiyesi"], track:"Yeraltı", recommended:true, reward:common("Liderlik Sembolü") },

  { id:"kacak-elektrik", title:"Kaçak Elektrik", level:15, giver:"Sahaf Necmi", location:"Mısır Çarşısı", region:"Sığınaklar", objective:"Işık Hanım ile konuş.", dependsOn:[], track:"Sığınaklar", recommended:true },
  { id:"sorusturma", title:"Soruşturma", level:15, giver:"Işık Hanım", location:"Eminönü", region:"Sığınaklar", objective:"Şarapçı ile konuş.", dependsOn:["kacak-elektrik"], track:"Sığınaklar", recommended:true },
  { id:"orada-ne-var", title:"Orada Ne Var?", level:15, giver:"Şarapçı", location:"Eminönü", region:"Sığınaklar", objective:"Sahaf Necmi ile konuş.", dependsOn:["sorusturma"], track:"Sığınaklar", recommended:true, reward:common("Kapsüllü · Erciyes Modeli · Fare Zehiri Emsali iksir seçenekleri") },
  { id:"iste-saglam-eleman", title:"İşte Sağlam Bir Eleman", level:49, giver:"Agop", location:"Mısır Çarşısı", region:"Sığınaklar", objective:"Agop ile yeniden konuş.", dependsOn:["orada-ne-var"], track:"Sığınaklar", recommended:true },
  { id:"agopun-degerlendirmesi", title:"Agop'un Değerlendirmesi", level:49, giver:"Agop", location:"Mısır Çarşısı", region:"Sığınaklar", objective:"Agop ile konuşmayı tamamla.", dependsOn:["iste-saglam-eleman"], track:"Sığınaklar", recommended:true },
  { id:"salteri-indir", title:"Şalteri İndir", level:49, giver:"Agop", location:"Mısır Çarşısı", region:"Sığınaklar", objective:"Sığınaklar içindeki şalteri indir.", dependsOn:["agopun-degerlendirmesi"], track:"Sığınaklar", recommended:true, note:"KÖ sunucusundaki giriş koşulu ayrıca doğrulanmalı." },
  { id:"onun-adi-kenan", title:"Onun Adı Kenan", level:49, giver:"Lamia", location:"Sığınaklar", region:"Sığınaklar", objective:"Kenan'ı öldür ve Lamia'ya dön.", dependsOn:["agopun-degerlendirmesi"], track:"Sığınaklar", reward:{Savaşçı:"Farabi Modeli Solucan Modeli İpekli Eldiven",Büyücü:"Azat Efendi Cevriye Sultan Modeli Eldiven",Şifacı:"İbn-i Sina Cevriye Sultan Modeli İpekli Eldiven"} },

  { id:"yusuf-agabeyin-meraki", title:"Yusuf Ağabey'in Merakı", level:49, giver:"Yusuf Ağabey", location:"Eminönü", region:"Migrat", objective:"Kayıp veledin izini sür.", dependsOn:[], track:"Migrat", recommended:true },
  { id:"umutun-sirri", title:"Umut'un Sırrı", level:49, giver:"Umut", location:"Eminönü", region:"Migrat", objective:"Mezarlıktaki Çeteciye adamı sor.", dependsOn:["yusuf-agabeyin-meraki"], track:"Migrat", recommended:true },
  { id:"kara-kemik", title:"Kara Kemik", level:49, giver:"Çeteci", location:"Mezarlık", region:"Migrat", objective:"20 Kara Kemik topla.", dependsOn:["umutun-sirri"], track:"Migrat", recommended:true },
  { id:"dipsiz-kuyu", title:"Dipsiz Kuyu", level:49, giver:"Otomatik görev", location:"Sivri Ada", region:"Migrat", objective:"Çetecilere ait delili araştır.", dependsOn:["kara-kemik"], track:"Migrat", recommended:true },
  { id:"tanidik-kitap", title:"Tanıdık Kitap", level:49, giver:"Otomatik görev", location:"Sivri Ada", region:"Migrat", objective:"Gezgin şehrin girişini bul.", dependsOn:["dipsiz-kuyu"], track:"Migrat", recommended:true },
  { id:"esir", title:"Esir", level:49, giver:"Beyaz Şapkalı Adam", location:"Migrat", region:"Migrat", objective:"Junon'u öldürüp anahtarı al.", dependsOn:["tanidik-kitap"], track:"Migrat", recommended:true, reward:common("Nadide İpekli Eldiven seçeneği"), note:"Sınıfa göre eşya adı değişir." },

  { id:"khaos", title:"Khaos", level:49, giver:"Teşkilat Hattı", location:"Meteor Bölgesi", region:"Çemberlitaş", objective:"Meteor Bölgesi'ndeki havalandırma girişini araştır.", dependsOn:["arzuhalciden-jest"], track:"Çemberlitaş", recommended:true },
  { id:"yalan", title:"Yalan", level:49, giver:"Otomatik görev", location:"Havalandırma girişi", region:"Çemberlitaş", objective:"Khaos yazılı kapının ardını araştır.", dependsOn:["khaos"], track:"Çemberlitaş", recommended:true },
  { id:"gb-com", title:"GB-COM", level:49, giver:"GB-COM", location:"Çemberlitaş", region:"Çemberlitaş", objective:"Topal ile konuş.", dependsOn:["yalan"], track:"Çemberlitaş", recommended:true },
  { id:"sorgu-sual", title:"Sorgu Sual", level:49, giver:"Topal", location:"Yeraltı", region:"Çemberlitaş", objective:"Teşkilat Hattı ile konuş.", dependsOn:["gb-com"], track:"Çemberlitaş", recommended:true },
  { id:"kelle-avcisi", title:"Kelle Avcısı", level:49, giver:"Teşkilat Hattı", location:"Çemberlitaş", region:"Çemberlitaş", objective:"Gaffar Bey'i öldür.", dependsOn:["sorgu-sual"], track:"Çemberlitaş", recommended:true },

  { id:"domuzun-isleri", title:"Domuz'un İşleri", level:46, giver:"Domuz", location:"Yeraltı", region:"Büyük Hol", objective:"Mebrure Hanım ile konuş.", dependsOn:[], track:"Büyük Hol", recommended:true },
  { id:"islah", title:"Islah", level:46, giver:"Mebrure Hanım", location:"Yeni Bab-ı Ali", region:"Büyük Hol", objective:"15 Akrep Gözü ve 15 Örümcek Ağı getir.", dependsOn:["domuzun-isleri"], track:"Büyük Hol", recommended:true },
  { id:"arz-ve-lodos", title:"Arz ve Lodos", level:46, giver:"Domuz", location:"Yeraltı", region:"Büyük Hol", objective:"Büyük Hol'de Arz ve Lodosluların çatıştığı alanı ziyaret et.", dependsOn:["islah"], track:"Büyük Hol", recommended:true },
  { id:"domuza-rapor", title:"Domuz'a Rapor", level:46, giver:"Domuz", location:"Yeraltı", region:"Büyük Hol", objective:"Kan Pençe ile konuş.", dependsOn:["arz-ve-lodos"], track:"Büyük Hol", recommended:true },
  { id:"ekmek-parasi", title:"Ekmek Parası", level:49, giver:"Işık Hanım", location:"Eminönü", region:"Büyük Hol", objective:"Büyük Hol'deki sandığı aç ve para getirecek materyalleri araştır.", dependsOn:["domuza-rapor","kelle-avcisi"], track:"Büyük Hol", recommended:true },
  { id:"materyaller", title:"Materyaller", level:49, giver:"Işık Hanım", location:"Eminönü", region:"Büyük Hol", objective:"Arzuhalci ile konuş.", dependsOn:["ekmek-parasi"], track:"Büyük Hol", recommended:true },
  { id:"tiktaklar", title:"Tiktaklar", level:49, giver:"Arzuhalci", location:"Çınaraltı", region:"Büyük Hol", objective:"Arzuhalci ile konuşmayı sürdür.", dependsOn:["materyaller"], track:"Büyük Hol", recommended:true },
  { id:"saatler", title:"Saatler", level:49, giver:"Otomatik görev", location:"Büyük Hol", region:"Büyük Hol", objective:"Büyük Hol'ü araştırmaya devam et.", dependsOn:["tiktaklar"], track:"Büyük Hol", recommended:true },
];

export const questById = new Map(quests.map((quest) => [quest.id, quest]));
export const questTracks: QuestTrack[] = ["Başlangıç","Teşkilat","Arzuhalci","Meteor","Yeraltı","Sığınaklar","Migrat","Çemberlitaş","Büyük Hol"];

export function rewardFor(quest: Quest, klass: QuestClass) {
  return quest.reward?.[klass] ?? quest.reward?.Tümü ?? null;
}

export function unlockedBy(questId: string) {
  return quests.filter((quest) => quest.dependsOn.includes(questId));
}

export function questPathThrough(questId: string) {
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id)) return;
    const quest = questById.get(id);
    if (!quest) return;
    quest.dependsOn.forEach(visit);
    seen.add(id);
  };
  visit(questId);
  return seen;
}
