export type GatheringProfession = "Madenci" | "Sarraf" | "Lokman";

export type GatheringRow = {
  profession: GatheringProfession;
  base: string;
  second?: string;
  third?: string;
  points: number;
};

export const gatheringRows: GatheringRow[] = [
  { profession: "Madenci", base: "Bakır", second: "Saf Bakır", points: 1 },
  { profession: "Madenci", base: "Kalay", second: "Saf Kalay", points: 3 },
  { profession: "Madenci", base: "Kurşun", second: "Saf Kurşun", points: 5 },
  { profession: "Madenci", base: "Demir", second: "Saf Demir", points: 7 },
  { profession: "Madenci", base: "Nikel", second: "Saf Nikel", points: 10 },
  { profession: "Madenci", base: "Krom", second: "Saf Krom", points: 18 },
  { profession: "Madenci", base: "Gümüş", second: "Saf Gümüş", points: 20 },
  { profession: "Madenci", base: "Altın", second: "Saf Altın", points: 23 },
  { profession: "Madenci", base: "Tungsten", second: "Saf Tungsten", third: "Şelit", points: 30 },
  { profession: "Madenci", base: "Platin", second: "Saf Platin", points: 36 },
  { profession: "Madenci", base: "Titanyum", second: "Saf Titanyum", points: 40 },
  { profession: "Madenci", base: "Osmiridyum", second: "Osmiyum", third: "İridyum", points: 45 },
  { profession: "Madenci", base: "Monazit", second: "Gadolinyum", points: 45 },
  { profession: "Sarraf", base: "Kuvars", points: 1 },
  { profession: "Sarraf", base: "Obsidyen", points: 1 },
  { profession: "Sarraf", base: "Kan Taşı", points: 5 },
  { profession: "Sarraf", base: "Açık Mavi Lapis", second: "Koyu Mavi Lapis", points: 8 },
  { profession: "Sarraf", base: "Turkuaz", points: 10 },
  { profession: "Sarraf", base: "Ametist", second: "Açık Pembe Ametist", third: "Sibiryalı", points: 15 },
  { profession: "Sarraf", base: "Kalsedon", second: "Kripraz", third: "Akik", points: 21 },
  { profession: "Sarraf", base: "Elmas", second: "Yeşil Elmas", third: "Menekşe Elmas", points: 23 },
  { profession: "Sarraf", base: "Mavi Safir", second: "Turuncu Safir", points: 33 },
  { profession: "Sarraf", base: "Beril", second: "Yeşil Zümrüt", third: "Kızıl Zümrüt", points: 37 },
  { profession: "Sarraf", base: "Topaz", second: "Mavi Topaz", points: 40 },
  { profession: "Sarraf", base: "Krizoberil", second: "Alexandrite", points: 45 },
  { profession: "Sarraf", base: "Yeşim Taşı", second: "Jadeit", points: 45 },
  { profession: "Lokman", base: "Meşe Odunu", second: "Budaksız Meşe", points: 1 },
  { profession: "Lokman", base: "Ceviz Yaprağı", second: "Ceviz", points: 3 },
  { profession: "Lokman", base: "Isırgan Otu", second: "Isırgan Tohumu", points: 5 },
  { profession: "Lokman", base: "Ökse Otu", second: "Ökse Meyvesi", points: 7 },
  { profession: "Lokman", base: "Adaçayı Yaprağı", second: "Ada Sürgünü", points: 12 },
  { profession: "Lokman", base: "Akçaağaç Odunu", second: "Zamk", points: 17 },
  { profession: "Lokman", base: "Koni Yaprağı", second: "Koni Çiçeği", points: 20 },
  { profession: "Lokman", base: "Civan Perçemi", second: "Civan Çiçeği", points: 23 },
  { profession: "Lokman", base: "Mantar", second: "Sinek Mantarı", third: "Ganoderma", points: 30 },
  { profession: "Lokman", base: "Şerbetçi Otu", points: 36 },
  { profession: "Lokman", base: "Abanoz Odunu", second: "Budaksız Abanoz", points: 40 },
  { profession: "Lokman", base: "Çıban Otu", second: "Çıban Çiçeği", third: "Dört Yapraklı Yonca", points: 45 },
  { profession: "Lokman", base: "Çiğdem", second: "Safran", points: 45 },
];

export const gatheringRegions: Record<GatheringProfession, Record<string, string>> = {
  Madenci: {
    Bakır: "Eminönü", Kalay: "Eminönü", Kurşun: "Eminönü", Demir: "Eminönü", Nikel: "Eminönü", Krom: "Eminönü", Gümüş: "Eminönü", Altın: "Eminönü",
    Tungsten: "Meteor Bölgesi", Platin: "Meteor Bölgesi", Titanyum: "Yeraltı", Osmiridyum: "Yeraltı", Monazit: "Büyük Hol",
  },
  Sarraf: {
    Kuvars: "Eminönü", Obsidyen: "Eminönü", "Kan Taşı": "Eminönü", "Açık Mavi Lapis": "Eminönü", Turkuaz: "Eminönü", Ametist: "Eminönü", Kalsedon: "Eminönü", Elmas: "Eminönü",
    "Mavi Safir": "Meteor Bölgesi", Beril: "Meteor Bölgesi", Topaz: "Yeraltı", Krizoberil: "Yeraltı", "Yeşim Taşı": "Büyük Hol",
  },
  Lokman: {
    "Meşe Odunu": "Eminönü", "Ceviz Yaprağı": "Eminönü", "Isırgan Otu": "Eminönü", "Ökse Otu": "Eminönü", "Adaçayı Yaprağı": "Eminönü", "Akçaağaç Odunu": "Eminönü", "Koni Yaprağı": "Eminönü", "Civan Perçemi": "Eminönü",
    Mantar: "Meteor Bölgesi", "Şerbetçi Otu": "Meteor Bölgesi", "Abanoz Odunu": "Yeraltı", "Çıban Otu": "Yeraltı", Çiğdem: "Büyük Hol",
  },
};

const normalize = (value: string) => value.trim().toLocaleLowerCase("tr-TR");

export function gatheringRegionFor(row: GatheringRow) {
  return gatheringRegions[row.profession][row.base] ?? "Bölge kaydı eksik";
}

export function gatheringSourceFor(materialName: string) {
  const wanted = normalize(materialName);
  const row = gatheringRows.find((entry) =>
    [entry.base, entry.second, entry.third].filter(Boolean).some((name) => normalize(name as string) === wanted),
  );
  if (!row) return null;
  const output = normalize(row.base) === wanted ? 1 : normalize(row.second ?? "") === wanted ? 2 : 3;
  return { ...row, output, region: gatheringRegionFor(row) };
}
