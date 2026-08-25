import assert from "node:assert/strict";
import test from "node:test";
import { summarizeGroupDemand } from "../lib/group-analytics.mjs";

const now = new Date("2026-08-25T18:00:00Z").getTime();
const row = (region, category, roles, startAt, status = "active") => ({ region, category, roles, startAt, status });

test("grup ihtiyacı iptal edilen ilanı saymaz ve düşük örnekli başlığı gizler", () => {
  const stats = summarizeGroupDemand([
    row("Büyük Hol", "Farm", ["Tank", "Şifacı"], "2026-08-24T18:00:00.000Z"),
    row("Büyük Hol", "Farm", ["Tank"], "2026-08-25T18:00:00.000Z"),
    row("Büyük Hol", "Farm", ["Tank"], "2026-08-25T19:00:00.000Z"),
    row("Migrat", "Grup bölgesi", ["Hasar"], "2026-08-25T19:00:00.000Z"),
    row("Migrat", "Grup bölgesi", ["Hasar"], "2026-08-25T19:00:00.000Z", "cancelled"),
  ], { now });
  assert.equal(stats.total30, 4);
  assert.deepEqual(stats.roles.visible, [{ label: "Tank", count: 3 }]);
  assert.equal(stats.roles.suppressed, 2);
  assert.deepEqual(stats.regions.visible, [{ label: "Büyük Hol", count: 3 }]);
});

test("üçten az ilan meta değil veri yetersiz olarak işaretlenir", () => {
  const stats = summarizeGroupDemand([row("Büyük Hol", "Farm", ["Tank"], "2026-08-25T18:00:00.000Z")], { now });
  assert.equal(stats.evidence.label, "Veri yetersiz");
  assert.equal(stats.roles.visible.length, 0);
});
