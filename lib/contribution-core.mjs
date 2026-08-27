export const CONTRIBUTION_KINDS = [
  "site_feedback",
  "item_evidence",
  "mining_run",
  "market_price",
  "ability_media",
];

export const CONTRIBUTION_LIMITS = {
  payloadBytes: 32 * 1024,
  requestBytes: 13 * 1024 * 1024,
  imageBytes: 5 * 1024 * 1024,
  videoBytes: 12 * 1024 * 1024,
};

const classes = ["Savaşçı", "Büyücü", "Şifacı"];
const slots = [
  "Silah",
  "Eldiven",
  "Ceket",
  "Yüzük",
  "Kolye",
  "Ayakkabı",
  "Pantolon",
  "Gözlük",
];
const rarities = ["Belirsiz", "Tek efsun", "Çift efsun", "Nadir", "Şaheser"];
const listingTypes = ["İlan", "Gerçekleşen satış"];
const currencies = ["Oyun parası", "TL"];
const marketChannels = [
  "Oyun içi sohbet",
  "Discord",
  "WhatsApp",
  "Facebook",
  "Özel takas",
];
const captureContexts = ["PvE", "PvP", "Grup bölgesi", "Boş hedef"];

export class ContributionValidationError extends Error {
  constructor(message, field = "") {
    super(message);
    this.name = "ContributionValidationError";
    this.field = field;
  }
}

function fail(message, field) {
  throw new ContributionValidationError(message, field);
}

function record(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail("Geçersiz veri yapısı.", field);
  }
  return value;
}

function text(value, field, { min = 0, max, required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) fail("Bu alan zorunludur.", field);
    return "";
  }
  if (typeof value !== "string") fail("Metin bekleniyor.", field);
  const normalized = value.trim().replace(/\u0000/g, "");
  if (required && normalized.length < min) fail("Bu alan çok kısa.", field);
  if (!required && normalized && normalized.length < min) fail("Bu alan çok kısa.", field);
  if (normalized.length > max) fail("Bu alan izin verilenden uzun.", field);
  return normalized;
}

function choice(value, allowed, field) {
  const normalized = text(value, field, { min: 1, max: 80, required: true });
  if (!allowed.includes(normalized)) fail("Geçersiz seçim.", field);
  return normalized;
}

function number(value, field, { min, max, integer = false, optional = false }) {
  if ((value === "" || value === undefined || value === null) && optional) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) fail("Geçerli bir sayı gir.", field);
  if (integer && !Number.isInteger(value)) fail("Tam sayı gir.", field);
  if (value < min || value > max) fail("Sayı izin verilen aralığın dışında.", field);
  return value;
}

function boolean(value, field, requiredTrue = false) {
  if (typeof value !== "boolean") fail("Geçersiz onay alanı.", field);
  if (requiredTrue && !value) fail("Devam etmek için bu alanı onayla.", field);
  return value;
}

function date(value, field) {
  const normalized = text(value, field, { min: 10, max: 10, required: true });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) fail("Tarihi YYYY-AA-GG biçiminde gir.", field);
  const parsed = new Date(normalized + "T12:00:00Z");
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    fail("Geçerli bir tarih gir.", field);
  }
  const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
  if (parsed.getTime() > tomorrow || normalized < "2007-01-01") {
    fail("Gözlem tarihi geçerli aralıkta değil.", field);
  }
  return normalized;
}

function url(value, field) {
  const normalized = text(value, field, { min: 8, max: 1000 });
  if (!normalized) return "";
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    fail("Geçerli bir bağlantı gir.", field);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    fail("Yalnız http veya https bağlantısı kullanılabilir.", field);
  }
  return parsed.toString();
}

function subject(value) {
  return text(value, "details.subject", { min: 2, max: 120, required: true });
}

export function validateContributionPayload(raw, { hasFile = false, now = Date.now() } = {}) {
  const root = record(raw, "payload");
  const kind = choice(root.kind, CONTRIBUTION_KINDS, "kind");
  const inputCommon = record(root.common, "common");
  const inputDetails = record(root.details, "details");
  const common = {
    server: text(inputCommon.server, "common.server", {
      min: 2,
      max: 80,
      required: true,
    }),
    observedAt: date(inputCommon.observedAt, "common.observedAt"),
    alias: text(inputCommon.alias, "common.alias", { min: 2, max: 40 }),
    contact: text(inputCommon.contact, "common.contact", { min: 3, max: 160 }),
    notes: text(inputCommon.notes, "common.notes", { max: 2000 }),
    sourceUrl: url(inputCommon.sourceUrl, "common.sourceUrl"),
    secondarySourceUrl: url(
      inputCommon.secondarySourceUrl,
      "common.secondarySourceUrl",
    ),
    declaration: boolean(inputCommon.declaration, "common.declaration", true),
    clientToken: text(inputCommon.clientToken, "common.clientToken", {
      min: 20,
      max: 128,
      required: true,
    }),
    startedAt: number(inputCommon.startedAt, "common.startedAt", {
      min: 1,
      max: now + 5 * 60 * 1000,
    }),
    website: text(inputCommon.website, "common.website", { max: 200 }),
  };
  if (!/^[A-Za-z0-9_-]+$/.test(common.clientToken)) {
    fail("Geçersiz cihaz anahtarı.", "common.clientToken");
  }
  if (common.website) fail("Gönderim reddedildi.", "common.website");
  if (now - common.startedAt < 1500) fail("Form çok hızlı gönderildi; kısa bir süre sonra yeniden dene.", "common.startedAt");
  if (kind !== "site_feedback" && !hasFile && !common.sourceUrl && !common.secondarySourceUrl) {
    fail("En az bir kanıt dosyası veya kaynak bağlantısı ekle.", "evidence");
  }

  let details;
  if (kind === "site_feedback") {
    details = {
      subject: subject(inputDetails.subject),
      comment: text(inputDetails.comment, "details.comment", {
        min: 3,
        max: 2000,
        required: true,
      }),
    };
  } else if (kind === "item_evidence") {
    details = {
      subject: subject(inputDetails.subject),
      className: choice(inputDetails.className, classes, "details.className"),
      slot: choice(inputDetails.slot, slots, "details.slot"),
      levelTier: text(inputDetails.levelTier, "details.levelTier", {
        min: 1,
        max: 40,
        required: true,
      }),
      acquisitionPlace: text(
        inputDetails.acquisitionPlace,
        "details.acquisitionPlace",
        { min: 2, max: 160, required: true },
      ),
      rarity: choice(inputDetails.rarity, rarities, "details.rarity"),
      statLines: text(inputDetails.statLines, "details.statLines", { max: 1500 }),
      appearanceProof: boolean(
        inputDetails.appearanceProof,
        "details.appearanceProof",
      ),
    };
  } else if (kind === "mining_run") {
    details = {
      subject: subject(inputDetails.subject),
      region: text(inputDetails.region, "details.region", {
        min: 2,
        max: 120,
        required: true,
      }),
      routeMinutes: number(inputDetails.routeMinutes, "details.routeMinutes", {
        min: 1,
        max: 720,
      }),
      nodeCount: number(inputDetails.nodeCount, "details.nodeCount", {
        min: 1,
        max: 10000,
        integer: true,
      }),
      runCount: number(inputDetails.runCount, "details.runCount", {
        min: 1,
        max: 1000,
        integer: true,
      }),
      yields: text(inputDetails.yields, "details.yields", {
        min: 2,
        max: 1000,
        required: true,
      }),
      boosters: text(inputDetails.boosters, "details.boosters", {
        min: 2,
        max: 500,
        required: true,
      }),
    };
  } else if (kind === "market_price") {
    details = {
      subject: subject(inputDetails.subject),
      listingType: choice(
        inputDetails.listingType,
        listingTypes,
        "details.listingType",
      ),
      quantity: number(inputDetails.quantity, "details.quantity", {
        min: 0.01,
        max: 1_000_000_000,
      }),
      currency: choice(inputDetails.currency, currencies, "details.currency"),
      price: number(inputDetails.price, "details.price", {
        min: 0.01,
        max: 1_000_000_000_000_000,
      }),
      channel: choice(
        inputDetails.channel,
        marketChannels,
        "details.channel",
      ),
      settledPrice: number(inputDetails.settledPrice, "details.settledPrice", {
        min: 0.01,
        max: 1_000_000_000_000_000,
        optional: true,
      }),
    };
  } else {
    details = {
      subject: subject(inputDetails.subject),
      className: choice(inputDetails.className, classes, "details.className"),
      captureContext: choice(
        inputDetails.captureContext,
        captureContexts,
        "details.captureContext",
      ),
      abilityPoints: number(inputDetails.abilityPoints, "details.abilityPoints", {
        min: 0,
        max: 15,
        integer: true,
        optional: true,
      }),
      mediaRights: boolean(inputDetails.mediaRights, "details.mediaRights", true),
    };
  }

  return { kind, common, details };
}

export function storagePayload(validated) {
  const publicCommon = { ...validated.common };
  delete publicCommon.clientToken;
  delete publicCommon.contact;
  delete publicCommon.declaration;
  delete publicCommon.startedAt;
  delete publicCommon.website;
  return {
    kind: validated.kind,
    common: publicCommon,
    details: validated.details,
  };
}

export function sniffEvidenceFile(bytes, declaredType, kind) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let mimeType = "";
  let mediaKind = "";
  if (
    data.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => data[index] === byte,
    )
  ) {
    mimeType = "image/png";
    mediaKind = "image";
  } else if (
    data.length >= 3 &&
    data[0] === 0xff &&
    data[1] === 0xd8 &&
    data[2] === 0xff
  ) {
    mimeType = "image/jpeg";
    mediaKind = "image";
  } else if (
    data.length >= 12 &&
    String.fromCharCode(...data.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...data.slice(8, 12)) === "WEBP"
  ) {
    mimeType = "image/webp";
    mediaKind = "image";
  } else if (
    data.length >= 12 &&
    String.fromCharCode(...data.slice(4, 8)) === "ftyp"
  ) {
    mimeType = "video/mp4";
    mediaKind = "video";
  } else if (
    data.length >= 4 &&
    [0x1a, 0x45, 0xdf, 0xa3].every((byte, index) => data[index] === byte)
  ) {
    mimeType = "video/webm";
    mediaKind = "video";
  } else {
    fail("Dosya biçimi desteklenmiyor veya imzası geçersiz.", "file");
  }
  if (declaredType && declaredType !== mimeType) {
    fail("Dosyanın içeriği ile bildirilen türü eşleşmiyor.", "file");
  }
  if (kind !== "ability_media" && mediaKind !== "image") {
    fail("Bu katkı türünde yalnız görsel kanıt kabul edilir.", "file");
  }
  const maxBytes =
    mediaKind === "video"
      ? CONTRIBUTION_LIMITS.videoBytes
      : CONTRIBUTION_LIMITS.imageBytes;
  if (data.byteLength > maxBytes) {
    fail(
      mediaKind === "video"
        ? "Video 12 MB sınırını aşıyor."
        : "Görsel 5 MB sınırını aşıyor.",
      "file",
    );
  }
  return { mimeType, mediaKind, maxBytes };
}

export function safeOriginalName(value) {
  const name = String(value || "kanit")
    .replace(/[\u0000-\u001f\u007f/\\]+/g, "-")
    .trim()
    .slice(0, 120);
  return name || "kanit";
}

export function makeReceiptToken(randomBytes = crypto.getRandomValues(new Uint8Array(16))) {
  const hex = Array.from(randomBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  )
    .join("")
    .toUpperCase();
  return "NA-" + hex.match(/.{1,8}/g).join("-");
}

export function normalizeReceiptToken(value) {
  const token = String(value || "").trim().toUpperCase();
  return /^NA-(?:[0-9A-F]{8}-){3}[0-9A-F]{8}$/.test(token) ? token : "";
}

export function stableStringify(value) {
  if (Array.isArray(value)) {
    return "[" + value.map((entry) => stableStringify(entry)).join(",") + "]";
  }
  if (value && typeof value === "object") {
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map((key) => JSON.stringify(key) + ":" + stableStringify(value[key]))
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(value);
}

export async function sha256Hex(value) {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : value instanceof Uint8Array
        ? value
        : new Uint8Array(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
