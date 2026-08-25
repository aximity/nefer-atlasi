import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateGuildGoalProgress,
  validateGuildBoard,
  validateGuildContribution,
  validateGuildManagement,
} from "../lib/guild-logistics-core.mjs";

const now = new Date("2026-08-25T10:00:00Z").getTime();
const baseGoal = { title: "Xenotim hedefi", category: "Malzeme", targetAmount: 50, unit: "adet", assignedRole: "Farm ekibi" };

test("haftalık lonca planı yapılandırılmış hedeflerle doğrulanır", () => {
  const result = validateGuildBoard({ guildName: "Neferler", server: "Kıyametin Öncüleri", weekStart: "2026-08-24", note: "Büyük Hol öncelikli", goals: [baseGoal], clientToken: "a".repeat(32), website: "" }, { now });
  assert.equal(result.goals[0].targetAmount, 50);
  assert.equal(result.server, "Kıyametin Öncüleri");
});

test("lonca masası telefon ve bağlantı yayımlamaz", () => {
  const base = { guildName: "Neferler", server: "Kıyametin Öncüleri", weekStart: "2026-08-24", note: "", goals: [baseGoal], clientToken: "a".repeat(32), website: "" };
  assert.throws(() => validateGuildBoard({ ...base, note: "Ara +90 555 111 22 33" }, { now }), /Telefon numarası/);
  assert.throws(() => validateGuildBoard({ ...base, note: "https:\/\/discord.gg\/abc" }, { now }), /Bağlantı/);
});

test("geri çekilen katkı ilerlemeye girmez ve yüzde hedefi aşmaz", () => {
  const goal = { id: "goal-1", targetAmount: 10 };
  const progress = calculateGuildGoalProgress(goal, [
    { goalId: "goal-1", amount: 15, status: "active" },
    { goalId: "goal-1", amount: 20, status: "withdrawn" },
  ]);
  assert.deepEqual(progress, { collected: 15, remaining: 0, percent: 100 });
});

test("katkı ve yönetim işlemleri plana bağlı anahtarlarla doğrulanır", () => {
  const contribution = validateGuildContribution({ code: "na-lonca-abc234", goalId: "123e4567-e89b-12d3-a456-426614174000", contributorAlias: "Nefer_1", amount: 4, note: "", clientToken: "a".repeat(32), website: "" });
  assert.equal(contribution.code, "NA-LONCA-ABC234");
  const management = validateGuildManagement({ code: "NA-LONCA-ABC234", managerToken: "NA-LM-123E4567-E89B-12D3-A456-426614174000", action: "add-expense", title: "Artırıcı", category: "Artırıcı", gameAmount: 250000, note: "" });
  assert.equal(management.action, "add-expense");
});
