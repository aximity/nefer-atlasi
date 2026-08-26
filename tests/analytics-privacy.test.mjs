import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("trafik şeması ham IP veya kullanıcı aracısı saklamaz", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  assert.match(schema, /analytics_daily_pages/);
  assert.match(schema, /analytics_daily_visitors/);
  assert.doesNotMatch(schema, /ipAddress|ip_address|userAgent|user_agent/);
});

test("takipçi izlememe tercihini ve özel yolları dışarıda bırakır", async () => {
  const tracker = await readFile(new URL("../app/AnalyticsTracker.tsx", import.meta.url), "utf8");
  const repository = await readFile(new URL("../lib/analytics-repository.server.ts", import.meta.url), "utf8");
  assert.match(tracker, /doNotTrack === "1"/);
  assert.match(repository, /path\.startsWith\("\/istatistik"\)/);
  assert.match(repository, /device === "bot"/);
});

test("reklam kodu ayar ve ziyaretçi izni birlikte olmadan açılmaz", async () => {
  const slot = await readFile(new URL("../app/AdSlot.tsx", import.meta.url), "utf8");
  assert.match(slot, /!allowed \|\| !config\?\.enabled/);
  assert.match(slot, /nefer-ad-consent-v1/);
});
