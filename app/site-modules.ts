export const moduleTabs = [
  { id: "builder", label: "Donanım", summary: "Eşya seç, toplam özelliklerini gör.", keywords: "build set zırh silah" },
  { id: "skills", label: "Yetenek", summary: "Seviyene göre yetenek puanı dağıt.", keywords: "skill simülasyon puan" },
  { id: "engine", label: "Tılsım", summary: "Tılsım etkisini ve edinme yolunu incele.", keywords: "kademe reçete büyük hol" },
  { id: "recipes", label: "Reçeteler", summary: "Eşya, tılsım ve iksir reçetelerini ayır.", keywords: "tarif üretim malzeme iksir" },
  { id: "group-regions", label: "Bölgeler", summary: "Boss ve bölge ganimetlerini gör.", keywords: "gaffar semiha stuart çemberlitaş migrat sığınak" },
  { id: "quests", label: "Görevler", summary: "Seviyene uygun görev zincirini bul.", keywords: "npc ödül görev zinciri" },
  { id: "items", label: "Eşyalar", summary: "Eşya kataloğunda ara ve karşılaştır.", keywords: "item drop ganimet" },
  { id: "atlas", label: "Atlas", summary: "Eşya, reçete, boss ve malzeme bağlarını izle.", keywords: "bağlantı kaynak tarif" },
  { id: "endgame", label: "Endgame", summary: "Yükseltme ve son oyun hazırlığını incele.", keywords: "grup bölgesi strateji yükseltme + basma kozmik dönüşüm taşı malahit gökmeran gök tapınağı" },
  { id: "mining", label: "Maden", summary: "Maden kaynaklarını ve kullanım alanlarını bul.", keywords: "madenci sarraf lokman cevher" },
  { id: "economy", label: "Ekonomi", summary: "Maden, çöp ve para döngülerini incele.", keywords: "döngü pazar para çöp üretim" },
  { id: "sustainability", label: "Sürdürülebilirlik", summary: "Ekonomi, etkinlik ve kaynak uyarlamalarını izle.", keywords: "sürdürülebilirlik ekonomi etkinlik takvim maden para kaynak" },
  { id: "issues", label: "Sorunlar", summary: "Oyun sorunlarını ve çözüm önerilerini gör.", keywords: "şikayet öneri lag bağlantı" },
  { id: "health", label: "Proje durumu", summary: "Son sürümü, görsel kapsamı ve açık işleri izle.", keywords: "durum gelişim kapsam kalite görsel eksik" },
  { id: "contribute", label: "Geri bildirim", summary: "Yanlış veya eksik bilgiyi metinle bildir.", keywords: "yorum düzelt geri bildirim" },
] as const;

export type MainModule = (typeof moduleTabs)[number]["id"];

export const quickModuleIds: MainModule[] = ["items", "engine", "recipes", "quests"];

export const moduleGroups: { label: "Bilgi" | "Araçlar" | "Proje"; note: string; ids: MainModule[] }[] = [
  { label: "Bilgi", note: "Aradığın kaydı bul", ids: ["items", "engine", "recipes", "quests", "skills", "group-regions"] },
  { label: "Araçlar", note: "Planla ve karşılaştır", ids: ["builder", "atlas", "mining", "endgame"] },
  { label: "Proje", note: "Arka plan ve katkı", ids: ["economy", "sustainability", "issues", "health", "contribute"] },
];
