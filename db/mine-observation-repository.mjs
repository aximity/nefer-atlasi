function fromRecord(record) {
  if (record.kind === "mine_observation_reported") {
    if (
      record.region_id === null
      || record.resource_id === null
      || record.x === null
      || record.y === null
      || record.precision === null
      || record.expires_at === null
      || record.visibility_policy === null
    ) {
      throw new Error("invalid persisted mine observation report");
    }

    return {
      kind: record.kind,
      eventId: record.event_id,
      observationId: record.observation_id,
      actorId: record.actor_id,
      regionId: record.region_id,
      resourceId: record.resource_id,
      position: { x: record.x, y: record.y, precision: record.precision },
      occurredAt: record.occurred_at,
      expiresAt: record.expires_at,
      visibilityPolicy: record.visibility_policy,
      idempotencyKey: record.idempotency_key,
    };
  }

  if (record.signal === null) {
    throw new Error("invalid persisted mine observation signal");
  }

  return {
    kind: record.kind,
    eventId: record.event_id,
    observationId: record.observation_id,
    actorId: record.actor_id,
    signal: record.signal,
    occurredAt: record.occurred_at,
    idempotencyKey: record.idempotency_key,
  };
}

const columns = `
  event_id, kind, observation_id, actor_id, region_id, resource_id,
  x, y, precision, signal, occurred_at, expires_at, visibility_policy,
  idempotency_key
`;

export class D1MineObservationRepository {
  constructor(database) {
    this.database = database;
  }

  async append(event) {
    const isReport = event.kind === "mine_observation_reported";
    const result = await this.database.prepare(`
      INSERT INTO mine_observation_events (${columns})
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(idempotency_key) DO NOTHING
    `).bind(
      event.eventId,
      event.kind,
      event.observationId,
      event.actorId,
      isReport ? event.regionId : null,
      isReport ? event.resourceId : null,
      isReport ? event.position.x : null,
      isReport ? event.position.y : null,
      isReport ? event.position.precision : null,
      isReport ? null : event.signal,
      event.occurredAt,
      isReport ? event.expiresAt : null,
      isReport ? event.visibilityPolicy : null,
      event.idempotencyKey,
    ).run();

    return result.meta.changes > 0 ? "inserted" : "duplicate";
  }

  async byIdempotencyKey(idempotencyKey) {
    const record = await this.database.prepare(`
      SELECT ${columns}
      FROM mine_observation_events
      WHERE idempotency_key = ?
      LIMIT 1
    `).bind(idempotencyKey).first();
    return record ? fromRecord(record) : null;
  }

  async forObservation(observationId) {
    const result = await this.database.prepare(`
      SELECT ${columns}
      FROM mine_observation_events
      WHERE observation_id = ?
      ORDER BY occurred_at, event_id
    `).bind(observationId).all();
    return result.results.map(fromRecord);
  }

  async liveEvents(now) {
    const result = await this.database.prepare(`
      SELECT ${columns}
      FROM mine_observation_events AS event
      WHERE (event.kind = 'mine_observation_reported' AND event.expires_at > ?)
        OR (
          event.kind = 'mine_observation_signaled'
          AND EXISTS (
            SELECT 1
            FROM mine_observation_events AS report
            WHERE report.observation_id = event.observation_id
              AND report.kind = 'mine_observation_reported'
              AND report.expires_at > ?
          )
        )
      ORDER BY event.occurred_at, event.event_id
    `).bind(now, now).all();
    return result.results.map(fromRecord);
  }
}
