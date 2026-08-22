import enchantRows from "../data/enchants.json";
import {resolveEnchantRows,sumEnchantRows} from "./enchant-core.mjs";

export type Enchant=typeof enchantRows[number];
export const enchants=enchantRows as Enchant[];
export function resolveEnchantName(itemName:string){return resolveEnchantRows(itemName,enchants) as Enchant[]}
export function enchantTotals(rows:Enchant[]){return sumEnchantRows(rows) as Record<string,number>}
