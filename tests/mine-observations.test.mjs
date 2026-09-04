import assert from "node:assert/strict";
import test from "node:test";
import {
  appendMineObservation,
  appendMineSignal,
  liveMineObservations,
  projectMineObservation,
} from "../lib/mine-observations.mjs";

const reportedAt = "2026-09-04T10:00:00.000Z";
const report = (overrides = {}) => ({
  eventId: "event-report-1",
  observationId: "observation-1",
  actorId: "player-1",
  regionId: "karakoy",
  resourceId: "madenci-monazit",
  x: 0.42,
  y: 0.68,
  reportedAt,
  expiresAfterMs: 30 * 60 * 1000,
  idempotencyKey: "report-key-1",
  ...overrides,
});

test("yaklaşık koordinatlı gözlem değişmez olay olarak eklenir", () => {
  const events = appendMineObservation([], report());
  assert.equal(events.length, 1);
  assert.deepEqual(events[0].position, { x: 0.42, y: 0.68, precision: "approximate" });
  assert.equal(events[0].expiresAt, "2026-09-04T10:30:00.000Z");
  assert.equal(events[0].visibilityPolicy, "caller_supplied_ttl");
});

test("aynı idempotency anahtarı yinelenen gözlem üretmez", () => {
  const once = appendMineObservation([], report());
  const twice = appendMineObservation(once, report({ eventId: "event-report-2" }));
  assert.equal(twice.length, 1);
});

test("olay kimliği farklı isteklerde yeniden kullanılamaz", () => {
  const events = appendMineObservation([], report());
  assert.throws(() => appendMineObservation(events, report({ observationId:"observation-2", idempotencyKey:"report-key-2" })), /event already exists/);
});

test("koordinat ve görünürlük süresi güvenli aralıkta olmalıdır", () => {
  assert.throws(() => appendMineObservation([], report({ x: 1.01 })), /coordinate/);
  assert.throws(() => appendMineObservation([], report({ expiresAfterMs: 0 })), /expiry/);
});

test("bildirici kendi gözlemini doğrulayamaz", () => {
  const events = appendMineObservation([], report());
  assert.throws(() => appendMineSignal(events, { eventId:"signal-1", observationId:"observation-1", actorId:"player-1", signal:"confirm", occurredAt:"2026-09-04T10:01:00.000Z", idempotencyKey:"signal-key-1" }), /independent actor/);
});

test("ikinci oyuncunun sinyali tekilleştirilir ve ham puan uydurulmaz", () => {
  let events = appendMineObservation([], report());
  const signal = { eventId:"signal-1", observationId:"observation-1", actorId:"player-2", signal:"confirm", occurredAt:"2026-09-04T10:01:00.000Z", idempotencyKey:"signal-key-1" };
  events = appendMineSignal(events, signal);
  events = appendMineSignal(events, { ...signal, eventId:"signal-2" });
  const view = projectMineObservation(events, "observation-1", "2026-09-04T10:10:00.000Z");
  assert.equal(events.length, 2);
  assert.deepEqual(view.signals, { confirm: 1, reject: 0 });
  assert.equal(view.confidenceScore, undefined);
});

test("aynı oyuncu ikinci ve farklı bir sinyal bırakamaz", () => {
  let events = appendMineObservation([], report());
  events = appendMineSignal(events, { eventId:"signal-1", observationId:"observation-1", actorId:"player-2", signal:"confirm", occurredAt:"2026-09-04T10:01:00.000Z", idempotencyKey:"signal-key-1" });
  assert.throws(() => appendMineSignal(events, { eventId:"signal-2", observationId:"observation-1", actorId:"player-2", signal:"reject", occurredAt:"2026-09-04T10:02:00.000Z", idempotencyKey:"signal-key-2" }), /already signaled/);
});

test("yalnız gözlem canlıyken sinyal kabul edilir", () => {
  const events = appendMineObservation([], report());
  const signal = { eventId:"signal-1", observationId:"observation-1", actorId:"player-2", signal:"confirm", occurredAt:"2026-09-04T10:30:00.000Z", idempotencyKey:"signal-key-1" };
  assert.throws(() => appendMineSignal(events, signal), /not live/);
  assert.throws(() => appendMineSignal(events, { ...signal, occurredAt:"2026-09-04T09:59:59.999Z" }), /not live/);
});

test("süresi dolan gözlem canlı görünümden çıkar, olay izi korunur", () => {
  const events = appendMineObservation([], report());
  assert.equal(liveMineObservations(events, "2026-09-04T10:29:59.999Z").length, 1);
  assert.equal(liveMineObservations(events, "2026-09-04T10:30:00.000Z").length, 0);
  assert.equal(events.length, 1);
  assert.equal(projectMineObservation(events, "observation-1", "2026-09-04T10:30:00.000Z").status, "expired");
});

test("gözlemler doğrulanmış katalog gerçeği olarak işaretlenmez", () => {
  const view = projectMineObservation(appendMineObservation([], report()), "observation-1", "2026-09-04T10:05:00.000Z");
  assert.equal(view.dataClass, "community_observation");
  assert.equal(view.position.precision, "approximate");
});
