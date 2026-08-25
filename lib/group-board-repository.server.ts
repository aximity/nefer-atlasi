import { and, eq, gt } from "drizzle-orm";
import { getDb, getRawDb } from "../db";
import { groupAnnouncements } from "../db/schema";

export async function listActiveGroupAnnouncements(nowIso = new Date().toISOString()) {
  const db = await getDb();
  const rows = await db.select({
    id: groupAnnouncements.id,
    server: groupAnnouncements.server,
    category: groupAnnouncements.category,
    region: groupAnnouncements.region,
    title: groupAnnouncements.title,
    rolesJson: groupAnnouncements.rolesJson,
    leaderAlias: groupAnnouncements.leaderAlias,
    channel: groupAnnouncements.channel,
    startAt: groupAnnouncements.startAt,
    expiresAt: groupAnnouncements.expiresAt,
    createdAt: groupAnnouncements.createdAt,
  }).from(groupAnnouncements).where(and(eq(groupAnnouncements.status, "active"), gt(groupAnnouncements.expiresAt, nowIso))).orderBy(groupAnnouncements.startAt).limit(100);
  return rows.map((row) => ({ ...row, roles: JSON.parse(row.rolesJson), rolesJson: undefined }));
}

export async function createGroupAnnouncement(row: {
  id: string; receiptTokenHash: string; clientTokenHash: string; server: string; category: string; region: string; title: string; roles: string[]; leaderAlias: string; channel: string; startAt: string; expiresAt: string;
}) {
  const db = await getDb();
  await db.insert(groupAnnouncements).values({ ...row, rolesJson: JSON.stringify(row.roles) });
}

export async function groupAnnouncementSubmissionCounts(clientTokenHash: string) {
  const d1 = await getRawDb();
  const now = Date.now();
  const sqlTime = (value: number) => new Date(value).toISOString().slice(0, 19).replace("T", " ");
  const [fifteen, day] = await Promise.all([
    d1.prepare("SELECT COUNT(*) AS value FROM group_announcements WHERE client_token_hash = ? AND created_at >= ?").bind(clientTokenHash, sqlTime(now - 15 * 60_000)).first<{ value: number }>(),
    d1.prepare("SELECT COUNT(*) AS value FROM group_announcements WHERE client_token_hash = ? AND created_at >= ?").bind(clientTokenHash, sqlTime(now - 24 * 60 * 60_000)).first<{ value: number }>(),
  ]);
  return { fifteenMinutes: Number(fifteen?.value ?? 0), day: Number(day?.value ?? 0) };
}

export async function cancelGroupAnnouncement(receiptTokenHash: string) {
  const db = await getDb();
  const result = await db.update(groupAnnouncements).set({ status: "cancelled", updatedAt: new Date().toISOString() }).where(and(eq(groupAnnouncements.receiptTokenHash, receiptTokenHash), eq(groupAnnouncements.status, "active"))).returning({ id: groupAnnouncements.id });
  return result.length > 0;
}
