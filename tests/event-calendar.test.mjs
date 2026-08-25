import assert from "node:assert/strict";
import test from "node:test";
import { buildCalendarEvent, buildEventInviteUrl } from "../lib/event-calendar.mjs";

test("topluluk etkinliği İstanbul saat diliminde takvim dosyasına dönüşür", () => {
  const ics = buildCalendarEvent({
    id: "hol-1", title: "Büyük Hol turu", server: "Kıyametin Öncüleri", region: "Büyük Hol",
    roles: "Tank · Şifacı", date: "2026-08-29", time: "21:00", durationMinutes: 90, url: "https://example.com",
  });
  assert.match(ics, /DTSTART;TZID=Europe\/Istanbul:20260829T210000/);
  assert.match(ics, /DTEND;TZID=Europe\/Istanbul:20260829T223000/);
  assert.match(ics, /resmî oyun etkinliği değildir/);
});

test("paylaşım bağlantısı Endgame Takvim sekmesine gerekli alanları taşır", () => {
  const url = new URL(buildEventInviteUrl("https://example.com/", { title: "Erg turu", region: "Zihin Tapınağı", date: "2026-08-30", time: "20:30", roles: "Şifacı" }));
  assert.equal(url.searchParams.get("module"), "endgame");
  assert.equal(url.searchParams.get("panel"), "Takvim");
  assert.equal(url.searchParams.get("community"), "Planlayıcı");
  assert.equal(url.searchParams.get("region"), "Zihin Tapınağı");
});
