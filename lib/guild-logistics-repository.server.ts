import { and, asc, eq } from "drizzle-orm";
import { getDb, getRawDb } from "../db";
import {
  guildLogisticsBoards,
  guildLogisticsBoosters,
  guildLogisticsContributions,
  guildLogisticsExpenses,
  guildLogisticsGoals,
} from "../db/schema";
import { calculateGuildGoalProgress } from "./guild-logistics-core.mjs";

export async function getGuildBoardByCode(publicCode: string) {
  const db = await getDb();
  const board = await db.select({
    id: guildLogisticsBoards.id,
    publicCode: guildLogisticsBoards.publicCode,
    guildName: guildLogisticsBoards.guildName,
    server: guildLogisticsBoards.server,
    weekStart: guildLogisticsBoards.weekStart,
    note: guildLogisticsBoards.note,
    status: guildLogisticsBoards.status,
    createdAt: guildLogisticsBoards.createdAt,
    updatedAt: guildLogisticsBoards.updatedAt,
  }).from(guildLogisticsBoards).where(eq(guildLogisticsBoards.publicCode, publicCode)).limit(1);
  if (!board[0]) return null;
  const [goals, contributions, expenses, boosters] = await Promise.all([
    db.select().from(guildLogisticsGoals).where(eq(guildLogisticsGoals.boardId, board[0].id)).orderBy(asc(guildLogisticsGoals.orderIndex)),
    db.select({
      id: guildLogisticsContributions.id,
      goalId: guildLogisticsContributions.goalId,
      contributorAlias: guildLogisticsContributions.contributorAlias,
      amount: guildLogisticsContributions.amount,
      note: guildLogisticsContributions.note,
      status: guildLogisticsContributions.status,
      createdAt: guildLogisticsContributions.createdAt,
    }).from(guildLogisticsContributions).where(and(eq(guildLogisticsContributions.boardId, board[0].id), eq(guildLogisticsContributions.status, "active"))).orderBy(asc(guildLogisticsContributions.createdAt)),
    db.select().from(guildLogisticsExpenses).where(eq(guildLogisticsExpenses.boardId, board[0].id)).orderBy(asc(guildLogisticsExpenses.createdAt)),
    db.select().from(guildLogisticsBoosters).where(eq(guildLogisticsBoosters.boardId, board[0].id)).orderBy(asc(guildLogisticsBoosters.createdAt)),
  ]);
  return {
    ...board[0],
    goals: goals.map((goal) => ({ ...goal, progress: calculateGuildGoalProgress(goal, contributions) })),
    contributions,
    expenses,
    boosters,
    totals: {
      gameExpense: expenses.reduce((sum, row) => sum + row.gameAmount, 0),
      contributionCount: contributions.length,
      completedGoals: goals.filter((goal) => calculateGuildGoalProgress(goal, contributions).percent >= 100).length,
    },
  };
}

export async function createGuildBoard(row: {
  id: string; publicCode: string; managerTokenHash: string; clientTokenHash: string;
  guildName: string; server: string; weekStart: string; note: string;
  goals: Array<{ id: string; title: string; category: string; targetAmount: number; unit: string; assignedRole: string; orderIndex: number }>;
}) {
  const db = await getDb();
  await db.insert(guildLogisticsBoards).values({
    id: row.id, publicCode: row.publicCode, managerTokenHash: row.managerTokenHash,
    clientTokenHash: row.clientTokenHash, guildName: row.guildName, server: row.server,
    weekStart: row.weekStart, note: row.note || null,
  });
  await db.insert(guildLogisticsGoals).values(row.goals.map((goal) => ({ ...goal, boardId: row.id })));
}

export async function guildBoardSubmissionCount(clientTokenHash: string) {
  const d1 = await getRawDb();
  const cutoff = new Date(Date.now() - 24 * 60 * 60_000).toISOString().slice(0, 19).replace("T", " ");
  const row = await d1.prepare("SELECT COUNT(*) AS value FROM guild_logistics_boards WHERE client_token_hash = ? AND created_at >= ?").bind(clientTokenHash, cutoff).first<{ value: number }>();
  return Number(row?.value ?? 0);
}

export async function guildContributionSubmissionCount(clientTokenHash: string) {
  const d1 = await getRawDb();
  const cutoff = new Date(Date.now() - 15 * 60_000).toISOString().slice(0, 19).replace("T", " ");
  const row = await d1.prepare("SELECT COUNT(*) AS value FROM guild_logistics_contributions WHERE client_token_hash = ? AND created_at >= ?").bind(clientTokenHash, cutoff).first<{ value: number }>();
  return Number(row?.value ?? 0);
}

export async function createGuildContribution(row: {
  id: string; boardId: string; goalId: string; receiptTokenHash: string; clientTokenHash: string;
  contributorAlias: string; amount: number; note: string;
}) {
  const db = await getDb();
  const goal = await db.select({ id: guildLogisticsGoals.id }).from(guildLogisticsGoals).where(and(eq(guildLogisticsGoals.id, row.goalId), eq(guildLogisticsGoals.boardId, row.boardId), eq(guildLogisticsGoals.status, "active"))).limit(1);
  if (!goal[0]) return false;
  await db.insert(guildLogisticsContributions).values({ ...row, note: row.note || null });
  return true;
}

export async function retractGuildContribution(receiptTokenHash: string) {
  const db = await getDb();
  const result = await db.update(guildLogisticsContributions).set({ status: "withdrawn" }).where(and(eq(guildLogisticsContributions.receiptTokenHash, receiptTokenHash), eq(guildLogisticsContributions.status, "active"))).returning({ id: guildLogisticsContributions.id });
  return result.length > 0;
}

export async function findManagedGuildBoard(publicCode: string, managerTokenHash: string) {
  const db = await getDb();
  const rows = await db.select({ id: guildLogisticsBoards.id, status: guildLogisticsBoards.status }).from(guildLogisticsBoards).where(and(eq(guildLogisticsBoards.publicCode, publicCode), eq(guildLogisticsBoards.managerTokenHash, managerTokenHash))).limit(1);
  return rows[0] ?? null;
}

export async function addGuildGoal(boardId: string, goal: { title: string; category: string; targetAmount: number; unit: string; assignedRole: string }) {
  const db = await getDb();
  const count = await db.select({ id: guildLogisticsGoals.id }).from(guildLogisticsGoals).where(eq(guildLogisticsGoals.boardId, boardId));
  if (count.length >= 12) return false;
  await db.insert(guildLogisticsGoals).values({ id: crypto.randomUUID(), boardId, ...goal, orderIndex: count.length });
  return true;
}

export async function addGuildExpense(boardId: string, row: { title: string; category: string; gameAmount: number; note: string }) {
  const db = await getDb();
  await db.insert(guildLogisticsExpenses).values({ id: crypto.randomUUID(), boardId, ...row, note: row.note || null });
}

export async function addGuildBooster(boardId: string, row: { title: string; scope: string; quantity: number; status: string; sponsorAlias: string; note: string }) {
  const db = await getDb();
  await db.insert(guildLogisticsBoosters).values({ id: crypto.randomUUID(), boardId, ...row, sponsorAlias: row.sponsorAlias || null, note: row.note || null });
}

export async function setGuildBoosterStatus(boardId: string, boosterId: string, status: string) {
  const db = await getDb();
  const result = await db.update(guildLogisticsBoosters).set({ status, updatedAt: new Date().toISOString() }).where(and(eq(guildLogisticsBoosters.id, boosterId), eq(guildLogisticsBoosters.boardId, boardId))).returning({ id: guildLogisticsBoosters.id });
  return result.length > 0;
}

export async function closeGuildBoard(boardId: string) {
  const db = await getDb();
  await db.update(guildLogisticsBoards).set({ status: "closed", updatedAt: new Date().toISOString() }).where(eq(guildLogisticsBoards.id, boardId));
}
