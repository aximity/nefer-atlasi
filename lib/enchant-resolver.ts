import enchantRows from "../data/enchants.json";
import seriesRows from "../data/enchant-series.json";
import {resolveEnchantRows,sumEnchantRows} from "./enchant-core.mjs";

export type Enchant=typeof enchantRows[number];
const expanded=seriesRows.flatMap(series=>series.entries.map(([name,value],index)=>({id:`${series.id}-${index+1}`,name:String(name),attribute:series.attribute,value:Number(value),unit:series.unit,sourceId:"fandom-all-enchants",status:"single_source",lastChecked:"2026-08-23"})));
export const enchants=[...enchantRows,...expanded.filter(row=>!enchantRows.some(existing=>existing.name===row.name&&existing.attribute===row.attribute))] as Enchant[];
export function resolveEnchantName(itemName:string){return resolveEnchantRows(itemName,enchants) as Enchant[]}
export function enchantTotals(rows:Enchant[]){return sumEnchantRows(rows) as Record<string,number>}
