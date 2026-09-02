export function normalizePlayerLevel(value) {
  if (value === "" || value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) return null;
  const level = Number(text);
  return Number.isInteger(level) && level >= 1 && level <= 59 ? level : null;
}

export function questsForLevel(quests, value) {
  const level = normalizePlayerLevel(value);
  if (level === null) return quests;
  return quests.filter((quest) => quest.minLevel <= level);
}

export function prerequisiteChain(questId, quests) {
  const byId = new Map(quests.map((quest) => [quest.questId, quest]));
  const result = [], visiting = new Set(), added = new Set();
  const visit = (id) => {
    if (visiting.has(id)) throw new Error(`Görev zinciri döngüsü: ${id}`);
    const quest = byId.get(id);
    if (!quest) return;
    visiting.add(id);
    for (const previousId of quest.previousQuestIds) visit(previousId);
    visiting.delete(id);
    if (id !== questId && !added.has(id)) {
      added.add(id);
      result.push(quest);
    }
  };
  visit(questId);
  return result;
}

export const questLocationLabel = (quest) =>
  quest?.location || "Konum bilgisi doğrulanıyor";
