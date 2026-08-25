import {
  and,
  count,
  desc,
  eq,
  like,
  ne,
  type SQL,
} from "drizzle-orm";
import { getDb, getRawDb } from "../db";
import {
  contributionEvents,
  contributionFiles,
  contributions,
} from "../db/schema";
import { sha256Hex } from "./contribution-core.mjs";
import {
  MODERATION_ACTIONS,
  resolveModerationTransition,
  safePublishedDetails,
  type ModerationAction,
} from "./moderation-core.mjs";

export const moderationActions = MODERATION_ACTIONS;
export type { ModerationAction };

const listFields = {
  id: contributions.id,
  type: contributions.type,
  subject: contributions.subject,
  server: contributions.server,
  observedAt: contributions.observedAt,
  sourceCount: contributions.sourceCount,
  verificationStatus: contributions.verificationStatus,
  publicationStatus: contributions.publicationStatus,
  uploadStatus: contributions.uploadStatus,
  createdAt: contributions.createdAt,
  updatedAt: contributions.updatedAt,
};

export async function listAdminContributions({
  filter = "queued",
  kind = "all",
  query = "",
}: {
  filter?: string;
  kind?: string;
  query?: string;
}) {
  const db = await getDb();
  const conditions: SQL[] = [];
  const verificationFilters = new Set([
    "draft",
    "single_source",
    "cross_verified",
    "conflicted",
    "rejected",
  ]);
  if (filter === "queued") {
    conditions.push(eq(contributions.publicationStatus, "queued"));
  } else if (filter === "published") {
    conditions.push(eq(contributions.publicationStatus, "published"));
  } else if (filter === "archived") {
    conditions.push(eq(contributions.publicationStatus, "archived"));
  } else if (verificationFilters.has(filter)) {
    conditions.push(eq(contributions.verificationStatus, filter));
  }
  if (
    ["item_evidence", "mining_run", "market_price", "ability_media"].includes(
      kind,
    )
  ) {
    conditions.push(eq(contributions.type, kind));
  }
  const search = query.trim().slice(0, 80);
  if (search) conditions.push(like(contributions.subject, "%" + search + "%"));

  const rows = await db
    .select(listFields)
    .from(contributions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(contributions.createdAt))
    .limit(100);
  const verificationCounts = await db
    .select({
      status: contributions.verificationStatus,
      value: count(),
    })
    .from(contributions)
    .groupBy(contributions.verificationStatus);
  const publicationCounts = await db
    .select({
      status: contributions.publicationStatus,
      value: count(),
    })
    .from(contributions)
    .groupBy(contributions.publicationStatus);

  return {
    rows,
    counts: {
      verification: Object.fromEntries(
        verificationCounts.map((row) => [row.status, Number(row.value)]),
      ),
      publication: Object.fromEntries(
        publicationCounts.map((row) => [row.status, Number(row.value)]),
      ),
    },
  };
}

export async function getAdminContribution(id: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(contributions)
    .where(eq(contributions.id, id))
    .limit(1);
  if (!row) return null;
  const files = await db
    .select({
      id: contributionFiles.id,
      originalName: contributionFiles.originalName,
      mediaKind: contributionFiles.mediaKind,
      mimeType: contributionFiles.mimeType,
      byteSize: contributionFiles.byteSize,
      sha256: contributionFiles.sha256,
      createdAt: contributionFiles.createdAt,
    })
    .from(contributionFiles)
    .where(eq(contributionFiles.contributionId, id));
  const events = await db
    .select({
      id: contributionEvents.id,
      action: contributionEvents.action,
      actorLabel: contributionEvents.actorLabel,
      fromVerification: contributionEvents.fromVerification,
      toVerification: contributionEvents.toVerification,
      fromPublication: contributionEvents.fromPublication,
      toPublication: contributionEvents.toPublication,
      note: contributionEvents.note,
      createdAt: contributionEvents.createdAt,
    })
    .from(contributionEvents)
    .where(eq(contributionEvents.contributionId, id))
    .orderBy(desc(contributionEvents.createdAt));
  const similar = await db
    .select(listFields)
    .from(contributions)
    .where(
      and(
        eq(contributions.subject, row.subject),
        ne(contributions.id, row.id),
      ),
    )
    .orderBy(desc(contributions.createdAt))
    .limit(6);
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(row.payloadJson) as Record<string, unknown>;
  } catch {
    payload = { error: "Payload okunamadı." };
  }
  return {
    contribution: {
      ...row,
      payload,
      payloadJson: undefined,
      receiptTokenHash: undefined,
      clientTokenHash: undefined,
      payloadHash: undefined,
    },
    files,
    events,
    similar,
  };
}

export async function getAdminFile(fileId: string) {
  const db = await getDb();
  const [file] = await db
    .select()
    .from(contributionFiles)
    .where(eq(contributionFiles.id, fileId))
    .limit(1);
  return file ?? null;
}

export async function moderateContribution({
  id,
  action,
  note,
  independenceConfirmed,
  actorLabel,
  actorEmail,
}: {
  id: string;
  action: ModerationAction;
  note: string;
  independenceConfirmed: boolean;
  actorLabel: string;
  actorEmail: string;
}) {
  const db = await getDb();
  const [current] = await db
    .select({
      id: contributions.id,
      verificationStatus: contributions.verificationStatus,
      publicationStatus: contributions.publicationStatus,
      sourceCount: contributions.sourceCount,
      publishedAt: contributions.publishedAt,
    })
    .from(contributions)
    .where(eq(contributions.id, id))
    .limit(1);
  if (!current) return null;
  const next = resolveModerationTransition({
    action,
    current,
    independenceConfirmed,
    note,
  });
  const now = new Date().toISOString();
  const publishedAt =
    action === "publish"
      ? now
      : ["unpublish", "reject", "mark_conflict"].includes(action)
        ? null
        : current.publishedAt;
  const actorHash = await sha256Hex(actorEmail.toLocaleLowerCase("en-US"));
  const raw = await getRawDb();
  await raw.batch([
    raw
      .prepare(
        "UPDATE contributions SET verification_status = ?, publication_status = ?, moderation_note = ?, reviewed_at = ?, published_at = ?, updated_at = ? WHERE id = ?",
      )
      .bind(
        next.verification,
        next.publication,
        next.note || null,
        now,
        publishedAt,
        now,
        id,
      ),
    raw
      .prepare(
        "INSERT INTO contribution_events (id, contribution_id, action, actor_label, actor_email_hash, from_verification, to_verification, from_publication, to_publication, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        id,
        action,
        actorLabel.slice(0, 100),
        actorHash,
        current.verificationStatus,
        next.verification,
        current.publicationStatus,
        next.publication,
        next.note || null,
        now,
      ),
  ]);
  return getAdminContribution(id);
}

export async function listPublishedContributions(limit = 24) {
  const db = await getDb();
  const rows = await db
    .select({
      id: contributions.id,
      type: contributions.type,
      subject: contributions.subject,
      server: contributions.server,
      observedAt: contributions.observedAt,
      sourceCount: contributions.sourceCount,
      payloadJson: contributions.payloadJson,
      publishedAt: contributions.publishedAt,
    })
    .from(contributions)
    .where(
      and(
        eq(contributions.verificationStatus, "cross_verified"),
        eq(contributions.publicationStatus, "published"),
      ),
    )
    .orderBy(desc(contributions.publishedAt))
    .limit(Math.min(Math.max(limit, 1), 200));
  return rows.map((row) => {
    let details: Record<string, unknown> = {};
    try {
      const payload = JSON.parse(row.payloadJson) as {
        details?: Record<string, unknown>;
      };
      details = payload.details ?? {};
    } catch {
      details = {};
    }
    return {
      id: row.id,
      type: row.type,
      subject: row.subject,
      server: row.server,
      observedAt: row.observedAt,
      sourceCount: row.sourceCount,
      publishedAt: row.publishedAt,
      details: safePublishedDetails(row.type, details),
    };
  });
}
