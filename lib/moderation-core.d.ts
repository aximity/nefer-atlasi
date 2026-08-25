export const MODERATION_ACTIONS: readonly [
  "accept_single",
  "verify_cross",
  "mark_conflict",
  "reject",
  "publish",
  "unpublish",
  "return_draft",
  "save_note",
];
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];
export function resolveModerationTransition(input: {
  action: ModerationAction;
  current: {
    verificationStatus: string;
    publicationStatus: string;
    sourceCount: number;
  };
  independenceConfirmed?: boolean;
  note?: string;
}): {
  verification: string;
  publication: string;
  note: string;
};
export function safePublishedDetails(
  kind: string,
  details: Record<string, unknown>,
): Record<string, unknown>;
