import assert from "node:assert/strict";
import test from "node:test";
import {decodeBuild,encodeBuild,sanitizeBuild} from "../lib/build-codec.mjs";
const rules={classes:["Savaşçı","Büyücü","Şifacı"],goalsByClass:{"Savaşçı":["Fiziksel","Ateş"],"Büyücü":["Fiziksel","Buz"],"Şifacı":["Şifa"]},classSlots:{"Savaşçı":["Silah"],"Büyücü":["Silah"],"Şifacı":["Silah"]},itemById:{kilic:{class:"Savaşçı",slot:"Silah"},asa:{class:"Büyücü",slot:"Silah"}},modes:["Grup Bölgesi","PvE"],contextIds:["cemberlitas"],rivals:["Rakip yok","Savaşçı","Büyücü","Şifacı"],talismanIds:["","wrath-1-i"]};
const build={klass:"Savaşçı",primary:"Fiziksel",secondary:"Ateş",selection:{Silah:"kilic"},mode:"PvE",regionId:"cemberlitas",rival:"Şifacı",talismanId:"",wrathBase:false,wrathCriticalBase:0,abilities:{main:15,support:4,defense:0}};
test("Türkçe sınıf ve hedefler Base64URL ile kayıpsız paylaşılır",()=>{const code=encodeBuild(build);assert.match(code,/^[A-Za-z0-9_-]+$/);assert.deepEqual(decodeBuild(code),{...build,v:1})});
test("sınıfa uymayan eşya ve sınır dışı yetenek temizlenir",()=>{const clean=sanitizeBuild({...build,v:1,selection:{Silah:"asa"},abilities:{main:99,support:4,defense:-1}},rules);assert.deepEqual(clean.selection,{});assert.deepEqual(clean.abilities,{main:0,support:4,defense:0})});
test("bilinmeyen sürüm ve geçersiz hedef reddedilir",()=>{assert.throws(()=>decodeBuild(encodeBuild({...build,v:2}).replace(/.$/,"!")));assert.equal(sanitizeBuild({...build,v:1,primary:"Tank"},rules),null)});
