import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {resolveEnchantRows,sumEnchantRows} from "../lib/enchant-core.mjs";
const rows=JSON.parse(fs.readFileSync(new URL("../data/enchants.json",import.meta.url),"utf8"));
test("çift efsunlu eşya adını iki bağımsız özelliğe çözer",()=>{const found=resolveEnchantRows("Alaska Modeli Bolat Modeli Kolye",rows);assert.deepEqual(found.map(x=>x.name).toSorted(),["Alaska Modeli","Bolat Modeli"]);assert.deepEqual(sumEnchantRows(found),{"Büyü Hasarı (Buz)":130000,"Büyü Hasarı (Elektrik)":130000})});
test("bilinmeyen eşya adına tahmini efsun üretmez",()=>assert.deepEqual(resolveEnchantRows("Bilinmeyen Deneme Yüzüğü",rows),[]));
