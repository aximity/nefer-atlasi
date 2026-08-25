import { and, desc, eq } from "drizzle-orm";
import { getDb, getRawDb } from "../db";
import { farmSessions, farmYields } from "../db/schema";
import { sha256Hex } from "./contribution-core.mjs";
import { calculateFarmSession, validateFarmSession } from "./farm-core.mjs";

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
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const raw = await getRawDb();
  await raw.batch([
    raw
      .prepare(
        "INSERT INTO farm_sessions (id, owner_email_hash, server, region, route_name, profession, observed_at, duration_minutes, node_count, booster_profile, game_cost, tl_cost_kurus, notes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)",
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
