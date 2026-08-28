import assert from "node:assert/strict";
import test from "node:test";
import {
  ContributionValidationError,
  makeReceiptToken,
  normalizeReceiptToken,
  sniffEvidenceFile,
  storagePayload,
  validateContributionPayload,
} from "../lib/contribution-core.mjs";

const now = Date.parse("2026-08-25T12:00:00Z");
const common = {
  server: "Kıyamet Öncüleri",
  observedAt: "2026-08-24",
  alias: "Nefer",
  contact: "nefer@example.com",
  notes: "Oyun içi gözlem.",
  sourceUrl: "https://example.com/kanit",
  secondarySourceUrl: "",
  declaration: true,
  clientToken: "abcdefghijklmnopqrstuvwxyz123456",
  startedAt: now - 5000,
  website: "",
};

const samples = [
  {
    kind: "site_feedback",
    common: { ...common, sourceUrl: "" },
    details: {
      subject: "Bilgi Tılsımı fiyatı",
      comment: "Gönül NPC fiyatı kontrol edilmeli.",
    },
  },
  {
    kind: "item_evidence",
    common,
    details: {
      subject: "Kıyamet Asa",
      className: "Büyücü",
      slot: "Silah",
      levelTier: "49 / 3. kademe",
      acquisitionPlace: "Çemberlitaş",
      rarity: "Şaheser",
      statLines: "Büyü Kritik: 4.354",
      appearanceProof: true,
    },
  },
  {
    kind: "mining_run",
    common,
    details: {
      subject: "Xenotim",
      region: "Holden",
      routeMinutes: 45,
      nodeCount: 18,
      runCount: 3,
      yields: "Xenotim: 2",
      boosters: "Lonca arttırıcı",
    },
  },
  {
    kind: "market_price",
    common,
    details: {
      subject: "Xenotim",
      tradeDirection: "Satılık",
      listingType: "Gerçekleşen satış",
      quantity: 1,
      currency: "TL",
      price: 175,
      channel: "Discord",
      settledPrice: 160,
    },
  },
  {
    kind: "ability_media",
    common,
    details: {
      subject: "Buz Oku",
      className: "Büyücü",
      captureContext: "PvE",
      abilityPoints: 15,
      mediaRights: true,
    },
  },
];

test("beş katkı türü yapılandırılmış veriyle doğrulanır", () => {
  for (const sample of samples) {
    const result = validateContributionPayload(sample, { now });
    assert.equal(result.kind, sample.kind);
    assert.equal(result.details.subject, sample.details.subject);
  }
  assert.equal(validateContributionPayload(samples[3], { now }).details.tradeDirection, "Satılık");
});

test("kanıt ve açık beyan olmadan katkı kabul edilmez", () => {
  assert.throws(
    () =>
      validateContributionPayload(
        {
          ...samples[1],
          common: { ...common, sourceUrl: "", declaration: false },
        },
        { now },
      ),
    ContributionValidationError,
  );
  assert.throws(
    () =>
      validateContributionPayload(
        { ...samples[1], common: { ...common, sourceUrl: "" } },
        { now },
      ),
    /kanıt dosyası veya kaynak bağlantısı/i,
  );
});

test("depolanan payload cihaz anahtarı ve özel iletişimi içermez", () => {
  const validated = validateContributionPayload(samples[0], { now });
  const stored = storagePayload(validated);
  assert.equal("clientToken" in stored.common, false);
  assert.equal("contact" in stored.common, false);
  assert.equal(stored.common.server, "Kıyamet Öncüleri");
});

test("dosya imzası MIME beyanıyla eşleşir ve tür sınırı uygulanır", () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.deepEqual(
    sniffEvidenceFile(png, "image/png", "item_evidence").mediaKind,
    "image",
  );
  const mp4 = Uint8Array.from([0, 0, 0, 20, 0x66, 0x74, 0x79, 0x70, 0, 0, 0, 0]);
  assert.equal(
    sniffEvidenceFile(mp4, "video/mp4", "ability_media").mimeType,
    "video/mp4",
  );
  assert.throws(
    () => sniffEvidenceFile(mp4, "video/mp4", "market_price"),
    /yalnız görsel/i,
  );
  assert.throws(
    () => sniffEvidenceFile(png, "image/jpeg", "item_evidence"),
    /eşleşmiyor/i,
  );
});

test("makbuz 128 bitlik tek kullanımlık biçimdedir", () => {
  const receipt = makeReceiptToken(new Uint8Array(16).fill(10));
  assert.equal(receipt, "NA-0A0A0A0A-0A0A0A0A-0A0A0A0A-0A0A0A0A");
  assert.equal(normalizeReceiptToken(receipt.toLowerCase()), receipt);
  assert.equal(normalizeReceiptToken("NA-123"), "");
});
