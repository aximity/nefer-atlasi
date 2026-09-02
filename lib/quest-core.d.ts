export interface QuestEvidence {sourceId:string;locator:string;fields:string[]}
export interface Quest {questId:string;sourceNumber:number;name:string;minLevel:number;giverNpc:string|null;location:string|null;previousQuestIds:string[];objective:string|null;reward:string|null;confidence:"medium";lastChecked:string;evidence:QuestEvidence[]}
export function normalizePlayerLevel(value:unknown):number|null;
export function questsForLevel<T extends {minLevel:number}>(quests:T[],value:unknown):T[];
export function prerequisiteChain<T extends {questId:string;previousQuestIds:string[]}>(questId:string,quests:T[]):T[];
export function questLocationLabel(quest:{location:string|null}|null|undefined):string;
