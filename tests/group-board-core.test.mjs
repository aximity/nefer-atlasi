import assert from "node:assert/strict";
import test from "node:test";
import { parseAnnouncementText, validateGroupAnnouncement } from "../lib/group-board-core.mjs";

test("Discord ve oyun sohbeti duyurusu yapılandırılmış taslağa dönüşür", () => {
  const parsed = parseAnnouncementText("Discord: 21.30 Büyük Hol için tank ve şifacı aranıyor, tılsım farm");
  assert.equal(parsed.region, "Büyük Hol");
  assert.equal(parsed.time, "21:30");
  assert.equal(parsed.channel, "Discord");
  assert.equal(parsed.category, "Tılsım");
  assert.deepEqual(parsed.roles, ["Tank", "Şifacı"]);
});

test("ilan telefon ve davet bağlantısı yayımlamaz", () => {
  const now = new Date("2026-08-25T18:00:00Z").getTime();
  const base = { server: "Kıyametin Öncüleri", category: "Farm", region: "Büyük Hol", roles: ["Tank"], channel: "WhatsApp", title: "Büyük Hol farmı", leaderAlias: "Nefer_1", date: "2026-08-26", time: "21:00", durationMinutes: 90, clientToken: "a".repeat(32), website: "" };
  assert.equal(validateGroupAnnouncement(base, { now }).region, "Büyük Hol");
  assert.throws(() => validateGroupAnnouncement({ ...base, leaderAlias: "+90 555 111 22 33" }, { now }), /Telefon numarası/);
  assert.throws(() => validateGroupAnnouncement({ ...base, title: "Katıl https:\/\/discord.gg\/abc" }, { now }), /bağlantısı/);
});
