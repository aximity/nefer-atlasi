export const MIN_QUEST_LEVEL = 1;
export const MAX_QUEST_LEVEL = 49;

export function parseQuestLevel(input: string) {
  if (!/^\d{1,2}$/.test(input)) return null;
  const level = Number(input);
  return level >= MIN_QUEST_LEVEL && level <= MAX_QUEST_LEVEL ? level : null;
}

export function questLevelWindow(level: number) {
  return {
    min: Math.max(MIN_QUEST_LEVEL, level - 2),
    max: Math.min(MAX_QUEST_LEVEL, level),
  };
}

export function questMatchesLevel(questLevel: number, level: number) {
  const window = questLevelWindow(level);
  return questLevel >= window.min && questLevel <= window.max;
}
