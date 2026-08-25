import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveModerationTransition,
  safePublishedDetails,
} from "../lib/moderation-core.mjs";

const draft = {
  verificationStatus: "draft",
  publicationStatus: "queued",
  sourceCount: 2,
};

test("çapraz doğrulama iki kanıt ve açık bağımsızlık onayı gerektirir", () => {
  assert.throws(
    () =>
      resolveModerationTransition({
        action: "verify_cross",
        current: draft,
        independenceConfirmed: false,
      }),
    /bağımsızlık onayı/i,
  );
  assert.throws(
    () =>
      resolveModerationTransition({
        action: "verify_cross",
        current: { ...draft, sourceCount: 1 },
        independenceConfirmed: true,
      }),
    /en az iki kanıt/i,
  );
  assert.deepEqual(
    resolveModerationTransition({
      action: "verify_cross",
      current: draft,
      independenceConfirmed: true,
    }),
    {
      verification: "cross_verified",
      publication: "queued",
      note: "",
    },
  );
});

test("yalnız çapraz doğrulanmış katkı public karta yayımlanır", () => {
  assert.throws(
    () =>
      resolveModerationTransition({
        action: "publish",
        current: draft,
      }),
    /önce çapraz doğrulama/i,
  );
  assert.equal(
    resolveModerationTransition({
      action: "publish",
      current: { ...draft, verificationStatus: "cross_verified" },
    }).publication,
    "published",
  );
});

test("çelişki, ret ve yayından kaldırma gerekçesiz kaydedilmez", () => {
  for (const action of ["mark_conflict", "reject", "unpublish"]) {
    assert.throws(
      () =>
        resolveModerationTransition({
          action,
          current: draft,
          note: "",
        }),
      /editör notu/i,
    );
  }
});

test("public kart yalnız türün güvenli yapılandırılmış alanlarını içerir", () => {
  const details = safePublishedDetails("market_price", {
    listingType: "Gerçekleşen satış",
    quantity: 1,
    currency: "TL",
    price: 175,
    channel: "Discord",
    contact: "özel-hesap",
    sourceUrl: "https://example.com/private",
    notes: "özel not",
  });
  assert.equal(details.price, 175);
  assert.equal("contact" in details, false);
  assert.equal("sourceUrl" in details, false);
  assert.equal("notes" in details, false);
});
