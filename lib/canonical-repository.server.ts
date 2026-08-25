import { and, desc, eq } from "drizzle-orm";
import { getDb, getRawDb } from "../db";
import {
  canonicalRecords,
  canonicalRevisions,
} from "../db/schema";
import { sha256Hex } from "./contribution-core.mjs";
import {
  assertMergeAllowed,
  contributionToCanonical,
  diffCanonical,
  publicCanonicalRecord,
} from "./canonical-core.mjs";
import { getAdminContribution } from "./contribution-moderation.server";
import { items, publishableStats } from "./catalog";

function parseData(value: string | null | undefined) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export async function getCanonicalMergePreview(contributionId: string) {
  const detail = await getAdminContribution(contributionId);
  if (!detail) return null;
  const proposal = contributionToCanonical(detail.contribution);
  const db = await getDb();
  const [current] = await db
    .select()
    .from(canonicalRecords)
    .where(
      and(
        eq(canonicalRecords.entityType, proposal.entityType),
        eq(canonicalRecords.entityKey, proposal.entityKey),
      ),
    )
    .limit(1);
  const history = current
    ? await db
        .select({
          id: canonicalRevisions.id,
          action: canonicalRevisions.action,
          version: canonicalRevisions.version,
          actorLabel: canonicalRevisions.actorLabel,
          note: canonicalRevisions.note,
          createdAt: canonicalRevisions.createdAt,
        })
        .from(canonicalRevisions)
        .where(eq(canonicalRevisions.recordId, current.id))
        .orderBy(desc(canonicalRevisions.createdAt))
        .limit(8)
    : [];
  const staticItem =
    !current && proposal.entityType === "item"
      ? items.find(
          (item) =>
            item.name.toLocaleLowerCase("tr-TR") ===
              proposal.displayName.toLocaleLowerCase("tr-TR") &&
            item.class === proposal.data.className &&
            item.slot === proposal.data.slot,
        )
      : undefined;
  const baselineData = staticItem
    ? {
        name: staticItem.name,
        className: staticItem.class,
        slot: staticItem.slot,
        levelTier: staticItem.level == null ? undefined : String(staticItem.level),
        rarity: staticItem.rarity,
        acquisitionPlace: staticItem.acquisition,
        region: staticItem.region,
        boss: staticItem.boss,
        statLines: publishableStats(staticItem.id)
          .map((stat) => `${stat.attribute}: ${stat.value}`)
          .join("\n"),
      }
    : null;
  const currentData = current ? parseData(current.dataJson) : (baselineData ?? {});
  return {
    contribution: {
      id: detail.contribution.id,
      verificationStatus: detail.contribution.verificationStatus,
      publicationStatus: detail.contribution.publicationStatus,
    },
    target: {
      entityType: proposal.entityType,
      entityKey: proposal.entityKey,
      displayName: proposal.displayName,
    },
    current: current
      ? {
          id: current.id,
          version: current.version,
          active: current.active,
          data: currentData,
          updatedAt: current.updatedAt,
        }
      : null,
    baseline: baselineData
      ? { source: "static_catalog", data: baselineData }
      : null,
    proposed: proposal.data,
    changes: diffCanonical(currentData, proposal.data),
    history,
    canMerge:
      detail.contribution.verificationStatus === "cross_verified" &&
      detail.contribution.publicationStatus === "published",
    canRollback: Boolean(
      current?.active && history[0]?.action === "apply" && history[0]?.version === current.version,
    ),
  };
}

export async function applyCanonicalMerge({
  contributionId,
  expectedVersion,
  confirmed,
  note,
  actorLabel,
  actorEmail,
}: {
  contributionId: string;
  expectedVersion: number;
  confirmed: boolean;
  note: string;
  actorLabel: string;
  actorEmail: string;
}) {
  const preview = await getCanonicalMergePreview(contributionId);
  if (!preview) return null;
  assertMergeAllowed(
    {
      ...preview.contribution,
      type: "",
      subject: preview.target.displayName,
      server: "",
      observedAt: "",
    },
    {
      confirmed,
      expectedVersion,
      currentVersion: preview.current?.version ?? 0,
    },
  );
  if (!preview.changes.length && preview.current?.active) {
    throw new Error("Ana kayıtta uygulanacak yeni bir fark yok.");
  }
  const trimmedNote = note.trim().slice(0, 2000);
  if (trimmedNote.length < 3) {
    throw new Error("Birleştirme için kısa bir editör notu gerekir.");
  }
  const now = new Date().toISOString();
  const recordId = preview.current?.id ?? crypto.randomUUID();
  const nextVersion = (preview.current?.version ?? 0) + 1;
  const nextJson = JSON.stringify(preview.proposed);
  const previousJson = preview.current ? JSON.stringify(preview.current.data) : null;
  const actorHash = await sha256Hex(actorEmail.toLocaleLowerCase("en-US"));
  const raw = await getRawDb();
  const recordStatement = preview.current
    ? raw
        .prepare(
          "UPDATE canonical_records SET display_name = ?, data_json = ?, version = ?, active = 1, source_contribution_id = ?, updated_by_hash = ?, updated_at = ? WHERE id = ? AND version = ?",
        )
        .bind(
          preview.target.displayName,
          nextJson,
          nextVersion,
          contributionId,
          actorHash,
          now,
          recordId,
          expectedVersion,
        )
    : raw
        .prepare(
          "INSERT INTO canonical_records (id, entity_type, entity_key, display_name, data_json, version, active, source_contribution_id, updated_by_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)",
        )
        .bind(
          recordId,
          preview.target.entityType,
          preview.target.entityKey,
          preview.target.displayName,
          nextJson,
          nextVersion,
          contributionId,
          actorHash,
          now,
          now,
        );
  await raw.batch([
    recordStatement,
    raw
      .prepare(
        "INSERT INTO canonical_revisions (id, record_id, contribution_id, action, version, previous_data_json, next_data_json, previous_active, next_active, actor_label, actor_email_hash, note, created_at) VALUES (?, ?, ?, 'apply', ?, ?, ?, ?, 1, ?, ?, ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        recordId,
        contributionId,
        nextVersion,
        previousJson,
        nextJson,
        preview.current?.active ? 1 : 0,
        actorLabel.slice(0, 100),
        actorHash,
        trimmedNote,
        now,
      ),
    raw
      .prepare(
        "INSERT INTO contribution_events (id, contribution_id, action, actor_label, actor_email_hash, from_verification, to_verification, from_publication, to_publication, note, created_at) VALUES (?, ?, 'merge_apply', ?, ?, 'cross_verified', 'cross_verified', 'published', 'published', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        contributionId,
        actorLabel.slice(0, 100),
        actorHash,
        trimmedNote,
        now,
      ),
  ]);
  return getCanonicalMergePreview(contributionId);
}

export async function rollbackCanonicalMerge({
  contributionId,
  expectedVersion,
  confirmed,
  note,
  actorLabel,
  actorEmail,
}: {
  contributionId: string;
  expectedVersion: number;
  confirmed: boolean;
  note: string;
  actorLabel: string;
  actorEmail: string;
}) {
  const preview = await getCanonicalMergePreview(contributionId);
  if (!preview?.current) return null;
  if (!confirmed) throw new Error("Geri alma etkisini onaylamalısın.");
  if (preview.current.version !== expectedVersion) {
    throw new Error("Ana kayıt değişti. Güncel farkı yeniden yükle.");
  }
  if (!preview.canRollback) throw new Error("Bu sürüm güvenli biçimde geri alınamaz.");
  const noteValue = note.trim().slice(0, 2000);
  if (noteValue.length < 3) throw new Error("Geri alma gerekçesi gerekir.");
  const db = await getDb();
  const [last] = await db
    .select()
    .from(canonicalRevisions)
    .where(eq(canonicalRevisions.recordId, preview.current.id))
    .orderBy(desc(canonicalRevisions.createdAt))
    .limit(1);
  if (!last || last.action !== "apply" || last.version !== expectedVersion) {
    throw new Error("Geri alınabilir son uygulama bulunamadı.");
  }
  const previousData = parseData(last.previousDataJson);
  const nextVersion = expectedVersion + 1;
  const nextJson = JSON.stringify(previousData);
  const now = new Date().toISOString();
  const actorHash = await sha256Hex(actorEmail.toLocaleLowerCase("en-US"));
  const raw = await getRawDb();
  await raw.batch([
    raw
      .prepare(
        "UPDATE canonical_records SET data_json = ?, version = ?, active = ?, source_contribution_id = ?, updated_by_hash = ?, updated_at = ? WHERE id = ? AND version = ?",
      )
      .bind(
        nextJson,
        nextVersion,
        last.previousActive ? 1 : 0,
        contributionId,
        actorHash,
        now,
        preview.current.id,
        expectedVersion,
      ),
    raw
      .prepare(
        "INSERT INTO canonical_revisions (id, record_id, contribution_id, action, version, previous_data_json, next_data_json, previous_active, next_active, actor_label, actor_email_hash, note, created_at) VALUES (?, ?, ?, 'rollback', ?, ?, ?, 1, ?, ?, ?, ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        preview.current.id,
        contributionId,
        nextVersion,
        JSON.stringify(preview.current.data),
        nextJson,
        last.previousActive ? 1 : 0,
        actorLabel.slice(0, 100),
        actorHash,
        noteValue,
        now,
      ),
    raw
      .prepare(
        "INSERT INTO contribution_events (id, contribution_id, action, actor_label, actor_email_hash, from_verification, to_verification, from_publication, to_publication, note, created_at) VALUES (?, ?, 'merge_rollback', ?, ?, 'cross_verified', 'cross_verified', 'published', 'published', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        contributionId,
        actorLabel.slice(0, 100),
        actorHash,
        noteValue,
        now,
      ),
  ]);
  return getCanonicalMergePreview(contributionId);
}

export async function listPublicCanonicalRecords() {
  const db = await getDb();
  const rows = await db
    .select({
      id: canonicalRecords.id,
      entityType: canonicalRecords.entityType,
      entityKey: canonicalRecords.entityKey,
      displayName: canonicalRecords.displayName,
      dataJson: canonicalRecords.dataJson,
      version: canonicalRecords.version,
      updatedAt: canonicalRecords.updatedAt,
    })
    .from(canonicalRecords)
    .where(eq(canonicalRecords.active, true))
    .orderBy(desc(canonicalRecords.updatedAt))
    .limit(250);
  return rows.map((row) =>
    publicCanonicalRecord({ ...row, data: parseData(row.dataJson) }),
  );
}
