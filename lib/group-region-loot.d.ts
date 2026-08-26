import type { Item } from "./catalog";

export interface GroupRegionBossGroup {
  name: string;
  stage: string;
  encounters: number;
  lootBosses: string[];
}

export interface GroupRegionDefinition {
  name: string;
  bosses: string[];
  bossCount: number;
  encounterCount: number;
  bossGroups: GroupRegionBossGroup[];
}

export const GROUP_REGION_DEFINITIONS: GroupRegionDefinition[];
export function cemberlitasBossesFor(item: Pick<Item, "class" | "slot">): string[];
export function cemberlitasLootSourceIdFor(item: Pick<Item, "class">): string | null;
export function isCemberlitasRecipe(recipe?: { sourceId?: string } | null): boolean;
