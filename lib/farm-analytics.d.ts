export type EvidenceLevel = { label: string; level: number; nextAt: number | null };
export function routeIdentity(session: Record<string, unknown>): string;
export function evidenceLevel(sessionCount: number): EvidenceLevel;
export function groupRoutePerformance(sessions: Array<Record<string, unknown>>): Array<Record<string, unknown> & { key:string; routeName:string; region:string; server:string; sessionCount:number; durationMinutes:number; nodeCount:number; totalQuantity:number; itemsPerHour:number; nodesPerHour:number; gamePerHour:number; tlKurusPerHour:number; gameCoverage:number; tlCoverage:number; evidence:EvidenceLevel; lastObservedAt:string }>;
export function summarizeMaterialPrices(sessions: Array<Record<string, unknown>>): Array<{ material:string; game:{count:number;latest:number;latestAt:string;median:number;min:number;max:number}|null; tlKurus:{count:number;latest:number;latestAt:string;median:number;min:number;max:number}|null }>;
export function projectRoutePerformance(performance: Record<string, unknown>, minutes: number): { minutes:number;items:number;nodes:number;game:number;tlKurus:number };
