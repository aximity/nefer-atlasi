import assert from "node:assert/strict";
import test from "node:test";
import {
  listMineObservations,
  MINE_OBSERVATION_POLICY,
  validateMineObservationWriteRequest,
  writeMineObservation,
} from "../lib/mine-observation-api.mjs";

const now = "2026-09-04T10:00:00.000Z";
const allowedRegionIds = new Set(["buyuk-hol"]);
const allowedResourceIds = new Set(["madenci-monazit"]);
const writeOptions = { allowedRegionIds, allowedResourceIds };
const reportPayload = {
  kind: "report",
  regionId: "buyuk-hol",
  resourceId: "madenci-monazit",
  x: 0.42,
  y: 0.68,
  idempotencyKey: "report-key-1",
};

class MemoryRepository {
  constructor(events = []) {
    this.events = [...events];
  }

  async append(event) {
    this.events.push(event);
    return "inserted";
  }

  async byIdempotencyKey(key) {
    return this.events.find((event) => event.idempotencyKey === key) ?? null;
  }

  async forObservation(observationId) {
    return this.events.filter((event) => event.observationId === observationId);
  }

  async liveEvents() {
    return this.events;
  }
}

const ids = (...values) => {
  let index = 0;
  return () => values[index++];
};

test("anonim ziyaretçi canlı gözlemleri okuyabilir ve oyuncu kimliği açığa çıkmaz", async () => {
  const repository = new MemoryRepository([{
    kind: "mine_observation_reported",
    eventId: "event-1",
    observationId: "observation-1",
    actorId: "private-player-id",
    regionId: "buyuk-hol",
    resourceId: "madenci-monazit",
    position: { x: 0.42, y: 0.68, precision: "approximate" },
    occurredAt: now,
    expiresAt: "2026-09-04T10:30:00.000Z",
    visibilityPolicy: "caller_supplied_ttl",
    idempotencyKey: "report-key-1",
  }]);

  const result = await listMineObservations(repository, "2026-09-04T10:05:00.000Z");
  assert.equal(result.status, 200);
  assert.equal(result.body.observations.length, 1);
  assert.equal(JSON.stringify(result.body).includes("private-player-id"), false);
});

test("anonim yazma isteği repository'ye ulaşmadan reddedilir", async () => {
  const repository = new MemoryRepository();
  const result = await writeMineObservation(repository, null, reportPayload, writeOptions);
  assert.equal(result.status, 401);
  assert.equal(repository.events.length, 0);
});

test("API yalnız aynı kaynaktan application/json yazımını kabul eder", () => {
  const valid = new Request("https://nefer.example/api/mine-observations", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://nefer.example" },
  });
  const crossSite = new Request("https://nefer.example/api/mine-observations", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://attacker.example" },
  });
  const wrongType = new Request("https://nefer.example/api/mine-observations", {
    method: "POST",
    headers: { "content-type": "text/plain" },
  });

  assert.equal(validateMineObservationWriteRequest(valid), null);
  assert.equal(validateMineObservationWriteRequest(crossSite).status, 403);
  assert.equal(validateMineObservationWriteRequest(wrongType).status, 415);
});

test("girişli rapor yalnız canonical kaynakla ve sunucu TTL politikasıyla oluşturulur", async () => {
  const repository = new MemoryRepository();
  const result = await writeMineObservation(repository, "player-1", {
    ...reportPayload,
    expiresAfterMs: 99,
  }, {
    ...writeOptions,
    now,
    randomUUID: ids("event-1", "observation-1"),
  });

  assert.equal(result.status, 201);
  assert.equal(repository.events[0].expiresAt, "2026-09-04T10:30:00.000Z");
  assert.equal(MINE_OBSERVATION_POLICY.visibilityTtlMs, 30 * 60 * 1000);

  const invalid = await writeMineObservation(repository, "player-1", {
    ...reportPayload,
    resourceId: "uydurma-maden",
    idempotencyKey: "report-key-2",
  }, writeOptions);
  assert.equal(invalid.status, 400);
});

test("aynı istek güvenle yinelenir, farklı içerikte anahtar kullanımı çakışır", async () => {
  const repository = new MemoryRepository();
  await writeMineObservation(repository, "player-1", reportPayload, {
    ...writeOptions,
    now,
    randomUUID: ids("event-1", "observation-1"),
  });

  const duplicate = await writeMineObservation(repository, "player-1", reportPayload, writeOptions);
  const conflict = await writeMineObservation(repository, "player-2", reportPayload, writeOptions);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.status, "duplicate");
  assert.equal(conflict.status, 409);
  assert.equal(repository.events.length, 1);
});

test("bildirici kendi gözlemine sinyal bırakamaz", async () => {
  const repository = new MemoryRepository();
  await writeMineObservation(repository, "player-1", reportPayload, {
    ...writeOptions,
    now,
    randomUUID: ids("event-1", "observation-1"),
  });

  const result = await writeMineObservation(repository, "player-1", {
    kind: "signal",
    observationId: "observation-1",
    signal: "confirm",
    idempotencyKey: "signal-key-1",
  }, { now: "2026-09-04T10:01:00.000Z", randomUUID: ids("event-2") });
  assert.equal(result.status, 409);
  assert.equal(result.body.error.code, "SELF_SIGNAL_FORBIDDEN");
});

test("bağımsız oyuncunun sinyali canlı gözlemin sayacına eklenir", async () => {
  const repository = new MemoryRepository();
  await writeMineObservation(repository, "player-1", reportPayload, {
    ...writeOptions,
    now,
    randomUUID: ids("event-1", "observation-1"),
  });

  const signal = await writeMineObservation(repository, "player-2", {
    kind: "signal",
    observationId: "observation-1",
    signal: "confirm",
    idempotencyKey: "signal-key-1",
  }, { now: "2026-09-04T10:01:00.000Z", randomUUID: ids("event-2") });
  const live = await listMineObservations(repository, "2026-09-04T10:02:00.000Z");

  assert.equal(signal.status, 201);
  assert.deepEqual(live.body.observations[0].signals, { confirm: 1, reject: 0 });
});

test("D1 rate-limit hatası kullanıcıya 429 olarak döner", async () => {
  const repository = new MemoryRepository();
  repository.append = async () => {
    throw new Error("mine observation rate limit exceeded");
  };

  const result = await writeMineObservation(repository, "player-1", reportPayload, {
    ...writeOptions,
    now,
    randomUUID: ids("event-1", "observation-1"),
  });
  assert.equal(result.status, 429);
  assert.equal(result.body.error.code, "RATE_LIMITED");
});

test("beklenmeyen repository hatası güvenli 503 yanıtına çevrilir", async () => {
  const repository = new MemoryRepository();
  repository.byIdempotencyKey = async () => {
    throw new Error("no such table: mine_observation_events");
  };

  const result = await writeMineObservation(repository, "player-1", reportPayload, {
    ...writeOptions,
  });
  assert.equal(result.status, 503);
  assert.equal(result.body.error.code, "STORAGE_UNAVAILABLE");
});
