export type PotionVisualCategory = "health" | "power" | "support";

type PotionSeed = readonly [level: number, name: string, category: string, visual: PotionVisualCategory, materials: readonly (readonly [string, number])[]];

const seeds: PotionSeed[] = [
  // Kudret Artırıcı
  [1,"Kuzu Kudretlendiren","Kudret Artırıcı","power",[["Meşe Odunu",2]]],
  [5,"Fare Kudretlendiren","Kudret Artırıcı","power",[["Isırgan Otu",2],["Ökse Otu",2]]],
  [10,"Tilki Kudretlendiren","Kudret Artırıcı","power",[["Turkuaz",3],["Adaçayı Yaprağı",3]]],
  [15,"Sansar Kudretlendiren","Kudret Artırıcı","power",[["Ametist-Lapis",4],["Ökse Otu",4]]],
  [20,"Yunus Kudretlendiren","Kudret Artırıcı","power",[["Koni Yaprağı",6],["Ok Sertleştirici",1]]],
  [25,"Kuzgun Kudretlendiren","Kudret Artırıcı","power",[["Altın",6],["Adaçayı Yaprağı",6],["Budaksız Meşe",1]]],
  [30,"Kangal Kudretlendiren","Kudret Artırıcı","power",[["Sinek Karışımı",1],["Ceviz",1],["Ceviz Yaprağı",7]]],
  [35,"Goril Kudretlendiren","Kudret Artırıcı","power",[["Gök Birleşik",1],["Saf Bakır",1]]],
  [40,"Anka Kudretlendiren","Kudret Artırıcı","power",[["Civan Perçemi",9],["Krizoberil",9],["Ökse Meyvesi",1]]],
  [45,"Ejderha Kudretlendiren","Kudret Artırıcı","power",[["Ökse Otu",10],["Topaz",10],["Saf Demir",1]]],

  // Enerji Artırıcı
  [1,"Kedi İyileştiren","Enerji Artırıcı","health",[["Ceviz Yaprağı",1],["Meşe Odunu",1]]],
  [5,"Koç İyileştiren","Enerji Artırıcı","health",[["Isırgan Otu",2],["Ökse Otu",2]]],
  [10,"Cin İyileştiren","Enerji Artırıcı","health",[["Ceviz Yaprağı",4],["Nikel",2]]],
  [15,"Kurt İyileştiren","Enerji Artırıcı","health",[["Ökse Otu",4],["Sema Karışımı",1]]],
  [20,"Aygır İyileştiren","Enerji Artırıcı","health",[["Koni Yaprağı",5],["Civan Perçemi",5]]],
  [25,"Manda İyileştiren","Enerji Artırıcı","health",[["Adaçayı Yaprağı",6],["Civan Perçemi",6],["Budaksız Meşe",1]]],
  [30,"Aslan İyileştiren","Enerji Artırıcı","health",[["Mavi Safir",7],["Ceviz",1]]],
  [35,"Ayı İyileştiren","Enerji Artırıcı","health",[["KSH",1],["Saf Kalay",1]]],
  [40,"Fil İyileştiren","Enerji Artırıcı","health",[["Abanoz Odunu",9],["Kuvars",9],["Saf Nikel",1]]],
  [45,"Dinozor İyileştiren","Enerji Artırıcı","health",[["Çıban Otu",10],["Krizoberil",10],["Saf Kurşun",1]]],

  // Savunma Artırıcı
  [1,"Savunma Artırıcı","Savunma Artırıcı","support",[["Meşe Odunu",1]]],
  [5,"Deniz Kabuklu","Savunma Artırıcı","support",[["Ökse Otu",4]]],
  [10,"Kirpi Emsali","Savunma Artırıcı","support",[["Isırgan Otu",4],["Ceviz Yaprağı",2]]],
  [15,"Ruh Kalkanlı","Savunma Artırıcı","support",[["Adaçayı Yaprağı",4],["Nikel",4]]],
  [20,"Karaktor İcadı","Savunma Artırıcı","support",[["Koni Yaprağı",5],["Isırgan Otu",5]]],
  [25,"Yel Değirmeni Modeli","Savunma Artırıcı","support",[["Budaksız Meşe",1],["Altın",1],["Adaçayı Yaprağı",6]]],
  [30,"Maginot Modeli","Savunma Artırıcı","support",[["Mantar",6],["Ok Sertleştirici",1],["Saf Bakır",1]]],
  [35,"Conk Usulü","Savunma Artırıcı","support",[["Beril",1],["Ametist",5],["Budaksız Meşe",1]]],
  [40,"Estergon Usulü","Savunma Artırıcı","support",[["Ökse Otu",9],["Topaz",9],["Isırgan Tohumu",1]]],
  [45,"Plevne Emsali","Savunma Artırıcı","support",[["Civan Perçemi",10],["Turkuaz",10],["Saf Nikel",10]]],

  // Saldırı Artırıcı
  [1,"Saldırı Artırıcı","Saldırı Artırıcı","support",[["Kuvars",2]]],
  [5,"Kedi Emsali","Saldırı Artırıcı","support",[["Ökse Otu",2],["Kan Taşı",2]]],
  [10,"Üstün İcadı","Saldırı Artırıcı","support",[["Adaçayı Yaprağı",3],["Nikel",3]]],
  [15,"Hermann-Sermen Modeli","Saldırı Artırıcı","support",[["Ametist-Lapis",1]]],
  [20,"Avcı Usulü","Saldırı Artırıcı","support",[["Adaçayı Yaprağı",5],["Koni Yaprağı",5]]],
  [25,"Kaplan Emsali","Saldırı Artırıcı","support",[["Turkuaz",6],["Koni Yaprağı",6],["Saf Bakır",1]]],
  [30,"Jandarma Ali Modeli","Saldırı Artırıcı","support",[["Ceviz",1],["Sinek Karışımı",1],["Ceviz Yaprağı",7]]],
  [35,"Dış Şehir Modeli","Saldırı Artırıcı","support",[["Beril",8],["Civan Perçemi",8],["Budaksız Meşe",1]]],
  [40,"Tora Tora Misali","Saldırı Artırıcı","support",[["Krizoberil",9],["Gümüş",9],["Isırgan Tohumu",1]]],
  [45,"Ardenneler Misali","Saldırı Artırıcı","support",[["Çıban Otu",10],["Altın",10],["Ökse Meyvesi",1]]],

  // Zırh Artırıcı
  [1,"Zırh Artırıcı","Zırh Artırıcı","support",[["Meşe Odunu",2]]],
  [5,"Fareadam Menşeili","Zırh Artırıcı","support",[["Ökse Otu",4]]],
  [10,"Eski Köprü Usulü","Zırh Artırıcı","support",[["Adaçayı Yaprağı",3],["Ceviz Yaprağı",3]]],
  [20,"Meteor Madeni Emsali","Zırh Artırıcı","support",[["Adaçayı Yaprağı",4],["Nikel",4]]],
  [25,"Klaks Özel Modeli","Zırh Artırıcı","support",[["Altın",6],["Adaçayı Yaprağı",6],["Budaksız Meşe",1]]],
  [30,"Timsah Derisi Emsali","Zırh Artırıcı","support",[["Mantar",6],["Saf Bakır",1],["Ok Sertleştirici",1]]],
  [35,"Demirci Dilek Modeli","Zırh Artırıcı","support",[["Şerbetçi Otu",8],["Kuvars",8],["Ceviz",1]]],
  [40,"Karacin Modeli","Zırh Artırıcı","support",[["Abanoz Odunu",9],["Krizoberil",9],["Ada Sürgünü",1]]],
  [45,"Solucan Modeli","Zırh Artırıcı","support",[["Çıban Otu",10],["Kan Taşı",10],["Kurşun",1]]],

  // Kritik Vuruş Artırıcı
  [1,"Kritik Artırıcı","Kritik Vuruş Artırıcı","support",[["Ceviz Yaprağı",2]]],
  [5,"İğne Deliği Misali","Kritik Vuruş Artırıcı","support",[["Isırgan Otu",4]]],
  [10,"Horoz Gagası Misali","Kritik Vuruş Artırıcı","support",[["Adaçayı Yaprağı",3],["Turkuaz",3]]],
  [15,"Deniz Kestanesi Misali","Kritik Vuruş Artırıcı","support",[["Sema Karışımı",1],["Ametist",3]]],
  [20,"Epe Ucu Misali","Kritik Vuruş Artırıcı","support",[["Koni Yaprağı",6],["Ok Sertleştirici",1]]],
  [25,"Yılan Isırığı Emsali","Kritik Vuruş Artırıcı","support",[["Civan Perçemi",6],["Kan Taşı",6],["Budaksız Meşe",1]]],
  [30,"Rus Ruleti Emsali","Kritik Vuruş Artırıcı","support",[["KSH",1],["Saf Kalay",1]]],
  [35,"Ok Ucu Modeli","Kritik Vuruş Artırıcı","support",[["Göz Taşı",1],["Budaksız Meşe",1]]],
  [40,"Philotheos Modeli","Kritik Vuruş Artırıcı","support",[["Karbon",1],["Abanoz Odunu",12],["Kurşun",1]]],
  [45,"Halit Girmenç İcadı","Kritik Vuruş Artırıcı","support",[["Çıban Otu",10],["Topaz",10],["Saf Demir",1]]],

  // Büyü Kritik Artırıcı
  [30,"Büyü Kritik Artırıcı","Büyü Kritik Artırıcı","support",[["Sinek Karışımı",1],["Saf Kalay",1],["Koni Yaprağı",7]]],
  [35,"Merlin Modeli","Büyü Kritik Artırıcı","support",[["Budaksız Meşe",1],["Göz Taşı",1]]],
  [40,"Ruh Çalan Emsali","Büyü Kritik Artırıcı","support",[["Çıban Otu",10]]],
  [45,"Cevriye Sultan Modeli","Büyü Kritik Artırıcı","support",[["Çıban Otu",10],["Gümüş",10],["Isırgan Tohumu",1]]],

  // İyileştirme Artırıcı
  [30,"İyileştirme Artırıcı","İyileştirme Artırıcı","support",[["Mantar",7],["Mavi Safir",7],["Ceviz",1]]],
  [35,"Nefes Emsali","İyileştirme Artırıcı","support",[["Beril",1],["Ametist",5],["Budaksız Meşe",1]]],
  [40,"Mağara Şamanı Modeli","İyileştirme Artırıcı","support",[["Civan Perçemi",9]]],
  [45,"İbn-i Sina Modeli","İyileştirme Artırıcı","support",[["Ökse Otu",10],["Gümüş",10]]],

  // Hareket Hızı Artırıcı
  [35,"Antilop Emsali","Hareket Hızı Artırıcı","support",[["Saf Bakır",1],["Budaksız Meşe",1],["Kan Taşı",2],["Ceviz",1]]],

  // Maksimum Hasar Artırıcı
  [1,"Hasar Artırıcı","Maksimum Hasar Artırıcı","support",[["Kuvars",2]]],
  [5,"Çekiç Başlı","Maksimum Hasar Artırıcı","support",[["Kan Taşı",2],["Ökse Otu",2]]],
  [10,"Örs Kütleli","Maksimum Hasar Artırıcı","support",[["Nikel",3],["Adaçayı Yaprağı",3]]],
  [15,"Adalı Emsali","Maksimum Hasar Artırıcı","support",[["Ametist-Lapis",4],["Ökse Otu",4]]],
  [20,"Çarşı Sokağı Usulü","Maksimum Hasar Artırıcı","support",[["Kalsedon",5],["Gümüş",5]]],
  [25,"Meteor Tipi","Maksimum Hasar Artırıcı","support",[["Koni Yaprağı",6],["Turkuaz",6],["Saf Bakır",1]]],
  [30,"Eski ve Arkadaşları İcadı","Maksimum Hasar Artırıcı","support",[["Sinek Karışımı",1],["Koni Yaprağı",7],["Saf Kalay",1]]],
  [35,"Alman Modeli","Maksimum Hasar Artırıcı","support",[["Beril",8],["Civan Perçemi",8],["Budaksız Meşe",1]]],
  [40,"Urban İcadı","Maksimum Hasar Artırıcı","support",[["Çıban Otu",9],["Krizoberil",9],["Ada Sürgünü",1]]],
  [45,"Yücelen Ekolü","Maksimum Hasar Artırıcı","support",[["Isırgan Otu",10],["Ok Sertleştirici",10],["Ökse Meyvesi",1]]],

  // Hasar · Elektrik
  [1,"Elektrik Hasarı Veren","Hasar · Elektrik","support",[["Meşe Odunu",2]]],
  [5,"Volta Modeli","Hasar · Elektrik","support",[["Ceviz Yaprağı",2],["Kan Taşı",2]]],
  [10,"Necati Bey İcadı","Hasar · Elektrik","support",[["Adaçayı Yaprağı",3],["Turkuaz",2]]],
  [15,"Yüksek Gerilim Emsali","Hasar · Elektrik","support",[["Nikel",4],["Adaçayı Yaprağı",4]]],
  [20,"Edison Modeli","Hasar · Elektrik","support",[["Koni Yaprağı",6],["Ok Sertleştirici",1]]],
  [25,"Mev Usulü","Hasar · Elektrik","support",[["Saf Bakır",1],["Altın",6],["Civan Perçemi",6]]],
  [30,"Etin Palpa","Hasar · Elektrik","support",[["Sinek Karışımı",1],["Koni Yaprağı",7],["Saf Kalay",1]]],
  [35,"Tesla Modeli","Hasar · Elektrik","support",[["Şerbetçi Otu",8],["Kalsedon",8],["Ceviz",1]]],
  [40,"Kehribarlı","Hasar · Elektrik","support",[["Altın",9],["Topaz",9],["Kurşun",1]]],
  [45,"Mesmer Modeli","Hasar · Elektrik","support",[["Ökse Otu",10],["Krizoberil",10],["Ada Sürgünü",1]]],

  // Hasar · Buz
  [1,"Buz Hasarı Veren","Hasar · Buz","support",[["Obsidyen",2]]],
  [5,"Kutup Esintili","Hasar · Buz","support",[["Isırgan Otu",4]]],
  [10,"Çamlıca Menşeili","Hasar · Buz","support",[["Adaçayı Yaprağı",3],["Kan Taşı",3]]],
  [15,"Eskimo Usulü","Hasar · Buz","support",[["Krom",4],["Turkuaz",4]]],
  [20,"Frederik İcadı","Hasar · Buz","support",[["Adaçayı Yaprağı",5],["Koni Yaprağı",5]]],
  [25,"Zwartan İcadı","Hasar · Buz","support",[["Civan Perçemi",6],["Adaçayı Yaprağı",6],["Budaksız Meşe",1]]],
  [30,"Karayel Etkili","Hasar · Buz","support",[["Saf Bakır",1],["Ok Sertleştirici",1],["Mantar",6]]],
  [35,"Kristal Modeli","Hasar · Buz","support",[["Beril",8],["Civan Perçemi",8],["Budaksız Meşe",1]]],
  [40,"Grönland Usulü","Hasar · Buz","support",[["Meşe Odunu",9],["Abanoz Odunu",9],["Saf Demir",1]]],
  [45,"Nötron Yıldızı Emsali","Hasar · Buz","support",[["Çıban Otu",10],["Nikel",10],["Saf Nikel",1]]],

  // Hasar · Ateş
  [1,"Ateş Hasarı Veren","Hasar · Ateş","support",[["Ceviz Yaprağı",2]]],
  [5,"Akkor tipi","Hasar · Ateş","support",[["Isırgan Otu",2],["Demir",2]]],
  [10,"GB Modeli","Hasar · Ateş","support",[["Nikel",3],["Adaçayı Yaprağı",3]]],
  [15,"Sancak Etkili","Hasar · Ateş","support",[["Ökse Otu",4],["Ametist-Lapis",4]]],
  [20,"Duman Destekli","Hasar · Ateş","support",[["Bahçe Karışımı",1]]],
  [25,"Kuvayi Milliye","Hasar · Ateş","support",[["Mantar",6],["Ceviz Yaprağı",4],["Isırgan Otu",4],["Saf Kalay",1]]],
  [30,"Gizit Modeli","Hasar · Ateş","support",[["Meşe Odunu",4],["Ametist",4]]],
  [35,"Magnezyum Destekli","Hasar · Ateş","support",[["Ametist",4],["Meşe Odunu",4]]],
  [40,"Mavi Alev Misali","Hasar · Ateş","support",[["Abanoz Odunu",9],["Nikel",9],["Saf Nikel",1]]],
  [45,"Büyük Sahra Menşeili","Hasar · Ateş","support",[["Çıban Otu",10],["Kuvars",10],["Ada Sürgünü",1]]],

  // Hasar · Asit
  [1,"Asit Hasarı Veren","Hasar · Asit","support",[["Kuvars",1],["Ceviz Yaprağı",1]]],
  [5,"Semender Emsali","Hasar · Asit","support",[["Kan Taşı",2],["Demir",2]]],
  [10,"Asit Yağmuru Emsali","Hasar · Asit","support",[["Adaçayı Yaprağı",3],["Ökse Otu",3]]],
  [15,"Lavosier Modeli","Hasar · Asit","support",[["Ametist-Lapis",1]]],
  [20,"Bohr Modeli","Hasar · Asit","support",[["Koni Yaprağı",5],["Isırgan Otu",5]]],
  [25,"Derhi İcadı","Hasar · Asit","support",[["Turkuaz",6],["Koni Yaprağı",6],["Saf Bakır",1]]],
  [30,"Hasan 2 Modeli","Hasar · Asit","support",[["Mantar",7],["Mavi Safir",7],["Ceviz",1]]],
  [35,"Dalton Modeli","Hasar · Asit","support",[["Beril",1],["Budaksız Meşe",1],["Ametist",5]]],
  [40,"Kezzaplı","Hasar · Asit","support",[["Civan Perçemi",9],["Abanoz Odunu",9],["Saf Demir",1]]],
  [45,"Zilfallon İcadı","Hasar · Asit","support",[["Isırgan Otu",10],["Topaz",10],["Isırgan Tohumu",1]]],

  // Hasar · Zehir
  [1,"Zehir Hasarı Veren","Hasar · Zehir","support",[["Ceviz Yaprağı",2]]],
  [5,"Fare Zehiri Emsali","Hasar · Zehir","support",[["Ökse Otu",4]]],
  [10,"Kobra Yılanı Emsali","Hasar · Zehir","support",[["Ceviz Yaprağı",2],["Isırgan Otu",4]]],
  [15,"Çelik Haberci Usulü","Hasar · Zehir","support",[["Sema Karışımı",1],["Ametist",3]]],
  [20,"Kara Mamba Emsali","Hasar · Zehir","support",[["Kalsedon",5],["Gümüş",5]]],
  [25,"Yalgın Bey Usulü","Hasar · Zehir","support",[["Civan Perçemi",6],["Kan Taşı",6],["Budaksız Meşe",1]]],
  [30,"Karadul Emsali","Hasar · Zehir","support",[["Ceviz",1],["Sinek Karışımı",1],["Ceviz Yaprağı",7]]],
  [35,"Gül Dikeni Modeli","Hasar · Zehir","support",[["Saf Kalay",1],["Şerbetçi Otu",8],["Beril",8]]],
  [40,"Hidrofis Emsali","Hasar · Zehir","support",[["Meşe Odunu",9],["Gümüş",9],["Ökse Meyvesi",1]]],
  [45,"Arsenikli","Hasar · Zehir","support",[["Isırgan Otu",10],["Altın",10],["Kurşun",1]]],

  // Büyü Hasarı · Fiziksel
  [1,"Fiziksel Hasar Artırıcı","Büyü Hasarı · Fiziksel","support",[["Ceviz Yaprağı",1],["Meşe Odunu",1]]],
  [5,"Eski Bizans Usulü","Büyü Hasarı · Fiziksel","support",[["Kan Taşı",2],["Ceviz Yaprağı",1]]],
  [10,"Çeteci Usulü","Büyü Hasarı · Fiziksel","support",[["Adaçayı Yaprağı",3],["Ökse Otu",3]]],
  [15,"GB Modeli","Büyü Hasarı · Fiziksel","support",[["Meşe Odunu",4],["Ametist",4]]],
  [20,"Yılan Dişi","Büyü Hasarı · Fiziksel","support",[["Koni Yaprağı",5],["Bahçe Karışımı",1]]],
  [25,"Selim Bey İcadı","Büyü Hasarı · Fiziksel","support",[["Altın",6],["Civan Perçemi",6],["Saf Bakır",1]]],
  [30,"Nexus Modeli","Büyü Hasarı · Fiziksel","support",[["Mantar",7],["Koni Yaprağı",7],["Saf Bakır",1]]],
  [35,"Komet Modeli","Büyü Hasarı · Fiziksel","support",[["Beril",8],["Civan Perçemi",8],["Saf Kalay",1]]],
  [40,"Kan Çalan Modeli","Büyü Hasarı · Fiziksel","support",[["Meşe Odunu",9],["Topaz",9],["Saf Nikel",1]]],
  [45,"Fevzi Bey Modeli","Büyü Hasarı · Fiziksel","support",[["Çıban Otu",10],["Kuvars",10],["Isırgan Tohumu",1]]],

  // Büyü Hasarı · Elektrik
  [1,"Elektrik Hasarı Artırıcı","Büyü Hasarı · Elektrik","support",[["Kuvars",1],["Ceviz Yaprağı",1]]],
  [5,"Gerilim Modeli","Büyü Hasarı · Elektrik","support",[["Isırgan Otu",4]]],
  [10,"Cin Usulü","Büyü Hasarı · Elektrik","support",[["Adaçayı Yaprağı",3],["Turkuaz",3]]],
  [15,"Alatlı Modeli","Büyü Hasarı · Elektrik","support",[["Nikel",4],["Adaçayı Yaprağı",4]]],
  [20,"Şok Modeli","Büyü Hasarı · Elektrik","support",[["Bahçe Karışımı",1]]],
  [25,"Vatoz Emsali","Büyü Hasarı · Elektrik","support",[["Civan Perçemi",6],["Kalsedon",6],["Ceviz",1]]],
  [30,"Köz Modeli","Büyü Hasarı · Elektrik","support",[["Sinek Karışımı",1],["Ceviz Yaprağı",7],["Ceviz",1]]],
  [35,"Zincir Modeli","Büyü Hasarı · Elektrik","support",[["Elmas Asa Kristali",5],["Açık Pembe Ametist",3],["Saf Altın",3],["Isırgan Tohumu",9]]],
  [40,"Doğru Akım Destekli","Büyü Hasarı · Elektrik","support",[["Isırgan Otu",9],["Turkuaz",9],["Saf Nikel",1]]],
  [45,"Azat Efendi İcadı","Büyü Hasarı · Elektrik","support",[["Çıban Otu",10],["Krizoberil",10],["Ökse Meyvesi",1]]],

  // Büyü Hasarı · Buz
  [1,"Buz Hasarı Artırıcı","Büyü Hasarı · Buz","support",[["Meşe Odunu",2]]],
  [5,"Erciyes Modeli","Büyü Hasarı · Buz","support",[["Ökse Otu",2],["Kan Taşı",2]]],
  [10,"GB Usulü","Büyü Hasarı · Buz","support",[["Isırgan Otu",4],["Ceviz Yaprağı",2]]],
  [15,"Sibirya Usulü","Büyü Hasarı · Buz","support",[["Ametist-Lapis",8]]],
  [20,"Sudan Kalpli","Büyü Hasarı · Buz","support",[["Adaçayı Yaprağı",5],["Koni Yaprağı",5]]],
  [25,"Demirden İcadı","Büyü Hasarı · Buz","support",[["Civan Perçemi",6],["Kan Taşı",6],["Budaksız Meşe",1]]],
  [30,"Olgunn İcadı","Büyü Hasarı · Buz","support",[["Mantar",6],["Ceviz Yaprağı",4],["Isırgan Otu",4],["Saf Kalay",1]]],
  [35,"Buz Kristali Modeli","Büyü Hasarı · Buz","support",[["Şerbetçi Otu",8],["Beril",8],["Saf Kalay",1]]],
  [40,"Nitrojen Tipi","Büyü Hasarı · Buz","support",[["Ökse Otu",9],["Krizoberil",9]]],
  [45,"Bilge Kağan Modeli","Büyü Hasarı · Buz","support",[["Demir",10],["Civan Perçemi",10],["Isırgan Tohumu",1]]],

  // Büyü Hasarı · Ateş
  [1,"Ateş Hasarı Artırıcı","Büyü Hasarı · Ateş","support",[["Ceviz Yaprağı",1],["Kuvars",1]]],
  [5,"Demir Formüllü","Büyü Hasarı · Ateş","support",[["Kan Taşı",2],["Ceviz Yaprağı",2]]],
  [10,"Ateş Böceği Emsali","Büyü Hasarı · Ateş","support",[["Adaçayı Yaprağı",3],["Nikel",3]]],
  [15,"Güneş Öncüsü Menşeili","Büyü Hasarı · Ateş","support",[["Sema Karışımı",1],["Ametist",3]]],
  [20,"Ejder Nefesi Misali","Büyü Hasarı · Ateş","support",[["Kalsedon",5],["Gümüş",5]]],
  [25,"Necmi İcadi","Büyü Hasarı · Ateş","support",[["Altın",6],["Adaçayı Yaprağı",6],["Budaksız Meşe",1]]],
  [30,"Petrol Destekli","Büyü Hasarı · Ateş","support",[["Saf Kalay",1],["Sinek Karışımı",1],["Koni Yaprağı",7]]],
  [35,"Sera Etkili","Büyü Hasarı · Ateş","support",[["Ametist",5],["Budaksız Meşe",1],["Beril",3]]],
  [40,"Antik Mısır Tarzı","Büyü Hasarı · Ateş","support",[["Civan Perçemi",9],["Turkuaz",9],["Ada Sürgünü",1]]],
  [45,"Tarshass Menşeili","Büyü Hasarı · Ateş","support",[["Abanoz Odunu",10],["Krizoberil",10],["Saf Demir",1]]],

  // Büyü Hasarı · Asit
  [1,"Asit Hasarı Artırıcı","Büyü Hasarı · Asit","support",[["Obsidyen",2]]],
  [5,"Karınca Emsali","Büyü Hasarı · Asit","support",[["Kan Taşı",2],["Ökse Otu",2]]],
  [10,"Katılaştırılmış","Büyü Hasarı · Asit","support",[["Ökse Otu",3],["Adaçayı Yaprağı",3]]],
  [15,"GB Formüllü","Büyü Hasarı · Asit","support",[["Ametist-Lapis",4],["Ökse Otu",4]]],
  [20,"Ragıp Bey İcadı","Büyü Hasarı · Asit","support",[["Koni Yaprağı",5],["Bahçe Karışımı",1]]],
  [25,"DB Patentliği","Büyü Hasarı · Asit","support",[["Turkuaz",6],["Koni Yaprağı",6],["Saf Bakır",1]]],
  [30,"Maden Suyu Modeli","Büyü Hasarı · Asit","support",[["Mantar",7],["Mavi Safir",7],["Ceviz",1]]],
  [35,"Turnusol Modeli","Büyü Hasarı · Asit","support",[["Şerbetçi Otu",8],["Kalsedon",8],["Ceviz",1]]],
  [40,"Joker Emsali","Büyü Hasarı · Asit","support",[["Ok Sertleştirici",9],["Meşe Odunu",9],["Kurşun",1]]],
  [45,"Hayyan İcadı","Büyü Hasarı · Asit","support",[["Abanoz Odunu",10],["Topaz",10],["Ada Sürgünü",1]]],

  // Büyü Hasarı · Zehir
  [1,"Zehir Hasarı Artırıcı","Büyü Hasarı · Zehir","support",[["Meşe Odunu",2]]],
  [5,"Tacir Kapsüllü","Büyü Hasarı · Zehir","support",[["Isırgan Otu",2],["Demir",2]]],
  [10,"Akrep Emsali","Büyü Hasarı · Zehir","support",[["Isırgan Otu",4],["Ceviz Yaprağı",2]]],
  [15,"Yaban Mantarlı","Büyü Hasarı · Zehir","support",[["Meşe Odunu",4],["Ametist",4]]],
  [20,"Yılan Emsali","Büyü Hasarı · Zehir","support",[["Koni Yaprağı",5],["Isırgan Otu",5]]],
  [25,"Teiseba İcadı","Büyü Hasarı · Zehir","support",[["Saf Bakır",1],["Koni Yaprağı",6],["Turkuaz",6]]],
  [30,"TncyEkoClgnUyksz Formüllü","Büyü Hasarı · Zehir","support",[["Mantar",6],["Ok Sertleştirici",1],["Saf Bakır",1]]],
  [35,"Şah Kobra Misali","Büyü Hasarı · Zehir","support",[["Ceviz",1],["Kuvars",8],["Şerbetçi Otu",8]]],
  [40,"Borgia Modeli","Büyü Hasarı · Zehir","support",[["Ametist-Lapis",9],["Isırgan Otu",9],["Kurşun",1]]],
  [45,"Paracelsus İcadı","Büyü Hasarı · Zehir","support",[["Topaz",10],["Altın",10],["Ada Sürgünü",1]]],

  // Direnç · Elektrik
  [1,"Elektrik Direnci Artırıcı","Direnç · Elektrik","support",[["Obsidyen",2]]],
  [5,"Plastik Emsali","Direnç · Elektrik","support",[["Isırgan Otu",4]]],
  [10,"Bakırköy Usulü","Direnç · Elektrik","support",[["Adaçayı Yaprağı",3],["Turkuaz",3]]],
  [15,"Çemberlitaş Usulü","Direnç · Elektrik","support",[["Ametist-Lapis",4],["Ökse Otu",4]]],
  [20,"Faraday Modeli","Direnç · Elektrik","support",[["Koni Yaprağı",5],["Isırgan Otu",5]]],
  [25,"İnzar Bey İcadı","Direnç · Elektrik","support",[["Civan Perçemi",6],["Kalsedon",6],["Ceviz",1]]],
  [30,"Toprak Modeli","Direnç · Elektrik","support",[["Mantar",6],["Ok Sertleştirici",1],["Saf Bakır",1]]],
  [35,"Folklor Modeli","Direnç · Elektrik","support",[["Beril",1],["Budaksız Meşe",1],["Ametist",5]]],
  [40,"Bardini İcadı","Direnç · Elektrik","support",[["Isırgan Otu",9],["Topaz",9],["Saf Demir",1]]],
  [45,"Shen Kuo İcadı","Direnç · Elektrik","support",[["Çıban Otu",10],["Topaz",10],["Ökse Meyvesi",1]]],

  // Direnç · Buz
  [1,"Buz Direnci Artırıcı","Direnç · Buz","support",[["Meşe Odunu",2]]],
  [5,"Sabit Usta İcadı","Direnç · Buz","support",[["Ökse Otu",4]]],
  [10,"Fok Emsali","Direnç · Buz","support",[["Adaçayı Yaprağı",3],["Turkuaz",3]]],
  [15,"Sekanslı","Direnç · Buz","support",[["Adaçayı Yaprağı",4],["Nikel",4]]],
  [20,"Oğuz Bey İcadı","Direnç · Buz","support",[["Koni Yaprağı",6],["Ok Sertleştirici",1]]],
  [25,"Şimal Usulü","Direnç · Buz","support",[["Adaçayı Yaprağı",6],["Civan Perçemi",6],["Budaksız Meşe",1]]],
  [30,"İlikçi Emsali","Direnç · Buz","support",[["Sinek Karışımı",1],["Saf Kalay",1],["Koni Yaprağı",7]]],
  [35,"Derviş Hasan Usulü","Direnç · Buz","support",[["Şerbetçi Otu",8],["Kuvars",8],["Ceviz",1]]],
  [40,"Kemikkafa Tipi","Direnç · Buz","support",[["Çıban Otu",9],["Kan Taşı",9],["Isırgan Tohumu",1]]],
  [45,"Karakürk Emsali","Direnç · Buz","support",[["Abanoz Odunu",10],["Demir",10],["Isırgan Tohumu",1]]],

  // Direnç · Ateş
  [1,"Ateş Direnci Artırıcı","Direnç · Ateş","support",[["Kuvars",1],["Ceviz Yaprağı",1]]],
  [5,"Su Misali","Direnç · Ateş","support",[["Kan Taşı",2],["Ceviz Yaprağı",2]]],
  [10,"Köpük Misali","Direnç · Ateş","support",[["Adaçayı Yaprağı",3],["Kan Taşı",3]]],
  [15,"Üstat Memduh İcadı","Direnç · Ateş","support",[["Meşe Odunu",4],["Ametist",4]]],
  [20,"Demir Misali","Direnç · Ateş","support",[["Bahçe Karışımı",1]]],
  [25,"GB Buz Destekli","Direnç · Ateş","support",[["Civan Perçemi",6],["Kan Taşı",6],["Budaksız Meşe",1]]],
  [30,"Tazı Emsali","Direnç · Ateş","support",[["Mantar",6],["Ceviz Yaprağı",4],["Isırgan Otu",4],["Saf Kalay",1]]],
  [35,"Umut Dergisi Modeli","Direnç · Ateş","support",[["Beril",8],["Civan Perçemi",8],["Budaksız Meşe",1]]],
  [40,"Amyant Tipi","Direnç · Ateş","support",[["Ökse Otu",9],["Kuvars",9],["Ada Sürgünü",1]]],
  [45,"Aramit Tipi","Direnç · Ateş","support",[["Civan Perçemi",10],["Turkuaz",10],["Saf Demir",1]]],

  // Direnç · Asit
  [1,"Asit Direnci Artırıcı","Direnç · Asit","support",[["Ceviz Yaprağı",2]]],
  [5,"Simyacı Usulü","Direnç · Asit","support",[["Ökse Otu",2],["Kan Taşı",2]]],
  [10,"Şifacı Zeki Muadili","Direnç · Asit","support",[["Ökse Otu",3],["Adaçayı Yaprağı",3]]],
  [15,"Heybeliada Menşeili","Direnç · Asit","support",[["Adaçayı Yaprağı",4],["Nikel",4]]],
  [20,"Sultan Buyruğu Emsali","Direnç · Asit","support",[["Koni Yaprağı",5],["Adaçayı Yaprağı",5]]],
  [25,"Sipayri Usulü","Direnç · Asit","support",[["Altın",6],["Civan Perçemi",6],["Saf Bakır",1]]],
  [30,"Komodo Emsali","Direnç · Asit","support",[["Ceviz",1],["Sinek Karışımı",1],["Ceviz Yaprağı",7]]],
  [35,"Cam Formüllü","Direnç · Asit","support",[["Saf Kalay",1],["Beril",8],["Şerbetçi Otu",8]]],
  [40,"Granit Emsali","Direnç · Asit","support",[["Meşe Odunu",9],["Ametist-Lapis",9],["Saf Nikel",1]]],
  [45,"Vahşi Emsali","Direnç · Asit","support",[["Civan Perçemi",10],["Krizoberil",10],["Kurşun",1]]],

  // Direnç · Zehir
  [1,"Zehir Direnci Artırıcı","Direnç · Zehir","support",[["Ceviz Yaprağı",1],["Kuvars",1]]],
  [5,"Nargile Usulü","Direnç · Zehir","support",[["Kan Taşı",2],["Demir",2]]],
  [10,"Yoğurt Misali","Direnç · Zehir","support",[["Adaçayı Yaprağı",3],["Nikel",3]]],
  [15,"Zakkum Emsali","Direnç · Zehir","support",[["Turkuaz",4],["Krom",4]]],
  [20,"Engerek Emsali","Direnç · Zehir","support",[["Koni Yaprağı",5],["Isırgan Otu",5]]],
  [25,"Cin Kralı İcadı","Direnç · Zehir","support",[["Turkuaz",6],["Koni Yaprağı",6],["Saf Bakır",1]]],
  [30,"Aktar Şevket İcadı","Direnç · Zehir","support",[["Mantar",7],["Mavi Safir",7],["Ceviz",1]]],
  [35,"Beygir Emsali","Direnç · Zehir","support",[["Şerbetçi Otu",8],["Kalsedon",8],["Ceviz",1]]],
  [40,"Garr Tipi","Direnç · Zehir","support",[["Civan Perçemi",9],["Turkuaz",9],["Saf Nikel",1]]],
  [45,"Vadi Kobrası Emsali","Direnç · Zehir","support",[["Isırgan Otu",10],["Kuvars",10],["Ökse Meyvesi",1]]],

  // Maksimum Kudret Artırıcı
  [30,"Derin Göl Emsali","Maksimum Kudret Artırıcı","support",[["Sinek Karışımı",1],["Ceviz",1],["Ceviz Yaprağı",7]]],
  [30,"Düşük Kudret Artırıcı","Maksimum Kudret Artırıcı","support",[["Sinek Karışımı",1],["Ceviz",1],["Ceviz Yaprağı",7]]],
  [35,"Dipsiz Kuyu Emsali","Maksimum Kudret Artırıcı","support",[["Gök Birleşik",1],["Saf Bakır",1]]],
  [35,"Mebrure Hanım İcadı","Maksimum Kudret Artırıcı","support",[["Saf Bakır",1],["Gök Birleşik",1]]],

  // Maksimum Enerji Artırıcı
  [30,"Düşük Enerji Artırıcı","Maksimum Enerji Artırıcı","support",[["Ceviz",1],["Mantar",7],["Mavi Safir",7]]],
  [30,"Serçe Emsali","Maksimum Enerji Artırıcı","support",[["Mantar",7],["Mavi Safir",7],["Ceviz",1]]],
  [35,"Işık Havuzu Emsali","Maksimum Enerji Artırıcı","support",[["KSH",1],["Saf Kalay",1]]],
  [35,"Keçi Boynuzu Modeli","Maksimum Enerji Artırıcı","support",[["Gök Birleşik",1],["Saf Bakır",1]]],

];

const slug = (value: string) => value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/ı/g,"i").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

export const potionRecipeSourceId = "fandom-potion-recipes-20260826";
export const potionRecipes = seeds.map(([level,name,category,visual,materials]) => ({
  id: `recipe-potion-${slug(category)}-${slug(name)}`,
  itemId: `potion-${slug(category)}-${slug(name)}`,
  name: `${name} İksir`,
  level,
  category,
  visualCategory: visual,
  method: "İksir üretimi" as const,
  materials: materials.map(([materialName,quantity]) => ({ name: materialName, quantity })),
  sourceId: potionRecipeSourceId,
  verificationStatus: "single_source" as const,
  lastChecked: "2026-08-28",
}));

export type PotionRecipe = (typeof potionRecipes)[number];
export const potionById = new Map(potionRecipes.map((recipe) => [recipe.itemId, recipe]));
