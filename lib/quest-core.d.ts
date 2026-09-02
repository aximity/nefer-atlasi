export interface QuestEvidence {sourceId:string;locator:string;fields:string[]}
/** `location`, görevin hedef bölgesini değil görevi veren NPC'nin doğrulanmış konumunu taşır. */
export interface Quest {questId:string;sourceNumber:number;name:string;level:number;minLevel:number|null;giverNpc:string|null;location:string|null;previousQuestIds:string[];objective:string|null;reward:string|null;confidence:"medium";lastChecked:string;evidence:QuestEvidence[]}
export function normalizePlayerLevel(value:unknown):number|null;
export function questsForLevel<T extends {minLevel:number|null}>(quests:T[],value:unknown):T[];
export function canonicalQuests<T extends {confidence:string}>(quests:T[]):T[];
export type QuestAvailability="available"|"prerequisite_locked"|"level_locked"|"level_unknown";
export function questAvailability(quest:{minLevel:number|null;previousQuestIds:string[]},value:unknown,completedQuestIds?:Iterable<string>):QuestAvailability;
export function partitionQuests<T extends {minLevel:number|null;previousQuestIds:string[]}>(quests:T[],value:unknown,completedQuestIds?:Iterable<string>):Record<QuestAvailability,T[]>;
export function prerequisiteChain<T extends {questId:string;previousQuestIds:string[]}>(questId:string,quests:T[]):T[];
export function questLocationLabel(quest:{location:string|null}|null|undefined):string;
