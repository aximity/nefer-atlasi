import fs from "node:fs";
const read=name=>JSON.parse(fs.readFileSync(new URL("../data/"+name,import.meta.url),"utf8"));
const items=read("items.json"),stats=read("stats.json"),recipes=read("recipes.json"),sources=read("sources.json"),evidence=read("evidence.json"),images=read("images.json");
const errors=[], unique=(rows,label)=>{const ids=rows.map(x=>x.id);if(new Set(ids).size!==ids.length)errors.push(`${label}: yinelenen kimlik`)};
[["items",items],["stats",stats],["recipes",recipes],["sources",sources],["evidence",evidence]].forEach(([n,r])=>unique(r,n));
const itemIds=new Set(items.map(x=>x.id)),sourceIds=new Set(sources.map(x=>x.id));
const allowed={class:["Savaşçı","Büyücü","Şifacı"],slot:["Gözlük","Ceket","Eldiven","Pantolon","Ayakkabı","Yüzük","Kolye","Silah"],rarity:["Şaheser"],status:["draft","single_source","cross_verified","conflicted"],source:["official","forum","fandom","video","player_screenshot"]};
for(const i of items){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(i.id))errors.push(`${i.id}: kararlı slug değil`);for(const k of ["class","slot","rarity"])if(!allowed[k].includes(i[k]))errors.push(`${i.id}: geçersiz ${k}`);if(!allowed.status.includes(i.publicationStatus))errors.push(`${i.id}: geçersiz durum`)}
for(const s of sources)if(!allowed.source.includes(s.type)||!s.url||!s.accessedAt||!s.independenceGroup)errors.push(`${s.id}: eksik/geçersiz kaynak`);
for(const s of stats){if(!itemIds.has(s.itemId))errors.push(`${s.id}: kırık eşya`);if(!(s.value>0)||!s.unit)errors.push(`${s.id}: pozitif/birimli değil`)}
for(const r of recipes){if(!itemIds.has(r.itemId)||!sourceIds.has(r.sourceId))errors.push(`${r.id}: kırık referans`);if(!r.materials.length||r.materials.some(m=>!m.name||!(m.quantity>0)))errors.push(`${r.id}: geçersiz malzeme`)}
for(const e of evidence){if(!itemIds.has(e.itemId)||!sourceIds.has(e.sourceId))errors.push(`${e.id}: kırık kanıt`);if(e.status==="cross_verified"){const peers=evidence.filter(x=>x.itemId===e.itemId&&x.field===e.field&&x.status==="cross_verified");const groups=new Set(peers.map(x=>sources.find(s=>s.id===x.sourceId)?.independenceGroup));if(groups.size<2)errors.push(`${e.id}: bağımsız olmayan çapraz doğrulama`)}}
for(const i of items)for(const field of ["name","class","slot"])if(!evidence.some(e=>e.itemId===i.id&&e.field===field&&e.checkedAt))errors.push(`${i.id}: ${field} kanıtı yok`);
for(const image of images)if(!itemIds.has(image.itemId)||!sourceIds.has(image.sourceId)||!image.checkedAt||!image.nameAndAppearanceTogether)errors.push(`${image.id}: görsel kalite kapısı`);
if(items.length!==25)errors.push(`başlangıç denetimi 25 yerine ${items.length} kayıt içeriyor`);
if(errors.length){console.error(errors.join("\n"));process.exit(1)}console.log(`Veri doğrulandı: ${items.length} eşya, ${stats.length} özellik, ${recipes.length} reçete, ${evidence.length} kanıt.`);
