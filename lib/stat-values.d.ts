export type StorageScale = "raw_game_value" | "scaled_1000" | "scaled_10000" | "puan" | "unknown";
export interface StatValueInput { value:number; unit:string }
export interface SummarizableStat extends StatValueInput { attribute:string }
export interface CalculableStat extends SummarizableStat { itemId:string; verificationStatus:string }
export interface StatValueModel { rawValue:number; storageScale:StorageScale; calculationScale:StorageScale|null; displayValue:number|null; displayIsIdentity:boolean }
export interface CompatibleStatSummary { values:Record<string,number>; scales:Record<string,StorageScale>; incompatible:string[] }
export const STORAGE_SCALES:readonly StorageScale[];
export function isSupportedStorageScale(scale:string):scale is StorageScale;
export function statValueModel(stat:StatValueInput):StatValueModel;
export function formatStatValue(stat:StatValueInput,locale?:string):string;
export function summarizeCompatibleStats(stats:SummarizableStat[]):CompatibleStatSummary;
export function sumPublishedStats(itemIds:string[],stats:CalculableStat[]):CompatibleStatSummary;
