export type TalismanAcquisitionType = "NPC_PURCHASE" | "ENEMY_DROP" | "RECIPE_CRAFT" | "UNKNOWN";
export interface TalismanAcquisitionRecord {
  id: string;
  talismanId: string;
  acquisitionType: TalismanAcquisitionType;
  recipe?: {predecessorTalismanId?: string; predecessorQuantity?: number; kind: "tier_upgrade" | "direct"};
  sourceId: string | null;
  locator: string | null;
  verificationStatus: "single_source" | "unknown";
  confidence: "medium" | "unknown";
  lastChecked: string;
}
export function acquisitionFor(talismanId:string, acquisitions:TalismanAcquisitionRecord[]):TalismanAcquisitionRecord|undefined;
export function talismanProductionChain<T extends {id:string}>(talismanId:string, acquisitions:TalismanAcquisitionRecord[], talismans:T[]):T[];
export function talismanAcquisitionView<T extends {id:string}>(talismanId:string, acquisitions:TalismanAcquisitionRecord[], talismans:T[]):{label:string;canOpenRecipe:boolean;recipeTarget:string|null;chain:T[]};
