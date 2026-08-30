import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const update = JSON.parse(read("../data/server-updates.json"));

test("30 Ağustos KÖ notu kapsamını ve kaynak sınırını korur", () => {
  assert.equal(update.verificationStatus, "single_source");
  assert.deepEqual(update.sections.map((section) => section.id), ["pvp", "anka", "mining", "regions", "connection", "update-warning"]);
  assert.match(update.scopeNote, /ikinci kaynak/i);
  assert.match(update.sections.find((section) => section.id === "pvp").items.join(" "), /Öldükten sonra yeni yetenek atılamıyor/);
  assert.equal(update.sections.find((section) => section.id === "anka").items.length, 3);
});

test("madenlerde son bildirim öne çıkarılırken eski not silinmez", () => {
  const mining = update.sections.find((section) => section.id === "mining");
  assert.equal(mining.status, "conflicted");
  assert.match(mining.items[0], /yoksa görünmez/);
  assert.match(mining.conflict.earlier, /tükenmiş animasyonuyla görünür/);
  assert.match(mining.conflict.decision, /oyun içi gözlem/);
});

test("güncelleme ilgili arayüzlerde görünür", () => {
  const release = read("../app/ReleaseCenter.tsx");
  const mining = read("../app/MiningGuide.tsx");
  const endgame = read("../app/EndgameLab.tsx");
  assert.match(release, /server-updates\.json/);
  assert.match(release, /OYUN GÜNCELLEMESİ · TEK KAYNAK/);
  assert.match(mining, /Maden varsa görünür ve çekilebilir; yoksa görünmez/);
  assert.match(endgame, /5 saniye yetişemezse yanına ışınlanıyor/);
});
