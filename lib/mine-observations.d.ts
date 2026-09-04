export type MineObservationEvent = MineObservationReported | MineObservationSignaled;
export interface MineObservationReported {kind:"mine_observation_reported";eventId:string;observationId:string;actorId:string;regionId:string;resourceId:string;position:{x:number;y:number;precision:"approximate"};occurredAt:string;expiresAt:string;visibilityPolicy:"caller_supplied_ttl";idempotencyKey:string}
export interface MineObservationSignaled {kind:"mine_observation_signaled";eventId:string;observationId:string;actorId:string;signal:"confirm"|"reject";occurredAt:string;idempotencyKey:string}
export interface MineObservationView {observationId:string;regionId:string;resourceId:string;position:MineObservationReported["position"];reportedAt:string;expiresAt:string;status:"live"|"expired";dataClass:"community_observation";signals:{confirm:number;reject:number}}
export function appendMineObservation(events:MineObservationEvent[],input:{eventId:string;observationId:string;actorId:string;regionId:string;resourceId:string;x:number;y:number;reportedAt:string;expiresAfterMs:number;idempotencyKey:string}):MineObservationEvent[];
export function appendMineSignal(events:MineObservationEvent[],input:{eventId:string;observationId:string;actorId:string;signal:"confirm"|"reject";occurredAt:string;idempotencyKey:string}):MineObservationEvent[];
export function projectMineObservation(events:MineObservationEvent[],observationId:string,now:string):MineObservationView;
export function liveMineObservations(events:MineObservationEvent[],now:string):MineObservationView[];
