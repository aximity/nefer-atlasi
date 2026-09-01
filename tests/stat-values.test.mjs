import assert from "node:assert/strict";
import test from "node:test";
import {applyTalisman} from "../lib/planner-core.mjs";
import {formatStatValue,isSupportedStorageScale,statValueModel,summarizeCompatibleStats} from "../lib/stat-values.mjs";

const stat=(attribute,value,unit,itemId="item")=>({itemId,attribute,value,unit,verificationStatus:"single_source"});

test("raw değer korunur ve kanıtlı identity gösterim değişmez",()=>{const row=stat("Büyü Hasarı (Buz)",130000,"raw_game_value");const model=statValueModel(row);assert.equal(model.rawValue,130000);assert.equal(model.displayValue,130000);assert.equal(formatStatValue(row),"130.000");assert.equal(row.value,130000)});
test("kanıtlanmamış ve unknown ölçek display değeri uydurmaz",()=>{assert.equal(formatStatValue(stat("Büyü Kritik Şansı",5442,"scaled_1000")),"Doğrulama gerekiyor");assert.equal(formatStatValue(stat("Bilinmeyen",42,"unknown")),"Doğrulama gerekiyor")});
test("aynı özellikte raw ve scaled değer sessizce toplanmaz",()=>{const result=summarizeCompatibleStats([stat("Büyü Kritik Şansı",4354,"raw_game_value","a"),stat("Büyü Kritik Şansı",5442,"scaled_1000","b")]);assert.equal(result.values["Büyü Kritik Şansı"],undefined);assert.deepEqual(result.incompatible,["Büyü Kritik Şansı"])});
test("aynı scale içindeki mevcut toplam doğru kalır",()=>{const result=summarizeCompatibleStats([stat("Maksimum Kudret",220000,"raw_game_value","a"),stat("Maksimum Kudret",220000,"raw_game_value","b")]);assert.equal(result.values["Maksimum Kudret"],440000);assert.equal(result.scales["Maksimum Kudret"],"raw_game_value");assert.deepEqual(result.incompatible,[])});
test("tılsım hesabı display formatterdan bağımsız kalır",()=>{const base={"Büyü Hasarı (Ateş)":150000};const result=applyTalisman(base,{effect:"stat_multiplier",value:20,targetAttributes:["Büyü Hasarı (Ateş)"],outputAttribute:"Tılsımlı Ateş"});assert.equal(result["Tılsımlı Ateş"],180000);assert.equal(formatStatValue(stat("Tılsımlı Ateş",result["Tılsımlı Ateş"],"scaled_1000")),"Doğrulama gerekiyor")});
test("uyumsuz toplam tılsıma yanlış taban sağlamaz",()=>{const summary=summarizeCompatibleStats([stat("Büyü Hasarı (Ateş)",150000,"raw_game_value","a"),stat("Büyü Hasarı (Ateş)",121000,"puan","b")]);const result=applyTalisman(summary.values,{effect:"stat_multiplier",value:20,targetAttributes:["Büyü Hasarı (Ateş)"],outputAttribute:"Tılsımlı Ateş"});assert.equal(result["Tılsımlı Ateş"],undefined);assert.deepEqual(summary.incompatible,["Büyü Hasarı (Ateş)"])});
test("storage scale sözleşmesi unknown değerini kabul edip unsupported değeri reddeder",()=>{for(const scale of ["raw_game_value","scaled_1000","scaled_10000","puan","unknown"])assert.equal(isSupportedStorageScale(scale),true);assert.equal(isSupportedStorageScale("guessed_percent"),false)});
