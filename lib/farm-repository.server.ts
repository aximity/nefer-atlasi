import { and, desc, eq } from "drizzle-orm";
import { getDb, getRawDb } from "../db";
import {
  farmRouteTemplates,
  farmSessions,
  farmYields,
} from "../db/schema";
import { sha256Hex } from "./contribution-core.mjs";
import { calculateFarmSession, validateFarmSession } from "./farm-core.mjs";
import { buildMiningContributionPayload } from "./route-core.mjs";

async function ownerHash(email: string) {
  return sha256Hex(email.trim().toLocaleLowerCase("en-US"));
}

export async function listFarmSessions(email: string) {
  const hash = await ownerHash(email);
  const db = await getDb();
  const sessions = await db
    .select()
    .from(farmSessions)
    .where(eq(farmSessions.ownerEmailHash, hash))
    .orderBy(desc(farmSessions.observedAt), desc(farmSessions.createdAt))
    .limit(200);
  if (!sessions.length) return [];
  const yields = await db
    .select({
      id: farmYields.id,
      sessionId: farmYields.sessionId,
      material: farmYields.material,
      grade: farmYields.grade,
      quantity: farmYields.quantity,
      unitGamePrice: farmYields.unitGamePrice,
      unitTlKurus: farmYields.unitTlKurus,
    })
    .from(farmYields)
    .innerJoin(farmSessions, eq(farmYields.sessionId, farmSessions.id))
    .where(eq(farmSessions.ownerEmailHash, hash));
  return sessions.map((session) => {
    const sessionYields = yields.filter((row) => row.sessionId === session.id);
    return {
      ...session,
      ownerEmailHash: undefined,
      yields: sessionYields,
      metrics: calculateFarmSession({ ...session, yields: sessionYields }),
    };
  });
}

export async function createFarmSession(email: string, rawInput: unknown) {
  const input = validateFarmSession(rawInput);
  const hash = await ownerHash(email);
  if (input.routeTemplateId) {
    const db = await getDb();
    const [route] = await db
      .select({ id: farmRouteTemplates.id })
      .from(farmRouteTemplates)
      .where(
        and(
          eq(farmRouteTemplates.id, input.routeTemplateId),
          eq(farmRouteTemplates.ownerEmailHash, hash),
          eq(farmRouteTemplates.status, "active"),
        ),
      )
      .limit(1);
    if (!route) throw new Error("Rota şablonu geçersiz.");
  }
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const raw = await getRawDb();
  await raw.batch([
    raw
      .prepare(
        "INSERT INTO farm_sessions (id, owner_email_hash, server, region, route_name, profession, observed_at, duration_minutes, node_count, booster_profile, game_cost, tl_cost_kurus, notes, route_template_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)",
      )
      .bind(
        sessionId,
        hash,
        input.server,
        input.region,
        input.routeName,
        input.profession,
        input.observedAt,
        input.durationMinutes,
        input.nodeCount,
        input.boosterProfile,
        input.gameCost,
        input.tlCostKurus,
        input.notes || null,
        input.routeTemplateId,
        now,
        now,
      ),
    ...input.yields.map((entry) =>
      raw
        .prepare(
          "INSERT INTO farm_yields (id, session_id, material, grade, quantity, unit_game_price, unit_tl_kurus, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          crypto.randomUUID(),
          sessionId,
          entry.material,
          entry.grade,
          entry.quantity,
          entry.unitGamePrice,
          entry.unitTlKurus,
          now,
        ),
    ),
  ]);
  return (await listFarmSessions(email)).find((session) => session.id === sessionId) ?? null;
}

export async function submitFarmSessionForReview(
  email: string,
  actorLabel: string,
  id: string,
) {
  const hash = await ownerHash(email);
  const db = await getDb();
  const [session] = await db
    .select()
    .from(farmSessions)
    .where(and(eq(farmSessions.id, id), eq(farmSessions.ownerEmailHash, hash)))
    .limit(1);
  if (!session) return null;
  if (session.status !== "active") throw new Error("Arşivlenmiş tur doğrulamaya gönderilemez.");
  if (session.submittedContributionId) throw new Error("Bu tur zaten doğrulama kuyruğunda.");
  const sessionYields = await db
    .select({
      material: farmYields.material,
      grade: farmYields.grade,
      quantity: farmYields.quantity,
    })
    .from(farmYields)
    .where(eq(farmYields.sessionId, id));
  const payload = buildMiningContributionPayload({ ...session, yields: sessionYields }, actorLabel);
  const payloadJson = JSON.stringify(payload);
  const contributionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const raw = await getRawDb();
  await raw.batch([
    raw
      .prepare(
        "INSERT INTO contributions (id, receipt_token_hash, type, subject, server, observed_at, payload_json, payload_hash, client_token_hash, source_count, contributor_alias, contact_private, verification_status, publication_status, upload_status, created_at, updated_at) VALUES (?, ?, 'mining_run', ?, ?, ?, ?, ?, ?, 1, ?, NULL, 'draft', 'queued', 'complete', ?, ?)",
      )
      .bind(
        contributionId,
        await sha256Hex(crypto.randomUUID()),
        payload.details.subject,
        session.server,
        session.observedAt,
        payloadJson,
        await sha256Hex(payloadJson),
        await sha256Hex(`farm-session:${hash}`),
        actorLabel.slice(0, 40),
        now,
        now,
      ),
    raw
      .prepare(
        "INSERT INTO contribution_events (id, contribution_id, action, actor_label, actor_email_hash, from_verification, to_verification, from_publication, to_publication, note, created_at) VALUES (?, ?, 'field_session_submit', ?, ?, NULL, 'draft', NULL, 'queued', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        contributionId,
        actorLabel.slice(0, 80),
        hash,
        "Saha Operasyonu kaydından oluşturuldu; bağımsız ikinci kaynak gerekir.",
        now,
      ),
    raw
      .prepare(
        "UPDATE farm_sessions SET submitted_contribution_id = ?, updated_at = ? WHERE id = ? AND owner_email_hash = ? AND submitted_contribution_id IS NULL",
      )
      .bind(contributionId, now, id, hash),
  ]);
  return { id, submittedContributionId: contributionId };
}

export async function setFarmSessionStatus(
  email: string,
  id: string,
  status: "active" | "archived",
) {
  const hash = await ownerHash(email);
  const db = await getDb();
  const [current] = await db
    .select({ id: farmSessions.id })
    .from(farmSessions)
    .where(and(eq(farmSessions.id, id), eq(farmSessions.ownerEmailHash, hash)))
    .limit(1);
  if (!current) return null;
  await db
    .update(farmSessions)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(and(eq(farmSessions.id, id), eq(farmSessions.ownerEmailHash, hash)));
  return { id, status };
}
