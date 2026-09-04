const requiredText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`invalid ${field}`);
  return value;
};

const timestamp = (value, field) => {
  requiredText(value, field);
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`invalid ${field}`);
  return parsed;
};

const observationReport = (events, observationId) => events.find(
  (event) => event.kind === "mine_observation_reported" && event.observationId === observationId,
);

export function appendMineObservation(events, input) {
  if (!Array.isArray(events)) throw new Error("invalid event ledger");
  const idempotencyKey = requiredText(input?.idempotencyKey, "idempotency key");
  if (events.some((event) => event.idempotencyKey === idempotencyKey)) return events;
  if (events.some((event) => event.eventId === input?.eventId)) throw new Error("event already exists");
  const reportedAtMs = timestamp(input.reportedAt, "reported timestamp");
  if (!Number.isFinite(input.x) || !Number.isFinite(input.y) || input.x < 0 || input.x > 1 || input.y < 0 || input.y > 1) throw new Error("invalid approximate coordinate");
  if (!Number.isInteger(input.expiresAfterMs) || input.expiresAfterMs <= 0) throw new Error("invalid visibility expiry");
  const event = {
    kind: "mine_observation_reported",
    eventId: requiredText(input.eventId, "event id"),
    observationId: requiredText(input.observationId, "observation id"),
    actorId: requiredText(input.actorId, "actor id"),
    regionId: requiredText(input.regionId, "region id"),
    resourceId: requiredText(input.resourceId, "resource id"),
    position: { x: input.x, y: input.y, precision: "approximate" },
    occurredAt: new Date(reportedAtMs).toISOString(),
    expiresAt: new Date(reportedAtMs + input.expiresAfterMs).toISOString(),
    visibilityPolicy: "caller_supplied_ttl",
    idempotencyKey,
  };
  if (observationReport(events, event.observationId)) throw new Error("observation already exists");
  return [...events, event];
}

export function appendMineSignal(events, input) {
  if (!Array.isArray(events)) throw new Error("invalid event ledger");
  const idempotencyKey = requiredText(input?.idempotencyKey, "idempotency key");
  if (events.some((event) => event.idempotencyKey === idempotencyKey)) return events;
  if (events.some((event) => event.eventId === input?.eventId)) throw new Error("event already exists");
  const observationId = requiredText(input.observationId, "observation id");
  const report = observationReport(events, observationId);
  if (!report) throw new Error("unknown observation");
  const actorId = requiredText(input.actorId, "actor id");
  if (actorId === report.actorId) throw new Error("signal requires an independent actor");
  if (!['confirm', 'reject'].includes(input.signal)) throw new Error("invalid signal");
  if (events.some((event) => event.kind === "mine_observation_signaled" && event.observationId === observationId && event.actorId === actorId)) throw new Error("actor already signaled");
  const occurredAtMs = timestamp(input.occurredAt, "signal timestamp");
  if (occurredAtMs < Date.parse(report.occurredAt) || occurredAtMs >= Date.parse(report.expiresAt)) throw new Error("observation is not live");
  return [...events, {
    kind: "mine_observation_signaled",
    eventId: requiredText(input.eventId, "event id"),
    observationId,
    actorId,
    signal: input.signal,
    occurredAt: new Date(occurredAtMs).toISOString(),
    idempotencyKey,
  }];
}

export function projectMineObservation(events, observationId, now) {
  if (!Array.isArray(events)) throw new Error("invalid event ledger");
  const report = observationReport(events, observationId);
  if (!report) throw new Error("unknown observation");
  const nowMs = timestamp(now, "projection timestamp");
  const signals = events.filter((event) => event.kind === "mine_observation_signaled" && event.observationId === observationId);
  return {
    observationId,
    regionId: report.regionId,
    resourceId: report.resourceId,
    position: report.position,
    reportedAt: report.occurredAt,
    expiresAt: report.expiresAt,
    status: nowMs >= Date.parse(report.expiresAt) ? "expired" : "live",
    dataClass: "community_observation",
    signals: {
      confirm: signals.filter((event) => event.signal === "confirm").length,
      reject: signals.filter((event) => event.signal === "reject").length,
    },
  };
}

export function liveMineObservations(events, now) {
  const observationIds = events
    .filter((event) => event.kind === "mine_observation_reported")
    .map((event) => event.observationId);
  return observationIds
    .map((observationId) => projectMineObservation(events, observationId, now))
    .filter((observation) => observation.status === "live");
}
