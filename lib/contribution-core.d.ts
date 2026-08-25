export const CONTRIBUTION_KINDS: readonly [
  "item_evidence",
  "mining_run",
  "market_price",
  "ability_media",
];

export const CONTRIBUTION_LIMITS: {
  payloadBytes: number;
  requestBytes: number;
  imageBytes: number;
  videoBytes: number;
};

export type ContributionKind = (typeof CONTRIBUTION_KINDS)[number];

export interface ValidatedContribution {
  kind: ContributionKind;
  common: {
    server: string;
    observedAt: string;
    alias: string;
    contact: string;
    notes: string;
    sourceUrl: string;
    secondarySourceUrl: string;
    declaration: boolean;
    clientToken: string;
    startedAt: number;
    website: string;
  };
  details: Record<string, string | number | boolean | null>;
}

export class ContributionValidationError extends Error {
  field: string;
}

export function validateContributionPayload(
  raw: unknown,
  options?: { hasFile?: boolean; now?: number },
): ValidatedContribution;
export function storagePayload(validated: ValidatedContribution): {
  kind: ContributionKind;
  common: Record<string, unknown>;
  details: Record<string, unknown>;
};
export function sniffEvidenceFile(
  bytes: Uint8Array | ArrayBuffer,
  declaredType: string,
  kind: ContributionKind,
): { mimeType: string; mediaKind: "image" | "video"; maxBytes: number };
export function safeOriginalName(value: unknown): string;
export function makeReceiptToken(randomBytes?: Uint8Array): string;
export function normalizeReceiptToken(value: unknown): string;
export function stableStringify(value: unknown): string;
export function sha256Hex(
  value: string | Uint8Array | ArrayBuffer,
): Promise<string>;
