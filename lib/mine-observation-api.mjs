import {
  appendMineObservation,
  appendMineSignal,
  liveMineObservations,
} from "./mine-observations.mjs";

export const MINE_OBSERVATION_POLICY = Object.freeze({
  visibilityTtlMs: 30 * 60 * 1000,
  writeLimit: 6,
  writeWindowMs: 5 * 60 * 1000,
});

const failure = (status, code, message) => ({ status, body: { error: { code, message } } });
const success = (status, body) => ({ status, body });
const objectPayload = (value) => value && typeof value === "object" && !Array.isArray(value);
const boundedText = (value, minimum, maximum) => typeof value === "string"
  && value.trim().length >= minimum
  && value.trim().length <= maximum;
const safeKey = (value) => boundedText(value, 8, 128) && /^[a-zA-Z0-9._:-]+$/.test(value);
const safeSlug = (value) => boundedText(value, 1, 64) && /^[a-z0-9-]+$/.test(value);

const sameIdempotentWrite = (event, actorId, payload) => {
  if (event.actorId !== actorId) return false;
  if (payload.kind === "report" && event.kind === "mine_observation_reported") {
    return event.regionId === payload.regionId
      && event.resourceId === payload.resourceId
      && event.position.x === payload.x
      && event.position.y === payload.y;
  }
  return payload.kind === "signal"
    && event.kind === "mine_observation_signaled"
    && event.observationId === payload.observationId
    && event.signal === payload.signal;
};

const domainFailure = (error) => {
  const message = error instanceof Error ? error.message : "invalid observation request";
  if (message.includes("unknown observation")) return failure(404, "OBSERVATION_NOT_FOUND", "Gözlem bulunamadı.");
  if (message.includes("independent actor")) return failure(409, "SELF_SIGNAL_FORBIDDEN", "Kendi bildiriminizi doğrulayamazsınız.");
  if (message.includes("already signaled")) return failure(409, "SIGNAL_ALREADY_EXISTS", "Bu gözleme daha önce sinyal verdiniz.");
  if (message.includes("not live")) return failure(409, "OBSERVATION_EXPIRED", "Bu gözlem artık canlı değil.");
  return failure(400, "INVALID_REQUEST", "Gözlem isteği geçersiz.");
};

const persistenceFailure = (error) => {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("mine observation rate limit exceeded")) {
    return failure(429, "RATE_LIMITED", "Çok hızlı işlem yaptınız. Birkaç dakika sonra tekrar deneyin.");
  }
  if (message.includes("UNIQUE constraint failed")) {
    return failure(409, "WRITE_CONFLICT", "Bu gözlem işlemi daha önce kaydedilmiş.");
  }
  return failure(503, "STORAGE_UNAVAILABLE", "Canlı gözlem servisi şu anda kullanılamıyor.");
};

export function validateMineObservationWriteRequest(request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim();
  if (contentType !== "application/json") {
    return failure(415, "JSON_REQUIRED", "İstek application/json biçiminde olmalı.");
  }

  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site" || (origin && origin !== new URL(request.url).origin)) {
    return failure(403, "CROSS_SITE_WRITE_FORBIDDEN", "Çapraz site yazma isteği reddedildi.");
  }

  return null;
}

export async function listMineObservations(repository, now = new Date().toISOString()) {
  try {
    const events = await repository.liveEvents(now);
    return success(200, { observations: liveMineObservations(events, now) });
  } catch (error) {
    return persistenceFailure(error);
  }
}

export async function writeMineObservation(repository, actorId, payload, options = {}) {
  if (!actorId) return failure(401, "AUTHENTICATION_REQUIRED", "Bildirim yapmak için giriş yapmalısınız.");
  if (!objectPayload(payload) || !safeKey(payload.idempotencyKey)) {
    return failure(400, "INVALID_REQUEST", "Geçerli bir idempotency anahtarı gerekli.");
  }

  if (payload.kind === "report") {
    if (
      !safeSlug(payload.regionId)
      || !options.allowedRegionIds?.has(payload.regionId)
      || !boundedText(payload.resourceId, 1, 96)
      || !options.allowedResourceIds?.has(payload.resourceId)
      || !Number.isFinite(payload.x)
      || !Number.isFinite(payload.y)
    ) {
      return failure(400, "INVALID_REPORT", "Bölge, kaynak ve yaklaşık konum alanlarını kontrol edin.");
    }
  } else if (
    payload.kind !== "signal"
    || !boundedText(payload.observationId, 1, 128)
    || !["confirm", "reject"].includes(payload.signal)
  ) {
    return failure(400, "INVALID_SIGNAL", "Gözlem ve sinyal alanlarını kontrol edin.");
  }

  try {
    const existing = await repository.byIdempotencyKey(payload.idempotencyKey);
    if (existing) {
      return sameIdempotentWrite(existing, actorId, payload)
        ? success(200, { status: "duplicate", observationId: existing.observationId })
        : failure(409, "IDEMPOTENCY_CONFLICT", "Bu işlem anahtarı başka bir istek için kullanılmış.");
    }

    const now = options.now ?? new Date().toISOString();
    const randomUUID = options.randomUUID ?? crypto.randomUUID.bind(crypto);
    let event;
    if (payload.kind === "report") {
      [event] = appendMineObservation([], {
        eventId: randomUUID(),
        observationId: randomUUID(),
        actorId,
        regionId: payload.regionId,
        resourceId: payload.resourceId,
        x: payload.x,
        y: payload.y,
        reportedAt: now,
        expiresAfterMs: MINE_OBSERVATION_POLICY.visibilityTtlMs,
        idempotencyKey: payload.idempotencyKey,
      });
    } else {
      const events = await repository.forObservation(payload.observationId);
      const nextEvents = appendMineSignal(events, {
        eventId: randomUUID(),
        observationId: payload.observationId,
        actorId,
        signal: payload.signal,
        occurredAt: now,
        idempotencyKey: payload.idempotencyKey,
      });
      event = nextEvents.at(-1);
    }

    const appendResult = await repository.append(event);
    return success(appendResult === "inserted" ? 201 : 200, {
      status: appendResult,
      observationId: event.observationId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const domainMarkers = [
      "unknown observation",
      "independent actor",
      "already signaled",
      "not live",
      "invalid approximate coordinate",
      "invalid signal",
    ];
    return domainMarkers.some((marker) => message.includes(marker))
      ? domainFailure(error)
      : persistenceFailure(error);
  }
}
