export function normalizePlayerLevel(value) {
  if (value === "" || value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) return null;
  const level = Number(text);
  return Number.isInteger(level) && level >= 1 && level <= 49 ? level : null;
}

export function questsForLevel(quests, value) {
  const level = normalizePlayerLevel(value);
  if (level === null) return quests;
  return quests.filter((quest) => quest.minLevel <= level);
}

export function canonicalQuests(quests) {
  return quests.filter((quest) => quest.confidence !== "conflicted" && quest.confidence !== "draft");
}

export function questAvailability(quest, value, completedQuestIds = []) {
  const level = normalizePlayerLevel(value);
  if (level === null) return "level_unknown";
  if (quest.minLevel > level) return "level_locked";
  const completed = completedQuestIds instanceof Set ? completedQuestIds : new Set(completedQuestIds);
  return quest.previousQuestIds.every((questId) => completed.has(questId)) ? "available" : "prerequisite_locked";
}

export function partitionQuests(quests, value, completedQuestIds = []) {
  const result = {available: [], prerequisite_locked: [], level_locked: [], level_unknown: []};
  for (const quest of quests) result[questAvailability(quest, value, completedQuestIds)].push(quest);
  return result;
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
