import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {applyWrath,sumPublishedStats} from "../lib/planner-core.mjs";
const stats=JSON.parse(fs.readFileSync(new URL("../data/stats.json",import.meta.url),"utf8"));
test("eşya toplamı yalnız yayımlanabilir alanları ve aynı birimi toplar",()=>{const total=sumPublishedStats(["zero-kelvin-jacket","zero-kelvin-gloves"],stats);assert.equal(total["Büyü Hasarı (Buz)"],150000);assert.equal(total["Maksimum Kudret"],220000);assert.equal(total["Büyü Kritik Şansı"],4354)});
test("Gazap tılsımı taban kapalıyken toplamı değiştirmez",()=>{const base={"Maksimum Hasar":100,"Büyü Kritik Şansı":20};assert.deepEqual(applyWrath(base,false,"damage_multiplier",150),base)});
test("Gazap hasar ve kritik çarpanlarını ayrı hedeflere uygular",()=>{const base={"Maksimum Hasar":100,"Büyü Hasarı (Asit)":80,"Büyü Kritik Şansı":20};assert.deepEqual(applyWrath(base,true,"damage_multiplier",50),{"Maksimum Hasar":150,"Büyü Hasarı (Asit)":120,"Büyü Kritik Şansı":20});assert.deepEqual(applyWrath(base,true,"critical_multiplier",100),{"Maksimum Hasar":100,"Büyü Hasarı (Asit)":80,"Büyü Kritik Şansı":40})});
