import test from "node:test";
import assert from "node:assert/strict";
import {matchOfficialQuestRows,parseOfficialQuestRows} from "../lib/quest-import-core.mjs";

test("resmî görev adı seviyesi ile ayrı açılma gereksinimi doğru alanlara ayrılır",()=>{
  const html=`<table><tbody>
    <tr><td>Görev Adı</td><td>Açıklama</td><td>Seviye Gereksinimi</td><td>Görev Gereksinimi</td></tr>
    <tr><td>Sahil Temizliği [3]</td><td>10 adet Keme öldürün.</td><td>2</td><td>Sahil Temizliği [2]</td></tr>
  </tbody></table>`;
  const [official]=parseOfficialQuestRows(html);
  assert.deepEqual({level:official.level,minLevel:official.minLevel},{level:3,minLevel:2});
  const matches=matchOfficialQuestRows([{sourceNumber:10,name:"Sahil Temizliği",level:3}], [official]);
  assert.equal(matches.get(10),official);
});

test("boş resmî seviye gereksinimi görev seviyesinden tahmin edilmez",()=>{
  const [official]=parseOfficialQuestRows("<tr><td>Teşkilat'a Katılış [1]</td><td>Jandarma Ali ile konuş.</td><td></td><td></td></tr>");
  assert.equal(official.level,1);
  assert.equal(official.minLevel,null);
});

test("aynı adlı ve seviyeli görevler sıra tahmini yerine objective ile eşlenir",()=>{
  const officialRows=parseOfficialQuestRows(`
    <tr><td>Hız Testi [32]</td><td>İstihbarat subayı ile konuşun.</td><td></td><td></td></tr>
    <tr><td>Hız Testi [32]</td><td>3 dakika içinde gizemli ajan ile konuşun.</td><td>32</td><td></td></tr>`);
  const matches=matchOfficialQuestRows([
    {sourceNumber:123,name:"Hız Testi",level:32,objective:"3 dakika içinde gizemli ajan ile konuşun."},
    {sourceNumber:124,name:"Hız Testi",level:32,objective:"İstihbarat subayı ile konuşun."},
  ],officialRows);
  assert.equal(matches.get(123).minLevel,32);
  assert.equal(matches.get(124).minLevel,null);
});
