import type { MineObservationEvent, MineObservationView } from "./mine-observation-types";

export interface MineObservationRepository {
  append(event: MineObservationEvent): Promise<"inserted" | "duplicate">;
  byIdempotencyKey(idempotencyKey: string): Promise<MineObservationEvent | null>;
  forObservation(observationId: string): Promise<MineObservationEvent[]>;
  liveEvents(now: string): Promise<MineObservationEvent[]>;
}

export interface MineApiResult {
  status: number;
  body: Record<string, unknown> & { observations?: MineObservationView[] };
}

export const MINE_OBSERVATION_POLICY: Readonly<{
  visibilityTtlMs: number;
  writeLimit: number;
  writeWindowMs: number;
}>;

export function listMineObservations(repository: MineObservationRepository, now?: string): Promise<MineApiResult>;
export function validateMineObservationWriteRequest(request: Request): MineApiResult | null;
export function writeMineObservation(
  repository: MineObservationRepository,
  actorId: string | null,
  payload: unknown,
  options?: {
    now?: string;
    randomUUID?: () => string;
    allowedRegionIds?: Set<string>;
    allowedResourceIds?: Set<string>;
  },
): Promise<MineApiResult>;
