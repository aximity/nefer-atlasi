import type {CompatibleStatSummary,CalculableStat} from "./stat-values.mjs";
export function sumPublishedStats(itemIds:string[],stats:CalculableStat[]):CompatibleStatSummary;
export function applyWrath(totals:Record<string,number>,baseActive:boolean,effect:"damage_multiplier"|"critical_multiplier"|null,value:number,wrathCriticalBase?:number):Record<string,number>;
export function applyTalisman(totals:Record<string,number>,talisman:{effect:string;value:number;requiresBase?:string;targetAttributes?:string[];outputAttribute?:string}|null,baseActive?:boolean,criticalBase?:number):Record<string,number>;
