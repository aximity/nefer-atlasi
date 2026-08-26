export const GROUP_REGION_DEFINITIONS = [
  {
    name: "Çemberlitaş",
    bosses: ["Yol Savaşçısı", "GBM-X", "Stuart Efendi", "Semiha Hanım", "İstihbarat Komutanı", "Gaffar Bey"],
    bossCount: 6,
    encounterCount: 7,
    bossGroups: [
      { name: "Yol Savaşçısı", stage: "1. Bölge", encounters: 1, lootBosses: ["Yol Savaşçısı"] },
      { name: "GBM-X", stage: "1. Bölge", encounters: 1, lootBosses: ["GBM-X"] },
      { name: "Stuart Efendi", stage: "2. Bölge", encounters: 1, lootBosses: ["Stuart Efendi"] },
      { name: "Semiha Hanım", stage: "2. Bölge", encounters: 2, lootBosses: ["Semiha Hanım"] },
      { name: "İstihbarat Komutanı", stage: "2. Bölge", encounters: 1, lootBosses: ["İstihbarat Komutanı"] },
      { name: "Gaffar Bey", stage: "2. Bölge", encounters: 1, lootBosses: ["Gaffar Bey"] },
    ],
  },
  {
    name: "Sığınaklar",
    bosses: ["Düşünen Adam", "Motorin", "Kenan", "Zahir"],
    bossCount: 4,
    encounterCount: 3,
    bossGroups: [
      { name: "Düşünen Adam", stage: "Karşılaşma", encounters: 1, lootBosses: ["Düşünen Adam"] },
      { name: "Motorin", stage: "Karşılaşma", encounters: 1, lootBosses: ["Motorin"] },
      { name: "Kenan ve Zahir", stage: "Karşılaşma", encounters: 1, lootBosses: ["Kenan", "Zahir"] },
    ],
  },
  {
    name: "Migrat",
    bosses: ["Centurion", "Junon"],
    bossCount: 2,
    encounterCount: 2,
    bossGroups: [
      { name: "Centurion", stage: "Karşılaşma", encounters: 1, lootBosses: ["Centurion"] },
      { name: "Junon", stage: "Karşılaşma", encounters: 1, lootBosses: ["Junon"] },
    ],
  },
];

const sharedSlotByClass = {
  Savaşçı: "Zırh",
  Büyücü: "Amplifikatör",
  Şifacı: "Zırh",
};

const sharedBosses = ["Yol Savaşçısı", "GBM-X", "Stuart Efendi", "Semiha Hanım"];
const slotBosses = {
  Ayakkabı: ["GBM-X"],
  Eldiven: ["Stuart Efendi"],
  Pantolon: ["Semiha Hanım"],
  Ceket: ["Gaffar Bey"],
  Silah: ["Gaffar Bey"],
};

export function cemberlitasBossesFor(item) {
  const bosses = [];
  if (sharedSlotByClass[item.class] === item.slot) bosses.push(...sharedBosses);
  bosses.push(...(slotBosses[item.slot] || []));
  return [...new Set(bosses)];
}

export function cemberlitasLootSourceIdFor(item) {
  if (item.class === "Savaşçı") return "fandom-warrior-cemberlitas-loot";
  if (item.class === "Büyücü") return "fandom-mage-cemberlitas-loot";
  if (item.class === "Şifacı") return "fandom-healer-cemberlitas-loot";
  return null;
}

export const isCemberlitasRecipe = (recipe) => recipe?.sourceId === "maxigame-cemberlitas-2015";
