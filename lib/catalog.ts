import itemRows from "../data/items.json";
import statRows from "../data/stats.json";
import recipeRows from "../data/recipes.json";
import sourceRows from "../data/sources.json";
import evidenceRows from "../data/evidence.json";
import imageRows from "../data/images.json";
import talismanRows from "../data/talismans.json";
import contextRows from "../data/contexts.json";
import groupLootRows from "../data/group-loot-items.json";
import groupLootEvidenceRows from "../data/group-loot-evidence.json";
import glassesRows from "../data/glasses-items.json";
import glassesStatRows from "../data/glasses-stats.json";
import groupDerivedStatRows from "../data/group-derived-stats.json";

export type VerificationStatus = "draft" | "single_source" | "cross_verified" | "conflicted";
export type SourceType = "official" | "server_guide" | "community_server_guide" | "community_server_news" | "community_server_live_data" | "forum" | "fandom" | "video" | "player_screenshot";
export type CharacterClass = "Savaşçı" | "Büyücü" | "Şifacı";
export type Slot = "Gözlük" | "Ceket" | "Eldiven" | "Pantolon" | "Ayakkabı" | "Zırh" | "Amplifikatör" | "Yüzük" | "Kolye" | "Silah";
export interface EvidenceClaim {id:string;itemId:string;field:string;sourceId:string;locator:string;status:VerificationStatus;checkedAt:string}
export interface Source {id:string;url:string;title:string;type:SourceType;accessedAt:string;independenceGroup:string}
export interface Stat {id:string;itemId:string;attribute:string;value:number;unit:string;verificationStatus:VerificationStatus;lastChecked:string}
export interface Item {id:string;name:string;class:CharacterClass|"Tüm Sınıflar";level:number|null;slot:Slot;rarity:"Şaheser"|"Doğrulanmadı";appearanceFamily?:string;publicationStatus:VerificationStatus;lastChecked:string;region?:string;boss?:string;acquisition?:string}
export interface Recipe {id:string;itemId:string;method:string;materials:{name:string;quantity:number}[];sourceId:string;verificationStatus:VerificationStatus;lastChecked:string}
type TalismanBase={id:string;name:string;class:CharacterClass;color:"Kırmızı"|"Mavi";series:string;tier:1|2|3|null;value:number|null;unit:"percent"|"second"|null;effectText:string;requiresBase?:string;status:VerificationStatus;sourceId:string;verificationSourceIds?:string[];lastChecked:string};
export type Talisman=TalismanBase&({effect:"stat_multiplier";targetAttributes:string[];outputAttribute:string}|{effect:"damage_multiplier"|"critical_multiplier"|"informational";targetAttributes?:never;outputAttribute?:never});
export type TalismanAcquisition = "Büyük Hol düşümü" | "Reçeteyle üretim" | "Yalnız reçeteyle üretim";

export const items = [...itemRows,...groupLootRows,...glassesRows] as Item[];
const glassesStats:Stat[]=glassesStatRows.flatMap(row=>row.stats.map(([attribute,value],index)=>({id:`stat-${row.itemId}-${index}`,itemId:row.itemId,attribute:String(attribute),value:Number(value),unit:"puan",verificationStatus:"single_source" as const,lastChecked:"2026-08-23"})));
export const stats = [...statRows,...glassesStats,...groupDerivedStatRows] as Stat[];
export const recipes = recipeRows as Recipe[];
export const sources = sourceRows as Source[];
const groupLootEvidence:EvidenceClaim[]=groupLootEvidenceRows.flatMap(group=>group.itemIds.flatMap(itemId=>["name","class","slot"].map(field=>({id:`ev-${itemId}-${field}-${group.sourceId}`,itemId,field,sourceId:group.sourceId,locator:group.locator,status:"single_source" as const,checkedAt:"2026-08-23"}))));
const glassesEvidence:EvidenceClaim[]=glassesRows.flatMap(item=>["name","class","level","slot"].map(field=>({id:`ev-${item.id}-${field}`,itemId:item.id,field,sourceId:"fandom-glasses",locator:"Gözlükler tablosu",status:"single_source" as const,checkedAt:"2026-08-23"})));
export const evidence = [...evidenceRows,...groupLootEvidence,...glassesEvidence] as EvidenceClaim[];
export const images = imageRows;
export const talismans = talismanRows as Talisman[];
export const contexts = contextRows;
export const classSlots:Record<CharacterClass,Slot[]>={"Savaşçı":["Gözlük","Ceket","Eldiven","Pantolon","Ayakkabı","Yüzük","Kolye","Silah"],"Büyücü":["Gözlük","Ceket","Eldiven","Pantolon","Ayakkabı","Yüzük","Kolye","Silah"],"Şifacı":["Gözlük","Ceket","Eldiven","Pantolon","Ayakkabı","Yüzük","Kolye","Silah"]};
export const slots=[...new Set(Object.values(classSlots).flat())];
export const isPublishable=(status:VerificationStatus)=>status==="single_source"||status==="cross_verified";
export const itemEvidence=(itemId:string,field?:string)=>evidence.filter(e=>e.itemId===itemId&&(!field||e.field===field));
export const itemStats=(itemId:string)=>stats.filter(s=>s.itemId===itemId);
export const publishableStats=(itemId:string)=>itemStats(itemId).filter(s=>isPublishable(s.verificationStatus));
export const itemRecipe=(itemId:string)=>recipes.find(r=>r.itemId===itemId);
export const sourceFor=(sourceId:string)=>sources.find(s=>s.id===sourceId);
export const talismanAcquisition=(talisman:Talisman):TalismanAcquisition=>talisman.tier===1?"Büyük Hol düşümü":talisman.tier===2||talisman.tier===3?"Reçeteyle üretim":"Yalnız reçeteyle üretim";
export const publishableItems=items.filter(item=>["name","class","slot"].every(field=>itemEvidence(item.id,field).some(e=>isPublishable(e.status))));
export const statusLabel:Record<VerificationStatus,string>={draft:"Taslak",single_source:"Tek kaynak · teyit bekliyor",cross_verified:"Çapraz doğrulandı",conflicted:"Çelişkili"};
export function sumStats(selected:(Item|undefined)[]){const total:Record<string,number>={};for(const item of selected)if(item)for(const stat of publishableStats(item.id))total[stat.attribute]=(total[stat.attribute]??0)+stat.value;return total}
