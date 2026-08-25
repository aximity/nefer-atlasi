export const GROUP_CATEGORIES = ["Grup bölgesi", "Farm", "Tılsım", "Lonca", "PvP"];
export const GROUP_REGIONS = ["Büyük Hol", "Zihin Tapınağı", "Çemberlitaş", "Sığınak", "Migrat", "Meteor Bölgesi", "Yeraltı", "Eminönü", "Sivri Ada", "Topkapı Sarayı"];
export const GROUP_ROLES = ["Tank", "Şifacı", "Hasar", "Direnç kırma"];
export const GROUP_CHANNELS = ["Oyun içi", "Discord", "WhatsApp", "Telegram"];

export class GroupBoardValidationError extends Error {
  constructor(message, field = "") {
    super(message);
    this.name = "GroupBoardValidationError";
    this.field = field;
  }
}

function fail(message, field) {
  throw new GroupBoardValidationError(message, field);
}

function text(value, field, { min = 1, max = 120 } = {}) {
  if (typeof value !== "string") fail("Metin bekleniyor.", field);
  const normalized = value.trim().replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ");
  if (normalized.length < min || normalized.length > max) fail("Alan uzunluğu geçersiz.", field);
  return normalized;
}

function choice(value, allowed, field) {
  const normalized = text(value, field, { max: 80 });
  if (!allowed.includes(normalized)) fail("Geçersiz seçim.", field);
  return normalized;
}

function safePublicText(value, field, limits) {
  const normalized = text(value, field, limits);
  if (/https?:\/\/|www\.|discord\.gg|t\.me\//i.test(normalized)) fail("Davet bağlantısı veya adres yayımlanamaz.", field);
  if (/(?:\+?\d[\s().-]*){7,}/.test(normalized)) fail("Telefon numarası yayımlanamaz.", field);
  return normalized;
}

export function validateGroupAnnouncement(raw, { now = Date.now() } = {}) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("Geçersiz veri yapısı.", "payload");
  const server = choice(raw.server, ["Kıyametin Öncüleri"], "server");
  const category = choice(raw.category, GROUP_CATEGORIES, "category");
  const region = choice(raw.region, GROUP_REGIONS, "region");
  const roles = Array.isArray(raw.roles) ? [...new Set(raw.roles.map((role) => choice(role, GROUP_ROLES, "roles")))] : [];
  if (!roles.length) fail("En az bir rol seç.", "roles");
  const channel = choice(raw.channel, GROUP_CHANNELS, "channel");
  const title = safePublicText(raw.title, "title", { min: 3, max: 80 });
  const leaderAlias = safePublicText(raw.leaderAlias, "leaderAlias", { min: 2, max: 24 });
  if (!/^[\p{L}\p{N}_. -]+$/u.test(leaderAlias)) fail("Lider adı yalnız harf, rakam, boşluk, nokta, tire ve alt çizgi içerebilir.", "leaderAlias");
  const date = text(raw.date, "date", { min: 10, max: 10 });
  const time = text(raw.time, "time", { min: 5, max: 5 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) fail("Tarih veya saat biçimi geçersiz.", "date");
  const startAt = new Date(`${date}T${time}:00+03:00`).getTime();
  const normalizedLocal = Number.isFinite(startAt) ? new Date(startAt + 3 * 60 * 60_000).toISOString().slice(0, 16) : "";
  if (normalizedLocal !== `${date}T${time}` || startAt < now - 15 * 60_000 || startAt > now + 72 * 60 * 60_000) fail("Etkinlik 15 dakika öncesi ile 72 saat sonrası arasında olmalı.", "date");
  const durationMinutes = Number(raw.durationMinutes);
  if (![60, 90, 120, 180, 360].includes(durationMinutes)) fail("Geçersiz ilan süresi.", "durationMinutes");
  const clientToken = text(raw.clientToken, "clientToken", { min: 20, max: 128 });
  if (!/^[A-Za-z0-9_-]+$/.test(clientToken)) fail("Geçersiz cihaz anahtarı.", "clientToken");
  if (raw.website) fail("Gönderim reddedildi.", "website");
  return {
    server, category, region, roles, channel, title, leaderAlias, date, time,
    startAt: new Date(startAt).toISOString(),
    expiresAt: new Date(startAt + durationMinutes * 60_000).toISOString(),
    durationMinutes,
    clientToken,
  };
}

export function parseAnnouncementText(value) {
  const textValue = String(value || "").trim();
  const lower = textValue.toLocaleLowerCase("tr-TR");
  const region = GROUP_REGIONS.find((item) => lower.includes(item.toLocaleLowerCase("tr-TR"))) || "";
  const timeMatch = textValue.match(/(?:^|\s)([01]?\d|2[0-3])[:.]([0-5]\d)(?:\s|$)/);
  const roles = GROUP_ROLES.filter((role) => {
    const words = {
      Tank: ["tank", "savaşçı"], Şifacı: ["şifacı", "şifa"], Hasar: ["hasar", "dps", "büyücü"], "Direnç kırma": ["direnç kırma", "dk"],
    }[role];
    return words.some((word) => lower.includes(word));
  });
  const category = lower.includes("tılsım") ? "Tılsım" : lower.includes("farm") || lower.includes("maden") ? "Farm" : lower.includes("pvp") ? "PvP" : lower.includes("lonca") ? "Lonca" : "Grup bölgesi";
  const channel = lower.includes("discord") ? "Discord" : lower.includes("whatsapp") ? "WhatsApp" : lower.includes("telegram") ? "Telegram" : "Oyun içi";
  return {
    region,
    time: timeMatch ? `${String(timeMatch[1]).padStart(2, "0")}:${timeMatch[2]}` : "",
    roles,
    category,
    channel,
  };
}
