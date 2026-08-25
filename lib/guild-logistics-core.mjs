export const GUILD_GOAL_CATEGORIES = ["Malzeme", "Oyun parası", "Farm turu", "Grup bölgesi", "Hazırlık"];
export const GUILD_GOAL_UNITS = ["adet", "oyun parası", "tur", "kişi", "görev"];
export const GUILD_ROLES = ["Tüm lonca", "Farm ekibi", "Grup bölgesi ekibi", "Maden ekibi", "Lonca yönetimi"];
export const GUILD_EXPENSE_CATEGORIES = ["Artırıcı", "Maden", "Üretim", "Grup bölgesi", "Diğer"];
export const GUILD_BOOSTER_SCOPES = ["Grup bölgesi", "Maden", "Lonca"];
export const GUILD_BOOSTER_STATUSES = ["Planlandı", "Alındı", "Aktif", "Tükendi"];

export class GuildLogisticsValidationError extends Error {
  constructor(message, field = "") {
    super(message);
    this.name = "GuildLogisticsValidationError";
    this.field = field;
  }
}

function fail(message, field) {
  throw new GuildLogisticsValidationError(message, field);
}

function normalizedText(value, field, { min = 1, max = 120, optional = false, publicSafe = true } = {}) {
  if ((value === undefined || value === null || value === "") && optional) return "";
  if (typeof value !== "string") fail("Metin bekleniyor.", field);
  const normalized = value.trim().replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ");
  if (normalized.length < min || normalized.length > max) fail("Alan uzunluğu geçersiz.", field);
  if (publicSafe && /https?:\/\/|www\.|discord\.gg|t\.me\//i.test(normalized)) fail("Bağlantı yayımlanamaz.", field);
  if (publicSafe && /(?:\+?\d[\s().-]*){7,}/.test(normalized)) fail("Telefon numarası yayımlanamaz.", field);
  return normalized;
}

function choice(value, allowed, field) {
  const normalized = normalizedText(value, field, { max: 80 });
  if (!allowed.includes(normalized)) fail("Geçersiz seçim.", field);
  return normalized;
}

function positiveInteger(value, field, max = 1_000_000_000) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > max) fail("Pozitif tam sayı gir.", field);
  return number;
}

function clientToken(value) {
  const token = normalizedText(value, "clientToken", { min: 20, max: 128, publicSafe: false });
  if (!/^[A-Za-z0-9_-]+$/.test(token)) fail("Geçersiz cihaz anahtarı.", "clientToken");
  return token;
}

export function normalizeGuildCode(value) {
  const code = String(value || "").trim().toUpperCase();
  if (!/^NA-LONCA-[A-Z2-9]{6}$/.test(code)) fail("Geçersiz lonca planı kodu.", "code");
  return code;
}

export function validateGuildGoal(raw, index = 0) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("Hedef verisi geçersiz.", `goals.${index}`);
  return {
    title: normalizedText(raw.title, `goals.${index}.title`, { min: 2, max: 60 }),
    category: choice(raw.category, GUILD_GOAL_CATEGORIES, `goals.${index}.category`),
    targetAmount: positiveInteger(raw.targetAmount, `goals.${index}.targetAmount`),
    unit: choice(raw.unit, GUILD_GOAL_UNITS, `goals.${index}.unit`),
    assignedRole: choice(raw.assignedRole, GUILD_ROLES, `goals.${index}.assignedRole`),
  };
}

export function validateGuildBoard(raw, { now = Date.now() } = {}) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("Geçersiz plan verisi.", "payload");
  if (raw.website) fail("Gönderim reddedildi.", "website");
  const weekStart = normalizedText(raw.weekStart, "weekStart", { min: 10, max: 10, publicSafe: false });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) fail("Hafta tarihi geçersiz.", "weekStart");
  const timestamp = new Date(`${weekStart}T00:00:00+03:00`).getTime();
  if (!Number.isFinite(timestamp) || timestamp < now - 8 * 24 * 60 * 60_000 || timestamp > now + 35 * 24 * 60 * 60_000) fail("Hafta başlangıcı yakın geçmiş ile 35 gün sonrası arasında olmalı.", "weekStart");
  const goals = Array.isArray(raw.goals) ? raw.goals.map(validateGuildGoal) : [];
  if (goals.length < 1 || goals.length > 8) fail("Plan 1–8 hedef içermeli.", "goals");
  return {
    guildName: normalizedText(raw.guildName, "guildName", { min: 2, max: 36 }),
    server: choice(raw.server, ["Kıyametin Öncüleri"], "server"),
    weekStart,
    note: normalizedText(raw.note, "note", { max: 180, optional: true }),
    goals,
    clientToken: clientToken(raw.clientToken),
  };
}

export function validateGuildContribution(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("Geçersiz katkı verisi.", "payload");
  if (raw.website) fail("Gönderim reddedildi.", "website");
  const goalId = normalizedText(raw.goalId, "goalId", { min: 20, max: 64, publicSafe: false });
  if (!/^[0-9a-f-]{36}$/i.test(goalId)) fail("Hedef kimliği geçersiz.", "goalId");
  return {
    code: normalizeGuildCode(raw.code),
    goalId,
    contributorAlias: normalizedText(raw.contributorAlias, "contributorAlias", { min: 2, max: 24 }),
    amount: positiveInteger(raw.amount, "amount"),
    note: normalizedText(raw.note, "note", { max: 100, optional: true }),
    clientToken: clientToken(raw.clientToken),
  };
}

export function validateGuildManagement(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("Geçersiz yönetim verisi.", "payload");
  const code = normalizeGuildCode(raw.code);
  const managerToken = normalizedText(raw.managerToken, "managerToken", { min: 24, max: 128, publicSafe: false });
  if (!/^NA-LM-[0-9A-F-]+$/.test(managerToken)) fail("Geçersiz yönetim anahtarı.", "managerToken");
  const action = choice(raw.action, ["add-goal", "add-expense", "add-booster", "set-booster-status", "close-board"], "action");
  if (action === "add-goal") return { code, managerToken, action, goal: validateGuildGoal(raw.goal) };
  if (action === "add-expense") return {
    code, managerToken, action,
    title: normalizedText(raw.title, "title", { min: 2, max: 60 }),
    category: choice(raw.category, GUILD_EXPENSE_CATEGORIES, "category"),
    gameAmount: positiveInteger(raw.gameAmount, "gameAmount"),
    note: normalizedText(raw.note, "note", { max: 100, optional: true }),
  };
  if (action === "add-booster") return {
    code, managerToken, action,
    title: normalizedText(raw.title, "title", { min: 2, max: 60 }),
    scope: choice(raw.scope, GUILD_BOOSTER_SCOPES, "scope"),
    quantity: positiveInteger(raw.quantity, "quantity", 9999),
    status: choice(raw.status, GUILD_BOOSTER_STATUSES, "status"),
    sponsorAlias: normalizedText(raw.sponsorAlias, "sponsorAlias", { max: 24, optional: true }),
    note: normalizedText(raw.note, "note", { max: 100, optional: true }),
  };
  if (action === "set-booster-status") {
    const boosterId = normalizedText(raw.boosterId, "boosterId", { min: 20, max: 64, publicSafe: false });
    if (!/^[0-9a-f-]{36}$/i.test(boosterId)) fail("Artırıcı kimliği geçersiz.", "boosterId");
    return { code, managerToken, action, boosterId, status: choice(raw.status, GUILD_BOOSTER_STATUSES, "status") };
  }
  return { code, managerToken, action };
}

export function calculateGuildGoalProgress(goal, contributions) {
  const collected = contributions.filter((row) => row.goalId === goal.id && row.status === "active").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  return {
    collected,
    remaining: Math.max(0, goal.targetAmount - collected),
    percent: Math.min(100, Math.round((collected / goal.targetAmount) * 100)),
  };
}
