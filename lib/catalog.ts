import itemRows from "../data/items.json";
import statRows from "../data/stats.json";
import recipeRows from "../data/recipes.json";
import sourceRows from "../data/sources.json";
import evidenceRows from "../data/evidence.json";
import imageRows from "../data/images.json";
import talismanRows from "../data/talismans.json";
import contextRows from "../data/contexts.json";

export type VerificationStatus = "draft" | "single_source" | "cross_verified" | "conflicted";
export type SourceType = "official" | "forum" | "fandom" | "video" | "player_screenshot";
export type CharacterClass = "Savaşçı" | "Büyücü" | "Şifacı";
export type Slot = "Gözlük" | "Ceket" | "Eldiven" | "Pantolon" | "Ayakkabı" | "Zırh" | "Amplifikatör" | "Yüzük" | "Kolye" | "Silah";
export interface EvidenceClaim {id:string;itemId:string;field:string;sourceId:string;locator:string;status:VerificationStatus;checkedAt:string}
export interface Source {id:string;url:string;title:string;type:SourceType;accessedAt:string;independenceGroup:string}
export interface Stat {id:string;itemId:string;attribute:string;value:number;unit:string;verificationStatus:VerificationStatus;lastChecked:string}
export interface Item {id:string;name:string;class:CharacterClass;level:number;slot:Slot;rarity:"Şaheser";appearanceFamily:string;publicationStatus:VerificationStatus;lastChecked:string}
export interface Recipe {id:string;itemId:string;method:string;materials:{name:string;quantity:number}[];sourceId:string;verificationStatus:VerificationStatus;lastChecked:string}

export const items = itemRows as Item[];
export const stats = statRows as Stat[];
export const recipes = recipeRows as Recipe[];
export const sources = sourceRows as Source[];
export const evidence = evidenceRows as EvidenceClaim[];
export const images = imageRows;
export const talismans = talismanRows;
export const contexts = contextRows;
export const classSlots:Record<CharacterClass,Slot[]>={"Savaşçı":["Gözlük","Ceket","Eldiven","Pantolon","Ayakkabı","Zırh","Yüzük","Kolye","Silah"],"Büyücü":["Gözlük","Ceket","Eldiven","Pantolon","Ayakkabı","Amplifikatör","Yüzük","Kolye","Silah"],"Şifacı":["Gözlük","Ceket","Eldiven","Pantolon","Ayakkabı","Zırh","Yüzük","Kolye","Silah"]};
export const slots=[...new Set(Object.values(classSlots).flat())];
export const isPublishable=(status:VerificationStatus)=>status==="single_source"||status==="cross_verified";
export const itemEvidence=(itemId:string,field?:string)=>evidence.filter(e=>e.itemId===itemId&&(!field||e.field===field));
export const itemStats=(itemId:string)=>stats.filter(s=>s.itemId===itemId);
export const publishableStats=(itemId:string)=>itemStats(itemId).filter(s=>isPublishable(s.verificationStatus));
export const itemRecipe=(itemId:string)=>recipes.find(r=>r.itemId===itemId);
export const sourceFor=(sourceId:string)=>sources.find(s=>s.id===sourceId);
export const publishableItems=items.filter(item=>["name","class","slot"].every(field=>itemEvidence(item.id,field).some(e=>isPublishable(e.status))));
export const statusLabel:Record<VerificationStatus,string>={draft:"Taslak",single_source:"Tek kaynak",cross_verified:"Çapraz doğrulandı",conflicted:"Çelişkili"};
export function sumStats(selected:(Item|undefined)[]){const total:Record<string,number>={};for(const item of selected)if(item)for(const stat of publishableStats(item.id))total[stat.attribute]=(total[stat.attribute]??0)+stat.value;return total}
