import { and, count, eq, gte } from "drizzle-orm";
import { getDb } from "../db";
import { contributionFiles, contributions } from "../db/schema";

export interface NewContribution {
  id: string;
  receiptTokenHash: string;
  type: string;
  subject: string;
  server: string;
  observedAt: string;
  payloadJson: string;
  payloadHash: string;
  clientTokenHash: string;
  sourceCount: number;
  contributorAlias: string | null;
  contactPrivate: string | null;
  uploadStatus: "uploading" | "complete";
}

export interface NewContributionFile {
  id: string;
  contributionId: string;
  r2Key: string;
  originalName: string;
  mediaKind: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
}

const sqlTime = (timestamp: number) =>
  new Date(timestamp).toISOString().slice(0, 19).replace("T", " ");

export async function submissionCounts(
  clientTokenHash: string,
  now = Date.now(),
) {
  const db = await getDb();
  const fifteenMinutesAgo = sqlTime(now - 15 * 60 * 1000);
  const oneDayAgo = sqlTime(now - 24 * 60 * 60 * 1000);
  const [shortWindow] = await db
    .select({ value: count() })
    .from(contributions)
    .where(
      and(
        eq(contributions.clientTokenHash, clientTokenHash),
        gte(contributions.createdAt, fifteenMinutesAgo),
      ),
    );
  const [dayWindow] = await db
    .select({ value: count() })
    .from(contributions)
    .where(
      and(
        eq(contributions.clientTokenHash, clientTokenHash),
        gte(contributions.createdAt, oneDayAgo),
      ),
    );
  return {
    fifteenMinutes: Number(shortWindow?.value ?? 0),
    day: Number(dayWindow?.value ?? 0),
  };
}

export async function createContribution(input: NewContribution) {
  const db = await getDb();
  await db.insert(contributions).values(input);
}

export async function attachContributionFile(input: NewContributionFile) {
  const db = await getDb();
  await db.insert(contributionFiles).values(input);
  await db
    .update(contributions)
    .set({ uploadStatus: "complete", updatedAt: new Date().toISOString() })
    .where(eq(contributions.id, input.contributionId));
}

export async function markUploadFailed(
  contributionId: string,
  fileId?: string,
) {
  const db = await getDb();
  if (fileId) {
    await db.delete(contributionFiles).where(eq(contributionFiles.id, fileId));
  }
  await db
    .update(contributions)
    .set({ uploadStatus: "upload_failed", updatedAt: new Date().toISOString() })
    .where(eq(contributions.id, contributionId));
}

export async function getContributionStatus(receiptTokenHash: string) {
  const db = await getDb();
  const [row] = await db
    .select({
      type: contributions.type,
      verificationStatus: contributions.verificationStatus,
      publicationStatus: contributions.publicationStatus,
      uploadStatus: contributions.uploadStatus,
      createdAt: contributions.createdAt,
      updatedAt: contributions.updatedAt,
    })
    .from(contributions)
    .where(eq(contributions.receiptTokenHash, receiptTokenHash))
    .limit(1);
  return row ?? null;
}
