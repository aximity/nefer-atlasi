export interface MineObservationReported {
  kind: "mine_observation_reported";
  eventId: string;
  observationId: string;
  actorId: string;
  regionId: string;
  resourceId: string;
  position: { x: number; y: number; precision: "approximate" };
  occurredAt: string;
  expiresAt: string;
  visibilityPolicy: "caller_supplied_ttl";
  idempotencyKey: string;
}

export interface MineObservationSignaled {
  kind: "mine_observation_signaled";
  eventId: string;
  observationId: string;
  actorId: string;
  signal: "confirm" | "reject";
  occurredAt: string;
  idempotencyKey: string;
}

export type MineObservationEvent = MineObservationReported | MineObservationSignaled;

export interface MineObservationView {
  observationId: string;
  regionId: string;
  resourceId: string;
  position: MineObservationReported["position"];
  reportedAt: string;
  expiresAt: string;
  status: "live" | "expired";
  dataClass: "community_observation";
  signals: { confirm: number; reject: number };
}
