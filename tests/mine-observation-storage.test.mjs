import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { D1MineObservationRepository } from "../db/mine-observation-repository.mjs";
import { MINE_OBSERVATION_POLICY } from "../lib/mine-observation-api.mjs";

const migrationDirectory = new URL("../drizzle/", import.meta.url);
const migration = readdirSync(migrationDirectory)
  .filter((name) => name.endsWith(".sql"))
  .sort()
  .map((name) => readFileSync(new URL(name, migrationDirectory), "utf8"))
  .join("\n")
  .replaceAll("--> statement-breakpoint", "");

const report = {
  event_id: "event-report-1",
  kind: "mine_observation_reported",
  observation_id: "observation-1",
  actor_id: "player-1",
  region_id: "karakoy",
  resource_id: "madenci-monazit",
  x: 0.42,
  y: 0.68,
  precision: "approximate",
  signal: null,
  occurred_at: "2026-09-04T10:00:00.000Z",
  expires_at: "2026-09-04T10:30:00.000Z",
  visibility_policy: "caller_supplied_ttl",
  idempotency_key: "report-key-1",
};

const signal = {
  event_id: "event-signal-1",
  kind: "mine_observation_signaled",
  observation_id: "observation-1",
  actor_id: "player-2",
  region_id: null,
  resource_id: null,
  x: null,
  y: null,
  precision: null,
  signal: "confirm",
  occurred_at: "2026-09-04T10:01:00.000Z",
  expires_at: null,
  visibility_policy: null,
  idempotency_key: "signal-key-1",
};

const createDatabase = () => {
  const database = new DatabaseSync(":memory:");
  database.exec(migration);
  return database;
};

class SQLiteD1Statement {
  constructor(statement, values = []) {
    this.statement = statement;
    this.values = values;
  }

  bind(...values) {
    return new SQLiteD1Statement(this.statement, values);
  }

  async run() {
    const result = this.statement.run(...this.values);
    return { results: [], meta: { changes: Number(result.changes) } };
  }

  async first() {
    return this.statement.get(...this.values) ?? null;
  }

  async all() {
    const results = this.statement.all(...this.values).map((row) => ({ ...row }));
    return { results, meta: { changes: 0 } };
  }
}

class SQLiteD1Database {
  constructor(database) {
    this.database = database;
  }

  prepare(query) {
    return new SQLiteD1Statement(this.database.prepare(query));
  }
}

const insertEvent = (database, event) => database.prepare(`
  INSERT INTO mine_observation_events (
    event_id, kind, observation_id, actor_id, region_id, resource_id,
    x, y, precision, signal, occurred_at, expires_at, visibility_policy,
    idempotency_key
  ) VALUES (
    $event_id, $kind, $observation_id, $actor_id, $region_id, $resource_id,
    $x, $y, $precision, $signal, $occurred_at, $expires_at, $visibility_policy,
    $idempotency_key
  )
`).run(event);

test("D1 migration rapor ve bağımsız sinyal olaylarını eklemeli", (context) => {
  const database = createDatabase();
  context.after(() => database.close());

  insertEvent(database, report);
  insertEvent(database, signal);

  const rows = database.prepare(`
    SELECT event_id, kind
    FROM mine_observation_events
    WHERE observation_id = ?
    ORDER BY occurred_at, event_id
  `).all("observation-1").map((row) => ({ ...row }));
  assert.deepEqual(rows, [
    { event_id: "event-report-1", kind: "mine_observation_reported" },
    { event_id: "event-signal-1", kind: "mine_observation_signaled" },
  ]);
});

test("D1 migration idempotency ve tekil oyuncu sinyalini zorlamalı", (context) => {
  const database = createDatabase();
  context.after(() => database.close());

  insertEvent(database, report);
  insertEvent(database, signal);

  assert.throws(
    () => insertEvent(database, { ...signal, event_id: "event-signal-2" }),
    /UNIQUE constraint failed: mine_observation_events\.observation_id, mine_observation_events\.actor_id/,
  );
  assert.throws(
    () => insertEvent(database, {
      ...signal,
      event_id: "event-signal-3",
      actor_id: "player-3",
    }),
    /UNIQUE constraint failed: mine_observation_events\.idempotency_key/,
  );
});

test("D1 migration olay biçimini ve yaklaşık koordinat sınırını zorlamalı", (context) => {
  const database = createDatabase();
  context.after(() => database.close());

  assert.throws(
    () => insertEvent(database, { ...report, x: 1.01 }),
    /CHECK constraint failed: mine_observation_event_shape/,
  );
  assert.throws(
    () => insertEvent(database, { ...signal, signal: "maybe" }),
    /CHECK constraint failed: mine_observation_event_shape/,
  );
});

test("süresi dolan rapor canlı sorgudan çıkar ama olay defterinde kalmalı", (context) => {
  const database = createDatabase();
  context.after(() => database.close());

  insertEvent(database, report);
  const liveCount = database.prepare(`
    SELECT COUNT(*) AS count
    FROM mine_observation_events
    WHERE kind = 'mine_observation_reported' AND expires_at > ?
  `).get("2026-09-04T10:30:00.000Z");
  const ledgerCount = database.prepare(
    "SELECT COUNT(*) AS count FROM mine_observation_events",
  ).get();

  assert.equal(liveCount.count, 0);
  assert.equal(ledgerCount.count, 1);
});

test("D1 aynı oyuncunun beş dakikadaki yedinci yazımını atomik olarak reddetmeli", (context) => {
  const database = createDatabase();
  context.after(() => database.close());

  for (let index = 0; index < 6; index += 1) {
    insertEvent(database, {
      ...report,
      event_id: `rate-event-${index}`,
      observation_id: `rate-observation-${index}`,
      occurred_at: `2026-09-04T10:0${index}:00.000Z`,
      expires_at: `2026-09-04T10:3${index}:00.000Z`,
      idempotency_key: `rate-key-${index}`,
    });
  }

  assert.throws(
    () => insertEvent(database, {
      ...report,
      event_id: "rate-event-7",
      observation_id: "rate-observation-7",
      occurred_at: "2026-09-04T10:05:00.000Z",
      expires_at: "2026-09-04T10:35:00.000Z",
      idempotency_key: "rate-key-7",
    }),
    /mine observation rate limit exceeded/,
  );
});

test("D1 trigger ve API aynı rate-limit politikasını kullanmalı", () => {
  assert.match(migration, new RegExp(`\\) >= ${MINE_OBSERVATION_POLICY.writeLimit}`));
  assert.match(
    migration,
    new RegExp(`- ${MINE_OBSERVATION_POLICY.writeWindowMs / 1000}`),
  );
});

test("D1 repository olayları prepared statement ile kaydedip canlı okur", async (context) => {
  const database = createDatabase();
  context.after(() => database.close());
  const repository = new D1MineObservationRepository(new SQLiteD1Database(database));
  const reportEvent = {
    kind: "mine_observation_reported",
    eventId: "repository-report-1",
    observationId: "repository-observation-1",
    actorId: "repository-player-1",
    regionId: "buyuk-hol",
    resourceId: "madenci-monazit",
    position: { x: 0.42, y: 0.68, precision: "approximate" },
    occurredAt: "2026-09-04T10:00:00.000Z",
    expiresAt: "2026-09-04T10:30:00.000Z",
    visibilityPolicy: "caller_supplied_ttl",
    idempotencyKey: "repository-report-key-1",
  };
  const signalEvent = {
    kind: "mine_observation_signaled",
    eventId: "repository-signal-1",
    observationId: "repository-observation-1",
    actorId: "repository-player-2",
    signal: "confirm",
    occurredAt: "2026-09-04T10:01:00.000Z",
    idempotencyKey: "repository-signal-key-1",
  };

  assert.equal(await repository.append(reportEvent), "inserted");
  assert.equal(await repository.append(reportEvent), "duplicate");
  assert.deepEqual(await repository.byIdempotencyKey(reportEvent.idempotencyKey), reportEvent);
  assert.equal(await repository.append(signalEvent), "inserted");
  assert.equal((await repository.forObservation(reportEvent.observationId)).length, 2);
  assert.equal((await repository.liveEvents("2026-09-04T10:29:59.999Z")).length, 2);
  assert.equal((await repository.liveEvents("2026-09-04T10:30:00.000Z")).length, 0);
});
