export function sumPublishedStats(itemIds:string[],stats:{itemId:string;attribute:string;value:number;verificationStatus:string}[]):Record<string,number>;
export function applyWrath(totals:Record<string,number>,baseActive:boolean,effect:"damage_multiplier"|"critical_multiplier"|null,value:number,wrathCriticalBase?:number):Record<string,number>;
