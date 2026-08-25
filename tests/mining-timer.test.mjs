import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRespawnEstimate,
  formatTimerDuration,
  timerState,
} from "../lib/mining-timer.mjs";

test("yeniden çıkış tahmini yalnız başarılı gözlemleri kullanır", () => {
  const result = buildRespawnEstimate([
    { result: "empty", elapsedMinutes: 8 },
    { result: "found", elapsedMinutes: 18 },
    { result: "found", elapsedMinutes: 24 },
    { result: "found", elapsedMinutes: 20 },
  ]);
  assert.deepEqual(result, {
    sampleCount: 3,
    lowerMinutes: 18,
    medianMinutes: 20,
    upperMinutes: 24,
    confidence: "Ön tahmin",
  });
});

test("tek ölçüm kesin tahmin aralığına dönüştürülmez", () => {
  const result = buildRespawnEstimate([{ result: "found", elapsedMinutes: 19 }]);
  assert.equal(result.confidence, "Tek gözlem");
  assert.equal(result.lowerMinutes, null);
  assert.equal(result.upperMinutes, null);
});

test("sayaç durumu ve süre etiketi sınırları doğru çalışır", () => {
  assert.equal(timerState(120_000, 0), "waiting");
  assert.equal(timerState(60_000, 0), "soon");
  assert.equal(timerState(0, 1), "due");
  assert.equal(formatTimerDuration(65_000), "01:05");
  assert.equal(formatTimerDuration(3_665_000), "1:01:05");
});
