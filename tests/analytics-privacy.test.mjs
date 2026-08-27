import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("trafik şeması ham IP veya kullanıcı aracısı saklamaz", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  assert.match(schema, /analytics_daily_pages/);
  assert.match(schema, /analytics_daily_visitors/);
  assert.match(schema, /analytics_daily_engagement/);
  assert.doesNotMatch(schema, /ipAddress|ip_address|userAgent|user_agent/);
});

test("takipçi izlememe tercihini ve özel yolları dışarıda bırakır", async () => {
  const tracker = await readFile(new URL("../app/AnalyticsTracker.tsx", import.meta.url), "utf8");
  const repository = await readFile(new URL("../lib/analytics-repository.server.ts", import.meta.url), "utf8");
  assert.match(tracker, /doNotTrack === "1"/);
  assert.match(tracker, /document\.hidden/);
  assert.match(tracker, /\/api\/analytics\/engagement/);
  assert.match(repository, /path\.startsWith\("\/istatistik"\)/);
  assert.match(repository, /device === "bot"/);
  assert.match(repository, /engaged_seconds = engaged_seconds \+ excluded\.engaged_seconds/);
});

test("reklam kodu ayar ve ziyaretçi izni birlikte olmadan açılmaz", async () => {
  const slot = await readFile(new URL("../app/AdSlot.tsx", import.meta.url), "utf8");
  assert.match(slot, /!allowed \|\| !config\?\.enabled/);
  assert.match(slot, /nefer-ad-consent-v1/);
});

test("özel istatistik alanı açıkça yönetici girişi olarak sunulur", async () => {
  const login = await readFile(new URL("../app/istatistik/giris/page.tsx", import.meta.url), "utf8");
  assert.match(login, /Yönetici Girişi/);
  assert.match(login, /Yönetici erişim anahtarınla/);
  assert.doesNotMatch(login, /şifremi göster|anahtarı göster/i);
});

test("yönetici girişi çalışma zamanı sınırını aşan hashlerde 500 vermez", async () => {
  const auth = await readFile(new URL("../lib/analytics-auth.server.ts", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/analytics/session/route.ts", import.meta.url), "utf8");
  const login = await readFile(new URL("../app/istatistik/giris/page.tsx", import.meta.url), "utf8");
  assert.match(auth, /rounds > 100_000/);
  assert.match(route, /\/istatistik\/giris\?error=server/);
  assert.match(login, /Giriş servisine şu anda ulaşılamadı/);
});
