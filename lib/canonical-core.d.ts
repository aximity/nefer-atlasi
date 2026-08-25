export type CanonicalContribution = {
  type: string;
  subject: string;
  server: string;
  observedAt: string;
  verificationStatus: string;
  publicationStatus: string;
  payload?: { details?: Record<string, unknown> };
};
export function canonicalSlug(value: unknown): string;
export function contributionToCanonical(contribution: CanonicalContribution): {
  entityType: string;
  entityKey: string;
  displayName: string;
  data: Record<string, unknown>;
};
export function diffCanonical(current: Record<string, unknown> | null, proposed: Record<string, unknown>): {field:string;before:unknown;after:unknown}[];
export function assertMergeAllowed(contribution: CanonicalContribution, input:{confirmed:boolean;expectedVersion:number;currentVersion:number}): void;
export function publicCanonicalRecord(row:{id:string;entityType:string;entityKey:string;displayName:string;version:number;updatedAt:string;data:Record<string,unknown>}): Record<string,unknown>;
