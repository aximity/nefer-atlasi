import test from "node:test";
import assert from "node:assert/strict";
import {
  assertMergeAllowed,
  canonicalSlug,
  contributionToCanonical,
  diffCanonical,
  publicCanonicalRecord,
} from "../lib/canonical-core.mjs";

const base = {
  id: "c1",
  type: "item_evidence",
  subject: "Bıçak Sırtı Kılıç",
  server: "Kıyamet Öncüleri",
  observedAt: "2026-08-25",
  verificationStatus: "cross_verified",
  publicationStatus: "published",
  payload: {
    details: {
      className: "Savaşçı",
      slot: "Silah",
      levelTier: "49 · 3. kademe",
      acquisitionPlace: "Çemberlitaş",
      rarity: "Şaheser",
      statLines: "Saldırı: 27.520",
      appearanceProof: true,
    },
  },
};

test("Turkish names receive stable canonical keys", () => {
  assert.equal(canonicalSlug("Bıçak Sırtı Kılıç"), "bicak-sirti-kilic");
});

test("item contribution becomes a provenance-safe canonical proposal", () => {
  const result = contributionToCanonical(base);
  assert.equal(result.entityType, "item");
  assert.match(result.entityKey, /^bicak-sirti-kilic--savasci--silah$/);
  assert.equal(result.data.verificationStatus, "cross_verified");
  assert.equal(result.data.appearanceProof, true);
  assert.equal("contact" in result.data, false);
});

test("diff exposes only changed fields", () => {
  assert.deepEqual(diffCanonical({ name: "X", price: 10 }, { name: "X", price: 12 }), [
    { field: "price", before: 10, after: 12 },
  ]);
});

test("merge requires cross verification, publication, confirmation, and fresh version", () => {
  assert.doesNotThrow(() =>
    assertMergeAllowed(base, { confirmed: true, expectedVersion: 2, currentVersion: 2 }),
  );
  assert.throws(
    () => assertMergeAllowed({ ...base, publicationStatus: "queued" }, { confirmed: true, expectedVersion: 0, currentVersion: 0 }),
    /yayımlanmalıdır/,
  );
  assert.throws(
    () => assertMergeAllowed(base, { confirmed: false, expectedVersion: 0, currentVersion: 0 }),
    /onaylamalısın/,
  );
  assert.throws(
    () => assertMergeAllowed(base, { confirmed: true, expectedVersion: 1, currentVersion: 2 }),
    /yeniden yükle/,
  );
});

test("public canonical record whitelists metadata and data only", () => {
  const result = publicCanonicalRecord({
    id: "r1",
    entityType: "item",
    entityKey: "x",
    displayName: "X",
    version: 3,
    updatedAt: "2026-08-25",
    data: { name: "X" },
    actorEmailHash: "private",
  });
  assert.equal(result.actorEmailHash, undefined);
  assert.deepEqual(result.data, { name: "X" });
});
