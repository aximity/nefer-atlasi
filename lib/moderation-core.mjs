export const MODERATION_ACTIONS = [
  "accept_single",
  "verify_cross",
  "mark_conflict",
  "reject",
  "publish",
  "unpublish",
  "return_draft",
  "save_note",
];

export function resolveModerationTransition({
  action,
  current,
  independenceConfirmed = false,
  note = "",
}) {
  if (!MODERATION_ACTIONS.includes(action)) {
    throw new Error("Geçersiz editör işlemi.");
  }
  const trimmedNote = String(note).trim().slice(0, 2000);
  if (
    ["mark_conflict", "reject", "unpublish"].includes(action) &&
    trimmedNote.length < 3
  ) {
    throw new Error("Bu karar için kısa bir editör notu gerekir.");
  }
  if (action === "accept_single") {
    if (current.sourceCount < 1) throw new Error("Tek kaynak için kanıt yok.");
    return {
      verification: "single_source",
      publication: "queued",
      note: trimmedNote,
    };
  }
  if (action === "verify_cross") {
    if (current.sourceCount < 2 || !independenceConfirmed) {
      throw new Error(
        "Çapraz doğrulama için en az iki kanıt ve bağımsızlık onayı gerekir.",
      );
    }
    return {
      verification: "cross_verified",
      publication: "queued",
      note: trimmedNote,
    };
  }
  if (action === "mark_conflict") {
    return {
      verification: "conflicted",
      publication: "private",
      note: trimmedNote,
    };
  }
  if (action === "reject") {
    return {
      verification: "rejected",
      publication: "archived",
      note: trimmedNote,
    };
  }
  if (action === "return_draft") {
    return {
      verification: "draft",
      publication: "queued",
      note: trimmedNote,
    };
  }
  if (action === "publish") {
    if (current.verificationStatus !== "cross_verified") {
      throw new Error("Yayın için önce çapraz doğrulama gerekir.");
    }
    return {
      verification: "cross_verified",
      publication: "published",
      note: trimmedNote,
    };
  }
  if (action === "unpublish") {
    return {
      verification: current.verificationStatus,
      publication: "archived",
      note: trimmedNote,
    };
  }
  return {
    verification: current.verificationStatus,
    publication: current.publicationStatus,
    note: trimmedNote,
  };
}

export function safePublishedDetails(kind, details) {
  const keysByKind = {
    item_evidence: [
      "className",
      "slot",
      "levelTier",
      "acquisitionPlace",
      "rarity",
      "statLines",
      "appearanceProof",
    ],
    mining_run: [
      "region",
      "routeMinutes",
      "nodeCount",
      "runCount",
      "yields",
      "boosters",
    ],
    market_price: [
      "listingType",
      "quantity",
      "currency",
      "price",
      "channel",
      "settledPrice",
    ],
    ability_media: ["className", "captureContext", "abilityPoints"],
  };
  return Object.fromEntries(
    (keysByKind[kind] ?? [])
      .filter((key) => details[key] !== undefined)
      .map((key) => [key, details[key]]),
  );
}
