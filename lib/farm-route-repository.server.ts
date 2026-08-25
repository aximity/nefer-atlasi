import { and, asc, desc, eq } from "drizzle-orm";
import { getDb, getRawDb } from "../db";
import { farmRoutePoints, farmRouteTemplates } from "../db/schema";
import { sha256Hex } from "./contribution-core.mjs";
import { validateRouteTemplate } from "./route-core.mjs";

async function ownerHash(email: string) {
  return sha256Hex(email.trim().toLocaleLowerCase("en-US"));
}

export async function listFarmRoutes(email: string) {
  const hash = await ownerHash(email);
  const db = await getDb();
  const templates = await db
    .select()
    .from(farmRouteTemplates)
    .where(eq(farmRouteTemplates.ownerEmailHash, hash))
    .orderBy(desc(farmRouteTemplates.updatedAt))
    .limit(100);
  if (!templates.length) return [];
  const points = await db
    .select({
      id: farmRoutePoints.id,
      templateId: farmRoutePoints.templateId,
      orderIndex: farmRoutePoints.orderIndex,
      pointType: farmRoutePoints.pointType,
      label: farmRoutePoints.label,
      materialHint: farmRoutePoints.materialHint,
      xPermille: farmRoutePoints.xPermille,
      yPermille: farmRoutePoints.yPermille,
      notes: farmRoutePoints.notes,
    })
    .from(farmRoutePoints)
    .innerJoin(farmRouteTemplates, eq(farmRoutePoints.templateId, farmRouteTemplates.id))
    .where(eq(farmRouteTemplates.ownerEmailHash, hash))
    .orderBy(asc(farmRoutePoints.orderIndex));
  return templates.map((template) => ({
    ...template,
    ownerEmailHash: undefined,
    hasMap: Boolean(template.mapR2Key),
    mapR2Key: undefined,
    points: points.filter((point) => point.templateId === template.id),
  }));
}

export async function createFarmRoute(
  email: string,
  rawInput: unknown,
  map: { bytes: Uint8Array; mimeType: string },
) {
  const input = validateRouteTemplate(rawInput);
  const hash = await ownerHash(email);
  const templateId = crypto.randomUUID();
  const extension = map.mimeType === "image/png" ? "png" : map.mimeType === "image/webp" ? "webp" : "jpg";
  const mapR2Key = `farm-routes/${hash}/${templateId}/map.${extension}`;
  const now = new Date().toISOString();
  const { env } = await import("cloudflare:workers");
  await env.BUCKET.put(mapR2Key, map.bytes, {
    httpMetadata: { contentType: map.mimeType },
    customMetadata: { owner: hash, template: templateId },
  });
  try {
    const raw = await getRawDb();
    await raw.batch([
      raw
        .prepare(
          "INSERT INTO farm_route_templates (id, owner_email_hash, server, region, route_name, profession, default_booster, expected_minutes, notes, map_r2_key, map_mime_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)",
        )
        .bind(
          templateId,
          hash,
          input.server,
          input.region,
          input.routeName,
          input.profession,
          input.defaultBooster,
          input.expectedMinutes,
          input.notes || null,
          mapR2Key,
          map.mimeType,
          now,
          now,
        ),
      ...input.points.map((point) =>
        raw
          .prepare(
            "INSERT INTO farm_route_points (id, template_id, order_index, point_type, label, material_hint, x_permille, y_permille, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          )
          .bind(
            crypto.randomUUID(),
            templateId,
            point.orderIndex,
            point.pointType,
            point.label,
            point.materialHint || null,
            point.xPermille,
            point.yPermille,
            point.notes || null,
            now,
          ),
      ),
    ]);
  } catch (error) {
    await env.BUCKET.delete(mapR2Key);
    throw error;
  }
  return (await listFarmRoutes(email)).find((route) => route.id === templateId) ?? null;
}

export async function setFarmRouteStatus(
  email: string,
  id: string,
  status: "active" | "archived",
) {
  const hash = await ownerHash(email);
  const db = await getDb();
  const [current] = await db
    .select({ id: farmRouteTemplates.id })
    .from(farmRouteTemplates)
    .where(and(eq(farmRouteTemplates.id, id), eq(farmRouteTemplates.ownerEmailHash, hash)))
    .limit(1);
  if (!current) return null;
  await db
    .update(farmRouteTemplates)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(and(eq(farmRouteTemplates.id, id), eq(farmRouteTemplates.ownerEmailHash, hash)));
  return { id, status };
}

export async function getFarmRouteMap(email: string, id: string) {
  const hash = await ownerHash(email);
  const db = await getDb();
  const [route] = await db
    .select({ r2Key: farmRouteTemplates.mapR2Key, mimeType: farmRouteTemplates.mapMimeType })
    .from(farmRouteTemplates)
    .where(and(eq(farmRouteTemplates.id, id), eq(farmRouteTemplates.ownerEmailHash, hash)))
    .limit(1);
  return route?.r2Key && route.mimeType ? route : null;
}
