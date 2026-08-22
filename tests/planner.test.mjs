import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {applyWrath,sumPublishedStats} from "../lib/planner-core.mjs";
const stats=JSON.parse(fs.readFileSync(new URL("../data/stats.json",import.meta.url),"utf8"));
test("eşya toplamı çelişkili alanı dışarıda bırakıp yayımlanabilir değerleri toplar",()=>{const total=sumPublishedStats(["sifir-kelvin-ceket","sifir-kelvin-eldiven"],stats);assert.equal(total["Büyü Hasarı (Buz)"],150000);assert.equal(total["Maksimum Kudret"],440000);assert.equal(total["Büyü Kritik Şansı"],8708)});
test("Gazap tılsımı taban kapalıyken toplamı değiştirmez",()=>{const base={"Maksimum Hasar":100,"Büyü Kritik Şansı":20};assert.deepEqual(applyWrath(base,false,"damage_multiplier",150),base)});
test("Gazap hasar ve kritik çarpanlarını ayrı hedeflere uygular",()=>{const base={"Maksimum Hasar":100,"Büyü Hasarı (Asit)":80,"Büyü Kritik Şansı":20};assert.deepEqual(applyWrath(base,true,"damage_multiplier",50),{"Maksimum Hasar":150,"Büyü Hasarı (Asit)":120,"Büyü Kritik Şansı":20});assert.deepEqual(applyWrath(base,true,"critical_multiplier",100,7),{"Maksimum Hasar":100,"Büyü Hasarı (Asit)":80,"Büyü Kritik Şansı":20,"Gazap Kritik İhtimali":14})});
