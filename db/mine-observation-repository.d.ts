import type { MineObservationEvent } from "../lib/mine-observation-types";
import type { D1DatabaseClient } from "./d1-types";

export class D1MineObservationRepository {
  constructor(database: D1DatabaseClient);
  append(event: MineObservationEvent): Promise<"inserted" | "duplicate">;
  byIdempotencyKey(idempotencyKey: string): Promise<MineObservationEvent | null>;
  forObservation(observationId: string): Promise<MineObservationEvent[]>;
  liveEvents(now: string): Promise<MineObservationEvent[]>;
}
