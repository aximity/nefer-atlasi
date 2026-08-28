import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {applyTalisman,applyWrath,sumPublishedStats} from "../lib/planner-core.mjs";
const stats=JSON.parse(fs.readFileSync(new URL("../data/stats.json",import.meta.url),"utf8"));
test("çift satırlı ceket özelliğini toplam değeriyle, normal parçayı tek değeriyle toplar",()=>{const total=sumPublishedStats(["sifir-kelvin-ceket","sifir-kelvin-eldiven"],stats);assert.equal(total["Büyü Hasarı (Buz)"],450000);assert.equal(total["Maksimum Kudret"],220000);assert.equal(total["Büyü Kritik Şansı"],8708)});
test("Gazap tılsımı taban kapalıyken toplamı değiştirmez",()=>{const base={"Maksimum Hasar":100,"Büyü Kritik Şansı":20};assert.deepEqual(applyWrath(base,false,"damage_multiplier",150),base)});
test("Gazap hasar ve kritik çarpanlarını ayrı hedeflere uygular",()=>{const base={"Maksimum Hasar":100,"Büyü Hasarı (Asit)":80,"Büyü Kritik Şansı":20};assert.deepEqual(applyWrath(base,true,"damage_multiplier",50),{"Maksimum Hasar":150,"Büyü Hasarı (Asit)":120,"Büyü Kritik Şansı":20});assert.deepEqual(applyWrath(base,true,"critical_multiplier",100,7),{"Maksimum Hasar":100,"Büyü Hasarı (Asit)":80,"Büyü Kritik Şansı":20,"Gazap Kritik İhtimali":14})});
test("sınıf tılsımı yalnız tanımlı özellik toplamından türetilmiş sonuç üretir",()=>{const base={"Büyü Hasarı (Ateş)":100,"Büyü Hasarı (Hepsi)":20,"Büyü Hasarı (Buz)":80};const talisman={effect:"stat_multiplier",value:20,targetAttributes:["Büyü Hasarı (Ateş)","Büyü Hasarı (Hepsi)"],outputAttribute:"Tılsımlı Ateş Büyü Hasarı"};assert.deepEqual(applyTalisman(base,talisman),{...base,"Tılsımlı Ateş Büyü Hasarı":144})});
