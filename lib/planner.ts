import {classSlots,items,publishableStats,type CharacterClass,type Item,type Slot} from "./catalog";
import {sumPublishedStats} from "./planner-core.mjs";
export {applyTalisman,applyWrath} from "./planner-core.mjs";

export type Goal="Fiziksel"|"Kritik"|"Buz"|"Elektrik"|"Ateş"|"Şifa"|"Asit"|"Zehir"|"Direnç"|"Enerji";
export type BuildSelection=Partial<Record<Slot,string>>;
export const goalsByClass:Record<CharacterClass,Goal[]>={
  "Savaşçı":["Fiziksel","Ateş","Kritik","Direnç","Enerji"],
  "Büyücü":["Fiziksel","Buz","Elektrik","Ateş","Kritik"],
  "Şifacı":["Fiziksel","Şifa","Asit","Zehir","Kritik"],
};
const goalTerms:Record<Goal,string[]>={Fiziksel:["Maksimum Hasar","Saldırı","Fiziksel"],Kritik:["Kritik"],Buz:["Buz"],Elektrik:["Elektrik"],Ateş:["Ateş"],Şifa:["İyileştirme","Şifa"],Asit:["Asit"],Zehir:["Zehir"],Direnç:["Direnç","Savunma","Zırh"],Enerji:["Enerji"]};
const weaponSuffix:Record<CharacterClass,RegExp>={"Savaşçı":/(Kılıç|Balta|Tabanca|Bıçak)$/,"Büyücü":/(Asa|Çifte)$/,"Şifacı":/(Asa|Çifte)$/};

export function compatibleItems(klass:CharacterClass,slot:Slot){return items.filter(item=>(item.class===klass||item.class==="Tüm Sınıflar")&&item.slot===slot&&(slot!=="Silah"||weaponSuffix[klass].test(item.name)))}
export function selectedItems(selection:BuildSelection){return Object.values(selection).map(id=>items.find(item=>item.id===id)).filter((item):item is Item=>Boolean(item))}
function matchesGoal(attribute:string,goal:Goal){if(["Buz","Elektrik","Ateş","Asit","Zehir"].includes(goal))return attribute.includes(`Hasarı (${goal})`);return goalTerms[goal].some(term=>attribute.includes(term))}
export function scoreItem(item:Item,primary:Goal,secondary:Goal|null){return publishableStats(item.id).reduce((score,stat)=>score+(matchesGoal(stat.attribute,primary)?2:0)+(secondary&&matchesGoal(stat.attribute,secondary)?1:0),0)}
export function scoreBuild(selection:BuildSelection,primary:Goal,secondary:Goal|null){return selectedItems(selection).reduce((sum,item)=>sum+scoreItem(item,primary,secondary),0)}
export function buildTotals(selection:BuildSelection){return sumPublishedStats(selectedItems(selection).map(item=>item.id),items.flatMap(item=>publishableStats(item.id)))}
export function suggestedSelection(klass:CharacterClass,primary:Goal,secondary:Goal|null){return Object.fromEntries(classSlots[klass].map(slot=>{const ranked=compatibleItems(klass,slot).toSorted((a,b)=>scoreItem(b,primary,secondary)-scoreItem(a,primary,secondary));const best=ranked[0];return [slot,best&&scoreItem(best,primary,secondary)>0?best.id:undefined]})) as BuildSelection}
export function theoreticalCombinationCount(klass:CharacterClass){return classSlots[klass].reduce((count,slot)=>count*Math.max(compatibleItems(klass,slot).length,1),1)}
export const resistanceNeed=(rival:CharacterClass|"Rakip yok")=>rival==="Büyücü"?"Element dirençlerini gözden geçir":rival==="Savaşçı"?"Fiziksel savunma ve kritik zırhını gözden geçir":rival==="Şifacı"?"Asit/zehir baskısına karşı dirençlerini gözden geçir":"Rakip seçilmedi; direnç önerisi üretilmedi";
