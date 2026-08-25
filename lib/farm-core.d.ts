export const FARM_PROFESSIONS: string[];
export const FARM_BOOSTERS: string[];
export const FARM_GRADES: string[];
export type FarmYield = {material:string;grade:string;quantity:number;unitGamePrice:number|null;unitTlKurus:number|null};
export type FarmSessionInput = {server:string;region:string;routeName:string;profession:string;observedAt:string;durationMinutes:number;nodeCount:number;boosterProfile:string;gameCost:number;tlCostKurus:number;notes:string;yields:FarmYield[]};
export function validateFarmSession(raw: unknown): FarmSessionInput;
export function calculateFarmSession(session: Record<string, unknown> & {yields?:FarmYield[]}): Record<string, number>;
export function summarizeFarmSessions(sessions: Array<Record<string, unknown> & {yields?:FarmYield[]}>): Record<string, number|string>;
export function compareBoosterProfiles(sessions: Array<Record<string, unknown> & {yields?:FarmYield[]}>): Array<Record<string, number|string>>;
