import fs from "node:fs";
import {matchOfficialQuestRows,parseOfficialQuestRows} from "../lib/quest-import-core.mjs";

const [chainPath, officialPath] = process.argv.slice(2);
if (!chainPath || !officialPath) throw new Error("Kullanım: node scripts/import-quest-catalog.mjs <zincir-api.json> <resmi-gorevler.html>");
const readWikitext = (path) => {const value=JSON.parse(fs.readFileSync(path,"utf8")).parse.wikitext;return typeof value==="string"?value:value["*"];};
const clean = (value = "") => value.replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, "$2").replace(/'''?/g, "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
const tableRows = (wikitext) => wikitext.split(/\n\|-\s*\n/).slice(1).map((block) => block.split(/\n\|/).map((cell, index) => clean(index ? cell : cell.replace(/^\|/, ""))).filter((cell) => cell && !cell.startsWith("}")));
const slug = (value) => value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const existing = JSON.parse(fs.readFileSync(new URL("../data/quests.json", import.meta.url), "utf8"));
const existingByNumber = new Map(existing.map((quest) => [quest.sourceNumber, quest]));
const chainRows = tableRows(readWikitext(chainPath)).map(([number, rawName, objective, npc, prerequisites]) => {
  const levelMatch = rawName?.match(/\[(\d+)\]\s*$/);
  return {sourceNumber:Number(number),name:rawName?.replace(/\s*\[\d+\]\s*$/, "").trim(),level:levelMatch?Number(levelMatch[1]):null,objective:objective==="..."?null:objective,giverNpc:npc==="Otomatik Görev"?null:npc,prerequisiteNumbers:(prerequisites?.match(/\d+/g)??[]).map(Number)};
}).filter((row) => Number.isInteger(row.sourceNumber) && row.level >= 1 && row.level <= 49);
const officialRows=parseOfficialQuestRows(fs.readFileSync(officialPath,"utf8"));
const officialByNumber=matchOfficialQuestRows(chainRows,officialRows);
const duplicateNumbers=chainRows.filter((row,index)=>chainRows.findIndex((candidate)=>candidate.sourceNumber===row.sourceNumber)!==index);
if(duplicateNumbers.length)throw new Error(`Yinelenen kaynak numarası: ${duplicateNumbers.map((row)=>row.sourceNumber).join(", ")}`);
const idByNumber=new Map(chainRows.map((row)=>[row.sourceNumber,existingByNumber.get(row.sourceNumber)?.questId??`quest-${String(row.sourceNumber).padStart(3,"0")}-${slug(row.name)}`]));
const missingReferences=chainRows.flatMap((row)=>row.prerequisiteNumbers.filter((number)=>!idByNumber.has(number)).map((number)=>`${row.sourceNumber}→${number}`));
if(missingReferences.length)throw new Error(`Çözülemeyen görev ilişkisi: ${missingReferences.join(", ")}`);

const quests=chainRows.map((row)=>{
  const prior=existingByNumber.get(row.sourceNumber); const official=officialByNumber.get(row.sourceNumber); const evidenceFields=["name","level","giverNpc","previousQuestIds"]; if(row.objective)evidenceFields.push("objective");
  const evidence=[{sourceId:"fandom-quest-chains",locator:`No ${row.sourceNumber} · ${row.name} satırı`,fields:evidenceFields}];
  if(official)evidence.push({sourceId:"official-quest-list",locator:`${official.rawName} satırı`,fields:["level","minLevel"]});
  if(prior?.location){const locationClaim=prior.evidence.find((claim)=>claim.fields.includes("location"));if(locationClaim)evidence.push({...locationClaim,fields:["location"]});}
  return {questId:idByNumber.get(row.sourceNumber),sourceNumber:row.sourceNumber,name:row.name,level:row.level,minLevel:official?.minLevel??null,giverNpc:row.giverNpc,location:prior?.location??null,previousQuestIds:row.prerequisiteNumbers.map((number)=>idByNumber.get(number)),objective:row.objective,reward:null,confidence:"medium",lastChecked:"2026-09-02",evidence};
});
fs.writeFileSync(new URL("../data/quests.json",import.meta.url),`${JSON.stringify(quests,null,2)}\n`);
console.log(JSON.stringify({researched:{chain:chainRows.length,official:officialRows.length},canonical:quests.length,level:quests.filter((quest)=>quest.level!==null).length,minLevel:quests.filter((quest)=>quest.minLevel!==null).length,npc:quests.filter((quest)=>quest.giverNpc).length,location:quests.filter((quest)=>quest.location).length,objective:quests.filter((quest)=>quest.objective).length,prerequisite:quests.filter((quest)=>quest.previousQuestIds.length).length,reward:quests.filter((quest)=>quest.reward).length,officiallyUnmatched:chainRows.filter((row)=>!officialByNumber.get(row.sourceNumber)).map((row)=>row.sourceNumber)},null,2));
